'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Settings,
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  Zap,
  Database,
  Activity,
  Wifi,
  AlertTriangle,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { performanceBenchmark, type BenchmarkResult, type BenchmarkSuite } from '@/lib/performance/benchmark';

interface BenchmarkConfig {
  iterations: number;
  warmup: number;
  timeout: number;
}

export function BenchmarkTool() {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [suites, setSuites] = useState<BenchmarkSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSuite, setCurrentSuite] = useState<string>('');
  const [config, setConfig] = useState<BenchmarkConfig>({
    iterations: 10,
    warmup: 3,
    timeout: 30000,
  });
  const [summary, setSummary] = useState<any>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadSuites();
    loadResults();
  }, []);

  const loadSuites = () => {
    setSuites(performanceBenchmark.getSuites());
  };

  const loadResults = () => {
    setResults(performanceBenchmark.getResults());
    setSummary(performanceBenchmark.getSummary());
  };

  const runBenchmark = async (suiteId?: string) => {
    if (isRunning) return;

    setIsRunning(true);
    setCurrentSuite(suiteId || 'all');

    try {
      const newResults = await performanceBenchmark.runBenchmark(suiteId);
      setResults(newResults);
      setSummary(performanceBenchmark.getSummary());
    } catch (error) {
      console.error('Benchmark failed:', error);
    } finally {
      setIsRunning(false);
      setCurrentSuite('');
    }
  };

  const runAllBenchmarks = () => runBenchmark();
  const runSpecificSuite = (suiteId: string) => runBenchmark(suiteId);

  const clearResults = () => {
    performanceBenchmark.clearResults();
    setResults([]);
    setSummary(null);
  };

  const exportResults = () => {
    const data = performanceBenchmark.exportResults();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `benchmark-results-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const updateConfig = (newConfig: Partial<BenchmarkConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    performanceBenchmark.updateConfig(updatedConfig);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'A': return <Award className='h-4 w-4' />;
      case 'B': return <TrendingUp className='h-4 w-4' />;
      case 'C': return <Activity className='h-4 w-4' />;
      case 'D': return <AlertTriangle className='h-4 w-4' />;
      case 'F': return <AlertTriangle className='h-4 w-4' />;
      default: return <FileText className='h-4 w-4' />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'page-load': return <Clock className='h-5 w-5' />;
      case 'api': return <Database className='h-5 w-5' />;
      case 'render': return <Activity className='h-5 w-5' />;
      case 'memory': return <Database className='h-5 w-5' />;
      case 'network': return <Wifi className='h-5 w-5' />;
      default: return <FileText className='h-5 w-5' />;
    }
  };

  const formatDuration = (duration: number) => {
    if (duration < 1000) return `${Math.round(duration)}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(2)}s`;
    return `${(duration / 60000).toFixed(2)}min`;
  };

  const formatChartData = () => {
    const categoryData = summary?.categoryScores || {};
    return Object.entries(categoryData).map(([category, score]) => ({
      category: getCategoryName(category),
      score: score as number,
    }));
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      'page-load': '页面加载',
      'api': 'API性能',
      'render': '渲染性能',
      'memory': '内存使用',
      'network': '网络性能',
    };
    return names[category] || category;
  };

  const getGradeDistribution = () => {
    const gradeCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    results.forEach(result => {
      if (result.success) {
        gradeCounts[result.metrics.grade]++;
      }
    });

    return Object.entries(gradeCounts).map(([grade, count]) => ({
      grade,
      count,
      percentage: results.length > 0 ? (count / results.length) * 100 : 0,
    }));
  };

  const chartData = formatChartData();
  const gradeData = getGradeDistribution();

  return (
    <div className='space-y-6'>
      {/* 页面头部 */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>性能基准测试</h1>
          <p className='text-gray-600 mt-2'>自动化性能测试和基准对比</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant={isRunning ? 'destructive' : 'default'}
            onClick={runAllBenchmarks}
            disabled={isRunning}
          >
            {isRunning ? <Pause className='h-4 w-4 mr-2' /> : <Play className='h-4 w-4 mr-2' />}
            {isRunning ? '测试中...' : '运行全部测试'}
          </Button>
          <Button variant='outline' onClick={() => setShowConfig(!showConfig)}>
            <Settings className='h-4 w-4 mr-2' />
            配置
          </Button>
          <Button variant='outline' onClick={exportResults}>
            <Download className='h-4 w-4 mr-2' />
            导出结果
          </Button>
          <Button variant='outline' onClick={clearResults}>
            <RotateCcw className='h-4 w-4 mr-2' />
            清空结果
          </Button>
        </div>
      </div>

      {/* 配置面板 */}
      {showConfig && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='h-5 w-5' />
              测试配置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <Label htmlFor='iterations'>测试迭代次数</Label>
                <Input
                  id='iterations'
                  type='number'
                  value={config.iterations}
                  onChange={(e) => updateConfig({ iterations: parseInt(e.target.value) || 10 })}
                  min={1}
                  max={100}
                />
              </div>
              <div>
                <Label htmlFor='warmup'>预热次数</Label>
                <Input
                  id='warmup'
                  type='number'
                  value={config.warmup}
                  onChange={(e) => updateConfig({ warmup: parseInt(e.target.value) || 3 })}
                  min={0}
                  max={20}
                />
              </div>
              <div>
                <Label htmlFor='timeout'>超时时间 (ms)</Label>
                <Input
                  id='timeout'
                  type='number'
                  value={config.timeout}
                  onChange={(e) => updateConfig({ timeout: parseInt(e.target.value) || 30000 })}
                  min={1000}
                  max={300000}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 测试套件 */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {suites.map((suite) => (
          <Card key={suite.id}>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                {getCategoryIcon(suite.tests[0]?.category || 'page-load')}
                {suite.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-gray-600 mb-4'>{suite.description}</p>
              <div className='space-y-2 mb-4'>
                {suite.tests.map((test) => (
                  <div key={test.id} className='flex items-center justify-between text-sm'>
                    <span>{test.name}</span>
                    <Badge variant='outline'>{getCategoryName(test.category)}</Badge>
                  </div>
                ))}
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => runSpecificSuite(suite.id)}
                disabled={isRunning}
                className='w-full'
              >
                {isRunning && currentSuite === suite.id ? '测试中...' : '运行测试'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 测试结果概览 */}
      {summary && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>总体评分</p>
                  <p className='text-2xl font-bold'>{Math.round(summary.averageScore)}</p>
                </div>
                {getGradeIcon(summary.grade)}
              </div>
              <div className='mt-2'>
                <Badge className={getGradeColor(summary.grade)}>
                  {summary.grade} 级
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>成功测试</p>
                  <p className='text-2xl font-bold text-green-600'>{summary.successfulTests}</p>
                </div>
                <CheckCircle className='h-8 w-8 text-green-600' />
              </div>
              <div className='mt-2 text-sm text-gray-500'>
                失败: {summary.failedTests}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>页面加载</p>
                  <p className='text-2xl font-bold'>
                    {Math.round(summary.categoryScores['page-load'] || 0)}
                  </p>
                </div>
                <Clock className='h-8 w-8 text-blue-600' />
              </div>
              <Progress value={summary.categoryScores['page-load'] || 0} className='w-full mt-2' />
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>API性能</p>
                  <p className='text-2xl font-bold'>
                    {Math.round(summary.categoryScores['api'] || 0)}
                  </p>
                </div>
                <Database className='h-8 w-8 text-green-600' />
              </div>
              <Progress value={summary.categoryScores['api'] || 0} className='w-full mt-2' />
            </CardContent>
          </Card>
        </div>
      )}

      {/* 详细结果 */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className='w-full'>
        <TabsList>
          <TabsTrigger value='overview'>概览</TabsTrigger>
          <TabsTrigger value='results'>详细结果</TabsTrigger>
          <TabsTrigger value='charts'>图表分析</TabsTrigger>
          <TabsTrigger value='comparison'>性能对比</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          {/* 性能评分图表 */}
          {chartData.length > 0 && (
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle>分类性能评分</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width='100%' height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='category' />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey='score' fill='#8884d8' />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>等级分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width='100%' height={300}>
                    <PieChart>
                      <Pie
                        data={gradeData}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        label={({ grade, percentage }) => `${grade}: ${percentage.toFixed(1)}%`}
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='count'
                      >
                        {gradeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={
                            entry.grade === 'A' ? '#10b981' :
                            entry.grade === 'B' ? '#3b82f6' :
                            entry.grade === 'C' ? '#f59e0b' :
                            entry.grade === 'D' ? '#f97316' : '#ef4444'
                          } />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 性能建议 */}
          <Card>
            <CardHeader>
              <CardTitle>性能优化建议</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {Object.entries(summary?.categoryScores || {}).map(([category, score]) => {
                  const scoreNum = score as number;
                  const categoryName = getCategoryName(category);
                  let suggestion = '';

                  if (scoreNum >= 90) {
                    suggestion = `${categoryName}性能优秀，继续保持！`;
                  } else if (scoreNum >= 80) {
                    suggestion = `${categoryName}性能良好，可考虑进一步优化。`;
                  } else if (scoreNum >= 70) {
                    suggestion = `${categoryName}性能一般，建议进行优化。`;
                  } else {
                    suggestion = `${categoryName}性能较差，需要重点优化。`;
                  }

                  return (
                    <div key={category} className='border rounded-lg p-4'>
                      <div className='flex items-center gap-2 mb-2'>
                        {getCategoryIcon(category)}
                        <h4 className='font-medium'>{categoryName}</h4>
                        <Badge className={getGradeColor(
                          scoreNum >= 90 ? 'A' :
                          scoreNum >= 80 ? 'B' :
                          scoreNum >= 70 ? 'C' :
                          scoreNum >= 60 ? 'D' : 'F'
                        )}>
                          {scoreNum >= 90 ? 'A' :
                           scoreNum >= 80 ? 'B' :
                           scoreNum >= 70 ? 'C' :
                           scoreNum >= 60 ? 'D' : 'F'}
                        </Badge>
                      </div>
                      <p className='text-sm text-gray-600'>{suggestion}</p>
                      <Progress value={scoreNum} className='w-full mt-2' />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='results' className='space-y-4'>
          {results.length === 0 ? (
            <Card>
              <CardContent className='text-center py-8 text-gray-500'>
                <FileText className='h-12 w-12 mx-auto mb-4 text-gray-300' />
                <p>暂无测试结果</p>
                <p className='text-sm'>运行基准测试以获取性能数据</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>详细测试结果</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>测试名称</TableHead>
                      <TableHead>分类</TableHead>
                      <TableHead>耗时</TableHead>
                      <TableHead>评分</TableHead>
                      <TableHead>等级</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className='font-medium'>{result.name}</TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1'>
                            {getCategoryIcon(result.category)}
                            <span>{getCategoryName(result.category)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDuration(result.duration)}</TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <span className='font-medium'>{Math.round(result.metrics.score)}</span>
                            <Progress value={result.metrics.score} className='w-16' />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getGradeColor(result.metrics.grade)}>
                            {result.metrics.grade} 级
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {result.success ? (
                            <Badge className='bg-green-100 text-green-800'>成功</Badge>
                          ) : (
                            <Badge className='bg-red-100 text-red-800'>失败</Badge>
                          )}
                        </TableCell>
                        <TableCell className='text-sm text-gray-500'>
                          {new Date(result.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='charts' className='space-y-4'>
          {results.length > 0 && (
            <>
              {/* 性能趋势图 */}
              <Card>
                <CardHeader>
                  <CardTitle>性能趋势分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width='100%' height={400}>
                    <LineChart data={results.filter(r => r.success).slice(-20)}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis
                        dataKey='timestamp'
                        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => `时间: ${new Date(value).toLocaleString()}`}
                        formatter={(value: number, name: string) => [
                          name === 'duration' ? formatDuration(value) : Math.round(value),
                          name === 'duration' ? '耗时' : '评分'
                        ]}
                      />
                      <Legend />
                      <Line
                        type='monotone'
                        dataKey='duration'
                        stroke='#ef4444'
                        name='耗时'
                        yAxisId='left'
                      />
                      <Line
                        type='monotone'
                        dataKey={(r) => r.metrics.score}
                        stroke='#10b981'
                        name='评分'
                        yAxisId='right'
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 分类对比图 */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>分类耗时对比</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width='100%' height={300}>
                      <BarChart data={Object.entries(
                        results.reduce((acc, result) => {
                          if (!result.success) return acc;
                          if (!acc[result.category]) {
                            acc[result.category] = { total: 0, count: 0 };
                          }
                          acc[result.category].total += result.duration;
                          acc[result.category].count += 1;
                          return acc;
                        }, {} as Record<string, { total: number; count: number }>)
                      ).map(([category, data]) => ({
                        category: getCategoryName(category),
                        average: data.total / data.count,
                      }))}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='category' />
                        <YAxis />
                        <Tooltip formatter={(value: number) => [formatDuration(value), '平均耗时']} />
                        <Bar dataKey='average' fill='#8884d8' />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>成功 vs 失败</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width='100%' height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: '成功', value: results.filter(r => r.success).length, color: '#10b981' },
                            { name: '失败', value: results.filter(r => !r.success).length, color: '#ef4444' },
                          ]}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill='#8884d8'
                          dataKey='value'
                        >
                          {[
                            { name: '成功', value: results.filter(r => r.success).length },
                            { name: '失败', value: results.filter(r => !r.success).length },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value='comparison' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>性能基准对比</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                {/* 行业基准对比 */}
                <div>
                  <h4 className='font-medium mb-4'>与行业标准对比</h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {Object.entries(summary?.categoryScores || {}).map(([category, score]) => {
                      const scoreNum = score as number;
                      const categoryName = getCategoryName(category);
                      const benchmarks = {
                        'page-load': { good: 90, average: 70, poor: 50 },
                        'api': { good: 85, average: 70, poor: 55 },
                        'render': { good: 80, average: 65, poor: 50 },
                        'memory': { good: 75, average: 60, poor: 45 },
                        'network': { good: 85, average: 70, poor: 55 },
                      };
                      const benchmark = benchmarks[category as keyof typeof benchmarks] || { good: 80, average: 65, poor: 50 };

                      return (
                        <div key={category} className='border rounded-lg p-4'>
                          <h5 className='font-medium mb-3'>{categoryName}</h5>
                          <div className='space-y-2'>
                            <div className='flex justify-between items-center'>
                              <span className='text-sm'>当前评分</span>
                              <Badge className={getGradeColor(
                                scoreNum >= benchmark.good ? 'A' :
                                scoreNum >= benchmark.average ? 'B' :
                                scoreNum >= benchmark.poor ? 'C' : 'D'
                              )}>
                                {Math.round(scoreNum)}
                              </Badge>
                            </div>
                            <div className='flex justify-between items-center'>
                              <span className='text-sm'>优秀基准</span>
                              <span className='text-sm font-medium text-green-600'>{benchmark.good}</span>
                            </div>
                            <div className='flex justify-between items-center'>
                              <span className='text-sm'>平均基准</span>
                              <span className='text-sm font-medium text-yellow-600'>{benchmark.average}</span>
                            </div>
                            <div className='flex justify-between items-center'>
                              <span className='text-sm'>较差基准</span>
                              <span className='text-sm font-medium text-red-600'>{benchmark.poor}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 性能改进建议 */}
                <div>
                  <h4 className='font-medium mb-4'>性能改进建议</h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='border-l-4 border-blue-500 pl-4'>
                      <h5 className='font-medium'>页面加载优化</h5>
                      <ul className='text-sm text-gray-600 mt-2 space-y-1'>
                        <li>• 优化图片和资源加载</li>
                        <li>• 启用浏览器缓存</li>
                        <li>• 使用CDN加速</li>
                        <li>• 实现代码分割</li>
                      </ul>
                    </div>
                    <div className='border-l-4 border-green-500 pl-4'>
                      <h5 className='font-medium'>API性能优化</h5>
                      <ul className='text-sm text-gray-600 mt-2 space-y-1'>
                        <li>• 实现API响应缓存</li>
                        <li>• 优化数据库查询</li>
                        <li>• 使用连接池</li>
                        <li>• 启用压缩传输</li>
                      </ul>
                    </div>
                    <div className='border-l-4 border-yellow-500 pl-4'>
                      <h5 className='font-medium'>渲染性能优化</h5>
                      <ul className='text-sm text-gray-600 mt-2 space-y-1'>
                        <li>• 减少DOM操作</li>
                        <li>• 使用虚拟滚动</li>
                        <li>• 优化CSS选择器</li>
                        <li>• 启用硬件加速</li>
                      </ul>
                    </div>
                    <div className='border-l-4 border-purple-500 pl-4'>
                      <h5 className='font-medium'>内存管理优化</h5>
                      <ul className='text-sm text-gray-600 mt-2 space-y-1'>
                        <li>• 及时清理事件监听器</li>
                        <li>• 避免内存泄漏</li>
                        <li>• 使用对象池</li>
                        <li>• 优化数据结构</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}