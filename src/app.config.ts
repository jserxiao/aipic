export default defineAppConfig({
  pages: [
    'pages/generate/index',
    'pages/mine/index',
    'pages/history/index'
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: 'AIPic',
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
