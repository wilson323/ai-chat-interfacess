/**
 * 性能监控专用类型定义
 * 统一各种性能监控接口，避免类型冲突
 */

import { PerformanceMetric } from './common';

// 基础性能摘要接口
export interface BasePerformanceSummary {
  overallScore: number;
  lastUpdated: string;
  timestamp: number;
}

// 监控专用性能摘要（包含Web Vitals等详细指标）
export interface MonitoringPerformanceSummary extends BasePerformanceSummary {
  // 页面加载指标
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  totalBlockingTime: number;

  // API调用指标
  averageApiResponseTime: number;
  apiCallCount: number;
  apiErrorRate: number;

  // 内存使用
  memoryUsage: number;

  // 网络指标
  networkRequests: number;
  networkErrorRate: number;

  // 错误指标
  errorCount: number;
  errorRate: number;

  // 设备信息
  isMobile: boolean;
  touchResponseTime: number;
  batteryLevel?: number;
  networkType?: string;

  // 趋势分析
  trend: 'improving' | 'stable' | 'degrading';
  changePercentage: number;

  // 资源统计
  resourceCount: number;
}

// 优化专用性能摘要
export interface OptimizationPerformanceSummary extends BasePerformanceSummary {
  categoryScores: Record<string, number>;
  recommendations: string[];
}

// 通用性能摘要（兼容现有代码）
export interface GenericPerformanceSummary {
  category: string;
  score: number;
  maxScore: number;
  details: PerformanceMetric[];
  recommendations?: string[];
}

// 性能历史记录
export interface PerformanceHistory {
  timestamp: number;
  metrics: PerformanceMetrics;
  summary: MonitoringPerformanceSummary;
}

// 性能指标数据
export interface PerformanceMetrics {
  navigationTiming?: PerformanceNavigationTiming;
  paintTiming?: PerformancePaintTiming[];
  resourceTiming?: PerformanceResourceTiming[];
  userTiming?: PerformanceMeasure[];
  memoryUsage?: MemoryInfo;
  apiCalls?: ApiCallMetrics[];
  errors?: ErrorMetrics[];
}

// API调用指标
export interface ApiCallMetrics {
  url: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
  requestSize?: number;
  responseSize?: number;
}

// 错误指标
export interface ErrorMetrics {
  message: string;
  stack?: string;
  timestamp: number;
  type: 'javascript' | 'network' | 'api' | 'resource';
  context?: Record<string, unknown>;
}

// 内存信息
export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

// 性能告警
export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
  resolved: boolean;
}

// A/B测试版本指标
export interface ABTestVersionMetrics {
  version: string;
  metrics: PerformanceMetrics;
  sampleSize: number;
  timestamp: number;
}

// 性能配置
export interface PerformanceConfig {
  // 告警阈值
  thresholds: {
    pageLoadTime: { warning: number; critical: number };
    apiResponseTime: { warning: number; critical: number };
    errorRate: { warning: number; critical: number };
    memoryUsage: { warning: number; critical: number };
    webVitals: {
      fcp: { warning: number; critical: number };
      lcp: { warning: number; critical: number };
      fid: { warning: number; critical: number };
      cls: { warning: number; critical: number };
    };
  };

  // 采样配置
  sampling: {
    enabled: boolean;
    rate: number;
    minSampleSize: number;
  };

  // 存储配置
  storage: {
    maxHistorySize: number;
    cleanupInterval: number;
    compressionEnabled: boolean;
  };

  // 报告配置
  reporting: {
    enabled: boolean;
    interval: number;
    includeRawData: boolean;
    format: 'json' | 'csv' | 'html';
  };

  // 告警配置
  alerts: {
    enabled: boolean;
    debounceMs: number;
    notificationMethods: string[];
  };

  // 优化配置
  optimization: {
    enabled: boolean;
    autoAnalyze: boolean;
    analysisIntervalMs: number;
  };

  // 历史记录配置
  history: {
    enabled: boolean;
    maxRecords: number;
    retentionHours: number;
  };
}

// 性能优化建议
export interface PerformanceOptimization {
  id: string;
  title: string;
  description: string;
  category: 'frontend' | 'backend' | 'network' | 'code';
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedImprovement: string;
  implementation: string;
  priority: number;
  tags: string[];
}

// 性能报告
export interface PerformanceReport {
  summary: MonitoringPerformanceSummary;
  history: PerformanceHistory[];
  alerts: PerformanceAlert[];
  optimizations: PerformanceOptimization[];
  abTestResults?: ABTestVersionMetrics[];
  generatedAt: string;
}

// 类型保护函数
export function isMonitoringPerformanceSummary(obj: unknown): obj is MonitoringPerformanceSummary {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'overallScore' in obj &&
    'pageLoadTime' in obj &&
    'averageApiResponseTime' in obj &&
    'memoryUsage' in obj
  );
}

export function isOptimizationPerformanceSummary(obj: unknown): obj is OptimizationPerformanceSummary {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'overallScore' in obj &&
    'categoryScores' in obj &&
    'recommendations' in obj
  );
}