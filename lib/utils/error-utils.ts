/**
 * 统一错误处理工具
 * 提供标准化的错误创建和处理方法
 */

import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  NetworkError,
  ExternalApiError,
  InternalError,
  ErrorFactory as BaseErrorFactory,
} from '../../types/error-types';
import { logger } from './logger';

/**
 * 错误工厂函数
 */
export class ErrorFactory {
  /**
   * 创建验证错误
   */
  static validation(message: string, details?: Record<string, unknown>): ValidationError {
    return BaseErrorFactory.validation(message, details);
  }

  /**
   * 创建认证错误
   */
  static authentication(message: string = 'Authentication required', details?: Record<string, unknown>): AuthenticationError {
    return BaseErrorFactory.authentication(message, details);
  }

  /**
   * 创建授权错误
   */
  static authorization(message: string = 'Insufficient permissions', details?: Record<string, unknown>): AuthorizationError {
    return BaseErrorFactory.authorization(message, details);
  }

  /**
   * 创建未找到错误
   */
  static notFound(resource: string, id?: string): NotFoundError {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
    return BaseErrorFactory.notFound(message, { resource, id });
  }

  /**
   * 创建冲突错误
   */
  static conflict(message: string, details?: Record<string, unknown>): ConflictError {
    return BaseErrorFactory.conflict(message, details);
  }

  /**
   * 创建限流错误
   */
  static rateLimit(message: string = 'Rate limit exceeded', details?: Record<string, unknown>): RateLimitError {
    return BaseErrorFactory.rateLimit(message, details);
  }

  /**
   * 创建数据库错误
   */
  static database(message: string, details?: Record<string, unknown>): DatabaseError {
    return BaseErrorFactory.database(message, details);
  }

  /**
   * 创建网络错误
   */
  static network(message: string, details?: Record<string, unknown>): NetworkError {
    return BaseErrorFactory.network(message, details);
  }

  /**
   * 创建外部API错误
   */
  static externalApi(service: string, message: string, details?: Record<string, unknown>): ExternalApiError {
    return BaseErrorFactory.externalApi(service, message, details);
  }

  /**
   * 创建内部错误
   */
  static internal(message: string, details?: Record<string, unknown>): InternalError {
    return BaseErrorFactory.internal(message, details);
  }
}

/**
 * 错误处理工具
 */
export class ErrorHandler {
  /**
   * 安全执行函数，捕获并标准化错误
   */
  static async safeExecute<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<{ data?: T; error?: AppError }> {
    try {
      const data = await fn();
      return { data };
    } catch (error) {
      const appError = this.normalizeError(error, context);
      logger.error(`Error in ${context || 'safeExecute'}:`, appError);
      return { error: appError };
    }
  }

  /**
   * 同步安全执行函数
   */
  static safeExecuteSync<T>(
    fn: () => T,
    context?: string
  ): { data?: T; error?: AppError } {
    try {
      const data = fn();
      return { data };
    } catch (error) {
      const appError = this.normalizeError(error, context);
      logger.error(`Error in ${context || 'safeExecuteSync'}:`, appError);
      return { error: appError };
    }
  }

