/**
 * 测试性能监控工具
 * 监控测试执行时间和性能指标
 */

import { performance } from 'perf_hooks'

interface TestMetrics {
  testName: string
  duration: number
  timestamp: number
  memoryUsage?: NodeJS.MemoryUsage
  cpuUsage?: NodeJS.CpuUsage
}

interface PerformanceReport {
  totalTests: number
  totalDuration: number
  averageDuration: number
  slowTests: number
  slowTestDetails: TestMetrics[]
  memoryUsage: {
    average: number
    peak: number
    current: number
  }
  cpuUsage: {
    average: number
    peak: number
  }
}

class TestPerformanceMonitor {
  private metrics: TestMetrics[] = []
  private startTime: number = 0
  private startCpuUsage: NodeJS.CpuUsage = { user: 0, system: 0 }
  private peakMemoryUsage: number = 0
  
  /**
   * 开始测试
   */
  startTest(testName: string) {
    this.startTime = performance.now()
    this.startCpuUsage = process.cpuUsage()
    performance.mark(`${testName}-start`)
  }
  
  /**
   * 结束测试
   */
  endTest(testName: string) {
    const endTime = performance.now()
    const endCpuUsage = process.cpuUsage(this.startCpuUsage)
    const memoryUsage = process.memoryUsage()
    
    performance.mark(`${testName}-end`)
    performance.measure(testName, `${testName}-start`, `${testName}-end`)
    
    const duration = endTime - this.startTime
    
    // 更新峰值内存使用
    this.peakMemoryUsage = Math.max(this.peakMemoryUsage, memoryUsage.heapUsed)
    
    const metric: TestMetrics = {
      testName,
      duration,
      timestamp: Date.now(),
      memoryUsage,
      cpuUsage: endCpuUsage
    }
    
    this.metrics.push(metric)
    
    // 记录慢测试
    if (duration > 1000) {
      console.warn(`Slow test detected: ${testName} (${duration.toFixed(2)}ms)`)
    }
  }
  
  /**
   * 获取测试指标
   */
  getMetrics(): TestMetrics[] {
    return [...this.metrics]
  }
  
  /**
   * 获取慢测试
   */
  getSlowTests(threshold: number = 1000): TestMetrics[] {
    return this.metrics.filter(m => m.duration > threshold)
  }
  
  /**
   * 获取性能报告
   */
  getPerformanceReport(): PerformanceReport {
    const totalTests = this.metrics.length
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0)
    const averageDuration = totalTests > 0 ? totalDuration / totalTests : 0
    
    const slowTests = this.getSlowTests()
    const slowTestCount = slowTests.length
    
    // 内存使用统计
    const memoryUsages = this.metrics
      .filter(m => m.memoryUsage)
      .map(m => m.memoryUsage!.heapUsed)
    
    const averageMemoryUsage = memoryUsages.length > 0 
      ? memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length 
      : 0
    
    const currentMemoryUsage = process.memoryUsage().heapUsed
    
    // CPU使用统计
    const cpuUsages = this.metrics
      .filter(m => m.cpuUsage)
      .map(m => m.cpuUsage!.user + m.cpuUsage!.system)
    
    const averageCpuUsage = cpuUsages.length > 0 
      ? cpuUsages.reduce((sum, usage) => sum + usage, 0) / cpuUsages.length 
      : 0
    
    const peakCpuUsage = cpuUsages.length > 0 ? Math.max(...cpuUsages) : 0
    
