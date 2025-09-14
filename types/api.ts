/**
 * API相关类型定义
 * 统一的API接口类型和响应格式
 */

import { ApiErrorCode } from '@/lib/api/response';

/**
 * 通用API响应类型
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * 成功响应接口
 */
export interface ApiSuccessResponse<T = any> {
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
    details?: any;
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
 * 查询参数接口
 */
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filter?: string;
}

/**
 * 排序参数接口
 */
export interface SortParams {
  sort?: string;
  order: 'asc' | 'desc';
}

/**
 * 搜索参数接口
 */
export interface SearchParams {
  search?: string;
  filter?: string;
}

/**
 * 分页参数接口
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * 智能体相关API类型
 */
export interface AgentListResponse {
  agents: Agent[];
  pagination: PaginationMeta;
}

export interface AgentDetailResponse {
  agent: Agent;
}

export interface CreateAgentRequest {
  name: string;
  description?: string;
  type: 'chat' | 'cad' | 'image';
  iconType?: string;
  avatar?: string;
  order?: number;
  isPublished?: boolean;
  apiKey: string;
  appId: string;
  apiUrl: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  multimodalModel?: string;
  globalVariables?: GlobalVariable[];
  welcomeText?: string;
}

export interface UpdateAgentRequest extends Partial<CreateAgentRequest> {
  id: string;
}

export interface DeleteAgentRequest {
  id: string;
}

/**
 * 聊天相关API类型
 */
export interface ChatMessageResponse {
  message: Message;
}

export interface ChatMessagesResponse {
  messages: Message[];
  pagination: PaginationMeta;
}

export interface SendMessageRequest {
  message: string;
  agentId: string;
  sessionId?: string;
  globalVariables?: Record<string, any>;
  stream?: boolean;
}

export interface SendMessageResponse {
  message: Message;
  sessionId: string;
}

export interface ChatSessionResponse {
  sessionId: string;
  messages: Message[];
  agent: Agent;
  createdAt: string;
  updatedAt: string;
}

/**
 * 文件上传相关API类型
 */
export interface FileUploadResponse {
  file: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    uploadedAt: string;
  };
}

export interface FileUploadRequest {
  file: File;
  type: 'image' | 'audio' | 'document' | 'cad';
  maxSize?: number;
}

/**
 * 语音相关API类型
 */
export interface VoiceTranscribeResponse {
  transcription: {
    text: string;
    language: string;
    confidence: number;
    duration: number;
  };
}

export interface VoiceTranscribeRequest {
  audio: File;
  language?: string;
  model?: string;
}

export interface VoiceConfigResponse {
  config: {
    language: string;
    autoStart: boolean;
    autoStop: boolean;
    maxDuration: number;
  };
}

export interface VoiceConfigRequest {
  language?: string;
  autoStart?: boolean;
  autoStop?: boolean;
  maxDuration?: number;
}

/**
 * CAD分析相关API类型
 */
export interface CADAnalyzeResponse {
  analysis: {
    id: string;
    fileName: string;
    fileSize: number;
    analysisType: string;
    results: CADAnalysisResult;
    metadata: CADMetadata;
    createdAt: string;
  };
}

export interface CADAnalyzeRequest {
  file: File;
  analysisType?: 'basic' | 'detailed' | 'advanced';
  includeMetadata?: boolean;
}

export interface CADAnalysisResult {
  summary: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
    units: string;
  };
  components: CADComponent[];
  materials: CADMaterial[];
  properties: Record<string, any>;
}

export interface CADComponent {
  name: string;
  type: string;
  quantity: number;
  dimensions: Record<string, number>;
  position: { x: number; y: number; z: number };
}

export interface CADMaterial {
  name: string;
  type: string;
  properties: Record<string, any>;
}

export interface CADMetadata {
  software: string;
  version: string;
  createdBy: string;
  createdAt: string;
  lastModified: string;
}

/**
 * 图像处理相关API类型
 */
export interface ImageProcessResponse {
  processedImage: {
    id: string;
    originalName: string;
    processedName: string;
    url: string;
    operations: string[];
    parameters: Record<string, any>;
    createdAt: string;
  };
}

export interface ImageProcessRequest {
  file: File;
  operations: ('resize' | 'crop' | 'rotate' | 'filter' | 'enhance')[];
  parameters?: Record<string, any>;
}

/**
 * 用户相关API类型
 */
export interface UserResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    isAdmin: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserResponse['user'];
  token: string;
  expiresIn: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  avatar?: string;
}

/**
 * 配置相关API类型
 */
export interface ConfigResponse {
  config: {
    app: AppConfig;
    features: FeatureConfig;
    models: ModelConfig;
  };
}

export interface AppConfig {
  name: string;
  version: string;
  environment: string;
  debug: boolean;
}

