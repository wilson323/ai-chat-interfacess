"use client"

import { useState, useEffect, useRef } from "react"
import type { Message } from "@/types/message"

interface UseMessageVirtualizationOptions {
  itemHeight: number
  overscan?: number
  initialScrollToBottom?: boolean
}

export function useMessageVirtualization(
  messages: Message[],
  containerHeight: number,
  options: UseMessageVirtualizationOptions,
) {
  const { itemHeight, overscan = 5, initialScrollToBottom = true } = options
  const [scrollTop, setScrollTop] = useState(0)
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([])
  const [paddingTop, setPaddingTop] = useState(0)
  const [paddingBottom, setPaddingBottom] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isInitialRender = useRef(true)

  // 处理滚动事件
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop)
    }
  }

  // 滚动到底部
  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }

  // 初始化时滚动到底部
  useEffect(() => {
    if (initialScrollToBottom && isInitialRender.current && messages.length > 0) {
      setTimeout(scrollToBottom, 100)
      isInitialRender.current = false
    }
  }, [messages, initialScrollToBottom])

  // 当新消息添加时滚动到底部
  useEffect(() => {
    const container = containerRef.current
    if (container && messages.length > 0) {
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
      if (isAtBottom) {
        setTimeout(scrollToBottom, 100)
      }
    }
  }, [messages])

  // 计算可见消息
  useEffect(() => {
    if (containerHeight <= 0 || messages.length === 0) {
      setVisibleMessages([])
      setPaddingTop(0)
      setPaddingBottom(0)
      return
    }

    const totalHeight = messages.length * itemHeight
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(messages.length - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan)

    const visibleItems = messages.slice(startIndex, endIndex + 1)
    const newPaddingTop = startIndex * itemHeight
    const newPaddingBottom = totalHeight - (endIndex + 1) * itemHeight

    setVisibleMessages(visibleItems)
    setPaddingTop(newPaddingTop)
    setPaddingBottom(Math.max(0, newPaddingBottom))
  }, [messages, scrollTop, containerHeight, itemHeight, overscan])

  return {
    containerRef,
    visibleMessages,
    paddingTop,
    paddingBottom,
    handleScroll,
    scrollToBottom,
  }
}
