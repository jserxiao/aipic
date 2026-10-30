import type { GenerateConfig, GenerateRecord } from '@/types/generate'
import { CREDITS_PER_GENERATE } from '@/constants/config'

/**
 * Mock 生成图片接口
 * 模拟 AI 图片生成，2 秒后返回结果
 */
export function mockGenerate(config: GenerateConfig): Promise<GenerateRecord> {
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
