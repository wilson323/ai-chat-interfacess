/**
 * 简单的内存缓存管理器
 * 服务端和客户端都可以使用，不依赖Redis
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 3600; // 1小时

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  async set<T>(key: string, data: T, ttl: number = this.defaultTTL): Promise<void> {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async getStats(): Promise<any> {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      timestamp: Date.now(),
    };
  }

  // 智能体配置特定的缓存方法
  async getCachedAgentConfig(key: string): Promise<any[] | null> {
    return this.get<any[]>(key);
  }

  async cacheAgentConfig(key: string, data: any[]): Promise<void> {
    await this.set(key, data, 1800); // 30分钟
  }
}

// 创建全局实例
export const simpleCacheManager = new SimpleCacheManager();