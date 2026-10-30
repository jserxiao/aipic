import type { GenerateConfig, GenerateRecord, GenerateResult } from '@/types/generate'
import { CREDITS_PER_GENERATE } from '@/constants/config'

/**
 * Mock 生成图片
 * 模拟 AI 图片生成，2 秒后返回结果
 */
function mockGenerate(config: GenerateConfig): Promise<GenerateRecord> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const resolution =
        config.resolution === 'custom'
          ? `${config.customWidth}x${config.customHeight}`
          : config.resolution

      // 根据 ratio 生成不同尺寸的占位图
      const ratioMap: Record<string, { w: number; h: number }> = {
        '1:1': { w: 1024, h: 1024 },
        '3:4': { w: 768, h: 1024 },
        '4:3': { w: 1024, h: 768 },
        '16:9': { w: 1280, h: 720 },
        '9:16': { w: 720, h: 1280 },
      }
      const size = ratioMap[config.ratio] || { w: 1024, h: 1024 }

      resolve({
        id: `gr_${Date.now()}`,
        prompt: config.prompt,
        ratio: config.ratio,
        resolution,
        imageUrl: `https://placehold.co/${size.w}x${size.h}/000000/FFFFFF?text=AI+Generated`,
        status: 'success',
        createdAt: new Date().toISOString(),
        creditsCost: CREDITS_PER_GENERATE,
      })
    }, 2000)
  })
}

/**
 * 生成图片
 * 当前使用 Mock，后续替换为真实 API
 */
export async function generateImage(config: GenerateConfig): Promise<GenerateResult> {
  // TODO: 替换为真实 API
  // const record = await request<GenerateRecord>({
  //   url: '/generate',
  //   method: 'POST',
  //   data: config,
  // })

  try {
    const record = await mockGenerate(config)
    return { success: true, record }
  } catch (e) {
    return {
      success: false,
      errorMessage: e instanceof Error ? e.message : '生成失败，请重试',
    }
  }
}

/**
 * 获取历史记录
 */
export async function getHistory(): Promise<GenerateRecord[]> {
  // TODO: 替换为真实 API
  return []
}
