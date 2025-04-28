"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ThinkingValue {
  id: string
  content: string
  timestamp: Date
}

interface ThinkingDisplayProps {
  values: ThinkingValue[]
  isVisible: boolean
}

export function ThinkingDisplay({ values, isVisible }: ThinkingDisplayProps) {
  const [expanded, setExpanded] = useState<boolean>(true)

  if (!isVisible || values.length === 0) {
    return null
  }

  return (
    <Card className="border-amber-200 dark:border-amber-900/30 mt-4 mb-4 overflow-hidden">
      <CardHeader className="bg-amber-50/70 dark:bg-amber-900/10 py-2 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center">
          <Brain className="h-4 w-4 mr-2 text-amber-500" />
          思考过程
        </CardTitle>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>

      {expanded && (
        <CardContent className="p-0">
          <ScrollArea className="max-h-[300px]">
            <div className="p-3 space-y-2">
              {values.map((value) => (
                <div
                  key={value.id}
                  className="bg-amber-50/50 dark:bg-amber-900/5 rounded-md p-3 border border-amber-100 dark:border-amber-900/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] h-4 px-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/30"
                    >
                      {value.timestamp.toLocaleTimeString()}
                    </Badge>
                  </div>
                  <div className="text-sm whitespace-pre-wrap text-amber-900 dark:text-amber-200">{value.content}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  )
}
