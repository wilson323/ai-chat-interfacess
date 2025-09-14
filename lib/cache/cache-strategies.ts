/**
 * 缓存策略管理器
 * 实现不同的缓存策略和优化算法
 */

import { redisManager, type CacheStats } from './redis-manager';

export interface CacheStrategy {
  name: string;
  description: string;
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<boolean>;
  invalidate(key: string): Promise<boolean>;
  warmup<T>(
    items: Array<{ key: string; value: T; ttl?: number }>
  ): Promise<boolean>;
}

export interface CachePolicy {
  maxSize: number;
  evictionPolicy: 'LRU' | 'LFU' | 'FIFO' | 'TTL';
  defaultTTL: number;
  refreshThreshold: number;
  enableCompression: boolean;
  enableEncryption: boolean;
}

/**
 * LRU (Least Recently Used) 缓存策略
 */
export class LRUCacheStrategy implements CacheStrategy {
  name = 'LRU';
  description = '最近最少使用缓存策略';

  async get<T>(key: string): Promise<T | null> {
    const value = await redisManager.get<T>(key);

    if (value) {
      // 更新访问时间（通过重新设置实现）
      await redisManager.set(key, value, 3600);
    }

    return value;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    return await redisManager.set(key, value, ttl);
  }

  async invalidate(key: string): Promise<boolean> {
    return await redisManager.delete(key);
  }

  async warmup<T>(
    items: Array<{ key: string; value: T; ttl?: number }>
  ): Promise<boolean> {
    return await redisManager.warmup(items);
  }
}

/**
 * LFU (Least Frequently Used) 缓存策略
 */
export class LFUCacheStrategy implements CacheStrategy {
  name = 'LFU';
  description = '最少使用频率缓存策略';

  async get<T>(key: string): Promise<T | null> {
    const value = await redisManager.get<T>(key);

    if (value) {
      // 增加访问计数
      await this.incrementAccessCount(key);
    }

    return value;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    const success = await redisManager.set(key, value, ttl);

    if (success) {
      // 初始化访问计数
      await this.setAccessCount(key, 1);
    }

    return success;
  }

  async invalidate(key: string): Promise<boolean> {
    await this.deleteAccessCount(key);
    return await redisManager.delete(key);
  }

  async warmup<T>(
    items: Array<{ key: string; value: T; ttl?: number }>
  ): Promise<boolean> {
    const success = await redisManager.warmup(items);

    if (success) {
      // 为所有预热项设置访问计数
      for (const item of items) {
        await this.setAccessCount(item.key, 1);
      }
    }

    return success;
  }

  private async incrementAccessCount(key: string): Promise<void> {
    const countKey = `access_count:${key}`;
    const currentCount = (await redisManager.get<number>(countKey)) || 0;
    await redisManager.set(countKey, currentCount + 1, 86400); // 24小时过期
  }

  private async setAccessCount(key: string, count: number): Promise<void> {
    const countKey = `access_count:${key}`;
    await redisManager.set(countKey, count, 86400);
  }

  private async deleteAccessCount(key: string): Promise<void> {
    const countKey = `access_count:${key}`;
    await redisManager.delete(countKey);
  }
}

/**
 * TTL (Time To Live) 缓存策略
 */
export class TTLCacheStrategy implements CacheStrategy {
  name = 'TTL';
  description = '基于时间的缓存策略';

  async get<T>(key: string): Promise<T | null> {
    return await redisManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    return await redisManager.set(key, value, ttl);
  }

  async invalidate(key: string): Promise<boolean> {
    return await redisManager.delete(key);
  }

  async warmup<T>(
    items: Array<{ key: string; value: T; ttl?: number }>
  ): Promise<boolean> {
    return await redisManager.warmup(items);
  }
}

/**
 * 智能缓存策略
 * 结合多种策略的智能缓存管理
 */
export class SmartCacheStrategy implements CacheStrategy {
  name = 'Smart';
  description = '智能缓存策略，根据访问模式自动调整';

  private accessPatterns = new Map<
    string,
    {
      accessCount: number;
      lastAccess: number;
      averageInterval: number;
    }
  >();

  async get<T>(key: string): Promise<T | null> {
    const value = await redisManager.get<T>(key);

    if (value) {
      await this.updateAccessPattern(key);

      // 根据访问模式调整TTL
      const pattern = this.accessPatterns.get(key);
      if (pattern) {
        const newTTL = this.calculateOptimalTTL(pattern);
        await redisManager.expire(key, newTTL);
      }
    }

    return value;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    const success = await redisManager.set(key, value, ttl);

    if (success) {
      this.accessPatterns.set(key, {
        accessCount: 1,
        lastAccess: Date.now(),
        averageInterval: 0,
      });
    }

    return success;
  }

  async invalidate(key: string): Promise<boolean> {
    this.accessPatterns.delete(key);
    return await redisManager.delete(key);
  }

