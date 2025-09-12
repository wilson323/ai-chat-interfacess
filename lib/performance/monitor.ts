/**
 * 性能监控工具
 * 监控Core Web Vitals和其他性能指标
 */

interface PerformanceMetrics {
  lcp: number
  fid: number
  cls: number
  inp: number
  ttfb: number
  fcp: number
  tti: number
  fmp: number
}

interface PerformanceEntry {
  name: string
  value: number
  delta: number
  id: string
  navigationType: string
}

interface PerformanceObserver {
  observe: (options: { entryTypes: string[] }) => void
  disconnect: () => void
  takeRecords: () => PerformanceEntry[]
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    lcp: 0,
    fid: 0,
    cls: 0,
    inp: 0,
    ttfb: 0,
    fcp: 0,
    tti: 0,
    fmp: 0
  }
  
  private observers: PerformanceObserver[] = []
  private isInitialized = false
  
  /**
   * 初始化性能监控
   */
  init(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return
    }
    
    this.isInitialized = true
    
    // 监控Core Web Vitals
    this.observeLCP()
    this.observeFID()
    this.observeCLS()
    this.observeINP()
    this.observeTTFB()
    this.observeFCP()
    this.observeTTI()
    this.observeFMP()
    
    // 页面卸载时发送数据
    window.addEventListener('beforeunload', () => {
      this.sendMetrics()
    })
    
    // 定期发送数据
    setInterval(() => {
      this.sendMetrics()
    }, 30000) // 30秒
  }
  
  /**
   * 观察最大内容绘制 (LCP)
   */
  private observeLCP(): void {
    if (!('PerformanceObserver' in window)) return
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as PerformanceEntry
      this.metrics.lcp = lastEntry.value
    })
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] })
    this.observers.push(observer)
  }
  
  /**
   * 观察首次输入延迟 (FID)
   */
  private observeFID(): void {
    if (!('PerformanceObserver' in window)) return
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: PerformanceEntry) => {
        this.metrics.fid = entry.processingStart - entry.startTime
      })
    })
    
    observer.observe({ entryTypes: ['first-input'] })
    this.observers.push(observer)
  }
  
  /**
   * 观察累积布局偏移 (CLS)
   */
  private observeCLS(): void {
    if (!('PerformanceObserver' in window)) return
    
    let clsValue = 0
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      this.metrics.cls = clsValue
    })
    
    observer.observe({ entryTypes: ['layout-shift'] })
    this.observers.push(observer)
  }
  
  /**
   * 观察交互到下次绘制 (INP)
   */
  private observeINP(): void {
    if (!('PerformanceObserver' in window)) return
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: PerformanceEntry) => {
        this.metrics.inp = entry.processingEnd - entry.startTime
      })
    })
    
    observer.observe({ entryTypes: ['event'] })
    this.observers.push(observer)
  }
  
  /**
   * 观察首字节时间 (TTFB)
   */
  private observeTTFB(): void {
    if (!('PerformanceNavigationTiming' in window)) return
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      this.metrics.ttfb = navigation.responseStart - navigation.requestStart
    }
  }
  
  /**
   * 观察首次内容绘制 (FCP)
   */
  private observeFCP(): void {
    if (!('PerformanceObserver' in window)) return
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
      if (fcpEntry) {
        this.metrics.fcp = fcpEntry.startTime
      }
    })
    
    observer.observe({ entryTypes: ['paint'] })
    this.observers.push(observer)
  }
  
  /**
   * 观察可交互时间 (TTI)
   */
  private observeTTI(): void {
    if (!('PerformanceObserver' in window)) return
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: PerformanceEntry) => {
        if (entry.name === 'first-input') {
          this.metrics.tti = entry.startTime
        }
      })
    })
    
    observer.observe({ entryTypes: ['first-input'] })
    this.observers.push(observer)
  }
  
  /**
   * 观察首次有意义绘制 (FMP)
   */
  private observeFMP(): void {
    if (!('PerformanceObserver' in window)) return
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: PerformanceEntry) => {
        if (entry.name === 'first-meaningful-paint') {
          this.metrics.fmp = entry.startTime
        }
      })
    })
    
    observer.observe({ entryTypes: ['paint'] })
    this.observers.push(observer)
  }
  
  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }
  
  /**
   * 检查性能是否达标
   */
  checkPerformance(): boolean {
    const { lcp, fid, cls, inp } = this.metrics
    
    return (
      lcp < 2500 && // LCP < 2.5s
      fid < 100 &&  // FID < 100ms
      cls < 0.1 &&  // CLS < 0.1
      inp < 200     // INP < 200ms
    )
  }
  
  /**
   * 获取性能等级
   */
  getPerformanceGrade(): 'A' | 'B' | 'C' | 'D' | 'F' {
    const { lcp, fid, cls, inp } = this.metrics
    
    let score = 0
    
    // LCP评分
    if (lcp < 2500) score += 25
    else if (lcp < 4000) score += 15
    else if (lcp < 6000) score += 5
    
    // FID评分
    if (fid < 100) score += 25
    else if (fid < 300) score += 15
    else if (fid < 500) score += 5
    
    // CLS评分
    if (cls < 0.1) score += 25
    else if (cls < 0.25) score += 15
    else if (cls < 0.4) score += 5
    
    // INP评分
    if (inp < 200) score += 25
    else if (inp < 500) score += 15
    else if (inp < 1000) score += 5
    
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }
  
  /**
   * 获取性能报告
   */
  getPerformanceReport(): {
    metrics: PerformanceMetrics
    grade: string
    isPassing: boolean
    recommendations: string[]
  } {
    const metrics = this.getMetrics()
    const grade = this.getPerformanceGrade()
    const isPassing = this.checkPerformance()
    const recommendations = this.getRecommendations()
    
    return {
      metrics,
      grade,
      isPassing,
      recommendations
    }
  }
  
  /**
   * 获取性能优化建议
   */
  private getRecommendations(): string[] {
    const recommendations: string[] = []
    const { lcp, fid, cls, inp, ttfb, fcp } = this.metrics
    
    if (lcp > 2500) {
      recommendations.push('优化最大内容绘制 (LCP): 优化图片加载、减少阻塞资源、使用CDN')
    }
    
    if (fid > 100) {
      recommendations.push('优化首次输入延迟 (FID): 减少JavaScript执行时间、使用代码分割')
    }
    
    if (cls > 0.1) {
      recommendations.push('优化累积布局偏移 (CLS): 为图片和广告设置尺寸、避免动态插入内容')
    }
    
    if (inp > 200) {
      recommendations.push('优化交互到下次绘制 (INP): 减少长时间任务、优化事件处理')
    }
    
    if (ttfb > 600) {
      recommendations.push('优化首字节时间 (TTFB): 使用CDN、优化服务器响应、启用缓存')
    }
    
    if (fcp > 1800) {
      recommendations.push('优化首次内容绘制 (FCP): 减少阻塞资源、优化关键渲染路径')
    }
    
    return recommendations
  }
  
  /**
   * 发送性能数据
   */
  sendMetrics(): void {
    if (typeof window === 'undefined') return
    
    const report = this.getPerformanceReport()
    
    // 使用sendBeacon发送数据
    if (navigator.sendBeacon) {
      const data = JSON.stringify({
        ...report,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        connection: (navigator as any).connection?.effectiveType || 'unknown'
      })
      
      navigator.sendBeacon('/api/performance', data)
    } else {
      // 降级到fetch
      fetch('/api/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...report,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          connection: (navigator as any).connection?.effectiveType || 'unknown'
        })
      }).catch(console.error)
    }
  }
  
  /**
   * 清理观察器
   */
  cleanup(): void {
    this.observers.forEach(observer => {
      observer.disconnect()
    })
    this.observers = []
  }
  
  /**
   * 重置指标
   */
  reset(): void {
    this.metrics = {
      lcp: 0,
      fid: 0,
      cls: 0,
      inp: 0,
      ttfb: 0,
      fcp: 0,
      tti: 0,
      fmp: 0
    }
  }
}

