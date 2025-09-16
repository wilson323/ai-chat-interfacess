/**
 * API统一响应工具
 * 提供标准化的API响应格式和错误处理
 */

import { NextResponse } from 'next/server';

// Record is a built-in TypeScript utility type
/**
 * API错误码枚举
 */
export enum ApiErrorCode {
  // 通用错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // 业务错误
  AGENT_NOT_FOUND = 'AGENT_NOT_FOUND',
  CHAT_SESSION_EXPIRED = 'CHAT_SESSION_EXPIRED',
  FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',
  VOICE_TRANSCRIPTION_FAILED = 'VOICE_TRANSCRIPTION_FAILED',
  CAD_ANALYSIS_FAILED = 'CAD_ANALYSIS_FAILED',
  IMAGE_PROCESSING_FAILED = 'IMAGE_PROCESSING_FAILED',

  // 外部服务错误
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  REDIS_ERROR = 'REDIS_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
}

/**
 * 成功响应接口
 */
export interface ApiSuccessResponse<T = Record<string, unknown>> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
    requestId: string;
    version?: string;
  };
}

/**
 * 错误响应接口
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
    requestId: string;
    version?: string;
  };
}

/**
 * 分页元数据接口
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 生成请求ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 获取API版本
 */
function getApiVersion(): string {
  return process.env.API_VERSION || 'v1';
}

/**
 * 创建成功响应
 * @param data 响应数据
 * @param message 响应消息
 * @param meta 元数据
 * @param status HTTP状态码
 * @returns NextResponse
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  meta?: Omit<
    ApiSuccessResponse['meta'],
    'timestamp' | 'requestId' | 'version'
  >,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    message,
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      version: getApiVersion(),
    },
  };

  return NextResponse.json(response, { status });
}

/**
 * 创建错误响应
 * @param code 错误码
 * @param message 错误消息
 * @param details 错误详情
 * @param status HTTP状态码
 * @returns NextResponse
 */
export function createErrorResponse(
  code: ApiErrorCode | string,
  message: string,
  details?: unknown,
  status: number = 400
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details: details as Record<string, unknown> | undefined,
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      version: getApiVersion(),
    },
  };

  return NextResponse.json(response, { status });
}

/**
 * 创建分页响应
 * @param data 数据数组
 * @param pagination 分页信息
 * @param message 响应消息
 * @param status HTTP状态码
 * @returns NextResponse
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T[]>> {
  return createSuccessResponse(data, message, { pagination }, status);
}

/**
 * 创建验证错误响应
 * @param errors 验证错误详情
 * @returns NextResponse
 */
export function createValidationErrorResponse(
  errors: Array<Record<string, unknown>>
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    ApiErrorCode.VALIDATION_ERROR,
    '请求参数验证失败',
    { errors: errors as unknown as Record<string, unknown> },
    400
  );
}

/**
 * 创建认证错误响应
 * @param message 错误消息
 * @returns NextResponse
 */
export function createAuthErrorResponse(
  message: string = '认证失败'
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    ApiErrorCode.AUTHENTICATION_ERROR,
    message,
    undefined,
    401
  );
}

/**
 * 创建权限错误响应
 * @param message 错误消息
 * @returns NextResponse
 */
export function createPermissionErrorResponse(
  message: string = '权限不足'
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    ApiErrorCode.AUTHORIZATION_ERROR,
    message,
    undefined,
    403
  );
}

/**
 * 创建未找到错误响应
 * @param resource 资源名称
 * @returns NextResponse
 */
export function createNotFoundErrorResponse(
  resource: string = '资源'
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    ApiErrorCode.NOT_FOUND,
    `${resource}不存在`,
    undefined,
    404
  );
}

/**
 * 创建内部错误响应
 * @param message 错误消息
 * @param details 错误详情
 * @returns NextResponse
 */
export function createInternalErrorResponse(
  message: string = '服务器内部错误',
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    ApiErrorCode.INTERNAL_ERROR,
    message,
    details ? { details: details as Record<string, unknown> } : undefined,
    500
  );
}

/**
 * 创建限流错误响应
 * @param message 错误消息
 * @returns NextResponse
 */
export function createRateLimitErrorResponse(
  message: string = '请求过于频繁，请稍后再试'
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    ApiErrorCode.RATE_LIMIT_EXCEEDED,
    message,
    undefined,
    429
  );
}

/**
 * 创建业务错误响应
 * @param code 业务错误码
 * @param message 错误消息
 * @param details 错误详情
 * @param status HTTP状态码
 * @returns NextResponse
 */
export function createBusinessErrorResponse(
  code: ApiErrorCode,
  message: string,
  details?: unknown,
  status: number = 400
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(code, message, details ? { details: details as Record<string, unknown> } : undefined, status);
}

/**
 * 创建外部服务错误响应
 * @param service 服务名称
 * @param message 错误消息
 * @param details 错误详情
 * @returns NextResponse
 */
export function createExternalServiceErrorResponse(
  service: string,
  message: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    ApiErrorCode.EXTERNAL_API_ERROR,
    `${service}服务错误: ${message}`,
    details ? { details: details as Record<string, unknown> } : undefined,
    502
  );
}

/**
 * 创建数据库错误响应
 * @param message 错误消息
 * @param details 错误详情
 * @returns NextResponse
 */
export function createDatabaseErrorResponse(
  message: string = '数据库操作失败',
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    ApiErrorCode.DATABASE_ERROR,
    message,
    details ? { details: details as Record<string, unknown> } : undefined,
    500
  );
}

/**
 * 创建存储错误响应
 * @param message 错误消息
 * @param details 错误详情
 * @returns NextResponse
 */
export function createStorageErrorResponse(
  message: string = '存储操作失败',
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(ApiErrorCode.STORAGE_ERROR, message, details ? { details: details as Record<string, unknown> } : undefined, 500);
}

/**
 * 响应工具类
 */
export class ResponseUtils {
  /**
   * 检查响应是否成功
   */
  static isSuccess(response: unknown): response is ApiSuccessResponse {
    return !!(response && typeof response === 'object' && 'success' in response && (response as ApiSuccessResponse).success);
  }

  /**
   * 检查响应是否失败
   */
  static isError(response: unknown): response is ApiErrorResponse {
    return !!(response && typeof response === 'object' && 'success' in response && !(response as ApiErrorResponse).success);
  }

  /**
   * 从响应中提取数据
   */
  static extractData<T>(response: ApiSuccessResponse<T>): T {
    return response.data;
  }

  /**
   * 从响应中提取错误信息
   */
  static extractError(response: ApiErrorResponse): string {
    return response.error.message;
  }

  /**
   * 从响应中提取错误码
   */
  static extractErrorCode(response: ApiErrorResponse): string {
    return response.error.code;
  }

  /**
   * 创建分页元数据
   */
  static createPaginationMeta(
    page: number,
    limit: number,
    total: number
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}

/**
 * API响应工具集合
 */
const apiResponseUtils = {
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
  ApiErrorCode,
};

export default apiResponseUtils;
