'use client';

import React, { useState, useEffect } from 'react';
import type { AgentUsageData, RadarData, AnalyticsQueryParams } from '@/types/analytics';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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
import { Download, RefreshCw, PieChart as PieIcon, BarChart3, Target } from 'lucide-react';

// 类型定义已移至 @/types/analytics

interface AgentUsageChartProps {
  title?: string;
  description?: string;
  height?: number;
  defaultChartType?: 'pie' | 'bar' | 'radar';
  defaultGroupBy?: 'usage' | 'duration' | 'responseTime' | 'satisfaction';
  className?: string;
}

const chartTypeOptions = [
  { value: 'pie', label: '饼图', icon: PieIcon },
  { value: 'bar', label: '柱状图', icon: BarChart3 },
  { value: 'radar', label: '雷达图', icon: Target },
];

const groupByOptions = [
  { value: 'usage', label: '使用次数' },
  { value: 'duration', label: '平均时长' },
  { value: 'responseTime', label: '响应时间' },
  { value: 'satisfaction', label: '满意度' },
];

// 智能体类型颜色映射
const agentTypeColors = {
  'fastgpt': '#3b82f6', // blue
  'cad-analyzer': '#10b981', // green
  'image-editor': '#f59e0b', // amber
  'general': '#8b5cf6', // violet
  'custom': '#ef4444', // red
  'unknown': '#6b7280', // gray
};

export default function AgentUsageChart({
  title = '智能体使用占比',
  description = '显示各智能体的使用情况和性能指标',
  height = 400,
  defaultChartType = 'pie',
  defaultGroupBy = 'usage',
  className = '',
}: AgentUsageChartProps) {
  const [data, setData] = useState<AgentUsageData[]>([]);
  const [radarData, setRadarData] = useState<RadarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState(defaultChartType);
  const [groupBy, setGroupBy] = useState(defaultGroupBy);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
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
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        chartType,
        groupBy,
        startDate,
        endDate,
      });

      const response = await fetch(`/api/analytics/agent-usage?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '获取数据失败');
      }

      if (chartType === 'radar') {
        setRadarData(result.data);
      } else {
        setData(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
      console.error('Error fetching agent usage data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchData();
    }
  }, [chartType, groupBy, startDate, endDate]);

  // 获取颜色
  const getColor = (agentType: string) => {
    return agentTypeColors[agentType as keyof typeof agentTypeColors] || agentTypeColors.unknown;
  };

  // 导出数据
  const exportData = async () => {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        format: 'csv',
        dataType: 'agents',
      });

      const response = await fetch(`/api/analytics/export?${params}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agent_usage_${chartType}_${groupBy}_${startDate}_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting data:', err);
    }
  };

  // 自定义工具提示
  const CustomTooltip = ({
    active,
    payload,
    label
  }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      color: string;
      payload: Record<string, unknown>;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-1">{data.agentName}</p>
          <p className="text-sm text-gray-600">类型: {data.agentType}</p>
          <p className="text-sm text-gray-600">
            {groupByOptions.find(g => g.value === groupBy)?.label}: <span className="font-medium">{data.value?.toLocaleString() || 'N/A'}</span>
          </p>
          {data.messageCount && (
            <p className="text-sm text-gray-600">消息数: {data.messageCount.toLocaleString()}</p>
          )}
        </div>
      );
    }
    return null;
  };

  // 雷达图工具提示
  const RadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-1">{data.agentName}</p>
          <p className="text-sm text-gray-600">类型: {data.agentType}</p>
          <div className="text-sm text-gray-600 space-y-1">
            <p>使用频率: {Math.round(data.usage)}%</p>
            <p>会话时长: {Math.round(data.duration)}%</p>
            <p>响应速度: {Math.round(data.responseTime)}%</p>
            <p>用户满意度: {Math.round(data.satisfaction)}%</p>
          </div>
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
              <Badge variant="outline">{chartTypeOptions.find(c => c.value === chartType)?.label}</Badge>
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

          <Select value={chartType} onValueChange={(value) => setChartType(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {chartTypeOptions.map(option => {
                const Icon = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {chartType !== 'radar' && (
            <Select value={groupBy} onValueChange={(value) => setGroupBy(value as any)}>
              <SelectTrigger className="w-40">
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
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {chartType === 'pie' && (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ agentName, value }) => {
                  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
                  const percentage = total > 0 ? ((value || 0) / total * 100).toFixed(1) : '0';
                  return `${agentName} ${percentage}%`;
                }}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.agentType)} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          )}

          {chartType === 'bar' && (
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="agentName"
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.agentType)} />
                ))}
              </Bar>
            </BarChart>
          )}

          {chartType === 'radar' && (
            <RadarChart data={radarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="agentName" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
                tickCount={6}
              />
              <Radar
                name="性能指标"
                dataKey="usage"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="会话时长"
                dataKey="duration"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="响应速度"
                dataKey="responseTime"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="用户满意度"
                dataKey="satisfaction"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip content={<RadarTooltip />} />
              <Legend />
            </RadarChart>
          )}
        </ResponsiveContainer>

        {((chartType !== 'radar' && data.length === 0) || (chartType === 'radar' && radarData.length === 0)) && (
          <div className="text-center py-8 text-gray-500">
            暂无数据
          </div>
        )}

        {/* 智能体类型图例 */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {Object.entries(agentTypeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-600">{type}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
