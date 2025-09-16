'use client';

import { useState, useEffect } from 'react';
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
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  CheckCircle,
  RefreshCw,
  Download,
} from 'lucide-react';
import type { ModelConfig } from '@/types/model-config';
import { AgentProvider } from '@/context/agent-context';
import { LanguageProvider } from '@/context/language-context';
import Link from 'next/link';

interface PerformanceData {
  timestamp: string;
  requests: number;
  responseTime: number;
  errorRate: number;
  cost: number;
}

interface ModelPerformanceMetrics {
  modelId: string;
  modelName: string;
  avgResponseTime: number;
  successRate: number;
  errorRate: number;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  last24Hours: {
    requests: number;
    tokens: number;
    cost: number;
    avgResponseTime: number;
  };
  last7Days: {
    requests: number;
    tokens: number;
    cost: number;
    avgResponseTime: number;
  };
  last30Days: {
    requests: number;
    tokens: number;
    cost: number;
    avgResponseTime: number;
  };
}

export default function ModelMonitorPage() {
  const [, setModels] = useState<ModelConfig[]>([]);
  const [metrics, setMetrics] = useState<ModelPerformanceMetrics[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPerformanceData = async () => {
      setLoading(true);

      // 模拟模型数据
      const mockModels: ModelConfig[] = [
        {
          id: '1',
          name: 'GPT-4 Turbo',
          type: 'openai',
          provider: 'OpenAI',
          version: 'gpt-4-turbo-preview',
          status: 'active',
          capabilities: [],
          parameters: {
            temperature: 0.7,
            maxTokens: 4000,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0,
            stopSequences: [],
            customParameters: {},
          },
          metadata: {
            description: '最新的GPT-4模型',
            tags: ['gpt-4'],
            category: 'General Purpose',
            costPerToken: 0.00003,
            latency: 1200,
            accuracy: 0.95,
            usageCount: 1250,
            version: '1.0.0',
            releaseDate: new Date('2024-01-01'),
          },
          isDefault: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
          createdBy: 'admin',
          updatedBy: 'admin',
        },
        {
          id: '2',
          name: 'Qwen-VL-Max',
          type: 'fastgpt',
          provider: 'Alibaba',
          version: 'qwen-vl-max',
          status: 'active',
          capabilities: [],
          parameters: {
            temperature: 0.7,
            maxTokens: 2000,
            topP: 0.9,
            frequencyPenalty: 0,
            presencePenalty: 0,
            stopSequences: [],
            customParameters: {},
          },
          metadata: {
            description: '阿里云多模态大模型',
            tags: ['qwen'],
            category: 'Multimodal',
            costPerToken: 0.00002,
            latency: 800,
            accuracy: 0.92,
            usageCount: 890,
            version: '2.0.0',
            releaseDate: new Date('2024-02-01'),
          },
          isDefault: false,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-10'),
          createdBy: 'admin',
          updatedBy: 'admin',
        },
      ];

      // 模拟性能指标数据
      const mockMetrics: ModelPerformanceMetrics[] = mockModels.map(model => ({
        modelId: model.id,
        modelName: model.name,
        avgResponseTime: model.metadata.latency,
        successRate: 99.2,
        errorRate: 0.8,
        totalRequests: model.metadata.usageCount,
        totalTokens: model.metadata.usageCount * 1000,
        totalCost: model.metadata.usageCount * model.metadata.costPerToken,
        last24Hours: {
          requests: Math.floor(model.metadata.usageCount * 0.1),
          tokens: Math.floor(model.metadata.usageCount * 100),
          cost: model.metadata.usageCount * 0.1 * model.metadata.costPerToken,
          avgResponseTime: model.metadata.latency,
        },
        last7Days: {
          requests: Math.floor(model.metadata.usageCount * 0.5),
          tokens: Math.floor(model.metadata.usageCount * 500),
          cost: model.metadata.usageCount * 0.5 * model.metadata.costPerToken,
          avgResponseTime: model.metadata.latency * 0.95,
        },
        last30Days: {
          requests: model.metadata.usageCount,
          tokens: model.metadata.usageCount * 1000,
          cost: model.metadata.usageCount * model.metadata.costPerToken,
          avgResponseTime: model.metadata.latency,
        },
      }));

      // 模拟时间序列数据
      const generateTimeSeriesData = (): PerformanceData[] => {
        const data: PerformanceData[] = [];
        const now = new Date();

        for (let i = 23; i >= 0; i--) {
          const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
          data.push({
            timestamp: timestamp.toISOString(),
            requests: Math.floor(Math.random() * 100) + 50,
            responseTime: Math.floor(Math.random() * 500) + 800,
            errorRate: Math.random() * 2,
            cost: Math.random() * 10 + 5,
          });
        }

        return data;
      };

      setModels(mockModels);
      setMetrics(mockMetrics);
      setPerformanceData(generateTimeSeriesData());
      setLoading(false);
    };

    loadPerformanceData();
  }, []);

  const getStatusIcon = (value: number, threshold: number, reverse = false) => {
    const isGood = reverse ? value <= threshold : value >= threshold;
    return isGood ? (
      <TrendingUp className='h-4 w-4 text-green-500' />
    ) : (
      <TrendingDown className='h-4 w-4 text-red-500' />
    );
  };

  const getStatusColor = (
    value: number,
    threshold: number,
    reverse = false
  ) => {
    const isGood = reverse ? value <= threshold : value >= threshold;
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  const exportData = () => {
    const data = {
      models: metrics,
      performanceData,
      exportTime: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `model-performance-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className='container mx-auto py-6'>
        <div className='text-center'>加载中...</div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <AgentProvider>
        <div className='max-w-7xl mx-auto mb-4'>
          <Link
            href='/admin'
            className='text-pantone369-500 hover:text-pantone369-600 flex items-center gap-1'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='m12 19-7-7 7-7'></path>
              <path d='M19 12H5'></path>
            </svg>
            返回管理员首页
          </Link>
        </div>

        <div className='container mx-auto py-6 space-y-6'>
          {/* 页面标题 */}
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>模型性能监控</h1>
              <p className='text-gray-600 mt-2'>
                实时监控AI模型的性能指标和使用情况
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className='w-32'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='1h'>1小时</SelectItem>
                  <SelectItem value='24h'>24小时</SelectItem>
                  <SelectItem value='7d'>7天</SelectItem>
                  <SelectItem value='30d'>30天</SelectItem>
                </SelectContent>
              </Select>
              <Button variant='outline' size='sm' onClick={exportData}>
                <Download className='h-4 w-4 mr-2' />
                导出数据
              </Button>
              <Button variant='outline' size='sm'>
                <RefreshCw className='h-4 w-4 mr-2' />
                刷新
              </Button>
            </div>
          </div>

          {/* 性能概览卡片 */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      总请求数
                    </p>
                    <p className='text-2xl font-bold'>
                      {metrics
                        .reduce((sum, m) => sum + m.totalRequests, 0)
                        .toLocaleString()}
                    </p>
                    <p className='text-xs text-gray-500 flex items-center gap-1'>
                      {getStatusIcon(95, 90)}
                      <span className={getStatusColor(95, 90)}>
                        95% 目标达成
                      </span>
                    </p>
                  </div>
                  <Activity className='h-8 w-8 text-blue-500' />
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
                        metrics.reduce((sum, m) => sum + m.avgResponseTime, 0) /
                          metrics.length
                      )}
                      ms
                    </p>
                    <p className='text-xs text-gray-500 flex items-center gap-1'>
                      {getStatusIcon(950, 1000, true)}
                      <span className={getStatusColor(950, 1000, true)}>
                        低于目标
                      </span>
                    </p>
                  </div>
                  <Clock className='h-8 w-8 text-green-500' />
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
                        metrics.reduce((sum, m) => sum + m.successRate, 0) /
                          metrics.length
                      )}
                      %
                    </p>
                    <p className='text-xs text-gray-500 flex items-center gap-1'>
                      {getStatusIcon(99.2, 95)}
                      <span className={getStatusColor(99.2, 95)}>优秀</span>
                    </p>
                  </div>
                  <CheckCircle className='h-8 w-8 text-green-500' />
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
                        .reduce((sum, m) => sum + m.totalCost, 0)
                        .toFixed(2)}
                    </p>
                    <p className='text-xs text-gray-500 flex items-center gap-1'>
                      {getStatusIcon(85, 80)}
                      <span className={getStatusColor(85, 80)}>预算内</span>
                    </p>
                  </div>
                  <DollarSign className='h-8 w-8 text-yellow-500' />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 响应时间趋势 */}
            <Card>
              <CardHeader>
                <CardTitle>响应时间趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='timestamp'
                      tickFormatter={value =>
                        new Date(value).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={value =>
                        new Date(value).toLocaleString('zh-CN')
                      }
                      formatter={(value: number) => [`${value}ms`, '响应时间']}
                    />
                    <Line
                      type='monotone'
                      dataKey='responseTime'
                      stroke='#3b82f6'
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 请求量趋势 */}
            <Card>
              <CardHeader>
                <CardTitle>请求量趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='timestamp'
                      tickFormatter={value =>
                        new Date(value).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={value =>
                        new Date(value).toLocaleString('zh-CN')
                      }
                      formatter={(value: number) => [value, '请求数']}
                    />
                    <Area
                      type='monotone'
                      dataKey='requests'
                      stroke='#10b981'
                      fill='#10b981'
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* 模型性能对比 */}
          <Card>
            <CardHeader>
              <CardTitle>模型性能对比</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {metrics.map(model => (
                  <Card key={model.modelId} className='border-2'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-lg'>
                        {model.modelName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <p className='text-sm text-gray-600'>平均响应时间</p>
                          <p className='font-semibold'>
                            {model.avgResponseTime}ms
                          </p>
                        </div>
                        <div>
                          <p className='text-sm text-gray-600'>成功率</p>
                          <p className='font-semibold'>{model.successRate}%</p>
                        </div>
                        <div>
                          <p className='text-sm text-gray-600'>总请求</p>
                          <p className='font-semibold'>
                            {model.totalRequests.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className='text-sm text-gray-600'>错误率</p>
                          <p className='font-semibold'>{model.errorRate}%</p>
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <div className='flex justify-between text-sm'>
                          <span>24h请求</span>
                          <span>{model.last24Hours.requests}</span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span>7天请求</span>
                          <span>{model.last7Days.requests}</span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span>30天请求</span>
                          <span>{model.last30Days.requests}</span>
                        </div>
                      </div>

                      <div className='flex justify-between items-center pt-2 border-t'>
                        <span className='text-sm text-gray-600'>总成本</span>
                        <Badge variant='outline'>
                          ${model.totalCost.toFixed(2)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AgentProvider>
    </LanguageProvider>
  );
}
