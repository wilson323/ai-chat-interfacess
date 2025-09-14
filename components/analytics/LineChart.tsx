'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
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
import { Calendar, Download, RefreshCw } from 'lucide-react';

interface LineChartData {
  period: string;
  value: number | null;
}

interface LineChartProps {
  title?: string;
  description?: string;
  height?: number;
  defaultMetric?: 'sessions' | 'users' | 'duration' | 'responseTime' | 'tokens';
  defaultGroupBy?: 'hour' | 'day' | 'week' | 'month';
  className?: string;
}

const metricOptions = [
  { value: 'sessions', label: '会话次数' },
  { value: 'users', label: '用户数量' },
  { value: 'duration', label: '平均会话时长(秒)' },
  { value: 'responseTime', label: '平均响应时间(ms)' },
  { value: 'tokens', label: 'Token使用量' },
];

const groupByOptions = [
  { value: 'hour', label: '按小时' },
  { value: 'day', label: '按天' },
  { value: 'week', label: '按周' },
  { value: 'month', label: '按月' },
];

export default function LineChartComponent({
  title = '使用趋势',
  description = '显示不同时间维度的使用趋势',
  height = 400,
  defaultMetric = 'sessions',
  defaultGroupBy = 'day',
  className = '',
}: LineChartProps) {
  const [data, setData] = useState<LineChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState(defaultMetric);
  const [groupBy, setGroupBy] = useState(defaultGroupBy);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // 获取默认日期范围
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30); // 默认显示最近30天

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  // 获取数据
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        metric,
        groupBy,
        startDate,
        endDate,
      });

      const response = await fetch(`/api/analytics/line-chart?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '获取数据失败');
      }

      // 格式化数据
      const formattedData = result.data.map((item: any) => ({
        period: item.period,
        value: item.value ? Number(item.value) : null,
      }));

      setData(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
      console.error('Error fetching line chart data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchData();
    }
  }, [metric, groupBy, startDate, endDate]);

  // 获取Y轴标签
  const getYAxisLabel = () => {
    switch (metric) {
      case 'sessions':
        return '会话次数';
      case 'users':
        return '用户数量';
      case 'duration':
        return '时长(秒)';
      case 'responseTime':
        return '响应时间(ms)';
      case 'tokens':
        return 'Token数量';
      default:
        return '数值';
    }
  };

  // 获取线条颜色
  const getLineColor = () => {
    switch (metric) {
      case 'sessions':
        return '#3b82f6'; // blue
      case 'users':
        return '#10b981'; // green
      case 'duration':
        return '#f59e0b'; // amber
      case 'responseTime':
        return '#ef4444'; // red
      case 'tokens':
        return '#8b5cf6'; // violet
      default:
        return '#3b82f6';
    }
  };

  // 导出数据
  const exportData = async () => {
    try {
      const params = new URLSearchParams({
        metric,
        groupBy,
        startDate,
        endDate,
        format: 'csv',
      });

      const response = await fetch(`/api/analytics/export?${params}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `line_chart_${metric}_${startDate}_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting data:', err);
    }
  };

  // 格式化X轴标签
  const formatXAxisLabel = (value: string) => {
    try {
      const date = new Date(value);
      switch (groupBy) {
        case 'hour':
          return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        case 'day':
          return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
        case 'week':
          return `第${Math.ceil(date.getDate() / 7)}周`;
        case 'month':
          return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' });
        default:
          return value;
      }
    } catch {
      return value;
    }
  };

  // 自定义工具提示
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-1">
            {formatXAxisLabel(label)}
          </p>
          <p className="text-sm text-gray-600">
            {getYAxisLabel()}: <span className="font-medium">{data.value?.toLocaleString() || 'N/A'}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
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
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <Button onClick={fetchData} variant="outline" size="sm">
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {title}
              <Badge variant="outline">{metricOptions.find(m => m.value === metric)?.label}</Badge>
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={exportData}
              variant="outline"
              size="sm"
              className="h-8"
            >
              <Download className="h-4 w-4 mr-1" />
              导出
            </Button>
            <Button
              onClick={fetchData}
              variant="outline"
              size="sm"
              className="h-8"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <span className="text-gray-500">至</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>

          <Select value={metric} onValueChange={(value) => setMetric(value as any)}>
            <SelectTrigger className="w-40">
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

          <Select value={groupBy} onValueChange={(value) => setGroupBy(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {groupByOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="period"
              tickFormatter={formatXAxisLabel}
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              label={{
                value: getYAxisLabel(),
                angle: -90,
                position: 'insideLeft',
                offset: -10,
                style: { textAnchor: 'middle' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke={getLineColor()}
              strokeWidth={2}
              dot={{ fill: getLineColor(), strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: getLineColor(), strokeWidth: 2 }}
              name={getYAxisLabel()}
              connectNulls={false}
            />
            <Brush dataKey="period" height={30} stroke="#94a3b8" />
          </LineChart>
        </ResponsiveContainer>

        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            暂无数据
          </div>
        )}
      </CardContent>
    </Card>
  );
}