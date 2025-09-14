import {
  HeatmapDataPoint,
  UsageStatistics,
  HeatmapQueryParams,
  HeatmapService,
  AggregationOptions
} from '@/types/heatmap';
import { AgentUsage, UserGeo, AgentConfig } from '@/lib/db/models';
import { sequelize } from '@/lib/db/sequelize';
import logger from '@/lib/utils/logger';

/**
 * 热点地图数据聚合服务
 * 提供数据聚合、统计和可视化支持
 */
export class HeatmapServiceImpl implements HeatmapService {
  private readonly defaultAggregationOptions: AggregationOptions = {
    groupBy: 'country',
    timeWindow: 'day',
    includeAnonymous: true,
    minAccuracyLevel: 1,
  };

  /**
   * 获取热点地图数据
   */
  public async getHeatmapData(params: HeatmapQueryParams): Promise<HeatmapDataPoint[]> {
    try {
      // 检查数据库连接状态
      if (!sequelize || !sequelize.authenticate) {
        logger.warn('数据库未连接，返回模拟数据');
        return this.getMockHeatmapData(params);
      }

      const {
        startDate,
        endDate,
        agentType,
        messageType,
        country,
        region,
        city,
        userId,
        timeRange,
        granularity = 'day',
      } = params;

      // 构建查询条件
      const timeRangeObj = this.resolveTimeRange(timeRange);
      const queryStartDate = startDate || timeRangeObj.start;
      const queryEndDate = endDate || timeRangeObj.end;

      // 构建WHERE条件
      const whereClause: any = {};
      if (queryStartDate && queryEndDate) {
        whereClause.startTime = {
          [sequelize.Op.between]: [queryStartDate, queryEndDate],
        };
      }

      if (agentType) {
        whereClause['$agent.type$'] = agentType;
      }

      if (messageType) {
        whereClause.messageType = messageType;
      }

      if (userId) {
        whereClause.userId = userId;
      }

      // 地理位置过滤条件
      const geoWhereClause: any = {};
      if (country) {
        geoWhereClause[sequelize.literal('(location->>"country")')] = country;
      }
      if (region) {
        geoWhereClause[sequelize.literal('(location->>"region")')] = region;
      }
      if (city) {
        geoWhereClause[sequelize.literal('(location->>"city")')] = city;
      }

      // 执行查询
      const results = await AgentUsage.findAll({
        where: whereClause,
        include: [
          {
            model: UserGeo,
            as: 'geoLocation',
            where: Object.keys(geoWhereClause).length > 0 ? geoWhereClause : undefined,
            required: false,
          },
          {
            model: AgentConfig,
            as: 'agent',
            required: true,
          },
        ],
        attributes: [
          'id',
          'sessionId',
          'messageType',
          'startTime',
          'messageCount',
          [sequelize.literal('COUNT(DISTINCT sessionId)'), 'sessionCount'],
          [sequelize.literal('SUM(messageCount)'), 'totalMessages'],
        ],
        group: this.getGroupByClause(granularity, true),
        order: [[sequelize.literal('totalMessages'), 'DESC']],
        raw: false,
      });

      // 转换为热点地图数据点
      return this.transformToHeatmapPoints(results, granularity);
    } catch (error) {
      logger.error('Failed to get heatmap data:', error);
      // 数据库连接失败时返回模拟数据
      return this.getMockHeatmapData(params);
    }
  }

