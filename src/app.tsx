import { PropsWithChildren } from 'react'
import { useLaunch, useDidShow } from '@tarojs/taro'
import { useUserStore } from '@/store/userStore'
import { initNetworkMonitor } from '@/utils/network'
import { storage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/constants/config'
import ErrorBoundary from '@/components/ErrorBoundary'
import './app.scss'

function App({ children }: PropsWithChildren<Record<string, unknown>>) {
  const { initAuth } = useUserStore()

  useLaunch(() => {
    console.log('一键绘图 小程序启动')

    // 清除可能残留的旧 Mock token（从 Mock 模式切换到真实 API 时必须清除）
    const token = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN)
    if (token && token.startsWith('mock_')) {
      console.log('检测到旧 Mock token，清除并重新登录')
      storage.remove(STORAGE_KEYS.AUTH_TOKEN)
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN)
      storage.remove(STORAGE_KEYS.USER_INFO)
    }

    // 开发环境启用 vConsole 调试面板
    if (process.env.NODE_ENV !== 'production') {
      // 动态 import，生产环境打包时不会包含 vConsole
      import('vconsole').then(({ default: VConsole }) => {
        new VConsole()
      }).catch(() => {
        // vConsole 加载失败不影响正常使用
      })
    }

    // 全局初始化：静默登录
    initAuth()
    // 初始化网络状态监听
    initNetworkMonitor()
  })

  // 每次 App 显示时检查登录态
  useDidShow(() => {
    const { user } = useUserStore.getState()
    if (!user) {
      initAuth()
    }
  })

  return <ErrorBoundary>{children}</ErrorBoundary>
}

export default App
