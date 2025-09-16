/**
 * 主题监控和性能分析系统
 * 提供实时监控、性能分析、一致性检查和异常检测
 */

import {
  ThemePerformanceMetrics,
  ThemeConsistencyCheck,
  EnhancedThemeConfig
} from '../../types/theme-enhanced';
import { enhancedThemeManager } from './theme-manager-enhanced';

/**
 * 监控事件类型
 */
export interface MonitorEvent {
  /** 事件类型 */
  type: 'performance' | 'consistency' | 'error' | 'warning' | 'info';
  /** 事件名称 */
  name: string;
  /** 事件数据 */
  data: any;
  /** 时间戳 */
  timestamp: number;
  /** 主题ID */
  themeId: string;
  /** 用户ID（可选） */
  userId?: string;
}

/**
 * 性能阈值违规
 */
export interface PerformanceViolation {
  /** 违规类型 */
  type: 'switch_time' | 'animation_time' | 'memory_usage' | 'render_time';
  /** 实际值 */
  actualValue: number;
  /** 阈值 */
  threshold: number;
  /** 超出百分比 */
  exceedPercentage: number;
  /** 严重程度 */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** 时间戳 */
  timestamp: number;
}

/**
 * 一致性违规
 */
export interface ConsistencyViolation {
  /** 违规类型 */
  type: 'contrast_ratio' | 'harmony_score' | 'accessibility_score' | 'style_consistency';
  /** 实际值 */
  actualValue: number;
  /** 最小要求 */
  minRequired: number;
  /** 主题ID */
  themeId: string;
  /** 严重程度 */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** 建议 */
  recommendations: string[];
}

/**
 * 监控配置
 */
export interface MonitorConfig {
  /** 是否启用性能监控 */
  enablePerformanceMonitoring: boolean;
  /** 是否启用一致性检查 */
  enableConsistencyCheck: boolean;
  /** 是否启用异常检测 */
  enableAnomalyDetection: boolean;
  /** 监控间隔（毫秒） */
  monitoringInterval: number;
  /** 性能阈值 */
  performanceThresholds: {
    /** 主题切换时间阈值（毫秒） */
    maxSwitchTime: number;
    /** 动画渲染时间阈值（毫秒） */
    maxAnimationTime: number;
    /** 内存使用阈值（MB） */
    maxMemoryUsage: number;
    /** 首次渲染时间阈值（毫秒） */
    maxFirstPaintTime: number;
  };
  /** 一致性阈值 */
  consistencyThresholds: {
    /** 最小对比度比例 */
    minContrastRatio: number;
    /** 最小和谐度评分 */
    minHarmonyScore: number;
    /** 最小可访问性评分 */
    minAccessibilityScore: number;
    /** 最小样式一致性评分 */
    minStyleConsistency: number;
  };
  /** 异常检测配置 */
  anomalyDetection: {
    /** 历史数据窗口大小 */
    windowSize: number;
    /** 异常阈值（标准差倍数） */
    anomalyThreshold: number;
    /** 最小数据点数量 */
    minDataPoints: number;
  };
}

/**
 * 主题性能监控器
 */
export class ThemePerformanceMonitor {
  private metrics: ThemePerformanceMetrics[] = [];
  private listeners: Set<(metrics: ThemePerformanceMetrics) => void> = new Set();
  private config: MonitorConfig;

  constructor(config: MonitorConfig) {
    this.config = config;
  }

  /**
   * 记录性能指标
   */
  recordMetric(metric: ThemePerformanceMetrics): void {
    this.metrics.push(metric);

    // 保持最近的数据点
    if (this.metrics.length > this.config.anomalyDetection.windowSize) {
      this.metrics.shift();
    }

    // 检查性能违规
    this.checkPerformanceViolations(metric);

    // 检查异常
    this.checkAnomalies(metric);

    // 通知监听器
    this.notifyListeners(metric);
  }

