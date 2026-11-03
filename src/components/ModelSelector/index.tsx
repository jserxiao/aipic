import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import { AI_MODEL_OPTIONS } from '@/constants/config'
import type { AIModelType } from '@/types/generate'
import './index.scss'

interface ModelSelectorProps {
  value: AIModelType
  onChange: (model: AIModelType) => void
}

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [visible, setVisible] = useState(false)
  const [animVisible, setAnimVisible] = useState(false)

  useEffect(() => {
    if (visible) {
      setTimeout(() => setAnimVisible(true), 16)
    } else {
      setAnimVisible(false)
    }
  }, [visible])

  const selectedOption = AI_MODEL_OPTIONS.find((o) => o.value === value)

  const handleSelect = (model: AIModelType) => {
    onChange(model)
    setVisible(false)
  }

  return (
    <View className='model-selector'>
      <Text className='model-selector__title'>AI 模型</Text>
      <View className='model-selector__field' onClick={() => setVisible(true)}>
        <View className='model-selector__field-info'>
          <Text className='model-selector__field-label'>{selectedOption?.label}</Text>
          <Text className='model-selector__field-cost'>
            {selectedOption?.creditsCost} 积分/张
          </Text>
        </View>
        <Text className='model-selector__arrow'>›</Text>
      </View>

      {/* 弹出层 */}
      {visible && (
        <View className={`model-sheet ${animVisible ? 'model-sheet--show' : ''}`}>
          <View className='model-sheet__mask' onClick={() => setVisible(false)} />
          <View className='model-sheet__panel'>
            {/* 顶部拖拽指示条 */}
            <View className='model-sheet__handle' />

            {/* 标题行 */}
            <View className='model-sheet__header'>
              <Text className='model-sheet__title'>选择 AI 模型</Text>
              <Text className='model-sheet__close' onClick={() => setVisible(false)}>关闭</Text>
            </View>

            {/* 模型选项列表 */}
            <View className='model-sheet__list'>
              {AI_MODEL_OPTIONS.map((option) => {
                const isActive = value === option.value
                return (
                  <View
                    key={option.value}
                    className={`model-sheet__item ${isActive ? 'model-sheet__item--active' : ''}`}
                    onClick={() => handleSelect(option.value)}
                  >
                    <View className='model-sheet__item-info'>
                      <View className='model-sheet__item-header'>
                        <Text className='model-sheet__item-label'>{option.label}</Text>
                        <View className='model-sheet__item-cost'>
                          <Text className='model-sheet__item-cost-value'>{option.creditsCost}</Text>
                          <Text className='model-sheet__item-cost-unit'>积分/张</Text>
                        </View>
                      </View>
                      <Text className='model-sheet__item-desc'>{option.description}</Text>
                    </View>
                    <View className={`model-sheet__item-radio ${isActive ? 'model-sheet__item-radio--on' : ''}`}>
                      {isActive && <View className='model-sheet__item-radio-dot' />}
                    </View>
                  </View>
                )
              })}
            </View>

            {/* 确认按钮 */}
            <View className='model-sheet__confirm' onClick={() => setVisible(false)}>
              <Text className='model-sheet__confirm-text'>确定</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
