"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAgent } from "@/context/agent-context"
import { X, Search, MessageSquare, Calendar, Clock, ArrowLeft, Plus, Trash2, RefreshCw, Settings, User, Bot } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useLanguage } from "@/context/language-context"
import type { Message } from "@/types/message"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useResponsive } from "@/hooks/use-responsive"
import { useToast } from "@/components/ui/use-toast"
import type { ChatSessionIndexItem } from "@/lib/storage/index"
import {
  loadMessagesFromStorage,
  getAllChatSessions,
  deleteChatSession,
  searchChatSessions,
  debugStorageState,
  rebuildChatIndex,
} from "@/lib/storage/index"
import { useRemoteChatHistory } from "@/hooks/useRemoteChatHistory"
import { fetchUserChatHistory } from '@/lib/api/user'
import { Alert } from '@/components/ui/alert'
import { MarkdownMessage } from "@/components/markdown-message"
import { HistoryList } from "@/components/history/history-list"

interface ChatHistoryProps {
  onClose: () => void
  onSelect: (messages: Message[], chatId: string) => void
  onNewChat: () => void
  onManageHistory?: () => void
}

export function ChatHistory({ onClose, onSelect, onNewChat, onManageHistory }: ChatHistoryProps) {
  const { selectedAgent } = useAgent()
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : ''
  const { list: chatSessions, total, loading, error } = useRemoteChatHistory({ userId, agentId: selectedAgent?.id, keyword: searchQuery, page, pageSize })
  const [localSessions, setLocalSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<{ id: string; messages: Message[] } | null>(null)
  const { isMdAndDown } = useResponsive()
  const { toast } = useToast()

  // 添加状态来跟踪要删除的会话ID
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  // 添加调试状态
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  // 1. 新增多选、标签筛选、标签编辑状态
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([])
  const [tagFilter, setTagFilter] = useState("")
  const [editingTagSessionId, setEditingTagSessionId] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState<string>("")

  useEffect(() => {
    loadChatHistory()
  }, [selectedAgent])

  // 监听搜索查询变化
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchChatSessions(searchQuery)
      setLocalSessions(results)
    } else {
      setLocalSessions(getAllChatSessions())
    }
  }, [searchQuery])

  // 更新loadChatHistory函数以确保正确加载聊天会话
  const loadChatHistory = async () => {
    setIsLoading(true)
    try {
      // 调试存储状态
      const storageState = debugStorageState()
      console.log("Storage state when loading chat history:", storageState)

      // 从本地存储加载聊天会话
      const sessions = getAllChatSessions()
      setLocalSessions(sessions)
      console.log("Loaded chat sessions:", sessions.length)

      // 如果没有加载会话，检查存储是否有问题
      if (sessions.length === 0) {
        console.warn("No chat sessions found in storage. This might be normal for new users.")
        setDebugInfo("No chat sessions found. This might be normal if you haven't had any conversations yet.")

        // 尝试重建索引
        rebuildChatIndex()
        const rebuiltSessions = getAllChatSessions()
        if (rebuiltSessions.length > 0) {
          setLocalSessions(rebuiltSessions)
          setDebugInfo(null)
          console.log("Successfully rebuilt chat index and found sessions:", rebuiltSessions.length)
        }
      } else {
        setDebugInfo(null)
      }
    } catch (error) {
      console.error("Failed to load chat history:", error)
      setDebugInfo(`Error loading chat history: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "加载失败",
        description: "无法加载聊天历史记录，请刷新页面重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSessionSelect = async (session: ChatSessionIndexItem) => {
    setIsLoading(true)
    try {
      // 加载会话消息
      const messages = loadMessagesFromStorage(session.id)
      if (messages) {
        setSelectedSession({
          id: session.id,
          messages,
        })
        console.log(`Loaded ${messages.length} messages for session ${session.id}`)
      } else {
        console.error(`No messages found for session ${session.id}`)
        toast({
          title: t("chatHistory"),
          description: t("failedToLoadConversation" as any),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to load session messages:", error)
      toast({
        title: t("chatHistory"),
        description: t("failedToLoadConversation" as any),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDelete = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSessionToDelete(sessionId)
  }

  const executeDelete = async () => {
    if (sessionToDelete) {
      try {
        // 删除会话
        const success = deleteChatSession(sessionToDelete)
        if (success) {
          // 从列表中移除会话
          setLocalSessions((prev) => prev.filter((session) => session.id !== sessionToDelete))

          toast({
            title: t("deleted"),
            description: t("conversationDeleted"),
          })
        } else {
          throw new Error("Failed to delete conversation")
        }
      } catch (error) {
        console.error("Failed to delete chat session:", error)
        toast({
          title: t("chatHistory"),
          description: t("failedToDeleteConversation"),
          variant: "destructive",
        })
      }

      // 重置要删除的会话ID
      setSessionToDelete(null)
    }
  }

  const cancelDelete = () => {
    setSessionToDelete(null)
  }

  const handleLoadSession = () => {
    if (selectedSession) {
      // 确保消息的时间戳是Date对象
      const processedMessages = selectedSession.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }))

      onSelect(processedMessages, selectedSession.id)
      onClose()
    }
  }

  const handleBackToList = () => {
    setSelectedSession(null)
  }

  // 在refreshHistory函数中调用
  const refreshHistory = () => {
    const storageState = debugStorageState()
    console.log("Storage state when refreshing history:", storageState)

    // 尝试重建索引
    rebuildChatIndex()

    // 重新加载聊天历史
    loadChatHistory()

    toast({
      title: t("chatHistory"),
      description: t("historyRefreshed" as any),
    })
  }

  // 2. 多选切换逻辑
  const toggleSessionSelect = (id: string) => {
    setSelectedSessionIds((prev) => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id])
  }
  const selectAllSessions = () => {
    setSelectedSessionIds(localSessions.map(s => s.id))
  }
  const clearAllSelections = () => {
    setSelectedSessionIds([])
  }

  // 3. 批量删除逻辑
  const handleBatchDelete = async () => {
    if (selectedSessionIds.length === 0) return
    for (const id of selectedSessionIds) {
      deleteChatSession(id)
    }
    setLocalSessions((prev: any[]) => prev.filter((session) => !selectedSessionIds.includes(session.id)))
    setSelectedSessionIds([])
    toast({ title: t("deleted"), description: `已批量删除${selectedSessionIds.length}条会话` })
  }

  // 4. 标签编辑逻辑
  const handleEditTag = (sessionId: string, tags: string[]) => {
    setLocalSessions((prev: any[]) => prev.map(s => s.id === sessionId ? { ...s, tags } : s))
    setEditingTagSessionId(null)
  }

  // 5. 标签筛选逻辑
  const filteredSessions = localSessions.filter(session =>
    (!tagFilter || (session.tags && session.tags.includes(tagFilter))) &&
    (!searchQuery || session.title.includes(searchQuery) || (session.tags && session.tags.some(tag => tag.includes(searchQuery))))
  )

  // 统一分页与本地/远端历史
  const mergedSessions = [...chatSessions, ...localSessions.filter(s => !chatSessions.some(cs => cs.id === s.id))]
  const pagedSessions = mergedSessions.slice(0, page * pageSize)

  const EmptyState = () => (
    <div className="text-center py-8 flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <MessageSquare className="h-8 w-8 text-primary/60" />
      </div>
      <h3 className="text-lg font-medium mb-2">{t("noConversations")}</h3>
      <p className="text-muted-foreground mb-4">{t("startNewChatDescription")}</p>
      <Button
        variant="outline"
        size="sm"
        className="border-primary/20 text-primary hover:bg-primary/10"
        onClick={onNewChat}
      >
        <Plus className="h-3.5 w-3.5 mr-2" />
        {t("startNewChat")}
      </Button>

      {debugInfo && (
        <div className="mt-4 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
          <p>Debug info: {debugInfo}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={refreshHistory}>
            <RefreshCw className="h-3 w-3 mr-1" />
            重建索引
          </Button>
        </div>
      )}
    </div>
  )

  if (loading) return (
    <div className="w-full max-w-lg mx-auto bg-background rounded-lg shadow-lg p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">加载中，请稍候...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="w-full max-w-lg mx-auto bg-background rounded-lg shadow-lg p-6">
      <Alert variant="destructive" className="mb-4">
        <div className="font-medium">获取聊天历史失败</div>
        <div className="text-sm mt-1">{error.message || String(error)}</div>
      </Alert>
      <div className="text-sm text-muted-foreground mt-4 p-3 bg-muted/30 rounded-md">
        <p className="mb-2">可能的原因：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>服务器暂时不可用</li>
          <li>网络连接问题</li>
          <li>API返回格式错误</li>
        </ul>
        <p className="mt-3">您可以尝试：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>刷新页面</li>
          <li>检查网络连接</li>
          <li>稍后再试</li>
        </ul>
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          刷新页面
        </Button>
      </div>
    </div>
  )

  // 检查当前路径是否为user界面
  const isUserInterface = typeof window !== 'undefined' && window.location.pathname.includes('/user');

  return (
    <div className={cn(
      "w-full mx-auto bg-background rounded-lg shadow-lg p-0 touch-manipulation",
      isMdAndDown ? "max-w-none h-[90vh] m-0" : "max-w-2xl max-h-[80vh]",
      isMdAndDown && "rounded-none sm:rounded-lg"
    )}>
      <div className={cn(
        "flex items-center justify-between border-b",
        isMdAndDown ? "px-3 py-2.5" : "px-4 py-3"
      )}>
        <span className={cn(
          "font-semibold",
          isMdAndDown ? "text-sm" : "text-base"
        )}>历史记录</span>
        <div className="flex gap-1.5">
          {onManageHistory && (
            <Button
              variant="ghost"
              size={isMdAndDown ? "sm" : "sm"}
              className={cn(
                isMdAndDown && "text-xs px-2 min-h-[32px]",
                "touch-manipulation active:scale-95 transition-transform"
              )}
              onClick={onManageHistory}
            >
              管理
            </Button>
          )}
          <Button
            variant="ghost"
            size={isMdAndDown ? "sm" : "sm"}
            className={cn(
              isMdAndDown && "text-xs px-2 min-h-[32px]",
              "touch-manipulation active:scale-95 transition-transform"
            )}
            onClick={onClose}
          >
            关闭
          </Button>
        </div>
      </div>
      <HistoryList
        onSelect={onSelect}
        onNewChat={onNewChat}
        viewType="dialog"
      />
    </div>
  )
}