export interface FeatureConfig {
  voiceEnabled: boolean;
  cadAnalysisEnabled: boolean;
  imageProcessingEnabled: boolean;
  fileUploadEnabled: boolean;
  maxFileSize: number;
  supportedFormats: string[];
}

export interface ModelConfig {
  chat: ModelInfo[];
  voice: ModelInfo[];
  image: ModelInfo[];
  cad: ModelInfo[];
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  enabled: boolean;
  config: Record<string, any>;
}

/**
 * 健康检查API类型
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    storage: ServiceStatus;
    external: ServiceStatus;
  };
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

export interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck: string;
  error?: string;
}

/**
 * 错误监控API类型
 */
export interface ErrorStatsResponse {
  stats: {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    recent: ErrorLog[];
  };
  pagination: PaginationMeta;
}

export interface ErrorLog {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  context: Record<string, any>;
  timestamp: string;
  resolved: boolean;
}

/**
 * 统计相关API类型
 */
export interface StatsResponse {
  stats: {
    users: {
      total: number;
      active: number;
      new: number;
    };
    agents: {
      total: number;
      published: number;
      drafts: number;
    };
    chats: {
      total: number;
      today: number;
      thisWeek: number;
      thisMonth: number;
    };
    files: {
      total: number;
      totalSize: number;
      byType: Record<string, number>;
    };
  };
  period: {
    start: string;
    end: string;
  };
}

/**
 * 导出相关API类型
 */
export interface ExportRequest {
  type: 'agents' | 'chats' | 'users' | 'errors';
  format: 'json' | 'csv' | 'xlsx';
  filters?: Record<string, any>;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ExportResponse {
  downloadUrl: string;
  filename: string;
  expiresAt: string;
}

/**
 * 批量操作API类型
 */
export interface BatchOperationRequest {
  operation: 'delete' | 'update' | 'publish' | 'unpublish';
  ids: string[];
  data?: Record<string, any>;
}

export interface BatchOperationResponse {
  success: string[];
  failed: Array<{
    id: string;
    error: string;
  }>;
  total: number;
  successCount: number;
  failureCount: number;
}

/**
 * 搜索相关API类型
 */
export interface SearchRequest {
  query: string;
  type?: 'agents' | 'chats' | 'users' | 'files';
  filters?: Record<string, any>;
  pagination?: PaginationParams;
}

export interface SearchResponse<T = any> {
  results: T[];
  query: string;
  total: number;
  pagination: PaginationMeta;
  suggestions?: string[];
}

/**
 * 通知相关API类型
 */
export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

/**
 * 系统信息API类型
 */
export interface SystemInfoResponse {
  system: {
    nodeVersion: string;
    platform: string;
    arch: string;
    uptime: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
      cores: number;
    };
  };
  database: {
    type: string;
    version: string;
    connections: number;
    maxConnections: number;
  };
  redis: {
    version: string;
    memory: number;
    keys: number;
  };
}

/**
 * API错误类型
 */
export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: any;
  timestamp: string;
  requestId: string;
}

/**
 * 请求上下文类型
 */
export interface RequestContext {
  requestId: string;
  userId?: string;
  userAgent: string;
  ip: string;
  timestamp: string;
  method: string;
  url: string;
}

/**
 * 中间件配置类型
 */
export interface MiddlewareConfig {
  logging: boolean;
  validation: boolean;
  auth: boolean;
  rateLimit: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
  cache: {
    enabled: boolean;
    ttl: number;
  };
  cors: {
    enabled: boolean;
    origins: string[];
  };
}

/**
 * 默认导出
 */
export default {
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
  PaginationMeta,
  QueryParams,
  SortParams,
  SearchParams,
  PaginationParams,
  AgentListResponse,
  AgentDetailResponse,
  CreateAgentRequest,
  UpdateAgentRequest,
  DeleteAgentRequest,
  ChatMessageResponse,
  ChatMessagesResponse,
  SendMessageRequest,
  SendMessageResponse,
  ChatSessionResponse,
  FileUploadResponse,
  FileUploadRequest,
  VoiceTranscribeResponse,
  VoiceTranscribeRequest,
  VoiceConfigResponse,
  VoiceConfigRequest,
  CADAnalyzeResponse,
  CADAnalyzeRequest,
  CADAnalysisResult,
  CADComponent,
  CADMaterial,
  CADMetadata,
  ImageProcessResponse,
  ImageProcessRequest,
  UserResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UpdateUserRequest,
  ConfigResponse,
  AppConfig,
  FeatureConfig,
  ModelConfig,
  ModelInfo,
  HealthCheckResponse,
  ServiceStatus,
  ErrorStatsResponse,
  ErrorLog,
  StatsResponse,
  ExportRequest,
  ExportResponse,
  BatchOperationRequest,
  BatchOperationResponse,
  SearchRequest,
  SearchResponse,
  NotificationResponse,
  Notification,
  SystemInfoResponse,
  ApiError,
  RequestContext,
  MiddlewareConfig,
};
