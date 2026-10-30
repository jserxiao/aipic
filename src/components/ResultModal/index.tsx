import { useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { GenerateRecord } from '@/types/generate'
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

  if (!visible || !record) return null

  const handleSave = () => {
    Taro.downloadFile({
      url: record.imageUrl,
      success: (res) => {
        Taro.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            setSaved(true)
            Taro.showToast({ title: '已保存到相册', icon: 'success' })
            setTimeout(() => setSaved(false), 2000)
          },
          fail: () => {
            Taro.showToast({ title: '保存失败，请检查权限', icon: 'none' })
          },
        })
      },
      fail: () => {
        Taro.showToast({ title: '下载失败', icon: 'none' })
      },
    })
  }

  return (
    <View className='result-modal'>
      <View className='result-modal__mask' onClick={onClose} />
      <View className='result-modal__content'>
        <View className='result-modal__header'>
          <Text className='result-modal__title'>生成结果</Text>
          <View className='result-modal__close' onClick={onClose}>
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
          <View
            className='result-modal__btn result-modal__btn--primary'
            onClick={onClose}
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
