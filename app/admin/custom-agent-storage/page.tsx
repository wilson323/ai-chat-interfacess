"use client"

import { useState, useEffect } from "react"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Database, 
  HardDrive, 
  Trash2, 
  Download, 
  Upload, 
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { logger } from "@/lib/utils/logger"

interface StorageStats {
  totalSizeMB: number
  maxSizeMB: number
  usagePercent: number
  chatCount: number
}

export default function CustomAgentStoragePage() {
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/custom-agent-storage/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      } else {
        throw new Error('获取存储统计失败')
      }
    } catch (error) {
      logger.error('获取存储统计失败:', error)
      toast({
        title: "错误",
        description: "获取存储统计失败",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClearData = async () => {
    if (!confirm('确定要清除所有自研智能体数据吗？此操作不可恢复！')) {
      return
    }

    setActionLoading('clear')
    try {
      const response = await fetch('/api/admin/custom-agent-storage/clear', {
        method: 'POST'
      })
      
      if (response.ok) {
        toast({
          title: "成功",
          description: "自研智能体数据已清除",
        })
        await fetchStats()
      } else {
        throw new Error('清除数据失败')
      }
    } catch (error) {
      logger.error('清除数据失败:', error)
      toast({
        title: "错误",
        description: "清除数据失败",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleExportData = async () => {
    setActionLoading('export')
    try {
      const response = await fetch('/api/admin/custom-agent-storage/export')
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `custom-agent-data-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "成功",
          description: "数据导出成功",
        })
      } else {
        throw new Error('导出数据失败')
      }
    } catch (error) {
      logger.error('导出数据失败:', error)
      toast({
        title: "错误",
        description: "导出数据失败",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setActionLoading('import')
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/custom-agent-storage/import', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "数据导入成功",
        })
        await fetchStats()
      } else {
        throw new Error('导入数据失败')
      }
    } catch (error) {
      logger.error('导入数据失败:', error)
      toast({
        title: "错误",
        description: "导入数据失败",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const getUsageColor = (percent: number) => {
    if (percent < 50) return "text-green-600"
    if (percent < 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getUsageBadgeVariant = (percent: number) => {
    if (percent < 50) return "default"
    if (percent < 80) return "secondary"
    return "destructive"
  }

  return (
    <Layout isAdmin={true}>
      <div className="max-w-6xl mx-auto mt-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">自研智能体存储管理</h1>
          <Button 
            onClick={fetchStats} 
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>

        {stats && (
          <>
            {/* 存储概览 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总存储大小</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSizeMB.toFixed(2)} MB</div>
                  <p className="text-xs text-muted-foreground">
                    最大 {stats.maxSizeMB} MB
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">使用率</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Badge variant={getUsageBadgeVariant(stats.usagePercent)}>
                      {stats.usagePercent.toFixed(1)}%
                    </Badge>
                  </div>
                  <Progress 
                    value={stats.usagePercent} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">聊天记录数</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.chatCount}</div>
                  <p className="text-xs text-muted-foreground">
                    自研智能体记录
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">存储状态</CardTitle>
                  {stats.usagePercent > 80 ? (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.usagePercent > 80 ? '警告' : '正常'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.usagePercent > 80 ? '存储空间不足' : '存储空间充足'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 存储警告 */}
            {stats.usagePercent > 80 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  存储使用率已超过 80%，建议清理不必要的数据或增加存储空间。
                </AlertDescription>
              </Alert>
            )}

            {/* 操作按钮 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    清除数据
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    清除所有自研智能体的历史记录和文件数据。此操作不可恢复！
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={handleClearData}
                    disabled={actionLoading === 'clear'}
                  >
                    {actionLoading === 'clear' ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    清除所有数据
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    导出数据
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    导出所有自研智能体的配置和历史数据为JSON文件。
                  </p>
                  <Button 
                    onClick={handleExportData}
                    disabled={actionLoading === 'export'}
                  >
                    {actionLoading === 'export' ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    导出数据
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    导入数据
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    从JSON文件导入自研智能体配置和历史数据。
                  </p>
                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                      id="import-file"
                      disabled={actionLoading === 'import'}
                    />
                    <Button 
                      asChild
                      disabled={actionLoading === 'import'}
                    >
                      <label htmlFor="import-file" className="cursor-pointer">
                        {actionLoading === 'import' ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        选择文件导入
                      </label>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>加载中...</span>
          </div>
        )}
      </div>
    </Layout>
  )
}
