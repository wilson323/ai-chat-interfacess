import type { Message } from '@/types/message';
import type { StorageMeta, StorageProvider } from './types';
import { STORAGE_META_KEY, MAX_MESSAGES_PER_CHAT } from './constants';

// ========== 高可用 provider 实现 ==========
class MemoryStorage implements StorageProvider {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
  get length() {
    return this.store.size;
  }
}

function isLocalStorageAvailable() {
  try {
    const test = '__test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export const defaultStorageProvider: StorageProvider =
  typeof window !== 'undefined' && isLocalStorageAvailable()
    ? window.localStorage
    : new MemoryStorage();

/**
 * 获取存储元数据
 */
export function getStorageMeta(
  provider: StorageProvider = defaultStorageProvider
): StorageMeta {
  try {
    const metaJson = provider.getItem(STORAGE_META_KEY);
    if (metaJson) {
      return JSON.parse(metaJson);
    }
  } catch (error) {
    console.error('Failed to parse storage metadata:', error);
  }

  return {
    totalSize: 0,
    chatSizes: {},
    chatIds: [],
    chatLastAccessed: {},
    version: 1,
    lastCleanup: Date.now(),
  };
}

/**
 * 保存存储元数据
 */
export function saveStorageMeta(
  meta: StorageMeta,
  provider: StorageProvider = defaultStorageProvider
): void {
  try {
    provider.setItem(STORAGE_META_KEY, JSON.stringify(meta));
  } catch (error) {
    console.error('Failed to save storage metadata:', error);
  }
}

/**
 * 估算字符串大小（字节）
 */
export function estimateSize(str: string): number {
  return str.length * 2; // UTF-16编码
}

/**
 * 压缩消息数组
 */
export function compressMessages(messages: Message[]): Message[] {
  if (messages.length > MAX_MESSAGES_PER_CHAT) {
    messages = messages.slice(-MAX_MESSAGES_PER_CHAT);
  }

  return messages.map(message => {
    const minimalMessage: Message = {
      id: message.id,
      type: message.type,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
    };

    if (message.metadata) {
      const essentialMetadata: Record<string, any> = {};

      // 保留必要的元数据
      const keysToKeep = [
        'deviceId',
        'agentId',
        'offline',
        'files',
        'responseId',
        'apiKey',
        'appId',
      ];
      keysToKeep.forEach(key => {
        if (message.metadata?.[key] !== undefined) {
          essentialMetadata[key] = message.metadata[key];
        }
      });

      if (Object.keys(essentialMetadata).length > 0) {
        minimalMessage.metadata = essentialMetadata;
      }
    }

    return minimalMessage;
  });
}

/**
 * 生成唯一ID
 */
export function generateUniqueId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 安全的JSON解析
 */
export function safeJSONParse<T>(json: string | null, defaultValue: T): T {
  if (!json) return defaultValue;
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * 安全的JSON字符串化
 */
export function safeJSONStringify(
  data: any,
  defaultValue: string = ''
): string {
  try {
    return JSON.stringify(data);
  } catch {
    return defaultValue;
  }
}

/**
 * 格式化预览文本
 */
export function formatPreviewText(
  text: string,
  maxLength: number = 50
): string {
  if (typeof text !== 'string') return '内容';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}

/**
 * 格式化标题文本
 */
export function formatTitleText(text: string, maxLength: number = 30): string {
  if (typeof text !== 'string') return '对话';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}
