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
import { useResponsive } from "@/hooks/use-responsive";
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
  const { isMdAndDown, isSmAndDown } = useResponsive();
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
    <div className={cn(
      "w-full",
      viewType === "sidebar" ? "p-2" : (isMdAndDown ? "p-3" : "p-4")
    )}>
      <div className={cn(
        "mb-3 flex items-center gap-2",
        isSmAndDown && "flex-col gap-2"
      )}>
        <Input
          placeholder={t("searchHistory")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "flex-1",
            isMdAndDown ? "text-sm h-9" : "h-10"
          )}
        />
        {onNewChat && (
          <Button
            size={isMdAndDown ? "sm" : "sm"}
            className={cn(
              isSmAndDown && "w-full min-h-[40px]",
              isMdAndDown && "text-xs px-3 min-h-[36px]",
              "touch-manipulation active:scale-95 transition-transform"
            )}
            onClick={onNewChat}
          >
            {t("newChat")}
          </Button>
        )}
      </div>
      <ScrollArea className={cn(
        isMdAndDown ? "h-[calc(90vh-140px)]" : "h-[calc(80vh-120px)]"
      )}>
        {isLoading ? (
          <div className={cn(
            "text-center text-muted-foreground py-8",
            isMdAndDown ? "text-sm py-6" : ""
          )}>{t("loading" as any)}</div>
        ) : sessions.length === 0 ? (
          <div className={cn(
            "text-center text-muted-foreground py-8",
            isMdAndDown ? "text-sm py-6" : ""
          )}>{t("noConversations" as any)}</div>
        ) : (
          <div className={cn(
            "space-y-2",
            isMdAndDown && "space-y-1.5"
          )}>
            {sessions.map((chat) => (
              <Card
                key={chat.id}
                className={cn(
                  "cursor-pointer border transition-colors group",
                  isMdAndDown ? "p-2.5 min-h-[48px]" : "p-3 min-h-[52px]",
                  selectedSessionId === chat.id && "border-primary bg-accent/30",
                  "hover:border-primary/60 hover:bg-accent/10",
                  "active:bg-accent/20 touch-manipulation"
                )}
                onClick={() => handleSelect(chat)}
              >
                <div className={cn(
                  "flex items-center gap-2 mb-1",
                  isSmAndDown && "flex-wrap"
                )}>
                  <MessageSquare className={cn(
                    "text-primary flex-shrink-0",
                    isMdAndDown ? "h-3.5 w-3.5" : "h-4 w-4"
                  )} />
                  <span className={cn(
                    "font-medium truncate flex-1 min-w-0",
                    isMdAndDown ? "text-xs" : "text-sm"
                  )}>{chat.title}</span>
                  {!isSmAndDown && (
                    <span className={cn(
                      "text-muted-foreground flex-shrink-0",
                      isMdAndDown ? "text-xs" : "text-xs"
                    )}>
                      <Calendar className={cn(
                        "inline mr-1",
                        isMdAndDown ? "h-2.5 w-2.5" : "h-3 w-3"
                      )} />
                      {chat.timestamp && !isNaN(chat.timestamp)
                        ? formatDistanceToNow(new Date(chat.timestamp), { addSuffix: true, locale: zhCN })
                        : "无时间"}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "ml-1 group-hover:bg-destructive/10 flex-shrink-0 touch-manipulation",
                      isMdAndDown ? "h-8 w-8 min-h-[32px] min-w-[32px]" : "h-6 w-6",
                      "active:bg-destructive/20"
                    )}
                    onClick={(e) => handleDelete(chat.id, e)}
                  >
                    <Trash2 className={cn(
                      "text-destructive",
                      isMdAndDown ? "h-3.5 w-3.5" : "h-4 w-4"
                    )} />
                  </Button>
                </div>
                {isSmAndDown && chat.timestamp && !isNaN(chat.timestamp) && (
                  <div className="text-xs text-muted-foreground mb-1 flex items-center">
                    <Calendar className="inline h-2.5 w-2.5 mr-1" />
                    {formatDistanceToNow(new Date(chat.timestamp), { addSuffix: true, locale: zhCN })}
                  </div>
                )}
                <div className={cn(
                  "text-muted-foreground line-clamp-2",
                  isMdAndDown ? "text-xs" : "text-xs"
                )}>{chat.preview || ""}</div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};