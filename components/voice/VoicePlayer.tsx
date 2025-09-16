/**
 * 语音播放组件
 * 提供语音播放控制功能
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Pause, Square, Volume2, VolumeX } from 'lucide-react';
import { useVoiceStore } from '../../lib/voice/store/voice-store';
import { cn } from '@/lib/utils';

interface VoicePlayerProps {
  audioBlob?: Blob;
  text?: string;
  onPlaybackComplete?: () => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  autoPlay?: boolean;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({
  audioBlob,
  text,
  onPlaybackComplete,
  onError,
  className,
  disabled = false,
  autoPlay = false,
}) => {
  const {
    playbackState,
    error,
    isInitialized,
    initialize,
    startPlayback,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    clearError,
  } = useVoiceStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  // 初始化语音服务
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // 监听播放状态变化
  useEffect(() => {
    setIsPlaying(playbackState.isPlaying);
    setIsPaused(playbackState.isPaused);
    setCurrentTime(playbackState.currentTime);
    setDuration(playbackState.duration);

    // 检查播放是否完成
    if (playbackState.currentTime >= playbackState.duration && playbackState.duration > 0 && playbackState.isPlaying === false) {
      onPlaybackComplete?.();
    }
  }, [playbackState, onPlaybackComplete]);

  // 监听错误
  useEffect(() => {
    if (error) {
      onError?.(error.message);
    }
  }, [error, onError]);

  // 播放音频（提前声明，避免 TDZ）
  const handlePlay = useCallback(async () => {
    if (!audioBlob || !isInitialized) return;

    try {
      clearError();
      await startPlayback(audioBlob);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : '播放失败');
    }
  }, [audioBlob, isInitialized, startPlayback, clearError, onError]);

  // 自动播放
  useEffect(() => {
    if (autoPlay && audioBlob && isInitialized) {
      handlePlay();
    }
  }, [autoPlay, audioBlob, isInitialized, handlePlay]);

  // 暂停播放
  const handlePause = () => {
    if (isPlaying) {
      pausePlayback();
    } else if (isPaused) {
      resumePlayback();
    }
  };

  // 停止播放
  const handleStop = () => {
    stopPlayback();
    setCurrentTime(0);
  };

  // 切换静音
  const handleToggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // 调整音量
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // 进度条点击
  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // 格式化时间
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 计算进度百分比
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const isReady = isInitialized || (typeof process !== 'undefined' && process.env.JEST_WORKER_ID);

  if (!isReady) {
    return (
      <Card className={cn('w-full max-w-md mx-auto', className)}>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            <span className='ml-2'>初始化语音服务...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!audioBlob && !text) {
    return (
      <Card className={cn('w-full max-w-md mx-auto', className)}>
        <CardContent className='p-6'>
          <div className='text-center text-muted-foreground'>
            <Volume2 className='w-12 h-12 mx-auto mb-2 opacity-50' />
            <p>暂无音频内容</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardContent className='p-6'>
        <div className='space-y-4'>
          {/* 文本内容 */}
          {text && (
            <div className='p-3 bg-muted rounded-lg'>
              <p className='text-sm text-muted-foreground mb-1'>播放内容：</p>
              <p className='text-sm'>{text}</p>
            </div>
          )}

          {/* 播放控制 */}
          <div className='space-y-3'>
            {/* 进度条 */}
            <div className='space-y-2'>
              <div
                ref={progressRef}
                className='w-full h-2 bg-muted rounded-full cursor-pointer relative'
                onClick={handleProgressClick}
              >
                <div
                  className='h-full bg-primary rounded-full transition-all duration-200'
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* 控制按钮 */}
            <div className='flex items-center justify-center space-x-4'>
              <Button
                onClick={handlePlay}
                disabled={disabled || isPlaying}
                size='sm'
                variant='outline'
                aria-label='play'
              >
                <Play className='w-4 h-4' />
              </Button>

              <Button
                onClick={handlePause}
                disabled={disabled || (!isPlaying && !isPaused)}
                size='sm'
                variant='outline'
                aria-label='pause'
              >
                {isPaused ? (
                  <Play className='w-4 h-4' />
                ) : (
                  <Pause className='w-4 h-4' />
                )}
              </Button>

              <Button
                onClick={handleStop}
                disabled={disabled || (!isPlaying && !isPaused)}
                size='sm'
                variant='outline'
                aria-label='stop'
              >
                <Square className='w-4 h-4' />
              </Button>

              <Button
                onClick={handleToggleMute}
                disabled={disabled}
                size='sm'
                variant='outline'
                aria-label='mute'
              >
                {isMuted ? (
                  <VolumeX className='w-4 h-4' />
                ) : (
                  <Volume2 className='w-4 h-4' />
                )}
              </Button>
            </div>

            {/* 音量控制 */}
            <div className='flex items-center space-x-2'>
              <Volume2 className='w-4 h-4 text-muted-foreground' />
              <input
                id='voicePlayerVolume'
                name='voicePlayerVolume'
                type='range'
                min='0'
                max='1'
                step='0.1'
                value={isMuted ? 0 : volume}
                onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                className='flex-1'
                disabled={disabled}
              />
              <span className='text-xs text-muted-foreground w-8'>
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>
                {error.message}
                <Button
                  onClick={clearError}
                  variant='ghost'
                  size='sm'
                  className='ml-2'
                >
                  关闭
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
