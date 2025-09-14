import { NextRequest, NextResponse } from 'next/server';
import { AgentUsage, UserGeo, AgentConfig } from '@/lib/db/models';
import { Op } from 'sequelize';
import { z } from 'zod';

// 请求参数验证
const comparisonSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  dimensions: z.array(z.enum(['time', 'location', 'userType', 'deviceType', 'agentType'])).default(['time']),
  metric: z.enum(['sessions', 'users', 'duration', 'responseTime', 'tokens']).default('sessions'),
  timeGranularity: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  locationLevel: z.enum(['country', 'region', 'city']).default('country'),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      dimensions: searchParams.get('dimensions')?.split(',') || ['time'],
      metric: searchParams.get('metric') || 'sessions',
      timeGranularity: searchParams.get('timeGranularity') || 'day',
      locationLevel: searchParams.get('locationLevel') || 'country',
    };

    // 验证参数
    const validatedParams = comparisonSchema.parse(params);

    // 构建查询条件
    const where: any = {};
    if (validatedParams.startDate) {
      where.startTime = { [Op.gte]: new Date(validatedParams.startDate) };
    }
    if (validatedParams.endDate) {
      where.startTime = {
        ...where.startTime,
        [Op.lte]: new Date(validatedParams.endDate)
      };
    }

    // 根据维度获取数据
    const data: any = {};

    for (const dimension of validatedParams.dimensions) {
      switch (dimension) {
        case 'time':
          data.time = await getTimeComparisonData(where, validatedParams.metric, validatedParams.timeGranularity);
          break;
        case 'location':
          data.location = await getLocationComparisonData(where, validatedParams.metric, validatedParams.locationLevel);
          break;
        case 'userType':
          data.userType = await getUserTypeComparisonData(where, validatedParams.metric);
          break;
        case 'deviceType':
          data.deviceType = await getDeviceTypeComparisonData(where, validatedParams.metric);
          break;
        case 'agentType':
          data.agentType = await getAgentTypeComparisonData(where, validatedParams.metric);
          break;
      }
    }

    return NextResponse.json({
      success: true,
      data,
      metadata: {
        dimensions: validatedParams.dimensions,
        metric: validatedParams.metric,
        dateRange: {
          start: validatedParams.startDate,
          end: validatedParams.endDate,
        },
        granularity: {
          time: validatedParams.timeGranularity,
          location: validatedParams.locationLevel,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comparison data' },
      { status: 500 }
    );
  }
}

// 时间维度对比数据
async function getTimeComparisonData(where: any, metric: string, granularity: string) {
  let attributes: any[];

  switch (metric) {
    case 'sessions':
      attributes = [
        [AgentUsage.sequelize.fn('DATE_TRUNC', granularity, AgentUsage.sequelize.col('startTime')), 'period'],
        [AgentUsage.sequelize.fn('COUNT', AgentUsage.sequelize.col('id')), 'value'],
      ];
      break;
    case 'users':
      attributes = [
        [AgentUsage.sequelize.fn('DATE_TRUNC', granularity, AgentUsage.sequelize.col('startTime')), 'period'],
        [AgentUsage.sequelize.fn('COUNT', AgentUsage.sequelize.fn('DISTINCT', AgentUsage.sequelize.col('userId'))), 'value'],
      ];
      break;
    case 'duration':
      attributes = [
        [AgentUsage.sequelize.fn('DATE_TRUNC', granularity, AgentUsage.sequelize.col('startTime')), 'period'],
        [AgentUsage.sequelize.fn('AVG', AgentUsage.sequelize.col('duration')), 'value'],
      ];
      break;
    case 'responseTime':
      attributes = [
        [AgentUsage.sequelize.fn('DATE_TRUNC', granularity, AgentUsage.sequelize.col('startTime')), 'period'],
        [AgentUsage.sequelize.fn('AVG', AgentUsage.sequelize.col('responseTime')), 'value'],
      ];
      break;
    case 'tokens':
      attributes = [
        [AgentUsage.sequelize.fn('DATE_TRUNC', granularity, AgentUsage.sequelize.col('startTime')), 'period'],
        [AgentUsage.sequelize.fn('SUM', AgentUsage.sequelize.col('tokenUsage')), 'value'],
      ];
      break;
    default:
      attributes = [
        [AgentUsage.sequelize.fn('DATE_TRUNC', granularity, AgentUsage.sequelize.col('startTime')), 'period'],
        [AgentUsage.sequelize.fn('COUNT', AgentUsage.sequelize.col('id')), 'value'],
      ];
  }

  return await AgentUsage.findAll({
    where,
    attributes,
    group: [AgentUsage.sequelize.fn('DATE_TRUNC', granularity, AgentUsage.sequelize.col('startTime'))],
    order: [[AgentUsage.sequelize.fn('DATE_TRUNC', granularity, AgentUsage.sequelize.col('startTime')), 'ASC']],
    raw: true,
  });
}

// 地理位置维度对比数据
async function getLocationComparisonData(where: Record<string, unknown>, metric: string, level: string) {
  // 获取包含地理位置数据的记录
  const geoData = await AgentUsage.findAll({
    where,
    include: [{
      model: UserGeo,
      as: 'geoLocation',
      required: true,
    }],
    raw: true,
  });

  // 按地理位置分组统计
  const locationMap = new Map<string, number>();
  const locationCountMap = new Map<string, number>();

  geoData.forEach(item => {
    const geo = item['geoLocation.location'] as any;
    if (!geo) return;

    let locationKey = '';
    switch (level) {
      case 'country':
        locationKey = geo.country || 'Unknown';
        break;
      case 'region':
        locationKey = geo.region || 'Unknown';
        break;
      case 'city':
        locationKey = geo.city || 'Unknown';
        break;
    }

    if (!locationKey) return;

    const currentValue = metric === 'duration' || metric === 'responseTime'
      ? (item.duration || item.responseTime || 0)
      : 1;

    locationMap.set(locationKey, (locationMap.get(locationKey) || 0) + currentValue);
    locationCountMap.set(locationKey, (locationCountMap.get(locationKey) || 0) + 1);
  });

  // 转换为数组格式
  const result = Array.from(locationMap.entries()).map(([location, value]) => {
    let finalValue = value;
    if (metric === 'duration' || metric === 'responseTime') {
      finalValue = value / (locationCountMap.get(location) || 1);
    }
    return { location, value: finalValue };
  });

  return result.sort((a, b) => b.value - a.value).slice(0, 20); // 返回前20个
}

// 用户类型维度对比数据（登录用户vs匿名用户）
async function getUserTypeComparisonData(where: Record<string, unknown>, metric: string) {
  const loggedUsers = await AgentUsage.findAll({
    where: {
      ...where,
      userId: { [Op.not]: null },
    },
    attributes: [
      ['userId', 'type'],
      [AgentUsage.sequelize.fn('COUNT', AgentUsage.sequelize.col('id')), 'value'],
    ],
    group: ['userId'],
    raw: true,
  });

  const anonymousUsers = await AgentUsage.findAll({
    where: {
      ...where,
      userId: null,
    },
    attributes: [
      [AgentUsage.sequelize.literal("'anonymous'"), 'type'],
      [AgentUsage.sequelize.fn('COUNT', AgentUsage.sequelize.col('id')), 'value'],
    ],
    group: ['type'],
    raw: true,
  });

  // 计算统计数据
  const loggedCount = loggedUsers.length;
  const anonymousCount = parseInt(anonymousUsers[0]?.value || '0');

  return [
    { type: '登录用户', value: loggedCount },
    { type: '匿名用户', value: anonymousCount },
  ];
}

// 设备类型维度对比数据
async function getDeviceTypeComparisonData(where: Record<string, unknown>, metric: string) {
  const deviceData = await AgentUsage.findAll({
    where,
    attributes: [
      [AgentUsage.sequelize.literal("CASE WHEN deviceInfo->>'deviceType' IS NOT NULL THEN deviceInfo->>'deviceType' ELSE 'unknown' END"), 'deviceType'],
      [AgentUsage.sequelize.fn('COUNT', AgentUsage.sequelize.col('id')), 'value'],
    ],
    group: [AgentUsage.sequelize.literal("CASE WHEN deviceInfo->>'deviceType' IS NOT NULL THEN deviceInfo->>'deviceType' ELSE 'unknown' END")],
    order: [[AgentUsage.sequelize.literal('value'), 'DESC']],
    raw: true,
  });

  return deviceData.map(item => ({
    deviceType: item.deviceType === 'unknown' ? '未知设备' : item.deviceType,
    value: item.value,
  }));
}

// 智能体类型维度对比数据
async function getAgentTypeComparisonData(where: Record<string, unknown>, metric: string) {
  const agentData = await AgentUsage.findAll({
    where,
    include: [{
      model: AgentConfig,
      as: 'agent',
      attributes: ['type'],
      required: true,
    }],
    attributes: [
      [AgentUsage.sequelize.fn('COUNT', AgentUsage.sequelize.col('id')), 'value'],
    ],
    group: ['agent.type'],
    raw: true,
  });

  return agentData.map(item => ({
    agentType: item['agent.type'] || '未知类型',
    value: item.value,
  }));
}
