'use client';
import { logger } from '@/lib/utils/logger';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Lightbulb,
  TrendingUp,
  Zap,
  Wifi,
  Database,
  Code,
  Clock,
  Star,
  RefreshCw,
  BarChart3,
  Target,
} from 'lucide-react';
import {
  enhancedMonitor,
  type PerformanceOptimization,
  type PerformanceSummary,
} from '@/lib/performance/enhanced-monitor';
import type {
  OptimizationAnalysis,
  CategoryBreakdown,
} from '@/types/optimization';


export function OptimizationEngine() {
  const [optimizations, setOptimizations] = useState<PerformanceOptimization[]>(
    []
  );
  const [analysis, setAnalysis] = useState<OptimizationAnalysis | null>(null);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [currentSummary, setCurrentSummary] =
    useState<PerformanceSummary | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImpact, setSelectedImpact] = useState<
    'all' | 'high' | 'medium' | 'low'
  >('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    'all' | 'easy' | 'medium' | 'hard'
  >('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const performAnalysis = useCallback((opts: PerformanceOptimization[]) => {
    // 基础统计
    const totalOptimizations = opts.length;
    const highImpact = opts.filter(opt => opt.impact === 'high').length;
    const mediumImpact = opts.filter(opt => opt.impact === 'medium').length;
    const lowImpact = opts.filter(opt => opt.impact === 'low').length;

    const easyImplementation = opts.filter(
      opt => opt.difficulty === 'easy'
    ).length;
    const mediumImplementation = opts.filter(
      opt => opt.difficulty === 'medium'
    ).length;
    const hardImplementation = opts.filter(
      opt => opt.difficulty === 'hard'
    ).length;

    // 估算总体改进效果
    const estimatedImprovement = calculateEstimatedImprovement(opts);

    // 优先级优化建议（高影响+易实现）
    const priorityOptimizations = opts.filter(
      opt => opt.impact === 'high' && opt.difficulty === 'easy'
    );

    // 分类统计
    const categoryStats = calculateCategoryBreakdown(opts);

    setAnalysis({
      totalOptimizations,
      highImpact,
      mediumImpact,
      lowImpact,
      easyImplementation,
      mediumImplementation,
      hardImplementation,
      estimatedImprovement,
      priorityOptimizations,
    });

    setCategories(categoryStats);
  }, []);

  const loadOptimizations = useCallback(async () => {
    try {
      const allOptimizations = enhancedMonitor.getOptimizations();
      setOptimizations(allOptimizations);
      performAnalysis(allOptimizations);
    } catch (error) {
      logger.error('Failed to load optimizations:', error);
    }
  }, [performAnalysis]);

  const loadCurrentSummary = useCallback(async () => {
    try {
      setCurrentSummary(enhancedMonitor.getEnhancedSummary());
    } catch (error) {
      logger.error('Failed to load current summary:', error);
    }
  }, []);

  useEffect(() => {
    loadOptimizations();
    loadCurrentSummary();
  }, [loadOptimizations, loadCurrentSummary]);

  const calculateEstimatedImprovement = (
    opts: PerformanceOptimization[]
  ): string => {
    if (opts.length === 0) return '0%';

    const improvements = opts.map(opt => {
      const match = opt.estimatedImprovement.match(/(\d+)-(\d+)/);
      if (match) {
        const min = parseInt(match[1]);
        const max = parseInt(match[2]);
        return (min + max) / 2;
      }
      return 0;
    });

    const averageImprovement =
      improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;
    return `${Math.round(averageImprovement)}%`;
  };

  const calculateCategoryBreakdown = (
    opts: PerformanceOptimization[]
  ): CategoryBreakdown[] => {
    const categoryIcons = {
      frontend: Zap,
      backend: Database,
      network: Wifi,
      code: Code,
    };

    const categoryColors = {
      frontend: '#8884d8',
      backend: '#82ca9d',
      network: '#ffc658',
      code: '#ff7300',
    };

    const categoryNames = {
      frontend: '前端优化',
      backend: '后端优化',
      network: '网络优化',
      code: '代码优化',
    };

    return Object.entries(categoryIcons).map(([category, icon]) => {
      const categoryOpts = opts.filter(opt => opt.category === category);
      const totalImpact = categoryOpts.reduce((sum, opt) => {
        const impactWeight =
          opt.impact === 'high' ? 3 : opt.impact === 'medium' ? 2 : 1;
        return sum + impactWeight;
      }, 0);

      return {
        category: categoryNames[category as keyof typeof categoryNames],
        count: categoryOpts.length,
        totalImpact,
        optimizations: categoryOpts,
        icon,
        color: categoryColors[category as keyof typeof categoryColors],
      };
    });
  };

  const filteredOptimizations = optimizations.filter(opt => {
    if (selectedCategory !== 'all' && opt.category !== selectedCategory)
      return false;
    if (selectedImpact !== 'all' && opt.impact !== selectedImpact) return false;
    if (selectedDifficulty !== 'all' && opt.difficulty !== selectedDifficulty)
      return false;
    return true;
  });

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge className='bg-red-100 text-red-800'>高影响</Badge>;
      case 'medium':
        return (
          <Badge className='bg-yellow-100 text-yellow-800'>中等影响</Badge>
        );
      case 'low':
        return <Badge className='bg-green-100 text-green-800'>低影响</Badge>;
      default:
        return <Badge>未知</Badge>;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Badge className='bg-green-100 text-green-800'>简单</Badge>;
      case 'medium':
        return <Badge className='bg-yellow-100 text-yellow-800'>中等</Badge>;
      case 'hard':
        return <Badge className='bg-red-100 text-red-800'>困难</Badge>;
      default:
        return <Badge>未知</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      frontend: Zap,
      backend: Database,
      network: Wifi,
      code: Code,
    };
    const Icon = icons[category as keyof typeof icons];
    return Icon ? <Icon className='h-4 w-4' /> : null;
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // 触发性能分析
      void enhancedMonitor.getEnhancedMetrics();
      void enhancedMonitor.getEnhancedSummary();

      // 重新加载优化建议
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟分析时间
      loadOptimizations();
      loadCurrentSummary();
    } catch (error) {
      logger.error('Failed to run analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* 页面头部 */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>智能优化建议</h1>
          <p className='text-gray-600 mt-2'>基于性能数据生成智能优化建议</p>
        </div>
        <Button onClick={runAnalysis} disabled={isAnalyzing}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`}
          />
          {isAnalyzing ? '分析中...' : '重新分析'}
        </Button>
      </div>

      {/* 分析概览 */}
      {analysis && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    优化建议总数
                  </p>
                  <p className='text-2xl font-bold'>
                    {analysis.totalOptimizations}
                  </p>
                </div>
                <Lightbulb className='h-8 w-8 text-yellow-600' />
              </div>
              <div className='mt-2'>
                <p className='text-sm text-gray-500'>
                  预计改进: {analysis.estimatedImprovement}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    高影响建议
                  </p>
                  <p className='text-2xl font-bold text-red-600'>
                    {analysis.highImpact}
                  </p>
                </div>
                <TrendingUp className='h-8 w-8 text-red-600' />
              </div>
              <div className='mt-2'>
                <Progress
                  value={
                    (analysis.highImpact / analysis.totalOptimizations) * 100
                  }
                  className='w-full'
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>快速实现</p>
                  <p className='text-2xl font-bold text-green-600'>
                    {analysis.easyImplementation}
                  </p>
                </div>
                <Clock className='h-8 w-8 text-green-600' />
              </div>
              <div className='mt-2'>
                <Progress
                  value={
                    (analysis.easyImplementation /
                      analysis.totalOptimizations) *
                    100
                  }
                  className='w-full'
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>优先建议</p>
                  <p className='text-2xl font-bold text-purple-600'>
                    {analysis.priorityOptimizations.length}
                  </p>
                </div>
                <Star className='h-8 w-8 text-purple-600' />
              </div>
              <div className='mt-2'>
                <p className='text-sm text-gray-500'>高影响 + 易实现</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 分类分布 */}
      {categories.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {categories.map(category => (
            <Card key={category.category}>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-2'>
                    <category.icon
                      className='h-5 w-5'
                      style={{ color: category.color }}
                    />
                    <h3 className='font-medium'>{category.category}</h3>
                  </div>
                  <Badge variant='outline'>{category.count}</Badge>
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>影响指数</span>
                    <span className='font-medium'>{category.totalImpact}</span>
                  </div>
                  <Progress
                    value={
                      (category.totalImpact /
                        Math.max(...categories.map(c => c.totalImpact))) *
                      100
                    }
                    className='w-full'
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 当前性能状态 */}
      {currentSummary && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5' />
              当前性能状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='space-y-3'>
                <h4 className='font-medium text-gray-700'>页面性能</h4>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>加载时间</span>
                    <span className='font-medium'>
                      {(currentSummary.pageLoadTime / 1000).toFixed(2)}s
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>首次内容绘制</span>
                    <span className='font-medium'>
                      {(currentSummary.firstContentfulPaint / 1000).toFixed(2)}s
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>最大内容绘制</span>
                    <span className='font-medium'>
                      {(currentSummary.largestContentfulPaint / 1000).toFixed(
                        2
                      )}
                      s
                    </span>
                  </div>
                </div>
              </div>

              <div className='space-y-3'>
                <h4 className='font-medium text-gray-700'>资源使用</h4>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>内存使用</span>
                    <span className='font-medium'>
                      {(currentSummary.memoryUsage / 1024 / 1024).toFixed(1)}MB
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>API响应时间</span>
                    <span className='font-medium'>
                      {currentSummary.averageApiResponseTime.toFixed(0)}ms
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>网络请求</span>
                    <span className='font-medium'>
                      {currentSummary.networkRequests}
                    </span>
                  </div>
                </div>
              </div>

              <div className='space-y-3'>
                <h4 className='font-medium text-gray-700'>用户体验</h4>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>首次输入延迟</span>
                    <span className='font-medium'>
                      {currentSummary.firstInputDelay.toFixed(0)}ms
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>布局偏移</span>
                    <span className='font-medium'>
                      {currentSummary.cumulativeLayoutShift.toFixed(3)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>性能趋势</span>
                    <Badge
                      className={
                        currentSummary.trend === 'improving'
                          ? 'bg-green-100 text-green-800'
                          : currentSummary.trend === 'degrading'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {currentSummary.trend === 'improving' && '改善'}
                      {currentSummary.trend === 'degrading' && '下降'}
                      {currentSummary.trend === 'stable' && '稳定'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 过滤器 */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex gap-2'>
              <Select
                value={selectedCategory}
                onValueChange={(value: string) => setSelectedCategory(value)}
              >
                <SelectTrigger className='w-40'>
                  <SelectValue placeholder='选择分类' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>全部分类</SelectItem>
                  <SelectItem value='frontend'>前端优化</SelectItem>
                  <SelectItem value='backend'>后端优化</SelectItem>
                  <SelectItem value='network'>网络优化</SelectItem>
                  <SelectItem value='code'>代码优化</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedImpact}
                onValueChange={(value: 'all' | 'high' | 'medium' | 'low') => setSelectedImpact(value)}
              >
                <SelectTrigger className='w-32'>
                  <SelectValue placeholder='影响程度' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>全部影响</SelectItem>
                  <SelectItem value='high'>高影响</SelectItem>
                  <SelectItem value='medium'>中等影响</SelectItem>
                  <SelectItem value='low'>低影响</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedDifficulty}
                onValueChange={(value: 'all' | 'easy' | 'medium' | 'hard') => setSelectedDifficulty(value)}
              >
                <SelectTrigger className='w-32'>
                  <SelectValue placeholder='实现难度' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>全部难度</SelectItem>
                  <SelectItem value='easy'>简单</SelectItem>
                  <SelectItem value='medium'>中等</SelectItem>
                  <SelectItem value='hard'>困难</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 优化建议列表 */}
      <Tabs defaultValue='list' className='w-full'>
        <TabsList>
          <TabsTrigger value='list'>建议列表</TabsTrigger>
          <TabsTrigger value='priority'>优先建议</TabsTrigger>
          <TabsTrigger value='steps'>实施步骤</TabsTrigger>
        </TabsList>

        <TabsContent value='list' className='space-y-4'>
          {filteredOptimizations.length === 0 ? (
            <Card>
              <CardContent className='text-center py-8 text-gray-500'>
                <Lightbulb className='h-12 w-12 mx-auto mb-4 text-gray-300' />
                <p>暂无优化建议</p>
                <p className='text-sm'>运行分析以获取性能优化建议</p>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-4'>
              {filteredOptimizations.map(optimization => (
                <Card key={optimization.id}>
                  <CardContent className='p-6'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-2'>
                          {getCategoryIcon(optimization.category)}
                          <h3 className='text-lg font-medium'>
                            {optimization.title}
                          </h3>
                          {getImpactBadge(optimization.impact)}
                          {getDifficultyBadge(optimization.difficulty)}
                        </div>
                        <p className='text-gray-600 mb-3'>
                          {optimization.description}
                        </p>
                        <div className='flex items-center gap-4 text-sm text-gray-500'>
                          <span className='flex items-center gap-1'>
                            <Target className='h-4 w-4' />
                            预计改进: {optimization.estimatedImprovement}
                          </span>
                          <span className='flex items-center gap-1'>
                            <Clock className='h-4 w-4' />
                            {optimization.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 实施步骤 */}
                    <div className='border-t pt-4'>
                      <h4 className='font-medium mb-2'>实施步骤:</h4>
                      <ol className='list-decimal list-inside space-y-1 text-sm text-gray-600'>
                        {optimization.implementation.split('\n').map((step: string, index: number) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='priority' className='space-y-4'>
          {analysis?.priorityOptimizations &&
          analysis.priorityOptimizations.length > 0 ? (
            <div className='space-y-4'>
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Star className='h-5 w-5 text-blue-600' />
                  <h3 className='font-medium text-blue-900'>优先优化建议</h3>
                </div>
                <p className='text-blue-700 text-sm'>
                  这些优化建议具有高影响且易于实现，建议优先实施。
                </p>
              </div>

              {analysis.priorityOptimizations.map((optimization: any) => (
                <Card key={optimization.id} className='border-blue-200'>
                  <CardContent className='p-6'>
                    <div className='flex items-center gap-2 mb-2'>
                      {getCategoryIcon(optimization.category)}
                      <h3 className='text-lg font-medium'>
                        {optimization.title}
                      </h3>
                      <Badge className='bg-blue-100 text-blue-800'>
                        优先建议
                      </Badge>
                    </div>
                    <p className='text-gray-600 mb-3'>
                      {optimization.description}
                    </p>
                    <div className='flex items-center gap-4 text-sm text-gray-500'>
                      <span>预计改进: {optimization.estimatedImprovement}</span>
                      <span>分类: {optimization.category}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className='text-center py-8 text-gray-500'>
                <Star className='h-12 w-12 mx-auto mb-4 text-gray-300' />
                <p>暂无优先优化建议</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='steps' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>优化实施指南</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='prose prose-sm max-w-none'>
                <h4>实施优化建议的最佳实践</h4>
                <ol>
                  <li>
                    <strong>优先实施高影响、易实现的建议</strong>
                    <p>从优先建议开始，这些优化能快速带来显著的性能提升。</p>
                  </li>
                  <li>
                    <strong>建立性能基线</strong>
                    <p>在实施优化前，记录当前性能指标作为对比基准。</p>
                  </li>
                  <li>
                    <strong>逐步实施</strong>
                    <p>一次只实施一个优化建议，以便准确评估每个优化的影响。</p>
                  </li>
                  <li>
                    <strong>监控结果</strong>
                    <p>实施后监控性能指标变化，验证优化效果。</p>
                  </li>
                  <li>
                    <strong>定期重新分析</strong>
                    <p>
                      随着应用变化，定期重新运行性能分析，发现新的优化机会。
                    </p>
                  </li>
                </ol>

                <h4>优化分类说明</h4>
                <ul>
                  <li>
                    <strong>前端优化</strong>: 界面渲染、资源加载、用户体验相关
                  </li>
                  <li>
                    <strong>后端优化</strong>: 数据库、API、服务器性能相关
                  </li>
                  <li>
                    <strong>网络优化</strong>: 请求优化、缓存策略、CDN使用
                  </li>
                  <li>
                    <strong>代码优化</strong>: 代码质量、算法优化、内存管理
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
