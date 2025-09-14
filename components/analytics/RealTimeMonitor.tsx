'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Activity,
  Zap,
  Clock,
  MapPin,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface RealTimeData {
  onlineUsers: {
    total: number;
    logged: number;
    anonymous: number;
  };
  currentHourStats: {
    sessions: number;
    users: number;
    messages: number;
    avgResponseTime: number;
  };
  todayStats: {
    sessions: number;
    users: number;
    messages: number;
    tokens: number;
    avgDuration: number;
  };
  errorRate: {
    total: number;
    errors: number;
    errorRate: number;
  };
  performanceMetrics: {
    responseTime: {
      average: number;
      max: number;
      min: number;
    };
    duration: {
      average: number;
    };
    totalRequests: number;
  };
  topAgents: Array<{
    id: number;
    name: string;
    type: string;
    usageCount: number;
    messageCount: number;
  }>;
  activeLocations: {
    totalUniqueLocations: number;
    topCountries: Array<{
      country: string;
      count: number;
    }>;
  };
  timestamp: string;
}

interface RealTimeMonitorProps {
  title?: string;
  description?: string;
  refreshInterval?: number;
  className?: string;
}

export default function RealTimeMonitor({
  title = '实时数据监控',
  description = '实时监控系统运行状态和用户活动',
  refreshInterval = 30000, // 30秒刷新一次
  className = '',
}: RealTimeMonitorProps) {
  const [data, setData] = useState<RealTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // 获取实时数据
  const fetchData = async () => {
    try {
      const response = await fetch('/api/analytics/real-time');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '获取实时数据失败');
      }

      setData(result.data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取实时数据失败');
      console.error('Error fetching real-time data:', err);
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据和定时刷新
  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // 获取性能状态
  const getPerformanceStatus = (avgResponseTime: number) => {
    if (avgResponseTime < 1000) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (avgResponseTime < 3000) return { status: 'good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (avgResponseTime < 5000) return { status: 'warning', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'poor', color: 'text-red-600', bg: 'bg-red-100' };
  };

  // 获取错误率状态
  const getErrorRateStatus = (errorRate: number) => {
    if (errorRate < 1) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (errorRate < 5) return { status: 'good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (errorRate < 10) return { status: 'warning', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'critical', color: 'text-red-600', bg: 'bg-red-100' };
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-8 bg-gray-300 rounded"></div>
              </div>
            ))}
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
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchData} variant="outline">
              重试
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const performanceStatus = getPerformanceStatus(data.performanceMetrics.responseTime.average);
  const errorRateStatus = getErrorRateStatus(data.errorRate.errorRate);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {title}
              <Badge variant="outline" className="text-green-600 border-green-200">
                <Activity className="h-3 w-3 mr-1" />
                实时
              </Badge>
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              更新时间: {formatTime(lastUpdate)}
            </span>
            <Button onClick={fetchData} variant="outline" size="sm" className="h-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* 关键指标卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* 在线用户数 */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <Badge className={performanceStatus.bg + ' ' + performanceStatus.color}>
                {performanceStatus.status}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-blue-900 mb-1">
              {data.onlineUsers.total}
            </div>
            <div className="text-sm text-blue-700">
              在线用户
              <div className="flex gap-4 mt-1 text-xs">
                <span>登录: {data.onlineUsers.logged}</span>
                <span>匿名: {data.onlineUsers.anonymous}</span>
              </div>
            </div>
          </div>

          {/* 当前小时统计 */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 text-green-600" />
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900 mb-1">
              {data.currentHourStats.sessions}
            </div>
            <div className="text-sm text-green-700">
              当前小时会话
              <div className="flex gap-4 mt-1 text-xs">
                <span>用户: {data.currentHourStats.users}</span>
                <span>消息: {data.currentHourStats.messages}</span>
              </div>
            </div>
          </div>

          {/* 性能指标 */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <Badge className={performanceStatus.bg + ' ' + performanceStatus.color}>
                {Math.round(data.performanceMetrics.responseTime.average)}ms
              </Badge>
            </div>
            <div className="text-2xl font-bold text-purple-900 mb-1">
              {data.performanceMetrics.totalRequests}
            </div>
            <div className="text-sm text-purple-700">
              总请求数
              <div className="flex gap-4 mt-1 text-xs">
                <span>最大: {data.performanceMetrics.responseTime.max}ms</span>
                <span>最小: {data.performanceMetrics.responseTime.min}ms</span>
              </div>
            </div>
          </div>

          {/* 错误率 */}
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <Badge className={errorRateStatus.bg + ' ' + errorRateStatus.color}>
                {data.errorRate.errorRate.toFixed(1)}%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-red-900 mb-1">
              {data.errorRate.errors}
            </div>
            <div className="text-sm text-red-700">
              错误数 / 总数: {data.errorRate.total}
              {data.errorRate.errorRate === 0 && (
                <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  系统正常
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 今日统计概览 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 今日使用统计 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">今日使用统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{data.todayStats.sessions}</div>
                  <div className="text-sm text-gray-600">总会话数</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{data.todayStats.users}</div>
                  <div className="text-sm text-gray-600">活跃用户</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{data.todayStats.messages}</div>
                  <div className="text-sm text-gray-600">消息总数</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{Math.round(data.todayStats.avgDuration)}s</div>
                  <div className="text-sm text-gray-600">平均时长</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 热门智能体 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">热门智能体</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topAgents.slice(0, 5).map((agent, index) => (
                  <div key={agent.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{agent.name}</div>
                        <div className="text-xs text-gray-500">{agent.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{agent.usageCount}</div>
                      <div className="text-xs text-gray-500">{agent.messageCount} 消息</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 地理位置分布 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              活跃地区分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-3">
                  共有 {data.activeLocations.totalUniqueLocations} 个活跃地区
                </div>
                <div className="space-y-2">
                  {data.activeLocations.topCountries.slice(0, 8).map((location, index) => {
                    const percentage = data.activeLocations.topCountries[0]?.count > 0
                      ? (location.count / data.activeLocations.topCountries[0].count * 100)
                      : 0;
                    return (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-900">{location.country}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2 relative overflow-hidden">
                            <div
                              className="bg-blue-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 min-w-[3rem] text-right">{location.count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-3">响应时间趋势 (最近24小时)</div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { time: '00:00', value: 1200 },
                        { time: '04:00', value: 800 },
                        { time: '08:00', value: 1500 },
                        { time: '12:00', value: 2000 },
                        { time: '16:00', value: 1800 },
                        { time: '20:00', value: 1600 },
                        { time: '24:00', value: 1400 },
                      ]}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}