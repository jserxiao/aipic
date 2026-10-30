import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { RATIO_OPTIONS } from '@/constants/config'
import type { RatioType } from '@/types/generate'
import BottomSheet from '@/components/BottomSheet'
import './index.scss'

interface RatioSelectorProps {
  value: RatioType
  onChange: (ratio: RatioType) => void
}

export default function RatioSelector({ value, onChange }: RatioSelectorProps) {
  const [visible, setVisible] = useState(false)

  const selectedOption = RATIO_OPTIONS.find((o) => o.value === value)

  const options = RATIO_OPTIONS.map((o) => ({
    label: o.label,
    value: o.value as string,
  }))

  return (
    <View className='ratio-selector'>
      <Text className='ratio-selector__title'>图片比例</Text>
      <View className='ratio-selector__field' onClick={() => setVisible(true)}>
        <Text className='ratio-selector__value'>{selectedOption?.label}</Text>
        <Text className='ratio-selector__arrow'>›</Text>
      </View>

      <BottomSheet
        visible={visible}
        title='选择图片比例'
        options={options}
        selectedValue={value}
        onSelect={(val) => onChange(val as RatioType)}
        onClose={() => setVisible(false)}
      />
    </View>
  )
}
