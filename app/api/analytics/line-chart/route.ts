import { NextRequest, NextResponse } from 'next/server';
import { AgentUsage, UserGeo } from '@/lib/db/models';
import { Op } from 'sequelize';
import { z } from 'zod';

// 请求参数验证
const lineChartSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  groupBy: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  metric: z
    .enum(['sessions', 'users', 'duration', 'responseTime', 'tokens'])
    .default('sessions'),
  agentId: z.string().optional(),
  location: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      groupBy: searchParams.get('groupBy') || 'day',
      metric: searchParams.get('metric') || 'sessions',
      agentId: searchParams.get('agentId') || undefined,
      location: searchParams.get('location') || undefined,
    };

    // 验证参数
    const validatedParams = lineChartSchema.parse(params);

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
    if (validatedParams.agentId) {
      where.agentId = parseInt(validatedParams.agentId);
    }

    // 根据不同的指标获取数据
    let data: unknown[] = [];

    switch (validatedParams.metric) {
      case 'sessions':
        data = await getSessionTrendData(where as Record<string, unknown>, validatedParams.groupBy);
        break;
      case 'users':
        data = await getUserTrendData(where as Record<string, unknown>, validatedParams.groupBy);
        break;
      case 'duration':
        data = await getDurationTrendData(where as Record<string, unknown>, validatedParams.groupBy);
        break;
      case 'responseTime':
        data = await getResponseTimeTrendData(where as Record<string, unknown>, validatedParams.groupBy);
        break;
      case 'tokens':
        data = await getTokenTrendData(where as Record<string, unknown>, validatedParams.groupBy);
        break;
    }

    // 如果有位置筛选，应用地理位置过滤
    if (validatedParams.location) {
      data = await filterByLocation(data as Record<string, unknown>[], validatedParams.location);
    }

    return NextResponse.json({
      success: true,
      data,
      metadata: {
        total: data.length,
        dateRange: {
          start: validatedParams.startDate,
          end: validatedParams.endDate,
        },
        groupBy: validatedParams.groupBy,
        metric: validatedParams.metric,
      },
    });
  } catch (error) {
    console.error('Error fetching line chart data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch line chart data' },
      { status: 500 }
    );
  }
}

// 获取会话趋势数据
async function getSessionTrendData(where: Record<string, unknown>, groupBy: string) {
  return await AgentUsage.findAll({
    where,
    attributes: [
      [
        AgentUsage.sequelize!.fn(
          'DATE_TRUNC',
          groupBy,
          AgentUsage.sequelize!.col('startTime')
        ),
        'period',
      ],
      [
        AgentUsage.sequelize!.fn('COUNT', AgentUsage.sequelize!.col('id')),
        'value',
      ],
    ],
    group: [
      AgentUsage.sequelize!.fn(
        'DATE_TRUNC',
        groupBy,
        AgentUsage.sequelize!.col('startTime')
      ),
    ],
    order: [
      [
        AgentUsage.sequelize!.fn(
          'DATE_TRUNC',
          groupBy,
          AgentUsage.sequelize!.col('startTime')
        ),
        'ASC',
      ],
    ],
    raw: true,
  });
}

// 获取用户趋势数据
async function getUserTrendData(where: Record<string, unknown>, groupBy: string) {
  return await AgentUsage.findAll({
    where,
    attributes: [
      [
        AgentUsage.sequelize!.fn(
          'DATE_TRUNC',
          groupBy,
          AgentUsage.sequelize!.col('startTime')
        ),
        'period',
      ],
      [
        AgentUsage.sequelize!.fn(
          'COUNT',
          AgentUsage.sequelize!.fn(
            'DISTINCT',
            AgentUsage.sequelize!.col('userId')
          )
        ),
        'value',
      ],
    ],
    group: [
      AgentUsage.sequelize!.fn(
        'DATE_TRUNC',
        groupBy,
        AgentUsage.sequelize!.col('startTime')
      ),
    ],
    order: [
      [
        AgentUsage.sequelize!.fn(
          'DATE_TRUNC',
          groupBy,
          AgentUsage.sequelize!.col('startTime')
        ),
        'ASC',
      ],
    ],
    raw: true,
  });
}

// 获取会话时长趋势数据
async function getDurationTrendData(where: Record<string, unknown>, groupBy: string) {
  return await AgentUsage.findAll({
    where,
    attributes: [
      [
        AgentUsage.sequelize!.fn(
          'DATE_TRUNC',
          groupBy,
          AgentUsage.sequelize!.col('startTime')
        ),
        'period',
      ],
      [
        AgentUsage.sequelize!.fn('AVG', AgentUsage.sequelize!.col('duration')),
        'value',
      ],
    ],
    group: [
      AgentUsage.sequelize!.fn(
        'DATE_TRUNC',
        groupBy,
        AgentUsage.sequelize!.col('startTime')
      ),
    ],
    order: [
      [
        AgentUsage.sequelize!.fn(
          'DATE_TRUNC',
          groupBy,
          AgentUsage.sequelize!.col('startTime')
        ),
        'ASC',
      ],
    ],
    raw: true,
  });
}

// 获取响应时间趋势数据
async function getResponseTimeTrendData(where: Record<string, unknown>, groupBy: string) {
  return await AgentUsage.findAll({
    where,
    attributes: [
      [
        AgentUsage.sequelize!.fn(
          'DATE_TRUNC',
          groupBy,
          AgentUsage.sequelize!.col('startTime')
        ),
        'period',
      ],
      [
        AgentUsage.sequelize!.fn(
          'AVG',
          AgentUsage.sequelize!.col('responseTime')
        ),
        'value',
      ],
    ],
    group: [
      AgentUsage.sequelize!.fn(
        'DATE_TRUNC',
        groupBy,
        AgentUsage.sequelize!.col('startTime')
      ),
    ],
    order: [
      [
        AgentUsage.sequelize!.fn(
          'DATE_TRUNC',
          groupBy,
          AgentUsage.sequelize!.col('startTime')
        ),
        'ASC',
      ],
    ],
    raw: true,
  });
}

// 获取Token使用趋势数据
async function getTokenTrendData(where: Record<string, unknown>, groupBy: string) {
  return await AgentUsage.findAll({
    where,
    attributes: [
      [
        AgentUsage.sequelize!.fn(
          'DATE_TRUNC',
          groupBy,
          AgentUsage.sequelize!.col('startTime')
        ),
        'period',
      ],
      [
        AgentUsage.sequelize!.fn('SUM', AgentUsage.sequelize!.col('tokenUsage')),
        'value',
      ],
    ],
    group: [
      AgentUsage.sequelize!.fn(
        'DATE_TRUNC',
        groupBy,
        AgentUsage.sequelize!.col('startTime')
      ),
    ],
    order: [
      [
        AgentUsage.sequelize!.fn(
          'DATE_TRUNC',
          groupBy,
          AgentUsage.sequelize!.col('startTime')
        ),
        'ASC',
      ],
    ],
    raw: true,
  });
}

// 根据地理位置过滤数据
async function filterByLocation(data: Record<string, unknown>[], location: string) {
  // 获取相关的地理位置ID
  await UserGeo.findAll({
    where: {
      [Op.or]: [
        { '$location.country$': location },
        { '$location.region$': location },
        { '$location.city$': location },
      ],
    },
    include: ['usages'],
  });

  // 过滤数据
  return data.filter(() => {
    // 这里需要根据实际情况实现地理位置过滤逻辑
    return true; // 临时返回所有数据
  });
}