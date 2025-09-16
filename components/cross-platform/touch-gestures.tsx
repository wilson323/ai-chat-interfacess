'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useCrossPlatform } from './cross-platform-provider';

interface TouchGestureProps {
  children: React.ReactNode;
  className?: string;
  // 手势配置
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  // 手势参数
  swipeThreshold?: number;
  pinchThreshold?: number;
  tapThreshold?: number;
  longPressDelay?: number;
  // 禁用条件
  disabled?: boolean;
  preventDefault?: boolean;
}

export function TouchGestures({
  children,
  className,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onTap,
  onDoubleTap,
  onLongPress,
  swipeThreshold = 50,
  // pinchThreshold = 0.1, // 未使用的参数，保留用于未来扩展
  tapThreshold = 10,
  longPressDelay = 500,
  disabled = false,
  preventDefault = true,
}: TouchGestureProps) {
  const { supportsTouch, isMobile, isTablet } = useCrossPlatform();
  const elementRef = useRef<HTMLDivElement>(null);

  // 触摸状态
  const [touchState, setTouchState] = useState({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    isLongPress: false,
    longPressTimer: null as NodeJS.Timeout | null,
    lastTapTime: 0,
    touchCount: 0,
  });

  // 清理长按定时器
  const clearLongPressTimer = useCallback(() => {
    if (touchState.longPressTimer) {
      clearTimeout(touchState.longPressTimer);
      setTouchState(prev => ({ ...prev, longPressTimer: null }));
    }
  }, [touchState.longPressTimer]);

  // 处理触摸开始
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || !supportsTouch) return;

      if (preventDefault) {
        e.preventDefault();
      }

      const touch = e.touches[0];
      const now = Date.now();

      setTouchState(prev => ({
        ...prev,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        startTime: now,
        isLongPress: false,
        touchCount: e.touches.length,
      }));

      // 开始长按检测
      const longPressTimer = setTimeout(() => {
        setTouchState(prev => ({ ...prev, isLongPress: true }));
        onLongPress?.();
      }, longPressDelay);

      setTouchState(prev => ({ ...prev, longPressTimer }));
    },
    [disabled, supportsTouch, preventDefault, longPressDelay, onLongPress]
  );

  // 处理触摸移动
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || !supportsTouch) return;

      if (preventDefault) {
        e.preventDefault();
      }

      const touch = e.touches[0];

      setTouchState(prev => ({
        ...prev,
        currentX: touch.clientX,
        currentY: touch.clientY,
      }));

      // 如果移动距离超过阈值，取消长按
      const deltaX = Math.abs(touch.clientX - touchState.startX);
      const deltaY = Math.abs(touch.clientY - touchState.startY);

      if (deltaX > tapThreshold || deltaY > tapThreshold) {
        clearLongPressTimer();
      }
    },
    [
      disabled,
      supportsTouch,
      preventDefault,
      tapThreshold,
      clearLongPressTimer,
      touchState.startX,
      touchState.startY,
    ]
  );

  // 处理触摸结束
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (disabled || !supportsTouch) return;

      if (preventDefault) {
        e.preventDefault();
      }

      clearLongPressTimer();

      const now = Date.now();
      const deltaTime = now - touchState.startTime;
      const deltaX = touchState.currentX - touchState.startX;
      const deltaY = touchState.currentY - touchState.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 处理轻触
      if (distance < tapThreshold && deltaTime < 300) {
        const timeSinceLastTap = now - touchState.lastTapTime;

        if (timeSinceLastTap < 300) {
          // 双击
          onDoubleTap?.();
        } else {
          // 单击
          onTap?.();
        }

        setTouchState(prev => ({ ...prev, lastTapTime: now }));
      }

      // 处理滑动手势
      if (distance > swipeThreshold && deltaTime < 500) {
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        if (absDeltaX > absDeltaY) {
          // 水平滑动
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        } else {
          // 垂直滑动
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      }

      // 重置状态
      setTouchState(prev => ({
        ...prev,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        startTime: 0,
        isLongPress: false,
        touchCount: 0,
      }));
    },
    [
      disabled,
      supportsTouch,
      preventDefault,
      tapThreshold,
      swipeThreshold,
      clearLongPressTimer,
      touchState,
      onTap,
      onDoubleTap,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
    ]
  );

  // 处理多点触控（捏合手势）
  const handleTouchMoveMulti = useCallback(
    (e: TouchEvent) => {
      if (disabled || !supportsTouch || e.touches.length !== 2) return;

      if (preventDefault) {
        e.preventDefault();
      }

      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      // 这里需要存储初始距离来计算缩放比例
      // 简化实现，实际应用中需要更复杂的状态管理
      onPinch?.(distance / 100); // 简化的缩放计算
    },
    [disabled, supportsTouch, preventDefault, onPinch]
  );

  // 绑定事件监听器
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !supportsTouch) return;

    element.addEventListener('touchstart', handleTouchStart, {
      passive: !preventDefault,
    });
    element.addEventListener('touchmove', handleTouchMove, {
      passive: !preventDefault,
    });
    element.addEventListener('touchmove', handleTouchMoveMulti, {
      passive: !preventDefault,
    });
    element.addEventListener('touchend', handleTouchEnd, {
      passive: !preventDefault,
    });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchmove', handleTouchMoveMulti);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    handleTouchStart,
    handleTouchMove,
    handleTouchMoveMulti,
    handleTouchEnd,
    supportsTouch,
    preventDefault,
  ]);

  // 清理定时器
  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, [clearLongPressTimer]);

  return (
    <div
      ref={elementRef}
      className={cn(
        'touch-manipulation',
        isMobile && 'touch-pan-y',
        isTablet && 'touch-pan-y',
        className
      )}
    >
      {children}
    </div>
  );
}