  /**
   * 检查性能违规
   */
  private checkPerformanceViolations(metric: ThemePerformanceMetrics): void {
    const violations: PerformanceViolation[] = [];

    // 检查主题切换时间
    if (metric.switchTime > this.config.performanceThresholds.maxSwitchTime) {
      violations.push({
        type: 'switch_time',
        actualValue: metric.switchTime,
        threshold: this.config.performanceThresholds.maxSwitchTime,
        exceedPercentage: ((metric.switchTime - this.config.performanceThresholds.maxSwitchTime) / this.config.performanceThresholds.maxSwitchTime) * 100,
        severity: this.getPerformanceViolationSeverity(metric.switchTime, this.config.performanceThresholds.maxSwitchTime),
        timestamp: Date.now(),
      });
    }

    // 检查动画渲染时间
    if (metric.animationRenderTime > this.config.performanceThresholds.maxAnimationTime) {
      violations.push({
        type: 'animation_time',
        actualValue: metric.animationRenderTime,
        threshold: this.config.performanceThresholds.maxAnimationTime,
        exceedPercentage: ((metric.animationRenderTime - this.config.performanceThresholds.maxAnimationTime) / this.config.performanceThresholds.maxAnimationTime) * 100,
        severity: this.getPerformanceViolationSeverity(metric.animationRenderTime, this.config.performanceThresholds.maxAnimationTime),
        timestamp: Date.now(),
      });
    }

    // 检查内存使用
    if (metric.memoryUsage > this.config.performanceThresholds.maxMemoryUsage) {
      violations.push({
        type: 'memory_usage',
        actualValue: metric.memoryUsage,
        threshold: this.config.performanceThresholds.maxMemoryUsage,
        exceedPercentage: ((metric.memoryUsage - this.config.performanceThresholds.maxMemoryUsage) / this.config.performanceThresholds.maxMemoryUsage) * 100,
        severity: this.getPerformanceViolationSeverity(metric.memoryUsage, this.config.performanceThresholds.maxMemoryUsage),
        timestamp: Date.now(),
      });
    }

    // 检查首次渲染时间
    if (metric.firstPaintTime > this.config.performanceThresholds.maxFirstPaintTime) {
      violations.push({
        type: 'render_time',
        actualValue: metric.firstPaintTime,
        threshold: this.config.performanceThresholds.maxFirstPaintTime,
        exceedPercentage: ((metric.firstPaintTime - this.config.performanceThresholds.maxFirstPaintTime) / this.config.performanceThresholds.maxFirstPaintTime) * 100,
        severity: this.getPerformanceViolationSeverity(metric.firstPaintTime, this.config.performanceThresholds.maxFirstPaintTime),
        timestamp: Date.now(),
      });
    }

    if (violations.length > 0) {
      this.handlePerformanceViolations(violations);
    }
  }

  /**
   * 检查异常
   */
  private checkAnomalies(metric: ThemePerformanceMetrics): void {
    if (this.metrics.length < this.config.anomalyDetection.minDataPoints) {
      return;
    }

    const recentMetrics = this.metrics.slice(-this.config.anomalyDetection.windowSize);
    const anomalies: any[] = [];

    // 检查主题切换时间异常
    const switchTimes = recentMetrics.map(m => m.switchTime);
    const switchTimeAnomaly = this.detectAnomaly(metric.switchTime, switchTimes);
    if (switchTimeAnomaly) {
      anomalies.push({
        type: 'switch_time_anomaly',
        value: metric.switchTime,
        zScore: switchTimeAnomaly.zScore,
        severity: switchTimeAnomaly.severity,
      });
    }

    // 检查内存使用异常
    const memoryUsages = recentMetrics.map(m => m.memoryUsage);
    const memoryAnomaly = this.detectAnomaly(metric.memoryUsage, memoryUsages);
    if (memoryAnomaly) {
      anomalies.push({
        type: 'memory_usage_anomaly',
        value: metric.memoryUsage,
        zScore: memoryAnomaly.zScore,
        severity: memoryAnomaly.severity,
      });
    }

    if (anomalies.length > 0) {
      this.handleAnomalies(anomalies);
    }
  }

