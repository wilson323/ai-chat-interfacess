'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import NextImage from 'next/image';
import { useCrossPlatform } from '../cross-platform/cross-platform-provider';
import { useNetwork } from '../cross-platform/cross-platform-provider';

interface UXContextType {
  // 用户体验状态
  isLoading: boolean;
  isOffline: boolean;
  isSlowConnection: boolean;
  isLowEndDevice: boolean;
  isMobile: boolean;

  // 交互状态
  isAnimating: boolean;
  isScrolling: boolean;
  isTyping: boolean;

  // 性能指标
  loadTime: number;
  renderTime: number;
  memoryUsage: number;

  // 用户偏好
  prefersReducedMotion: boolean;
  prefersDarkMode: boolean;
  prefersHighContrast: boolean;

  // 操作方法
  setLoading: (loading: boolean) => void;
  setAnimating: (animating: boolean) => void;
  setScrolling: (scrolling: boolean) => void;
  setTyping: (typing: boolean) => void;
  updatePerformanceMetrics: (metrics: Partial<UXContextType>) => void;
}

const UXContext = createContext<UXContextType | null>(null);

interface EnhancedUXProviderProps {
  children: React.ReactNode;
}

export function EnhancedUXProvider({ children }: EnhancedUXProviderProps) {
  const { isMobile, screenWidth } = useCrossPlatform();
  const { isOnline, isSlowConnection } = useNetwork();

  const [state, setState] = useState<UXContextType>({
    isLoading: false,
    isOffline: !isOnline,
    isSlowConnection,
    isLowEndDevice: isMobile && screenWidth < 400,
    isMobile,
    isAnimating: false,
    isScrolling: false,
    isTyping: false,
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    prefersReducedMotion: false,
    prefersDarkMode: false,
    prefersHighContrast: false,
    setLoading: () => {},
    setAnimating: () => {},
    setScrolling: () => {},
    setTyping: () => {},
    updatePerformanceMetrics: () => {},
  });

  // 检测用户偏好
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const prefersDarkMode = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    const prefersHighContrast = window.matchMedia(
      '(prefers-contrast: high)'
    ).matches;

    setState(prev => ({
      ...prev,
      prefersReducedMotion,
      prefersDarkMode,
      prefersHighContrast,
    }));
  }, []);

  // 性能监控
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const startTime = performance.now();

    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'navigation') {
          const navigationEntry = entry as PerformanceNavigationTiming;
          setState(prev => ({
            ...prev,
            loadTime:
              navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'paint'] });

    // 内存使用监控
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory && memory.usedJSHeapSize && memory.jsHeapSizeLimit) {
        setState(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / memory.jsHeapSizeLimit,
        }));
      }
    }

    const endTime = performance.now();
    setState(prev => ({
      ...prev,
      renderTime: endTime - startTime,
    }));

    return () => observer.disconnect();
  }, []);

  // 滚动检测
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let scrollTimer: NodeJS.Timeout;

    const handleScroll = () => {
      setState(prev => ({ ...prev, isScrolling: true }));

      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        setState(prev => ({ ...prev, isScrolling: false }));
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, []);

  // 键盘输入检测
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let typingTimer: NodeJS.Timeout;

    const handleTyping = () => {
      setState(prev => ({ ...prev, isTyping: true }));

      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        setState(prev => ({ ...prev, isTyping: false }));
      }, 1000);
    };

    document.addEventListener('keydown', handleTyping);
    return () => {
      document.removeEventListener('keydown', handleTyping);
      clearTimeout(typingTimer);
    };
  }, []);

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  };

  const setAnimating = (animating: boolean) => {
    setState(prev => ({ ...prev, isAnimating: animating }));
  };

  const setScrolling = (scrolling: boolean) => {
    setState(prev => ({ ...prev, isScrolling: scrolling }));
  };

  const setTyping = (typing: boolean) => {
    setState(prev => ({ ...prev, isTyping: typing }));
  };

  const updatePerformanceMetrics = (metrics: Partial<UXContextType>) => {
    setState(prev => ({ ...prev, ...metrics }));
  };

  const contextValue: UXContextType = {
    ...state,
    setLoading,
    setAnimating,
    setScrolling,
    setTyping,
    updatePerformanceMetrics,
  };

  return (
    <UXContext.Provider value={contextValue}>{children}</UXContext.Provider>
  );
}

export function useEnhancedUX() {
  const context = useContext(UXContext);
  if (!context) {
    throw new Error('useEnhancedUX must be used within an EnhancedUXProvider');
  }
  return context;
}

