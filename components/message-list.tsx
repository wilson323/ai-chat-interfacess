'use client';

import type React from 'react';

import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/use-responsive';
import type { Message } from '@/types/message';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  renderMessage: (message: Message, index: number) => React.ReactNode;
}

export function MessageList({
  messages,
  isLoading = false,
  renderMessage,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isMdAndDown } = useResponsive();

  // 滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea
      ref={scrollRef}
      className={cn(
        'flex-1 overflow-y-auto px-4 sm:px-6 py-4',
        'scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300'
      )}
    >
      <div
        className={cn(
          'max-w-3xl mx-auto space-y-4 sm:space-y-6',
          isMdAndDown ? 'pb-24' : 'pb-32'
        )}
      >
        {messages.map((message, index) => renderMessage(message, index))}

        {isLoading && (
          <div className='flex items-center justify-center py-6'>
            <div className='flex space-x-2'>
              <div className='h-2 w-2 rounded-full bg-gray-400 animate-bounce' />
              <div className='h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]' />
              <div className='h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]' />
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
