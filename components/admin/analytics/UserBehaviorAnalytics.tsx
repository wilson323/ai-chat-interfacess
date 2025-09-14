'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  FunnelChart,
  Funnel,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
  MapPin,
  Download,
  RefreshCw,
} from 'lucide-react';

// 数据类型定义
interface UserBehaviorData {
  hourlyActivity: Array<{ hour: number; count: number }>;
  userRetention: {
    newUsers: Array<{ date: string; count: number }>;
    activeUsers: Array<{ date: string; count: number }>;
    churnedUsers: Array<{ date: string; count: number }>;
  };
  userPaths: Array<{
    userId: number;
    agentSequence: number[];
    conversionRates: number[];
  }>;
  userSegments: Array<{
    segment: string;
    userCount: number;
    avgUsage: number;
    avgSatisfaction: string;
  }>;
}

interface UserBehaviorAnalyticsProps {
  data: UserBehaviorData;
  onExport?: (format: 'json' | 'csv' | 'excel') => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function UserBehaviorAnalytics({
  data,
  onExport,
  onRefresh,
  isLoading = false,
}: UserBehaviorAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedView, setSelectedView] = useState('overview');

  // 处理小时数据格式化
  const formatHour = (hour: number) => `${hour}:00`;

  // 处理数据
  const hourlyData = data.hourlyActivity.map(item => ({
    hour: formatHour(item.hour),
    count: item.count,
    hourNum: item.hour,
  }));

  // 用户留存数据
  const retentionData = data.userRetention.newUsers.map((newUser, index) => ({
    date: newUser.date,
    newUsers: newUser.count,
    activeUsers: data.userRetention.activeUsers[index]?.count || 0,
    churnedUsers: data.userRetention.churnedUsers[index]?.count || 0,
  }));

  // 用户分群颜色
  const segmentColors = {
    '高频用户': '#10b981',
    '中频用户': '#3b82f6',
    '低频用户': '#f59e0b',
  };

  // 热力图数据生成
  const generateHeatmapData = () => {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    return days.map((day, dayIndex) => ({
      day,
      hours: Array.from({ length: 24 }, (_, hour) => {
        const activity = hourlyData.find(h => h.hourNum === hour);
        return {
          hour,
          value: activity ? Math.min(100, (activity.count / Math.max(...hourlyData.map(h => h.count))) * 100) : 0,
        };
      }),
    }));
  };

  const heatmapData = generateHeatmapData();

