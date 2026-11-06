import Taro from '@tarojs/taro'

/**
 * 图片相关工具函数
 * --------------------------------------------------
 * 1. 保存图片到相册（含权限前置检查）
 * 2. 图片下载缓存
 */

/**
 * 检查并申请保存到相册的权限
 *
 * @returns 是否已授权
 */
async function checkWritePhotosAlbumPermission(): Promise<boolean> {
  try {
    const setting = await Taro.getSetting()

    if (setting.authSetting['scope.writePhotosAlbum'] === false) {
      // 之前拒绝过，需要引导用户在设置中开启
      return new Promise((resolve) => {
        Taro.showModal({
          title: '提示',
          content: '需要您授权保存到相册的权限，是否前往设置？',
          confirmText: '去设置',
          confirmColor: '#000000',
          success: (res) => {
            if (res.confirm) {
              Taro.openSetting({
                success: (settingRes) => {
                  resolve(!!settingRes.authSetting['scope.writePhotosAlbum'])
                },
                fail: () => resolve(false),
              })
            } else {
              resolve(false)
            }
          },
        })
      })
    }

    if (setting.authSetting['scope.writePhotosAlbum'] === true) {
      return true
    }

    // 未授权过，调用 authorize 触发授权弹窗
    await Taro.authorize({ scope: 'scope.writePhotosAlbum' })
    return true
  } catch {
    return false
  }
}

/**
 * 保存图片到相册
 * 完整流程：权限检查 → 下载图片 → 保存到相册
 *
 * @param imageUrl 图片 URL（远程或本地）
 */
export async function saveImageToAlbum(imageUrl: string): Promise<void> {
  // 1. 权限前置检查
  const hasPermission = await checkWritePhotosAlbumPermission()
  if (!hasPermission) {
    Taro.showToast({ title: '未获取相册权限', icon: 'none' })
    return
  }

  // 2. 下载图片（如果是远程 URL）
  let filePath = imageUrl
  if (imageUrl.startsWith('http')) {
    try {
      const downloadRes = await Taro.downloadFile({ url: imageUrl })
      filePath = downloadRes.tempFilePath
    } catch {
      Taro.showToast({ title: '图片下载失败', icon: 'none' })
      return
    }
  }

  // 3. 保存到相册
  try {
    await Taro.saveImageToPhotosAlbum({ filePath })
    Taro.showToast({ title: '已保存到相册', icon: 'success' })
  } catch {
    Taro.showToast({ title: '保存失败', icon: 'none' })
  }
}

/**
 * 预览图片（使用微信原生预览，支持手势缩放）
 *
 * @param current 当前图片 URL
 * @param urls 图片 URL 列表
 */
export function previewImage(current: string, urls: string[] = [current]): void {
  Taro.previewImage({ current, urls })
}
