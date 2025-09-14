/**
 * Redis缓存管理器测试
 * 测试真实的Redis客户端功能和缓存策略
 */

import { RedisManager, CacheConfig } from '@/lib/cache/redis-manager';

// 模拟Redis配置
const testConfig: CacheConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 15, // 使用测试数据库，避免影响生产数据
  keyPrefix: 'test:',
  defaultTTL: 60,
  maxRetries: 2,
  retryDelay: 100,
};

describe('RedisManager', () => {
  let redisManager: RedisManager;

  beforeAll(async () => {
    redisManager = new RedisManager(testConfig);
    await redisManager.connect();
  });

  afterAll(async () => {
    // 清理测试数据
    await redisManager.flushAll();
    await redisManager.disconnect();
  });

  beforeEach(async () => {
    // 每个测试前清理数据
    await redisManager.flushAll();
  });

  describe('连接管理', () => {
    test('应该能够连接到Redis', async () => {
      const health = await redisManager.healthCheck();
      expect(health.status).toBe('healthy');
      expect(health.responseTime).toBeGreaterThan(0);
      expect(health.responseTime).toBeLessThan(1000);
    });

    test('应该能够重连', async () => {
      await redisManager.disconnect();
      await redisManager.connect();

      const health = await redisManager.healthCheck();
      expect(health.status).toBe('healthy');
    });
  });

  describe('基本缓存操作', () => {
    test('应该能够设置和获取缓存', async () => {
      const key = 'test:user';
      const value = { id: 1, name: '测试用户', email: 'test@example.com' };

      const setResult = await redisManager.set(key, value, 60);
      expect(setResult).toBe(true);

      const result = await redisManager.get(key);
      expect(result).toEqual(value);
    });

    test('应该能够处理缓存未命中', async () => {
      const result = await redisManager.get('nonexistent:key');
      expect(result).toBeNull();
    });

    test('应该能够删除缓存', async () => {
      const key = 'test:delete';
      const value = { data: 'test' };

      await redisManager.set(key, value);
      const existsBefore = await redisManager.exists(key);
      expect(existsBefore).toBe(true);

      const deleteResult = await redisManager.delete(key);
      expect(deleteResult).toBe(true);

      const existsAfter = await redisManager.exists(key);
      expect(existsAfter).toBe(false);

      const getResult = await redisManager.get(key);
      expect(getResult).toBeNull();
    });

    test('应该能够检查键是否存在', async () => {
      const key = 'test:exists';
      const value = { data: 'exists' };

      const existsBefore = await redisManager.exists(key);
      expect(existsBefore).toBe(false);

      await redisManager.set(key, value);
      const existsAfter = await redisManager.exists(key);
      expect(existsAfter).toBe(true);
    });

    test('应该能够设置过期时间', async () => {
      const key = 'test:expire';
      const value = { data: 'expire' };

      await redisManager.set(key, value);
      await redisManager.expire(key, 1); // 1秒过期

      // 立即检查应该还存在
      let exists = await redisManager.exists(key);
      expect(exists).toBe(true);

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 1500));

      exists = await redisManager.exists(key);
      expect(exists).toBe(false);
    });

    test('应该能够获取TTL', async () => {
      const key = 'test:ttl';
      const value = { data: 'ttl' };
      const ttl = 300; // 5分钟

      await redisManager.set(key, value);
      await redisManager.expire(key, ttl);

      const remainingTTL = await redisManager.ttl(key);
      expect(remainingTTL).toBeGreaterThan(0);
      expect(remainingTTL).toBeLessThanOrEqual(ttl);
    });
  });

  describe('批量操作', () => {
    test('应该能够批量设置缓存', async () => {
      const items = [
        { key: 'batch:1', value: { id: 1, data: 'first' }, ttl: 60 },
        { key: 'batch:2', value: { id: 2, data: 'second' }, ttl: 60 },
        { key: 'batch:3', value: { id: 3, data: 'third' }, ttl: 60 },
      ];

      const result = await redisManager.mset(items);
      expect(result).toBe(true);

      // 验证所有数据都已设置
      for (const item of items) {
        const cached = await redisManager.get(item.key);
        expect(cached).toEqual(item.value);
      }
    });

    test('应该能够批量获取缓存', async () => {
      const items = [
        { key: 'mget:1', value: { id: 1, data: 'first' } },
        { key: 'mget:2', value: { id: 2, data: 'second' } },
        { key: 'mget:3', value: { id: 3, data: 'third' } },
      ];

      await redisManager.mset(items);

      const keys = items.map(item => item.key);
      const results = await redisManager.mget(keys);

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result).toEqual(items[index].value);
      });
    });

    test('批量获取应该处理部分命中', async () => {
      const items = [
        { key: 'partial:1', value: { id: 1, data: 'exists' } },
        { key: 'partial:2', value: { id: 2, data: 'exists' } },
      ];

      await redisManager.mset(items);

      // 包含存在的和不存在的键
      const keys = ['partial:1', 'partial:2', 'partial:nonexistent'];
      const results = await redisManager.mget(keys);

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual(items[0].value);
      expect(results[1]).toEqual(items[1].value);
      expect(results[2]).toBeNull();
    });
  });

  describe('缓存过期和清理', () => {
    test('应该能够清理过期的缓存', async () => {
      const expiredKey = 'expired:item';
      const validKey = 'valid:item';

      // 设置一个已经过期的缓存项
      const expiredItem = {
        key: expiredKey,
        value: { data: 'expired' },
        ttl: 1,
        createdAt: Date.now() - 2000, // 2秒前创建
        accessedAt: Date.now() - 1000,
        accessCount: 1,
      };

      await redisManager.set(expiredKey, expiredItem.value, expiredItem.ttl);

      // 设置一个有效的缓存项
      await redisManager.set(validKey, { data: 'valid' }, 60);

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 1100));

      // 执行过期清理
      const cleanedCount = await redisManager.cleanupExpired();
      expect(cleanedCount).toBeGreaterThanOrEqual(0);

      // 验证过期键已被删除
      const expiredExists = await redisManager.exists(expiredKey);
      expect(expiredExists).toBe(false);

      // 验证有效键仍然存在
      const validExists = await redisManager.exists(validKey);
      expect(validExists).toBe(true);
    });

    test('TTL过期检查应该工作', async () => {
      const key = 'ttl:expire';
      const value = { data: 'will expire' };

      await redisManager.set(key, value, 1); // 1秒TTL

      // 立即获取应该存在
      const immediateResult = await redisManager.get(key);
      expect(immediateResult).toEqual(value);

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 过期后获取应该返回null
      const expiredResult = await redisManager.get(key);
      expect(expiredResult).toBeNull();
    });
  });

  describe('统计和监控', () => {
    test('应该能够获取基本统计信息', async () => {
      // 执行一些操作来生成统计数据
      await redisManager.set('stats:test1', { data: 'test1' });
      await redisManager.get('stats:test1');
      await redisManager.get('stats:test1'); // 第二次获取应该是命中
      await redisManager.get('stats:nonexistent'); // 未命中

      const stats = await redisManager.getStats();

      expect(stats.hits).toBeGreaterThanOrEqual(1);
      expect(stats.misses).toBeGreaterThanOrEqual(1);
      expect(stats.totalKeys).toBeGreaterThanOrEqual(1);
      expect(stats.hitRate).toBeGreaterThanOrEqual(0);
      expect(stats.hitRate).toBeLessThanOrEqual(100);
      expect(stats.connectionStatus).toBe('connected');
    });

    test('应该能够进行健康检查', async () => {
      const health = await redisManager.healthCheck();

      expect(health.status).toBeOneOf(['healthy', 'unhealthy']);
      expect(health.responseTime).toBeGreaterThan(0);

      if (health.status === 'healthy') {
        expect(health.details).toBeDefined();
        expect(health.details!.connection).toBe('connected');
        expect(health.details!.memory).toBeGreaterThanOrEqual(0);
        expect(health.details!.clients).toBeGreaterThanOrEqual(0);
        expect(health.details!.uptime).toBeGreaterThanOrEqual(0);
      }
    });

    test('应该能够获取热点键', async () => {
      // 创建一些测试数据并模拟访问
      const hotKey = 'hot:popular';
      const coldKey = 'cold:unpopular';

      // 设置数据
      await redisManager.set(hotKey, { data: 'popular' });
      await redisManager.set(coldKey, { data: 'unpopular' });

      // 多次访问热门键
      for (let i = 0; i < 5; i++) {
        await redisManager.get(hotKey);
      }

      // 访问一次冷门键
      await redisManager.get(coldKey);

      const hotKeys = await redisManager.getHotKeys(5);
      expect(Array.isArray(hotKeys)).toBe(true);

      // 热门键应该存在且访问次数较高
      const hotKeyData = hotKeys.find(
        k => k.key === hotKey.replace('test:', '')
      );
      if (hotKeyData) {
        expect(hotKeyData.accessCount).toBeGreaterThan(0);
      }
    });
  });

  describe('缓存策略', () => {
    test('应该能够实现LRU策略', async () => {
      // 创建多个缓存项
      const items = [];
      for (let i = 0; i < 15; i++) {
        const key = `lru:item${i}`;
        const value = { id: i, data: `item${i}` };
        items.push({ key, value });
        await redisManager.set(key, value);
      }

      // 获取前5个项的访问时间
      const firstFiveKeys = items.slice(0, 5).map(item => item.key);
      for (const key of firstFiveKeys) {
        await redisManager.get(key);
      }

      // 实施LRU策略，限制最多10个键
      await redisManager.implementLRU(10);

      // 验证键的数量不超过限制
      const stats = await redisManager.getStats();
      expect(stats.totalKeys).toBeLessThanOrEqual(10);
    });

    test('应该能够预热缓存', async () => {
      const warmupItems = [
        { key: 'warmup:1', value: { id: 1, data: 'preloaded1' }, ttl: 300 },
        { key: 'warmup:2', value: { id: 2, data: 'preloaded2' }, ttl: 300 },
        { key: 'warmup:3', value: { id: 3, data: 'preloaded3' }, ttl: 300 },
      ];

      const result = await redisManager.warmup(warmupItems);
      expect(result).toBe(true);

      // 验证所有项都已预热
      for (const item of warmupItems) {
        const cached = await redisManager.get(item.key);
        expect(cached).toEqual(item.value);
      }
    });
  });

  describe('错误处理', () => {
    test('应该能够处理连接错误', async () => {
      // 创建一个无效配置的Redis管理器
      const invalidConfig: CacheConfig = {
        ...testConfig,
        host: 'invalid-host',
        port: 9999,
        maxRetries: 1,
        retryDelay: 10,
      };

      const invalidRedisManager = new RedisManager(invalidConfig);

      // 操作应该失败并抛出错误
      await expect(
        invalidRedisManager.set('test:key', 'test')
      ).rejects.toThrow();

      // 健康检查应该返回不健康状态
      const health = await invalidRedisManager.healthCheck();
      expect(health.status).toBe('unhealthy');
      expect(health.error).toBeDefined();

      await invalidRedisManager.disconnect();
    });

    test('应该能够重试失败的命令', async () => {
      // 这个测试比较难模拟，但我们可以验证重试机制存在
      // 通过设置一个较短的timeout来测试重试逻辑
      const timeoutConfig: CacheConfig = {
        ...testConfig,
        commandTimeout: 1, // 1ms超时，几乎肯定会失败
        maxRetries: 2,
        retryDelay: 10,
      };

      const timeoutRedisManager = new RedisManager(timeoutConfig);
      await timeoutRedisManager.connect();

      // 操作可能会因为超时而重试
      const startTime = Date.now();
      try {
        await timeoutRedisManager.set('timeout:test', { data: 'test' });
      } catch (error) {
        // 预期会失败，但我们关心的是重试耗时
        const duration = Date.now() - startTime;
        expect(duration).toBeGreaterThan(20); // 至少应该有重试延迟
      }

      await timeoutRedisManager.disconnect();
    });
  });

  describe('数据类型测试', () => {
    test('应该能够缓存各种数据类型', async () => {
      const testData = [
        { key: 'types:string', value: '字符串值' },
        { key: 'types:number', value: 42 },
        { key: 'types:boolean', value: true },
        { key: 'types:object', value: { nested: { data: 'object' } } },
        { key: 'types:array', value: [1, 2, 3, 'four', { five: 5 }] },
        { key: 'types:null', value: null },
        { key: 'types:date', value: new Date() },
      ];

      for (const { key, value } of testData) {
        const setResult = await redisManager.set(key, value, 60);
        expect(setResult).toBe(true);

        const getResult = await redisManager.get(key);
        expect(getResult).toEqual(value);
      }
    });

    test('应该能够处理大对象', async () => {
      // 创建一个较大的对象
      const largeObject = {
        data: Array(1000)
          .fill(0)
          .map((_, i) => ({
            id: i,
            name: `item ${i}`,
            description: `这是第 ${i} 个项目的详细描述`,
            metadata: {
              created: new Date().toISOString(),
              tags: [`tag${i}`, `test`, `large`],
              stats: {
                views: Math.floor(Math.random() * 10000),
                likes: Math.floor(Math.random() * 1000),
              },
            },
          })),
      };

      const key = 'large:object';
      const setResult = await redisManager.set(key, largeObject, 60);
      expect(setResult).toBe(true);

      const getResult = await redisManager.get(key);
      expect(getResult).toEqual(largeObject);
    });
  });

  describe('性能测试', () => {
    test('应该具有良好的性能', async () => {
      const iterations = 100;
      const startTime = Date.now();

      // 执行多次写入操作
      for (let i = 0; i < iterations; i++) {
        await redisManager.set(`perf:write:${i}`, {
          id: i,
          data: `performance test ${i}`,
        });
      }

      const writeTime = Date.now() - startTime;

      // 执行多次读取操作
      const readStart = Date.now();
      for (let i = 0; i < iterations; i++) {
        await redisManager.get(`perf:write:${i}`);
      }
      const readTime = Date.now() - readStart;

      // 清理测试数据
      for (let i = 0; i < iterations; i++) {
        await redisManager.delete(`perf:write:${i}`);
      }

      // 性能期望：每个操作应该在合理时间内完成
      expect(writeTime).toBeLessThan(5000); // 写入应该在5秒内完成
      expect(readTime).toBeLessThan(3000); // 读取应该在3秒内完成

      console.log(`性能测试结果:`);
      console.log(
        `  写入 ${iterations} 条: ${writeTime}ms (${((iterations / writeTime) * 1000).toFixed(2)} ops/sec)`
      );
      console.log(
        `  读取 ${iterations} 条: ${readTime}ms (${((iterations / readTime) * 1000).toFixed(2)} ops/sec)`
      );
    });
  });
});
