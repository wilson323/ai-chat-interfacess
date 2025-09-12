/**
 * API请求验证器
 * 提供统一的请求参数验证和错误处理
 */

import { z } from 'zod'
import { NextRequest } from 'next/server'
import { createErrorResponse, ApiErrorCode } from './response'

/**
 * 通用查询参数验证器
 */
export const queryParamsSchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  filter: z.string().optional()
})

/**
 * 分页参数验证器
 */
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
})

/**
 * 排序参数验证器
 */
export const sortSchema = z.object({
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc')
})

/**
 * 搜索参数验证器
 */
export const searchSchema = z.object({
  search: z.string().min(1).max(100).optional(),
  filter: z.string().optional()
})

/**
 * ID参数验证器
 */
export const idSchema = z.object({
  id: z.string().min(1, 'ID不能为空')
})

/**
 * 智能体相关验证器
 */
export const agentSchema = z.object({
  name: z.string().min(1, '智能体名称不能为空').max(100, '智能体名称不能超过100个字符'),
  description: z.string().max(500, '描述不能超过500个字符').optional(),
  type: z.enum(['chat', 'cad', 'image'], { errorMap: () => ({ message: '智能体类型必须是chat、cad或image' }) }),
  iconType: z.string().optional(),
  avatar: z.string().url('头像必须是有效的URL').optional(),
  order: z.number().min(0).max(9999).default(100),
  isPublished: z.boolean().default(false),
  apiKey: z.string().min(1, 'API密钥不能为空'),
  appId: z.string().min(1, '应用ID不能为空'),
  apiUrl: z.string().url('API地址必须是有效的URL'),
  systemPrompt: z.string().max(2000, '系统提示不能超过2000个字符').optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(8000).default(2000),
  multimodalModel: z.string().optional(),
  globalVariables: z.array(z.object({
    key: z.string().min(1, '变量名不能为空'),
    value: z.string(),
    required: z.boolean().default(false)
  })).optional(),
  welcomeText: z.string().max(500, '欢迎文本不能超过500个字符').optional()
})

/**
 * 聊天相关验证器
 */
export const chatMessageSchema = z.object({
  content: z.string().min(1, '消息内容不能为空').max(10000, '消息内容不能超过10000个字符'),
  role: z.enum(['user', 'assistant', 'system']),
  timestamp: z.number().optional(),
  metadata: z.record(z.any()).optional()
})

export const chatRequestSchema = z.object({
  message: z.string().min(1, '消息不能为空').max(10000, '消息不能超过10000个字符'),
  agentId: z.string().min(1, '智能体ID不能为空'),
  sessionId: z.string().optional(),
  globalVariables: z.record(z.any()).optional(),
  stream: z.boolean().default(false)
})

/**
 * 文件上传验证器
 */
export const fileUploadSchema = z.object({
  file: z.instanceof(File, '必须是文件类型'),
  type: z.enum(['image', 'audio', 'document', 'cad']),
  maxSize: z.number().optional()
})

/**
 * 语音相关验证器
 */
export const voiceTranscribeSchema = z.object({
  audio: z.instanceof(File, '必须是音频文件'),
  language: z.string().default('zh-CN'),
  model: z.string().default('whisper-1')
})

export const voiceConfigSchema = z.object({
  language: z.string().default('zh-CN'),
  autoStart: z.boolean().default(false),
  autoStop: z.boolean().default(true),
  maxDuration: z.number().min(1).max(300).default(60)
})

/**
 * CAD分析验证器
 */
export const cadAnalyzeSchema = z.object({
  file: z.instanceof(File, '必须是CAD文件'),
  analysisType: z.enum(['basic', 'detailed', 'advanced']).default('basic'),
  includeMetadata: z.boolean().default(true)
})

/**
 * 图像处理验证器
 */
export const imageProcessSchema = z.object({
  file: z.instanceof(File, '必须是图像文件'),
  operations: z.array(z.enum(['resize', 'crop', 'rotate', 'filter', 'enhance'])),
  parameters: z.record(z.any()).optional()
})

/**
 * 用户相关验证器
 */
export const userSchema = z.object({
  name: z.string().min(1, '用户名不能为空').max(50, '用户名不能超过50个字符'),
  email: z.string().email('邮箱格式不正确'),
  avatar: z.string().url('头像必须是有效的URL').optional()
})

export const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6个字符')
})

/**
 * 验证请求参数
 * @param schema Zod验证模式
 * @param data 要验证的数据
 * @returns 验证后的数据
 * @throws 验证错误
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        '请求参数验证失败',
        error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      )
    }
    throw error
  }
}

/**
 * 验证查询参数
 * @param request NextRequest对象
 * @returns 验证后的查询参数
 */
export function validateQueryParams(request: NextRequest) {
  const url = new URL(request.url)
  const params = Object.fromEntries(url.searchParams)
  return validateRequest(queryParamsSchema, params)
}

/**
 * 验证请求体
 * @param request NextRequest对象
 * @param schema Zod验证模式
 * @returns 验证后的请求体数据
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json()
    return validateRequest(schema, body)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        '请求体格式错误，必须是有效的JSON'
      )
    }
    throw error
  }
}

/**
 * 验证表单数据
 * @param request NextRequest对象
 * @param schema Zod验证模式
 * @returns 验证后的表单数据
 */
