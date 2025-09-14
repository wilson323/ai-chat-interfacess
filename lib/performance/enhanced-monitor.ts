/**
 * 增强的性能监控系统
 * 扩展基础监控功能，添加历史数据存储、告警系统、性能分析等
 */

import { PerformanceMetrics, PerformanceMonitor as BaseMonitor } from './monitor';

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
  resolved: boolean;
}

export interface PerformanceHistory {
  timestamp: number;
  metrics: PerformanceMetrics;
  summary: PerformanceSummary;
}

export interface PerformanceOptimization {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'frontend' | 'backend' | 'network' | 'code';
  estimatedImprovement: string;
  steps: string[];
}

export interface ABTestMetrics {
  version: string;
  metrics: PerformanceMetrics;
  sampleSize: number;
  timestamp: number;
}

export interface PerformanceSummary {
  // 基础指标
  pageLoadTime: number;
  averageApiResponseTime: number;
  errorCount: number;
  resourceCount: number;

  // Web Vitals
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;

  // 新增指标
  timeToInteractive: number;
  totalBlockingTime: number;
  memoryUsage: number;
  networkRequests: number;

  // 移动端特定指标
  isMobile: boolean;
  touchResponseTime: number;
  batteryLevel?: number;
  networkType?: string;

  // 趋势数据
  trend: 'improving' | 'stable' | 'degrading';
  changePercentage: number;
}

export interface PerformanceConfig {
  // 告警阈值
  thresholds: {
    pageLoadTime: { warning: number; critical: number };
    apiResponseTime: { warning: number; critical: number };
    errorRate: { warning: number; critical: number };
    memoryUsage: { warning: number; critical: number };
    webVitals: {
      fcp: { warning: number; critical: number };
      lcp: { warning: number; critical: number };
      fid: { warning: number; critical: number };
      cls: { warning: number; critical: number };
    };
  };

  // 历史数据配置
  history: {
    enabled: boolean;
    maxRecords: number;
    retentionHours: number;
  };

  // 告警配置
  alerts: {
    enabled: boolean;
    debounceMs: number;
    notificationMethods: ('console' | 'toast' | 'email' | 'webhook')[];
  };

  // 优化建议配置
  optimization: {
    enabled: boolean;
    autoAnalyze: boolean;
    analysisIntervalMs: number;
  };
}

export class PerformanceMonitor extends BaseMonitor {
  private alerts: PerformanceAlert[] = [];
  private history: PerformanceHistory[] = [];
  private optimizations: PerformanceOptimization[] = [];
  private abTestData: ABTestMetrics[] = [];
  private config: PerformanceConfig;
  private alertCallbacks: Set<(alert: PerformanceAlert) => void> = new Set();
  private historyTimer: NodeJS.Timeout | null = null;
  private analysisTimer: NodeJS.Timeout | null = null;
  private isMobile: boolean = false;

  constructor(config?: Partial<PerformanceConfig>) {
    super();
    this.config = this.getDefaultConfig();

    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.initEnhancedFeatures();
  }

  private getDefaultConfig(): PerformanceConfig {
    return {
      thresholds: {
        pageLoadTime: { warning: 3000, critical: 5000 },
        apiResponseTime: { warning: 1000, critical: 2000 },
        errorRate: { warning: 0.05, critical: 0.1 },
        memoryUsage: { warning: 100 * 1024 * 1024, critical: 200 * 1024 * 1024 }, // 100MB, 200MB
        webVitals: {
          fcp: { warning: 1800, critical: 3000 },
          lcp: { warning: 2500, critical: 4000 },
          fid: { warning: 100, critical: 300 },
          cls: { warning: 0.1, critical: 0.25 },
        },
      },
      history: {
        enabled: true,
        maxRecords: 1000,
        retentionHours: 24,
      },
      alerts: {
        enabled: true,
        debounceMs: 5000,
        notificationMethods: ['console', 'toast'],
      },
      optimization: {
        enabled: true,
        autoAnalyze: true,
        analysisIntervalMs: 30000, // 30秒
      },
    };
  }

