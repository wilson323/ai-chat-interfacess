'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { OptimizationAnalysis, CategoryBreakdown } from '../../../types/optimization';
import type { PerformanceSummary } from '../../../types/optimization';
import {
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Star,
} from 'lucide-react';

interface OptimizationOverviewProps {
  analysis: OptimizationAnalysis | null;
  categories: CategoryBreakdown[];
  currentSummary: PerformanceSummary;
}

export function OptimizationOverview({
  analysis,
  categories,
  currentSummary,
}: OptimizationOverviewProps) {
  if (!analysis) {
    return (
      <div className='text-center text-muted-foreground py-8'>
        正在分析优化建议...
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* 总体统计 */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>总优化建议</CardTitle>
            <Lightbulb className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {analysis.totalOptimizations}
            </div>
            <p className='text-xs text-muted-foreground'>
              预计改进: {analysis.estimatedImprovement}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>高影响建议</CardTitle>
            <AlertTriangle className='h-4 w-4 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {analysis.highImpact}
            </div>
            <p className='text-xs text-muted-foreground'>优先级最高</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>易实现建议</CardTitle>
            <CheckCircle className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {analysis.easyImplementation}
            </div>
            <p className='text-xs text-muted-foreground'>快速见效</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>优先级建议</CardTitle>
            <Star className='h-4 w-4 text-yellow-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-yellow-600'>
              {analysis.priorityOptimizations.length}
            </div>
            <p className='text-xs text-muted-foreground'>高影响+易实现</p>
          </CardContent>
        </Card>
      </div>

      {/* 影响分布 */}
      <Card>
        <CardHeader>
          <CardTitle>影响分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>高影响</span>
              <div className='flex items-center space-x-2'>
                <Progress
                  value={
                    (analysis.highImpact / analysis.totalOptimizations) * 100
                  }
                  className='w-32'
                />
                <span className='text-sm font-medium'>
                  {analysis.highImpact}
                </span>
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>中等影响</span>
              <div className='flex items-center space-x-2'>
                <Progress
                  value={
                    (analysis.mediumImpact / analysis.totalOptimizations) * 100
                  }
                  className='w-32'
                />
                <span className='text-sm font-medium'>
                  {analysis.mediumImpact}
                </span>
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>低影响</span>
              <div className='flex items-center space-x-2'>
                <Progress
                  value={
                    (analysis.lowImpact / analysis.totalOptimizations) * 100
                  }
                  className='w-32'
                />
                <span className='text-sm font-medium'>
                  {analysis.lowImpact}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 分类统计 */}
      <Card>
        <CardHeader>
          <CardTitle>分类统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {categories.map(category => (
              <div
                key={category.category}
                className='flex items-center space-x-3'
              >
                <div
                  className='w-3 h-3 rounded-full'
                  style={{ backgroundColor: category.color }}
                />
                <div className='flex-1'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>
                      {category.category}
                    </span>
                    <Badge variant='outline'>{category.count}</Badge>
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    影响权重: {category.totalImpact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 当前性能摘要 */}
      {currentSummary && (
        <Card>
          <CardHeader>
            <CardTitle>当前性能摘要</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>总体评分</span>
                <Badge className='bg-blue-100 text-blue-800'>
                  {currentSummary.overallScore}/100
                </Badge>
              </div>
              <div className='text-xs text-muted-foreground'>
                最后更新:{' '}
                {new Date(currentSummary.lastUpdated).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
