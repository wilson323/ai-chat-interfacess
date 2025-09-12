/**
 * 错误监控和统计API
 * 提供错误日志查看和统计功能
 */

import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '@/lib/middleware/error-handler'
import { globalErrorHandler } from '@/lib/errors/global-error-handler'
import { z } from 'zod'

// 查询参数验证
const querySchema = z.object({
  type: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

// 获取错误统计
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const query = querySchema.parse(Object.fromEntries(searchParams))

  const stats = globalErrorHandler.getErrorStats()
  
  // 应用过滤条件
  let filteredErrors = stats.recent

  if (query.type) {
    filteredErrors = filteredErrors.filter(error => error.type === query.type)
  }

  if (query.severity) {
    filteredErrors = filteredErrors.filter(error => error.severity === query.severity)
  }

  if (query.startDate) {
    const startDate = new Date(query.startDate)
    filteredErrors = filteredErrors.filter(error => new Date(error.timestamp) >= startDate)
  }

  if (query.endDate) {
    const endDate = new Date(query.endDate)
    filteredErrors = filteredErrors.filter(error => new Date(error.timestamp) <= endDate)
  }

  // 应用分页
  const limit = query.limit || 50
  const offset = query.offset || 0
  const paginatedErrors = filteredErrors.slice(offset, offset + limit)

  return NextResponse.json({
    success: true,
    data: {
      stats: {
        total: stats.total,
        byType: stats.byType,
        bySeverity: stats.bySeverity
      },
      errors: paginatedErrors,
      pagination: {
        limit,
        offset,
        total: filteredErrors.length,
        hasMore: offset + limit < filteredErrors.length
      }
    }
  })
})

// 清理错误日志
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const confirm = searchParams.get('confirm')

  if (confirm !== 'true') {
    throw new Error('Confirmation required to clear error logs')
  }

  globalErrorHandler.clearErrorLog()

  return NextResponse.json({
    success: true,
    data: { message: 'Error logs cleared successfully' }
  })
})

// 导出错误日志
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json()
  const { format = 'json', includeStack = false } = body

  const stats = globalErrorHandler.getErrorStats()
  
  let exportData: any

  switch (format) {
    case 'csv':
      exportData = stats.recent.map(error => ({
        timestamp: error.timestamp,
        type: error.type,
        code: error.code,
        message: error.message,
        severity: error.severity,
        requestId: error.requestId,
        userId: error.userId,
        url: error.context?.url,
        method: error.context?.method,
        userAgent: error.context?.userAgent,
        ip: error.context?.ip,
        stack: includeStack ? error.stack : undefined
      }))
      break
    case 'json':
    default:
      exportData = {
        exportedAt: new Date().toISOString(),
        totalErrors: stats.total,
        errors: stats.recent.map(error => ({
          ...error,
          stack: includeStack ? error.stack : undefined
        }))
      }
      break
  }

  return NextResponse.json({
    success: true,
    data: {
      format,
      exportedAt: new Date().toISOString(),
      totalErrors: stats.total,
      exportData
    }
  })
})

