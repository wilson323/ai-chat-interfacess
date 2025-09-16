/**
 * 错误监控仪表板组件
 * 显示错误统计和日志信息
 */

'use client';

import React, { useState, useEffect } from 'react';
// Removed invalid typescript import
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  Bug,
  Database,
  Network,
  Shield,
  RefreshCw,
  Download,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ErrorStats {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
}

interface ErrorLog {
  type: string;
  code: string;
  message: string;
  severity: string;
  timestamp: string;
  requestId: string;
  userId?: string;
  context?: {
    url?: string;
    method?: string;
    userAgent?: string;
    ip?: string;
  };
  stack?: string;
}

interface ErrorMonitorData {
  stats: ErrorStats;
  errors: ErrorLog[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

const severityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const typeIcons = {
  VALIDATION_ERROR: <Shield className='h-4 w-4' />,
  AUTHENTICATION_ERROR: <Shield className='h-4 w-4' />,
  AUTHORIZATION_ERROR: <Shield className='h-4 w-4' />,
  NOT_FOUND_ERROR: <EyeOff className='h-4 w-4' />,
  CONFLICT_ERROR: <AlertTriangle className='h-4 w-4' />,
  RATE_LIMIT_ERROR: <AlertTriangle className='h-4 w-4' />,
  DATABASE_ERROR: <Database className='h-4 w-4' />,
  NETWORK_ERROR: <Network className='h-4 w-4' />,
  EXTERNAL_API_ERROR: <Network className='h-4 w-4' />,
  INTERNAL_SERVER_ERROR: <Bug className='h-4 w-4' />,
  UNKNOWN_ERROR: <Bug className='h-4 w-4' />,
};

export function ErrorMonitor() {
  const [data, setData] = useState<ErrorMonitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStack, setShowStack] = useState(false);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);

