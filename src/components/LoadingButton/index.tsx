import { View, Text } from '@tarojs/components'
import './index.scss'

interface LoadingButtonProps {
  /** 按钮文字 */
  text: string;
  /** 加载中文字 */
  loadingText?: string;
  /** 是否加载中 */
  loading: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 点击回调 */
  onClick: () => void;
}

export default function LoadingButton({
  text,
  loadingText = '生成中...',
  loading,
  disabled = false,
  onClick,
}: LoadingButtonProps) {
  const isDisabled = disabled || loading

  return (
    <View
      className={`loading-btn ${isDisabled ? 'loading-btn--disabled' : ''} ${loading ? 'loading-btn--loading' : ''}`}
      onClick={!isDisabled ? onClick : undefined}
    >
      {loading ? (
        <View className='loading-btn__spinner'>
          <View className='loading-btn__dot loading-btn__dot--1' />
          <View className='loading-btn__dot loading-btn__dot--2' />
          <View className='loading-btn__dot loading-btn__dot--3' />
        </View>
      ) : null}
      <Text className='loading-btn__text'>
        {loading ? loadingText : text}
      </Text>
    </View>
  )
}
