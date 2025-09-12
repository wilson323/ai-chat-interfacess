/**
 * API路由错误处理示例
 * 展示如何使用全局错误处理系统
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  withErrorHandler, 
  withDatabaseErrorHandler,
  withValidationErrorHandler,
  withAuthErrorHandler 
} from '@/lib/middleware/error-handler'
import { 
  ValidationError, 
  NotFoundError, 
  DatabaseError,
  AuthenticationError 
} from '@/lib/errors/global-error-handler'
import { z } from 'zod'

// 示例：基础错误处理
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    throw new ValidationError('ID parameter is required')
  }

  if (id === 'not-found') {
    throw new NotFoundError('User')
  }

  if (id === 'server-error') {
    throw new Error('Internal server error')
  }

  return NextResponse.json({
    success: true,
    data: { id, message: 'Success' }
  })
})

// 示例：数据库错误处理
export const POST = withDatabaseErrorHandler(async (request: NextRequest) => {
  const body = await request.json()

  // 模拟数据库操作
  if (body.email === 'duplicate@example.com') {
    const dbError = new Error('Duplicate entry')
    dbError.name = 'SequelizeUniqueConstraintError'
    throw dbError
  }

  if (body.email === 'connection-error@example.com') {
    const dbError = new Error('Connection failed')
    dbError.name = 'SequelizeConnectionError'
    throw dbError
  }

  return NextResponse.json({
    success: true,
    data: { message: 'User created successfully' }
  })
})

// 示例：验证错误处理
export const PUT = withValidationErrorHandler(async (request: NextRequest) => {
  const body = await request.json()

  // 使用Zod进行验证
  const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    age: z.number().min(0, 'Age must be positive')
  })

  try {
    const validatedData = schema.parse(body)
    return NextResponse.json({
      success: true,
      data: validatedData
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error // 会被withValidationErrorHandler捕获
    }
    throw error
  }
})

// 示例：认证错误处理
export const DELETE = withAuthErrorHandler(async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader) {
    throw new AuthenticationError('Authorization header is required')
  }

  if (authHeader !== 'Bearer valid-token') {
    throw new AuthenticationError('Invalid token')
  }

  return NextResponse.json({
    success: true,
    data: { message: 'Resource deleted successfully' }
  })
})

// 示例：自定义错误处理
export const PATCH = handleApiError(
  async (request: NextRequest) => {
    const body = await request.json()

    if (body.type === 'custom-error') {
      throw new Error('This is a custom error')
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Custom operation completed' }
    })
  },
  {
    logLevel: 'warn',
    includeStack: true,
    customErrorHandler: (error, context) => {
      return NextResponse.json({
        success: false,
        error: {
          type: 'CUSTOM_ERROR',
          code: 'CUSTOM_ERROR',
          message: 'Custom error handler triggered'
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: context.requestId
        }
      }, { status: 400 })
    }
  }
)

