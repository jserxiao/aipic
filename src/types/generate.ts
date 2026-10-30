/** 图片比例类型 */
export type RatioType = '1:1' | '3:4' | '4:3' | '16:9' | '9:16';

/** 分辨率类型 */
export type ResolutionType = '512x512' | '768x768' | '1024x1024' | 'custom';

/** 生成配置 */
export interface GenerateConfig {
  /** 文字描述 */
  prompt: string;
  /** 图片比例 */
  ratio: RatioType;
  /** 分辨率 */
  resolution: ResolutionType;
  /** 自定义宽（resolution 为 custom 时） */
  customWidth?: number;
  /** 自定义高（resolution 为 custom 时） */
  customHeight?: number;
  /** 参考图 URL（可选） */
  referenceImage?: string;
}

/** 生成状态 */
export type GenerateStatus = 'pending' | 'success' | 'failed';

/** 生成记录 */
export interface GenerateRecord {
  /** 记录 ID */
  id: string;
  /** 描述文字 */
  prompt: string;
  /** 比例 */
  ratio: RatioType;
  /** 分辨率 */
  resolution: string;
  /** 生成图片 URL */
  imageUrl: string;
  /** 生成状态 */
  status: GenerateStatus;
  /** 生成时间（ISO 字符串） */
  createdAt: string;
  /** 消耗积分 */
  creditsCost: number;
}

/** 生成结果 */
export interface GenerateResult {
  success: boolean;
  record?: GenerateRecord;
  errorMessage?: string;
}
