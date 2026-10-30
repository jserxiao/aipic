export default {
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
