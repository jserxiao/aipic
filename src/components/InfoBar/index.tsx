import { View, Text } from '@tarojs/components'
import './index.scss'

interface InfoBarProps {
  /** 每次消耗积分 */
  creditsCost: number
  /** 今日已生成张数 */
  todayCount: number
  /** 每日最大生成张数 */
  maxDaily: number
}

export default function InfoBar({ creditsCost, todayCount, maxDaily }: InfoBarProps) {
  const remaining = maxDaily - todayCount

  return (
    <View className='info-bar'>
      <View className='info-bar__item'>
        <Text className='info-bar__label'>消耗 {creditsCost} 积分/张</Text>
      </View>
      <View className='info-bar__divider' />
      <View className='info-bar__item'>
        <Text className='info-bar__label'>
          今日已生成 {todayCount}/{maxDaily} 张
        </Text>
      </View>
      {remaining <= 5 && remaining > 0 && (
        <Text className='info-bar__warn'>剩余 {remaining} 张</Text>
      )}
    </View>
  )
}
