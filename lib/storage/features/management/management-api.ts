// 统一管理接口，自动分流到 FASTGPT 或自研智能体的管理实现

import {
  getFastgptStorageStats,
  clearAllFastgptChatSessions,
  exportAllFastgptChatSessions,
  importFastgptChatSessions
} from "./fastgpt-management"
import {
  getCustomAgentStorageStats,
  clearAllCustomAgentData,
  exportAllCustomAgentData,
  importCustomAgentData
} from "./custom-agent-management"
import type { StorageStats, ChatSessionIndexItem } from "./types"

/**
 * 智能体类型
 */
export type AgentType = "fastgpt" | "custom"

/**
 * 获取存储统计信息（自动分流）
 */
export function getStorageStatsByAgent(type: AgentType): StorageStats {
  return type === "fastgpt"
    ? getFastgptStorageStats()
    : getCustomAgentStorageStats()
}

/**
 * 清除所有数据（自动分流）
 */
export function clearAllDataByAgent(type: AgentType): boolean {
  return type === "fastgpt"
    ? clearAllFastgptChatSessions()
    : clearAllCustomAgentData()
}

/**
 * 导出所有数据（自动分流）
 */
export function exportAllDataByAgent(type: AgentType): any[] {
  return type === "fastgpt"
    ? exportAllFastgptChatSessions()
    : exportAllCustomAgentData()
}

/**
 * 导入数据（自动分流）
 */
export function importDataByAgent(type: AgentType, data: any[]): boolean {
  return type === "fastgpt"
    ? importFastgptChatSessions(data as ChatSessionIndexItem[])
    : importCustomAgentData(data)
} 