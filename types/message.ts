/**
 * 消息类型枚举
 */
export enum MessageType {
  Text = "text",
  Image = "image",
  File = "file",
  Code = "code",
  Markdown = "markdown",
}

/**
 * 消息角色类型
 */
export type MessageRole = "user" | "assistant" | "system"

/**
 * 消息元数据类型
 */
export interface MessageMetadata {
  deviceId?: string
  agentId?: string
  offline?: boolean
  error?: boolean
  files?: Array<{
  name: string
  size: number
    url: string
  }>
  fileName?: string
  fileSize?: number
  language?: string
  [key: string]: any
}

/**
 * 消息接口
 */
export interface Message {
  id: string
  type: MessageType
  role: MessageRole
  content: string
  timestamp: Date
  metadata?: MessageMetadata
}
