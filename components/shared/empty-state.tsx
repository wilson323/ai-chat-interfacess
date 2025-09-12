/**
 * 空状态组件
 * 基于 shadcn/ui 设计系统的包装组件
 */

'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { FileX, Search, AlertCircle, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EmptyStateProps } from './types'

const EmptyState = ({
  icon,
  title = '暂无数据',
  description = '当前没有可显示的内容',
  action,
  actionText = '刷新',
  onAction,
  size = 'default',
  className,
  style,
  ...props
}: EmptyStateProps) => {
  // 获取尺寸样式
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return {
          icon: 'h-8 w-8',
          title: 'text-lg',
          description: 'text-sm',
          spacing: 'space-y-2'
        }
      case 'lg':
        return {
          icon: 'h-16 w-16',
          title: 'text-2xl',
          description: 'text-lg',
          spacing: 'space-y-4'
        }
      case 'xl':
        return {
          icon: 'h-20 w-20',
          title: 'text-3xl',
          description: 'text-xl',
          spacing: 'space-y-6'
        }
      default:
        return {
          icon: 'h-12 w-12',
          title: 'text-xl',
          description: 'text-base',
          spacing: 'space-y-3'
        }
    }
  }

  const sizeClass = getSizeClass()

  // 处理操作点击
  const handleAction = () => {
    if (onAction) {
      onAction()
    }
  }

  // 获取默认图标
  const getDefaultIcon = () => {
    if (typeof icon === 'string') {
      switch (icon) {
        case 'search':
          return <Search className={sizeClass.icon} />
        case 'error':
          return <AlertCircle className={sizeClass.icon} />
        case 'package':
          return <Package className={sizeClass.icon} />
        default:
          return <FileX className={sizeClass.icon} />
      }
    }
    return icon
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizeClass.spacing,
        'py-8 px-4',
        className
      )}
      style={style}
      {...props}
    >
      {/* 图标 */}
      <div className={cn('text-muted-foreground', sizeClass.icon)}>
        {getDefaultIcon()}
      </div>

      {/* 标题 */}
      <h3 className={cn('font-semibold text-foreground', sizeClass.title)}>
        {title}
      </h3>

      {/* 描述 */}
      {description && (
        <p className={cn('text-muted-foreground max-w-sm', sizeClass.description)}>
          {description}
        </p>
      )}

      {/* 操作按钮 */}
      {(action || onAction) && (
        <div className="pt-2">
          {action ? (
            action
          ) : (
            <Button
              variant="outline"
              onClick={handleAction}
              className="min-w-24"
            >
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default EmptyState

