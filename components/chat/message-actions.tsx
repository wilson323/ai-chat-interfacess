/**
 * 统一消息操作组件
 * 处理消息的操作按钮和交互
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import {
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Pencil,
  Check,
  Volume2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { MessageActionsProps } from '../../types/chat';

export function MessageActions({
  message,
  onEdit,
  onDelete,
  onRegenerate,
  onCopy,
  className,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const isUser = message.role === 'user';
  const isAI = message.role === 'assistant';
  const timestamp = message.timestamp
    ? new Date(message.timestamp)
    : new Date();

  const handleCopy = async () => {
    if (onCopy) {
      onCopy(message.content);
    } else {
      await navigator.clipboard.writeText(message.content);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    setLiked(!liked);
    if (liked) {
      setDisliked(false);
    }
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    if (disliked) {
      setLiked(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(message.id, message.content);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.id);
    }
  };

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate(message.id);
    }
  };

  return (
    <div
      className={cn('flex items-center justify-between group', className)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* 时间戳和状态 */}
      <div className='flex items-center space-x-2'>
        <span className='text-xs text-muted-foreground'>
          {formatDistanceToNow(timestamp, {
            addSuffix: true,
            locale: zhCN,
          })}
        </span>

        {/* 消息状态指示器 */}
        {isAI && message.metadata?.thinkingStatus && (
          <Badge
            variant={
              message.metadata.thinkingStatus === 'completed'
                ? 'default'
                : message.metadata.thinkingStatus === 'thinking'
                  ? 'secondary'
                  : message.metadata.thinkingStatus === 'error'
                    ? 'destructive'
                    : 'outline'
            }
            className='text-xs'
          >
            {message.metadata.thinkingStatus === 'completed' && '已完成'}
            {message.metadata.thinkingStatus === 'thinking' && '思考中'}
            {message.metadata.thinkingStatus === 'error' && '出错'}
            {message.metadata.thinkingStatus === 'idle' && '等待中'}
          </Badge>
        )}
      </div>

      {/* 操作按钮 */}
      <div
        className={cn(
          'flex items-center space-x-1 transition-opacity duration-200',
          showActions ? 'opacity-100' : 'opacity-0'
        )}
      >
        <TooltipProvider>
          {/* 复制按钮 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleCopy}
                className='h-8 w-8 p-0'
              >
                {copied ? (
                  <Check className='h-3 w-3' />
                ) : (
                  <Copy className='h-3 w-3' />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copied ? '已复制' : '复制'}</TooltipContent>
          </Tooltip>

          {/* 用户消息操作 */}
          {isUser && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleEdit}
                    className='h-8 w-8 p-0'
                  >
                    <Pencil className='h-3 w-3' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>编辑</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleDelete}
                    className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                  >
                    <Trash2 className='h-3 w-3' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>删除</TooltipContent>
              </Tooltip>
            </>
          )}

          {/* AI消息操作 */}
          {isAI && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleRegenerate}
                    className='h-8 w-8 p-0'
                  >
                    <RotateCcw className='h-3 w-3' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>重新生成</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleLike}
                    className={cn('h-8 w-8 p-0', liked && 'text-green-600')}
                  >
                    <ThumbsUp className='h-3 w-3' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>点赞</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleDislike}
                    className={cn('h-8 w-8 p-0', disliked && 'text-red-600')}
                  >
                    <ThumbsDown className='h-3 w-3' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>点踩</TooltipContent>
              </Tooltip>

              {/* 语音播放按钮 */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                    <Volume2 className='h-3 w-3' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>语音播放</TooltipContent>
              </Tooltip>
            </>
          )}
        </TooltipProvider>
      </div>
    </div>
  );
}
