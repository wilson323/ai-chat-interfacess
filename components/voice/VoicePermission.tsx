/**
 * 语音权限组件
 * 处理麦克风权限请求和状态显示
 */

import React, { useState } from 'react'
import {
  Mic,
  MicOff,
  AlertCircle,
  CheckCircle,
  Settings,
  HelpCircle,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { VoicePermissionProps } from '@/types/voice'
import { getPermissionDescription, getPermissionGuide } from './hooks/useVoicePermission'

/**
 * 主要权限组件
 */
export function VoicePermission({
  onRequest,
  permission,
  className,
}: VoicePermissionProps) {
  const [isRequesting, setIsRequesting] = useState(false)
  const description = getPermissionDescription(permission.state)

  const handleRequest = async () => {
    setIsRequesting(true)
    try {
      await onRequest()
    } finally {
      setIsRequesting(false)
    }
  }

  // 如果已经授权，不显示组件
  if (permission.state === 'granted') {
    return null
  }

  // 如果浏览器不支持，显示不支持提示
  if (!permission.isSupported) {
    return <UnsupportedBrowser className={className} />
  }

  return (
    <Alert className={cn('border-amber-200 bg-amber-50 dark:bg-amber-950/20', className)}>
      <AlertCircle className="h-4 w-4 text-amber-500" />
      <AlertDescription className="space-y-3">
        <div>
          <h4 className="font-medium text-amber-800 dark:text-amber-200">
            {description.title}
          </h4>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            {description.description}
          </p>
        </div>

        {permission.canRequest && description.action && (
          <Button
            onClick={handleRequest}
            disabled={isRequesting}
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isRequesting ? '请求中...' : description.action}
          </Button>
        )}

        {permission.state === 'denied' && (
          <PermissionGuide />
        )}
      </AlertDescription>
    </Alert>
  )
}

/**
 * 权限指导组件
 */
function PermissionGuide() {
  const [showGuide, setShowGuide] = useState(false)
  const guide = getPermissionGuide()

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowGuide(!showGuide)}
        className="text-amber-700 border-amber-300 hover:bg-amber-100"
      >
        <HelpCircle className="h-4 w-4 mr-2" />
        {showGuide ? '隐藏' : '查看'}设置指导
      </Button>

      {showGuide && (
        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-md">
          <h5 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
            {guide.title}
          </h5>
          <ol className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
            {guide.steps.map((step, index) => (
              <li key={index} className="flex gap-2">
                <span className="font-medium">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

/**
 * 浏览器不支持组件
 */
function UnsupportedBrowser({ className }: { className?: string }) {
  return (
    <Alert className={cn('border-red-200 bg-red-50 dark:bg-red-950/20', className)}>
      <MicOff className="h-4 w-4 text-red-500" />
      <AlertDescription>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-red-800 dark:text-red-200">
              浏览器不支持语音输入
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              您的浏览器不支持语音录音功能，请使用支持的浏览器。
            </p>
          </div>

          <div className="text-sm text-red-600 dark:text-red-400">
            <p className="font-medium mb-1">推荐浏览器：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Chrome 60+</li>
              <li>Firefox 55+</li>
              <li>Safari 11+</li>
              <li>Edge 79+</li>
            </ul>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}

/**
 * 紧凑权限组件
 */
export function CompactVoicePermission({
  onRequest,
  permission,
  className,
}: VoicePermissionProps) {
  if (permission.state === 'granted') {
    return (
      <div className={cn(
        'flex items-center gap-2 text-green-600 dark:text-green-400',
        className
      )}>
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">已授权</span>
      </div>
    )
  }

  if (!permission.isSupported) {
    return (
      <div className={cn(
        'flex items-center gap-2 text-red-600 dark:text-red-400',
        className
      )}>
        <MicOff className="h-4 w-4" />
        <span className="text-sm">不支持</span>
      </div>
    )
  }

  return (
    <div className={cn(
      'flex items-center gap-2',
      className
    )}>
      <AlertCircle className="h-4 w-4 text-amber-500" />
      {permission.canRequest ? (
        <Button
          onClick={onRequest}
          size="sm"
          variant="outline"
          className="text-amber-700 border-amber-300"
        >
          授权
        </Button>
      ) : (
        <span className="text-sm text-amber-600 dark:text-amber-400">
          需要权限
        </span>
      )}
    </div>
  )
}

/**
 * 权限状态指示器
 */
export function PermissionIndicator({
  permission,
  size = 'md',
  showText = false,
  className,
}: {
  permission: { state: string; isSupported: boolean }
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const getIndicator = () => {
    if (!permission.isSupported) {
      return {
        icon: MicOff,
        color: 'text-red-500',
        text: '不支持',
      }
    }

    switch (permission.state) {
      case 'granted':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          text: '已授权',
        }
      case 'denied':
        return {
          icon: MicOff,
          color: 'text-red-500',
          text: '已拒绝',
        }
      case 'prompt':
        return {
          icon: AlertCircle,
          color: 'text-amber-500',
          text: '需要授权',
        }
      default:
        return {
          icon: HelpCircle,
          color: 'text-gray-500',
          text: '未知',
        }
    }
  }

  const indicator = getIndicator()
  const Icon = indicator.icon

  return (
    <div className={cn(
      'flex items-center gap-2',
      className
    )}>
      <Icon className={cn(sizeClasses[size], indicator.color)} />
      {showText && (
        <span className={cn(
          'text-sm',
          indicator.color
        )}>
          {indicator.text}
        </span>
      )}
    </div>
  )
}

/**
 * 权限设置链接组件
 */
export function PermissionSettingsLink({
  className,
}: {
  className?: string
}) {
  const openBrowserSettings = () => {
    // 不同浏览器的设置页面
    const userAgent = navigator.userAgent.toLowerCase()

    if (userAgent.includes('chrome')) {
      window.open('chrome://settings/content/microphone', '_blank')
    } else if (userAgent.includes('firefox')) {
      window.open('about:preferences#privacy', '_blank')
    } else if (userAgent.includes('safari')) {
      // Safari 需要手动指导
      alert('请在 Safari 菜单 > 偏好设置 > 网站 > 麦克风 中管理权限')
    } else {
      // 通用指导
      alert('请在浏览器设置中查找"隐私"或"权限"选项来管理麦克风权限')
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={openBrowserSettings}
      className={cn('text-muted-foreground', className)}
    >
      <Settings className="h-4 w-4 mr-2" />
      浏览器设置
      <ExternalLink className="h-3 w-3 ml-2" />
    </Button>
  )
}

/**
 * 权限检查组件
 * 在组件挂载时自动检查权限状态
 */
export function PermissionChecker({
  onPermissionChange,
  children,
}: {
  onPermissionChange: (hasPermission: boolean) => void
  children: React.ReactNode
}) {
  React.useEffect(() => {
    const checkPermission = async () => {
      try {
        if (navigator.permissions) {
          const result = await navigator.permissions.query({
            name: 'microphone' as PermissionName
          })

          onPermissionChange(result.state === 'granted')

          result.addEventListener('change', () => {
            onPermissionChange(result.state === 'granted')
          })
        }
      } catch (error) {
        console.warn('Failed to check microphone permission:', error)
      }
    }

    checkPermission()
  }, [onPermissionChange])

  return <>{children}</>
}
