'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BenchmarkResult } from '../../../types/benchmark';
import {
  getGradeColor,
  getGradeIcon,
  formatDuration,
  getCategoryName,
} from '@/lib/benchmark/utils';
import {
  Award,
  TrendingUp,
  Activity,
  AlertTriangle,
  FileText,
} from 'lucide-react';

interface BenchmarkResultsProps {
  results: BenchmarkResult[];
}

const iconMap = {
  Award,
  TrendingUp,
  Activity,
  AlertTriangle,
  FileText,
};

export function BenchmarkResults({ results }: BenchmarkResultsProps) {
  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>测试结果</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center text-muted-foreground py-8'>
            暂无测试结果，请先运行基准测试
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>测试结果</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>测试名称</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>等级</TableHead>
                <TableHead>分数</TableHead>
                <TableHead>耗时</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map(result => {
                const IconComponent =
                  iconMap[
                    getGradeIcon(result.metrics.grade) as keyof typeof iconMap
                  ] || FileText;

                return (
                  <TableRow key={result.id}>
                    <TableCell className='font-medium'>{result.name}</TableCell>
                    <TableCell>
                      {getCategoryName(result.metrics.category)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getGradeColor(result.metrics.grade)}>
                        <IconComponent className='h-3 w-3 mr-1' />
                        {result.metrics.grade}
                      </Badge>
                    </TableCell>
                    <TableCell>{result.metrics.score.toFixed(1)}</TableCell>
                    <TableCell>{formatDuration(result.duration)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={result.success ? 'default' : 'destructive'}
                      >
                        {result.success ? '通过' : '失败'}
                      </Badge>
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
