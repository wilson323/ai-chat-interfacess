'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  ComposedChart,
  Area,
  AreaChart,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
} from 'lucide-react';

interface ComparisonData {
  [key: string]: string | number | boolean | null | undefined;
}

interface ComparisonChartProps {
  title?: string;
  description?: string;
  height?: number;
  defaultDimensions?: string[];
  defaultMetric?: 'sessions' | 'users' | 'duration' | 'responseTime' | 'tokens';
  className?: string;
}

const dimensionOptions = [
  { value: 'time', label: '时间维度', icon: TrendingUp },
  { value: 'location', label: '地理位置', icon: BarChart3 },
  { value: 'userType', label: '用户类型', icon: PieIcon },
  { value: 'deviceType', label: '设备类型', icon: BarChart3 },
  { value: 'agentType', label: '智能体类型', icon: BarChart3 },
];

const metricOptions = [
  { value: 'sessions', label: '会话次数' },
  { value: 'users', label: '用户数量' },
  { value: 'duration', label: '平均时长' },
  { value: 'responseTime', label: '响应时间' },
  { value: 'tokens', label: 'Token使用量' },
];

const timeGranularityOptions = [
  { value: 'hour', label: '按小时' },
  { value: 'day', label: '按天' },
  { value: 'week', label: '按周' },
  { value: 'month', label: '按月' },
];

const locationLevelOptions = [
  { value: 'country', label: '按国家' },
  { value: 'region', label: '按地区' },
  { value: 'city', label: '按城市' },
];

// 颜色方案
const colorPalette = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#ec4899', // pink
  '#6366f1', // indigo
];

