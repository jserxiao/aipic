export default defineAppConfig({
  pages: [
    'pages/generate/index',
    'pages/mine/index'
  ],
  subPackages: [
    {
      root: 'pages/history',
      pages: [
        'index'
      ]
    },
    {
      root: 'pages/recharge',
      pages: [
        'index'
      ]
    }
  ],
  // 分包预下载：进入主包页面时预加载分包
  preloadRule: {
    'pages/generate/index': {
      network: 'all',
      packages: ['pages/history', 'pages/recharge'],
    },
    'pages/mine/index': {
      network: 'all',
      packages: ['pages/history', 'pages/recharge'],
    },
  },
  lazyCodeLoading: 'requiredComponents',
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '一键绘图',
    navigationBarTextStyle: 'black',
    backgroundColor: '#FFFFFF'
  },
  tabBar: {
    custom: true,
    color: '#999999',
    selectedColor: '#000000',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/generate/index',
        text: '生成'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
