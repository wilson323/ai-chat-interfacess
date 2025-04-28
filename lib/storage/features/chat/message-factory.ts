import type { Message } from "@/types/message"
import { MessageType } from "@/types/message"
import { generateUniqueId } from "../../shared/storage-utils"

/**
 * 创建用户消息
 */
export function createUserMessage(content: string, metadata?: Record<string, any>): Message {
  return {
    id: generateUniqueId(),
    type: MessageType.Text,
    role: "user",
    content,
    timestamp: new Date(),
    metadata,
  }
}

/**
 * 创建系统消息
 */
export function createSystemMessage(content: string, metadata?: Record<string, any>): Message {
  return {
    id: generateUniqueId(),
    type: MessageType.Text,
    role: "system",
    content,
    timestamp: new Date(),
    metadata,
  }
}

/**
 * 创建助手消息
 */
export function createAssistantMessage(content: string, metadata?: Record<string, any>): Message {
  return {
    id: generateUniqueId(),
    type: MessageType.Text,
    role: "assistant",
    content,
    timestamp: new Date(),
    metadata,
  }
}

/**
 * 创建错误消息
 */
export function createErrorMessage(error: Error | string, metadata?: Record<string, any>): Message {
  const content = error instanceof Error ? error.message : error
  return {
    id: generateUniqueId(),
    type: MessageType.Text,
    role: "system",
    content,
    timestamp: new Date(),
    metadata: { ...metadata, error: true },
  }
}

/**
 * 创建图片消息
 */
export function createImageMessage(
  imageUrl: string,
  role: "user" | "assistant" = "user",
  metadata?: Record<string, any>
): Message {
  return {
    id: generateUniqueId(),
    type: MessageType.Image,
    role,
    content: imageUrl,
    timestamp: new Date(),
    metadata,
  }
}

/**
 * 创建文件消息
 */
export function createFileMessage(
  fileInfo: { url: string; name: string; size: number },
  role: "user" | "assistant" = "user",
  metadata?: Record<string, any>
): Message {
  return {
    id: generateUniqueId(),
    type: MessageType.File,
    role,
    content: fileInfo.url,
    timestamp: new Date(),
    metadata: {
      ...metadata,
      fileName: fileInfo.name,
      fileSize: fileInfo.size,
    },
  }
}

/**
 * 创建代码消息
 */
export function createCodeMessage(
  code: string,
  language: string,
  role: "user" | "assistant" = "assistant",
  metadata?: Record<string, any>
): Message {
  return {
    id: generateUniqueId(),
    type: MessageType.Code,
    role,
    content: code,
    timestamp: new Date(),
    metadata: {
      ...metadata,
      language,
    },
  }
}

/**
 * 创建Markdown消息
 */
export function createMarkdownMessage(
  markdown: string,
  role: "user" | "assistant" = "assistant",
  metadata?: Record<string, any>
): Message {
  return {
    id: generateUniqueId(),
    type: MessageType.Markdown,
    role,
    content: markdown,
    timestamp: new Date(),
    metadata,
  }
} 