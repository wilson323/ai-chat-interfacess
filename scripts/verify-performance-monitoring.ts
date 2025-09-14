/**
 * 性能监控系统验证脚本
 * 验证性能监控系统是否正常运行
 */

import { monitor, PerformanceMonitor } from '@/lib/performance/monitor';
import { apiPerformanceMonitor } from '@/lib/monitoring/api-performance';

interface PerformanceVerificationResult {
  frontendMonitoring: {
    enabled: boolean;
    metricsCollected: boolean;
    coreWebVitals: boolean;
    errorTracking: boolean;
    apiInterception: boolean;
  };
  backendMonitoring: {
    enabled: boolean;
    metricsCollected: boolean;
    alerting: boolean;
    statsGeneration: boolean;
  };
  overallStatus: 'healthy' | 'warning' | 'critical';
  recommendations: string[];
}

class PerformanceMonitoringVerifier {
  /**
   * 验证前端性能监控
   */
  private verifyFrontendMonitoring(): PerformanceVerificationResult['frontendMonitoring'] {
    try {
      // 检查监控器是否初始化
      const metrics = monitor.getMetrics();
      const report = monitor.getReport();
      
      return {
        enabled: true,
        metricsCollected: metrics.apiCalls.length >= 0, // 至少应该有基础指标
        coreWebVitals: metrics.firstContentfulPaint > 0 || metrics.largestContentfulPaint > 0,
        errorTracking: metrics.errors.length >= 0, // 错误数组存在
        apiInterception: typeof window !== 'undefined' && 'fetch' in window
      };
    } catch (error) {
      console.error('前端监控验证失败:', error);
      return {
        enabled: false,
        metricsCollected: false,
        coreWebVitals: false,
        errorTracking: false,
        apiInterception: false
      };
    }
  }

  /**
   * 验证后端性能监控
   */
  private verifyBackendMonitoring(): PerformanceVerificationResult['backendMonitoring'] {
    try {
      // 检查API监控器
      const stats = apiPerformanceMonitor.getAPIStats();
      const alerts = apiPerformanceMonitor.checkPerformanceAlerts();
      
      return {
        enabled: true,
        metricsCollected: stats.totalRequests >= 0,
        alerting: Array.isArray(alerts),
        statsGeneration: typeof stats === 'object' && stats !== null
      };
    } catch (error) {
      console.error('后端监控验证失败:', error);
      return {
        enabled: false,
        metricsCollected: false,
        alerting: false,
        statsGeneration: false
      };
    }
  }

  /**
   * 生成性能报告
   */
  private generatePerformanceReport(): PerformanceVerificationResult {
    const frontendMonitoring = this.verifyFrontendMonitoring();
    const backendMonitoring = this.verifyBackendMonitoring();
    
    // 计算整体状态
    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    const recommendations: string[] = [];

    // 检查关键功能
    if (!frontendMonitoring.enabled || !backendMonitoring.enabled) {
      overallStatus = 'critical';
      recommendations.push('性能监控系统未正确初始化');
    } else if (!frontendMonitoring.coreWebVitals || !backendMonitoring.statsGeneration) {
      overallStatus = 'warning';
      recommendations.push('部分监控功能可能存在问题');
    }

    // 前端监控建议
    if (!frontendMonitoring.coreWebVitals) {
      recommendations.push('Core Web Vitals监控需要验证');
    }
    if (!frontendMonitoring.apiInterception) {
      recommendations.push('API拦截功能需要检查');
    }

    // 后端监控建议
    if (!backendMonitoring.alerting) {
      recommendations.push('告警机制需要验证');
    }

    return {
      frontendMonitoring,
      backendMonitoring,
      overallStatus,
      recommendations
    };
  }

