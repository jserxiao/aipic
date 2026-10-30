import { create } from 'zustand'
import type { GenerateConfig, GenerateRecord, RatioType, ResolutionType } from '@/types/generate'
import { storage } from '@/utils/storage'
import { getTodayDate } from '@/utils/format'
import { STORAGE_KEYS, MAX_DAILY_GENERATE } from '@/constants/config'
import { generateImage } from '@/services/generate'

interface GenerateState {
  // 当前生成配置
  config: GenerateConfig
  // 今日已生成张数
  todayCount: number
  // 今日日期（用于跨天重置）
  todayDate: string
  // 历史记录
  history: GenerateRecord[]
  // 生成中状态
  generating: boolean
  // 最后一次生成结果
  lastResult: GenerateRecord | null

  // Actions
  setPrompt: (prompt: string) => void
  setRatio: (ratio: RatioType) => void
  setResolution: (resolution: ResolutionType) => void
  setCustomSize: (width: number, height: number) => void
  setReferenceImage: (url: string | undefined) => void
  generate: (config: GenerateConfig) => Promise<{ success: boolean; errorMessage?: string }>
  loadHistory: () => void
  clearHistory: () => void
  resetTodayCount: () => void
}

export const useGenerateStore = create<GenerateState>((set, get) => ({
  config: {
    prompt: '',
    ratio: '1:1',
    resolution: '1024x1024',
    customWidth: 1024,
    customHeight: 1024,
    referenceImage: undefined,
  },
  todayCount: 0,
  todayDate: getTodayDate(),
  history: [],
  generating: false,
  lastResult: null,

  setPrompt: (prompt: string) => {
    set((state) => ({
      config: { ...state.config, prompt },
    }))
  },

  setRatio: (ratio: RatioType) => {
    set((state) => ({
      config: { ...state.config, ratio },
    }))
  },

  setResolution: (resolution: ResolutionType) => {
    set((state) => ({
      config: { ...state.config, resolution },
    }))
  },

  setCustomSize: (width: number, height: number) => {
    set((state) => ({
      config: { ...state.config, customWidth: width, customHeight: height },
    }))
  },

  setReferenceImage: (url: string | undefined) => {
    set((state) => ({
      config: { ...state.config, referenceImage: url },
    }))
  },

  generate: async (config: GenerateConfig) => {
    // 检查今日次数
    const state = get()
    // 跨天重置
    const today = getTodayDate()
    if (state.todayDate !== today) {
      set({ todayCount: 0, todayDate: today })
    }

    const currentCount = state.todayDate !== today ? 0 : state.todayCount
    if (currentCount >= MAX_DAILY_GENERATE) {
      return {
        success: false,
        errorMessage: `今日生成次数已达上限（${MAX_DAILY_GENERATE}张），明天再试吧`,
      }
    }

    set({ generating: true })

    try {
      const result = await generateImage(config)
      set({ generating: false })

      if (result.success && result.record) {
        // 更新今日次数
        const newCount = (state.todayDate !== today ? 0 : state.todayCount) + 1
        set({
          todayCount: newCount,
          todayDate: today,
          lastResult: result.record,
        })

        // 保存今日次数到本地
        storage.set(STORAGE_KEYS.TODAY_COUNT, newCount)
        storage.set(STORAGE_KEYS.TODAY_DATE, today)

        // 更新历史记录
        const newHistory = [result.record, ...state.history]
        set({ history: newHistory })
        storage.set(STORAGE_KEYS.GENERATE_RECORDS, newHistory)

        return { success: true }
      }

      return {
        success: false,
        errorMessage: result.errorMessage || '生成失败，请重试',
      }
    } catch (e) {
      set({ generating: false })
      return {
        success: false,
        errorMessage: e instanceof Error ? e.message : '生成失败，请重试',
      }
    }
  },

  loadHistory: () => {
    const history = storage.get<GenerateRecord[]>(STORAGE_KEYS.GENERATE_RECORDS) || []
    const todayCount = storage.get<number>(STORAGE_KEYS.TODAY_COUNT) || 0
    const todayDate = storage.get<string>(STORAGE_KEYS.TODAY_DATE) || getTodayDate()

    // 跨天重置
    const today = getTodayDate()
    set({
      history,
      todayCount: todayDate === today ? todayCount : 0,
      todayDate: today,
    })
  },

  clearHistory: () => {
    set({ history: [] })
    storage.set(STORAGE_KEYS.GENERATE_RECORDS, [])
  },

  resetTodayCount: () => {
    set({ todayCount: 0 })
    storage.set(STORAGE_KEYS.TODAY_COUNT, 0)
  },
}))
