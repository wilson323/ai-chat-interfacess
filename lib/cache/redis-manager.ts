


































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































/**
 * Redis缓存管理器
 * 提供统一的缓存接口和优化策略
 */
import { logger } from '@/lib/utils/logger';
import { createClient, RedisClientType } from 'redis';
// Record is a built-in TypeScript utility type
import { appConfig } from '../../lib/config';

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  defaultTTL?: number;
  maxRetries?: number;
  retryDelay?: number;
  connectionTimeout?: number;
  commandTimeout?: number;
  enablePool?: boolean;
  poolSize?: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalKeys: number;
  memoryUsage: number;
  connectedClients: number;
  uptime: number;
  commandsPerSecond: number;
  averageResponseTime: number;
  slowCommands: number;
  connectionStatus:
  | 'connected'
  | 'disconnected'
  | 'connecting'
  | 'reconnecting';
  lastError?: string;
}

export interface CacheItem<T = Record<string, unknown>> {
  key: string;
  value: T;
  ttl: number;
  createdAt: number;
  accessedAt: number;
  accessCount: number;
}

class RedisManager {
  private config: CacheConfig;
  private client: RedisClientType;
  private stats = {
    hits: 0,
    misses: 0,
    totalKeys: 0,
    commandsPerSecond: 0,
    averageResponseTime: 0,
    slowCommands: 0,
    connectionStatus: 'disconnected' as
      | 'connected'
      | 'disconnected'
      | 'connecting'
      | 'reconnecting',
    lastError: '',
  };
  private commandTimes: number[] = [];
  private commandTimestamps: number[] = [];
  private isConnected = false;
  private maxReconnectAttempts = 3;

  constructor(config: CacheConfig) {
    this.config = {
      keyPrefix: 'ai-chat:',
      defaultTTL: 3600, // 1小时
      maxRetries: 3,
      retryDelay: 1000,
      connectionTimeout: 10000,
      commandTimeout: 5000,
      enablePool: true,
      poolSize: 10,
      ...config,
    };

    this.client = this.createRedisClient();
    this.setupEventListeners();
  }

  /**
   * 创建Redis客户端
   */
  private createRedisClient(): RedisClientType {
    return createClient({
      url: `redis://${this.config.host}:${this.config.port}`,
      password: this.config.password,
      database: this.config.db,
      socket: {
        reconnectStrategy: (retries: number) => {
          // this.reconnectAttempts = retries; // 暂时注释，避免未使用变量错误
          this.stats.connectionStatus = 'reconnecting';

          if (retries >= this.maxReconnectAttempts) {
            this.stats.connectionStatus = 'disconnected';
            this.stats.lastError = 'Max reconnection attempts reached';
            return false; // 停止重连
          }

          const delay = Math.min(retries * this.config.retryDelay!, 5000);
          logger.debug(
            `Redis reconnecting... attempt ${retries + 1}, delay: ${delay}ms`
          );
          return delay;
        },
        connectTimeout: this.config.connectionTimeout,
        keepAlive: true,
      },
      // 连接池配置
      commandsQueueMaxLength: this.config.poolSize
        ? this.config.poolSize * 10
        : 100,
    });
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    this.client.on('connect', () => {
      this.stats.connectionStatus = 'connecting';
      logger.debug('Redis client connecting...');
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      this.stats.connectionStatus = 'connected';
      // this.reconnectAttempts = 0; // 暂时注释，避免未使用变量错误
      logger.debug('Redis client ready and connected');
    });

    this.client.on('disconnect', () => {
      this.isConnected = false;
      this.stats.connectionStatus = 'disconnected';
      logger.debug('Redis client disconnected');
    });

    this.client.on('reconnecting', () => {
      this.stats.connectionStatus = 'reconnecting';
      logger.debug('Redis client reconnecting...');
    });

    this.client.on('error', (error: Error) => {
      this.stats.lastError = error.message;
      logger.error('Redis client error:', error);

      if (!this.isConnected) {
        this.stats.connectionStatus = 'disconnected';
      }
    });

    this.client.on('end', () => {
      this.isConnected = false;
      this.stats.connectionStatus = 'disconnected';
      logger.debug('Redis client connection ended');
    });
  }

