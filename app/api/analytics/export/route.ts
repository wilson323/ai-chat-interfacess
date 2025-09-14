import { NextRequest, NextResponse } from 'next/server';
import { AgentUsage, ChatSession, UserGeo, AgentConfig } from '@/lib/db/models';
import { Op } from 'sequelize';
import { z } from 'zod';

// 请求参数验证
const exportSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  format: z.enum(['csv', 'excel', 'json']).default('csv'),
  dataType: z.enum(['usage', 'sessions', 'agents', 'locations']).default('usage'),
  includeHeaders: z.boolean().default(true),
  agentId: z.string().optional(),
  location: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      format: searchParams.get('format') || 'csv',
      dataType: searchParams.get('dataType') || 'usage',
      includeHeaders: searchParams.get('includeHeaders') === 'true',
      agentId: searchParams.get('agentId') || undefined,
      location: searchParams.get('location') || undefined,
    };

    // 验证参数
    const validatedParams = exportSchema.parse(params);

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
    if (validatedParams.agentId) {
      where.agentId = parseInt(validatedParams.agentId);
    }

    // 根据数据类型获取数据
    let data: any[] = [];
    let headers: string[] = [];

    switch (validatedParams.dataType) {
      case 'usage':
        ({ data, headers } = await getUsageData(where));
        break;
      case 'sessions':
        ({ data, headers } = await getSessionData(where));
        break;
      case 'agents':
        ({ data, headers } = await getAgentData(where));
        break;
      case 'locations':
        ({ data, headers } = await getLocationData(where));
        break;
    }

    // 根据格式生成响应
    let contentType: string;
    let content: string;
    let filename: string;

    switch (validatedParams.format) {
      case 'csv':
        contentType = 'text/csv';
        content = generateCSV(data, headers, validatedParams.includeHeaders);
        filename = `${validatedParams.dataType}_export_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'excel':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        content = await generateExcel(data, headers, validatedParams.dataType);
        filename = `${validatedParams.dataType}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        break;
      case 'json':
        contentType = 'application/json';
        content = JSON.stringify(data, null, 2);
        filename = `${validatedParams.dataType}_export_${new Date().toISOString().split('T')[0]}.json`;
        break;
      default:
        throw new Error('Unsupported export format');
    }

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

// 获取使用数据
async function getUsageData(where: any) {
  const data = await AgentUsage.findAll({
    where,
    include: [
      {
        model: AgentConfig,
        as: 'agent',
        attributes: ['name', 'type'],
      },
      {
        model: UserGeo,
        as: 'geoLocation',
        attributes: ['location'],
      },
    ],
    attributes: [
      'id',
      'sessionId',
      'userId',
      'agentId',
      'messageType',
      'messageCount',
      'tokenUsage',
      'responseTime',
      'startTime',
      'endTime',
      'duration',
      'isCompleted',
      'userSatisfaction',
    ],
    order: [['startTime', 'DESC']],
    raw: false,
  });

  const headers = [
    'ID', '会话ID', '用户ID', '智能体名称', '智能体类型', '消息类型',
    '消息数量', 'Token使用量', '响应时间(ms)', '开始时间', '结束时间',
    '持续时间(s)', '是否完成', '用户满意度', '国家', '地区', '城市'
  ];

  const formattedData = data.map(item => ({
    id: item.id,
    sessionId: item.sessionId,
    userId: item.userId || '匿名',
    agentName: item.agent?.name || '未知',
    agentType: item.agent?.type || '未知',
    messageType: item.messageType,
    messageCount: item.messageCount,
    tokenUsage: item.tokenUsage || 0,
    responseTime: item.responseTime || 0,
    startTime: item.startTime.toISOString(),
    endTime: item.endTime?.toISOString() || '',
    duration: item.duration || 0,
    isCompleted: item.isCompleted ? '是' : '否',
    userSatisfaction: item.userSatisfaction || '未知',
    country: item.geoLocation?.location?.country || '未知',
    region: item.geoLocation?.location?.region || '未知',
    city: item.geoLocation?.location?.city || '未知',
  }));

  return { data: formattedData, headers };
}

// 获取会话数据
async function getSessionData(where: any) {
  const data = await ChatSession.findAll({
    include: [
      {
        model: AgentUsage,
        as: 'agentUsages',
        include: [
          {
            model: AgentConfig,
            as: 'agent',
            attributes: ['name', 'type'],
          },
        ],
      },
    ],
    attributes: [
      'id',
      'userId',
      'title',
      'createdAt',
      'updatedAt',
      'isArchived',
    ],
    order: [['createdAt', 'DESC']],
    raw: false,
  });

  const headers = [
    '会话ID', '用户ID', '标题', '创建时间', '更新时间', '是否归档',
    '智能体使用次数', '消息总数', '平均响应时间'
  ];

  const formattedData = data.map(session => {
    const usages = session.agentUsages || [];
    const totalMessages = usages.reduce((sum, usage) => sum + (usage.messageCount || 0), 0);
    const avgResponseTime = usages.length > 0
      ? usages.reduce((sum, usage) => sum + (usage.responseTime || 0), 0) / usages.length
      : 0;

    return {
      id: session.id,
      userId: session.userId,
      title: session.title,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      isArchived: session.isArchived ? '是' : '否',
      agentUsageCount: usages.length,
      totalMessages,
      avgResponseTime: Math.round(avgResponseTime),
    };
  });

  return { data: formattedData, headers };
}

