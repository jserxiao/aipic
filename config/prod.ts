export default {
  defineConstants: {
    // 生产环境 API 地址
    // process.env.TARO_APP_API_BASE: '"https://api.aipic.example.com"',
    // process.env.TARO_APP_USE_MOCK: '"false"',
  },
  mini: {},
  h5: {
    /**
     * 如果 h5 端编译后体积过大，可以使用 webpack-bundle-analyzer 分析打包体积
     */
    // webpackChain (chain) {
    //   chain.plugin('analyzer')
    //     .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [])
    // }
  }
}
