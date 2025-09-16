// 热点地图相关的类型定义

// 地理位置
export interface GeoLocationInfo {
  country: string;
  countryCode: string;
  region?: string;
  regionCode?: string;
  city?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  continent?: string;
}

// IP地理位置映射
export interface UserGeoAttributes {
  id: number;
  userId?: number; // 关联用户ID，匿名用户为null
  sessionId?: string; // 会话ID，用于匿名用户追踪
  ipAddress: string;
  location: GeoLocationInfo;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserGeoCreationAttributes
  extends Omit<
    UserGeoAttributes,
    'id' | 'userId' | 'sessionId' | 'createdAt' | 'updatedAt'
  > {
  id?: number;
  userId?: number;
  sessionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 智能体使用统计
export interface AgentUsageAttributes {
  id: number;
  sessionId: string; // 关联ChatSession的sessionId
  userId?: number; // 关联用户ID，匿名用户为null
  agentId: number; // 关联AgentConfig的id
  messageType: 'text' | 'image' | 'file' | 'voice' | 'mixed';
  messageCount: number;
  tokenUsage?: number; // Token使用量
  responseTime?: number; // 响应时间（毫秒）
  startTime: Date;
  endTime?: Date;
  duration?: number; // 会话持续时间（秒）
  isCompleted: boolean;
  userSatisfaction?: 'positive' | 'negative' | 'neutral'; // 用户满意度
  geoLocationId?: number; // 关联的地理位置ID
  deviceInfo?: DeviceInfo; // 设备信息
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentUsageCreationAttributes
  extends Omit<
    AgentUsageAttributes,
    | 'id'
    | 'userId'
    | 'tokenUsage'
    | 'responseTime'
    | 'endTime'
    | 'duration'
    | 'userSatisfaction'
    | 'geoLocationId'
    | 'deviceInfo'
    | 'createdAt'
    | 'updatedAt'
  > {
  id?: number;
  userId?: number;
  tokenUsage?: number;
  responseTime?: number;
  endTime?: Date;
  duration?: number;
  userSatisfaction?: 'positive' | 'negative' | 'neutral';
  geoLocationId?: number;
  deviceInfo?: DeviceInfo;
  createdAt?: Date;
  updatedAt?: Date;
}

// 设备信息
export interface DeviceInfo {
  userAgent?: string;
  platform?: string; // windows/mac/linux/android/ios
  browser?: string; // chrome/firefox/safari/edge
  deviceType?: string; // desktop/mobile/tablet
  language?: string;
  timezoneOffset?: number;
}

// 热点地图数据聚合接口
export interface HeatmapDataPoint {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  country: string;
  city?: string;
  region?: string;
  agentType?: string;
  messageType?: string;
  timeRange: {
    start: Date;
    end: Date;
  };
}

// 统计数据接口
export interface UsageStatistics {
  totalSessions: number;
  totalMessages: number;
  totalUsers: number;
  uniqueLocations: number;
  averageSessionDuration: number;
  topCountries: Array<{
    country: string;
    count: number;
    percentage: number;
  }>;
  topAgents: Array<{
    agentId: number;
    agentName: string;
    usageCount: number;
    percentage: number;
  }>;
  messageTypeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    sessions: number;
    messages: number;
    users: number;
  }>;
}

// 查询参数接口
export interface HeatmapQueryParams {
  startDate?: Date;
  endDate?: Date;
  agentType?: string;
  messageType?: string;
  country?: string;
  region?: string;
  city?: string;
  userId?: number;
  timeRange?: '1h' | '24h' | '7d' | '30d' | '90d' | '1y';
  granularity?: 'hour' | 'day' | 'week' | 'month';
}

// 地理位置服务接口
export interface GeoLocationService {
  getLocationByIp(ipAddress: string): Promise<GeoLocationInfo>;
  getLocationByBatch(ipAddresses: string[]): Promise<
    Array<{
      ip: string;
      location: GeoLocationInfo | null;
      error?: string;
    }>
  >;
  clearCache(): Promise<void>;
}

// 热点地图聚合服务接口
export interface HeatmapService {
  getHeatmapData(params: HeatmapQueryParams): Promise<HeatmapDataPoint[]>;
  getUsageStatistics(params: HeatmapQueryParams): Promise<UsageStatistics>;
  getRealtimeActivity(): Promise<HeatmapDataPoint[]>;
  exportData(
    params: HeatmapQueryParams,
    format: 'csv' | 'json'
  ): Promise<string>;
}

// IP地理位置解析器类型
export interface IpGeoResolver {
  name: string;
  resolve(ipAddress: string): Promise<GeoLocationInfo>;
  isAvailable(): Promise<boolean>;
}

// 缓存策略
export interface CacheStrategy {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  clear(): Promise<void>;
}

// 数据聚合选项
export interface AggregationOptions {
  groupBy: 'country' | 'region' | 'city' | 'coordinate';
  timeWindow: 'hour' | 'day' | 'week' | 'month';
  includeAnonymous: boolean;
  minAccuracyLevel?: number;
}
