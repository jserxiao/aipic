import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import './app.scss'

function App({ children }: PropsWithChildren<Record<string, unknown>>) {
  useLaunch(() => {
    console.log('AIPic 小程序启动')
  })

  return children
}

export default App
