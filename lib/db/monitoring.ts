/**
 * 数据库监控工具
 * 监控数据库性能、连接池状态、查询性能等
 */

import { Sequelize } from 'sequelize'
import { createClient } from 'redis'
import { appConfig } from '@/lib/config'

interface DatabaseMetrics {
  // 连接池指标
  connectionPool: {
    total: number
    active: number
    idle: number
    waiting: number
    max: number
    min: number
  }
  
  // 查询性能指标
  queryPerformance: {
    totalQueries: number
    averageQueryTime: number
    slowQueries: number
    failedQueries: number
    queriesPerSecond: number
  }
  
  // 资源使用指标
  resourceUsage: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    networkUsage: number
  }
  
  // 错误统计
  errorStats: {
    connectionErrors: number
    queryErrors: number
    timeoutErrors: number
    totalErrors: number
  }
  
  // 缓存指标
  cacheMetrics: {
    hitRate: number
    missRate: number
    totalRequests: number
    averageResponseTime: number
  }
}

interface QueryMetrics {
  query: string
  executionTime: number
  timestamp: number
  success: boolean
  error?: string
}

class DatabaseMonitor {
  private sequelize: Sequelize
  private redis: ReturnType<typeof createClient>
  private metrics: DatabaseMetrics
  private queryHistory: QueryMetrics[] = []
  private maxQueryHistory = 1000
  private monitoringInterval: NodeJS.Timeout | null = null
  private isMonitoring = false
  
  constructor(sequelize: Sequelize, redis: ReturnType<typeof createClient>) {
    this.sequelize = sequelize
    this.redis = redis
    this.metrics = this.initializeMetrics()
  }
  
  /**
   * 初始化监控指标
   */
  private initializeMetrics(): DatabaseMetrics {
    return {
      connectionPool: {
        total: 0,
        active: 0,
        idle: 0,
        waiting: 0,
        max: 0,
        min: 0
      },
      queryPerformance: {
        totalQueries: 0,
        averageQueryTime: 0,
        slowQueries: 0,
        failedQueries: 0,
        queriesPerSecond: 0
      },
      resourceUsage: {
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        networkUsage: 0
      },
      errorStats: {
        connectionErrors: 0,
        queryErrors: 0,
        timeoutErrors: 0,
        totalErrors: 0
      },
      cacheMetrics: {
        hitRate: 0,
        missRate: 0,
        totalRequests: 0,
        averageResponseTime: 0
      }
    }
  }
  
  /**
   * 开始监控
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (this.isMonitoring) {
      console.warn('数据库监控已在运行')
      return
    }
    
    this.isMonitoring = true
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectMetrics()
      } catch (error) {
        console.error('收集数据库指标失败:', error)
      }
    }, intervalMs)
    
    console.log('数据库监控已启动')
  }
  
  /**
   * 停止监控
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    
    this.isMonitoring = false
    console.log('数据库监控已停止')
  }
  
  /**
   * 收集监控指标
   */
  private async collectMetrics(): Promise<void> {
    // 收集连接池指标
    await this.collectConnectionPoolMetrics()
    
    // 收集查询性能指标
    await this.collectQueryPerformanceMetrics()
    
    // 收集资源使用指标
    await this.collectResourceUsageMetrics()
    
    // 收集错误统计
    await this.collectErrorStats()
    
    // 收集缓存指标
    await this.collectCacheMetrics()
  }
  
  /**
   * 收集连接池指标
   */
  private async collectConnectionPoolMetrics(): Promise<void> {
    try {
      const pool = this.sequelize.connectionManager.pool
      
      this.metrics.connectionPool = {
        total: pool.size,
        active: pool.used,
        idle: pool.pending,
        waiting: pool.pending,
        max: pool.max,
        min: pool.min
      }
    } catch (error) {
      console.error('收集连接池指标失败:', error)
    }
  }
  
  /**
   * 收集查询性能指标
   */
  private async collectQueryPerformanceMetrics(): Promise<void> {
    try {
      const now = Date.now()
      const oneSecondAgo = now - 1000
      
      // 计算最近1秒的查询
      const recentQueries = this.queryHistory.filter(q => q.timestamp > oneSecondAgo)
      
      // 计算总查询数
      this.metrics.queryPerformance.totalQueries = this.queryHistory.length
      
      // 计算平均查询时间
      if (this.queryHistory.length > 0) {
        const totalTime = this.queryHistory.reduce((sum, q) => sum + q.executionTime, 0)
        this.metrics.queryPerformance.averageQueryTime = totalTime / this.queryHistory.length
      }
      
      // 计算慢查询数（超过100ms）
      this.metrics.queryPerformance.slowQueries = this.queryHistory.filter(q => q.executionTime > 100).length
      
      // 计算失败查询数
      this.metrics.queryPerformance.failedQueries = this.queryHistory.filter(q => !q.success).length
      
      // 计算每秒查询数
      this.metrics.queryPerformance.queriesPerSecond = recentQueries.length
      
    } catch (error) {
      console.error('收集查询性能指标失败:', error)
    }
  }
  
