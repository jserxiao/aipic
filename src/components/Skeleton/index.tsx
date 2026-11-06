import { View } from '@tarojs/components'
import './index.scss'

interface SkeletonProps {
  /** 是否显示 */
  visible: boolean
  /** 子内容 */
  children?: React.ReactNode
}

/**
 * 骨架屏组件
 * 在数据加载时展示灰色占位块，提升用户体验
 */
export default function Skeleton({ visible, children }: SkeletonProps) {
  if (!visible) return <>{children}</>

  return (
    <View className='skeleton'>
      <View className='skeleton__line skeleton__line--title' />
      <View className='skeleton__line skeleton__line--text' />
      <View className='skeleton__line skeleton__line--text' />
      <View className='skeleton__line skeleton__line--short' />
      <View className='skeleton__block' />
      <View className='skeleton__line skeleton__line--title' />
      <View className='skeleton__line skeleton__line--text' />
      <View className='skeleton__line skeleton__line--short' />
    </View>
  )
}

/** 用户信息骨架屏 */
export function UserSkeleton() {
  return (
    <View className='skeleton skeleton--user'>
      <View className='skeleton__avatar' />
      <View className='skeleton__user-info'>
        <View className='skeleton__line skeleton__line--title' />
        <View className='skeleton__line skeleton__line--short' />
      </View>
    </View>
  )
}

/** 历史记录骨架屏 */
export function HistorySkeleton() {
  return (
    <View className='skeleton skeleton--history'>
      {[1, 2, 3].map((i) => (
        <View key={i} className='skeleton__history-item'>
          <View className='skeleton__history-image' />
          <View className='skeleton__history-info'>
            <View className='skeleton__line skeleton__line--text' />
            <View className='skeleton__line skeleton__line--short' />
          </View>
        </View>
      ))}
    </View>
  )
}
