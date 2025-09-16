'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, RefreshCw } from 'lucide-react';
import { OptimizationFilters } from '../../../types/optimization';

interface OptimizationFiltersProps {
  filters: OptimizationFilters;
  onFilterChange: (filters: Partial<OptimizationFilters>) => void;
  onRefresh: () => void;
  totalCount: number;
  filteredCount: number;
}

export function OptimizationFiltersComponent({
  filters,
  onFilterChange,
  onRefresh,
  totalCount,
  filteredCount,
}: OptimizationFiltersProps) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='flex items-center gap-2'>
          <Filter className='h-4 w-4' />
          优化建议筛选
        </CardTitle>
        <Button
          variant='outline'
          size='sm'
          onClick={onRefresh}
          className='flex items-center gap-2'
        >
          <RefreshCw className='h-4 w-4' />
          刷新
        </Button>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>分类</label>
            <Select
              value={filters.category}
              onValueChange={value => onFilterChange({ category: value })}
            >
              <SelectTrigger>
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
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>影响程度</label>
            <Select
              value={filters.impact}
              onValueChange={value => onFilterChange({ impact: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder='选择影响程度' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>全部影响</SelectItem>
                <SelectItem value='high'>高影响</SelectItem>
                <SelectItem value='medium'>中等影响</SelectItem>
                <SelectItem value='low'>低影响</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>实现难度</label>
            <Select
              value={filters.difficulty}
              onValueChange={value =>
                onFilterChange({ difficulty: value as any })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='选择实现难度' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>全部难度</SelectItem>
                <SelectItem value='easy'>容易</SelectItem>
                <SelectItem value='medium'>中等</SelectItem>
                <SelectItem value='hard'>困难</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='flex items-center justify-between pt-2 border-t'>
          <div className='flex items-center gap-2'>
            <Badge variant='outline'>总计: {totalCount}</Badge>
            <Badge variant='outline'>筛选: {filteredCount}</Badge>
          </div>
          <div className='text-sm text-muted-foreground'>
            显示 {filteredCount} / {totalCount} 条建议
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
