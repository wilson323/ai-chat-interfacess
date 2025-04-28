"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronUp, Layers, CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface ModuleStatus {
  id: string
  name: string
  status: "running" | "success" | "error" | "pending"
  timestamp: Date
  details?: any
}

interface ModuleStatusDisplayProps {
  modules: ModuleStatus[]
  isVisible: boolean
}

export function ModuleStatusDisplay({ modules, isVisible }: ModuleStatusDisplayProps) {
  const [expanded, setExpanded] = useState<boolean>(true)

  if (!isVisible || modules.length === 0) {
    return null
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
      case "success":
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case "error":
        return <AlertCircle className="h-3 w-3 text-red-500" />
      case "pending":
      default:
        return <Clock className="h-3 w-3 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30"
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30"
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30"
      case "pending":
      default:
        return "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800/30"
    }
  }

  return (
    <Card className="border-blue-200 dark:border-blue-900/30 mt-4 mb-4 overflow-hidden">
      <CardHeader className="bg-blue-50/70 dark:bg-blue-900/10 py-2 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center">
          <Layers className="h-4 w-4 mr-2 text-blue-500" />
          处理模块 ({modules.length})
        </CardTitle>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>

      {expanded && (
        <CardContent className="p-0">
          <ScrollArea className="max-h-[200px]">
            <div className="p-3 space-y-2">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className={cn("rounded-md p-2 border flex items-center gap-2", getStatusColor(module.status))}
                >
                  {getStatusIcon(module.status)}
                  <span className="text-sm font-medium">{module.name}</span>
                  <Badge variant="outline" className="ml-auto text-[10px] h-4 px-1">
                    {module.timestamp.toLocaleTimeString()}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  )
}
