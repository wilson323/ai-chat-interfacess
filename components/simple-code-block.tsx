"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimpleCodeBlockProps {
  code: string
  language?: string
  className?: string
  showLineNumbers?: boolean
}

export function SimpleCodeBlock({ code, language, className, showLineNumbers = false }: SimpleCodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Simple syntax highlighting based on language
  const getLanguageClass = () => {
    switch (language?.toLowerCase()) {
      case "javascript":
      case "js":
      case "typescript":
      case "ts":
        return "language-js"
      case "html":
      case "xml":
        return "language-html"
      case "css":
        return "language-css"
      case "json":
        return "language-json"
      case "markdown":
      case "md":
        return "language-md"
      case "bash":
      case "shell":
        return "language-bash"
      case "python":
      case "py":
        return "language-python"
      default:
        return "language-text"
    }
  }

  // Add line numbers if requested
  const codeWithLineNumbers = showLineNumbers
    ? code
        .split("\n")
        .map((line, i) => `${i + 1}. ${line}`)
        .join("\n")
    : code

  return (
    <div className={cn("relative group my-4", className)}>
      {language && (
        <div className="absolute top-2 right-12 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded">
          {language}
        </div>
      )}

      <pre
        className={cn(
          "bg-zinc-100 dark:bg-[#181c23] p-4 rounded-md overflow-x-auto text-sm font-mono text-zinc-800 dark:text-[#e6e6e6] border border-zinc-200 dark:border-zinc-700",
          getLanguageClass(),
        )}
      >
        <code>{codeWithLineNumbers}</code>
      </pre>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-200/80 dark:bg-zinc-700/80 backdrop-blur-sm"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  )
}
