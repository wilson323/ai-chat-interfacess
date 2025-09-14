/**
 * 统一类型定义中心
 * 避免重复类型定义，确保类型一致性
 */

// 核心业务类型
export * from './agent';
export * from './message';
export * from './voice';
export * from './errors';
export * from './heatmap';

// API相关类型
export * from './api';

// 全局类型定义
export * from './global';

// 重新导出常用类型，提供便捷访问
export type {
  Agent,
  AgentType,
  ConversationAgentType,
  NonConversationAgentType,
  GlobalVariable,
} from './agent';

export type { Message, MessageRole, MessageStatus } from './message';

export type {
  VoiceConfig,
  VoiceRecorderState,
  VoicePlayerState,
} from './voice';

export type { ApiError, ValidationError, NetworkError } from './errors';

// 统一API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
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

// 统一分页类型
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 统一配置类型
export interface AppConfig {
  database: DatabaseConfig;
  api: ApiConfig;
  features: FeatureConfig;
  security: SecurityConfig;
  redis: RedisConfig;
  storage: StorageConfig;
  monitoring: MonitoringConfig;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

export interface FeatureConfig {
  enableVoice: boolean;
  enableFileUpload: boolean;
  enableImageUpload: boolean;
  enableStreaming: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
}

export interface SecurityConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptRounds: number;
  corsOrigins: string[];
  rateLimitEnabled: boolean;
}

export interface RedisConfig {
  host: string;
  port: number;
  password: string;
  db: number;
}

export interface StorageConfig {
  uploadPath: string;
  tempPath: string;
  provider: 'local' | 'aws' | 'azure' | 'gcp';
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucketName: string;
  };
}

export interface MonitoringConfig {
  enabled: boolean;
  endpoint: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// 统一错误类型
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    stack?: string;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

// 统一成功响应类型
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    requestId: string;
  };
}
