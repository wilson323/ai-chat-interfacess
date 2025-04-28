"use client"
import React from "react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 可以上报错误到监控平台
    if (process.env.NODE_ENV !== 'production') {
      console.error("[ErrorBoundary] 捕获渲染异常:", error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500 text-xs whitespace-pre-wrap p-2 bg-red-50 dark:bg-red-900/10 rounded-md">
          <div>渲染出错: {this.state.error?.message}</div>
          {this.state.error?.stack && (
            <details className="mt-1">
              <summary>错误堆栈</summary>
              <pre>{this.state.error.stack}</pre>
            </details>
          )}
          {this.props.fallback}
        </div>
      )
    }
    return this.props.children
  }
} 