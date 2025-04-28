"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronUp, Code, Database, FileJson, Layers, Brain, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface IntermediateValue {
  id: string
  type: string
  value: any
  timestamp: Date
}

interface IntermediateValuesDisplayProps {
  values: IntermediateValue[]
  isVisible: boolean
}

export function IntermediateValuesDisplay({ values, isVisible }: IntermediateValuesDisplayProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  if (!isVisible || values.length === 0) {
    return null
  }

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "moduleStatus":
        return <Layers className="h-4 w-4 text-blue-500" />
      case "moduleResult":
        return <Database className="h-4 w-4 text-green-500" />
      case "responseData":
        return <FileJson className="h-4 w-4 text-purple-500" />
      case "thinking":
      case "thinkingStart":
      case "thinkingEnd":
        return <Brain className="h-4 w-4 text-amber-500" />
      case "moduleStart":
      case "moduleEnd":
        return <Zap className="h-4 w-4 text-cyan-500" />
      default:
        return <Code className="h-4 w-4 text-gray-500" />
    }
  }

  const formatValue = (value: any): string => {
    try {
      return JSON.stringify(value, null, 2)
    } catch (e) {
      return String(value)
    }
  }

  return (
    <Card className="border-pantone369-100 dark:border-pantone369-900/30 mt-4 mb-4">
      <CardHeader className="bg-pantone369-50/50 dark:bg-pantone369-900/10 py-2 px-4">
        <CardTitle className="text-sm font-medium flex items-center">
          <Layers className="h-4 w-4 mr-2 text-pantone369-500" />
          处理详情 ({values.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-[300px]">
          <div className="p-2 space-y-2">
            {values.map((value) => (
              <div
                key={value.id}
                className="border rounded-md border-pantone369-100 dark:border-pantone369-900/30 overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-2 bg-pantone369-50/30 dark:bg-pantone369-900/20 cursor-pointer"
                  onClick={() => toggleExpand(value.id)}
                >
                  <div className="flex items-center gap-2">
                    {getIcon(value.type)}
                    <span className="font-medium text-sm">{value.type}</span>
                    <Badge
                      variant="outline"
                      className="ml-2 text-[10px] h-4 px-1 bg-pantone369-50 dark:bg-pantone369-900/30 text-pantone369-700 dark:text-pantone369-300 border-pantone369-200 dark:border-pantone369-800/30"
                    >
                      {value.timestamp.toLocaleTimeString()}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    {expanded[value.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                {expanded[value.id] && (
                  <div className="p-2 bg-muted/30">
                    {value.type.includes("thinking") ? (
                      <div
                        className={cn(
                          "text-xs p-2 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40",
                          "prose prose-sm max-w-none",
                        )}
                      >
                        <p className="font-medium text-amber-800 dark:text-amber-300 mb-1">思考过程：</p>
                        <div className="whitespace-pre-wrap">{formatValue(value.value)}</div>
                      </div>
                    ) : (
                      <pre
                        className={cn(
                          "text-xs overflow-auto p-2 rounded bg-muted/50 max-h-[200px]",
                          "border border-pantone369-100 dark:border-pantone369-900/30",
                        )}
                      >
                        {formatValue(value.value)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
