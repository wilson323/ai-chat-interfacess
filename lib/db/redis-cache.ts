import redis from './redis';

/**
 * 设置缓存
 * @param key 缓存键
 * @param value 缓存值（自动 JSON 序列化）
 * @param ttl 过期时间（秒），可选
 */
export async function setCache<T>(key: string, value: T, ttl?: number): Promise<void> {
  try {
    const data = JSON.stringify(value);
    if (ttl) {
      await redis.set(key, data, { EX: ttl });
    } else {
      await redis.set(key, data);
    }
  } catch (error) {
    console.error('Redis setCache error:', error);
  }
}

/**
 * 获取缓存
 * @param key 缓存键
 * @returns 反序列化后的值，未命中返回 null
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('Redis getCache error:', error);
    return null;
  }
}

/**
 * 删除缓存
 * @param key 缓存键
 */
export async function delCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Redis delCache error:', error);
  }
}

/**
 * 设置缓存过期时间
 * @param key 缓存键
 * @param ttl 过期时间（秒）
 */
export async function expireCache(key: string, ttl: number): Promise<void> {
  try {
    await redis.expire(key, ttl);
  } catch (error) {
    console.error('Redis expireCache error:', error);
  }
} 