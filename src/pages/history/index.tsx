import { useEffect, useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useGenerateStore } from '@/store/generateStore'
import type { GenerateRecord } from '@/types/generate'
import { formatDateTime } from '@/utils/format'
import './index.scss'

export default function History() {
  const { history, loadHistory, clearHistory } = useGenerateStore()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const handlePreview = (record: GenerateRecord) => {
    setPreviewUrl(record.imageUrl)
  }

  const handlePreviewClose = () => {
    setPreviewUrl(null)
  }

  const handleSave = (record: GenerateRecord) => {
    Taro.downloadFile({
      url: record.imageUrl,
      success: (res) => {
        Taro.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            Taro.showToast({ title: '已保存到相册', icon: 'success' })
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

  const handleClearHistory = () => {
    Taro.showModal({
      title: '清空历史记录',
      content: '确定要清空所有历史记录吗？',
      confirmColor: '#000000',
      success: (res) => {
        if (res.confirm) {
          clearHistory()
        }
      },
    })
  }

  return (
    <View className='history-page'>
      {history.length === 0 ? (
        <View className='history-page__empty'>
          <View className='history-page__empty-icon'>
            <View className='history-page__empty-icon-inner' />
          </View>
          <Text className='history-page__empty-text'>还没有生成记录</Text>
          <Text className='history-page__empty-hint'>去生成页创建你的第一张 AI 图片吧</Text>
        </View>
      ) : (
        <>
          {/* 顶部操作栏 */}
          <View className='history-page__toolbar'>
            <Text className='history-page__count'>共 {history.length} 条记录</Text>
            <Text className='history-page__clear' onClick={handleClearHistory}>
              清空
            </Text>
          </View>

          {/* 历史记录列表 */}
          <View className='history-page__list'>
            {history.map((record) => (
              <View key={record.id} className='history-page__item'>
                <Image
                  className='history-page__item-image'
                  src={record.imageUrl}
                  mode='aspectFill'
                  onClick={() => handlePreview(record)}
                />
                <View className='history-page__item-info'>
                  <Text className='history-page__item-prompt'>
                    {record.prompt}
                  </Text>
                  <View className='history-page__item-meta'>
                    <Text className='history-page__item-tag'>
                      {record.ratio}
                    </Text>
                    <Text className='history-page__item-tag'>
                      {record.resolution}
                    </Text>
                  </View>
                  <Text className='history-page__item-time'>
                    {formatDateTime(record.createdAt)}
                  </Text>
                </View>
                <View
                  className='history-page__item-save'
                  onClick={() => handleSave(record)}
                >
                  <Text className='history-page__item-save-text'>保存</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {/* 大图预览 */}
      {previewUrl && (
        <View className='history-page__preview' onClick={handlePreviewClose}>
          <Image
            className='history-page__preview-image'
            src={previewUrl}
            mode='aspectFit'
          />
        </View>
      )}
    </View>
  )
}