  private initEnhancedFeatures(): void {
    if (typeof window === 'undefined') return;

    // 检测移动设备
    this.detectMobileDevice();

    // 启动历史数据记录
    if (this.config.history.enabled) {
      this.startHistoryRecording();
    }

    // 启动性能分析
    if (this.config.optimization.enabled && this.config.optimization.autoAnalyze) {
      this.startPerformanceAnalysis();
    }

    // 监控额外指标
    this.monitorAdditionalMetrics();

    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private detectMobileDevice(): void {
    if (typeof window === 'undefined') return;

    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768;
  }

  private handleResize(): void {
    this.detectMobileDevice();
  }

  private startHistoryRecording(): void {
    this.historyTimer = setInterval(() => {
      this.recordHistory();
    }, 5000); // 每5秒记录一次
  }

  private startPerformanceAnalysis(): void {
    this.analysisTimer = setInterval(() => {
      this.analyzePerformance();
    }, this.config.optimization.analysisIntervalMs);
  }

  private recordHistory(): void {
    const metrics = this.getMetrics();
    const summary = this.calculateEnhancedSummary(metrics);

    const historyRecord: PerformanceHistory = {
      timestamp: Date.now(),
      metrics,
      summary,
    };

    this.history.push(historyRecord);

    // 清理过期记录
    this.cleanupHistory();
  }

  private cleanupHistory(): void {
    const now = Date.now();
    const retentionMs = this.config.history.retentionHours * 60 * 60 * 1000;

    this.history = this.history.filter(record =>
      now - record.timestamp < retentionMs
    );

    // 限制记录数量
    if (this.history.length > this.config.history.maxRecords) {
      this.history = this.history.slice(-this.config.history.maxRecords);
    }
  }

  private calculateEnhancedSummary(metrics: PerformanceMetrics): PerformanceSummary {
    const baseSummary = this.calculateBaseSummary(metrics);

    // 计算新增指标
    const timeToInteractive = this.calculateTimeToInteractive(metrics);
    const totalBlockingTime = this.calculateTotalBlockingTime(metrics);
    const memoryUsage = this.getMemoryUsage();
    const networkRequests = metrics.apiCalls.length + metrics.resourceTimings.length;

    // 计算趋势
    const trend = this.calculateTrend();
    const changePercentage = this.calculateChangePercentage();

    return {
      ...baseSummary,
      timeToInteractive,
      totalBlockingTime,
      memoryUsage,
      networkRequests,
      isMobile: this.isMobile,
      touchResponseTime: this.isMobile ? this.getTouchResponseTime(metrics) : 0,
      batteryLevel: this.getBatteryLevel(),
      networkType: this.getNetworkType(),
      trend,
      changePercentage,
    };
  }

  private calculateBaseSummary(metrics: PerformanceMetrics): Omit<PerformanceSummary, 'timeToInteractive' | 'totalBlockingTime' | 'memoryUsage' | 'networkRequests' | 'isMobile' | 'touchResponseTime' | 'batteryLevel' | 'networkType' | 'trend' | 'changePercentage'> {
    return {
      pageLoadTime: metrics.pageLoadTime,
      averageApiResponseTime: metrics.apiCalls.length > 0
        ? metrics.apiCalls.reduce((sum, call) => sum + call.duration, 0) / metrics.apiCalls.length
        : 0,
      errorCount: metrics.errors.length,
      resourceCount: metrics.resourceTimings.length,
      firstContentfulPaint: metrics.firstContentfulPaint,
      largestContentfulPaint: metrics.largestContentfulPaint,
      firstInputDelay: metrics.firstInputDelay,
      cumulativeLayoutShift: metrics.cumulativeLayoutShift,
    };
  }

  private calculateTimeToInteractive(metrics: PerformanceMetrics): number {
    // 简化的TTI计算，实际应该基于长任务和DOM变化
    if (typeof window === 'undefined') return 0;

    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!nav) return 0;

    // 估算TTI为FCP + 第一个长任务的开始时间
    const longTasks = performance.getEntriesByType('long-task');
    if (longTasks.length === 0) return metrics.firstContentfulPaint;

    return Math.max(metrics.firstContentfulPaint, longTasks[0].startTime);
  }

