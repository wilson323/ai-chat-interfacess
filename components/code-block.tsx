"use client"

import { SimpleCodeBlock } from "@/components/simple-code-block"

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
  showLineNumbers?: boolean
}

export function CodeBlock(props: CodeBlockProps) {
  return <SimpleCodeBlock {...props} />
}
