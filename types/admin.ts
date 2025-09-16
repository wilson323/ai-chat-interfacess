/**
 * 管理端系统类型定义
 */

// 用户管理相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  // 扩展属性
  avatar?: string;
  department?: string;
  phone?: string;
  permissions?: Permission[];
  createdBy?: number;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  OPERATOR = 'operator',
  VIEWER = 'viewer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// 角色权限相关类型
export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
  createdAt: Date;
}

export interface UserRoleMapping {
  id: number;
  userId: number;
  roleId: number;
  assignedBy: number;
  assignedAt: Date;
}

export enum Permission {
  AGENT_MANAGE = 'agent:manage',
  SYSTEM_CONFIG = 'system:config',
  USER_MANAGE = 'user:manage',
  DATA_EXPORT = 'data:export',
  SYSTEM_MONITOR = 'system:monitor',
}

// 系统配置相关类型
export interface SystemConfig {
  id: number;
  configKey: string;
  configValue: string;
  configType: ConfigType;
  description?: string;
  isSensitive: boolean;
  version: number;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum ConfigType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
  ENCRYPTED = 'encrypted',
}

// 操作日志相关类型
export interface OperationLog {
  id: number;
  userId?: number;
  action: string;
  resourceType?: string;
  resourceId?: number;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: OperationStatus;
  createdAt: Date;
}

export enum OperationStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
}

// 模型管理相关类型
export interface ModelConfig {
  id: number;
  name: string;
  type: ModelType;
  version: string;
  provider: string;
  apiEndpoint?: string;
  apiKey?: string;
  maxTokens: number;
  temperature: number;
  status: ModelStatus;
  config?: Record<string, any>;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum ModelType {
  LLM = 'llm',
  VISION = 'vision',
  SPEECH = 'speech',
  EMBEDDING = 'embedding',
}

export enum ModelStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  UPGRADING = 'upgrading',
  ERROR = 'error',
}

// 模型监控相关类型
export interface ModelMetric {
  id: number;
  modelId: number;
  metricType: string;
  metricValue: number;
  timestamp: Date;
  tags?: Record<string, any>;
}

export interface ModelUsageStats {
  id: number;
  modelId: number;
  date: Date;
  requestCount: number;
  tokenCount: number;
  errorCount: number;
  totalCost: number;
  createdAt: Date;
}

// 智能体使用统计相关类型
export interface AgentUsageStats {
  id: number;
  agentId: number;
  userId?: string;
  date: Date;
  requestCount: number;
  sessionCount: number;
  createdAt: Date;
}

// 扩展的智能体配置类型
export interface ExtendedAgentConfig {
  id: number;
  name: string;
  type: string;
  apiKey: string;
  appId: string;
  apiUrl?: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  multimodalModel?: string;
  isPublished: boolean;
  status: AgentStatus;
  version: string;
  description?: string;
  order: number;
  supportsStream: boolean;
  supportsDetail: boolean;
  globalVariables?: string;
  welcomeText?: string;
  createdBy?: number;
  tags?: string[];
  config?: Record<string, any>;
  performanceMetrics?: Record<string, any>;
  lastUsed?: Date;
  usageCount: number;
  updatedAt?: Date;
}

export enum AgentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  DEPRECATED = 'deprecated',
}

// API响应类型
export interface AdminApiResponse<T = any> {
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
      totalPages: number;
    };
  };
}

// 分页请求类型
export interface PaginationRequest {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 搜索过滤器类型
export interface SearchFilter {
  key: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'like' | 'in';
  value: unknown;
}

// 批量操作类型
export interface BulkOperation {
  ids: number[];
  action: string;
  data?: Record<string, any>;
}

// 系统监控相关类型
export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    usage: number;
    total: number;
    available: number;
  };
  disk: {
    usage: number;
    total: number;
    available: number;
  };
  network: {
    incoming: number;
    outgoing: number;
  };
  uptime: number;
  timestamp: Date;
}

export interface AdminPerformanceMetrics {
  responseTime: {
    avg: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requests: number;
    qps: number;
  };
  errorRate: {
    total: number;
    rate: number;
  };
  timestamp: Date;
}

// 告警相关类型
export interface Alert {
  id: number;
  type: AlertType;
  level: AlertLevel;
  title: string;
  message: string;
  resource?: string;
  resourceId?: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: number;
  createdAt: Date;
}

export enum AlertType {
  SYSTEM = 'system',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  BUSINESS = 'business',
}

export enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// 备份恢复相关类型
export interface BackupConfig {
  id: number;
  name: string;
  type: BackupType;
  schedule: BackupSchedule;
  retention: number;
  status: BackupStatus;
  lastBackup?: Date;
  nextBackup?: Date;
  size?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  DIFFERENTIAL = 'differential',
}

export enum BackupSchedule {
  MANUAL = 'manual',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum BackupStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// 导出类型
export * from './agent';
export * from './api';
export * from './message';
// 仅导出 voice 聚合入口，避免与 errors 中语音错误重复
export * from './voice';
// 注意：errors 中也定义了 VoiceError/VoiceErrorType，会与 voice 冲突
// 这里不再整包导出 errors，改为按需在使用处直接从 'types/errors' 导入
// export * from './errors';
// export * from './global'; // 注释掉不存在的文件引用
