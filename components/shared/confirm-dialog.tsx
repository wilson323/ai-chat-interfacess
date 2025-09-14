/**
 * 确认对话框组件
 * 基于 shadcn/ui AlertDialog 的包装组件
 */

'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ConfirmDialogProps } from './types';

const ConfirmDialog = ({
  open,
  onOpenChange,
  title = '确认操作',
  description = '此操作不可撤销，确定要继续吗？',
  confirmText = '确认',
  cancelText = '取消',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
  className,
  ...props
}: ConfirmDialogProps) => {
  // 处理确认
  const handleConfirm = async () => {
    if (loading) return;

    try {
      if (onConfirm) {
        await onConfirm();
      }
      onOpenChange?.(false);
    } catch (error) {
      console.error('确认操作失败:', error);
    }
  };

  // 处理取消
  const handleCancel = () => {
    if (loading) return;

    if (onCancel) {
      onCancel();
    }
    onOpenChange?.(false);
  };

  // 获取确认按钮样式
  const getConfirmButtonVariant = () => {
    switch (variant) {
      case 'destructive':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn('max-w-md', className)} {...props}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className='text-left'>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant='outline' onClick={handleCancel} disabled={loading}>
              {cancelText}
            </Button>
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button
              variant={getConfirmButtonVariant()}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? '处理中...' : confirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;
