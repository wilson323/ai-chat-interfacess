/**
 * 消息存储模块
 */
import type { Message } from '@/types/message';
import type { StorageProvider, ChatIndexItem } from '../../shared/types';
import { MESSAGES_PREFIX, CHAT_INDEX_KEY } from '../../shared/constants';
import {
  getStorageMeta,
  saveStorageMeta,
  estimateSize,
  compressMessages,
  defaultStorageProvider,
  safeJSONParse,
  safeJSONStringify,
  formatTitleText,
  formatPreviewText,
} from '../../shared/storage-utils';

/**
 * 将消息保存到存储
 */
export function saveMessagesToStorage(
  chatId: string,
  messages: Message[],
  provider: StorageProvider = defaultStorageProvider
): boolean {
  try {
    if (!messages?.length) {
      console.warn(`No messages to save for chat ID: ${chatId}`);
      return false;
    }

    const meta = getStorageMeta(provider);
    const compressedMessages = compressMessages(messages);
    const messagesJson = safeJSONStringify(compressedMessages);

    if (!messagesJson) {
      console.error('Failed to stringify messages');
      return false;
    }

    const size = estimateSize(messagesJson);
    const chatKey = `${MESSAGES_PREFIX}${chatId}`;
    const oldSize = meta.chatSizes[chatId] || 0;

    // 更新元数据
    meta.totalSize = meta.totalSize - oldSize + size;
    meta.chatSizes[chatId] = size;
    meta.chatLastAccessed[chatId] = Date.now();

    if (!meta.chatIds.includes(chatId)) {
      meta.chatIds.push(chatId);
    }

    // 保存消息和更新索引
    provider.setItem(chatKey, messagesJson);
    updateChatIndex(chatId, compressedMessages, provider);
    saveStorageMeta(meta, provider);

    console.log(
      `Successfully saved ${messages.length} messages for chat ID: ${chatId}`
    );
    return true;
  } catch (error) {
    console.error(`Failed to save messages for chat ID ${chatId}:`, error);
    return false;
  }
}

/**
 * 从存储加载消息
 */
export function loadMessagesFromStorage(
  chatId: string,
  provider: StorageProvider = defaultStorageProvider
): Message[] | null {
  try {
    const chatKey = `${MESSAGES_PREFIX}${chatId}`;
    const messagesJson = provider.getItem(chatKey);

    if (!messagesJson) {
      console.log(`No messages found for chat ID: ${chatId}`);
      return null;
    }

    // 更新访问时间
    const meta = getStorageMeta(provider);
    meta.chatLastAccessed[chatId] = Date.now();
    saveStorageMeta(meta, provider);

    // 解析和处理消息
    const messages = safeJSONParse<Message[]>(messagesJson, []);
    const processedMessages = messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));

    console.log(
      `Successfully loaded ${processedMessages.length} messages for chat ID: ${chatId}`
    );
    return processedMessages;
  } catch (error) {
    console.error(`Failed to load messages for chat ID ${chatId}:`, error);
    return null;
  }
}

/**
 * 更新聊天索引
 */
function updateChatIndex(
  chatId: string,
  messages: Message[],
  provider: StorageProvider = defaultStorageProvider
): void {
  try {
    const indexJson = provider.getItem(CHAT_INDEX_KEY);
    const index = safeJSONParse<Record<string, ChatIndexItem>>(indexJson, {});

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

    index[chatId] = {
      id: chatId,
      title,
      preview,
      timestamp,
      agentId: messages[0]?.metadata?.agentId,
      messageCount: messages.length,
    };

    provider.setItem(CHAT_INDEX_KEY, JSON.stringify(index));
    console.log(`Updated chat index for chat ID: ${chatId}`);
  } catch (error) {
    console.error('Failed to update chat index:', error);
  }
}

// 提供别名以保持兼容性
export const loadMessagesFromLocalStorage = loadMessagesFromStorage;
export const saveMessagesToLocalStorage = saveMessagesToStorage;
