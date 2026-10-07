import type { Category, FamilyRole, ItemStatus, MediaKind, PersonRole, Precision, Visibility } from '../api/types';

export const CATEGORY_LABELS: Record<Category, string> = {
  furniture: '老家具',
  souvenir: '纪念品',
  receipt: '票据',
  manuscript: '手稿',
  other: '其他',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  furniture: '🪑',
  souvenir: '🎁',
  receipt: '🧾',
  manuscript: '✍️',
  other: '📦',
};

export const CATEGORY_ORDER: Category[] = ['furniture', 'souvenir', 'receipt', 'manuscript', 'other'];

export const PRECISION_LABELS: Record<Precision, string> = {
  day: '精确到日',
  month: '精确到月',
  year: '精确到年',
  decade: '只知道大概十年',
  unknown: '说不清',
};

export const PRECISION_HINTS: Record<Precision, string> = {
  day: '记得是哪一天',
  month: '记得是哪个月',
  year: '只记得哪一年',
  decade: '只知道大概哪个年代',
  unknown: '用一句话描述就行，比如「我上小学那年」',
};

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  private: '只有我能看',
  family: '全家人都能看',
  selected: '指定家人能看',
  link: '可以通过链接分享',
};

export const STATUS_LABELS: Record<ItemStatus, string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档',
  trashed: '回收站',
};

export const ROLE_LABELS: Record<FamilyRole, string> = {
  owner: '创建者',
  admin: '管理员',
  editor: '编辑',
  contributor: '贡献者',
  viewer: '只读',
};

export const ROLE_HINTS: Record<FamilyRole, string> = {
  owner: '拥有全部权限',
  admin: '管理成员、导出、编辑全部条目',
  editor: '建立条目、管理人物、分享',
  contributor: '建立和补充自己的条目',
  viewer: '只能查看',
};

export const PERSON_ROLE_LABELS: Record<PersonRole, string> = {
  source: '来源',
  gifted: '赠送',
  inherited: '继承',
  owner: '原主',
  mentioned: '故事中提及',
};

export const MEDIA_KIND_LABELS: Record<MediaKind, string> = {
  image: '图片',
  audio: '录音',
  document: '文件',
};

export const ACTION_LABELS: Record<string, string> = {
  'auth.register': '注册账号',
  'auth.login': '登录',
  'auth.login_failed': '登录失败',
  'auth.logout': '退出登录',
  'family.create': '创建家庭',
  'family.update': '修改家庭信息',
  'family.delete': '删除家庭',
  'member.invite': '邀请成员',
  'member.join': '加入家庭',
  'member.update_role': '调整成员权限',
  'member.remove': '移除成员',
  'person.create': '新建人物',
  'person.update': '修改人物',
  'person.delete': '删除人物',
  'person.merge': '合并人物',
  'item.create': '新建条目',
  'item.update': '修改条目',
  'item.publish': '发布条目',
  'item.archive': '归档条目',
  'item.restore': '恢复条目',
  'item.trash': '移入回收站',
  'item.purge': '彻底删除条目',
  'item.revert': '回滚版本',
  'media.upload': '上传文件',
  'media.update': '修改文件信息',
  'media.delete': '删除文件',
  'note.create': '补充内容',
  'note.accept': '采纳补充',
  'note.reject': '驳回补充',
  'note.delete': '删除补充内容',
  'share.create': '创建分享链接',
  'share.revoke': '撤销分享链接',
  'export.create': '发起导出',
  'export.download': '下载导出包',
  'access.denied': '越权访问被拒',
};

