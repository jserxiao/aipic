export default {
  logger: {
    quiet: false,
    stats: true
  },
  defineConstants: {
    // 开发环境 API 地址（不设置则自动进入 Mock 模式）
    // 设置后将使用真实 API
    // process.env.TARO_APP_API_BASE: '"https://dev-api.aipic.example.com"',
    // process.env.TARO_APP_USE_MOCK: '"true"',
  },
  mini: {},
  h5: {}
}
