import type { User } from '@/types/user'
import { generateRandomId } from '@/utils/id'
import { request, USE_MOCK } from './request'

/**
 * 用户相关接口
 * --------------------------------------------------
 * Mock 模式下使用本地模拟数据
 * 真实环境下替换为后端接口
 */

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
 * 当前 Mock 模式返回模拟数据，后续替换为真实 API
 */
export async function getUserInfo(): Promise<User> {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockUser), 300)
    })
  }

  // 真实 API
  return request<User>({
    url: '/user/info',
    method: 'GET',
  })
}

/**
 * 更新用户头像
 * @param avatarUrl 头像 URL（上传到服务端后的地址）
 */
export async function updateUserAvatar(avatarUrl: string): Promise<User> {
  if (USE_MOCK) {
    return { ...mockUser, avatar: avatarUrl }
  }

  return request<User>({
    url: '/user/avatar',
    method: 'PUT',
    data: { avatar: avatarUrl },
  })
}
