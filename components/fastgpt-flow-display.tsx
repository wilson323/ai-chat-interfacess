"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronUp, Layers, CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface FlowNode {
  id: string
  name: string
  status: "running" | "success" | "error" | "pending"
  timestamp: Date
  details?: any
  responses?: any[]
}

interface FastGPTFlowDisplayProps {
  nodes: FlowNode[]
  isVisible: boolean
}

export function FastGPTFlowDisplay({ nodes, isVisible }: FastGPTFlowDisplayProps) {
  const [expanded, setExpanded] = useState<boolean>(true)

  if (!isVisible || nodes.length === 0) {
    return null
  }

  const getNodeIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "pending":
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getNodeColor = (status: string) => {
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
    <Card className="border-blue-100 dark:border-blue-900/30 mt-4 mb-4 overflow-hidden">
      <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 py-2 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center">
          <Layers className="h-4 w-4 mr-2 text-blue-500" />
          FastGPT 流程 ({nodes.length})
        </CardTitle>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>

      {expanded && (
        <CardContent className="p-0">
          <ScrollArea className="max-h-[300px]">
            <div className="p-3 space-y-2">
              {nodes.map((node) => (
                <div key={node.id} className={cn("rounded-md p-3 border", getNodeColor(node.status))}>
                  <div className="flex items-center gap-2 mb-2">
                    {getNodeIcon(node.status)}
                    <span className="text-sm font-medium">{node.name}</span>
                    <Badge variant="outline" className="ml-auto text-[10px] h-4 px-1">
                      {node.timestamp.toLocaleTimeString()}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] h-4 px-1",
                        node.status === "running"
                          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30"
                          : node.status === "success"
                            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800/30"
                            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/30",
                      )}
                    >
                      {node.status}
                    </Badge>
                  </div>

                  {node.responses && node.responses.length > 0 && (
                    <div className="mt-2 pl-6 border-l-2 border-blue-200 dark:border-blue-800/30">
                      <div className="text-xs font-medium mb-1">响应数据:</div>
                      {node.responses.map((response, index) => (
                        <div key={index} className="text-xs bg-blue-50/50 dark:bg-blue-900/10 p-2 rounded mb-1">
                          {typeof response === "object" ? JSON.stringify(response, null, 2) : response.toString()}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  )
}
