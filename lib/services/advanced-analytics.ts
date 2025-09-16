import { AgentUsage as AgentUsageModel, User, AgentConfig } from '../db/models';
// Record is a built-in TypeScript utility type, no need to import
import { Op, fn, col, literal } from 'sequelize';
import { format } from 'date-fns';

// AgentUsage数据接口 - 用于分析服务的数据结构
export interface AgentUsageData {
  id?: number;
  sessionId: string;
  userId?: number;
  agentId: number;
  messageType: 'text' | 'image' | 'file' | 'voice' | 'mixed';
  messageCount: number;
  responseTime?: number;
  duration?: number;
  tokenUsage?: number;
  userSatisfaction?: 'positive' | 'neutral' | 'negative';
  isCompleted: boolean;
  startTime?: Date;
  endTime?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// 移除未使用的 UsageData 类型

export interface UserBehaviorData {
  hourlyActivity: Array<{ hour: number; count: number }>;
  userRetention: {
    newUsers: Array<{ date: string; count: number }>;
    activeUsers: Array<{ date: string; count: number }>;
    churnedUsers: Array<{ date: string; count: number }>;
  };
  userPaths: Array<{
    userId: number;
    agentSequence: number[];
    conversionRates: number[];
  }>;
  userSegments: Array<{
    segment: string;
    userCount: number;
    avgUsage: number;
    avgSatisfaction: string;
  }>;
}

export interface AgentPerformanceData {
  responseTimeDistribution: Array<{
    agentId: number;
    agentName: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    outliers: number;
  }>;
  errorRates: Array<{
    agentId: number;
    agentName: string;
    errorRate: number;
    totalSessions: number;
    errorSessions: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  satisfactionAnalysis: Array<{
    agentId: number;
    agentName: string;
    avgSatisfaction: number;
    satisfactionDistribution: {
      positive: number;
      neutral: number;
      negative: number;
    };
    trend: 'improving' | 'declining' | 'stable';
  }>;
  performanceRadar: Array<{
    agentId: number;
    agentName: string;
    speed: number;
    reliability: number;
    satisfaction: number;
    efficiency: number;
    popularity: number;
  }>;
}

export interface ConversationAnalyticsData {
  messageTypeDistribution: {
    text: number;
    image: number;
    file: number;
    voice: number;
    mixed: number;
    total: number;
  };
  conversationLength: {
    avgLength: number;
    distribution: Array<{ range: string; count: number; percentage: number }>;
  };
  keywordAnalysis: Array<{
    keyword: string;
    frequency: number;
    trend: 'up' | 'down' | 'stable';
    relatedAgents: number[];
  }>;
  languageDistribution: Array<{
    language: string;
    percentage: number;
    geoDistribution: Array<{ region: string; percentage: number }>;
  }>;
}

export interface BusinessValueData {
  costAnalysis: {
    totalTokens: number;
    estimatedCost: number;
    costByAgent: Array<{
      agentId: number;
      agentName: string;
      tokens: number;
      cost: number;
      percentage: number;
    }>;
    optimizationSuggestions: Array<{
      type: string;
      potentialSavings: number;
      description: string;
    }>;
  };
  roiAnalysis: {
    totalInvestment: number;
    estimatedValue: number;
    roi: number;
    roiByAgent: Array<{
      agentId: number;
      agentName: string;
      investment: number;
      value: number;
      roi: number;
    }>;
  };
  efficiencyMetrics: {
    avgSessionDuration: number;
    avgResponseTime: number;
    userProductivity: number;
    timeSaved: number;
  };
  valueAssessment: Array<{
    agentId: number;
    agentName: string;
    businessValue: number;
    userAdoption: number;
    strategicImportance: number;
    overallScore: number;
  }>;
}

export interface PredictionData {
  usageTrend: {
    historical: Array<{ date: string; actual: number; predicted: number }>;
    forecast: Array<{ date: string; predicted: number; confidence: number }>;
    accuracy: number;
  };
  userGrowth: {
    historical: Array<{ date: string; users: number }>;
    predicted: Array<{ date: string; users: number; confidence: number }>;
    growthRate: number;
  };
  resourceForecast: {
    predictedLoad: Array<{
      date: string;
      cpu: number;
      memory: number;
      storage: number;
    }>;
    recommendations: Array<{
      type: string;
      action: string;
      timeframe: string;
      impact: string;
    }>;
  };
  anomalyDetection: Array<{
    timestamp: string;
    metric: string;
    value: number;
    expected: number;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
}

export class AdvancedAnalyticsService {
  // 用户行为分析
  static async getUserBehaviorAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<UserBehaviorData> {
    const [hourlyActivity, userRetention, userPaths, userSegments] =
      await Promise.all([
        this.getHourlyActivity(startDate, endDate),
        this.getUserRetention(startDate, endDate),
        this.getUserPaths(startDate, endDate),
        this.getUserSegments(startDate, endDate),
      ]);

    return {
      hourlyActivity,
      userRetention,
      userPaths,
      userSegments,
    };
  }

