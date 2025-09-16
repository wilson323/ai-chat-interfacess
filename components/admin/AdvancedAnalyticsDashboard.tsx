'use client';
import { logger } from '@/lib/utils/logger';
import { ErrorFactory } from '@/lib/utils/error-utils';
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  Users,
  TrendingUp,
  Brain,
  MessageSquare,
  Download,
  RefreshCw,
  AlertCircle,
  Target,
} from 'lucide-react';

// Import the analysis components
import { UserBehaviorAnalytics } from './analytics/UserBehaviorAnalytics';
import { AgentPerformanceAnalytics } from './analytics/AgentPerformanceAnalytics';
import { ConversationBusinessAnalytics } from './analytics/ConversationBusinessAnalytics';
import { PredictionDashboard } from './analytics/PredictionDashboard';

// Import analytics types
import {
  AnalyticsSummary,
} from '@/types/api';

// Date range type
interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Local analytics data types matching component expectations
interface UserBehaviorData {
  activeUsers: number;
  avgSessionDuration: number;
  peakHours: string[];
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

interface AgentPerformanceData {
  avgResponseTime: number;
  avgErrorRate: number;
  avgSatisfaction: number;
  agentUsage: Array<{
    agentId: number;
    agentName: string;
    usageCount: number;
    successRate: number;
    avgResponseTime: number;
  }>;
  agentComparison: Array<{
    agentId: number;
    agentName: string;
    accuracy: number;
    efficiency: number;
    userSatisfaction: number;
  }>;
  performanceTrends: Array<{
    date: string;
    successRate: number;
    responseTime: number;
  }>;
  // Properties expected by AgentPerformanceAnalytics component
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

interface PredictionData {
  usageTrend: {
    historical: Array<{ date: string; actual: number; predicted: number }>;
    forecast: Array<{ date: string; predicted: number; confidence: number }>;
    accuracy: number;
    growthRate: number;
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


export function AdvancedAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
  });

