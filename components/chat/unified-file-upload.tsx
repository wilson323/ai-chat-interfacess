/**
 * 统一文件上传组件
 * 合并FileUploader、shared/file-upload等功能
 */

'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import NextImage from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
// import { Badge } from '../../components/ui/badge'; // 未使用
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  Upload,
  File,
  Image as ImageIcon,
  FileText,
  Music,
  Video,
  Archive,
  X,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// 使用全局类型定义
import type { UploadedFile } from '../../types/chat';

// 文件上传配置
export interface FileUploadConfig {
  maxSize?: number; // 最大文件大小（字节）
  maxFiles?: number; // 最大文件数量
  allowedTypes?: string[]; // 允许的文件类型
  allowedExtensions?: string[]; // 允许的文件扩展名
  enableImagePreview?: boolean; // 是否启用图片预览
  enableProgress?: boolean; // 是否显示上传进度
  enableDragDrop?: boolean; // 是否启用拖拽上传
}

// 统一文件上传组件属性
export interface UnifiedFileUploadProps {
  onFileUpload: (files: File[]) => void;
  onFileRemove?: (fileId: string) => void;
  uploadedFiles?: UploadedFile[];
  config?: FileUploadConfig;
  className?: string;
  disabled?: boolean;
}

// 默认配置
const defaultConfig: FileUploadConfig = {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  allowedTypes: ['image/*', 'application/pdf', 'text/*', 'audio/*', 'video/*'],
  allowedExtensions: [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.pdf',
    '.txt',
    '.mp3',
    '.mp4',
    '.zip',
  ],
  enableImagePreview: true,
  enableProgress: true,
  enableDragDrop: true,
};

// 文件类型图标映射
const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return ImageIcon;
  if (type.startsWith('audio/')) return Music;
  if (type.startsWith('video/')) return Video;
  if (type.includes('pdf')) return FileText;
  if (type.includes('zip') || type.includes('rar')) return Archive;
  return File;
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 验证文件类型
const validateFileType = (file: File, config: FileUploadConfig): boolean => {
  const { allowedTypes, allowedExtensions } = config;

  // 检查MIME类型
  if (allowedTypes && allowedTypes.length > 0) {
    const isAllowedType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });
    if (!isAllowedType) return false;
  }

  // 检查文件扩展名
  if (allowedExtensions && allowedExtensions.length > 0) {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    return allowedExtensions.includes(fileExtension);
  }

  return true;
};

// 验证文件大小
const validateFileSize = (file: File, config: FileUploadConfig): boolean => {
  const { maxSize } = config;
  return !maxSize || file.size <= maxSize;
};

