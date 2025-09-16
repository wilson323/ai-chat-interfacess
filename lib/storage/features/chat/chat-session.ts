import type { Message } from '../../../../types/message';
// Record is a built-in TypeScript utility type, no need to import
import type { ChatSessionIndexItem, StorageProvider } from '../../shared/types';
import {
  CHAT_INDEX_KEY,
  MESSAGES_PREFIX,
  STORAGE_META_KEY,
} from '../../shared/constants';
import {
  defaultStorageProvider,
  safeJSONParse,
  safeJSONStringify,
  formatTitleText,
  formatPreviewText,
  getStorageMeta,
} from '../../shared/storage-utils';
import {
  loadMessagesFromStorage,
  saveMessagesToStorage,
} from './message-storage';

/**
 * 重建聊天索引
 */
export function rebuildChatIndex(
  provider: StorageProvider = defaultStorageProvider
): void {
  try {
    console.log('Rebuilding chat index...');
    const newIndex: Record<string, ChatSessionIndexItem> = {};

    // 获取所有键
    const allKeys: string[] = [];
    for (let i = 0; i < provider.length; i++) {
      const key = provider.key(i);
      if (key) allKeys.push(key);
    }

    // 过滤聊天键
    const chatKeys = allKeys.filter(key => key.startsWith(MESSAGES_PREFIX));

    for (const chatKey of chatKeys) {
      const chatId = chatKey.replace(MESSAGES_PREFIX, '');
      const messagesJson = provider.getItem(chatKey);
      if (messagesJson) {
        try {
          const messages = safeJSONParse<Message[]>(messagesJson, []);
          if (messages && messages.length > 0) {
            const firstUserMessage = messages.find(msg => msg.role === 'user');
            const lastMessage = messages[messages.length - 1];

            const title = firstUserMessage
              ? formatTitleText(firstUserMessage.content)
              : '对话';

            const preview = lastMessage
              ? formatPreviewText(lastMessage.content)
              : '内容';

            const timestamp = lastMessage
              ? new Date(lastMessage.timestamp).getTime()
              : Date.now();

            newIndex[chatId] = {
              id: chatId,
              title,
              preview,
              timestamp,
              agentId: messages[0]?.metadata?.agentId,
              messageCount: messages.length,
            };
          }
        } catch (parseError) {
          console.error(
            `Failed to parse messages for chat ID ${chatId} during rebuild:`,
            parseError
          );
        }
      }
    }

    provider.setItem(CHAT_INDEX_KEY, safeJSONStringify(newIndex));
    console.log('Chat index rebuilt successfully.');
  } catch (error) {
    console.error('Failed to rebuild chat index:', error);
  }
}

/**
 * 获取所有聊天会话
 */
export function getAllChatSessions(
  provider: StorageProvider = defaultStorageProvider
): ChatSessionIndexItem[] {
  try {
    const indexJson = provider.getItem(CHAT_INDEX_KEY);
    if (!indexJson) {
      console.log('No chat index found, attempting to rebuild...');
      rebuildChatIndex(provider);
      const newIndexJson = provider.getItem(CHAT_INDEX_KEY);
      if (!newIndexJson) {
        console.log('Rebuild failed or no chats found');
        return [];
      }
      const index = safeJSONParse<Record<string, ChatSessionIndexItem>>(
        newIndexJson,
        {}
      );
      return Object.values(index).sort((a, b) => b.timestamp - a.timestamp);
    }

    const index = safeJSONParse<Record<string, ChatSessionIndexItem>>(
      indexJson,
      {}
    );
    return Object.values(index).sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to get chat sessions:', error);
    return [];
  }
}

/**
 * 搜索聊天会话
 */
export function searchChatSessions(
  query: string,
  provider: StorageProvider = defaultStorageProvider
): ChatSessionIndexItem[] {
  try {
    if (!query.trim()) return getAllChatSessions(provider);

    const sessions = getAllChatSessions(provider);
    const lowerQuery = query.toLowerCase();

    return sessions.filter(
      session =>
        session.title.toLowerCase().includes(lowerQuery) ||
        session.preview.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error('Failed to search chat sessions:', error);
    return [];
  }
}

/**
 * 导出所有聊天会话
 */
export function exportAllChatSessions(
  provider: StorageProvider = defaultStorageProvider
): string {
  try {
    const meta = getStorageMeta(provider);
    const exportData: Record<string, Message[]> = {};

    for (const chatId of meta.chatIds) {
      const messages = loadMessagesFromStorage(chatId, provider);
      if (messages) {
        exportData[chatId] = messages;
      }
    }

    return safeJSONStringify(exportData);
  } catch (error) {
    console.error('Failed to export all chat sessions:', error);
    return '';
  }
}

/**
 * 导入聊天会话
 */
export function importChatSessions(
  jsonData: string,
  provider: StorageProvider = defaultStorageProvider
): boolean {
  try {
    const importData = safeJSONParse<Record<string, Message[]>>(jsonData, {});

    for (const chatId in importData) {
      if (Object.prototype.hasOwnProperty.call(importData, chatId)) {
        const messages = importData[chatId];
        saveMessagesToStorage(chatId, messages, provider);
      }
    }

    console.log('All chat sessions imported successfully.');
    return true;
  } catch (error) {
    console.error('Failed to import chat sessions:', error);
    return false;
  }
}

/**
 * 调试存储状态
 */
export function debugStorageState(
  provider: StorageProvider = defaultStorageProvider
): {
  keys: string[];
  sessions: ChatSessionIndexItem[];
  messages: Message[];
  meta: Record<string, unknown>;
} {
  try {
    const allKeys: string[] = [];
    for (let i = 0; i < provider.length; i++) {
      const key = provider.key(i);
      if (key) allKeys.push(key);
    }

    console.log('All storage keys:', allKeys);

    const metaJson = provider.getItem(STORAGE_META_KEY);
    console.log(
      'Storage Meta:',
      metaJson ? JSON.parse(metaJson) : 'No meta found'
    );

    const chatIndexJson = provider.getItem(CHAT_INDEX_KEY);
    console.log(
      'Chat Index:',
      chatIndexJson ? JSON.parse(chatIndexJson) : 'No chat index found'
    );

    const storageInfo = {
      sizeInMB: (JSON.stringify(provider).length * 2) / (1024 * 1024),
    };
    console.log('Storage Size Info:', storageInfo);

    return {
      keys: allKeys,
      sessions: [],
      messages: [],
      meta: {
        keysCount: allKeys.length,
        chatKeysCount: allKeys.filter(key => key.startsWith(MESSAGES_PREFIX))
          .length,
        hasChatIndex: !!chatIndexJson,
        storageInfo,
      },
    };
  } catch (error) {
    console.error('Failed to debug storage state:', error);
    return {
      keys: [],
      sessions: [],
      messages: [],
      meta: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}
