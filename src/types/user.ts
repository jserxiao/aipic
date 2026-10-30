/** 会员等级 */
export type VipLevel = 'normal' | 'vip';

/** 用户信息 */
export interface User {
  /** 用户唯一标识 */
  userId: string;
  /** 随机展示 ID，如 "AP_8xK2m9" */
  randomId: string;
  /** 头像 URL */
  avatar: string;
  /** 是否为 VIP */
  isVip: boolean;
  /** 会员等级 */
  vipLevel: VipLevel;
  /** VIP 到期时间（ISO 字符串），非 VIP 时为 null */
  vipExpireAt: string | null;
  /** 剩余积分 */
  credits: number;
}
