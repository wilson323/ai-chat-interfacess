'use client';

import React from 'react';
import { Button } from '../components/ui/button';
import type { Message } from '../types/message';
import { cn } from '../lib/utils';
import { useResponsive } from '../hooks/use-responsive';
import { HistoryList } from '../components/history/history-list';

interface ChatHistoryProps {
  onClose?: () => void;
  onSelect?: (messages: Message[], chatId: string) => void;
  onNewChat?: () => void;
  onManageHistory?: () => void;
  className?: string;
}

export function ChatHistory({
  onClose = () => {},
  onSelect = () => {},
  onNewChat = () => {},
  onManageHistory,
}: ChatHistoryProps) {
  const { isMdAndDown } = useResponsive();



  return (
    <div
      className={cn(
        'w-full mx-auto bg-background rounded-lg shadow-lg p-0 touch-manipulation',
        isMdAndDown ? 'max-w-none h-[90vh] m-0' : 'max-w-2xl max-h-[80vh]',
        isMdAndDown && 'rounded-none sm:rounded-lg'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between border-b',
          isMdAndDown ? 'px-3 py-2.5' : 'px-4 py-3'
        )}
      >
        <span
          className={cn('font-semibold', isMdAndDown ? 'text-sm' : 'text-base')}
        >
          历史记录
        </span>
        <div className='flex gap-1.5'>
          {onManageHistory && (
            <Button
              variant='ghost'
              size={isMdAndDown ? 'sm' : 'sm'}
              className={cn(
                isMdAndDown && 'text-xs px-2 min-h-[32px]',
                'touch-manipulation active:scale-95 transition-transform'
              )}
              onClick={onManageHistory}
            >
              管理
            </Button>
          )}
          <Button
            variant='ghost'
            size={isMdAndDown ? 'sm' : 'sm'}
            className={cn(
              isMdAndDown && 'text-xs px-2 min-h-[32px]',
              'touch-manipulation active:scale-95 transition-transform'
            )}
            onClick={onClose}
          >
            关闭
          </Button>
        </div>
      </div>
      <HistoryList
        onSelect={onSelect}
        onNewChat={onNewChat}
        viewType='dialog'
      />
    </div>
  );
}
