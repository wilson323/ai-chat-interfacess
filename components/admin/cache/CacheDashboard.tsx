"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { 
  Database, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Trash2,
  Zap,
  Settings,
  BarChart3,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  totalKeys: number
  memoryUsage: number
  connectedClients: number
  uptime: number
}

interface CacheStrategy {
  name: string
  description: string
  isActive: boolean
}

interface OptimizationResult {
  recommendations: string[]
  newPolicy: Record<string, any>
}

export function CacheDashboard() {
  const [stats, setStats] = useState<CacheStats | null>(null)
  const [strategies, setStrategies] = useState<CacheStrategy[]>([])
  const [currentStrategy, setCurrentStrategy] = useState<string>('')
  const [hotKeys, setHotKeys] = useState<Array<{ key: string; accessCount: number }>>([])
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // 获取缓存统计信息
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/cache?action=stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data.stats)
        setStrategies(data.data.strategies)
        setCurrentStrategy(data.data.currentStrategy.name)
      }
    } catch (error) {
      console.error('获取缓存统计失败:', error)
    }
  }

  // 获取热点键
  const fetchHotKeys = async () => {
    try {
      const response = await fetch('/api/admin/cache?action=hotkeys&limit=10')
      const data = await response.json()
      
      if (data.success) {
        setHotKeys(data.data)
      }
    } catch (error) {
      console.error('获取热点键失败:', error)
    }
  }

  // 获取优化建议
  const fetchOptimization = async () => {
    try {
      const response = await fetch('/api/admin/cache?action=optimize')
      const data = await response.json()
      
      if (data.success) {
        setOptimization(data.data)
      }
    } catch (error) {
      console.error('获取优化建议失败:', error)
    }
  }

  // 切换缓存策略
  const switchStrategy = async (strategyName: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'setStrategy',
          strategyName
        })
      })

      const data = await response.json()
      if (data.success) {
        setCurrentStrategy(strategyName)
        await fetchStats()
      }
    } catch (error) {
      console.error('切换缓存策略失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 清空所有缓存
  const flushAll = async () => {
    if (!confirm('确定要清空所有缓存吗？此操作不可恢复。')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'flushAll'
        })
      })

      const data = await response.json()
      if (data.success) {
        await fetchStats()
      }
    } catch (error) {
      console.error('清空缓存失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 执行缓存优化
  const runOptimization = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'optimize'
        })
      })

      const data = await response.json()
      if (data.success) {
        setOptimization(data.data)
        await fetchStats()
      }
    } catch (error) {
      console.error('执行优化失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchHotKeys()
    fetchOptimization()
  }, [])

  // 格式化时间
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}天 ${hours}小时`
    if (hours > 0) return `${hours}小时 ${minutes}分钟`
    return `${minutes}分钟`
  }

  // 格式化内存使用
  const formatMemory = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">缓存监控面板</h1>
          <p className="text-gray-600 mt-2">Redis缓存状态监控和优化管理</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchStats}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button
            onClick={runOptimization}
            disabled={loading}
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            优化
          </Button>
          <Button
            onClick={flushAll}
            disabled={loading}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            清空
          </Button>
        </div>
      </div>

      {/* 缓存状态概览 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">命中率</p>
                  <p className="text-2xl font-bold">
                    {stats.hitRate.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2">
                <Badge 
                  variant={stats.hitRate >= 80 ? "default" : stats.hitRate >= 60 ? "secondary" : "destructive"}
                  className={stats.hitRate >= 80 ? "bg-green-100 text-green-800" : stats.hitRate >= 60 ? "bg-yellow-100 text-yellow-800" : ""}
                >
                  {stats.hitRate >= 80 ? '优秀' : stats.hitRate >= 60 ? '良好' : '需优化'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总键数</p>
                  <p className="text-2xl font-bold">{stats.totalKeys}</p>
                </div>
                <Database className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  命中: {stats.hits} | 未命中: {stats.misses}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">内存使用</p>
                  <p className="text-2xl font-bold">
                    {formatMemory(stats.memoryUsage)}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mt-2">
                <Badge variant="outline">
                  {stats.connectedClients} 个连接
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">运行时间</p>
                  <p className="text-2xl font-bold">
                    {formatUptime(stats.uptime)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="mt-2">
                <Badge variant="outline">
                  {currentStrategy}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 优化建议 */}
      {optimization && optimization.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              优化建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {optimization.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 详细监控信息 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="strategies">策略</TabsTrigger>
          <TabsTrigger value="hotkeys">热点键</TabsTrigger>
          <TabsTrigger value="settings">设置</TabsTrigger>
        </TabsList>

        {/* 概览标签页 */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  性能指标
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">缓存命中次数</span>
                      <span className="font-medium text-green-600">{stats.hits}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">缓存未命中次数</span>
                      <span className="font-medium text-red-600">{stats.misses}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">总请求次数</span>
                      <span className="font-medium">{stats.hits + stats.misses}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">命中率</span>
                      <span className="font-medium">{stats.hitRate.toFixed(2)}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  系统信息
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">当前策略</span>
                      <Badge variant="outline">{currentStrategy}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">连接客户端数</span>
                      <span className="font-medium">{stats.connectedClients}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">内存使用量</span>
                      <span className="font-medium">{formatMemory(stats.memoryUsage)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">运行时间</span>
                      <span className="font-medium">{formatUptime(stats.uptime)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 策略标签页 */}
        <TabsContent value="strategies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>缓存策略管理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">选择缓存策略</label>
                  <Select value={currentStrategy} onValueChange={switchStrategy} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {strategies.map((strategy) => (
                        <SelectItem key={strategy.name} value={strategy.name}>
                          <div className="flex items-center gap-2">
                            <span>{strategy.name}</span>
                            {strategy.isActive && (
                              <Badge variant="outline" className="text-xs">当前</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  {strategies.map((strategy) => (
                    <div key={strategy.name} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{strategy.name}</h4>
                          <p className="text-sm text-gray-600">{strategy.description}</p>
                        </div>
                        {strategy.isActive && (
                          <Badge className="bg-green-100 text-green-800">活跃</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 热点键标签页 */}
        <TabsContent value="hotkeys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>热点键分析</CardTitle>
            </CardHeader>
            <CardContent>
              {hotKeys.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>暂无热点键数据</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>键名</TableHead>
                      <TableHead>访问次数</TableHead>
                      <TableHead>热度</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hotKeys.map((key, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">
                          {key.key.length > 50 ? `${key.key.substring(0, 50)}...` : key.key}
                        </TableCell>
                        <TableCell>{key.accessCount}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={key.accessCount > 100 ? "default" : key.accessCount > 50 ? "secondary" : "outline"}
                            className={key.accessCount > 100 ? "bg-red-100 text-red-800" : key.accessCount > 50 ? "bg-yellow-100 text-yellow-800" : ""}
                          >
                            {key.accessCount > 100 ? '高' : key.accessCount > 50 ? '中' : '低'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 设置标签页 */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>缓存设置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">危险操作</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    以下操作将影响缓存数据，请谨慎使用
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={flushAll}
                      disabled={loading}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      清空所有缓存
                    </Button>
                    <Button
                      onClick={runOptimization}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      执行优化
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
