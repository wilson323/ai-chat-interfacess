/**
 * API相关类型定义
 */

// 重新导出所有API相关类型
export * from './agent-config/cad-analyzer';
export * from './agent-config/image-editor';
export * from './fastgpt';

// API通用类型定义
export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  requestId: string;
}

// 请求参数类型
export interface RequestParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, unknown>;
}

// 响应分页类型
export interface ResponsePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API配置类型
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers?: Record<string, string>;
}

// 通用响应包装器
export interface ResponseWrapper<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version?: string;
  };
}