import { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { useGenerateStore } from '@/store/generateStore'
import type { GenerateRecord } from '@/types/generate'
import { formatDateTime } from '@/utils/format'
import { saveImageToAlbum } from '@/utils/image'
import './index.scss'

export default function History() {
  const { history, loadHistory, removeHistoryRecord, clearHistory, historyLoading } = useGenerateStore()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    loadHistory(true)
  }, [loadHistory])

  // 下拉刷新
  usePullDownRefresh(() => {
    loadHistory(true)
    setTimeout(() => {
      Taro.stopPullDownRefresh()
    }, 1000)
  })

  // 触底加载更多
  useReachBottom(() => {
    useGenerateStore.getState().loadMoreHistory()
  })

  const handlePreview = (record: GenerateRecord) => {
    setPreviewUrl(record.imageUrl)
  }

  const handlePreviewClose = () => {
    setPreviewUrl(null)
  }

  const handleSave = async (record: GenerateRecord) => {
    await saveImageToAlbum(record.imageUrl)
  }

  // 长按删除单条记录
  const handleLongPress = (record: GenerateRecord) => {
    Taro.showActionSheet({
      itemList: ['删除该记录'],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.showModal({
            title: '删除记录',
            content: '确定要删除这条记录吗？',
            confirmColor: '#000000',
            success: (modal) => {
              if (modal.confirm) {
                removeHistoryRecord(record.id)
                Taro.showToast({ title: '已删除', icon: 'success' })
              }
            },
          })
        }
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
          Taro.showToast({ title: '已清空', icon: 'success' })
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
          <ScrollView
            scrollY
            className='history-page__scroll'
            onScrollToLower={() => useGenerateStore.getState().loadMoreHistory()}
            lowerThreshold={100}
          >
            <View className='history-page__list'>
              {history.map((record) => (
                <View
                  key={record.id}
                  className='history-page__item'
                  onLongPress={() => handleLongPress(record)}
                >
                  <Image
                    className='history-page__item-image'
                    src={record.imageUrl}
                    mode='aspectFill'
                    lazyLoad
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

            {/* 底部加载状态 */}
            {historyLoading && (
              <View className='history-page__loading-more'>
                <Text className='history-page__loading-more-text'>加载中...</Text>
              </View>
            )}
          </ScrollView>
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