  /**
   * 获取模拟热点地图数据
   */
  private getMockHeatmapData(params: HeatmapQueryParams): HeatmapDataPoint[] {
    const mockData: HeatmapDataPoint[] = [
      {
        id: '1',
        latitude: 39.9042,
        longitude: 116.4074,
        country: 'China',
        region: 'Beijing',
        city: 'Beijing',
        count: 150,
        intensity: 0.8,
        timestamp: new Date(),
        agentType: 'fastgpt',
        messageType: 'text',
        userId: 'user1',
        accuracy: 0.9,
        metadata: {
          device: 'desktop',
          browser: 'Chrome',
          os: 'Windows'
        }
      },
      {
        id: '2',
        latitude: 31.2304,
        longitude: 121.4737,
        country: 'China',
        region: 'Shanghai',
        city: 'Shanghai',
        count: 120,
        intensity: 0.7,
        timestamp: new Date(),
        agentType: 'openai',
        messageType: 'voice',
        userId: 'user2',
        accuracy: 0.85,
        metadata: {
          device: 'mobile',
          browser: 'Safari',
          os: 'iOS'
        }
      },
      {
        id: '3',
        latitude: 22.3193,
        longitude: 114.1694,
        country: 'China',
        region: 'Hong Kong',
        city: 'Hong Kong',
        count: 80,
        intensity: 0.6,
        timestamp: new Date(),
        agentType: 'claude',
        messageType: 'image',
        userId: 'user3',
        accuracy: 0.75,
        metadata: {
          device: 'tablet',
          browser: 'Firefox',
          os: 'Android'
        }
      }
    ];

    // 根据参数过滤数据
    let filteredData = mockData;

    if (params.country) {
      filteredData = filteredData.filter(item => item.country === params.country);
    }

    if (params.region) {
      filteredData = filteredData.filter(item => item.region === params.region);
    }

    if (params.city) {
      filteredData = filteredData.filter(item => item.city === params.city);
    }

    if (params.agentType) {
      filteredData = filteredData.filter(item => item.agentType === params.agentType);
    }

    if (params.messageType) {
      filteredData = filteredData.filter(item => item.messageType === params.messageType);
    }

    return filteredData;
  }

  /**
   * 获取使用统计数据
   */
  public async getUsageStatistics(params: HeatmapQueryParams): Promise<UsageStatistics> {
    try {
      const {
        startDate,
        endDate,
        agentType,
        messageType,
        country,
        timeRange,
      } = params;

      const timeRangeObj = this.resolveTimeRange(timeRange);
      const queryStartDate = startDate || timeRangeObj.start;
      const queryEndDate = endDate || timeRangeObj.end;

      // 构建基础查询条件
      const whereClause: any = {};
      if (queryStartDate && queryEndDate) {
        whereClause.startTime = {
          [sequelize.Op.between]: [queryStartDate, queryEndDate],
        };
      }

      if (agentType) {
        whereClause['$agent.type$'] = agentType;
      }

      if (messageType) {
        whereClause.messageType = messageType;
      }

      if (country) {
        whereClause['$geoLocation.location.country$'] = country;
      }

      // 并行执行多个统计查询
      const [
        totalSessions,
        totalMessages,
        uniqueUsers,
        uniqueLocations,
        topCountries,
        topAgents,
        messageTypeDistribution,
        timeSeriesData,
      ] = await Promise.all([
        this.getTotalSessions(whereClause),
        this.getTotalMessages(whereClause),
        this.getUniqueUsers(whereClause),
        this.getUniqueLocations(whereClause),
        this.getTopCountries(whereClause),
        this.getTopAgents(whereClause),
        this.getMessageTypeDistribution(whereClause),
        this.getTimeSeriesData(whereClause, queryStartDate, queryEndDate),
      ]);

      // 计算平均会话持续时间
      const avgDuration = await this.getAverageSessionDuration(whereClause);

      return {
        totalSessions,
        totalMessages,
        totalUsers: uniqueUsers,
        uniqueLocations,
        averageSessionDuration: avgDuration,
        topCountries,
        topAgents,
        messageTypeDistribution,
        timeSeriesData,
      };
    } catch (error) {
      logger.error('Failed to get usage statistics:', error);
      throw new Error('Failed to fetch usage statistics');
    }
  }

  /**
   * 获取实时活动数据
   */
  public async getRealtimeActivity(): Promise<HeatmapDataPoint[]> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      const results = await AgentUsage.findAll({
        where: {
          startTime: {
            [sequelize.Op.gte]: fiveMinutesAgo,
          },
        },
        include: [
          {
            model: UserGeo,
            as: 'geoLocation',
            required: false,
          },
        ],
        attributes: [
          'id',
          'sessionId',
          'startTime',
          [sequelize.literal('COUNT(*)'), 'activityCount'],
        ],
        group: ['geoLocation.id'],
        order: [[sequelize.literal('activityCount'), 'DESC']],
        limit: 100,
      });

