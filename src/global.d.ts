/// <reference types="@tarojs/taro" />

declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.svg'

declare namespace NodeJS {
  interface ProcessEnv {
    /** API 基础地址 */
    TARO_APP_API_BASE: string
    /** 是否使用 Mock 模式 */
    TARO_APP_USE_MOCK: string
  }
}
