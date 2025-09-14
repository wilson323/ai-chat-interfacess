/**
 * 数据卡片组件
 * 用于展示结构化数据，支持标题、描述、图片、操作等
 */

'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';
import type { DataCardProps } from './types';

const DataCard = <T,>({
  data,
  title,
  description,
  image,
  actions,
  onClick,
  loading = false,
  hoverable = true,
  className,
  style,
  ...props
}: DataCardProps<T>) => {
  // 获取标题
  const getTitle = (): string => {
    if (typeof title === 'function') {
      return title(data);
    }
    return title || String(data);
  };

  // 获取描述
  const getDescription = (): string | undefined => {
    if (typeof description === 'function') {
      return description(data);
    }
    return description;
  };

  // 获取图片
  const getImage = (): string | undefined => {
    if (typeof image === 'function') {
      return image(data);
    }
    return image;
  };

  // 获取操作按钮
  const getActions = (): React.ReactNode => {
    if (typeof actions === 'function') {
      return actions(data);
    }
    return actions;
  };

  // 处理点击事件
  const handleClick = () => {
    if (!loading && onClick) {
      onClick(data);
    }
  };

  if (loading) {
    return (
      <Card className={cn('w-full', className)} style={style} {...props}>
        <CardHeader>
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-3 w-1/2' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-32 w-full mb-4' />
          <div className='flex space-x-2'>
            <Skeleton className='h-8 w-16' />
            <Skeleton className='h-8 w-16' />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'w-full transition-all duration-200',
        hoverable && 'hover:shadow-md hover:scale-[1.02]',
        onClick && 'cursor-pointer',
        className
      )}
      style={style}
      onClick={handleClick}
      {...props}
    >
      {/* 图片 */}
      {getImage() && (
        <div className='aspect-video w-full overflow-hidden rounded-t-lg'>
          <Image
            src={getImage()!}
            alt={getTitle()}
            className='h-full w-full object-cover'
            width={400}
            height={225}
          />
        </div>
      )}

      <CardHeader>
        <CardTitle className='line-clamp-2'>{getTitle()}</CardTitle>
        {getDescription() && (
          <CardDescription className='line-clamp-3'>
            {getDescription()}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        {/* 数据展示 */}
        <div className='space-y-2'>
          {Object.entries(data as Record<string, any>).map(([key, value]) => {
            // 跳过特殊字段
            if (['id', 'createdAt', 'updatedAt'].includes(key)) return null;

            // 跳过空值
            if (value === null || value === undefined || value === '')
              return null;

            // 跳过函数
            if (typeof value === 'function') return null;

            // 跳过对象和数组（复杂数据）
            if (typeof value === 'object') return null;

            return (
              <div
                key={key}
                className='flex items-center justify-between text-sm'
              >
                <span className='text-gray-500 capitalize'>
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className='font-medium'>
                  {typeof value === 'boolean' ? (
                    <Badge variant={value ? 'default' : 'secondary'}>
                      {value ? '是' : '否'}
                    </Badge>
                  ) : (
                    String(value)
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* 操作按钮 */}
        {getActions() && (
          <div className='mt-4 flex flex-wrap gap-2'>{getActions()}</div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataCard;
