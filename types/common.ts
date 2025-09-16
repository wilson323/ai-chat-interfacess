/**
 * 通用类型定义
 * 用于替换项目中的 any 类型，提供更严格的类型安全
 */

// 基础通用类型
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

// 数据库相关通用类型
export interface DatabaseColumn {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: JsonValue;
  isPrimaryKey: boolean;
  isUnique?: boolean;
  isIndexed?: boolean;
  comment?: string;
}

export interface DatabaseTable {
  name: string;
  columns: DatabaseColumn[];
  indexes?: DatabaseIndex[];
  constraints?: DatabaseConstraint[];
  comment?: string;
}

export interface DatabaseIndex {
  name: string;
  columns: string[];
  unique: boolean;
  type?: 'btree' | 'hash' | 'gin' | 'gist';
}

export interface DatabaseConstraint {
  name: string;
  type: 'primary_key' | 'foreign_key' | 'unique' | 'check';
  columns: string[];
  references?: {
    table: string;
    column: string;
  };
  checkExpression?: string;
}

// 表单相关通用类型
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file' | 'date' | 'datetime';
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: unknown) => boolean | string;
  };
  defaultValue?: JsonValue;
}

export interface FormData {
  [key: string]: JsonValue;
}

// 图表数据相关类型
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
  metadata?: JsonObject;
}

export interface ChartData {
  name: string;
  data: ChartDataPoint[];
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'area';
  color?: string;
  metadata?: JsonObject;
}

export interface ChartConfig {
  title?: string;
  xAxis?: {
    label?: string;
    type?: 'category' | 'value' | 'time';
  };
  yAxis?: {
    label?: string;
    min?: number;
    max?: number;
  };
  legend?: {
    show: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
  };
  tooltip?: {
    show: boolean;
    formatter?: (data: ChartDataPoint) => string;
  };
}

// 性能监控相关类型
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
  metadata?: JsonObject;
}

export interface PerformanceSummary {
  category: string;
  score: number;
  maxScore: number;
  details: PerformanceMetric[];
  recommendations?: string[];
}

// 地理位置相关类型
export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
}

export interface GeoData {
  location: GeoLocation;
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  ip?: string;
  userAgent?: string;
}

// 文件上传相关类型
export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress?: number;
  error?: string;
  metadata?: JsonObject;
}

// 搜索和过滤相关类型
export interface SearchQuery {
  q?: string;
  filters?: Record<string, JsonValue>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface SearchResult<T = JsonObject> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  facets?: Record<string, Array<{ value: string; count: number }>>;
}

// 事件相关类型
export interface EventData {
  type: string;
  payload: JsonObject;
  timestamp: Date;
  source?: string;
  userId?: string;
  sessionId?: string;
  metadata?: JsonObject;
}

// 配置相关类型
export interface ConfigValue {
  key: string;
  value: JsonValue;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
  };
}

export interface ConfigSection {
  name: string;
  description?: string;
  configs: ConfigValue[];
}

// 错误相关类型
export interface ErrorDetails {
  code: string;
  message: string;
  stack?: string;
  context?: JsonObject;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

// 缓存相关类型
export interface CacheEntry<T = JsonValue> {
  key: string;
  value: T;
  ttl: number;
  createdAt: Date;
  expiresAt: Date;
  tags?: string[];
}

// 导出相关类型
export interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx' | 'pdf';
  filename?: string;
  includeMetadata?: boolean;
  filters?: Record<string, JsonValue>;
  columns?: string[];
}

export interface ExportResult {
  success: boolean;
  filename: string;
  url?: string;
  size?: number;
  error?: string;
}

// 统计相关类型
export interface StatisticValue {
  value: number;
  label: string;
  unit?: string;
  change?: {
    value: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  metadata?: JsonObject;
}

export interface StatisticGroup {
  name: string;
  values: StatisticValue[];
  period: {
    start: Date;
    end: Date;
  };
}

// 通用响应类型
export interface ApiResponse<T = JsonValue> {
  success: boolean;
  data?: T;
  error?: ErrorDetails;
  meta?: {
    timestamp: string;
    requestId: string;
    version?: string;
  };
}

// 分页相关类型
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedData<T = JsonObject> {
  data: T[];
  pagination: PaginationMeta;
}

// 批量操作相关类型
export interface BulkOperationRequest {
  action: string;
  ids: string[];
  data?: JsonObject;
  options?: JsonObject;
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
  results?: JsonObject[];
}

// 实时数据相关类型
export interface RealtimeData {
  id: string;
  type: string;
  data: JsonObject;
  timestamp: Date;
  source: string;
}

export interface RealtimeSubscription {
  id: string;
  type: string;
  filters?: Record<string, JsonValue>;
  callback: (data: RealtimeData) => void;
}

// 工具函数类型
export type Predicate<T> = (value: T) => boolean;
export type Mapper<T, U> = (value: T) => U;
export type Reducer<T, U> = (accumulator: U, currentValue: T) => U;
export type Comparator<T> = (a: T, b: T) => number;

// 异步操作相关类型
export interface AsyncOperation<T = JsonValue> {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
  result?: T;
  error?: ErrorDetails;
  startedAt: Date;
  completedAt?: Date;
  metadata?: JsonObject;
}

// 版本控制相关类型
export interface VersionInfo {
  version: string;
  buildNumber?: string;
  commitHash?: string;
  buildDate?: Date;
  environment: 'development' | 'staging' | 'production';
  features?: string[];
  dependencies?: Record<string, string>;
}

// 健康检查相关类型
export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  details?: JsonObject;
  lastChecked: Date;
  responseTime?: number;
}

export interface SystemHealth {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  checks: HealthCheck[];
  timestamp: Date;
  uptime: number;
  version: string;
}
