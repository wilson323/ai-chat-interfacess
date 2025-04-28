"use client"

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

interface CadHistoryItem {
  id: number;
  agentId: number;
  userId: number;
  fileName: string;
  fileUrl: string;
  analysisResult: string;
  createdAt?: string;
}

export default function CadAnalyzerHistoryPage() {
  const [data, setData] = useState<CadHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [downloadId, setDownloadId] = useState<number | null>(null);
  const [showFormat, setShowFormat] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/cad-history");
      setData(res.data.data);
    } catch {
      toast({ title: "加载失败", description: "请检查网络或稍后重试", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("确定要删除该记录吗？")) return;
    try {
      await axios.delete(`/api/admin/cad-history?id=${id}`);
      setData(data.filter(item => item.id !== id));
      toast({ title: "删除成功" });
    } catch {
      toast({ title: "删除失败", variant: "destructive" });
    }
  };

  const handleDownload = async (id: number, format: string) => {
    setDownloadLoading(true);
    try {
      const res = await fetch(`/api/admin/cad-history/export-single?id=${id}&format=${format}`);
      if (!res.ok) throw new Error("下载失败");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CAD_Report_${id}.${format === "excel" ? "xlsx" : format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: "下载成功", description: `已下载${format.toUpperCase()}报告` });
    } catch {
      toast({ title: "下载失败", variant: "destructive" });
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
      if (!res.ok) throw new Error("导出失败");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CAD_History_Export_${format.toUpperCase()}_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: "导出成功", description: `已下载${format.toUpperCase()}批量报告` });
    } catch {
      toast({ title: "导出失败", variant: "destructive" });
    } finally {
      setExportLoading(false);
      setExportFormat(null);
    }
  };

  return (
    <Card className="max-w-5xl mx-auto mt-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>CAD 智能体历史记录管理</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setExportFormat('show')} className="gap-1">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16" stroke="currentColor"><path d="M8 2v8m0 0l-3-3m3 3l3-3M2 14h12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> 导出全部
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>用户ID</TableHead>
              <TableHead>文件名</TableHead>
              <TableHead>分析结果</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.userId}</TableCell>
                <TableCell><a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{item.fileName}</a></TableCell>
                <TableCell className="max-w-xs truncate" title={item.analysisResult}>{item.analysisResult.slice(0, 40)}...</TableCell>
                <TableCell>{item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}</TableCell>
                <TableCell>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>删除</Button>
                  <Button size="sm" variant="outline" className="ml-2" onClick={() => { setDownloadId(item.id); setShowFormat(true); }}>下载</Button>
                  {showFormat && downloadId === item.id && (
                    <div className="absolute z-10 bg-white border rounded shadow p-2 mt-1 flex flex-col">
                      {['txt','pdf','json','excel'].map(fmt => (
                        <Button key={fmt} size="sm" variant="ghost" className="justify-start" disabled={downloadLoading} onClick={() => handleDownload(item.id, fmt)}>{fmt.toUpperCase()} 报告</Button>
                      ))}
                      <Button size="sm" variant="ghost" className="justify-start text-red-500" onClick={() => setShowFormat(false)}>取消</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {exportFormat === 'show' && (
          <div className="absolute z-10 bg-white border rounded shadow p-2 mt-1 flex flex-col">
            {['txt','pdf','json','excel'].map(fmt => (
              <Button key={fmt} size="sm" variant="ghost" className="justify-start" disabled={exportLoading} onClick={() => handleExport(fmt)}>{fmt.toUpperCase()} 批量导出</Button>
            ))}
            <Button size="sm" variant="ghost" className="justify-start text-red-500" onClick={() => setExportFormat(null)}>取消</Button>
          </div>
        )}
        {loading && <div className="text-center py-4">加载中...</div>}
        {!loading && data.length === 0 && <div className="text-center py-4 text-muted-foreground">暂无数据</div>}
      </CardContent>
    </Card>
  );
} 