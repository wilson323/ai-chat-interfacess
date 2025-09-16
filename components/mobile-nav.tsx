'use client';

import { MessageSquare, Settings, History, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { useAgent } from '../context/agent-context';
import { useResponsive } from '../hooks/use-responsive';
import { useLanguage } from '../context/language-context';

export function MobileNav() {
  const { toggleSidebar, toggleHistorySidebar } = useAgent();
  const { t } = useLanguage();
  const { isMdAndDown } = useResponsive();

  if (!isMdAndDown) return null;

  return (
    <div className='fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t z-40 md:hidden'>
      <div className='flex items-center justify-around p-2'>
        <Button
          variant='ghost'
          size='icon'
          onClick={toggleSidebar}
          className='flex flex-col items-center gap-1 h-auto py-2'
        >
          <Menu className='h-5 w-5' />
          <span className='text-[10px]'>{t('agents')}</span>
        </Button>

        <Button
          variant='ghost'
          size='icon'
          onClick={toggleHistorySidebar}
          className='flex flex-col items-center gap-1 h-auto py-2'
        >
          <History className='h-5 w-5' />
          <span className='text-[10px]'>历史</span>
        </Button>

        <Button
          variant='ghost'
          size='icon'
          className='flex flex-col items-center gap-1 h-auto py-2'
        >
          <MessageSquare className='h-5 w-5' />
          <span className='text-[10px]'>聊天</span>
        </Button>

        <Button
          variant='ghost'
          size='icon'
          className='flex flex-col items-center gap-1 h-auto py-2'
        >
          <Settings className='h-5 w-5' />
          <span className='text-[10px]'>{t('settings')}</span>
        </Button>
      </div>
    </div>
  );
}
