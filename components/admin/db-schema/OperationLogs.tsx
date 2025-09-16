'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OperationLogsProps {
  logs: string[];
  logPage: number;
  logTotal: number;
  logPageSize: number;
  onPageChange: (page: number) => void;
}

export function OperationLogs({
  logs,
  logPage,
  logTotal,
  logPageSize,
  onPageChange,
}: OperationLogsProps) {
  const totalPages = Math.ceil(logTotal / logPageSize);

  return (
    <div className='mt-10'>
      <Card>
        <CardHeader>
          <CardTitle>操作日志</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='max-h-60 overflow-y-auto text-xs font-mono bg-muted p-2 rounded'>
            {logs.length === 0 ? (
              <div>暂无日志</div>
            ) : (
              logs.map((line, i) => <div key={i}>{line}</div>)
            )}
          </div>
          <div className='flex gap-2 mt-2'>
            <Button
              size='sm'
              variant='outline'
              disabled={logPage === 1}
              onClick={() => onPageChange(Math.max(1, logPage - 1))}
            >
              上一页
            </Button>
            <Button
              size='sm'
              variant='outline'
              disabled={logPage >= totalPages}
              onClick={() => onPageChange(logPage + 1)}
            >
              下一页
            </Button>
            <span className='text-xs text-muted-foreground'>
              {logPage} / {totalPages}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
