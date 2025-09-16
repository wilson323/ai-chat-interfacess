'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import { BenchmarkConfig } from '../../../types/benchmark';

interface BenchmarkConfigProps {
  config: BenchmarkConfig;
  showConfig: boolean;
  onConfigChange: (config: Partial<BenchmarkConfig>) => void;
  onToggleConfig: () => void;
}

export function BenchmarkConfigComponent({
  config,
  showConfig,
  onConfigChange,
  onToggleConfig,
}: BenchmarkConfigProps) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle>基准测试配置</CardTitle>
        <Button variant='outline' size='sm' onClick={onToggleConfig}>
          <Settings className='h-4 w-4 mr-2' />
          {showConfig ? '隐藏配置' : '显示配置'}
        </Button>
      </CardHeader>
      {showConfig && (
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='iterations'>迭代次数</Label>
              <Input
                id='iterations'
                type='number'
                value={config.iterations}
                onChange={e =>
                  onConfigChange({ iterations: parseInt(e.target.value) || 10 })
                }
                min='1'
                max='100'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='warmup'>预热次数</Label>
              <Input
                id='warmup'
                type='number'
                value={config.warmup}
                onChange={e =>
                  onConfigChange({ warmup: parseInt(e.target.value) || 3 })
                }
                min='0'
                max='10'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='timeout'>超时时间 (ms)</Label>
              <Input
                id='timeout'
                type='number'
                value={config.timeout}
                onChange={e =>
                  onConfigChange({ timeout: parseInt(e.target.value) || 30000 })
                }
                min='1000'
                max='300000'
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
