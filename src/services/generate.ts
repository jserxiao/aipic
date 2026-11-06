import type { GenerateConfig, GenerateRecord } from '@/types/generate'
import type { AsyncTaskProgress } from '@/types/api'
import { request, USE_MOCK } from './request'

/**
 * 生成相关接口
 * --------------------------------------------------
 * Mock 模式：模拟异步任务提交 → 轮询 → 完成
 * 真实环境：替换为后端 API
 */

/**
 * 提交生图任务
 * 返回任务 ID，用于后续轮询
 *
 * @returns taskId
 */
export async function submitGenerateTask(config: GenerateConfig): Promise<string> {
  if (USE_MOCK) {
    return mockSubmitGenerateTask(config)
  }

  // 真实 API
  const result = await request<{ taskId: string }>({
    url: '/generate/submit',
    method: 'POST',
    data: config as unknown as Record<string, unknown>,
    timeout: 30000,
  })
  return result.taskId
}

/**
 * 查询任务状态
 *
 * @param taskId 任务 ID
 * @returns 任务进度信息
 */
export async function getTaskProgress(taskId: string): Promise<AsyncTaskProgress> {
  if (USE_MOCK) {
    return mockGetTaskProgress(taskId)
  }

  // 真实 API
  return request<AsyncTaskProgress>({
    url: `/generate/task/${taskId}`,
    method: 'GET',
  })
}

/**
 * 取消生成任务
 *
 * @param taskId 任务 ID
 */
export async function cancelGenerateTask(taskId: string): Promise<void> {
  if (USE_MOCK) {
    // Mock: 从内存中标记取消
    mockTaskStore.delete(taskId)
    return
  }

  await request<void>({
    url: `/generate/task/${taskId}/cancel`,
    method: 'POST',
  })
}

/**
 * 获取历史记录（分页）
 *
 * @param page 页码，从 1 开始
 * @param pageSize 每页条数
 */
export async function getHistory(
  page = 1,
  pageSize = 20,
): Promise<{ list: GenerateRecord[]; total: number; hasMore: boolean }> {
  if (USE_MOCK) {
    return mockGetHistory(page, pageSize)
  }

  return request({
    url: '/generate/history',
    method: 'GET',
    data: { page, pageSize },
  })
}

/**
 * 删除单条历史记录
 *
 * @param recordId 记录 ID
 */
export async function deleteHistoryRecord(recordId: string): Promise<void> {
  if (USE_MOCK) {
    return
  }

  await request<void>({
    url: `/generate/history/${recordId}`,
    method: 'DELETE',
  })
}

/* ==================== Mock 实现 ==================== */

/** Mock 任务存储 */
interface MockTask {
  taskId: string
  config: GenerateConfig
  status: AsyncTaskProgress['status']
  progress: number
  createdAt: number
}

const mockTaskStore = new Map<string, MockTask>()

/** Mock: 提交任务 */
async function mockSubmitGenerateTask(config: GenerateConfig): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const taskId = `task_${Date.now()}`
  mockTaskStore.set(taskId, {
    taskId,
    config,
    status: 'queued',
    progress: 0,
    createdAt: Date.now(),
  })
  return taskId
}

/** Mock: 查询任务进度 */
async function mockGetTaskProgress(taskId: string): Promise<AsyncTaskProgress> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const task = mockTaskStore.get(taskId)
  if (!task) {
    return {
      taskId,
      status: 'failed',
      progress: 0,
      statusText: '任务不存在',
      errorMessage: '任务不存在',
    }
  }

  // 模拟进度推进：每次查询推进 15-25%
  const elapsed = Date.now() - task.createdAt
  const targetProgress = Math.min(100, Math.floor((elapsed / 5000) * 100))

  if (targetProgress >= 100) {
    task.status = 'succeed'
    task.progress = 100
  } else if (targetProgress > 0) {
    task.status = 'processing'
    task.progress = targetProgress
  }

  const ratioMap: Record<string, { w: number; h: number }> = {
    '1:1': { w: 1024, h: 1024 },
    '3:4': { w: 768, h: 1024 },
    '4:3': { w: 1024, h: 768 },
    '16:9': { w: 1280, h: 720 },
    '9:16': { w: 720, h: 1280 },
  }
  const size = ratioMap[task.config.ratio] || { w: 1024, h: 1024 }

  const statusTextMap: Record<string, string> = {
    queued: '排队中...',
    processing: '生成中...',
    succeed: '生成完成',
    failed: '生成失败',
  }

  const result: AsyncTaskProgress = {
    taskId,
    status: task.status,
    progress: task.progress,
    statusText: statusTextMap[task.status],
  }

  if (task.status === 'succeed') {
    result.resultUrl = `https://placehold.co/${size.w}x${size.h}/000000/FFFFFF?text=AI+Generated`
    // 完成后清理
    setTimeout(() => mockTaskStore.delete(taskId), 1000)
  }

  return result
}

/** Mock: 获取历史记录 */
async function mockGetHistory(
  _page: number,
  _pageSize: number,
): Promise<{ list: GenerateRecord[]; total: number; hasMore: boolean }> {
  // Mock 模式下历史记录从本地读取，不模拟分页
  return { list: [], total: 0, hasMore: false }
}
