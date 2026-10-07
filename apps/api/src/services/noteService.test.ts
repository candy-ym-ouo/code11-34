import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * deleteNote 的硬约束：删除与审计必须在同一事务落库，任何角色都不能无痕删除。
 * 这里用内存 mock 替代 Prisma，验证服务层确实把两个写操作放进了同一个 $transaction。
 */
const { prismaMock, txMock } = vi.hoisted(() => {
  const txMock = {
    itemNote: { delete: vi.fn() },
    auditLog: { create: vi.fn() },
  };
  const prismaMock = {
    item: { findFirst: vi.fn() },
    itemNote: { findFirst: vi.fn() },
    $transaction: vi.fn(),
  };
  return { prismaMock, txMock };
});

vi.mock('../db', () => ({ prisma: prismaMock }));

const { deleteNote } = await import('./noteService');

const CTX = { familyId: 'fam-1', role: 'contributor' as const, memberId: 'mem-1' };
const META = { ip: '127.0.0.1', userAgent: 'vitest' };

const publishedItem = {
  id: 'item-1',
  familyId: 'fam-1',
  createdBy: 'user-owner',
  status: 'published',
  visibility: 'family',
  shares: [],
};

const note = {
  id: 'note-1',
  itemId: 'item-1',
  authorId: 'user-author',
  type: 'story',
  body: '箱子是我 10 岁那年跟着搬的，木头上还有我刻的印子。',
  status: 'pending',
};

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.$transaction.mockImplementation(async (cb: (tx: typeof txMock) => unknown) => cb(txMock));
  // 模拟数据库的家庭边界：只有 fam-1 能查到这条条目
  prismaMock.item.findFirst.mockImplementation(async ({ where }: { where: { familyId: string } }) =>
    where.familyId === 'fam-1' ? publishedItem : null,
  );
  prismaMock.itemNote.findFirst.mockResolvedValue(note);
});

describe('deleteNote 删除补充内容', () => {
  it('作者删除自己的补充：删除与审计在同一事务落库', async () => {
    await deleteNote({ id: 'user-author', role: 'contributor' }, CTX, 'item-1', 'note-1', META);

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    // 两个写操作都发生在事务客户端上，而不是事务外的全局 prisma
    expect(txMock.itemNote.delete).toHaveBeenCalledWith({ where: { id: 'note-1' } });
    expect(txMock.auditLog.create).toHaveBeenCalledTimes(1);
    expect(txMock.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        familyId: 'fam-1',
        actorId: 'user-author',
        action: 'note.delete',
        targetType: 'item',
        targetId: 'item-1',
        // 硬删除后审计是唯一留存记录，必须保留原文与作者
        diff: expect.objectContaining({ noteId: 'note-1', authorId: 'user-author', body: note.body }),
        ip: '127.0.0.1',
        userAgent: 'vitest',
      }),
    });
    // 删除先于审计写入，同事务提交
    expect(txMock.itemNote.delete.mock.invocationCallOrder[0]).toBeLessThan(
      txMock.auditLog.create.mock.invocationCallOrder[0],
    );
  });

  it('管理员删除他人的补充：同样必须留痕', async () => {
    await deleteNote({ id: 'admin-1', role: 'admin' }, CTX, 'item-1', 'note-1', META);

    expect(txMock.itemNote.delete).toHaveBeenCalledTimes(1);
    expect(txMock.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ actorId: 'admin-1', action: 'note.delete' }),
    });
  });

  it('非作者且非管理员：拒绝，且不产生任何写入', async () => {
    await expect(deleteNote({ id: 'user-other', role: 'contributor' }, CTX, 'item-1', 'note-1', META)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(txMock.itemNote.delete).not.toHaveBeenCalled();
    expect(txMock.auditLog.create).not.toHaveBeenCalled();
  });

  it('条目不属于当前家庭：返回 404，且无任何写入（杜绝跨家庭无痕删除）', async () => {
    const otherFamilyCtx = { ...CTX, familyId: 'fam-2' };
    await expect(
      deleteNote({ id: 'user-author', role: 'owner' }, otherFamilyCtx, 'item-1', 'note-1', META),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(txMock.itemNote.delete).not.toHaveBeenCalled();
    expect(txMock.auditLog.create).not.toHaveBeenCalled();
  });
});
