/**
 * API 统一响应格式类型
 * 后端返回格式：{ code, data, message }
 */

/** 业务状态码 */
export enum ApiCode {
  /** 成功 */
  SUCCESS = 0,
  /** 未登录 / token 过期 */
  UNAUTHORIZED = 401,
  /** 无权限 */
  FORBIDDEN = 403,
  /** 资源不存在 */
  NOT_FOUND = 404,
  /** 请求过于频繁 */
  RATE_LIMIT = 429,
  /** 服务器错误 */
  SERVER_ERROR = 500,
  /** 参数错误 */
  BAD_REQUEST = 400,
}

/** 统一响应体 */
export interface ApiResponse<T = unknown> {
  /** 业务状态码，0 表示成功 */
  code: number
  /** 响应数据 */
  data: T
  /** 提示信息 */
  message: string
}

/** 分页响应数据 */
export interface PaginatedData<T> {
  /** 数据列表 */
  list: T[]
  /** 总条数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页条数 */
  pageSize: number
  /** 是否还有更多 */
  hasMore: boolean
}

/** 分页请求参数 */
export interface PaginationParams {
  page?: number
  pageSize?: number
}

/**
 * 异步任务状态
 * AI 生图为异步任务：提交 → 排队 → 生成中 → 完成/失败
 */
export type AsyncTaskStatus = 'queued' | 'processing' | 'succeed' | 'failed'

/** 异步任务进度信息 */
export interface AsyncTaskProgress {
  /** 任务 ID */
  taskId: string
  /** 任务状态 */
  status: AsyncTaskStatus
  /** 进度百分比 0-100 */
  progress: number
  /** 状态描述文案 */
  statusText: string
  /** 生成结果图片 URL（status 为 succeed 时有值） */
  resultUrl?: string
  /** 失败原因（status 为 failed 时有值） */
  errorMessage?: string
}

/** 支付订单信息 */
export interface PaymentOrder {
  /** 订单 ID */
  orderId: string
  /** 微信支付参数 */
  payParams: {
    timeStamp: string
    nonceStr: string
    package: string
    signType: string
    paySign: string
  }
  /** 支付金额（分） */
  amount: number
  /** 获得积分 */
  credits: number
}

/** 支付订单状态 */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'closed'

/** 支付订单查询结果 */
export interface PaymentResult {
  orderId: string
  status: PaymentStatus
  credits?: number
}
