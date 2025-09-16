/**
 * 统一消息列表组件
 * 合并MessageList、VirtualizedMessageList、ChatMessages等功能
 */

'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { MessageItem } from './message-item';
import { useResponsive } from '../../hooks/use-responsive';
import type { Message, MessageListProps, ProcessingStep } from '../../types/chat';

// 虚拟化消息列表属性
export interface VirtualizedMessageListProps extends MessageListProps {
  enableVirtualization?: boolean;
  estimateSize?: (index: number) => number;
  overscan?: number;
}

// 统一消息列表组件
export function UnifiedMessageList({
  messages,
  renderMessage,
  enableVirtualization = false,
  estimateSize,
  overscan = 5,
  className,
}: VirtualizedMessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [, setParentHeight] = useState(0);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const { isMdAndDown } = useResponsive();

  // 默认大小估算函数
  const defaultEstimateSize = useCallback(
    (index: number) => {
      const message = messages[index];
      if (!message) return 150;

      // 根据消息内容长度估算高度
      if (typeof message.content === 'string') {
        const contentLength = message.content.length;
        const baseHeight = 100;
        const contentHeight = Math.ceil(contentLength / 100) * 20;
        const metadataHeight = message.metadata ? 50 : 0;
        return Math.max(baseHeight, contentHeight + metadataHeight + 80);
      }

      return 150;
    },
    [messages]
  );

  const sizeEstimator = estimateSize || defaultEstimateSize;

  // 虚拟化器
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: sizeEstimator,
    overscan,
  });

  // 监听滚动事件
  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 20;
      setIsScrolledToBottom(isAtBottom);
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, []);

  // 当新消息添加时，如果之前已滚动到底部，则保持滚动到底部
  useEffect(() => {
    if (isScrolledToBottom && enableVirtualization) {
      virtualizer.scrollToIndex(messages.length - 1, { align: 'end' });
    }
  }, [messages.length, isScrolledToBottom, virtualizer, enableVirtualization]);

  // 获取父元素高度
  useEffect(() => {
    if (parentRef.current) {
      setParentHeight(parentRef.current.offsetHeight);

      const handleResize = () => {
        if (parentRef.current) {
          setParentHeight(parentRef.current.offsetHeight);
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
    return undefined;
  }, []);

  // 渲染单个消息
  const renderSingleMessage = useCallback(
    (message: Message, index: number) => {
      if (renderMessage) {
        return renderMessage(message, index);
      }

      return (
        <MessageItem
          key={message.id}
          message={message}
          onEdit={(id, content) => {
            console.log('Edit message:', id, content);
          }}
          onDelete={id => {
            console.log('Delete message:', id);
          }}
          onRegenerate={id => {
            console.log('Regenerate message:', id);
          }}
          onCopy={content => {
            navigator.clipboard.writeText(content);
          }}
        />
      );
    },
    [renderMessage]
  );

  // 渲染虚拟化列表
  const renderVirtualizedList = () => {
    if (!enableVirtualization) {
      return (
        <div className='space-y-4'>
          {messages.map((message, index) =>
            renderSingleMessage(message, index)
          )}
        </div>
      );
    }

    return (
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderSingleMessage(
              messages[virtualItem.index],
              virtualItem.index
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn('flex-1 flex flex-col', className)}>
      <ScrollArea ref={parentRef} className='flex-1 p-4'>
        <div
          className={cn(
            'max-w-3xl mx-auto space-y-4 sm:space-y-6',
            isMdAndDown ? 'pb-24' : 'pb-32'
          )}
        >
          {renderVirtualizedList()}

          {/* 空状态 */}
          {messages.length === 0 && (
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
    <div className='space-y-4'>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className='flex space-x-3 p-4'>
          <div className='w-8 h-8 bg-muted rounded-full animate-pulse' />
          <div className='flex-1 space-y-2'>
            <div className='h-4 bg-muted rounded animate-pulse w-3/4' />
            <div className='h-4 bg-muted rounded animate-pulse w-1/2' />
          </div>
        </div>
      ))}
    </div>
  );
}

// 处理流程组件
export function ProcessingFlow({ steps }: { steps: ProcessingStep[] }) {
  if (steps.length === 0) return null;

  return (
    <Alert>
      <AlertCircle className='h-4 w-4' />
      <AlertDescription>
        <div className='space-y-2'>
          <h4 className='font-medium'>处理流程</h4>
          {steps.map((step, index) => (
            <div key={index} className='flex items-center space-x-2'>
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  step.status === 'completed' && 'bg-green-500',
                  step.status === 'processing' && 'bg-blue-500',
                  step.status === 'error' && 'bg-red-500',
                  step.status === 'pending' && 'bg-gray-300'
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
  );
}

// 输入中状态组件
export function TypingIndicator() {
  return (
    <div className='flex items-center space-x-2 p-4 bg-muted/50 rounded-lg'>
      <Loader2 className='h-4 w-4 animate-spin' />
      <span className='text-sm text-muted-foreground'>AI正在思考中...</span>
    </div>
  );
}
