'use client';

import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAgent } from '@/context/agent-context';
import { generateFallbackChatId } from '@/lib/api/fastgpt';
import { useLanguage } from '@/context/language-context';

export function NewConversationButton() {
  const { selectedAgent, selectAgent } = useAgent();
  const { t } = useLanguage();

  const handleNewConversation = () => {
    if (selectedAgent) {
      const newChatId = generateFallbackChatId();
      const updatedAgent = {
        ...selectedAgent,
        chatId: newChatId,
      };
      selectAgent(updatedAgent);
      window.location.reload();
    }
  };

  return (
    <Button
      variant='default'
      size='sm'
      onClick={handleNewConversation}
      className={cn(
        // 基础样式 - 蓝色主题
        'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
        'text-white border-0',
        // 尺寸和形状
        'px-4 py-2 h-9 rounded-full',
        // 布局
        'flex items-center gap-2',
        // 动画效果
        'transition-all duration-200 ease-out',
        'hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25',
        'active:scale-95',
        // 字体
        'text-sm font-medium',
        // 移动端适配
        'sm:px-6 sm:h-10',
        // 自定义类名
        'new-conversation-button'
      )}
      aria-label={t('newConversation')}
      title={t('newConversation')}
    >
      <RotateCcw className='h-4 w-4' aria-hidden='true' />
      {t('newConversation')}
    </Button>
  );
}
