/**
 * 性能优化工具
 */

/**
 * 防抖函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 内存使用监控
 */
export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} {
  if (typeof window === 'undefined' || !(performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory) {
    return { used: 0, total: 0, percentage: 0 };
  }

  const memory = (performance as Performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
  const used = memory.usedJSHeapSize;
  const total = memory.totalJSHeapSize;
  const percentage = total > 0 ? (used / total) * 100 : 0;

  return { used, total, percentage };
}

/**
 * 性能测量装饰器
 */
export function measurePerformance<T extends (...args: unknown[]) => unknown>(
  target: T,
  context?: string
): T {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = target(...args);
    const end = performance.now();

    console.log(`Performance ${context || 'measurement'}: ${(end - start).toFixed(2)}ms`);

    return result;
  }) as T;
}

/**
 * 异步性能测量
 */
export async function measureAsyncPerformance<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  const start = performance.now();
  const result = await operation();
  const end = performance.now();

  console.log(`Async Performance ${context || 'measurement'}: ${(end - start).toFixed(2)}ms`);

  return result;
}

/**
 * 批量处理
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10,
  delay: number = 0
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(processor)
    );
    results.push(...batchResults);

    if (delay > 0 && i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return results;
}

/**
 * 缓存装饰器
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);

    return result;
  }) as T;
}

/**
 * 懒加载
 */
export function createLazyLoader<T>(
  loader: () => Promise<T>,
  timeout: number = 5000
): () => Promise<T> {
  let promise: Promise<T> | null = null;
  let timeoutId: NodeJS.Timeout | null = null;

  return () => {
    if (promise) {
      return promise;
    }

    promise = new Promise(async (resolve, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Lazy loader timeout'));
      }, timeout);

      try {
        const result = await loader();
        if (timeoutId) clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);
        reject(error);
      }
    });

    return promise;
  };
}

/**
 * 资源预加载
 */
export function preloadResource(url: string, type: 'image' | 'script' | 'style' = 'image'): Promise<void> {
  return new Promise((resolve, reject) => {
    if (type === 'image') {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    } else if (type === 'script') {
      const script = document.createElement('script');
      script.onload = () => resolve();
      script.onerror = reject;
      script.src = url;
      document.head.appendChild(script);
    } else if (type === 'style') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.onload = () => resolve();
      link.onerror = reject;
      link.href = url;
      document.head.appendChild(link);
    }
  });
}

/**
 * 虚拟滚动计算
 */
export function calculateVirtualScroll(
  scrollTop: number,
  itemHeight: number,
  containerHeight: number,
  totalItems: number
): {
  startIndex: number;
  endIndex: number;
  offsetY: number;
} {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    totalItems - 1
  );
  const offsetY = startIndex * itemHeight;

  return { startIndex, endIndex, offsetY };
}

/**
 * 图片懒加载
 */
export function createImageLazyLoader(
  rootMargin: string = '50px',
  threshold: number = 0.1
): IntersectionObserver {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;

          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    },
    { rootMargin, threshold }
  );

  return observer;
}

/**
 * 性能预算检查
 */
export function checkPerformanceBudget(
  metrics: {
    fcp?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
    ttfb?: number;
  },
  budget: {
    fcp?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
    ttfb?: number;
  }
): {
  passed: boolean;
  violations: Array<{ metric: string; actual: number; budget: number }>;
} {
  const violations: Array<{ metric: string; actual: number; budget: number }> = [];

  Object.entries(budget).forEach(([metric, budgetValue]) => {
    const actualValue = metrics[metric as keyof typeof metrics];
    if (actualValue !== undefined && actualValue > budgetValue) {
      violations.push({
        metric,
        actual: actualValue,
        budget: budgetValue,
      });
    }
  });

  return {
    passed: violations.length === 0,
    violations,
  };
}