  /**
   * 收集资源使用指标
   */
  private async collectResourceUsageMetrics(): Promise<void> {
    try {
      // 获取进程内存使用
      const memUsage = process.memoryUsage()
      this.metrics.resourceUsage.memoryUsage = memUsage.heapUsed / 1024 / 1024 // MB
      
      // 获取CPU使用率（简化版本）
      const cpuUsage = process.cpuUsage()
      this.metrics.resourceUsage.cpuUsage = (cpuUsage.user + cpuUsage.system) / 1000000 // 秒
      
      // 磁盘和网络使用率需要系统级监控，这里简化处理
      this.metrics.resourceUsage.diskUsage = 0
      this.metrics.resourceUsage.networkUsage = 0
      
    } catch (error) {
      console.error('收集资源使用指标失败:', error)
    }
  }
  
  /**
   * 收集错误统计
   */
  private async collectErrorStats(): Promise<void> {
    try {
      // 这里需要从日志或错误收集系统中获取
      // 简化处理，实际应该从错误日志中统计
      this.metrics.errorStats = {
        connectionErrors: 0,
        queryErrors: 0,
        timeoutErrors: 0,
        totalErrors: 0
      }
    } catch (error) {
      console.error('收集错误统计失败:', error)
    }
  }
  
  /**
   * 收集缓存指标
   */
  private async collectCacheMetrics(): Promise<void> {
    try {
      if (this.redis.isOpen) {
        const info = await this.redis.info('stats')
        const lines = info.split('\r\n')
        
        let hits = 0
        let misses = 0
        let totalRequests = 0
        
        for (const line of lines) {
          if (line.startsWith('keyspace_hits:')) {
            hits = parseInt(line.split(':')[1]) || 0
          } else if (line.startsWith('keyspace_misses:')) {
            misses = parseInt(line.split(':')[1]) || 0
          }
        }
        
        totalRequests = hits + misses
        
        this.metrics.cacheMetrics = {
          hitRate: totalRequests > 0 ? (hits / totalRequests) * 100 : 0,
          missRate: totalRequests > 0 ? (misses / totalRequests) * 100 : 0,
          totalRequests,
          averageResponseTime: 0 // 需要额外实现
        }
      }
    } catch (error) {
      console.error('收集缓存指标失败:', error)
    }
  }
  
  /**
   * 记录查询指标
   */
  recordQuery(query: string, executionTime: number, success: boolean, error?: string): void {
    const queryMetric: QueryMetrics = {
      query: query.substring(0, 100), // 限制长度
      executionTime,
      timestamp: Date.now(),
      success,
      error
    }
    
    this.queryHistory.push(queryMetric)
    
    // 保持历史记录在限制范围内
    if (this.queryHistory.length > this.maxQueryHistory) {
      this.queryHistory = this.queryHistory.slice(-this.maxQueryHistory)
    }
  }
  
  /**
   * 获取当前指标
   */
  getMetrics(): DatabaseMetrics {
    return { ...this.metrics }
  }
  
  /**
   * 获取查询历史
   */
  getQueryHistory(limit: number = 100): QueryMetrics[] {
    return this.queryHistory.slice(-limit)
  }
  
  /**
   * 获取慢查询
   */
  getSlowQueries(threshold: number = 100): QueryMetrics[] {
    return this.queryHistory.filter(q => q.executionTime > threshold)
  }
  
  /**
   * 获取失败查询
   */
  getFailedQueries(): QueryMetrics[] {
    return this.queryHistory.filter(q => !q.success)
  }
  
