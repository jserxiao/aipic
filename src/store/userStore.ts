import { create } from 'zustand'
import type { User } from '@/types/user'
import { storage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/constants/config'
import { getUserInfo } from '@/services/user'
import { ensureLoggedIn, isLoggedIn } from '@/services/auth'

interface UserState {
  user: User | null
  loading: boolean
  /** 是否已登录 */
  loggedIn: boolean

  /** 初始化：检查登录状态，未登录则静默登录 */
  initAuth: () => Promise<void>
  /** 获取用户信息（需先登录） */
  fetchUser: () => Promise<void>
  /** 更新头像 */
  updateAvatar: (avatar: string) => void
  /** 扣除积分 */
  deductCredits: (amount: number) => void
  /** 增加积分 */
  addCredits: (amount: number) => void
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: false,
  loggedIn: false,

  initAuth: async () => {
    // 如果已经登录过，先从缓存恢复
    if (isLoggedIn()) {
      const cached = storage.get<User>(STORAGE_KEYS.USER_INFO)
      if (cached) {
        set({ user: cached, loggedIn: true })
        return
      }
    }

    // 未登录 → 静默登录
    try {
      set({ loading: true })
      const user = await ensureLoggedIn()
      set({ user, loggedIn: true, loading: false })
    } catch (e) {
      console.error('Auth init failed:', e)
      set({ loading: false })
    }
  },

  fetchUser: async () => {
    // 先从本地缓存读取
    const cached = storage.get<User>(STORAGE_KEYS.USER_INFO)
    if (cached) {
      set({ user: cached })
    }

    set({ loading: true })
    try {
      // 确保已登录
      if (!isLoggedIn()) {
        await ensureLoggedIn()
      }

      const user = await getUserInfo()
      set({ user, loading: false, loggedIn: true })
      storage.set(STORAGE_KEYS.USER_INFO, user)
    } catch (e) {
      set({ loading: false })
      console.error('Fetch user error:', e)
    }
  },

  updateAvatar: (avatar: string) => {
    const current = get().user
    if (!current) return
    const updated = { ...current, avatar }
    set({ user: updated })
    storage.set(STORAGE_KEYS.USER_INFO, updated)
  },

  deductCredits: (amount: number) => {
    const current = get().user
    if (!current) return
    const updated = { ...current, credits: Math.max(0, current.credits - amount) }
    set({ user: updated })
    storage.set(STORAGE_KEYS.USER_INFO, updated)
  },

  addCredits: (amount: number) => {
    const current = get().user
    if (!current) return
    const updated = { ...current, credits: current.credits + amount }
    set({ user: updated })
    storage.set(STORAGE_KEYS.USER_INFO, updated)
  },
}))
