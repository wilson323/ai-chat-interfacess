'use client';

import React, { useState } from 'react';
// Removed invalid typescript import
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  TrendingUp,
  AlertTriangle,
  Target,
  Activity,
  Download,
  RefreshCw,
  Settings,
  Bell,
  Users,
  Server,
  DollarSign,
  Zap,
} from 'lucide-react';

// 数据类型定义
interface PredictionData {
  usageTrend: {
    historical: Array<{ date: string; actual: number; predicted: number }>;
    forecast: Array<{ date: string; predicted: number; confidence: number }>;
    accuracy: number;
  };
  userGrowth: {
    historical: Array<{ date: string; users: number }>;
    predicted: Array<{ date: string; users: number; confidence: number }>;
    growthRate: number;
  };
  resourceForecast: {
    predictedLoad: Array<{
      date: string;
      cpu: number;
      memory: number;
      storage: number;
    }>;
    recommendations: Array<{
      type: string;
      action: string;
      timeframe: string;
      impact: string;
    }>;
  };
  anomalyDetection: Array<{
    timestamp: string;
    metric: string;
    value: number;
    expected: number;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
}

interface PredictionDashboardProps {
  data: PredictionData;
  onExport?: (format: 'json' | 'csv' | 'excel') => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  onAlertSettings?: () => void;
}

export function PredictionDashboard({
  data,
  onExport,
  onRefresh,
  isLoading = false,
  onAlertSettings,
}: PredictionDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [showConfidenceIntervals, setShowConfidenceIntervals] = useState(true);

  // 处理预测数据
  const usageChartData = [
    ...data.usageTrend.historical.map(item => ({
      date: item.date,
      actual: item.actual,
      predicted: item.predicted,
      type: 'historical',
    })),
    ...data.usageTrend.forecast.map(item => ({
      date: item.date,
      predicted: item.predicted,
      confidence: item.confidence,
      type: 'forecast',
    })),
  ];

  // 用户增长数据
  const userGrowthChartData = [
    ...data.userGrowth.historical.map(item => ({
      date: item.date,
      users: item.users,
      type: 'historical',
    })),
    ...data.userGrowth.predicted.map(item => ({
      date: item.date,
      users: item.users,
      confidence: item.confidence,
      type: 'forecast',
    })),
  ];

  // 资源预测数据
  const resourceChartData = data.resourceForecast.predictedLoad.map(item => ({
    date: item.date,
    cpu: item.cpu,
    memory: item.memory,
    storage: item.storage,
  }));

  // 异常检测数据处理
  const anomalyCounts = {
    high: data.anomalyDetection.filter(a => a.severity === 'high').length,
    medium: data.anomalyDetection.filter(a => a.severity === 'medium').length,
    low: data.anomalyDetection.filter(a => a.severity === 'low').length,
  };

  // 计算关键指标
  const predictedGrowth = data.userGrowth.growthRate;
  const modelAccuracy = data.usageTrend.accuracy;
  const totalAnomalies = data.anomalyDetection.length;
  const highRiskAnomalies = anomalyCounts.high;

  return (
    <div className='space-y-6'>
      {/* 控制面板 */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <select
            id='predictionTimeframe'
            name='predictionTimeframe'
            value={selectedTimeframe}
            onChange={e => setSelectedTimeframe(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-md text-sm'
          >
            <option value='7d'>未来7天</option>
            <option value='30d'>未来30天</option>
            <option value='90d'>未来90天</option>
            <option value='365d'>未来1年</option>
          </select>

          <div className='flex items-center gap-2'>
            <Switch
              checked={showConfidenceIntervals}
              onCheckedChange={setShowConfidenceIntervals}
            />
            <span className='text-sm'>显示置信区间</span>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onExport?.('json')}
              disabled={isLoading}
            >
              <Download className='h-4 w-4 mr-2' />
              JSON
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onExport?.('csv')}
              disabled={isLoading}
            >
              <Download className='h-4 w-4 mr-2' />
              CSV
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
              />
              刷新
            </Button>
            <Button variant='outline' size='sm' onClick={onAlertSettings}>
              <Settings className='h-4 w-4 mr-2' />
              预警设置
            </Button>
          </div>
        </div>
      </div>

      {/* 核心指标 */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>预测增长率</p>
                <p className='text-2xl font-bold'>{predictedGrowth}%</p>
                <p className='text-xs text-gray-500'>用户增长预期</p>
              </div>
              <TrendingUp className='h-8 w-8 text-green-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>模型准确度</p>
                <p className='text-2xl font-bold'>{modelAccuracy}%</p>
                <p className='text-xs text-gray-500'>预测准确率</p>
              </div>
              <Target className='h-8 w-8 text-blue-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>异常检测</p>
                <p className='text-2xl font-bold'>{totalAnomalies}</p>
                <p className='text-xs text-gray-500'>检测到的异常</p>
              </div>
              <AlertTriangle className='h-8 w-8 text-orange-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>高风险异常</p>
                <p className='text-2xl font-bold'>{highRiskAnomalies}</p>
                <p className='text-xs text-gray-500'>需要立即处理</p>
              </div>
              <Bell className='h-8 w-8 text-red-600' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细分析 */}
      <Tabs defaultValue='usage' className='w-full'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='usage'>使用趋势</TabsTrigger>
          <TabsTrigger value='growth'>用户增长</TabsTrigger>
          <TabsTrigger value='resources'>资源预测</TabsTrigger>
          <TabsTrigger value='anomalies'>异常检测</TabsTrigger>
          <TabsTrigger value='insights'>智能洞察</TabsTrigger>
        </TabsList>

        {/* 使用趋势标签页 */}
        <TabsContent value='usage' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Activity className='h-5 w-5' />
                使用趋势预测
              </CardTitle>
              <CardDescription>
                基于历史数据的使用量预测，准确度: {modelAccuracy}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={400}>
                <ComposedChart data={usageChartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      const labels: Record<string, string> = {
                        actual: '实际使用量',
                        predicted: '预测使用量',
                        confidence: '置信度',
                      };
                      return [value, labels[name] || name];
                    }}
                  />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='actual'
                    stroke='#3b82f6'
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                    name='实际使用量'
                    connectNulls={false}
                  />
                  <Line
                    type='monotone'
                    dataKey='predicted'
                    stroke='#10b981'
                    strokeWidth={2}
                    strokeDasharray='5 5'
                    name='预测使用量'
                  />
                  {showConfidenceIntervals && (
                    <Area
                      type='monotone'
                      dataKey={item =>
                        item.type === 'forecast'
                          ? item.predicted * (1 + (100 - item.confidence) / 100)
                          : null
                      }
                      stroke='none'
                      fill='#10b981'
                      fillOpacity={0.1}
                      name='置信区间上限'
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 预测详情 */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>预测模型</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span>模型类型</span>
                    <span className='font-medium'>时间序列分析</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>训练数据</span>
                    <span className='font-medium'>90天历史数据</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>更新频率</span>
                    <span className='font-medium'>每日自动更新</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>置信度</span>
                    <span className='font-medium'>85-95%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>趋势分析</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span>短期趋势</span>
                    <Badge variant='default'>上升</Badge>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>季节性</span>
                    <Badge variant='secondary'>中等</Badge>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>异常值</span>
                    <Badge variant='outline'>少量</Badge>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>预测可靠性</span>
                    <Badge variant='default'>高</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>关键洞察</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-start gap-2'>
                    <div className='w-2 h-2 bg-green-600 rounded-full mt-2' />
                    <span>预计未来30天使用量增长15%</span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <div className='w-2 h-2 bg-blue-600 rounded-full mt-2' />
                    <span>周末使用量明显高于工作日</span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <div className='w-2 h-2 bg-orange-600 rounded-full mt-2' />
                    <span>需要关注高峰期资源分配</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 用户增长标签页 */}
        <TabsContent value='growth' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Users className='h-5 w-5' />
                用户增长预测
              </CardTitle>
              <CardDescription>基于历史增长率的用户数量预测</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={400}>
                <AreaChart data={userGrowthChartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip formatter={value => [value, '用户数量']} />
                  <Legend />
                  <Area
                    type='monotone'
                    dataKey='users'
                    stroke='#3b82f6'
                    fill='#3b82f6'
                    fillOpacity={0.6}
                    name='用户数量'
                  />
                  {showConfidenceIntervals && (
                    <Area
                      type='monotone'
                      dataKey={item =>
                        item.type === 'forecast'
                          ? item.users * (1 + (100 - item.confidence) / 200)
                          : null
                      }
                      stroke='none'
                      fill='#3b82f6'
                      fillOpacity={0.1}
                      name='置信区间'
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 增长分析 */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>增长率分析</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='border rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='font-medium'>当前增长率</span>
                      <span className='text-2xl font-bold text-green-600'>
                        {predictedGrowth}%
                      </span>
                    </div>
                    <div className='text-sm text-gray-600'>
                      相比上月增长 {predictedGrowth > 0 ? '+' : ''}
                      {(predictedGrowth * 0.8).toFixed(1)}%
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <div className='text-gray-500'>日增长率</div>
                      <div className='font-medium'>
                        {(predictedGrowth / 30).toFixed(3)}%
                      </div>
                    </div>
                    <div>
                      <div className='text-gray-500'>月增长率</div>
                      <div className='font-medium'>{predictedGrowth}%</div>
                    </div>
                    <div>
                      <div className='text-gray-500'>年增长率</div>
                      <div className='font-medium'>
                        {(predictedGrowth * 12).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className='text-gray-500'>预计用户数</div>
                      <div className='font-medium'>
                        {Math.round(
                          data.userGrowth.predicted[
                            data.userGrowth.predicted.length - 1
                          ]?.users || 0
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>用户获取策略</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='p-3 bg-blue-50 rounded-lg'>
                    <h4 className='font-medium text-blue-800'>优化注册流程</h4>
                    <p className='text-sm text-blue-600'>
                      简化注册步骤，提高转化率20%
                    </p>
                  </div>
                  <div className='p-3 bg-green-50 rounded-lg'>
                    <h4 className='font-medium text-green-800'>口碑营销</h4>
                    <p className='text-sm text-green-600'>
                      激励用户推荐，获得高质量用户
                    </p>
                  </div>
                  <div className='p-3 bg-purple-50 rounded-lg'>
                    <h4 className='font-medium text-purple-800'>内容营销</h4>
                    <p className='text-sm text-purple-600'>
                      提供有价值的内容吸引目标用户
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 资源预测标签页 */}
        <TabsContent value='resources' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Server className='h-5 w-5' />
                资源需求预测
              </CardTitle>
              <CardDescription>基于使用量预测的服务器资源需求</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={400}>
                <LineChart data={resourceChartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    formatter={(value, name) => [
                      `${value}%`,
                      name === 'cpu'
                        ? 'CPU使用率'
                        : name === 'memory'
                          ? '内存使用率'
                          : '存储使用率',
                    ]}
                  />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='cpu'
                    stroke='#ef4444'
                    strokeWidth={2}
                    name='CPU使用率'
                  />
                  <Line
                    type='monotone'
                    dataKey='memory'
                    stroke='#f59e0b'
                    strokeWidth={2}
                    name='内存使用率'
                  />
                  <Line
                    type='monotone'
                    dataKey='storage'
                    stroke='#8b5cf6'
                    strokeWidth={2}
                    name='存储使用率'
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 资源建议 */}
          <Card>
            <CardHeader>
              <CardTitle>资源优化建议</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {data.resourceForecast.recommendations.map((rec, index) => (
                  <div key={index} className='border rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <h4 className='font-medium'>{rec.type}</h4>
                      <Badge
                        variant={
                          rec.timeframe.includes('7') ? 'default' : 'secondary'
                        }
                      >
                        {rec.timeframe}
                      </Badge>
                    </div>
                    <p className='text-sm text-gray-600 mb-3'>{rec.action}</p>
                    <div className='text-sm font-medium text-green-600'>
                      预期影响: {rec.impact}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 成本预测 */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      当前成本
                    </p>
                    <p className='text-2xl font-bold'>$2,450</p>
                    <p className='text-xs text-gray-500'>月度服务器成本</p>
                  </div>
                  <DollarSign className='h-8 w-8 text-green-600' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      预测成本
                    </p>
                    <p className='text-2xl font-bold'>$3,200</p>
                    <p className='text-xs text-gray-500'>下月预计成本</p>
                  </div>
                  <TrendingUp className='h-8 w-8 text-orange-600' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      优化空间
                    </p>
                    <p className='text-2xl font-bold'>23%</p>
                    <p className='text-xs text-gray-500'>成本优化潜力</p>
                  </div>
                  <Zap className='h-8 w-8 text-blue-600' />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 异常检测标签页 */}
        <TabsContent value='anomalies' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* 异常统计 */}
            <Card>
              <CardHeader>
                <CardTitle>异常统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='grid grid-cols-3 gap-4 text-center'>
                    <div className='p-4 bg-red-50 rounded-lg'>
                      <div className='text-2xl font-bold text-red-600'>
                        {anomalyCounts.high}
                      </div>
                      <div className='text-sm text-red-600'>高风险</div>
                    </div>
                    <div className='p-4 bg-orange-50 rounded-lg'>
                      <div className='text-2xl font-bold text-orange-600'>
                        {anomalyCounts.medium}
                      </div>
                      <div className='text-sm text-orange-600'>中风险</div>
                    </div>
                    <div className='p-4 bg-yellow-50 rounded-lg'>
                      <div className='text-2xl font-bold text-yellow-600'>
                        {anomalyCounts.low}
                      </div>
                      <div className='text-sm text-yellow-600'>低风险</div>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>异常检测率</span>
                      <span className='font-medium'>
                        {((totalAnomalies / 1000) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>误报率</span>
                      <span className='font-medium'>5.2%</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>平均处理时间</span>
                      <span className='font-medium'>2.3小时</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 异常列表 */}
            <Card>
              <CardHeader>
                <CardTitle>最近异常</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3 max-h-96 overflow-y-auto'>
                  {data.anomalyDetection.slice(0, 10).map((anomaly, index) => (
                    <div key={index} className='border rounded-lg p-3'>
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-2'>
                          <Badge
                            variant={
                              anomaly.severity === 'high'
                                ? 'destructive'
                                : anomaly.severity === 'medium'
                                  ? 'default'
                                  : 'secondary'
                            }
                          >
                            {anomaly.severity === 'high'
                              ? '高风险'
                              : anomaly.severity === 'medium'
                                ? '中风险'
                                : '低风险'}
                          </Badge>
                          <span className='text-sm font-medium'>
                            {anomaly.metric}
                          </span>
                        </div>
                        <span className='text-xs text-gray-500'>
                          {new Date(anomaly.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className='text-sm text-gray-600'>
                        {anomaly.description}
                      </p>
                      <div className='flex justify-between text-xs mt-2'>
                        <span>实际值: {anomaly.value}</span>
                        <span>预期值: {anomaly.expected}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 异常趋势 */}
          <Card>
            <CardHeader>
              <CardTitle>异常趋势分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='p-4 border rounded-lg'>
                  <h4 className='font-medium mb-2'>响应时间异常</h4>
                  <div className='text-2xl font-bold text-red-600'>
                    {
                      data.anomalyDetection.filter(a => a.metric === '响应时间')
                        .length
                    }
                  </div>
                  <div className='text-sm text-gray-600'>主要发生在高峰期</div>
                </div>
                <div className='p-4 border rounded-lg'>
                  <h4 className='font-medium mb-2'>Token使用异常</h4>
                  <div className='text-2xl font-bold text-orange-600'>
                    {
                      data.anomalyDetection.filter(
                        a => a.metric === 'Token使用量'
                      ).length
                    }
                  </div>
                  <div className='text-sm text-gray-600'>需要优化提示词</div>
                </div>
                <div className='p-4 border rounded-lg'>
                  <h4 className='font-medium mb-2'>系统异常</h4>
                  <div className='text-2xl font-bold text-blue-600'>
                    {
                      data.anomalyDetection.filter(
                        a => !['响应时间', 'Token使用量'].includes(a.metric)
                      ).length
                    }
                  </div>
                  <div className='text-sm text-gray-600'>系统稳定性良好</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 智能洞察标签页 */}
        <TabsContent value='insights' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* 关键洞察 */}
            <Card>
              <CardHeader>
                <CardTitle>AI 生成的洞察</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='p-4 bg-green-50 border-l-4 border-green-500 rounded'>
                    <h4 className='font-medium text-green-800 mb-2'>
                      增长机会
                    </h4>
                    <p className='text-sm text-green-700'>
                      基于用户行为分析，移动端使用增长率高于桌面端，建议优先优化移动端体验。
                    </p>
                  </div>

                  <div className='p-4 bg-blue-50 border-l-4 border-blue-500 rounded'>
                    <h4 className='font-medium text-blue-800 mb-2'>效率提升</h4>
                    <p className='text-sm text-blue-700'>
                      通过实施缓存策略，预计可减少30%的API调用成本，同时保持用户体验。
                    </p>
                  </div>

                  <div className='p-4 bg-orange-50 border-l-4 border-orange-500 rounded'>
                    <h4 className='font-medium text-orange-800 mb-2'>
                      风险预警
                    </h4>
                    <p className='text-sm text-orange-700'>
                      预测未来2周内服务器负载将接近阈值，建议提前扩容避免服务中断。
                    </p>
                  </div>

                  <div className='p-4 bg-purple-50 border-l-4 border-purple-500 rounded'>
                    <h4 className='font-medium text-purple-800 mb-2'>
                      创新建议
                    </h4>
                    <p className='text-sm text-purple-700'>
                      考虑引入智能推荐系统，基于用户历史行为提供个性化服务建议。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 行动建议 */}
            <Card>
              <CardHeader>
                <CardTitle>推荐行动</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='border rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <h4 className='font-medium'>立即行动</h4>
                      <Badge variant='destructive'>高优先级</Badge>
                    </div>
                    <ul className='text-sm space-y-1 text-gray-600'>
                      <li>• 处理 {highRiskAnomalies} 个高风险异常</li>
                      <li>• 准备服务器扩容计划</li>
                      <li>• 优化高峰期资源配置</li>
                    </ul>
                  </div>

                  <div className='border rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <h4 className='font-medium'>本周计划</h4>
                      <Badge variant='default'>中优先级</Badge>
                    </div>
                    <ul className='text-sm space-y-1 text-gray-600'>
                      <li>• 实施响应缓存策略</li>
                      <li>• 优化移动端用户体验</li>
                      <li>• 更新预测模型参数</li>
                    </ul>
                  </div>

                  <div className='border rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <h4 className='font-medium'>长期规划</h4>
                      <Badge variant='secondary'>低优先级</Badge>
                    </div>
                    <ul className='text-sm space-y-1 text-gray-600'>
                      <li>• 开发智能推荐系统</li>
                      <li>• 实施成本优化方案</li>
                      <li>• 建立完整的监控体系</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 模型性能 */}
          <Card>
            <CardHeader>
              <CardTitle>预测模型性能</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <div className='text-center p-4 border rounded-lg'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {modelAccuracy}%
                  </div>
                  <div className='text-sm text-gray-600'>准确率</div>
                </div>
                <div className='text-center p-4 border rounded-lg'>
                  <div className='text-2xl font-bold text-green-600'>94.2%</div>
                  <div className='text-sm text-gray-600'>精确率</div>
                </div>
                <div className='text-center p-4 border rounded-lg'>
                  <div className='text-2xl font-bold text-orange-600'>
                    89.7%
                  </div>
                  <div className='text-sm text-gray-600'>召回率</div>
                </div>
                <div className='text-center p-4 border rounded-lg'>
                  <div className='text-2xl font-bold text-purple-600'>
                    92.1%
                  </div>
                  <div className='text-sm text-gray-600'>F1分数</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