  /**
   * 异常检测
   */
  private detectAnomaly(value: number, historicalValues: number[]): { zScore: number; severity: 'low' | 'medium' | 'high' } | null {
    if (historicalValues.length < this.config.anomalyDetection.minDataPoints) {
      return null;
    }

    const mean = historicalValues.reduce((sum, val) => sum + val, 0) / historicalValues.length;
    const variance = historicalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historicalValues.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) {
      return null;
    }

    const zScore = Math.abs(value - mean) / stdDev;

    if (zScore > this.config.anomalyDetection.anomalyThreshold) {
      let severity: 'low' | 'medium' | 'high';
      if (zScore > this.config.anomalyDetection.anomalyThreshold * 2) {
        severity = 'high';
      } else if (zScore > this.config.anomalyDetection.anomalyThreshold * 1.5) {
        severity = 'medium';
      } else {
        severity = 'low';
      }

      return { zScore, severity };
    }

    return null;
  }

  /**
   * 获取性能违规严重程度
   */
  private getPerformanceViolationSeverity(actualValue: number, threshold: number): 'low' | 'medium' | 'high' | 'critical' {
    const exceedPercentage = ((actualValue - threshold) / threshold) * 100;

    if (exceedPercentage >= 100) return 'critical';
    if (exceedPercentage >= 50) return 'high';
    if (exceedPercentage >= 25) return 'medium';
    return 'low';
  }

  /**
   * 处理性能违规
   */
  private handlePerformanceViolations(violations: PerformanceViolation[]): void {
    console.warn('Theme performance violations detected:', violations);

    // 触发性能优化建议
    this.suggestPerformanceOptimizations(violations);
  }

  /**
   * 处理异常
   */
  private handleAnomalies(anomalies: any[]): void {
    console.warn('Theme performance anomalies detected:', anomalies);

    // 可以在这里添加异常处理逻辑，如发送警报、记录日志等
  }

  /**
   * 建议性能优化
   */
  private suggestPerformanceOptimizations(violations: PerformanceViolation[]): void {
    const suggestions: string[] = [];

    violations.forEach(violation => {
      switch (violation.type) {
        case 'switch_time':
          suggestions.push('考虑减少主题切换时的CSS变量数量');
          suggestions.push('优化主题切换动画，减少复杂性');
          break;
        case 'animation_time':
          suggestions.push('简化动画效果，减少动画持续时间');
          suggestions.push('使用CSS硬件加速属性');
          break;
        case 'memory_usage':
          suggestions.push('清理未使用的CSS变量');
          suggestions.push('优化主题配置对象的大小');
          break;
        case 'render_time':
          suggestions.push('减少DOM操作次数');
          suggestions.push('使用批量DOM更新技术');
          break;
      }
    });

    console.info('Performance optimization suggestions:', suggestions);
  }

  /**
   * 获取性能指标
   */
  getMetrics(): ThemePerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats(): {
    averageSwitchTime: number;
    averageAnimationTime: number;
    averageMemoryUsage: number;
    averageFirstPaintTime: number;
    violations: PerformanceViolation[];
  } {
    if (this.metrics.length === 0) {
      return {
        averageSwitchTime: 0,
        averageAnimationTime: 0,
        averageMemoryUsage: 0,
        averageFirstPaintTime: 0,
        violations: [],
      };
    }

    const switchTimes = this.metrics.map(m => m.switchTime);
    const animationTimes = this.metrics.map(m => m.animationRenderTime);
    const memoryUsages = this.metrics.map(m => m.memoryUsage);
    const firstPaintTimes = this.metrics.map(m => m.firstPaintTime);

    return {
      averageSwitchTime: switchTimes.reduce((sum, val) => sum + val, 0) / switchTimes.length,
      averageAnimationTime: animationTimes.reduce((sum, val) => sum + val, 0) / animationTimes.length,
      averageMemoryUsage: memoryUsages.reduce((sum, val) => sum + val, 0) / memoryUsages.length,
      averageFirstPaintTime: firstPaintTimes.reduce((sum, val) => sum + val, 0) / firstPaintTimes.length,
      violations: this.getPerformanceViolations(),
    };
  }

  /**
   * 获取性能违规记录
   */
  private getPerformanceViolations(): PerformanceViolation[] {
    // 这里应该实现违规记录的存储和检索逻辑
    return [];
  }

  /**
   * 添加监听器
   */
  addListener(listener: (metrics: ThemePerformanceMetrics) => void): void {
    this.listeners.add(listener);
  }

  /**
   * 移除监听器
   */
  removeListener(listener: (metrics: ThemePerformanceMetrics) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * 通知监听器
   */
  private notifyListeners(metrics: ThemePerformanceMetrics): void {
    this.listeners.forEach(listener => {
      try {
        listener(metrics);
      } catch (error) {
        console.error('Error in theme performance listener:', error);
      }
    });
  }

  /**
   * 清除历史数据
   */
  clearMetrics(): void {
    this.metrics = [];
  }
}

