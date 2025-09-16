import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';
import { Check, Brain, Clock } from 'lucide-react';

import type {
  InteractiveData,
  ProcessingStep,
  ThinkingStatus,
  InteractionStatus,
} from '../types/message';

interface EnhancedThinkingBubbleProps {
  thinkingSteps: ProcessingStep[];
  interactiveData?: InteractiveData;
  onInteractiveSelect?: (value: string, key: string) => void;
  thinkingStatus: ThinkingStatus;
  interactionStatus: InteractionStatus;
  className?: string;
}

export function EnhancedThinkingBubble({
  thinkingSteps,
  interactiveData,
  onInteractiveSelect,
  thinkingStatus,
  interactionStatus,
  className,
}: EnhancedThinkingBubbleProps) {
  const [isInteractiveVisible, setIsInteractiveVisible] = useState(false);

  // 获取思考节点名称的函数
  const getThinkingNodeName = (steps: ProcessingStep[]) => {
    // 优先获取最后一个有名称的步骤
    const namedStep = [...steps]
      .reverse()
      .find(step => step.name && step.name.trim());
    if (namedStep && namedStep.name) {
      return namedStep.name;
    }
    // 如果没有名称，返回步数
    return `${steps.length} 步`;
  };

  // 当思考完成且有交互数据时，显示交互区域
  useEffect(() => {
    if (
      thinkingStatus === 'completed' &&
      interactiveData &&
      interactionStatus === 'ready'
    ) {
      // 延迟显示交互区域，创建平滑过渡效果
      const timer = setTimeout(() => {
        setIsInteractiveVisible(true);
      }, 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [thinkingStatus, interactiveData, interactionStatus]);

  const isUserSelect = interactiveData?.type === 'userSelect';
  const options = interactiveData?.params?.userSelectOptions;
  const description = interactiveData?.params?.description;
  const isProcessed = interactiveData?.processed;
  const selectedValue = interactiveData?.selectedValue;
  const selectedKey = interactiveData?.selectedKey;

  // 🔥 修复：扩展过滤条件，包含所有处理步骤类型
  const validThinkingSteps = thinkingSteps.filter(step => {
    // 包含思考相关的事件类型
    const isThinkingType = step.type.includes('thinking');
    // 包含流程处理相关的事件类型
    const isProcessingType = [
      'flowNodeStatus',
      'moduleStatus',
      'moduleStart',
      'moduleEnd',
      'toolCall',
      'toolParams',
      'toolResponse',
    ].includes(step.type);
    // 必须有内容才显示
    const hasContent = step.content || step.name;

    return (isThinkingType || isProcessingType) && hasContent;
  });

  console.log('🧠 EnhancedThinkingBubble 渲染:', {
    totalStepsCount: thinkingSteps.length,
    validThinkingStepsCount: validThinkingSteps.length,
    thinkingStatus,
    interactionStatus,
    hasInteractiveData: !!interactiveData,
    isInteractiveVisible,
    isProcessed,
    stepTypes: thinkingSteps.map(s => s.type),
    validStepTypes: validThinkingSteps.map(s => s.type),
  });

  if (validThinkingSteps.length === 0 && !interactiveData) {
    console.log('🚫 EnhancedThinkingBubble 不渲染：没有有效步骤且没有交互数据');
    return null;
  }

  return (
    <div
      className={cn(
        'mt-3 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-700',
        className
      )}
    >
      {/* 思考流程区域 */}
      {validThinkingSteps.length > 0 && (
        <div className='mb-3'>
          {/* 思考流程标题栏 */}
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center gap-2'>
              <Brain className='w-4 h-4 text-amber-500' />
              <span className='text-sm font-medium text-amber-700 dark:text-amber-300'></span>
              <Badge
                variant='outline'
                className='text-xs h-5 px-2 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/30'
              >
                {getThinkingNodeName(validThinkingSteps)}
              </Badge>
              {thinkingStatus === 'completed' && (
                <Badge
                  variant='outline'
                  className='text-xs h-5 px-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/30'
                >
                  已完成
                </Badge>
              )}
              {thinkingStatus === 'in-progress' && (
                <Badge
                  variant='outline'
                  className='text-xs h-5 px-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/30'
                >
                  <Clock className='w-3 h-3 mr-1 animate-spin' />
                  思考中
                </Badge>
              )}
            </div>
          </div>

          {/* 思考流程内容 */}
          <div className='space-y-2'>
            {/* 始终显示处理摘要 */}
            {/* <div className="bg-amber-50/30 dark:bg-amber-900/10 rounded-lg p-3 border border-amber-200/50 dark:border-amber-800/30">
              <div className="text-xs text-amber-800 dark:text-amber-200">
                AI 完成了 {getThinkingNodeName(validThinkingSteps)} 思考过程
              </div>
            </div> */}
          </div>
        </div>
      )}

      {/* 思考完成分隔线 */}
      {thinkingStatus === 'completed' && isInteractiveVisible && (
        <div className='flex items-center gap-3 my-4'>
          <div className='flex-1 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent'></div>
          <span className='text-xs text-amber-600 dark:text-amber-400 font-medium'>
            基于思考结果
          </span>
          <div className='flex-1 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent'></div>
        </div>
      )}

      {/* 交互区域 */}
      {isInteractiveVisible &&
        isUserSelect &&
        options &&
        options.length > 0 && (
          <div
            className={cn(
              'transition-all duration-500 ease-out',
              isInteractiveVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            )}
          >
            {/* 交互说明 */}
            {description && (
              <div className='mb-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800/30'>
                <div className='text-sm text-blue-800 dark:text-blue-200 font-medium'>
                  {description}
                </div>
              </div>
            )}

            {/* 选项按钮 */}
            <div className='flex flex-wrap gap-2'>
              {options.map(option => {
                const isSelected = isProcessed && selectedKey === option.key;
                const isDisabled = isProcessed && selectedKey !== option.key;

                return (
                  <Button
                    key={option.key}
                    variant='outline'
                    size='sm'
                    disabled={isDisabled}
                    onClick={() =>
                      !isProcessed &&
                      onInteractiveSelect?.(option.value, option.key)
                    }
                    className={cn(
                      'transition-all duration-200 text-sm font-medium relative',
                      'border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700',
                      'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30',
                      'text-blue-800 dark:text-blue-200',
                      isSelected &&
                        'bg-blue-500 dark:bg-blue-600 text-white border-blue-500 dark:border-blue-600',
                      isDisabled && 'opacity-50 cursor-not-allowed',
                      !isProcessed &&
                        'hover:scale-105 shadow-sm hover:shadow-md'
                    )}
                  >
                    {/* 选中图标 */}
                    {isSelected && <Check className='w-3 h-3 mr-1' />}
                    {option.value}
                  </Button>
                );
              })}
            </div>

            {/* 选择结果显示 */}
            {isProcessed && selectedValue && (
              <div className='mt-3 p-2 bg-green-50/50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800/30'>
                <div className='text-xs text-green-800 dark:text-green-200'>
                  ✅ 已选择：{selectedValue}
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