  const fetchErrorData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/errors');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error?.message || 'Failed to fetch error data');
      }
    } catch (err) {
      setError('Network error while fetching error data');
    } finally {
      setLoading(false);
    }
  };

  const clearErrorLogs = async () => {
    if (!confirm('确定要清空所有错误日志吗？此操作不可撤销。')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/errors?confirm=true', {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        await fetchErrorData();
      } else {
        setError(result.error?.message || 'Failed to clear error logs');
      }
    } catch (err) {
      setError('Network error while clearing error logs');
    }
  };

  const exportErrorLogs = async () => {
    try {
      const response = await fetch('/api/admin/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: 'json',
          includeStack: showStack,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const blob = new Blob(
          [JSON.stringify(result.data.exportData, null, 2)],
          {
            type: 'application/json',
          }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        setError(result.error?.message || 'Failed to export error logs');
      }
    } catch (err) {
      setError('Network error while exporting error logs');
    }
  };

  useEffect(() => {
    fetchErrorData();

    // 每30秒自动刷新
    const interval = setInterval(fetchErrorData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <RefreshCw className='h-6 w-6 animate-spin' />
        <span className='ml-2'>加载错误数据中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert>
        <AlertDescription>暂无错误数据</AlertDescription>
      </Alert>
    );
  }

  const { stats, errors } = data;

  return (
    <div className='space-y-6'>
      {/* 统计概览 */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>总错误数</CardTitle>
            <Bug className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>严重错误</CardTitle>
            <AlertTriangle className='h-4 w-4 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {stats.bySeverity.critical || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>数据库错误</CardTitle>
            <Database className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.byType.DATABASE_ERROR || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>网络错误</CardTitle>
            <Network className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {(stats.byType.NETWORK_ERROR || 0) +
                (stats.byType.EXTERNAL_API_ERROR || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 操作按钮 */}
      <div className='flex justify-between items-center'>
        <div className='flex space-x-2'>
          <Button onClick={fetchErrorData} variant='outline' size='sm'>
            <RefreshCw className='h-4 w-4 mr-2' />
            刷新
          </Button>
          <Button onClick={exportErrorLogs} variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-2' />
            导出
          </Button>
          <Button onClick={clearErrorLogs} variant='destructive' size='sm'>
            <Trash2 className='h-4 w-4 mr-2' />
            清空日志
          </Button>
        </div>

        <div className='flex items-center space-x-2'>
          <Button
            onClick={() => setShowStack(!showStack)}
            variant='outline'
            size='sm'
          >
            {showStack ? (
              <EyeOff className='h-4 w-4 mr-2' />
            ) : (
              <Eye className='h-4 w-4 mr-2' />
            )}
            {showStack ? '隐藏堆栈' : '显示堆栈'}
          </Button>
        </div>
      </div>

      {/* 错误列表 */}
      <Tabs defaultValue='recent' className='w-full'>
        <TabsList>
          <TabsTrigger value='recent'>最近错误</TabsTrigger>
          <TabsTrigger value='by-type'>按类型</TabsTrigger>
          <TabsTrigger value='by-severity'>按严重级别</TabsTrigger>
        </TabsList>

        <TabsContent value='recent' className='space-y-4'>
          {errors.length === 0 ? (
            <Card>
              <CardContent className='flex items-center justify-center h-32'>
                <p className='text-muted-foreground'>暂无错误记录</p>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-2'>
              {errors.map((error, index) => (
                <Card
                  key={index}
                  className='cursor-pointer hover:bg-gray-50'
                  onClick={() => setSelectedError(error)}
                >
                  <CardContent className='p-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-start space-x-3'>
                        <div className='flex-shrink-0'>
                          {typeIcons[error.type as keyof typeof typeIcons] || (
                            <Bug className='h-4 w-4' />
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center space-x-2'>
                            <h4 className='text-sm font-medium text-gray-900 truncate'>
                              {error.message}
                            </h4>
                            <Badge
                              className={
                                severityColors[
                                  error.severity as keyof typeof severityColors
                                ]
                              }
                            >
                              {error.severity}
                            </Badge>
                          </div>
                          <div className='mt-1 flex items-center space-x-4 text-xs text-gray-500'>
                            <span>{error.type}</span>
                            <span>{error.code}</span>
                            <span>
                              {formatDistanceToNow(new Date(error.timestamp), {
                                addSuffix: true,
                                locale: zhCN,
                              })}
                            </span>
                            {error.requestId && (
                              <span className='font-mono'>
                                {error.requestId}
                              </span>
                            )}
                          </div>
                          {error.context?.url && (
                            <div className='mt-1 text-xs text-gray-400'>
                              {error.context.method} {error.context.url}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='by-type'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {Object.entries(stats.byType).map(([type, count]) => (
              <Card key={type}>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      {typeIcons[type as keyof typeof typeIcons] || (
                        <Bug className='h-4 w-4' />
                      )}
                      <span className='text-sm font-medium'>{type}</span>
                    </div>
                    <Badge variant='secondary'>{count}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value='by-severity'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            {Object.entries(stats.bySeverity).map(([severity, count]) => (
              <Card key={severity}>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium capitalize'>
                      {severity}
                    </span>
                    <Badge
                      className={
                        severityColors[severity as keyof typeof severityColors]
                      }
                    >
                      {count}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* 错误详情模态框 */}
      {selectedError && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <Card className='w-full max-w-2xl max-h-[80vh] overflow-y-auto'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                {typeIcons[selectedError.type as keyof typeof typeIcons] || (
                  <Bug className='h-5 w-5' />
                )}
                <span>错误详情</span>
              </CardTitle>
              <CardDescription>
                {selectedError.type} - {selectedError.code}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <h4 className='font-medium mb-2'>错误信息</h4>
                <p className='text-sm text-gray-600'>{selectedError.message}</p>
              </div>

              <div>
                <h4 className='font-medium mb-2'>基本信息</h4>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <span className='text-gray-500'>严重级别:</span>
                    <Badge
                      className={`ml-2 ${severityColors[selectedError.severity as keyof typeof severityColors]}`}
                    >
                      {selectedError.severity}
                    </Badge>
                  </div>
                  <div>
                    <span className='text-gray-500'>时间:</span>
                    <span className='ml-2'>
                      {new Date(selectedError.timestamp).toLocaleString(
                        'zh-CN'
                      )}
                    </span>
                  </div>
                  <div>
                    <span className='text-gray-500'>请求ID:</span>
                    <span className='ml-2 font-mono text-xs'>
                      {selectedError.requestId}
                    </span>
                  </div>
                  {selectedError.userId && (
                    <div>
                      <span className='text-gray-500'>用户ID:</span>
                      <span className='ml-2'>{selectedError.userId}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedError.context && (
                <div>
                  <h4 className='font-medium mb-2'>请求上下文</h4>
                  <div className='text-sm space-y-1'>
                    {selectedError.context.url && (
                      <div>
                        <span className='text-gray-500'>URL:</span>
                        <span className='ml-2'>
                          {selectedError.context.url}
                        </span>
                      </div>
                    )}
                    {selectedError.context.method && (
                      <div>
                        <span className='text-gray-500'>方法:</span>
                        <span className='ml-2'>
                          {selectedError.context.method}
                        </span>
                      </div>
                    )}
                    {selectedError.context.ip && (
                      <div>
                        <span className='text-gray-500'>IP:</span>
                        <span className='ml-2'>{selectedError.context.ip}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {showStack && selectedError.stack && (
                <div>
                  <h4 className='font-medium mb-2'>堆栈跟踪</h4>
                  <pre className='text-xs bg-gray-100 p-3 rounded overflow-x-auto'>
                    {selectedError.stack}
                  </pre>
                </div>
              )}

              <div className='flex justify-end space-x-2'>
                <Button
                  onClick={() => setSelectedError(null)}
                  variant='outline'
                >
                  关闭
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ErrorMonitor;
