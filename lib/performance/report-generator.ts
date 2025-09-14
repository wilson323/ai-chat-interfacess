/**
 * 性能报告生成器
 * 自动生成详细的性能分析报告
 */

import { enhancedMonitor, type PerformanceSummary, type PerformanceAlert, type PerformanceOptimization } from './enhanced-monitor';
import { performanceBenchmark, type BenchmarkResult } from './benchmark';

export interface PerformanceReport {
  id: string;
  title: string;
  generatedAt: number;
  period: {
    start: number;
    end: number;
  };
  summary: ReportSummary;
  sections: ReportSection[];
  metadata: ReportMetadata;
}

export interface ReportSummary {
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  keyMetrics: {
    pageLoadTime: number;
    apiResponseTime: number;
    errorRate: number;
    memoryUsage: number;
  };
  trends: {
    performance: 'improving' | 'stable' | 'degrading';
    errors: 'increasing' | 'stable' | 'decreasing';
    userSatisfaction: 'improving' | 'stable' | 'degrading';
  };
  recommendations: string[];
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'overview' | 'metrics' | 'alerts' | 'optimizations' | 'benchmark' | 'mobile';
  content: SectionContent;
  priority: number;
}

export interface SectionContent {
  text: string;
  data?: any;
  charts?: ChartData[];
  tables?: TableData[];
  insights?: string[];
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: any[];
  description: string;
}

export interface TableData {
  title: string;
  headers: string[];
  rows: any[][];
  description: string;
}

export interface ReportMetadata {
  generatedBy: string;
  version: string;
  environment: string;
  deviceInfo: {
    userAgent: string;
    screenResolution: string;
    pixelRatio: number;
  };
  reportDuration: number;
}

export interface ReportConfig {
  includeCharts: boolean;
  includeTables: boolean;
  includeInsights: boolean;
  includeRecommendations: boolean;
  format: 'html' | 'json' | 'markdown';
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d';
}

export class PerformanceReportGenerator {
  private config: ReportConfig;

  constructor(config?: Partial<ReportConfig>) {
    this.config = this.getDefaultConfig();
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  private getDefaultConfig(): ReportConfig {
    return {
      includeCharts: true,
      includeTables: true,
      includeInsights: true,
      includeRecommendations: true,
      format: 'html',
      timeRange: '24h',
    };
  }

  public async generateReport(title?: string): Promise<PerformanceReport> {
    const startTime = Date.now();

    // 收集数据
    const summary = enhancedMonitor.getEnhancedSummary();
    const alerts = enhancedMonitor.getAlerts();
    const optimizations = enhancedMonitor.getOptimizations();
    const benchmarkResults = performanceBenchmark.getResults();
    const history = enhancedMonitor.getHistory();

    // 计算时间范围
    const timeRange = this.calculateTimeRange();
    const filteredHistory = this.filterHistoryByTimeRange(history, timeRange);

    // 生成报告内容
    const reportSummary = this.generateSummary(summary, filteredHistory, alerts);
    const sections = await this.generateSections(summary, filteredHistory, alerts, optimizations, benchmarkResults);

    const report: PerformanceReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title || `性能分析报告 - ${new Date().toLocaleDateString()}`,
      generatedAt: Date.now(),
      period: timeRange,
      summary: reportSummary,
      sections,
      metadata: {
        generatedBy: 'NeuroGlass AI Performance Monitor',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        deviceInfo: this.getDeviceInfo(),
        reportDuration: Date.now() - startTime,
      },
    };

    return report;
  }

  private calculateTimeRange() {
    const end = Date.now();
    const ranges = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };

