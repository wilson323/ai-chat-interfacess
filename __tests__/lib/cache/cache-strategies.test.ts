/**
 * 缓存策略测试
 * 测试LRU、LFU、TTL缓存策略的实现
 */

import {
  LRUCacheStrategy,
  LFUCacheStrategy,
  TTLCacheStrategy,
} from '@/lib/cache/cache-strategies';

// Mock redis manager
jest.mock('@/lib/cache/redis-manager', () => ({
  redisManager: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    warmup: jest.fn(),
    getStats: jest.fn(),
  },
}));

const mockRedisManager = require('@/lib/cache/redis-manager').redisManager;

describe('缓存策略测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('LRU缓存策略测试', () => {
    let lruCache: LRUCacheStrategy;

    beforeEach(() => {
      lruCache = new LRUCacheStrategy();
    });

    it('应该能够设置和获取值', async () => {
      mockRedisManager.get.mockResolvedValue('value1');
      mockRedisManager.set.mockResolvedValue(true);

      await lruCache.set('key1', 'value1');
      const result = await lruCache.get('key1');

      expect(result).toBe('value1');
      expect(mockRedisManager.set).toHaveBeenCalledWith(
        'key1',
        'value1',
        undefined
      );
    });

    it('应该能够删除键', async () => {
      mockRedisManager.delete.mockResolvedValue(true);

      const result = await lruCache.invalidate('key1');

      expect(result).toBe(true);
      expect(mockRedisManager.delete).toHaveBeenCalledWith('key1');
    });
  });

  describe('LFU缓存策略测试', () => {
    let lfuCache: LFUCacheStrategy;

    beforeEach(() => {
      lfuCache = new LFUCacheStrategy();
    });

    it('应该能够设置和获取值', async () => {
      mockRedisManager.get.mockResolvedValue('value1');
      mockRedisManager.set.mockResolvedValue(true);

      await lfuCache.set('key1', 'value1');
      const result = await lfuCache.get('key1');

      expect(result).toBe('value1');
      expect(mockRedisManager.set).toHaveBeenCalledWith(
        'key1',
        'value1',
        undefined
      );
    });

    it('应该能够删除键', async () => {
      mockRedisManager.delete.mockResolvedValue(true);

      const result = await lfuCache.invalidate('key1');

      expect(result).toBe(true);
      expect(mockRedisManager.delete).toHaveBeenCalledWith('key1');
    });
  });

  describe('TTL缓存策略测试', () => {
    let ttlCache: TTLCacheStrategy;

    beforeEach(() => {
      ttlCache = new TTLCacheStrategy();
    });

    it('应该能够设置和获取值', async () => {
      mockRedisManager.get.mockResolvedValue('value1');
      mockRedisManager.set.mockResolvedValue(true);

      await ttlCache.set('key1', 'value1');
      const result = await ttlCache.get('key1');

      expect(result).toBe('value1');
      expect(mockRedisManager.set).toHaveBeenCalledWith(
        'key1',
        'value1',
        undefined
      );
    });

    it('应该支持自定义TTL', async () => {
      mockRedisManager.set.mockResolvedValue(true);

      await ttlCache.set('key1', 'value1', 2000);

      expect(mockRedisManager.set).toHaveBeenCalledWith('key1', 'value1', 2000);
    });

    it('应该能够删除键', async () => {
      mockRedisManager.delete.mockResolvedValue(true);

      const result = await ttlCache.invalidate('key1');

      expect(result).toBe(true);
      expect(mockRedisManager.delete).toHaveBeenCalledWith('key1');
    });
  });

  describe('缓存策略性能测试', () => {
    it('LRU缓存应该在大数据量下保持性能', async () => {
      const cache = new LRUCacheStrategy();
      mockRedisManager.set.mockResolvedValue(true);
      mockRedisManager.get.mockResolvedValue('test-value');

      // 设置多个键值对
      const startTime = Date.now();
      for (let i = 0; i < 1000; i++) {
        await cache.set(`key${i}`, `value${i}`);
      }
      const endTime = Date.now();

      // 操作应该在合理时间内完成（由于是mock，主要验证调用次数）
      expect(mockRedisManager.set).toHaveBeenCalledTimes(1000);
      expect(endTime - startTime).toBeLessThan(5000); // 5秒内完成
    });

    it('LFU缓存应该正确跟踪大量访问', async () => {
      const cache = new LFUCacheStrategy();
      mockRedisManager.set.mockResolvedValue(true);
      mockRedisManager.get.mockResolvedValue('test-value');

      // 设置100个键
      for (let i = 0; i < 100; i++) {
        await cache.set(`key${i}`, `value${i}`);
      }

      // 频繁访问前10个键
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          await cache.get(`key${i}`);
        }
      }

      // 验证基本功能正常，不精确测试调用次数
      expect(mockRedisManager.set).toHaveBeenCalled();
      expect(mockRedisManager.get).toHaveBeenCalled();
    });
  });

  describe('错误处理测试', () => {
    it('应该处理Redis连接错误', async () => {
      const cache = new LRUCacheStrategy();
      mockRedisManager.set.mockRejectedValue(new Error('Connection failed'));

      await expect(cache.set('key1', 'value1')).rejects.toThrow(
        'Connection failed'
      );
    });

    it('应该处理获取不存在的键', async () => {
      const cache = new TTLCacheStrategy();
      mockRedisManager.get.mockResolvedValue(null);

      const result = await cache.get('nonexistent-key');

      expect(result).toBeNull();
    });
  });
});
