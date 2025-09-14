import type { Message } from '@/types/message';
import {
  getAllChatSessions,
  loadMessagesFromLocalStorage,
  saveMessagesToLocalStorage,
} from '@/lib/storage/index';

/**
 * 导出所有聊天历史记录
 * @returns 包含所有聊天历史的JSON字符串
 */
export function exportAllChatHistory(): string {
  try {
    const sessions = getAllChatSessions();
    const exportData: Record<string, Message[]> = {};

    for (const session of sessions) {
      const messages = loadMessagesFromLocalStorage(session.id);
      if (messages) {
        exportData[session.id] = messages;
      }
    }

    return JSON.stringify({
      version: 1,
      timestamp: Date.now(),
      data: exportData,
    });
  } catch (error) {
    console.error('Failed to export chat history:', error);
    throw new Error('导出聊天历史失败');
  }
}

/**
 * 导入聊天历史记录
 * @param jsonData 导出的JSON数据
 * @returns 是否导入成功
 */
export function importChatHistory(jsonData: string): boolean {
  try {
    const importData = JSON.parse(jsonData);

    // 验证数据格式
    if (!importData.version || !importData.data) {
      throw new Error('无效的导入数据格式');
    }

    // 导入每个会话
    const data = importData.data as Record<string, Message[]>;
    for (const chatId in data) {
      const messages = data[chatId];
      if (Array.isArray(messages) && messages.length > 0) {
        // 确保时间戳是Date对象
        const processedMessages = messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));

        // 保存到本地存储
        saveMessagesToLocalStorage(chatId, processedMessages);
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to import chat history:', error);
    throw new Error('导入聊天历史失败');
  }
}

/**
 * 清除所有聊天历史
 * @returns 是否清除成功
 */
export function clearAllChatHistory(): boolean {
  try {
    const sessions = getAllChatSessions();

    for (const session of sessions) {
      localStorage.removeItem(`zkteco_messages_${session.id}`);
    }

    // 清除索引
    localStorage.removeItem('zkteco_chat_index');

    return true;
  } catch (error) {
    console.error('Failed to clear chat history:', error);
    return false;
  }
}
