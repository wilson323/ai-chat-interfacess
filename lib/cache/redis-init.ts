/**
 * Redis缓存初始化模块
 * 在应用启动时自动连接Redis并进行健康检查
 */

import { logger } from '@/lib/utils/logger';
import { redisManager } from './redis-manager';
import { appConfig } from '@/lib/config';

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * 初始化Redis连接
 */
export async function initializeRedis(): Promise<void> {
  if (isInitialized) {
    return;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      logger.debug('🚀 正在初始化Redis缓存连接...');

      // 检查是否配置了Redis
      if (!appConfig.redis.host) {
        logger.warn('⚠️  Redis主机未配置，跳过Redis初始化');
        isInitialized = true;
        return;
      }

      // 连接到Redis
      await redisManager.connect();

      // 执行健康检查
      const health = await redisManager.healthCheck();

      if (health.status === 'healthy') {
        logger.debug('✅ Redis缓存连接成功');
        logger.debug(
          `📍 服务器: ${appConfig.redis.host}:${appConfig.redis.port}`
        );
        logger.debug(`⏱️  响应时间: ${health.responseTime}ms`);

        if (health.details) {
          logger.debug(`💾 内存使用: ${health.details.memory.toFixed(2)}MB`);
          logger.debug(`🔌 连接客户端: ${health.details.clients}`);
          logger.debug(
            `⏱️  运行时间: ${Math.floor(health.details.uptime / 3600)}小时`
          );
        }

        // 启动定期健康检查
        startHealthCheck();

        isInitialized = true;
      } else {
        throw new Error(`Redis连接失败: ${health.error}`);
      }
    } catch (error) {
      logger.error('❌ Redis缓存初始化失败:', error);
      logger.warn('⚠️  应用将在没有Redis缓存的情况下运行，性能可能受到影响');

      // 标记为已初始化但连接失败，避免重复尝试
      isInitialized = true;
    }
  })();

  return initializationPromise;
}

/**
 * 启动定期健康检查
 */
function startHealthCheck(): void {
  // 每5分钟检查一次健康状态
  setInterval(
    async () => {
      try {
        const health = await redisManager.healthCheck();

        if (health.status !== 'healthy') {
          logger.warn('⚠️  Redis健康检查失败:', health.error);
          logger.debug('🔄 尝试重新连接...');

          // 尝试重新连接
          await redisManager.disconnect();
          await new Promise(resolve => setTimeout(resolve, 1000));
          await redisManager.connect();
        }
      } catch (error) {
        logger.error('Redis健康检查异常:', error);
      }
    },
    5 * 60 * 1000
  ); // 5分钟
}

/**
 * 获取Redis初始化状态
 */
export function getRedisStatus(): {
  initialized: boolean;
  connecting: boolean;
} {
  return {
    initialized: isInitialized,
    connecting: initializationPromise !== null,
  };
}

/**
 * 安全地执行缓存操作
 * 如果Redis不可用，会静默失败而不影响主流程
 */
export async function safeCacheOperation<T>(
  operation: () => Promise<T>,
  fallbackValue?: T
): Promise<T | null> {
  try {
    if (!isInitialized) {
      await initializeRedis();
    }

    return await operation();
  } catch (error) {
    logger.debug(`缓存操作失败，使用降级方案: ${error}`);
    return fallbackValue ?? null;
  }
}

/**
 * 缓存装饰器
 * 用于自动缓存函数结果
 */
export function cache<T extends (...args: Array<unknown>) => unknown>(
  keyPrefix: string,
  ttl: number = 3600
) {
  return function (
    _target: unknown,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    // 忽略未使用的 target 参数
    const method = descriptor.value!;

    descriptor.value = async function (this: any, ...args: Array<unknown>) {
      // 生成缓存键
      const key = `${keyPrefix}:${propertyName}:${JSON.stringify(args)}`;

      try {
        // 尝试从缓存获取
        const cached = await safeCacheOperation(() => redisManager.get(key));
        if (cached !== null) {
          return cached;
        }

        // 缓存未命中，执行原方法
        const result = await method.apply(this, args);

        // 缓存结果
        await safeCacheOperation(() => redisManager.set(key, result, ttl));

        return result;
      } catch (error) {
        logger.warn(`缓存装饰器执行失败: ${key}`, error);
        // 降级到直接执行方法
        return await method.apply(this, args);
      }
    } as T;

    return descriptor;
  };
}

/**
 * 自动初始化（在导入时执行）
 */
if (typeof window === 'undefined') {
  // 只在服务器端初始化
  initializeRedis().catch(error => {
    logger.error('Redis自动初始化失败:', error);
  });
}