  // 计算关键指标
  const totalActiveUsers = data.userRetention.activeUsers.reduce((sum, day) => sum + day.count, 0);
  const avgDailyUsers = Math.round(totalActiveUsers / data.userRetention.activeUsers.length);
  const peakHour = hourlyData.reduce((max, current) => current.count > max.count ? current : max, hourlyData[0]);
  const peakHourTime = formatHour(peakHour.hourNum);

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">最近24小时</SelectItem>
              <SelectItem value="7d">最近7天</SelectItem>
              <SelectItem value="30d">最近30天</SelectItem>
              <SelectItem value="90d">最近90天</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('json')}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('csv')}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>
        </div>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">活跃用户</p>
                <p className="text-2xl font-bold">{avgDailyUsers.toLocaleString()}</p>
                <p className="text-xs text-gray-500">日均值</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">高峰时段</p>
                <p className="text-2xl font-bold">{peakHourTime}</p>
                <p className="text-xs text-gray-500">{peakHour.count} 次活动</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">新增用户</p>
                <p className="text-2xl font-bold">
                  {data.userRetention.newUsers[data.userRetention.newUsers.length - 1]?.count || 0}
                </p>
                <p className="text-xs text-gray-500">今日新增</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">用户留存</p>
                <p className="text-2xl font-bold">
                  {Math.round((totalActiveUsers / (totalActiveUsers + data.userRetention.churnedUsers.reduce((sum, day) => sum + day.count, 0))) * 100)}%
                </p>
                <p className="text-xs text-gray-500">留存率</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细分析 */}
      <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="activity">活跃度分析</TabsTrigger>
          <TabsTrigger value="retention">留存分析</TabsTrigger>
          <TabsTrigger value="segments">用户分群</TabsTrigger>
        </TabsList>

        {/* 概览标签页 */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 24小时活跃度分布 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  24小时活跃度分布
                </CardTitle>
                <CardDescription>用户在一天中的活跃时段分布</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 12 }}
                      interval={3}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [value, '活跃次数']}
                      labelFormatter={(label) => `时间: ${label}`}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 用户分群饼图 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  用户分群分布
                </CardTitle>
                <CardDescription>基于使用频率的用户分群</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.userSegments.map(segment => ({
                        name: segment.segment,
                        value: segment.userCount,
                        fill: segmentColors[segment.segment as keyof typeof segmentColors],
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.userSegments.map((segment, index) => (
                        <Cell key={`cell-${index}`} fill={segmentColors[segment.segment as keyof typeof segmentColors]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* 用户留存趋势 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                用户留存趋势
              </CardTitle>
              <CardDescription>新增用户、活跃用户和流失用户的变化趋势</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="newUsers"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="新增用户"
                  />
                  <Area
                    type="monotone"
                    dataKey="activeUsers"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="活跃用户"
                  />
                  <Area
                    type="monotone"
                    dataKey="churnedUsers"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                    name="流失用户"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 活跃度分析标签页 */}
        <TabsContent value="activity" className="space-y-4">
          {/* 活跃度热力图 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                用户活跃度热力图
              </CardTitle>
              <CardDescription>一周内不同时段的用户活跃度分布</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* 小时标签 */}
                  <div className="flex ml-12 mb-2">
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div key={hour} className="w-8 text-center text-xs text-gray-500">
                        {hour}
                      </div>
                    ))}
                  </div>

                  {/* 热力图网格 */}
                  {heatmapData.map((dayData, dayIndex) => (
                    <div key={dayIndex} className="flex items-center mb-1">
                      <div className="w-12 text-sm text-gray-500 text-right pr-2">
                        {dayData.day}
                      </div>
                      {dayData.hours.map((hourData, hourIndex) => {
                        const intensity = Math.floor((hourData.value / 100) * 4);
                        const colors = [
                          'bg-gray-100',
                          'bg-blue-200',
                          'bg-blue-400',
                          'bg-blue-600',
                          'bg-blue-800',
                        ];
                        return (
                          <div
                            key={hourIndex}
                            className={`w-8 h-8 m-px rounded cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all ${colors[intensity]}`}
                            title={`${dayData.day} ${hourIndex}:00 - 活跃度: ${hourData.value.toFixed(0)}%`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* 热力图图例 */}
              <div className="flex items-center justify-center mt-4 gap-2">
                <span className="text-sm text-gray-500">低</span>
                <div className="flex gap-1">
                  {['bg-gray-100', 'bg-blue-200', 'bg-blue-400', 'bg-blue-600', 'bg-blue-800'].map((color, index) => (
                    <div key={index} className={`w-4 h-4 rounded ${color}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">高</span>
              </div>
            </CardContent>
          </Card>

          {/* 活跃度统计分析 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">工作时段活跃度</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['上午 (9-12点)', '下午 (13-18点)', '晚上 (19-23点)'].map((period, index) => {
                    const hours = period === '上午 (9-12点)' ? [9, 10, 11] :
                                 period === '下午 (13-18点)' ? [13, 14, 15, 16, 17] :
                                 [19, 20, 21, 22];
                    const total = hours.reduce((sum, hour) => sum + (hourlyData.find(h => h.hourNum === hour)?.count || 0), 0);
                    const avg = total / hours.length;

                    return (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{period}</span>
                        <Badge variant={avg > 50 ? 'default' : 'secondary'}>
                          {Math.round(avg)}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">活跃模式</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">工作日</span>
                    <Badge variant="default">高</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">周末</span>
                    <Badge variant="secondary">中</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">深夜 (0-6点)</span>
                    <Badge variant="outline">低</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">优化建议</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                    <span>在高峰时段增加服务器资源</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
                    <span>针对工作日推送个性化内容</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-600 rounded-full mt-2" />
                    <span>优化低活跃时段的推送策略</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 留存分析标签页 */}
        <TabsContent value="retention" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>用户留存漏斗</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <FunnelChart>
                    <Funnel
                      data={[
                        { name: '新注册用户', value: 1000, fill: '#8884d8' },
                        { name: '首次使用', value: 800, fill: '#83a6ed' },
                        { name: '7天留存', value: 600, fill: '#8dd1e1' },
                        { name: '30天留存', value: 400, fill: '#82ca9d' },
                        { name: '活跃用户', value: 300, fill: '#a4de6c' },
                      ]}
                    />
                  </FunnelChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>留存率详情</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { period: '次日留存', rate: 85, trend: 'up' },
                    { period: '7日留存', rate: 60, trend: 'stable' },
                    { period: '30日留存', rate: 40, trend: 'down' },
                    { period: '90日留存', rate: 25, trend: 'down' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.period}</div>
                        <div className="text-sm text-gray-500">留存用户占比</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{item.rate}%</span>
                        {item.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : item.trend === 'down' ? (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 用户分群标签页 */}
        <TabsContent value="segments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.userSegments.map((segment, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: segmentColors[segment.segment as keyof typeof segmentColors] }}
                    />
                    {segment.segment}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{segment.userCount}</div>
                      <div className="text-sm text-gray-500">用户数量</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">平均使用时长</span>
                        <span className="font-medium">{Math.round(segment.avgUsage / 60)}分钟</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">平均满意度</span>
                        <Badge variant={parseFloat(segment.avgSatisfaction) > 3.5 ? 'default' : 'secondary'}>
                          {segment.avgSatisfaction}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">占比</span>
                        <span className="font-medium">
                          {((segment.userCount / data.userSegments.reduce((sum, s) => sum + s.userCount, 0)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">特征描述</h4>
                      <p className="text-xs text-gray-600">
                        {segment.segment === '高频用户' && '重度使用者，每天多次使用，满意度最高'}
                        {segment.segment === '中频用户' && '规律使用者，每周使用几次，满意度良好'}
                        {segment.segment === '低频用户' && '偶尔使用者，需要更多引导和激励'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 分群策略建议 */}
          <Card>
            <CardHeader>
              <CardTitle>分群运营策略</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">高频用户策略</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• 提供高级功能权限</li>
                    <li>• 邀请参与产品测试</li>
                    <li>• 建立用户社群</li>
                    <li>• 提供个性化服务</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">中频用户策略</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 定期功能介绍</li>
                    <li>• 使用技巧推送</li>
                    <li>• 激励计划参与</li>
                    <li>• 个性化推荐</li>
                  </ul>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">低频用户策略</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• 新手引导优化</li>
                    <li>• 定期提醒推送</li>
                    <li>• 简化使用流程</li>
                    <li>• 提供成功案例</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}