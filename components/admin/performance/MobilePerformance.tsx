'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Smartphone,
  Battery,
  Wifi,
  WifiOff,
  Signal,
  SignalLow,
  SignalMedium,
  SignalHigh,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  Thermometer,
} from 'lucide-react';

interface MobileMetrics {
  timestamp: number;
  deviceType: string;
  os: string;
  browser: string;
  networkType: string;
  batteryLevel: number;
  isCharging: boolean;
  memoryUsage: number;
  cpuUsage: number;
  touchResponseTime: number;
  scrollPerformance: number;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  isLowPowerMode: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

interface MobileOptimization {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedImprovement: number;
  implemented: boolean;
}

export function MobilePerformance() {
  const [metrics, setMetrics] = useState<MobileMetrics[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState<MobileMetrics | null>(null);
  const [optimizations, setOptimizations] = useState<MobileOptimization[]>([]);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');

  // 检测移动设备信息
  const detectDeviceInfo = (): MobileMetrics => {
    const connection = (navigator as Navigator & { connection?: { type?: string; effectiveType?: string; downlink?: number; rtt?: number } }).connection || {};
    return {
      timestamp: Date.now(),
      deviceType: getDeviceType(),
      os: getOS(),
      browser: getBrowser(),
      networkType: connection.type || 'unknown',
      batteryLevel: 100, // 需要权限，使用模拟值
      isCharging: false, // 需要权限，使用模拟值
      memoryUsage: estimateMemoryUsage(),
      cpuUsage: estimateCPUUsage(),
      touchResponseTime: estimateTouchResponseTime(),
      scrollPerformance: estimateScrollPerformance(),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      isLowPowerMode: false, // 需要权限，使用模拟值
      connectionType: connection.type || 'unknown',
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
    };
  };

  // 获取设备类型
  const getDeviceType = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|ipod/.test(userAgent)) {
      if (/ipad/.test(userAgent)) return 'tablet';
      return 'smartphone';
    }
    return 'desktop';
  };