// 获取智能体数据
async function getAgentData(where: any) {
  const data = await AgentConfig.findAll({
    include: [
      {
        model: AgentUsage,
        as: 'usages',
        where,
        required: false,
        attributes: [
          'id',
          'messageCount',
          'tokenUsage',
          'responseTime',
          'duration',
          'userSatisfaction',
        ],
      },
    ],
    attributes: [
      'id',
      'name',
      'type',
      'description',
      'isPublished',
      'order',
      'supportsStream',
      'supportsDetail',
      'createdAt',
    ],
    order: [['order', 'ASC']],
    raw: false,
  });

  const headers = [
    'ID', '名称', '类型', '描述', '是否发布', '排序', '支持流式',
    '支持详情', '使用次数', '总消息数', '总Token使用量',
    '平均响应时间', '平均会话时长', '满意度'
  ];

  const formattedData = data.map(agent => {
    const usages = agent.usages || [];
    const totalSessions = usages.length;
    const totalMessages = usages.reduce((sum, usage) => sum + (usage.messageCount || 0), 0);
    const totalTokens = usages.reduce((sum, usage) => sum + (usage.tokenUsage || 0), 0);
    const avgResponseTime = totalSessions > 0
      ? usages.reduce((sum, usage) => sum + (usage.responseTime || 0), 0) / totalSessions
      : 0;
    const avgDuration = totalSessions > 0
      ? usages.reduce((sum, usage) => sum + (usage.duration || 0), 0) / totalSessions
      : 0;

    // 计算满意度
    const satisfactionCounts = usages.reduce((acc, usage) => {
      if (usage.userSatisfaction) {
        acc[usage.userSatisfaction] = (acc[usage.userSatisfaction] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const satisfaction = satisfactionCounts.positive > satisfactionCounts.negative
      ? '正面'
      : satisfactionCounts.positive < satisfactionCounts.negative
        ? '负面'
        : satisfactionCounts.positive === satisfactionCounts.negative && satisfactionCounts.positive > 0
          ? '中性'
          : '未知';

    return {
      id: agent.id,
      name: agent.name,
      type: agent.type,
      description: agent.description || '',
      isPublished: agent.isPublished ? '是' : '否',
      order: agent.order,
      supportsStream: agent.supportsStream ? '是' : '否',
      supportsDetail: agent.supportsDetail ? '是' : '否',
      createdAt: agent.createdAt.toISOString(),
      totalSessions,
      totalMessages,
      totalTokens,
      avgResponseTime: Math.round(avgResponseTime),
      avgDuration: Math.round(avgDuration),
      satisfaction,
    };
  });

  return { data: formattedData, headers };
}

// 获取地理位置数据
async function getLocationData(where: any) {
  const data = await UserGeo.findAll({
    include: [
      {
        model: AgentUsage,
        as: 'usages',
        where,
        required: true,
        attributes: [
          'id',
          'messageCount',
          'duration',
          'userSatisfaction',
        ],
      },
    ],
    attributes: [
      'id',
      'userId',
      'ipAddress',
      'location',
      'lastSeen',
      'createdAt',
    ],
    order: [['lastSeen', 'DESC']],
    raw: false,
  });

  const headers = [
    'ID', '用户ID', 'IP地址', '国家', '地区', '城市', '纬度', '经度',
    '最后活跃', '创建时间', '使用次数', '总消息数', '平均会话时长'
  ];

  const formattedData = data.map(geo => {
    const usages = geo.usages || [];
    const totalSessions = usages.length;
    const totalMessages = usages.reduce((sum, usage) => sum + (usage.messageCount || 0), 0);
    const avgDuration = totalSessions > 0
      ? usages.reduce((sum, usage) => sum + (usage.duration || 0), 0) / totalSessions
      : 0;

    return {
      id: geo.id,
      userId: geo.userId || '匿名',
      ipAddress: geo.ipAddress,
      country: geo.location?.country || '未知',
      region: geo.location?.region || '未知',
      city: geo.location?.city || '未知',
      latitude: geo.location?.latitude || 0,
      longitude: geo.location?.longitude || 0,
      lastSeen: geo.lastSeen.toISOString(),
      createdAt: geo.createdAt.toISOString(),
      totalSessions,
      totalMessages,
      avgDuration: Math.round(avgDuration),
    };
  });

  return { data: formattedData, headers };
}

// 生成CSV格式
function generateCSV(data: any[], headers: string[], includeHeaders: boolean): string {
  if (!data.length) return includeHeaders ? headers.join(',') : '';

  const rows = data.map(row => {
    return headers.map(header => {
      const value = row[header] || '';
      // 处理包含逗号或引号的值
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  if (includeHeaders) {
    return [headers.join(','), ...rows].join('\n');
  }
  return rows.join('\n');
}

// 生成Excel格式（简化版本，实际可以使用更复杂的库）
async function generateExcel(data: any[], headers: string[], dataType: string): Promise<string> {
  // 这里简化处理，实际可以使用 xlsx 或类似的库
  // 现在先返回CSV格式
  return generateCSV(data, headers, true);
}