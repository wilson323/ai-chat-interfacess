"use client"

import { useState, useEffect, useRef } from "react"
import { Wifi, WifiOff, AlertCircle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAgent } from "@/context/agent-context"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"
import { useLanguage } from "@/context/language-context"

interface ConnectionStatusProps {
  className?: string
  onRetry?: () => void
}

// Connection check result cache
interface ConnectionCache {
  status: "connected" | "disconnected" | "connecting" | "error"
  timestamp: number
  errorMessage: string | null
}

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000

export function ConnectionStatus({ className, onRetry }: ConnectionStatusProps) {
  const { selectedAgent } = useAgent()
  const [status, setStatus] = useState<"connected" | "disconnected" | "connecting" | "error">("connecting")
  const [lastChecked, setLastChecked] = useState<Date>(new Date())
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const isMobile = useMobile()
  const { t } = useLanguage()

  // Use a ref to store the connection cache
  const connectionCacheRef = useRef<ConnectionCache | null>(null)

  // Check connection status with caching
  useEffect(() => {
    if (!selectedAgent?.apiEndpoint || !selectedAgent?.apiKey || !selectedAgent?.appId) {
      setStatus("disconnected")
      setErrorMessage("API configuration incomplete")
      return
    }

    const checkConnection = async () => {
      // Check if we have a valid cached result
      const cache = connectionCacheRef.current
      const now = Date.now()

      if (cache && now - cache.timestamp < CACHE_EXPIRATION) {
        console.log("Using cached connection status:", cache.status)
        setStatus(cache.status)
        setErrorMessage(cache.errorMessage)
        return
      }

      setStatus("connecting")
      setErrorMessage(null)

      try {
        // 使用更轻量级的请求来检查API连接
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        // 构建一个最小化的请求体，符合FastGPT API的要求
        const response = await fetch("/api/chat-proxy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            targetUrl: selectedAgent.apiEndpoint,
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${selectedAgent.apiKey}`,
            },
            body: {
              model: selectedAgent.appId,
              messages: [{ role: "system", content: "Connection test" }],
              stream: false,
              detail: false,
              temperature: 0.7,
              max_tokens: 5, // 使用最小的值以减少资源消耗
            },
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Handle response
        if (response.ok) {
          try {
            const data = await response.json()
            if (data.success && data.status === 200) {
              setStatus("connected")
              setErrorMessage(null)

              // Cache the successful result
              connectionCacheRef.current = {
                status: "connected",
                timestamp: now,
                errorMessage: null,
              }

              // Reset retry count on success
              setRetryCount(0)
            } else {
              setStatus("error")
              const message = data.error?.message || "Connection failed"
              setErrorMessage(message)

              // Cache the error result
              connectionCacheRef.current = {
                status: "error",
                timestamp: now,
                errorMessage: message,
              }
            }
          } catch (jsonError) {
            console.error("Error parsing JSON response:", jsonError)
            setStatus("error")
            const message = "Invalid response format"
            setErrorMessage(message)

            // Cache the error result
            connectionCacheRef.current = {
              status: "error",
              timestamp: now,
              errorMessage: message,
            }
          }
        } else {
          try {
            const data = await response.json().catch(() => ({ message: "Failed to parse response" }))
            setStatus("error")
            const message = data.error?.message || `Connection failed: ${response.status}`
            setErrorMessage(message)

            // Cache the error result
            connectionCacheRef.current = {
              status: "error",
              timestamp: now,
              errorMessage: message,
            }
          } catch (responseError) {
            console.error("Error handling response:", responseError)
            setStatus("error")
            const message = `Connection failed: ${response.status}`
            setErrorMessage(message)

            // Cache the error result
            connectionCacheRef.current = {
              status: "error",
              timestamp: now,
              errorMessage: message,
            }
          }
        }
      } catch (error) {
        console.error("Connection check error:", error)
        setStatus("error")
        const message = error instanceof Error ? error.message : "Connection failed"
        setErrorMessage(message)

        // Cache the error result
        connectionCacheRef.current = {
          status: "error",
          timestamp: now,
          errorMessage: message,
        }

        // Implement exponential backoff for retries
        const shouldRetry = retryCount < 3
        if (shouldRetry) {
          const backoffTime = Math.pow(2, retryCount) * 1000 // 1s, 2s, 4s
          console.log(`Will retry connection in ${backoffTime}ms (attempt ${retryCount + 1}/3)`)
          setTimeout(() => {
            setRetryCount((prev) => prev + 1)
          }, backoffTime)
        }
      }

      setLastChecked(new Date())
    }

    checkConnection()

    // Set up periodic connection checks (less frequent with caching)
    const intervalId = setInterval(checkConnection, 2 * 60 * 1000) // Check every 2 minutes
    return () => clearInterval(intervalId)
  }, [selectedAgent, retryCount])

  const handleRetry = async () => {
    // Clear the cache to force a fresh check
    connectionCacheRef.current = null

    // Set retrying state
    setIsRetrying(true)

    // Reset retry count
    setRetryCount(0)

    // Set status to connecting
    setStatus("connecting")

    try {
      // 使用更轻量级的请求来检查API连接
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      // 构建一个最小化的请求体，符合FastGPT API的要求
      const response = await fetch("/api/chat-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUrl: selectedAgent?.apiEndpoint,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${selectedAgent?.apiKey}`,
          },
          body: {
            model: selectedAgent?.appId,
            messages: [{ role: "system", content: "Connection test" }],
            stream: false,
            detail: false,
            temperature: 0.7,
            max_tokens: 5, // 使用最小的值以减少资源消耗
          },
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Handle response
      if (response.ok) {
        try {
          const data = await response.json()
          if (data.success && data.status === 200) {
            setStatus("connected")
            setErrorMessage(null)

            // Cache the successful result
            connectionCacheRef.current = {
              status: "connected",
              timestamp: Date.now(),
              errorMessage: null,
            }
          } else {
            setStatus("error")
            const message = data.error?.message || "Connection failed"
            setErrorMessage(message)
          }
        } catch (jsonError) {
          console.error("Error parsing JSON response:", jsonError)
          setStatus("error")
          setErrorMessage("Invalid response format")
        }
      } else {
        setStatus("error")
        setErrorMessage(`Connection failed: ${response.status}`)
      }
    } catch (error) {
      console.error("Connection retry error:", error)
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Connection failed")
    } finally {
      setIsRetrying(false)
      setLastChecked(new Date())

      if (onRetry) {
        onRetry()
      }
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "bg-green-500"
      case "disconnected":
        return "bg-red-500"
      case "connecting":
        return "bg-yellow-500 animate-pulse"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return isMobile ? "" : t("connected")
      case "disconnected":
        return isMobile ? "" : t("disconnected")
      case "connecting":
        return isMobile ? "" : t("connecting")
      case "error":
        return isMobile ? "" : t("connectionError")
      default:
        return isMobile ? "" : ""
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-1 cursor-pointer hover:bg-background/80",
              isMobile ? "h-7 w-7 p-0 justify-center" : "h-8 sm:h-9 px-2",
              className,
            )}
            onClick={handleRetry}
          >
            <div className={cn("w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full", getStatusColor())} />
            {!isMobile && <span className="text-[10px] sm:text-xs">{getStatusText()}</span>}
            {isRetrying ? (
              <RefreshCw className="h-3 w-3 animate-spin ml-0.5" />
            ) : status === "connected" ? (
              <Wifi className="h-3 w-3 text-green-500 ml-0.5" />
            ) : (
              <WifiOff className="h-3 w-3 text-red-500 ml-0.5" />
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium">{t("apiConnectionStatus")}</p>
            {errorMessage && (
              <p className="text-[10px] sm:text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> {errorMessage}
              </p>
            )}
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {t("lastChecked")}: {lastChecked.toLocaleTimeString()}
            </p>
            <div className="pt-1">
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-[10px] sm:text-xs w-full"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin mr-1" /> {t("retrying")}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> {t("retryConnection")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
