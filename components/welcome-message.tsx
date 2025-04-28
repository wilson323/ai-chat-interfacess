"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, MessageSquare, History, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { MarkdownMessage } from "@/components/markdown-message"
import { useMobile } from "@/hooks/use-mobile"
import { useTranslation } from "react-i18next"

interface WelcomeMessageProps {
  message: string
  interacts?: any[]
  onInteractClick?: (text: string) => void
}

export function WelcomeMessage({ message, interacts = [], onInteractClick }: WelcomeMessageProps) {
  const [expanded, setExpanded] = useState(true)
  const isMobile = useMobile()
  const { t } = useTranslation()

  // 如果没有交互选项，则不显示展开/收起按钮
  const hasInteracts = interacts && interacts.length > 0

  // Ensure message is properly formatted
  const formattedMessage =
    typeof message === "string"
      ? message
      : message && typeof message === "object" && "content" in message
        ? String(message.content)
        : "你好！有什么我可以帮助你的吗？"

  return (
    <Card className="border-pantone369-100 dark:border-pantone369-900/30 overflow-hidden shadow-md mt-4 transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-pantone369-100 dark:bg-pantone369-900/30 flex items-center justify-center shrink-0">
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-pantone369-600 dark:text-pantone369-400" />
          </div>
          <div className="flex-1">
            <div className="prose prose-sm max-w-[80%] sm:max-w-[60%] dark:prose-invert mb-2 sm:mb-3 text-sm sm:text-base">
              <MarkdownMessage content={formattedMessage} />
            </div>

            {hasInteracts && (
              <div className="mt-3 sm:mt-4">
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <div className="text-xs sm:text-sm font-medium text-pantone369-700 dark:text-pantone369-300 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-pantone369-500" />
                    {t("commonQuestions")}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hover:bg-pantone369-50 dark:hover:bg-pantone369-900/20"
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? (
                      <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>

                {expanded && (
                  <div className="grid gap-1.5 sm:gap-2 mt-1 sm:mt-2">
                    {interacts.map((interact, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className={cn(
                          "justify-start text-left h-auto py-1.5 sm:py-2 px-2.5 sm:px-3 text-xs sm:text-sm",
                          "border-pantone369-200 dark:border-pantone369-800/30",
                          "text-pantone369-700 dark:text-pantone369-300",
                          "hover:bg-pantone369-50 dark:hover:bg-pantone369-900/20",
                          "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm",
                          isMobile ? "line-clamp-2" : "",
                        )}
                        onClick={() => onInteractClick && onInteractClick(interact.text || interact)}
                      >
                        {interact.text || interact}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {hasInteracts && expanded && (
          <div className="mt-4 pt-3 border-t border-pantone369-100 dark:border-pantone369-900/30">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs sm:text-sm border-pantone369-200 dark:border-pantone369-800/30 text-pantone369-700 dark:text-pantone369-300 hover:bg-pantone369-50 dark:hover:bg-pantone369-900/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
              onClick={() => window.dispatchEvent(new CustomEvent("toggle-history"))}
            >
              <History className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
              {t("viewChatHistory")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
