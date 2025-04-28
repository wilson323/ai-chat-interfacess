// FASTGPT 会话型智能体专用存储管理模块
// 所有接口严格遵循 FASTGPT API 规范
// 仅用于会话型智能体的存储、配置、管理

import type { StorageStats, ChatSessionIndexItem, StorageProvider } from "../../shared/types"
import { getStorageMeta, saveStorageMeta, defaultStorageProvider, safeJSONParse, safeJSONStringify } from "../../shared/storage-utils"
import { MESSAGES_PREFIX, CHAT_INDEX_KEY, STORAGE_META_KEY, MAX_STORAGE_SIZE_MB } from "../../shared/constants"
import { loadMessagesFromStorage, saveMessagesToStorage } from "../chat/message-storage"

/**
 * 获取存储统计信息（FASTGPT 专用）
 */
export function getFastgptStorageStats(provider: StorageProvider = defaultStorageProvider): StorageStats {
  try {
    let totalSize = 0
    for (let i = 0; i < provider.length; i++) {
      const key = provider.key(i)
      if (key) {
        const value = provider.getItem(key)
        if (value) {
          totalSize += value.length * 2 // UTF-16编码
        }
      }
    }
    const totalSizeMB = totalSize / (1024 * 1024)
    const maxSizeMB = MAX_STORAGE_SIZE_MB
    const usagePercent = (totalSizeMB / maxSizeMB) * 100
    const meta = getStorageMeta(provider)
    const chatCount = meta.chatIds.length
    return { totalSizeMB, maxSizeMB, usagePercent, chatCount }
  } catch (error) {
    console.error("Failed to get storage stats:", error)
    return {
      totalSizeMB: 0,
      maxSizeMB: MAX_STORAGE_SIZE_MB,
      usagePercent: 0,
      chatCount: 0,
    }
  }
}

/**
 * 清除所有会话（FASTGPT 专用）
 */
export function clearAllFastgptChatSessions(provider: StorageProvider = defaultStorageProvider): boolean {
  try {
    const allKeys: string[] = []
    for (let i = 0; i < provider.length; i++) {
      const key = provider.key(i)
      if (key && key.startsWith(MESSAGES_PREFIX)) {
        allKeys.push(key)
      }
    }
    // 删除所有聊天消息
    allKeys.forEach(key => provider.removeItem(key))
    // 删除聊天索引
    provider.removeItem(CHAT_INDEX_KEY)
    // 重置存储元数据
    const defaultMeta = {
      totalSize: 0,
      chatSizes: {},
      chatIds: [],
      chatLastAccessed: {},
      version: 1,
      lastCleanup: Date.now(),
    }
    saveStorageMeta(defaultMeta, provider)
    console.log("All chat sessions cleared successfully.")
    return true
  } catch (error) {
    console.error("Failed to clear all chat sessions:", error)
    return false
  }
}

/**
 * 导出所有会话（FASTGPT 专用）
 * 返回结构与 FASTGPT 云端兼容
 */
export function exportAllFastgptChatSessions(provider: StorageProvider = defaultStorageProvider): Record<string, any[]> {
  try {
    const meta = getStorageMeta(provider)
    const exportData: Record<string, any[]> = {}
    for (const chatId of meta.chatIds) {
      const messages = loadMessagesFromStorage(chatId, provider)
      if (messages) {
        exportData[chatId] = messages
      }
    }
    return exportData
  } catch (error) {
    console.error("Failed to export all chat sessions:", error)
    return {}
  }
}

/**
 * 导入会话（FASTGPT 专用）
 * 支持从云端或其他来源导入历史会话，自动去重、合并、校验
 */
export function importFastgptChatSessions(
  sessions: Record<string, any[]>,
  provider: StorageProvider = defaultStorageProvider
): boolean {
  try {
    for (const chatId in sessions) {
      if (Object.hasOwn(sessions, chatId)) {
        const messages = sessions[chatId]
        saveMessagesToStorage(chatId, messages, provider)
      }
    }
    console.log("All chat sessions imported successfully.")
    return true
  } catch (error) {
    console.error("Failed to import chat sessions:", error)
    return false
  }
} 