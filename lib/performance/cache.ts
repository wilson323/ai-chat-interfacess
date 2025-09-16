/**
 * 性能缓存工具
 * 提供内存缓存、本地存储缓存和Service Worker缓存策略
 */

import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
}

/**
 * 内存缓存类
 */
class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 1000;
  private hits = 0;
  private misses = 0;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, ttl: number = 300000): void {
    // 清理过期缓存
    this.cleanup();

    // 检查缓存大小
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
    });
  }

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // 更新命中次数
    entry.hits++;
    this.hits++;

    return entry.data;
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // 检查是否过期
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 清理过期缓存
   */
  private cleanup(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 淘汰最旧的缓存
   */
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: total > 0 ? this.hits / total : 0,
      missRate: total > 0 ? this.misses / total : 0,
      totalHits: this.hits,
      totalMisses: this.misses,
    };
  }
}

/**
 * 本地存储缓存类
 */
class LocalStorageCache {
  private prefix = 'cache_';
  private maxSize = 50 * 1024 * 1024; // 50MB

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, ttl: number = 300000): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        hits: 0,
      };

      const serialized = JSON.stringify(entry);
      const storageKey = this.prefix + key;

      // 检查存储空间
      if (this.getStorageSize() + serialized.length > this.maxSize) {
        this.cleanup();
      }

      localStorage.setItem(storageKey, serialized);
    } catch (error) {
      console.warn('Failed to set cache:', error);
    }
  }

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    try {
      const storageKey = this.prefix + key;
      const serialized = localStorage.getItem(storageKey);

      if (!serialized) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(serialized);

      // 检查是否过期
      if (Date.now() - entry.timestamp > entry.ttl) {
        localStorage.removeItem(storageKey);
        return null;
      }

      // 更新命中次数
      entry.hits++;
      localStorage.setItem(storageKey, JSON.stringify(entry));

      return entry.data;
    } catch (error) {
      console.warn('Failed to get cache:', error);
      return null;
    }
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    try {
      const storageKey = this.prefix + key;
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.warn('Failed to delete cache:', error);
      return false;
    }
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    try {
      const storageKey = this.prefix + key;
      const serialized = localStorage.getItem(storageKey);

      if (!serialized) return false;

      const entry: CacheEntry<any> = JSON.parse(serialized);

      // 检查是否过期
      if (Date.now() - entry.timestamp > entry.ttl) {
        localStorage.removeItem(storageKey);
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();

      for (const key of keys) {
        if (key.startsWith(this.prefix)) {
          const serialized = localStorage.getItem(key);
          if (serialized) {
            try {
              const entry: CacheEntry<any> = JSON.parse(serialized);
              if (now - entry.timestamp > entry.ttl) {
                localStorage.removeItem(key);
              }
            } catch (error) {
              // 删除损坏的缓存项
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  }

  /**
   * 清空缓存
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);

      for (const key of keys) {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * 获取存储大小
   */
  private getStorageSize(): number {
    try {
      let size = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          size += localStorage[key].length;
        }
      }
      return size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * 获取缓存统计
   */
  getStats(): { size: number; maxSize: number; keys: number } {
    try {
      const keys = Object.keys(localStorage).filter(key =>
        key.startsWith(this.prefix)
      );
      return {
        size: this.getStorageSize(),
        maxSize: this.maxSize,
        keys: keys.length,
      };
    } catch (error) {
      return { size: 0, maxSize: this.maxSize, keys: 0 };
    }
  }
}

/**
 * 缓存管理器
 */
class CacheManager {
  private memoryCache: MemoryCache;
  private localStorageCache: LocalStorageCache;

  constructor() {
    this.memoryCache = new MemoryCache(1000);
    this.localStorageCache = new LocalStorageCache();
  }

  /**
   * 设置缓存
   */
  set<T>(
    key: string,
    data: T,
    ttl: number = 300000,
    useLocalStorage: boolean = false
  ): void {
    this.memoryCache.set(key, data, ttl);

    if (useLocalStorage) {
      this.localStorageCache.set(key, data, ttl);
    }
  }

  /**
   * 获取缓存
   */
  get<T>(key: string, useLocalStorage: boolean = false): T | null {
    // 先从内存缓存获取
    let data = this.memoryCache.get<T>(key);

    if (data) {
      return data;
    }

    // 如果内存缓存没有，且允许使用本地存储
    if (useLocalStorage) {
      data = this.localStorageCache.get<T>(key);

      if (data) {
        // 将数据重新放入内存缓存
        this.memoryCache.set(key, data, 300000);
        return data;
      }
    }

    return null;
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    const memoryResult = this.memoryCache.delete(key);
    const localStorageResult = this.localStorageCache.delete(key);

    return memoryResult || localStorageResult;
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string, useLocalStorage: boolean = false): boolean {
    if (this.memoryCache.has(key)) {
      return true;
    }

    if (useLocalStorage && this.localStorageCache.has(key)) {
      return true;
    }

    return false;
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.memoryCache.clear();
    this.localStorageCache.clear();
  }

  /**
   * 获取缓存统计
   */
  getStats(): {
    memory: CacheStats;
    localStorage: { size: number; maxSize: number; keys: number };
  } {
    return {
      memory: this.memoryCache.getStats(),
      localStorage: this.localStorageCache.getStats(),
    };
  }
}

/**
 * 创建缓存管理器实例
 */
export const cacheManager = new CacheManager();

/**
 * 缓存Hook
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    useLocalStorage?: boolean;
    enabled?: boolean;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { ttl = 300000, useLocalStorage = false, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    // 先从缓存获取
    const cachedData = cacheManager.get<T>(key, useLocalStorage);

    if (cachedData) {
      setData(cachedData);
      return;
    }

    // 缓存中没有，则获取数据
    setIsLoading(true);
    setError(null);

    fetcher()
      .then(result => {
        setData(result);
        // 将数据存入缓存
        cacheManager.set(key, result, ttl, useLocalStorage);
      })
      .catch(err => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [key, enabled, ttl, useLocalStorage, fetcher]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);

    fetcher()
      .then(result => {
        setData(result);
        cacheManager.set(key, result, ttl, useLocalStorage);
      })
      .catch(err => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [key, ttl, useLocalStorage, fetcher]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * 缓存工具函数
 */
export const cacheUtils = {
  /**
   * 生成缓存键
   */
  generateKey: (prefix: string, ...parts: (string | number)[]): string => {
    return `${prefix}_${parts.join('_')}`;
  },

  /**
   * 清理过期缓存
   */
  cleanup: () => {
    cacheManager.clear();
  },

  /**
   * 获取缓存统计
   */
  getStats: () => {
    return cacheManager.getStats();
  },

  /**
   * 预加载数据
   */
  preload: async <T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 300000,
    useLocalStorage: boolean = false
  ): Promise<void> => {
    try {
      const data = await fetcher();
      cacheManager.set(key, data, ttl, useLocalStorage);
    } catch (error) {
      console.warn('Failed to preload data:', error);
    }
  },
};

/**
 * 默认导出
 */
export default cacheManager;
