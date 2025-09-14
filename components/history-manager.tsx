'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Trash2,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast/use-toast';
import { useLanguage } from '@/context/language-context';
import {
  clearAllChatSessions,
  exportAllChatSessions,
  importChatSessions,
  getStorageStats,
  rebuildChatIndex,
} from '@/lib/storage/index';
import { HistoryList } from '@/components/history/history-list';

interface HistoryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHistoryUpdated?: () => void;
}

export function HistoryManager({
  open,
  onOpenChange,
  onHistoryUpdated,
}: HistoryManagerProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('manage');
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [storageStats, setStorageStats] = useState({
    totalSizeMB: 0,
    maxSizeMB: 0,
    usagePercent: 0,
    chatCount: 0,
  });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    // 获取存储统计信息
    const stats = getStorageStats();
    setStorageStats(stats);
  }, [open]);

  const handleClearAllHistory = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    try {
      const success = clearAllChatSessions();
      if (success) {
        toast({
          title: '已清除所有历史记录',
          description: '所有聊天历史记录已被删除',
        });
        setStorageStats({
          totalSizeMB: 0,
          maxSizeMB: storageStats.maxSizeMB,
          usagePercent: 0,
          chatCount: 0,
        });
        if (onHistoryUpdated) {
          onHistoryUpdated();
        }
      } else {
        throw new Error('Failed to clear history');
      }
    } catch (error) {
      console.error('Failed to clear history:', error);
      toast({
        title: '清除失败',
        description: '无法清除历史记录，请稍后再试',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleExportHistory = () => {
    try {
      const jsonData = exportAllChatSessions();
      if (!jsonData) {
        throw new Error('No data to export');
      }

      // 创建下载链接
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat_history_export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: '导出成功',
        description: '聊天历史记录已导出为JSON文件',
      });
    } catch (error) {
      console.error('Failed to export history:', error);
      toast({
        title: '导出失败',
        description: '无法导出历史记录，请稍后再试',
        variant: 'destructive',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };

  const handleImportHistory = async () => {
    if (!importFile) {
      toast({
        title: '请选择文件',
        description: '请先选择要导入的JSON文件',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    try {
      const fileContent = await importFile.text();
      const success = importChatSessions(fileContent);
      if (success) {
        toast({
          title: '导入成功',
          description: '聊天历史记录已成功导入',
        });
        // 更新存储统计信息
        const stats = getStorageStats();
        setStorageStats(stats);
        if (onHistoryUpdated) {
          onHistoryUpdated();
        }
      } else {
        throw new Error('Failed to import history');
      }
    } catch (error) {
      console.error('Failed to import history:', error);
      toast({
        title: '导入失败',
        description: '无法导入历史记录，请确保文件格式正确',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      setImportFile(null);
      // 重置文件输入
      const fileInput = document.getElementById(
        'import-file'
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const handleRebuildIndex = () => {
    try {
      rebuildChatIndex();
      toast({
        title: '索引重建成功',
        description: '聊天历史索引已重建',
      });
      // 更新存储统计信息
      const stats = getStorageStats();
      setStorageStats(stats);
      if (onHistoryUpdated) {
        onHistoryUpdated();
      }
    } catch (error) {
      console.error('Failed to rebuild index:', error);
      toast({
        title: '索引重建失败',
        description: '无法重建聊天历史索引',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>历史记录管理</DialogTitle>
          <DialogDescription>
            管理您的聊天历史记录，包括导出、导入和清除
          </DialogDescription>
        </DialogHeader>
        <HistoryList onSelect={() => {}} viewType='dialog' />
      </DialogContent>
    </Dialog>
  );
}
