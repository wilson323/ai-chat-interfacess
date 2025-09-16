'use client';

import { DropdownMenuTrigger } from './ui/dropdown-menu';

import { Button } from './ui/button';
import { useAgent } from '../context/agent-context';
import { History, ChevronDown, Bot, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { useLanguage } from '../context/language-context';

import { ThemeToggle } from './theme-toggle';
import { ThemeSwitcher } from './theme/theme-switcher';

// Add isAdmin prop to the component
export function Header({ isAdmin = false }: { isAdmin?: boolean }) {
  const { selectedAgent, agents, selectAgent } = useAgent();
  const { t } = useLanguage();

  return (
    <header className='h-16 border-b bg-background/80 backdrop-blur-xl flex items-center justify-between px-2 sm:px-4 fixed top-0 left-0 right-0 z-30'>
      <div className='flex items-center gap-1 sm:gap-3'>
        {!isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='gap-1 sm:gap-2 font-medium text-xs sm:text-base h-8 sm:h-9 px-2 sm:px-3'
              >
                <div className='h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary animate-pulse' />
                <span className='truncate max-w-[80px] sm:max-w-[150px]'>
                  {selectedAgent?.name || 'ZKTeco'}
                </span>
                <ChevronDown className='h-3 w-3 sm:h-4 sm:w-4 opacity-50' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='w-56'>
              <div className='p-2 text-xs font-medium text-muted-foreground'>
                {t('switchAgent')}
              </div>
              {agents.filter(agent => (!isAdmin ? agent.isPublished : true))
                .length === 0 ? (
                <div className='text-muted-foreground text-sm px-4 py-2'>
                  无可用智能体
                </div>
              ) : (
                agents
                  .filter(agent => (!isAdmin ? agent.isPublished : true))
                  .map(agent => (
                    <DropdownMenuItem
                      key={agent.id}
                      onClick={() => selectAgent(agent)}
                      className={cn(
                        'flex items-center gap-2 py-2',
                        selectedAgent?.id === agent.id && 'bg-accent'
                      )}
                    >
                      <div className='w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary'>
                        {agent.icon || <Bot className='h-3.5 w-3.5' />}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='text-sm font-medium truncate'>
                          {agent.name}
                        </div>
                      </div>
                      {selectedAgent?.id === agent.id && (
                        <div className='w-1.5 h-1.5 rounded-full bg-primary' />
                      )}
                    </DropdownMenuItem>
                  ))
              )}
              {/* 仅在管理员界面显示新建智能体选项 */}
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Plus className='h-4 w-4 mr-2' />
                    {t('newAgent')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className='fixed flex items-center gap-2 top-[0.85rem] right-[0.5rem] z-30'>
        {/* 历史按钮 */}
        <Button
          variant='ghost'
          size='icon'
          className='h-8 sm:h-9 w-8 sm:w-9 hover:bg-accent/50 hover:scale-105 transition-all duration-200'
          onClick={() =>
            window.dispatchEvent(new CustomEvent('toggle-history'))
          }
          aria-label='打开聊天历史'
        >
          <History className='h-4 sm:h-5 w-4 sm:w-5' />
        </Button>

        {/* Lovart主题切换器 */}
        <div className='hidden sm:block'>
          <ThemeSwitcher size="sm" showPreview={false} />
        </div>

        {/* 传统主题切换按钮 */}
        <div className='flex items-center justify-center h-8 sm:h-9 w-8 sm:w-9'>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