  // Analytics data states
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [userBehavior, setUserBehavior] = useState<UserBehaviorData | null>(null);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformanceData | null>(null);
  const [conversation, setConversation] = useState<ConversationAnalyticsData | null>(null);
  const [businessValue, setBusinessValue] = useState<BusinessValueData | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch summary
      const summaryResponse = await fetch('/api/admin/analytics/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'summary',
          ...dateRange,
        }),
      });

      if (!summaryResponse.ok) throw ErrorFactory.externalApi('API', '获取数据失败');
      const summaryData = await summaryResponse.json();
      setSummary(summaryData);

      // Fetch individual analytics data in parallel
      const [
        userBehaviorRes,
        agentPerformanceRes,
        conversationRes,
        businessValueRes,
        predictionRes,
      ] = await Promise.all([
        fetch('/api/admin/analytics/advanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'user-behavior',
            ...dateRange,
          }),
        }),
        fetch('/api/admin/analytics/advanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'agent-performance',
            ...dateRange,
          }),
        }),
        fetch('/api/admin/analytics/advanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'conversation',
            ...dateRange,
          }),
        }),
        fetch('/api/admin/analytics/advanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'business-value',
            ...dateRange,
          }),
        }),
        fetch('/api/admin/analytics/advanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'prediction',
            ...dateRange,
          }),
        }),
      ]);

      if (userBehaviorRes.ok) {
        const data = await userBehaviorRes.json();
        setUserBehavior(data);
      }

      if (agentPerformanceRes.ok) {
        const data = await agentPerformanceRes.json();
        setAgentPerformance(data);
      }

      if (conversationRes.ok) {
        const data = await conversationRes.json();
        setConversation(data);
      }

      if (businessValueRes.ok) {
        const data = await businessValueRes.json();
        setBusinessValue(data);
      }

      if (predictionRes.ok) {
        const data = await predictionRes.json();
        setPrediction(data);
      }

      setLastUpdated(new Date());
    } catch (err) {
      logger.error('获取分析数据失败:', err);
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Export analytics data
  const exportAnalytics = async (format: 'json' | 'csv' | 'excel') => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
        format,
        type: 'all',
        includeCharts: 'true',
      });

      const response = await fetch(`/api/admin/analytics/export?${params}`);

      if (!response.ok) throw ErrorFactory.externalApi('Export API', '导出失败');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'html' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      logger.error('导出失败:', err);
      setError(err instanceof Error ? err.message : '导出失败');
    }
  };

  // Initialize data fetch
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]); // 添加缺失的依赖

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchAnalyticsData();
      }, 300000); // 5 minutes

      setRefreshInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh, fetchAnalyticsData, refreshInterval]);

  // Handle date range change
  const handleDateRangeChange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    setDateRange({ startDate, endDate });
    fetchAnalyticsData();
  };

  // Quick stats component
  const QuickStats = () => {
    if (!summary) return null;

    const stats = [
      {
        title: '总会话数',
        value: summary.totalSessions?.toLocaleString() || '0',
        icon: MessageSquare,
        color: 'text-blue-600',
        change: '+12.5%',
      },
      {
        title: '活跃用户',
        value: summary.activeUsers?.toLocaleString() || '0',
        icon: Users,
        color: 'text-green-600',
        change: '+8.2%',
      },
      {
        title: '预测增长率',
        value: `${(summary.predictedGrowth || 0).toFixed(1)}%`,
        icon: TrendingUp,
        color: 'text-green-600',
        change: '+8.2%',
      },
      {
        title: '投资回报率',
        value: `${(summary.roi || 0).toFixed(1)}%`,
        icon: TrendingUp,
        color: 'text-purple-600',
        change: '+15.3%',
      },
    ];

    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    {stat.title}
                  </p>
                  <p className='text-2xl font-bold'>{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className='mt-2'>
                <Badge
                  variant={
                    stat.change.startsWith('+') ? 'default' : 'destructive'
                  }
                >
                  {stat.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Loading state
  if (loading && !summary) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>高级数据分析</h1>
            <p className='text-gray-600'>正在加载分析数据...</p>
          </div>
          <Skeleton className='h-10 w-32' />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className='p-6'>
                <Skeleton className='h-8 w-8 mb-2' />
                <Skeleton className='h-6 w-20' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>错误</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={fetchAnalyticsData} className='mt-2'>
          重试
        </Button>
      </Alert>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>高级数据分析</h1>
          <p className='text-gray-600'>
            最后更新: {lastUpdated.toLocaleString('zh-CN')}
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          {/* Date range buttons */}
          <Button
            variant={
              dateRange.startDate.getTime() ===
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime()
                ? 'default'
                : 'outline'
            }
            size='sm'
            onClick={() => handleDateRangeChange(7)}
          >
            最近7天
          </Button>
          <Button
            variant={
              dateRange.startDate.getTime() ===
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime()
                ? 'default'
                : 'outline'
            }
            size='sm'
            onClick={() => handleDateRangeChange(30)}
          >
            最近30天
          </Button>
          <Button
            variant={
              dateRange.startDate.getTime() ===
              new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).getTime()
                ? 'default'
                : 'outline'
            }
            size='sm'
            onClick={() => handleDateRangeChange(90)}
          >
            最近90天
          </Button>

          {/* Auto refresh toggle */}
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size='sm'
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`}
            />
            自动刷新
          </Button>

          {/* Export buttons */}
          <Button
            variant='outline'
            size='sm'
            onClick={() => exportAnalytics('json')}
          >
            <Download className='h-4 w-4 mr-2' />
            导出JSON
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => exportAnalytics('csv')}
          >
            <Download className='h-4 w-4 mr-2' />
            导出CSV
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => exportAnalytics('excel')}
          >
            <Download className='h-4 w-4 mr-2' />
            导出报告
          </Button>

          {/* Refresh button */}
          <Button onClick={fetchAnalyticsData} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            刷新数据
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats />

      {/* Main Analytics Tabs */}
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-6'>
          <TabsTrigger value='overview' className='flex items-center space-x-2'>
            <BarChart3 className='h-4 w-4' />
            <span>概览</span>
          </TabsTrigger>
          <TabsTrigger
            value='user-behavior'
            className='flex items-center space-x-2'
          >
            <Users className='h-4 w-4' />
            <span>用户行为</span>
          </TabsTrigger>
          <TabsTrigger
            value='agent-performance'
            className='flex items-center space-x-2'
          >
            <Target className='h-4 w-4' />
            <span>智能体性能</span>
          </TabsTrigger>
          <TabsTrigger
            value='conversation'
            className='flex items-center space-x-2'
          >
            <MessageSquare className='h-4 w-4' />
            <span>对话分析</span>
          </TabsTrigger>
          <TabsTrigger
            value='business-value'
            className='flex items-center space-x-2'
          >
            <TrendingUp className='h-4 w-4' />
            <span>业务价值</span>
          </TabsTrigger>
          <TabsTrigger
            value='prediction'
            className='flex items-center space-x-2'
          >
            <Brain className='h-4 w-4' />
            <span>预测分析</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* User Behavior Summary */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Users className='h-5 w-5' />
                  <span>用户行为概览</span>
                </CardTitle>
                <CardDescription>用户活跃度和参与度分析</CardDescription>
              </CardHeader>
              <CardContent>
                {userBehavior ? (
                  <div className='space-y-4'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>活跃用户数</span>
                      <span className='text-lg font-bold'>
                        {userBehavior.activeUsers}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>平均会话时长</span>
                      <span className='text-lg font-bold'>
                        {Math.round(userBehavior.avgSessionDuration / 1000)}秒
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>峰值活跃时段</span>
                      <Badge>14:00-16:00</Badge>
                    </div>
                  </div>
                ) : (
                  <Skeleton className='h-32' />
                )}
              </CardContent>
            </Card>

            {/* Agent Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Target className='h-5 w-5' />
                  <span>智能体性能概览</span>
                </CardTitle>
                <CardDescription>响应时间和性能指标</CardDescription>
              </CardHeader>
              <CardContent>
                {agentPerformance ? (
                  <div className='space-y-4'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>平均响应时间</span>
                      <span className='text-lg font-bold'>
                        {agentPerformance.avgResponseTime}ms
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>平均错误率</span>
                      <Badge
                        variant={
                          agentPerformance.avgErrorRate < 0.05
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {(agentPerformance.avgErrorRate * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>平均满意度</span>
                      <Badge variant='secondary'>
                        {agentPerformance.avgSatisfaction.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <Skeleton className='h-32' />
                )}
              </CardContent>
            </Card>

            {/* Business Value Summary */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <TrendingUp className='h-5 w-5' />
                  <span>业务价值概览</span>
                </CardTitle>
                <CardDescription>成本效益和价值分析</CardDescription>
              </CardHeader>
              <CardContent>
                {businessValue ? (
                  <div className='space-y-4'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>总Token使用量</span>
                      <span className='text-lg font-bold'>
                        {businessValue.costAnalysis.totalTokens?.toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>总成本</span>
                      <span className='text-lg font-bold'>
                        ${businessValue.costAnalysis.estimatedCost?.toFixed(2)}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>投资回报率</span>
                      <Badge
                        variant={
                          businessValue.roiAnalysis.roi > 0
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {businessValue.roiAnalysis.roi.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <Skeleton className='h-32' />
                )}
              </CardContent>
            </Card>

            {/* Prediction Summary */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Brain className='h-5 w-5' />
                  <span>预测分析概览</span>
                </CardTitle>
                <CardDescription>趋势预测和建议</CardDescription>
              </CardHeader>
              <CardContent>
                {prediction ? (
                  <div className='space-y-4'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>预测增长率</span>
                      <span className='text-lg font-bold'>
                        {prediction.userGrowth.growthRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>预测准确度</span>
                      <Badge
                        variant={
                          prediction.usageTrend.accuracy > 0.8
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {(prediction.usageTrend.accuracy * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>异常事件</span>
                      <Badge
                        variant={
                          prediction.anomalyDetection.length > 0
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {prediction.anomalyDetection.length} 个
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <Skeleton className='h-32' />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Behavior Tab */}
        <TabsContent value='user-behavior'>
          {userBehavior ? (
            <UserBehaviorAnalytics data={userBehavior} />
          ) : (
            <Skeleton className='h-96' />
          )}
        </TabsContent>

        {/* Agent Performance Tab */}
        <TabsContent value='agent-performance'>
          {agentPerformance ? (
            <AgentPerformanceAnalytics
              data={agentPerformance}
            />
          ) : (
            <Skeleton className='h-96' />
          )}
        </TabsContent>

        {/* Conversation Tab */}
        <TabsContent value='conversation'>
          {conversation && businessValue ? (
            <ConversationBusinessAnalytics
              conversationData={conversation}
              businessData={businessValue}
            />
          ) : (
            <Skeleton className='h-96' />
          )}
        </TabsContent>

        {/* Business Value Tab */}
        <TabsContent value='business-value'>
          {businessValue ? (
            <Card>
              <CardHeader>
                <CardTitle>详细业务价值分析</CardTitle>
                <CardDescription>成本分析、ROI计算和价值评估</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Business value details can be expanded here */}
                <div className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <h4 className='font-semibold mb-2'>成本分析</h4>
                      <p className='text-sm text-gray-600'>
                        总Token使用量:{' '}
                        {businessValue.costAnalysis.totalTokens?.toLocaleString()}
                      </p>
                      <p className='text-sm text-gray-600'>
                        估计成本: $
                        {businessValue.costAnalysis.estimatedCost?.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <h4 className='font-semibold mb-2'>价值指标</h4>
                      <p className='text-sm text-gray-600'>
                        投资回报率: {businessValue.roiAnalysis.roi.toFixed(1)}%
                      </p>
                      <p className='text-sm text-gray-600'>
                        效率提升:{' '}
                        {businessValue.efficiencyMetrics.timeSaved.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Skeleton className='h-96' />
          )}
        </TabsContent>

        {/* Prediction Tab */}
        <TabsContent value='prediction'>
          {prediction ? (
            <PredictionDashboard data={prediction} />
          ) : (
            <Skeleton className='h-96' />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
