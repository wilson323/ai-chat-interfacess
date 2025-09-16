'use client';

import React, { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  PieChart as PieChartIcon,
  BarChart3,
  Download,
  RefreshCw,
  Lightbulb,
  Zap,
  Globe,
} from 'lucide-react';

// 数据类型定义
interface ConversationAnalyticsData {
  messageTypeDistribution: {
    text: number;
    image: number;
    file: number;
    voice: number;
    mixed: number;
    total: number;
  };
  conversationLength: {
    avgLength: number;
    distribution: Array<{ range: string; count: number; percentage: number }>;
  };
  keywordAnalysis: Array<{
    keyword: string;
    frequency: number;
    trend: 'up' | 'down' | 'stable';
    relatedAgents: number[];
  }>;
  languageDistribution: Array<{
    language: string;
    percentage: number;
    geoDistribution: Array<{ region: string; percentage: number }>;
  }>;
}

interface BusinessValueData {
  costAnalysis: {
    totalTokens: number;
    estimatedCost: number;
    costByAgent: Array<{
      agentId: number;
      agentName: string;
      tokens: number;
      cost: number;
      percentage: number;
    }>;
    optimizationSuggestions: Array<{
      type: string;
      potentialSavings: number;
      description: string;
    }>;
  };
  roiAnalysis: {
    totalInvestment: number;
    estimatedValue: number;
    roi: number;
    roiByAgent: Array<{
      agentId: number;
      agentName: string;
      investment: number;
      value: number;
      roi: number;
    }>;
  };
  efficiencyMetrics: {
    avgSessionDuration: number;
    avgResponseTime: number;
    userProductivity: number;
    timeSaved: number;
  };
  valueAssessment: Array<{
    agentId: number;
    agentName: string;
    businessValue: number;
    userAdoption: number;
    strategicImportance: number;
    overallScore: number;
  }>;
}

interface ConversationBusinessAnalyticsProps {
  conversationData: ConversationAnalyticsData;
  businessData: BusinessValueData;
  onExport?: (format: 'json' | 'csv' | 'excel') => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function ConversationBusinessAnalytics({
  conversationData,
  businessData,
  onExport,
  onRefresh,
  isLoading = false,
}: ConversationBusinessAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedView, setSelectedView] = useState('conversation');

  // 消息类型数据转换
  const messageTypeData = [
    {
      name: '文本消息',
      value: conversationData.messageTypeDistribution.text,
      color: '#3b82f6',
    },
    {
      name: '图像消息',
      value: conversationData.messageTypeDistribution.image,
      color: '#10b981',
    },
    {
      name: '文件消息',
      value: conversationData.messageTypeDistribution.file,
      color: '#f59e0b',
    },
    {
      name: '语音消息',
      value: conversationData.messageTypeDistribution.voice,
      color: '#ef4444',
    },
    {
      name: '混合消息',
      value: conversationData.messageTypeDistribution.mixed,
      color: '#8b5cf6',
    },
  ];

  // 关键词趋势数据
  const keywordTrendData = conversationData.keywordAnalysis
    .slice(0, 8)
    .map(keyword => ({
      keyword: keyword.keyword,
      frequency: keyword.frequency,
      trend: keyword.trend,
    }));

  // 语言分布数据
  const languagePieData = conversationData.languageDistribution.map(lang => ({
    name: lang.language,
    value: lang.percentage,
    color:
      lang.language === '中文'
        ? '#3b82f6'
        : lang.language === 'English'
          ? '#10b981'
          : lang.language === '日本語'
            ? '#f59e0b'
            : '#ef4444',
  }));

  // 成本分析数据
  const costByAgentData = businessData.costAnalysis.costByAgent.map(agent => ({
    name: agent.agentName,
    tokens: agent.tokens,
    cost: agent.cost,
    percentage: agent.percentage,
  }));

  // ROI分析数据
  const roiData = businessData.roiAnalysis.roiByAgent.map(agent => ({
    name: agent.agentName,
    roi: agent.roi,
    investment: agent.investment,
    value: agent.value,
  }));

  // 价值评估雷达图数据
  const valueRadarData = businessData.valueAssessment.map(agent => ({
    subject: agent.agentName,
    businessValue: agent.businessValue,
    userAdoption: agent.userAdoption,
    strategicImportance: agent.strategicImportance,
    fullMark: 100,
  }));

  // 计算关键指标
  const totalCost = businessData.costAnalysis.estimatedCost;
  const totalROI = businessData.roiAnalysis.roi;
  const avgProductivity = businessData.efficiencyMetrics.userProductivity;
  const totalSessions = conversationData.messageTypeDistribution.total;

