import { NextRequest, NextResponse } from 'next/server';
import { AgentUsage, AgentConfig } from '@/lib/db/models';
import { Op } from 'sequelize';
import { z } from 'zod';

// 请求参数验证
const agentUsageSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  chartType: z.enum(['pie', 'bar', 'radar']).default('pie'),
  groupBy: z
    .enum(['usage', 'duration', 'responseTime', 'satisfaction'])
    .default('usage'),
  location: z.string().optional(),
  deviceType: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      chartType: searchParams.get('chartType') || 'pie',
      groupBy: searchParams.get('groupBy') || 'usage',
      location: searchParams.get('location') || undefined,
      deviceType: searchParams.get('deviceType') || undefined,
    };

    // 验证参数
    const validatedParams = agentUsageSchema.parse(params);

    // 构建查询条件
    const where: Record<string, unknown> = {};
    if (validatedParams.startDate) {
      where.startTime = { [Op.gte]: new Date(validatedParams.startDate) };
    }
    if (validatedParams.endDate) {
      where.startTime = {
        ...(where.startTime as Record<string, unknown>),
        [Op.lte]: new Date(validatedParams.endDate),
      };
    }

    // 根据不同的分组方式获取数据
    let data: unknown[] = [];

    switch (validatedParams.groupBy) {
      case 'usage':
        data = await getUsageByAgent(where);
        break;
      case 'duration':
        data = await getDurationByAgent(where);
        break;
      case 'responseTime':
        data = await getResponseTimeByAgent(where);
        break;
      case 'satisfaction':
        data = await getSatisfactionByAgent(where);
        break;
    }

    // 如果是雷达图，获取多个维度的数据
    if (validatedParams.chartType === 'radar') {
      data = await getRadarData(where);
    }

    // 获取智能体名称
    const agentConfigs = await AgentConfig.findAll({
      attributes: ['id', 'name', 'type'],
    });

    const agentMap = agentConfigs.reduce((acc: Record<number, { name: string; type: string }>, agent) => {
      acc[agent.id] = agent;
      return acc;
    }, {} as Record<number, { name: string; type: string }>);

    // 合并数据
    const enrichedData = (data as any[]).map(item => ({
      ...item,
      agentName: agentMap[item.agentId]?.name || `Agent ${item.agentId}`,
      agentType: agentMap[item.agentId]?.type || 'unknown',
    }));

    return NextResponse.json({
      success: true,
      data: enrichedData,
      metadata: {
        total: enrichedData.length,
        chartType: validatedParams.chartType,
        groupBy: validatedParams.groupBy,
        dateRange: {
          start: validatedParams.startDate,
          end: validatedParams.endDate,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching agent usage data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agent usage data' },
      { status: 500 }
    );
  }
}

// 获取按智能体分组的的使用次数
async function getUsageByAgent(where: Record<string, unknown>): Promise<UsageByAgent[]> {
  const results = await AgentUsage.findAll({
    where,
    attributes: [
      'agentId',
      [
        AgentUsage.sequelize!.fn('COUNT', AgentUsage.sequelize!.col('id')),
        'value',
      ],
      [
        AgentUsage.sequelize!.fn(
          'SUM',
          AgentUsage.sequelize!.col('messageCount')
        ),
        'messageCount',
      ],
    ],
    group: ['agentId'],
    order: [[AgentUsage.sequelize!.literal('value'), 'DESC']],
    raw: true,
  });
  return results as unknown as UsageByAgent[];
}

// 获取按智能体分组的的会话时长
async function getDurationByAgent(where: Record<string, unknown>): Promise<DurationByAgent[]> {
  const results = await AgentUsage.findAll({
    where,
    attributes: [
      'agentId',
      [
        AgentUsage.sequelize!.fn('AVG', AgentUsage.sequelize!.col('duration')),
        'value',
      ],
      [
        AgentUsage.sequelize!.fn('COUNT', AgentUsage.sequelize!.col('id')),
        'sessionCount',
      ],
    ],
    group: ['agentId'],
    order: [[AgentUsage.sequelize!.literal('value'), 'DESC']],
    raw: true,
  });
  return results as unknown as DurationByAgent[];
}

// 获取按智能体分组的的响应时间
async function getResponseTimeByAgent(where: Record<string, unknown>): Promise<ResponseTimeByAgent[]> {
  const results = await AgentUsage.findAll({
    where,
    attributes: [
      'agentId',
      [
        AgentUsage.sequelize!.fn(
          'AVG',
          AgentUsage.sequelize!.col('responseTime')
        ),
        'value',
      ],
      [
        AgentUsage.sequelize!.fn('COUNT', AgentUsage.sequelize!.col('id')),
        'sessionCount',
      ],
    ],
    group: ['agentId'],
    order: [[AgentUsage.sequelize!.literal('value'), 'DESC']],
    raw: true,
  });
  return results as unknown as ResponseTimeByAgent[];
}

// 获取按智能体分组的的用户满意度
interface SatisfactionByAgent {
  agentId: number;
  userSatisfaction: 'positive' | 'negative' | 'neutral';
  count: number;
}

// 获取按智能体分组的的使用数据
interface UsageByAgent {
  agentId: number;
  value: number;
  messageCount?: number;
}

// 获取按智能体分组的的持续时间数据
interface DurationByAgent {
  agentId: number;
  value: number;
}

// 获取按智能体分组的的响应时间数据
interface ResponseTimeByAgent {
  agentId: number;
  value: number;
}

async function getSatisfactionByAgent(where: Record<string, unknown>): Promise<SatisfactionByAgent[]> {
  return await AgentUsage.findAll({
    where: {
      ...where,
      userSatisfaction: { [Op.not]: undefined },
    },
    attributes: [
      'agentId',
      'userSatisfaction',
      [
        AgentUsage.sequelize!.fn('COUNT', AgentUsage.sequelize!.col('id')),
        'count',
      ],
    ],
    group: ['agentId', 'userSatisfaction'],
    order: [[AgentUsage.sequelize!.literal('count'), 'DESC']],
    raw: true,
  }) as unknown as SatisfactionByAgent[];
}

// 获取雷达图数据（多个维度的综合数据）
async function getRadarData(where: Record<string, unknown>) {
  const usageData = await getUsageByAgent(where);
  const durationData = await getDurationByAgent(where);
  const responseTimeData = await getResponseTimeByAgent(where);
  const satisfactionData = await getSatisfactionByAgent(where);

  // 合并数据
  const agentIds = Array.from(new Set([
    ...usageData.map(item => item.agentId),
    ...durationData.map(item => item.agentId),
    ...responseTimeData.map(item => item.agentId),
    ...satisfactionData.map(item => item.agentId),
  ]));

  const radarData = agentIds.map(agentId => {
    const usage = usageData.find(item => item.agentId === agentId);
    const duration = durationData.find(item => item.agentId === agentId);
    const responseTime = responseTimeData.find(
      item => item.agentId === agentId
    );
    const satisfaction = satisfactionData.filter(
      item => item.agentId === agentId
    );

    // 计算满意度分数（positive - negative）
    let satisfactionScore = 0;
    if (satisfaction.length > 0) {
      const positive =
        satisfaction.find(s => s.userSatisfaction === 'positive')?.count || 0;
      const negative =
        satisfaction.find(s => s.userSatisfaction === 'negative')?.count || 0;
      const total = satisfaction.reduce((sum, s) => sum + s.count, 0);
      satisfactionScore = total > 0 ? (positive - negative) / total : 0;
    }

    // 标准化数据到0-100范围
    const maxUsage = Math.max(...usageData.map(item => item.value));
    const maxDuration = Math.max(...durationData.map(item => item.value));
    const maxResponseTime = Math.max(
      ...responseTimeData.map(item => item.value)
    );

    return {
      agentId,
      usage: maxUsage > 0 ? ((usage?.value || 0) / maxUsage) * 100 : 0,
      duration:
        maxDuration > 0 ? ((duration?.value || 0) / maxDuration) * 100 : 0,
      responseTime:
        maxResponseTime > 0
          ? Math.max(
              0,
              100 - ((responseTime?.value || 0) / maxResponseTime) * 100
            )
          : 100,
      satisfaction: Math.max(0, (satisfactionScore + 1) * 50), // 转换到0-100范围
    };
  });

  return radarData;
}
