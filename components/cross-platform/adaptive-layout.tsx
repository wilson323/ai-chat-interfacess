'use client';

import React, { useEffect, useState } from 'react';
import NextImage from 'next/image';
import { cn } from '@/lib/utils';
import { useCrossPlatform } from './cross-platform-provider';

interface AdaptiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  // 自适应配置
  adaptiveSpacing?: boolean;
  adaptiveTypography?: boolean;
  adaptiveImages?: boolean;
  adaptiveNavigation?: boolean;
  // 断点配置
  breakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
    wide: number;
  };
}

export function AdaptiveLayout({
  children,
  className,
  adaptiveSpacing = true,
  adaptiveTypography = true,
  // adaptiveImages = true, // 未使用的参数，保留用于未来扩展
  // adaptiveNavigation = true, // 未使用的参数，保留用于未来扩展,
  breakpoints = {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    wide: 1280,
  },
}: AdaptiveLayoutProps) {
  const { isMobile, isTablet, isDesktop, screenWidth } = useCrossPlatform();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return <div className='min-h-screen'>{children}</div>;
  }
  const getLayoutMode = () => {
    if (screenWidth < breakpoints.mobile) return 'mobile';
    if (screenWidth < breakpoints.tablet) return 'tablet';
    if (screenWidth < breakpoints.desktop) return 'desktop';
    return 'wide';
  };

  const layoutMode = getLayoutMode();

  // 自适应间距
  const getAdaptiveSpacing = () => {
    if (!adaptiveSpacing) return '';

    switch (layoutMode) {
      case 'mobile':
        return 'px-3 py-2 space-y-3';
      case 'tablet':
        return 'px-4 py-3 space-y-4';
      case 'desktop':
        return 'px-6 py-4 space-y-6';
      case 'wide':
        return 'px-8 py-6 space-y-8';
      default:
        return 'px-4 py-3 space-y-4';
    }
  };

  // 自适应字体大小
  const getAdaptiveTypography = () => {
    if (!adaptiveTypography) return '';

    switch (layoutMode) {
      case 'mobile':
        return 'text-sm leading-relaxed';
      case 'tablet':
        return 'text-base leading-relaxed';
      case 'desktop':
        return 'text-lg leading-relaxed';
      case 'wide':
        return 'text-xl leading-relaxed';
      default:
        return 'text-base leading-relaxed';
    }
  };

  return (
    <div
      className={cn(
        'min-h-screen w-full',
        getAdaptiveSpacing(),
        getAdaptiveTypography(),
        // 移动端优化
        isMobile && 'touch-pan-y',
        // 平板优化
        isTablet && 'touch-pan-y',
        // 桌面端优化
        isDesktop && 'hover:shadow-lg transition-shadow',
        className
      )}
    >
      {children}
    </div>
  );
}

// 自适应容器组件
interface AdaptiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  center?: boolean;
  fluid?: boolean;
}

export function AdaptiveContainer({
  children,
  className,
  maxWidth = 'xl',
  padding = true,
  center = true,
  fluid = false,
}: AdaptiveContainerProps) {
  const { isMobile, isTablet } = useCrossPlatform();

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  const getPadding = () => {
    if (!padding) return '';

    if (isMobile) return 'px-3';
    if (isTablet) return 'px-4';
    return 'px-6';
  };

  return (
    <div
      className={cn(
        'w-full',
        !fluid && maxWidthClasses[maxWidth],
        center && 'mx-auto',
        getPadding(),
        className
      )}
    >
      {children}
    </div>
  );
}

// 自适应网格组件
interface AdaptiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: 1 | 2;
    tablet?: 2 | 3 | 4;
    desktop?: 3 | 4 | 6 | 8;
    wide?: 4 | 6 | 8 | 12;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  autoFit?: boolean;
}

