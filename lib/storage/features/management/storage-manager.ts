import type {
  StorageMeta,
  StorageStats,
  StorageProvider,
  ChatSessionIndexItem,
} from '../../shared/types';
import {
  MESSAGES_PREFIX,
  CHAT_INDEX_KEY,
  STORAGE_META_KEY,
  MAX_STORAGE_SIZE_MB,
  MAX_CHAT_AGE_DAYS,
} from '../../shared/constants';
import {
  getStorageMeta,
  saveStorageMeta,
  defaultStorageProvider,
  safeJSONParse,
  safeJSONStringify,
} from '../../shared/storage-utils';

/**
 * 检查存储是否接近限制
 */
export function isStorageNearLimit(
  provider: StorageProvider = defaultStorageProvider
): boolean {
  const meta = getStorageMeta(provider);
  const maxBytes = MAX_STORAGE_SIZE_MB * 1024 * 1024;
  return meta.totalSize > maxBytes * 0.9; // 90% of max
}

/**
 * 紧急清理存储空间
 */
export function emergencyCleanup(
  provider: StorageProvider = defaultStorageProvider
): void {
  try {
    console.warn('Running emergency cleanup due to storage error.');

    // 获取所有存储键
    const allKeys: string[] = [];
    for (let i = 0; i < provider.length; i++) {
      const key = provider.key(i);
      if (key) allKeys.push(key);
    }

    // 查找所有聊天键
    const chatKeys = allKeys.filter(key => key.startsWith(MESSAGES_PREFIX));

    // 删除最旧的一半聊天
    const deleteCount = Math.ceil(chatKeys.length / 2);
    chatKeys
      .sort()
      .slice(0, deleteCount)
      .forEach(key => provider.removeItem(key));

    // 重置元数据
    const newMeta: StorageMeta = {
      totalSize: 0,
      chatSizes: {},
      chatIds: [],
      chatLastAccessed: {},
      version: 1,
      lastCleanup: Date.now(),
    };

    saveStorageMeta(newMeta, provider);
    console.warn(`Emergency cleanup: deleted ${deleteCount} chats`);
  } catch (error) {
    console.error('Emergency cleanup failed:', error);

    // 最后的手段：清除所有聊天数据
    try {
      const allKeys: string[] = [];
      for (let i = 0; i < provider.length; i++) {
        const key = provider.key(i);
        if (key && key.startsWith(MESSAGES_PREFIX)) {
          provider.removeItem(key);
        }
      }
      provider.removeItem(STORAGE_META_KEY);
      console.warn('Last resort cleanup: deleted all chat data');
    } catch (e) {
      console.error('Last resort cleanup failed:', e);
    }
  }
}

/**
 * 清理旧聊天
 */
export function cleanupStorage(
  provider: StorageProvider = defaultStorageProvider
): void {
  try {
    const meta = getStorageMeta(provider);
    const now = Date.now();

    // 最多每天运行一次清理
    if (now - meta.lastCleanup < 24 * 60 * 60 * 1000) {
      return;
    }

    meta.lastCleanup = now;
    const maxAgeMs = MAX_CHAT_AGE_DAYS * 24 * 60 * 60 * 1000;

    // 按最后访问时间排序聊天
    const chatsByAge = [...meta.chatIds].sort(
      (a, b) =>
        (meta.chatLastAccessed[a] || 0) - (meta.chatLastAccessed[b] || 0)
    );

    // 删除旧聊天
    for (const chatId of chatsByAge) {
      const lastAccessed = meta.chatLastAccessed[chatId] || 0;
      if (now - lastAccessed > maxAgeMs) {
        deleteChatSession(chatId, provider);
      }
    }

    // 如果仍然接近限制，继续删除最旧的聊天
    if (isStorageNearLimit(provider)) {
      const updatedMeta = getStorageMeta(provider);
      const maxBytes = MAX_STORAGE_SIZE_MB * 1024 * 1024 * 0.8; // 目标80%

      const remainingChats = [...updatedMeta.chatIds].sort(
        (a, b) =>
          (updatedMeta.chatLastAccessed[a] || 0) -
          (updatedMeta.chatLastAccessed[b] || 0)
      );

      while (updatedMeta.totalSize > maxBytes && remainingChats.length > 0) {
        const oldestChat = remainingChats.shift();
        if (oldestChat) {
          deleteChatSession(oldestChat, provider);
        }
      }
    }

    saveStorageMeta(meta, provider);
    console.log('Storage cleanup completed');
  } catch (error) {
    console.error('Storage cleanup failed:', error);
  }
}

