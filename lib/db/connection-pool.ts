/**
 * 数据库连接池优化
 * 提供高性能的数据库连接池管理和监控
 */

import { Sequelize } from 'sequelize';
import { appConfig } from '@/lib/config';

interface ConnectionStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
  totalQueries: number;
  averageQueryTime: number;
  slowQueries: number;
}

class DatabaseConnectionPool {
  private sequelize: Sequelize;
  private stats: ConnectionStats = {
    totalConnections: 0,
    activeConnections: 0,
    idleConnections: 0,
    waitingRequests: 0,
    totalQueries: 0,
    averageQueryTime: 0,
    slowQueries: 0,
  };

  private queryTimes: number[] = [];
  private maxQueryTimes = 1000;

  constructor() {
    this.sequelize = new Sequelize(
      appConfig.database.database,
      appConfig.database.username,
      appConfig.database.password,
      {
        host: appConfig.database.host,
        port: appConfig.database.port,
        dialect: 'postgres',
        logging: false,

        // 连接池配置
        pool: {
          max: appConfig.database.pool.max,
          min: appConfig.database.pool.min,
          acquire: appConfig.database.pool.acquire,
          idle: appConfig.database.pool.idle,
          evict: 1000,
          handleDisconnects: true,
        },

        // 重试机制
        retry: {
          max: 3,
          timeout: 60000,
          match: [
            /ETIMEDOUT/,
            /EHOSTUNREACH/,
            /ECONNRESET/,
            /ECONNREFUSED/,
            /SequelizeConnectionError/,
            /SequelizeConnectionRefusedError/,
            /SequelizeHostNotFoundError/,
            /SequelizeHostNotReachableError/,
            /SequelizeInvalidConnectionError/,
            /SequelizeConnectionTimedOutError/,
          ],
        },

        // 性能监控
        benchmark: true,

        // 查询优化
        define: {
          freezeTableName: true,
          underscored: true,
          timestamps: true,
          paranoid: false,
        },

        // 查询配置
        query: {
          raw: false,
          nest: true,
          plain: false,
        },
      }
    );

    this.setupEventListeners();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 连接事件
    this.sequelize.connectionManager.on('connect', connection => {
      this.stats.totalConnections++;
      this.stats.activeConnections++;
      console.log('Database connection established');
    });

    this.sequelize.connectionManager.on('disconnect', connection => {
      this.stats.activeConnections--;
      console.log('Database connection closed');
    });

    this.sequelize.connectionManager.on('acquire', connection => {
      this.stats.activeConnections++;
      this.stats.idleConnections--;
    });

    this.sequelize.connectionManager.on('release', connection => {
      this.stats.activeConnections--;
      this.stats.idleConnections++;
    });

    // 查询事件
    this.sequelize.connectionManager.on('query', query => {
      this.stats.totalQueries++;

      if (query.benchmark) {
        const duration = query.benchmark;
        this.recordQueryTime(duration);

        // 记录慢查询
        if (duration > 1000) {
          this.stats.slowQueries++;
          console.warn('Slow query detected:', {
            sql: query.sql,
            duration: `${duration}ms`,
          });
        }
      }
    });
  }

  /**
   * 记录查询时间
   */
  private recordQueryTime(duration: number): void {
    this.queryTimes.push(duration);

    // 保持查询时间数组在限制内
    if (this.queryTimes.length > this.maxQueryTimes) {
      this.queryTimes = this.queryTimes.slice(-this.maxQueryTimes);
    }

    // 计算平均查询时间
    this.stats.averageQueryTime =
      this.queryTimes.reduce((sum, time) => sum + time, 0) /
      this.queryTimes.length;
  }

  /**
   * 获取连接池实例
   */
  getInstance(): Sequelize {
    return this.sequelize;
  }

  /**
   * 执行查询
   */
  async query<T = any>(
    sql: string,
    options?: {
      replacements?: any;
      type?: any;
      benchmark?: boolean;
    }
  ): Promise<T[]> {
    const startTime = Date.now();

    try {
      const result = await this.sequelize.query(sql, {
        ...options,
        benchmark: true,
      });

      const duration = Date.now() - startTime;
      this.recordQueryTime(duration);

      return result as T[];
    } catch (error) {
      console.error('Database query failed:', error);
      throw error;
    }
  }

  /**
   * 执行事务
   */
  async transaction<T>(callback: (transaction: any) => Promise<T>): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await this.sequelize.transaction(callback);

      const duration = Date.now() - startTime;
      this.recordQueryTime(duration);

      return result;
    } catch (error) {
      console.error('Database transaction failed:', error);
      throw error;
    }
  }

  /**
   * 获取连接池统计信息
   */
  getStats(): ConnectionStats {
    return { ...this.stats };
  }

  /**
   * 获取详细统计信息
   */
  getDetailedStats() {
    const pool = this.sequelize.connectionManager.pool;

    return {
      ...this.stats,
      pool: {
        size: pool.size,
        used: pool.used,
        waiting: pool.waiting,
        available: pool.available,
      },
      queryTimes: {
        min: Math.min(...this.queryTimes),
        max: Math.max(...this.queryTimes),
        average: this.stats.averageQueryTime,
        p95: this.calculatePercentile(95),
        p99: this.calculatePercentile(99),
      },
    };
  }

  /**
   * 计算百分位数
   */
  private calculatePercentile(percentile: number): number {
    if (this.queryTimes.length === 0) return 0;

    const sorted = [...this.queryTimes].sort((a, b) => a - b);
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
      await this.sequelize.authenticate();

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
   * 获取慢查询
   */
  getSlowQueries(threshold: number = 1000): Array<{
    sql: string;
    duration: number;
    timestamp: number;
  }> {
    // 这里应该从实际的查询日志中获取
    // 简化实现，实际项目中应该使用真正的查询日志
    return [];
  }

  /**
   * 优化连接池
   */
  async optimizePool(): Promise<void> {
    try {
      // 清理空闲连接
      await this.sequelize.connectionManager.pool.destroyAllNow();

      // 重新初始化连接池
      await this.sequelize.connectionManager.initPools();

      console.log('Connection pool optimized');
    } catch (error) {
      console.error('Failed to optimize connection pool:', error);
      throw error;
    }
  }

  /**
   * 关闭连接池
   */
  async close(): Promise<void> {
    try {
      await this.sequelize.close();
      console.log('Database connection pool closed');
    } catch (error) {
      console.error('Failed to close connection pool:', error);
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
      idleConnections: 0,
      waitingRequests: 0,
      totalQueries: 0,
      averageQueryTime: 0,
      slowQueries: 0,
    };
    this.queryTimes = [];
  }
}

export const dbPool = new DatabaseConnectionPool();
