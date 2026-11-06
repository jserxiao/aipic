import { useState } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import type { GenerateRecord } from '@/types/generate'
import { saveImageToAlbum } from '@/utils/image'
import { useAnimatedVisible } from '@/utils/useAnimatedVisible'
import './index.scss'

interface ResultModalProps {
  /** 生成结果 */
  record: GenerateRecord | null
  /** 是否显示 */
  visible: boolean
  /** 关闭回调 */
  onClose: () => void
}

export default function ResultModal({ record, visible, onClose }: ResultModalProps) {
  const [saved, setSaved] = useState(false)
  const [shouldRender, animVisible, handleAnimatedClose] = useAnimatedVisible(visible, onClose)

  if (!shouldRender || !record) return null

  const handleSave = async () => {
    await saveImageToAlbum(record.imageUrl)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <View className={`result-modal ${animVisible ? 'result-modal--show' : ''}`}>
      <View className='result-modal__mask' onClick={handleAnimatedClose} />
      <View className='result-modal__content'>
        <View className='result-modal__header'>
          <Text className='result-modal__title'>生成结果</Text>
          <View className='result-modal__close' onClick={handleAnimatedClose}>
            <View className='result-modal__close-line result-modal__close-line--1' />
            <View className='result-modal__close-line result-modal__close-line--2' />
          </View>
        </View>

        <View className='result-modal__body'>
          <Image
            className='result-modal__image'
            src={record.imageUrl}
            mode='aspectFit'
          />
          <Text className='result-modal__prompt'>{record.prompt}</Text>
          <View className='result-modal__meta'>
            <Text className='result-modal__meta-item'>
              比例 {record.ratio}
            </Text>
            <Text className='result-modal__meta-item'>
              分辨率 {record.resolution}
            </Text>
            <Text className='result-modal__meta-item'>
              消耗 {record.creditsCost} 积分
            </Text>
          </View>
        </View>

        <View className='result-modal__footer'>
          <View
            className={`result-modal__btn result-modal__btn--secondary ${saved ? 'result-modal__btn--disabled' : ''}`}
            onClick={handleSave}
          >
            <Text className='result-modal__btn-text'>
              {saved ? '已保存' : '保存到相册'}
            </Text>
          </View>
          <Button
            className='result-modal__btn result-modal__btn--share'
            openType='share'
          >
            <Text className='result-modal__btn-text'>分享</Text>
          </Button>
          <View
            className='result-modal__btn result-modal__btn--primary'
            onClick={handleAnimatedClose}
          >
            <Text className='result-modal__btn-text result-modal__btn-text--primary'>
              再生成一张
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}
