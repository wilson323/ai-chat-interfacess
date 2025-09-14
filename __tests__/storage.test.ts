/**
 * 存储模块单元测试
 */
import * as storage from '@/lib/storage/index';
import type { Message } from '@/types/message';
import type { Agent } from '@/types/agent';
import {
  describe,
  beforeEach,
  afterAll,
  test,
  jest,
  expect,
} from '@jest/globals';

// 模拟localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
    length: jest.fn(() => Object.keys(store).length),
    // 用于测试的辅助方法
    _getStore: () => store,
    _setStore: (newStore: Record<string, string>) => {
      store = { ...newStore };
    },
  };
})();

// 模拟控制台日志
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

describe('存储模块测试', () => {
  // 在每个测试前设置模拟
  beforeEach(() => {
    // 模拟localStorage
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // 模拟控制台方法
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();

    // 清除localStorage
    localStorageMock.clear();
  });

  // 在所有测试后恢复原始方法
  afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  // ==================== 基本存储操作测试 ====================

  describe('基本存储操作', () => {
    test('应该正确初始化存储系统', () => {
      storage.initStorage();

      // 验证元数据已创建
      const metaJson = localStorageMock.getItem(storage.STORAGE_META_KEY);
      expect(metaJson).not.toBeNull();

      if (metaJson) {
        const meta = JSON.parse(metaJson);
        expect(meta).toHaveProperty('lastCleanup');
        expect(meta).toHaveProperty('totalSize', 0);
        expect(meta).toHaveProperty('chatIds', []);
      }
    });

    test('应该正确估计字符串大小', () => {
      const testString = 'Hello, world!';
      const size = storage.estimateSize(testString);

      // 每个字符2字节
      expect(size).toBe(testString.length * 2);
    });

    test('应该检测存储是否接近限制', () => {
      // 设置元数据，使总大小接近限制
      const maxBytes = storage.MAX_STORAGE_SIZE_MB * 1024 * 1024;
      const meta = {
        lastCleanup: Date.now(),
        totalSize: maxBytes * 0.95, // 95%的最大值
        chatIds: [],
        chatSizes: {},
        chatLastAccessed: {},
      };

      localStorageMock.setItem(storage.STORAGE_META_KEY, JSON.stringify(meta));

      // 验证存储接近限制
      expect(storage.isStorageNearLimit()).toBe(true);

      // 设置较小的总大小
      meta.totalSize = maxBytes * 0.5; // 50%的最大值
      localStorageMock.setItem(storage.STORAGE_META_KEY, JSON.stringify(meta));

      // 验证存储不接近限制
      expect(storage.isStorageNearLimit()).toBe(false);
    });
  });

  // ==================== 智能体存储测试 ====================

  describe('智能体存储', () => {
    test('应该保存和加载本地修改的智能体ID', () => {
      const agentIds = ['agent1', 'agent2', 'agent3'];

      // 保存智能体ID
      storage.saveLocallyModifiedAgents(agentIds);

      // 验证已保存
      const savedJson = localStorageMock.getItem(
        storage.LOCALLY_MODIFIED_AGENTS_KEY
      );
      expect(savedJson).not.toBeNull();
      expect(JSON.parse(savedJson!)).toEqual(agentIds);

      // 加载智能体ID
      const loadedAgentIds = storage.loadLocallyModifiedAgents();
      expect(loadedAgentIds).toEqual(agentIds);
    });

    test('应该将智能体标记为本地修改', () => {
      // 标记智能体
      storage.markAgentAsLocallyModified('agent1');

      // 验证已标记
      const modifiedAgents = storage.loadLocallyModifiedAgents();
      expect(modifiedAgents).toContain('agent1');

      // 再次标记同一智能体不应添加重复项
      storage.markAgentAsLocallyModified('agent1');
      const modifiedAgentsAfter = storage.loadLocallyModifiedAgents();
      expect(modifiedAgentsAfter.filter(id => id === 'agent1').length).toBe(1);
    });

    test('应该保存和加载智能体', () => {
      const agents: Agent[] = [
        {
          id: 'agent1',
          name: 'Agent 1',
          description: 'Test agent 1',
          systemPrompt: 'You are Agent 1',
          icon: {} as any, // 这将被移除
        },
        {
          id: 'agent2',
          name: 'Agent 2',
          description: 'Test agent 2',
          systemPrompt: 'You are Agent 2',
          icon: {} as any, // 这将被移除
        },
      ];

      // 保存智能体
      const saveResult = storage.saveAgents(agents);
      expect(saveResult).toBe(true);

      // 验证已保存（不包含icon）
      const savedJson = localStorageMock.getItem(storage.AGENTS_KEY);
      expect(savedJson).not.toBeNull();

      const savedAgents = JSON.parse(savedJson!);
      expect(savedAgents.length).toBe(2);
      expect(savedAgents[0]).not.toHaveProperty('icon');
      expect(savedAgents[0]).toHaveProperty('id', 'agent1');

      // 加载智能体
      const loadedAgents = storage.loadAgents();
      expect(loadedAgents).not.toBeNull();
      expect(loadedAgents!.length).toBe(2);
      expect(loadedAgents![0]).toHaveProperty('id', 'agent1');
    });

    test('应该保存和加载选定的智能体ID', () => {
      const agentId = 'selected-agent';

      // 保存选定的智能体ID
      storage.saveSelectedAgent(agentId);

      // 验证已保存
      const savedId = localStorageMock.getItem(storage.SELECTED_AGENT_ID_KEY);
      expect(savedId).toBe(agentId);

      // 加载选定的智能体ID
      const loadedId = storage.loadSelectedAgentId();
      expect(loadedId).toBe(agentId);
    });
  });

  // ==================== 消息存储测试 ====================

  describe('消息存储', () => {
    test('应该保存和加载消息', () => {
      const chatId = 'test-chat';
      const messages: Message[] = [
        {
          id: 'msg1',
          type: 'text',
          role: 'user',
          content: 'Hello',
          timestamp: new Date(),
        },
        {
          id: 'msg2',
          type: 'text',
          role: 'assistant',
          content: 'Hi there!',
          timestamp: new Date(),
        },
      ];

      // 保存消息
      const saveResult = storage.saveMessagesToStorage(chatId, messages);
      expect(saveResult).toBe(true);

      // 验证已保存
      const chatKey = `${storage.MESSAGES_PREFIX}${chatId}`;
      const savedJson = localStorageMock.getItem(chatKey);
      expect(savedJson).not.toBeNull();

      // 验证元数据已更新
      const metaJson = localStorageMock.getItem(storage.STORAGE_META_KEY);
      expect(metaJson).not.toBeNull();

      if (metaJson) {
        const meta = JSON.parse(metaJson);
        expect(meta.chatIds).toContain(chatId);
        expect(meta.chatSizes).toHaveProperty(chatId);
        expect(meta.chatLastAccessed).toHaveProperty(chatId);
      }

      // 验证聊天索引已更新
      const indexJson = localStorageMock.getItem(storage.CHAT_INDEX_KEY);
      expect(indexJson).not.toBeNull();

      if (indexJson) {
        const index = JSON.parse(indexJson);
        expect(index).toHaveProperty(chatId);
        expect(index[chatId]).toHaveProperty('title');
        expect(index[chatId]).toHaveProperty('preview');
      }

      // 加载消息
      const loadedMessages = storage.loadMessagesFromStorage(chatId);
      expect(loadedMessages).not.toBeNull();
      expect(loadedMessages!.length).toBe(2);
      expect(loadedMessages![0].id).toBe('msg1');
      expect(loadedMessages![1].id).toBe('msg2');

      // 验证时间戳是Date对象
      expect(loadedMessages![0].timestamp).toBeInstanceOf(Date);
    });

    test('应该压缩消息', () => {
      // 创建带有大量元数据的消息
      const messages: Message[] = [
        {
          id: 'msg1',
          type: 'text',
          role: 'user',
          content: 'Hello',
          timestamp: new Date(),
          metadata: {
            deviceId: 'device1',
            agentId: 'agent1',
            unnecessary1: 'value1',
            unnecessary2: 'value2',
          },
        },
      ];

      // 压缩消息
      const compressedMessages = storage.compressMessages(messages);

      // 验证必要的元数据被保留
      expect(compressedMessages[0].metadata).toHaveProperty(
        'deviceId',
        'device1'
      );
      expect(compressedMessages[0].metadata).toHaveProperty(
        'agentId',
        'agent1'
      );

      // 验证不必要的元数据被移除
      expect(compressedMessages[0].metadata).not.toHaveProperty('unnecessary1');
      expect(compressedMessages[0].metadata).not.toHaveProperty('unnecessary2');
    });

    test('应该限制每个聊天的消息数量', () => {
      const chatId = 'test-chat';

      // 创建超过最大限制的消息
      const messages: Message[] = Array.from(
        { length: storage.MAX_MESSAGES_PER_CHAT + 10 },
        (_, i) => ({
          id: `msg${i}`,
          type: 'text',
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i}`,
          timestamp: new Date(
            Date.now() - (storage.MAX_MESSAGES_PER_CHAT + 10 - i) * 1000
          ),
        })
      );

      // 保存消息
      storage.saveMessagesToStorage(chatId, messages);

      // 加载消息
      const loadedMessages = storage.loadMessagesFromStorage(chatId);

      // 验证只保留了最新的MAX_MESSAGES_PER_CHAT条消息
      expect(loadedMessages).not.toBeNull();
      expect(loadedMessages!.length).toBe(storage.MAX_MESSAGES_PER_CHAT);

      // 验证保留的是最新的消息
      const firstSavedMessageId = `msg${10}`;
      expect(loadedMessages![0].id).toBe(firstSavedMessageId);
    });

    test('应该处理空消息列表', () => {
      const chatId = 'test-chat';

      // 尝试保存空消息列表
      const saveResult = storage.saveMessagesToStorage(chatId, []);

      // 验证保存失败
      expect(saveResult).toBe(false);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  // ==================== 聊天会话管理测试 ====================

  describe('聊天会话管理', () => {
    test('应该删除聊天会话', () => {
      const chatId = 'test-chat';
      const messages: Message[] = [
        {
          id: 'msg1',
          type: 'text',
          role: 'user',
          content: 'Hello',
          timestamp: new Date(),
        },
      ];

      // 先保存消息
      storage.saveMessagesToStorage(chatId, messages);

      // 验证已保存
      const chatKey = `${storage.MESSAGES_PREFIX}${chatId}`;
      expect(localStorageMock.getItem(chatKey)).not.toBeNull();

      // 删除聊天会话
      const deleteResult = storage.deleteChatSession(chatId);
      expect(deleteResult).toBe(true);

      // 验证已删除
      expect(localStorageMock.getItem(chatKey)).toBeNull();

      // 验证元数据已更新
      const metaJson = localStorageMock.getItem(storage.STORAGE_META_KEY);
      if (metaJson) {
        const meta = JSON.parse(metaJson);
        expect(meta.chatIds).not.toContain(chatId);
        expect(meta.chatSizes).not.toHaveProperty(chatId);
        expect(meta.chatLastAccessed).not.toHaveProperty(chatId);
      }

      // 验证聊天索引已更新
      const indexJson = localStorageMock.getItem(storage.CHAT_INDEX_KEY);
      if (indexJson) {
        const index = JSON.parse(indexJson);
        expect(index).not.toHaveProperty(chatId);
      }
    });

    test('应该获取所有聊天会话', () => {
      // 创建多个聊天会话
      const chatIds = ['chat1', 'chat2', 'chat3'];

      for (const chatId of chatIds) {
        const messages: Message[] = [
          {
            id: `msg-${chatId}`,
            type: 'text',
            role: 'user',
            content: `Hello from ${chatId}`,
            timestamp: new Date(Date.now() - chatIds.indexOf(chatId) * 1000), // 不同的时间戳
          },
        ];

        storage.saveMessagesToStorage(chatId, messages);
      }

      // 获取所有聊天会话
      const sessions = storage.getAllChatSessions();

      // 验证返回了所有会话
      expect(sessions.length).toBe(chatIds.length);

      // 验证会话按时间戳降序排序
      expect(sessions[0].id).toBe('chat1');
      expect(sessions[1].id).toBe('chat2');
      expect(sessions[2].id).toBe('chat3');
    });

    test('应该搜索聊天会话', () => {
      // 创建多个聊天会话
      const chats = [
        { id: 'chat1', content: 'Hello world' },
        { id: 'chat2', content: 'Hello universe' },
        { id: 'chat3', content: 'Goodbye world' },
      ];

      for (const chat of chats) {
        const messages: Message[] = [
          {
            id: `msg-${chat.id}`,
            type: 'text',
            role: 'user',
            content: chat.content,
            timestamp: new Date(),
          },
        ];

        storage.saveMessagesToStorage(chat.id, messages);
      }

      // 搜索包含"Hello"的会话
      const helloSessions = storage.searchChatSessions('Hello');
      expect(helloSessions.length).toBe(2);
      expect(helloSessions.some(s => s.id === 'chat1')).toBe(true);
      expect(helloSessions.some(s => s.id === 'chat2')).toBe(true);

      // 搜索包含"world"的会话
      const worldSessions = storage.searchChatSessions('world');
      expect(worldSessions.length).toBe(2);
      expect(worldSessions.some(s => s.id === 'chat1')).toBe(true);
      expect(worldSessions.some(s => s.id === 'chat3')).toBe(true);

      // 搜索包含"universe"的会话
      const universeSessions = storage.searchChatSessions('universe');
      expect(universeSessions.length).toBe(1);
      expect(universeSessions[0].id).toBe('chat2');

      // 搜索不存在的关键词
      const nonexistentSessions = storage.searchChatSessions('nonexistent');
      expect(nonexistentSessions.length).toBe(0);

      // 空搜索应返回所有会话
      const allSessions = storage.searchChatSessions('');
      expect(allSessions.length).toBe(3);
    });

    test('应该重建聊天索引', () => {
      // 创建多个聊天会话但不更新索引
      const chatIds = ['chat1', 'chat2'];

      for (const chatId of chatIds) {
        const messages: Message[] = [
          {
            id: `msg-${chatId}`,
            type: 'text',
            role: 'user',
            content: `Hello from ${chatId}`,
            timestamp: new Date(),
          },
        ];

        // 直接保存消息，不更新索引
        const chatKey = `${storage.MESSAGES_PREFIX}${chatId}`;
        localStorageMock.setItem(chatKey, JSON.stringify(messages));

        // 更新元数据
        const meta = storage.getStorageMeta();
        meta.chatIds.push(chatId);
        storage.saveStorageMeta(meta);
      }

      // 删除聊天索引
      localStorageMock.removeItem(storage.CHAT_INDEX_KEY);

      // 重建聊天索引
      storage.rebuildChatIndex();

      // 验证索引已重建
      const indexJson = localStorageMock.getItem(storage.CHAT_INDEX_KEY);
      expect(indexJson).not.toBeNull();

      if (indexJson) {
        const index = JSON.parse(indexJson);
        expect(Object.keys(index).length).toBe(2);
        expect(index).toHaveProperty('chat1');
        expect(index).toHaveProperty('chat2');
      }

      // 验证可以获取所有聊天会话
      const sessions = storage.getAllChatSessions();
      expect(sessions.length).toBe(2);
    });

    test('应该清除所有聊天会话', () => {
      // 创建多个聊天会话
      const chatIds = ['chat1', 'chat2', 'chat3'];

      for (const chatId of chatIds) {
        const messages: Message[] = [
          {
            id: `msg-${chatId}`,
            type: 'text',
            role: 'user',
            content: `Hello from ${chatId}`,
            timestamp: new Date(),
          },
        ];

        storage.saveMessagesToStorage(chatId, messages);
      }

      // 清除所有聊天会话
      const clearResult = storage.clearAllChatSessions();
      expect(clearResult).toBe(true);

      // 验证所有聊天消息已删除
      for (const chatId of chatIds) {
        const chatKey = `${storage.MESSAGES_PREFIX}${chatId}`;
        expect(localStorageMock.getItem(chatKey)).toBeNull();
      }

      // 验证聊天索引已删除
      expect(localStorageMock.getItem(storage.CHAT_INDEX_KEY)).toBeNull();

      // 验证元数据已重置
      const metaJson = localStorageMock.getItem(storage.STORAGE_META_KEY);
      if (metaJson) {
        const meta = JSON.parse(metaJson);
        expect(meta.chatIds).toEqual([]);
        expect(meta.totalSize).toBe(0);
      }

      // 验证没有聊天会话
      const sessions = storage.getAllChatSessions();
      expect(sessions.length).toBe(0);
    });
  });

  // ==================== 导入/导出测试 ====================

  describe('导入/导出', () => {
    test('应该导出和导入所有聊天会话', () => {
      // 创建多个聊天会话
      const chatIds = ['chat1', 'chat2'];

      for (const chatId of chatIds) {
        const messages: Message[] = [
          {
            id: `msg1-${chatId}`,
            type: 'text',
            role: 'user',
            content: `Hello from ${chatId}`,
            timestamp: new Date(),
          },
          {
            id: `msg2-${chatId}`,
            type: 'text',
            role: 'assistant',
            content: `Hi there, ${chatId}!`,
            timestamp: new Date(),
          },
        ];

        storage.saveMessagesToStorage(chatId, messages);
      }

      // 导出所有聊天会话
      const exportData = storage.exportAllChatSessions();
      expect(exportData).not.toBe('');

      // 清除所有聊天会话
      storage.clearAllChatSessions();

      // 验证已清除
      expect(storage.getAllChatSessions().length).toBe(0);

      // 导入聊天会话
      const importResult = storage.importChatSessions(exportData);
      expect(importResult).toBe(true);

      // 验证已导入
      const sessions = storage.getAllChatSessions();
      expect(sessions.length).toBe(2);

      // 验证消息已导入
      for (const chatId of chatIds) {
        const messages = storage.loadMessagesFromStorage(chatId);
        expect(messages).not.toBeNull();
        expect(messages!.length).toBe(2);
      }
    });
  });

  // ==================== 存储管理测试 ====================

  describe('存储管理', () => {
    test('应该获取存储统计信息', () => {
      // 创建一些聊天会话
      const chatIds = ['chat1', 'chat2', 'chat3'];

      for (const chatId of chatIds) {
        const messages: Message[] = [
          {
            id: `msg-${chatId}`,
            type: 'text',
            role: 'user',
            content: `Hello from ${chatId}`,
            timestamp: new Date(),
          },
        ];

        storage.saveMessagesToStorage(chatId, messages);
      }

      // 获取存储统计信息
      const stats = storage.getStorageStats();

      // 验证统计信息
      expect(stats).toHaveProperty('totalSizeMB');
      expect(stats).toHaveProperty('maxSizeMB', storage.MAX_STORAGE_SIZE_MB);
      expect(stats).toHaveProperty('usagePercent');
      expect(stats).toHaveProperty('chatCount', 3);
    });

    test('应该清理旧聊天', () => {
      // 创建一些聊天会话，包括一些旧的
      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;

      // 创建一个非常旧的聊天（超过MAX_CHAT_AGE_DAYS）
      const oldChatId = 'old-chat';
      const oldMessages: Message[] = [
        {
          id: 'old-msg',
          type: 'text',
          role: 'user',
          content: 'Old message',
          timestamp: new Date(now - (storage.MAX_CHAT_AGE_DAYS + 10) * dayInMs),
        },
      ];

      // 创建一个新的聊天
      const newChatId = 'new-chat';
      const newMessages: Message[] = [
        {
          id: 'new-msg',
          type: 'text',
          role: 'user',
          content: 'New message',
          timestamp: new Date(),
        },
      ];

      // 保存聊天会话
      storage.saveMessagesToStorage(oldChatId, oldMessages);
      storage.saveMessagesToStorage(newChatId, newMessages);

      // 手动设置最后访问时间
      const meta = storage.getStorageMeta();
      meta.chatLastAccessed[oldChatId] =
        now - (storage.MAX_CHAT_AGE_DAYS + 5) * dayInMs;
      meta.lastCleanup = now - 2 * dayInMs; // 确保清理会运行
      storage.saveStorageMeta(meta);

      // 运行清理
      storage.cleanupStorage();

      // 验证旧聊天已删除
      expect(storage.loadMessagesFromStorage(oldChatId)).toBeNull();

      // 验证新聊天仍然存在
      expect(storage.loadMessagesFromStorage(newChatId)).not.toBeNull();
    });

    test('应该在存储接近限制时删除最旧的聊天', () => {
      // 模拟元数据，使总大小接近限制
      const maxBytes = storage.MAX_STORAGE_SIZE_MB * 1024 * 1024;
      const meta = storage.getStorageMeta();
      meta.totalSize = maxBytes * 0.95; // 95%的最大值
      meta.lastCleanup = Date.now() - 2 * 24 * 60 * 60 * 1000; // 2天前

      // 创建一些聊天会话
      const chatIds = ['chat1', 'chat2', 'chat3'];

      for (let i = 0; i < chatIds.length; i++) {
        const chatId = chatIds[i];

        // 设置不同的最后访问时间
        meta.chatLastAccessed[chatId] =
          Date.now() - (3 - i) * 24 * 60 * 60 * 1000;
        meta.chatSizes[chatId] = maxBytes * 0.3; // 每个聊天占用30%的最大值
        meta.chatIds.push(chatId);

        // 直接保存消息
        const chatKey = `${storage.MESSAGES_PREFIX}${chatId}`;
        const messages: Message[] = [
          {
            id: `msg-${chatId}`,
            type: 'text',
            role: 'user',
            content: `Hello from ${chatId}`,
            timestamp: new Date(),
          },
        ];
        localStorageMock.setItem(chatKey, JSON.stringify(messages));
      }

      // 保存元数据
      storage.saveStorageMeta(meta);

      // 运行清理
      storage.cleanupStorage();

      // 验证最旧的聊天已删除
      expect(storage.loadMessagesFromStorage('chat1')).toBeNull();

      // 验证较新的聊天仍然存在
      expect(storage.loadMessagesFromStorage('chat3')).not.toBeNull();
    });
  });

  // ==================== 错误处理测试 ====================

  describe('错误处理', () => {
    test('应该处理localStorage不可用的情况', () => {
      // 模拟localStorage抛出错误
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage is not available');
      });

      // 尝试加载智能体
      const agents = storage.loadAgents();

      // 验证返回null而不是抛出错误
      expect(agents).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    test('应该处理JSON解析错误', () => {
      // 设置无效的JSON
      localStorageMock.setItem(storage.AGENTS_KEY, 'invalid json');

      // 尝试加载智能体
      const agents = storage.loadAgents();

      // 验证返回null而不是抛出错误
      expect(agents).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    test('应该在保存消息失败时进行紧急清理', () => {
      // 模拟localStorage.setItem抛出错误
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage full');
      });

      // 创建大量消息
      const chatId = 'test-chat';
      const messages: Message[] = Array.from({ length: 100 }, (_, i) => ({
        id: `msg${i}`,
        type: 'text',
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        timestamp: new Date(),
      }));

      // 尝试保存消息
      const saveResult = storage.saveMessagesToStorage(chatId, messages);

      // 验证紧急清理被调用
      expect(console.error).toHaveBeenCalled();

      // 恢复原始实现
      localStorageMock.setItem = originalSetItem;

      // 验证可以保存较少的消息
      const reducedMessages = messages.slice(0, 10);
      const reducedSaveResult = storage.saveMessagesToStorage(
        chatId,
        reducedMessages
      );
      expect(reducedSaveResult).toBe(true);
    });

    test('应该创建各种类型的消息', () => {
      // 测试创建用户消息
      const userMessage = storage.createUserMessage('Hello');
      expect(userMessage.role).toBe('user');
      expect(userMessage.content).toBe('Hello');
      expect(userMessage.metadata).toHaveProperty('deviceId');

      // 测试创建系统消息
      const systemMessage = storage.createSystemMessage('System notification');
      expect(systemMessage.role).toBe('system');
      expect(systemMessage.content).toBe('System notification');

      // 测试创建助手消息
      const assistantMessage = storage.createAssistantMessage('I can help you');
      expect(assistantMessage.role).toBe('assistant');
      expect(assistantMessage.content).toBe('I can help you');

      // 测试创建错误消息
      const errorMessage = storage.createErrorMessage('Something went wrong');
      expect(errorMessage.role).toBe('system');
      expect(errorMessage.type).toBe('error');
      expect(errorMessage.content).toBe('Something went wrong');

      // 测试使用Error对象创建错误消息
      const error = new Error('Error object');
      const errorMessageFromError = storage.createErrorMessage(error);
      expect(errorMessageFromError.content).toBe('Error object');
      expect(errorMessageFromError.metadata).toHaveProperty('error');
    });
  });
});
