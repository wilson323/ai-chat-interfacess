/**
 * 统一聊天输入组件
 * 合并ChatInput、VoiceChatInput、InputArea等功能
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  // Image, // 未使用
  // FileText, // 未使用
  X,
  Volume2,
  // VolumeX, // 未使用
  Loader2,
} from 'lucide-react';
import { useVoiceStore } from '../../lib/voice/store/voice-store';

// 上传文件类型
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

// 统一输入组件属性
export interface UnifiedInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFileUpload?: (files: File[]) => void;
  onVoiceTextRecognized?: (text: string) => void;
  onTTSRequest?: (text: string) => void;
  uploadedFiles?: UploadedFile[];
  onRemoveFile?: (fileId: string) => void;
  isSending?: boolean;
  isRecording?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  userId?: string;
  enableVoice?: boolean;
  enableTTS?: boolean;
  enableFileUpload?: boolean;
  enableImageUpload?: boolean;
  autoResize?: boolean;
}

export function UnifiedInput({
  value,
  onChange,
  onSend,
  onFileUpload,
  onVoiceTextRecognized,
  uploadedFiles = [],
  onRemoveFile,
  isSending = false,
  isRecording = false,
  disabled = false,
  placeholder = '输入消息...',
  maxLength = 4000,
  className,
  // userId, // 未使用
  enableVoice = true,
  // enableTTS = true, // 未使用
  enableFileUpload = true,
  enableImageUpload = true,
  autoResize = true,
}: UnifiedInputProps) {
  const [isComposing, setIsComposing] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showVoicePlayer, setShowVoicePlayer] = useState(false);
  // const [voiceText, setVoiceText] = useState(''); // 未使用
  // const [ttsText, setTtsText] = useState(''); // 未使用
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const { t } = useLanguage(); // 未使用

  const {
    recordingState,
    isInitialized,
    initialize,
    startRecording,
    stopRecording,
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

  // 自动调整文本区域大小
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, autoResize]);

  // 处理键盘事件
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
        e.preventDefault();
        if (value.trim() && !isSending) {
          onSend();
        }
      }
    },
    [value, isSending, isComposing, onSend]
  );

  // 处理文件选择
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0 && onFileUpload) {
        onFileUpload(files);
      }
    },
    [onFileUpload]
  );

  // 处理语音录制开始
  const handleVoiceStart = useCallback(async () => {
    try {
      setVoiceError(null);
      await startRecording();
    } catch (error) {
      setVoiceError('语音录制启动失败');
      console.error('Voice recording start error:', error);
    }
  }, [startRecording]);

  // 处理语音录制停止
  const handleVoiceStop = useCallback(async () => {
    try {
      const result = (await stopRecording()) as any; // 临时类型断言
      if (result?.text) {
        // setVoiceText(result.text); // 未使用的变量
        onChange(value + (value ? ' ' : '') + result.text);
        onVoiceTextRecognized?.(result.text);
      }
      setShowVoiceRecorder(false);
    } catch (error) {
      setVoiceError('语音识别失败');
      console.error('Voice recognition error:', error);
    }
  }, [stopRecording, value, onChange, onVoiceTextRecognized]);

  // 处理TTS请求 (暂时未使用)
  // const handleTTSRequest = useCallback(async (text: string) => {
  //   try {
  //     setTtsText(text);
  //     await synthesizeSpeech({ text }); // 修复参数类型
  //     setShowVoicePlayer(true);
  //     onTTSRequest?.(text);
  //   } catch (error) {
  //     setVoiceError('语音合成失败');
  //     console.error('TTS error:', error);
  //   }
  // }, [synthesizeSpeech, onTTSRequest]);

  // 处理发送
  const handleSend = useCallback(() => {
    if (value.trim() && !isSending) {
      onSend();
    }
  }, [value, isSending, onSend]);

  // 处理文件移除
  const handleRemoveFile = useCallback(
    (fileId: string) => {
      onRemoveFile?.(fileId);
    },
    [onRemoveFile]
  );

  // 处理文件上传切换
  const toggleFileUpload = useCallback(() => {
    setIsUploading(!isUploading);
  }, [isUploading]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* 错误提示 */}
      {voiceError && (
        <Alert variant='destructive'>
          <AlertDescription>{voiceError}</AlertDescription>
        </Alert>
      )}

      {/* 上传的文件列表 */}
      {uploadedFiles.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {uploadedFiles.map(file => (
            <Badge
              key={file.id}
              variant='secondary'
              className='flex items-center space-x-2 px-3 py-1'
            >
              <span className='text-xs'>{file.name}</span>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleRemoveFile(file.id)}
                className='h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground'
              >
                <X className='h-3 w-3' />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* 主输入区域 */}
      <div className='flex items-end space-x-2 p-4 bg-card rounded-lg border'>
        {/* 文件上传按钮 */}
        {enableFileUpload && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={toggleFileUpload}
                  disabled={disabled}
                  className='h-10 w-10'
                >
                  <Paperclip className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>上传文件</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* 语音录制按钮 */}
        {enableVoice && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={isRecording ? handleVoiceStop : handleVoiceStart}
                  disabled={disabled || !isInitialized}
                  className={cn(
                    'h-10 w-10',
                    isRecording && 'bg-red-100 text-red-600 hover:bg-red-200'
                  )}
                >
                  {isRecording ? (
                    <MicOff className='h-4 w-4' />
                  ) : (
                    <Mic className='h-4 w-4' />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isRecording ? '停止录音' : '开始录音'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* 文本输入区域 */}
        <div className='flex-1 relative'>
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            className='min-h-[40px] max-h-[120px] resize-none pr-12'
          />

          {/* 字符计数 */}
          {maxLength && (
            <div className='absolute bottom-2 right-2 text-xs text-muted-foreground'>
              {value.length}/{maxLength}
            </div>
          )}
        </div>

        {/* 发送按钮 */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleSend}
                disabled={disabled || isSending || !value.trim()}
                size='icon'
                className='h-10 w-10'
              >
                {isSending ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Send className='h-4 w-4' />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>发送消息</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        id='unifiedFileInput'
        name='unifiedFileInput'
        ref={fileInputRef}
        type='file'
        multiple
        accept={
          enableImageUpload
            ? 'image/*,.pdf,.doc,.docx,.txt'
            : '.pdf,.doc,.docx,.txt'
        }
        onChange={handleFileSelect}
        className='hidden'
      />

      {/* 语音录制状态 */}
      {showVoiceRecorder && (
        <div className='flex items-center space-x-2 p-3 bg-muted rounded-lg'>
          <div className='flex items-center space-x-2'>
            <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse' />
            <span className='text-sm'>正在录音...</span>
          </div>
          <Button variant='outline' size='sm' onClick={handleVoiceStop}>
            停止
          </Button>
        </div>
      )}

      {/* 语音播放状态 */}
      {showVoicePlayer && (
        <div className='flex items-center space-x-2 p-3 bg-muted rounded-lg'>
          <div className='flex items-center space-x-2'>
            <Volume2 className='h-4 w-4' />
            <span className='text-sm'>正在播放语音...</span>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowVoicePlayer(false)}
          >
            停止
          </Button>
        </div>
      )}
    </div>
  );
}
