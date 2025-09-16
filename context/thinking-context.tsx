/**
 * 思考状态管理上下文
 * 统一管理thinking相关状态和逻辑
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import type {
  ThinkingContextValue,
  ProcessingStep,
  ThinkingStatus,
  InteractionStatus,
  InteractiveData,
} from '@/types/chat';

const ThinkingContext = createContext<ThinkingContextValue | undefined>(
  undefined
);

interface ThinkingProviderProps {
  children: ReactNode;
  initialThinkingSteps?: ProcessingStep[];
  initialThinkingStatus?: ThinkingStatus;
  initialInteractionStatus?: InteractionStatus;
  initialInteractiveData?: InteractiveData;
  onInteractiveSelect?: (value: string, key: string) => void;
}

export function ThinkingProvider({
  children,
  initialThinkingSteps = [],
  initialThinkingStatus = 'idle',
  initialInteractionStatus = 'none',
  initialInteractiveData,
  onInteractiveSelect,
}: ThinkingProviderProps) {
  const [thinkingSteps, setThinkingSteps] =
    useState<ProcessingStep[]>(initialThinkingSteps);
  const [thinkingStatus, setThinkingStatus] = useState<ThinkingStatus>(
    initialThinkingStatus
  );
  const [interactionStatus, setInteractionStatus] = useState<InteractionStatus>(
    initialInteractionStatus
  );
  const [interactiveData, setInteractiveData] = useState<
    InteractiveData | undefined
  >(initialInteractiveData);

  const updateThinkingSteps = useCallback((steps: ProcessingStep[]) => {
    setThinkingSteps(steps);
  }, []);

  const updateThinkingStatus = useCallback((status: ThinkingStatus) => {
    setThinkingStatus(status);
  }, []);

  const updateInteractionStatus = useCallback((status: InteractionStatus) => {
    setInteractionStatus(status);
  }, []);

  const handleInteractiveSelect = useCallback(
    (value: string, key: string) => {
      if (onInteractiveSelect) {
        onInteractiveSelect(value, key);
      }

      // 更新交互数据状态
      if (interactiveData) {
        setInteractiveData({
          ...interactiveData,
          processed: true,
          selectedValue: value,
          selectedKey: key,
          selectedAt: new Date(),
        });
      }

      // 更新交互状态
      setInteractionStatus('completed');
    },
    [onInteractiveSelect, interactiveData]
  );

  const value: ThinkingContextValue = {
    thinkingSteps,
    thinkingStatus,
    interactionStatus,
    interactiveData: interactiveData || undefined,
    updateThinkingSteps,
    updateThinkingStatus,
    updateInteractionStatus,
    onInteractiveSelect: handleInteractiveSelect,
  };

  return (
    <ThinkingContext.Provider value={value}>
      {children}
    </ThinkingContext.Provider>
  );
}

export function useThinking(): ThinkingContextValue {
  const context = useContext(ThinkingContext);
  if (context === undefined) {
    throw new Error('useThinking must be used within a ThinkingProvider');
  }
  return context;
}

// 思考状态Hook
export function useThinkingState() {
  const { thinkingSteps, thinkingStatus, interactionStatus, interactiveData } =
    useThinking();

  const isThinking = thinkingStatus === 'thinking';
  const isThinkingCompleted = thinkingStatus === 'completed';
  const hasInteractiveData = !!interactiveData;
  const isInteractiveReady = interactionStatus === 'ready';
  const isInteractiveCompleted = interactionStatus === 'completed';

  const validThinkingSteps = thinkingSteps.filter(step => {
    const isThinkingType = step.type.includes('thinking');
    const isProcessingType = [
      'flowNodeStatus',
      'moduleStatus',
      'moduleStart',
      'moduleEnd',
      'toolCall',
      'toolParams',
      'toolResponse',
    ].includes(step.type);
    const hasContent = step.content || step.name;

    return (isThinkingType || isProcessingType) && hasContent;
  });

  return {
    thinkingSteps: validThinkingSteps,
    thinkingStatus,
    interactionStatus,
    interactiveData,
    isThinking,
    isThinkingCompleted,
    hasInteractiveData,
    isInteractiveReady,
    isInteractiveCompleted,
  };
}
