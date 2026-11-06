import Taro from '@tarojs/taro'
import type { ApiResponse } from '@/types/api'
import { ApiCode } from '@/types/api'
import { storage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/constants/config'

/**
 * 网络请求封装
 * --------------------------------------------------
 * 特性：
 * 1. 请求/响应拦截器
 * 2. 自动携带 Token
 * 3. 401 自动跳转登录
 * 4. 统一错误码处理
 * 5. 超时控制
 * 6. 重试机制（可配置重试次数）
 * 7. 统一响应类型
 *
 * 后续对接真实 API 时，只需修改 BASE_URL 和拦截器逻辑
 */

/** 请求方法 */
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

/** 请求配置 */
interface RequestOptions {
  url: string
  method?: Method
  data?: Record<string, unknown>
  header?: Record<string, string>
  /** 超时时间（毫秒），默认 15000 */
  timeout?: number
  /** 重试次数，默认 0 */
  retry?: number
  /** 是否需要 Token（默认 true） */
  needAuth?: boolean
  /** 是否返回原始响应（不做 code 判断），默认 false */
  rawResponse?: boolean
}

/** 错误类型 */
export class RequestError extends Error {
  constructor(
    message: string,
    public code: number = -1,
    public statusCode?: number,
  ) {
    super(message)
    this.name = 'RequestError'
  }
}

/** 环境变量获取 BASE_URL，fallback 到本地后端 */
const BASE_URL = process.env.TARO_APP_API_BASE || 'http://10.21.119.54:8080/api'

/** 是否开启 Mock 模式 */
const USE_MOCK = process.env.TARO_APP_USE_MOCK === 'true' || !process.env.TARO_APP_API_BASE

/** 默认超时 */
const DEFAULT_TIMEOUT = 15000

/* ----------------------- 拦截器机制 ----------------------- */

type RequestInterceptor = (config: Taro.request.Option) => Taro.request.Option
type ResponseInterceptor = (res: Taro.request.Result) => Taro.request.Result

const requestInterceptors: RequestInterceptor[] = []
const responseInterceptors: ResponseInterceptor[] = []

/** 注册请求拦截器 */
export function addRequestInterceptor(fn: RequestInterceptor) {
  requestInterceptors.push(fn)
}

/** 注册响应拦截器 */
export function addResponseInterceptor(fn: ResponseInterceptor) {
  responseInterceptors.push(fn)
}

/* ----------------------- 默认拦截器 ----------------------- */

// 请求拦截：自动注入 Token
addRequestInterceptor((config) => {
  const token = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN)
  if (token) {
    config.header = {
      ...config.header,
      Authorization: `Bearer ${token}`,
    }
  }
  return config
})

// 响应拦截：统一处理 HTTP 错误
addResponseInterceptor((res) => {
  if (res.statusCode >= 200 && res.statusCode < 300) {
    return res
  }

  // 401 未授权 → 清除 token，提示重新登录
  if (res.statusCode === 401) {
    storage.remove(STORAGE_KEYS.AUTH_TOKEN)
    storage.remove(STORAGE_KEYS.USER_INFO)
    Taro.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
    // 延迟跳转到登录页
    setTimeout(() => {
      Taro.reLaunch({ url: '/pages/generate/index' })
    }, 1500)
    throw new RequestError('登录已过期', ApiCode.UNAUTHORIZED, 401)
  }

  if (res.statusCode === 429) {
    throw new RequestError('请求过于频繁，请稍后再试', ApiCode.RATE_LIMIT, 429)
  }

  if (res.statusCode >= 500) {
    throw new RequestError('服务器繁忙，请稍后再试', ApiCode.SERVER_ERROR, res.statusCode)
  }

  throw new RequestError(
    `请求失败 (${res.statusCode})`,
    ApiCode.BAD_REQUEST,
    res.statusCode,
  )
})

/* ----------------------- 核心请求函数 ----------------------- */

/**
 * 发起 HTTP 请求
 *
 * @returns 解构后的 data（ApiResponse.data）
 * @throws RequestError
 */
export async function request<T = unknown>(options: RequestOptions): Promise<T> {
  const {
    url,
    method = 'GET',
    data,
    header,
    timeout = DEFAULT_TIMEOUT,
    retry = 0,
    needAuth = true,
    rawResponse = false,
  } = options

  let lastError: Error

  for (let attempt = 0; attempt <= retry; attempt++) {
    try {
      let config: Taro.request.Option = {
        url: `${BASE_URL}${url}`,
        method,
        data,
        header: {
          'Content-Type': 'application/json',
          ...header,
        },
        timeout,
      }

      // 请求拦截器
      if (needAuth) {
        for (const interceptor of requestInterceptors) {
          config = interceptor(config)
        }
      }

      const res = await Taro.request(config)

      // 响应拦截器
      for (const interceptor of responseInterceptors) {
        interceptor(res)
      }

      // rawResponse 模式：直接返回 data
      if (rawResponse) {
        return res.data as T
      }

      // 统一响应格式：{ code, data, message }
      const apiRes = res.data as ApiResponse<T>

      // 兼容：如果返回的不是标准格式，直接返回
      if (apiRes === undefined || apiRes === null) {
        return res.data as T
      }

      if (typeof apiRes.code !== 'number') {
        // 非标准格式，直接返回
        return res.data as T
      }

      if (apiRes.code === ApiCode.SUCCESS) {
        return apiRes.data
      }

      // 业务错误
      throw new RequestError(apiRes.message || '请求失败', apiRes.code)
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))

      // 401 等严重错误不重试
      if (err instanceof RequestError && err.statusCode === 401) {
        throw err
      }

      // 最后一次尝试仍然失败
      if (attempt === retry) {
        break
      }

      // 重试前等待（指数退避）
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 4000)),
      )
    }
  }

  throw lastError!
}

/* ----------------------- 便捷方法 ----------------------- */

export function get<T = unknown>(url: string, options?: Omit<RequestOptions, 'url' | 'method'>) {
  return request<T>({ ...options, url, method: 'GET' })
}

export function post<T = unknown>(url: string, data?: Record<string, unknown>, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>) {
  return request<T>({ ...options, url, method: 'POST', data })
}

export function put<T = unknown>(url: string, data?: Record<string, unknown>, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>) {
  return request<T>({ ...options, url, method: 'PUT', data })
}

export function del<T = unknown>(url: string, options?: Omit<RequestOptions, 'url' | 'method'>) {
  return request<T>({ ...options, url, method: 'DELETE' })
}

/**
 * 文件上传
 *
 * @param url 上传地址
 * @param filePath 本地文件路径
 * @param formData 额外表单数据
 * @returns 上传结果
 */
export function upload<T = unknown>(
  url: string,
  filePath: string,
  formData?: Record<string, string>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN)

    Taro.uploadFile({
      url: `${BASE_URL}${url}`,
      filePath,
      name: 'file',
      formData,
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success: (res) => {
        try {
          const data = JSON.parse(res.data) as ApiResponse<T>
          if (data.code === ApiCode.SUCCESS) {
            resolve(data.data)
          } else {
            reject(new RequestError(data.message || '上传失败', data.code))
          }
        } catch {
          reject(new RequestError('上传响应解析失败'))
        }
      },
      fail: (err) => {
        reject(new RequestError(err.errMsg || '上传失败'))
      },
    })
  })
}

/** 导出 Mock 模式标志，供 services 层判断 */
export { USE_MOCK }
