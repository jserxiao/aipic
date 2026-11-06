import Taro from '@tarojs/taro'
import type { User } from '@/types/user'
import { storage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/constants/config'
import { generateRandomId } from '@/utils/id'
import { request, USE_MOCK } from './request'

/**
 * 登录相关接口
 * --------------------------------------------------
 * Mock 模式下使用本地模拟数据
 * 真实环境下替换为后端接口
 */

/** 登录响应 */
interface LoginResponse {
  token: string
  refreshToken: string
  user: User
}

/**
 * 微信登录流程
 * 1. Taro.login() 获取 code
 * 2. 将 code 发送到后端换取 token
 * 3. 持久化 token 和用户信息
 *
 * @returns 登录成功后的用户信息
 */
export async function login(): Promise<User> {
  // === Mock 模式 ===
  if (USE_MOCK) {
    return mockLogin()
  }

  // === 真实 API ===
  const { code } = await Taro.login()

  const result = await request<LoginResponse>({
    url: '/auth/login',
    method: 'POST',
    data: { code },
    needAuth: false,
  })

  // 持久化 token
  storage.set(STORAGE_KEYS.AUTH_TOKEN, result.token)
  storage.set(STORAGE_KEYS.REFRESH_TOKEN, result.refreshToken)
  storage.set(STORAGE_KEYS.USER_INFO, result.user)

  return result.user
}

/**
 * 刷新 Token
 * 当 401 时自动调用，用 refreshToken 换取新的 token
 *
 * @returns 是否刷新成功
 */
export async function refreshAuthToken(): Promise<boolean> {
  if (USE_MOCK) {
    return true
  }

  const refreshToken = storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN)
  if (!refreshToken) return false

  try {
    const result = await request<LoginResponse>({
      url: '/auth/refresh',
      method: 'POST',
      data: { refreshToken },
      needAuth: false,
    })

    storage.set(STORAGE_KEYS.AUTH_TOKEN, result.token)
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, result.refreshToken)
    storage.set(STORAGE_KEYS.USER_INFO, result.user)

    return true
  } catch {
    // refreshToken 也过期了，清除所有登录信息
    storage.remove(STORAGE_KEYS.AUTH_TOKEN)
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN)
    storage.remove(STORAGE_KEYS.USER_INFO)
    return false
  }
}

/**
 * 检查登录状态
 * 如果有 token 且用户信息存在，认为已登录
 */
export function isLoggedIn(): boolean {
  const token = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN)
  return !!token
}

/**
 * 确保已登录
 * 未登录时自动执行静默登录
 *
 * @returns 用户信息
 */
export async function ensureLoggedIn(): Promise<User> {
  // 先尝试读取缓存
  const cached = storage.get<User>(STORAGE_KEYS.USER_INFO)
  const token = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN)

  if (cached && token) {
    return cached
  }

  // 未登录 → 执行静默登录
  return await login()
}

/**
 * 退出登录
 */
export function logout(): void {
  storage.remove(STORAGE_KEYS.AUTH_TOKEN)
  storage.remove(STORAGE_KEYS.REFRESH_TOKEN)
  storage.remove(STORAGE_KEYS.USER_INFO)
}

/* ==================== Mock 实现 ==================== */

/** Mock 登录 */
async function mockLogin(): Promise<User> {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500))

  // 生成 mock token
  const mockToken = `mock_token_${Date.now()}`
  const mockRefreshToken = `mock_refresh_${Date.now()}`

  const user: User = {
    userId: 'u_001',
    randomId: generateRandomId(),
    avatar: '',
    isVip: true,
    vipLevel: 'vip',
    vipExpireAt: '2027-01-01T00:00:00.000Z',
    credits: 1000,
  }

  // 持久化
  storage.set(STORAGE_KEYS.AUTH_TOKEN, mockToken)
  storage.set(STORAGE_KEYS.REFRESH_TOKEN, mockRefreshToken)
  storage.set(STORAGE_KEYS.USER_INFO, user)

  return user
}
