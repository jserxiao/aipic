import Taro from '@tarojs/taro'

/**
 * 网络状态检测
 * --------------------------------------------------
 * 监听网络变化，断线时提示用户
 */

let isMonitoring = false
let networkType: string = 'unknown'

/** 初始化网络监听 */
export function initNetworkMonitor(): void {
  if (isMonitoring) return
  isMonitoring = true

  // 获取初始网络状态
  Taro.getNetworkType({
    success: (res) => {
      networkType = res.networkType
    },
  })

  // 监听网络变化
  Taro.onNetworkStatusChange((res) => {
    networkType = res.networkType

    if (!res.isConnected) {
      Taro.showToast({
        title: '网络已断开，请检查网络设置',
        icon: 'none',
        duration: 2000,
      })
    } else if (res.networkType === '2g' || res.networkType === '3g') {
      Taro.showToast({
        title: '当前网络较慢，请耐心等待',
        icon: 'none',
        duration: 2000,
      })
    }
  })
}

/** 获取当前网络类型 */
export function getNetworkType(): string {
  return networkType
}

/** 检查是否联网 */
export function isOnline(): boolean {
  return networkType !== 'none' && networkType !== 'unknown'
}
