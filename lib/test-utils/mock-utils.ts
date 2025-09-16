/**
 * Mock工具函数
 * 提供统一的测试mock功能
 */

import type { Agent } from '@/types/agent';
import type { UnifiedAgent } from '@/types/unified-agent';

/**
 * 创建测试用的Agent对象
 */
export const createMockAgent = (overrides: Partial<Agent> = {}): Agent => ({
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
    isActive: true,
    settings: {
      timeout: 30000,
      retryCount: 3,
      cacheEnabled: true,
      logLevel: 'info' as const,
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
  ...overrides,
});

/**
 * 创建测试用的UnifiedAgent对象
 */
export const createMockUnifiedAgent = (overrides: Partial<UnifiedAgent> = {}): UnifiedAgent => ({
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
  ...overrides,
});

/**
 * 创建测试用的AgentContext mock
 */
export const createMockAgentContext = (overrides: any = {}) => ({
  selectedAgent: createMockAgent(),
  agents: [createMockAgent()],
  selectAgent: jest.fn(),
  closeSidebars: jest.fn(),
  globalVariables: [],
  setGlobalVariables: jest.fn(),
  abortCurrentRequest: jest.fn(),
  setAbortController: jest.fn(),
  isRequestActive: false,
  setShowGlobalVariablesForm: jest.fn(),
  ...overrides,
});

/**
 * 创建测试用的FastGPTChatResponse mock
 */
export const createMockFastGPTChatResponse = (overrides: any = {}) => ({
  id: 'test-response-id',
  model: 'gpt-3.5-turbo',
  choices: [
    {
      message: {
        role: 'assistant',
        content: 'Test response content',
      },
      finish_reason: 'stop',
      index: 0,
    },
  ],
  usage: {
    prompt_tokens: 10,
    completion_tokens: 5,
    total_tokens: 15,
  },
  ...overrides,
});
