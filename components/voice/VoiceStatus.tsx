/**
 * 语音状态显示组件
 * 显示录音状态、时长、错误信息等
 */

import React from 'react';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Mic,
  MicOff,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceStatusProps } from '@/types/voice';
import { VoiceWaveform } from './VoiceWaveform';
import { formatDuration } from './hooks/useVoiceRecorder';

/**
 * 主要状态显示组件
 */
export function VoiceStatus({
  isRecording,
  duration,
  audioLevel,
  error,
  maxDuration,
}: VoiceStatusProps) {
  if (error) {
    return <ErrorStatus error={error} />;
  }

  if (isRecording) {
    return (
      <RecordingStatus
        duration={duration}
        audioLevel={audioLevel}
        maxDuration={maxDuration}
      />
    );
  }

  return <IdleStatus />;
}

/**
 * 录音状态组件
 */
function RecordingStatus({
  duration,
  audioLevel,
  maxDuration,
}: {
  duration: number;
  audioLevel: number;
  maxDuration: number;
}) {
  const progress = (duration / maxDuration) * 100;
  const isNearLimit = progress > 80;

  return (
    <div className='flex flex-col items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-lg'>
      {/* 录音指示器 */}
      <div className='flex items-center gap-2'>
        <div className='w-3 h-3 bg-red-500 rounded-full animate-pulse' />
        <span className='text-sm font-medium text-red-700 dark:text-red-300'>
          正在录音
        </span>
      </div>

      {/* 波形显示 */}
      <VoiceWaveform audioLevel={audioLevel} className='text-red-500' />

      {/* 时长显示 */}
      <div className='flex items-center gap-2'>
        <Clock className='h-4 w-4 text-red-600 dark:text-red-400' />
        <span
          className={cn(
            'text-lg font-mono font-bold',
            isNearLimit
              ? 'text-red-600 dark:text-red-400'
              : 'text-red-700 dark:text-red-300'
          )}
        >
          {formatDuration(duration)}
        </span>
      </div>

      {/* 进度条 */}
      <div className='w-full max-w-48'>
        <div className='w-full bg-red-200 dark:bg-red-800/30 rounded-full h-2'>
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-1000',
              isNearLimit ? 'bg-red-600' : 'bg-red-500'
            )}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className='flex justify-between text-xs text-red-600 dark:text-red-400 mt-1'>
          <span>0:00</span>
          <span>{formatDuration(maxDuration)}</span>
        </div>
      </div>

      {/* 提示文本 */}
      <p className='text-xs text-red-600 dark:text-red-400 text-center'>
        {isNearLimit ? '即将达到最大录音时长' : '点击停止按钮结束录音'}
      </p>
    </div>
  );
}

/**
 * 错误状态组件
 */
function ErrorStatus({ error }: { error: string }) {
  return (
    <div className='flex flex-col items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-lg'>
      <div className='flex items-center gap-2'>
        <AlertCircle className='h-5 w-5 text-red-500' />
        <span className='text-sm font-medium text-red-700 dark:text-red-300'>
          录音失败
        </span>
      </div>

      <p className='text-sm text-red-600 dark:text-red-400 text-center'>
        {error}
      </p>
    </div>
  );
}

/**
 * 空闲状态组件
 */
function IdleStatus() {
  return (
    <div className='flex items-center gap-2 p-3 bg-muted/30 rounded-lg'>
      <Mic className='h-4 w-4 text-muted-foreground' />
      <span className='text-sm text-muted-foreground'>点击开始语音输入</span>
    </div>
  );
}

/**
 * 紧凑状态显示组件
 */
