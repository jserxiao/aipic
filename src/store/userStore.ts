import { create } from 'zustand'
import type { User } from '@/types/user'
import { getUserInfo } from '@/services/user'
import { storage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/constants/config'

interface UserState {
  user: User | null
  loading: boolean

  fetchUser: () => Promise<void>
  updateAvatar: (avatar: string) => void
  deductCredits: (amount: number) => void
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: false,

  fetchUser: async () => {
    // 先从本地缓存读取
    const cached = storage.get<User>(STORAGE_KEYS.USER_INFO)
    if (cached) {
      set({ user: cached })
    }

    set({ loading: true })
    try {
      const user = await getUserInfo()
      set({ user, loading: false })
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
}))
