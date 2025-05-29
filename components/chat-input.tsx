"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendHorizonal, Mic, Paperclip, Settings, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useResponsive } from "@/hooks/use-responsive"
import { ChatOptions } from "./chat-options"
import { CompactVoiceInput } from "@/components/voice/VoiceInput"

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, isLoading = false, placeholder = "发送消息..." }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [showOptions, setShowOptions] = useState(false)
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { isMdAndDown } = useResponsive()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setVoiceInputEnabled(localStorage.getItem('voiceInputEnabled') !== 'false')
    }
  }, [])

  // 自动调整文本区域高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`
    }
  }, [message])

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim())
      setMessage("")
      // 重置文本区域高度
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleVoiceTranscript = (text: string) => {
    setMessage(prev => prev + text)
  }

  return (
    <div className="relative">
      {showOptions && <ChatOptions onClose={() => setShowOptions(false)} />}
      <div
        className={cn(
          "flex items-end gap-2 bg-background/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl border",
          "relative z-10",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-full"
          onClick={() => setShowOptions(!showOptions)}
        >
          {showOptions ? <X className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
        </Button>

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            if (e.target.value.length <= 2000) setMessage(e.target.value)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "min-h-[40px] resize-none border-0 focus-visible:ring-0 p-2 sm:p-3",
            "bg-transparent text-sm sm:text-base",
          )}
          rows={1}
          maxLength={2000}
        />

        <div className="flex gap-1 sm:gap-2">
          {!isMdAndDown && (
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full">
              <Paperclip className="h-5 w-5" />
            </Button>
          )}

          {/* 新的语音输入组件 */}
          {voiceInputEnabled && (
            <CompactVoiceInput
              onTranscript={handleVoiceTranscript}
              disabled={isLoading}
              className={cn(
                "shrink-0",
                isMdAndDown ? "h-8 w-8" : "h-9 w-9"
              )}
            />
          )}

          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            size="icon"
            className={cn(
              "shrink-0 rounded-full bg-pantone369-500 hover:bg-pantone369-600 text-white",
              isMdAndDown ? "h-8 w-8" : "h-9 w-9"
            )}
          >
            <SendHorizonal className={cn(isMdAndDown ? "h-4 w-4" : "h-5 w-5")} />
          </Button>
        </div>
      </div>
    </div>
  )
}
