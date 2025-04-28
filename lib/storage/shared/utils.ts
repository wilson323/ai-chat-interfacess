/**
 * 存储模块工具函数
 */
import type { Message } from "@/types/message"
import type { StorageMeta } from "./types"
import { STORAGE_META_KEY, DEVICE_ID_KEY, MAX_MESSAGES_PER_CHAT } from "./constants"

/**
 * 获取设备ID
 */
export function getDeviceId(): string {
  // 检查是否在浏览器环境
  if (typeof window === "undefined") {
    return "server_side"
  }

  try {
    // 尝试从localStorage获取现有设备ID
    let deviceId = localStorage.getItem(DEVICE_ID_KEY)

    // 如果没有设备ID，生成一个新的并存储
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      localStorage.setItem(DEVICE_ID_KEY, deviceId)
    }

    return deviceId
  } catch (error) {
    // 如果localStorage不可用（例如，在私有浏览模式下），
    // 为会话生成一个临时ID
    console.warn("Could not access localStorage for device ID:", error)
    return `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }
}

/**
 * 初始化或获取存储元数据
 */
export function getStorageMeta(): StorageMeta {
  try {
    const metaJson = localStorage.getItem(STORAGE_META_KEY)
    if (metaJson) {
      return JSON.parse(metaJson)
    }
  } catch (error) {
    console.error("Failed to parse storage metadata:", error)
  }

  // 如果未找到或无效，则使用默认元数据
  return {
    lastCleanup: Date.now(),
    totalSize: 0,
    chatIds: [],
    chatSizes: {},
    chatLastAccessed: {},
  }
}

/**
 * 保存存储元数据
 */
export function saveStorageMeta(meta: StorageMeta): void {
  try {
    localStorage.setItem(STORAGE_META_KEY, JSON.stringify(meta))
  } catch (error) {
    console.error("Failed to save storage metadata:", error)
  }
}

/**
 * 估计字符串的大小（字节）
 */
export function estimateSize(str: string): number {
  // 粗略估计：每个字符2字节
  return str.length * 2
}

/**
 * 压缩消息，移除不必要的数据
 */
export function compressMessages(messages: Message[]): Message[] {
  // 如果超过MAX_MESSAGES_PER_CHAT，只保留最新的消息
  if (messages.length > MAX_MESSAGES_PER_CHAT) {
    messages = messages.slice(-MAX_MESSAGES_PER_CHAT)
  }

  // 移除不必要的元数据以节省空间
  return messages.map((message) => {
    // 创建消息的最小版本
    const minimalMessage: Message = {
      id: message.id,
      type: message.type,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
    }

    // 只保留必要的元数据
    if (message.metadata) {
      const essentialMetadata: Record<string, any> = {}

      // 保留必要的元数据字段
      if (message.metadata.deviceId) {
        essentialMetadata.deviceId = message.metadata.deviceId
      }

      if (message.metadata.agentId) {
        essentialMetadata.agentId = message.metadata.agentId
      }

      if (message.metadata.offline) {
        essentialMetadata.offline = message.metadata.offline
      }

      if (message.metadata.files) {
        essentialMetadata.files = message.metadata.files
      }

      if (Object.keys(essentialMetadata).length > 0) {
        minimalMessage.metadata = essentialMetadata
      }
    }

    return minimalMessage
  })
} 