/**
 * 主题一致性监控器
 */
export class ThemeConsistencyMonitor {
  private consistencyChecks: ThemeConsistencyCheck[] = [];
  private violations: ConsistencyViolation[] = [];
  private config: MonitorConfig;

  constructor(config: MonitorConfig) {
    this.config = config;
  }

  /**
   * 执行一致性检查
   */
  async checkConsistency(theme: EnhancedThemeConfig): Promise<ThemeConsistencyCheck> {
    const check = await enhancedThemeManager.checkThemeConsistency(theme.id);

    this.consistencyChecks.push(check);

    // 检查一致性违规
    this.checkConsistencyViolations(theme.id, check);

    return check;
  }

  /**
   * 检查一致性违规
   */
  private checkConsistencyViolations(themeId: string, check: ThemeConsistencyCheck): void {
    const violations: ConsistencyViolation[] = [];

    // 检查对比度违规
    if (!check.colorConsistency.contrastRatioPass) {
      violations.push({
        type: 'contrast_ratio',
        actualValue: 0, // 这里应该获取实际的对比度值
        minRequired: this.config.consistencyThresholds.minContrastRatio,
        themeId,
        severity: 'high',
        recommendations: [
          '增加文字和背景色的对比度',
          '使用更深或更浅的颜色',
          '参考WCAG对比度标准',
        ],
      });
    }

    // 检查和谐度违规
    if (check.colorConsistency.harmonyScore < this.config.consistencyThresholds.minHarmonyScore) {
      violations.push({
        type: 'harmony_score',
        actualValue: check.colorConsistency.harmonyScore,
        minRequired: this.config.consistencyThresholds.minHarmonyScore,
        themeId,
        severity: 'medium',
        recommendations: [
          '调整色彩搭配，使用更和谐的色彩组合',
          '参考色彩理论选择配色方案',
          '使用色轮工具辅助配色',
        ],
      });
    }

    // 检查可访问性违规
    if (check.colorConsistency.accessibilityScore < this.config.consistencyThresholds.minAccessibilityScore) {
      violations.push({
        type: 'accessibility_score',
        actualValue: check.colorConsistency.accessibilityScore,
        minRequired: this.config.consistencyThresholds.minAccessibilityScore,
        themeId,
        severity: 'high',
        recommendations: [
          '提高色彩对比度',
          '避免仅依赖色彩传达信息',
          '为色盲用户考虑替代方案',
        ],
      });
    }

    // 检查样式一致性违规
    const avgStyleConsistency = (
      check.styleConsistency.borderRadiusConsistency +
      check.styleConsistency.shadowConsistency +
      check.styleConsistency.spacingConsistency
    ) / 3;

    if (avgStyleConsistency < this.config.consistencyThresholds.minStyleConsistency) {
      violations.push({
        type: 'style_consistency',
        actualValue: avgStyleConsistency,
        minRequired: this.config.consistencyThresholds.minStyleConsistency,
        themeId,
        severity: 'medium',
        recommendations: [
          '统一设计元素的样式规范',
          '建立设计系统标准',
          '使用一致的间距和尺寸',
        ],
      });
    }

    if (violations.length > 0) {
      this.violations.push(...violations);
      this.handleConsistencyViolations(violations);
    }
  }