  return (
    <div className='space-y-6'>
      {/* 控制面板 */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <select
            id='conversationAnalyticsTimeRange'
            name='conversationAnalyticsTimeRange'
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-md text-sm'
          >
            <option value='7d'>最近7天</option>
            <option value='30d'>最近30天</option>
            <option value='90d'>最近90天</option>
            <option value='365d'>最近1年</option>
          </select>

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
          </div>
        </div>
      </div>

      {/* 核心指标 */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>总会话数</p>
                <p className='text-2xl font-bold'>
                  {totalSessions.toLocaleString()}
                </p>
                <p className='text-xs text-gray-500'>消息交互总量</p>
              </div>
              <MessageSquare className='h-8 w-8 text-blue-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>总成本</p>
                <p className='text-2xl font-bold'>${totalCost.toFixed(2)}</p>
                <p className='text-xs text-gray-500'>Token使用成本</p>
              </div>
              <DollarSign className='h-8 w-8 text-green-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>投资回报率</p>
                <p className='text-2xl font-bold'>{totalROI.toFixed(1)}%</p>
                <p className='text-xs text-gray-500'>ROI</p>
              </div>
              <Target className='h-8 w-8 text-purple-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>用户生产力</p>
                <p className='text-2xl font-bold'>{avgProductivity}%</p>
                <p className='text-xs text-gray-500'>效率提升</p>
              </div>
              <Zap className='h-8 w-8 text-orange-600' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细分析 */}
      <Tabs
        value={selectedView}
        onValueChange={setSelectedView}
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='conversation'>对话分析</TabsTrigger>
          <TabsTrigger value='keywords'>关键词分析</TabsTrigger>
          <TabsTrigger value='business'>业务价值</TabsTrigger>
          <TabsTrigger value='optimization'>优化建议</TabsTrigger>
        </TabsList>

        {/* 对话分析标签页 */}
        <TabsContent value='conversation' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 消息类型分布 */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <PieChartIcon className='h-5 w-5' />
                  消息类型分布
                </CardTitle>
                <CardDescription>不同类型消息的使用占比</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <PieChart>
                    <Pie
                      data={messageTypeData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ name, value }) =>
                        `${name} ${value}`
                      }
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {messageTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={value => [value, '数量']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 对话长度分布 */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BarChart3 className='h-5 w-5' />
                  对话长度分布
                </CardTitle>
                <CardDescription>
                  平均对话时长: {conversationData.conversationLength.avgLength}
                  秒
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart
                    data={conversationData.conversationLength.distribution}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='range' tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        value,
                        name === 'count' ? '数量' : '占比',
                      ]}
                    />
                    <Bar dataKey='count' fill='#3b82f6' radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* 语言分布 */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Globe className='h-5 w-5' />
                语言分布分析
              </CardTitle>
              <CardDescription>用户使用的语言类型和地理分布</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <div>
                  <h4 className='text-lg font-medium mb-4'>语言占比</h4>
                  <ResponsiveContainer width='100%' height={250}>
                    <PieChart>
                      <Pie
                        data={languagePieData}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        label={({ name, value }) =>
                          `${name} ${value}`
                        }
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='value'
                      >
                        {languagePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h4 className='text-lg font-medium mb-4'>地理分布</h4>
                  <div className='space-y-3'>
                    {conversationData.languageDistribution.map(
                      (lang, index) => (
                        <div key={index} className='border rounded-lg p-3'>
                          <h5 className='font-medium mb-2'>{lang.language}</h5>
                          <div className='space-y-1'>
                            {lang.geoDistribution.map((geo, geoIndex) => (
                              <div
                                key={geoIndex}
                                className='flex justify-between items-center text-sm'
                              >
                                <span>{geo.region}</span>
                                <Badge variant='outline'>
                                  {geo.percentage}%
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 关键词分析标签页 */}
        <TabsContent value='keywords' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 关键词频率 */}
            <Card>
              <CardHeader>
                <CardTitle>热门关键词</CardTitle>
                <CardDescription>用户最常询问的关键词和主题</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={350}>
                  <BarChart data={keywordTrendData} layout='horizontal'>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis type='number' />
                    <YAxis dataKey='keyword' type='category' width={80} />
                    <Tooltip formatter={value => [value, '出现次数']} />
                    <Bar
                      dataKey='frequency'
                      fill='#10b981'
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 关键词趋势 */}
            <Card>
              <CardHeader>
                <CardTitle>关键词趋势分析</CardTitle>
                <CardDescription>关键词使用趋势和关联分析</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {conversationData.keywordAnalysis
                    .slice(0, 6)
                    .map((keyword, index) => (
                      <div key={index} className='border rounded-lg p-4'>
                        <div className='flex items-center justify-between mb-2'>
                          <h4 className='font-medium'>{keyword.keyword}</h4>
                          <div className='flex items-center gap-2'>
                            <span className='text-lg font-bold'>
                              {keyword.frequency}
                            </span>
                            {keyword.trend === 'up' && (
                              <TrendingUp className='h-4 w-4 text-green-600' />
                            )}
                            {keyword.trend === 'down' && (
                              <TrendingDown className='h-4 w-4 text-red-600' />
                            )}
                          </div>
                        </div>
                        <div className='text-sm text-gray-600 mb-2'>
                          趋势:{' '}
                          {keyword.trend === 'up'
                            ? '上升'
                            : keyword.trend === 'down'
                              ? '下降'
                              : '稳定'}
                        </div>
                        <div>
                          <span className='text-sm text-gray-500'>
                            相关智能体:
                          </span>
                          <div className='flex gap-1 mt-1'>
                            {keyword.relatedAgents.map(
                              (agentId, agentIndex) => (
                                <Badge
                                  key={agentIndex}
                                  variant='secondary'
                                  className='text-xs'
                                >
                                  智能体 {agentId}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 主题聚类 */}
          <Card>
            <CardHeader>
              <CardTitle>主题分析</CardTitle>
              <CardDescription>基于关键词的主题聚类和关联度</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='p-4 bg-blue-50 rounded-lg'>
                  <h4 className='font-medium text-blue-800 mb-2'>技术开发</h4>
                  <div className='flex flex-wrap gap-1'>
                    {['开发', '代码', '调试', '部署', 'API'].map((tag, i) => (
                      <Badge key={i} variant='outline' className='text-xs'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className='p-4 bg-green-50 rounded-lg'>
                  <h4 className='font-medium text-green-800 mb-2'>设计创意</h4>
                  <div className='flex flex-wrap gap-1'>
                    {['设计', '图像', '创意', '界面', '原型'].map((tag, i) => (
                      <Badge key={i} variant='outline' className='text-xs'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className='p-4 bg-purple-50 rounded-lg'>
                  <h4 className='font-medium text-purple-800 mb-2'>数据分析</h4>
                  <div className='flex flex-wrap gap-1'>
                    {['分析', '数据', '统计', '报告', '图表'].map((tag, i) => (
                      <Badge key={i} variant='outline' className='text-xs'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 业务价值分析标签页 */}
        <TabsContent value='business' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 成本分析 */}
            <Card>
              <CardHeader>
                <CardTitle>成本分析</CardTitle>
                <CardDescription>各智能体的Token使用成本</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={costByAgentData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='name' tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'cost' ? `$${value}` : value,
                        name === 'cost'
                          ? '成本'
                          : name === 'tokens'
                            ? 'Token数量'
                            : '占比',
                      ]}
                    />
                    <Legend />
                    <Bar dataKey='cost' fill='#ef4444' radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* ROI分析 */}
            <Card>
              <CardHeader>
                <CardTitle>投资回报率</CardTitle>
                <CardDescription>各智能体的ROI表现</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={roiData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='name' tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip formatter={value => [`${value}%`, 'ROI']} />
                    <Bar dataKey='roi' fill='#10b981' radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* 价值评估雷达图 */}
          <Card>
            <CardHeader>
              <CardTitle>价值评估雷达图</CardTitle>
              <CardDescription>各智能体在业务价值维度的表现</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={400}>
                <RadarChart data={valueRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey='subject' />
                  <PolarRadiusAxis domain={[0, 100]} />
                  {valueRadarData.map((agent, radarIndex) => (
                    <Radar
                      key={agent.subject}
                      name={agent.subject}
                      dataKey='subject'
                      stroke={radarIndex % 2 === 0 ? '#8884d8' : '#82ca9d'}
                      fill={radarIndex % 2 === 0 ? '#8884d8' : '#82ca9d'}
                      fillOpacity={0.3}
                    />
                  ))}
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 业务价值详情 */}
          <Card>
            <CardHeader>
              <CardTitle>业务价值详情</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {businessData.valueAssessment.map((agent) => (
                  <div key={agent.agentId} className='border rounded-lg p-4'>
                    <h4 className='font-medium mb-3'>{agent.agentName}</h4>
                    <div className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-500'>业务价值</span>
                        <span className='font-medium'>
                          {agent.businessValue}
                        </span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-500'>用户采用率</span>
                        <span className='font-medium'>
                          {agent.userAdoption}%
                        </span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-500'>战略重要性</span>
                        <span className='font-medium'>
                          {agent.strategicImportance}
                        </span>
                      </div>
                      <div className='pt-2 border-t'>
                        <div className='flex justify-between items-center'>
                          <span className='font-medium'>综合评分</span>
                          <Badge
                            variant={
                              agent.overallScore >= 80
                                ? 'default'
                                : agent.overallScore >= 60
                                  ? 'secondary'
                                  : 'destructive'
                            }
                          >
                            {agent.overallScore}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 优化建议标签页 */}
        <TabsContent value='optimization' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* 成本优化建议 */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Lightbulb className='h-5 w-5' />
                  成本优化建议
                </CardTitle>
                <CardDescription>基于使用模式的成本优化方案</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {businessData.costAnalysis.optimizationSuggestions.map(
                    (suggestion, index) => (
                      <div key={index} className='border rounded-lg p-4'>
                        <div className='flex items-center justify-between mb-2'>
                          <h4 className='font-medium'>{suggestion.type}</h4>
                          <Badge variant='outline'>
                            节省 ${suggestion.potentialSavings.toFixed(2)}
                          </Badge>
                        </div>
                        <p className='text-sm text-gray-600'>
                          {suggestion.description}
                        </p>
                        <div className='mt-2'>
                          <div className='w-full bg-gray-200 rounded-full h-2'>
                            <div
                              className='h-2 bg-green-500 rounded-full'
                              style={{
                                width: `${Math.min((suggestion.potentialSavings / totalCost) * 100, 100)}%`,
                              }}
                            />
                          </div>
                          <div className='text-xs text-gray-500 mt-1'>
                            占总成本的{' '}
                            {(
                              (suggestion.potentialSavings / totalCost) *
                              100
                            ).toFixed(1)}
                            %
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 效率指标 */}
            <Card>
              <CardHeader>
                <CardTitle>效率指标分析</CardTitle>
                <CardDescription>系统效率和使用效益的关键指标</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='border rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <h4 className='font-medium'>平均会话时长</h4>
                      <span className='text-lg font-bold'>
                        {businessData.efficiencyMetrics.avgSessionDuration}秒
                      </span>
                    </div>
                    <div className='text-sm text-gray-600'>
                      用户的平均使用时长，反映用户粘性
                    </div>
                  </div>

                  <div className='border rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <h4 className='font-medium'>平均响应时间</h4>
                      <span className='text-lg font-bold'>
                        {businessData.efficiencyMetrics.avgResponseTime}ms
                      </span>
                    </div>
                    <div className='text-sm text-gray-600'>
                      系统响应速度，影响用户体验
                    </div>
                  </div>

                  <div className='border rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <h4 className='font-medium'>时间节省</h4>
                      <span className='text-lg font-bold'>
                        {businessData.efficiencyMetrics.timeSaved}分钟
                      </span>
                    </div>
                    <div className='text-sm text-gray-600'>
                      相比传统方式节省的时间成本
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 综合优化策略 */}
          <Card>
            <CardHeader>
              <CardTitle>综合优化策略</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='p-6 bg-blue-50 rounded-lg'>
                  <h4 className='font-bold text-blue-800 mb-4'>
                    短期优化 (1-3个月)
                  </h4>
                  <ul className='space-y-2 text-sm text-blue-700'>
                    <li>• 实施响应缓存策略</li>
                    <li>• 优化提示词模板</li>
                    <li>• 改进错误处理机制</li>
                    <li>• 增加用户引导功能</li>
                  </ul>
                  <div className='mt-4 text-sm font-medium text-blue-800'>
                    预期效果: 成本降低15-20%
                  </div>
                </div>

                <div className='p-6 bg-green-50 rounded-lg'>
                  <h4 className='font-bold text-green-800 mb-4'>
                    长期优化 (3-12个月)
                  </h4>
                  <ul className='space-y-2 text-sm text-green-700'>
                    <li>• 部署AI模型蒸馏</li>
                    <li>• 建立用户画像系统</li>
                    <li>• 开发智能路由算法</li>
                    <li>• 构建自动化测试体系</li>
                  </ul>
                  <div className='mt-4 text-sm font-medium text-green-800'>
                    预期效果: 效率提升30-50%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
