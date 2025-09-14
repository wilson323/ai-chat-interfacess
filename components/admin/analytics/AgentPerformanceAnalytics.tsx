'use client';

import React, { useState } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  BarChart,
  Bar,
  BoxPlotChart,
  BoxPlot,
  ErrorBar,
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
  Zap,
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Award,
  Activity,
  Target,
  Download,
  RefreshCw,
} from 'lucide-react';

// 数据类型定义
interface AgentPerformanceData {
  responseTimeDistribution: Array<{
    agentId: number;
    agentName: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    outliers: number;
  }>;
  errorRates: Array<{
    agentId: number;
    agentName: string;
    errorRate: number;
    totalSessions: number;
    errorSessions: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  satisfactionAnalysis: Array<{
    agentId: number;
    agentName: string;
    avgSatisfaction: number;
    satisfactionDistribution: {
      positive: number;
      neutral: number;
      negative: number;
    };
    trend: 'improving' | 'declining' | 'stable';
  }>;
  performanceRadar: Array<{
    agentId: number;
    agentName: string;
    speed: number;
    reliability: number;
    satisfaction: number;
    efficiency: number;
    popularity: number;
  }>;
}

interface AgentPerformanceAnalyticsProps {
  data: AgentPerformanceData;
  onExport?: (format: 'json' | 'csv' | 'excel') => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function AgentPerformanceAnalytics({
  data,
  onExport,
  onRefresh,
  isLoading = false,
}: AgentPerformanceAnalyticsProps) {
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('performance');

  // 处理响应时间分布数据
  const responseTimeData = data.responseTimeDistribution.map(agent => ({
    name: agent.agentName,
    min: agent.min,
    q1: agent.q1,
    median: agent.median,
    q3: agent.q3,
    max: agent.max,
    outliers: agent.outliers,
    agentId: agent.agentId,
  }));

  // 处理雷达图数据
  const radarData = data.performanceRadar.map(agent => ({
    subject: agent.agentName,
    speed: agent.speed,
    reliability: agent.reliability,
    satisfaction: agent.satisfaction,
    efficiency: agent.efficiency,
    popularity: agent.popularity,
    fullMark: 100,
  }));

  // 处理散点图数据
  const scatterData = data.performanceRadar.map(agent => ({
    x: agent.speed,
    y: agent.reliability,
    z: agent.satisfaction,
    name: agent.agentName,
    agentId: agent.agentId,
  }));

  // 计算性能评分
  const calculatePerformanceScore = (agent: any) => {
    return Math.round((agent.speed + agent.reliability + agent.satisfaction + agent.efficiency + agent.popularity) / 5);
  };

  // 排序后的智能体列表
  const sortedAgents = [...data.performanceRadar].sort((a, b) => {
    switch (sortBy) {
      case 'speed':
        return b.speed - a.speed;
      case 'reliability':
        return b.reliability - a.reliability;
      case 'satisfaction':
        return b.satisfaction - a.satisfaction;
      case 'popularity':
        return b.popularity - a.popularity;
      case 'performance':
      default:
        return calculatePerformanceScore(b) - calculatePerformanceScore(a);
    }
  });

  // 计算总体指标
  const avgResponseTime = data.responseTimeDistribution.reduce((sum, agent) => sum + agent.median, 0) / data.responseTimeDistribution.length;
  const avgErrorRate = data.errorRates.reduce((sum, agent) => sum + agent.errorRate, 0) / data.errorRates.length;
  const avgSatisfaction = data.satisfactionAnalysis.reduce((sum, agent) => sum + agent.avgSatisfaction, 0) / data.satisfactionAnalysis.length;

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="performance">综合性能</SelectItem>
              <SelectItem value="speed">响应速度</SelectItem>
              <SelectItem value="reliability">可靠性</SelectItem>
              <SelectItem value="satisfaction">用户满意度</SelectItem>
              <SelectItem value="popularity">受欢迎程度</SelectItem>
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
                <p className="text-sm font-medium text-gray-600">平均响应时间</p>
                <p className="text-2xl font-bold">{Math.round(avgResponseTime)}ms</p>
                <p className="text-xs text-gray-500">所有智能体</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均错误率</p>
                <p className="text-2xl font-bold">{(avgErrorRate * 100).toFixed(2)}%</p>
                <p className="text-xs text-gray-500">会话失败率</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均满意度</p>
                <p className="text-2xl font-bold">{avgSatisfaction.toFixed(2)}</p>
                <p className="text-xs text-gray-500">5分制评分</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">性能评分</p>
                <p className="text-2xl font-bold">
                  {Math.round(data.performanceRadar.reduce((sum, agent) => sum + calculatePerformanceScore(agent), 0) / data.performanceRadar.length)}
                </p>
                <p className="text-xs text-gray-500">综合评分</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细分析 */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="response-time">响应时间</TabsTrigger>
          <TabsTrigger value="reliability">可靠性</TabsTrigger>
          <TabsTrigger value="satisfaction">满意度</TabsTrigger>
          <TabsTrigger value="radar">性能雷达</TabsTrigger>
        </TabsList>

        {/* 概览标签页 */}
        <TabsContent value="overview" className="space-y-4">
          {/* 智能体性能排名 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                智能体性能排名
              </CardTitle>
              <CardDescription>基于综合评分的性能排名</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedAgents.map((agent, index) => {
                  const score = calculatePerformanceScore(agent);
                  const errorRate = data.errorRates.find(e => e.agentId === agent.agentId);
                  const satisfaction = data.satisfactionAnalysis.find(s => s.agentId === agent.agentId);

                  return (
                    <div key={agent.agentId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{agent.agentName}</div>
                          <div className="text-sm text-gray-500">综合评分: {score}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive'}>
                          {score >= 80 ? '优秀' : score >= 60 ? '良好' : '需改进'}
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm">
                            <span className="text-green-600">可靠性: {agent.reliability}%</span>
                            <span className="mx-2">|</span>
                            <span className="text-blue-600">满意度: {satisfaction?.avgSatisfaction.toFixed(2)}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            错误率: {((errorRate?.errorRate || 0) * 100).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 性能散点图 */}
          <Card>
            <CardHeader>
              <CardTitle>性能分布分析</CardTitle>
              <CardDescription>速度 vs 可靠性 vs 满意度的三维关系</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="速度"
                    domain={[0, 100]}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="可靠性"
                    domain={[0, 100]}
                  />
                  <ZAxis type="number" dataKey="z" range={[50, 400]} name="满意度" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter
                    name="智能体"
                    data={scatterData}
                    fill="#8884d8"
                    shape="circle"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 响应时间分析标签页 */}
        <TabsContent value="response-time" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 响应时间箱线图 */}
            <Card>
              <CardHeader>
                <CardTitle>响应时间分布</CardTitle>
                <CardDescription>各智能体响应时间的五数概括</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={responseTimeData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip
                      formatter={(value, name) => {
                        const labels: Record<string, string> = {
                          min: '最小值',
                          q1: '第一四分位数',
                          median: '中位数',
                          q3: '第三四分位数',
                          max: '最大值',
                        };
                        return [value, labels[name] || name];
                      }}
                    />
                    <Bar dataKey="min" fill="#8884d8" stackId="a" />
                    <Bar dataKey="q1" fill="#83a6ed" stackId="a" />
                    <Bar dataKey="median" fill="#8dd1e1" stackId="a" />
                    <Bar dataKey="q3" fill="#82ca9d" stackId="a" />
                    <Bar dataKey="max" fill="#a4de6c" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 响应时间统计 */}
            <Card>
              <CardHeader>
                <CardTitle>响应时间统计</CardTitle>
                <CardDescription>详细的响应时间指标</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.responseTimeDistribution.map((agent, index) => (
                    <div key={agent.agentId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{agent.agentName}</h4>
                        <Badge variant={agent.median < 1000 ? 'default' : agent.median < 2000 ? 'secondary' : 'destructive'}>
                          {agent.median < 1000 ? '快速' : agent.median < 2000 ? '正常' : '较慢'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">最小值</div>
                          <div className="font-medium">{agent.min}ms</div>
                        </div>
                        <div>
                          <div className="text-gray-500">中位数</div>
                          <div className="font-medium">{agent.median}ms</div>
                        </div>
                        <div>
                          <div className="text-gray-500">最大值</div>
                          <div className="font-medium">{agent.max}ms</div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        四分位距: {agent.q3 - agent.q1}ms | 异常值: {agent.outliers}个
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 可靠性分析标签页 */}
        <TabsContent value="reliability" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 错误率趋势 */}
            <Card>
              <CardHeader>
                <CardTitle>错误率分布</CardTitle>
                <CardDescription>各智能体的错误率对比</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.errorRates.map(agent => ({
                    name: agent.agentName,
                    errorRate: agent.errorRate * 100,
                    trend: agent.trend,
                    agentId: agent.agentId,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, '错误率']} />
                    <Bar dataKey="errorRate" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 错误率详情 */}
            <Card>
              <CardHeader>
                <CardTitle>错误率详情</CardTitle>
                <CardDescription>详细的错误统计和趋势</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.errorRates.map((agent, index) => (
                    <div key={agent.agentId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{agent.agentName}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={agent.errorRate < 0.05 ? 'default' : agent.errorRate < 0.1 ? 'secondary' : 'destructive'}>
                            {agent.errorRate < 0.05 ? '优秀' : agent.errorRate < 0.1 ? '良好' : '需改进'}
                          </Badge>
                          {agent.trend === 'up' && <TrendingUp className="h-4 w-4 text-red-600" />}
                          {agent.trend === 'down' && <TrendingDown className="h-4 w-4 text-green-600" />}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">总会话数</div>
                          <div className="font-medium">{agent.totalSessions}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">失败会话数</div>
                          <div className="font-medium text-red-600">{agent.errorSessions}</div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">错误率</span>
                          <span className="font-medium">{(agent.errorRate * 100).toFixed(3)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${
                              agent.errorRate < 0.05 ? 'bg-green-500' :
                              agent.errorRate < 0.1 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(agent.errorRate * 1000, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 满意度分析标签页 */}
        <TabsContent value="satisfaction" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 满意度分布 */}
            <Card>
              <CardHeader>
                <CardTitle>满意度评分</CardTitle>
                <CardDescription>各智能体的用户满意度对比</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.satisfactionAnalysis.map(agent => ({
                    name: agent.agentName,
                    satisfaction: agent.avgSatisfaction,
                    trend: agent.trend,
                    agentId: agent.agentId,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 5]} />
                    <Tooltip formatter={(value) => [value, '满意度评分']} />
                    <Bar dataKey="satisfaction" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 满意度构成 */}
            <Card>
              <CardHeader>
                <CardTitle>满意度构成</CardTitle>
                <CardDescription>正面、中性、负面评价的分布</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.satisfactionAnalysis.map((agent, index) => (
                    <div key={agent.agentId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{agent.agentName}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{agent.avgSatisfaction.toFixed(2)}</span>
                          {agent.trend === 'improving' && <TrendingUp className="h-4 w-4 text-green-600" />}
                          {agent.trend === 'declining' && <TrendingDown className="h-4 w-4 text-red-600" />}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-green-600">正面评价</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 bg-green-500 rounded-full"
                                style={{ width: `${(agent.satisfactionDistribution.positive / (agent.satisfactionDistribution.positive + agent.satisfactionDistribution.neutral + agent.satisfactionDistribution.negative)) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{agent.satisfactionDistribution.positive}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">中性评价</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 bg-gray-500 rounded-full"
                                style={{ width: `${(agent.satisfactionDistribution.neutral / (agent.satisfactionDistribution.positive + agent.satisfactionDistribution.neutral + agent.satisfactionDistribution.negative)) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{agent.satisfactionDistribution.neutral}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-red-600">负面评价</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 bg-red-500 rounded-full"
                                style={{ width: `${(agent.satisfactionDistribution.negative / (agent.satisfactionDistribution.positive + agent.satisfactionDistribution.neutral + agent.satisfactionDistribution.negative)) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{agent.satisfactionDistribution.negative}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 性能雷达图标签页 */}
        <TabsContent value="radar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>多维度性能雷达图</CardTitle>
              <CardDescription>各智能体在5个维度的综合表现</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={500}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  {radarData.map((agent, index) => (
                    <Radar
                      key={agent.subject}
                      name={agent.subject}
                      dataKey="subject"
                      data={[agent]}
                      stroke={index % 2 === 0 ? '#8884d8' : '#82ca9d'}
                      fill={index % 2 === 0 ? '#8884d8' : '#82ca9d'}
                      fillOpacity={0.3}
                    />
                  ))}
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 性能改进建议 */}
          <Card>
            <CardHeader>
              <CardTitle>性能改进建议</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.performanceRadar.map((agent, index) => {
                  const score = calculatePerformanceScore(agent);
                  const suggestions = [];

                  if (agent.speed < 60) suggestions.push('优化响应速度');
                  if (agent.reliability < 80) suggestions.push('提高系统稳定性');
                  if (agent.satisfaction < 3.5) suggestions.push('改善用户体验');
                  if (agent.efficiency < 70) suggestions.push('优化资源利用');
                  if (agent.popularity < 50) suggestions.push('增强功能推广');

                  return (
                    <div key={agent.agentId} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">{agent.agentName}</h4>
                      <Badge variant={score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive'} className="mb-3">
                        评分: {score}
                      </Badge>
                      {suggestions.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">改进重点:</div>
                          {suggestions.map((suggestion, i) => (
                            <div key={i} className="text-xs text-gray-600 flex items-center gap-1">
                              <div className="w-1 h-1 bg-gray-400 rounded-full" />
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}