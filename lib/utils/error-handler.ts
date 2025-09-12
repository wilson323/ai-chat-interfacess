/**
 * 统一错误处理系统
 * 提供标准化的错误分类、处理和响应格式
 */

import { logger } from './logger'

export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  CONFLICT = 'CONFLICT_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR',
  DATABASE = 'DATABASE_ERROR',
  FILE_SYSTEM = 'FILE_SYSTEM_ERROR',
  NETWORK = 'NETWORK_ERROR',
  INTERNAL = 'INTERNAL_ERROR'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ErrorContext {
  userId?: string
  requestId?: string
  operation?: string
  resource?: string
  metadata?: Record<string, any>
}

export interface StandardError {
  type: ErrorType
  code: string
  message: string
  details?: string
  severity: ErrorSeverity
  context?: ErrorContext
  timestamp: string
  recoverable: boolean
  retryAfter?: number
}

export class AppError extends Error {
  public readonly type: ErrorType
  public readonly code: string
  public readonly severity: ErrorSeverity
  public readonly context?: ErrorContext
  public readonly recoverable: boolean
  public readonly retryAfter?: number

  constructor(
    type: ErrorType,
    code: string,
    message: string,
    options: {
      details?: string
      severity?: ErrorSeverity
      context?: ErrorContext
      recoverable?: boolean
      retryAfter?: number
      cause?: Error
    } = {}
  ) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.code = code
    this.severity = options.severity || ErrorSeverity.MEDIUM
    this.context = options.context
    this.recoverable = options.recoverable ?? true
    this.retryAfter = options.retryAfter
    this.cause = options.cause
  }

  toStandardError(): StandardError {
    return {
      type: this.type,
      code: this.code,
      message: this.message,
      details: this.details,
      severity: this.severity,
      context: this.context,
      timestamp: new Date().toISOString(),
      recoverable: this.recoverable,
      retryAfter: this.retryAfter
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: string, context?: ErrorContext) {
    super(ErrorType.VALIDATION, 'VALIDATION_FAILED', message, {
      details,
      severity: ErrorSeverity.LOW,
      context,
      recoverable: true
    })
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: ErrorContext) {
    super(ErrorType.AUTHENTICATION, 'AUTH_REQUIRED', message, {
      severity: ErrorSeverity.HIGH,
      context,
      recoverable: true
    })
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', context?: ErrorContext) {
    super(ErrorType.AUTHORIZATION, 'ACCESS_DENIED', message, {
      severity: ErrorSeverity.HIGH,
      context,
      recoverable: false
    })
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, context?: ErrorContext) {
    super(ErrorType.NOT_FOUND, 'RESOURCE_NOT_FOUND', `${resource} not found`, {
      severity: ErrorSeverity.MEDIUM,
      context: { ...context, resource },
      recoverable: false
    })
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(ErrorType.CONFLICT, 'RESOURCE_CONFLICT', message, {
      severity: ErrorSeverity.MEDIUM,
      context,
      recoverable: true
    })
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number, context?: ErrorContext) {
    super(ErrorType.RATE_LIMIT, 'RATE_LIMIT_EXCEEDED', 'Rate limit exceeded', {
      severity: ErrorSeverity.MEDIUM,
      context,
      recoverable: true,
      retryAfter
    })
  }
}

export class DatabaseError extends AppError {
  constructor(operation: string, originalError: Error, context?: ErrorContext) {
    super(ErrorType.DATABASE, 'DATABASE_ERROR', `Database operation failed: ${operation}`, {
      details: originalError.message,
      severity: ErrorSeverity.HIGH,
      context: { ...context, operation },
      recoverable: true,
      cause: originalError
    })
  }
}

export class FileSystemError extends AppError {
  constructor(operation: string, path: string, originalError: Error, context?: ErrorContext) {
    super(ErrorType.FILE_SYSTEM, 'FILE_SYSTEM_ERROR', `File system operation failed: ${operation}`, {
      details: `Path: ${path}, Error: ${originalError.message}`,
      severity: ErrorSeverity.MEDIUM,
      context: { ...context, operation, resource: path },
      recoverable: true,
      cause: originalError
    })
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, operation: string, originalError: Error, context?: ErrorContext) {
    super(ErrorType.EXTERNAL_SERVICE, 'EXTERNAL_SERVICE_ERROR', `External service error: ${service}`, {
      details: `Operation: ${operation}, Error: ${originalError.message}`,
      severity: ErrorSeverity.MEDIUM,
      context: { ...context, operation, resource: service },
      recoverable: true,
      cause: originalError
    })
  }
}

