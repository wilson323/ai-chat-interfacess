/**
 * 聊天输入组件
 * 基于shadcn/ui组件构建，避免自定义代码
 */

import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Paperclip,
  Mic,
  Send,
  Image as ImageIcon,
  FileText,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFileUpload?: (files: File[]) => void;
  onVoiceStart?: () => void;
  onVoiceStop?: () => void;
  onVoiceTextRecognized?: (text: string) => void;
  uploadedFiles?: UploadedFile[];
  onRemoveFile?: (fileId: string) => void;
  isRecording?: boolean;
  isSending?: boolean;
  isTyping?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  onGlobalVariablesChange?: (variables: unknown[]) => void;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onFileUpload,
  onVoiceStart,
  onVoiceStop,
  uploadedFiles = [],
  onRemoveFile,
  isRecording = false,
  isSending = false,
  disabled = false,
  placeholder = '输入消息...',
  maxLength = 4000,
  className,
}: ChatInputProps) {
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      if (value.trim() && !isSending && onSend) {
        onSend();
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0 && onFileUpload) {
      onFileUpload(files);
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      onVoiceStop?.();
    } else {
      onVoiceStart?.();
    }
  };

  const handleSend = () => {
    if (value.trim() && !isSending && onSend) {
      onSend();
    }
  };

  return (
    <Card className={cn('border-0 shadow-none', className)}>
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
              id='chat-input'
              name='message'
              aria-label='聊天输入'
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
              {isRecording && (
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
                    className='h-10 w-10 p-0'
                  >
                    <Paperclip className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>上传文件</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* 图片上传 */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isSending}
                    className='h-10 w-10 p-0'
                  >
                    <ImageIcon className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>上传图片</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* 语音输入 */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleVoiceToggle}
                    disabled={disabled || isSending}
                    className={cn(
                      'h-10 w-10 p-0',
                      isRecording && 'bg-red-100 text-red-600'
                    )}
                  >
                    <Mic className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isRecording ? '停止录音' : '开始录音'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* 发送按钮 */}
            <Button
              onClick={handleSend}
              disabled={!value.trim() || disabled || isSending}
              size='sm'
              className='h-10 px-4'
            >
              {isSending ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                  发送中
                </>
              ) : (
                <>
                  <Send className='h-4 w-4 mr-2' />
                  发送
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 隐藏的文件输入 */}
        <input
          id='chat-file-input'
          name='attachments'
          aria-label='附件上传'
          ref={fileInputRef}
          type='file'
          multiple
          accept='image/*,.pdf,.doc,.docx,.txt'
          onChange={handleFileSelect}
          className='hidden'
        />
      </CardContent>
    </Card>
  );
}
