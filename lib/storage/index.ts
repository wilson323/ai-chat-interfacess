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

// 聊天会话索引项接口
export interface ChatSessionIndexItem {
  id: string;
  title: string;
  preview: string;
  timestamp: number;
  agentId?: string;
  messageCount?: number;
}

// 存储元数据接口
interface StorageMeta {
  lastCleanup: number; // 上次清理的时间戳
  totalSize: number; // 估计的总大小（字节）
  chatIds: string[]; // 所有聊天ID列表
  chatSizes: Record<string, number>; // 每个聊天的大小（字节）
  chatLastAccessed: Record<string, number>; // 每个聊天的最后访问时间戳
  version?: number; // 存储版本
}

// 存储统计信息接口
export interface StorageStats {
  totalSizeMB: number;
  maxSizeMB: number;
  usagePercent: number;
  chatCount: number;
}

// 存储提供者接口
export interface StorageProvider {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  key(index: number): string | null;
  length: number;
}

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
export function saveAgents(agents: any[]): ReturnType<typeof _saveAgents> {
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
