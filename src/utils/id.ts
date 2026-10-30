/**
 * 生成随机用户展示 ID
 * 格式：AP_ + 6 位随机字母数字
 * 示例：AP_8xK2m9
 */
export function generateRandomId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'AP_'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
