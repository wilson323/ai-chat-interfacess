/**
 * API响应工具测试
 * 测试统一响应格式和错误处理
 */

import { 
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  createValidationErrorResponse,
  createAuthErrorResponse,
  createPermissionErrorResponse,
  createNotFoundErrorResponse,
  createInternalErrorResponse,
  createRateLimitErrorResponse,
  createBusinessErrorResponse,
  createExternalServiceErrorResponse,
  createDatabaseErrorResponse,
  createStorageErrorResponse,
  ResponseUtils,
  ApiErrorCode
} from '@/lib/api/response'

describe('API Response Utils', () => {
  describe('createSuccessResponse', () => {
    it('应该创建成功响应', () => {
      const data = { id: 1, name: 'Test' }
      const response = createSuccessResponse(data, '操作成功')
      
      expect(response.status).toBe(200)
      
      const body = response.json()
      expect(body.success).toBe(true)
      expect(body.data).toEqual(data)
      expect(body.message).toBe('操作成功')
      expect(body.meta).toBeDefined()
      expect(body.meta.timestamp).toBeDefined()
      expect(body.meta.requestId).toBeDefined()
    })

    it('应该创建带分页的成功响应', () => {
      const data = [{ id: 1 }, { id: 2 }]
      const pagination = {
        page: 1,
        limit: 20,
        total: 100,
        totalPages: 5,
        hasNext: true,
        hasPrev: false
      }
      
      const response = createPaginatedResponse(data, pagination, '获取成功')
      
      expect(response.status).toBe(200)
      
      const body = response.json()
      expect(body.success).toBe(true)
      expect(body.data).toEqual(data)
      expect(body.meta.pagination).toEqual(pagination)
    })
  })

  describe('createErrorResponse', () => {
    it('应该创建验证错误响应', () => {
      const errors = [
        { field: 'name', message: '名称不能为空' },
        { field: 'email', message: '邮箱格式不正确' }
      ]
      
      const response = createValidationErrorResponse(errors)
      
      expect(response.status).toBe(400)
      
      const body = response.json()
      expect(body.success).toBe(false)
      expect(body.error.code).toBe(ApiErrorCode.VALIDATION_ERROR)
      expect(body.error.message).toBe('请求参数验证失败')
      expect(body.error.details).toEqual(errors)
    })

    it('应该创建认证错误响应', () => {
      const response = createAuthErrorResponse('认证失败')
      
      expect(response.status).toBe(401)
      
      const body = response.json()
      expect(body.success).toBe(false)
      expect(body.error.code).toBe(ApiErrorCode.AUTHENTICATION_ERROR)
      expect(body.error.message).toBe('认证失败')
    })

    it('应该创建权限错误响应', () => {
      const response = createPermissionErrorResponse('权限不足')
      
      expect(response.status).toBe(403)
      
      const body = response.json()
      expect(body.success).toBe(false)
      expect(body.error.code).toBe(ApiErrorCode.AUTHORIZATION_ERROR)
      expect(body.error.message).toBe('权限不足')
    })

    it('应该创建未找到错误响应', () => {
      const response = createNotFoundErrorResponse('用户')
      
      expect(response.status).toBe(404)
      
      const body = response.json()
      expect(body.success).toBe(false)
      expect(body.error.code).toBe(ApiErrorCode.NOT_FOUND)
      expect(body.error.message).toBe('用户不存在')
    })

    it('应该创建内部错误响应', () => {
      const response = createInternalErrorResponse('服务器内部错误')
      
      expect(response.status).toBe(500)
      
      const body = response.json()
      expect(body.success).toBe(false)
      expect(body.error.code).toBe(ApiErrorCode.INTERNAL_ERROR)
      expect(body.error.message).toBe('服务器内部错误')
    })

    it('应该创建限流错误响应', () => {
      const response = createRateLimitErrorResponse('请求过于频繁')
      
      expect(response.status).toBe(429)
      
      const body = response.json()
      expect(body.success).toBe(false)
      expect(body.error.code).toBe(ApiErrorCode.RATE_LIMIT_EXCEEDED)
      expect(body.error.message).toBe('请求过于频繁')
    })

    it('应该创建业务错误响应', () => {
      const response = createBusinessErrorResponse(
        ApiErrorCode.AGENT_NOT_FOUND,
        '智能体不存在',
        { agentId: '123' }
      )
      
      expect(response.status).toBe(400)
      
      const body = response.json()
      expect(body.success).toBe(false)
      expect(body.error.code).toBe(ApiErrorCode.AGENT_NOT_FOUND)
      expect(body.error.message).toBe('智能体不存在')
      expect(body.error.details).toEqual({ agentId: '123' })
    })

    it('应该创建外部服务错误响应', () => {
      const response = createExternalServiceErrorResponse(
        'OpenAI',
        'API调用失败',
        { status: 500 }
      )
      
      expect(response.status).toBe(502)
      
      const body = response.json()
      expect(body.success).toBe(false)
      expect(body.error.code).toBe(ApiErrorCode.EXTERNAL_API_ERROR)
      expect(body.error.message).toBe('OpenAI服务错误: API调用失败')
      expect(body.error.details).toEqual({ status: 500 })
    })

    it('应该创建数据库错误响应', () => {
      const response = createDatabaseErrorResponse('数据库连接失败')
      
      expect(response.status).toBe(500)
      
      const body = response.json()
      expect(body.success).toBe(false)
      expect(body.error.code).toBe(ApiErrorCode.DATABASE_ERROR)
      expect(body.error.message).toBe('数据库连接失败')
    })

    it('应该创建存储错误响应', () => {
      const response = createStorageErrorResponse('文件上传失败')
      
      expect(response.status).toBe(500)
      
      const body = response.json()
      expect(body.success).toBe(false)
      expect(body.error.code).toBe(ApiErrorCode.STORAGE_ERROR)
      expect(body.error.message).toBe('文件上传失败')
    })
  })

  describe('ResponseUtils', () => {
    it('应该正确识别成功响应', () => {
      const successResponse = {
        success: true,
        data: { id: 1 },
        message: '成功'
      }
      
      expect(ResponseUtils.isSuccess(successResponse)).toBe(true)
      expect(ResponseUtils.isError(successResponse)).toBe(false)
    })

    it('应该正确识别错误响应', () => {
      const errorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '验证失败'
        }
      }
      
      expect(ResponseUtils.isSuccess(errorResponse)).toBe(false)
      expect(ResponseUtils.isError(errorResponse)).toBe(true)
    })

    it('应该正确提取数据', () => {
      const successResponse = {
        success: true,
        data: { id: 1, name: 'Test' },
        message: '成功'
      }
      
      const data = ResponseUtils.extractData(successResponse)
      expect(data).toEqual({ id: 1, name: 'Test' })
    })

    it('应该正确提取错误信息', () => {
      const errorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '验证失败'
        }
      }
      
      const message = ResponseUtils.extractError(errorResponse)
      expect(message).toBe('验证失败')
    })

    it('应该正确提取错误码', () => {
      const errorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '验证失败'
        }
      }
      
      const code = ResponseUtils.extractErrorCode(errorResponse)
      expect(code).toBe('VALIDATION_ERROR')
    })

    it('应该正确创建分页元数据', () => {
      const pagination = ResponseUtils.createPaginationMeta(2, 20, 100)
      
      expect(pagination.page).toBe(2)
      expect(pagination.limit).toBe(20)
      expect(pagination.total).toBe(100)
      expect(pagination.totalPages).toBe(5)
      expect(pagination.hasNext).toBe(true)
      expect(pagination.hasPrev).toBe(true)
    })
  })

  describe('错误码枚举', () => {
    it('应该包含所有预定义的错误码', () => {
      expect(ApiErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR')
      expect(ApiErrorCode.AUTHENTICATION_ERROR).toBe('AUTHENTICATION_ERROR')
      expect(ApiErrorCode.AUTHORIZATION_ERROR).toBe('AUTHORIZATION_ERROR')
      expect(ApiErrorCode.NOT_FOUND).toBe('NOT_FOUND')
      expect(ApiErrorCode.INTERNAL_ERROR).toBe('INTERNAL_ERROR')
      expect(ApiErrorCode.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED')
      expect(ApiErrorCode.AGENT_NOT_FOUND).toBe('AGENT_NOT_FOUND')
      expect(ApiErrorCode.CHAT_SESSION_EXPIRED).toBe('CHAT_SESSION_EXPIRED')
      expect(ApiErrorCode.FILE_UPLOAD_FAILED).toBe('FILE_UPLOAD_FAILED')
      expect(ApiErrorCode.VOICE_TRANSCRIPTION_FAILED).toBe('VOICE_TRANSCRIPTION_FAILED')
      expect(ApiErrorCode.CAD_ANALYSIS_FAILED).toBe('CAD_ANALYSIS_FAILED')
      expect(ApiErrorCode.IMAGE_PROCESSING_FAILED).toBe('IMAGE_PROCESSING_FAILED')
      expect(ApiErrorCode.EXTERNAL_API_ERROR).toBe('EXTERNAL_API_ERROR')
      expect(ApiErrorCode.DATABASE_ERROR).toBe('DATABASE_ERROR')
      expect(ApiErrorCode.REDIS_ERROR).toBe('REDIS_ERROR')
      expect(ApiErrorCode.STORAGE_ERROR).toBe('STORAGE_ERROR')
    })
  })
})
