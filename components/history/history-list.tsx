import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useAgent } from "@/context/agent-context";
import { MessageSquare, Trash2, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import type { Message } from "@/types/message";
import type { ChatSessionIndexItem } from "@/lib/storage/index";
import {
  loadMessagesFromStorage,
  getAllChatSessions,
  deleteChatSession,
  searchChatSessions,
} from "@/lib/storage/index";

interface HistoryListProps {
  onSelect: (messages: Message[], chatId: string) => void;
  onDelete?: (sessionId: string) => void;
  onEditTag?: (sessionId: string, tags: string[]) => void;
  filterAgentId?: string;
  viewType?: "dialog" | "sidebar";
  onNewChat?: () => void;
  selectable?: boolean;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  onSelect,
  onDelete,
  onEditTag,
  filterAgentId,
  viewType = "dialog",
  onNewChat,
  selectable = false,
}) => {
  const { t } = useLanguage();
  const { selectedAgent } = useAgent();
  const [searchQuery, setSearchQuery] = useState("");
  const [sessions, setSessions] = useState<ChatSessionIndexItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [selectedAgent, filterAgentId]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setSessions(searchChatSessions(searchQuery));
    } else {
      setSessions(getAllChatSessions());
    }
  }, [searchQuery]);

  const loadHistory = () => {
    setIsLoading(true);
    try {
      // 尝试获取所有聊天会话
      const all = getAllChatSessions();

      // 如果过滤条件存在，应用过滤
      const filtered = filterAgentId ? all.filter((s) => s.agentId === filterAgentId) : all;

      // 更新会话列表
      setSessions(filtered);

      // 如果没有会话，记录日志
      if (filtered.length === 0) {
        console.log("没有找到聊天历史记录");
      } else {
        console.log(`加载了 ${filtered.length} 条聊天历史记录`);
      }
    } catch (error) {
      console.error("加载聊天历史时出错:", error);
      // 设置为空数组，避免显示错误
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (session: ChatSessionIndexItem) => {
    setIsLoading(true);
    try {
      // 尝试加载消息
      const messages = loadMessagesFromStorage(session.id);

      if (messages && Array.isArray(messages) && messages.length > 0) {
        // 确保时间戳是Date对象
        const processedMessages = messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
        }));

        // 调用选择回调
        onSelect(processedMessages, session.id);
        setSelectedSessionId(session.id);
        console.log(`已加载会话 ${session.id} 的 ${messages.length} 条消息`);
      } else {
        console.warn(`会话 ${session.id} 没有消息或消息格式无效`);
      }
    } catch (error) {
      console.error(`加载会话 ${session.id} 的消息时出错:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(sessionId);
    else {
      deleteChatSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    }
  };

  return (
    <div className={cn("w-full", viewType === "sidebar" ? "p-2" : "p-4")}>
      <div className="mb-2 flex items-center gap-2">
        <Input
          placeholder={t("searchHistory")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        {onNewChat && (
          <Button size="sm" onClick={onNewChat}>
            {t("newChat")}
          </Button>
        )}
      </div>
      <ScrollArea className="h-[300px]">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">{t("loading" as any)}</div>
        ) : sessions.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">{t("noConversations" as any)}</div>
        ) : (
          <div className="space-y-2">
            {sessions.map((chat) => (
              <Card
                key={chat.id}
                className={cn(
                  "p-3 cursor-pointer border transition-colors group",
                  selectedSessionId === chat.id && "border-primary bg-accent/30",
                  "hover:border-primary/60 hover:bg-accent/10"
                )}
                onClick={() => handleSelect(chat)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm truncate flex-1">{chat.title}</span>
                  <span className="text-xs text-muted-foreground">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    {chat.timestamp && !isNaN(chat.timestamp)
                      ? formatDistanceToNow(new Date(chat.timestamp), { addSuffix: true, locale: zhCN })
                      : "无时间"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1 group-hover:bg-destructive/10"
                    onClick={(e) => handleDelete(chat.id, e)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2">{chat.preview || ""}</div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};