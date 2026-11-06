import { useEffect, useState } from 'react'
import { View, Text, Textarea } from '@tarojs/components'
import Taro, { useShareAppMessage, useDidShow } from '@tarojs/taro'
import { useGenerateStore } from '@/store/generateStore'
import { useUserStore } from '@/store/userStore'
import InfoBar from '@/components/InfoBar'
import RatioSelector from '@/components/RatioSelector'
import ResolutionPicker from '@/components/ResolutionPicker'
import ImageUploader from '@/components/ImageUploader'
import ModelSelector from '@/components/ModelSelector'
import LoadingButton from '@/components/LoadingButton'
import ResultModal from '@/components/ResultModal'
import {
  MAX_DAILY_GENERATE,
  MAX_PROMPT_LENGTH,
  MIN_PROMPT_LENGTH,
  getModelCreditsCost,
} from '@/constants/config'
import './index.scss'

export default function Generate() {
  const {
    config,
    todayCount,
    generating,
    phase,
    progress,
    progressText,
    lastResult,
    setPrompt,
    setRatioWithLinkage,
    setResolution,
    setCustomSize,
    setReferenceImage,
    setModel,
    generate,
    cancelGenerate,
    loadHistory,
    saveDraft,
    loadDraft,
  } = useGenerateStore()

  const { user, deductCredits } = useUserStore()
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    loadHistory()
    loadDraft()
    return () => {
      // 离开页面时保存草稿
      saveDraft()
    }
  }, [loadHistory, loadDraft, saveDraft])

  // 页面显示时同步 TabBar 选中态
  useDidShow(() => {
    Taro.eventCenter.trigger('TAB_BAR_SELECT', 0)
  })

  const promptLength = config.prompt.length
  const canGenerate = promptLength >= MIN_PROMPT_LENGTH && !generating
  const creditsCost = getModelCreditsCost(config.model)

  const handleGenerate = async () => {
    if (!canGenerate) {
      if (promptLength < MIN_PROMPT_LENGTH) {
        Taro.showToast({ title: `请输入至少 ${MIN_PROMPT_LENGTH} 个字`, icon: 'none' })
      }
      return
    }

    // 检查积分
    if (user && user.credits < creditsCost) {
      Taro.showModal({
        title: '积分不足',
        content: `本次生成需要 ${creditsCost} 积分，当前剩余 ${user.credits} 积分。是否前往充值？`,
        confirmText: '去充值',
        confirmColor: '#000000',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/recharge/index' })
          }
        },
      })
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
      deductCredits(creditsCost)
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

  // 分享小程序
  useShareAppMessage(() => {
    return {
      title: '一键绘图 - AI 图片生成工具，输入文字就能生成图片！',
      path: '/pages/generate/index',
      imageUrl: '',
    }
  })

  return (
    <View className='generate-page'>
      {/* 顶部信息栏 */}
      <InfoBar
        creditsCost={creditsCost}
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
            onBlur={saveDraft}
            autoHeight
          />
          <Text className='generate-page__char-count'>
            {promptLength}/{MAX_PROMPT_LENGTH}
          </Text>
        </View>
      </View>

      {/* 比例选择（联动分辨率） */}
      <RatioSelector value={config.ratio} onChange={setRatioWithLinkage} />

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

      {/* AI 模型选择 */}
      <ModelSelector value={config.model} onChange={setModel} />

      {/* 生成进度条 */}
      {generating && phase !== 'idle' && (
        <View className='generate-page__progress'>
          <View className='generate-page__progress-bar'>
            <View
              className='generate-page__progress-fill'
              style={{ width: `${progress}%` }}
            />
          </View>
          <Text className='generate-page__progress-text'>
            {progressText}
          </Text>
        </View>
      )}

      {/* 底部生成按钮 */}
      <View className='generate-page__footer'>
        <View className='generate-page__footer-bar'>
          <View className='generate-page__cost-tip'>
            <Text className='generate-page__cost-label'>消耗</Text>
            <Text className='generate-page__cost-value'>{creditsCost}</Text>
            <Text className='generate-page__cost-unit'>积分</Text>
          </View>
          <View className='generate-page__btn-wrapper'>
            {generating ? (
              <View
                className='generate-page__cancel-btn'
                onClick={cancelGenerate}
              >
                <Text className='generate-page__cancel-btn-text'>取消生成</Text>
              </View>
            ) : (
              <LoadingButton
                text='生 成'
                loadingText='生成中...'
                loading={generating}
                disabled={!canGenerate}
                onClick={handleGenerate}
              />
            )}
          </View>
        </View>
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
