import Taro from '@tarojs/taro'

/**
 * 网络请求封装
 * 后续对接真实 API 时，只需修改此文件和 services 层
 */

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, unknown>
  header?: Record<string, string>
}

const BASE_URL = process.env.TARO_APP_API_BASE || 'https://api.aipic.example.com'

export async function request<T>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, header } = options

  try {
    const res = await Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header,
      },
    })

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data as T
    }
    throw new Error(`Request failed: ${res.statusCode}`)
  } catch (e) {
    console.error('Request error:', e)
    throw e
  }
}
