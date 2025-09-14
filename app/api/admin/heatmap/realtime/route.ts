import { NextRequest, NextResponse } from 'next/server';
import { heatmapService } from '@/lib/services/heatmap-service';
import { ApiResponse } from '@/types';
import logger from '@/lib/utils/logger';

/**
 * 获取实时热点地图数据
 */
export async function GET(request: NextRequest) {
  try {
    // 获取实时活动数据
    const realtimeData = await heatmapService.getRealtimeActivity();

    const response: ApiResponse = {
      success: true,
      data: realtimeData,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Failed to fetch realtime heatmap data:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'REALTIME_HEATMAP_ERROR',
        message: 'Failed to fetch realtime heatmap data',
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