  private calculateTotalBlockingTime(metrics: PerformanceMetrics): number {
    if (typeof window === 'undefined') return 0;

    const longTasks = performance.getEntriesByType('long-task');
    return longTasks.reduce((total, task) => {
      const blockingTime = Math.max(0, task.duration - 50);
      return total + blockingTime;
    }, 0);
  }

  private getMemoryUsage(): number {
    if (typeof window === 'undefined' || !(performance as any).memory) return 0;

    return (performance as any).memory.usedJSHeapSize;
  }

  private getTouchResponseTime(metrics: PerformanceMetrics): number {
    // 简化的触摸响应时间计算
    const touchInteractions = metrics.userInteractions.filter(i =>
      i.type === 'touchstart' || i.type === 'touchend'
    );

    if (touchInteractions.length < 2) return 0;

    let totalTime = 0;
    let count = 0;

    for (let i = 1; i < touchInteractions.length; i++) {
      if (touchInteractions[i].type === 'touchend' && touchInteractions[i-1].type === 'touchstart') {
        totalTime += touchInteractions[i].timestamp - touchInteractions[i-1].timestamp;
        count++;
      }
    }

    return count > 0 ? totalTime / count : 0;
  }

  private getBatteryLevel(): number | undefined {
    if (typeof window === 'undefined' || !(navigator as any).getBattery) return undefined;

    // 异步获取电池信息，这里返回undefined
    return undefined;
  }

  private getNetworkType(): string | undefined {
    if (typeof window === 'undefined' || !(navigator as any).connection) return undefined;

    return (navigator as any).connection.effectiveType;
  }

  private calculateTrend(): 'improving' | 'stable' | 'degrading' {
    if (this.history.length < 2) return 'stable';

    const recent = this.history.slice(-5); // 最近5个记录
    const older = this.history.slice(-10, -5); // 之前的5个记录

    if (older.length === 0) return 'stable';

    const recentAvgLoadTime = recent.reduce((sum, h) => sum + h.summary.pageLoadTime, 0) / recent.length;
    const olderAvgLoadTime = older.reduce((sum, h) => sum + h.summary.pageLoadTime, 0) / older.length;

    const change = (recentAvgLoadTime - olderAvgLoadTime) / olderAvgLoadTime;

    if (change < -0.05) return 'improving';
    if (change > 0.05) return 'degrading';
    return 'stable';
  }

  private calculateChangePercentage(): number {
    if (this.history.length < 2) return 0;

    const latest = this.history[this.history.length - 1];
    const previous = this.history[this.history.length - 2];

    const latestLoadTime = latest.summary.pageLoadTime;
    const previousLoadTime = previous.summary.pageLoadTime;

    return previousLoadTime > 0 ? ((latestLoadTime - previousLoadTime) / previousLoadTime) * 100 : 0;
  }

