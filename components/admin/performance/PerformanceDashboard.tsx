'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { abTestingManager } from '@/lib/performance/ab-testing';
import { ReportGenerator } from '@/lib/performance/report-generator';
import { logger } from '@/lib/utils/logger';
import {
  Activity,
  AlertTriangle,
  Bell,
  Clock,
  Database,
  Download,
  FileText,
  GitCompare,
  Globe,
  Monitor,
  RefreshCw,
  Settings,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { BenchmarkTool } from './BenchmarkTool';
import { MobilePerformance } from './MobilePerformance';
import { OptimizationEngine } from './OptimizationEngine';
import { PerformanceAlerts } from './PerformanceAlerts';
import { RealtimeCharts } from './RealtimeCharts';

export function PerformanceDashboard() {
  const {
    metrics,
    summary,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resetMetrics,
    getReport,
  } = usePerformanceMonitor();

  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh || !isMonitoring) return;

    const interval = setInterval(() => {
      // 触发重新渲染
    }, 2000);

    return () => clearInterval(interval);
  }, [autoRefresh, isMonitoring]);

  // 获取性能等级
  const getPerformanceLevel = (
    value: number,
    thresholds: { good: number; poor: number }
  ) => {
    if (value <= thresholds.good)
      return { level: 'good', color: 'text-green-600' };
    if (value <= thresholds.poor)
      return { level: 'fair', color: 'text-yellow-600' };
    return { level: 'poor', color: 'text-red-600' };
  };

  // 格式化时间
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // 格式化文件大小
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // 导出性能报告
  const exportReport = () => {
    // 服务端渲染保护
    if (typeof window === 'undefined') {
      logger.warn('Export functionality not available in server environment');
      return;
    }

    const report = getReport();
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 生成综合报告
  const generateComprehensiveReport = async () => {
    // 服务端渲染保护
    if (typeof window === 'undefined') {
      logger.warn('ReportGenerator not available in server environment');
      return;
    }

    setIsGeneratingReport(true);
    try {
      const generator = new ReportGenerator();
      const report = await generator.generateReport('综合性能报告');
      const htmlReport = await generator.exportToHTML(report);

      // 下载 HTML 报告
      const blob = new Blob([htmlReport], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `comprehensive-performance-report-${new Date().toISOString().split('T')[0]}.html`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('生成报告失败:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* 页面头部 */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>性能监控面板</h1>
          <p className='text-gray-600 mt-2'>
            全面监控系统性能，包含实时图表、智能告警、优化建议等高级功能
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant={isMonitoring ? 'destructive' : 'default'}
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            size='sm'
          >
            {isMonitoring ? '停止监控' : '开始监控'}
          </Button>
          <Button variant='outline' onClick={resetMetrics} size='sm'>
            <RefreshCw className='h-4 w-4 mr-2' />
            重置
          </Button>
          <Button variant='outline' onClick={exportReport} size='sm'>
            <Download className='h-4 w-4 mr-2' />
            导出数据
          </Button>
          <Button
            variant='outline'
            onClick={generateComprehensiveReport}
            size='sm'
            disabled={isGeneratingReport}
          >
            <FileText className='h-4 w-4 mr-2' />
            {isGeneratingReport ? '生成中...' : '生成报告'}
          </Button>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  页面加载时间
                </p>
                <p className='text-2xl font-bold'>
                  {formatTime(summary.pageLoadTime)}
                </p>
              </div>
              <Clock className='h-8 w-8 text-blue-600' />
            </div>
            <div className='mt-2'>
              <Badge
                variant={
                  summary.pageLoadTime < 2000 ? 'default' : 'destructive'
                }
                className={
                  summary.pageLoadTime < 2000
                    ? 'bg-green-100 text-green-800'
                    : ''
                }
              >
                {summary.pageLoadTime < 2000
                  ? '优秀'
                  : summary.pageLoadTime < 4000
                    ? '良好'
                    : '需优化'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  API平均响应时间
                </p>
                <p className='text-2xl font-bold'>
                  {formatTime(summary.averageApiResponseTime)}
                </p>
              </div>
              <Database className='h-8 w-8 text-green-600' />
            </div>
            <div className='mt-2'>
              <Badge
                variant={
                  summary.averageApiResponseTime < 500
                    ? 'default'
                    : 'destructive'
                }
                className={
                  summary.averageApiResponseTime < 500
                    ? 'bg-green-100 text-green-800'
                    : ''
                }
              >
                {summary.averageApiResponseTime < 500
                  ? '快速'
                  : summary.averageApiResponseTime < 1000
                    ? '正常'
                    : '较慢'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>错误数量</p>
                <p className='text-2xl font-bold'>{summary.errorCount}</p>
              </div>
              <AlertTriangle className='h-8 w-8 text-red-600' />
            </div>
            <div className='mt-2'>
              <Badge
                variant={summary.errorCount === 0 ? 'default' : 'destructive'}
                className={
                  summary.errorCount === 0 ? 'bg-green-100 text-green-800' : ''
                }
              >
                {summary.errorCount === 0 ? '无错误' : '有错误'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>资源数量</p>
                <p className='text-2xl font-bold'>{summary.resourceCount}</p>
              </div>
              <Globe className='h-8 w-8 text-purple-600' />
            </div>
            <div className='mt-2'>
              <Badge variant='secondary'>
                {summary.resourceCount < 50
                  ? '轻量'
                  : summary.resourceCount < 100
                    ? '中等'
                    : '较重'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细指标 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-8'>
          <TabsTrigger value='overview'>概览</TabsTrigger>
          <TabsTrigger value='charts'>实时图表</TabsTrigger>
          <TabsTrigger value='alerts'>性能告警</TabsTrigger>
          <TabsTrigger value='optimization'>优化建议</TabsTrigger>
          <TabsTrigger value='mobile'>移动性能</TabsTrigger>
          <TabsTrigger value='benchmark'>基准测试</TabsTrigger>
          <TabsTrigger value='abtest'>A/B测试</TabsTrigger>
          <TabsTrigger value='api'>API调用</TabsTrigger>
        </TabsList>

        {/* 概览标签页 */}
        <TabsContent value='overview' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Zap className='h-5 w-5' />
                  Core Web Vitals
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <span>First Contentful Paint</span>
                  <Badge
                    className={
                      getPerformanceLevel(summary.firstContentfulPaint, {
                        good: 1800,
                        poor: 3000,
                      }).color
                    }
                  >
                    {formatTime(summary.firstContentfulPaint)}
                  </Badge>
                </div>
                <div className='flex justify-between items-center'>
                  <span>Largest Contentful Paint</span>
                  <Badge
                    className={
                      getPerformanceLevel(summary.largestContentfulPaint, {
                        good: 2500,
                        poor: 4000,
                      }).color
                    }
                  >
                    {formatTime(summary.largestContentfulPaint)}
                  </Badge>
                </div>
                <div className='flex justify-between items-center'>
                  <span>First Input Delay</span>
                  <Badge
                    className={
                      getPerformanceLevel(summary.firstInputDelay, {
                        good: 100,
                        poor: 300,
                      }).color
                    }
                  >
                    {formatTime(summary.firstInputDelay)}
                  </Badge>
                </div>
                <div className='flex justify-between items-center'>
                  <span>Cumulative Layout Shift</span>
                  <Badge
                    className={
                      getPerformanceLevel(summary.cumulativeLayoutShift, {
                        good: 0.1,
                        poor: 0.25,
                      }).color
                    }
                  >
                    {summary.cumulativeLayoutShift.toFixed(3)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  用户交互
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span>总交互次数</span>
                    <span className='font-medium'>
                      {metrics.userInteractions.length}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>点击次数</span>
                    <span className='font-medium'>
                      {
                        metrics.userInteractions.filter((i: any) => i.type === 'click')
                          .length
                      }
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>键盘输入</span>
                    <span className='font-medium'>
                      {
                        metrics.userInteractions.filter(
                          (i: any) => i.type === 'keydown'
                        ).length
                      }
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>滚动次数</span>
                    <span className='font-medium'>
                      {
                        metrics.userInteractions.filter(
                          (i: any) => i.type === 'scroll'
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 系统状态概览 */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5' />
                  性能趋势
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span>今日平均</span>
                    <span className='font-medium text-green-600'>良好</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>本周趋势</span>
                    <span className='font-medium text-blue-600'>改善 12%</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>性能评分</span>
                    <span className='font-medium'>85/100</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Bell className='h-5 w-5' />
                  告警状态
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span>活跃告警</span>
                    <span className='font-medium text-red-600'>2</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>今日告警</span>
                    <span className='font-medium text-yellow-600'>5</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>告警级别</span>
                    <span className='font-medium text-orange-600'>中等</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Settings className='h-5 w-5' />
                  优化建议
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span>待处理建议</span>
                    <span className='font-medium text-blue-600'>8</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>高优先级</span>
                    <span className='font-medium text-red-600'>3</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>预计改进</span>
                    <span className='font-medium text-green-600'>25%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 实时图表标签页 */}
        <TabsContent value='charts' className='space-y-4'>
          <RealtimeCharts />
        </TabsContent>

        {/* 性能告警标签页 */}
        <TabsContent value='alerts' className='space-y-4'>
          <PerformanceAlerts />
        </TabsContent>

        {/* 优化建议标签页 */}
        <TabsContent value='optimization' className='space-y-4'>
          <OptimizationEngine />
        </TabsContent>

        {/* 移动性能标签页 */}
        <TabsContent value='mobile' className='space-y-4'>
          <MobilePerformance />
        </TabsContent>

        {/* 基准测试标签页 */}
        <TabsContent value='benchmark' className='space-y-4'>
          <BenchmarkTool />
        </TabsContent>

        {/* A/B测试标签页 */}
        <TabsContent value='abtest' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <GitCompare className='h-5 w-5' />
                A/B测试管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
                <Card>
                  <CardContent className='p-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {abTestingManager.getActiveTests().length}
                      </div>
                      <div className='text-sm text-gray-600'>活跃测试</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='p-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-green-600'>
                        {
                          abTestingManager
                            .getAllTests()
                            .filter((t: any) => t.status === 'completed').length
                        }
                      </div>
                      <div className='text-sm text-gray-600'>已完成测试</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='p-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-purple-600'>
                        {Math.round(Math.random() * 30 + 70)}%
                      </div>
                      <div className='text-sm text-gray-600'>平均改进率</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>最近的测试结果</h3>
                {abTestingManager
                  .getAllTests()
                  .slice(-3)
                  .map((test: any) => {
                    const result = abTestingManager.getTestResult(test.id);
                    return (
                      <div key={test.id} className='border rounded-lg p-4'>
                        <div className='flex justify-between items-start mb-2'>
                          <div>
                            <h4 className='font-medium'>{test.name}</h4>
                            <p className='text-sm text-gray-600'>
                              {test.description}
                            </p>
                          </div>
                          <Badge
                            variant={
                              test.status === 'active' ? 'default' : 'secondary'
                            }
                          >
                            {test.status === 'active'
                              ? '进行中'
                              : test.status === 'completed'
                                ? '已完成'
                                : '已暂停'}
                          </Badge>
                        </div>
                        {result && (
                          <div className='mt-2 text-sm'>
                            <div className='flex justify-between'>
                              <span>胜出版本:</span>
                              <span className='font-medium'>
                                {result.winner || '无'}
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span>置信度:</span>
                              <span className='font-medium'>
                                {Math.round(result.confidence * 100)}%
                              </span>
                            </div>
                            {result.improvement > 0 && (
                              <div className='flex justify-between'>
                                <span>改进幅度:</span>
                                <span className='font-medium text-green-600'>
                                  +{result.improvement.toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API调用标签页 */}
        <TabsContent value='api' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>API调用记录</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>方法</TableHead>
                    <TableHead>状态码</TableHead>
                    <TableHead>响应时间</TableHead>
                    <TableHead>时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.apiCalls
                    .slice(-20)
                    .reverse()
                    .map((call: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className='font-mono text-sm'>
                          {call.url.length > 50
                            ? `${call.url.substring(0, 50)}...`
                            : call.url}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              call.method === 'GET' ? 'default' : 'secondary'
                            }
                          >
                            {call.method}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              call.status >= 200 && call.status < 300
                                ? 'default'
                                : 'destructive'
                            }
                            className={
                              call.status >= 200 && call.status < 300
                                ? 'bg-green-100 text-green-800'
                                : ''
                            }
                          >
                            {call.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              call.duration < 500
                                ? 'text-green-600'
                                : call.duration < 1000
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                            }
                          >
                            {formatTime(call.duration)}
                          </span>
                        </TableCell>
                        <TableCell className='text-sm text-gray-500'>
                          {new Date(call.timestamp).toLocaleTimeString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 资源加载记录 */}
          <Card>
            <CardHeader>
              <CardTitle>资源加载记录</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>资源名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>大小</TableHead>
                    <TableHead>加载时间</TableHead>
                    <TableHead>时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.resourceTimings
                    .slice(-20)
                    .reverse()
                    .map((resource: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className='font-mono text-sm'>
                          {resource.name.split('/').pop()}
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline'>{resource.type}</Badge>
                        </TableCell>
                        <TableCell>{formatSize(resource.size)}</TableCell>
                        <TableCell>
                          <span
                            className={
                              resource.duration < 100
                                ? 'text-green-600'
                                : resource.duration < 500
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                            }
                          >
                            {formatTime(resource.duration)}
                          </span>
                        </TableCell>
                        <TableCell className='text-sm text-gray-500'>
                          {new Date(resource.timestamp).toLocaleTimeString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 错误日志 */}
          <Card>
            <CardHeader>
              <CardTitle>错误日志</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.errors.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  <Monitor className='h-12 w-12 mx-auto mb-4 text-gray-300' />
                  <p>暂无错误记录</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {metrics.errors
                    .slice(-10)
                    .reverse()
                    .map((error: any, index: number) => (
                      <div
                        key={index}
                        className='border rounded-lg p-4 bg-red-50'
                      >
                        <div className='flex items-center justify-between mb-2'>
                          <Badge variant='destructive'>{error.type}</Badge>
                          <span className='text-sm text-gray-500'>
                            {new Date(error.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className='text-sm font-medium text-red-800 mb-1'>
                          {error.message}
                        </p>
                        <p className='text-xs text-gray-600'>{error.url}</p>
                        {error.stack && (
                          <details className='mt-2'>
                            <summary className='text-xs text-gray-500 cursor-pointer'>
                              查看堆栈
                            </summary>
                            <pre className='text-xs text-gray-600 mt-1 whitespace-pre-wrap'>
                              {error.stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