  /**
   * 标准化错误
   */
  static normalizeError(error: unknown, context?: string): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      return BaseErrorFactory.app(
        error.message,
        { originalError: error.name, context }
      );
    }

    return BaseErrorFactory.app(
      'An unknown error occurred',
      { originalError: String(error), context }
    );
  }

  /**
   * 处理API响应错误
   */
  static handleApiError(response: Response, context?: string): ValidationError | AuthenticationError | AuthorizationError | NotFoundError | ConflictError | RateLimitError | ExternalApiError {
    const status = response.status;
    const statusText = response.statusText;

    switch (true) {
      case status === 400:
        return ErrorFactory.validation(`API request failed: ${statusText}`, { status, context });
      case status === 401:
        return ErrorFactory.authentication(`API authentication failed: ${statusText}`, { status, context });
      case status === 403:
        return ErrorFactory.authorization(`API authorization failed: ${statusText}`, { status, context });
      case status === 404:
        return ErrorFactory.notFound('API resource', context);
      case status === 409:
        return ErrorFactory.conflict(`API conflict: ${statusText}`, { status, context });
      case status === 429:
        return ErrorFactory.rateLimit(`API rate limit exceeded: ${statusText}`, { status, context });
      case status >= 500:
        return ErrorFactory.externalApi('API', `API server error: ${statusText}`, { status, context });
      default:
        return ErrorFactory.externalApi('API', `API request failed: ${status} ${statusText}`, { status, context });
    }
  }

  /**
   * 处理数据库错误
   */
  static handleDatabaseError(error: unknown, operation: string): DatabaseError {
    const message = `Database ${operation} failed: ${error instanceof Error ? error.message : String(error)}`;
    return ErrorFactory.database(message, { operation, originalError: error });
  }

  /**
   * 处理网络错误
   */
  static handleNetworkError(error: unknown, url: string): NetworkError {
    const message = `Network request failed for ${url}: ${error instanceof Error ? error.message : String(error)}`;
    return ErrorFactory.network(message, { url, originalError: error });
  }

  /**
   * 带重试的执行函数
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    context?: string
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          const appError = this.normalizeError(error, `${context || 'withRetry'} (attempt ${attempt})`);
          logger.error(`All retry attempts failed in ${context || 'withRetry'}:`, appError);
          throw appError;
        }

        logger.warn(`Retry attempt ${attempt}/${maxRetries} failed in ${context || 'withRetry'}:`, error);
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    throw this.normalizeError(lastError, context);
  }

  /**
   * 带降级的执行函数
   */
  static async withFallback<T>(
    primaryFn: () => Promise<T>,
    fallbackFn: () => Promise<T>,
    context?: string
  ): Promise<T> {
    try {
      return await primaryFn();
    } catch (error) {
      logger.warn(`Primary function failed in ${context || 'withFallback'}, using fallback:`, error);
      try {
        return await fallbackFn();
      } catch (fallbackError) {
        const appError = this.normalizeError(fallbackError, `${context || 'withFallback'} (fallback)`);
        logger.error(`Both primary and fallback functions failed in ${context || 'withFallback'}:`, appError);
        throw appError;
      }
    }
  }
}

/**
 * 错误恢复策略
 */
export class ErrorRecovery {
  /**
   * 重试机制
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    context?: string
  ): Promise<T> {
    let lastError: AppError | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = ErrorHandler.normalizeError(error, context);

        if (attempt === maxRetries) {
          logger.error(`All ${maxRetries} retry attempts failed in ${context || 'withRetry'}:`, lastError);
          throw lastError;
        }

        logger.warn(`Retry attempt ${attempt}/${maxRetries} failed in ${context || 'withRetry'}:`, lastError);
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    throw lastError || ErrorFactory.internal('Retry mechanism failed');
  }

  /**
   * 降级处理
   */
  static async withFallback<T>(
    primaryFn: () => Promise<T>,
    fallbackFn: () => Promise<T>,
    context?: string
  ): Promise<T> {
    try {
      return await primaryFn();
    } catch (error) {
      const appError = ErrorHandler.normalizeError(error, context);
      logger.warn(`Primary operation failed in ${context || 'withFallback'}, using fallback:`, appError);

      try {
        return await fallbackFn();
      } catch (fallbackError) {
        const fallbackAppError = ErrorHandler.normalizeError(fallbackError, context);
        logger.error(`Both primary and fallback operations failed in ${context || 'withFallback'}:`, {
          primaryError: appError,
          fallbackError: fallbackAppError
        });
        throw fallbackAppError;
      }
    }
  }
}

// 导出便捷函数
export const {
  validation: createValidationError,
  authentication: createAuthenticationError,
  authorization: createAuthorizationError,
  notFound: createNotFoundError,
  conflict: createConflictError,
  rateLimit: createRateLimitError,
  database: createDatabaseError,
  network: createNetworkError,
  externalApi: createExternalApiError,
  internal: createInternalError,
} = ErrorFactory;

export const {
  safeExecute,
  safeExecuteSync,
  normalizeError,
  handleApiError,
  handleDatabaseError,
  handleNetworkError,
} = ErrorHandler;

export const {
  withRetry,
  withFallback,
} = ErrorRecovery;
