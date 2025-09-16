/**
 * 完整的错误类型定义
 * 提供统一的错误处理类型和工厂类
 */

// 基础错误接口
export interface BaseError {
  name: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  requestId?: string;
  stack?: string;
}

// 验证错误
export class ValidationError extends Error implements BaseError {
  public readonly name = 'ValidationError';
  public details?: Record<string, unknown>;
  public timestamp: string;
  public requestId?: string;

  constructor(message: string, details?: Record<string, unknown>, requestId?: string) {
    super(message);
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;
  }
}

// 认证错误
export class AuthenticationError extends Error implements BaseError {
  public readonly name = 'AuthenticationError';
  public details?: Record<string, unknown>;
  public timestamp: string;
  public requestId?: string;

  constructor(message: string, details?: Record<string, unknown>, requestId?: string) {
    super(message);
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;
  }
}

// 授权错误
export class AuthorizationError extends Error implements BaseError {
  public readonly name = 'AuthorizationError';
  public details?: Record<string, unknown>;
  public timestamp: string;
  public requestId?: string;

  constructor(message: string, details?: Record<string, unknown>, requestId?: string) {
    super(message);
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;
  }
}

// 未找到错误
export class NotFoundError extends Error implements BaseError {
  public readonly name = 'NotFoundError';
  public details?: Record<string, unknown>;
  public timestamp: string;
  public requestId?: string;

  constructor(message: string, details?: Record<string, unknown>, requestId?: string) {
    super(message);
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;
  }
}

// 冲突错误
export class ConflictError extends Error implements BaseError {
  public readonly name = 'ConflictError';
  public details?: Record<string, unknown>;
  public timestamp: string;
  public requestId?: string;

  constructor(message: string, details?: Record<string, unknown>, requestId?: string) {
    super(message);
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;
  }
}

// 速率限制错误
export class RateLimitError extends Error implements BaseError {
  public readonly name = 'RateLimitError';
  public details?: Record<string, unknown>;
  public timestamp: string;
  public requestId?: string;

  constructor(message: string, details?: Record<string, unknown>, requestId?: string) {
    super(message);
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;
  }
}

// 数据库错误
export class DatabaseError extends Error implements BaseError {
  public readonly name = 'DatabaseError';
  public details?: Record<string, unknown>;
  public timestamp: string;
  public requestId?: string;

  constructor(message: string, details?: Record<string, unknown>, requestId?: string) {
    super(message);
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;
  }
}

// 网络错误
export class NetworkError extends Error implements BaseError {
  public readonly name = 'NetworkError';
  public details?: Record<string, unknown>;
  public timestamp: string;
  public requestId?: string;

  constructor(message: string, details?: Record<string, unknown>, requestId?: string) {
    super(message);
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;
  }
}

// 外部API错误
export class ExternalApiError extends Error implements BaseError {
  public readonly name = 'ExternalApiError';
  public details?: Record<string, unknown>;
  public timestamp: string;
  public requestId?: string;

  constructor(message: string, details?: Record<string, unknown>, requestId?: string) {
    super(message);
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;
  }
}

// 内部错误
export class InternalError extends Error implements BaseError {
  public readonly name = 'InternalError';
  public details?: Record<string, unknown>;
  public timestamp: string;
  public requestId?: string;

  constructor(message: string, details?: Record<string, unknown>, requestId?: string) {
    super(message);
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;
  }
}

// 应用错误（通用错误类型）
export class AppError extends Error implements BaseError {
  public readonly name = 'AppError';
  public details?: Record<string, unknown>;
  public timestamp: string;
  public requestId?: string;

  constructor(message: string, details?: Record<string, unknown>, requestId?: string) {
    super(message);
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;
  }
}

// 错误工厂类
export class ErrorFactory {
  static validation(message: string, details?: Record<string, unknown>, requestId?: string): ValidationError {
    return new ValidationError(message, details, requestId);
  }

  static authentication(message: string, details?: Record<string, unknown>, requestId?: string): AuthenticationError {
    return new AuthenticationError(message, details, requestId);
  }

  static authorization(message: string, details?: Record<string, unknown>, requestId?: string): AuthorizationError {
    return new AuthorizationError(message, details, requestId);
  }

  static notFound(message: string, details?: Record<string, unknown>, requestId?: string): NotFoundError {
    return new NotFoundError(message, details, requestId);
  }

  static conflict(message: string, details?: Record<string, unknown>, requestId?: string): ConflictError {
    return new ConflictError(message, details, requestId);
  }

  static rateLimit(message: string, details?: Record<string, unknown>, requestId?: string): RateLimitError {
    return new RateLimitError(message, details, requestId);
  }

  static database(message: string, details?: Record<string, unknown>, requestId?: string): DatabaseError {
    return new DatabaseError(message, details, requestId);
  }

  static network(message: string, details?: Record<string, unknown>, requestId?: string): NetworkError {
    return new NetworkError(message, details, requestId);
  }

  static externalApi(service: string, message: string, details?: Record<string, unknown>, requestId?: string): ExternalApiError {
    return new ExternalApiError(`${service}: ${message}`, details, requestId);
  }

  static internal(message: string, details?: Record<string, unknown>, requestId?: string): InternalError {
    return new InternalError(message, details, requestId);
  }

  static app(message: string, details?: Record<string, unknown>, requestId?: string): AppError {
    return new AppError(message, details, requestId);
  }
}

// 错误处理器类
export class ErrorHandler {
  static withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      const execute = async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          attempts++;
          if (attempts < maxRetries) {
            setTimeout(execute, delay * attempts);
          } else {
            reject(error);
          }
        }
      };

      execute();
    });
  }

  static withFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>
  ): Promise<T> {
    return primaryOperation().catch(() => fallbackOperation());
  }

  static handle(error: unknown): BaseError {
    if (error instanceof Error) {
      return new AppError(error.message, { originalError: error.name });
    }
    return new AppError('Unknown error occurred', { originalError: error });
  }
}

// 导出所有错误类型
export type ErrorType =
  | ValidationError
  | AuthenticationError
  | AuthorizationError
  | NotFoundError
  | ConflictError
  | RateLimitError
  | DatabaseError
  | NetworkError
  | ExternalApiError
  | InternalError
  | AppError;
