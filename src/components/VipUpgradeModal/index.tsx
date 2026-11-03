import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import './index.scss'

/** 会员套餐类型 */
export type VipPlanType = 'monthly' | 'quarterly' | 'yearly'

/** 会员套餐配置 */
export interface VipPlan {
  type: VipPlanType
  name: string
  price: number
  bonusCredits: number
  description: string
}

/** 预设套餐列表 */
const VIP_PLANS: VipPlan[] = [
  {
    type: 'monthly',
    name: '月卡',
    price: 49,
    bonusCredits: 1000,
    description: '每月自动续费',
  },
  {
    type: 'quarterly',
    name: '季卡',
    price: 139,
    bonusCredits: 3000,
    description: '每季自动续费',
  },
  {
    type: 'yearly',
    name: '年卡',
    price: 399,
    bonusCredits: 10000,
    description: '每年自动续费',
  },
]

interface VipUpgradeModalProps {
  /** 是否显示 */
  visible: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 确认开通回调 */
  onConfirm: (plan: VipPlan) => void
  /** 是否为VIP */
  isVip?: boolean
  /** VIP到期时间（已格式化的字符串） */
  vipExpireText?: string | null
}

export default function VipUpgradeModal({
  visible,
  onClose,
  onConfirm,
  isVip = false,
  vipExpireText = null,
}: VipUpgradeModalProps) {
  const [animVisible, setAnimVisible] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<VipPlanType>('monthly')

  useEffect(() => {
    if (visible) {
      setTimeout(() => setAnimVisible(true), 16)
    } else {
      setAnimVisible(false)
    }
  }, [visible])

  if (!visible) return null

  const currentPlan = VIP_PLANS.find((p) => p.type === selectedPlan) || VIP_PLANS[0]

  const handleConfirm = () => {
    onConfirm(currentPlan)
    onClose()
  }

  return (
    <View className={`vip-upgrade ${animVisible ? 'vip-upgrade--show' : ''}`}>
      {/* 遮罩层 */}
      <View className='vip-upgrade__mask' onClick={onClose} />

      {/* 底部弹窗面板 */}
      <View className='vip-upgrade__panel'>
        {/* 顶部拖拽指示条 */}
        <View className='vip-upgrade__handle' />

        {/* 关闭按钮 */}
        <View className='vip-upgrade__close-btn' onClick={onClose}>
          <View className='vip-upgrade__close-icon' />
        </View>

        <ScrollView scrollY className='vip-upgrade__scroll'>
          {/* 金黄色标题 */}
          <View className='vip-upgrade__header'>
            <Text className='vip-upgrade__title'>升级VIP可享多重权益</Text>
            {isVip && vipExpireText && (
              <Text className='vip-upgrade__expire'>
                当前会员到期：{vipExpireText}
              </Text>
            )}
          </View>

          {/* 权益提示区域 */}
          <View className='vip-upgrade__benefits'>
            <View className='vip-upgrade__benefit-item'>
              <View className='vip-upgrade__benefit-icon vip-upgrade__benefit-icon--gift' />
              <Text className='vip-upgrade__benefit-text'>赠送积分</Text>
            </View>
            <View className='vip-upgrade__benefit-divider' />
            <View className='vip-upgrade__benefit-item'>
              <View className='vip-upgrade__benefit-icon vip-upgrade__benefit-icon--star' />
              <Text className='vip-upgrade__benefit-text'>额外积分</Text>
            </View>
            <View className='vip-upgrade__benefit-divider' />
            <View className='vip-upgrade__benefit-item'>
              <View className='vip-upgrade__benefit-icon vip-upgrade__benefit-icon--crown' />
              <Text className='vip-upgrade__benefit-text'>VIP专线</Text>
            </View>
          </View>

          {/* 套餐选择列表 */}
          <View className='vip-upgrade__plans'>
            {VIP_PLANS.map((plan) => {
              const isActive = selectedPlan === plan.type
              return (
                <View
                  key={plan.type}
                  className={`vip-upgrade__plan ${isActive ? 'vip-upgrade__plan--active' : ''}`}
                  onClick={() => setSelectedPlan(plan.type)}
                >
                  {/* 左侧信息 */}
                  <View className='vip-upgrade__plan-info'>
                    <Text className='vip-upgrade__plan-name'>{plan.name}</Text>
                    <Text className='vip-upgrade__plan-desc'>{plan.description}</Text>
                    <View className='vip-upgrade__plan-bonus'>
                      <Text className='vip-upgrade__plan-bonus-label'>送</Text>
                      <Text className='vip-upgrade__plan-bonus-value'>
                        {plan.bonusCredits >= 10000
                          ? `${plan.bonusCredits / 10000}万`
                          : plan.bonusCredits}
                      </Text>
                      <Text className='vip-upgrade__plan-bonus-unit'>积分</Text>
                    </View>
                  </View>

                  {/* 右侧价格 */}
                  <View className='vip-upgrade__plan-price'>
                    <Text className='vip-upgrade__plan-currency'>¥</Text>
                    <Text className='vip-upgrade__plan-amount'>{plan.price}</Text>
                  </View>

                  {/* 选中标识 */}
                  {isActive && (
                    <View className='vip-upgrade__plan-check'>
                      <View className='vip-upgrade__check-mark' />
                    </View>
                  )}
                </View>
              )
            })}
          </View>
        </ScrollView>

        {/* 底部立即开通按钮 */}
        <View className='vip-upgrade__footer'>
          <View className='vip-upgrade__confirm-btn' onClick={handleConfirm}>
            <Text className='vip-upgrade__confirm-text'>立即开通</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
