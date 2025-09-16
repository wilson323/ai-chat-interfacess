'use client';

import type React from 'react';

import { cn } from '../lib/utils';
import { useResponsive } from '../hooks/use-responsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = 'xl',
  padding = true,
}: ResponsiveContainerProps) {
  const { isMdAndDown } = useResponsive();

  const maxWidthClasses = {
    xs: 'max-w-xs',
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
        'w-full mx-auto',
        maxWidthClasses[maxWidth],
        padding && 'px-3 sm:px-4 md:px-6',
        isMdAndDown ? 'pb-16' : '', // 为移动导航栏留出空间
        className
      )}
    >
      {children}
    </div>
  );
}
