import Taro from '@tarojs/taro'
import type { PaymentOrder, PaymentResult, PaymentStatus } from '@/types/api'
import { request, USE_MOCK } from './request'

/**
 * 支付相关接口
 * --------------------------------------------------
 * Mock 模式：模拟下单 → 支付成功 → 积分到账
 * 真实环境：后端创建订单 → 微信支付 → 前端轮询订单状态
 * 开发模式（USE_MOCK=false 但后端返回 mock 支付参数）：
 *   创建订单 → 调用后端模拟确认接口 → 轮询订单状态
 */

/** 判断是否为 mock 支付参数 */
function isMockPayParams(payParams: PaymentOrder['payParams']): boolean {
  return payParams.paySign === 'mock_sign' || payParams.package === 'prepay_id=mock_prepay'
}

/** 开发模式模拟支付确认 */
async function mockConfirmPay(orderId: string): Promise<PaymentResult> {
  return request<PaymentResult>({
    url: '/payment/mock-confirm',
    method: 'POST',
    data: { orderId },
  })
}

/**
 * 创建积分充值订单
 *
 * @param amount 充值金额（元）
 * @returns 支付订单信息（含微信支付参数）
 */
export async function createRechargeOrder(amount: number): Promise<PaymentOrder> {
  if (USE_MOCK) {
    return mockCreateRechargeOrder(amount)
  }

  return request<PaymentOrder>({
    url: '/payment/recharge/create',
    method: 'POST',
    data: { amount },
  })
}

/**
 * 创建 VIP 订阅订单
 *
 * @param planType 套餐类型
 * @returns 支付订单信息
 */
export async function createVipOrder(
  planType: 'monthly' | 'quarterly' | 'yearly',
): Promise<PaymentOrder> {
  if (USE_MOCK) {
    return mockCreateVipOrder(planType)
  }

  return request<PaymentOrder>({
    url: '/payment/vip/create',
    method: 'POST',
    data: { planType },
  })
}

/**
 * 查询订单支付状态
 *
 * @param orderId 订单 ID
 * @returns 支付结果
 */
export async function queryOrderStatus(orderId: string): Promise<PaymentResult> {
  if (USE_MOCK) {
    return mockQueryOrderStatus(orderId)
  }

  return request<PaymentResult>({
    url: `/payment/order/${orderId}`,
    method: 'GET',
  })
}

/**
 * 调起微信支付
 * 完整流程：创建订单 → 调起支付 → 轮询订单状态
 *
 * @param amount 充值金额（元）
 * @param onPaid 支付成功回调
 * @returns 支付结果
 */
export async function payRecharge(
  amount: number,
  onPaid?: (credits: number) => void,
): Promise<{ success: boolean; credits?: number; errorMessage?: string }> {
  try {
    // 1. 创建订单
    const order = await createRechargeOrder(amount)

    if (USE_MOCK) {
      // Mock 模式：直接模拟支付成功
      const result = await mockPayAndConfirm(order)
      onPaid?.(result.credits!)
      return { success: true, credits: result.credits }
    }

    // 开发模式：后端返回 mock 支付参数时，走模拟确认流程
    if (isMockPayParams(order.payParams)) {
      const result = await mockConfirmPay(order.orderId)
      if (result.status === 'paid') {
        onPaid?.(result.credits || 0)
        return { success: true, credits: result.credits }
      }
      return { success: false, errorMessage: '支付确认失败' }
    }

    // 2. 调起微信支付
    await Taro.requestPayment({
      timeStamp: order.payParams.timeStamp,
      nonceStr: order.payParams.nonceStr,
      package: order.payParams.package,
      signType: order.payParams.signType as 'MD5' | 'HMAC-SHA256' | 'RSA',
      paySign: order.payParams.paySign,
    })

    // 3. 轮询订单状态（支付回调可能延迟）
    const result = await pollOrderStatus(order.orderId)

    if (result.status === 'paid') {
      onPaid?.(result.credits || 0)
      return { success: true, credits: result.credits }
    }

    return { success: false, errorMessage: '支付未确认，请稍后查看' }
  } catch (err) {
    // 用户取消支付
    if (err instanceof Error && err.message.includes('cancel')) {
      return { success: false, errorMessage: '已取消支付' }
    }
    return {
      success: false,
      errorMessage: err instanceof Error ? err.message : '支付失败',
    }
  }
}

/**
 * 轮询订单状态
 * 支付完成后微信可能延迟回调后端，前端主动轮询确认
 */
async function pollOrderStatus(
  orderId: string,
  maxAttempts = 5,
  interval = 1500,
): Promise<PaymentResult> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await queryOrderStatus(orderId)
    if (result.status === 'paid') return result
    if (result.status === 'failed' || result.status === 'closed') return result
    await new Promise((resolve) => setTimeout(resolve, interval))
  }

  return { orderId, status: 'pending' as PaymentStatus }
}

/* ==================== Mock 实现 ==================== */

/** Mock 订单存储 */
interface MockOrder {
  orderId: string
  amount: number
  credits: number
  status: PaymentStatus
  createdAt: number
}

const mockOrderStore = new Map<string, MockOrder>()

/** Mock: 创建充值订单 */
async function mockCreateRechargeOrder(amount: number): Promise<PaymentOrder> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const orderId = `order_${Date.now()}`
  const credits = Math.floor(amount * 10)

  mockOrderStore.set(orderId, {
    orderId,
    amount,
    credits,
    status: 'pending',
    createdAt: Date.now(),
  })

  return {
    orderId,
    payParams: {
      timeStamp: String(Math.floor(Date.now() / 1000)),
      nonceStr: 'mock_nonce',
      package: 'prepay_id=mock_prepay',
      signType: 'MD5',
      paySign: 'mock_sign',
    },
    amount,
    credits,
  }
}

/** Mock: 创建 VIP 订单 */
async function mockCreateVipOrder(planType: string): Promise<PaymentOrder> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const priceMap: Record<string, number> = { monthly: 49, quarterly: 139, yearly: 399 }
  const creditsMap: Record<string, number> = { monthly: 1000, quarterly: 3000, yearly: 10000 }
  const price = priceMap[planType] || 49
  const credits = creditsMap[planType] || 1000
  const orderId = `vip_order_${Date.now()}`

  mockOrderStore.set(orderId, {
    orderId,
    amount: price,
    credits,
    status: 'pending',
    createdAt: Date.now(),
  })

  return {
    orderId,
    payParams: {
      timeStamp: String(Math.floor(Date.now() / 1000)),
      nonceStr: 'mock_nonce',
      package: 'prepay_id=mock_prepay',
      signType: 'MD5',
      paySign: 'mock_sign',
    },
    amount: price,
    credits,
  }
}

/** Mock: 查询订单状态 */
async function mockQueryOrderStatus(orderId: string): Promise<PaymentResult> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const order = mockOrderStore.get(orderId)
  if (!order) {
    return { orderId, status: 'closed' }
  }
  return { orderId, status: order.status, credits: order.credits }
}

/** Mock: 模拟支付并确认 */
async function mockPayAndConfirm(order: PaymentOrder): Promise<{ success: boolean; credits: number }> {
  await new Promise((resolve) => setTimeout(resolve, 800))

  // 模拟支付成功
  const mockOrder = mockOrderStore.get(order.orderId)
  if (mockOrder) {
    mockOrder.status = 'paid'
  }

  return { success: true, credits: order.credits }
}
