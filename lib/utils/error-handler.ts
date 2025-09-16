/**
 * 统一错误处理系统
 * 提供一致的错误处理、分类和恢复机制
 */

import { logger } from './logger';

export interface ErrorInfo {
  code: string;
  message: string;
  context: string;
  timestamp: string;
  originalError?: any;
  stack?: string;
}

export interface ErrorRecovery {
  canRecover: boolean;
  recoveryAction?: () => void;
  fallbackMessage: string;
}

/**
 * 验证错误类
 */
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }

  toStandardError(): ErrorInfo {
    return {
      code: 'VALIDATION_ERROR',
      message: this.message,
      context: this.field || 'validation',
      timestamp: new Date().toISOString(),
      originalError: this
    };
  }
}

/**
 * 内部错误类
 */
export class InternalError extends Error {
  constructor(message: string, public originalError?: Error, public metadata?: any) {
    super(message);
    this.name = 'InternalError';
  }

  toStandardError(): ErrorInfo {
    return {
      code: 'INTERNAL_ERROR',
      message: this.message,
      context: this.metadata?.operation || 'internal',
      timestamp: new Date().toISOString(),
      originalError: this.originalError || this
    };
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * 处理API错误
   */
  public handleApiError(error: any, context: string): ErrorInfo {
    const errorInfo: ErrorInfo = {
      code: 'API_ERROR',
      message: 'API请求失败',
      context,
      timestamp: new Date().toISOString(),
      originalError: error,
    };

    if (error instanceof Error) {
      errorInfo.message = error.message;
      errorInfo.stack = error.stack;
    }

    if (error?.response) {
      const status = error.response.status;
      errorInfo.code = `API_ERROR_${status}`;

      switch (status) {
        case 400:
          errorInfo.message = '请求参数错误';
          break;
        case 401:
          errorInfo.message = '认证失败，请重新登录';
          break;
        case 403:
          errorInfo.message = '权限不足';
          break;
        case 404:
          errorInfo.message = '请求的资源不存在';
          break;
        case 429:
          errorInfo.message = '请求过于频繁，请稍后再试';
          break;
        case 500:
          errorInfo.message = '服务器内部错误';
          break;
        case 502:
        case 503:
        case 504:
          errorInfo.message = '服务暂时不可用，请稍后再试';
          break;
        default:
          errorInfo.message = error.response.data?.message || error.message || '未知API错误';
      }
    }

    logger.apiError(`API错误 [${context}]: ${errorInfo.message}`, errorInfo);
    return errorInfo;
  }

  /**
   * 处理网络错误
   */
  public handleNetworkError(error: any, context: string): ErrorInfo {
    const errorInfo: ErrorInfo = {
      code: 'NETWORK_ERROR',
      message: '网络连接失败',
      context,
      timestamp: new Date().toISOString(),
      originalError: error,
    };

    if (error instanceof TypeError) {
      if (error.message.includes('fetch')) {
        errorInfo.message = '网络请求失败，请检查网络连接';
      } else if (error.message.includes('timeout')) {
        errorInfo.message = '请求超时，请稍后再试';
      }
    }

    if (error?.code === 'NETWORK_ERROR') {
      errorInfo.message = '网络连接中断';
    }

    logger.error(`网络错误 [${context}]: ${errorInfo.message}`, context, errorInfo);
    return errorInfo;
  }

  /**
   * 处理配置错误
   */
  public handleConfigError(error: any, context: string): ErrorInfo {
    const errorInfo: ErrorInfo = {
      code: 'CONFIG_ERROR',
      message: '配置错误',
      context,
      timestamp: new Date().toISOString(),
      originalError: error,
    };

    if (error instanceof Error) {
      errorInfo.message = error.message;
    }

    logger.error(`配置错误 [${context}]: ${errorInfo.message}`, context, errorInfo);
    return errorInfo;
  }

  /**
   * 处理聊天错误
   */
  public handleChatError(error: any, context: string): ErrorInfo {
    const errorInfo: ErrorInfo = {
      code: 'CHAT_ERROR',
      message: '聊天功能异常',
      context,
      timestamp: new Date().toISOString(),
      originalError: error,
    };

    if (error instanceof Error) {
      errorInfo.message = error.message;
    }

    logger.chatError(`聊天错误 [${context}]: ${errorInfo.message}`, errorInfo);
    return errorInfo;
  }

  /**
   * 处理智能体错误
   */
  public handleAgentError(error: any, context: string): ErrorInfo {
    const errorInfo: ErrorInfo = {
      code: 'AGENT_ERROR',
      message: '智能体服务异常',
      context,
      timestamp: new Date().toISOString(),
      originalError: error,
    };

    if (error instanceof Error) {
      errorInfo.message = error.message;
    }

    logger.agentError(`智能体错误 [${context}]: ${errorInfo.message}`, errorInfo);
    return errorInfo;
  }

  /**
   * 获取错误恢复建议
   */
  public getErrorRecovery(errorInfo: ErrorInfo): ErrorRecovery {
    switch (errorInfo.code) {
      case 'API_ERROR_401':
        return {
          canRecover: true,
          recoveryAction: () => {
            // 重定向到登录页面
            window.location.href = '/login';
          },
          fallbackMessage: '请重新登录后重试',
        };

      case 'API_ERROR_429':
        return {
          canRecover: true,
          recoveryAction: () => {
            // 延迟重试
            setTimeout(() => window.location.reload(), 5000);
          },
          fallbackMessage: '请求过于频繁，5秒后自动重试',
        };

      case 'NETWORK_ERROR':
        return {
          canRecover: true,
          recoveryAction: () => {
            // 检查网络连接
            window.location.reload();
          },
          fallbackMessage: '网络连接异常，请检查网络后重试',
        };

      case 'CHAT_ERROR':
        return {
          canRecover: true,
          recoveryAction: () => {
            // 重新初始化聊天
            window.location.reload();
          },
          fallbackMessage: '聊天功能异常，正在重新初始化',
        };

      default:
        return {
          canRecover: false,
          fallbackMessage: '发生未知错误，请联系技术支持',
        };
    }
  }

  /**
   * 统一错误处理入口
   */
  public handleError(error: any, context: string, type: 'api' | 'network' | 'config' | 'chat' | 'agent' = 'api'): ErrorInfo {
    switch (type) {
      case 'api':
        return this.handleApiError(error, context);
      case 'network':
        return this.handleNetworkError(error, context);
      case 'config':
        return this.handleConfigError(error, context);
      case 'chat':
        return this.handleChatError(error, context);
      case 'agent':
        return this.handleAgentError(error, context);
      default:
        return this.handleApiError(error, context);
    }
  }

  /**
   * 静态方法：处理错误
   */
  public static handle(error: any, context: { context: string; type?: string; operation?: string }): ErrorInfo {
    const instance = ErrorHandler.getInstance();
    return instance.handleError(error, context.context, context.type as any);
  }

  /**
   * 静态方法：转换为API响应
   */
  public static toApiResponse(errorInfo: ErrorInfo, isError: boolean = true): Response {
    return new Response(JSON.stringify({
      success: !isError,
      error: isError ? errorInfo : null,
      data: isError ? null : errorInfo
    }), {
      status: isError ? 500 : 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 导出单例实例
export const errorHandler = ErrorHandler.getInstance();

// 便捷函数
export const handleError = (error: any, context: string, type?: 'api' | 'network' | 'config' | 'chat' | 'agent') => {
  return errorHandler.handleError(error, context, type);
};