/**
 * 删除聊天会话
 */
export function deleteChatSession(
  chatId: string,
  provider: StorageProvider = defaultStorageProvider
): boolean {
  try {
    const chatKey = `${MESSAGES_PREFIX}${chatId}`;
    provider.removeItem(chatKey);

    // 更新元数据
    const meta = getStorageMeta(provider);
    meta.totalSize -= meta.chatSizes[chatId] || 0;
    delete meta.chatSizes[chatId];
    delete meta.chatLastAccessed[chatId];
    meta.chatIds = meta.chatIds.filter(id => id !== chatId);
    saveStorageMeta(meta, provider);

    // 更新聊天索引
    const indexJson = provider.getItem(CHAT_INDEX_KEY);
    if (indexJson) {
      const index = safeJSONParse<Record<string, ChatSessionIndexItem>>(
        indexJson,
        {}
      );
      delete index[chatId];
      provider.setItem(CHAT_INDEX_KEY, safeJSONStringify(index));
    }

    console.log(`Successfully deleted chat session: ${chatId}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete chat session ${chatId}:`, error);
    return false;
  }
}

/**
 * 获取存储统计信息
 */
export function getStorageStats(
  provider: StorageProvider = defaultStorageProvider
): StorageStats {
  try {
    let totalSize = 0;
    for (let i = 0; i < provider.length; i++) {
      const key = provider.key(i);
      if (key) {
        const value = provider.getItem(key);
        if (value) {
          totalSize += value.length * 2; // UTF-16编码
        }
      }
    }

    const totalSizeMB = totalSize / (1024 * 1024);
    const maxSizeMB = MAX_STORAGE_SIZE_MB;
    const usagePercent = (totalSizeMB / maxSizeMB) * 100;
    const meta = getStorageMeta(provider);
    const chatCount = meta.chatIds.length;

    return { totalSizeMB, maxSizeMB, usagePercent, chatCount };
  } catch (error) {
    console.error('Failed to get storage stats:', error);
    return {
      totalSizeMB: 0,
      maxSizeMB: MAX_STORAGE_SIZE_MB,
      usagePercent: 0,
      chatCount: 0,
    };
  }
}

/**
 * 清除所有聊天会话
 */
export function clearAllChatSessions(
  provider: StorageProvider = defaultStorageProvider
): boolean {
  try {
    const allKeys: string[] = [];
    for (let i = 0; i < provider.length; i++) {
      const key = provider.key(i);
      if (key && key.startsWith(MESSAGES_PREFIX)) {
        allKeys.push(key);
      }
    }

    // 删除所有聊天消息
    allKeys.forEach(key => provider.removeItem(key));

    // 删除聊天索引
    provider.removeItem(CHAT_INDEX_KEY);

    // 重置存储元数据
    const defaultMeta: StorageMeta = {
      totalSize: 0,
      chatSizes: {},
      chatIds: [],
      chatLastAccessed: {},
      version: 1,
      lastCleanup: Date.now(),
    };
    saveStorageMeta(defaultMeta, provider);

    console.log('All chat sessions cleared successfully.');
    return true;
  } catch (error) {
    console.error('Failed to clear all chat sessions:', error);
    return false;
  }
}

/**
 * 初始化存储系统
 */
export function initStorage(
  provider: StorageProvider = defaultStorageProvider
): void {
  try {
    const meta = getStorageMeta(provider);
    const now = Date.now();

    // 如果上次清理是一天前，运行清理
    if (now - meta.lastCleanup > 24 * 60 * 60 * 1000) {
      cleanupStorage(provider);
    }

    // 如果需要，重新计算总大小
    if (meta.totalSize === 0 && meta.chatIds.length > 0) {
      let totalSize = 0;
      for (const chatId of meta.chatIds) {
        const chatKey = `${MESSAGES_PREFIX}${chatId}`;
        const messagesJson = provider.getItem(chatKey);
        if (messagesJson) {
          const size = messagesJson.length * 2; // UTF-16编码
          meta.chatSizes[chatId] = size;
          totalSize += size;
        }
      }
      meta.totalSize = totalSize;
      saveStorageMeta(meta, provider);
    }

    console.log('Storage system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize storage:', error);
  }
}
