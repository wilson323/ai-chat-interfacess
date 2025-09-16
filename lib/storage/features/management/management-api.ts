// 统一管理接口，自动分流到 FASTGPT 或自研智能体的管理实现

import type { ChatSessionIndexItem, StorageStats } from '../../shared/types';
import type { CustomAgentData } from './custom-agent-management';
import {
  clearAllCustomAgentData,
  exportAllCustomAgentData,
  getCustomAgentStorageStats,
  importCustomAgentData,
} from './custom-agent-management';
import {
  clearAllFastgptChatSessions,
  exportAllFastgptChatSessions,
  getFastgptStorageStats,
  importFastgptChatSessions,
} from './fastgpt-management';

/**
 * 智能体类型
 */
export type AgentType = 'fastgpt' | 'custom';

/**
 * 获取存储统计信息（自动分流）
 */
export function getStorageStatsByAgent(type: AgentType): StorageStats | Promise<StorageStats> {
  return type === 'fastgpt' ? getFastgptStorageStats() : getCustomAgentStorageStats();
}

/**
 * 清除所有数据（自动分流）
 */
export function clearAllDataByAgent(type: AgentType): boolean | Promise<boolean> {
  return type === 'fastgpt' ? clearAllFastgptChatSessions() : clearAllCustomAgentData();
}

/**
 * 导出所有数据（自动分流）
 */
export function exportAllDataByAgent(
  type: AgentType
):
  | Record<string, any[]>
  | Array<ChatSessionIndexItem | { id: string;[key: string]: unknown }>
  | Promise<CustomAgentData[]> {
  return type === 'fastgpt' ? exportAllFastgptChatSessions() : exportAllCustomAgentData();
}

/**
 * 导入数据（自动分流）
 */
export function importDataByAgent(
  type: AgentType,
  data:
    | Record<string, any[]>
    | Array<ChatSessionIndexItem | { id: string;[key: string]: unknown }>
): boolean | Promise<boolean> {
  return type === 'fastgpt'
    ? importFastgptChatSessions(data as Record<string, any[]>)
    : importCustomAgentData((data as unknown) as CustomAgentData[]);
}
