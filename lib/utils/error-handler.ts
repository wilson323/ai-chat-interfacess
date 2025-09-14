/**
 * 统一错误处理工具
 */

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  statusCode: number;
}

export class CustomError extends Error implements AppError {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    details?: unknown
  ) {
    super(message);
    this.name = 'CustomError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND_ERROR', 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string, details?: unknown) {
    super(message, 'DATABASE_ERROR', 500, details);
    this.name = 'DatabaseError';
  }
}

export class ExternalServiceError extends CustomError {
  constructor(message: string, details?: unknown) {
    super(message, 'EXTERNAL_SERVICE_ERROR', 502, details);
    this.name = 'ExternalServiceError';
  }
}

/**
 * 错误处理函数
 */
export function handleError(error: unknown): AppError {
  if (error instanceof CustomError) {
    return error;
  }

  if (error instanceof Error) {
    return new CustomError(
      error.message,
      'UNKNOWN_ERROR',
      500,
      { originalError: error.name }
    );
  }

  return new CustomError(
    'An unknown error occurred',
    'UNKNOWN_ERROR',
    500,
    { originalError: error }
  );
}

/**
 * 创建标准化的错误响应
 */
export function createErrorResponse(error: AppError) {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
  };
}

/**
 * 异步操作错误包装器
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorContext?: string
): Promise<{ data?: T; error?: AppError }> {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    const appError = handleError(error);
    if (errorContext) {
      console.error(`Error in ${errorContext}:`, appError);
    }
    return { error: appError };
  }
}

/**
 * 同步操作错误包装器
 */
export function withSyncErrorHandling<T>(
  operation: () => T,
  errorContext?: string
): { data?: T; error?: AppError } {
  try {
    const data = operation();
    return { data };
  } catch (error) {
    const appError = handleError(error);
    if (errorContext) {
      console.error(`Error in ${errorContext}:`, appError);
    }
    return { error: appError };
  }
}

/**
 * 验证输入参数
 */
export function validateInput<T>(
  input: unknown,
  validator: (input: unknown) => input is T,
  errorMessage: string = 'Invalid input'
): T {
  if (!validator(input)) {
    throw new ValidationError(errorMessage, { input });
  }
  return input;
}

/**
 * 检查必需参数
 */
export function requireParam<T>(
  value: T | null | undefined,
  paramName: string
): T {
  if (value === null || value === undefined) {
    throw new ValidationError(`Missing required parameter: ${paramName}`);
  }
  return value;
}

/**
 * 检查字符串非空
 */
export function requireNonEmptyString(
  value: string | null | undefined,
  paramName: string
): string {
  const str = requireParam(value, paramName);
  if (str.trim().length === 0) {
    throw new ValidationError(`Parameter ${paramName} cannot be empty`);
  }
  return str;
}

/**
 * 检查数字范围
 */
export function requireNumberInRange(
  value: number | null | undefined,
  paramName: string,
  min: number,
  max: number
): number {
  const num = requireParam(value, paramName);
  if (num < min || num > max) {
    throw new ValidationError(
      `Parameter ${paramName} must be between ${min} and ${max}`
    );
  }
  return num;
}
