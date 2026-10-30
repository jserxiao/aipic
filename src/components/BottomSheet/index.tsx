import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import './index.scss'

interface BottomSheetOption {
  label: string
  value: string
}

interface BottomSheetProps {
  /** 是否显示 */
  visible: boolean
  /** 标题 */
  title: string
  /** 选项列表 */
  options: BottomSheetOption[]
  /** 当前选中值 */
  selectedValue: string
  /** 选择回调 */
  onSelect: (value: string) => void
  /** 关闭回调 */
  onClose: () => void
  /** 是否显示自定义输入（分辨率用） */
  showCustom?: boolean
  /** 自定义宽度 */
  customWidth?: number
  /** 自定义高度 */
  customHeight?: number
  /** 自定义尺寸变更回调 */
  onCustomSizeChange?: (width: number, height: number) => void
}

export default function BottomSheet({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  showCustom = false,
  customWidth = 0,
  customHeight = 0,
  onCustomSizeChange,
}: BottomSheetProps) {
  const [animVisible, setAnimVisible] = useState(false)

  useEffect(() => {
    if (visible) {
      // 延迟触发动画
      setTimeout(() => setAnimVisible(true), 16)
    } else {
      setAnimVisible(false)
    }
  }, [visible])

  if (!visible) return null

  const handleSelect = (value: string) => {
    onSelect(value)
    onClose()
  }

  return (
    <View className={`bottom-sheet ${animVisible ? 'bottom-sheet--show' : ''}`}>
      <View className='bottom-sheet__mask' onClick={onClose} />
      <View className='bottom-sheet__panel'>
        {/* 顶部拖拽指示条 */}
        <View className='bottom-sheet__handle' />

        {/* 标题行 */}
        <View className='bottom-sheet__header'>
          <Text className='bottom-sheet__title'>{title}</Text>
          <Text className='bottom-sheet__close' onClick={onClose}>关闭</Text>
        </View>

        {/* 滑动选项列表 */}
        <ScrollView scrollX className='bottom-sheet__scroll' enhanced showScrollbar={false}>
          <View className='bottom-sheet__options'>
            {options.map((option) => {
              const isActive = selectedValue === option.value
              return (
                <View
                  key={option.value}
                  className={`bottom-sheet__option ${isActive ? 'bottom-sheet__option--active' : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  <Text className='bottom-sheet__option-label'>{option.label}</Text>
                </View>
              )
            })}
          </View>
        </ScrollView>

        {/* 自定义分辨率输入 */}
        {showCustom && selectedValue === 'custom' && (
          <View className='bottom-sheet__custom'>
            <Input
              className='bottom-sheet__input'
              type='number'
              placeholder='宽'
              value={customWidth ? String(customWidth) : ''}
              onInput={(e) => {
                const w = parseInt(e.detail.value) || 0
                onCustomSizeChange?.(w, customHeight)
              }}
            />
            <Text className='bottom-sheet__cross'>×</Text>
            <Input
              className='bottom-sheet__input'
              type='number'
              placeholder='高'
              value={customHeight ? String(customHeight) : ''}
              onInput={(e) => {
                const h = parseInt(e.detail.value) || 0
                onCustomSizeChange?.(customWidth, h)
              }}
            />
            <Text className='bottom-sheet__unit'>px</Text>
          </View>
        )}

        {/* 确认按钮 */}
        <View className='bottom-sheet__confirm' onClick={onClose}>
          <Text className='bottom-sheet__confirm-text'>确定</Text>
        </View>
      </View>
    </View>
  )
}