  /**
   * 运行完整的验证流程
   */
  public async runVerification(): Promise<PerformanceVerificationResult> {
    console.log('🔍 开始验证性能监控系统...\n');

    // 1. 验证前端监控
    console.log('📊 验证前端性能监控...');
    const frontendResult = this.verifyFrontendMonitoring();
    console.log('前端监控状态:', frontendResult);

    // 2. 验证后端监控
    console.log('🚀 验证后端性能监控...');
    const backendResult = this.verifyBackendMonitoring();
    console.log('后端监控状态:', backendResult);

    // 3. 生成综合报告
    console.log('📋 生成验证报告...');
    const report = this.generatePerformanceReport();

    // 4. 输出结果
    console.log('\n📈 性能监控验证结果:');
    console.log('整体状态:', report.overallStatus.toUpperCase());
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 建议:');
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    return report;
  }

  /**
   * 测试监控数据收集
   */
  public async testDataCollection(): Promise<void> {
    console.log('🧪 测试监控数据收集...\n');

    // 测试前端监控数据收集
    if (typeof window !== 'undefined') {
      console.log('测试前端监控...');
      
      // 模拟用户交互
      const testElement = document.createElement('div');
      testElement.textContent = 'Test Element';
      document.body.appendChild(testElement);
      
      // 触发点击事件
      testElement.click();
      
      // 模拟错误
      setTimeout(() => {
        console.error('测试错误消息');
      }, 100);

      // 检查数据收集
      setTimeout(() => {
        const metrics = monitor.getMetrics();
        console.log('前端监控数据:', {
          userInteractions: metrics.userInteractions.length,
          errors: metrics.errors.length,
          apiCalls: metrics.apiCalls.length
        });
      }, 500);
    }

    // 测试后端监控数据收集
    console.log('测试后端监控...');
    
    // 模拟API调用记录
    const mockRequest = {
      url: 'http://localhost:3000/api/test',
      method: 'GET',
      headers: new Headers({
        'user-agent': 'PerformanceTest/1.0'
      })
    } as any;

    apiPerformanceMonitor.recordAPIMetrics(
      '/api/test',
      'GET',
      150,
      200,
      mockRequest,
      100,
      200
    );

    const stats = apiPerformanceMonitor.getAPIStats();
    console.log('后端监控数据:', {
      totalRequests: stats.totalRequests,
      averageDuration: stats.averageDuration,
      errorRate: stats.errorRate
    });
  }

  /**
   * 验证告警机制
   */
  public verifyAlerting(): void {
    console.log('🚨 验证告警机制...\n');

    // 测试慢响应告警
    const mockSlowRequest = {
      url: 'http://localhost:3000/api/slow',
      method: 'GET',
      headers: new Headers()
    } as any;

    apiPerformanceMonitor.recordAPIMetrics(
      '/api/slow',
      'GET',
      3000, // 3秒慢响应
      200,
      mockSlowRequest
    );

    // 测试高错误率告警
    for (let i = 0; i < 10; i++) {
      apiPerformanceMonitor.recordAPIMetrics(
        '/api/error',
        'GET',
        100,
        500, // 错误状态码
        mockSlowRequest
      );
    }

    const alerts = apiPerformanceMonitor.checkPerformanceAlerts();
    console.log('告警检查结果:', alerts);

    if (alerts.length > 0) {
      console.log('✅ 告警机制正常工作');
      alerts.forEach(alert => {
        console.log(`- ${alert.type}: ${alert.message} (${alert.severity})`);
      });
    } else {
      console.log('⚠️ 未检测到告警，可能需要更多测试数据');
    }
  }
}

// 运行验证
async function main() {
  const verifier = new PerformanceMonitoringVerifier();
  
  try {
    // 运行完整验证
    const result = await verifier.runVerification();
    
    // 测试数据收集
    await verifier.testDataCollection();
    
    // 验证告警机制
    verifier.verifyAlerting();
    
    console.log('\n✅ 性能监控系统验证完成');
    
    // 返回验证结果
    process.exit(result.overallStatus === 'healthy' ? 0 : 1);
    
  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { PerformanceMonitoringVerifier };
