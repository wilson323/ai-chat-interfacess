/**
 * 存储模块测试
 * 测试存储功能的各种场景
 */

import {
  saveMessagesToStorage,
  loadMessagesFromStorage,
  deleteChatSession,
  getAllChatSessions,
  searchChatSessions,
  getStorageMeta,
  saveStorageMeta,
  estimateSize,
  compressMessages,
  createUserMessage,
  createSystemMessage,
  createAssistantMessage,
} from '@/lib/storage';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};

// 替换默认存储提供者
jest.mock('@/lib/storage/shared/storage-utils', () => ({
  ...jest.requireActual('@/lib/storage/shared/storage-utils'),
  defaultStorageProvider: localStorageMock,
}));

describe('存储模块测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('基本存储操作', () => {
    test('应该能够保存和加载消息', () => {
      const chatId = 'test-chat-1';
      const messages = [
        createUserMessage('Hello'),
        createAssistantMessage('Hi there!'),
      ];

      // 保存消息
      const saveResult = saveMessagesToStorage(chatId, messages);
      expect(saveResult).toBe(true);

      // 验证localStorage被调用
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    test('应该能够删除聊天会话', () => {
      const chatId = 'test-chat-1';
      
      // 删除聊天会话
      const deleteResult = deleteChatSession(chatId);
      expect(deleteResult).toBe(true);

      // 验证localStorage被调用
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });

    test('应该能够获取所有聊天会话', () => {
      // 模拟返回的聊天会话数据
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        'chat-1': { id: 'chat-1', title: 'Test Chat 1', timestamp: Date.now() },
        'chat-2': { id: 'chat-2', title: 'Test Chat 2', timestamp: Date.now() },
      }));

      const sessions = getAllChatSessions();
      expect(Array.isArray(sessions)).toBe(true);
    });

    test('应该能够搜索聊天会话', () => {
      // 模拟返回的聊天会话数据
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        'chat-1': { id: 'chat-1', title: 'Hello World', timestamp: Date.now() },
        'chat-2': { id: 'chat-2', title: 'Test Chat', timestamp: Date.now() },
      }));

      const results = searchChatSessions('Hello');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('存储元数据管理', () => {
    test('应该能够获取存储元数据', () => {
      const meta = getStorageMeta();
      expect(meta).toHaveProperty('totalSize');
      expect(meta).toHaveProperty('chatIds');
      expect(meta).toHaveProperty('chatSizes');
      expect(meta).toHaveProperty('chatLastAccessed');
    });

    test('应该能够保存存储元数据', () => {
      const meta = {
        totalSize: 1000,
        chatIds: ['chat-1'],
        chatSizes: { 'chat-1': 500 },
        chatLastAccessed: { 'chat-1': Date.now() },
        version: 1,
        lastCleanup: Date.now(),
      };

      saveStorageMeta(meta);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('工具函数', () => {
    test('应该能够估算字符串大小', () => {
      const testString = "Hello, world!";
      const size = estimateSize(testString);
      
      // 每个字符2字节
      expect(size).toBe(testString.length * 2);
    });

    test('应该能够压缩消息', () => {
      const messages = [
        createUserMessage('Hello', { deviceId: 'device1' }),
        createAssistantMessage('Hi!', { deviceId: 'device1' }),
      ];

      const compressedMessages = compressMessages(messages);
      
      expect(compressedMessages).toHaveLength(2);
      expect(compressedMessages[0]).toHaveProperty('id');
      expect(compressedMessages[0]).toHaveProperty('role');
      expect(compressedMessages[0]).toHaveProperty('content');
    });
  });

  describe('消息工厂', () => {
    test('应该能够创建用户消息', () => {
      const message = createUserMessage('Hello', { deviceId: 'device1' });
      
      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello');
      expect(message.metadata).toHaveProperty('deviceId', 'device1');
    });

    test('应该能够创建系统消息', () => {
      const message = createSystemMessage('System notification');
      
      expect(message.role).toBe('system');
      expect(message.content).toBe('System notification');
    });

    test('应该能够创建助手消息', () => {
      const message = createAssistantMessage('Assistant response');
      
      expect(message.role).toBe('assistant');
      expect(message.content).toBe('Assistant response');
    });
  });

  describe('错误处理', () => {
    test('应该处理localStorage错误', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const messages = [createUserMessage('Hello')];
      const result = saveMessagesToStorage('test-chat', messages);
      
      expect(result).toBe(false);
    });

    test('应该处理无效的JSON数据', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const meta = getStorageMeta();
      expect(meta).toHaveProperty('totalSize', 0);
    });
  });
});