      return this.transformToHeatmapPoints(results, 'realtime');
    } catch (error) {
      logger.error('Failed to get realtime activity:', error);
      throw new Error('Failed to fetch realtime activity');
    }
  }

  /**
   * 导出数据
   */
  public async exportData(
    params: HeatmapQueryParams,
    format: 'csv' | 'json'
  ): Promise<string> {
    try {
      const data = await this.getHeatmapData(params);

      if (format === 'json') {
        return JSON.stringify(data, null, 2);
      }

      if (format === 'csv') {
        return this.convertToCSV(data);
      }

      throw new Error(`Unsupported export format: ${format}`);
    } catch (error) {
      logger.error('Failed to export data:', error);
      throw new Error('Failed to export data');
    }
  }

  // 私有辅助方法

  private resolveTimeRange(timeRange?: string): { start: Date; end: Date } {
    const end = new Date();
    let start: Date;

    switch (timeRange) {
      case '1h':
        start = new Date(end.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000); // 默认7天
    }

    return { start, end };
  }

  private getGroupByClause(granularity: string, includeLocation: boolean): string[] {
    const groupBy: string[] = [];

    if (includeLocation) {
      groupBy.push('geoLocation.id');
    }

    switch (granularity) {
      case 'hour':
        groupBy.push(sequelize.fn('DATE_TRUNC', 'hour', sequelize.col('startTime')));
        break;
      case 'day':
        groupBy.push(sequelize.fn('DATE_TRUNC', 'day', sequelize.col('startTime')));
        break;
      case 'week':
        groupBy.push(sequelize.fn('DATE_TRUNC', 'week', sequelize.col('startTime')));
        break;
      case 'month':
        groupBy.push(sequelize.fn('DATE_TRUNC', 'month', sequelize.col('startTime')));
        break;
      case 'realtime':
        // 实时数据不需要时间分组
        break;
    }

    return groupBy;
  }

  private transformToHeatmapPoints(results: any[], granularity: string): HeatmapDataPoint[] {
    return results.map((result, index) => {
      const geoLocation = result.geoLocation;

      return {
        id: `point_${index}_${Date.now()}`,
        latitude: geoLocation?.location?.latitude || 0,
        longitude: geoLocation?.location?.longitude || 0,
        count: parseInt(result.get('sessionCount') || result.get('activityCount') || 1),
        country: geoLocation?.location?.country || 'Unknown',
        city: geoLocation?.location?.city,
        region: geoLocation?.location?.region,
        agentType: result.agent?.type,
        messageType: result.messageType,
        timeRange: {
          start: result.startTime,
          end: new Date(),
        },
      };
    }).filter(point => point.latitude !== 0 && point.longitude !== 0);
  }

  private async getTotalSessions(whereClause: any): Promise<number> {
    const result = await AgentUsage.count({
      where: whereClause,
      distinct: true,
      col: 'sessionId',
    });
    return result;
  }

  private async getTotalMessages(whereClause: any): Promise<number> {
    const result = await AgentUsage.sum('messageCount', {
      where: whereClause,
    });
    return result || 0;
  }

  private async getUniqueUsers(whereClause: any): Promise<number> {
    const result = await AgentUsage.count({
      where: whereClause,
      distinct: true,
      col: 'userId',
    });
    return result;
  }

  private async getUniqueLocations(whereClause: any): Promise<number> {
    const result = await AgentUsage.count({
      where: whereClause,
      distinct: true,
      col: 'geoLocationId',
    });
    return result;
  }

  private async getTopCountries(whereClause: any): Promise<Array<{ country: string; count: number; percentage: number }>> {
    const results = await AgentUsage.findAll({
      where: whereClause,
      include: [
        {
          model: UserGeo,
          as: 'geoLocation',
          required: false,
        },
      ],
      attributes: [
        [sequelize.literal('(geoLocation.location->>"country")'), 'country'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('sessionId'))), 'count'],
      ],
      group: [sequelize.literal('(geoLocation.location->>"country")')],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 10,
      raw: true,
    });

    const total = results.reduce((sum, item: any) => sum + parseInt(item.count), 0);

    return results.map((item: any) => ({
      country: item.country || 'Unknown',
      count: parseInt(item.count),
      percentage: total > 0 ? (parseInt(item.count) / total) * 100 : 0,
    }));
  }

  private async getTopAgents(whereClause: any): Promise<Array<{ agentId: number; agentName: string; usageCount: number; percentage: number }>> {
    const results = await AgentUsage.findAll({
      where: whereClause,
      include: [
        {
          model: AgentConfig,
          as: 'agent',
          required: true,
        },
      ],
      attributes: [
        'agentId',
        [sequelize.literal('agent.name'), 'agentName'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('sessionId'))), 'usageCount'],
      ],
      group: ['agentId', 'agent.id'],
      order: [[sequelize.literal('usageCount'), 'DESC']],
      limit: 10,
      raw: true,
    });

    const total = results.reduce((sum, item: any) => sum + parseInt(item.usageCount), 0);

    return results.map((item: any) => ({
      agentId: parseInt(item.agentId),
      agentName: item.agentName || 'Unknown',
      usageCount: parseInt(item.usageCount),
      percentage: total > 0 ? (parseInt(item.usageCount) / total) * 100 : 0,
    }));
  }

  private async getMessageTypeDistribution(whereClause: any): Promise<Array<{ type: string; count: number; percentage: number }>> {
    const results = await AgentUsage.findAll({
      where: whereClause,
      attributes: [
        'messageType',
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('sessionId'))), 'count'],
      ],
      group: ['messageType'],
      order: [[sequelize.literal('count'), 'DESC']],
      raw: true,
    });

    const total = results.reduce((sum, item: any) => sum + parseInt(item.count), 0);

    return results.map((item: any) => ({
      type: item.messageType,
      count: parseInt(item.count),
      percentage: total > 0 ? (parseInt(item.count) / total) * 100 : 0,
    }));
  }

  private async getTimeSeriesData(whereClause: any, startDate?: Date, endDate?: Date): Promise<Array<{ date: string; sessions: number; messages: number; users: number }>> {
    const results = await AgentUsage.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'day', sequelize.col('startTime')), 'date'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('sessionId'))), 'sessions'],
        [sequelize.fn('SUM', sequelize.col('messageCount')), 'messages'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('userId'))), 'users'],
      ],
      group: [sequelize.fn('DATE_TRUNC', 'day', sequelize.col('startTime'))],
      order: [[sequelize.fn('DATE_TRUNC', 'day', sequelize.col('startTime')), 'ASC']],
      raw: true,
    });

    return results.map((item: any) => ({
      date: item.date.toISOString().split('T')[0],
      sessions: parseInt(item.sessions),
      messages: parseInt(item.messages) || 0,
      users: parseInt(item.users),
    }));
  }

  private async getAverageSessionDuration(whereClause: any): Promise<number> {
    const result = await AgentUsage.findOne({
      where: whereClause,
      attributes: [
        [sequelize.fn('AVG', sequelize.col('duration')), 'avgDuration'],
      ],
      raw: true,
    });

    return result ? parseFloat(result.avgDuration) || 0 : 0;
  }

  private convertToCSV(data: HeatmapDataPoint[]): string {
    const headers = ['id', 'latitude', 'longitude', 'count', 'country', 'city', 'region', 'agentType', 'messageType', 'startTime', 'endTime'];
    const rows = data.map(point => [
      point.id,
      point.latitude,
      point.longitude,
      point.count,
      point.country,
      point.city || '',
      point.region || '',
      point.agentType || '',
      point.messageType || '',
      point.timeRange.start.toISOString(),
      point.timeRange.end.toISOString(),
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

// 创建单例实例
export const heatmapService = new HeatmapServiceImpl();
