/**
 * A/B测试性能对比功能
 * 支持不同版本的性能对比和分析
 */

export interface ABTest {
  id: string;
  name: string;
  description: string;
  versions: ABTestVersion[];
  status: 'active' | 'paused' | 'completed';
  createdAt: number;
  updatedAt: number;
  targetAudience: number; // 0-1, 目标受众比例
  config: ABTestConfig;
}

export interface ABTestVersion {
  id: string;
  name: string;
  description: string;
  trafficAllocation: number; // 0-1, 流量分配比例
  isActive: boolean;
  metrics: ABTestMetrics[];
  createdAt: number;
}

export interface ABTestMetrics {
  timestamp: number;
  sampleSize: number;
  conversionRate: number;
  averagePageLoadTime: number;
  averageApiResponseTime: number;
  bounceRate: number;
  sessionDuration: number;
  errorRate: number;
  userSatisfaction: number;
  customMetrics: Record<string, number>;
}

export interface ABTestConfig {
  duration: number; // 测试持续时间（毫秒）
  minimumSampleSize: number;
  significanceLevel: number; // 0-1, 显著性水平
  metrics: string[];
  successCriteria: {
    primary: string;
    secondary: string[];
  };
  autoStop: {
    enabled: boolean;
    confidenceThreshold: number; // 0-1
    minimumDuration: number;
  };
}

export interface ABTestResult {
  testId: string;
  winner: string | null; // version id
  confidence: number; // 0-1
  improvement: number; // percentage
  significance: boolean;
  primaryMetric: string;
  results: Record<string, ABTestVersionResult>;
  generatedAt: number;
}

export interface ABTestVersionResult {
  versionId: string;
  metrics: {
    [key: string]: {
      value: number;
      change: number;
      significance: boolean;
      confidence: number;
    };
  };
  sampleSize: number;
  conversionRate: number;
  uplift: number;
}

export class ABTestingManager {
  private tests: Map<string, ABTest> = new Map();
  private userAssignments: Map<string, string> = new Map(); // userId -> versionId
  private metrics: Map<string, ABTestMetrics[]> = new Map(); // versionId -> metrics
  private results: Map<string, ABTestResult> = new Map();

  constructor() {
    this.initializeFromStorage();
  }

  private initializeFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('ab_tests');
      if (stored) {
        const data = JSON.parse(stored);
        data.tests.forEach((test: ABTest) => {
          this.tests.set(test.id, test);
        });
      }