// 滑动手势组件
interface SwipeGestureProps {
  children: React.ReactNode;
  className?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  disabled?: boolean;
}

export function SwipeGesture({
  children,
  className,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  disabled = false,
}: SwipeGestureProps) {
  return (
    <TouchGestures
      onSwipeLeft={onSwipeLeft}
      onSwipeRight={onSwipeRight}
      onSwipeUp={onSwipeUp}
      onSwipeDown={onSwipeDown}
      swipeThreshold={threshold}
      disabled={disabled}
      className={className}
    >
      {children}
    </TouchGestures>
  );
}

// 点击手势组件
interface TapGestureProps {
  children: React.ReactNode;
  className?: string;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  longPressDelay?: number;
  disabled?: boolean;
}

export function TapGesture({
  children,
  className,
  onTap,
  onDoubleTap,
  onLongPress,
  longPressDelay = 500,
  disabled = false,
}: TapGestureProps) {
  return (
    <TouchGestures
      onTap={onTap}
      onDoubleTap={onDoubleTap}
      onLongPress={onLongPress}
      longPressDelay={longPressDelay}
      disabled={disabled}
      className={className}
    >
      {children}
    </TouchGestures>
  );
}

// 捏合手势组件
interface PinchGestureProps {
  children: React.ReactNode;
  className?: string;
  onPinch?: (scale: number) => void;
  threshold?: number;
  disabled?: boolean;
}

export function PinchGesture({
  children,
  className,
  onPinch,
  threshold = 0.1,
  disabled = false,
}: PinchGestureProps) {
  return (
    <TouchGestures
      onPinch={onPinch}
      pinchThreshold={threshold}
      disabled={disabled}
      className={className}
    >
      {children}
    </TouchGestures>
  );
}

// 滚动优化组件
interface ScrollOptimizedProps {
  children: React.ReactNode;
  className?: string;
  smooth?: boolean;
  momentum?: boolean;
  bounce?: boolean;
  disabled?: boolean;
}

export function ScrollOptimized({
  children,
  className,
  smooth = true,
  momentum = true,
  bounce = true,
  disabled = false,
}: ScrollOptimizedProps) {
  const { isMobile } = useCrossPlatform();

  return (
    <div
      className={cn(
        'overflow-auto',
        smooth && 'scroll-smooth',
        momentum && isMobile && 'scroll-momentum',
        bounce && isMobile && 'scroll-bounce',
        disabled && 'overflow-hidden',
        className
      )}
      style={{
        WebkitOverflowScrolling: momentum ? 'touch' : 'auto',
        overscrollBehavior: bounce ? 'auto' : 'contain',
      }}
    >
      {children}
    </div>
  );
}
