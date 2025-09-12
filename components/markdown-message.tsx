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
import { ErrorBoundary } from "@/components/error-boundary"
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
          // 只保留内容排版和字体美化，去掉bg-gradient-to-br、rounded-2xl、shadow-md、border等
          "prose prose-sm sm:prose max-w-none !p-0 !m-0 [p_>_*]:!m-0 [p_>_*]:!p-0",
          "prose-headings:font-semibold prose-headings:text-pantone369-700 dark:prose-headings:text-pantone369-300 prose-p:my-2 sm:prose-p:my-3 prose-p:leading-relaxed prose-a:text-pantone369-600 dark:text-pantone369-400 prose-a:font-medium prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs sm:prose-code:text-sm prose-pre:p-0 prose-pre:rounded-md prose-img:rounded-md prose-img:my-2 sm:prose-img:my-3 prose-img:max-w-full prose-img:cursor-pointer prose-hr:my-3 sm:prose-hr:my-4 prose-hr:border-pantone369-200 dark:prose-hr:border-pantone369-800/30 prose-blockquote:border-l-4 prose-blockquote:border-pantone369-300 dark:prose-blockquote:border-pantone369-700 prose-blockquote:pl-4 prose-blockquote:italic prose-li:my-0.5 sm:prose-li:my-1 text-sm sm:text-base",
          className,
        )}
        style={{
          transition: 'box-shadow 0.2s',
          boxShadow: className?.includes("text-white") ? 'none' : undefined,
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
          components={{
            p: ({ children }) => (
              <p className="font-sans font-medium text-message-base text-text-base dark:text-text-dark-base prose-invert:text-white mb-0 last:mb-0 tracking-tightest p-0 m-0 leading-relaxed drop-shadow-sm" style={{letterSpacing: '0.01em', lineHeight: '1.8', textShadow: '0 1px 8px rgba(60,60,60,0.04)'}}>{children}</p>
            ),
            strong: ({ children }) => (
              <strong className="font-bold text-pantone369-700 dark:text-pantone369-300 prose-invert:text-white tracking-tightest p-0 m-0" style={{letterSpacing: '0.01em'}}>{children}</strong>
            ),
            a: ({ children, href }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline underline-offset-2 p-0 m-0">{children}</a>
            ),
            img: (props) => {
              try {
                const { src, alt, title, ...rest } = props;
                if (typeof src !== 'string' || !src.trim()) return null;
                const safeAlt = typeof alt === 'string' ? alt : '';
                const safeTitle = typeof title === 'string' ? title : '';
                const safeRest = Object.fromEntries(
                  Object.entries(rest).filter(([_, v]) => typeof v === 'string')
                );
                return <img src={src} alt={safeAlt} title={safeTitle} {...safeRest} />;
              } catch (e) {
                return null;
              }
            },
            code: ({ children, className }) => (
              <code className={`font-mono text-[13.5px] px-2 py-1 rounded text-code dark:text-code-dark border border-gray-200 dark:border-gray-700 ${className || ''} p-0 m-0`}>{children}</code>
            ),
            pre: ({ children }) => (
              <pre className="rounded-lg px-3 py-2 overflow-x-auto border border-gray-200 dark:border-gray-700 my-0 p-0 m-0">
                <code className="font-mono text-[13.5px] text-code dark:text-code-dark p-0 m-0">{children}</code>
              </pre>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-5 space-y-1 marker:text-text-base dark:marker:text-text-dark-base prose-invert:marker:text-white p-0 m-0">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-5 space-y-1 marker:font-mono marker:text-text-base dark:marker:text-text-dark-base prose-invert:marker:text-white p-0 m-0">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="pl-1 p-0 m-0 text-text-base dark:text-text-dark-base prose-invert:text-white">{children}</li>
            ),
            h1: ({ children }) => (
              <h1 className="text-xl font-bold mt-6 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700 p-0 m-0">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg font-semibold mt-5 mb-2 p-0 m-0">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base font-medium mt-4 mb-1.5 p-0 m-0">{children}</h3>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-3 border-gray-300 dark:border-gray-600 pl-3 text-gray-600 dark:text-gray-300 italic my-0 p-0 m-0">{children}</blockquote>
            ),
            hr: () => (
              <hr className="my-4 border-t border-gray-200 dark:border-gray-700 opacity-50 p-0 m-0" />
            ),
            span: ({ children }) => <span className="font-sans text-message-base tracking-tightest p-0 m-0" style={{letterSpacing: '0.01em'}}>{children}</span>,
            // 添加表格相关组件
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-collapse border-gray-200 dark:border-gray-700 rounded-md">{children}</table>
              </div>
            ),
            thead: ({ children }) => (
              <thead>{children}</thead>
            ),
            tbody: ({ children }) => (
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>
            ),
            tr: ({ children }) => (
              <tr>{children}</tr>
            ),
            th: ({ children }) => (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 last:border-r-0">{children}</th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-2 text-sm border-r border-gray-200 dark:border-gray-700 last:border-r-0">{children}</td>
            ),
          }}
        >
          {safeContent}
        </ReactMarkdown>
      </div>

      {/* 图片模态框现在通过DOM API直接创建，不再使用React状态 */}
    </ErrorBoundary>
  )
}
