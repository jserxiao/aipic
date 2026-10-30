import { useEffect, useState } from 'react'
import { View, Text, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useGenerateStore } from '@/store/generateStore'
import { useUserStore } from '@/store/userStore'
import InfoBar from '@/components/InfoBar'
import RatioSelector from '@/components/RatioSelector'
import ResolutionPicker from '@/components/ResolutionPicker'
import ImageUploader from '@/components/ImageUploader'
import LoadingButton from '@/components/LoadingButton'
import ResultModal from '@/components/ResultModal'
import {
  CREDITS_PER_GENERATE,
  MAX_DAILY_GENERATE,
  MAX_PROMPT_LENGTH,
  MIN_PROMPT_LENGTH,
} from '@/constants/config'
import './index.scss'

export default function Generate() {
  const {
    config,
    todayCount,
    generating,
    lastResult,
    setPrompt,
    setRatio,
    setResolution,
    setCustomSize,
    setReferenceImage,
    generate,
    loadHistory,
  } = useGenerateStore()

  const { user, deductCredits } = useUserStore()
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const promptLength = config.prompt.length
  const canGenerate = promptLength >= MIN_PROMPT_LENGTH && !generating

  const handleGenerate = async () => {
    if (!canGenerate) {
      if (promptLength < MIN_PROMPT_LENGTH) {
        Taro.showToast({ title: `请输入至少 ${MIN_PROMPT_LENGTH} 个字`, icon: 'none' })
      }
      return
    }

    // 检查积分
    if (user && user.credits < CREDITS_PER_GENERATE) {
      Taro.showToast({ title: '积分不足', icon: 'none' })
      return
    }

    // 检查今日次数
    if (todayCount >= MAX_DAILY_GENERATE) {
      Taro.showToast({
        title: `今日生成次数已达上限（${MAX_DAILY_GENERATE}张）`,
        icon: 'none',
      })
      return
    }

    const result = await generate(config)

    if (result.success) {
      deductCredits(CREDITS_PER_GENERATE)
      setShowResult(true)
    } else {
      Taro.showToast({ title: result.errorMessage || '生成失败', icon: 'none' })
    }
  }

  const handleCloseResult = () => {
    setShowResult(false)
    // 清空输入，准备下一次
    setPrompt('')
  }

  return (
    <View className='generate-page'>
      {/* 顶部信息栏 */}
      <InfoBar
        creditsCost={CREDITS_PER_GENERATE}
        todayCount={todayCount}
        maxDaily={MAX_DAILY_GENERATE}
      />

      {/* 文字描述输入 */}
      <View className='generate-page__section'>
        <Text className='generate-page__section-title'>描述你想生成的图片</Text>
        <View className='generate-page__textarea-wrapper'>
          <Textarea
            className='generate-page__textarea'
            placeholder='例如：一只白色的猫坐在窗台上，阳光明媚，水彩画风格...'
            value={config.prompt}
            maxlength={MAX_PROMPT_LENGTH}
            onInput={(e) => setPrompt(e.detail.value)}
            autoHeight
          />
          <Text className='generate-page__char-count'>
            {promptLength}/{MAX_PROMPT_LENGTH}
          </Text>
        </View>
      </View>

      {/* 比例选择 */}
      <RatioSelector value={config.ratio} onChange={setRatio} />

      {/* 分辨率选择 */}
      <ResolutionPicker
        value={config.resolution}
        customWidth={config.customWidth || 0}
        customHeight={config.customHeight || 0}
        onChange={setResolution}
        onCustomSizeChange={setCustomSize}
      />

      {/* 参考图上传 */}
      <ImageUploader
        imageUrl={config.referenceImage}
        onChange={setReferenceImage}
      />

      {/* 底部生成按钮 */}
      <View className='generate-page__footer'>
        <LoadingButton
          text='生 成'
          loadingText='生成中...'
          loading={generating}
          disabled={!canGenerate}
          onClick={handleGenerate}
        />
      </View>

      {/* 生成结果弹窗 */}
      <ResultModal
        record={lastResult}
        visible={showResult}
        onClose={handleCloseResult}
      />
    </View>
  )
}
