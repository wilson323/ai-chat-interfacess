'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Download } from 'lucide-react';
import { BenchmarkSuite, BenchmarkResult } from '../../../types/benchmark';

interface BenchmarkControlsProps {
  suites: BenchmarkSuite[];
  results: BenchmarkResult[];
  isRunning: boolean;
  currentSuite: string;
  onRunAll: () => void;
  onRunSuite: (suiteId: string) => void;
  onClear: () => void;
  onExport: () => void;
}

export function BenchmarkControls({
  suites,
  results,
  isRunning,
  currentSuite,
  onRunAll,
  onRunSuite,
  onClear,
  onExport,
}: BenchmarkControlsProps) {
  const progress =
    results.length > 0
      ? (results.filter(r => r.success).length / results.length) * 100
      : 0;

  return (
    <div className='space-y-4'>
      {/* 控制按钮 */}
      <div className='flex flex-wrap gap-2'>
        <Button
          onClick={onRunAll}
          disabled={isRunning}
          className='flex items-center gap-2'
        >
          {isRunning ? (
            <Pause className='h-4 w-4' />
          ) : (
            <Play className='h-4 w-4' />
          )}
          {isRunning ? '运行中...' : '运行所有测试'}
        </Button>

        {suites.map(suite => (
          <Button
            key={suite.id}
            variant='outline'
            size='sm'
            onClick={() => onRunSuite(suite.id)}
            disabled={isRunning}
            className='flex items-center gap-2'
          >
            {isRunning && currentSuite === suite.id ? (
              <Pause className='h-4 w-4' />
            ) : (
              <Play className='h-4 w-4' />
            )}
            {suite.name}
          </Button>
        ))}

        <Button
          variant='outline'
          onClick={onClear}
          disabled={isRunning || results.length === 0}
          className='flex items-center gap-2'
        >
          <RotateCcw className='h-4 w-4' />
          清除结果
        </Button>

        <Button
          variant='outline'
          onClick={onExport}
          disabled={results.length === 0}
          className='flex items-center gap-2'
        >
          <Download className='h-4 w-4' />
          导出结果
        </Button>
      </div>

      {/* 进度条 */}
      {isRunning && (
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span>测试进度</span>
            <span>
              {results.filter(r => r.success).length} / {results.length}
            </span>
          </div>
          <Progress value={progress} className='w-full' />
        </div>
      )}

      {/* 状态信息 */}
      {results.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          <Badge variant='outline'>总计: {results.length}</Badge>
          <Badge variant='outline' className='bg-green-100 text-green-800'>
            通过: {results.filter(r => r.success).length}
          </Badge>
          <Badge variant='outline' className='bg-red-100 text-red-800'>
            失败: {results.filter(r => !r.success).length}
          </Badge>
        </div>
      )}
    </div>
  );
}
