import type { User } from '@/types/user'
import { generateRandomId } from '@/utils/id'

/** Mock 用户数据 */
export const mockUser: User = {
  userId: 'u_001',
  randomId: generateRandomId(),
  avatar: '',
  isVip: true,
  vipLevel: 'vip',
  vipExpireAt: '2027-01-01T00:00:00.000Z',
  credits: 1000,
}