  private monitorAdditionalMetrics(): void {
    if (typeof window === 'undefined') return;

    // 监控长任务
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            // 长任务监控逻辑
            this.checkLongTaskThreshold(entry as PerformanceEntry);
          });
        });
        longTaskObserver.observe({ entryTypes: ['long-task'] });
      } catch (e) {
        console.warn('Long task monitoring not supported');
      }
    }

    // 监控内存使用
    this.startMemoryMonitoring();

    // 监控网络状态
    this.startNetworkMonitoring();
  }

  private checkLongTaskThreshold(entry: PerformanceEntry): void {
    const duration = entry.duration;
    const threshold = 100; // 100ms

    if (duration > threshold) {
      this.createAlert({
        type: 'warning',
        metric: 'longTask',
        value: duration,
        threshold,
        message: `检测到长任务: ${duration.toFixed(0)}ms`,
      });
    }
  }

  private startMemoryMonitoring(): void {
    if (typeof window === 'undefined' || !(performance as any).memory) return;

    setInterval(() => {
      const memory = (performance as any).memory;
      const usedJSHeapSize = memory.usedJSHeapSize;

      this.checkMemoryThreshold(usedJSHeapSize);
    }, 10000); // 每10秒检查一次
  }

  private checkMemoryThreshold(memoryUsage: number): void {
    const { warning, critical } = this.config.thresholds.memoryUsage;

    if (memoryUsage > critical) {
      this.createAlert({
        type: 'critical',
        metric: 'memoryUsage',
        value: memoryUsage,
        threshold: critical,
        message: `内存使用过高: ${(memoryUsage / 1024 / 1024).toFixed(1)}MB`,
      });
    } else if (memoryUsage > warning) {
      this.createAlert({
        type: 'warning',
        metric: 'memoryUsage',
        value: memoryUsage,
        threshold: warning,
        message: `内存使用较高: ${(memoryUsage / 1024 / 1024).toFixed(1)}MB`,
      });
    }
  }

  private startNetworkMonitoring(): void {
    if (typeof window === 'undefined' || !(navigator as any).connection) return;

    const connection = (navigator as any).connection;

    connection.addEventListener('change', () => {
      this.createAlert({
        type: 'warning',
        metric: 'networkChange',
        value: connection.effectiveType,
        threshold: 0,
        message: `网络状态变化: ${connection.effectiveType}`,
      });
    });
  }

  private createAlert(alertData: Omit<PerformanceAlert, 'id' | 'timestamp' | 'resolved'>): void {
    if (!this.config.alerts.enabled) return;

    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      resolved: false,
      ...alertData,
    };

    // 防抖处理
    const recentAlert = this.alerts.find(a =>
      a.metric === alert.metric &&
      !a.resolved &&
      Date.now() - a.timestamp < this.config.alerts.debounceMs
    );

    if (recentAlert) return;

    this.alerts.push(alert);
    this.notifyAlert(alert);
  }

  private notifyAlert(alert: PerformanceAlert): void {
    // 控制台日志
    if (this.config.alerts.notificationMethods.includes('console')) {
      console.warn(`[Performance Alert] ${alert.message}`, alert);
    }

    // 通知回调
    this.alertCallbacks.forEach(callback => callback(alert));
  }

  private analyzePerformance(): void {
    const metrics = this.getMetrics();
    const summary = this.calculateEnhancedSummary(metrics);

    // 分析性能问题并生成优化建议
    const optimizations = this.generateOptimizations(metrics, summary);

    // 添加到优化建议列表
    optimizations.forEach(opt => {
      if (!this.optimizations.find(existing => existing.id === opt.id)) {
        this.optimizations.push(opt);
      }
    });

    // 检查告警阈值
    this.checkThresholds(summary);
  }

  private generateOptimizations(metrics: PerformanceMetrics, summary: PerformanceSummary): PerformanceOptimization[] {
    const optimizations: PerformanceOptimization[] = [];

    // 页面加载时间优化
    if (summary.pageLoadTime > this.config.thresholds.pageLoadTime.warning) {
      optimizations.push({
        id: `opt_page_load_${Date.now()}`,
        title: '优化页面加载时间',
        description: `当前页面加载时间为${summary.pageLoadTime.toFixed(0)}ms，建议进行优化`,
        impact: summary.pageLoadTime > this.config.thresholds.pageLoadTime.critical ? 'high' : 'medium',
        difficulty: 'medium',
        category: 'frontend',
        estimatedImprovement: '20-40%',
        steps: [
          '优化图片资源',
          '启用代码分割',
          '使用缓存策略',
          '优化第三方资源加载'
        ]
      });
    }

    // API响应时间优化
    if (summary.averageApiResponseTime > this.config.thresholds.apiResponseTime.warning) {
      optimizations.push({
        id: `opt_api_response_${Date.now()}`,
        title: '优化API响应时间',
        description: `平均API响应时间为${summary.averageApiResponseTime.toFixed(0)}ms，需要优化`,
        impact: summary.averageApiResponseTime > this.config.thresholds.apiResponseTime.critical ? 'high' : 'medium',
        difficulty: 'medium',
        category: 'backend',
        estimatedImprovement: '30-50%',
        steps: [
          '优化数据库查询',
          '实现API缓存',
          '使用CDN加速',
          '优化服务器配置'
        ]
      });
    }

    // 内存使用优化
    if (summary.memoryUsage > this.config.thresholds.memoryUsage.warning) {
      optimizations.push({
        id: `opt_memory_${Date.now()}`,
        title: '优化内存使用',
        description: `内存使用过高: ${(summary.memoryUsage / 1024 / 1024).toFixed(1)}MB`,
        impact: summary.memoryUsage > this.config.thresholds.memoryUsage.critical ? 'high' : 'medium',
        difficulty: 'medium',
        category: 'code',
        estimatedImprovement: '25-40%',
        steps: [
          '检查内存泄漏',
          '优化数据结构',
          '使用对象池',
          '及时清理不用的资源'
        ]
      });
    }

    // 移动端特定优化
    if (summary.isMobile) {
      if (summary.touchResponseTime > 100) {
        optimizations.push({
          id: `opt_touch_${Date.now()}`,
          title: '优化移动端触摸响应',
          description: `移动端触摸响应时间过长: ${summary.touchResponseTime.toFixed(0)}ms`,
          impact: 'medium',
          difficulty: 'easy',
          category: 'frontend',
          estimatedImprovement: '15-25%',
          steps: [
            '减少DOM操作',
            '使用CSS transforms',
            '优化事件监听器',
            '启用硬件加速'
          ]
        });
      }
    }

    return optimizations;
  }

  private checkThresholds(summary: PerformanceSummary): void {
    // 检查页面加载时间
    if (summary.pageLoadTime > this.config.thresholds.pageLoadTime.critical) {
      this.createAlert({
        type: 'critical',
        metric: 'pageLoadTime',
        value: summary.pageLoadTime,
        threshold: this.config.thresholds.pageLoadTime.critical,
        message: `页面加载时间过长: ${summary.pageLoadTime.toFixed(0)}ms`,
      });
    } else if (summary.pageLoadTime > this.config.thresholds.pageLoadTime.warning) {
      this.createAlert({
        type: 'warning',
        metric: 'pageLoadTime',
        value: summary.pageLoadTime,
        threshold: this.config.thresholds.pageLoadTime.warning,
        message: `页面加载时间较长: ${summary.pageLoadTime.toFixed(0)}ms`,
      });
    }

    // 检查Web Vitals
    this.checkWebVitalsThresholds(summary);

    // 检查错误率
    const errorRate = summary.errorCount / Math.max(1, summary.networkRequests);
    if (errorRate > this.config.thresholds.errorRate.critical) {
      this.createAlert({
        type: 'critical',
        metric: 'errorRate',
        value: errorRate,
        threshold: this.config.thresholds.errorRate.critical,
        message: `错误率过高: ${(errorRate * 100).toFixed(1)}%`,
      });
    } else if (errorRate > this.config.thresholds.errorRate.warning) {
      this.createAlert({
        type: 'warning',
        metric: 'errorRate',
        value: errorRate,
        threshold: this.config.thresholds.errorRate.warning,
        message: `错误率较高: ${(errorRate * 100).toFixed(1)}%`,
      });
    }
  }

  private checkWebVitalsThresholds(summary: PerformanceSummary): void {
    const { webVitals } = this.config.thresholds;

    // FCP
    if (summary.firstContentfulPaint > webVitals.fcp.critical) {
      this.createAlert({
        type: 'critical',
        metric: 'fcp',
        value: summary.firstContentfulPaint,
        threshold: webVitals.fcp.critical,
        message: `首次内容绘制时间过长: ${summary.firstContentfulPaint.toFixed(0)}ms`,
      });
    } else if (summary.firstContentfulPaint > webVitals.fcp.warning) {
      this.createAlert({
        type: 'warning',
        metric: 'fcp',
        value: summary.firstContentfulPaint,
        threshold: webVitals.fcp.warning,
        message: `首次内容绘制时间较长: ${summary.firstContentfulPaint.toFixed(0)}ms`,
      });
    }

    // LCP
    if (summary.largestContentfulPaint > webVitals.lcp.critical) {
      this.createAlert({
        type: 'critical',
        metric: 'lcp',
        value: summary.largestContentfulPaint,
        threshold: webVitals.lcp.critical,
        message: `最大内容绘制时间过长: ${summary.largestContentfulPaint.toFixed(0)}ms`,
      });
    } else if (summary.largestContentfulPaint > webVitals.lcp.warning) {
      this.createAlert({
        type: 'warning',
        metric: 'lcp',
        value: summary.largestContentfulPaint,
        threshold: webVitals.lcp.warning,
        message: `最大内容绘制时间较长: ${summary.largestContentfulPaint.toFixed(0)}ms`,
      });
    }

    // CLS
    if (summary.cumulativeLayoutShift > webVitals.cls.critical) {
      this.createAlert({
        type: 'critical',
        metric: 'cls',
        value: summary.cumulativeLayoutShift,
        threshold: webVitals.cls.critical,
        message: `累积布局偏移过高: ${summary.cumulativeLayoutShift.toFixed(3)}`,
      });
    } else if (summary.cumulativeLayoutShift > webVitals.cls.warning) {
      this.createAlert({
        type: 'warning',
        metric: 'cls',
        value: summary.cumulativeLayoutShift,
        threshold: webVitals.cls.warning,
        message: `累积布局偏移较高: ${summary.cumulativeLayoutShift.toFixed(3)}`,
      });
    }
  }

  // 公共API方法
  public getEnhancedMetrics(): PerformanceMetrics {
    return this.getMetrics();
  }

  public getEnhancedSummary(): PerformanceSummary {
    const metrics = this.getMetrics();
    return this.calculateEnhancedSummary(metrics);
  }

  public getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  public getHistory(): PerformanceHistory[] {
    return [...this.history];
  }

  public getOptimizations(): PerformanceOptimization[] {
    return [...this.optimizations];
  }

  public addAlertCallback(callback: (alert: PerformanceAlert) => void): void {
    this.alertCallbacks.add(callback);
  }

  public removeAlertCallback(callback: (alert: PerformanceAlert) => void): void {
    this.alertCallbacks.delete(callback);
  }

  public resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  public recordABTest(version: string): void {
    const metrics = this.getMetrics();
    const summary = this.calculateEnhancedSummary(metrics);

    this.abTestData.push({
      version,
      metrics,
      sampleSize: 1,
      timestamp: Date.now(),
    });
  }

  public getABTestResults(): ABTestMetrics[] {
    return [...this.abTestData];
  }

  public generatePerformanceReport(): {
    summary: PerformanceSummary;
    alerts: PerformanceAlert[];
    optimizations: PerformanceOptimization[];
    history: PerformanceHistory[];
    abTestResults: ABTestMetrics[];
    generatedAt: number;
  } {
    return {
      summary: this.getEnhancedSummary(),
      alerts: this.getAlerts(),
      optimizations: this.getOptimizations(),
      history: this.getHistory(),
      abTestResults: this.getABTestResults(),
      generatedAt: Date.now(),
    };
  }

  public updateConfig(config: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public destroy(): void {
    super.destroy();

    if (this.historyTimer) {
      clearInterval(this.historyTimer);
    }

    if (this.analysisTimer) {
      clearInterval(this.analysisTimer);
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize.bind(this));
    }

    this.alertCallbacks.clear();
  }
}

// 创建增强的性能监控实例
export const enhancedMonitor = new PerformanceMonitor();

// 导出类型和实例
export type {
  PerformanceAlert,
  PerformanceHistory,
  PerformanceOptimization,
  ABTestMetrics,
  PerformanceSummary,
  PerformanceConfig,
};
export { PerformanceMonitor };