  async warmup<T>(
    items: Array<{ key: string; value: T; ttl?: number }>
  ): Promise<boolean> {
    const success = await redisManager.warmup(items);

    if (success) {
      const now = Date.now();
      for (const item of items) {
        this.accessPatterns.set(item.key, {
          accessCount: 1,
          lastAccess: now,
          averageInterval: 0,
        });
      }
    }

    return success;
  }

  private async updateAccessPattern(key: string): Promise<void> {
    const now = Date.now();
    const pattern = this.accessPatterns.get(key);

    if (pattern) {
      const interval = now - pattern.lastAccess;
      pattern.accessCount++;
      pattern.averageInterval =
        (pattern.averageInterval * (pattern.accessCount - 1) + interval) /
        pattern.accessCount;
      pattern.lastAccess = now;
    } else {
      this.accessPatterns.set(key, {
        accessCount: 1,
        lastAccess: now,
        averageInterval: 0,
      });
    }
  }

  private calculateOptimalTTL(pattern: {
    accessCount: number;
    lastAccess: number;
    averageInterval: number;
  }): number {
    // 基于访问频率和间隔计算最优TTL
    const baseTTL = 3600; // 1小时基础TTL

    if (pattern.averageInterval > 0) {
      // 如果访问间隔较长，增加TTL
      return Math.min(baseTTL * 2, pattern.averageInterval / 1000);
    } else if (pattern.accessCount > 10) {
      // 如果访问频繁，保持较长TTL
      return baseTTL * 1.5;
    }

    return baseTTL;
  }
}

/**
 * 缓存策略管理器
 */
export class CacheStrategyManager {
  private strategies = new Map<string, CacheStrategy>();
  private currentStrategy: CacheStrategy;
  private policy: CachePolicy;

  constructor(policy: CachePolicy) {
    this.policy = policy;

    // 注册默认策略
    this.registerStrategy(new LRUCacheStrategy());
    this.registerStrategy(new LFUCacheStrategy());
    this.registerStrategy(new TTLCacheStrategy());
    this.registerStrategy(new SmartCacheStrategy());

    // 设置默认策略
    this.currentStrategy = this.getStrategy('Smart')!;
  }

  /**
   * 注册缓存策略
   */
  registerStrategy(strategy: CacheStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  /**
   * 获取缓存策略
   */
  getStrategy(name: string): CacheStrategy | undefined {
    return this.strategies.get(name);
  }

  /**
   * 设置当前策略
   */
  setStrategy(name: string): boolean {
    const strategy = this.getStrategy(name);
    if (strategy) {
      this.currentStrategy = strategy;
      return true;
    }
    return false;
  }

  /**
   * 获取当前策略
   */
  getCurrentStrategy(): CacheStrategy {
    return this.currentStrategy;
  }

  /**
   * 获取所有可用策略
   */
  getAllStrategies(): CacheStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * 更新缓存策略
   */
  updatePolicy(policy: Partial<CachePolicy>): void {
    this.policy = { ...this.policy, ...policy };
  }

  /**
   * 获取缓存统计信息
   */
  async getStats(): Promise<CacheStats> {
    return await redisManager.getStats();
  }

  /**
   * 清理过期缓存
   */
  async cleanup(): Promise<number> {
    // 这里应该实现清理逻辑
    // 实际项目中可以使用Redis的SCAN命令
    return 0;
  }

  /**
   * 优化缓存配置
   */
  async optimize(): Promise<{
    recommendations: string[];
    newPolicy: Partial<CachePolicy>;
  }> {
    const stats = await this.getStats();
    const recommendations: string[] = [];
    const newPolicy: Partial<CachePolicy> = {};

    // 基于命中率优化
    if (stats.hitRate < 70) {
      recommendations.push('缓存命中率较低，建议增加缓存大小或调整TTL');
      newPolicy.maxSize = Math.min(this.policy.maxSize * 1.5, 10000);
    }

    // 基于内存使用优化
    if (stats.memoryUsage > 80) {
      recommendations.push('内存使用率较高，建议启用压缩或减少缓存大小');
      newPolicy.enableCompression = true;
      newPolicy.maxSize = Math.max(this.policy.maxSize * 0.8, 1000);
    }

    // 基于键数量优化
    if (stats.totalKeys > this.policy.maxSize * 0.9) {
      recommendations.push('缓存键数量接近上限，建议调整淘汰策略');
      newPolicy.evictionPolicy = 'LRU';
    }

    return { recommendations, newPolicy };
  }
}

// 默认缓存策略配置
export const defaultCachePolicy: CachePolicy = {
  maxSize: 1000,
  evictionPolicy: 'LRU',
  defaultTTL: 3600,
  refreshThreshold: 0.8,
  enableCompression: false,
  enableEncryption: false,
};

// 创建默认策略管理器
export const cacheStrategyManager = new CacheStrategyManager(
  defaultCachePolicy
);
