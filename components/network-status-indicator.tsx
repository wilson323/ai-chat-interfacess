"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { checkNetworkConnection } from "@/lib/offline-mode"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NetworkStatusIndicatorProps {
  className?: string
  showTooltip?: boolean
  onStatusChange?: (isOnline: boolean) => void
}

export function NetworkStatusIndicator({ className, showTooltip = true, onStatusChange }: NetworkStatusIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [checking, setChecking] = useState(false)

  // 检查网络状态
  const checkStatus = async () => {
    if (checking) return

    setChecking(true)
    const online = await checkNetworkConnection()

    if (online !== isOnline) {
      setIsOnline(online)
      if (onStatusChange) {
        onStatusChange(online)
      }
    }

    setChecking(false)
  }

  // 初始检查和定期检查
  useEffect(() => {
    // 初始检查
    checkStatus()

    // 浏览器在线/离线事件
    const handleOnline = () => {
      setIsOnline(true)
      if (onStatusChange) onStatusChange(true)
    }

    const handleOffline = () => {
      setIsOnline(false)
      if (onStatusChange) onStatusChange(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // 定期检查
    const intervalId = setInterval(checkStatus, 30000) // 每30秒检查一次

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(intervalId)
    }
  }, [onStatusChange])

  const indicator = (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center gap-1 h-7 px-2",
        isOnline
          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/30"
          : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/30",
        className,
      )}
    >
      {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
      <span className="text-xs">{isOnline ? "在线" : "离线"}</span>
    </Badge>
  )

  if (!showTooltip) {
    return indicator
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{indicator}</TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="text-xs font-medium">{isOnline ? "网络连接正常" : "网络连接已断开"}</p>
            <p className="text-[10px] text-muted-foreground">
              {isOnline ? "您的应用程序已连接到互联网" : "您的应用程序当前处于离线模式，某些功能可能受限"}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