export function AdaptiveGrid({
  children,
  className,
  cols = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    wide: 4,
  },
  gap = 'md',
  autoFit = false,
}: AdaptiveGridProps) {
  const gapClasses = {
    none: '',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  if (autoFit) {
    return (
      <div
        className={cn(
          'grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))]',
          gapClasses[gap],
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid',
        `grid-cols-${cols.mobile}`,
        `sm:grid-cols-${cols.tablet}`,
        `lg:grid-cols-${cols.desktop}`,
        `xl:grid-cols-${cols.wide}`,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

// 自适应文本组件
interface AdaptiveTextProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  size?: {
    mobile?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
    tablet?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
    desktop?: 'base' | 'lg' | 'xl' | '2xl' | '3xl';
    wide?: 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  };
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'destructive';
  align?: 'left' | 'center' | 'right' | 'justify';
  responsive?: boolean;
}

export function AdaptiveText({
  children,
  className,
  as: Component = 'p',
  size = {
    mobile: 'base',
    tablet: 'base',
    desktop: 'lg',
    wide: 'xl',
  },
  weight = 'normal',
  color = 'primary',
  align = 'left',
  responsive = true,
}: AdaptiveTextProps) {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  };

  const colorClasses = {
    primary: 'text-foreground',
    secondary: 'text-muted-foreground',
    muted: 'text-muted-foreground',
    accent: 'text-accent-foreground',
    destructive: 'text-destructive-foreground',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  return (
    <Component
      className={cn(
        responsive && sizeClasses[size.mobile || 'base'],
        responsive && `sm:${sizeClasses[size.tablet || 'base']}`,
        responsive && `lg:${sizeClasses[size.desktop || 'lg']}`,
        responsive && `xl:${sizeClasses[size.wide || 'xl']}`,
        weightClasses[weight],
        colorClasses[color],
        alignClasses[align],
        className
      )}
    >
      {children}
    </Component>
  );
}

// 自适应按钮组件
interface AdaptiveButtonProps {
  children: React.ReactNode;
  className?: string;
  size?: {
    mobile?: 'sm' | 'md' | 'lg';
    tablet?: 'sm' | 'md' | 'lg';
    desktop?: 'md' | 'lg' | 'xl';
    wide?: 'lg' | 'xl' | '2xl';
  };
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive';
  fullWidth?: {
    mobile?: boolean;
    tablet?: boolean;
    desktop?: boolean;
    wide?: boolean;
  };
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export function AdaptiveButton({
  children,
  className,
  size = {
    mobile: 'md',
    tablet: 'md',
    desktop: 'lg',
    wide: 'xl',
  },
  variant = 'default',
  fullWidth = {
    mobile: true,
    tablet: false,
    desktop: false,
    wide: false,
  },
  disabled = false,
  loading = false,
  onClick,
}: AdaptiveButtonProps) {
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg',
    xl: 'h-14 px-8 text-xl',
    '2xl': 'h-16 px-10 text-2xl',
  };

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline:
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
    destructive:
      'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        sizeClasses[size.mobile || 'md'],
        `sm:${sizeClasses[size.tablet || 'md']}`,
        `lg:${sizeClasses[size.desktop || 'lg']}`,
        `xl:${sizeClasses[size.wide || 'xl']}`,
        variantClasses[variant],
        fullWidth.mobile && 'w-full',
        !fullWidth.tablet && 'sm:w-auto',
        !fullWidth.desktop && 'lg:w-auto',
        !fullWidth.wide && 'xl:w-auto',
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <svg className='mr-2 h-4 w-4 animate-spin' viewBox='0 0 24 24'>
          <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'
            fill='none'
          />
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
          />
        </svg>
      )}
      {children}
    </button>
  );
}

// 自适应图片组件
interface AdaptiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    wide?: string;
  };
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export function AdaptiveImage({
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
  // quality = 75, // 未使用的参数，保留用于未来扩展
  fill = false,
  objectFit = 'cover',
}: AdaptiveImageProps) {
  const { isMobile, isTablet, isDesktop } = useCrossPlatform();

  const getResponsiveSizes = () => {
    if (isMobile) return sizes.mobile;
    if (isTablet) return sizes.tablet;
    if (isDesktop) return sizes.desktop;
    return sizes.wide;
  };

  if (fill) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        <NextImage
          src={src}
          alt={alt}
          fill
          className={cn(
            `object-${objectFit}`,
            'transition-transform duration-300 hover:scale-105'
          )}
          priority={priority}
          sizes={getResponsiveSizes()}
        />
      </div>
    );
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      width={800}
      height={600}
      className={cn(
        'h-auto w-full',
        `object-${objectFit}`,
        'transition-transform duration-300 hover:scale-105',
        className
      )}
      priority={priority}
      sizes={getResponsiveSizes()}
    />
  );
}
