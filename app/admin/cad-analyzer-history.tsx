'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast/use-toast';
import { Input } from '@/components/ui/input';
import { Search, Download, Eye, Trash2, FileText } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AgentProvider } from '@/context/agent-context';
import { LanguageProvider } from '@/context/language-context';
import Link from 'next/link';

interface CadHistoryItem {
  id: number;
  agentId: number;
  userId: number;
  fileName: string;
  fileUrl: string;
  analysisResult: string;
  createdAt?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
}

export default function CadAnalyzerHistoryPage() {
  const [data, setData] = useState<CadHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [downloadId, setDownloadId] = useState<number | null>(null);
  const [showFormat, setShowFormat] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const res = await fetch(`/api/admin/cad-history?${params}`);
      const result = await res.json();

      if (result.code === 0) {
        setData(result.data || []);
        // 如果后端不支持分页，设置默认页数
        setTotalPages(Math.ceil((result.data?.length || 0) / 20) || 1);
      } else {
        toast({
          title: '加载失败',
          description: result.message || '请检查网络或稍后重试',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: '加载失败',
        description: '请检查网络或稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这条记录吗？')) return;

    try {
      const res = await fetch(`/api/admin/cad-history?id=${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();

      if (result.code === 0) {
        toast({
          title: '删除成功',
          description: '记录已删除',
        });
        fetchData();
      } else {
        toast({
          title: '删除失败',
          description: result.message || '删除失败',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: '删除失败',
        description: '网络错误',
        variant: 'destructive',
      });
    }
  };

  const handleViewFile = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  const handleDownload = async (id: number, format: string) => {
    setDownloadLoading(true);
    try {
      const res = await fetch(
        `/api/admin/cad-history/export-single?id=${id}&format=${format}`
      );
      if (!res.ok) throw new Error('下载失败');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CAD_Report_${id}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({
        title: '下载成功',
        description: `已下载${format.toUpperCase()}报告`,
      });
    } catch {
      toast({ title: '下载失败', variant: 'destructive' });
    } finally {
      setDownloadLoading(false);
      setDownloadId(null);
      setShowFormat(false);
    }
  };

  const handleExport = async (format: string) => {
    setExportLoading(true);
    try {
      const res = await fetch(`/api/admin/cad-history/export?format=${format}`);
      if (!res.ok) throw new Error('导出失败');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CAD_History_Export_${format.toUpperCase()}_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({
        title: '导出成功',
        description: `已下载${format.toUpperCase()}批量报告`,
      });
    } catch {
      toast({ title: '导出失败', variant: 'destructive' });
    } finally {
      setExportLoading(false);
      setExportFormat(null);
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusConfig = {
      pending: { label: '待处理', variant: 'secondary' as const },
      processing: { label: '处理中', variant: 'default' as const },
      completed: { label: '已完成', variant: 'default' as const },
      failed: { label: '失败', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredData = data.filter(item => {
    const matchesSearch = !searchTerm ||
      item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.analysisResult.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <LanguageProvider>
      <AgentProvider>
        <div className="max-w-6xl mx-auto mb-4">
          <Link
            href="/admin"
            className="text-pantone369-500 hover:text-pantone369-600 flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7"></path>
              <path d="M19 12H5"></path>
            </svg>
            返回管理员首页
          </Link>
        </div>

        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-pantone369-500"
              >
                <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z"></path>
                <path d="M12 17v-6"></path>
                <path d="M10 14l2 3 2-3"></path>
              </svg>
              CAD 智能体历史记录
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 搜索和筛选 */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索文件名或分析结果..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待处理</SelectItem>
                  <SelectItem value="processing">处理中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchData} disabled={loading}>
                {loading ? '加载中...' : '刷新'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setExportFormat('show')}
                disabled={exportLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                批量导出
              </Button>
            </div>

            {/* 数据表格 */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>文件名</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>用户ID</TableHead>
                    <TableHead>分析结果</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        加载中...
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.fileName}</div>
                            <div className="text-sm text-gray-500">
                              ID: {item.id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm">{item.userId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm max-w-xs truncate" title={item.analysisResult}>
                            {item.analysisResult}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString('zh-CN')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {item.fileUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewFile(item.fileUrl)}
                                title="查看文件"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setDownloadId(item.id);
                                setShowFormat(true);
                              }}
                              title="下载报告"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(item.id)}
                              title="删除"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {showFormat && downloadId === item.id && (
                            <div className="absolute z-10 bg-white border rounded shadow-lg p-2 mt-1 min-w-[120px]">
                              {['txt', 'pdf', 'json', 'excel'].map((fmt) => (
                                <Button
                                  key={fmt}
                                  size="sm"
                                  variant="ghost"
                                  className="justify-start w-full"
                                  disabled={downloadLoading}
                                  onClick={() => handleDownload(item.id, fmt)}
                                >
                                  {fmt.toUpperCase()}
                                </Button>
                              ))}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="justify-start w-full text-red-500"
                                onClick={() => setShowFormat(false)}
                              >
                                取消
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
                <span className="flex items-center px-4">
                  第 {currentPage} 页，共 {totalPages} 页
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  下一页
                </Button>
              </div>
            )}

            {/* 批量导出菜单 */}
            {exportFormat === 'show' && (
              <div className="absolute z-10 bg-white border rounded shadow-lg p-2 mt-1">
                {['txt', 'pdf', 'json', 'excel'].map((fmt) => (
                  <Button
                    key={fmt}
                    size="sm"
                    variant="ghost"
                    className="justify-start w-full"
                    disabled={exportLoading}
                    onClick={() => handleExport(fmt)}
                  >
                    {fmt.toUpperCase()} 批量导出
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="ghost"
                  className="justify-start w-full text-red-500"
                  onClick={() => setExportFormat(null)}
                >
                  取消
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </AgentProvider>
    </LanguageProvider>
  );
}
