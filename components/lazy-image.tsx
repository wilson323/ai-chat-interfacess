"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
  blurPlaceholder?: boolean
  loadingComponent?: React.ReactNode
}

export function LazyImage({
  src,
  alt,
  className,
  fallbackSrc = "/placeholder.svg",
  blurPlaceholder = true,
  loadingComponent,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // 使用IntersectionObserver检测图片是否在视口中
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true)
          // 一旦图片进入视口，就不再需要观察它
          if (imgRef.current) {
            observer.unobserve(imgRef.current)
          }
        }
      },
      {
        rootMargin: "200px", // 提前200px加载图片
        threshold: 0.01, // 只要有1%的图片可见就开始加载
      },
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current)
      }
    }
  }, [])

  // 处理图片加载完成
  const handleLoad = () => {
    setIsLoaded(true)
  }

  // 处理图片加载错误
  const handleError = () => {
    setIsError(true)
    console.error(`Failed to load image: ${src}`)
  }

  // 实际显示的图片源
  const displaySrc = isError ? fallbackSrc : isInView ? src : fallbackSrc

  return (
    <div className="relative">
      {/* 加载状态 */}
      {isInView && !isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 backdrop-blur-sm">
          {loadingComponent || <Loader2 className="h-6 w-6 text-primary animate-spin" />}
        </div>
      )}

      {/* 图片 */}
      <img
        ref={imgRef}
        src={displaySrc || "/placeholder.svg"}
        alt={alt || ""}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          blurPlaceholder && !isLoaded && !isError ? "blur-sm" : "blur-0",
          className,
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        {...props}
      />
    </div>
  )
}
