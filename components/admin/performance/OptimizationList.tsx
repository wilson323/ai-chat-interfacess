'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PerformanceOptimization } from '../../../types/optimization';
import {
  getImpactBadgeClass,
  getDifficultyBadgeClass,
  getImpactText,
  getDifficultyText,
} from '@/lib/optimization/utils';
import {
  Lightbulb,
  Star,
  Code,
  Database,
  Zap,
  Wifi,
} from 'lucide-react';

interface OptimizationListProps {
  optimizations: PerformanceOptimization[];
  onApplyOptimization: (id: string) => void;
  onViewDetails: (id: string) => void;
}

const categoryIcons = {
  frontend: Zap,
  backend: Database,
  network: Wifi,
  code: Code,
};

export function OptimizationList({
  optimizations,
  onApplyOptimization,
  onViewDetails,
}: OptimizationListProps) {
  if (optimizations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>优化建议</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center text-muted-foreground py-8'>
            暂无优化建议，请先运行性能分析
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>优化建议列表</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>建议</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>影响</TableHead>
                <TableHead>难度</TableHead>
                <TableHead>优先级</TableHead>
                <TableHead>预计改进</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {optimizations.map(optimization => {
                const CategoryIcon =
                  categoryIcons[optimization.category] || Code;

                return (
                  <TableRow key={optimization.id}>
                    <TableCell>
                      <div className='space-y-1'>
                        <div className='font-medium flex items-center gap-2'>
                          <Lightbulb className='h-4 w-4 text-yellow-500' />
                          {optimization.title}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {optimization.description}
                        </div>
                        <div className='flex flex-wrap gap-1'>
                          {optimization.tags.map(tag => (
                            <Badge
                              key={tag}
                              variant='secondary'
                              className='text-xs'
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <CategoryIcon className='h-4 w-4' />
                        <span className='capitalize'>
                          {optimization.category}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getImpactBadgeClass(optimization.impact)}
                      >
                        {getImpactText(optimization.impact)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getDifficultyBadgeClass(
                          optimization.difficulty
                        )}
                      >
                        {getDifficultyText(optimization.difficulty)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1'>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < optimization.priority
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {optimization.estimatedImprovement}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className='flex gap-2'>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => onViewDetails(optimization.id)}
                        >
                          详情
                        </Button>
                        <Button
                          size='sm'
                          onClick={() => onApplyOptimization(optimization.id)}
                        >
                          应用
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
