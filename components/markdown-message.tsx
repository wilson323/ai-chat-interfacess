"use client"

import * as React from "react"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { Button } from "@/components/ui/button"
import { Copy, Check, ExternalLink, Loader2 } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import rehypeHighlight from "rehype-highlight"

interface MarkdownMessageProps {
  content: string
  className?: string
}

export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  // 防御性处理，防止 content 为空或 undefined
  if (!content || typeof content !== 'string' || content.trim() === '') {
    return <div className={cn("whitespace-pre-wrap text-sm sm:text-base leading-relaxed", className)}></div>
  }

  const safeContent = typeof content === 'string' ? content : ''
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const isMobile = useMobile()
  const rehypePlugins = [rehypeHighlight]

  // 使用useState钩子
  const [state, setState] = useState({
    mounted: false,
    copiedCode: null as string | null,
    expandedImage: null as string | null,
    imageLoadingStates: {} as {
      [key: string]: { isLoading: boolean; error: boolean }
    }
  });

  // Prevent hydration mismatch
  useEffect(() => {
    setState(prev => ({ ...prev, mounted: true }));
  }, []);

  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    setState(prev => ({ ...prev, copiedCode: code }));
    setTimeout(() => setState(prev => ({ ...prev, copiedCode: null })), 2000);
  }, []);

  const handleImageClick = useCallback((src: string) => {
    setState(prev => ({ ...prev, expandedImage: src }));
  }, []);

  // Function to process image URLs through the proxy if needed
  const processImageUrl = useCallback((url: string) => {
    // Skip processing for data URLs or relative URLs
    if (url.startsWith("data:") || url.startsWith("/")) {
      return url;
    }

    // Special handling for zktecoaihub.com domain - pass it through directly
    if (url.includes("zktecoaihub.com")) {
      return url;
    }

    // Use the image proxy for other external URLs
    try {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    } catch (e) {
      console.error("Error processing image URL:", e);
      return url;
    }
  }, []);

  // Initialize loading states for all images in the content
  useEffect(() => {
    if (!state.mounted) return;

    const imageRegex = /!\[(.*?)\]$$(.*?)$$/g;
    const matches = [...safeContent.matchAll(imageRegex)];
    const initialLoadingStates = matches.reduce(
      (acc, match) => {
        const url = match[2];
        const processedSrc = processImageUrl(url);
        acc[processedSrc] = { isLoading: true, error: false };
        return acc;
      },
      {} as { [key: string]: { isLoading: boolean; error: boolean } }
    );

    setState(prev => ({ ...prev, imageLoadingStates: initialLoadingStates }));
  }, [safeContent, processImageUrl, state.mounted]);

  // 在客户端渲染之前返回一个简单的占位符
  if (!state.mounted) {
    return <div className={cn("whitespace-pre-wrap text-sm sm:text-base leading-relaxed", className)}>{safeContent}</div>;
  }

  if (!rehypePlugins || rehypePlugins.length === 0) {
    return <div className={cn("whitespace-pre-wrap text-sm sm:text-base leading-relaxed", className)}>{safeContent}</div>;
  }
  return (
    <ErrorBoundary fallback={<div className={cn("text-red-500 text-xs", className)}>消息渲染出错</div>}>
      <div
        className={cn(
          "relative group max-w-full w-fit min-w-[60px] px-4 py-3 my-2",
          // 如果是用户消息（text-white类），则不添加背景色和边框样式
          className?.includes("text-white")
            ? "bg-transparent border-0 shadow-none"
            : "rounded-2xl shadow-md border border-zinc-200 dark:border-zinc-700/50 bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900",
          "prose prose-sm sm:prose max-w-none dark:prose-invert",
          "prose-headings:font-semibold prose-headings:text-pantone369-700 dark:prose-headings:text-pantone369-300",
          "prose-p:my-2 sm:prose-p:my-3 prose-p:leading-relaxed",
          "prose-a:text-pantone369-600 dark:text-pantone369-400 prose-a:font-medium",
          "prose-code:bg-zinc-100 dark:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs sm:prose-code:text-sm",
          "prose-pre:bg-zinc-100 dark:bg-zinc-800 prose-pre:p-0 prose-pre:rounded-md",
          "prose-img:rounded-md prose-img:my-2 sm:prose-img:my-3 prose-img:max-w-full prose-img:cursor-pointer",
          "prose-hr:my-3 sm:prose-hr:my-4 prose-hr:border-pantone369-200 dark:prose-hr:border-pantone369-800/30",
          "prose-blockquote:border-l-4 prose-blockquote:border-pantone369-300 dark:prose-blockquote:border-pantone369-700 prose-blockquote:pl-4 prose-blockquote:italic",
          "prose-li:my-0.5 sm:prose-li:my-1",
          "text-sm sm:text-base",
          className,
        )}
        style={{
          transition: 'box-shadow 0.2s',
          boxShadow: className?.includes("text-white") ? 'none' : '0 2px 12px 0 rgba(60,60,60,0.06)',
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={rehypePlugins}
          components={{
            code(props: any) {
              return <code {...props} />
            },
            a({ node, children, href, ...props }) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pantone369-600 dark:text-pantone369-400 hover:underline font-medium inline-flex items-center"
                  {...props}
                >
                  {children}
                  <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3 ml-0.5 sm:ml-1 inline-block" />
                </a>
              )
            },
            img({ node, src, alt, ...props }) {
              const processedSrc = src ? processImageUrl(src) : "/placeholder.svg"
              const isLoading = state.imageLoadingStates[processedSrc]?.isLoading ?? true
              const error = state.imageLoadingStates[processedSrc]?.error ?? false

              const handleImageLoad = () => {
                setState(prev => ({
                  ...prev,
                  imageLoadingStates: {
                    ...prev.imageLoadingStates,
                    [processedSrc]: { isLoading: false, error: false }
                  }
                }));
              }

              const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                setState(prev => ({
                  ...prev,
                  imageLoadingStates: {
                    ...prev.imageLoadingStates,
                    [processedSrc]: { isLoading: false, error: true }
                  }
                }));

                const target = e.target as HTMLImageElement
                target.onerror = null
                target.classList.add("border-red-300")
                const errorDiv = document.createElement("div")
                errorDiv.className = "text-xs text-red-500 mt-1"
                errorDiv.textContent = `图片加载失败: ${src}`
                target.parentNode?.appendChild(errorDiv)
              }

              return (
                <span style={{position: 'relative', display: 'inline-block'}}>
                  <img
                    src={processedSrc || "/placeholder.svg"}
                    alt={alt || ""}
                    className={cn(
                      "max-w-full w-full h-auto transition-all duration-500",
                      isLoading ? "opacity-0" : "opacity-100",
                      error ? "border-red-300" : "",
                    )}
                    onClick={() => !error && handleImageClick(processedSrc)}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading="lazy"
                    {...props}
                  />
                  {isLoading && (
                    <span className="absolute inset-0 flex items-center justify-center bg-pantone369-50/30 dark:bg-pantone369-900/30 rounded-md">
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    </span>
                  )}
                  {!isLoading && !error && (
                    <span className="absolute bottom-2 right-2 bg-white/90 dark:bg-zinc-800/90 px-2 py-1 rounded text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                      📷 点击放大
                    </span>
                  )}
                </span>
              )
            },
            p({ node, children, ...props }) {
              if (
                Array.isArray(children) &&
                children.length === 1 &&
                React.isValidElement(children[0]) &&
                children[0].type === 'div'
              ) {
                return children[0];
              }
              return <p {...props}>{children}</p>;
            },
            blockquote({ node, children, ...props }) {
              return (
                <blockquote
                  className="border-l-4 border-primary pl-4 italic my-4 bg-primary/5 dark:bg-primary/10 py-2 pr-2 rounded-r-md"
                  {...props}
                >
                  {children}
                </blockquote>
              )
            },
          }}
        >
          {safeContent}
        </ReactMarkdown>
      </div>

      {/* Image Modal */}
      {state.expandedImage && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setState(prev => ({ ...prev, expandedImage: null }))}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <img
              src={state.expandedImage || "/placeholder.svg"}
              alt="Expanded view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={() => setState(prev => ({ ...prev, expandedImage: null }))}
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </ErrorBoundary>
  )
}
