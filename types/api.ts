/**
 * API相关类型定义
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    timestamp: string;
    requestId: string;
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface UserBehaviorData {
  hourlyActivity: Array<{ hour: number; count: number }>;
  userRetention: {
    activeUsers: Array<{ count: number }>;
  };
  userSegments: Array<{ userCount: number }>;
}

export interface AgentPerformanceData {
  responseTimeDistribution: Array<{
    agentId: string;
    agentName: string;
    median: number;
  }>;
  errorRates: Array<{
    agentId: string;
    errorRate: number;
  }>;
  satisfactionAnalysis: Array<{
    agentId: string;
    avgSatisfaction: number;
  }>;
}

export interface ConversationData {
  totalMessages: number;
  avgResponseTime: number;
  satisfactionScore: number;
}

export interface BusinessValueData {
  costAnalysis: {
    estimatedCost: number;
    optimizationSuggestions: Array<{
      type: string;
      description: string;
      potentialSavings: number;
    }>;
  };
  roiAnalysis: {
    roi: number;
  };
}

export interface PredictionData {
  userGrowth: {
    growthRate: number;
  };
}

export interface AnalyticsSummary {
  totalSessions: number;
  activeUsers: number;
  avgSatisfaction: number;
  totalCost: number;
  roi: number;
  predictedGrowth: number;
}

export interface AnalyticsData {
  userBehavior?: UserBehaviorData;
  agentPerformance?: AgentPerformanceData;
  conversation?: ConversationData;
  businessValue?: BusinessValueData;
  prediction?: PredictionData;
  summary?: AnalyticsSummary;
}

export interface DatabaseWhereClause {
  [key: string]: unknown;
}

export interface ExportData {
  startDate?: string;
  endDate?: string;
  format: 'csv' | 'excel' | 'json';
  dataType: 'usage' | 'sessions' | 'agents' | 'locations';
  includeHeaders: boolean;
  agentId?: string;
  location?: string;
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

export interface SecurityIssue {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  affectedFiles?: string[];
}

export interface SecurityScanResult {
  issues: SecurityIssue[];
  overallScore: number;
  recommendations: string[];
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'moderator' | 'admin';
  isActive: boolean;
  createdAt: string;
  lastActiveAt: string;
}

export interface BulkUserUpdate {
  userIds: string[];
  updates: Partial<Pick<UserData, 'role' | 'isActive'>>;
}

export interface ModelAttribute {
  name: string;
  type: string;
  allowNull: boolean;
  defaultValue: unknown;
  primaryKey: boolean;
  autoIncrement: boolean;
}

export interface ApiDatabaseTable {
  name: string;
  columns: ModelAttribute[];
}

export interface DatabaseSchema {
  tables: ApiDatabaseTable[];
}
