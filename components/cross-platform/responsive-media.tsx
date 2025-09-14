'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useCrossPlatform } from './cross-platform-provider';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  // 响应式配置
  sizes?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    wide?: string;
  };
  // 图片配置
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  // 加载状态
  showLoading?: boolean;
  loadingText?: string;
  // 错误处理
  fallbackSrc?: string;
  showError?: boolean;
  errorText?: string;
  // 交互功能
  clickable?: boolean;
  onImageClick?: () => void;
  // 懒加载
  lazy?: boolean;
  threshold?: number;
}

export function ResponsiveImage({
  src,
  alt,
  className,
  sizes = {
    mobile: '100vw',
    tablet: '50vw',
    desktop: '33vw',
    wide: '25vw',
  },
  priority = false,
  quality = 75,
  fill = false,
  objectFit = 'cover',
  showLoading = true,
  loadingText = '加载中...',
  fallbackSrc,
  showError = true,
  errorText = '图片加载失败',
  clickable = false,
  onImageClick,
  lazy = true,
  threshold = 0.1,
}: ResponsiveImageProps) {
  const { isMobile, isTablet, isDesktop, screenWidth } = useCrossPlatform();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);

  // 计算响应式尺寸
  const getResponsiveSizes = () => {
    if (isMobile) return sizes.mobile;
    if (isTablet) return sizes.tablet;
    if (isDesktop) return sizes.desktop;
    return sizes.wide;
  };

  // 计算响应式类名
  const getResponsiveClasses = () => {
    const baseClasses = 'transition-all duration-300';

    if (fill) {
      return cn(
        baseClasses,
        'absolute inset-0 h-full w-full',
        `object-${objectFit}`,
        clickable && 'cursor-pointer hover:scale-105',
        className
      );
    }

    return cn(
      baseClasses,
      'h-auto w-full',
      `object-${objectFit}`,
      clickable && 'cursor-pointer hover:scale-105',
      className
    );
  };

  // 懒加载检测
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView, threshold]);

  // 处理图片加载
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // 处理图片错误
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // 处理图片点击
  const handleClick = () => {
    if (clickable && onImageClick) {
      onImageClick();
    }
  };

  if (hasError && fallbackSrc) {
    return (
      <ResponsiveImage
        src={fallbackSrc}
        alt={alt}
        className={className}
        sizes={sizes}
        priority={priority}
        quality={quality}
        fill={fill}
        objectFit={objectFit}
        clickable={clickable}
        onImageClick={onImageClick}
        lazy={lazy}
        threshold={threshold}
      />
    );
  }

  if (hasError && showError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          fill ? 'absolute inset-0' : 'h-32 w-full',
          className
        )}
        onClick={handleClick}
      >
        <div className='text-center'>
          <div className='text-sm'>{errorText}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        fill && 'w-full h-full',
        clickable && 'cursor-pointer'
      )}
      onClick={handleClick}
    >
      {isLoading && showLoading && (
        <div className='absolute inset-0 flex items-center justify-center bg-muted'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2'></div>
            <div className='text-sm text-muted-foreground'>{loadingText}</div>
          </div>
        </div>
      )}

      {isInView && (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          quality={quality}
          priority={priority}
          sizes={getResponsiveSizes()}
          className={getResponsiveClasses()}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}

// 响应式视频组件
interface ResponsiveVideoProps {
  src: string;
  poster?: string;
  className?: string;
  // 响应式配置
  aspectRatio?: '16:9' | '4:3' | '1:1' | '21:9';
  // 视频配置
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  // 加载状态
  showLoading?: boolean;
  loadingText?: string;
  // 错误处理
  showError?: boolean;
  errorText?: string;
  // 交互功能
  clickable?: boolean;
  onVideoClick?: () => void;
  // 懒加载
  lazy?: boolean;
  threshold?: number;
}

export function ResponsiveVideo({
  src,
  poster,
  className,
  aspectRatio = '16:9',
  controls = true,
  autoplay = false,
  loop = false,
  muted = true,
  playsInline = true,
  showLoading = true,
  loadingText = '视频加载中...',
  showError = true,
  errorText = '视频加载失败',
  clickable = false,
  onVideoClick,
  lazy = true,
  threshold = 0.1,
}: ResponsiveVideoProps) {
  const { isMobile, isTablet } = useCrossPlatform();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 宽高比类名
  const aspectRatioClasses = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
    '21:9': 'aspect-[21/9]',
  };

  // 懒加载检测
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView, threshold]);

  // 处理视频加载
  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  // 处理视频错误
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // 处理视频点击
  const handleClick = () => {
    if (clickable && onVideoClick) {
      onVideoClick();
    }
  };

  if (hasError && showError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          aspectRatioClasses[aspectRatio],
          className
        )}
        onClick={handleClick}
      >
        <div className='text-center'>
          <div className='text-sm'>{errorText}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={videoRef}
      className={cn(
        'relative overflow-hidden',
        aspectRatioClasses[aspectRatio],
        clickable && 'cursor-pointer',
        className
      )}
      onClick={handleClick}
    >
      {isLoading && showLoading && (
        <div className='absolute inset-0 flex items-center justify-center bg-muted'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2'></div>
            <div className='text-sm text-muted-foreground'>{loadingText}</div>
          </div>
        </div>
      )}

      {isInView && (
        <video
          src={src}
          poster={poster}
          controls={controls}
          autoPlay={autoplay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          className='h-full w-full object-cover'
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
          onError={handleError}
        />
      )}
    </div>
  );
}

