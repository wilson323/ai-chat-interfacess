/**
 * 性能基准测试工具
 * 提供标准化的性能测试和基准对比功能
 */

export interface BenchmarkResult {
  id: string;
  name: string;
  category: 'page-load' | 'api' | 'render' | 'memory' | 'network';
  duration: number;
  timestamp: number;
  metadata: Record<string, any>;
  success: boolean;
  error?: string;
  metrics: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    breakdown: Record<string, number>;
  };
}

export interface BenchmarkSuite {
  id: string;
  name: string;
  description: string;
  tests: BenchmarkTest[];
  timeout: number;
}

export interface BenchmarkTest {
  id: string;
  name: string;
  description: string;
  category: BenchmarkResult['category'];
  run: () => Promise<BenchmarkRunResult>;
  weight: number;
}

export interface BenchmarkRunResult {
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface BenchmarkConfig {
  iterations: number;
  warmup: number;
  timeout: number;
  thresholds: {
    pageLoad: { a: number; b: number; c: number; d: number };
    api: { a: number; b: number; c: number; d: number };
    render: { a: number; b: number; c: number; d: number };
    memory: { a: number; b: number; c: number; d: number };
  };
}

export class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];
  private suites: BenchmarkSuite[] = [];
  private config: BenchmarkConfig;
  private isRunning: boolean = false;

  constructor(config?: Partial<BenchmarkConfig>) {
    this.config = this.getDefaultConfig();
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.initializeSuites();
  }

  private getDefaultConfig(): BenchmarkConfig {
    return {
      iterations: 10,
      warmup: 3,
      timeout: 30000,
      thresholds: {
        pageLoad: { a: 1000, b: 2000, c: 3000, d: 4000 },
        api: { a: 200, b: 500, c: 1000, d: 2000 },
        render: { a: 16, b: 32, c: 64, d: 100 },
        memory: {
          a: 50 * 1024 * 1024,
          b: 100 * 1024 * 1024,
          c: 200 * 1024 * 1024,
          d: 500 * 1024 * 1024,
        },
      },
    };
  }

  private initializeSuites(): void {
    // 页面加载测试套件
    this.suites.push({
      id: 'page-load',
      name: '页面加载性能测试',
      description: '测试页面加载时间和资源加载性能',
      timeout: 10000,
      tests: [
        {
          id: 'first-contentful-paint',
          name: '首次内容绘制时间',
          description: '测量首次内容绘制所需时间',
          category: 'page-load',
          weight: 0.3,
          run: () => this.measureFirstContentfulPaint(),
        },
        {
          id: 'largest-contentful-paint',
          name: '最大内容绘制时间',
          description: '测量最大内容元素绘制时间',
          category: 'page-load',
          weight: 0.4,
          run: () => this.measureLargestContentfulPaint(),
        },
        {
          id: 'time-to-interactive',
          name: '可交互时间',
          description: '测量页面变为可交互的时间',
          category: 'page-load',
          weight: 0.3,
          run: () => this.measureTimeToInteractive(),
        },
      ],
    });

    // API性能测试套件
    this.suites.push({
      id: 'api',
      name: 'API性能测试',
      description: '测试API响应时间和并发处理能力',
      timeout: 15000,
      tests: [
        {
          id: 'api-response-time',
          name: 'API响应时间',
          description: '测量API平均响应时间',
          category: 'api',
          weight: 0.6,
          run: () => this.measureAPIResponseTime(),
        },
        {
          id: 'api-concurrency',
          name: 'API并发处理',
          description: '测试API并发请求处理能力',
          category: 'api',
          weight: 0.4,
          run: () => this.measureAPIConcurrency(),
        },
      ],
    });

    // 渲染性能测试套件
    this.suites.push({
      id: 'render',
      name: '渲染性能测试',
      description: '测试DOM渲染和动画性能',
      timeout: 8000,
      tests: [
        {
          id: 'dom-manipulation',
          name: 'DOM操作性能',
          description: '测试DOM元素创建和操作性能',
          category: 'render',
          weight: 0.5,
          run: () => this.measureDOMManipulation(),
        },
        {
          id: 'animation-performance',
          name: '动画性能',
          description: '测试CSS动画和JavaScript动画性能',
          category: 'render',
          weight: 0.5,
          run: () => this.measureAnimationPerformance(),
        },
      ],
    });

    // 内存使用测试套件
    this.suites.push({
      id: 'memory',
      name: '内存使用测试',
      description: '测试内存使用情况和垃圾回收性能',
      timeout: 12000,
      tests: [
        {
          id: 'memory-usage',
          name: '内存使用量',
          description: '测量JavaScript堆内存使用量',
          category: 'memory',
          weight: 0.7,
          run: () => this.measureMemoryUsage(),
        },
        {
          id: 'memory-leak',
          name: '内存泄漏检测',
          description: '检测潜在的内存泄漏问题',
          category: 'memory',
          weight: 0.3,
          run: () => this.detectMemoryLeak(),
        },
      ],
    });

    // 网络性能测试套件
    this.suites.push({
      id: 'network',
      name: '网络性能测试',
      description: '测试网络请求和资源加载性能',
      timeout: 20000,
      tests: [
        {
          id: 'resource-loading',
          name: '资源加载时间',
          description: '测量各种资源类型的加载时间',
          category: 'network',
          weight: 0.4,
          run: () => this.measureResourceLoading(),
        },
        {
          id: 'cache-performance',
          name: '缓存性能',
          description: '测试浏览器缓存机制的有效性',
          category: 'network',
          weight: 0.3,
          run: () => this.measureCachePerformance(),
        },
        {
          id: 'offline-capability',
          name: '离线功能',
          description: '测试Service Worker和离线功能',
          category: 'network',
          weight: 0.3,
          run: () => this.testOfflineCapability(),
        },
      ],
    });
  }

  // 页面加载测试方法
  private async measureFirstContentfulPaint(): Promise<BenchmarkRunResult> {
    return new Promise(resolve => {
      if (typeof window === 'undefined') {
        resolve({
          duration: 0,
          success: false,
          error: 'Not in browser environment',
        });
        return;
      }

      const startTime = performance.now();

      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            const duration = entry.startTime;
            observer.disconnect();
            resolve({
              duration,
              success: true,
              metadata: { entryType: entry.entryType },
            });
            return;
          }
        }
      });

      observer.observe({ entryTypes: ['paint'] });

      // 超时处理
      setTimeout(() => {
        observer.disconnect();
        resolve({
          duration: performance.now() - startTime,
          success: false,
          error: 'FCP measurement timeout',
        });
      }, 5000);
    });
  }

  private async measureLargestContentfulPaint(): Promise<BenchmarkRunResult> {
    return new Promise(resolve => {
      if (typeof window === 'undefined') {
        resolve({
          duration: 0,
          success: false,
          error: 'Not in browser environment',
        });
        return;
      }

      const startTime = performance.now();

      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          const duration = lastEntry.startTime;
          observer.disconnect();
          resolve({
            duration,
            success: true,
            metadata: { entryType: lastEntry.entryType },
          });
          return;
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });

      // 超时处理
      setTimeout(() => {
        observer.disconnect();
        resolve({
          duration: performance.now() - startTime,
          success: false,
          error: 'LCP measurement timeout',
        });
      }, 5000);
    });
  }

  private async measureTimeToInteractive(): Promise<BenchmarkRunResult> {
    if (typeof window === 'undefined') {
      return {
        duration: 0,
        success: false,
        error: 'Not in browser environment',
      };
    }

    // const _startTime = performance.now(); // 暂时注释掉，未使用

    // 简化的TTI计算
    const nav = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    if (!nav) {
      return {
        duration: 0,
        success: false,
        error: 'Navigation timing not available',
      };
    }

    const fcp = await this.getFirstContentfulPaint();
    const longTasks = performance.getEntriesByType('long-task');

    let tti = nav.domContentLoadedEventEnd;
    if (fcp > 0) {
      tti = Math.max(tti, fcp);
    }

    if (longTasks.length > 0) {
      const lastLongTask = longTasks[longTasks.length - 1];
      tti = Math.max(tti, lastLongTask.startTime + lastLongTask.duration);
    }

    const duration = tti - nav.fetchStart;

    return {
      duration,
      success: true,
      metadata: { fcp, longTasksCount: longTasks.length },
    };
  }

  private async getFirstContentfulPaint(): Promise<number> {
    return new Promise(resolve => {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            observer.disconnect();
            resolve(entry.startTime);
            return;
          }
        }
      });
      observer.observe({ entryTypes: ['paint'] });
      setTimeout(() => resolve(0), 1000);
    });
  }

  // API性能测试方法
  private async measureAPIResponseTime(): Promise<BenchmarkRunResult> {
    if (typeof window === 'undefined') {
      return {
        duration: 0,
        success: false,
        error: 'Not in browser environment',
      };
    }

    const testUrls = ['/api/health', '/api/get-config', '/api/chat-history'];

    const results: number[] = [];

    for (const url of testUrls) {
      try {
        const startTime = performance.now();
        const response = await fetch(url);
        const endTime = performance.now();

        if (response.ok) {
          results.push(endTime - startTime);
        }
      } catch (error) {
        console.warn(`API test failed for ${url}:`, error);
      }
    }

    if (results.length === 0) {
      return { duration: 0, success: false, error: 'All API tests failed' };
    }

    const averageTime =
      results.reduce((sum, time) => sum + time, 0) / results.length;

    return {
      duration: averageTime,
      success: true,
      metadata: {
        testUrls,
        successCount: results.length,
        totalTests: testUrls.length,
      },
    };
  }

  private async measureAPIConcurrency(): Promise<BenchmarkRunResult> {
    if (typeof window === 'undefined') {
      return {
        duration: 0,
        success: false,
        error: 'Not in browser environment',
      };
    }

    const concurrentRequests = 10;
    const testUrl = '/api/health';

    const startTime = performance.now();
    const promises = Array(concurrentRequests)
      .fill(null)
      .map(() => fetch(testUrl).catch(() => null));

    try {
      const responses = await Promise.all(promises);
      const endTime = performance.now();
      const successCount = responses.filter(r => r && r.ok).length;

      return {
        duration: endTime - startTime,
        success: true,
        metadata: {
          concurrentRequests,
          successCount,
          successRate: successCount / concurrentRequests,
        },
      };
    } catch (error) {
      return {
        duration: performance.now() - startTime,
        success: false,
        error:
          error instanceof Error ? error.message : 'Concurrency test failed',
      };
    }
  }

  // 渲染性能测试方法
  private async measureDOMManipulation(): Promise<BenchmarkRunResult> {
    if (typeof window === 'undefined') {
      return {
        duration: 0,
        success: false,
        error: 'Not in browser environment',
      };
    }

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const startTime = performance.now();

    // 创建大量DOM元素
    const elementCount = 1000;
    for (let i = 0; i < elementCount; i++) {
      const div = document.createElement('div');
      div.className = 'test-element';
      div.textContent = `Element ${i}`;
      container.appendChild(div);
    }

    // 修改元素样式
    const elements = container.querySelectorAll('.test-element');
    elements.forEach((el, index) => {
      (el as HTMLElement).style.color = `hsl(${index % 360}, 70%, 50%)`;
    });

    // 删除元素
    elements.forEach(el => el.remove());

    const endTime = performance.now();
    container.remove();

    return {
      duration: endTime - startTime,
      success: true,
      metadata: { elementCount },
    };
  }

  private async measureAnimationPerformance(): Promise<BenchmarkRunResult> {
    if (typeof window === 'undefined') {
      return {
        duration: 0,
        success: false,
        error: 'Not in browser environment',
      };
    }

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '100px';
    container.style.height = '100px';
    container.style.background = 'red';
    document.body.appendChild(container);

    const startTime = performance.now();

    // CSS动画测试
    container.style.transition = 'transform 1s ease-in-out';
    container.style.transform = 'translateX(100px)';

    await new Promise(resolve => setTimeout(resolve, 1000));

    container.style.transform = 'translateX(0px)';
    await new Promise(resolve => setTimeout(resolve, 1000));

    const endTime = performance.now();
    container.remove();

    return {
      duration: endTime - startTime,
      success: true,
      metadata: { animationType: 'css-transform' },
    };
  }

  // 内存使用测试方法
  private async measureMemoryUsage(): Promise<BenchmarkRunResult> {
    if (typeof window === 'undefined' || !(performance as any).memory) {
      return { duration: 0, success: false, error: 'Memory API not available' };
    }

    const memory = (performance as any).memory;
    const initialMemory = memory.usedJSHeapSize;

    // 执行一些内存密集型操作
    const largeArray = new Array(1000000).fill(null).map((_, i) => ({
      id: i,
      data: `Data ${i}`.repeat(10),
    }));

    const finalMemory = memory.usedJSHeapSize;
    const memoryIncrease = finalMemory - initialMemory;

    // 清理
    largeArray.length = 0;

    return {
      duration: memoryIncrease,
      success: true,
      metadata: {
        initialMemory: initialMemory / 1024 / 1024,
        finalMemory: finalMemory / 1024 / 1024,
        memoryIncrease: memoryIncrease / 1024 / 1024,
      },
    };
  }

  private async detectMemoryLeak(): Promise<BenchmarkRunResult> {
    if (
      typeof window === 'undefined' ||
      !(performance as Performance & { memory?: { usedJSHeapSize: number } })
        .memory
    ) {
      return { duration: 0, success: false, error: 'Memory API not available' };
    }

    const memory = (
      performance as Performance & { memory: { usedJSHeapSize: number } }
    ).memory;
    const initialMemory = memory.usedJSHeapSize;

    // 创建可能导致内存泄漏的对象
    const leakyObjects: Array<{
      data: string[];
      callback: () => void;
    }> = [];
    for (let i = 0; i < 1000; i++) {
      const obj = {
        data: new Array(1000).fill(`Leaky data ${i}`),
        callback: () => console.log(i),
      };
      leakyObjects.push(obj);
    }

    const afterCreationMemory = memory.usedJSHeapSize;

    // 尝试清理
    leakyObjects.length = 0;

    // 强制垃圾回收（如果可用）
    if ((window as Window & { gc?: () => void }).gc) {
      (window as Window & { gc: () => void }).gc();
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    const finalMemory = memory.usedJSHeapSize;
    const memoryLeaked = finalMemory - initialMemory;

    return {
      duration: memoryLeaked,
      success: true,
      metadata: {
        initialMemory: initialMemory / 1024 / 1024,
        afterCreationMemory: afterCreationMemory / 1024 / 1024,
        finalMemory: finalMemory / 1024 / 1024,
        potentialLeak: memoryLeaked > 1024 * 1024, // 1MB threshold
      },
    };
  }

  // 网络性能测试方法
  private async measureResourceLoading(): Promise<BenchmarkRunResult> {
    if (typeof window === 'undefined') {
      return {
        duration: 0,
        success: false,
        error: 'Not in browser environment',
      };
    }

    const resources = performance.getEntriesByType('resource');
    const totalDuration = resources.reduce(
      (sum, resource) => sum + resource.duration,
      0
    );
    const averageDuration =
      resources.length > 0 ? totalDuration / resources.length : 0;

    return {
      duration: averageDuration,
      success: true,
      metadata: {
        resourceCount: resources.length,
        totalDuration,
        averageDuration,
        resourceTypes: this.getResourceTypeStats(resources as PerformanceResourceTiming[]),
      },
    };
  }

  private getResourceTypeStats(resources: PerformanceResourceTiming[]) {
    const stats: Record<string, number> = {};
    resources.forEach(resource => {
      const type = this.getResourceType(resource.name);
      stats[type] = (stats[type] || 0) + 1;
    });
    return stats;
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|webp)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf)$/)) return 'font';
    return 'other';
  }

  private async measureCachePerformance(): Promise<BenchmarkRunResult> {
    if (typeof window === 'undefined') {
      return {
        duration: 0,
        success: false,
        error: 'Not in browser environment',
      };
    }

    const testUrl = '/api/health';
    // const iterations = 5;

    // 第一次请求（冷缓存）
    const coldStart = performance.now();
    await fetch(testUrl);
    const coldEnd = performance.now();
    const coldTime = coldEnd - coldStart;

    // 第二次请求（热缓存）
    const hotStart = performance.now();
    await fetch(testUrl);
    const hotEnd = performance.now();
    const hotTime = hotEnd - hotStart;

    const cacheImprovement = ((coldTime - hotTime) / coldTime) * 100;

    return {
      duration: hotTime,
      success: true,
      metadata: {
        coldTime,
        hotTime,
        cacheImprovement,
        cacheEffective: hotTime < coldTime,
      },
    };
  }

  private async testOfflineCapability(): Promise<BenchmarkRunResult> {
    if (typeof window === 'undefined') {
      return {
        duration: 0,
        success: false,
        error: 'Not in browser environment',
      };
    }

    const startTime = performance.now();

    // 检查Service Worker
    const swSupported = 'serviceWorker' in navigator;
    let swRegistered = false;

    if (swSupported) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        swRegistered = !!registration;
      } catch (error) {
        console.warn('Service Worker check failed:', error);
      }
    }

    // 检查离线存储
    const indexedDBSupported = 'indexedDB' in window;
    const localStorageSupported = 'localStorage' in window;

    const endTime = performance.now();

    return {
      duration: endTime - startTime,
      success: true,
      metadata: {
        serviceWorker: {
          supported: swSupported,
          registered: swRegistered,
        },
        storage: {
          indexedDB: indexedDBSupported,
          localStorage: localStorageSupported,
        },
        offlineReady: swRegistered && indexedDBSupported,
      },
    };
  }

  // 公共API方法
  public async runBenchmark(suiteId?: string): Promise<BenchmarkResult[]> {
    if (this.isRunning) {
      throw new Error('Benchmark is already running');
    }

    this.isRunning = true;
    const results: BenchmarkResult[] = [];

    try {
      const suitesToRun = suiteId
        ? this.suites.filter(suite => suite.id === suiteId)
        : this.suites;

      for (const suite of suitesToRun) {
        console.log(`Running benchmark suite: ${suite.name}`);
        const suiteResults = await this.runSuite(suite);
        results.push(...suiteResults);
      }
    } finally {
      this.isRunning = false;
    }

    // 保存结果
    this.results.push(...results);
    return results;
  }

  private async runSuite(suite: BenchmarkSuite): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];

    for (const test of suite.tests) {
      console.log(`Running test: ${test.name}`);

      try {
        // 预热
        for (let i = 0; i < this.config.warmup; i++) {
          await test.run();
        }

        // 正式测试
        const testResults: BenchmarkRunResult[] = [];
        for (let i = 0; i < this.config.iterations; i++) {
          const result = await Promise.race([
            test.run(),
            new Promise<BenchmarkRunResult>((_, reject) =>
              setTimeout(() => reject(new Error('Test timeout')), suite.timeout)
            ),
          ]);
          testResults.push(result);
        }

        // 计算平均值和评分
        const successfulResults = testResults.filter(r => r.success);
        const averageDuration =
          successfulResults.length > 0
            ? successfulResults.reduce((sum, r) => sum + r.duration, 0) /
              successfulResults.length
            : 0;

        const score = this.calculateScore(test.category, averageDuration);
        const grade = this.calculateGrade(test.category, averageDuration);

        const result: BenchmarkResult = {
          id: `${suite.id}_${test.id}_${Date.now()}`,
          name: test.name,
          category: test.category,
          duration: averageDuration,
          timestamp: Date.now(),
          success: successfulResults.length > 0,
          metadata: {
            iterations: this.config.iterations,
            successfulRuns: successfulResults.length,
            suiteId: suite.id,
            testId: test.id,
            weight: test.weight,
            individualResults: testResults,
          },
          metrics: {
            score,
            grade,
            breakdown: this.calculateBreakdown(test.category, averageDuration),
          },
        };

        results.push(result);
      } catch (error) {
        console.error(`Test failed: ${test.name}`, error);
        results.push({
          id: `${suite.id}_${test.id}_${Date.now()}`,
          name: test.name,
          category: test.category,
          duration: 0,
          timestamp: Date.now(),
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          metadata: {
            suiteId: suite.id,
            testId: test.id,
          },
          metrics: {
            score: 0,
            grade: 'F',
            breakdown: {},
          },
        });
      }
    }

    return results;
  }

  private calculateScore(
    category: BenchmarkResult['category'],
    duration: number
  ): number {
    const thresholds = this.config.thresholds[category as keyof typeof this.config.thresholds];
    const maxScore = 100;

    if (duration <= thresholds.a) return maxScore;
    if (duration <= thresholds.b) return maxScore * 0.8;
    if (duration <= thresholds.c) return maxScore * 0.6;
    if (duration <= thresholds.d) return maxScore * 0.4;
    return maxScore * 0.2;
  }

  private calculateGrade(
    category: BenchmarkResult['category'],
    duration: number
  ): 'A' | 'B' | 'C' | 'D' | 'F' {
    const thresholds = this.config.thresholds[category as keyof typeof this.config.thresholds];

    if (duration <= thresholds.a) return 'A';
    if (duration <= thresholds.b) return 'B';
    if (duration <= thresholds.c) return 'C';
    if (duration <= thresholds.d) return 'D';
    return 'F';
  }

  private calculateBreakdown(
    category: BenchmarkResult['category'],
    duration: number
  ): Record<string, number> {
    const thresholds = this.config.thresholds[category as keyof typeof this.config.thresholds];
    const percentage = Math.max(0, 100 - (duration / thresholds.d) * 100);

    return {
      rawScore: duration,
      thresholdA: thresholds.a,
      thresholdB: thresholds.b,
      thresholdC: thresholds.c,
      thresholdD: thresholds.d,
      percentage,
    };
  }

  public getResults(): BenchmarkResult[] {
    return [...this.results];
  }

  public getSuites(): BenchmarkSuite[] {
    return [...this.suites];
  }

  public getSummary() {
    const results = this.getResults();
    const successful = results.filter(r => r.success);

    if (successful.length === 0) {
      return {
        totalTests: results.length,
        successfulTests: 0,
        failedTests: results.length,
        averageScore: 0,
        grade: 'F' as const,
        categoryScores: {},
      };
    }

    // 一次性计算所有分类分数
    const categoryScores = successful.reduce(
      (acc, result) => {
        const category = result.category;
        if (!acc[category]) {
          acc[category] = { total: 0, count: 0 };
        }
        acc[category].total += result.metrics.score;
        acc[category].count += 1;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>
    );

    // 计算平均分数
    const averageCategoryScores = Object.entries(categoryScores).reduce(
      (acc, [category, scores]) => {
        acc[category] = scores.total / scores.count;
        return acc;
      },
      {} as Record<string, number>
    );

    const categoryValues = Object.values(averageCategoryScores);
    const overallAverage =
      categoryValues.length > 0
        ? categoryValues.reduce((sum, score) => sum + score, 0) /
          categoryValues.length
        : 0;

    return {
      totalTests: results.length,
      successfulTests: successful.length,
      failedTests: results.length - successful.length,
      averageScore: overallAverage,
      grade: this.getOverallGrade(overallAverage),
      categoryScores: averageCategoryScores,
    };
  }

  private getOverallGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  public clearResults(): void {
    this.results = [];
  }

  public exportResults(): string {
    return JSON.stringify(
      {
        results: this.results,
        summary: this.getSummary(),
        config: this.config,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }

  public updateConfig(newConfig: Partial<BenchmarkConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// 创建全局实例
export const performanceBenchmark = new PerformanceBenchmark();

// 类型已经在文件开头导出，这里不需要重复导出
