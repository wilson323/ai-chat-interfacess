/**
 * 前端性能监控系统
 * 监控页面加载、API调用、用户交互等关键性能指标
 */

export interface PerformanceMetrics {
  // 页面加载指标
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;

  // API调用指标
  apiCalls: Array<{
    url: string;
    method: string;
    duration: number;
    status: number;
    timestamp: number;
  }>;

  // 用户交互指标
  userInteractions: Array<{
    type: string;
    target: string;
    timestamp: number;
    duration?: number;
  }>;

  // 资源加载指标
  resourceTimings: Array<{
    name: string;
    type: string;
    duration: number;
    size: number;
    timestamp: number;
  }>;

  // 错误指标
  errors: Array<{
    type: string;
    message: string;
    stack?: string;
    timestamp: number;
    url: string;
  }>;
}

/**
 * Web Performance API LayoutShift 接口
 */
interface LayoutShift {
  /** 布局偏移值 */
  value: number;
  /** 是否最近有用户输入 */
  hadRecentInput: boolean;
  /** 最近输入时间 */
  lastInputTime?: number;
  /** 条目类型 */
  name: string;
  /** 条目类型 */
  entryType: string;
  /** 开始时间 */
  startTime: number;
  /** 持续时间 */
  duration: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private observers: PerformanceObserver[];
  private errorHandlers: {
    error: (event: ErrorEvent) => void;
    unhandledrejection: (event: PromiseRejectionEvent) => void;
  } | null = null;
  private _isEnabled: boolean = true;

  constructor() {
    this.metrics = {
      pageLoadTime: 0,
      domContentLoaded: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      apiCalls: [],
      userInteractions: [],
      resourceTimings: [],
      errors: [],
    };
    this.observers = [];
    this._isEnabled = true;

    // 设置全局引用以便XMLHttpRequest拦截器访问
    if (typeof window !== 'undefined') {
      (window as any).__performanceMonitor = this;
    }

    this.init();
  }

  /**
   * 初始化性能监控
   */
  private init(): void {
    if (typeof window === 'undefined') return;

    // 监控页面加载性能
    this.observePageLoad();

    // 监控资源加载
    this.observeResourceTiming();

    // 监控用户交互
    this.observeUserInteractions();

    // 监控错误
    this.observeErrors();

    // 监控API调用
    this.interceptFetch();
    this.interceptXMLHttpRequest();
  }