// 智能加载组件
interface SmartLoadingProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minLoadTime?: number;
}

export function SmartLoading({
  children,
  fallback = <div className='animate-pulse bg-gray-200 h-4 w-full rounded' />,
  minLoadTime = 300,
}: SmartLoadingProps) {
  const { isLoading, isLowEndDevice } = useEnhancedUX();
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShowFallback(true);

      // 根据设备性能调整最小加载时间
      const adjustedMinTime = isLowEndDevice ? minLoadTime * 1.5 : minLoadTime;

      const timer = setTimeout(() => {
        setShowFallback(false);
      }, adjustedMinTime);

      return () => clearTimeout(timer);
    }
    // 确保所有路径都有返回值
    return undefined;
  }, [isLoading, minLoadTime, isLowEndDevice]);

  
  if (showFallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// 自适应动画组件
interface AdaptiveAnimationProps {
  children: React.ReactNode;
  className?: string;
  animationClass?: string;
}

export function AdaptiveAnimation({
  children,
  className = '',
  animationClass = 'animate-fade-in',
}: AdaptiveAnimationProps) {
  const { prefersReducedMotion, isLowEndDevice, isSlowConnection } =
    useEnhancedUX();

  // 根据用户偏好和设备性能决定是否使用动画
  const shouldAnimate =
    !prefersReducedMotion && !isLowEndDevice && !isSlowConnection;

  return (
    <div className={`${className} ${shouldAnimate ? animationClass : ''}`}>
      {children}
    </div>
  );
}

// 智能图片组件
interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function SmartImage({
  src,
  alt,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}: SmartImageProps) {
  const { isSlowConnection, isLowEndDevice } = useEnhancedUX();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 根据网络和设备性能调整图片质量
  const getOptimizedSrc = (originalSrc: string) => {
    if (isSlowConnection || isLowEndDevice) {
      // 使用低质量图片或WebP格式
      return originalSrc.replace(/\.(jpg|jpeg|png)$/, '.webp');
    }
    return originalSrc;
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!imageLoaded && !imageError && (
        <div className='absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center'>
          <div className='w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin' />
        </div>
      )}

      <NextImage
        src={getOptimizedSrc(src)}
        alt={alt}
        fill
        className={`transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        priority={priority}
        sizes={sizes}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />

      {imageError && (
        <div className='absolute inset-0 bg-gray-100 flex items-center justify-center'>
          <span className='text-gray-400 text-sm'>图片加载失败</span>
        </div>
      )}
    </div>
  );
}

// 响应式容器组件
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobileClass?: string;
  tabletClass?: string;
  desktopClass?: string;
}

export function ResponsiveContainer({
  children,
  className = '',
  mobileClass = '',
  tabletClass = '',
  desktopClass = '', // 未使用的参数，保留用于未来扩展
}: ResponsiveContainerProps) {
  const { isMobile, isTablet } = useCrossPlatform(); // isDesktop 未使用，保留用于未来扩展

  const getResponsiveClass = () => {
    if (isMobile) return mobileClass;
    if (isTablet) return tabletClass;
    // desktopClass 保留用于未来扩展，目前未使用
    void desktopClass; // 显式使用以避免TS6133错误
    return '';
  };

  return (
    <div className={`${className} ${getResponsiveClass()}`}>
      {children}
    </div>
  );
}

// 触摸反馈组件
interface TouchFeedbackProps {
  children: React.ReactNode;
  onTap?: () => void;
  onLongPress?: () => void;
  className?: string;
  feedbackClass?: string;
}

export function TouchFeedback({
  children,
  onTap,
  onLongPress,
  className = '',
  feedbackClass = 'scale-95',
}: TouchFeedbackProps) {
  const { supportsTouch } = useCrossPlatform();
  const [isPressed, setIsPressed] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const handleTouchStart = () => {
    if (!supportsTouch) return;

    setIsPressed(true);

    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
        setIsPressed(false);
      }, 500);
      setLongPressTimer(timer);
    }
  };

  const handleTouchEnd = () => {
    if (!supportsTouch) return;

    setIsPressed(false);

    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    if (onTap) {
      onTap();
    }
  };

  const handleMouseDown = () => {
    if (supportsTouch) return;
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    if (supportsTouch) return;
    setIsPressed(false);
    if (onTap) onTap();
  };

  return (
    <div
      className={`${className} ${isPressed ? feedbackClass : ''} transition-transform duration-100`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {children}
    </div>
  );
}
