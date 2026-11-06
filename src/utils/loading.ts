import Taro from '@tarojs/taro'

/**
 * 全局 Loading 工具
 * --------------------------------------------------
 * 封装 Taro.showLoading，支持链式调用和防重复
 */

let loadingCount = 0

/** 显示全局 Loading */
export function showLoading(title = '加载中...'): void {
  loadingCount++
  if (loadingCount === 1) {
    Taro.showLoading({ title, mask: true })
  }
}

/** 隐藏全局 Loading */
export function hideLoading(): void {
  loadingCount = Math.max(0, loadingCount - 1)
  if (loadingCount === 0) {
    Taro.hideLoading()
  }
}

/** 强制隐藏所有 Loading */
export function forceHideLoading(): void {
  loadingCount = 0
  Taro.hideLoading()
}
