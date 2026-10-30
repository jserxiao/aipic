import Taro from '@tarojs/taro'

/**
 * 本地存储封装
 */
export const storage = {
  get<T>(key: string): T | null {
    try {
      const value = Taro.getStorageSync(key)
      return value ? (value as T) : null
    } catch {
      return null
    }
  },

  set<T>(key: string, value: T): void {
    try {
      Taro.setStorageSync(key, value)
    } catch (e) {
      console.error('Storage set error:', e)
    }
  },

  remove(key: string): void {
    try {
      Taro.removeStorageSync(key)
    } catch (e) {
      console.error('Storage remove error:', e)
    }
  },
}
