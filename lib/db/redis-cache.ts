import { redisManager } from '@/lib/cache/redis-manager';

/**
 * 设置缓存
 * @param key 缓存键
 * @param value 缓存值（自动 JSON 序列化）
 * @param ttl 过期时间（秒），可选
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttl?: number
): Promise<boolean> {
  try {
    return await redisManager.set(key, value, ttl);
  } catch (error) {
    console.error('Redis setCache error:', error);
    return false;
  }
}

/**
 * 获取缓存
 * @param key 缓存键
 * @returns 反序列化后的值，未命中返回 null
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    return await redisManager.get(key);
  } catch (error) {
    console.error('Redis getCache error:', error);
    return null;
  }
}

/**
 * 删除缓存
 * @param key 缓存键
 */
export async function delCache(key: string): Promise<boolean> {
  try {
    return await redisManager.delete(key);
  } catch (error) {
    console.error('Redis delCache error:', error);
    return false;
  }
}

/**
 * 检查缓存是否存在
 * @param key 缓存键
 */
export async function existsCache(key: string): Promise<boolean> {
  try {
    return await redisManager.exists(key);
  } catch (error) {
    console.error('Redis existsCache error:', error);
    return false;
  }
}

/**
 * 设置缓存过期时间
 * @param key 缓存键
 * @param ttl 过期时间（秒）
 */
export async function expireCache(key: string, ttl: number): Promise<boolean> {
  try {
    return await redisManager.expire(key, ttl);
  } catch (error) {
    console.error('Redis expireCache error:', error);
    return false;
  }
}

/**
 * 批量设置缓存
 * @param items 缓存项数组
 */
export async function msetCache<T>(
  items: Array<{ key: string; value: T; ttl?: number }>
): Promise<boolean> {
  try {
    return await redisManager.mset(items);
  } catch (error) {
    console.error('Redis msetCache error:', error);
    return false;
  }
}

/**
 * 批量获取缓存
 * @param keys 缓存键数组
 */
export async function mgetCache<T>(keys: string[]): Promise<(T | null)[]> {
  try {
    return await redisManager.mget(keys);
  } catch (error) {
    console.error('Redis mgetCache error:', error);
    return keys.map(() => null);
  }
}

/**
 * 获取缓存统计信息
 */
export async function getCacheStats() {
  try {
    return await redisManager.getStats();
  } catch (error) {
    console.error('获取缓存统计失败:', error);
    return null;
  }
}

/**
 * 执行缓存健康检查
 */
export async function cacheHealthCheck() {
  try {
    return await redisManager.healthCheck();
  } catch (error) {
    console.error('缓存健康检查失败:', error);
    return {
      status: 'unhealthy' as const,
      responseTime: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 清理过期缓存
 */
export async function cleanupExpiredCache(): Promise<number> {
  try {
    return await redisManager.cleanupExpired();
  } catch (error) {
    console.error('清理过期缓存失败:', error);
    return 0;
  }
}

/**
 * 导出Redis管理器实例供高级使用
 */
export { redisManager };
