import { create } from 'zustand'
import type { GenerateConfig, GenerateRecord, RatioType, ResolutionType, AIModelType } from '@/types/generate'
import type { AsyncTaskProgress } from '@/types/api'
import { storage } from '@/utils/storage'
import { getTodayDate } from '@/utils/format'
import { STORAGE_KEYS, MAX_DAILY_GENERATE, DEFAULT_MODEL, getModelCreditsCost } from '@/constants/config'
import { submitGenerateTask, getTaskProgress, cancelGenerateTask, getHistory, deleteHistoryRecord } from '@/services/generate'
import { USE_MOCK } from '@/services/request'
import type { PollingHandle } from '@/utils/polling'
import { createTaskPolling, getTaskStatusText } from '@/utils/polling'
/** 生成进度状态 */
export type GeneratePhase = 'idle' | 'submitting' | 'polling' | 'succeed' | 'failed'

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
  // 生成阶段
  phase: GeneratePhase
  // 进度百分比
  progress: number
  // 进度文案
  progressText: string
  // 最后一次生成结果
  lastResult: GenerateRecord | null
  // 历史记录分页
  historyPage: number
  historyHasMore: boolean
  historyLoading: boolean

  // Actions
  setPrompt: (prompt: string) => void
  setRatio: (ratio: RatioType) => void
  setResolution: (resolution: ResolutionType) => void
  setCustomSize: (width: number, height: number) => void
  setReferenceImage: (url: string | undefined) => void
  setModel: (model: AIModelType) => void
  /** 设置比例时自动联动推荐分辨率 */
  setRatioWithLinkage: (ratio: RatioType) => void
  generate: (config: GenerateConfig) => Promise<{ success: boolean; errorMessage?: string }>
  /** 取消生成 */
  cancelGenerate: () => void
  /** 保存草稿 */
  saveDraft: () => void
  /** 加载草稿 */
  loadDraft: () => void
  // 历史记录
  loadHistory: (reset?: boolean) => void
  loadMoreHistory: () => void
  removeHistoryRecord: (recordId: string) => void
  clearHistory: () => void
  resetTodayCount: () => void
}

/** 比例 → 推荐分辨率映射 */
const RATIO_TO_RESOLUTION: Record<RatioType, ResolutionType> = {
  '1:1': '1024x1024',
  '3:4': '768x768',
  '4:3': '768x768',
  '16:9': '768x768',
  '9:16': '768x768',
}

/** 当前轮询句柄 */
let currentPolling: PollingHandle | null = null
/** 当前任务 ID（用于取消时通知服务端） */
let currentTaskId: string | null = null

