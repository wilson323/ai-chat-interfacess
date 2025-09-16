/**
 * 统一思考展示组件
 * 合并EnhancedThinkingBubble和InlineBubbleInteractive的功能
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Check, Brain, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { ThinkingDisplayProps } from '../../types/chat';

export function ThinkingDisplay({
  thinkingSteps,
  interactiveData,
  thinkingStatus,
  interactionStatus,
  onInteractiveSelect,
  className,
}: ThinkingDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInteractiveVisible, setIsInteractiveVisible] = useState(false);

  // 当思考完成且有交互数据时，显示交互区域
  useEffect(() => {
    if (
      thinkingStatus === 'completed' &&
      interactiveData &&
      interactionStatus === 'ready'
    ) {
      const timer = setTimeout(() => {
        setIsInteractiveVisible(true);
      }, 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [thinkingStatus, interactiveData, interactionStatus]);

  // 如果没有有效的思考步骤且没有交互数据，不渲染
  if (thinkingSteps.length === 0 && !interactiveData) {
    return null;
  }

  const isUserSelect = interactiveData?.type === 'userSelect';
  const options = interactiveData?.params?.userSelectOptions;
  const description = interactiveData?.params?.description;
  const isProcessed = interactiveData?.processed;
  const selectedKey = interactiveData?.selectedKey;

  return (
    <div className={cn('space-y-3', className)}>
      {/* 思考流程展示 */}
      {thinkingSteps.length > 0 && (
        <div className='bg-muted/50 rounded-lg p-4'>
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center space-x-2'>
              <Brain className='h-4 w-4 text-primary' />
              <span className='text-sm font-medium'>思考流程</span>
              <Badge variant='secondary' className='text-xs'>
                {thinkingSteps.length} 步
              </Badge>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsExpanded(!isExpanded)}
              className='h-6 w-6 p-0'
            >
              {isExpanded ? (
                <ChevronUp className='h-3 w-3' />
              ) : (
                <ChevronDown className='h-3 w-3' />
              )}
            </Button>
          </div>

          {/* 思考状态指示器 */}
          <div className='flex items-center space-x-2 mb-3'>
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                thinkingStatus === 'thinking' && 'bg-blue-500 animate-pulse',
                thinkingStatus === 'completed' && 'bg-green-500',
                thinkingStatus === 'error' && 'bg-red-500',
                thinkingStatus === 'idle' && 'bg-gray-400'
              )}
            />
            <span className='text-xs text-muted-foreground'>
              {thinkingStatus === 'thinking' && '思考中...'}
              {thinkingStatus === 'completed' && '思考完成'}
              {thinkingStatus === 'error' && '思考出错'}
              {thinkingStatus === 'idle' && '等待思考'}
            </span>
          </div>

          {/* 思考步骤详情 */}
          {isExpanded && (
            <div className='space-y-2'>
              {thinkingSteps.map((step, index) => (
                <div
                  key={step.id || index}
                  className='flex items-start space-x-2 p-2 bg-background rounded border'
                >
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                      step.status === 'completed' && 'bg-green-500',
                      step.status === 'processing' &&
                        'bg-blue-500 animate-pulse',
                      step.status === 'error' && 'bg-red-500',
                      (!step.status || step.status === 'pending') &&
                        'bg-gray-300'
                    )}
                  />
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center space-x-2 mb-1'>
                      <span className='text-xs font-medium text-muted-foreground'>
                        {step.name || `步骤 ${index + 1}`}
                      </span>
                      {step.status === 'processing' && (
                        <Loader2 className='h-3 w-3 animate-spin' />
                      )}
                    </div>
                    {step.content && (
                      <p className='text-xs text-muted-foreground line-clamp-2'>
                        {step.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 交互节点展示 */}
      {interactiveData && isInteractiveVisible && (
        <div className='bg-primary/5 border border-primary/20 rounded-lg p-4'>
          <div className='flex items-center space-x-2 mb-3'>
            <Check className='h-4 w-4 text-primary' />
            <span className='text-sm font-medium'>需要您的选择</span>
          </div>

          {description && (
            <p className='text-sm text-muted-foreground mb-3'>{description}</p>
          )}

          {isUserSelect && options && options.length > 0 && (
            <div className='space-y-2'>
              {options.map(option => (
                <Button
                  key={option.key}
                  variant={selectedKey === option.key ? 'default' : 'outline'}
                  size='sm'
                  onClick={() =>
                    onInteractiveSelect?.(option.value, option.key)
                  }
                  disabled={isProcessed}
                  className='w-full justify-start'
                >
                  {selectedKey === option.key && (
                    <Check className='h-3 w-3 mr-2' />
                  )}
                  <div className='text-left'>
                    <div className='font-medium'>{option.value}</div>
                    {option.description && (
                      <div className='text-xs text-muted-foreground'>
                        {option.description}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}

          {isProcessed && selectedKey && (
            <div className='mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm'>
              <div className='flex items-center space-x-2'>
                <Check className='h-4 w-4 text-green-600' />
                <span className='text-green-800'>已选择: {selectedKey}</span>
              </div>
              {interactiveData.selectedAt && (
                <div className='text-xs text-green-600 mt-1'>
                  {formatDistanceToNow(interactiveData.selectedAt, {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
