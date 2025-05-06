"use client"

import * as React from "react"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { Button } from "@/components/ui/button"
import { Copy, Check, ExternalLink, Loader2, X } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import rehypeHighlight from "rehype-highlight"

interface MarkdownMessageProps {
  content: string
  className?: string
  enableImageExpand?: boolean // 是否启用图片放大功能
}

export function MarkdownMessage({ content, className, enableImageExpand = true }: MarkdownMessageProps) {
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
    console.log("图片点击事件触发，src:", src);

    // 强制创建一个新的模态框元素
    const existingModal = document.getElementById('image-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // 直接使用DOM API创建模态框
    const createImageModal = () => {
      try {
        const modal = document.createElement('div');
        modal.id = 'image-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.right = '0';
        modal.style.bottom = '0';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        modal.style.backdropFilter = 'blur(4px)';
        modal.style.zIndex = '99999'; // 提高z-index，确保在聊天历史页面中也能显示

        const imgContainer = document.createElement('div');
        imgContainer.style.position = 'relative';
        imgContainer.style.maxWidth = '90vw';
        imgContainer.style.maxHeight = '90vh';
        imgContainer.style.padding = '8px';
        imgContainer.style.borderRadius = '8px';
        imgContainer.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';

        const img = document.createElement('img');
        img.src = src || '/placeholder.svg';
        img.alt = '图片预览';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '85vh';
        img.style.objectFit = 'contain';
        img.style.borderRadius = '8px';
        img.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '8px';
        closeBtn.style.right = '8px';
        closeBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        closeBtn.style.color = 'white';
        closeBtn.style.border = 'none';
        closeBtn.style.borderRadius = '9999px';
        closeBtn.style.width = '32px';
        closeBtn.style.height = '32px';
        closeBtn.style.cursor = 'pointer';

        const hint = document.createElement('div');
        hint.textContent = '点击任意位置关闭';
        hint.style.position = 'absolute';
        hint.style.bottom = '16px';
        hint.style.left = '50%';
        hint.style.transform = 'translateX(-50%)';
        hint.style.fontSize = '12px';
        hint.style.color = 'rgba(255, 255, 255, 0.7)';
        hint.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
        hint.style.padding = '4px 12px';
        hint.style.borderRadius = '9999px';

        imgContainer.appendChild(img);
        imgContainer.appendChild(closeBtn);
        imgContainer.appendChild(hint);
        modal.appendChild(imgContainer);

        const closeModal = () => {
          try {
            document.body.removeChild(modal);
          } catch (e) {
            console.error("移除模态框失败:", e);
          }
          setState(prev => ({ ...prev, expandedImage: null }));
        };

        modal.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          closeModal();
        });
        imgContainer.addEventListener('click', (e) => {
          e.stopPropagation();
        });

        document.body.appendChild(modal);
      } catch (error) {
        console.error("创建图片模态框失败:", error);
      }
    };

    // 更新状态并创建模态框
    setState(prev => {
      console.log("更新expandedImage状态，当前值:", prev.expandedImage, "新值:", src);

      // 使用setTimeout确保状态更新后再创建模态框
      setTimeout(createImageModal, 0);

      return { ...prev, expandedImage: src };
    });
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
                <div
                  style={{position: 'relative', display: 'inline-block'}}
                  className={cn(
                    "image-container transition-all duration-200 relative",
                    enableImageExpand && !error ? "cursor-zoom-in hover:opacity-95" : ""
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!error && enableImageExpand) {
                      console.log("图片容器点击事件触发");
                      handleImageClick(processedSrc);
                    }
                  }}
                >
                  <img
                    src={processedSrc || "/placeholder.svg"}
                    alt={alt || ""}
                    className={cn(
                      "max-w-full w-full h-auto transition-all duration-300 rounded-md",
                      isLoading ? "opacity-0" : "opacity-100",
                      error ? "border-red-300" : "hover:shadow-lg hover:brightness-105",
                      enableImageExpand && !error ? "cursor-zoom-in" : ""
                    )}
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
                  {/* 移除"点击放大"按钮 */}
                </div>
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

      {/* 图片模态框现在通过DOM API直接创建，不再使用React状态 */}
    </ErrorBoundary>
  )
}