  /**
   * 检查健康状态
   */
  checkHealth(): {
    healthy: boolean
    issues: string[]
    score: number
  } {
    const issues: string[] = []
    let score = 100
    
    // 检查连接池
    const pool = this.metrics.connectionPool
    if (pool.active / pool.max > 0.8) {
      issues.push('连接池使用率过高')
      score -= 20
    }
    
    // 检查查询性能
    const queryPerf = this.metrics.queryPerformance
    if (queryPerf.averageQueryTime > 100) {
      issues.push('平均查询时间过长')
      score -= 15
    }
    
    if (queryPerf.slowQueries > 10) {
      issues.push('慢查询数量过多')
      score -= 10
    }
    
    // 检查错误率
    const errorRate = queryPerf.totalQueries > 0 ? queryPerf.failedQueries / queryPerf.totalQueries : 0
    if (errorRate > 0.05) {
      issues.push('查询错误率过高')
      score -= 25
    }
    
    // 检查内存使用
    if (this.metrics.resourceUsage.memoryUsage > 1000) { // 1GB
      issues.push('内存使用量过高')
      score -= 10
    }
    
    // 检查缓存命中率
    if (this.metrics.cacheMetrics.hitRate < 80) {
      issues.push('缓存命中率过低')
      score -= 5
    }
    
    return {
      healthy: issues.length === 0,
      issues,
      score: Math.max(0, score)
    }
  }
  
  /**
   * 生成监控报告
   */
  generateReport(): string {
    const health = this.checkHealth()
    const metrics = this.metrics
    
    return `
# 数据库监控报告

## 健康状态
- 状态: ${health.healthy ? '健康' : '异常'}
- 评分: ${health.score}/100
- 问题: ${health.issues.length > 0 ? health.issues.join(', ') : '无'}

## 连接池状态
- 总连接数: ${metrics.connectionPool.total}
- 活跃连接: ${metrics.connectionPool.active}
- 空闲连接: ${metrics.connectionPool.idle}
- 等待连接: ${metrics.connectionPool.waiting}
- 最大连接: ${metrics.connectionPool.max}
- 最小连接: ${metrics.connectionPool.min}

## 查询性能
- 总查询数: ${metrics.queryPerformance.totalQueries}
- 平均查询时间: ${metrics.queryPerformance.averageQueryTime.toFixed(2)}ms
- 慢查询数: ${metrics.queryPerformance.slowQueries}
- 失败查询数: ${metrics.queryPerformance.failedQueries}
- 每秒查询数: ${metrics.queryPerformance.queriesPerSecond}

## 资源使用
- 内存使用: ${metrics.resourceUsage.memoryUsage.toFixed(2)}MB
- CPU使用: ${metrics.resourceUsage.cpuUsage.toFixed(2)}s
- 磁盘使用: ${metrics.resourceUsage.diskUsage}%
- 网络使用: ${metrics.resourceUsage.networkUsage}%

## 缓存状态
- 命中率: ${metrics.cacheMetrics.hitRate.toFixed(2)}%
- 未命中率: ${metrics.cacheMetrics.missRate.toFixed(2)}%
- 总请求数: ${metrics.cacheMetrics.totalRequests}
- 平均响应时间: ${metrics.cacheMetrics.averageResponseTime.toFixed(2)}ms

## 错误统计
- 连接错误: ${metrics.errorStats.connectionErrors}
- 查询错误: ${metrics.errorStats.queryErrors}
- 超时错误: ${metrics.errorStats.timeoutErrors}
- 总错误数: ${metrics.errorStats.totalErrors}
`
  }
  
  /**
   * 清理历史数据
   */
  cleanup(): void {
    this.queryHistory = []
    this.metrics = this.initializeMetrics()
  }
}

// 创建全局监控实例
let globalMonitor: DatabaseMonitor | null = null

/**
 * 获取数据库监控实例
 */
export function getDatabaseMonitor(sequelize: Sequelize, redis: ReturnType<typeof createClient>): DatabaseMonitor {
  if (!globalMonitor) {
    globalMonitor = new DatabaseMonitor(sequelize, redis)
  }
  return globalMonitor
}

/**
 * 启动数据库监控
 */
export function startDatabaseMonitoring(sequelize: Sequelize, redis: ReturnType<typeof createClient>, intervalMs: number = 5000): void {
  const monitor = getDatabaseMonitor(sequelize, redis)
  monitor.startMonitoring(intervalMs)
}

/**
 * 停止数据库监控
 */
export function stopDatabaseMonitoring(): void {
  if (globalMonitor) {
    globalMonitor.stopMonitoring()
  }
}

/**
 * 获取数据库指标
 */
export function getDatabaseMetrics(): DatabaseMetrics | null {
  return globalMonitor?.getMetrics() || null
}

/**
 * 检查数据库健康状态
 */
export function checkDatabaseHealth(): ReturnType<DatabaseMonitor['checkHealth']> | null {
  return globalMonitor?.checkHealth() || null
}

// 默认导出
export default DatabaseMonitor
