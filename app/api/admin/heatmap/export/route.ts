import { NextRequest, NextResponse } from 'next/server';
import { heatmapService } from '@/lib/services/heatmap-service';
import { HeatmapQueryParams } from '@/types/heatmap';
import logger from '@/lib/utils/logger';

/**
 * 导出热点地图数据
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

    const format = (searchParams.get('format') as 'csv' | 'json') || 'json';

    // 导出数据
    const exportData = await heatmapService.exportData(params, format);

    // 设置响应头
    const filename = `heatmap_data_${new Date().toISOString().split('T')[0]}.${format}`;
    const headers = new Headers({
      'Content-Type': format === 'csv' ? 'text/csv' : 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new NextResponse(exportData, {
      status: 200,
      headers,
    });
  } catch (error) {
    logger.error('Failed to export heatmap data:', error);

    const response = {
      success: false,
      error: {
        code: 'HEATMAP_EXPORT_ERROR',
        message: 'Failed to export heatmap data',
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