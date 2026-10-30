import type { User } from '@/types/user'
import { generateRandomId } from '@/utils/id'

/** Mock 用户数据 */
const mockUser: User = {
  userId: 'u_001',
  randomId: generateRandomId(),
  avatar: '',
  isVip: true,
  vipLevel: 'vip',
  vipExpireAt: '2027-01-01T00:00:00.000Z',
  credits: 1000,
}

/**
 * 获取用户信息
 * 当前使用 Mock，后续替换为真实 API
 */
export async function getUserInfo(): Promise<User> {
  // TODO: 替换为真实 API
  // return request<User>({ url: '/user/info' })
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockUser), 300)
  })
}