export default function ComparisonChart({
  title = '多维度数据对比',
  description = '从不同维度对比分析使用数据',
  height = 400,
  defaultDimensions = ['time', 'location'],
  defaultMetric = 'sessions',
  className = '',
}: ComparisonChartProps) {
  const [data, setData] = useState<{ [key: string]: ComparisonData[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedDimensions, setSelectedDimensions] =
    useState(defaultDimensions);
  const [metric, setMetric] = useState(defaultMetric);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [timeGranularity, setTimeGranularity] = useState('day');
  const [locationLevel, setLocationLevel] = useState('country');
  const [error, setError] = useState<string | null>(null);

  // 获取默认日期范围
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7); // 默认显示最近7天

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  // 获取数据
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        dimensions: selectedDimensions.join(','),
        metric,
        timeGranularity,
        locationLevel,
        startDate,
        endDate,
      });

      const response = await fetch(`/api/analytics/comparison?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '获取数据失败');
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
      console.error('Error fetching comparison data:', err);
    } finally {
      setLoading(false);
    }
  }, [
    selectedDimensions,
    metric,
    timeGranularity,
    locationLevel,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    if (startDate && endDate && selectedDimensions.length > 0) {
      fetchData();
    }
  }, [
    selectedDimensions,
    metric,
    startDate,
    endDate,
    timeGranularity,
    locationLevel,
    fetchData,
  ]);

  // 导出数据
  const exportData = async () => {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        format: 'csv',
        dataType: 'usage',
      });

      const response = await fetch(`/api/analytics/export?${params}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comparison_${selectedDimensions.join('_')}_${metric}_${startDate}_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting data:', err);
    }
  };

  // 渲染时间维度图表
  const renderTimeChart = (chartData: ComparisonData[]) => {
    if (!chartData || chartData.length === 0) return null;

    return (
      <ResponsiveContainer width='100%' height={height}>
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
          <XAxis dataKey='period' tick={{ fontSize: 12 }} tickLine={false} />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} />
          <Tooltip />
          <Legend />
          <Area
            type='monotone'
            dataKey='value'
            stroke='#3b82f6'
            fill='#3b82f6'
            fillOpacity={0.6}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  // 渲染地理位置图表
  const renderLocationChart = (chartData: ComparisonData[]) => {
    if (!chartData || chartData.length === 0) return null;

    // 只显示前10个
    const topData = chartData.slice(0, 10);

    return (
      <ResponsiveContainer width='100%' height={height}>
        <BarChart
          data={topData}
          layout='horizontal'
          margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
          <XAxis type='number' tick={{ fontSize: 12 }} tickLine={false} />
          <YAxis
            type='category'
            dataKey='location'
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <Tooltip />
          <Bar dataKey='value' fill='#10b981' radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // 渲染用户类型图表
  const renderUserTypeChart = (chartData: ComparisonData[]) => {
    if (!chartData || chartData.length === 0) return null;

    return (
      <ResponsiveContainer width='100%' height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx='50%'
            cy='50%'
            labelLine={false}
            outerRadius={120}
            fill='#8884d8'
            dataKey='value'
          >
            {chartData.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colorPalette[index % colorPalette.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // 渲染设备类型图表
  const renderDeviceTypeChart = (chartData: ComparisonData[]) => {
    if (!chartData || chartData.length === 0) return null;

    return (
      <ResponsiveContainer width='100%' height={height}>
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
          <XAxis
            dataKey='deviceType'
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey='value' fill='#f59e0b' radius={[4, 4, 0, 0]} />
          <Line
            type='monotone'
            dataKey='value'
            stroke='#ef4444'
            strokeWidth={2}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  // 渲染智能体类型图表
  const renderAgentTypeChart = (chartData: ComparisonData[]) => {
    if (!chartData || chartData.length === 0) return null;

    return (
      <ResponsiveContainer width='100%' height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
          <XAxis dataKey='agentType' tick={{ fontSize: 12 }} tickLine={false} />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey='value' fill='#8b5cf6' radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center' style={{ height }}>
            <RefreshCw className='h-8 w-8 animate-spin text-gray-400' />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center' style={{ height }}>
            <div className='text-center'>
              <p className='text-red-500 mb-2'>{error}</p>
              <Button onClick={fetchData} variant='outline' size='sm'>
                重试
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              {title}
              <Badge variant='outline'>
                {metricOptions.find(m => m.value === metric)?.label}
              </Badge>
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              onClick={exportData}
              variant='outline'
              size='sm'
              className='h-8'
            >
              <Download className='h-4 w-4 mr-1' />
              导出
            </Button>
            <Button
              onClick={fetchData}
              variant='outline'
              size='sm'
              className='h-8'
            >
              <RefreshCw className='h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='flex flex-wrap gap-4 pt-4'>
          <div className='flex items-center gap-2'>
            <input
              id='comparisonStartDate'
              name='comparisonStartDate'
              type='date'
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className='px-2 py-1 border border-gray-300 rounded text-sm'
            />
            <span className='text-gray-500'>至</span>
            <input
              id='comparisonEndDate'
              name='comparisonEndDate'
              type='date'
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className='px-2 py-1 border border-gray-300 rounded text-sm'
            />
          </div>

          <div className='flex flex-wrap gap-2'>
            {dimensionOptions.map(option => {
              const Icon = option.icon;
              const isSelected = selectedDimensions.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedDimensions(
                        selectedDimensions.filter(d => d !== option.value)
                      );
                    } else {
                      setSelectedDimensions([
                        ...selectedDimensions,
                        option.value,
                      ]);
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className='h-4 w-4' />
                  {option.label}
                </button>
              );
            })}
          </div>

          <Select
            value={metric}
            onValueChange={value => setMetric(value as 'duration' | 'responseTime' | 'sessions' | 'users' | 'tokens')}
          >
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {metricOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedDimensions.includes('time') && (
            <Select
              value={timeGranularity}
              onValueChange={value => setTimeGranularity(value)}
            >
              <SelectTrigger className='w-32'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeGranularityOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {selectedDimensions.includes('location') && (
            <Select
              value={locationLevel}
              onValueChange={value => setLocationLevel(value)}
            >
              <SelectTrigger className='w-32'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locationLevelOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {selectedDimensions.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            请选择要对比的维度
          </div>
        ) : (
          <Tabs defaultValue={selectedDimensions[0]} className='w-full'>
            <TabsList className='grid w-full grid-cols-5'>
              {selectedDimensions.map(dimension => (
                <TabsTrigger key={dimension} value={dimension}>
                  {dimensionOptions.find(opt => opt.value === dimension)?.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {selectedDimensions.includes('time') && (
              <TabsContent value='time' className='mt-4'>
                {renderTimeChart(data.time)}
              </TabsContent>
            )}

            {selectedDimensions.includes('location') && (
              <TabsContent value='location' className='mt-4'>
                {renderLocationChart(data.location)}
              </TabsContent>
            )}

            {selectedDimensions.includes('userType') && (
              <TabsContent value='userType' className='mt-4'>
                {renderUserTypeChart(data.userType)}
              </TabsContent>
            )}

            {selectedDimensions.includes('deviceType') && (
              <TabsContent value='deviceType' className='mt-4'>
                {renderDeviceTypeChart(data.deviceType)}
              </TabsContent>
            )}

            {selectedDimensions.includes('agentType') && (
              <TabsContent value='agentType' className='mt-4'>
                {renderAgentTypeChart(data.agentType)}
              </TabsContent>
            )}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