  // 获取操作系统
  const getOS = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/android/.test(userAgent)) return 'Android';
    if (/iphone|ipad|ipod/.test(userAgent)) return 'iOS';
    if (/windows/.test(userAgent)) return 'Windows';
    if (/mac/.test(userAgent)) return 'macOS';
    if (/linux/.test(userAgent)) return 'Linux';
    return 'Unknown';
  };

  // 获取浏览器
  const getBrowser = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/chrome/.test(userAgent)) return 'Chrome';
    if (/safari/.test(userAgent)) return 'Safari';
    if (/firefox/.test(userAgent)) return 'Firefox';
    if (/edge/.test(userAgent)) return 'Edge';
    return 'Unknown';
  };

  // 估算内存使用
  const estimateMemoryUsage = () => {
    if ('memory' in (performance as any)) {
      const memory = (performance as any).memory;
      return Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100);
    }
    return Math.random() * 100; // 模拟值
  };

  // 估算CPU使用率
  const estimateCPUUsage = () => {
    return Math.random() * 100; // 模拟值
  };

  // 估算触摸响应时间
  const estimateTouchResponseTime = () => {
    return Math.random() * 100 + 20; // 20-120ms 模拟值
  };

  // 估算滚动性能
  const estimateScrollPerformance = () => {
    return Math.random() * 100; // 模拟值
  };

  // 初始化优化建议
  const initializeOptimizations = () => {
    const optimizations: MobileOptimization[] = [
      {
        id: '1',
        category: '网络优化',
        title: '实现图片懒加载',
        description: '延迟加载非首屏图片，减少初始页面加载时间',
        impact: 'high',
        difficulty: 'easy',
        estimatedImprovement: 30,
        implemented: false,
      },
      {
        id: '2',
        category: '网络优化',
        title: '使用 CDN 加速',
        description: '将静态资源托管到 CDN，提升全球访问速度',
        impact: 'high',
        difficulty: 'medium',
        estimatedImprovement: 40,
        implemented: false,
      },
      {
        id: '3',
        category: '内存优化',
        title: '实现虚拟滚动',
        description: '对于长列表使用虚拟滚动，减少 DOM 节点数量',
        impact: 'high',
        difficulty: 'medium',
        estimatedImprovement: 25,
        implemented: false,
      },
      {
        id: '4',
        category: '渲染优化',
        title: '使用 CSS will-change',
        description: '预告知浏览器元素将要发生变化，优化渲染性能',
        impact: 'medium',
        difficulty: 'easy',
        estimatedImprovement: 15,
        implemented: false,
      },
      {
        id: '5',
        category: '触摸优化',
        title: '优化触摸事件处理',
        description: '使用 touchstart/touchend 替代 click，减少响应延迟',
        impact: 'medium',
        difficulty: 'medium',
        estimatedImprovement: 20,
        implemented: false,
      },
      {
        id: '6',
        category: '电池优化',
        title: '减少后台活动',
        description: '在页面不可见时减少定时器和动画等后台活动',
        impact: 'medium',
        difficulty: 'easy',
        estimatedImprovement: 10,
        implemented: false,
      },
    ];
    setOptimizations(optimizations);
  };

  // 开始监控
  const startMonitoring = () => {
    setIsMonitoring(true);
    initializeOptimizations();
  };

  // 停止监控
  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  // 生成模拟数据
  const generateMockData = () => {
    const now = Date.now();
    const mockMetrics: MobileMetrics[] = [];

    for (let i = 0; i < 50; i++) {
      mockMetrics.push({
        timestamp: now - (49 - i) * 60000,
        deviceType: Math.random() > 0.3 ? 'smartphone' : 'tablet',
        os: ['Android', 'iOS'][Math.floor(Math.random() * 2)],
        browser: ['Chrome', 'Safari'][Math.floor(Math.random() * 2)],
        networkType: ['4G', 'WiFi', '5G'][Math.floor(Math.random() * 3)],
        batteryLevel: Math.random() * 100,
        isCharging: Math.random() > 0.7,
        memoryUsage: Math.random() * 100,
        cpuUsage: Math.random() * 100,
        touchResponseTime: Math.random() * 100 + 20,
        scrollPerformance: Math.random() * 100,
        viewportWidth: [375, 414, 768, 820][Math.floor(Math.random() * 4)],
        viewportHeight: [667, 896, 1024, 1180][Math.floor(Math.random() * 4)],
        devicePixelRatio: [2, 3][Math.floor(Math.random() * 2)],
        isLowPowerMode: Math.random() > 0.8,
        connectionType: ['cellular', 'wifi', 'unknown'][Math.floor(Math.random() * 3)],
        effectiveType: ['4g', '3g', '2g'][Math.floor(Math.random() * 3)],
        downlink: Math.random() * 10 + 1,
        rtt: Math.random() * 500 + 50,
      });
    }

    setMetrics(mockMetrics);
    setCurrentMetrics(mockMetrics[mockMetrics.length - 1]);
  };

  // 监听网络变化
  useEffect(() => {
    const connection = (navigator as any).connection;
    if (connection) {
      const handleChange = () => {
        if (isMonitoring) {
          const newMetrics = detectDeviceInfo();
          setCurrentMetrics(newMetrics);
          setMetrics(prev => [...prev.slice(-49), newMetrics]);
        }
      };

      connection.addEventListener('change', handleChange);
      return () => connection.removeEventListener('change', handleChange);
    }
  }, [isMonitoring]);

  // 监听窗口变化
  useEffect(() => {
    if (isMonitoring) {
      const handleResize = () => {
        const newMetrics = detectDeviceInfo();
        setCurrentMetrics(newMetrics);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isMonitoring]);

  // 定时采集数据
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMonitoring) {
      interval = setInterval(() => {
        const newMetrics = detectDeviceInfo();
        setCurrentMetrics(newMetrics);
        setMetrics(prev => [...prev.slice(-49), newMetrics]);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isMonitoring]);

  // 初始化数据
  useEffect(() => {
    generateMockData();
  }, []);

  // 格式化时间
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // 格式化日期
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // 获取网络信号强度图标
  const getNetworkIcon = (type: string) => {
    switch (type) {
      case '4G':
      case '5G':
      case 'wifi':
        return <SignalHigh className='h-4 w-4 text-green-600' />;
      case '3G':
        return <SignalMedium className='h-4 w-4 text-yellow-600' />;
      case '2G':
        return <SignalLow className='h-4 w-4 text-red-600' />;
      default:
        return <Signal className='h-4 w-4 text-gray-600' />;
    }
  };

  // 获取电池状态
  const getBatteryStatus = (level: number, isCharging: boolean) => {
    if (isCharging) {
      return <Battery className='h-4 w-4 text-green-600' />;
    }
    if (level > 20) {
      return <Battery className='h-4 w-4 text-blue-600' />;
    }
    return <Battery className='h-4 w-4 text-red-600' />;
  };

  // 获取性能等级
  const getPerformanceLevel = (value: number, type: string) => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      memory: { good: 50, poor: 80 },
      cpu: { good: 30, poor: 70 },
      touchResponse: { good: 50, poor: 100 },
      battery: { good: 20, poor: 50 },
    };

    const threshold = thresholds[type] || { good: 50, poor: 80 };
    if (value <= threshold.good) return { level: 'good', color: 'text-green-600' };
    if (value <= threshold.poor) return { level: 'fair', color: 'text-yellow-600' };
    return { level: 'poor', color: 'text-red-600' };
  };

  // 图表数据准备
  const getChartData = () => {
    return metrics.map(metric => ({
      time: formatDate(metric.timestamp),
      memory: metric.memoryUsage,
      cpu: metric.cpuUsage,
      touchResponse: metric.touchResponseTime,
      battery: metric.batteryLevel,
      scroll: metric.scrollPerformance,
    }));
  };

  // 设备分布数据
  const getDeviceDistribution = () => {
    const distribution = metrics.reduce((acc, metric) => {
      acc[metric.deviceType] = (acc[metric.deviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([device, count]) => ({
      name: device === 'smartphone' ? '智能手机' : device === 'tablet' ? '平板电脑' : '桌面设备',
      value: count,
    }));
  };

  // 网络类型分布
  const getNetworkDistribution = () => {
    const distribution = metrics.reduce((acc, metric) => {
      acc[metric.networkType] = (acc[metric.networkType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([network, count]) => ({
      name: network,
      value: count,
    }));
  };

  // 标记优化为已实现
  const markOptimizationImplemented = (id: string) => {
    setOptimizations(prev =>
      prev.map(opt => (opt.id === id ? { ...opt, implemented: true } : opt))
    );
  };

  // 图表颜色
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className='space-y-6'>
      {/* 控制面板 */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>移动设备性能监控</h2>
          <p className='text-gray-600 mt-1'>监控移动设备特定性能指标和用户体验</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant={isMonitoring ? 'destructive' : 'default'}
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            size='sm'
          >
            {isMonitoring ? '停止监控' : '开始监控'}
          </Button>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className='px-3 py-1 border rounded-md text-sm'
          >
            <option value='1h'>最近1小时</option>
            <option value='6h'>最近6小时</option>
            <option value='24h'>最近24小时</option>
            <option value='7d'>最近7天</option>
          </select>
        </div>
      </div>

      {/* 当前设备信息 */}
      {currentMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Smartphone className='h-5 w-5' />
              当前设备信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>设备类型</span>
                  <span className='font-medium'>
                    {currentMetrics.deviceType === 'smartphone'
                      ? '智能手机'
                      : currentMetrics.deviceType === 'tablet'
                      ? '平板电脑'
                      : '桌面设备'}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>操作系统</span>
                  <span className='font-medium'>{currentMetrics.os}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>浏览器</span>
                  <span className='font-medium'>{currentMetrics.browser}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>屏幕分辨率</span>
                  <span className='font-medium'>
                    {currentMetrics.viewportWidth} × {currentMetrics.viewportHeight}
                  </span>
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>网络类型</span>
                  <div className='flex items-center gap-1'>
                    {getNetworkIcon(currentMetrics.networkType)}
                    <span className='font-medium'>{currentMetrics.networkType}</span>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>下载速度</span>
                  <span className='font-medium'>
                    {currentMetrics.downlink.toFixed(1)} Mbps
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>延迟</span>
                  <span className='font-medium'>{currentMetrics.rtt}ms</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>有效类型</span>
                  <span className='font-medium'>{currentMetrics.effectiveType}</span>
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>电池电量</span>
                  <div className='flex items-center gap-1'>
                    {getBatteryStatus(currentMetrics.batteryLevel, currentMetrics.isCharging)}
                    <span className='font-medium'>
                      {currentMetrics.batteryLevel.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>充电状态</span>
                  <Badge variant={currentMetrics.isCharging ? 'default' : 'secondary'}>
                    {currentMetrics.isCharging ? '充电中' : '使用电池'}
                  </Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>低功耗模式</span>
                  <Badge variant={currentMetrics.isLowPowerMode ? 'destructive' : 'default'}>
                    {currentMetrics.isLowPowerMode ? '开启' : '关闭'}
                  </Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>像素比</span>
                  <span className='font-medium'>{currentMetrics.devicePixelRatio}x</span>
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>内存使用</span>
                  <span className={`font-medium ${getPerformanceLevel(currentMetrics.memoryUsage, 'memory').color}`}>
                    {currentMetrics.memoryUsage.toFixed(1)}%
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>CPU使用率</span>
                  <span className={`font-medium ${getPerformanceLevel(currentMetrics.cpuUsage, 'cpu').color}`}>
                    {currentMetrics.cpuUsage.toFixed(1)}%
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>触摸响应</span>
                  <span className={`font-medium ${getPerformanceLevel(currentMetrics.touchResponseTime, 'touchResponse').color}`}>
                    {formatTime(currentMetrics.touchResponseTime)}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>滚动性能</span>
                  <span className={`font-medium ${getPerformanceLevel(currentMetrics.scrollPerformance, 'scroll').color}`}>
                    {currentMetrics.scrollPerformance.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 性能图表 */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* 内存和CPU使用率 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Cpu className='h-5 w-5' />
              资源使用率趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='time' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='memory'
                  stroke='#8884d8'
                  name='内存使用率 (%)'
                  strokeWidth={2}
                />
                <Line
                  type='monotone'
                  dataKey='cpu'
                  stroke='#82ca9d'
                  name='CPU使用率 (%)'
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 触摸响应时间 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='h-5 w-5' />
              触摸响应时间
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <AreaChart data={getChartData()}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='time' />
                <YAxis />
                <Tooltip />
                <Area
                  type='monotone'
                  dataKey='touchResponse'
                  stroke='#ffc658'
                  fill='#ffc658'
                  fillOpacity={0.3}
                  name='响应时间 (ms)'
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 设备类型分布 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Smartphone className='h-5 w-5' />
              设备类型分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={getDeviceDistribution()}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='value'
                >
                  {getDeviceDistribution().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 网络类型分布 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Wifi className='h-5 w-5' />
              网络类型分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={getNetworkDistribution()}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='value'
                >
                  {getNetworkDistribution().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 优化建议 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            移动性能优化建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {optimizations.map((opt) => (
              <div key={opt.id} className='border rounded-lg p-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <h4 className='font-medium'>{opt.title}</h4>
                      <Badge variant='outline'>{opt.category}</Badge>
                      <Badge
                        variant={
                          opt.impact === 'high'
                            ? 'destructive'
                            : opt.impact === 'medium'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {opt.impact === 'high' ? '高影响' : opt.impact === 'medium' ? '中等影响' : '低影响'}
                      </Badge>
                      <Badge
                        variant={
                          opt.difficulty === 'easy'
                            ? 'default'
                            : opt.difficulty === 'medium'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {opt.difficulty === 'easy' ? '简单' : opt.difficulty === 'medium' ? '中等' : '困难'}
                      </Badge>
                    </div>
                    <p className='text-sm text-gray-600 mb-2'>{opt.description}</p>
                    <div className='flex items-center gap-4 text-sm'>
                      <span className='text-green-600'>
                        预计改进: +{opt.estimatedImprovement}%
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {opt.implemented ? (
                      <Badge variant='default' className='bg-green-100 text-green-800'>
                        <CheckCircle className='h-3 w-3 mr-1' />
                        已实现
                      </Badge>
                    ) : (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => markOptimizationImplemented(opt.id)}
                      >
                        标记已实现
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 性能标准检查 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CheckCircle className='h-5 w-5' />
            移动性能标准检查
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <input type='checkbox' id='touch' className='rounded' />
              <label htmlFor='touch' className='text-sm'>触摸响应时间 {'<'} 50ms</label>
            </div>
            <div className='flex items-center gap-2'>
              <input type='checkbox' id='network' className='rounded' />
              <label htmlFor='network' className='text-sm'>支持离线功能</label>
            </div>
            <div className='flex items-center gap-2'>
              <input type='checkbox' id='memory' className='rounded' />
              <label htmlFor='memory' className='text-sm'>内存使用 {'<'} 100MB</label>
            </div>
            <div className='flex items-center gap-2'>
              <input type='checkbox' id='battery' className='rounded' />
              <label htmlFor='battery' className='text-sm'>电池消耗优化</label>
            </div>
            <div className='flex items-center gap-2'>
              <input type='checkbox' id='responsive' className='rounded' />
              <label htmlFor='responsive' className='text-sm'>响应式设计</label>
            </div>
            <div className='flex items-center gap-2'>
              <input type='checkbox' id='animations' className='rounded' />
              <label htmlFor='animations' className='text-sm'>流畅的动画效果</label>
            </div>
            <div className='flex items-center gap-2'>
              <input type='checkbox' id='gestures' className='rounded' />
              <label htmlFor='gestures' className='text-sm'>支持手势操作</label>
            </div>
            <div className='flex items-center gap-2'>
              <input type='checkbox' id='accessibility' className='rounded' />
              <label htmlFor='accessibility' className='text-sm'>无障碍访问</label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}