import Taro from '@tarojs/taro'
import { upload, USE_MOCK } from './request'
import { storage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/constants/config'

/**
 * 图片上传相关接口
 * --------------------------------------------------
 * Mock 模式：返回临时文件路径作为 URL
 * 真实环境：上传到服务端/OSS，返回 CDN URL
 */

/** 上传结果 */
interface UploadResult {
  url: string
}

/** 最大文件大小 5MB */
const MAX_FILE_SIZE = 5 * 1024 * 1024

/**
 * 校验图片文件大小
 *
 * @param filePath 文件路径
 * @returns 是否通过校验
 */
export async function validateImageSize(filePath: string): Promise<boolean> {
  try {
    const fileInfo = await Taro.getFileInfo({ filePath })
    if (fileInfo.size > MAX_FILE_SIZE) {
      Taro.showToast({
        title: '图片大小不能超过 5MB',
        icon: 'none',
      })
      return false
    }
    return true
  } catch {
    // 获取文件信息失败，允许继续上传
    return true
  }
}

/**
 * 上传图片到服务端
 *
 * @param filePath 本地临时文件路径
 * @param onProgress 上传进度回调（0-100）
 * @returns 上传后的图片 URL
 */
export async function uploadImage(
  filePath: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  // 校验文件大小
  const valid = await validateImageSize(filePath)
  if (!valid) {
    throw new Error('图片大小超过限制')
  }

  // === Mock 模式 ===
  if (USE_MOCK) {
    return mockUploadImage(filePath, onProgress)
  }

  // === 真实 API ===
  return new Promise((resolve, reject) => {
    const BASE_URL = process.env.TARO_APP_API_BASE
    const token = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN)

    const uploadTask = Taro.uploadFile({
      url: `${BASE_URL}/upload/image`,
      filePath,
      name: 'file',
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success: (res) => {
        try {
          const data = JSON.parse(res.data) as { code: number; data: UploadResult; message: string }
          if (data.code === 0) {
            resolve(data.data.url)
          } else {
            reject(new Error(data.message || '上传失败'))
          }
        } catch {
          reject(new Error('上传响应解析失败'))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '上传失败'))
      },
    })

    // 监听上传进度
    if (onProgress) {
      uploadTask.progress((res) => {
        onProgress(Math.round((res.progress / 100) * 100))
      })
    }
  })
}

/**
 * 上传参考图（语义化包装）
 */
export async function uploadReferenceImage(
  filePath: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  return uploadImage(filePath, onProgress)
}

/* ==================== Mock 实现 ==================== */

/** Mock: 上传图片 */
async function mockUploadImage(
  filePath: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  // 模拟上传进度
  for (let i = 0; i <= 100; i += 25) {
    onProgress?.(i)
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  // Mock 模式直接返回临时路径
  return filePath
}
