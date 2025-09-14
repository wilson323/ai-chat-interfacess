/**
 * 聊天消息列表组件
 * 基于shadcn/ui组件构建，避免自定义代码
 */

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCard } from '@/components/business/MessageCard';
import { Message } from '@/types/message';
import { ProcessingStep } from '@/types/message';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle } from 'lucide-react';

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
  processingSteps: ProcessingStep[];
  showProcessingFlow: boolean;
  onEditMessage?: (message: Message) => void;
  onDeleteMessage?: (message: Message) => void;
  onCopyMessage?: (message: Message) => void;
  onLikeMessage?: (message: Message) => void;
  onDislikeMessage?: (message: Message) => void;
  className?: string;
}

export function ChatMessages({
  messages,
  isTyping,
  processingSteps,
  showProcessingFlow,
  onEditMessage,
  onDeleteMessage,
  onCopyMessage,
  onLikeMessage,
  onDislikeMessage,
  className,
}: ChatMessagesProps) {
  return (
    <div className={cn('flex-1 flex flex-col', className)}>
      <ScrollArea className='flex-1 p-4'>
        <div className='space-y-4'>
          {/* 消息列表 */}
          {messages.map(message => (
            <MessageCard
              key={message.id}
              message={message}
              onEdit={onEditMessage}
              onDelete={onDeleteMessage}
              onCopy={onCopyMessage}
              onLike={onLikeMessage}
              onDislike={onDislikeMessage}
            />
          ))}

          {/* 处理流程 */}
          {showProcessingFlow && processingSteps.length > 0 && (
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                <div className='space-y-2'>
                  <h4 className='font-medium'>处理流程</h4>
                  {processingSteps.map((step, index) => (
                    <div key={index} className='flex items-center space-x-2'>
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          step.status === 'completed'
                            ? 'bg-green-500'
                            : step.status === 'processing'
                              ? 'bg-blue-500'
                              : 'bg-gray-300'
                        )}
                      />
                      <span className='text-sm'>{step.name}</span>
                      {step.status === 'processing' && (
                        <Loader2 className='h-3 w-3 animate-spin' />
                      )}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* 输入中状态 */}
          {isTyping && (
            <div className='flex items-center space-x-2 p-4 bg-muted/50 rounded-lg'>
              <Loader2 className='h-4 w-4 animate-spin' />
              <span className='text-sm text-muted-foreground'>
                AI正在思考中...
              </span>
            </div>
          )}

          {/* 空状态 */}
          {messages.length === 0 && !isTyping && (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <div className='w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4'>
                <AlertCircle className='h-8 w-8 text-muted-foreground' />
              </div>
              <h3 className='text-lg font-semibold mb-2'>开始对话</h3>
              <p className='text-muted-foreground'>
                选择一个智能体开始新的对话
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// 消息加载骨架屏
export function MessageSkeleton() {
  return (
    <div className='space-y-4 p-4'>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className='space-y-2'>
          <div className='flex items-center space-x-2'>
            <Skeleton className='h-6 w-6 rounded-full' />
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-4 w-16' />
          </div>
          <Skeleton className='h-16 w-full' />
        </div>
      ))}
    </div>
  );
}
