import { View, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

/**
 * 自定义 TabBar 组件
 * 使用 CSS 绘制的简约图标，无需 PNG 资源
 */
export default function CustomTabBar() {
  const [selected, setSelected] = useState(0)
  const [routeName, setRouteName] = useState('')

  useEffect(() => {
    // 获取当前页面路径，判断选中项
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const route = currentPage ? currentPage.route : ''
    setRouteName(route)

    if (route.includes('generate')) {
      setSelected(0)
    } else if (route.includes('mine')) {
      setSelected(1)
    }
  })

  const tabList = [
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

  const handleSwitch = (index: number) => {
    const url = tabList[index].pagePath
    Taro.switchTab({ url })
    setSelected(index)
  }

  return (
    <View className='custom-tabbar'>
      {tabList.map((tab, index) => {
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
