import { NextRequest, NextResponse } from 'next/server';
import { performance } from 'perf_hooks';

// 性能指标接口
interface ServerPerformanceMetrics {
  timestamp: number;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  requests: {
    total: number;
    success: number;
    error: number;
    averageResponseTime: number;
  };
  database: {
    connections: number;
    queryTime: number;
  };
}

// 模拟性能数据存储
let performanceData: ServerPerformanceMetrics[] = [];
let requestCount = 0;
let successCount = 0;
let errorCount = 0;
let totalResponseTime = 0;

// 记录请求性能
function recordRequest(responseTime: number, success: boolean) {
  requestCount++;
  totalResponseTime += responseTime;

  if (success) {
    successCount++;
  } else {
    errorCount++;
  }
}

// 获取服务器性能指标
function getServerMetrics(): ServerPerformanceMetrics {
  const memUsage = process.memoryUsage();
  const totalMemory = memUsage.heapTotal + memUsage.external;
  const usedMemory = memUsage.heapUsed + memUsage.external;

  return {
    timestamp: Date.now(),
    uptime: process.uptime(),
    memory: {
      used: usedMemory,
      total: totalMemory,
      percentage: (usedMemory / totalMemory) * 100,
    },
    cpu: {
      usage: process.cpuUsage().user / 1000000, // 转换为秒
    },
    requests: {
      total: requestCount,
      success: successCount,
      error: errorCount,
      averageResponseTime:
        requestCount > 0 ? totalResponseTime / requestCount : 0,
    },
    database: {
      connections: 0, // 模拟数据库连接数
      queryTime: 0, // 模拟查询时间
    },
  };
}

// GET /api/admin/performance - 获取性能指标
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '1h';
    const includeDetails = searchParams.get('includeDetails') === 'true';

    // 记录当前请求
    const startTime = performance.now();

    // 获取当前性能指标
    const currentMetrics = getServerMetrics();

    // 添加到历史数据
    performanceData.push(currentMetrics);

    // 限制历史数据长度（保留最近100条）
    if (performanceData.length > 100) {
      performanceData = performanceData.slice(-100);
    }

    // 根据时间范围过滤数据
    const now = Date.now();
    let filteredData = performanceData;

    switch (timeRange) {
      case '1h':
        filteredData = performanceData.filter(
          data => now - data.timestamp < 60 * 60 * 1000
        );
        break;
      case '6h':
        filteredData = performanceData.filter(
          data => now - data.timestamp < 6 * 60 * 60 * 1000
        );
        break;
      case '24h':
        filteredData = performanceData.filter(
          data => now - data.timestamp < 24 * 60 * 60 * 1000
        );
        break;
      case '7d':
        filteredData = performanceData.filter(
          data => now - data.timestamp < 7 * 24 * 60 * 60 * 1000
        );
        break;
    }

    // 计算统计信息
    const stats = {
      current: currentMetrics,
      history: filteredData,
      summary: {
        averageMemoryUsage:
          filteredData.length > 0
            ? filteredData.reduce(
                (sum, data) => sum + data.memory.percentage,
                0
              ) / filteredData.length
            : 0,
        averageCpuUsage:
          filteredData.length > 0
            ? filteredData.reduce((sum, data) => sum + data.cpu.usage, 0) /
              filteredData.length
            : 0,
        totalRequests: currentMetrics.requests.total,
        successRate:
          currentMetrics.requests.total > 0
            ? (currentMetrics.requests.success /
                currentMetrics.requests.total) *
              100
            : 0,
        averageResponseTime: currentMetrics.requests.averageResponseTime,
        uptime: currentMetrics.uptime,
      },
    };

    // 记录API响应时间
    const responseTime = performance.now() - startTime;
    recordRequest(responseTime, true);

    return NextResponse.json({
      success: true,
      data: includeDetails ? stats : stats.summary,
      timestamp: currentMetrics.timestamp,
    });
  } catch (error) {
    console.error('获取性能指标失败:', error);

    // 记录错误
    recordRequest(0, false);

    return NextResponse.json(
      {
        success: false,
        error: '获取性能指标失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/performance - 重置性能数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'reset') {
      // 重置性能数据
      performanceData = [];
      requestCount = 0;
      successCount = 0;
      errorCount = 0;
      totalResponseTime = 0;

      return NextResponse.json({
        success: true,
        message: '性能数据已重置',
      });
    }

    if (action === 'export') {
      // 导出性能数据
      const exportData = {
        timestamp: Date.now(),
        serverInfo: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
        },
        performanceData,
        summary: {
          totalRequests: requestCount,
          successRate:
            requestCount > 0 ? (successCount / requestCount) * 100 : 0,
          averageResponseTime:
            requestCount > 0 ? totalResponseTime / requestCount : 0,
        },
      };

      return NextResponse.json({
        success: true,
        data: exportData,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: '无效的操作',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('处理性能数据操作失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '处理操作失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