      const storedAssignments = localStorage.getItem('ab_user_assignments');
      if (storedAssignments) {
        this.userAssignments = new Map(JSON.parse(storedAssignments));
      }
    } catch (error) {
      console.warn('Failed to initialize A/B tests from storage:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = {
        tests: Array.from(this.tests.values()),
      };
      localStorage.setItem('ab_tests', JSON.stringify(data));
      localStorage.setItem('ab_user_assignments', JSON.stringify(Array.from(this.userAssignments.entries())));
    } catch (error) {
      console.warn('Failed to save A/B tests to storage:', error);
    }
  }

  // 创建A/B测试
  public createTest(testData: Omit<ABTest, 'id' | 'createdAt' | 'updatedAt'>): ABTest {
    const test: ABTest = {
      ...testData,
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // 验证版本配置
    const totalAllocation = testData.versions.reduce((sum, version) => sum + version.trafficAllocation, 0);
    if (Math.abs(totalAllocation - 1) > 0.001) {
      throw new Error('Version traffic allocations must sum to 1');
    }

    // 确保至少有一个版本是激活的
    const activeVersions = testData.versions.filter(v => v.isActive);
    if (activeVersions.length === 0) {
      throw new Error('At least one version must be active');
    }

    this.tests.set(test.id, test);
    this.saveToStorage();

    return test;
  }

  // 分配用户到测试版本
  public assignUser(testId: string, userId: string): string | null {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'active') {
      return null;
    }

    // 检查用户是否已经分配过
    const existingAssignment = this.userAssignments.get(`${testId}_${userId}`);
    if (existingAssignment) {
      return existingAssignment;
    }

    // 随机分配用户到版本
    const random = Math.random();
    let cumulative = 0;
    for (const version of test.versions) {
      cumulative += version.trafficAllocation;
      if (random <= cumulative) {
        this.userAssignments.set(`${testId}_${userId}`, version.id);
        this.saveToStorage();
        return version.id;
      }
    }

    // 兜底：分配到第一个版本
    const firstVersion = test.versions[0];
    this.userAssignments.set(`${testId}_${userId}`, firstVersion.id);
    this.saveToStorage();
    return firstVersion.id;
  }

  // 获取用户分配的版本
  public getUserVersion(testId: string, userId: string): string | null {
    return this.userAssignments.get(`${testId}_${userId}`) || null;
  }

  // 记录性能指标
  public recordMetrics(testId: string, versionId: string, metrics: Partial<ABTestMetrics>): void {
    const key = `${testId}_${versionId}`;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const fullMetrics: ABTestMetrics = {
      timestamp: Date.now(),
      sampleSize: 1,
      conversionRate: metrics.conversionRate || 0,
      averagePageLoadTime: metrics.averagePageLoadTime || 0,
      averageApiResponseTime: metrics.averageApiResponseTime || 0,
      bounceRate: metrics.bounceRate || 0,
      sessionDuration: metrics.sessionDuration || 0,
      errorRate: metrics.errorRate || 0,
      userSatisfaction: metrics.userSatisfaction || 0,
      customMetrics: metrics.customMetrics || {},
    };

    this.metrics.get(key)!.push(fullMetrics);
    this.analyzeTest(testId);
  }

  // 分析测试结果
  public analyzeTest(testId: string): ABTestResult | null {
    const test = this.tests.get(testId);
    if (!test) {
      return null;
    }

    const versionResults: Record<string, ABTestVersionResult> = {};

    // 计算每个版本的指标
    for (const version of test.versions) {
      const key = `${testId}_${version.id}`;
      const metrics = this.metrics.get(key) || [];

      const aggregated = this.aggregateMetrics(metrics);
      versionResults[version.id] = {
        versionId: version.id,
        metrics: aggregated,
        sampleSize: metrics.length,
        conversionRate: aggregated.conversionRate.value,
        uplift: 0, // 稍后计算
      };
    }

    // 计算相对于对照组的提升
    const controlVersion = test.versions.find(v => v.trafficAllocation > 0.5);
    if (controlVersion) {
      const controlMetrics = versionResults[controlVersion.id].metrics;
      const controlConversion = controlMetrics.conversionRate.value;

      Object.entries(versionResults).forEach(([versionId, result]) => {
        if (versionId !== controlVersion.id) {
          const versionConversion = result.metrics.conversionRate.value;
          const uplift = ((versionConversion - controlConversion) / controlConversion) * 100;
          versionResults[versionId].uplift = uplift;
        }
      });
    }

    // 确定胜者
    const winner = this.determineWinner(test, versionResults);
    const significance = this.checkSignificance(test, versionResults);

    const result: ABTestResult = {
      testId,
      winner: winner?.versionId || null,
      confidence: winner?.confidence || 0,
      improvement: winner?.improvement || 0,
      significance: significance.isSignificant,
      primaryMetric: test.config.successCriteria.primary,
      results: versionResults,
      generatedAt: Date.now(),
    };

    this.results.set(testId, result);
    this.saveToStorage();

    // 检查是否需要自动停止测试
    if (test.config.autoStop.enabled && this.shouldAutoStop(test, result)) {
      this.pauseTest(testId);
    }

    return result;
  }

  private aggregateMetrics(metrics: ABTestMetrics[]): Record<string, ABTestVersionResult['metrics']['string']> {
    if (metrics.length === 0) {
      return {
        conversionRate: { value: 0, change: 0, significance: false, confidence: 0 },
        averagePageLoadTime: { value: 0, change: 0, significance: false, confidence: 0 },
        averageApiResponseTime: { value: 0, change: 0, significance: false, confidence: 0 },
        bounceRate: { value: 0, change: 0, significance: false, confidence: 0 },
        sessionDuration: { value: 0, change: 0, significance: false, confidence: 0 },
        errorRate: { value: 0, change: 0, significance: false, confidence: 0 },
        userSatisfaction: { value: 0, change: 0, significance: false, confidence: 0 },
      };
    }

    const aggregated: Record<string, ABTestVersionResult['metrics']['string']> = {};

    // 转换率
    const totalConversions = metrics.reduce((sum, m) => sum + m.conversionRate * m.sampleSize, 0);
    const totalSamples = metrics.reduce((sum, m) => sum + m.sampleSize, 0);
    aggregated.conversionRate = {
      value: totalSamples > 0 ? totalConversions / totalSamples : 0,
      change: 0,
      significance: false,
      confidence: 0,
    };

    // 页面加载时间
    const totalPageLoadTime = metrics.reduce((sum, m) => sum + m.averagePageLoadTime * m.sampleSize, 0);
    aggregated.averagePageLoadTime = {
      value: totalSamples > 0 ? totalPageLoadTime / totalSamples : 0,
      change: 0,
      significance: false,
      confidence: 0,
    };

    // API响应时间
    const totalApiResponseTime = metrics.reduce((sum, m) => sum + m.averageApiResponseTime * m.sampleSize, 0);
    aggregated.averageApiResponseTime = {
      value: totalSamples > 0 ? totalApiResponseTime / totalSamples : 0,
      change: 0,
      significance: false,
      confidence: 0,
    };

    // 跳出率
    const totalBounceRate = metrics.reduce((sum, m) => sum + m.bounceRate * m.sampleSize, 0);
    aggregated.bounceRate = {
      value: totalSamples > 0 ? totalBounceRate / totalSamples : 0,
      change: 0,
      significance: false,
      confidence: 0,
    };

    // 会话时长
    const totalSessionDuration = metrics.reduce((sum, m) => sum + m.sessionDuration * m.sampleSize, 0);
    aggregated.sessionDuration = {
      value: totalSamples > 0 ? totalSessionDuration / totalSamples : 0,
      change: 0,
      significance: false,
      confidence: 0,
    };

    // 错误率
    const totalErrorRate = metrics.reduce((sum, m) => sum + m.errorRate * m.sampleSize, 0);
    aggregated.errorRate = {
      value: totalSamples > 0 ? totalErrorRate / totalSamples : 0,
      change: 0,
      significance: false,
      confidence: 0,
    };

    // 用户满意度
    const totalUserSatisfaction = metrics.reduce((sum, m) => sum + m.userSatisfaction * m.sampleSize, 0);
    aggregated.userSatisfaction = {
      value: totalSamples > 0 ? totalUserSatisfaction / totalSamples : 0,
      change: 0,
      significance: false,
      confidence: 0,
    };

    return aggregated;
  }

  private determineWinner(test: ABTest, results: Record<string, ABTestVersionResult>): { versionId: string; confidence: number; improvement: number } | null {
    const primaryMetric = test.config.successCriteria.primary;
    let bestVersion: { versionId: string; value: number; } | null = null;

    Object.entries(results).forEach(([versionId, result]) => {
      const value = result.metrics[primaryMetric]?.value || 0;

      // 对于某些指标，值越小越好（如页面加载时间）
      const isLowerBetter = ['averagePageLoadTime', 'averageApiResponseTime', 'bounceRate', 'errorRate'].includes(primaryMetric);
      const normalizedValue = isLowerBetter ? -value : value;

      if (!bestVersion || normalizedValue > (isLowerBetter ? -bestVersion.value : bestVersion.value)) {
        bestVersion = { versionId, value };
      }
    });

    if (!bestVersion) {
      return null;
    }

    // 计算置信度和改进幅度
    const winnerResult = results[bestVersion.versionId];
    const confidence = this.calculateConfidence(winnerResult);
    const improvement = this.calculateImprovement(test, results, bestVersion.versionId);

    return {
      versionId: bestVersion.versionId,
      confidence,
      improvement,
    };
  }

  private calculateConfidence(result: ABTestVersionResult): number {
    // 简化的置信度计算
    const sampleSize = result.sampleSize;
    const conversionRate = result.conversionRate;

    // 基于样本大小和转换率计算置信度
    const sampleScore = Math.min(1, sampleSize / test.config.minimumSampleSize);
    const metricScore = Math.max(0, Math.min(1, conversionRate));

    return (sampleScore + metricScore) / 2;
  }

  private calculateImprovement(test: ABTest, results: Record<string, ABTestVersionResult>, winnerId: string): number {
    const primaryMetric = test.config.successCriteria.primary;
    const winnerResult = results[winnerId];

    // 找到对照组（通常是流量分配最大的版本）
    const controlVersion = test.versions.reduce((prev, current) =>
      current.trafficAllocation > prev.trafficAllocation ? current : prev
    );

    if (controlVersion.id === winnerId) {
      return 0; // 胜者是对照组，没有改进
    }

    const controlResult = results[controlVersion.id];
    const winnerValue = winnerResult.metrics[primaryMetric]?.value || 0;
    const controlValue = controlResult.metrics[primaryMetric]?.value || 0;

    if (controlValue === 0) {
      return 0;
    }

    // 对于某些指标，值越小越好
    const isLowerBetter = ['averagePageLoadTime', 'averageApiResponseTime', 'bounceRate', 'errorRate'].includes(primaryMetric);
    const improvement = isLowerBetter
      ? ((controlValue - winnerValue) / controlValue) * 100
      : ((winnerValue - controlValue) / controlValue) * 100;

    return improvement;
  }

  private checkSignificance(test: ABTest, results: Record<string, ABTestVersionResult>): { isSignificant: boolean; pValue: number } {
    // 简化的显著性检验
    const primaryMetric = test.config.successCriteria.primary;
    const versionEntries = Object.entries(results);

    if (versionEntries.length < 2) {
      return { isSignificant: false, pValue: 1 };
    }

    // 计算版本间的差异
    const values = versionEntries.map(([_, result]) =>
      result.metrics[primaryMetric]?.value || 0
    );

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // 简化的p值计算
    const maxDiff = Math.max(...values) - Math.min(...values);
    const pValue = Math.max(0, 1 - (maxDiff / (stdDev + 0.001)));

    return {
      isSignificant: pValue < test.config.significanceLevel,
      pValue,
    };
  }

  private shouldAutoStop(test: ABTest, result: ABTestResult): boolean {
    if (!test.config.autoStop.enabled) {
      return false;
    }

    const testDuration = Date.now() - test.createdAt;
    const minimumDurationReached = testDuration >= test.config.autoStop.minimumDuration;
    const confidenceThresholdReached = result.confidence >= test.config.autoStop.confidenceThreshold;

    return minimumDurationReached && confidenceThresholdReached;
  }

  // 公共API方法
  public getTest(testId: string): ABTest | null {
    return this.tests.get(testId) || null;
  }

  public getAllTests(): ABTest[] {
    return Array.from(this.tests.values());
  }

  public getActiveTests(): ABTest[] {
    return Array.from(this.tests.values()).filter(test => test.status === 'active');
  }

  public getTestResult(testId: string): ABTestResult | null {
    return this.results.get(testId) || null;
  }

  public updateTest(testId: string, updates: Partial<ABTest>): ABTest | null {
    const test = this.tests.get(testId);
    if (!test) {
      return null;
    }

    const updatedTest = { ...test, ...updates, updatedAt: Date.now() };
    this.tests.set(testId, updatedTest);
    this.saveToStorage();

    return updatedTest;
  }

  public pauseTest(testId: string): ABTest | null {
    return this.updateTest(testId, { status: 'paused' });
  }

  public resumeTest(testId: string): ABTest | null {
    return this.updateTest(testId, { status: 'active' });
  }

  public completeTest(testId: string): ABTest | null {
    return this.updateTest(testId, { status: 'completed' });
  }

  public deleteTest(testId: string): boolean {
    const deleted = this.tests.delete(testId);
    if (deleted) {
      this.results.delete(testId);
      // 清理相关数据
      const keysToDelete = Array.from(this.userAssignments.keys()).filter(key => key.startsWith(`${testId}_`));
      keysToDelete.forEach(key => this.userAssignments.delete(key));

      const metricKeysToDelete = Array.from(this.metrics.keys()).filter(key => key.startsWith(`${testId}_`));
      metricKeysToDelete.forEach(key => this.metrics.delete(key));

      this.saveToStorage();
    }
    return deleted;
  }

  public getTestStatistics(testId: string): {
    totalUsers: number;
    versionDistribution: Record<string, number>;
    realTimeMetrics: Record<string, ABTestMetrics>;
  } | null {
    const test = this.tests.get(testId);
    if (!test) {
      return null;
    }

    const totalUsers = Array.from(this.userAssignments.keys()).filter(key => key.startsWith(`${testId}_`)).length;

    const versionDistribution: Record<string, number> = {};
    test.versions.forEach(version => {
      versionDistribution[version.id] = Array.from(this.userAssignments.values()).filter(v => v === version.id).length;
    });

    const realTimeMetrics: Record<string, ABTestMetrics> = {};
    test.versions.forEach(version => {
      const key = `${testId}_${version.id}`;
      const metrics = this.metrics.get(key) || [];
      if (metrics.length > 0) {
        realTimeMetrics[version.id] = metrics[metrics.length - 1]; // 最新指标
      }
    });

    return {
      totalUsers,
      versionDistribution,
      realTimeMetrics,
    };
  }

  public exportTestData(testId: string): string {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error('Test not found');
    }

    const result = this.results.get(testId);
    const statistics = this.getTestStatistics(testId);

    return JSON.stringify({
      test,
      result,
      statistics,
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  // 性能监控集成
  public recordPerformanceMetrics(testId: string, versionId: string, performanceData: any): void {
    const metrics: Partial<ABTestMetrics> = {
      averagePageLoadTime: performanceData.pageLoadTime,
      averageApiResponseTime: performanceData.averageApiResponseTime,
      errorRate: performanceData.errorRate || 0,
      sessionDuration: performanceData.sessionDuration || 0,
      bounceRate: performanceData.bounceRate || 0,
      conversionRate: performanceData.conversionRate || 0,
      userSatisfaction: performanceData.userSatisfaction || 0,
    };

    this.recordMetrics(testId, versionId, metrics);
  }
}

// 创建全局实例
export const abTestingManager = new ABTestingManager();

// 导出类型和实例
export type {
  ABTest,
  ABTestVersion,
  ABTestMetrics,
  ABTestConfig,
  ABTestResult,
  ABTestVersionResult,
};
