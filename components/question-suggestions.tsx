"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { useLanguage } from "@/context/language-context"
import { cn } from "@/lib/utils"

interface QuestionSuggestionsProps {
  suggestions: string[]
  loading?: boolean
  onSuggestionClick: (suggestion: string) => void
}

export function QuestionSuggestions({ suggestions, loading = false, onSuggestionClick }: QuestionSuggestionsProps) {
  const { t } = useLanguage()

  if (suggestions.length === 0 && !loading) {
    return null
  }

  return (
    <div className="flex flex-col items-center space-y-3 my-6 animate-fadeIn">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-pantone369-500" />
        <span>{t("questionGuide")}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-pantone369-500" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 justify-center">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className={cn(
                "text-sm border-pantone369-200 dark:border-pantone369-800/30",
                "text-pantone369-700 dark:text-pantone369-300",
                "hover:bg-pantone369-50 dark:hover:bg-pantone369-900/20",
                "transition-all duration-200 hover:-translate-y-0.5",
              )}
              onClick={() => onSuggestionClick(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