  /**
   * 处理一致性违规
   */
  private handleConsistencyViolations(violations: ConsistencyViolation[]): void {
    console.warn('Theme consistency violations detected:', violations);

    // 触发一致性改进建议
    this.suggestConsistencyImprovements(violations);
  }

  /**
   * 建议一致性改进
   */
  private suggestConsistencyImprovements(violations: ConsistencyViolation[]): void {
    const suggestions: string[] = [];

    violations.forEach(violation => {
      suggestions.push(...violation.recommendations);
    });

    console.info('Consistency improvement suggestions:', suggestions);
  }

  /**
   * 获取一致性检查历史
   */
  getConsistencyHistory(): ThemeConsistencyCheck[] {
    return [...this.consistencyChecks];
  }

  /**
   * 获取一致性违规记录
   */
  getConsistencyViolations(): ConsistencyViolation[] {
    return [...this.violations];
  }

  /**
   * 获取一致性统计
   */
  getConsistencyStats(): {
    averageContrastRatio: number;
    averageHarmonyScore: number;
    averageAccessibilityScore: number;
    averageStyleConsistency: number;
    violations: ConsistencyViolation[];
  } {
    if (this.consistencyChecks.length === 0) {
      return {
        averageContrastRatio: 0,
        averageHarmonyScore: 0,
        averageAccessibilityScore: 0,
        averageStyleConsistency: 0,
        violations: [],
      };
    }

    const contrastRatios = this.consistencyChecks.map(c =>
      c.colorConsistency.contrastRatioPass ? 4.5 : 2.0
    );
    const harmonyScores = this.consistencyChecks.map(c => c.colorConsistency.harmonyScore);
    const accessibilityScores = this.consistencyChecks.map(c => c.colorConsistency.accessibilityScore);
    const styleConsistencies = this.consistencyChecks.map(c =>
      (c.styleConsistency.borderRadiusConsistency +
       c.styleConsistency.shadowConsistency +
       c.styleConsistency.spacingConsistency) / 3
    );

    return {
      averageContrastRatio: contrastRatios.reduce((sum, val) => sum + val, 0) / contrastRatios.length,
      averageHarmonyScore: harmonyScores.reduce((sum, val) => sum + val, 0) / harmonyScores.length,
      averageAccessibilityScore: accessibilityScores.reduce((sum, val) => sum + val, 0) / accessibilityScores.length,
      averageStyleConsistency: styleConsistencies.reduce((sum, val) => sum + val, 0) / styleConsistencies.length,
      violations: this.getConsistencyViolations(),
    };
  }

  /**
   * 清除历史数据
   */
  clearHistory(): void {
    this.consistencyChecks = [];
    this.violations = [];
  }
}

/**
 * 主题监控系统
 */
export class ThemeMonitor {
  private performanceMonitor: ThemePerformanceMonitor;
  private consistencyMonitor: ThemeConsistencyMonitor;
  private config: MonitorConfig;
  private monitoringInterval?: NodeJS.Timeout;
  private isMonitoring = false;

  constructor(config: MonitorConfig) {
    this.config = config;
    this.performanceMonitor = new ThemePerformanceMonitor(config);
    this.consistencyMonitor = new ThemeConsistencyMonitor(config);
  }

  /**
   * 开始监控
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;

    // 定期执行监控任务
    this.monitoringInterval = setInterval(() => {
      this.performMonitoringTasks();
    }, this.config.monitoringInterval);

    console.info('Theme monitoring started');
  }

  /**
   * 停止监控
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    console.info('Theme monitoring stopped');
  }

  /**
   * 执行监控任务
   */
  private async performMonitoringTasks(): Promise<void> {
    try {
      // 获取当前主题
      const currentThemeId = enhancedThemeManager.currentTheme;
      const currentTheme = enhancedThemeManager.getThemeConfig(currentThemeId);

      if (!currentTheme) {
        return;
      }

      // 执行一致性检查
      if (this.config.enableConsistencyCheck) {
        await this.consistencyMonitor.checkConsistency(currentTheme);
      }

      // 这里可以添加其他监控任务

    } catch (error) {
      console.error('Error during monitoring tasks:', error);
    }
  }