export class NetworkError extends AppError {
  constructor(operation: string, originalError: Error, context?: ErrorContext) {
    super(ErrorType.NETWORK, 'NETWORK_ERROR', `Network operation failed: ${operation}`, {
      details: originalError.message,
      severity: ErrorSeverity.MEDIUM,
      context: { ...context, operation },
      recoverable: true,
      cause: originalError
    })
  }
}

export class InternalError extends AppError {
  constructor(message: string, originalError?: Error, context?: ErrorContext) {
    super(ErrorType.INTERNAL, 'INTERNAL_ERROR', message, {
      details: originalError?.message,
      severity: ErrorSeverity.CRITICAL,
      context,
      recoverable: false,
      cause: originalError
    })
  }
}

/**
 * 错误处理器类
 */
export class ErrorHandler {
  /**
   * 处理并记录错误
   */
  static handle(error: unknown, context?: ErrorContext): StandardError {
    let standardError: StandardError

    if (error instanceof AppError) {
      standardError = error.toStandardError()
    } else if (error instanceof Error) {
      // 将普通Error转换为AppError
      const appError = new InternalError(
        'An unexpected error occurred',
        error,
        context
      )
      standardError = appError.toStandardError()
    } else {
      // 处理非Error对象
      const appError = new InternalError(
        'An unknown error occurred',
        undefined,
        context
      )
      standardError = appError.toStandardError()
    }

    // 记录错误日志
    this.logError(standardError)

    return standardError
  }

  /**
   * 记录错误日志
   */
  private static logError(error: StandardError): void {
    const logMessage = `Error [${error.type}]: ${error.message}`
    const logContext = {
      code: error.code,
      severity: error.severity,
      context: error.context,
      recoverable: error.recoverable
    }

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        logger.errorAlways(logMessage, logContext)
        break
      case ErrorSeverity.HIGH:
        logger.error(logMessage, logContext)
        break
      case ErrorSeverity.MEDIUM:
        logger.warn(logMessage, logContext)
        break
      case ErrorSeverity.LOW:
        logger.info(logMessage, logContext)
        break
    }
  }

  /**
   * 检查错误是否可恢复
   */
  static isRecoverable(error: unknown): boolean {
    if (error instanceof AppError) {
      return error.recoverable
    }
    return false
  }

  /**
   * 获取重试延迟时间
   */
  static getRetryAfter(error: unknown): number | undefined {
    if (error instanceof AppError) {
      return error.retryAfter
    }
    return undefined
  }

  /**
   * 生成用户友好的错误消息
   */
  static getUserFriendlyMessage(error: StandardError): string {
    switch (error.type) {
      case ErrorType.VALIDATION:
        return '输入数据格式不正确，请检查后重试'
      case ErrorType.AUTHENTICATION:
        return '请先登录后再进行操作'
      case ErrorType.AUTHORIZATION:
        return '您没有权限执行此操作'
      case ErrorType.NOT_FOUND:
        return '请求的资源不存在'
      case ErrorType.CONFLICT:
        return '操作冲突，请稍后重试'
      case ErrorType.RATE_LIMIT:
        return '请求过于频繁，请稍后重试'
      case ErrorType.DATABASE:
        return '数据操作失败，请稍后重试'
      case ErrorType.FILE_SYSTEM:
        return '文件操作失败，请检查文件权限'
      case ErrorType.EXTERNAL_SERVICE:
        return '外部服务暂时不可用，请稍后重试'
      case ErrorType.NETWORK:
        return '网络连接失败，请检查网络设置'
      case ErrorType.INTERNAL:
        return '系统内部错误，请联系管理员'
      default:
        return '操作失败，请稍后重试'
    }
  }

  /**
   * 生成API响应格式
   */
  static toApiResponse(error: StandardError, includeDetails: boolean = false) {
    return {
      success: false,
      error: {
        type: error.type,
        code: error.code,
        message: this.getUserFriendlyMessage(error),
        ...(includeDetails && { details: error.details }),
        ...(error.retryAfter && { retryAfter: error.retryAfter })
      },
      timestamp: error.timestamp
    }
  }
}

/**
 * 错误恢复策略
 */
export class ErrorRecovery {
  /**
   * 自动重试策略
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error

        if (!ErrorHandler.isRecoverable(error)) {
          throw error
        }

        if (attempt === maxRetries) {
          break
        }

        const delay = baseDelay * Math.pow(2, attempt - 1)
        logger.info(`操作失败，${delay}ms后重试 (${attempt}/${maxRetries})`, { error: lastError.message })
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }

  /**
   * 降级处理策略
   */
  static async withFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>
  ): Promise<T> {
    try {
      return await primaryOperation()
    } catch (error) {
      if (ErrorHandler.isRecoverable(error)) {
        logger.warn('主操作失败，使用降级方案', { error: (error as Error).message })
        return await fallbackOperation()
      }
      throw error
    }
  }
}
