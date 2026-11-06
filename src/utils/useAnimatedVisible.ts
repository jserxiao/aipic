import { useState, useEffect, useCallback } from 'react'

/**
 * 带退出动画的弹窗 Hook
 * --------------------------------------------------
 * 解决小程序弹窗无法直接 `return null` 的问题：
 * 关闭时先播放退出动画，动画结束后再卸载组件
 *
 * @param visible 外部控制的可见状态
 * @param closeCallback 关闭回调
 * @param animDuration 动画时长（毫秒），默认 300
 * @returns [shouldRender, animVisible, handleAnimatedClose]
 */
export function useAnimatedVisible(
  visible: boolean,
  closeCallback: () => void,
  animDuration = 300,
): [boolean, boolean, () => void] {
  const [shouldRender, setShouldRender] = useState(false)
  const [animVisible, setAnimVisible] = useState(false)

  useEffect(() => {
    if (visible) {
      // 显示：先渲染，下一帧添加动画类
      setShouldRender(true)
      setTimeout(() => setAnimVisible(true), 16)
    } else if (shouldRender) {
      // 隐藏：先移除动画类，等动画结束后卸载
      setAnimVisible(false)
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, animDuration)
      return () => clearTimeout(timer)
    }
  }, [visible])

  // 带退出动画的关闭函数
  const handleAnimatedClose = useCallback(() => {
    setAnimVisible(false)
    setTimeout(() => {
      closeCallback()
    }, animDuration)
  }, [closeCallback, animDuration])

  return [shouldRender, animVisible, handleAnimatedClose]
}
