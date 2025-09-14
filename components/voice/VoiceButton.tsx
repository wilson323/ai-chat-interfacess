/**
 * 语音按钮组件
 * 现代化的语音输入按钮，支持多种状态和样式
 */

import React from 'react';
import { Mic, MicOff, Loader2, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VoiceButtonProps } from '@/types/voice';

/**
 * 语音按钮组件
 */
export function VoiceButton({
  isRecording,
  isProcessing,
  isEnabled,
  onToggle,
  size = 'md',
  variant = 'default',
  className,
}: VoiceButtonProps) {
  // 尺寸映射
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-12 w-12',
  };

  // 图标尺寸映射
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  // 获取按钮状态样式
  const getButtonStyles = () => {
    if (!isEnabled) {
      return 'opacity-50 cursor-not-allowed';
    }

    if (isRecording) {
      return cn(
        'bg-red-500 hover:bg-red-600 text-white',
        'animate-pulse shadow-lg shadow-red-500/25',
        'border-2 border-red-300'
      );
    }

    if (isProcessing) {
      return cn(
        'bg-blue-500 hover:bg-blue-600 text-white',
        'shadow-lg shadow-blue-500/25'
      );
    }

    switch (variant) {
      case 'minimal':
        return cn(
          'bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground',
          'border border-border hover:border-primary/50'
        );

      default:
        return cn(
          'bg-primary hover:bg-primary/90 text-primary-foreground',
          'shadow-md hover:shadow-lg transition-all duration-200'
        );
    }
  };

  // 获取图标
  const getIcon = () => {
    if (isProcessing) {
      return <Loader2 className={cn(iconSizes[size], 'animate-spin')} />;
    }

    if (isRecording) {
      return <Square className={cn(iconSizes[size], 'fill-current')} />;
    }

    if (!isEnabled) {
      return <MicOff className={iconSizes[size]} />;
    }

    return <Mic className={iconSizes[size]} />;
  };

  // 获取提示文本
  const getTooltipText = () => {
    if (!isEnabled) {
      return '语音功能不可用';
    }

    if (isProcessing) {
      return '正在识别...';
    }

    if (isRecording) {
      return '点击停止录音';
    }

    return '点击开始语音输入';
  };

  return (
    <Button
      variant='ghost'
      size='icon'
      className={cn(
        sizeClasses[size],
        'shrink-0 rounded-full relative transition-all duration-200',
        getButtonStyles(),
        className
      )}
      onClick={onToggle}
      disabled={!isEnabled || isProcessing}
      title={getTooltipText()}
      aria-label={getTooltipText()}
    >
      {getIcon()}

      {/* 录音时的脉冲动画环 */}
      {isRecording && (
        <div className='absolute inset-0 rounded-full bg-red-500/20 animate-ping' />
      )}

      {/* 处理时的旋转环 */}
      {isProcessing && (
        <div className='absolute inset-0 rounded-full border-2 border-blue-300 border-t-transparent animate-spin' />
      )}
    </Button>
  );
}

/**
 * 浮动语音按钮组件
 * 用于固定位置的语音输入
 */
export function FloatingVoiceButton({
  isRecording,
  isProcessing,
  isEnabled,
  onToggle,
  className,
}: Omit<VoiceButtonProps, 'size' | 'variant'>) {
  return (
    <div className={cn('fixed bottom-6 right-6 z-50', className)}>
      <VoiceButton
        isRecording={isRecording}
        isProcessing={isProcessing}
        isEnabled={isEnabled}
        onToggle={onToggle}
        size='lg'
        variant='default'
        className={cn(
          'shadow-2xl hover:scale-110 transition-transform duration-200',
          isRecording && 'scale-110'
        )}
      />
    </div>
  );
}

/**
 * 语音按钮组（包含状态指示器）
 */
export function VoiceButtonGroup({
  isRecording,
  isProcessing,
  isEnabled,
  onToggle,
  showStatus = true,
  size = 'md',
  className,
}: VoiceButtonProps & {
  showStatus?: boolean;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <VoiceButton
        isRecording={isRecording}
        isProcessing={isProcessing}
        isEnabled={isEnabled}
        onToggle={onToggle}
        size={size}
      />

      {showStatus && (
        <div className='flex flex-col'>
          {/* 状态文本 */}
          <span className='text-xs text-muted-foreground'>
            {isProcessing
              ? '识别中...'
              : isRecording
                ? '录音中'
                : isEnabled
                  ? '语音输入'
                  : '不可用'}
          </span>

          {/* 状态指示器 */}
          <div className='flex items-center gap-1 mt-1'>
            <div
              className={cn(
                'w-2 h-2 rounded-full transition-colors duration-200',
                isRecording
                  ? 'bg-red-500 animate-pulse'
                  : isProcessing
                    ? 'bg-blue-500 animate-pulse'
                    : isEnabled
                      ? 'bg-green-500'
                      : 'bg-gray-400'
              )}
            />
            <span className='text-xs text-muted-foreground'>
              {isRecording
                ? 'REC'
                : isProcessing
                  ? 'PROC'
                  : isEnabled
                    ? 'READY'
                    : 'OFF'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 紧凑型语音按钮
 * 用于空间受限的场景
 */
export function CompactVoiceButton({
  isRecording,
  isProcessing,
  isEnabled,
  onToggle,
  className,
}: Omit<VoiceButtonProps, 'size' | 'variant'>) {
  return (
    <button
      className={cn(
        'relative p-2 rounded-full transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary/50',
        isRecording
          ? 'bg-red-500 text-white animate-pulse'
          : isProcessing
            ? 'bg-blue-500 text-white'
            : isEnabled
              ? 'bg-muted hover:bg-muted/80 text-foreground'
              : 'bg-muted/50 text-muted-foreground cursor-not-allowed',
        className
      )}
      onClick={onToggle}
      disabled={!isEnabled || isProcessing}
      title={isRecording ? '停止录音' : '开始录音'}
    >
      {isProcessing ? (
        <Loader2 className='h-4 w-4 animate-spin' />
      ) : isRecording ? (
        <Square className='h-4 w-4 fill-current' />
      ) : isEnabled ? (
        <Mic className='h-4 w-4' />
      ) : (
        <MicOff className='h-4 w-4' />
      )}

      {/* 状态指示器 */}
      <div
        className={cn(
          'absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background',
          isRecording
            ? 'bg-red-500 animate-pulse'
            : isProcessing
              ? 'bg-blue-500 animate-pulse'
              : isEnabled
                ? 'bg-green-500'
                : 'bg-gray-400'
        )}
      />
    </button>
  );
}

/**
 * 语音按钮工具函数
 */
export const VoiceButtonUtils = {
  /**
   * 获取按钮状态描述
   */
  getStateDescription(
    isRecording: boolean,
    isProcessing: boolean,
    isEnabled: boolean
  ): string {
    if (!isEnabled) return '语音功能不可用';
    if (isProcessing) return '正在识别语音...';
    if (isRecording) return '正在录音，点击停止';
    return '点击开始语音输入';
  },

  /**
   * 获取按钮颜色主题
   */
  getColorTheme(
    isRecording: boolean,
    isProcessing: boolean,
    isEnabled: boolean
  ) {
    if (!isEnabled) return 'gray';
    if (isRecording) return 'red';
    if (isProcessing) return 'blue';
    return 'primary';
  },

  /**
   * 检查按钮是否应该显示动画
   */
  shouldAnimate(isRecording: boolean, isProcessing: boolean): boolean {
    return isRecording || isProcessing;
  },
};
