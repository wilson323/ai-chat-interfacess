/**
 * 存储模块主入口
 * 统一导出所有存储相关功能
 */

// 统一导出所有存储相关功能
export * from './shared/constants';
export * from './shared/types';
export * from './shared/storage-utils';
export * from './features/chat/message-storage';
export * from './features/chat/message-factory';
export * from './features/chat/chat-session';
export * from './features/management/storage-manager';
export * from './features/agent/agent-storage';

// 聊天会话索引项接口（从 shared/types 已导出，避免重复定义）
// 保留向后兼容的 re-export
export type { ChatSessionIndexItem } from './shared/types';

// 存储元数据接口：统一从 shared/types 导入
export type { StorageMeta } from './shared/types';

// 存储统计信息接口
export type { StorageStats } from './shared/types';

// 存储提供者接口
export type { StorageProvider } from './shared/types';

export {
  exportAllChatSessions,
  importChatSessions,
} from './features/chat/chat-session';
export {
  clearAllChatSessions,
  getStorageStats,
} from './features/management/storage-manager';

import {
  getAllChatSessions as _getAllChatSessions,
  rebuildChatIndex as _rebuildChatIndex,
  debugStorageState as _debugStorageState,
  searchChatSessions as _searchChatSessions,
} from './features/chat/chat-session';

import {
  saveMessagesToStorage as _saveMessagesToStorage,
  loadMessagesFromStorage as _loadMessagesFromStorage,
} from './features/chat/message-storage';

import { deleteChatSession as _deleteChatSession } from './features/management/storage-manager';

// Record is a built-in TypeScript utility type, no need to import
import {
  loadLocallyModifiedAgents as _loadLocallyModifiedAgents,
  loadSelectedAgentId as _loadSelectedAgentId,
  saveSelectedAgent as _saveSelectedAgent,
  saveAgents as _saveAgents,
  loadAgents as _loadAgents,
  markAgentAsLocallyModified as _markAgentAsLocallyModified,
  saveLocallyModifiedAgents as _saveLocallyModifiedAgents,
} from './features/agent/agent-storage';

import { defaultStorageProvider } from './shared/storage-utils';
import type { Message } from '@/types/message';

// 兼容无参数调用的适配器
export function getAllChatSessions(): ReturnType<typeof _getAllChatSessions> {
  return _getAllChatSessions(defaultStorageProvider);
}
export function rebuildChatIndex(): ReturnType<typeof _rebuildChatIndex> {
  return _rebuildChatIndex(defaultStorageProvider);
}
export function debugStorageState(): ReturnType<typeof _debugStorageState> {
  return _debugStorageState(defaultStorageProvider);
}
export function loadMessagesFromStorage(
  chatId: string
): ReturnType<typeof _loadMessagesFromStorage> {
  return _loadMessagesFromStorage(chatId, defaultStorageProvider);
}
export function deleteChatSession(
  chatId: string
): ReturnType<typeof _deleteChatSession> {
  return _deleteChatSession(chatId, defaultStorageProvider);
}
export function searchChatSessions(
  query: string
): ReturnType<typeof _searchChatSessions> {
  return _searchChatSessions(query, defaultStorageProvider);
}
export function saveMessagesToStorage(
  chatId: string,
  messages: Message[]
): ReturnType<typeof _saveMessagesToStorage> {
  return _saveMessagesToStorage(chatId, messages, defaultStorageProvider);
}
export function loadLocallyModifiedAgents(): ReturnType<
  typeof _loadLocallyModifiedAgents
> {
  return _loadLocallyModifiedAgents();
}
export function loadSelectedAgentId(): ReturnType<typeof _loadSelectedAgentId> {
  return _loadSelectedAgentId();
}
export function saveSelectedAgent(
  agentId: string
): ReturnType<typeof _saveSelectedAgent> {
  return _saveSelectedAgent(agentId);
}
export function saveAgents(agents: import('@/types/agent').Agent[]): ReturnType<typeof _saveAgents> {
  return _saveAgents(agents);
}
export function loadAgents(): ReturnType<typeof _loadAgents> {
  return _loadAgents();
}
export function markAgentAsLocallyModified(
  agentId: string
): ReturnType<typeof _markAgentAsLocallyModified> {
  return _markAgentAsLocallyModified(agentId);
}
export function saveLocallyModifiedAgents(
  agentIds: string[]
): ReturnType<typeof _saveLocallyModifiedAgents> {
  return _saveLocallyModifiedAgents(agentIds);
}

// ========== 统一导出工具函数 ==========
export { getDeviceId, resetDeviceId } from '../utils';