export function CompactVoiceStatus({
  isRecording,
  duration,
  audioLevel,
  error,
  className,
}: Omit<VoiceStatusProps, 'maxDuration'> & { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-full text-sm',
        error
          ? 'bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-300'
          : isRecording
            ? 'bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-300'
            : 'bg-muted text-muted-foreground',
        className
      )}
    >
      {error ? (
        <>
          <AlertCircle className='h-4 w-4' />
          <span>错误</span>
        </>
      ) : isRecording ? (
        <>
          <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse' />
          <span>{formatDuration(duration)}</span>
          <VoiceWaveform
            audioLevel={audioLevel}
            bars={3}
            className='text-red-500'
          />
        </>
      ) : (
        <>
          <Mic className='h-4 w-4' />
          <span>语音</span>
        </>
      )}
    </div>
  );
}

/**
 * 处理状态组件
 */
export function ProcessingStatus({
  message = '正在识别语音...',
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-lg',
        className
      )}
    >
      <Loader2 className='h-5 w-5 text-blue-500 animate-spin' />
      <span className='text-sm font-medium text-blue-700 dark:text-blue-300'>
        {message}
      </span>
    </div>
  );
}

/**
 * 成功状态组件
 */
export function SuccessStatus({
  message = '识别成功',
  duration,
  className,
}: {
  message?: string;
  duration?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-lg',
        className
      )}
    >
      <CheckCircle className='h-5 w-5 text-green-500' />
      <div className='flex flex-col'>
        <span className='text-sm font-medium text-green-700 dark:text-green-300'>
          {message}
        </span>
        {duration && (
          <span className='text-xs text-green-600 dark:text-green-400'>
            录音时长: {formatDuration(duration)}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * 权限状态组件
 */
export function PermissionStatus({
  hasPermission,
  onRequestPermission,
  className,
}: {
  hasPermission: boolean;
  onRequestPermission: () => void;
  className?: string;
}) {
  if (hasPermission) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-lg',
          className
        )}
      >
        <CheckCircle className='h-4 w-4 text-green-500' />
        <span className='text-sm text-green-700 dark:text-green-300'>
          麦克风权限已授予
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg',
        className
      )}
    >
      <div className='flex items-center gap-2'>
        <MicOff className='h-5 w-5 text-amber-500' />
        <span className='text-sm font-medium text-amber-700 dark:text-amber-300'>
          需要麦克风权限
        </span>
      </div>

      <p className='text-sm text-amber-600 dark:text-amber-400'>
        请授予麦克风访问权限以使用语音输入功能
      </p>

      <button
        onClick={onRequestPermission}
        className='px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-md transition-colors'
      >
        授予权限
      </button>
    </div>
  );
}

/**
 * 状态指示器组件
 */
export function StatusIndicator({
  status,
  size = 'md',
  className,
}: {
  status: 'idle' | 'recording' | 'processing' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const statusConfig = {
    idle: { color: 'bg-gray-400', animation: '' },
    recording: { color: 'bg-red-500', animation: 'animate-pulse' },
    processing: { color: 'bg-blue-500', animation: 'animate-pulse' },
    error: { color: 'bg-red-500', animation: '' },
    success: { color: 'bg-green-500', animation: '' },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'rounded-full',
        sizeClasses[size],
        config.color,
        config.animation,
        className
      )}
    />
  );
}

/**
 * 状态文本组件
 */
export function StatusText({
  status,
  duration,
  error,
  className,
}: {
  status: 'idle' | 'recording' | 'processing' | 'error' | 'success';
  duration?: number;
  error?: string;
  className?: string;
}) {
  const getText = () => {
    switch (status) {
      case 'recording':
        return `录音中 ${duration ? formatDuration(duration) : ''}`;
      case 'processing':
        return '正在识别...';
      case 'error':
        return error || '发生错误';
      case 'success':
        return '识别成功';
      case 'idle':
      default:
        return '点击开始录音';
    }
  };

  return (
    <span
      className={cn(
        'text-sm',
        status === 'error'
          ? 'text-red-600 dark:text-red-400'
          : status === 'recording'
            ? 'text-red-700 dark:text-red-300'
            : status === 'processing'
              ? 'text-blue-700 dark:text-blue-300'
              : status === 'success'
                ? 'text-green-700 dark:text-green-300'
                : 'text-muted-foreground',
        className
      )}
    >
      {getText()}
    </span>
  );
}
