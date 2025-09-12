/**
 * API性能监控工具
 * 监控API响应时间、错误率、并发等性能指标
 */

import { NextRequest, NextResponse } from 'next/server'

interface APIMetrics {
  endpoint: string
  method: string
  duration: number
  statusCode: number
  timestamp: number
  userAgent: string
  ip: string
  requestSize?: number
  responseSize?: number
}

interface APIPerformanceStats {
  totalRequests: number
  averageDuration: number
  slowestEndpoints: Array<{ endpoint: string; duration: number; count: number }>
  errorRate: number
  requestsPerMinute: number
  requestsPerHour: number
  statusCodeDistribution: Record<number, number>
  averageRequestSize: number
  averageResponseSize: number
}

class APIPerformanceMonitor {
  private metrics: APIMetrics[] = []
  private maxMetrics = 10000
  private slowQueryThreshold = 1000 // 1秒
  private errorThreshold = 0.05 // 5%
  
  /**
   * 记录API性能指标
   */
  recordAPIMetrics(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number,
    request: NextRequest,
    requestSize?: number,
    responseSize?: number
  ): void {
    const metric: APIMetrics = {
      endpoint,
      method,
      duration,
      statusCode,
      timestamp: Date.now(),
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: this.getClientIP(request),
      requestSize,
      responseSize
    }
    
    this.metrics.push(metric)
    
    // 保持指标数量在限制内
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
    
    // 记录慢请求
    if (duration > this.slowQueryThreshold) {
      console.warn('Slow API request detected:', {
        endpoint,
        method,
        duration: `${duration}ms`,
        statusCode
      })
    }
    
    // 记录错误请求
    if (statusCode >= 400) {
      console.error('API error detected:', {
        endpoint,
        method,
        statusCode,
        duration: `${duration}ms`
      })
    }
  }
  
  /**
   * 获取API性能统计
   */
  getAPIStats(): APIPerformanceStats {
    const now = Date.now()
    const oneMinuteAgo = now - 60000
    const oneHourAgo = now - 3600000
    
    const recentMetrics = this.metrics.filter(m => m.timestamp > oneMinuteAgo)
    const hourlyMetrics = this.metrics.filter(m => m.timestamp > oneHourAgo)
    
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0)
    const errorCount = this.metrics.filter(m => m.statusCode >= 400).length
    
    // 最慢的端点
    const endpointStats = this.metrics.reduce((acc, m) => {
      const key = `${m.method} ${m.endpoint}`
      if (!acc[key]) {
        acc[key] = { endpoint: key, duration: 0, count: 0 }
      }
      acc[key].duration += m.duration
      acc[key].count += 1
      return acc
    }, {} as Record<string, { endpoint: string; duration: number; count: number }>)
    
