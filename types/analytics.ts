/**
 * 分析相关类型定义
 */

export interface AgentUsageData {
  agentId: string;
  agentName: string;
  agentType: string;
  usage: number;
  duration: number;
  responseTime: number;
  satisfaction: number;
  errorRate: number;
  userCount: number;
  messageCount: number;
  tokenUsage: number;
  lastUsed: string;
}

export interface RadarData {
  agent: string;
  usage: number;
  duration: number;
  responseTime: number;
  satisfaction: number;
  errorRate: number;
  fullMark: number;
}

export interface ComparisonData {
  type: string;
  value: number;
  percentage?: number;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
}

export interface LocationComparisonData {
  country: string;
  region: string;
  city: string;
  value: number;
  percentage: number;
}

export interface UserTypeComparisonData {
  type: '登录用户' | '匿名用户';
  value: number;
  percentage: number;
}

export interface DeviceTypeComparisonData {
  deviceType: string;
  value: number;
  percentage: number;
}

export interface AgentTypeComparisonData {
  agentType: string;
  value: number;
  percentage: number;
}

export interface AnalyticsQueryParams {
  startDate?: string;
  endDate?: string;
  chartType?: 'pie' | 'bar' | 'radar';
  groupBy?: 'usage' | 'duration' | 'responseTime' | 'satisfaction';
  metric?: 'count' | 'duration' | 'responseTime' | 'satisfaction';
  level?: 'country' | 'region' | 'city';
  dimension?: 'location' | 'userType' | 'deviceType' | 'agentType';
}

export interface AnalyticsResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: string;
  meta?: {
    timestamp: string;
    requestId: string;
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface ExportParams {
  startDate?: string;
  endDate?: string;
  format: 'csv' | 'excel' | 'json';
  dataType: 'usage' | 'sessions' | 'agents' | 'locations';
  includeHeaders: boolean;
  agentId?: string;
  location?: string;
}

export interface HeatmapQueryParams {
  startDate?: Date;
  endDate?: Date;
  agentType?: string;
  messageType?: 'text' | 'image' | 'file' | 'voice';
  country?: string;
  region?: string;
  city?: string;
  userId?: number;
  timeRange?: '1h' | '6h' | '24h' | '7d' | '30d';
  granularity?: 'hour' | 'day' | 'week' | 'month';
}

export interface HeatmapData {
  coordinates: Array<{
    lat: number;
    lng: number;
    intensity: number;
    count: number;
    timestamp: string;
  }>;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  totalPoints: number;
  maxIntensity: number;
  timeRange: {
    start: string;
    end: string;
  };
}

// PerformanceMetrics moved to lib/performance/monitor.ts

export interface MobileOptimization {
  type: 'image' | 'font' | 'script' | 'css' | 'lazy-loading' | 'compression';
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  implemented: boolean;
}

export interface BenchmarkResult {
  name: string;
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface BenchmarkRunResult {
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}
