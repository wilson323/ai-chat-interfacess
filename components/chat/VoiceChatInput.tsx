/**
 * 集成语音功能的聊天输入组件
 * 基于ChatInput扩展，添加语音录制和播放功能
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Paperclip,
  Mic,
  MicOff,
  Send,
  FileText,
  X,
  Volume2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceRecorder, VoicePlayer } from '../voice';
import { useVoiceStore } from '../../lib/voice/store/voice-store';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface VoiceChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFileUpload?: (files: File[]) => void;
  uploadedFiles: UploadedFile[];
  onRemoveFile?: (fileId: string) => void;
  isSending?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  enableVoice?: boolean;
  enableTTS?: boolean;
  onVoiceTextRecognized?: (text: string) => void;
  onTTSRequest?: (text: string) => void;
}

export function VoiceChatInput({
  value,
  onChange,
  onSend,
  onFileUpload,
  uploadedFiles,
  onRemoveFile,
  isSending = false,
  disabled = false,
  placeholder = '输入消息...',
  maxLength = 4000,
  className,
  enableVoice = true,
  enableTTS = true,
  onVoiceTextRecognized,
  onTTSRequest,
}: VoiceChatInputProps) {
  const [isComposing, setIsComposing] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showVoicePlayer, setShowVoicePlayer] = useState(false);
  const [ttsText, setTtsText] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    recordingState,
    isInitialized,
    initialize,
    startRecording,
    stopRecording,
    clearError,
  } = useVoiceStore();

  // 初始化语音服务
  useEffect(() => {
    if (!isInitialized && enableVoice) {
      initialize();
    }
  }, [isInitialized, initialize, enableVoice]);

  // 监听录音状态
  useEffect(() => {
    if (recordingState.isRecording) {
      setShowVoiceRecorder(true);
    }
  }, [recordingState.isRecording]);

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      if (value.trim() && !isSending) {
        onSend();
      }
    }
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && onFileUpload) {
      onFileUpload(files);
    }
  };

  // 处理语音录制开始
  const handleVoiceStart = async () => {
    try {
      setVoiceError(null);
      await startRecording();
    } catch (error) {
      setVoiceError(error instanceof Error ? error.message : '开始录音失败');
    }
  };

  // 处理语音录制停止
  const handleVoiceStop = async () => {
    try {
      await stopRecording();
      setShowVoiceRecorder(false);
    } catch (error) {
      setVoiceError(error instanceof Error ? error.message : '停止录音失败');
    }
  };

  // 处理语音识别结果
  const handleVoiceTextRecognized = (text: string) => {
    onChange(text);
    onVoiceTextRecognized?.(text);
    setShowVoiceRecorder(false);
  };

  // 处理语音识别错误
  const handleVoiceError = (error: string) => {
    setVoiceError(error);
  };

  // 处理发送
  const handleSend = () => {
    if (value.trim() && !isSending) {
      onSend();
    }
  };

  // 处理TTS请求
  const handleTTSRequest = async (text: string) => {
    if (!enableTTS || !isInitialized) return;

    try {
      setTtsText(text);
      setShowVoicePlayer(true);
      onTTSRequest?.(text);
    } catch (error) {
      setVoiceError(error instanceof Error ? error.message : '语音合成失败');
    }
  };

  // 处理语音播放完成
  const handlePlaybackComplete = () => {
    setShowVoicePlayer(false);
    setTtsText('');
  };

  // 处理语音播放错误
  const handlePlaybackError = (error: string) => {
    setVoiceError(error);
  };

  // 清除错误
  const handleClearError = () => {
    setVoiceError(null);
    clearError();
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* 语音录制器 */}
      {showVoiceRecorder && (
        <Card className='border-primary'>
          <CardContent className='p-4'>
            <VoiceRecorder
              onTextRecognized={handleVoiceTextRecognized}
              onError={handleVoiceError}
              disabled={disabled}
            />
            <div className='flex justify-end mt-4'>
              <Button
                onClick={() => setShowVoiceRecorder(false)}
                variant='outline'
                size='sm'
              >
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 语音播放器 */}
      {showVoicePlayer && ttsText && (
        <Card className='border-blue-500'>
          <CardContent className='p-4'>
            <VoicePlayer
              text={ttsText}
              onPlaybackComplete={handlePlaybackComplete}
              onError={handlePlaybackError}
              disabled={disabled}
              autoPlay={true}
            />
            <div className='flex justify-end mt-4'>
              <Button
                onClick={() => setShowVoicePlayer(false)}
                variant='outline'
                size='sm'
              >
                关闭
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 错误提示 */}
      {voiceError && (
        <Alert variant='destructive'>
          <AlertDescription>
            {voiceError}
            <Button
              onClick={handleClearError}
              variant='ghost'
              size='sm'
              className='ml-2'
            >
              关闭
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* 主输入区域 */}
      <Card className='border-0 shadow-none'>
        <CardContent className='p-4'>
          {/* 上传的文件 */}
          {uploadedFiles.length > 0 && (
            <div className='mb-3 space-y-2'>
              {uploadedFiles.map(file => (
                <div
                  key={file.id}
                  className='flex items-center space-x-2 p-2 bg-muted rounded-lg'
                >
                  <FileText className='h-4 w-4' />
                  <span className='text-sm flex-1 truncate'>{file.name}</span>
                  <Badge variant='outline' className='text-xs'>
                    {(file.size / 1024).toFixed(1)}KB
                  </Badge>
                  {onRemoveFile && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onRemoveFile(file.id)}
                      className='h-6 w-6 p-0'
                    >
                      <X className='h-3 w-3' />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className='flex items-end space-x-2'>
            {/* 输入区域 */}
            <div className='flex-1'>
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={e => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                placeholder={placeholder}
                maxLength={maxLength}
                disabled={disabled || isSending}
                className='min-h-[60px] max-h-[200px] resize-none'
              />

              {/* 字符计数 */}
              <div className='flex justify-between items-center mt-1 text-xs text-muted-foreground'>
                <span>
                  {value.length}/{maxLength}
                </span>
                {recordingState.isRecording && (
                  <Badge variant='destructive' className='animate-pulse'>
                    录音中...
                  </Badge>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className='flex items-center space-x-1'>
              {/* 文件上传 */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => fileInputRef.current?.click()}
                      disabled={disabled || isSending}
                      className='h-8 w-8 p-0'
                    >
                      <Paperclip className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>上传文件</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* 语音录制 */}
              {enableVoice && isInitialized && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={
                          recordingState.isRecording
                            ? handleVoiceStop
                            : handleVoiceStart
                        }
                        disabled={disabled || isSending}
                        className={cn(
                          'h-8 w-8 p-0',
                          recordingState.isRecording && 'text-red-500'
                        )}
                      >
                        {recordingState.isRecording ? (
                          <MicOff className='h-4 w-4' />
                        ) : (
                          <Mic className='h-4 w-4' />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {recordingState.isRecording ? '停止录音' : '开始录音'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* 语音合成 */}
              {enableTTS && value.trim() && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleTTSRequest(value)}
                        disabled={disabled || isSending || !isInitialized}
                        className='h-8 w-8 p-0'
                      >
                        <Volume2 className='h-4 w-4' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>语音播放</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* 发送按钮 */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleSend}
                      disabled={!value.trim() || isSending || disabled}
                      size='sm'
                      className='h-8 w-8 p-0'
                    >
                      <Send className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>发送消息</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type='file'
        multiple
        accept='image/*,audio/*,video/*,.pdf,.doc,.docx,.txt'
        onChange={handleFileSelect}
        className='hidden'
      />
    </div>
  );
}