  /**
   * 监控页面加载性能
   */
  private observePageLoad(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.pageLoadTime =
          navigation.loadEventEnd - navigation.fetchStart;
        this.metrics.domContentLoaded =
          navigation.domContentLoadedEventEnd - navigation.fetchStart;
      }
    });

    // 监控 Core Web Vitals
    this.observeCoreWebVitals();
  }

  /**
   * 监控 Core Web Vitals
   */
  private observeCoreWebVitals(): void {
    // First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
        }
      }
    });
    fcpObserver.observe({ entryTypes: ['paint'] });
    this.observers.push(fcpObserver);

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.largestContentfulPaint = lastEntry.startTime;
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(lcpObserver);

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        const eventEntry = entry as PerformanceEventTiming;
        this.metrics.firstInputDelay =
          eventEntry.processingStart - entry.startTime;
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
    this.observers.push(fidObserver);

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        const layoutEntry = entry as unknown as LayoutShift;
        if (!layoutEntry.hadRecentInput) {
          clsValue += layoutEntry.value;
        }
      }
      this.metrics.cumulativeLayoutShift = clsValue;
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(clsObserver);
  }

  /**
   * 监控资源加载
   */
  private observeResourceTiming(): void {
    if (typeof window === 'undefined') return;

    const resourceObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;
        this.metrics.resourceTimings.push({
          name: resource.name,
          type: this.getResourceType(resource.name),
          duration: resource.duration,
          size: resource.transferSize || 0,
          timestamp: resource.startTime,
        });
      }
    });
    resourceObserver.observe({ entryTypes: ['resource'] });
    this.observers.push(resourceObserver);
  }

  /**
   * 获取资源类型
   */
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (
      url.includes('.png') ||
      url.includes('.jpg') ||
      url.includes('.jpeg') ||
      url.includes('.gif') ||
      url.includes('.webp')
    )
      return 'image';
    if (url.includes('.woff') || url.includes('.woff2') || url.includes('.ttf'))
      return 'font';
    return 'other';
  }

  /**
   * 监控用户交互
   */
  private observeUserInteractions(): void {
    if (typeof window === 'undefined') return;

    const interactionTypes = ['click', 'keydown', 'scroll', 'resize'];

    interactionTypes.forEach(type => {
      window.addEventListener(type, event => {
        this.metrics.userInteractions.push({
          type,
          target: (event.target as Element)?.tagName || 'unknown',
          timestamp: Date.now(),
        });
      });
    });
  }

  /**
   * 监控错误
   */
  private observeErrors(): void {
    if (typeof window === 'undefined') return;

    // 创建错误处理函数
    const errorHandler = (event: ErrorEvent) => {
      this.metrics.errors.push({
        type: 'javascript',
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
        url: window.location.href,
      });
    };

    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      this.metrics.errors.push({
        type: 'promise',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        timestamp: Date.now(),
        url: window.location.href,
      });
    };

    // 保存处理函数引用以便清理
    this.errorHandlers = {
      error: errorHandler,
      unhandledrejection: unhandledRejectionHandler,
    };

    // 添加事件监听器
    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', unhandledRejectionHandler);
  }

  /**
   * 拦截 fetch API
   */
  private interceptFetch(): void {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0] as string;
      const method = (args[1] as RequestInit)?.method || 'GET';

      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;

        this.metrics.apiCalls.push({
          url,
          method,
          duration,
          status: response.status,
          timestamp: Date.now(),
        });

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;

        this.metrics.apiCalls.push({
          url,
          method,
          duration,
          status: 0,
          timestamp: Date.now(),
        });

        throw error;
      }
    };
  }

  /**
   * 拦截 XMLHttpRequest
   */
  private interceptXMLHttpRequest(): void {
    if (typeof window === 'undefined') return;

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string | URL
    ) {
      (this as XMLHttpRequest & { _method?: string; _url?: string })._method = method;
      (this as XMLHttpRequest & { _method?: string; _url?: string })._url = url.toString();
      return originalOpen.apply(
        this,
        arguments as unknown as [string, string, boolean, string?]
      );
    };

    XMLHttpRequest.prototype.send = function () {
      const startTime = performance.now();

      this.addEventListener('loadend', () => {
        const duration = performance.now() - startTime;
        // 通过闭包访问PerformanceMonitor实例
        if (typeof (window as any).__performanceMonitor !== 'undefined') {
          (window as any).__performanceMonitor.recordApiCall({
            url: (this as XMLHttpRequest & { _url?: string })._url || '',
            method: (this as XMLHttpRequest & { _method?: string })._method || '',
            duration,
            status: this.status,
            timestamp: Date.now(),
          });
        }
      });

      return originalSend.apply(
        this,
        arguments as unknown as [Document | XMLHttpRequestBodyInit | null]
      );
    };
  }


  /**
   * 获取性能指标
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 获取性能报告
   */
  public getReport(): {
    summary: {
      pageLoadTime: number;
      averageApiResponseTime: number;
      errorCount: number;
      resourceCount: number;
    };
    details: PerformanceMetrics;
  } {
    const apiCalls = this.metrics.apiCalls;
    const averageApiResponseTime =
      apiCalls.length > 0
        ? apiCalls.reduce((sum, call) => sum + call.duration, 0) /
          apiCalls.length
        : 0;

    return {
      summary: {
        pageLoadTime: this.metrics.pageLoadTime,
        averageApiResponseTime,
        errorCount: this.metrics.errors.length,
        resourceCount: this.metrics.resourceTimings.length,
      },
      details: this.metrics,
    };
  }

  /**
   * 重置指标
   */
  public reset(): void {
    this.metrics = {
      pageLoadTime: 0,
      domContentLoaded: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      apiCalls: [],
      userInteractions: [],
      resourceTimings: [],
      errors: [],
    };
  }

  /**
   * 启用/禁用监控
   */
  public setEnabled(enabled: boolean): void {
    this._isEnabled = enabled;
    if (!enabled) {
      this.observers.forEach(observer => observer.disconnect());
    }
  }

  /**
   * 获取监控状态
   */
  public get isEnabled(): boolean {
    return this._isEnabled;
  }

  /**
   * 记录API调用
   */
  public recordApiCall(call: {
    url: string;
    method: string;
    duration: number;
    status: number;
    timestamp: number;
  }): void {
    if (!this._isEnabled) return;

    this.metrics.apiCalls.push(call);
  }

  /**
   * 销毁监控器
   */
  public destroy(): void {
    // 清理性能观察器
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

    // 清理事件监听器
    if (typeof window !== 'undefined' && this.errorHandlers) {
      window.removeEventListener('error', this.errorHandlers.error);
      window.removeEventListener('unhandledrejection', this.errorHandlers.unhandledrejection);
      this.errorHandlers = null;
    }
  }
}

// 创建全局实例
export const monitor = new PerformanceMonitor();
