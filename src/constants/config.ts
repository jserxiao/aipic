import type { AIModelOption, AIModelType } from '@/types/generate'

/**
 * 全局配置常量
 */

/** 每日最大生成张数 */
export const MAX_DAILY_GENERATE = 30;

/** 每次生成消耗积分（默认） */
export const CREDITS_PER_GENERATE = 10;

/** AI 模型选项 */
export const AI_MODEL_OPTIONS: AIModelOption[] = [
  {
    value: 'qwen-image-3.0',
    label: 'Qwen-Image-3.0',
    description: '通义千问图像生成模型',
    creditsCost: 18,
  },
];

/** 默认选中的模型 */
export const DEFAULT_MODEL: AIModelType = 'qwen-image-3.0';

/** 根据模型获取消耗积分 */
export function getModelCreditsCost(model: AIModelType): number {
  const option = AI_MODEL_OPTIONS.find((o) => o.value === model);
  return option ? option.creditsCost : CREDITS_PER_GENERATE;
}

/** 小程序版本号 */
export const APP_VERSION = '1.0.0';

/** 描述文字最大长度 */
export const MAX_PROMPT_LENGTH = 500;

/** 描述文字最小长度 */
export const MIN_PROMPT_LENGTH = 2;

/** 最大参考图数量 */
export const MAX_REFERENCE_IMAGES = 1;

/** Copyright 信息 */
export const COPYRIGHT_TEXT = '© 2026 一键绘图. All rights reserved.';

/** 图片比例选项 */
export const RATIO_OPTIONS = [
  { label: '1:1', value: '1:1', width: 1, height: 1 },
  { label: '3:4', value: '3:4', width: 3, height: 4 },
  { label: '4:3', value: '4:3', width: 4, height: 3 },
  { label: '16:9', value: '16:9', width: 16, height: 9 },
  { label: '9:16', value: '9:16', width: 9, height: 16 },
] as const;

/** 分辨率选项 */
export const RESOLUTION_OPTIONS = [
  { label: '512 × 512', value: '512x512', width: 512, height: 512 },
  { label: '768 × 768', value: '768x768', width: 768, height: 768 },
  { label: '1024 × 1024', value: '1024x1024', width: 1024, height: 1024 },
  { label: '自定义', value: 'custom', width: 0, height: 0 },
] as const;

/** 本地存储 Key */
export const STORAGE_KEYS = {
  USER_INFO: 'aipic_user_info',
  GENERATE_RECORDS: 'aipic_generate_records',
  TODAY_COUNT: 'aipic_today_count',
  TODAY_DATE: 'aipic_today_date',
  AUTH_TOKEN: 'aipic_auth_token',
  REFRESH_TOKEN: 'aipic_refresh_token',
  PROMPT_DRAFT: 'aipic_prompt_draft',
} as const;