    return {
      start: end - ranges[this.config.timeRange],
      end,
    };
  }

  private filterHistoryByTimeRange(history: any[], timeRange: { start: number; end: number }) {
    return history.filter(record =>
      record.timestamp >= timeRange.start && record.timestamp <= timeRange.end
    );
  }

  private generateSummary(
    summary: PerformanceSummary,
    history: any[],
    alerts: PerformanceAlert[]
  ): ReportSummary {
    const overallScore = this.calculateOverallScore(summary);
    const grade = this.calculateGrade(overallScore);

    const activeAlerts = alerts.filter(alert => !alert.resolved);
    const errorRate = activeAlerts.length / Math.max(1, history.length);

    return {
      overallScore,
      grade,
      keyMetrics: {
        pageLoadTime: summary.pageLoadTime,
        apiResponseTime: summary.averageApiResponseTime,
        errorRate,
        memoryUsage: summary.memoryUsage,
      },
      trends: {
        performance: summary.trend,
        errors: errorRate > 0.1 ? 'increasing' : errorRate > 0.05 ? 'stable' : 'decreasing',
        userSatisfaction: overallScore > 80 ? 'improving' : overallScore > 60 ? 'stable' : 'degrading',
      },
      recommendations: this.generateKeyRecommendations(summary, alerts),
    };
  }

  private calculateOverallScore(summary: PerformanceSummary): number {
    const metrics = [
      { value: summary.pageLoadTime, max: 5000, weight: 0.3, inverse: true },
      { value: summary.averageApiResponseTime, max: 2000, weight: 0.25, inverse: true },
      { value: summary.firstContentfulPaint, max: 3000, weight: 0.2, inverse: true },
      { value: summary.largestContentfulPaint, max: 4000, weight: 0.15, inverse: true },
      { value: summary.cumulativeLayoutShift, max: 0.25, weight: 0.1, inverse: true },
    ];

    let totalScore = 0;
    let totalWeight = 0;

    metrics.forEach(metric => {
      const score = metric.inverse
        ? Math.max(0, 100 - (metric.value / metric.max) * 100)
        : Math.min(100, (metric.value / metric.max) * 100);
      totalScore += score * metric.weight;
      totalWeight += metric.weight;
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private generateKeyRecommendations(summary: PerformanceSummary, alerts: PerformanceAlert[]): string[] {
    const recommendations: string[] = [];

    if (summary.pageLoadTime > 3000) {
      recommendations.push('优化页面加载时间，建议检查资源大小和加载顺序');
    }

    if (summary.averageApiResponseTime > 1000) {
      recommendations.push('API响应时间过长，建议优化后端性能和缓存策略');
    }

    if (summary.memoryUsage > 100 * 1024 * 1024) {
      recommendations.push('内存使用较高，建议检查内存泄漏和优化数据结构');
    }

    if (summary.cumulativeLayoutShift > 0.1) {
      recommendations.push('布局偏移较大，建议优化图片尺寸和动态内容加载');
    }

    const criticalAlerts = alerts.filter(alert => alert.type === 'critical' && !alert.resolved);
    if (criticalAlerts.length > 0) {
      recommendations.push(`发现 ${criticalAlerts.length} 个严重告警，需要立即处理`);
    }

    if (recommendations.length === 0) {
      recommendations.push('性能表现良好，继续保持当前优化策略');
    }

    return recommendations;
  }

  private async generateSections(
    summary: PerformanceSummary,
    history: any[],
    alerts: PerformanceAlert[],
    optimizations: PerformanceOptimization[],
    benchmarkResults: BenchmarkResult[]
  ): Promise<ReportSection[]> {
    const sections: ReportSection[] = [];

    // 概览部分
    sections.push({
      id: 'overview',
      title: '性能概览',
      type: 'overview',
      content: await this.generateOverviewContent(summary, history),
      priority: 1,
    });

    // 关键指标部分
    sections.push({
      id: 'metrics',
      title: '关键性能指标',
      type: 'metrics',
      content: await this.generateMetricsContent(summary, history),
      priority: 2,
    });

    // 告警分析部分
    if (alerts.length > 0) {
      sections.push({
        id: 'alerts',
        title: '告警分析',
        type: 'alerts',
        content: await this.generateAlertsContent(alerts),
        priority: 3,
      });
    }

    // 优化建议部分
    if (optimizations.length > 0) {
      sections.push({
        id: 'optimizations',
        title: '优化建议',
        type: 'optimizations',
        content: await this.generateOptimizationsContent(optimizations),
        priority: 4,
      });
    }

    // 基准测试部分
    if (benchmarkResults.length > 0) {
      sections.push({
        id: 'benchmark',
        title: '基准测试结果',
        type: 'benchmark',
        content: await this.generateBenchmarkContent(benchmarkResults),
        priority: 5,
      });
    }

    // 移动端性能部分
    if (summary.isMobile) {
      sections.push({
        id: 'mobile',
        title: '移动端性能',
        type: 'mobile',
        content: await this.generateMobileContent(summary),
        priority: 6,
      });
    }

    return sections.sort((a, b) => a.priority - b.priority);
  }

  private async generateOverviewContent(summary: PerformanceSummary, history: any[]): Promise<SectionContent> {
    const content: SectionContent = {
      text: this.generateOverviewText(summary, history),
    };

    if (this.config.includeCharts) {
      content.charts = [
        {
          type: 'line',
          title: '性能趋势',
          data: this.preparePerformanceTrendData(history),
          description: '过去24小时性能指标变化趋势',
        },
        {
          type: 'pie',
          title: '性能分布',
          data: this.preparePerformanceDistributionData(summary),
          description: '各性能指标占比分布',
        },
      ];
    }

    if (this.config.includeInsights) {
      content.insights = this.generateOverviewInsights(summary, history);
    }

    return content;
  }

  private async generateMetricsContent(summary: PerformanceSummary, history: any[]): Promise<SectionContent> {
    const content: SectionContent = {
      text: this.generateMetricsText(summary),
    };

    if (this.config.includeCharts) {
      content.charts = [
        {
          type: 'bar',
          title: 'Web Vitals 指标',
          data: this.prepareWebVitalsData(summary),
          description: '核心Web性能指标对比',
        },
        {
          type: 'line',
          title: '资源使用趋势',
          data: this.prepareResourceUsageData(history),
          description: '内存和CPU使用趋势',
        },
      ];
    }

    if (this.config.includeTables) {
      content.tables = [
        {
          title: '详细性能指标',
          headers: ['指标', '当前值', '目标值', '状态', '改进建议'],
          rows: this.prepareMetricsTableData(summary),
          description: '详细的性能指标数据和分析',
        },
      ];
    }

    return content;
  }

  private async generateAlertsContent(alerts: PerformanceAlert[]): Promise<SectionContent> {
    const content: SectionContent = {
      text: this.generateAlertsText(alerts),
    };

    if (this.config.includeCharts) {
      content.charts = [
        {
          type: 'bar',
          title: '告警分布',
          data: this.prepareAlertsDistributionData(alerts),
          description: '按类型和严重程度分布的告警统计',
        },
      ];
    }

    if (this.config.includeTables) {
      content.tables = [
        {
          title: '告警详情',
          headers: ['时间', '类型', '指标', '数值', '阈值', '状态', '描述'],
          rows: this.prepareAlertsTableData(alerts),
          description: '详细的告警记录和处理状态',
        },
      ];
    }

    return content;
  }

  private async generateOptimizationsContent(optimizations: PerformanceOptimization[]): Promise<SectionContent> {
    const content: SectionContent = {
      text: this.generateOptimizationsText(optimizations),
    };

    if (this.config.includeTables) {
      content.tables = [
        {
          title: '优化建议列表',
          headers: ['优先级', '影响程度', '实现难度', '预计改进', '分类', '建议'],
          rows: this.prepareOptimizationsTableData(optimizations),
          description: '按优先级排序的性能优化建议',
        },
      ];
    }

    return content;
  }

  private async generateBenchmarkContent(benchmarkResults: BenchmarkResult[]): Promise<SectionContent> {
    const content: SectionContent = {
      text: this.generateBenchmarkText(benchmarkResults),
    };

    if (this.config.includeCharts) {
      content.charts = [
        {
          type: 'bar',
          title: '基准测试结果',
          data: this.prepareBenchmarkChartData(benchmarkResults),
          description: '各项基准测试的得分和等级',
        },
      ];
    }

    if (this.config.includeTables) {
      content.tables = [
        {
          title: '基准测试详情',
          headers: ['测试项目', '分类', '耗时', '评分', '等级', '状态'],
          rows: this.prepareBenchmarkTableData(benchmarkResults),
          description: '详细的基准测试结果和分析',
        },
      ];
    }

    return content;
  }

  private async generateMobileContent(summary: PerformanceSummary): Promise<SectionContent> {
    const content: SectionContent = {
      text: this.generateMobileText(summary),
    };

    if (this.config.includeCharts) {
      content.charts = [
        {
          type: 'radar',
          title: '移动端性能雷达图',
          data: this.prepareMobileRadarData(summary),
          description: '移动端专项性能指标分析',
        },
      ];
    }

    return content;
  }

  // 文本生成方法
  private generateOverviewText(summary: PerformanceSummary, history: any[]): string {
    const overallScore = this.calculateOverallScore(summary);
    const grade = this.calculateGrade(overallScore);
    const timeRange = this.getTimeRangeText();

    let text = `## 性能概览

本报告基于 ${timeRange} 的性能监控数据生成，涵盖页面加载、API响应、用户体验等关键指标。

### 总体评估

当前系统性能评分为 ${Math.round(overallScore)} 分，评级为 ${grade} 级。`;

    if (summary.trend === 'improving') {
      text += '\n性能呈现改善趋势，各项指标均有优化。';
    } else if (summary.trend === 'degrading') {
      text += '\n性能呈现下降趋势，需要重点关注和优化。';
    } else {
      text += '\n性能保持稳定，建议持续监控。';
    }

    text += `\n\n### 关键发现

- **页面加载时间**: ${Math.round(summary.pageLoadTime)}ms${summary.pageLoadTime > 3000 ? ' (需优化)' : ' (良好)'}
- **API响应时间**: ${Math.round(summary.averageApiResponseTime)}ms${summary.averageApiResponseTime > 1000 ? ' (需优化)' : ' (良好)'}
- **内存使用**: ${(summary.memoryUsage / 1024 / 1024).toFixed(1)}MB${summary.memoryUsage > 100 * 1024 * 1024 ? ' (较高)' : ' (正常)'}
- **错误率**: ${((summary.errorCount / Math.max(1, history.length)) * 100).toFixed(1)}%${summary.errorCount > 0 ? ' (存在问题)' : ' (正常)'}

### 分析时段

数据收集时间范围：${new Date(history[0]?.timestamp || Date.now()).toLocaleString()} 至 ${new Date(history[history.length - 1]?.timestamp || Date.now()).toLocaleString()}
数据点数量：${history.length} 个`;

    return text;
  }

  private generateMetricsText(summary: PerformanceSummary): string {
    let text = '## 关键性能指标\n\n';

    text += '### Web Vitals 指标\n\n';
    text += `- **首次内容绘制 (FCP)**: ${Math.round(summary.firstContentfulPaint)}ms\n`;
    text += `- **最大内容绘制 (LCP)**: ${Math.round(summary.largestContentfulPaint)}ms\n`;
    text += `- **首次输入延迟 (FID)**: ${Math.round(summary.firstInputDelay)}ms\n`;
    text += `- **累积布局偏移 (CLS)**: ${summary.cumulativeLayoutShift.toFixed(3)}\n\n`;

    text += '### 资源使用指标\n\n';
    text += `- **内存使用**: ${(summary.memoryUsage / 1024 / 1024).toFixed(1)}MB\n`;
    text += `- **网络请求数**: ${summary.networkRequests}\n`;
    text += `- **可交互时间 (TTI)**: ${Math.round(summary.timeToInteractive)}ms\n`;
    text += `- **总阻塞时间 (TBT)**: ${Math.round(summary.totalBlockingTime)}ms\n\n`;

    if (summary.isMobile) {
      text += '### 移动端指标\n\n';
      text += `- **触摸响应时间**: ${Math.round(summary.touchResponseTime)}ms\n`;
      text += `- **设备类型**: ${summary.batteryLevel !== undefined ? '移动设备' : '桌面设备'}\n`;
      if (summary.batteryLevel !== undefined) {
        text += `- **电池电量**: ${summary.batteryLevel}%\n`;
      }
      if (summary.networkType) {
        text += `- **网络类型**: ${summary.networkType}\n`;
      }
      text += '\n';
    }

    return text;
  }

  private generateAlertsText(alerts: PerformanceAlert[]): string {
    const activeAlerts = alerts.filter(alert => !alert.resolved);
    const criticalAlerts = activeAlerts.filter(alert => alert.type === 'critical');

    let text = '## 告警分析\n\n';

    text += `### 告警统计\n\n`;
    text += `- **总告警数**: ${alerts.length}\n`;
    text += `- **活跃告警**: ${activeAlerts.length}\n`;
    text += `- **严重告警**: ${criticalAlerts.length}\n`;
    text += `- **已解决告警**: ${alerts.filter(alert => alert.resolved).length}\n\n`;

    if (criticalAlerts.length > 0) {
      text += '### 严重告警详情\n\n';
      criticalAlerts.forEach(alert => {
        text += `- **${alert.metric}**: ${alert.message}\n`;
        text += `  - 数值: ${alert.value}\n`;
        text += `  - 阈值: ${alert.threshold}\n`;
        text += `  - 时间: ${new Date(alert.timestamp).toLocaleString()}\n\n`;
      });
    }

    return text;
  }

  private generateOptimizationsText(optimizations: PerformanceOptimization[]): string {
    const highImpact = optimizations.filter(opt => opt.impact === 'high');
    const easyToImplement = optimizations.filter(opt => opt.difficulty === 'easy');

    let text = '## 优化建议\n\n';

    text += `### 优化统计\n\n`;
    text += `- **总建议数**: ${optimizations.length}\n`;
    text += `- **高影响建议**: ${highImpact.length}\n`;
    text += `- **易实现建议**: ${easyToImplement.length}\n\n`;

    if (highImpact.length > 0) {
      text += '### 高优先级建议\n\n';
      highImpact.slice(0, 5).forEach(opt => {
        text += `- **${opt.title}**\n`;
        text += `  - 影响: ${opt.impact}\n`;
        text += `  - 难度: ${opt.difficulty}\n`;
        text += `  - 预计改进: ${opt.estimatedImprovement}\n`;
        text += `  - 建议: ${opt.description}\n\n`;
      });
    }

    return text;
  }

  private generateBenchmarkText(benchmarkResults: BenchmarkResult[]): string {
    const successful = benchmarkResults.filter(r => r.success);
    const averageScore = successful.length > 0
      ? successful.reduce((sum, r) => sum + r.metrics.score, 0) / successful.length
      : 0;

    let text = '## 基准测试结果\n\n';

    text += `### 测试概览\n\n`;
    text += `- **总测试数**: ${benchmarkResults.length}\n`;
    text += `- **成功测试**: ${successful.length}\n`;
    text += `- **平均评分**: ${Math.round(averageScore)}\n\n`;

    const byCategory = successful.reduce((acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = [];
      }
      acc[result.category].push(result);
      return acc;
    }, {} as Record<string, BenchmarkResult[]>);

    Object.entries(byCategory).forEach(([category, results]) => {
      const avgScore = results.reduce((sum, r) => sum + r.metrics.score, 0) / results.length;
      text += `### ${this.getCategoryName(category)}\n\n`;
      text += `- **测试数量**: ${results.length}\n`;
      text += `- **平均评分**: ${Math.round(avgScore)}\n`;
      text += `- **平均耗时**: ${Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length)}ms\n\n`;
    });

    return text;
  }

  private generateMobileText(summary: PerformanceSummary): string {
    let text = '## 移动端性能分析\n\n';

    if (!summary.isMobile) {
      text += '当前设备为桌面设备，移动端性能分析不适用。\n';
      return text;
    }

    text += '### 移动端专项指标\n\n';
    text += `- **触摸响应时间**: ${Math.round(summary.touchResponseTime)}ms\n`;
    text += `- **设备型号**: ${navigator.userAgent.split(' ')[0]}\n`;
    text += `- **屏幕分辨率**: ${window.screen.width}x${window.screen.height}\n`;
    text += `- **设备像素比**: ${window.devicePixelRatio}x\n`;

    if (summary.batteryLevel !== undefined) {
      text += `- **电池电量**: ${summary.batteryLevel}%\n`;
    }
    if (summary.networkType) {
      text += `- **网络类型**: ${summary.networkType}\n`;
    }

    text += '\n### 移动端优化建议\n\n';
    text += '- 优化触摸响应和手势识别\n';
    text += '- 减少移动端数据使用量\n';
    text += '- 优化电池使用效率\n';
    text += '- 适配不同屏幕尺寸\n';

    return text;
  }

  // 洞察生成方法
  private generateOverviewInsights(summary: PerformanceSummary, history: any[]): string[] {
    const insights: string[] = [];

    if (summary.pageLoadTime > 3000) {
      insights.push('页面加载时间超过3秒，建议优化资源加载顺序和大小');
    }

    if (summary.averageApiResponseTime > 1000) {
      insights.push('API响应时间超过1秒，建议检查后端性能和网络延迟');
    }

    if (summary.memoryUsage > 100 * 1024 * 1024) {
      insights.push('内存使用超过100MB，建议检查内存泄漏和优化数据结构');
    }

    if (summary.cumulativeLayoutShift > 0.1) {
      insights.push('布局偏移较大，建议优化图片尺寸和动态内容加载');
    }

    if (summary.trend === 'improving') {
      insights.push('性能趋势良好，当前的优化策略有效果');
    } else if (summary.trend === 'degrading') {
      insights.push('性能呈下降趋势，需要立即关注和优化');
    }

    return insights;
  }

  // 数据准备方法
  private preparePerformanceTrendData(history: any[]): any[] {
    return history.slice(-20).map(record => ({
      time: new Date(record.timestamp).toLocaleTimeString(),
      pageLoad: record.summary.pageLoadTime,
      apiResponse: record.summary.averageApiResponseTime,
      memory: record.summary.memoryUsage / 1024 / 1024,
    }));
  }

  private preparePerformanceDistributionData(summary: PerformanceSummary): any[] {
    return [
      { name: '页面加载', value: summary.pageLoadTime },
      { name: 'API响应', value: summary.averageApiResponseTime },
      { name: '内存使用', value: summary.memoryUsage / 1024 / 1024 },
    ];
  }

  private prepareWebVitalsData(summary: PerformanceSummary): any[] {
    return [
      { name: 'FCP', value: summary.firstContentfulPaint },
      { name: 'LCP', value: summary.largestContentfulPaint },
      { name: 'FID', value: summary.firstInputDelay },
      { name: 'CLS', value: summary.cumulativeLayoutShift * 1000 },
    ];
  }

  private prepareResourceUsageData(history: any[]): any[] {
    return history.slice(-20).map(record => ({
      time: new Date(record.timestamp).toLocaleTimeString(),
      memory: record.summary.memoryUsage / 1024 / 1024,
    }));
  }

  private prepareMetricsTableData(summary: PerformanceSummary): any[][] {
    return [
      ['页面加载时间', `${Math.round(summary.pageLoadTime)}ms`, '< 2000ms',
       summary.pageLoadTime < 2000 ? '✅ 良好' : '❌ 需优化', '优化资源加载'],
      ['API响应时间', `${Math.round(summary.averageApiResponseTime)}ms`, '< 500ms',
       summary.averageApiResponseTime < 500 ? '✅ 良好' : '❌ 需优化', '优化后端性能'],
      ['内存使用', `${(summary.memoryUsage / 1024 / 1024).toFixed(1)}MB`, '< 100MB',
       summary.memoryUsage < 100 * 1024 * 1024 ? '✅ 良好' : '❌ 需优化', '检查内存泄漏'],
      ['FCP', `${Math.round(summary.firstContentfulPaint)}ms`, '< 1800ms',
       summary.firstContentfulPaint < 1800 ? '✅ 良好' : '❌ 需优化', '优化首屏渲染'],
      ['LCP', `${Math.round(summary.largestContentfulPaint)}ms`, '< 2500ms',
       summary.largestContentfulPaint < 2500 ? '✅ 良好' : '❌ 需优化', '优化关键资源加载'],
    ];
  }

  private prepareAlertsDistributionData(alerts: PerformanceAlert[]): any[] {
    const distribution = { warning: 0, error: 0, critical: 0 };
    alerts.forEach(alert => {
      distribution[alert.type]++;
    });

    return [
      { name: '警告', value: distribution.warning },
      { name: '错误', value: distribution.error },
      { name: '严重', value: distribution.critical },
    ];
  }

  private prepareAlertsTableData(alerts: PerformanceAlert[]): any[][] {
    return alerts.slice(-10).map(alert => [
      new Date(alert.timestamp).toLocaleString(),
      alert.type,
      alert.metric,
      alert.value.toString(),
      alert.threshold.toString(),
      alert.resolved ? '已解决' : '活跃',
      alert.message,
    ]);
  }

  private prepareOptimizationsTableData(optimizations: PerformanceOptimization[]): any[][] {
    return optimizations.slice(-10).map(opt => [
      opt.impact === 'high' && opt.difficulty === 'easy' ? '🔥 高' :
      opt.impact === 'high' ? '📈 中' : '📊 低',
      opt.impact === 'high' ? '高' : opt.impact === 'medium' ? '中' : '低',
      opt.difficulty === 'easy' ? '简单' : opt.difficulty === 'medium' ? '中等' : '困难',
      opt.estimatedImprovement,
      opt.category,
      opt.title,
    ]);
  }

  private prepareBenchmarkChartData(benchmarkResults: BenchmarkResult[]): any[] {
    const byCategory = benchmarkResults.reduce((acc, result) => {
      if (!result.success) return acc;
      if (!acc[result.category]) {
        acc[result.category] = { total: 0, count: 0 };
      }
      acc[result.category].total += result.metrics.score;
      acc[result.category].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return Object.entries(byCategory).map(([category, data]) => ({
      category: this.getCategoryName(category),
      score: Math.round(data.total / data.count),
    }));
  }

  private prepareBenchmarkTableData(benchmarkResults: BenchmarkResult[]): any[][] {
    return benchmarkResults.map(result => [
      result.name,
      this.getCategoryName(result.category),
      `${Math.round(result.duration)}ms`,
      Math.round(result.metrics.score).toString(),
      result.metrics.grade,
      result.success ? '✅ 成功' : '❌ 失败',
    ]);
  }

  private prepareMobileRadarData(summary: PerformanceSummary): any[] {
    return [
      { subject: '响应性', A: Math.min(100, 100 - (summary.touchResponseTime / 100) * 100), fullMark: 100 },
      { subject: '电池效率', A: summary.batteryLevel || 80, fullMark: 100 },
      { subject: '网络性能', A: summary.networkType === '4g' ? 90 : summary.networkType === '3g' ? 60 : 30, fullMark: 100 },
      { subject: '用户体验', A: Math.min(100, 100 - (summary.firstInputDelay / 300) * 100), fullMark: 100 },
    ];
  }

  // 辅助方法
  private getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      pixelRatio: window.devicePixelRatio || 1,
    };
  }

  private getTimeRangeText(): string {
    const ranges = {
      '1h': '1小时',
      '6h': '6小时',
      '24h': '24小时',
      '7d': '7天',
      '30d': '30天',
    };
    return ranges[this.config.timeRange];
  }

  private getCategoryName(category: string): string {
    const names: Record<string, string> = {
      'page-load': '页面加载',
      'api': 'API性能',
      'render': '渲染性能',
      'memory': '内存使用',
      'network': '网络性能',
    };
    return names[category] || category;
  }

  // 导出方法
  public async exportToHTML(report: PerformanceReport): Promise<string> {
    let html = this.generateHTMLHeader(report);

    report.sections.forEach(section => {
      html += this.generateHTMLSection(section);
    });

    html += this.generateHTMLFooter(report);

    return html;
  }

  public async exportToJSON(report: PerformanceReport): Promise<string> {
    return JSON.stringify(report, null, 2);
  }

  public async exportToMarkdown(report: PerformanceReport): Promise<string> {
    let markdown = `# ${report.title}\n\n`;
    markdown += `生成时间: ${new Date(report.generatedAt).toLocaleString()}\n`;
    markdown += `分析时段: ${new Date(report.period.start).toLocaleString()} - ${new Date(report.period.end).toLocaleString()}\n\n`;

    markdown += `## 总体评估\n\n`;
    markdown += `**总体评分**: ${report.summary.overallScore} 分 (${report.summary.grade} 级)\n\n`;

    report.sections.forEach(section => {
      markdown += `## ${section.title}\n\n`;
      markdown += `${section.content.text}\n\n`;
    });

    return markdown;
  }

  private generateHTMLHeader(report: PerformanceReport): string {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px; }
        h2 { color: #444; margin-top: 30px; border-left: 4px solid #007bff; padding-left: 15px; }
        h3 { color: #555; margin-top: 25px; }
        .summary { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .metric { display: inline-block; margin: 10px; padding: 15px; background: white; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .metric-value { font-size: 24px; font-weight: bold; color: #007bff; }
        .metric-label { font-size: 14px; color: #666; }
        .grade-A { color: #28a745; font-weight: bold; }
        .grade-B { color: #17a2b8; font-weight: bold; }
        .grade-C { color: #ffc107; font-weight: bold; }
        .grade-D { color: #fd7e14; font-weight: bold; }
        .grade-F { color: #dc3545; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .recommendations { background: #e7f3ff; padding: 20px; border-radius: 5px; border-left: 4px solid #007bff; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${report.title}</h1>
        <div class="summary">
            <h2>总体评估</h2>
            <div class="metric">
                <div class="metric-value grade-${report.summary.grade}">${report.summary.overallScore}</div>
                <div class="metric-label">总体评分 (${report.summary.grade} 级)</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.keyMetrics.pageLoadTime}ms</div>
                <div class="metric-label">页面加载时间</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.keyMetrics.apiResponseTime}ms</div>
                <div class="metric-label">API响应时间</div>
            </div>
            <div class="metric">
                <div class="metric-value">${(report.summary.keyMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
                <div class="metric-label">内存使用</div>
            </div>
        </div>
`;
  }

  private generateHTMLSection(section: ReportSection): string {
    let html = `<section id="${section.id}">
        <h2>${section.title}</h2>
        <div>${section.content.text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>
`;

    if (section.content.tables) {
      section.content.tables.forEach(table => {
        html += `<h3>${table.title}</h3>`;
        html += '<table><thead><tr>';
        table.headers.forEach(header => {
          html += `<th>${header}</th>`;
        });
        html += '</tr></thead><tbody>';
        table.rows.forEach(row => {
          html += '<tr>';
          row.forEach(cell => {
            html += `<td>${cell}</td>`;
          });
          html += '</tr>';
        });
        html += '</tbody></table>';
      });
    }

    html += '</section>';
    return html;
  }

  private generateHTMLFooter(report: PerformanceReport): string {
    return `
        <div class="recommendations">
            <h2>关键建议</h2>
            <ul>
                ${report.summary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
        <div class="footer">
            <p>报告生成时间: ${new Date(report.generatedAt).toLocaleString()}</p>
            <p>生成工具: ${report.metadata.generatedBy} v${report.metadata.version}</p>
            <p>分析时段: ${new Date(report.period.start).toLocaleString()} - ${new Date(report.period.end).toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;
  }
}

// 创建全局实例
export const performanceReportGenerator = new PerformanceReportGenerator();

// 导出类型和实例
export type {
  PerformanceReport,
  ReportSummary,
  ReportSection,
  SectionContent,
  ChartData,
  TableData,
  ReportMetadata,
  ReportConfig,
};
export { PerformanceReportGenerator };