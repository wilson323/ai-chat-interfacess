'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bell,
  BellOff,
  Settings,
  Filter,
  Search,
  Mail,
  MessageSquare,
  Download,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { enhancedMonitor, type PerformanceAlert } from '@/lib/performance/enhanced-monitor';

interface AlertConfig {
  enabled: boolean;
  notifications: {
    console: boolean;
    toast: boolean;
    email: boolean;
    webhook: boolean;
  };
  thresholds: {
    pageLoadTime: { warning: number; critical: number };
    apiResponseTime: { warning: number; critical: number };
    memoryUsage: { warning: number; critical: number };
    errorRate: { warning: number; critical: number };
  };
}

export function PerformanceAlerts() {
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [config, setConfig] = useState<AlertConfig>(getDefaultConfig());
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'warning' | 'error' | 'critical'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAlerts();

    // 添加告警回调
    enhancedMonitor.addAlertCallback(handleNewAlert);

    return () => {
      enhancedMonitor.removeAlertCallback(handleNewAlert);
    };
  }, []);

  const getDefaultConfig = (): AlertConfig => ({
    enabled: true,
    notifications: {
      console: true,
      toast: true,
      email: false,
      webhook: false,
    },
    thresholds: {
      pageLoadTime: { warning: 3000, critical: 5000 },
      apiResponseTime: { warning: 1000, critical: 2000 },
      memoryUsage: { warning: 100 * 1024 * 1024, critical: 200 * 1024 * 1024 },
      errorRate: { warning: 0.05, critical: 0.1 },
    },
  });

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      setAlerts(enhancedMonitor.getAlerts());
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAlert = (alert: PerformanceAlert) => {
    // 添加新告警到列表
    setAlerts(prev => [alert, ...prev]);

    // 显示通知
    if (config.notifications.toast) {
      // 这里可以集成toast通知系统
      console.warn(`[Performance Alert] ${alert.message}`);
    }
  };

  const resolveAlert = (alertId: string) => {
    enhancedMonitor.resolveAlert(alertId);
    loadAlerts();
  };

  const deleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const clearResolvedAlerts = () => {
    setAlerts(prev => prev.filter(alert => !alert.resolved));
  };

  const updateConfig = (newConfig: Partial<AlertConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);

    // 更新监控器配置
    enhancedMonitor.updateConfig({
      alerts: {
        enabled: updatedConfig.enabled,
        debounceMs: 5000,
        notificationMethods: Object.entries(updatedConfig.notifications)
          .filter(([_, enabled]) => enabled)
          .map(([method]) => method as 'console' | 'toast' | 'email' | 'webhook'),
      },
      thresholds: {
        ...updatedConfig.thresholds,
        webVitals: {
          fcp: { warning: 1800, critical: 3000 },
          lcp: { warning: 2500, critical: 4000 },
          fid: { warning: 100, critical: 300 },
          cls: { warning: 0.1, critical: 0.25 },
        },
      },
    });
  };

  const filteredAlerts = alerts.filter(alert => {
    // 状态过滤
    if (filter === 'active' && alert.resolved) return false;
    if (filter === 'resolved' && !alert.resolved) return false;

    // 严重程度过滤
    if (severityFilter !== 'all' && alert.type !== severityFilter) return false;

    // 搜索过滤
    if (searchTerm && !alert.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className='h-4 w-4 text-yellow-600' />;
      case 'error':
        return <XCircle className='h-4 w-4 text-red-600' />;
      case 'critical':
        return <XCircle className='h-4 w-4 text-red-800' />;
      default:
        return <AlertTriangle className='h-4 w-4 text-gray-600' />;
    }
  };

  const getAlertBadgeVariant = (type: string) => {
    switch (type) {
      case 'warning':
        return 'default';
      case 'error':
        return 'destructive';
      case 'critical':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatValue = (metric: string, value: number) => {
    switch (metric) {
      case 'pageLoadTime':
      case 'apiResponseTime':
      case 'fcp':
      case 'lcp':
      case 'fid':
        return `${value.toFixed(0)}ms`;
      case 'memoryUsage':
        return `${(value / 1024 / 1024).toFixed(1)}MB`;
      case 'errorRate':
        return `${(value * 100).toFixed(1)}%`;
      case 'cls':
        return value.toFixed(3);
      default:
        return value.toString();
    }
  };

  const exportAlerts = () => {
    const data = JSON.stringify(filteredAlerts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-alerts-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const criticalAlerts = activeAlerts.filter(alert => alert.type === 'critical');

  return (
    <div className='space-y-6'>
      {/* 页面头部 */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>性能告警系统</h1>
          <p className='text-gray-600 mt-2'>实时监控和告警管理</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant={config.enabled ? 'default' : 'outline'}
            onClick={() => updateConfig({ enabled: !config.enabled })}
          >
            {config.enabled ? <Bell className='h-4 w-4 mr-2' /> : <BellOff className='h-4 w-4 mr-2' />}
            {config.enabled ? '告警开启' : '告警关闭'}
          </Button>
          <Button variant='outline' onClick={() => setShowConfig(!showConfig)}>
            <Settings className='h-4 w-4 mr-2' />
            配置
          </Button>
          <Button variant='outline' onClick={exportAlerts}>
            <Download className='h-4 w-4 mr-2' />
            导出
          </Button>
          <Button variant='outline' onClick={loadAlerts} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>

      {/* 告警统计 */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>总告警数</p>
                <p className='text-2xl font-bold'>{alerts.length}</p>
              </div>
              <AlertTriangle className='h-8 w-8 text-blue-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>活跃告警</p>
                <p className='text-2xl font-bold text-orange-600'>{activeAlerts.length}</p>
              </div>
              <XCircle className='h-8 w-8 text-orange-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>严重告警</p>
                <p className='text-2xl font-bold text-red-600'>{criticalAlerts.length}</p>
              </div>
              <XCircle className='h-8 w-8 text-red-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>已解决</p>
                <p className='text-2xl font-bold text-green-600'>
                  {alerts.filter(alert => alert.resolved).length}
                </p>
              </div>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 配置面板 */}
      {showConfig && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='h-5 w-5' />
              告警配置
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* 通知设置 */}
            <div>
              <h3 className='text-lg font-medium mb-4'>通知方式</h3>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='console'
                    checked={config.notifications.console}
                    onCheckedChange={(checked) =>
                      updateConfig({
                        notifications: { ...config.notifications, console: checked },
                      })
                    }
                  />
                  <Label htmlFor='console'>控制台</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='toast'
                    checked={config.notifications.toast}
                    onCheckedChange={(checked) =>
                      updateConfig({
                        notifications: { ...config.notifications, toast: checked },
                      })
                    }
                  />
                  <Label htmlFor='toast'>弹窗通知</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='email'
                    checked={config.notifications.email}
                    onCheckedChange={(checked) =>
                      updateConfig({
                        notifications: { ...config.notifications, email: checked },
                      })
                    }
                  />
                  <Label htmlFor='email'>邮件通知</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='webhook'
                    checked={config.notifications.webhook}
                    onCheckedChange={(checked) =>
                      updateConfig({
                        notifications: { ...config.notifications, webhook: checked },
                      })
                    }
                  />
                  <Label htmlFor='webhook'>Webhook</Label>
                </div>
              </div>
            </div>

            {/* 阈值设置 */}
            <div>
              <h3 className='text-lg font-medium mb-4'>告警阈值</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='pageLoadWarning'>页面加载时间 - 警告 (ms)</Label>
                  <Input
                    id='pageLoadWarning'
                    type='number'
                    value={config.thresholds.pageLoadTime.warning}
                    onChange={(e) =>
                      updateConfig({
                        thresholds: {
                          ...config.thresholds,
                          pageLoadTime: {
                            ...config.thresholds.pageLoadTime,
                            warning: parseInt(e.target.value) || 3000,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='pageLoadCritical'>页面加载时间 - 严重 (ms)</Label>
                  <Input
                    id='pageLoadCritical'
                    type='number'
                    value={config.thresholds.pageLoadTime.critical}
                    onChange={(e) =>
                      updateConfig({
                        thresholds: {
                          ...config.thresholds,
                          pageLoadTime: {
                            ...config.thresholds.pageLoadTime,
                            critical: parseInt(e.target.value) || 5000,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='apiResponseWarning'>API响应时间 - 警告 (ms)</Label>
                  <Input
                    id='apiResponseWarning'
                    type='number'
                    value={config.thresholds.apiResponseTime.warning}
                    onChange={(e) =>
                      updateConfig({
                        thresholds: {
                          ...config.thresholds,
                          apiResponseTime: {
                            ...config.thresholds.apiResponseTime,
                            warning: parseInt(e.target.value) || 1000,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='apiResponseCritical'>API响应时间 - 严重 (ms)</Label>
                  <Input
                    id='apiResponseCritical'
                    type='number'
                    value={config.thresholds.apiResponseTime.critical}
                    onChange={(e) =>
                      updateConfig({
                        thresholds: {
                          ...config.thresholds,
                          apiResponseTime: {
                            ...config.thresholds.apiResponseTime,
                            critical: parseInt(e.target.value) || 2000,
                          },
                        },
                      })
                    }
                  />
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
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                <Input
                  placeholder='搜索告警消息...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <div className='flex gap-2'>
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className='w-32'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>全部</SelectItem>
                  <SelectItem value='active'>活跃</SelectItem>
                  <SelectItem value='resolved'>已解决</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={(value: any) => setSeverityFilter(value)}>
                <SelectTrigger className='w-32'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>所有级别</SelectItem>
                  <SelectItem value='warning'>警告</SelectItem>
                  <SelectItem value='error'>错误</SelectItem>
                  <SelectItem value='critical'>严重</SelectItem>
                </SelectContent>
              </Select>
              <Button variant='outline' onClick={clearResolvedAlerts}>
                <Trash2 className='h-4 w-4 mr-2' />
                清除已解决
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 告警列表 */}
      <Card>
        <CardHeader>
          <CardTitle>告警列表</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              <AlertTriangle className='h-12 w-12 mx-auto mb-4 text-gray-300' />
              <p>暂无告警记录</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>类型</TableHead>
                  <TableHead>指标</TableHead>
                  <TableHead>数值</TableHead>
                  <TableHead>阈值</TableHead>
                  <TableHead>消息</TableHead>
                  <TableHead>时间</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert) => (
                  <TableRow key={alert.id} className={alert.resolved ? 'opacity-50' : ''}>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        {getAlertIcon(alert.type)}
                        <Badge variant={getAlertBadgeVariant(alert.type)}>
                          {alert.type === 'warning' && '警告'}
                          {alert.type === 'error' && '错误'}
                          {alert.type === 'critical' && '严重'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className='font-mono text-sm'>{alert.metric}</TableCell>
                    <TableCell>
                      <span className={alert.value > alert.threshold ? 'text-red-600' : 'text-gray-600'}>
                        {formatValue(alert.metric, alert.value)}
                      </span>
                    </TableCell>
                    <TableCell>{formatValue(alert.metric, alert.threshold)}</TableCell>
                    <TableCell className='max-w-xs truncate'>{alert.message}</TableCell>
                    <TableCell className='text-sm text-gray-500'>
                      {formatTime(alert.timestamp)}
                    </TableCell>
                    <TableCell>
                      {alert.resolved ? (
                        <Badge variant='outline' className='bg-green-100 text-green-800'>
                          <CheckCircle className='h-3 w-3 mr-1' />
                          已解决
                        </Badge>
                      ) : (
                        <Badge variant='outline' className='bg-red-100 text-red-800'>
                          <XCircle className='h-3 w-3 mr-1' />
                          活跃
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className='flex gap-2'>
                        {!alert.resolved && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => resolveAlert(alert.id)}
                          >
                            <CheckCircle className='h-4 w-4' />
                          </Button>
                        )}
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => deleteAlert(alert.id)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}