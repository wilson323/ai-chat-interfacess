/**
 * 聊天头部组件
 * 基于shadcn/ui组件构建，避免自定义代码
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Settings, Bot, Globe } from 'lucide-react';
import { Agent } from '@/types/agent';
import { GlobalVariable } from '@/types/global-variable';
import { cn } from '@/lib/utils';
import { StopCircle, Activity } from 'lucide-react';

interface ActiveAgentInfo {
  agentId: string;
  agentName: string;
  agentType: string;
}

interface ChatHeaderProps {
  selectedAgent: Agent | null;
  agents: Agent[];
  globalVariables: GlobalVariable[];
  onAgentChange: (agent: Agent) => void;
  onGlobalVariablesChange: (variables: GlobalVariable[]) => void;
  onSettingsClick: () => void;
  activeAgentInfo?: ActiveAgentInfo | null;
  onRequestAbort?: () => void;
  isRequestActive?: boolean;
  className?: string;
}

export function ChatHeader({
  selectedAgent,
  agents,
  globalVariables,
  onAgentChange,
  onGlobalVariablesChange,
  onSettingsClick,
  activeAgentInfo,
  onRequestAbort,
  isRequestActive = false,
  className,
}: ChatHeaderProps) {
  return (
    <Card className={cn('border-0 shadow-none', className)}>
      <CardContent className='p-4'>
        <div className='flex items-center justify-between'>
          {/* 智能体选择器 */}
          <div className='flex items-center space-x-4'>
            <Select
              value={selectedAgent?.id || ''}
              onValueChange={value => {
                const agent = agents.find(a => a.id === value);
                if (agent) onAgentChange(agent);
              }}
            >
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='选择智能体' />
              </SelectTrigger>
              <SelectContent>
                {agents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className='flex items-center space-x-2'>
                      <Bot className='h-4 w-4' />
                      <span>{agent.name}</span>
                      {!agent.isActive && (
                        <Badge variant='secondary' className='text-xs'>
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 全局变量指示器 */}
            {globalVariables.length > 0 && (
              <Badge variant='outline' className='flex items-center space-x-1'>
                <Globe className='h-3 w-3' />
                <span>{globalVariables.length} 变量</span>
              </Badge>
            )}
          </div>

          {/* 操作按钮 */}
          <div className='flex items-center space-x-2'>
            {/* 活跃智能体指示器 */}
            {activeAgentInfo && (
              <Badge variant='secondary' className='flex items-center space-x-1'>
                <Activity className='h-3 w-3' />
                <span>{activeAgentInfo.agentName}</span>
              </Badge>
            )}

            {/* 中止请求按钮 */}
            {isRequestActive && onRequestAbort && (
              <Button
                variant='destructive'
                size='sm'
                onClick={onRequestAbort}
                className='flex items-center space-x-1'
              >
                <StopCircle className='h-4 w-4' />
                <span>中止</span>
              </Button>
            )}

            {/* 全局变量管理 */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant='outline' size='sm'>
                  <Globe className='h-4 w-4 mr-2' />
                  全局变量
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-md'>
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold'>全局变量</h3>
                  <div className='space-y-2'>
                    {globalVariables.map((variable, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between p-2 border rounded'
                      >
                        <div>
                          <span className='font-medium'>{variable.key}</span>
                          <p className='text-sm text-muted-foreground'>
                            {variable.value}
                          </p>
                        </div>
                        <Badge
                          variant={variable.isActive ? 'default' : 'secondary'}
                        >
                          {variable.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* 设置按钮 */}
            <Button variant='outline' size='sm' onClick={onSettingsClick}>
              <Settings className='h-4 w-4 mr-2' />
              设置
            </Button>
          </div>
        </div>

        {/* 智能体信息 */}
        {selectedAgent && (
          <div className='mt-3 p-3 bg-muted/50 rounded-lg'>
            <div className='flex items-center space-x-2'>
              <Bot className='h-4 w-4' />
              <span className='font-medium'>{selectedAgent.name}</span>
              <Badge variant='outline' className='text-xs'>
                {selectedAgent.type}
              </Badge>
            </div>
            {selectedAgent.description && (
              <p className='text-sm text-muted-foreground mt-1'>
                {selectedAgent.description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
