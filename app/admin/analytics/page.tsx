'use client';

import type { Viewport } from 'next';
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};
import React, { useState } from 'react';
// 移除未使用的导入
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
import { StatCard } from '@/components/admin/analytics/StatCard';
import { ChartGrid } from '@/components/admin/analytics/ChartGrid';

// 默认配置常量
const DEFAULT_METRICS = {
  SESSIONS: 'sessions',
  USERS: 'users',
  RESPONSE_TIME: 'responseTime',
  DURATION: 'duration',
  TOKENS: 'tokens',
} as const;

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      {/* 页面标题 */}
      <div className='max-w-7xl mx-auto mb-8'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-3'>
              <BarChart3 className='h-8 w-8 text-blue-600' />
              数据分析中心
            </h1>
            <p className='text-gray-600 mt-2'>
              全面的数据可视化和分析平台，帮助您深入了解系统使用情况和用户行为
            </p>
          </div>
          <Badge variant='outline' className='text-green-600 border-green-200'>
            <Activity className='h-3 w-3 mr-1' />
            实时监控
          </Badge>
        </div>

        {/* 快速统计卡片 */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
          <StatCard
            title='今日会话'
            value='1,234'
            description='+12.5% 较昨日'
            icon={LineChart}
            gradientFrom='from-blue-50'
            gradientTo='to-blue-100'
            borderColor='border-blue-200'
            textColor='text-blue-600'
          />
          <StatCard
            title='活跃用户'
            value='856'
            description='+8.3% 较昨日'
            icon={Users}
            gradientFrom='from-green-50'
            gradientTo='to-green-100'
            borderColor='border-green-200'
            textColor='text-green-600'
          />
          <StatCard
            title='平均响应时间'
            value='1.2s'
            description='-15.2% 较昨日'
            icon={TrendingUp}
            gradientFrom='from-purple-50'
            gradientTo='to-purple-100'
            borderColor='border-purple-200'
            textColor='text-purple-600'
          />
          <StatCard
            title='活跃地区'
            value='23'
            description='+2 较昨日'
            icon={MapPin}
            gradientFrom='from-orange-50'
            gradientTo='to-orange-100'
            borderColor='border-orange-200'
            textColor='text-orange-600'
          />
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className='max-w-7xl mx-auto'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-6 mb-8'>
            <TabsTrigger value='overview' className='flex items-center gap-2'>
              <BarChart3 className='h-4 w-4' />
              概览
            </TabsTrigger>
            <TabsTrigger value='trends' className='flex items-center gap-2'>
              <LineChart className='h-4 w-4' />
              趋势分析
            </TabsTrigger>
            <TabsTrigger value='agents' className='flex items-center gap-2'>
              <PieIcon className='h-4 w-4' />
              智能体分析
            </TabsTrigger>
            <TabsTrigger value='comparison' className='flex items-center gap-2'>
              <Activity className='h-4 w-4' />
              多维对比
            </TabsTrigger>
            <TabsTrigger value='realtime' className='flex items-center gap-2'>
              <Settings className='h-4 w-4' />
              实时监控
            </TabsTrigger>
            <TabsTrigger value='export' className='flex items-center gap-2'>
              <Download className='h-4 w-4' />
              数据导出
            </TabsTrigger>
          </TabsList>

          {/* 概览页面 */}
          <TabsContent value='overview' className='space-y-6'>
            <ChartGrid>
              <LineChartComponent
                title='使用趋势概览'
                description='最近30天的系统使用趋势'
                height={300}
                defaultMetric={DEFAULT_METRICS.SESSIONS}
              />
              <AgentUsageChart
                title='智能体使用占比'
                description='各智能体的使用情况分布'
                height={300}
                defaultChartType='pie'
                defaultGroupBy='usage'
              />
            </ChartGrid>

            <ChartGrid>
              <ComparisonChart
                title='用户类型对比'
                description='登录用户与匿名用户的使用对比'
                height={300}
                defaultDimensions={['userType', 'deviceType']}
                defaultMetric={DEFAULT_METRICS.SESSIONS}
              />
              <RealTimeMonitor
                title='实时状态概览'
                description='系统实时运行状态和关键指标'
                refreshInterval={60000}
              />
            </ChartGrid>
          </TabsContent>

          {/* 趋势分析页面 */}
          <TabsContent value='trends' className='space-y-6'>
            <ChartGrid cols={1}>
              <LineChartComponent
                title='每日使用趋势'
                description='按天统计的会话次数变化趋势'
                height={400}
                defaultMetric={DEFAULT_METRICS.SESSIONS}
                defaultGroupBy='day'
              />
            </ChartGrid>

            <ChartGrid>
              <LineChartComponent
                title='用户数量趋势'
                description='每日活跃用户数量的变化趋势'
                height={350}
                defaultMetric={DEFAULT_METRICS.USERS}
                defaultGroupBy='day'
              />
              <LineChartComponent
                title='响应时间趋势'
                description='系统平均响应时间的变化趋势'
                height={350}
                defaultMetric={DEFAULT_METRICS.RESPONSE_TIME}
                defaultGroupBy='day'
              />
            </ChartGrid>

            <ChartGrid>
              <LineChartComponent
                title='会话时长趋势'
                description='用户平均会话时长的变化趋势'
                height={350}
                defaultMetric={DEFAULT_METRICS.DURATION}
                defaultGroupBy='day'
              />
              <LineChartComponent
                title='Token使用趋势'
                description='每日Token使用量的变化趋势'
                height={350}
                defaultMetric={DEFAULT_METRICS.TOKENS}
                defaultGroupBy='day'
              />
            </ChartGrid>
          </TabsContent>

          {/* 智能体分析页面 */}
          <TabsContent value='agents' className='space-y-6'>
            <ChartGrid>
              <AgentUsageChart
                title='智能体使用次数'
                description='各智能体的使用次数统计'
                height={400}
                defaultChartType='pie'
                defaultGroupBy='usage'
              />
              <AgentUsageChart
                title='智能体性能对比'
                description='多维度智能体性能指标对比'
                height={400}
                defaultChartType='radar'
                defaultGroupBy='usage'
              />
            </ChartGrid>

            <ChartGrid>
              <AgentUsageChart
                title='智能体使用时长'
                description='各智能体的平均使用时长对比'
                height={350}
                defaultChartType='bar'
                defaultGroupBy='duration'
              />
              <AgentUsageChart
                title='智能体响应时间'
                description='各智能体的平均响应时间对比'
                height={350}
                defaultChartType='bar'
                defaultGroupBy='responseTime'
              />
            </ChartGrid>
          </TabsContent>

          {/* 多维对比页面 */}
          <TabsContent value='comparison' className='space-y-6'>
            <ComparisonChart
              title='全面数据对比分析'
              description='从多个维度对比分析系统使用数据'
              height={450}
              defaultDimensions={['time', 'location', 'userType']}
              defaultMetric='sessions'
            />

            <ChartGrid>
              <ComparisonChart
                title='用户设备对比'
                description='不同设备类型的使用情况对比'
                height={350}
                defaultDimensions={['deviceType', 'agentType']}
                defaultMetric={DEFAULT_METRICS.SESSIONS}
              />
              <ComparisonChart
                title='地理分布对比'
                description='不同地区的使用情况对比'
                height={350}
                defaultDimensions={['location']}
                defaultMetric={DEFAULT_METRICS.USERS}
              />
            </ChartGrid>
          </TabsContent>

          {/* 实时监控页面 */}
          <TabsContent value='realtime' className='space-y-6'>
            <RealTimeMonitor
              title='实时系统监控'
              description='实时监控系统运行状态和用户活动'
              refreshInterval={30000}
            />
          </TabsContent>

          {/* 数据导出页面 */}
          <TabsContent value='export' className='space-y-6'>
            <div className='max-w-4xl mx-auto'>
              <DataExport />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
