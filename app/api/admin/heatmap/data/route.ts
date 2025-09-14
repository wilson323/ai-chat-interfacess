import { NextRequest, NextResponse } from 'next/server';
import { heatmapService } from '@/lib/services/heatmap-service';
import { HeatmapQueryParams } from '@/types/heatmap';
import { ApiResponse } from '@/types';
import logger from '@/lib/utils/logger';

/**
 * 获取热点地图可视化数据
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 解析查询参数
    const params: HeatmapQueryParams = {
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      agentType: searchParams.get('agentType') || undefined,
      messageType: searchParams.get('messageType') as any || undefined,
      country: searchParams.get('country') || undefined,
      region: searchParams.get('region') || undefined,
      city: searchParams.get('city') || undefined,
      userId: searchParams.get('userId') ? parseInt(searchParams.get('userId')!) : undefined,
      timeRange: searchParams.get('timeRange') as any || undefined,
      granularity: searchParams.get('granularity') as any || undefined,
    };

    // 获取热点地图数据
    const heatmapData = await heatmapService.getHeatmapData(params);

    const response: ApiResponse = {
      success: true,
      data: heatmapData,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Failed to fetch heatmap data:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'HEATMAP_DATA_ERROR',
        message: 'Failed to fetch heatmap data',
        details: error instanceof Error ? error.message : String(error),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}