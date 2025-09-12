/**
 * API路由错误处理中间件
 * 为Next.js API路由提供统一的错误处理
 */

import { NextRequest, NextResponse } from 'next/server'
import { globalErrorHandler, handleError } from '@/lib/errors/global-error-handler'

// API路由错误处理中间件
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse> | NextResponse
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('API Error:', error)
      
      // 提取请求信息
      const request = args[0] as NextRequest
      const requestId = request.headers.get('x-request-id') || 
                       request.headers.get('x-correlation-id') ||
                       `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      return handleError(error, {
        request,
        requestId
      })
    }
  }
}

// GET请求错误处理
export function withGetErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse> | NextResponse
) {
  return withErrorHandler(handler)
}

// POST请求错误处理
export function withPostErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse> | NextResponse
) {
  return withErrorHandler(handler)
}

// PUT请求错误处理
export function withPutErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse> | NextResponse
) {
  return withErrorHandler(handler)
}

// DELETE请求错误处理
export function withDeleteErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse> | NextResponse
) {
  return withErrorHandler(handler)
}

// 数据库操作错误处理
export function withDatabaseErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse> | NextResponse
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('Database Error:', error)
      
      const request = args[0] as NextRequest
      const requestId = request.headers.get('x-request-id') || 
                       `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // 特殊处理数据库错误
      if (error && typeof error === 'object' && 'name' in error) {
        const dbError = error as any
        if (dbError.name?.includes('Sequelize')) {
          return handleError(error, {
            request,
            requestId
          })
        }
      }

      return handleError(error, {
        request,
        requestId
      })
    }
  }
}

// 验证错误处理
export function withValidationErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse> | NextResponse
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('Validation Error:', error)
      
      const request = args[0] as NextRequest
      const requestId = request.headers.get('x-request-id') || 
                       `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      return handleError(error, {
        request,
        requestId
      })
    }
  }
}

// 认证错误处理
export function withAuthErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse> | NextResponse
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('Auth Error:', error)
      
      const request = args[0] as NextRequest
      const requestId = request.headers.get('x-request-id') || 
                       `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      return handleError(error, {
        request,
        requestId
      })
    }
  }
}

// 文件上传错误处理
export function withUploadErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse> | NextResponse
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('Upload Error:', error)
      
      const request = args[0] as NextRequest
      const requestId = request.headers.get('x-request-id') || 
                       `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      return handleError(error, {
        request,
        requestId
      })
    }
  }
}

// 外部API调用错误处理
export function withExternalApiErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse> | NextResponse
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('External API Error:', error)
      
      const request = args[0] as NextRequest
      const requestId = request.headers.get('x-request-id') || 
                       `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      return handleError(error, {
        request,
        requestId
      })
    }
  }
}

// 通用错误处理装饰器
export function handleApiError<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse> | NextResponse,
  options?: {
    logLevel?: 'debug' | 'info' | 'warn' | 'error'
    includeStack?: boolean
    customErrorHandler?: (error: unknown, context: any) => NextResponse
  }
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      const { logLevel = 'error', includeStack = false, customErrorHandler } = options || {}
      
      // 使用自定义错误处理器
      if (customErrorHandler) {
        const request = args[0] as NextRequest
        const requestId = request.headers.get('x-request-id') || 
                         `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        return customErrorHandler(error, { request, requestId })
      }

      // 记录日志
      const logMessage = includeStack && error instanceof Error 
        ? `${error.message}\n${error.stack}` 
        : error instanceof Error ? error.message : String(error)
      
      switch (logLevel) {
        case 'debug':
          console.debug('API Debug:', logMessage)
          break
        case 'info':
          console.info('API Info:', logMessage)
          break
        case 'warn':
          console.warn('API Warning:', logMessage)
          break
        case 'error':
        default:
          console.error('API Error:', logMessage)
          break
      }

      const request = args[0] as NextRequest
      const requestId = request.headers.get('x-request-id') || 
                       `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      return handleError(error, {
        request,
        requestId
      })
    }
  }
}

// 错误处理工具函数
export const errorUtils = {
  // 检查是否为特定类型的错误
  isAppError: (error: unknown): error is import('@/lib/errors/global-error-handler').AppError => {
    return error instanceof Error && 'type' in error && 'code' in error
  },

  // 检查是否为验证错误
  isValidationError: (error: unknown): boolean => {
    return error instanceof Error && error.name === 'ZodError'
  },

  // 检查是否为数据库错误
  isDatabaseError: (error: unknown): boolean => {
    return error instanceof Error && error.name?.includes('Sequelize')
  },

  // 检查是否为网络错误
  isNetworkError: (error: unknown): boolean => {
    return error instanceof TypeError && error.message.includes('fetch')
  },

  // 获取错误消息
  getErrorMessage: (error: unknown): string => {
    if (error instanceof Error) {
      return error.message
    }
    return String(error)
  },

  // 获取错误堆栈
  getErrorStack: (error: unknown): string | undefined => {
    if (error instanceof Error) {
      return error.stack
    }
    return undefined
  }
}

