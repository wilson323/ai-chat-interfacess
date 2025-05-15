"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useAgent } from "@/context/agent-context"
import { X, Search, MessageSquare, Trash2, ArchiveIcon, Clock, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMobile } from "@/hooks/use-mobile"
import { useLanguage } from "@/context/language-context"
import { HistoryList } from "@/components/history/history-list"

interface HistorySidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function HistorySidebar({ isOpen, onClose }: HistorySidebarProps) {
  const { selectedAgent } = useAgent()
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const isMobile = useMobile()

  // 模拟历史记录数据
  const chatHistory = [
    {
      id: "1",
      title: "关于人工智能的讨论",
      preview: "人工智能是计算机科学的一个分支，致力于创造能够模拟人类智能的系统...",
      date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
      agentId: "1",
    },
    {
      id: "2",
      title: "Web开发技术问题",
      preview: "React是一个用于构建用户界面的JavaScript库，由Facebook开发...",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1天前
      agentId: "2",
    },
    {
      id: "3",
      title: "数据库设计咨询",
      preview: "关系型数据库和NoSQL数据库各有优缺点...",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3天前
      agentId: "3",
    },
  ]

  const filteredHistory = chatHistory.filter((chat) => {
    const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAgent = activeTab === "all" || (activeTab === "current" && chat.agentId === selectedAgent?.id)
    return matchesSearch && matchesAgent
  })

  return (
    <aside
      className={cn(
        "fixed inset-y-0 right-0 z-50 w-72 sm:w-80 border-l bg-background/80 backdrop-blur-xl",
        "transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="p-3 sm:p-4 border-b flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2">
          <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          {t("chatHistory")}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 sm:h-9 sm:w-9">
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>

      <div className="p-3 sm:p-4">
        <div className="relative mb-3 sm:mb-4">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchHistory")}
            className="pl-8 sm:pl-9 bg-background text-xs sm:text-sm h-8 sm:h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" className="mb-3 sm:mb-4" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 h-8 sm:h-9">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              {t("allChats")}
            </TabsTrigger>
            <TabsTrigger value="current" className="text-xs sm:text-sm">
              {t("currentAgent")}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center justify-between mb-2">
          <Button className="w-full h-8 sm:h-9 text-xs sm:text-sm" variant="default">
            <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            {t("newChat")}
          </Button>
        </div>
      </div>

      <div className="px-3 sm:px-4 py-2 flex items-center justify-between">
        <span className="text-[10px] sm:text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          {t("recentConversations")}
        </span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-5 w-5 sm:h-6 sm:w-6">
            <ArchiveIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-5 w-5 sm:h-6 sm:w-6">
            <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-14rem)]">
        <div className="p-2 sm:p-3 grid gap-1.5 sm:gap-2">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((chat) => (
              <div
                key={chat.id}
                className="p-2.5 sm:p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  <div className="font-medium text-xs sm:text-sm truncate">{chat.title}</div>
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{chat.preview}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2 flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  {formatDistanceToNow(chat.date, { addSuffix: true, locale: zhCN })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs sm:text-sm">{t("noConversations")}</p>
              <p className="text-[10px] sm:text-xs">{t("startNewChat")}</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <HistoryList
        onSelect={() => {}}
        viewType="sidebar"
      />
    </aside>
  )
}