    return {
      totalTests,
      totalDuration,
      averageDuration,
      slowTests: slowTestCount,
      slowTestDetails: slowTests,
      memoryUsage: {
        average: averageMemoryUsage,
        peak: this.peakMemoryUsage,
        current: currentMemoryUsage
      },
      cpuUsage: {
        average: averageCpuUsage,
        peak: peakCpuUsage
      }
    }
  }
  
  /**
   * 获取测试趋势
   */
  getTestTrend(): Array<{
    timestamp: number
    duration: number
    memoryUsage: number
  }> {
    return this.metrics.map(m => ({
      timestamp: m.timestamp,
      duration: m.duration,
      memoryUsage: m.memoryUsage?.heapUsed || 0
    }))
  }
  
  /**
   * 检查性能告警
   */
  checkPerformanceAlerts(): Array<{
    type: 'slow_test' | 'high_memory' | 'high_cpu'
    message: string
    severity: 'warning' | 'critical'
    value: number
    threshold: number
  }> {
    const alerts = []
    const report = this.getPerformanceReport()
    
    // 慢测试告警
    if (report.averageDuration > 2000) {
      alerts.push({
        type: 'slow_test',
        message: `Average test duration is ${report.averageDuration.toFixed(2)}ms`,
        severity: report.averageDuration > 5000 ? 'critical' : 'warning',
        value: report.averageDuration,
        threshold: 2000
      })
    }
    
    // 高内存使用告警
    if (report.memoryUsage.peak > 100 * 1024 * 1024) { // 100MB
      alerts.push({
        type: 'high_memory',
        message: `Peak memory usage is ${(report.memoryUsage.peak / 1024 / 1024).toFixed(2)}MB`,
        severity: report.memoryUsage.peak > 500 * 1024 * 1024 ? 'critical' : 'warning',
        value: report.memoryUsage.peak,
        threshold: 100 * 1024 * 1024
      })
    }
    
    // 高CPU使用告警
    if (report.cpuUsage.peak > 1000000) { // 1秒
      alerts.push({
        type: 'high_cpu',
        message: `Peak CPU usage is ${(report.cpuUsage.peak / 1000000).toFixed(2)}s`,
        severity: report.cpuUsage.peak > 5000000 ? 'critical' : 'warning',
        value: report.cpuUsage.peak,
        threshold: 1000000
      })
    }
    
    return alerts
  }
  
  /**
   * 生成性能报告
   */
  generateReport(): string {
    const report = this.getPerformanceReport()
    const alerts = this.checkPerformanceAlerts()
    
    let reportText = `
# 测试性能报告

## 总体统计
- 总测试数: ${report.totalTests}
- 总执行时间: ${(report.totalDuration / 1000).toFixed(2)}s
- 平均执行时间: ${report.averageDuration.toFixed(2)}ms
- 慢测试数: ${report.slowTests}

## 内存使用
- 平均内存使用: ${(report.memoryUsage.average / 1024 / 1024).toFixed(2)}MB
- 峰值内存使用: ${(report.memoryUsage.peak / 1024 / 1024).toFixed(2)}MB
- 当前内存使用: ${(report.memoryUsage.current / 1024 / 1024).toFixed(2)}MB

## CPU使用
- 平均CPU使用: ${(report.cpuUsage.average / 1000000).toFixed(2)}s
- 峰值CPU使用: ${(report.cpuUsage.peak / 1000000).toFixed(2)}s

## 性能告警
${alerts.length > 0 ? alerts.map(alert => 
  `- ${alert.severity.toUpperCase()}: ${alert.message}`
).join('\n') : '- 无告警'}

## 慢测试详情
${report.slowTestDetails.map(test => 
  `- ${test.testName}: ${test.duration.toFixed(2)}ms`
).join('\n')}
`
    
    return reportText
  }
  
  /**
   * 导出指标数据
   */
  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2)
  }
  
  /**
   * 清理指标数据
   */
  cleanup() {
    this.metrics = []
    this.peakMemoryUsage = 0
  }
  
  /**
   * 重置监控器
   */
  reset() {
    this.cleanup()
    this.startTime = 0
    this.startCpuUsage = { user: 0, system: 0 }
  }
}

// 创建全局监控器实例
export const testPerformanceMonitor = new TestPerformanceMonitor()

// Jest测试钩子
export const jestHooks = {
  beforeAll: () => {
    testPerformanceMonitor.reset()
  },
  
  beforeEach: (testName: string) => {
    testPerformanceMonitor.startTest(testName)
  },
  
  afterEach: (testName: string) => {
    testPerformanceMonitor.endTest(testName)
  },
  
  afterAll: () => {
    const report = testPerformanceMonitor.generateReport()
    console.log(report)
    
    const alerts = testPerformanceMonitor.checkPerformanceAlerts()
    if (alerts.length > 0) {
      console.warn('Performance alerts:', alerts)
    }
  }
}

// 测试性能装饰器
export function measurePerformance(testName?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      const name = testName || `${target.constructor.name}.${propertyName}`
      
      testPerformanceMonitor.startTest(name)
      
      try {
        const result = await method.apply(this, args)
        return result
      } finally {
        testPerformanceMonitor.endTest(name)
      }
    }
    
    return descriptor
  }
}

// 测试性能助手
export const performanceHelpers = {
  // 测量函数执行时间
  measureFunction: async <T>(
    fn: () => Promise<T>,
    name: string
  ): Promise<T> => {
    testPerformanceMonitor.startTest(name)
    
    try {
      const result = await fn()
      return result
    } finally {
      testPerformanceMonitor.endTest(name)
    }
  },
  
  // 测量同步函数执行时间
  measureSyncFunction: <T>(
    fn: () => T,
    name: string
  ): T => {
    testPerformanceMonitor.startTest(name)
    
    try {
      const result = fn()
      return result
    } finally {
      testPerformanceMonitor.endTest(name)
    }
  },
  
  // 获取当前内存使用
  getCurrentMemoryUsage: (): NodeJS.MemoryUsage => {
    return process.memoryUsage()
  },
  
  // 获取当前CPU使用
  getCurrentCpuUsage: (): NodeJS.CpuUsage => {
    return process.cpuUsage()
  },
  
  // 强制垃圾回收
  forceGarbageCollection: (): void => {
    if (global.gc) {
      global.gc()
    }
  }
}

// 默认导出
export default testPerformanceMonitor