export async function validateFormData<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const formData = await request.formData()
    const data = Object.fromEntries(formData.entries())
    return validateRequest(schema, data)
  } catch (error) {
    throw createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      '表单数据验证失败'
    )
  }
}

/**
 * 验证文件上传
 * @param request NextRequest对象
 * @param schema Zod验证模式
 * @returns 验证后的文件数据
 */
export async function validateFileUpload<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const formData = await request.formData()
    const data = Object.fromEntries(formData.entries())
    return validateRequest(schema, data)
  } catch (error) {
    throw createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      '文件上传验证失败'
    )
  }
}

/**
 * 验证ID参数
 * @param request NextRequest对象
 * @returns 验证后的ID
 */
export function validateIdParam(request: NextRequest): string {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  
  if (!id) {
    throw createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      '缺少ID参数'
    )
  }
  
  return validateRequest(idSchema, { id }).id
}

/**
 * 验证分页参数
 * @param request NextRequest对象
 * @returns 验证后的分页参数
 */
export function validatePaginationParams(request: NextRequest) {
  const url = new URL(request.url)
  const page = url.searchParams.get('page')
  const limit = url.searchParams.get('limit')
  
  return validateRequest(paginationSchema, {
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined
  })
}

/**
 * 验证排序参数
 * @param request NextRequest对象
 * @returns 验证后的排序参数
 */
export function validateSortParams(request: NextRequest) {
  const url = new URL(request.url)
  const sort = url.searchParams.get('sort')
  const order = url.searchParams.get('order')
  
  return validateRequest(sortSchema, { sort, order })
}

/**
 * 验证搜索参数
 * @param request NextRequest对象
 * @returns 验证后的搜索参数
 */
export function validateSearchParams(request: NextRequest) {
  const url = new URL(request.url)
  const search = url.searchParams.get('search')
  const filter = url.searchParams.get('filter')
  
  return validateRequest(searchSchema, { search, filter })
}

/**
 * 验证文件类型
 * @param file 文件对象
 * @param allowedTypes 允许的文件类型
 * @returns 是否有效
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

/**
 * 验证文件大小
 * @param file 文件对象
 * @param maxSize 最大文件大小（字节）
 * @returns 是否有效
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize
}

/**
 * 验证音频文件
 * @param file 文件对象
 * @returns 是否有效
 */
export function validateAudioFile(file: File): boolean {
  const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/webm']
  return validateFileType(file, allowedTypes)
}

/**
 * 验证图像文件
 * @param file 文件对象
 * @returns 是否有效
 */
export function validateImageFile(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  return validateFileType(file, allowedTypes)
}

/**
 * 验证CAD文件
 * @param file 文件对象
 * @returns 是否有效
 */
export function validateCADFile(file: File): boolean {
  const allowedExtensions = ['.dwg', '.dxf', '.step', '.stp', '.iges', '.igs']
  const fileName = file.name.toLowerCase()
  return allowedExtensions.some(ext => fileName.endsWith(ext))
}

/**
 * 验证器工具类
 */
export class ValidatorUtils {
  /**
   * 创建自定义验证器
   */
  static createCustomValidator<T>(
    schema: z.ZodSchema<T>,
    errorMessage: string = '验证失败'
  ) {
    return (data: unknown) => {
      try {
        return schema.parse(data)
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw createErrorResponse(
            ApiErrorCode.VALIDATION_ERROR,
            errorMessage,
            error.errors
          )
        }
        throw error
      }
    }
  }

  /**
   * 验证数组数据
   */
  static validateArray<T>(
    data: unknown[],
    itemSchema: z.ZodSchema<T>
  ): T[] {
    const schema = z.array(itemSchema)
    return validateRequest(schema, data)
  }

  /**
   * 验证可选字段
   */
  static validateOptional<T>(
    data: unknown,
    schema: z.ZodSchema<T>
  ): T | undefined {
    if (data === undefined || data === null) {
      return undefined
    }
    return validateRequest(schema, data)
  }

  /**
   * 验证联合类型
   */
  static validateUnion<T>(
    data: unknown,
    schemas: z.ZodSchema<T>[]
  ): T {
    for (const schema of schemas) {
      try {
        return schema.parse(data)
      } catch (error) {
        // 继续尝试下一个模式
      }
    }
    throw createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      '数据格式不匹配任何预期的类型'
    )
  }
}

/**
 * 默认导出
 */
export default {
  validateRequest,
  validateQueryParams,
  validateRequestBody,
  validateFormData,
  validateFileUpload,
  validateIdParam,
  validatePaginationParams,
  validateSortParams,
  validateSearchParams,
  validateFileType,
  validateFileSize,
  validateAudioFile,
  validateImageFile,
  validateCADFile,
  ValidatorUtils,
  // 导出所有验证模式
  queryParamsSchema,
  paginationSchema,
  sortSchema,
  searchSchema,
  idSchema,
  agentSchema,
  chatMessageSchema,
  chatRequestSchema,
  fileUploadSchema,
  voiceTranscribeSchema,
  voiceConfigSchema,
  cadAnalyzeSchema,
  imageProcessSchema,
  userSchema,
  loginSchema
}
