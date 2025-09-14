/**
 * 加载状态组件
 * 基于 shadcn/ui Skeleton 和 Lucide React 的包装组件
 */

'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LoadingStateProps } from './types';

const LoadingState = ({
  type = 'skeleton',
  size = 'default',
  text,
  progress,
  className,
  style,
  ...props
}: LoadingStateProps) => {
  // 获取尺寸样式
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-8 w-8';
      case 'xl':
        return 'h-12 w-12';
      default:
        return 'h-6 w-6';
    }
  };

  // 获取文本尺寸
  const getTextSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
      default:
        return 'text-base';
    }
  };

  // 渲染加载内容
  const renderLoadingContent = () => {
    switch (type) {
      case 'spinner':
        return (
          <div className='flex flex-col items-center justify-center space-y-2'>
            <Loader2 className={cn('animate-spin', getSizeClass())} />
            {text && (
              <p className={cn('text-muted-foreground', getTextSizeClass())}>
                {text}
              </p>
            )}
          </div>
        );

      case 'dots':
        return (
          <div className='flex flex-col items-center justify-center space-y-2'>
            <div className='flex space-x-1'>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={cn(
                    'h-2 w-2 rounded-full bg-primary animate-pulse',
                    size === 'sm' && 'h-1 w-1',
                    size === 'lg' && 'h-3 w-3',
                    size === 'xl' && 'h-4 w-4'
                  )}
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1s',
                  }}
                />
              ))}
            </div>
            {text && (
              <p className={cn('text-muted-foreground', getTextSizeClass())}>
                {text}
              </p>
            )}
          </div>
        );

      case 'progress':
        return (
          <div className='flex flex-col items-center justify-center space-y-2 w-full'>
            <div className='w-full max-w-xs'>
              <Progress value={progress} className='h-2' />
            </div>
            {text && (
              <p className={cn('text-muted-foreground', getTextSizeClass())}>
                {text}
              </p>
            )}
          </div>
        );

      case 'skeleton':
      default:
        return (
          <div className='space-y-2'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-4 w-1/2' />
            <Skeleton className='h-4 w-5/6' />
            {text && (
              <p
                className={cn('text-muted-foreground mt-2', getTextSizeClass())}
              >
                {text}
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <div
      className={cn('flex items-center justify-center p-4', className)}
      style={style}
      {...props}
    >
      {renderLoadingContent()}
    </div>
  );
};

export default LoadingState;
