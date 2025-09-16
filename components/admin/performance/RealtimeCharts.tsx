'use client';
import { logger } from '@/lib/utils/logger';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import {
  enhancedMonitor,
  type PerformanceHistory,
  type PerformanceSummary,
} from '@/lib/performance/enhanced-monitor';

interface ChartDataPoint {
  timestamp: number;
  time: string;
  pageLoadTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  errorCount: number;
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
}

interface ResourceUsageData {
  name: string;
  value: number;
  color: string;
}

export function RealtimeCharts() {
  const [history, setHistory] = useState<PerformanceHistory[]>([]);
  const [currentSummary, setCurrentSummary] =
    useState<PerformanceSummary | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const allHistory = enhancedMonitor.getHistory();
      const filteredHistory = filterHistoryByTimeRange(allHistory, timeRange);
      setHistory(filteredHistory);
      setCurrentSummary(enhancedMonitor.getEnhancedSummary());
    } catch (error) {
      logger.error('Failed to load performance data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadData();

    if (autoRefresh) {
      const interval = setInterval(loadData, 5000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [timeRange, autoRefresh, loadData]);

  const filterHistoryByTimeRange = (
    allHistory: PerformanceHistory[],
    range: '1h' | '6h' | '24h'
  ): PerformanceHistory[] => {
    const now = Date.now();
    const ranges = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
    };

    return allHistory.filter(record => now - record.timestamp < ranges[range]);
  };

  const formatChartData = (history: PerformanceHistory[]): ChartDataPoint[] => {
    return history.map(record => ({
      timestamp: record.timestamp,
      time: new Date(record.timestamp).toLocaleTimeString(),
      pageLoadTime: record.summary.pageLoadTime,
      apiResponseTime: record.summary.averageApiResponseTime,
      memoryUsage: record.summary.memoryUsage / 1024 / 1024, // 转换为MB
      errorCount: record.summary.errorCount,
      fcp: record.summary.firstContentfulPaint,
      lcp: record.summary.largestContentfulPaint,
      fid: record.summary.firstInputDelay,
      cls: record.summary.cumulativeLayoutShift * 100, // 放大显示
    }));
  };

  const getResourceUsageData = (
    summary: PerformanceSummary
  ): ResourceUsageData[] => {
    const total = summary.memoryUsage + summary.resourceCount * 1024 * 1024;

    return [
      {
        name: 'JavaScript',
        value: summary.memoryUsage / 1024 / 1024,
        color: '#8884d8',
      },
      { name: 'Resources', value: summary.resourceCount * 2, color: '#82ca9d' },
      {
        name: 'Other',
        value: Math.max(0, (total - summary.memoryUsage) / 1024 / 1024),
        color: '#ffc658',
      },
    ];
  };

  const getPerformanceStatus = (summary: PerformanceSummary) => {
    const metrics = [
      { value: summary.pageLoadTime, threshold: 3000, weight: 0.3 },
      { value: summary.averageApiResponseTime, threshold: 1000, weight: 0.25 },
      { value: summary.firstContentfulPaint, threshold: 1800, weight: 0.2 },
      { value: summary.largestContentfulPaint, threshold: 2500, weight: 0.15 },
      { value: summary.cumulativeLayoutShift, threshold: 0.1, weight: 0.1 },
    ];

    let totalScore = 0;
    let totalWeight = 0;

    metrics.forEach(metric => {
      const score = Math.max(0, 100 - (metric.value / metric.threshold) * 100);
      totalScore += score * metric.weight;
      totalWeight += metric.weight;
    });

    const overallScore = totalScore / totalWeight;

    if (overallScore >= 80)
      return { level: 'excellent', color: 'text-green-600', icon: CheckCircle };
    if (overallScore >= 60)
      return { level: 'good', color: 'text-blue-600', icon: TrendingUp };
    if (overallScore >= 40)
      return { level: 'fair', color: 'text-yellow-600', icon: Activity };
    return { level: 'poor', color: 'text-red-600', icon: AlertTriangle };
  };

  const chartData = formatChartData(history);
  const resourceData = currentSummary
    ? getResourceUsageData(currentSummary)
    : [];
  const performanceStatus = currentSummary
    ? getPerformanceStatus(currentSummary)
    : null;

  
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className='space-y-6'>
      {/* 控制面板 */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <h2 className='text-2xl font-bold text-gray-900'>实时性能图表</h2>
          {performanceStatus && (
            <Badge className={`${performanceStatus.color} bg-white border`}>
              <performanceStatus.icon className='h-4 w-4 mr-1' />
              {performanceStatus.level === 'excellent' && '优秀'}
              {performanceStatus.level === 'good' && '良好'}
              {performanceStatus.level === 'fair' && '一般'}
              {performanceStatus.level === 'poor' && '需优化'}
            </Badge>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <Select
            value={timeRange}
            onValueChange={(value: '1h' | '6h' | '24h') => setTimeRange(value)}
          >
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='1h'>最近1小时</SelectItem>
              <SelectItem value='6h'>最近6小时</SelectItem>
              <SelectItem value='24h'>最近24小时</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size='sm'
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '自动刷新' : '手动刷新'}
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`}
            />
            刷新
          </Button>
        </div>
      </div>

      {/* 关键指标概览 */}
      {currentSummary && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    页面加载时间
                  </p>
                  <p className='text-xl font-bold'>
                    {formatTime(currentSummary.pageLoadTime)}
                  </p>
                </div>
                <Clock className='h-8 w-8 text-blue-600' />
              </div>
              <Badge
                className={
                  currentSummary.pageLoadTime < 3000
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }
              >
                {currentSummary.pageLoadTime < 3000 ? '良好' : '需优化'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    API响应时间
                  </p>
                  <p className='text-xl font-bold'>
                    {formatTime(currentSummary.averageApiResponseTime)}
                  </p>
                </div>
                <Zap className='h-8 w-8 text-green-600' />
              </div>
              <Badge
                className={
                  currentSummary.averageApiResponseTime < 1000
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }
              >
                {currentSummary.averageApiResponseTime < 1000 ? '快速' : '一般'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>内存使用</p>
                  <p className='text-xl font-bold'>
                    {(currentSummary.memoryUsage / 1024 / 1024).toFixed(1)}MB
                  </p>
                </div>
                <Activity className='h-8 w-8 text-purple-600' />
              </div>
              <Badge
                className={
                  currentSummary.memoryUsage < 100 * 1024 * 1024
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }
              >
                {currentSummary.memoryUsage < 100 * 1024 * 1024
                  ? '正常'
                  : '较高'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>错误数量</p>
                  <p className='text-xl font-bold'>
                    {currentSummary.errorCount}
                  </p>
                </div>
                <AlertTriangle className='h-8 w-8 text-red-600' />
              </div>
              <Badge
                className={
                  currentSummary.errorCount === 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }
              >
                {currentSummary.errorCount === 0 ? '无错误' : '有错误'}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 图表网格 */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* 页面加载时间趋势 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              页面加载时间趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='time' />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [formatTime(value), '加载时间']}
                  labelFormatter={label => `时间: ${label}`}
                />
                <Line
                  type='monotone'
                  dataKey='pageLoadTime'
                  stroke='#8884d8'
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <ReferenceLine
                  y={3000}
                  stroke='#ef4444'
                  strokeDasharray='5 5'
                  label={{ value: '阈值', position: 'top' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* API响应时间趋势 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Zap className='h-5 w-5' />
              API响应时间趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='time' />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [formatTime(value), '响应时间']}
                  labelFormatter={label => `时间: ${label}`}
                />
                <Area
                  type='monotone'
                  dataKey='apiResponseTime'
                  stroke='#82ca9d'
                  fill='#82ca9d'
                  fillOpacity={0.3}
                />
                <ReferenceLine
                  y={1000}
                  stroke='#ef4444'
                  strokeDasharray='5 5'
                  label={{ value: '阈值', position: 'top' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Web Vitals 综合图表 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='h-5 w-5' />
              Web Vitals 指标
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='time' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='fcp'
                  stroke='#8884d8'
                  name='FCP (ms)'
                  strokeWidth={2}
                />
                <Line
                  type='monotone'
                  dataKey='lcp'
                  stroke='#82ca9d'
                  name='LCP (ms)'
                  strokeWidth={2}
                />
                <Line
                  type='monotone'
                  dataKey='fid'
                  stroke='#ffc658'
                  name='FID (ms)'
                  strokeWidth={2}
                />
                <Line
                  type='monotone'
                  dataKey='cls'
                  stroke='#ff7300'
                  name='CLS (x100)'
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 内存使用趋势 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='h-5 w-5' />
              内存使用趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='time' />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [
                    `${value.toFixed(1)}MB`,
                    '内存使用',
                  ]}
                  labelFormatter={label => `时间: ${label}`}
                />
                <Area
                  type='monotone'
                  dataKey='memoryUsage'
                  stroke='#8884d8'
                  fill='#8884d8'
                  fillOpacity={0.3}
                />
                <ReferenceLine
                  y={100}
                  stroke='#ef4444'
                  strokeDasharray='5 5'
                  label={{ value: '阈值', position: 'top' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 错误计数图表 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5' />
              错误计数统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='time' />
                <YAxis />
                <Tooltip />
                <Bar dataKey='errorCount' fill='#ef4444' />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 资源使用分布 */}
        {currentSummary && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Activity className='h-5 w-5' />
                资源使用分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={resourceData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                      outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {resourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toFixed(1)}MB`,
                      '使用量',
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 数据统计 */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>数据统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='text-center'>
                <p className='text-sm text-gray-600'>数据点数</p>
                <p className='text-2xl font-bold'>{chartData.length}</p>
              </div>
              <div className='text-center'>
                <p className='text-sm text-gray-600'>平均加载时间</p>
                <p className='text-2xl font-bold'>
                  {formatTime(
                    chartData.reduce((sum, d) => sum + d.pageLoadTime, 0) /
                      chartData.length
                  )}
                </p>
              </div>
              <div className='text-center'>
                <p className='text-sm text-gray-600'>最高内存使用</p>
                <p className='text-2xl font-bold'>
                  {Math.max(...chartData.map(d => d.memoryUsage)).toFixed(1)}MB
                </p>
              </div>
              <div className='text-center'>
                <p className='text-sm text-gray-600'>总错误数</p>
                <p className='text-2xl font-bold'>
                  {chartData.reduce((sum, d) => sum + d.errorCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
