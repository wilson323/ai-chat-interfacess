"use client"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { useAgent } from "@/context/agent-context"
import { History, Plus, Check, ChevronDown, Bot, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/context/language-context"
import type { Language } from "@/lib/i18n/translations"
import { useMobile } from "@/hooks/use-mobile"
import { generateFallbackChatId } from "@/lib/api/fastgpt"

// Add isAdmin prop to the component
export function Header({ isAdmin = false }: { isAdmin?: boolean }) {
  const { toggleHistorySidebar, selectedAgent, agents, selectAgent } = useAgent()
  const { language, setLanguage, availableLanguages, t } = useLanguage()
  const isMobile = useMobile()

  // Function to create a new conversation with the current agent
  const createNewConversation = () => {
    if (selectedAgent) {
      // Generate a new chat ID
      const newChatId = generateFallbackChatId()

      // Update the agent with the new chat ID
      const updatedAgent = {
        ...selectedAgent,
        chatId: newChatId,
      }

      // Select the updated agent (which effectively creates a new conversation)
      selectAgent(updatedAgent)

      // Reload the page to clear the chat history
      window.location.reload()
    }
  }

  return (
    <header className="h-16 border-b bg-background/80 backdrop-blur-xl flex items-center justify-between px-2 sm:px-4 fixed top-0 left-0 right-0 z-30">
      <div className="flex items-center gap-1 sm:gap-3">
        {!isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1 sm:gap-2 font-medium text-xs sm:text-base h-8 sm:h-9 px-2 sm:px-3">
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary animate-pulse" />
                <span className="truncate max-w-[80px] sm:max-w-[150px]">{selectedAgent?.name || "ZKTeco"}</span>
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <div className="p-2 text-xs font-medium text-muted-foreground">{t("switchAgent")}</div>
              {agents.filter((agent) => (!isAdmin ? agent.isPublished : true)).length === 0 ? (
                <div className="text-muted-foreground text-sm px-4 py-2">无可用智能体</div>
              ) : (
                agents
                  .filter((agent) => (!isAdmin ? agent.isPublished : true))
                  .map((agent) => (
                    <DropdownMenuItem
                      key={agent.id}
                      onClick={() => selectAgent(agent)}
                      className={cn("flex items-center gap-2 py-2", selectedAgent?.id === agent.id && "bg-accent")}
                    >
                      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                        {agent.icon || <Bot className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{agent.name}</div>
                      </div>
                      {selectedAgent?.id === agent.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </DropdownMenuItem>
                  ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Plus className="h-4 w-4 mr-2" />
                {t("newAgent")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* 在移动设备上隐藏某些按钮 */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 sm:h-9 w-8 sm:w-9 hidden sm:flex"
          onClick={createNewConversation}
        >
          <Plus className="h-4 sm:h-5 w-4 sm:w-5" />
        </Button>

        <Button variant="ghost" size="icon" onClick={() => toggleHistorySidebar()} className="h-8 sm:h-9 w-8 sm:w-9">
          <History className="h-4 sm:h-5 w-4 sm:w-5" />
        </Button>

        {/* 语言下拉菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 sm:h-9 w-8 sm:w-9">
              <Globe className="h-4 sm:h-5 w-4 sm:w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2 text-xs font-medium text-muted-foreground">{t("selectLanguage")}</div>
            {Object.entries(availableLanguages).map(([code, name]) => (
              <DropdownMenuItem
                key={code}
                onClick={() => setLanguage(code as Language)}
                className={cn("flex items-center gap-2 py-2", language === code && "bg-accent")}
              >
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>{name}</span>
                {language === code && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
