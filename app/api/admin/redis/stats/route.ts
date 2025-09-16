import { NextRequest, NextResponse } from 'next/server';
import { redisManager } from '@/lib/cache/redis-manager';

/**
 * Redis统计信息API端点
 * GET /api/admin/redis/stats
 *
 * 返回详细的Redis缓存统计信息和性能指标
 */

export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';
    const reset = searchParams.get('reset') === 'true';

    // 重置统计信息（如果请求）
    if (reset) {
      redisManager.resetStats();
    }

    // 获取统计信息
    if (detailed) {
      const detailedStats = await redisManager.getDetailedStats();

      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: detailedStats,
      });
    } else {
      const stats = await redisManager.getStats();

      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          basic: {
            hits: stats.hits,
            misses: stats.misses,
            hitRate: Number(stats.hitRate.toFixed(2)),
            totalKeys: stats.totalKeys,
            memoryUsage: Number(stats.memoryUsage.toFixed(2)),
            connectedClients: stats.connectedClients,
            uptime: stats.uptime,
          },
          performance: {
            commandsPerSecond: Math.round(stats.commandsPerSecond),
            averageResponseTime: Number(stats.averageResponseTime.toFixed(2)),
            slowCommands: stats.slowCommands,
          },
          connection: {
            status: stats.connectionStatus,
            lastError: stats.lastError,
          },
        },
      });
    }
  } catch (error) {
    console.error('获取Redis统计信息失败:', error);

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * 执行缓存维护操作
 * POST /api/admin/redis/stats
 *
 * 支持的维护操作：
 * - cleanup: 清理过期缓存
 * - lru: 执行LRU清理
 * - flush: 清空所有缓存
 */
export async function POST(request: NextRequest) {
  let operation: string | undefined;

  try {
    const body = await request.json();
    const { operation: op, params = {} } = body;
    operation = op;

    let result;

    switch (operation) {
      case 'cleanup':
        result = await redisManager.cleanupExpired();
        break;

      case 'lru':
        const maxKeys = params.maxKeys || 1000;
        await redisManager.implementLRU(maxKeys);
        result = { message: `LRU策略已应用，最大键数: ${maxKeys}` };
        break;

      case 'flush':
        await redisManager.flushAll();
        result = { message: '所有缓存已清空' };
        break;

      case 'warmup':
        const items = params.items || [];
        if (items.length === 0) {
          throw new Error('缓存预热需要提供items参数');
        }
        const warmupResult = await redisManager.warmup(items);
        result = {
          success: warmupResult,
          message: `已预热 ${items.length} 个缓存项`,
          itemsCount: items.length,
        };
        break;

      case 'hotkeys':
        const limit = params.limit || 10;
        const hotKeys = await redisManager.getHotKeys(limit);
        result = { hotKeys, count: hotKeys.length };
        break;

      default:
        throw new Error(`不支持的操作: ${operation}`);
    }

    // 获取更新后的统计信息
    const stats = await redisManager.getStats();

    return NextResponse.json({
      success: true,
      operation,
      result,
      timestamp: new Date().toISOString(),
      stats: {
        hits: stats.hits,
        misses: stats.misses,
        hitRate: Number(stats.hitRate.toFixed(2)),
        totalKeys: stats.totalKeys,
        memoryUsage: Number(stats.memoryUsage.toFixed(2)),
      },
    });
  } catch (error) {
    console.error('执行Redis维护操作失败:', error);

    return NextResponse.json(
      {
        success: false,
        operation: (error as any).operation || 'unknown',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
}
