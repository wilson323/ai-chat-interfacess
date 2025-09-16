import { NextRequest, NextResponse } from 'next/server';
import { redisManager } from '@/lib/cache/redis-manager';

/**
 * Redis健康检查API端点
 * GET /api/admin/redis/health
 *
 * 返回Redis缓存系统的健康状态和性能指标
 */

export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';

    // 执行健康检查
    const health = await redisManager.healthCheck();

    // 获取基本统计信息
    const stats = await redisManager.getStats();

    const response = {
      status: health.status,
      timestamp: new Date().toISOString(),
      responseTime: health.responseTime,
      error: health.error,
      stats: {
        hits: stats.hits,
        misses: stats.misses,
        hitRate: Number(stats.hitRate.toFixed(2)),
        totalKeys: stats.totalKeys,
        memoryUsage: Number(stats.memoryUsage.toFixed(2)),
        commandsPerSecond: Math.round(stats.commandsPerSecond),
        averageResponseTime: Number(stats.averageResponseTime.toFixed(2)),
        slowCommands: stats.slowCommands,
        connectionStatus: stats.connectionStatus,
      },
    };

    // 如果需要详细信息
    if (detailed && health.details) {
      Object.assign(response, {
        details: {
          ...health.details,
          memory: Number(health.details.memory.toFixed(2)),
        },
      });
    }

    // 根据健康状态设置HTTP状态码
    const statusCode = health.status === 'healthy' ? 200 : 503;

    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    console.error('Redis健康检查API错误:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        stats: {
          hits: 0,
          misses: 0,
          hitRate: 0,
          totalKeys: 0,
          memoryUsage: 0,
          commandsPerSecond: 0,
          averageResponseTime: 0,
          slowCommands: 0,
          connectionStatus: 'disconnected',
        },
      },
      { status: 503 }
    );
  }
}

/**
 * 修复Redis连接
 * POST /api/admin/redis/health
 *
 * 尝试重新连接Redis服务
 */
export async function POST(_request: NextRequest) {
  try {
    // 断开现有连接
    await redisManager.disconnect();

    // 等待短暂时间
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 重新连接
    await redisManager.connect();

    // 执行健康检查
    const health = await redisManager.healthCheck();

    return NextResponse.json(
      {
        status: health.status,
        message:
          health.status === 'healthy'
            ? 'Redis连接修复成功'
            : 'Redis连接修复失败',
        timestamp: new Date().toISOString(),
        responseTime: health.responseTime,
        error: health.error,
      },
      { status: health.status === 'healthy' ? 200 : 503 }
    );
  } catch (error) {
    console.error('Redis连接修复API错误:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        message: 'Redis连接修复失败',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
