/**
 * 动画主题预览组件
 * 为Lovart设计资源添加动效
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AnimatedThemePreviewProps {
  /** 主题ID */
  themeId: string;
  /** 预览图片路径 */
  imagePath: string;
  /** 动画类型 */
  animationType?: 'float' | 'bounce' | 'rotate' | 'pulse' | 'wiggle';
  /** 动画持续时间 */
  duration?: number;
  /** 是否启用动画 */
  animated?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

export function AnimatedThemePreview({
  themeId,
  imagePath,
  animationType = 'float',
  duration = 3,
  animated = true,
  className = '',
}: AnimatedThemePreviewProps) {
  const getAnimationClass = () => {
    if (!animated) return '';

    const baseClass = 'theme-preview-animated';
    const animationClass = `theme-preview-${animationType}`;

    return `${baseClass} ${animationClass}`;
  };

  const getAnimationStyle = () => {
    if (!animated) return {};

    return {
      animationDuration: `${duration}s`,
    };
  };

  return (
    <div
      className={cn(
        'relative w-full h-24 rounded-lg overflow-hidden',
        'bg-gradient-to-br from-gray-100 to-gray-200',
        'dark:from-gray-800 dark:to-gray-900',
        getAnimationClass(),
        className
      )}
      style={getAnimationStyle()}
    >
      <Image
        src={imagePath}
        alt={`${themeId} theme preview`}
        fill
        className='object-contain'
        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
      />

      {/* 动画装饰元素 */}
      {animated && (
        <>
          <div className='absolute top-1 right-1 w-2 h-2 bg-white rounded-full opacity-60 animate-ping' />
          <div className='absolute bottom-1 left-1 w-1 h-1 bg-white rounded-full opacity-40 animate-pulse' />
        </>
      )}
    </div>
  );
}

/**
 * 主题特定的动画预览组件
 */
export function ModernThemePreview({ className = '' }: { className?: string }) {
  return (
    <AnimatedThemePreview
      themeId='modern'
      imagePath='/theme-previews/modern-preview.png'
      animationType='float'
      duration={4}
      className={className}
    />
  );
}

export function BusinessThemePreview({
  className = '',
}: {
  className?: string;
}) {
  return (
    <AnimatedThemePreview
      themeId='business'
      imagePath='/theme-previews/business-preview.png'
      animationType='pulse'
      duration={3}
      className={className}
    />
  );
}

export function TechThemePreview({ className = '' }: { className?: string }) {
  return (
    <AnimatedThemePreview
      themeId='tech'
      imagePath='/theme-previews/tech-preview.png'
      animationType='rotate'
      duration={5}
      className={className}
    />
  );
}

export function NatureThemePreview({ className = '' }: { className?: string }) {
  return (
    <AnimatedThemePreview
      themeId='nature'
      imagePath='/theme-previews/nature-preview.png'
      animationType='bounce'
      duration={2.5}
      className={className}
    />
  );
}

export function ArtThemePreview({ className = '' }: { className?: string }) {
  return (
    <AnimatedThemePreview
      themeId='art'
      imagePath='/theme-previews/art-preview.png'
      animationType='wiggle'
      duration={3.5}
      className={className}
    />
  );
}
