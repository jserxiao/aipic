import { useState } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useUserStore } from '@/store/userStore'
import { payRecharge } from '@/services/payment'
import './index.scss'

/** 充值套餐 */
interface RechargePlan {
  price: number
  credits: number
  isCustom?: boolean
}

/** 预设套餐 */
const RECHARGE_PLANS: RechargePlan[] = [
  { price: 10, credits: 100 },
  { price: 30, credits: 300 },
  { price: 50, credits: 500 },
  { price: 100, credits: 1000 },
  { price: 500, credits: 5000 },
  { price: 1000, credits: 10000 },
  { price: 0, credits: 0, isCustom: true },
]

/** 自定义充值金额范围 */
const MIN_CUSTOM = 1
const MAX_CUSTOM = 10000

/** 根据金额计算积分（1元=10积分） */
function priceToCredits(price: number): number {
  return Math.floor(price * 10)
}

export default function Recharge() {
  const { addCredits } = useUserStore()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [customAmount, setCustomAmount] = useState('')
  const [paying, setPaying] = useState(false)

  const selectedPlan = RECHARGE_PLANS[selectedIndex]
  const isCustom = selectedPlan.isCustom

  // 计算实际充值金额和积分
  let actualPrice = 0
  let actualCredits = 0

  if (isCustom) {
    const amount = parseInt(customAmount) || 0
    if (amount >= MIN_CUSTOM && amount <= MAX_CUSTOM) {
      actualPrice = amount
      actualCredits = priceToCredits(amount)
    }
  } else {
    actualPrice = selectedPlan.price
    actualCredits = selectedPlan.credits
  }

  const canPurchase = actualPrice > 0 && actualCredits > 0 && !paying

  const handleSelect = (index: number) => {
    setSelectedIndex(index)
  }

  const handleCustomInput = (e: { detail: { value: string } }) => {
    let val = e.detail.value.replace(/[^\d]/g, '')
    const num = parseInt(val) || 0
    if (num > MAX_CUSTOM) {
      val = String(MAX_CUSTOM)
    }
    setCustomAmount(val)
  }

  const handlePurchase = async () => {
    if (!canPurchase) {
      Taro.showToast({ title: '请选择或输入充值金额', icon: 'none' })
      return
    }

    setPaying(true)

    try {
      const result = await payRecharge(actualPrice, (credits) => {
        // 支付成功，增加积分
        addCredits(credits)
      })

      if (result.success) {
        Taro.showToast({
          title: `充值成功 +${result.credits}积分`,
          icon: 'success',
          duration: 1500,
        })
        // 延迟返回
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      } else {
        // 用户取消或支付未确认
        if (result.errorMessage !== '已取消支付') {
          Taro.showToast({
            title: result.errorMessage || '支付失败',
            icon: 'none',
          })
        }
      }
    } catch (err) {
      Taro.showToast({
        title: err instanceof Error ? err.message : '支付失败',
        icon: 'none',
      })
    } finally {
      setPaying(false)
    }
  }

  return (
    <View className='recharge-page'>
      {/* 顶部余额展示 */}
      <View className='recharge-page__header'>
        <Text className='recharge-page__header-title'>积分充值</Text>
        <Text className='recharge-page__header-desc'>1 元 = 10 积分</Text>
      </View>

      {/* 套餐网格 */}
      <View className='recharge-page__grid'>
        {RECHARGE_PLANS.map((plan, index) => {
          const isActive = selectedIndex === index
          return (
            <View
              key={plan.isCustom ? 'custom' : plan.price}
              className={`recharge-page__card ${isActive ? 'recharge-page__card--active' : ''}`}
              onClick={() => handleSelect(index)}
            >
              {plan.isCustom ? (
                <View className='recharge-page__card-custom'>
                  <Text className='recharge-page__card-custom-text'>自定义</Text>
                </View>
              ) : (
                <View className='recharge-page__card-preset'>
                  <Text className='recharge-page__card-price'>
                    <Text className='recharge-page__card-currency'>¥</Text>
                    {plan.price}
                  </Text>
                  <Text className='recharge-page__card-credits'>
                    {plan.credits} 积分
                  </Text>
                </View>
              )}
            </View>
          )
        })}
      </View>

      {/* 自定义金额输入 */}
      {isCustom && (
        <View className='recharge-page__custom'>
          <Text className='recharge-page__custom-label'>输入充值金额</Text>
          <View className='recharge-page__custom-input-wrapper'>
            <Text className='recharge-page__custom-currency'>¥</Text>
            <Input
              className='recharge-page__custom-input'
              type='number'
              placeholder={`${MIN_CUSTOM} - ${MAX_CUSTOM}`}
              value={customAmount}
              onInput={handleCustomInput}
              maxlength={5}
            />
          </View>
          {actualCredits > 0 && (
            <Text className='recharge-page__custom-credits'>
              可获得 {actualCredits} 积分
            </Text>
          )}
        </View>
      )}

      {/* 底部购买按钮 */}
      <View className='recharge-page__footer'>
        <View className='recharge-page__footer-info'>
          <Text className='recharge-page__footer-label'>充值积分</Text>
          <Text className='recharge-page__footer-credits'>
            {actualCredits > 0 ? `${actualCredits} 积分` : '请选择套餐'}
          </Text>
        </View>
        <View
          className={`recharge-page__buy-btn ${!canPurchase ? 'recharge-page__buy-btn--disabled' : ''}`}
          onClick={handlePurchase}
        >
          <Text className='recharge-page__buy-btn-text'>
            {paying ? '支付中...' : `¥${actualPrice > 0 ? actualPrice : '--'} 立即充值`}
          </Text>
        </View>
      </View>
    </View>
  )
}
