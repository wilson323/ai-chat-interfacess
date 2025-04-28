"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronUp, Layers, Brain, CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CodeBlock } from "@/components/code-block"

interface ProcessingStep {
  id: string
  type: string
  name: string
  status: "running" | "success" | "error" | "pending"
  content?: string
  timestamp: Date
  details?: any
  isNew?: boolean
}

interface ProcessingFlowDisplayProps {
  steps: ProcessingStep[]
  isVisible: boolean
}

// 自定义状态指示点组件
const CustomDot = ({ status }: { status: string }) => {
  switch (status) {
    case "running":
      return <div className="timeline-dot running animate-pulse" />
    case "success":
      return <div className="timeline-dot success" />
    case "error":
      return <div className="timeline-dot error" />
    case "pending":
    default:
      return <div className="timeline-dot" />
  }
}

// 步骤卡片组件
const StepCard = ({ step, isAlternate }: { step: ProcessingStep; isAlternate: boolean }) => {
  const [isContentVisible, setIsContentVisible] = useState(
    step.type === "flowNodeStatus" || step.type === "moduleStatus",
  )
  const [highlight, setHighlight] = useState(step.isNew)

  useEffect(() => {
    if (step.isNew) {
      setHighlight(true)
      const timer = setTimeout(() => setHighlight(false), 1200)
      return () => clearTimeout(timer)
    }
  }, [step.isNew])

  // 确定卡片样式，激活状态显示绿色边框
  const cardClasses = cn(
    "p-3 rounded-md border transition-all duration-200 shadow-simple",
    getStepColor(step.type, step.status),
    step.status === "running" && "green-accent",
    highlight && "ring-2 ring-pantone369-400/80 ring-offset-2 animate-pulse"
  )

  return (
    <div className={cardClasses}>
      <div className="flex items-center gap-2 mb-2">
        {getStepIcon(step.type, step.status)}
        <span className="text-sm font-medium">{step.name}</span>
        <Badge variant="outline" className="ml-auto text-[10px] h-4 px-1">
          {step.timestamp.toLocaleTimeString()}
        </Badge>
        {step.content && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 ml-1"
            onClick={() => setIsContentVisible(!isContentVisible)}
          >
            {isContentVisible ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        )}
      </div>

      {isContentVisible && step.content && (
        <div className="text-sm mt-2 pl-4 border-l border-l-muted transition-all duration-200">
          {formatContent(step.content)}
        </div>
      )}

      {/* 显示详细信息 */}
      {isContentVisible && !step.content && step.details && (
        <div className="text-sm mt-2 pl-4 border-l border-l-muted transition-all duration-200">
          {formatContent(JSON.stringify(step.details, null, 2))}
        </div>
      )}
    </div>
  )
}

// 获取步骤图标
const getStepIcon = (type: string, status: string) => {
  if (type === "thinking" || type === "thinkingStart" || type === "thinkingEnd") {
    return <Brain className="h-4 w-4 text-amber-500" />
  } else if (type === "flowNodeStatus" || type === "moduleStatus" || type === "moduleStart" || type === "moduleEnd") {
    return status === "running" ? (
      <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
    ) : status === "success" ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : status === "error" ? (
      <AlertCircle className="h-4 w-4 text-red-500" />
    ) : (
      <Clock className="h-4 w-4 text-gray-500" />
    )
  } else if (type === "flowResponses") {
    return <Layers className="h-4 w-4 text-purple-500" />
  }

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

// 获取步骤颜色
const getStepColor = (type: string, status: string) => {
  if (type === "thinking" || type === "thinkingStart" || type === "thinkingEnd") {
    return "bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/20"
  } else if (type === "flowNodeStatus" || type === "moduleStatus" || type === "moduleStart" || type === "moduleEnd") {
    return status === "running"
      ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/20"
      : status === "success"
        ? "bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-800/20"
        : status === "error"
          ? "bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-800/20"
          : "bg-gray-50/50 dark:bg-gray-900/10 border-gray-100 dark:border-gray-800/20"
  } else if (type === "flowResponses") {
    return "bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-800/20"
  }

  switch (status) {
    case "running":
      return "bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/20"
    case "success":
      return "bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-800/20"
    case "error":
      return "bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-800/20"
    case "pending":
    default:
      return "bg-gray-50/50 dark:bg-gray-900/10 border-gray-100 dark:border-gray-800/20"
  }
}

// 格式化内容
const formatContent = (content: string) => {
  if (
    (content.trim().startsWith("{") && content.trim().endsWith("}")) ||
    (content.trim().startsWith("[") && content.trim().endsWith("]"))
  ) {
    try {
      const parsed = JSON.parse(content)
      return <CodeBlock code={JSON.stringify(parsed, null, 2)} language="json" />
    } catch (e) {
      // Not valid JSON, treat as regular text
    }
  }

  if (content.includes("```")) {
    const parts = content.split("```")
    return (
      <>
        {parts.map((part, index) => {
          if (index % 2 === 0) {
            return part ? (
              <p key={index} className="mb-2">
                {part}
              </p>
            ) : null
          } else {
            const firstLineBreak = part.indexOf("\n")
            let language = ""
            let code = part

            if (firstLineBreak > 0) {
              language = part.substring(0, firstLineBreak).trim()
              code = part.substring(firstLineBreak + 1)
            }

            return <CodeBlock key={index} code={code} language={language} />
          }
        })}
      </>
    )
  }

  return <p className="whitespace-pre-wrap">{content}</p>
}

export function ProcessingFlowDisplay({ steps, isVisible }: ProcessingFlowDisplayProps) {
  const [expanded, setExpanded] = useState<boolean>(true)

  if (!isVisible || steps.length === 0) {
    return null
  }

  return (
    <Card className="border border-muted mt-4 mb-4 overflow-hidden shadow-sm">
      <CardHeader className="bg-muted/20 dark:bg-muted/5 py-2 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center">
          <Layers className="h-4 w-4 mr-2 text-[#6cb33f]" />
          处理流程 ({steps.length})
        </CardTitle>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>

      {expanded && (
        <CardContent className="p-0">
          <ScrollArea className="max-h-[300px]">
            <div className="p-3">
              {/* 时间轴容器 */}
              <div className="timeline">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={cn(
                      "timeline-item transition-fast",
                      index % 2 === 1 ? "timeline-item-right" : "timeline-item-left",
                    )}
                  >
                    {/* 自定义状态点 */}
                    <CustomDot status={step.status} />

                    {/* 步骤卡片，交替布局 */}
                    <div className={cn("ml-4", index % 2 === 1 ? "mr-0" : "mr-0")}>
                      <StepCard step={step} isAlternate={index % 2 === 1} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  )
}

export type { ProcessingStep }
