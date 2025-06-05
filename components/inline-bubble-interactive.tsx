import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, Brain } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { InteractiveData } from "@/types/message";

interface InlineBubbleInteractiveProps {
  interactiveData: InteractiveData;
  onSelect: (value: string, key: string) => void;
  bubbleType: "user" | "ai";
  className?: string;
  // 新增：思考流程数据
  thinkingSteps?: Array<{
    id: string;
    type: string;
    content?: string;
    timestamp?: Date;
  }>;
}

export function InlineBubbleInteractive({
  interactiveData,
  onSelect,
  bubbleType,
  className,
  thinkingSteps = [],
}: InlineBubbleInteractiveProps) {
  const isUserSelect = interactiveData.type === "userSelect";
  const options = interactiveData.params?.userSelectOptions;
  const description = interactiveData.params?.description;
  const isProcessed = interactiveData.processed;
  const selectedValue = interactiveData.selectedValue;
  const selectedKey = interactiveData.selectedKey;
  const selectedAt = interactiveData.selectedAt;

  // 思考流程相关状态
  const hasThinkingSteps = thinkingSteps && thinkingSteps.length > 0;
  const thinkingStepsFiltered = thinkingSteps.filter(step =>
    step.type.includes('thinking') && step.content
  );

  // 获取思考节点名称的函数
  const getThinkingNodeName = (steps: any[]) => {
    // 优先获取最后一个有名称的步骤
    const namedStep = [...steps].reverse().find(step => step.name && step.name.trim());
    if (namedStep && namedStep.name) {
      return namedStep.name;
    }
    // 如果没有名称，返回步数
    return `${steps.length} 步`;
  };

  // 详细的调试日志
  console.log('🎨 InlineBubbleInteractive 组件渲染检查:', {
    interactiveType: interactiveData.type,
    isUserSelect,
    hasOptions: !!options,
    optionsLength: options?.length || 0,
    options,
    description,
    isProcessed,
    selectedValue,
    selectedKey,
    selectedAt,
    bubbleType,
    shouldRender: isUserSelect && options && options.length > 0
  });

  // 只处理用户选择节点
  if (!isUserSelect || !options || options.length === 0) {
    console.log('❌ InlineBubbleInteractive 不渲染，条件不满足:', {
      isUserSelect,
      hasOptions: !!options,
      optionsLength: options?.length || 0
    });
    return null;
  }

  console.log('✅ InlineBubbleInteractive 开始渲染，选项数量:', options.length);

  return (
    <div className={cn("mt-3 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-700", className)}>
      {/* 思考流程摘要提示 */}
      {hasThinkingSteps && thinkingStepsFiltered.length > 0 && (
        <div className="mb-3 p-2 bg-amber-50/30 dark:bg-amber-900/10 rounded-lg border border-amber-200/50 dark:border-amber-800/30">
          <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
            <Brain className="w-3 h-3" />
            <span>基于 {getThinkingNodeName(thinkingStepsFiltered)} 思考过程生成选项</span>
          </div>
        </div>
      )}

      {/* 描述文字 */}
      {description && (
        <div className={cn(
          "mb-3 text-sm font-medium",
          bubbleType === "user" ? "text-white dark:text-white" : "text-muted-foreground"
        )}>
          {description}
        </div>
      )}

      {/* 选项按钮 */}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = isProcessed && selectedKey === option.key;
          const isDisabled = isProcessed && selectedKey !== option.key;

          return (
            <Button
              key={option.key}
              variant="outline"
              size="sm"
              disabled={isDisabled}
              onClick={() => !isProcessed && onSelect(option.value, option.key)}
              className={cn(
                "transition-all duration-200 text-xs font-medium relative",
                bubbleType === "ai"
                  ? "bubble-interactive-ai"
                  : "bubble-interactive-user",
                isSelected && "bubble-interactive-selected",
                isDisabled && "bubble-interactive-disabled",
                !isProcessed && "hover:scale-105"
              )}
            >
              {/* 选中图标 */}
              {isSelected && (
                <Check className="w-3 h-3 mr-1" />
              )}
              {option.value}
            </Button>
          );
        })}
      </div>

      {/* 选择时间显示 */}
      {isProcessed && selectedAt && (
        <div className={cn(
          "mt-2 text-xs",
          bubbleType === "user" ? "text-white dark:text-white" : "text-muted-foreground"
        )}>
          选择于 {formatDistanceToNow(selectedAt, { addSuffix: true, locale: zhCN })}
        </div>
      )}
    </div>
  );
}