export const useGenerateStore = create<GenerateState>((set, get) => ({
  config: {
    prompt: '',
    ratio: '1:1',
    resolution: '1024x1024',
    model: DEFAULT_MODEL,
    customWidth: 1024,
    customHeight: 1024,
    referenceImage: undefined,
  },
  todayCount: 0,
  todayDate: getTodayDate(),
  history: [],
  generating: false,
  phase: 'idle',
  progress: 0,
  progressText: '',
  lastResult: null,
  historyPage: 1,
  historyHasMore: false,
  historyLoading: false,

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

  setRatioWithLinkage: (ratio: RatioType) => {
    set((state) => ({
      config: {
        ...state.config,
        ratio,
        // 自动联动推荐分辨率（但不覆盖自定义模式）
        resolution: state.config.resolution === 'custom'
          ? state.config.resolution
          : RATIO_TO_RESOLUTION[ratio],
      },
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

  setModel: (model: AIModelType) => {
    set((state) => ({
      config: { ...state.config, model },
    }))
  },

  generate: async (config: GenerateConfig) => {
    // 检查今日次数
    const state = get()
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

    // 取消之前的轮询（如果有）
    if (currentPolling) {
      currentPolling.cancel()
      currentPolling = null
    }

    set({ generating: true, phase: 'submitting', progress: 0, progressText: '提交中...' })

    try {
      // 1. 提交任务
      const taskId = await submitGenerateTask(config)
      currentTaskId = taskId
      set({ phase: 'polling', progressText: '排队中...' })

      // 2. 轮询任务状态
      return await new Promise<{ success: boolean; errorMessage?: string }>((resolve) => {
        currentPolling = createTaskPolling(
          () => getTaskProgress(taskId),
          // onProgress
          (taskProgress: AsyncTaskProgress) => {
            set({
              progress: taskProgress.progress,
              progressText: getTaskStatusText(taskProgress.status),
            })
          },
          // onComplete
          (taskProgress: AsyncTaskProgress) => {
            currentPolling = null

            // 构建生成记录
            const resolution =
              config.resolution === 'custom'
                ? `${config.customWidth}x${config.customHeight}`
                : config.resolution

            const record: GenerateRecord = {
              id: `gr_${Date.now()}`,
              prompt: config.prompt,
              ratio: config.ratio,
              resolution,
              imageUrl: taskProgress.resultUrl || '',
              status: 'success',
              createdAt: new Date().toISOString(),
              creditsCost: getModelCreditsCost(config.model),
            }

            // 更新今日次数
            const newCount = (state.todayDate !== today ? 0 : state.todayCount) + 1
            set({
              generating: false,
              phase: 'succeed',
              progress: 100,
              progressText: '生成完成',
              todayCount: newCount,
              todayDate: today,
              lastResult: record,
            })

            // 持久化
            storage.set(STORAGE_KEYS.TODAY_COUNT, newCount)
            storage.set(STORAGE_KEYS.TODAY_DATE, today)

            // 更新历史记录
            const newHistory = [record, ...state.history]
            set({ history: newHistory })
            storage.set(STORAGE_KEYS.GENERATE_RECORDS, newHistory)

            resolve({ success: true })
          },
          // onError
          (error: Error) => {
            currentPolling = null
            set({
              generating: false,
              phase: 'failed',
              progress: 0,
              progressText: '',
            })
            resolve({
              success: false,
              errorMessage: error.message || '生成失败，请重试',
            })
          },
          {
            initialInterval: 1500,
            maxInterval: 3000,
            maxDuration: 60000,
          },
        )
      })
    } catch (e) {
      set({ generating: false, phase: 'failed', progress: 0, progressText: '' })
      return {
        success: false,
        errorMessage: e instanceof Error ? e.message : '生成失败，请重试',
      }
    }
  },

  cancelGenerate: () => {
    if (currentPolling) {
      currentPolling.cancel()
      currentPolling = null
    }
    // 通知服务端取消任务（忽略错误）
    if (currentTaskId) {
      cancelGenerateTask(currentTaskId).catch(() => {})
      currentTaskId = null
    }
    set({ generating: false, phase: 'idle', progress: 0, progressText: '' })
  },

  saveDraft: () => {
    const { config } = get()
    storage.set(STORAGE_KEYS.PROMPT_DRAFT, config.prompt)
  },

  loadDraft: () => {
    const draft = storage.get<string>(STORAGE_KEYS.PROMPT_DRAFT)
    if (draft) {
      set((state) => ({
        config: { ...state.config, prompt: draft },
      }))
    }
  },

  loadHistory: async (reset = false) => {
    const state = get()
    if (state.historyLoading) return

    // 本地缓存模式（Mock 模式）
    if (USE_MOCK) {
      const cached = storage.get<GenerateRecord[]>(STORAGE_KEYS.GENERATE_RECORDS) || []
      const todayCount = storage.get<number>(STORAGE_KEYS.TODAY_COUNT) || 0
      const todayDate = storage.get<string>(STORAGE_KEYS.TODAY_DATE) || getTodayDate()
      const today = getTodayDate()
      set({
        history: cached,
        todayCount: todayDate === today ? todayCount : 0,
        todayDate: today,
        historyPage: 1,
        historyHasMore: false,
      })
      return
    }

    // 真实 API：从服务端加载历史记录
    set({ historyLoading: true })
    try {
      const result = await getHistory(1, 20)
      const todayCount = storage.get<number>(STORAGE_KEYS.TODAY_COUNT) || 0
      const todayDate = storage.get<string>(STORAGE_KEYS.TODAY_DATE) || getTodayDate()
      const today = getTodayDate()
      set({
        history: result.list,
        todayCount: todayDate === today ? todayCount : 0,
        todayDate: today,
        historyPage: 1,
        historyHasMore: result.hasMore,
        historyLoading: false,
      })
    } catch {
      // 失败时回退到本地缓存
      const cached = storage.get<GenerateRecord[]>(STORAGE_KEYS.GENERATE_RECORDS) || []
      set({ history: cached, historyLoading: false })
    }
  },

  loadMoreHistory: async () => {
    const state = get()
    if (state.historyLoading || !state.historyHasMore) return

    set({ historyLoading: true })
    try {
      const nextPage = state.historyPage + 1
      const result = await getHistory(nextPage, 20)
      set({
        history: [...state.history, ...result.list],
        historyPage: nextPage,
        historyHasMore: result.hasMore,
        historyLoading: false,
      })
    } catch {
      set({ historyLoading: false })
    }
  },

  removeHistoryRecord: (recordId: string) => {
    const state = get()
    const newHistory = state.history.filter((r) => r.id !== recordId)
    set({ history: newHistory })
    storage.set(STORAGE_KEYS.GENERATE_RECORDS, newHistory)
    // 同步删除服务端（忽略错误）
    deleteHistoryRecord(recordId).catch(() => {})
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