  /**
   * 记录性能指标
   */
  recordPerformanceMetric(metric: ThemePerformanceMetrics): void {
    this.performanceMonitor.recordMetric(metric);
  }

  /**
   * 获取性能监控器
   */
  getPerformanceMonitor(): ThemePerformanceMonitor {
    return this.performanceMonitor;
  }

  /**
   * 获取一致性监控器
   */
  getConsistencyMonitor(): ThemeConsistencyMonitor {
    return this.consistencyMonitor;
  }

  /**
   * 获取监控配置
   */
  getConfig(): MonitorConfig {
    return { ...this.config };
  }

  /**
   * 更新监控配置
   */
  updateConfig(config: Partial<MonitorConfig>): void {
    this.config = { ...this.config, ...config };
    this.performanceMonitor = new ThemePerformanceMonitor(this.config);
    this.consistencyMonitor = new ThemeConsistencyMonitor(this.config);
  }

  /**
   * 获取监控报告
   */
  getMonitoringReport(): {
    performance: ReturnType<ThemePerformanceMonitor['getPerformanceStats']>;
    consistency: ReturnType<ThemeConsistencyMonitor['getConsistencyStats']>;
    isMonitoring: boolean;
    config: MonitorConfig;
  } {
    return {
      performance: this.performanceMonitor.getPerformanceStats(),
      consistency: this.consistencyMonitor.getConsistencyStats(),
      isMonitoring: this.isMonitoring,
      config: this.getConfig(),
    };
  }

  /**
   * 生成监控报告
   */
  generateReport(): string {
    const report = this.getMonitoringReport();
    const violations = [
      ...report.performance.violations,
      ...report.consistency.violations,
    ];

    return `
主题系统监控报告
================

监控状态: ${report.isMonitoring ? '运行中' : '已停止'}

性能统计:
- 平均主题切换时间: ${report.performance.averageSwitchTime.toFixed(2)}ms
- 平均动画渲染时间: ${report.performance.averageAnimationTime.toFixed(2)}ms
- 平均内存使用: ${report.performance.averageMemoryUsage.toFixed(2)}MB
- 平均首次渲染时间: ${report.performance.averageFirstPaintTime.toFixed(2)}ms

一致性统计:
- 平均对比度: ${report.consistency.averageContrastRatio.toFixed(2)}
- 平均和谐度: ${(report.consistency.averageHarmonyScore * 100).toFixed(1)}%
- 平均可访问性: ${(report.consistency.averageAccessibilityScore * 100).toFixed(1)}%
- 平均样式一致性: ${(report.consistency.averageStyleConsistency * 100).toFixed(1)}%

违规记录: ${violations.length} 项
${violations.map(v => `- ${v.type}: ${v.severity}`).join('\n')}

报告生成时间: ${new Date().toLocaleString()}
    `.trim();
  }
}

// 创建默认监控配置
export const createDefaultMonitorConfig = (): MonitorConfig => ({
  enablePerformanceMonitoring: true,
  enableConsistencyCheck: true,
  enableAnomalyDetection: true,
  monitoringInterval: 30000, // 30秒
  performanceThresholds: {
    maxSwitchTime: 500, // 500ms
    maxAnimationTime: 300, // 300ms
    maxMemoryUsage: 50, // 50MB
    maxFirstPaintTime: 100, // 100ms
  },
  consistencyThresholds: {
    minContrastRatio: 4.5,
    minHarmonyScore: 0.6,
    minAccessibilityScore: 0.7,
    minStyleConsistency: 0.7,
  },
  anomalyDetection: {
    windowSize: 100,
    anomalyThreshold: 2.0,
    minDataPoints: 10,
  },
});

// 创建主题监控实例
export const themeMonitor = new ThemeMonitor(createDefaultMonitorConfig());

// Classes are already exported individually above

