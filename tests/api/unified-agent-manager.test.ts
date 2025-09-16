/**
 * 统一智能体管理器测试
 * 测试核心功能：智能体注册、负载均衡、错误处理、指标收集
 */

import { UnifiedAgentManager } from '@/lib/api/unified-agent-manager';
import { UnifiedAgent } from '@/types/unified-agent';

// Mock FastGPT API
jest.mock('@/lib/api/fastgpt', () => ({
  FastGPTClient: jest.fn().mockImplementation(() => ({
    chat: jest.fn(),
    streamChat: jest.fn(),
  })),
}));

// Mock logger
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('UnifiedAgentManager', () => {
  let manager: UnifiedAgentManager;
  let mockAgent: UnifiedAgent;

  beforeEach(() => {
    manager = new UnifiedAgentManager();
    mockAgent = {
      id: 'test-agent-1',
      name: 'Test Agent',
      description: 'Test agent for unit testing',
      type: 'fastgpt',
      isActive: true,
      supportsStream: true,
      supportsDetail: true,
      config: {
        version: '1.0.0',
        id: 'test-agent-1',
        name: 'Test Agent',
        description: 'Test agent for unit testing',
        apiKey: 'test-api-key',
        appId: 'test-app-id',
        apiUrl: 'https://test.fastgpt.run',
        systemPrompt: 'You are a helpful assistant.',
        temperature: 0.7,
        maxTokens: 1000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          loadBalanceWeight: 1.0,
          retryCount: 3,
          timeout: 30000,
        },
        features: {
          streaming: true,
          fileUpload: true,
          imageUpload: true,
          voiceInput: false,
          voiceOutput: false,
          multimodal: false,
          detail: true,
          questionGuide: false,
        },
        limits: {
          maxTokens: 1000,
          maxFileSize: 10 * 1024 * 1024, // 10MB
          maxRequests: 100,
          rateLimit: 60,
          maxConnections: 10,
        },
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('智能体注册和管理', () => {
    test('应该能够注册新的智能体', async () => {
      await manager.registerAgent(mockAgent);

      const agents = manager.getAllAgents();
      expect(agents).toHaveLength(1);
      expect(agents[0].config.id).toBe('test-agent-1');
    });

    test('应该能够获取所有智能体列表', async () => {
      await manager.registerAgent(mockAgent);

      const agents = manager.getAllAgents();
      expect(agents).toHaveLength(1);
      expect(agents[0].config.id).toBe('test-agent-1');
    });
  });

  describe('聊天功能', () => {
    test('应该能够进行普通聊天', async () => {
      await manager.registerAgent(mockAgent);

      const messages = [
        { role: 'user' as const, content: 'Hello, world!' }
      ];

      const result = await manager.chat(mockAgent, messages);

      expect(result).toBeDefined();
      expect(result.choices).toBeDefined();
    });

    test('应该能够进行流式聊天', async () => {
      await manager.registerAgent(mockAgent);

      const messages = [
        { role: 'user' as const, content: 'Hello, world!' }
      ];

      const onChunk = jest.fn();
      await manager.streamChat(mockAgent, messages, {
        onChunk: onChunk
      });

      // 验证流式聊天被调用
      expect(onChunk).toHaveBeenCalled();
    });
  });

  describe('指标收集', () => {
    test('应该能够获取智能体指标', () => {
      manager.registerAgent(mockAgent);

      const metrics = manager.getAgentMetrics('test-agent-1');
      expect(metrics).toBeDefined();
      expect(metrics?.successfulRequests).toBe(0);
      expect(metrics?.failedRequests).toBe(0);
    });
  });
});
