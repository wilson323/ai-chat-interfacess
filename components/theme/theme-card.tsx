/**
 * 主题卡片组件
 * 显示单个主题的预览和选择
 */

'use client';

import React from 'react';
import { ThemeCardProps } from '../../types/theme';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedThemePreview } from './animated-theme-preview';

// 根据主题分类获取动画类型
function getAnimationType(
  category: string
): 'float' | 'bounce' | 'rotate' | 'pulse' | 'wiggle' {
  switch (category) {
    case 'modern':
      return 'float';
    case 'business':
      return 'pulse';
    case 'tech':
      return 'rotate';
    case 'nature':
      return 'bounce';
    case 'art':
      return 'wiggle';
    default:
      return 'float';
  }
}

// 根据主题分类获取动画持续时间
function getAnimationDuration(category: string): number {
  switch (category) {
    case 'modern':
      return 4;
    case 'business':
      return 3;
    case 'tech':
      return 5;
    case 'nature':
      return 2.5;
    case 'art':
      return 3.5;
    default:
      return 3;
  }
}

export function ThemeCard({
  theme,
  selected = false,
  onClick,
  className = '',
  showPreview = true,
  showDescription = true,
}: ThemeCardProps) {
  const handleClick = () => {
    onClick?.(theme.id);
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        selected && 'ring-2 ring-primary ring-offset-2',
        className
      )}
      onClick={handleClick}
    >
      <CardContent className='p-4'>
        {/* 主题预览 */}
        {showPreview && (
          <div className='relative mb-4'>
            <AnimatedThemePreview
              themeId={theme.id}
              imagePath={theme.preview}
              animationType={getAnimationType(theme.category)}
              duration={getAnimationDuration(theme.category)}
              animated={true}
              className='w-full h-24'
            />
            {selected && (
              <div className='absolute top-2 right-2'>
                <div className='w-6 h-6 bg-primary rounded-full flex items-center justify-center'>
                  <Check className='w-4 h-4 text-white' />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 主题信息 */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <h3 className='font-semibold text-sm'>{theme.name}</h3>
            <Badge variant='secondary' className='text-xs'>
              {theme.category}
            </Badge>
          </div>

          {showDescription && (
            <p className='text-xs text-muted-foreground line-clamp-2'>
              {theme.description}
            </p>
          )}

          {/* 色彩预览 */}
          <div className='flex space-x-1'>
            <div
              className='w-4 h-4 rounded-full border'
              style={{ backgroundColor: theme.colors.primary }}
              title='主色调'
            />
            <div
              className='w-4 h-4 rounded-full border'
              style={{ backgroundColor: theme.colors.secondary }}
              title='辅助色'
            />
            <div
              className='w-4 h-4 rounded-full border'
              style={{ backgroundColor: theme.colors.accent }}
              title='强调色'
            />
            <div
              className='w-4 h-4 rounded-full border'
              style={{ backgroundColor: theme.colors.success }}
              title='成功色'
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
