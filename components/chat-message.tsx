"use client"
import type { Message } from "@/types/message"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  Bot,
  User,
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  ImageIcon,
  FileText,
  Trash2,
  Pencil,
  Check,
  Volume2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useLanguage } from "@/context/language-context"
import { MarkdownMessage } from "@/components/markdown-message"
import { LazyImage } from "@/components/lazy-image"
import { Textarea } from "@/components/ui/textarea"
import { useResponsive } from "@/hooks/use-responsive"
import { formatDistanceToNow } from "date-fns"

// 添加autoSize支持
const TextareaWithAutoSize = ({ autoSize, ...props }: any) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (autoSize && textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [autoSize, props.value])

  return <Textarea ref={textareaRef} {...props} />
}

interface ChatMessageProps {
  message: Message
  onRegenerate?: () => void
  onCopy?: () => void
  onDelete?: (messageId: string) => void
  onEdit?: (messageId: string, newContent: string) => void
  chatId?: string
}

export function ChatMessage({ message, onRegenerate, onCopy, onDelete, onEdit, chatId }: ChatMessageProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState("")
  const [showActions, setShowActions] = useState(false)
  const { isMdAndDown } = useResponsive()
  const messageRef = useRef<HTMLDivElement>(null)
  const [feedback, setFeedback] = useState<null | 'like' | 'dislike'>(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  const isUser = message.role === "user"
  const isOffline = message.metadata?.offline === true
  const timestamp = message.timestamp ? new Date(message.timestamp) : new Date()

  // Handle hover effects for desktop
  useEffect(() => {
    const handleMouseEnter = () => setShowActions(true)
    const handleMouseLeave = () => setShowActions(false)

    const element = messageRef.current
    if (element && !isMdAndDown) {
      element.addEventListener("mouseenter", handleMouseEnter)
      element.addEventListener("mouseleave", handleMouseLeave)

      return () => {
        element.removeEventListener("mouseenter", handleMouseEnter)
        element.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [isMdAndDown])

  const handleCopy = () => {
    if (typeof message.content === "string") {
      navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      if (onCopy) onCopy()
    }
  }

  const handleLike = () => {
    if (disliked) setDisliked(false)
    setLiked(!liked)
  }

  const handleDislike = () => {
    if (liked) setLiked(false)
    setDisliked(!disliked)
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.id)
    }
  }

  const handleEdit = () => {
    if (typeof message.content === "string") {
      setEditedContent(message.content)
      setIsEditing(true)
    }
  }

  const handleSaveEdit = () => {
    if (onEdit && editedContent.trim()) {
      onEdit(message.id, editedContent)
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedContent("")
  }

  // 检查消息是否包含文件
  const hasFiles = Array.isArray(message.metadata?.files) && message.metadata.files.length > 0

  const handleFeedback = async (type: 'like' | 'dislike') => {
    if (feedbackLoading || feedback === type) return;
    setFeedbackLoading(true)
    setFeedback(type)
    try {
      await fetch('/api/message-feedback', { method: 'POST', body: JSON.stringify({ messageId: message.id, type }) })
    } catch {}
    setTimeout(() => setFeedbackLoading(false), 1500)
  }

  // TTS语音播放
  const handleTTS = () => {
    if (typeof window !== 'undefined' && !isUser && typeof message.content === 'string') {
      window.speechSynthesis.cancel(); // 防止多次叠加
      const utter = new window.SpeechSynthesisUtterance(message.content)
      utter.lang = /[\u4e00-\u9fa5]/.test(message.content) ? 'zh-CN' : 'en-US'
      window.speechSynthesis.speak(utter)
    }
  }

  return (
    <div
      ref={messageRef}
      className={cn(
        "group relative flex gap-3 py-3 transition-all duration-200",
        isUser ? "flex-row-reverse" : "",
        isUser ? "hover:bg-primary/5" : "hover:bg-accent/10",
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          isUser
            ? "bg-gradient-to-br from-primary to-primary/80 shadow-sm"
            : "bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 shadow-sm",
        )}
      >
        {isUser ? (
          <User className="h-5 w-5 text-white" />
        ) : (
          <Bot className="h-5 w-5 text-primary dark:text-primary/80" />
        )}
      </div>

      <div className="flex flex-col flex-1 max-w-[calc(100%-3rem)]">
        {/* Message header with timestamp */}
        <div className="flex items-center mb-1 text-xs text-muted-foreground">
          <span className="font-medium">{isUser ? t("you") : message.metadata?.botName || t("assistant")}</span>
          <span className="mx-1.5">•</span>
          <span>{formatDistanceToNow(timestamp, { addSuffix: true })}</span>
        </div>

        <div
          className={cn(
            "relative p-0", // Remove default padding
            isUser
              ? "message-bubble-user" // We'll define these in globals.css
              : "message-bubble-ai",
            "transition-all duration-200 hover:shadow-lg", // Keep hover effect
          )}
        >
          {/* 显示上传的文件 */}
          {hasFiles && (
            <div className="mb-3 flex flex-wrap gap-2 p-4 pb-0">
              {message.metadata?.files?.map((file: any) => (
                <div key={file.id} className="flex flex-col">
                  {file.type.startsWith("image/") && file.url ? (
                    <div className="relative rounded-lg overflow-hidden border border-white/20 dark:border-zinc-700/70 shadow-md hover:shadow-lg transition-all duration-200">
                      <LazyImage
                        src={file.url}
                        alt={file.name}
                        className="max-w-[200px] max-h-[200px] object-contain"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate backdrop-blur-sm">
                        {file.name}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-white/10 dark:bg-zinc-800/80 p-2 rounded-lg border border-white/20 dark:border-zinc-700/70 backdrop-blur-sm hover:bg-white/15 dark:hover:bg-zinc-800/90 transition-all duration-200">
                      {file.type.includes("pdf") ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                      <span className="text-xs truncate max-w-[150px]">{file.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 消息内容 */}
          <div className={cn("prose max-w-[80%] sm:max-w-[60%] p-4", isUser ? "prose-invert" : "dark:prose-invert")}>
            {isEditing ? (
              <TextareaWithAutoSize
                autoSize
                className="w-full min-h-[60px] text-sm"
                value={editedContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditedContent(e.target.value)}
                onBlur={handleCancelEdit}
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  if (e.key === "Enter" && !e.shiftKey) handleSaveEdit()
                  if (e.key === "Escape") handleCancelEdit()
                }}
              />
            ) : (
              <MarkdownMessage content={typeof message.content === 'string' ? message.content : ''} className={isUser ? "text-white" : ""} />
            )}
          </div>

          {/* 离线模式指示器 */}
          {isOffline && !isUser && (
            <div className="mt-0 mb-2 mx-4 text-xs text-muted-foreground flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full w-fit">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              离线模式响应
            </div>
          )}
        </div>

        {/* Message actions - desktop (hover) and mobile (always visible) */}
        <div
          className={cn(
            "flex items-center gap-1 mt-1.5 transition-opacity duration-200",
            !isMdAndDown && !showActions ? "opacity-0" : "opacity-100",
            isUser ? "justify-start flex-row-reverse" : "justify-start",
          )}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full bg-transparent hover:bg-accent/50 p-0 text-muted-foreground hover:text-primary"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{copied ? t("copied") : t("copy" as any)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isUser && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full bg-transparent hover:bg-accent/50 p-0 text-muted-foreground hover:text-primary"
                    onClick={handleEdit}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>编辑消息</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full bg-transparent hover:bg-accent/50 p-0 text-muted-foreground hover:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>删除消息</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {!isUser && onRegenerate && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full bg-transparent hover:bg-accent/50 p-0 text-muted-foreground hover:text-primary"
                    onClick={onRegenerate}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{t("regenerate")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {!isUser && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-7 w-7 rounded-full bg-transparent hover:bg-accent/50 p-0",
                        liked ? "text-green-500" : "text-muted-foreground hover:text-green-500",
                      )}
                      onClick={() => handleFeedback('like')}
                      disabled={feedbackLoading || feedback === 'like'}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{t("helpful")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-7 w-7 rounded-full bg-transparent hover:bg-accent/50 p-0",
                        disliked ? "text-red-500" : "text-muted-foreground hover:text-red-500",
                      )}
                      onClick={() => handleFeedback('dislike')}
                      disabled={feedbackLoading || feedback === 'dislike'}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{t("notHelpful")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}

          {!isUser && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full bg-transparent hover:bg-accent/50 p-0 text-muted-foreground hover:text-primary"
                    onClick={() => handleFeedback('like')}
                    disabled={feedbackLoading || feedback === 'like'}
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>语音播放</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  )
}
