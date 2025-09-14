'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Download,
  TrendingUp,
  Users,
  MapPin,
  Settings,
} from 'lucide-react';

// 导入分析组件
import LineChartComponent from '@/components/analytics/LineChart';
import AgentUsageChart from '@/components/analytics/AgentUsageChart';
import ComparisonChart from '@/components/analytics/ComparisonChart';
import RealTimeMonitor from '@/components/analytics/RealTimeMonitor';
import DataExport from '@/components/analytics/DataExport';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面标题 */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              数据分析中心
            </h1>
            <p className="text-gray-600 mt-2">
              全面的数据可视化和分析平台，帮助您深入了解系统使用情况和用户行为
            </p>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-200">
            <Activity className="h-3 w-3 mr-1" />
            实时监控
          </Badge>
        </div>

        {/* 快速统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">今日会话</p>
                  <p className="text-2xl font-bold text-blue-900">1,234</p>
                  <p className="text-xs text-blue-700">+12.5% 较昨日</p>
                </div>
                <LineChart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">活跃用户</p>
                  <p className="text-2xl font-bold text-green-900">856</p>
                  <p className="text-xs text-green-700">+8.3% 较昨日</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">平均响应时间</p>
                  <p className="text-2xl font-bold text-purple-900">1.2s</p>
                  <p className="text-xs text-purple-700">-15.2% 较昨日</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">活跃地区</p>
                  <p className="text-2xl font-bold text-orange-900">23</p>
                  <p className="text-xs text-orange-700">+2 较昨日</p>
                </div>
                <MapPin className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              概览
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              趋势分析
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <PieIcon className="h-4 w-4" />
              智能体分析
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              多维对比
            </TabsTrigger>
            <TabsTrigger value="realtime" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              实时监控
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              数据导出
            </TabsTrigger>
          </TabsList>

          {/* 概览页面 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineChartComponent
                title="使用趋势概览"
                description="最近30天的系统使用趋势"
                height={300}
                defaultMetric="sessions"
              />
              <AgentUsageChart
                title="智能体使用占比"
                description="各智能体的使用情况分布"
                height={300}
                defaultChartType="pie"
                defaultGroupBy="usage"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComparisonChart
                title="用户类型对比"
                description="登录用户与匿名用户的使用对比"
                height={300}
                defaultDimensions={['userType', 'deviceType']}
                defaultMetric="sessions"
              />
              <RealTimeMonitor
                title="实时状态概览"
                description="系统实时运行状态和关键指标"
                refreshInterval={60000}
              />
            </div>
          </TabsContent>

          {/* 趋势分析页面 */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <LineChartComponent
                title="每日使用趋势"
                description="按天统计的会话次数变化趋势"
                height={400}
                defaultMetric="sessions"
                defaultGroupBy="day"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineChartComponent
                title="用户数量趋势"
                description="每日活跃用户数量的变化趋势"
                height={350}
                defaultMetric="users"
                defaultGroupBy="day"
              />
              <LineChartComponent
                title="响应时间趋势"
                description="系统平均响应时间的变化趋势"
                height={350}
                defaultMetric="responseTime"
                defaultGroupBy="day"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineChartComponent
                title="会话时长趋势"
                description="用户平均会话时长的变化趋势"
                height={350}
                defaultMetric="duration"
                defaultGroupBy="day"
              />
              <LineChartComponent
                title="Token使用趋势"
                description="每日Token使用量的变化趋势"
                height={350}
                defaultMetric="tokens"
                defaultGroupBy="day"
              />
            </div>
          </TabsContent>

          {/* 智能体分析页面 */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AgentUsageChart
                title="智能体使用次数"
                description="各智能体的使用次数统计"
                height={400}
                defaultChartType="pie"
                defaultGroupBy="usage"
              />
              <AgentUsageChart
                title="智能体性能对比"
                description="多维度智能体性能指标对比"
                height={400}
                defaultChartType="radar"
                defaultGroupBy="usage"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AgentUsageChart
                title="智能体使用时长"
                description="各智能体的平均使用时长对比"
                height={350}
                defaultChartType="bar"
                defaultGroupBy="duration"
              />
              <AgentUsageChart
                title="智能体响应时间"
                description="各智能体的平均响应时间对比"
                height={350}
                defaultChartType="bar"
                defaultGroupBy="responseTime"
              />
            </div>
          </TabsContent>

          {/* 多维对比页面 */}
          <TabsContent value="comparison" className="space-y-6">
            <ComparisonChart
              title="全面数据对比分析"
              description="从多个维度对比分析系统使用数据"
              height={450}
              defaultDimensions={['time', 'location', 'userType']}
              defaultMetric="sessions"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComparisonChart
                title="用户设备对比"
                description="不同设备类型的使用情况对比"
                height={350}
                defaultDimensions={['deviceType', 'agentType']}
                defaultMetric="sessions"
              />
              <ComparisonChart
                title="地理分布对比"
                description="不同地区的使用情况对比"
                height={350}
                defaultDimensions={['location']}
                defaultMetric="users"
              />
            </div>
          </TabsContent>

          {/* 实时监控页面 */}
          <TabsContent value="realtime" className="space-y-6">
            <RealTimeMonitor
              title="实时系统监控"
              description="实时监控系统运行状态和用户活动"
              refreshInterval={30000}
            />
          </TabsContent>

          {/* 数据导出页面 */}
          <TabsContent value="export" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <DataExport />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}