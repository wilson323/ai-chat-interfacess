/**
 * 存储模块共享类型定义
 */

// 聊天会话索引项接口
export interface ChatSessionIndexItem {
  id: string
  title: string
  preview: string
  timestamp: number
  agentId?: string
  messageCount?: number
}

// 存储元数据接口
export interface StorageMeta {
  // 总存储大小（字节）
  totalSize: number
  
  // 每个聊天的大小
  chatSizes: Record<string, number>
  
  // 聊天ID列表
  chatIds: string[]
  
  // 每个聊天的最后访问时间
  chatLastAccessed: Record<string, number>
  
  // 版本号，用于未来的数据迁移
  version: number

  // 上次清理时间
  lastCleanup: number
}

// 存储统计信息接口
export interface StorageStats {
  totalSizeMB: number
  maxSizeMB: number
  usagePercent: number
  chatCount: number
}

// 存储提供者接口
export interface StorageProvider {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  clear(): void
  key(index: number): string | null
  length: number
}

/**
 * 聊天索引项
 */
export interface ChatIndexItem {
  // 聊天ID
  id: string
  
  // 聊天标题
  title: string
  
  // 最后一条消息预览
  preview: string
  
  // 最后更新时间戳
  timestamp: number
  
  // 关联的Agent ID
  agentId?: string
  
  // 消息数量
  messageCount: number
}

/**
 * 聊天索引
 */
export type ChatIndex = Record<string, ChatIndexItem>

/**
 * 存储配置选项
 */
export interface StorageOptions {
  // 是否启用压缩
  compression?: boolean
  
  // 最大存储大小（字节）
  maxSize?: number
  
  // 自动清理阈值（字节）
  cleanupThreshold?: number
  
  // 最大保留聊天数
  maxChats?: number
} 