    const slowestEndpoints = Object.values(endpointStats)
      .map(stat => ({
        endpoint: stat.endpoint,
        duration: stat.duration / stat.count,
        count: stat.count
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
    
    // 状态码分布
    const statusCodeDistribution = this.metrics.reduce((acc, m) => {
      acc[m.statusCode] = (acc[m.statusCode] || 0) + 1
      return acc
    }, {} as Record<number, number>)
    
    // 请求和响应大小统计
    const requestSizes = this.metrics.filter(m => m.requestSize).map(m => m.requestSize!)
    const responseSizes = this.metrics.filter(m => m.responseSize).map(m => m.responseSize!)
    
    return {
      totalRequests: this.metrics.length,
      averageDuration: this.metrics.length > 0 ? totalDuration / this.metrics.length : 0,
      slowestEndpoints,
      errorRate: this.metrics.length > 0 ? errorCount / this.metrics.length : 0,
      requestsPerMinute: recentMetrics.length,
      requestsPerHour: hourlyMetrics.length,
      statusCodeDistribution,
      averageRequestSize: requestSizes.length > 0 ? requestSizes.reduce((sum, size) => sum + size, 0) / requestSizes.length : 0,
      averageResponseSize: responseSizes.length > 0 ? responseSizes.reduce((sum, size) => sum + size, 0) / responseSizes.length : 0
    }
  }
  
  /**
   * 获取端点性能统计
   */
  getEndpointStats(endpoint: string, method?: string): {
    totalRequests: number
    averageDuration: number
    errorRate: number
    p95Duration: number
    p99Duration: number
    recentRequests: number
  } {
    const now = Date.now()
    const oneHourAgo = now - 3600000
    
    let filteredMetrics = this.metrics.filter(m => m.endpoint === endpoint)
    
    if (method) {
      filteredMetrics = filteredMetrics.filter(m => m.method === method)
    }
    
    const recentMetrics = filteredMetrics.filter(m => m.timestamp > oneHourAgo)
    const durations = filteredMetrics.map(m => m.duration).sort((a, b) => a - b)
    const errorCount = filteredMetrics.filter(m => m.statusCode >= 400).length
    
    return {
      totalRequests: filteredMetrics.length,
      averageDuration: durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0,
      errorRate: filteredMetrics.length > 0 ? errorCount / filteredMetrics.length : 0,
      p95Duration: this.calculatePercentile(durations, 95),
      p99Duration: this.calculatePercentile(durations, 99),
      recentRequests: recentMetrics.length
    }
  }
  
  /**
   * 获取错误统计
   */
  getErrorStats(): {
    totalErrors: number
    errorRate: number
    errorByEndpoint: Record<string, number>
    errorByStatusCode: Record<number, number>
    recentErrors: number
  } {
    const now = Date.now()
    const oneHourAgo = now - 3600000
    
    const errorMetrics = this.metrics.filter(m => m.statusCode >= 400)
    const recentErrors = errorMetrics.filter(m => m.timestamp > oneHourAgo)
    
    const errorByEndpoint = errorMetrics.reduce((acc, m) => {
      const key = `${m.method} ${m.endpoint}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const errorByStatusCode = errorMetrics.reduce((acc, m) => {
      acc[m.statusCode] = (acc[m.statusCode] || 0) + 1
      return acc
    }, {} as Record<number, number>)
    
    return {
      totalErrors: errorMetrics.length,
      errorRate: this.metrics.length > 0 ? errorMetrics.length / this.metrics.length : 0,
      errorByEndpoint,
      errorByStatusCode,
      recentErrors: recentErrors.length
    }
  }
  
  /**
   * 获取性能趋势
   */
  getPerformanceTrend(hours: number = 24): Array<{
    timestamp: number
    requests: number
    averageDuration: number
    errorRate: number
  }> {
    const now = Date.now()
    const startTime = now - (hours * 3600000)
    const interval = 3600000 // 1小时
    
    const trend = []
    
    for (let time = startTime; time < now; time += interval) {
      const nextTime = time + interval
      const periodMetrics = this.metrics.filter(m => m.timestamp >= time && m.timestamp < nextTime)
      
      const totalDuration = periodMetrics.reduce((sum, m) => sum + m.duration, 0)
      const errorCount = periodMetrics.filter(m => m.statusCode >= 400).length
      
      trend.push({
        timestamp: time,
        requests: periodMetrics.length,
        averageDuration: periodMetrics.length > 0 ? totalDuration / periodMetrics.length : 0,
        errorRate: periodMetrics.length > 0 ? errorCount / periodMetrics.length : 0
      })
    }
    
    return trend
  }
  
  /**
   * 检查性能告警
   */
  checkPerformanceAlerts(): Array<{
    type: 'slow_response' | 'high_error_rate' | 'high_volume'
    message: string
    severity: 'warning' | 'critical'
    value: number
    threshold: number
  }> {
    const alerts = []
    const stats = this.getAPIStats()
    
    // 慢响应告警
    if (stats.averageDuration > 2000) {
      alerts.push({
        type: 'slow_response',
        message: `Average response time is ${stats.averageDuration.toFixed(0)}ms`,
        severity: stats.averageDuration > 5000 ? 'critical' : 'warning',
        value: stats.averageDuration,
        threshold: 2000
      })
    }
    
    // 高错误率告警
    if (stats.errorRate > this.errorThreshold) {
      alerts.push({
        type: 'high_error_rate',
        message: `Error rate is ${(stats.errorRate * 100).toFixed(2)}%`,
        severity: stats.errorRate > 0.1 ? 'critical' : 'warning',
        value: stats.errorRate,
        threshold: this.errorThreshold
      })
    }
    
    // 高请求量告警
    if (stats.requestsPerMinute > 1000) {
      alerts.push({
        type: 'high_volume',
        message: `Request volume is ${stats.requestsPerMinute} requests/minute`,
        severity: stats.requestsPerMinute > 2000 ? 'critical' : 'warning',
        value: stats.requestsPerMinute,
        threshold: 1000
      })
    }
    
    return alerts
  }
  
  /**
   * 获取客户端IP
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    return 'unknown'
  }
  
  /**
   * 计算百分位数
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0
    
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    
    return sorted[index] || 0
  }
  
  /**
   * 清理旧指标
   */
  cleanup(): void {
    const oneDayAgo = Date.now() - 86400000
    this.metrics = this.metrics.filter(m => m.timestamp > oneDayAgo)
  }
  
  /**
   * 重置统计信息
   */
  reset(): void {
    this.metrics = []
  }
  
  /**
   * 导出指标数据
   */
  exportMetrics(): APIMetrics[] {
    return [...this.metrics]
  }
}

export const apiPerformanceMonitor = new APIPerformanceMonitor()

/**
 * API性能监控中间件
 */
export function withAPIPerformanceMonitoring(handler: Function) {
  return async (request: NextRequest) => {
    const startTime = Date.now()
    const url = new URL(request.url)
    const endpoint = url.pathname
    const method = request.method
    
    // 获取请求大小
    const requestSize = request.headers.get('content-length') 
      ? parseInt(request.headers.get('content-length')!)
      : undefined
    
    try {
      const response = await handler(request)
      const duration = Date.now() - startTime
      
      // 获取响应大小
      const responseSize = response.headers.get('content-length')
        ? parseInt(response.headers.get('content-length')!)
        : undefined
      
      // 记录性能指标
      apiPerformanceMonitor.recordAPIMetrics(
        endpoint,
        method,
        duration,
        response.status,
        request,
        requestSize,
        responseSize
      )
      
      return response
    } catch (error) {
      const duration = Date.now() - startTime
      
      // 记录错误性能指标
      apiPerformanceMonitor.recordAPIMetrics(
        endpoint,
        method,
        duration,
        500,
        request,
        requestSize
      )
      
      throw error
    }
  }
}

/**
 * 性能监控Hook
 */
export function useAPIPerformanceMonitoring() {
  const [stats, setStats] = useState<APIPerformanceStats | null>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  
  useEffect(() => {
    const updateStats = () => {
      setStats(apiPerformanceMonitor.getAPIStats())
      setAlerts(apiPerformanceMonitor.checkPerformanceAlerts())
    }
    
    // 初始更新
    updateStats()
    
    // 定期更新
    const interval = setInterval(updateStats, 30000) // 30秒
    
    return () => clearInterval(interval)
  }, [])
  
  return {
    stats,
    alerts,
    getEndpointStats: (endpoint: string, method?: string) => 
      apiPerformanceMonitor.getEndpointStats(endpoint, method),
    getErrorStats: () => apiPerformanceMonitor.getErrorStats(),
    getPerformanceTrend: (hours?: number) => 
      apiPerformanceMonitor.getPerformanceTrend(hours)
  }
}

/**
 * 默认导出
 */
export default apiPerformanceMonitor
