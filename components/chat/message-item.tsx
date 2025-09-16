/**
 * 统一消息项组件
 * 重构后的单个消息容器组件
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import { MessageContent } from './message-content';
import { MessageActions } from './message-actions';
import { ThinkingDisplay } from './thinking-display';
import type { MessageItemProps } from '../../types/chat';

export function MessageItem({
  message,
  onEdit,
  onDelete,
  onRegenerate,
  onCopy,
  className,
}: MessageItemProps) {
  const isUser = message.role === 'user';
  const isAI = message.role === 'assistant';

  return (
    <div className={cn('group relative', className)}>
      <div
        className={cn(
          'flex space-x-3 p-4 rounded-lg transition-colors duration-200',
          isUser && 'bg-blue-50 dark:bg-blue-950/20',
          isAI && 'bg-gray-50 dark:bg-gray-900/20',
          'hover:bg-opacity-80'
        )}
      >
        {/* 头像 */}
        <div
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
            isUser && 'bg-blue-500 text-white',
            isAI && 'bg-gray-500 text-white'
          )}
        >
          {isUser ? <User className='h-4 w-4' /> : <Bot className='h-4 w-4' />}
        </div>

        {/* 消息内容区域 */}
        <div className='flex-1 min-w-0 space-y-2'>
          {/* 消息内容 */}
          <MessageContent
            content={message.content}
            role={message.role}
            metadata={message.metadata || undefined}
          />

          {/* 思考流程展示 */}
          {isAI && message.metadata && (
            <ThinkingDisplay
              thinkingSteps={message.metadata.thinkingSteps || []}
              interactiveData={message.metadata.interactiveData}
              thinkingStatus={message.metadata.thinkingStatus || 'idle'}
              interactionStatus={message.metadata.interactionStatus || 'none'}
              onInteractiveSelect={(value, key) => {
                // 这里可以处理交互选择逻辑
                console.log('Interactive select:', { value, key });
              }}
            />
          )}

          {/* 消息操作 */}
          <MessageActions
            message={message}
            onEdit={onEdit || undefined}
            onDelete={onDelete || undefined}
            onRegenerate={onRegenerate || undefined}
            onCopy={onCopy || undefined}
          />
        </div>
      </div>
    </div>
  );
}
