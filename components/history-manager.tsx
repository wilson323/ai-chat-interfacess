'use client';

import type React from 'react';

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { getStorageStats } from '../lib/storage/index';
import { HistoryList } from './history/history-list';

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
  useEffect(() => {
    // 获取存储统计信息
    const stats = getStorageStats();
    console.log('Storage stats:', stats);
  }, [open, onHistoryUpdated]);

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