  private static async getHourlyActivity(startDate: Date, endDate: Date) {
    const activity = await AgentUsageModel.findAll({
      where: {
        startTime: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: [
        [fn('EXTRACT', literal('HOUR FROM "startTime"')), 'hour'],
        [fn('COUNT', col('id')), 'count'],
      ],
      group: [fn('EXTRACT', literal('HOUR FROM "startTime"'))],
      order: [[literal('hour'), 'ASC']],
      raw: true,
    });

    // 填充24小时数据
    const result = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: 0,
    }));

    (activity as unknown as Array<{ hour: string; count: string }>).forEach((item: { hour: string; count: string }) => {
      const hour = parseInt(item.hour, 10);
      const count = parseInt(item.count, 10);
      if (hour >= 0 && hour < 24) {
        result[hour].count = count;
      }
    });

    return result;
  }

  private static async getUserRetention(startDate: Date, endDate: Date) {
    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const result = {
      newUsers: [] as Array<{ date: string; count: number }>,
      activeUsers: [] as Array<{ date: string; count: number }>,
      churnedUsers: [] as Array<{ date: string; count: number }>,
    };

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(
        startDate.getTime() + i * 24 * 60 * 60 * 1000
      );
      const nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

      // 新用户：当天首次使用
      const newUsers = await AgentUsageModel.count({
        where: {
          startTime: {
            [Op.between]: [currentDate, nextDate],
          },
        },
        include: [
          {
            model: User,
            where: {
              createdAt: {
                [Op.between]: [currentDate, nextDate],
              },
            },
          },
        ],
      });

      // 活跃用户：当天有使用记录
      const activeUsers = await AgentUsageModel.count({
        where: {
          startTime: {
            [Op.between]: [currentDate, nextDate],
          },
        },
        distinct: true,
        col: 'userId',
      });

      // 流失用户：7天未活跃
      const churnDate = new Date(
        currentDate.getTime() - 7 * 24 * 60 * 60 * 1000
      );
      const churnedUsers = await User.count({
        where: {
          createdAt: {
            [Op.lt]: churnDate,
          },
          // isActive: true, // 移除不存在的属性
        },
      });

      result.newUsers.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        count: newUsers,
      });
      result.activeUsers.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        count: activeUsers,
      });
      result.churnedUsers.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        count: Array.isArray(churnedUsers) ? churnedUsers.length : churnedUsers,
      });
    }

    return result;
  }

  private static async getUserPaths(startDate: Date, endDate: Date) {
    const sessions = await AgentUsageModel.findAll({
      where: {
        startTime: {
          [Op.between]: [startDate, endDate],
        },
        userId: {
          [Op.ne]: null,
        } as any,
      },
      attributes: ['userId', 'agentId', 'startTime'],
      order: [['userId', 'startTime']],
      include: [User],
    });

    const userPaths = new Map<number, number[]>();

    sessions.forEach(session => {
      if (session.userId) {
        if (!userPaths.has(session.userId)) {
          userPaths.set(session.userId, []);
        }
        userPaths.get(session.userId)!.push(session.agentId);
      }
    });

    return Array.from(userPaths.entries()).map(([userId, agentSequence]) => ({
      userId,
      agentSequence: Array.from(new Set(agentSequence)), // 去重
      conversionRates: this.calculateConversionRates(agentSequence),
    }));
  }

  private static calculateConversionRates(sequence: number[]): number[] {
    const rates: number[] = [];
    for (let i = 1; i < sequence.length; i++) {
      // const _fromAgent = sequence[i - 1];
      // const _toAgent = sequence[i];
      // 简化的转换率计算，实际应该基于历史数据
      rates.push(Math.random() * 0.3 + 0.7); // 70-100%
    }
    return rates;
  }

  private static async getUserSegments(startDate: Date, endDate: Date) {
    const userStats = await AgentUsageModel.findAll({
      where: {
        startTime: {
          [Op.between]: [startDate, endDate],
        },
        userId: {
          [Op.ne]: null,
        } as any,
      },
      attributes: [
        'userId',
        [fn('COUNT', col('id')), 'sessionCount'],
        [fn('SUM', col('duration')), 'totalDuration'],
        [fn('AVG', col('userSatisfaction')), 'avgSatisfaction'],
      ],
      group: ['userId'],
      include: [User],
      raw: true,
    });

    const segments = {
      高频用户: { users: [] as string[], totalUsage: 0, totalSatisfaction: 0 },
      中频用户: { users: [] as string[], totalUsage: 0, totalSatisfaction: 0 },
      低频用户: { users: [] as string[], totalUsage: 0, totalSatisfaction: 0 },
    };

    userStats.forEach(
      (stat: AgentUsageModel) => {
        // 从实际属性中计算统计数据
        const sessionCount = 1; // 每个记录代表一个会话
        const duration = stat.duration || 0;
        const satisfaction = stat.userSatisfaction === 'positive' ? 1 : stat.userSatisfaction === 'negative' ? -1 : 0;

        let segment: keyof typeof segments = '低频用户';
        if (sessionCount > 10 || duration > 3600) segment = '高频用户';
        else if (sessionCount > 3 || duration > 600) segment = '中频用户';

        if (stat.userId) {
          segments[segment].users.push(String(stat.userId));
        }
        segments[segment].totalUsage += duration;
        segments[segment].totalSatisfaction += satisfaction;
      }
    );

    return Object.entries(segments).map(
      ([segment, data]: [
        string,
        { users: string[]; totalUsage: number; totalSatisfaction: number },
      ]) => ({
        segment,
        userCount: data.users.length,
        avgUsage: data.totalUsage / data.users.length || 0,
        avgSatisfaction: (
          data.totalSatisfaction / data.users.length || 0
        ).toFixed(2),
      })
    );
  }

  // 智能体性能分析
  static async getAgentPerformanceAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<AgentPerformanceData> {
    const [
      responseTimeDistribution,
      errorRates,
      satisfactionAnalysis,
      performanceRadar,
    ] = await Promise.all([
      this.getResponseTimeDistribution(startDate, endDate),
      this.getErrorRates(startDate, endDate),
      this.getSatisfactionAnalysis(startDate, endDate),
      this.getPerformanceRadar(startDate, endDate),
    ]);

    return {
      responseTimeDistribution,
      errorRates,
      satisfactionAnalysis,
      performanceRadar,
    };
  }

  private static async getResponseTimeDistribution(
    startDate: Date,
    endDate: Date
  ) {
    const agents = await AgentConfig.findAll({
      include: [
        {
          model: AgentUsageModel,
          where: {
            startTime: {
              [Op.between]: [startDate, endDate],
            },
            responseTime: {
              [Op.not]: null,
            },
          },
          required: false,
        },
      ],
    });

    return agents.map(agent => {
      const sessions: Array<AgentUsageModel> =
        (((agent as unknown) as { usages?: Array<AgentUsageModel> }).usages || []);
      const responseTimes = sessions
        .map((usage: AgentUsageModel) => usage.responseTime)
        .filter((v): v is number => typeof v === 'number');

      if (responseTimes.length === 0) {
        return {
          agentId: agent.id,
          agentName: agent.name,
          min: 0,
          q1: 0,
          median: 0,
          q3: 0,
          max: 0,
          outliers: 0,
        };
      }

      const sorted = responseTimes.sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const median = sorted[Math.floor(sorted.length * 0.5)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;
      const outliers = sorted.filter(
        t => t < q1 - 1.5 * iqr || t > q3 + 1.5 * iqr
      ).length;

      return {
        agentId: agent.id,
        agentName: agent.name,
        min: sorted[0],
        q1,
        median,
        q3,
        max: sorted[sorted.length - 1],
        outliers,
      };
    });
  }

  private static async getErrorRates(startDate: Date, endDate: Date) {
    const agents = await AgentConfig.findAll({
      include: [
        {
          model: AgentUsageModel,
          where: {
            startTime: {
              [Op.between]: [startDate, endDate],
            },
          },
          required: false,
        },
      ],
    });

    return agents.map(agent => {
      const sessions: Array<AgentUsageModel> =
        (((agent as unknown) as { usages?: Array<AgentUsageModel> }).usages || []);
      const totalSessions = sessions.length;
      const errorSessions = sessions.filter(
        (s: AgentUsageModel) => !s.isCompleted
      ).length;
      const errorRate = totalSessions > 0 ? errorSessions / totalSessions : 0;

      // 简单的趋势分析
      const recentErrorRate =
        sessions
          .filter(
            (s: AgentUsageModel) =>
              new Date(s.startTime) >
              new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
          )
          .filter((s: AgentUsageModel) => !s.isCompleted).length /
          sessions.filter(
            (s: AgentUsageModel) =>
              new Date(s.startTime) >
              new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
          ).length || 0;

      const trend: 'up' | 'down' | 'stable' =
        recentErrorRate > errorRate * 1.1
          ? 'up'
          : recentErrorRate < errorRate * 0.9
            ? 'down'
            : 'stable';

      return {
        agentId: agent.id,
        agentName: agent.name,
        errorRate,
        totalSessions,
        errorSessions,
        trend,
      };
    });
  }

  private static async getSatisfactionAnalysis(startDate: Date, endDate: Date) {
    const agents = await AgentConfig.findAll({
      include: [
        {
          model: AgentUsageModel,
          where: {
            startTime: {
              [Op.between]: [startDate, endDate],
            },
            userSatisfaction: {
              [Op.not]: null,
            },
          },
          required: false,
        },
      ],
    });

    return agents.map(agent => {
      const satisfactions =
        ((agent as any).usages || [])
          ?.map((u: AgentUsageModel) => u.userSatisfaction)
          .filter(Boolean) || [];

      if (satisfactions.length === 0) {
        return {
          agentId: agent.id,
          agentName: agent.name,
          avgSatisfaction: 0,
          satisfactionDistribution: { positive: 0, neutral: 0, negative: 0 },
          trend: 'stable' as const,
        };
      }

      const distribution = {
        positive: satisfactions.filter((s: string) => s === 'positive').length,
        neutral: satisfactions.filter((s: string) => s === 'neutral').length,
        negative: satisfactions.filter((s: string) => s === 'negative').length,
      };

      // 计算平均满意度 (3=positive, 2=neutral, 1=negative)
      const avgSatisfaction =
        (distribution.positive * 3 +
          distribution.neutral * 2 +
          distribution.negative * 1) /
        satisfactions.length;

      // 趋势分析
      const recentSatisfactions = satisfactions.slice(
        -Math.floor(satisfactions.length / 3)
      );
      const recentAvg =
        (recentSatisfactions.filter((s: string) => s === 'positive').length * 3 +
          recentSatisfactions.filter((s: string) => s === 'neutral').length * 2 +
          recentSatisfactions.filter((s: string) => s === 'negative').length * 1) /
        recentSatisfactions.length;

      const trend = recentAvg > avgSatisfaction * 1.05
        ? 'improving' as const
        : recentAvg < avgSatisfaction * 0.95
          ? 'declining' as const
          : 'stable' as const;

      return {
        agentId: agent.id,
        agentName: agent.name,
        avgSatisfaction,
        satisfactionDistribution: distribution,
        trend: trend as 'stable' | 'improving' | 'declining',
      };
    });
  }

  private static async getPerformanceRadar(startDate: Date, endDate: Date) {
    const agents = await AgentConfig.findAll({
      include: [
        {
          model: AgentUsageModel,
          where: {
            startTime: {
              [Op.between]: [startDate, endDate],
            },
          },
          required: false,
        },
      ],
    });

    return agents.map(agent => {
      const sessions = ((agent as any).usages || []);

      // 速度 (0-100, 响应时间越短分数越高)
      const avgResponseTime =
        sessions.reduce(
          (sum: number, s: AgentUsageModel) => sum + (s.responseTime || 0),
          0
        ) / (sessions.length || 1);
      const speed = Math.max(0, Math.min(100, 100 - avgResponseTime / 10));

      // 可靠性 (0-100, 完成率)
      const completedSessions = sessions.filter(
        (s: AgentUsageModel) => s.isCompleted
      ).length;
      const reliability =
        sessions.length > 0 ? (completedSessions / sessions.length) * 100 : 0;

      // 满意度 (0-100)
      const satisfactions = sessions
        .map((s: AgentUsageModel) => s.userSatisfaction)
        .filter(Boolean);
      const satisfaction =
        satisfactions.length > 0
          ? (satisfactions.filter((s: string) => s === 'positive').length * 100 +
              satisfactions.filter((s: string) => s === 'neutral').length * 50) /
            satisfactions.length
          : 0;

      // 效率 (0-100, 基于token使用效率)
      const totalTokens = sessions.reduce(
        (sum: number, s: AgentUsageModel) => sum + (s.tokenUsage || 0),
        0
      );
      const totalMessages = sessions.reduce(
        (sum: number, s: AgentUsageModel) => sum + s.messageCount,
        0
      );
      const efficiency =
        totalMessages > 0
          ? Math.max(0, Math.min(100, 100 - totalTokens / totalMessages / 100))
          : 0;

      // 受欢迎程度 (0-100, 使用频率)
      const maxUsage = Math.max(
        ...agents.map(a =>
          ((((a as unknown) as { usages?: Array<AgentUsageModel> }).usages || []).length)
        )
      );
      const popularity = maxUsage > 0 ? (sessions.length / maxUsage) * 100 : 0;

      return {
        agentId: agent.id,
        agentName: agent.name,
        speed: Math.round(speed),
        reliability: Math.round(reliability),
        satisfaction: Math.round(satisfaction),
        efficiency: Math.round(efficiency),
        popularity: Math.round(popularity),
      };
    });
  }

  // 其他分析方法将在这里继续实现...

  // 对话内容分析
  static async getConversationAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<ConversationAnalyticsData> {
    const [
      messageTypeDistribution,
      conversationLength,
      keywordAnalysis,
      languageDistribution,
    ] = await Promise.all([
      this.getMessageTypeDistribution(startDate, endDate),
      this.getConversationLength(startDate, endDate),
      this.getKeywordAnalysis(startDate, endDate),
      this.getLanguageDistribution(startDate, endDate),
    ]);

    return {
      messageTypeDistribution,
      conversationLength,
      keywordAnalysis,
      languageDistribution,
    };
  }

  private static async getMessageTypeDistribution(
    startDate: Date,
    endDate: Date
  ) {
    const distribution = await AgentUsageModel.findAll({
      where: {
        startTime: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: [
        'messageType',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('messageCount')), 'totalMessages'],
      ],
      group: ['messageType'],
      raw: true,
    });

    const result: ConversationAnalyticsData['messageTypeDistribution'] = {
      text: 0,
      image: 0,
      file: 0,
      voice: 0,
      mixed: 0,
      total: 0,
    };

    (distribution as unknown as Array<{ messageType: string; count: string; totalMessages?: string }>).forEach((item) => {
      const key = item.messageType as keyof typeof result;
      if (key in result) {
        (result as any)[key] = parseInt(item.count, 10);
      }
      result.total += parseInt(item.totalMessages || item.count, 10);
    });

    return result;
  }

  private static async getConversationLength(startDate: Date, endDate: Date) {
    const sessions = await AgentUsageModel.findAll({
      where: {
        startTime: {
          [Op.between]: [startDate, endDate],
        },
        duration: { [Op.not]: undefined },
      },
      attributes: ['duration', 'messageCount'],
      raw: true,
    });

    const durations = sessions.map(
      (s: AgentUsageModel) => s.duration || 0
    );
    const avgLength =
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0;

    // 创建分布区间
    const ranges = [
      { range: '0-30秒', min: 0, max: 30 },
      { range: '30-60秒', min: 30, max: 60 },
      { range: '1-2分钟', min: 60, max: 120 },
      { range: '2-5分钟', min: 120, max: 300 },
      { range: '5-10分钟', min: 300, max: 600 },
      { range: '10分钟以上', min: 600, max: Infinity },
    ];

    const distribution = ranges.map(range => {
      const count = durations.filter(
        d => d >= range.min && d < range.max
      ).length;
      return {
        range: range.range,
        count,
        percentage: durations.length > 0 ? (count / durations.length) * 100 : 0,
      };
    });

    return {
      avgLength: Math.round(avgLength),
      distribution,
    };
  }

  private static async getKeywordAnalysis(_startDate: Date, _endDate: Date) {
    // 简化的关键词分析，实际应该从对话内容中提取
    const commonKeywords = [
      '分析',
      '设计',
      '开发',
      '测试',
      '部署',
      '优化',
      '修复',
      '新建',
      '修改',
      '查询',
      '图像',
      '文件',
      '语音',
      '文本',
      '数据',
    ];

    // 模拟关键词频率数据
    return commonKeywords
      .map(keyword => ({
        keyword,
        frequency: Math.floor(Math.random() * 100) + 10,
        trend: (Math.random() > 0.5
            ? 'up'
            : Math.random() > 0.5
              ? 'down'
              : 'stable') as 'up' | 'down' | 'stable',
        relatedAgents: Array.from(
          { length: Math.floor(Math.random() * 3) + 1 },
          () => Math.floor(Math.random() * 5) + 1
        ),
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  private static async getLanguageDistribution(_startDate: Date, _endDate: Date) {
    const languages = [
      { code: 'zh', name: '中文', percentage: 85 },
      { code: 'en', name: 'English', percentage: 12 },
      { code: 'ja', name: '日本語', percentage: 2 },
      { code: 'ko', name: '한국어', percentage: 1 },
    ];

    return languages.map(lang => ({
      language: lang.name,
      percentage: lang.percentage,
      geoDistribution: [
        { region: '中国', percentage: lang.code === 'zh' ? 90 : 5 },
        { region: '北美', percentage: lang.code === 'en' ? 80 : 10 },
        { region: '欧洲', percentage: lang.code === 'en' ? 70 : 15 },
        { region: '其他', percentage: 10 },
      ],
    }));
  }

  // 业务价值分析
  static async getBusinessValueAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<BusinessValueData> {
    const [costAnalysis, roiAnalysis, efficiencyMetrics, valueAssessment] =
      await Promise.all([
        this.getCostAnalysis(startDate, endDate),
        this.getRoiAnalysis(startDate, endDate),
        this.getEfficiencyMetrics(startDate, endDate),
        this.getValueAssessment(startDate, endDate),
      ]);

    return {
      costAnalysis,
      roiAnalysis,
      efficiencyMetrics,
      valueAssessment,
    };
  }

  private static async getCostAnalysis(startDate: Date, endDate: Date) {
    const usage = await AgentUsageModel.findAll({
      where: {
        startTime: {
          [Op.between]: [startDate, endDate],
        },
        tokenUsage: { [Op.not]: null as unknown as number },
      },
      include: [AgentConfig],
      raw: true,
    });

    const totalTokens = usage.reduce(
      (sum: number, u: AgentUsageModel) => sum + (u.tokenUsage || 0),
      0
    );
    const tokenPrice = 0.002; // $0.002 per 1K tokens
    const estimatedCost = (totalTokens / 1000) * tokenPrice;

    // 按智能体分组
    const agentCosts = new Map<
      number,
      { tokens: number; cost: number; name: string }
    >();
    usage.forEach((u: AgentUsageModel) => {
      const agentId = u.agentId;
      const tokens = u.tokenUsage || 0;
      const cost = (tokens / 1000) * tokenPrice;
      const name = (u as any).agent?.name || 'Unknown';

      if (!agentCosts.has(agentId)) {
        agentCosts.set(agentId, { tokens: 0, cost: 0, name });
      }
      const agent = agentCosts.get(agentId)!;
      agent.tokens += tokens;
      agent.cost += cost;
    });

    const costByAgent = Array.from(agentCosts.entries()).map(
      ([agentId, data]) => ({
        agentId,
        agentName: data.name,
        tokens: data.tokens,
        cost: data.cost,
        percentage: totalTokens > 0 ? (data.tokens / totalTokens) * 100 : 0,
      })
    );

    const optimizationSuggestions = [
      {
        type: '缓存策略',
        potentialSavings: estimatedCost * 0.15,
        description: '实施响应缓存可减少15%的API调用成本',
      },
      {
        type: '提示词优化',
        potentialSavings: estimatedCost * 0.2,
        description: '优化提示词长度和结构可减少20%的token消耗',
      },
      {
        type: '智能路由',
        potentialSavings: estimatedCost * 0.1,
        description: '根据查询复杂度智能选择模型可节省10%成本',
      },
    ];

    return {
      totalTokens,
      estimatedCost,
      costByAgent,
      optimizationSuggestions,
    };
  }

  private static async getRoiAnalysis(startDate: Date, endDate: Date) {
    // 简化的ROI分析
    const totalSessions = await AgentUsageModel.count({
      where: {
        startTime: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    const totalInvestment = 50000; // 假设总投资
    const estimatedValuePerSession = 25; // 假设每个会话创造25美元价值
    const estimatedValue = totalSessions * estimatedValuePerSession;
    const roi =
      totalInvestment > 0
        ? ((estimatedValue - totalInvestment) / totalInvestment) * 100
        : 0;

    // 按智能体的ROI
    const agents = await AgentConfig.findAll({
      include: [
        {
          model: AgentUsageModel,
          where: {
            startTime: {
              [Op.between]: [startDate, endDate],
            },
          },
          required: false,
        },
      ],
    });

    const roiByAgent = agents.map(agent => {
      const sessions = (agent as any).usages?.length || 0;
      const investment = 10000; // 假设每个智能体投资10000美元
      const value = sessions * estimatedValuePerSession;
      const agentRoi =
        investment > 0 ? ((value - investment) / investment) * 100 : 0;

      return {
        agentId: agent.id,
        agentName: agent.name,
        investment,
        value,
        roi: agentRoi,
      };
    });

    return {
      totalInvestment,
      estimatedValue,
      roi,
      roiByAgent,
    };
  }

  private static async getEfficiencyMetrics(startDate: Date, endDate: Date) {
    const sessions = await AgentUsageModel.findAll({
      where: {
        startTime: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: ['duration', 'responseTime', 'messageCount'],
      raw: true,
    });

    const avgSessionDuration =
      sessions.length > 0
        ? sessions.reduce(
            (sum, s: AgentUsageModel) => sum + (s.duration || 0),
            0
          ) / sessions.length
        : 0;

    const avgResponseTime =
      sessions.length > 0
        ? sessions.reduce(
            (sum: number, s: AgentUsageModel) => sum + (s.responseTime || 0),
            0
          ) / sessions.length
        : 0;

    // 假设的用户生产力指标
    const userProductivity = Math.min(100, (sessions.length / 1000) * 100);
    const timeSaved = sessions.length * 5; // 假设每个会话节省5分钟

    return {
      avgSessionDuration: Math.round(avgSessionDuration),
      avgResponseTime: Math.round(avgResponseTime),
      userProductivity: Math.round(userProductivity),
      timeSaved,
    };
  }

  private static async getValueAssessment(startDate: Date, endDate: Date) {
    const agents = await AgentConfig.findAll({
      include: [
        {
          model: AgentUsageModel,
          where: {
            startTime: {
              [Op.between]: [startDate, endDate],
            },
          },
          required: false,
        },
      ],
    });

    return agents.map(agent => {
      const sessions = ((agent as any).usages || []);
      const usage = sessions.length;
      const satisfaction =
        sessions.filter(
          (s: AgentUsageModel) => s.userSatisfaction === 'positive'
        ).length / sessions.length || 0;
      // const completion = sessions.filter((s: AgentUsageModel) => s.isCompleted).length / sessions.length || 0;

      // 计算各个维度的分数
      const businessValue = Math.min(100, usage * 10); // 基于使用频率
      const userAdoption = satisfaction * 100; // 用户满意度
      const strategicImportance =
        agent.type === 'core' ? 90 : agent.type === 'support' ? 70 : 50;
      const overallScore =
        (businessValue + userAdoption + strategicImportance) / 3;

      return {
        agentId: agent.id,
        agentName: agent.name,
        businessValue: Math.round(businessValue),
        userAdoption: Math.round(userAdoption),
        strategicImportance,
        overallScore: Math.round(overallScore),
      };
    });
  }

  // 预测分析
  static async getPredictionAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<PredictionData> {
    const [usageTrend, userGrowth, resourceForecast, anomalyDetection] =
      await Promise.all([
        this.getUsageTrend(startDate, endDate),
        this.getUserGrowth(startDate, endDate),
        this.getResourceForecast(startDate, endDate),
        this.getAnomalyDetection(startDate, endDate),
      ]);

    return {
      usageTrend,
      userGrowth,
      resourceForecast,
      anomalyDetection,
    };
  }

  private static async getUsageTrend(startDate: Date, endDate: Date) {
    // 获取历史数据
    const historical = await AgentUsageModel.findAll({
      where: {
        startTime: {
          [Op.between]: [
            new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000), // 30天前
            endDate,
          ],
        },
      },
      attributes: [
        [fn('DATE', col('startTime')), 'date'],
        [fn('COUNT', col('id')), 'count'],
      ],
      group: [fn('DATE', col('startTime'))],
      order: [[literal('date'), 'ASC']],
      raw: true,
    });

    const historicalData = ((historical as unknown) as Array<{ date: string; count: string }>).map(h => ({
      date: h.date,
      actual: parseInt(h.count, 10),
      predicted: parseInt(h.count, 10), // 简化：历史预测值等于实际值
    }));

    // 生成未来30天的预测
    const forecast: Array<{ date: string; predicted: number; confidence: number }> = [];
    const lastValue = historicalData[historicalData.length - 1]?.actual || 0;
    const growthRate = 0.05; // 假设5%的日增长率

    for (let i = 1; i <= 30; i++) {
      const date = new Date(endDate.getTime() + i * 24 * 60 * 60 * 1000);
      const predicted = lastValue * Math.pow(1 + growthRate, i);
      const confidence = Math.max(50, 95 - i * 1.5); // 置信度随时间递减

      forecast.push({
        date: format(date, 'yyyy-MM-dd'),
        predicted: Math.round(predicted),
        confidence: Math.round(confidence),
      });
    }

    // 计算准确度（简化版）
    const accuracy = 85; // 假设85%的准确度

    return {
      historical: historicalData,
      forecast,
      accuracy,
    };
  }

  private static async getUserGrowth(startDate: Date, endDate: Date) {
    // 获取历史用户数据
    const historical = await User.findAll({
      where: {
        createdAt: {
          [Op.between]: [
            new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
            endDate,
          ],
        },
      },
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'users'],
      ],
      group: [fn('DATE', col('createdAt'))],
      order: [[literal('date'), 'ASC']],
      raw: true,
    });

    const historicalData = ((historical as unknown) as Array<{ date: string; users: string }>).map(h => ({
      date: h.date,
      users: parseInt(h.users, 10),
    }));

    // 计算增长率
    const totalUsers = historicalData.reduce((sum, h) => sum + h.users, 0);
    const days = historicalData.length;
    const growthRate =
      days > 1
        ? Math.pow(totalUsers / historicalData[0].users, 1 / days) - 1
        : 0;

    // 生成未来预测
    const predicted = [];
    let cumulativeUsers = totalUsers;

    for (let i = 1; i <= 30; i++) {
      const date = new Date(endDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dailyUsers = totalUsers * growthRate;
      cumulativeUsers += dailyUsers;

      predicted.push({
        date: format(date, 'yyyy-MM-dd'),
        users: Math.round(cumulativeUsers),
        confidence: Math.max(60, 90 - i),
      });
    }

    return {
      historical: historicalData,
      predicted,
      growthRate: Math.round(growthRate * 100 * 100) / 100, // 转换为百分比
    };
  }

  private static async getResourceForecast(startDate: Date, endDate: Date) {
    // 基于使用趋势预测资源需求
    const usageTrend = await this.getUsageTrend(startDate, endDate);
    const predictedLoad = [];

    for (let i = 0; i < usageTrend.forecast.length; i++) {
      const forecast = usageTrend.forecast[i];
      const load = typeof forecast.predicted === 'number'
        ? forecast.predicted
        : parseInt(String(forecast.predicted), 10);

      // 简化的资源需求模型
      const cpu = Math.min(100, (load / 1000) * 100);
      const memory = Math.min(100, (load / 800) * 100);
      const storage = Math.min(100, (load / 2000) * 100);

      predictedLoad.push({
        date: forecast.date,
        cpu: Math.round(cpu),
        memory: Math.round(memory),
        storage: Math.round(storage),
      });
    }

    const recommendations = [
      {
        type: 'CPU扩展',
        action: '增加2个CPU核心',
        timeframe: '7天内',
        impact: '支持50%更多并发用户',
      },
      {
        type: '内存优化',
        action: '启用内存缓存策略',
        timeframe: '3天内',
        impact: '减少30%响应时间',
      },
      {
        type: '存储规划',
        action: '扩展存储容量500GB',
        timeframe: '14天内',
        impact: '支持3个月数据增长',
      },
    ];

    return {
      predictedLoad,
      recommendations,
    };
  }

  private static async getAnomalyDetection(startDate: Date, endDate: Date) {
    // 简化的异常检测
    const sessions = await AgentUsageModel.findAll({
      where: {
        startTime: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: ['startTime', 'responseTime', 'tokenUsage', 'duration'],
      order: [['startTime', 'ASC']],
      raw: true,
    });

    const anomalies: PredictionData['anomalyDetection'] = [];

    // 检测响应时间异常
    const responseTimes = sessions
      .map((s: AgentUsageModel) => s.responseTime)
      .filter((v): v is number => typeof v === 'number');
    const avgResponseTime =
      (responseTimes.reduce<number>((a, b) => a + b, 0) /
        (responseTimes.length || 1));
    const stdResponseTime = Math.sqrt(
      responseTimes.reduce(
        (sum, rt) => sum + Math.pow(rt - avgResponseTime, 2),
        0
      ) / (responseTimes.length || 1)
    );

    sessions.forEach((session: AgentUsageModel) => {
      if (
        session.responseTime &&
        Math.abs(session.responseTime - avgResponseTime) > 2 * stdResponseTime
      ) {
        anomalies.push({
          timestamp: session.startTime.toISOString(),
          metric: '响应时间',
          value: session.responseTime,
          expected: Math.round(avgResponseTime),
          severity:
            session.responseTime > avgResponseTime + 3 * stdResponseTime
              ? 'high'
              : 'medium',
          description: `响应时间${session.responseTime > avgResponseTime ? '过高' : '过低'}，预期${Math.round(avgResponseTime)}ms，实际${session.responseTime}ms`,
        });
      }
    });

    // 检测Token使用异常
    const tokenUsages = sessions
      .map((s: AgentUsageModel) => s.tokenUsage)
      .filter((v): v is number => typeof v === 'number');
    const avgTokenUsage =
      (tokenUsages.reduce<number>((a, b) => a + b, 0) /
        (tokenUsages.length || 1));
    const stdTokenUsage = Math.sqrt(
      tokenUsages.reduce(
        (sum, tu) => sum + Math.pow(tu - avgTokenUsage, 2),
        0
      ) / (tokenUsages.length || 1)
    );

    sessions.forEach((session: AgentUsageModel) => {
      if (
        session.tokenUsage &&
        Math.abs(session.tokenUsage - avgTokenUsage) > 2 * stdTokenUsage
      ) {
        anomalies.push({
          timestamp: session.startTime.toISOString(),
          metric: 'Token使用量',
          value: session.tokenUsage,
          expected: Math.round(avgTokenUsage),
          severity:
            session.tokenUsage > avgTokenUsage + 3 * stdTokenUsage
              ? 'high'
              : 'medium',
          description: `Token使用量${session.tokenUsage > avgTokenUsage ? '异常高' : '异常低'}，预期${Math.round(avgTokenUsage)}，实际${session.tokenUsage}`,
        });
      }
    });

    return anomalies.slice(0, 10); // 返回前10个异常
  }
}