export function UnifiedFileUpload({
  onFileUpload,
  onFileRemove,
  uploadedFiles = [],
  config = {},
  className,
  disabled = false,
}: UnifiedFileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const { t } = useLanguage(); // 未使用

  const finalConfig = useMemo(
    () => ({ ...defaultConfig, ...config }),
    [config]
  );

  // 处理文件选择
  const handleFileSelect = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const errors: string[] = [];
      const validFiles: File[] = [];

      // 检查文件数量限制
      if (finalConfig.maxFiles && fileArray.length > finalConfig.maxFiles) {
        errors.push(`最多只能上传 ${finalConfig.maxFiles} 个文件`);
      }

      // 验证每个文件
      fileArray.forEach((file, _index) => {
        if (!validateFileType(file, finalConfig)) {
          errors.push(`文件 "${file.name}" 类型不支持`);
          return;
        }

        if (!validateFileSize(file, finalConfig)) {
          errors.push(
            `文件 "${file.name}" 大小超过限制 (${formatFileSize(finalConfig.maxSize || 0)})`
          );
          return;
        }

        validFiles.push(file);
      });

      setUploadErrors(errors);

      if (validFiles.length > 0) {
        onFileUpload(validFiles);
      }
    },
    [onFileUpload, finalConfig]
  );

  // 处理文件输入变化
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFileSelect(e.target.files);
      }
    },
    [handleFileSelect]
  );

  // 处理拖拽事件
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled && finalConfig.enableDragDrop) {
        setIsDragOver(true);
      }
    },
    [disabled, finalConfig.enableDragDrop]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled || !finalConfig.enableDragDrop) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files);
      }
    },
    [disabled, finalConfig.enableDragDrop, handleFileSelect]
  );

  // 处理点击上传
  const handleUploadClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  // 处理文件移除
  const handleFileRemove = useCallback(
    (fileId: string) => {
      onFileRemove?.(fileId);
    },
    [onFileRemove]
  );

  // 清除错误
  const clearErrors = useCallback(() => {
    setUploadErrors([]);
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* 错误提示 */}
      {uploadErrors.length > 0 && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            <div className='space-y-1'>
              {uploadErrors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={clearErrors}
              className='mt-2'
            >
              清除错误
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* 上传区域 */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadClick}
      >
        <CardContent className='flex flex-col items-center justify-center p-8 text-center'>
          <Upload className='h-12 w-12 text-muted-foreground mb-4' />
          <h3 className='text-lg font-semibold mb-2'>上传文件</h3>
          <p className='text-sm text-muted-foreground mb-4'>
            拖拽文件到此处或点击选择文件
          </p>
          <div className='text-xs text-muted-foreground space-y-1'>
            <p>
              支持的文件类型:{' '}
              {finalConfig.allowedTypes?.join(', ') || '所有类型'}
            </p>
            <p>最大文件大小: {formatFileSize(finalConfig.maxSize || 0)}</p>
            <p>最大文件数量: {finalConfig.maxFiles || '无限制'}</p>
          </div>
        </CardContent>
      </Card>

      {/* 隐藏的文件输入 */}
      <input
        id='unifiedUploadInput'
        name='unifiedUploadInput'
        ref={fileInputRef}
        type='file'
        multiple
        accept={finalConfig.allowedTypes?.join(',')}
        onChange={handleInputChange}
        className='hidden'
        disabled={disabled}
        aria-label='选择文件'
        autoComplete='off'
      />

      {/* 已上传文件列表 */}
      {uploadedFiles.length > 0 && (
        <div className='space-y-2'>
          <h4 className='text-sm font-medium'>已上传文件</h4>
          <div className='space-y-2'>
            {uploadedFiles.map(file => {
              const Icon = getFileIcon(file.type);
              const isImage = file.type.startsWith('image/');

              return (
                <div
                  key={file.id}
                  className='flex items-center space-x-3 p-3 bg-muted rounded-lg'
                >
                  {/* 文件图标或预览 */}
                  <div className='flex-shrink-0'>
                    {isImage && finalConfig.enableImagePreview ? (
                      <NextImage
                        src={file.url}
                        alt={file.name}
                        width={40}
                        height={40}
                        className='w-10 h-10 object-cover rounded'
                      />
                    ) : (
                      <Icon className='h-10 w-10 text-muted-foreground' />
                    )}
                  </div>

                  {/* 文件信息 */}
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate'>{file.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {formatFileSize(file.size)}
                    </p>

                    {/* 上传进度 */}
                    {file.status === 'uploading' &&
                      finalConfig.enableProgress && (
                        <div className='mt-2'>
                          <Progress
                            value={file.progress || 0}
                            className='h-1'
                          />
                        </div>
                      )}

                    {/* 错误信息 */}
                    {file.status === 'error' && file.error && (
                      <p className='text-xs text-destructive mt-1'>
                        {file.error}
                      </p>
                    )}
                  </div>

                  {/* 状态图标 */}
                  <div className='flex-shrink-0'>
                    {file.status === 'uploading' && (
                      <Loader2 className='h-4 w-4 animate-spin text-blue-500' />
                    )}
                    {file.status === 'completed' && (
                      <Check className='h-4 w-4 text-green-500' />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className='h-4 w-4 text-red-500' />
                    )}
                  </div>

                  {/* 移除按钮 */}
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => handleFileRemove(file.id)}
                    className='h-8 w-8 text-muted-foreground hover:text-destructive'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
