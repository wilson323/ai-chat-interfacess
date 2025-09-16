/**
 * 统一类型定义中心
 * 避免重复类型定义，确保类型一致性
 */

// 通用类型定义
export * from './common';

// 核心业务类型
export * from './agent';
export * from './message';
export * from './voice';
// 避免与 voice 内的 VoiceError/VoiceErrorType 重复导出冲突
// 如需错误类型请从 'types/errors' 按需导入
// export * from './errors';
export * from './heatmap';
export * from './api/fastgpt';

// 性能监控类型 - 避免重复导出，按需选择
export type {
  BasePerformanceSummary,
  MonitoringPerformanceSummary,
  PerformanceMetrics,
  PerformanceAlert,
  PerformanceConfig,
  PerformanceReport,
  ErrorMetrics,
} from './performance-monitoring';

// 基准测试类型 - 重命名ChartData避免冲突
export type {
  BenchmarkConfig,
  BenchmarkResult,
  BenchmarkSuite,
  BenchmarkSummary,
  GradeDistribution,
  BenchmarkState,
} from './benchmark';

// 重命名ChartData为BenchmarkChartData
export type {
  ChartData as BenchmarkChartData,
} from './benchmark';

// 性能优化类型 - 使用export type避免重复
export type {
  PerformanceOptimization,
  CategoryBreakdown,
  OptimizationAnalysis,
  OptimizationFilters,
  OptimizationState,
  PerformanceSummary as OptimizationPerformanceSummary,
} from './optimization';

// API相关类型
export * from './api';

// 主题系统类型 - 基础版
export * from './theme';

// 主题系统类型 - 增强版
export * from './theme-enhanced';

// 全局类型定义
// export * from './global';

// 重新导出常用类型，提供便捷访问
export type {
  Agent,
  AgentType,
  ConversationAgentType,
  NonConversationAgentType,
} from './agent';

// 全局变量类型从 global-variable.ts 统一导出
export type {
  GlobalVariable,
  GlobalVariableBase,
  GlobalVariableFull,
  GlobalVariableSimple,
  GlobalVariableValue,
  GlobalVariableConfig,
  GlobalVariableValueType,
  GlobalVariableTypeEnum,
  AgentGlobalVariable,
  SimpleGlobalVariable,
} from './global-variable';

export type { Message, MessageRole } from './message';

export type {
  VoiceConfig,
  VoiceRecordingState,
  VoiceErrorType,
  VoiceEventType,
  VoiceError,
  VoiceEvent,
} from './voice';

// 主题系统增强类型重新导出 - 通过theme-enhanced统一导出

// 主题推荐系统类型重新导出
export type {
  UserBehavior,
  ThemeUsageRecord,
  InteractionPreference,
  TimePreference,
  DevicePreference,
  ContentTypePreference,
  ColorPreference,
  TimeContext,
  DeviceContext,
  ContentContext,
  RecommendationContext,
  IThemeRecommendationAlgorithm,
  ThemeRecommendationEngine,
  UserBehaviorCollector,
  BehaviorBasedRecommendation,
  TimeBasedRecommendation,
  DeviceBasedRecommendation,
  ContentBasedRecommendation,
} from '../lib/theme/theme-recommender';

// 主题监控类型重新导出
export type {
  MonitorEvent,
  PerformanceViolation,
  ConsistencyViolation,
  MonitorConfig,
  ThemePerformanceMonitor,
  ThemeConsistencyMonitor,
  ThemeMonitor,
} from '../lib/theme/theme-monitor';

// Lovart色彩映射类型重新导出
export type {
  ThemeToLovartMapping,
} from '../lib/theme/lovart-color-mapping';

// 色彩工具类型重新导出 - 避免重复导出
// ColorUtils 已经在 theme-enhanced.ts 中导出

// 增强主题管理器类型重新导出
export type {
  EnhancedThemeManager,
} from '../lib/theme/theme-manager-enhanced';

// 主题配置类型重新导出
export type {
  enhancedThemeConfigs,
  modernThemeEnhanced,
  businessThemeEnhanced,
  techThemeEnhanced,
} from '../lib/theme/themes/modern-enhanced';

// export type { ApiError, ValidationError, NetworkError } from './errors';

// 统一API响应类型
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
  theme: ThemeSystemConfig; // 新增主题系统配置
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
  enableThemeEnhancement: boolean; // 新增主题增强功能
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

// 主题配置
export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
  };
  spacing: {
    unit: number;
    scale: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
}

// 推荐配置
export interface RecommendationConfig {
  enabled: boolean;
  algorithm: 'collaborative' | 'content-based' | 'hybrid';
  weights: {
    userPreference: number;
    popularity: number;
    recency: number;
    relevance: number;
  };
  refreshInterval: number; // minutes
  maxRecommendations: number;
}

// 主题系统配置
export interface ThemeSystemConfig {
  /** 是否启用增强功能 */
  enhancedFeatures: {
    /** 色彩系统增强 */
    colorEnhancement: boolean;
    /** 响应式设计 */
    responsiveDesign: boolean;
    /** 深色模式 */
    darkMode: boolean;
    /** 动效系统 */
    animations: boolean;
    /** 智能推荐 */
    smartRecommendation: boolean;
    /** 性能监控 */
    performanceMonitoring: boolean;
    /** 一致性检查 */
    consistencyCheck: boolean;
  };
  /** 默认主题 */
  defaultTheme: string;
  /** 主题配置 */
  themes: ThemeConfig[];
  /** 监控配置 */
  monitoring: MonitoringConfig;
  /** 推荐配置 */
  recommendation: RecommendationConfig;
}

// 统一错误类型
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

// 统一成功响应类型
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    requestId: string;
  };
}
