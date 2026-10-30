import { useEffect } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro, { useShareAppMessage } from '@tarojs/taro'
import { useUserStore } from '@/store/userStore'
import { useGenerateStore } from '@/store/generateStore'
import { APP_VERSION, COPYRIGHT_TEXT } from '@/constants/config'
import { formatDate } from '@/utils/format'
import './index.scss'

export default function Mine() {
  const { user, fetchUser, updateAvatar } = useUserStore()
  const { loadHistory, history } = useGenerateStore()

  useEffect(() => {
    fetchUser()
    loadHistory()
  }, [fetchUser, loadHistory])

  // 分享小程序
  useShareAppMessage(() => {
    return {
      title: 'AIPic - AI 图片生成工具，输入文字就能生成图片！',
      path: '/pages/generate/index',
      imageUrl: '',
    }
  })

  const handleHistory = () => {
    Taro.navigateTo({ url: '/pages/history/index' })
  }

  const handleAvatarClick = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempPath = res.tempFilePaths[0]
        updateAvatar(tempPath)
      },
    })
  }

  const vipExpireText = user?.vipExpireAt
    ? formatDate(user.vipExpireAt)
    : null

  return (
    <View className='mine-page'>
      {/* 顶部用户信息 */}
      <View className='mine-page__header'>
        <View className='mine-page__avatar-wrapper' onClick={handleAvatarClick}>
          {user?.avatar ? (
            <Image
              className='mine-page__avatar'
              src={user.avatar}
              mode='aspectFill'
            />
          ) : (
            <View className='mine-page__avatar mine-page__avatar--default'>
              <View className='mine-page__avatar-icon'>
                <View className='mine-page__avatar-icon-head' />
                <View className='mine-page__avatar-icon-body' />
              </View>
            </View>
          )}
          <View className='mine-page__avatar-edit'>
            <View className='mine-page__avatar-edit-pencil' />
          </View>
        </View>

        <Text className='mine-page__id'>
          ID: {user?.randomId || 'AP_loading...'}
        </Text>

        <View className='mine-page__vip'>
          {user?.isVip ? (
            <>
              <View className='mine-page__vip-badge mine-page__vip-badge--active'>
                <Text className='mine-page__vip-text'>VIP 会员</Text>
              </View>
              {vipExpireText && (
                <Text className='mine-page__vip-expire'>
                  到期：{vipExpireText}
                </Text>
              )}
            </>
          ) : (
            <View className='mine-page__vip-badge'>
              <Text className='mine-page__vip-text'>普通会员</Text>
            </View>
          )}
        </View>

        {/* 积分展示 */}
        <View className='mine-page__credits'>
          <Text className='mine-page__credits-label'>剩余积分</Text>
          <Text className='mine-page__credits-value'>
            {user?.credits ?? 0}
          </Text>
        </View>
      </View>

      {/* 中部功能列表 */}
      <View className='mine-page__list'>
        <Button
          className='mine-page__list-item'
          openType='share'
        >
          {/* 分享图标 — CSS 绘制 */}
          <View className='mine-page__list-icon mine-page__list-icon--share'>
            <View className='mine-page__share-arrow mine-page__share-arrow--up' />
            <View className='mine-page__share-arrow mine-page__share-arrow--down' />
          </View>
          <Text className='mine-page__list-label'>分享小程序</Text>
          <Text className='mine-page__list-arrow'>›</Text>
        </Button>

        <View className='mine-page__list-item' onClick={handleHistory}>
          {/* 历史记录图标 — CSS 绘制时钟 */}
          <View className='mine-page__list-icon mine-page__list-icon--clock'>
            <View className='mine-page__clock-face'>
              <View className='mine-page__clock-hand mine-page__clock-hand--v' />
              <View className='mine-page__clock-hand mine-page__clock-hand--h' />
            </View>
          </View>
          <Text className='mine-page__list-label'>历史记录</Text>
          {history.length > 0 && (
            <Text className='mine-page__list-badge'>{history.length}</Text>
          )}
          <Text className='mine-page__list-arrow'>›</Text>
        </View>
      </View>

      {/* 底部版本信息 */}
      <View className='mine-page__footer'>
        <Text className='mine-page__version'>v{APP_VERSION}</Text>
        <Text className='mine-page__copyright'>{COPYRIGHT_TEXT}</Text>
      </View>
    </View>
  )
}
