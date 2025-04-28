"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendHorizonal, Mic, Paperclip, Settings, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useResponsive } from "@/hooks/use-responsive"
import { ChatOptions } from "./chat-options"
import VoiceRecorder from "@/components/ui/voice-recorder"

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, isLoading = false, placeholder = "发送消息..." }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [showOptions, setShowOptions] = useState(false)
  const [showRecorder, setShowRecorder] = useState(false)
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

  return (
    <div className="relative">
      {showOptions && <ChatOptions onClose={() => setShowOptions(false)} />}
      {showRecorder && (
        <div className="absolute bottom-16 left-0 right-0 z-20 flex justify-center">
          <VoiceRecorder
            onResult={(text) => {
              setShowRecorder(false)
              if (text) onSend(text)
            }}
          />
        </div>
      )}
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

          {!isMdAndDown && voiceInputEnabled && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full"
              onClick={() => setShowRecorder(true)}
            >
              <Mic className="h-5 w-5" />
            </Button>
          )}

          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            size="icon"
            className={cn("h-9 w-9 shrink-0 rounded-full", "bg-pantone369-500 hover:bg-pantone369-600 text-white")}
          >
            <SendHorizonal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