/**
 * 创建性能监控实例
 */
export const performanceMonitor = new PerformanceMonitor()

/**
 * 性能监控Hook
 */
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: 0,
    fid: 0,
    cls: 0,
    inp: 0,
    ttfb: 0,
    fcp: 0,
    tti: 0,
    fmp: 0
  })
  
  const [isPassing, setIsPassing] = useState(false)
  const [grade, setGrade] = useState<'A' | 'B' | 'C' | 'D' | 'F'>('F')
  
  useEffect(() => {
    // 初始化性能监控
    performanceMonitor.init()
    
    // 定期更新指标
    const interval = setInterval(() => {
      const currentMetrics = performanceMonitor.getMetrics()
      const currentIsPassing = performanceMonitor.checkPerformance()
      const currentGrade = performanceMonitor.getPerformanceGrade()
      
      setMetrics(currentMetrics)
      setIsPassing(currentIsPassing)
      setGrade(currentGrade)
    }, 1000)
    
    return () => {
      clearInterval(interval)
      performanceMonitor.cleanup()
    }
  }, [])
  
  return {
    metrics,
    isPassing,
    grade,
    getReport: () => performanceMonitor.getPerformanceReport(),
    sendMetrics: () => performanceMonitor.sendMetrics()
  }
}

/**
 * 性能监控组件
 */
export function PerformanceMonitorComponent() {
  const { metrics, isPassing, grade, getReport } = usePerformanceMonitor()
  
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  
  const report = getReport()
  
  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">性能监控</h3>
        <span className={`text-xs px-2 py-1 rounded ${
          isPassing ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {grade}
        </span>
      </div>
      
      <div className="space-y-1 text-xs">
        <div>LCP: {metrics.lcp.toFixed(0)}ms</div>
        <div>FID: {metrics.fid.toFixed(0)}ms</div>
        <div>CLS: {metrics.cls.toFixed(3)}</div>
        <div>INP: {metrics.inp.toFixed(0)}ms</div>
        <div>TTFB: {metrics.ttfb.toFixed(0)}ms</div>
        <div>FCP: {metrics.fcp.toFixed(0)}ms</div>
      </div>
      
      {report.recommendations.length > 0 && (
        <div className="mt-2">
          <div className="text-xs font-medium text-muted-foreground mb-1">建议:</div>
          <ul className="text-xs space-y-1">
            {report.recommendations.slice(0, 2).map((rec, index) => (
              <li key={index} className="text-muted-foreground">• {rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/**
 * 默认导出
 */
export default performanceMonitor
