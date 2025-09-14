'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useCrossPlatform } from './cross-platform-provider';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  // 布局配置
  mobileLayout?: 'stack' | 'grid' | 'flex';
  tabletLayout?: 'stack' | 'grid' | 'flex';
  desktopLayout?: 'stack' | 'grid' | 'flex';
  // 间距配置
  mobileSpacing?: 'none' | 'sm' | 'md' | 'lg';
  tabletSpacing?: 'none' | 'sm' | 'md' | 'lg';
  desktopSpacing?: 'none' | 'sm' | 'md' | 'lg';
  // 网格配置
  mobileCols?: 1 | 2 | 3 | 4;
  tabletCols?: 1 | 2 | 3 | 4 | 6;
  desktopCols?: 1 | 2 | 3 | 4 | 6 | 8 | 12;
  // 断点配置
  breakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export function ResponsiveLayout({
  children,
  className,
  mobileLayout = 'stack',
  tabletLayout = 'grid',
  desktopLayout = 'grid',
  mobileSpacing = 'md',
  tabletSpacing = 'md',
  desktopSpacing = 'lg',
  mobileCols = 1,
  tabletCols = 2,
  desktopCols = 3,
  breakpoints = {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
  },
}: ResponsiveLayoutProps) {
  const { screenWidth, isMobile, isTablet, isDesktop } = useCrossPlatform();

  // 根据屏幕宽度确定当前布局
  const getCurrentLayout = () => {
    if (screenWidth < breakpoints.mobile) return mobileLayout;
    if (screenWidth < breakpoints.tablet) return tabletLayout;
    return desktopLayout;
  };

  const getCurrentSpacing = () => {
    if (screenWidth < breakpoints.mobile) return mobileSpacing;
    if (screenWidth < breakpoints.tablet) return tabletSpacing;
    return desktopSpacing;
  };

  const getCurrentCols = () => {
    if (screenWidth < breakpoints.mobile) return mobileCols;
    if (screenWidth < breakpoints.tablet) return tabletCols;
    return desktopCols;
  };

  const currentLayout = getCurrentLayout();
  const currentSpacing = getCurrentSpacing();
  const currentCols = getCurrentCols();

  // 间距类名映射
  const spacingClasses = {
    none: '',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  // 布局类名映射
  const layoutClasses = {
    stack: 'flex flex-col',
    grid: `grid grid-cols-${currentCols}`,
    flex: 'flex flex-wrap',
  };

  return (
    <div
      className={cn(
        layoutClasses[currentLayout],
        spacingClasses[currentSpacing],
        className
      )}
    >
      {children}
    </div>
  );
}

// 响应式容器组件
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  center?: boolean;
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = 'xl',
  padding = true,
  center = true,
}: ResponsiveContainerProps) {
  const { isMobile, isTablet } = useCrossPlatform();

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'w-full',
        maxWidthClasses[maxWidth],
        center && 'mx-auto',
        padding && 'px-4 sm:px-6 lg:px-8',
        isMobile && 'px-3',
        isTablet && 'px-4',
        className
      )}
    >
      {children}
    </div>
  );
}

// 响应式网格组件
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: 1 | 2;
    tablet?: 2 | 3 | 4;
    desktop?: 3 | 4 | 6 | 8 | 12;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveGrid({
  children,
  className,
  cols = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
  gap = 'md',
}: ResponsiveGridProps) {
  const gapClasses = {
    none: '',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  return (
    <div
      className={cn(
        'grid',
        `grid-cols-${cols.mobile}`,
        `sm:grid-cols-${cols.tablet}`,
        `lg:grid-cols-${cols.desktop}`,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

// 响应式文本组件
interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  size?: {
    mobile?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
    tablet?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
    desktop?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  };
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'accent';
}

export function ResponsiveText({
  children,
  className,
  size = {
    mobile: 'base',
    tablet: 'base',
    desktop: 'lg',
  },
  weight = 'normal',
  color = 'primary',
}: ResponsiveTextProps) {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const colorClasses = {
    primary: 'text-foreground',
    secondary: 'text-muted-foreground',
    muted: 'text-muted-foreground',
    accent: 'text-accent-foreground',
  };

  return (
    <div
      className={cn(
        sizeClasses[size.mobile || 'base'],
        `sm:${sizeClasses[size.tablet || 'base']}`,
        `lg:${sizeClasses[size.desktop || 'lg']}`,
        weightClasses[weight],
        colorClasses[color],
        className
      )}
    >
      {children}
    </div>
  );
}

// 响应式按钮组件
interface ResponsiveButtonProps {
  children: React.ReactNode;
  className?: string;
  size?: {
    mobile?: 'sm' | 'md' | 'lg';
    tablet?: 'sm' | 'md' | 'lg';
    desktop?: 'sm' | 'md' | 'lg' | 'xl';
  };
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  fullWidth?: {
    mobile?: boolean;
    tablet?: boolean;
    desktop?: boolean;
  };
}

export function ResponsiveButton({
  children,
  className,
  size = {
    mobile: 'md',
    tablet: 'md',
    desktop: 'lg',
  },
  variant = 'default',
  fullWidth = {
    mobile: true,
    tablet: false,
    desktop: false,
  },
}: ResponsiveButtonProps) {
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg',
    xl: 'h-14 px-8 text-xl',
  };

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline:
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        sizeClasses[size.mobile || 'md'],
        `sm:${sizeClasses[size.tablet || 'md']}`,
        `lg:${sizeClasses[size.desktop || 'lg']}`,
        variantClasses[variant],
        fullWidth.mobile && 'w-full',
        !fullWidth.tablet && 'sm:w-auto',
        !fullWidth.desktop && 'lg:w-auto',
        className
      )}
    >
      {children}
    </button>
  );
}
