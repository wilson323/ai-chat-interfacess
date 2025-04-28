"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAgent } from "@/context/agent-context"
import { X, Search, MessageSquare, Calendar, Clock, ArrowLeft, Plus, Trash2, RefreshCw, Settings } from "lucide-react"
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

  if (loading) return <div>加载中...</div>
  if (error) return <Alert variant="destructive">{error}</Alert>

  return (
    <Card
      className={cn(
        "w-full max-w-3xl mx-auto shadow-lg border-border dark:border-zinc-700/50 relative z-50",
        "bg-card/95 dark:bg-zinc-900/95 backdrop-blur-sm",
      )}
    >
      <CardHeader className="bg-muted/50 dark:bg-zinc-800/50 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          {selectedSession ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 mr-2"
              onClick={handleBackToList}
              aria-label="Back to chat history"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <MessageSquare className="h-5 w-5 text-primary" />
          )}
          {selectedSession
            ? localSessions.find((s) => s.id === selectedSession.id)?.title || t("chatHistory")
            : t("chatHistory")}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close chat history" data-testid="close-history-btn">
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        {/* 标签筛选与批量操作栏 */}
        <div className="flex flex-wrap gap-2 mb-3 items-center">
          <Input placeholder="标签筛选" className="w-32" value={tagFilter} onChange={e => setTagFilter(e.target.value)} data-testid="tag-filter-input" />
          <Button variant="outline" size="sm" onClick={selectAllSessions} data-testid="select-all-btn">全选</Button>
          <Button variant="outline" size="sm" onClick={clearAllSelections} data-testid="clear-selection-btn">清空选择</Button>
          <Button variant="destructive" size="sm" onClick={handleBatchDelete} disabled={selectedSessionIds.length === 0} data-testid="batch-delete-btn">批量删除</Button>
        </div>
        {!selectedSession ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="relative flex-1 mr-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchHistory")}
                  className="pl-9 bg-background"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
                  data-testid="search-history-input"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={refreshHistory}
                  title={t("refreshHistory" as any)}
                  data-testid="refresh-history-btn"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                {onManageHistory && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={onManageHistory}
                    title={t("manageAgents")}
                    data-testid="manage-history-btn"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">{t("recentConversations")}</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-primary hover:bg-primary/10"
                onClick={onNewChat}
                data-testid="new-chat-btn"
              >
                <Plus className="h-3 w-3 mr-1.5" />
                {t("newChat")}
              </Button>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {pagedSessions.map((session) => (
                  <div key={session.id} className={cn("group p-3 rounded-lg border hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-all duration-200 flex items-center", selectedSessionIds.includes(session.id) && "bg-primary/10 border-primary/30")}
                    onClick={() => handleSessionSelect(session)}
                    data-testid={`chat-session-${session.id}`}
                  >
                    <input type="checkbox" className="mr-2" checked={selectedSessionIds.includes(session.id)} onChange={e => { e.stopPropagation(); toggleSessionSelect(session.id) }} data-testid={`session-checkbox-${session.id}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate flex items-center gap-2">
                        {session.title}
                        {/* 标签显示 */}
                        {session.tags && ((session.tags as string[]).map((tag: string) => <span key={tag} className="ml-1 px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground" data-testid={`session-tag-${tag}`}>{tag}</span>))}
                        <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={e => { e.stopPropagation(); setEditingTagSessionId(session.id); setTagInput(((session.tags||[]) as string[]).join(",")) }} data-testid={`edit-tag-btn-${session.id}`}>✎</Button>
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-2" data-testid={`session-preview-${session.id}`}>{session.preview}</div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => confirmDelete(session.id, e)} data-testid={`delete-session-btn-${session.id}`}>
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            {pagedSessions.length < mergedSessions.length && (
              <Button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded" onClick={() => setPage(page + 1)} data-testid="load-more-btn">
                加载更多
              </Button>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
              <Clock className="h-3.5 w-3.5" />
              {formatDistanceToNow(
                selectedSession.messages.length > 0
                  ? new Date(selectedSession.messages[selectedSession.messages.length - 1].timestamp)
                  : new Date(),
                { addSuffix: true },
              )}
              <span className="ml-2 bg-muted px-1.5 py-0.5 rounded-full text-[10px]">
                {selectedSession.messages.length}条消息
              </span>
            </div>

            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-4">
                {selectedSession.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "p-3 rounded-lg",
                      message.role === "user"
                        ? "bg-[#6cb33f] text-white ml-8 rounded-[12px_12px_3px_12px]"
                        : "bg-[#f8f9fa] text-[#2d3436] mr-8 rounded-[12px_12px_12px_3px] border border-[#e9ecef]",
                    )}
                    data-testid={`chat-message-${message.id}`}
                  >
                    <div className="text-xs font-medium mb-1">
                      {message.role === "user" ? t("you") : t("assistant")}
                    </div>
                    <div className="text-sm whitespace-pre-wrap" data-testid={`message-content-${message.id}`}>{message.content as string}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleBackToList} className="border-border/50 dark:border-zinc-700/30">
                {t("backToList")}
              </Button>
              <Button onClick={handleLoadSession} className="bg-[#6cb33f] hover:bg-[#6cb33f]/90 text-white">
                {t("continueConversation")}
              </Button>
            </div>
          </div>
        )}
        {/* 标签编辑弹窗 */}
        {editingTagSessionId && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" data-testid="edit-tag-modal">
            <div className="bg-card border rounded-lg shadow-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">编辑标签</h3>
              <div className="flex gap-1 mt-1">
                <Input value={tagInput} onChange={e => setTagInput(e.target.value)} className="w-32" placeholder="逗号分隔标签" data-testid="edit-tag-input" />
                <Button size="sm" onClick={e => { e.stopPropagation(); handleEditTag(editingTagSessionId, tagInput.split(',').map(s=>s.trim()).filter(Boolean)); }} data-testid="save-tag-btn">保存</Button>
                <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); setEditingTagSessionId(null); }} data-testid="cancel-tag-btn">取消</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      {/* 确认删除对话框 */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" data-testid="delete-confirm-modal">
          <div className="bg-card border rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">{t("deleteConfirmation")}</h3>
            <p className="mb-6">{t("confirmDeleteConversation")}</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelDelete} data-testid="cancel-delete-btn">
                {t("cancel")}
              </Button>
              <Button variant="destructive" onClick={executeDelete} data-testid="confirm-delete-btn">
                {t("confirm")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
