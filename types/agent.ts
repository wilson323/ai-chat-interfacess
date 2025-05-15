import type React from "react"

export type ConversationAgentType = "fastgpt"
export type NonConversationAgentType = "image-editor" | "cad-analyzer"
export type AgentType = ConversationAgentType | NonConversationAgentType

export interface Agent {
  id: string
  name: string
  description: string
  type: AgentType
  iconType?: string
  icon?: React.ReactNode
  apiEndpoint?: string
  apiUrl?: string
  apiKey?: string
  appId?: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  supportsFileUpload?: boolean
  supportsImageUpload?: boolean
  multimodalModel?: string
  isPublished?: boolean
  chatId?: string
  avatar?: string
  welcomeText?: string
  welcomeMessage?: string
  order?: number
  supportsStream: boolean
  supportsDetail: boolean
}
