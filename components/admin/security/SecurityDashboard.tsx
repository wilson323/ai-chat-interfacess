'use client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  SecurityScanResult
} from '@/lib/security/security-scanner';
import { logger } from '@/lib/utils/logger';
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Eye,
  FileText,
  RefreshCw,
  Shield,
  XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

export function SecurityDashboard() {
  const [scanResult, setScanResult] = useState<SecurityScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // 执行安全扫描
  const runSecurityScan = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/security/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scanType: 'full',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setScanResult(data.data);
      } else {
        logger.error('安全扫描失败:', data.error);
      }
    } catch (error) {
      logger.error('安全扫描请求失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取扫描历史
  const fetchScanHistory = async () => {
    try {
      const response = await fetch('/api/admin/security/scan');
      const data = await response.json();
      if (data.success) {
        setScanHistory(data.data);
      }
    } catch (error) {
      logger.error('获取扫描历史失败:', error);
    }
  };

  useEffect(() => {
    fetchScanHistory();
  }, []);

  // 获取严重程度颜色
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 获取安全等级颜色
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-green-600';
      case 'B':
        return 'text-blue-600';
      case 'C':
        return 'text-yellow-600';
      case 'D':
        return 'text-orange-600';
      case 'F':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // 导出扫描报告
  const exportReport = () => {
    if (!scanResult) return;

    const report = {
      ...scanResult,
      exportedAt: new Date().toISOString(),
      exportedBy: 'admin',
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className='space-y-6'>
      {/* 页面头部 */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>安全监控面板</h1>
          <p className='text-gray-600 mt-2'>安全漏洞扫描和加固管理</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button onClick={runSecurityScan} disabled={loading} size='sm'>
            {loading ? (
              <>
                <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                扫描中...
              </>
            ) : (
              <>
                <Shield className='h-4 w-4 mr-2' />
                执行扫描
              </>
            )}
          </Button>
          {scanResult && (
            <Button variant='outline' onClick={exportReport} size='sm'>
              <Download className='h-4 w-4 mr-2' />
              导出报告
            </Button>
          )}
        </div>
      </div>

      {/* 安全状态概览 */}
      {scanResult && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>安全评分</p>
                  <p
                    className={`text-3xl font-bold ${getGradeColor(scanResult.summary.grade)}`}
                  >
                    {scanResult.summary.score}
                  </p>
                  <p className='text-sm text-gray-500'>
                    等级: {scanResult.summary.grade}
                  </p>
                </div>
                <Shield className='h-8 w-8 text-blue-600' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>总问题数</p>
                  <p className='text-3xl font-bold'>{scanResult.totalIssues}</p>
                </div>
                <FileText className='h-8 w-8 text-gray-600' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>关键漏洞</p>
                  <p className='text-3xl font-bold text-red-600'>
                    {scanResult.criticalIssues}
                  </p>
                </div>
                <XCircle className='h-8 w-8 text-red-600' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    高风险问题
                  </p>
                  <p className='text-3xl font-bold text-orange-600'>
                    {scanResult.highIssues}
                  </p>
                </div>
                <AlertTriangle className='h-8 w-8 text-orange-600' />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 安全建议 */}
      {scanResult && scanResult.summary.recommendations.length > 0 && (
        <Alert>
          <Shield className='h-4 w-4' />
          <AlertTitle>安全建议</AlertTitle>
          <AlertDescription>
            <ul className='mt-2 space-y-1'>
              {scanResult.summary.recommendations
                .slice(0, 3)
                .map((rec: string, index: number) => (
                  <li key={index} className='text-sm'>
                    • {rec}
                  </li>
                ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* 详细扫描结果 */}
      {scanResult && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='overview'>概览</TabsTrigger>
            <TabsTrigger value='issues'>问题详情</TabsTrigger>
            <TabsTrigger value='history'>扫描历史</TabsTrigger>
            <TabsTrigger value='recommendations'>修复建议</TabsTrigger>
          </TabsList>

          {/* 概览标签页 */}
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <AlertTriangle className='h-5 w-5' />
                    问题分布
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm'>关键漏洞</span>
                      <Badge className='bg-red-100 text-red-800'>
                        {scanResult.criticalIssues}
                      </Badge>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm'>高风险问题</span>
                      <Badge className='bg-orange-100 text-orange-800'>
                        {scanResult.highIssues}
                      </Badge>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm'>中风险问题</span>
                      <Badge className='bg-yellow-100 text-yellow-800'>
                        {scanResult.mediumIssues}
                      </Badge>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm'>低风险问题</span>
                      <Badge className='bg-blue-100 text-blue-800'>
                        {scanResult.lowIssues}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <CheckCircle className='h-5 w-5' />
                    安全等级
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-center'>
                    <div
                      className={`text-6xl font-bold ${getGradeColor(scanResult.summary.grade)}`}
                    >
                      {scanResult.summary.grade}
                    </div>
                    <p className='text-2xl font-semibold mt-2'>
                      {scanResult.summary.score}/100
                    </p>
                    <p className='text-sm text-gray-600 mt-2'>
                      {scanResult.summary.grade === 'A' &&
                        '优秀 - 安全状况良好'}
                      {scanResult.summary.grade === 'B' &&
                        '良好 - 存在少量问题'}
                      {scanResult.summary.grade === 'C' && '一般 - 需要改进'}
                      {scanResult.summary.grade === 'D' &&
                        '较差 - 存在较多问题'}
                      {scanResult.summary.grade === 'F' &&
                        '危险 - 存在严重安全问题'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 问题详情标签页 */}
          <TabsContent value='issues' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>安全问题详情</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>严重程度</TableHead>
                      <TableHead>问题类型</TableHead>
                      <TableHead>文件</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scanResult.issues.map((issue: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge className={getSeverityColor(issue.severity)}>
                            {issue.severity.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className='font-medium'>
                          {issue.title}
                        </TableCell>
                        <TableCell className='text-sm text-gray-600'>
                          {issue.file || 'N/A'}
                        </TableCell>
                        <TableCell className='text-sm'>
                          {issue.description.length > 100
                            ? `${issue.description.substring(0, 100)}...`
                            : issue.description}
                        </TableCell>
                        <TableCell>
                          <Button variant='ghost' size='sm'>
                            <Eye className='h-4 w-4' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 扫描历史标签页 */}
          <TabsContent value='history' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>扫描历史</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>扫描时间</TableHead>
                      <TableHead>总问题数</TableHead>
                      <TableHead>关键漏洞</TableHead>
                      <TableHead>安全评分</TableHead>
                      <TableHead>等级</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scanHistory.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell className='text-sm'>
                          {new Date(record.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>{record.totalIssues}</TableCell>
                        <TableCell>
                          <Badge className='bg-red-100 text-red-800'>
                            {record.criticalIssues}
                          </Badge>
                        </TableCell>
                        <TableCell className='font-medium'>
                          {record.score}
                        </TableCell>
                        <TableCell>
                          <Badge className={getGradeColor(record.grade)}>
                            {record.grade}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 修复建议标签页 */}
          <TabsContent value='recommendations' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>修复建议</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {scanResult.summary.recommendations.map(
                    (recommendation: string, index: number) => (
                      <div
                        key={index}
                        className='flex items-start gap-3 p-4 border rounded-lg'
                      >
                        <CheckCircle className='h-5 w-5 text-green-600 mt-0.5 flex-shrink-0' />
                        <div>
                          <p className='text-sm font-medium'>
                            {recommendation}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* 无扫描结果时的提示 */}
      {!scanResult && (
        <Card>
          <CardContent className='text-center py-12'>
            <Shield className='h-12 w-12 mx-auto text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              开始安全扫描
            </h3>
            <p className='text-gray-600 mb-4'>
              点击下方按钮开始扫描代码中的安全漏洞
            </p>
            <Button onClick={runSecurityScan} disabled={loading}>
              {loading ? '扫描中...' : '开始扫描'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
