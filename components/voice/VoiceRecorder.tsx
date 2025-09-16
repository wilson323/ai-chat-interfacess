/**
 * 语音录制组件
 * 提供语音录制和实时识别功能
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, Square, RotateCcw } from 'lucide-react';
import { useVoiceStore } from '../../lib/voice/store/voice-store';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onTextRecognized?: (text: string) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTextRecognized,
  onError,
  className,
  disabled = false,
}) => {
  const {
    recordingState,
    error,
    isInitialized,
    initialize,
    startRealTimeRecognition,
    stopRealTimeRecognition,
    clearError,
  } = useVoiceStore();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recognizedText, setRecognizedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // 初始化语音服务
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // 监听录音状态变化
  useEffect(() => {
    if (recordingState.isRecording !== isRecording) {
      setIsRecording(recordingState.isRecording);

      if (recordingState.isRecording) {
        startTimeRef.current = Date.now();
        startTimer();
      } else {
        stopTimer();
      }
    }
  }, [recordingState.isRecording, isRecording]);

  // 监听处理状态
  useEffect(() => {
    setIsProcessing(recordingState.isProcessing);
  }, [recordingState.isProcessing]);

  // 监听错误
  useEffect(() => {
    if (error) {
      onError?.(error.message);
    }
  }, [error, onError]);

  // 开始计时器
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setRecordingTime(Math.floor(elapsed / 1000));
    }, 1000);
  };

  // 停止计时器
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // 开始录音
  const handleStartRecording = async () => {
    try {
      clearError();
      setRecognizedText('');
      await startRealTimeRecognition();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : '开始录音失败');
    }
  };

  // 停止录音
  const handleStopRecording = async () => {
    try {
      const result = await stopRealTimeRecognition();
      if (result.text) {
        setRecognizedText(result.text);
        onTextRecognized?.(result.text);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : '停止录音失败');
    }
  };

  // 重新录音
  const handleRetry = () => {
    setRecognizedText('');
    setRecordingTime(0);
    clearError();
  };

  // 清理
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);

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

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardContent className='p-6'>
        <div className='space-y-4'>
          {/* 录音按钮 */}
          <div className='flex justify-center'>
            <Button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={disabled || isProcessing}
              size='lg'
              className={cn(
                'w-20 h-20 rounded-full',
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-primary hover:bg-primary/90'
              )}
              aria-label='record'
            >
              {isRecording ? (
                <Square className='w-8 h-8' />
              ) : (
                <Mic className='w-8 h-8' />
              )}
            </Button>
          </div>

          {/* 录音状态 */}
          <div className='text-center space-y-2'>
            <p className='text-sm text-muted-foreground'>
              {isRecording
                ? '正在录音...'
                : isProcessing
                  ? '处理中...'
                  : '点击开始录音'}
            </p>

            {isRecording && (
              <div className='space-y-2'>
                <div className='flex items-center justify-center space-x-2'>
                  <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse'></div>
                  <span className='text-sm font-mono'>
                    {Math.floor(recordingTime / 60)}:
                    {(recordingTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <Progress
                  value={(recordingTime / 60) * 100}
                  className='w-full'
                />
              </div>
            )}
          </div>

          {/* 识别结果 */}
          {recognizedText && (
            <div className='space-y-2'>
              <div className='p-3 bg-muted rounded-lg'>
                <p className='text-sm text-muted-foreground mb-1'>识别结果：</p>
                <p className='text-sm'>{recognizedText}</p>
              </div>
              <Button
                onClick={handleRetry}
                variant='outline'
                size='sm'
                className='w-full'
              >
                <RotateCcw className='w-4 h-4 mr-2' />
                重新录音
              </Button>
            </div>
          )}

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
