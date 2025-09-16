'use client';

import { useRef, useEffect, useState } from 'react';
import type { Message } from '../types/message';
import { ChatMessage } from './chat-message';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedMessageListProps {
  messages: Message[];
  onRegenerate?: (messageId: string) => void;
  onCopy?: () => void;
  chatId?: string;
  className?: string;
}

export function VirtualizedMessageList({
  messages,
  onRegenerate,
  onCopy,
  chatId,
  className,
}: VirtualizedMessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

  // 估计每条消息的高度 - 实际上这会根据内容而变化
  const estimateSize = (index: number) => {
    const message = messages[index];
    // 根据消息内容长度估计高度
    if (typeof message.content === 'string') {
      // 每100个字符约占20px高度，最小高度为100px
      return Math.max(100, Math.ceil(message.content.length / 100) * 20 + 80);
    }
    return 150; // 默认高度
  };

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  });

  // 监听滚动事件，检测是否滚动到底部
  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      // 如果滚动位置接近底部（20px误差范围内），认为已滚动到底部
      setIsScrolledToBottom(scrollHeight - scrollTop - clientHeight < 20);
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, []);

  // 当新消息添加时，如果之前已滚动到底部，则保持滚动到底部
  useEffect(() => {
    if (isScrolledToBottom) {
      virtualizer.scrollToIndex(messages.length - 1);
    }
  }, [messages.length, isScrolledToBottom, virtualizer]);

  // 获取父元素高度 - 已移除未使用的parentHeight状态
  useEffect(() => {
    // parentHeight状态已被移除，此useEffect不再需要
    // 保留空函数以避免其他依赖问题
    return undefined;
  }, []);

  return (
    <div
      ref={parentRef}
      className={className || 'h-full overflow-auto'}
      style={{
        height: '100%',
        width: '100%',
        overflow: 'auto',
      }}
    >
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
            <ChatMessage
              message={messages[virtualItem.index]}
              onRegenerate={() =>
                onRegenerate?.(messages[virtualItem.index].id)
              }
              onCopy={onCopy}
              chatId={chatId}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
