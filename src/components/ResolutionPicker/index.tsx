import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { RESOLUTION_OPTIONS } from '@/constants/config'
import type { ResolutionType } from '@/types/generate'
import BottomSheet from '@/components/BottomSheet'
import './index.scss'

interface ResolutionPickerProps {
  value: ResolutionType
  customWidth: number
  customHeight: number
  onChange: (resolution: ResolutionType) => void
  onCustomSizeChange: (width: number, height: number) => void
}

export default function ResolutionPicker({
  value,
  customWidth,
  customHeight,
  onChange,
  onCustomSizeChange,
}: ResolutionPickerProps) {
  const [visible, setVisible] = useState(false)

  const selectedOption = RESOLUTION_OPTIONS.find((o) => o.value === value)
  const displayValue = value === 'custom'
    ? `${customWidth} × ${customHeight}`
    : selectedOption?.label || ''

  const options = RESOLUTION_OPTIONS.map((o) => ({
    label: o.label,
    value: o.value as string,
  }))

  return (
    <View className='resolution-picker'>
      <Text className='resolution-picker__title'>分辨率</Text>
      <View className='resolution-picker__field' onClick={() => setVisible(true)}>
        <Text className='resolution-picker__value'>{displayValue}</Text>
        <Text className='resolution-picker__arrow'>›</Text>
      </View>

      <BottomSheet
        visible={visible}
        title='选择分辨率'
        options={options}
        selectedValue={value}
        onSelect={(val) => onChange(val as ResolutionType)}
        onClose={() => setVisible(false)}
        showCustom={true}
        customWidth={customWidth}
        customHeight={customHeight}
        onCustomSizeChange={onCustomSizeChange}
      />
    </View>
  )
}
