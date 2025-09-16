'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { ModelPerformanceMetrics } from '@/types/model-config';

interface ModelMonitorProps {
  timeRange?: '24h' | '7d' | '30d';
}

export function ModelMonitor({
  timeRange = '24h',
}: ModelMonitorProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>(timeRange);
  const [metrics, setMetrics] = useState<ModelPerformanceMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  // 模拟数据
  useEffect(() => {
    const mockMetrics: ModelPerformanceMetrics[] = [
      {
        modelId: '1',
        avgResponseTime: 1200,
        successRate: 0.95,
        errorRate: 0.05,
        totalRequests: 1250,
        totalTokens: 45000,
        totalCost: 1.35,
        last24Hours: {
          requests: 150,
          tokens: 5400,
          cost: 0.16,
          avgResponseTime: 1180,
        },
        last7Days: {
          requests: 1050,
          tokens: 37800,
          cost: 1.13,
          avgResponseTime: 1220,
        },
        last30Days: {
          requests: 4500,
          tokens: 162000,
          cost: 4.86,
          avgResponseTime: 1250,
        },
      },
      {
        modelId: '2',
        avgResponseTime: 800,
        successRate: 0.92,
        errorRate: 0.08,
        totalRequests: 890,
        totalTokens: 32000,
        totalCost: 0.64,
        last24Hours: {
          requests: 120,
          tokens: 4320,
          cost: 0.09,
          avgResponseTime: 780,
        },
        last7Days: {
          requests: 840,
          tokens: 30240,
          cost: 0.6,
          avgResponseTime: 820,
        },
        last30Days: {
          requests: 3600,
          tokens: 129600,
          cost: 2.59,
          avgResponseTime: 850,
        },
      },
    ];

    setMetrics(mockMetrics);
    setLoading(false);
  }, [selectedTimeRange]);

  const getCurrentMetrics = (model: ModelPerformanceMetrics) => {
    switch (selectedTimeRange) {
      case '24h':
        return model.last24Hours;
      case '7d':
        return model.last7Days;
      case '30d':
        return model.last30Days;
      default:
        return model.last24Hours;
    }
  };

  const getStatusColor = (rate: number) => {
    if (rate >= 0.95) return 'text-green-600';
    if (rate >= 0.9) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (rate: number) => {
    if (rate >= 0.95) return <CheckCircle className='h-4 w-4 text-green-600' />;
    if (rate >= 0.9) return <AlertCircle className='h-4 w-4 text-yellow-600' />;
    return <XCircle className='h-4 w-4 text-red-600' />;
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* 时间范围选择 */}
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>模型性能监控</h2>
        <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange as (value: string) => void}>
          <SelectTrigger className='w-40'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='24h'>最近24小时</SelectItem>
            <SelectItem value='7d'>最近7天</SelectItem>
            <SelectItem value='30d'>最近30天</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 概览卡片 */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>总请求数</p>
                <p className='text-2xl font-bold'>
                  {metrics
                    .reduce((sum, m) => sum + getCurrentMetrics(m).requests, 0)
                    .toLocaleString()}
                </p>
              </div>
              <Activity className='h-8 w-8 text-blue-600' />
            </div>
            <div className='flex items-center mt-2'>
              <TrendingUp className='h-4 w-4 text-green-600 mr-1' />
              <span className='text-sm text-green-600'>+12.5%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  平均响应时间
                </p>
                <p className='text-2xl font-bold'>
                  {Math.round(
                    metrics.reduce(
                      (sum, m) => sum + getCurrentMetrics(m).avgResponseTime,
                      0
                    ) / metrics.length
                  )}
                  ms
                </p>
              </div>
              <Clock className='h-8 w-8 text-orange-600' />
            </div>
            <div className='flex items-center mt-2'>
              <TrendingDown className='h-4 w-4 text-green-600 mr-1' />
              <span className='text-sm text-green-600'>-5.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>成功率</p>
                <p className='text-2xl font-bold'>
                  {Math.round(
                    (metrics.reduce((sum, m) => sum + m.successRate, 0) /
                      metrics.length) *
                      100
                  )}
                  %
                </p>
              </div>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
            <div className='flex items-center mt-2'>
              <TrendingUp className='h-4 w-4 text-green-600 mr-1' />
              <span className='text-sm text-green-600'>+2.1%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>总成本</p>
                <p className='text-2xl font-bold'>
                  $
                  {metrics
                    .reduce((sum, m) => sum + getCurrentMetrics(m).cost, 0)
                    .toFixed(2)}
                </p>
              </div>
              <DollarSign className='h-8 w-8 text-green-600' />
            </div>
            <div className='flex items-center mt-2'>
              <TrendingUp className='h-4 w-4 text-red-600 mr-1' />
              <span className='text-sm text-red-600'>+8.3%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细性能表格 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BarChart3 className='h-5 w-5' />
            模型性能详情
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>模型名称</TableHead>
                <TableHead>请求数</TableHead>
                <TableHead>平均响应时间</TableHead>
                <TableHead>成功率</TableHead>
                <TableHead>错误率</TableHead>
                <TableHead>总令牌数</TableHead>
                <TableHead>成本</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map(metric => {
                const current = getCurrentMetrics(metric);
                return (
                  <TableRow key={metric.modelId}>
                    <TableCell className='font-medium'>
                      Model {metric.modelId}
                    </TableCell>
                    <TableCell>{current.requests.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Clock className='h-4 w-4 text-gray-400' />
                        {current.avgResponseTime}ms
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        {getStatusIcon(metric.successRate)}
                        <span className={getStatusColor(metric.successRate)}>
                          {(metric.successRate * 100).toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant='destructive'>
                        {(metric.errorRate * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{current.tokens.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1'>
                        <DollarSign className='h-4 w-4 text-green-600' />$
                        {current.cost.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          metric.successRate >= 0.95 ? 'default' : 'secondary'
                        }
                        className={
                          metric.successRate >= 0.95
                            ? 'bg-green-100 text-green-800'
                            : ''
                        }
                      >
                        {metric.successRate >= 0.95 ? '健康' : '警告'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 性能趋势图表 */}
      <Card>
        <CardHeader>
          <CardTitle>性能趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='h-64 flex items-center justify-center text-gray-500'>
            <div className='text-center'>
              <BarChart3 className='h-12 w-12 mx-auto mb-2' />
              <p>性能趋势图表</p>
              <p className='text-sm'>集成图表库后显示详细趋势</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 错误监控 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <AlertCircle className='h-5 w-5' />
            错误监控
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {metrics.map(metric => (
              <div
                key={metric.modelId}
                className='flex items-center justify-between p-4 border rounded-lg'
              >
                <div>
                  <h4 className='font-medium'>Model {metric.modelId}</h4>
                  <p className='text-sm text-gray-600'>
                    错误率: {(metric.errorRate * 100).toFixed(1)}%
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge
                    variant={
                      metric.errorRate > 0.1 ? 'destructive' : 'secondary'
                    }
                  >
                    {metric.errorRate > 0.1 ? '高错误率' : '正常'}
                  </Badge>
                  <Button variant='outline' size='sm'>
                    查看详情
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
