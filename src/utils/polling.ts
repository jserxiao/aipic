import type { AsyncTaskProgress, AsyncTaskStatus } from '@/types/api'

/**
 * 异步任务轮询器
 * --------------------------------------------------
 * 用于 AI 生图等异步任务的状态轮询
 *
 * 特性：
 * 1. 固定间隔轮询（可配置）
 * 2. 超时自动放弃
 * 3. 可取消
 * 4. 进度回调
 * 5. 指数退避（可选）
 */

/** 轮询配置 */
interface PollingOptions {
  /** 初始轮询间隔（毫秒），默认 2000 */
  initialInterval?: number
  /** 最大轮询间隔（毫秒），默认 5000 */
  maxInterval?: number
  /** 是否启用指数退避，默认 true */
  exponentialBackoff?: boolean
  /** 最大轮询时长（毫秒），默认 60000 */
  maxDuration?: number
}

/** 轮询控制句柄 */
export interface PollingHandle {
  /** 取消轮询 */
  cancel: () => void
  /** 是否已取消 */
  isCancelled: () => boolean
}

/**
 * 创建异步任务轮询
 *
 * @param fetchFn 获取任务状态的函数，返回 AsyncTaskProgress
 * @param onProgress 进度回调
 * @param onComplete 完成回调
 * @param onError 错误回调
 * @param options 轮询配置
 * @returns 轮询控制句柄
 */
export function createTaskPolling(
  fetchFn: () => Promise<AsyncTaskProgress>,
  onProgress: (progress: AsyncTaskProgress) => void,
  onComplete: (progress: AsyncTaskProgress) => void,
  onError: (error: Error) => void,
  options: PollingOptions = {},
): PollingHandle {
  const {
    initialInterval = 2000,
    maxInterval = 5000,
    exponentialBackoff = true,
    maxDuration = 60000,
  } = options

  let cancelled = false
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  const startTime = Date.now()
  let currentInterval = initialInterval

  const poll = async () => {
    if (cancelled) return

    // 超时检查
    if (Date.now() - startTime >= maxDuration) {
      onError(new Error('生成超时，请稍后重试'))
      return
    }

    try {
      const progress = await fetchFn()

      if (cancelled) return

      onProgress(progress)

      if (progress.status === 'succeed') {
        onComplete(progress)
        return
      }

      if (progress.status === 'failed') {
        onError(new Error(progress.errorMessage || '生成失败'))
        return
      }

      // 继续轮询
      if (exponentialBackoff) {
        currentInterval = Math.min(currentInterval * 1.5, maxInterval)
      }

      timeoutId = setTimeout(poll, currentInterval)
    } catch (err) {
      if (cancelled) return
      onError(err instanceof Error ? err : new Error('轮询失败'))
    }
  }

  // 立即开始第一次轮询
  poll()

  return {
    cancel: () => {
      cancelled = true
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    },
    isCancelled: () => cancelled,
  }
}

/** 将状态文案映射为中文 */
export function getTaskStatusText(status: AsyncTaskStatus): string {
  const statusTextMap: Record<AsyncTaskStatus, string> = {
    queued: '排队中...',
    processing: '生成中...',
    succeed: '生成完成',
    failed: '生成失败',
  }
  return statusTextMap[status]
}
