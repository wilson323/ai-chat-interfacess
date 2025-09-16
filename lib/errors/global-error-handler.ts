/**
 * 全局错误处理系统
 * 统一处理所有类型的错误，提供一致的错误响应和日志记录
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import React from 'react';
import { logger } from '@/lib/utils/logger';

// 错误类型枚举
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// 错误严重级别
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// 统一错误接口
export interface GlobalError {
  type: ErrorType;
  code: string;
  message: string;
  details?: unknown;
  severity: ErrorSeverity;
  timestamp: string;
  requestId?: string;
  userId?: string;
  stack?: string;
  context?: {
    url?: string;
    method?: string;
    userAgent?: string;
    ip?: string;
  };
}

// 错误响应接口
export interface ErrorResponse {
  success: false;
  error: {
    type: string;
    code: string;
    message: string;
    details?: unknown;
  };
  meta: {
    timestamp: string;
    requestId: string;
    traceId?: string;
  };
}

// 自定义错误类
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly details?: Record<string, unknown>;
  public readonly statusCode: number;

  constructor(
    type: ErrorType,
    message: string,
    code: string = type,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    statusCode: number = 500,
    details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.severity = severity;
    this.statusCode = statusCode;
    this.details = details ? (details as Record<string, unknown>) : undefined;

    // 确保堆栈跟踪正确
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

// 具体错误类
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(
      ErrorType.VALIDATION_ERROR,
      message,
      'VALIDATION_ERROR',
      ErrorSeverity.LOW,
      400,
      details
    );
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(
      ErrorType.AUTHENTICATION_ERROR,
      message,
      'AUTHENTICATION_ERROR',
      ErrorSeverity.MEDIUM,
      401
    );
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(
      ErrorType.AUTHORIZATION_ERROR,
      message,
      'AUTHORIZATION_ERROR',
      ErrorSeverity.MEDIUM,
      403
    );
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(
      ErrorType.NOT_FOUND_ERROR,
      `${resource} not found`,
      'NOT_FOUND_ERROR',
      ErrorSeverity.LOW,
      404
    );
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(
      ErrorType.CONFLICT_ERROR,
      message,
      'CONFLICT_ERROR',
      ErrorSeverity.MEDIUM,
      409,
      details
    );
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(
      ErrorType.RATE_LIMIT_ERROR,
      message,
      'RATE_LIMIT_ERROR',
      ErrorSeverity.MEDIUM,
      429
    );
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(
      ErrorType.DATABASE_ERROR,
      message,
      'DATABASE_ERROR',
      ErrorSeverity.HIGH,
      500,
      details
    );
  }
}

export class NetworkError extends AppError {
  constructor(message: string, details?: unknown) {
    super(
      ErrorType.NETWORK_ERROR,
      message,
      'NETWORK_ERROR',
      ErrorSeverity.MEDIUM,
      502,
      details
    );
  }
}

export class ExternalApiError extends AppError {
  constructor(
    service: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(
      ErrorType.EXTERNAL_API_ERROR,
      `${service}: ${message}`,
      'EXTERNAL_API_ERROR',
      ErrorSeverity.MEDIUM,
      502,
      details
    );
  }
}

export class InternalError extends AppError {
  constructor(message: string, details?: unknown) {
    super(
      ErrorType.INTERNAL_SERVER_ERROR,
      message,
      'INTERNAL_ERROR',
      ErrorSeverity.HIGH,
      500,
      details
    );
  }
}

// 全局错误处理器类
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private errorLog: GlobalError[] = [];
  private maxLogSize = 1000;

  private constructor() {}

  public static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  /**
   * 处理错误并生成统一响应
   */
  public handleError(
    error: unknown,
    context?: {
      request?: NextRequest;
      userId?: string;
      requestId?: string;
    }
  ): NextResponse<ErrorResponse> {
    const globalError = this.normalizeError(error, context);
    this.logError(globalError);

    return this.createErrorResponse(globalError);
  }

  /**
   * 标准化错误对象
   */
  private normalizeError(
    error: unknown,
    context?: {
      request?: NextRequest;
      userId?: string;
      requestId?: string;
    }
  ): GlobalError {
    const timestamp = new Date().toISOString();
    const requestId = context?.requestId || this.generateRequestId();

    // 处理已知错误类型
    if (error instanceof AppError) {
      return {
        type: error.type,
        code: error.code,
        message: error.message,
        details: error.details,
        severity: error.severity,
        timestamp,
        requestId,
        userId: context?.userId,
        stack: error.stack,
        context: this.extractContext(context?.request),
      };
    }

    // 处理Zod验证错误
    if (error instanceof ZodError) {
      return {
        type: ErrorType.VALIDATION_ERROR,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.errors,
        severity: ErrorSeverity.LOW,
        timestamp,
        requestId,
        userId: context?.userId,
        context: this.extractContext(context?.request),
      };
    }

    // 处理Sequelize错误
    if (error && typeof error === 'object' && 'name' in error) {
      const sequelizeError = error as { name?: string; stack?: string };
      if (sequelizeError.name?.includes('Sequelize')) {
        return {
          type: ErrorType.DATABASE_ERROR,
          code: 'DATABASE_ERROR',
          message: this.getSequelizeErrorMessage(sequelizeError),
          details: sequelizeError,
          severity: ErrorSeverity.HIGH,
          timestamp,
          requestId,
          userId: context?.userId,
          stack: sequelizeError.stack,
          context: this.extractContext(context?.request),
        };
      }
    }

    // 处理网络错误
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        type: ErrorType.NETWORK_ERROR,
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        details: error.message,
        severity: ErrorSeverity.MEDIUM,
        timestamp,
        requestId,
        userId: context?.userId,
        stack: error.stack,
        context: this.extractContext(context?.request),
      };
    }

    // 处理其他错误
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return {
      type: ErrorType.UNKNOWN_ERROR,
      code: 'UNKNOWN_ERROR',
      message: errorMessage,
      details: error,
      severity: ErrorSeverity.HIGH,
      timestamp,
      requestId,
      userId: context?.userId,
      stack: errorStack,
      context: this.extractContext(context?.request),
    };
  }

  /**
   * 创建错误响应
   */
  private createErrorResponse(
    globalError: GlobalError
  ): NextResponse<ErrorResponse> {
    const response: ErrorResponse = {
      success: false,
      error: {
        type: globalError.type,
        code: globalError.code,
        message: globalError.message,
        details: globalError.details,
      },
      meta: {
        timestamp: globalError.timestamp,
        requestId: globalError.requestId || 'unknown',
      },
    };

    // 根据错误类型设置HTTP状态码
    const statusCode = this.getStatusCode(globalError.type);

    return NextResponse.json(response, { status: statusCode });
  }

  /**
   * 记录错误日志
   */
  private logError(globalError: GlobalError): void {
    // 添加到内存日志
    this.errorLog.unshift(globalError);

    // 保持日志大小限制
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // 根据严重级别记录日志
    const logMessage = `[${globalError.type}] ${globalError.message} (${globalError.requestId})`;

    switch (globalError.severity) {
      case ErrorSeverity.CRITICAL:
        logger.error('🚨 CRITICAL:', logMessage, globalError);
        break;
      case ErrorSeverity.HIGH:
        logger.error('❌ HIGH:', logMessage, globalError);
        break;
      case ErrorSeverity.MEDIUM:
        logger.warn('⚠️  MEDIUM:', logMessage, globalError);
        break;
      case ErrorSeverity.LOW:
        logger.info('ℹ️  LOW:', logMessage, globalError);
        break;
    }

    // 在生产环境中，可以发送到外部监控服务
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(globalError);
    }
  }

  /**
   * 发送到监控服务
   */
  private sendToMonitoring(globalError: GlobalError): void {
    // 这里可以集成Sentry、DataDog等监控服务
    // 示例：发送到外部API
    if (process.env.MONITORING_ENDPOINT) {
      fetch(process.env.MONITORING_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(globalError),
      }).catch(err => {
        logger.error('Failed to send error to monitoring service:', err);
      });
    }
  }

  /**
   * 提取请求上下文
   */
  private extractContext(request?: NextRequest): GlobalError['context'] {
    if (!request) return undefined;

    return {
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent') || undefined,
      ip:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
    };
  }

  /**
   * 获取Sequelize错误消息
   */
  private getSequelizeErrorMessage(error: unknown): string {
    const err = error as { parent?: { code?: string }; message?: string };
    if (err.parent?.code === '23505') {
      return 'Data already exists';
    }
    if (err.parent?.code === '23503') {
      return 'Foreign key constraint violation';
    }
    if (err.parent?.code === '23502') {
      return 'Required field is missing';
    }
    return err.message || 'Database operation failed';
  }

  /**
   * 获取HTTP状态码
   */
  private getStatusCode(errorType: ErrorType): number {
    const statusMap: Record<ErrorType, number> = {
      [ErrorType.VALIDATION_ERROR]: 400,
      [ErrorType.AUTHENTICATION_ERROR]: 401,
      [ErrorType.AUTHORIZATION_ERROR]: 403,
      [ErrorType.NOT_FOUND_ERROR]: 404,
      [ErrorType.CONFLICT_ERROR]: 409,
      [ErrorType.RATE_LIMIT_ERROR]: 429,
      [ErrorType.DATABASE_ERROR]: 500,
      [ErrorType.NETWORK_ERROR]: 502,
      [ErrorType.EXTERNAL_API_ERROR]: 502,
      [ErrorType.INTERNAL_SERVER_ERROR]: 500,
      [ErrorType.UNKNOWN_ERROR]: 500,
    };

    return statusMap[errorType] || 500;
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取错误统计
   */
  public getErrorStats(): {
    total: number;
    byType: Record<ErrorType, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recent: GlobalError[];
  } {
    const byType = Object.values(ErrorType).reduce(
      (acc, type) => {
        acc[type] = this.errorLog.filter(error => error.type === type).length;
        return acc;
      },
      {} as Record<ErrorType, number>
    );

    const bySeverity = Object.values(ErrorSeverity).reduce(
      (acc, severity) => {
        acc[severity] = this.errorLog.filter(
          error => error.severity === severity
        ).length;
        return acc;
      },
      {} as Record<ErrorSeverity, number>
    );

    return {
      total: this.errorLog.length,
      byType,
      bySeverity,
      recent: this.errorLog.slice(0, 10),
    };
  }

  /**
   * 清理错误日志
   */
  public clearErrorLog(): void {
    this.errorLog = [];
  }
}

// 导出单例实例
export const globalErrorHandler = GlobalErrorHandler.getInstance();

// 便捷函数
export function handleError(
  error: unknown,
  context?: {
    request?: NextRequest;
    userId?: string;
    requestId?: string;
  }
): NextResponse<ErrorResponse> {
  return globalErrorHandler.handleError(error, context);
}

// 错误边界组件（用于React组件）
export function withErrorBoundary<T extends React.ComponentType<Record<string, unknown>>>(
  Component: T,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) {
  return function ErrorBoundaryComponent(props: React.ComponentProps<T>) {
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
      const handleError = (event: ErrorEvent) => {
        const globalError = globalErrorHandler['normalizeError'](event.error, {
          requestId: globalErrorHandler['generateRequestId'](),
        });
        globalErrorHandler['logError'](globalError);
        setError(event.error);
      };

      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }, []);

    if (error) {
      if (fallback) {
        return React.createElement(fallback, {
          error,
          resetError: () => setError(null),
        });
      }
      return React.createElement(
        'div',
        {
          className: 'error-boundary',
        },
        'Something went wrong. Please try again.'
      );
    }

    return React.createElement(Component, props);
  };
}
