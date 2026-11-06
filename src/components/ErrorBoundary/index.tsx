import { Component, PropsWithChildren, ReactNode } from 'react'
import { View, Text, Button } from '@tarojs/components'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  /** 自定义错误展示 */
  fallback?: (error: Error, reset: () => void) => ReactNode
  /** 错误上报回调 */
  onError?: (error: Error, errorInfo: unknown) => void
}

/**
 * 全局错误边界组件
 * 捕获子组件渲染时的 JavaScript 错误，防止白屏
 */
export default class ErrorBoundary extends Component<
  PropsWithChildren<ErrorBoundaryProps>,
  ErrorBoundaryState
> {
  constructor(props: PropsWithChildren<ErrorBoundaryProps>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset)
      }

      // 默认错误展示
      return (
        <View className='error-boundary'>
          <View className='error-boundary__icon'>
            <View className='error-boundary__icon-line error-boundary__icon-line--1' />
            <View className='error-boundary__icon-line error-boundary__icon-line--2' />
          </View>
          <Text className='error-boundary__title'>页面出错了</Text>
          <Text className='error-boundary__desc'>
            {this.state.error.message || '发生未知错误'}
          </Text>
          <Button
            className='error-boundary__btn'
            onClick={this.handleReset}
          >
            重新加载
          </Button>
        </View>
      )
    }

    return this.props.children
  }
}