// 响应式图标组件
interface ResponsiveIconProps {
  icon: React.ReactNode;
  className?: string;
  // 响应式配置
  size?: {
    mobile?: 'sm' | 'md' | 'lg' | 'xl';
    tablet?: 'sm' | 'md' | 'lg' | 'xl';
    desktop?: 'md' | 'lg' | 'xl' | '2xl';
    wide?: 'lg' | 'xl' | '2xl' | '3xl';
  };
  // 交互功能
  clickable?: boolean;
  onClick?: () => void;
  // 状态
  disabled?: boolean;
  loading?: boolean;
}

export function ResponsiveIcon({
  icon,
  className,
  size = {
    mobile: 'md',
    tablet: 'md',
    desktop: 'lg',
    wide: 'xl',
  },
  clickable = false,
  onClick,
  disabled = false,
  loading = false,
}: ResponsiveIconProps) {
  const { isMobile, isTablet, isDesktop } = useCrossPlatform();

  // 尺寸类名
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10',
    '2xl': 'h-12 w-12',
    '3xl': 'h-16 w-16',
  };

  // 获取当前尺寸
  const getCurrentSize = () => {
    if (isMobile) return size.mobile || 'md';
    if (isTablet) return size.tablet || 'md';
    if (isDesktop) return size.desktop || 'lg';
    return size.wide || 'xl';
  };

  const currentSize = getCurrentSize();

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center',
        sizeClasses[currentSize],
        clickable &&
          !disabled &&
          'cursor-pointer hover:scale-110 transition-transform',
        disabled && 'opacity-50 cursor-not-allowed',
        loading && 'animate-pulse',
        className
      )}
      onClick={disabled || loading ? undefined : onClick}
    >
      {loading ? (
        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current'></div>
      ) : (
        icon
      )}
    </div>
  );
}

// 响应式容器组件
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  // 响应式配置
  maxWidth?: {
    mobile?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    tablet?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    desktop?: 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full';
    wide?: 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full';
  };
  padding?: {
    mobile?: 'none' | 'sm' | 'md' | 'lg';
    tablet?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    desktop?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    wide?: 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  };
  center?: boolean;
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = {
    mobile: 'full',
    tablet: 'xl',
    desktop: '2xl',
    wide: '4xl',
  },
  padding = {
    mobile: 'md',
    tablet: 'lg',
    desktop: 'xl',
    wide: '2xl',
  },
  center = true,
}: ResponsiveContainerProps) {
  const { isMobile, isTablet, isDesktop } = useCrossPlatform();

  // 最大宽度类名
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-full',
  };

  // 内边距类名
  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    '2xl': 'p-12',
    '3xl': 'p-16',
  };

  // 获取当前配置
  const getCurrentMaxWidth = () => {
    if (isMobile) return maxWidth.mobile || 'full';
    if (isTablet) return maxWidth.tablet || 'xl';
    if (isDesktop) return maxWidth.desktop || '2xl';
    return maxWidth.wide || '4xl';
  };

  const getCurrentPadding = () => {
    if (isMobile) return padding.mobile || 'md';
    if (isTablet) return padding.tablet || 'lg';
    if (isDesktop) return padding.desktop || 'xl';
    return padding.wide || '2xl';
  };

  return (
    <div
      className={cn(
        'w-full',
        maxWidthClasses[getCurrentMaxWidth()],
        center && 'mx-auto',
        paddingClasses[getCurrentPadding()],
        className
      )}
    >
      {children}
    </div>
  );
}