  /**
   * 连接到Redis
   */
  async connect(): Promise<void> {
    if (this.isConnected || this.stats.connectionStatus === 'connecting') {
      return;
    }

    this.stats.connectionStatus = 'connecting';

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      // 测试连接
      await this.client.ping();
      this.isConnected = true;
      this.stats.connectionStatus = 'connected';
      logger.debug('✅ Redis连接成功');
    } catch (error) {
      this.isConnected = false;
      this.stats.connectionStatus = 'disconnected';
      this.stats.lastError =
        error instanceof Error ? error.message : 'Connection failed';
      logger.error('❌ Redis连接失败:', error);
      throw error;
    }
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    try {
      if (this.client.isOpen) {
        await this.client.quit();
      }
      this.isConnected = false;
      this.stats.connectionStatus = 'disconnected';
      logger.debug('Redis连接已断开');
    } catch (error) {
      logger.error('断开Redis连接时出错:', error);
    }
  }

  /**
   * 确保连接状态
   */
  private async ensureConnection(): Promise<void> {
    if (!this.isConnected || !this.client.isOpen) {
      await this.connect();
    }
  }

  /**
   * 带重试的命令执行
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    await this.ensureConnection();

    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries!; attempt++) {
      try {
        const result = await operation();
        const duration = Date.now() - startTime;

        // 记录命令执行时间
        this.recordCommandTime(duration, operationName);

        return result;
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.config.maxRetries!) {
          logger.warn(
            `${operationName} 失败 (尝试 ${attempt + 1}/${this.config.maxRetries}):`,
            error instanceof Error ? error.message : error
          );

          // 等待重试延迟
          await new Promise(resolve =>
            setTimeout(resolve, this.config.retryDelay)
          );
        } else {
          logger.error(
            `${operationName} 失败，已达最大重试次数:`,
            error instanceof Error ? error.message : error
          );
        }
      }
    }

    throw lastError;
  }

  /**
   * 记录命令执行时间
   */
  private recordCommandTime(duration: number, commandName: string): void {
    this.commandTimes.push(duration);
    this.commandTimestamps.push(Date.now());

    // 保持数组大小限制
    const maxRecords = 1000;
    if (this.commandTimes.length > maxRecords) {
      this.commandTimes = this.commandTimes.slice(-maxRecords);
      this.commandTimestamps = this.commandTimestamps.slice(-maxRecords);
    }

    // 更新平均响应时间
    this.stats.averageResponseTime =
      this.commandTimes.reduce((sum, time) => sum + time, 0) /
      this.commandTimes.length;

    // 计算每秒命令数
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    const recentCommands = this.commandTimestamps.filter(
      timestamp => timestamp > oneSecondAgo
    );
    this.stats.commandsPerSecond = recentCommands.length;

    // 记录慢命令
    if (duration > 100) {
      this.stats.slowCommands++;
      logger.warn(`🐌 慢命令检测: ${commandName} 耗时 ${duration}ms`);
    }
  }

  /**
   * 生成完整的缓存键
   */
  private getFullKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  /**
   * 设置缓存
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key);
      const item: CacheItem<T> = {
        key: fullKey,
        value,
        ttl: ttl || this.config.defaultTTL!,
        createdAt: Date.now(),
        accessedAt: Date.now(),
        accessCount: 0,
      };

      await this.executeWithRetry(async () => {
        if (ttl) {
          await this.client.setEx(fullKey, ttl, JSON.stringify(item));
        } else {
          await this.client.set(fullKey, JSON.stringify(item));
        }
      }, 'SET');

      this.stats.totalKeys++;
      return true;
    } catch (error) {
      logger.error('Redis SET 操作失败:', error);
      return false;
    }
  }

  /**
   * 获取缓存
   */
  async get<T extends Record<string, unknown>>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key);

      const itemStr = await this.executeWithRetry(async () => {
        return await this.client.get(fullKey);
      }, 'GET');

      if (!itemStr || typeof itemStr !== 'string') {
        this.stats.misses++;
        return null;
      }

      const item = JSON.parse(itemStr) as CacheItem<T>;

      // 检查是否过期
      if (this.isExpired(item as CacheItem<Record<string, unknown>>)) {
        await this.delete(key);
        this.stats.misses++;
        return null;
      }

      // 更新访问统计
      item.accessedAt = Date.now();
      item.accessCount++;

      // 更新缓存项（使用管道批量操作提升性能）
      await this.executeWithRetry(async () => {
        const pipeline = this.client.multi();
        pipeline.set(fullKey, JSON.stringify(item));
        if (item.ttl > 0) {
          pipeline.expire(fullKey, item.ttl);
        }
        await pipeline.exec();
      }, 'GET_UPDATE');

      this.stats.hits++;
      return item.value;
    } catch (error) {
      logger.error('Redis GET 操作失败:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key);
      const result = await this.executeWithRetry(async () => {
        return await this.client.del(fullKey);
      }, 'DELETE');

      if (result > 0) {
        this.stats.totalKeys = Math.max(0, this.stats.totalKeys - 1);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Redis DELETE 操作失败:', error);
      return false;
    }
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key);
      const result = await this.executeWithRetry(async () => {
        return await this.client.exists(fullKey);
      }, 'EXISTS');

      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS 操作失败:', error);
      return false;
    }
  }

  /**
   * 设置过期时间
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key);
      const result = await this.executeWithRetry(async () => {
        return await this.client.expire(fullKey, ttl);
      }, 'EXPIRE');

      return Boolean(result);
    } catch (error) {
      logger.error('Redis EXPIRE 操作失败:', error);
      return false;
    }
  }

  /**
   * 获取剩余过期时间
   */
  async ttl(key: string): Promise<number> {
    try {
      const fullKey = this.getFullKey(key);
      return await this.executeWithRetry(async () => {
        return await this.client.ttl(fullKey);
      }, 'TTL');
    } catch (error) {
      logger.error('Redis TTL 操作失败:', error);
      return -1;
    }
  }

  /**
   * 批量获取
   */
  async mget<T extends Record<string, unknown>>(keys: string[]): Promise<(T | null)[]> {
    try {
      const fullKeys = keys.map(key => this.getFullKey(key));
      const results = await this.executeWithRetry(async () => {
        return await this.client.mGet(fullKeys);
      }, 'MGET');

      return results.map((itemStr, index) => {
        if (!itemStr) {
          this.stats.misses++;
          return null;
        }

        try {
          if (typeof itemStr !== 'string') {
            this.stats.misses++;
            return null;
          }
          const item = JSON.parse(itemStr) as CacheItem<T>;

          if (this.isExpired(item as CacheItem<Record<string, unknown>>)) {
            this.delete(keys[index]);
            this.stats.misses++;
            return null;
          }

          this.stats.hits++;
          return item.value;
        } catch {
          this.stats.misses++;
          return null;
        }
      });
    } catch (error) {
      logger.error('Redis MGET 操作失败:', error);
      return keys.map(() => null);
    }
  }

  /**
   * 批量设置
   */
  async mset<T>(
    items: Array<{ key: string; value: T; ttl?: number }>
  ): Promise<boolean> {
    try {
      const pipeline = this.client.multi();

      for (const item of items) {
        const fullKey = this.getFullKey(item.key);
        const cacheItem: CacheItem<T> = {
          key: fullKey,
          value: item.value,
          ttl: item.ttl || this.config.defaultTTL!,
          createdAt: Date.now(),
          accessedAt: Date.now(),
          accessCount: 0,
        };

        pipeline.set(fullKey, JSON.stringify(cacheItem));

        if (item.ttl) {
          pipeline.expire(fullKey, item.ttl);
        }
      }

      await this.executeWithRetry(async () => {
        await pipeline.exec();
      }, 'MSET');

      this.stats.totalKeys += items.length;
      return true;
    } catch (error) {
      logger.error('Redis MSET 操作失败:', error);
      return false;
    }
  }

  /**
   * 清空所有缓存
   */
  async flushAll(): Promise<boolean> {
    try {
      await this.executeWithRetry(async () => {
        await this.client.flushDb();
      }, 'FLUSHDB');

      this.stats.totalKeys = 0;
      this.stats.hits = 0;
      this.stats.misses = 0;
      return true;
    } catch (error) {
      logger.error('Redis FLUSHDB 操作失败:', error);
      return false;
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getStats(): Promise<CacheStats> {
    const hitRate =
      this.stats.hits + this.stats.misses > 0
        ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
        : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      totalKeys: this.stats.totalKeys,
      memoryUsage: await this.getMemoryUsage(),
      connectedClients: await this.getConnectedClients(),
      uptime: await this.getUptime(),
      commandsPerSecond: this.stats.commandsPerSecond,
      averageResponseTime: this.stats.averageResponseTime,
      slowCommands: this.stats.slowCommands,
      connectionStatus: this.stats.connectionStatus,
      lastError: this.stats.lastError,
    };
  }

  /**
   * 获取热点键
   */
  async getHotKeys(
    limit: number = 10
  ): Promise<Array<{ key: string; accessCount: number }>> {
    try {
      const pattern = `${this.config.keyPrefix}*`;
      const hotKeys: Array<{ key: string; accessCount: number }> = [];

      // 使用SCAN命令避免阻塞
      let cursor: string = '0';
      do {
        const reply = await this.executeWithRetry(async () => {
          return await this.client.scan(cursor, {
            MATCH: pattern,
            COUNT: 100,
          });
        }, 'SCAN');

        cursor = reply.cursor;

        for (const key of reply.keys) {
          try {
            // 获取缓存项以分析访问统计
            const itemStr = await this.client.get(key);
            if (itemStr && typeof itemStr === 'string') {
              const item: CacheItem = JSON.parse(itemStr);
              hotKeys.push({
                key: key.replace(this.config.keyPrefix!, ''),
                accessCount: item.accessCount,
              });
            }
          } catch {
            // 忽略单个键的错误
            continue;
          }
        }
      } while (cursor !== '0');

      // 按访问次数排序并返回前N个
      return hotKeys
        .sort((a, b) => b.accessCount - a.accessCount)
        .slice(0, limit);
    } catch (error) {
      logger.error('获取热点键失败:', error);
      return [];
    }
  }

  /**
   * 缓存预热
   */
  async warmup<T>(
    items: Array<{ key: string; value: T; ttl?: number }>
  ): Promise<boolean> {
    try {
      return await this.mset(items);
    } catch (error) {
      logger.error('缓存预热失败:', error);
      return false;
    }
  }

  /**
   * 检查项是否过期
   */
  private isExpired(item: CacheItem<Record<string, unknown>>): boolean {
    const now = Date.now();
    return now - item.createdAt > item.ttl * 1000;
  }

  private async getMemoryUsage(): Promise<number> {
    try {
      const info = await this.executeWithRetry(async () => {
        return await this.client.info('memory');
      }, 'INFO_MEMORY');

      // 解析Redis INFO命令返回的内存使用信息
      const lines = info.split('\n');
      for (const line of lines) {
        if (line.startsWith('used_memory:')) {
          return parseInt(line.split(':')[1].trim()) / 1024 / 1024; // 转换为MB
        }
      }
      return 0;
    } catch (error) {
      logger.error('获取内存使用信息失败:', error);
      return 0;
    }
  }

  private async getConnectedClients(): Promise<number> {
    try {
      const info = await this.executeWithRetry(async () => {
        return await this.client.info('clients');
      }, 'INFO_CLIENTS');

      const lines = info.split('\n');
      for (const line of lines) {
        if (line.startsWith('connected_clients:')) {
          return parseInt(line.split(':')[1].trim());
        }
      }
      return 0;
    } catch (error) {
      logger.error('获取连接客户端数失败:', error);
      return 0;
    }
  }

  private async getUptime(): Promise<number> {
    try {
      const info = await this.executeWithRetry(async () => {
        return await this.client.info('server');
      }, 'INFO_SERVER');

      const lines = info.split('\n');
      for (const line of lines) {
        if (line.startsWith('uptime_in_seconds:')) {
          return parseInt(line.split(':')[1].trim());
        }
      }
      return 0;
    } catch (error) {
      logger.error('获取运行时间失败:', error);
      return 0;
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    error?: string;
    details?: {
      connection: string;
      memory: number;
      clients: number;
      uptime: number;
    };
  }> {
    const startTime = Date.now();

    try {
      await this.ensureConnection();

      // 执行ping测试
      await this.client.ping();

      const responseTime = Date.now() - startTime;

      // 获取详细健康信息
      const memory = await this.getMemoryUsage();
      const clients = await this.getConnectedClients();
      const uptime = await this.getUptime();

      return {
        status: 'healthy',
        responseTime,
        details: {
          connection: this.stats.connectionStatus,
          memory,
          clients,
          uptime,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        status: 'unhealthy',
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 实现LRU缓存策略
   */
  async implementLRU(maxKeys: number): Promise<void> {
    try {
      // 获取所有键
      const pattern = `${this.config.keyPrefix}*`;
      const allKeys: string[] = [];

      let cursor: string = '0';
      do {
        const reply = await this.client.scan(cursor, {
          MATCH: pattern,
          COUNT: 100,
        });
        cursor = reply.cursor;
        allKeys.push(...reply.keys);
      } while (cursor !== '0');

      // 如果键数量超过限制，删除最久未使用的
      if (allKeys.length > maxKeys) {
        // 获取所有键的访问时间
        const keyAccessTimes: Array<{ key: string; accessedAt: number }> = [];

        for (const key of allKeys) {
          try {
            const itemStr = await this.client.get(key);
            if (itemStr && typeof itemStr === 'string') {
              const item: CacheItem = JSON.parse(itemStr);
              keyAccessTimes.push({ key, accessedAt: item.accessedAt });
            }
          } catch {
            continue;
          }
        }

        // 按访问时间排序，删除最旧的
        keyAccessTimes.sort((a, b) => a.accessedAt - b.accessedAt);
        const keysToDelete = keyAccessTimes.slice(0, allKeys.length - maxKeys);

        // 批量删除
        const pipeline = this.client.multi();
        for (const { key } of keysToDelete) {
          pipeline.del(key);
        }
        await pipeline.exec();

        this.stats.totalKeys = Math.max(
          0,
          this.stats.totalKeys - keysToDelete.length
        );
        logger.debug(`LRU清理: 删除了 ${keysToDelete.length} 个最久未使用的键`);
      }
    } catch (error) {
      logger.error('LRU缓存清理失败:', error);
    }
  }

  /**
   * 缓存过期清理
   */
  async cleanupExpired(): Promise<number> {
    try {
      const pattern = `${this.config.keyPrefix}*`;
      let expiredCount = 0;

      let cursor: string = '0';
      do {
        const reply = await this.client.scan(cursor, {
          MATCH: pattern,
          COUNT: 100,
        });
        cursor = reply.cursor;

        for (const key of reply.keys) {
          try {
            const itemStr = await this.client.get(key);
            if (itemStr && typeof itemStr === 'string') {
              const item: CacheItem = JSON.parse(itemStr);
              if (this.isExpired(item as CacheItem<Record<string, unknown>>)) {
                await this.client.del(key);
                expiredCount++;
              }
            }
          } catch {
            continue;
          }
        }
      } while (cursor !== '0');

      if (expiredCount > 0) {
        this.stats.totalKeys = Math.max(0, this.stats.totalKeys - expiredCount);
        logger.debug(`过期缓存清理: 删除了 ${expiredCount} 个过期键`);
      }

      return expiredCount;
    } catch (error) {
      logger.error('过期缓存清理失败:', error);
      return 0;
    }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      totalKeys: this.stats.totalKeys, // 保留当前键数
      commandsPerSecond: 0,
      averageResponseTime: 0,
      slowCommands: 0,
      connectionStatus: this.stats.connectionStatus,
      lastError: '',
    };
    this.commandTimes = [];
    this.commandTimestamps = [];
  }

  /**
   * 获取详细性能统计
   */
  async getDetailedStats() {
    const basicStats = await this.getStats();

    return {
      ...basicStats,
      performance: {
        commandTimes: {
          min:
            this.commandTimes.length > 0 ? Math.min(...this.commandTimes) : 0,
          max:
            this.commandTimes.length > 0 ? Math.max(...this.commandTimes) : 0,
          average: this.stats.averageResponseTime,
          p95: this.calculatePercentile(95),
          p99: this.calculatePercentile(99),
        },
        throughput: {
          commandsPerSecond: this.stats.commandsPerSecond,
          totalCommands: this.stats.hits + this.stats.misses,
        },
      },
      config: {
        ...this.config,
        password: '***', // 隐藏密码
      },
    };
  }

  /**
   * 计算百分位数
   */
  private calculatePercentile(percentile: number): number {
    if (this.commandTimes.length === 0) return 0;

    const sorted = [...this.commandTimes].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;

    return sorted[index] || 0;
  }
}

// 创建默认实例
const defaultConfig: CacheConfig = {
  host: process.env.REDIS_HOST || appConfig.redis.host,
  port: parseInt(process.env.REDIS_PORT || appConfig.redis.port.toString()),
  password: process.env.REDIS_PASSWORD || appConfig.redis.password,
  db: parseInt(process.env.REDIS_DB || appConfig.redis.db.toString()),
  keyPrefix: 'ai-chat:',
  defaultTTL: 3600,
  connectionTimeout: 10000,
  commandTimeout: 5000,
  enablePool: true,
  poolSize: 10,
  maxRetries: 3,
  retryDelay: 1000,
};

export const redisManager = new RedisManager(defaultConfig);
export { RedisManager };
