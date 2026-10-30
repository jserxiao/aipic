import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface ImageUploaderProps {
  /** 当前已上传图片 URL */
  imageUrl?: string
  /** 最大上传数量 */
  maxCount?: number
  /** 上传回调 */
  onChange: (url: string | undefined) => void
}

export default function ImageUploader({
  imageUrl,
  maxCount = 1,
  onChange,
}: ImageUploaderProps) {
  const handleChooseImage = () => {
    Taro.chooseImage({
      count: maxCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        if (tempFilePaths.length > 0) {
          onChange(tempFilePaths[0])
        }
      },
    })
  }

  const handleRemove = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    onChange(undefined)
  }

  return (
    <View className='image-uploader'>
      <Text className='image-uploader__title'>参考图（可选）</Text>
      <View className='image-uploader__area'>
        {imageUrl ? (
          <View className='image-uploader__preview'>
            <Image
              className='image-uploader__img'
              src={imageUrl}
              mode='aspectFill'
            />
            <View className='image-uploader__remove' onClick={handleRemove}>
              <View className='image-uploader__remove-line image-uploader__remove-line--1' />
              <View className='image-uploader__remove-line image-uploader__remove-line--2' />
            </View>
          </View>
        ) : (
          <View className='image-uploader__placeholder' onClick={handleChooseImage}>
            <View className='image-uploader__plus'>
              <View className='image-uploader__plus-line image-uploader__plus-line--h' />
              <View className='image-uploader__plus-line image-uploader__plus-line--v' />
            </View>
            <Text className='image-uploader__hint'>上传参考图</Text>
          </View>
        )}
      </View>
    </View>
  )
}
