import { View, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

const TAB_LIST = [
  {
    pagePath: '/pages/generate/index',
    text: '生成',
    iconType: 'sparkle',
  },
  {
    pagePath: '/pages/mine/index',
    text: '我的',
    iconType: 'user',
  },
]

/** 事件名：通知 TabBar 更新选中态 */
const TAB_BAR_SELECT_EVENT = 'TAB_BAR_SELECT'

/**
 * 自定义 TabBar 组件
 * 使用 CSS 绘制的简约图标，无需 PNG 资源
 *
 * 选中态同步：页面通过 Taro.eventCenter.trigger(TAB_BAR_SELECT_EVENT, index) 通知
 */
export default function CustomTabBar() {
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    // 监听选中事件
    const handler = (index: number) => {
      setSelected(index)
    }
    Taro.eventCenter.on(TAB_BAR_SELECT_EVENT, handler)
    return () => {
      Taro.eventCenter.off(TAB_BAR_SELECT_EVENT, handler)
    }
  }, [])

  const handleSwitch = (index: number) => {
    if (selected === index) return
    setSelected(index)
    Taro.switchTab({ url: TAB_LIST[index].pagePath })
  }

  return (
    <View className='custom-tabbar'>
      {TAB_LIST.map((tab, index) => {
        const isActive = selected === index
        return (
          <View
            key={tab.pagePath}
            className={`custom-tabbar__item ${isActive ? 'custom-tabbar__item--active' : ''}`}
            onClick={() => handleSwitch(index)}
          >
            <View className={`custom-tabbar__icon custom-tabbar__icon--${tab.iconType} ${isActive ? 'custom-tabbar__icon--on' : ''}`} />
            <Text className={`custom-tabbar__text ${isActive ? 'custom-tabbar__text--active' : ''}`}>
              {tab.text}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

/** 供页面调用的工具函数：通知 TabBar 更新选中态 */
export function setTabBarSelected(index: number) {
  Taro.eventCenter.trigger(TAB_BAR_SELECT_EVENT, index)
}
