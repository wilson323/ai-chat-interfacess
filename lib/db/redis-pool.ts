/**
 * Redis连接池优化
 * 提供高性能的Redis连接池管理和监控
 */

import { createClient, RedisClientType } from 'redis';
// // Record is a built-in TypeScript utility type // 移除错误的Record导入，使用内置Record类型
import { appConfig } from '@/lib/config';
import { logger } from '@/lib/utils/logger';

interface RedisStats {
  totalConnections: number;
  activeConnections: number;
  commandsExecuted: number;
  errors: number;
  averageResponseTime: number;
  slowCommands: number;
}

class RedisConnectionPool {
  private client: RedisClientType;
  private stats: RedisStats = {
    totalConnections: 0,
    activeConnections: 0,
    commandsExecuted: 0,
    errors: 0,
    averageResponseTime: 0,
    slowCommands: 0,
  };

  private commandTimes: number[] = [];
  private maxCommandTimes = 1000;
  private isConnected = false;

  constructor() {
    this.client = createClient({
      url: `redis://${appConfig.redis.host}:${appConfig.redis.port}`,
      password: appConfig.redis.password,
      database: appConfig.redis.db,

      socket: {
        reconnectStrategy: retries => Math.min(retries * 50, 2000),
        connectTimeout: 10000,
        keepAlive: true,
      },

      // 连接池配置
      commandsQueueMaxLength: 1000,
    });

    this.setupEventListeners();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    this.client.on('connect', () => {
      this.stats.totalConnections++;
      this.stats.activeConnections++;
      this.isConnected = true;
      logger.info('Redis connection established');
    });

    this.client.on('disconnect', () => {
      this.stats.activeConnections--;
      this.isConnected = false;
      logger.info('Redis connection closed');
    });

    this.client.on('error', error => {
      this.stats.errors++;
      logger.error('Redis error:', error);
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      logger.info('Redis client ready');
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });
  }

  /**
   * 记录命令执行时间
   */
  private recordCommandTime(duration: number): void {
    this.commandTimes.push(duration);

    // 保持命令时间数组在限制内
    if (this.commandTimes.length > this.maxCommandTimes) {
      this.commandTimes = this.commandTimes.slice(-this.maxCommandTimes);
    }

    // 计算平均响应时间
    this.stats.averageResponseTime =
      this.commandTimes.reduce((sum, time) => sum + time, 0) /
      this.commandTimes.length;

    // 记录慢命令
    if (duration > 100) {
      this.stats.slowCommands++;
      logger.warn('Slow Redis command detected:', `${duration}ms`);
    }
  }

  /**
   * 连接Redis
   */
  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
    }
  }

  /**
   * 获取客户端实例
   */
  getClient(): RedisClientType {
    return this.client;
  }

  /**
   * 执行命令
   */
  async executeCommand<T>(
    command: () => Promise<T>,
    commandName?: string
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await command();
      const duration = Date.now() - startTime;

      this.stats.commandsExecuted++;
      this.recordCommandTime(duration);

      return result as T;
    } catch (error) {
      this.stats.errors++;
      logger.error(
        `Redis command failed${commandName ? ` (${commandName})` : ''}:`,
        error
      );
      throw error;
    }
  }

  /**
   * 设置缓存
   */
  async set(
    key: string,
    value: string,
    options?: {
      ttl?: number;
      nx?: boolean;
      xx?: boolean;
    }
  ): Promise<void> {
    await this.executeCommand(async () => {
      if (options?.ttl) {
        await this.client.setEx(key, options.ttl, value);
      } else if (options?.nx) {
        await this.client.setNX(key, value);
      } else if (options?.xx) {
        await this.client.set(key, value, { XX: true });
      } else {
        await this.client.set(key, value);
      }
    }, 'SET');
  }

  /**
   * 获取缓存
   */
  async get(key: string): Promise<string | null> {
    return await this.executeCommand(async () => {
      return await this.client.get(key);
    }, 'GET');
  }

  /**
   * 删除缓存
   */
  async del(key: string): Promise<number> {
    return await this.executeCommand(async () => {
      return await this.client.del(key);
    }, 'DEL');
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.executeCommand(async () => {
      return await this.client.exists(key);
    }, 'EXISTS');

    return result === 1;
  }

  /**
   * 设置过期时间
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    const result = await this.executeCommand(async () => {
      return await this.client.expire(key, ttl);
    }, 'EXPIRE');

    return Boolean(result);
  }

  /**
   * 获取剩余过期时间
   */
  async ttl(key: string): Promise<number> {
    return await this.executeCommand(async () => {
      return await this.client.ttl(key);
    }, 'TTL');
  }

  /**
   * 批量设置
   */
  async mset(keyValuePairs: Record<string, string>): Promise<void> {
    await this.executeCommand(async () => {
      const args: string[] = [];
      for (const [key, value] of Object.entries(keyValuePairs)) {
        args.push(key, String(value));
      }
      await this.client.mSet(args);
    }, 'MSET');
  }

  /**
   * 批量获取
   */
  async mget(keys: string[]): Promise<(string | null)[]> {
    return await this.executeCommand(async () => {
      return await this.client.mGet(keys);
    }, 'MGET');
  }

  /**
   * 获取所有键
   */
  async keys(pattern: string): Promise<string[]> {
    return await this.executeCommand(async () => {
      return await this.client.keys(pattern);
    }, 'KEYS');
  }

  /**
   * 清空数据库
   */
  async flushdb(): Promise<void> {
    await this.executeCommand(async () => {
      await this.client.flushDb();
    }, 'FLUSHDB');
  }

  /**
   * 获取Redis信息
   */
  async info(section?: string): Promise<string> {
    return await this.executeCommand(async () => {
      return await this.client.info(section);
    }, 'INFO');
  }

  /**
   * 获取统计信息
   */
  getStats(): RedisStats {
    return { ...this.stats };
  }

  /**
   * 获取详细统计信息
   */
  getDetailedStats() {
    return {
      ...this.stats,
      isConnected: this.isConnected,
      commandTimes: {
        min: this.commandTimes.length > 0 ? Math.min(...this.commandTimes) : 0,
        max: this.commandTimes.length > 0 ? Math.max(...this.commandTimes) : 0,
        average: this.stats.averageResponseTime,
        p95: this.calculatePercentile(95),
        p99: this.calculatePercentile(99),
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

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      await this.client.ping();

      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
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
   * 获取慢命令
   */
  getSlowCommands(_threshold: number = 100): Array<{
    command: string;
    duration: number;
    timestamp: number;
  }> {
    // 这里应该从实际的命令日志中获取
    // 简化实现，实际项目中应该使用真正的命令日志
    return [];
  }

  /**
   * 优化连接池
   */
  async optimizePool(): Promise<void> {
    try {
      // 清理连接
      if (this.isConnected) {
        await this.client.quit();
        await this.client.connect();
      }

      logger.info('Redis connection pool optimized');
    } catch (error) {
      logger.error('Failed to optimize Redis connection pool:', error);
      throw error;
    }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      commandsExecuted: 0,
      errors: 0,
      averageResponseTime: 0,
      slowCommands: 0,
    };
    this.commandTimes = [];
  }
}

export const redisPool = new RedisConnectionPool();
