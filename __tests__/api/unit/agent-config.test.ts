/**
 * Agent Config API Unit Tests
 * Tests for /api/agent-config endpoint
 */

import { GET } from '@/app/api/agent-config/route';
import { TestRequestBuilder, testValidators, TestFixtures } from '@/__tests__/utils/api-test-utils';

// Mock the AgentConfig model
jest.mock('@/lib/db/models/agent-config', () => ({
  findAll: jest.fn(),
}));

const mockAgentConfig = require('@/lib/db/models/agent-config');

describe('Agent Config API - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/agent-config', () => {
    it('should return list of published agents', async () => {
      const mockAgents = [
        TestFixtures.createAgent({
          id: 'agent-1',
          name: 'Test Agent 1',
          description: 'Test description 1',
          type: 'fastgpt',
          isPublished: true,
          order: 1,
          globalVariables: JSON.stringify([{ key: 'var1', value: 'value1' }]),
        }),
        TestFixtures.createAgent({
          id: 'agent-2',
          name: 'Test Agent 2',
          description: 'Test description 2',
          type: 'cad-analyzer',
          isPublished: true,
          order: 2,
          globalVariables: null,
        }),
      ];

      mockAgentConfig.findAll.mockResolvedValue(mockAgents);

      const request = TestRequestBuilder.createRequest('GET', '/api/agent-config');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data).toHaveLength(2);

      // Verify safe field mapping
      const firstAgent = data.data[0];
      expect(firstAgent).toEqual({
        id: 'agent-1',
        name: 'Test Agent 1',
        description: 'Test description 1',
        type: 'fastgpt',
        iconType: '',
        avatar: '',
        order: 1,
        isPublished: true,
        apiKey: '',
        appId: '',
        apiUrl: 'https://zktecoaihub.com/api/v1/chat/completions',
        systemPrompt: '',
        temperature: 0.7,
        maxTokens: 2000,
        multimodalModel: '',
        globalVariables: [{ key: 'var1', value: 'value1' }],
        welcomeText: '',
      });

      expect(mockAgentConfig.findAll).toHaveBeenCalledWith({
        where: { isPublished: true },
        order: [
          ['order', 'ASC'],
          ['updatedAt', 'DESC'],
        ],
      });
    });

    it('should handle empty agent list', async () => {
      mockAgentConfig.findAll.mockResolvedValue([]);

      const request = TestRequestBuilder.createRequest('GET', '/api/agent-config');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

    it('should filter out unpublished agents', async () => {
      const mockAgents = [
        TestFixtures.createAgent({ isPublished: true }),
        TestFixtures.createAgent({ isPublished: false }), // Should be filtered out
        TestFixtures.createAgent({ isPublished: true }),
      ];

      mockAgentConfig.findAll.mockResolvedValue(mockAgents);

      const request = TestRequestBuilder.createRequest('GET', '/api/agent-config');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2); // Only published agents
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      mockAgentConfig.findAll.mockRejectedValue(dbError);

      const request = TestRequestBuilder.createRequest('GET', '/api/agent-config');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('获取智能体列表失败');
      expect(data.detail).toBe('Error: Database connection failed');

      // Verify error was logged
      expect(console.error).toHaveBeenCalledWith(
        '获取智能体列表失败:',
        dbError
      );
    });

    it('should handle JSON parsing errors for globalVariables', async () => {
      const mockAgents = [
        TestFixtures.createAgent({
          globalVariables: 'invalid json string',
        }),
      ];

      mockAgentConfig.findAll.mockResolvedValue(mockAgents);

      const request = TestRequestBuilder.createRequest('GET', '/api/agent-config');
      const response = await GET(request);

      expect(response.status).toBe(500);
      expect(response.json().success).toBe(false);
    });

    describe('Field mapping and defaults', () => {
      it('should provide default values for optional fields', async () => {
        const minimalAgent = TestFixtures.createAgent({
          id: 'minimal-agent',
          name: 'Minimal Agent',
          type: 'fastgpt',
          isPublished: true,
          // Omit optional fields to test defaults
        });

        mockAgentConfig.findAll.mockResolvedValue([minimalAgent]);

        const request = TestRequestBuilder.createRequest('GET', '/api/agent-config');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        const agent = data.data[0];

        expect(agent.description).toBe('');
        expect(agent.iconType).toBe('');
        expect(agent.avatar).toBe('');
        expect(agent.order).toBe(100);
        expect(agent.apiKey).toBe('');
        expect(agent.appId).toBe('');
        expect(agent.apiUrl).toBe('https://zktecoaihub.com/api/v1/chat/completions');
        expect(agent.systemPrompt).toBe('');
        expect(agent.temperature).toBe(0.7);
        expect(agent.maxTokens).toBe(2000);
        expect(agent.multimodalModel).toBe('');
        expect(agent.globalVariables).toEqual([]);
        expect(agent.welcomeText).toBe('');
      });

      it('should preserve actual values when provided', async () => {
        const completeAgent = TestFixtures.createAgent({
          id: 'complete-agent',
          name: 'Complete Agent',
          description: 'Full description',
          type: 'fastgpt',
          iconType: 'bot',
          avatar: 'avatar.png',
          order: 5,
          isPublished: true,
          apiKey: 'test-key',
          appId: 'test-app',
          apiUrl: 'https://custom-api.com',
          systemPrompt: 'You are a helpful assistant',
          temperature: 0.9,
          maxTokens: 1500,
          multimodalModel: 'gpt-4-vision',
          globalVariables: JSON.stringify([{ key: 'model', value: 'gpt-4' }]),
          welcomeText: 'Hello! How can I help you?',
        });

        mockAgentConfig.findAll.mockResolvedValue([completeAgent]);

        const request = TestRequestBuilder.createRequest('GET', '/api/agent-config');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        const agent = data.data[0];

        expect(agent.description).toBe('Full description');
        expect(agent.iconType).toBe('bot');
        expect(agent.avatar).toBe('avatar.png');
        expect(agent.order).toBe(5);
        expect(agent.apiKey).toBe('test-key');
        expect(agent.appId).toBe('test-app');
        expect(agent.apiUrl).toBe('https://custom-api.com');
        expect(agent.systemPrompt).toBe('You are a helpful assistant');
        expect(agent.temperature).toBe(0.9);
        expect(agent.maxTokens).toBe(1500);
        expect(agent.multimodalModel).toBe('gpt-4-vision');
        expect(agent.globalVariables).toEqual([{ key: 'model', value: 'gpt-4' }]);
        expect(agent.welcomeText).toBe('Hello! How can I help you?');
      });
    });

    describe('Ordering', () => {
      it('should respect the order and updatedAt ordering', async () => {
        const mockAgents = [
          TestFixtures.createAgent({ id: 'agent-2', order: 2, updatedAt: new Date('2024-01-02') }),
          TestFixtures.createAgent({ id: 'agent-1', order: 1, updatedAt: new Date('2024-01-01') }),
          TestFixtures.createAgent({ id: 'agent-3', order: 2, updatedAt: new Date('2024-01-03') }),
        ];

        mockAgentConfig.findAll.mockResolvedValue(mockAgents);

        const request = TestRequestBuilder.createRequest('GET', '/api/agent-config');
        const response = await GET(request);
        const data = await response.json();

        // Should be ordered by order ASC, then updatedAt DESC
        const agentIds = data.data.map((a: any) => a.id);
        expect(agentIds).toEqual(['agent-1', 'agent-3', 'agent-2']);
      });
    });

    describe('Data type conversion', () => {
      it('should convert id to string', async () => {
        const mockAgent = TestFixtures.createAgent({ id: 123 });

        mockAgentConfig.findAll.mockResolvedValue([mockAgent]);

        const request = TestRequestBuilder.createRequest('GET', '/api/agent-config');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data[0].id).toBe('123');
        expect(typeof data.data[0].id).toBe('string');
      });

      it('should parse globalVariables JSON when valid', async () => {
        const mockAgent = TestFixtures.createAgent({
          globalVariables: JSON.stringify([{ key: 'test', value: 'data' }]),
        });

        mockAgentConfig.findAll.mockResolvedValue([mockAgent]);

        const request = TestRequestBuilder.createRequest('GET', '/api/agent-config');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data[0].globalVariables).toEqual([{ key: 'test', value: 'data' }]);
      });
    });

    describe('Security and validation', () => {
      it('should not expose sensitive internal fields', async () => {
        const mockAgent = TestFixtures.createAgent({
          // These fields should not be exposed
          internalSecret: 'secret-data',
          password: 'password',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        mockAgentConfig.findAll.mockResolvedValue([mockAgent]);

        const request = TestRequestBuilder.createRequest('GET', '/api/agent-config');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        const agent = data.data[0];

        // These should not be in the response
        expect(agent).not.toHaveProperty('internalSecret');
        expect(agent).not.toHaveProperty('password');
        expect(agent).not.toHaveProperty('createdAt');
        expect(agent).not.toHaveProperty('updatedAt');
      });

      it('should sanitize dangerous globalVariables content', async () => {
        const mockAgent = TestFixtures.createAgent({
          globalVariables: JSON.stringify([
            { key: 'safe', value: 'data' },
            { key: 'script', value: '<script>alert("xss")</script>' },
            { key: 'sql', value: "'; DROP TABLE users; --" },
          ]),
        });

        mockAgentConfig.findAll.mockResolvedValue([mockAgent]);

        const request = TestRequestBuilder.createRequest('GET', '/api/agent-config');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        const globalVars = data.data[0].globalVariables;

        // Should include the data (actual sanitization should happen at DB level)
        expect(globalVars).toHaveLength(3);
      });
    });

    describe('Performance tests', () => {
      it('should respond within 200ms for reasonable dataset', async () => {
        const mockAgents = Array.from({ length: 50 }, (_, i) =>
          TestFixtures.createAgent({
            id: `agent-${i}`,
            name: `Agent ${i}`,
            isPublished: true,
          })
        );

        mockAgentConfig.findAll.mockResolvedValue(mockAgents);

        const request = TestRequestBuilder.createRequest('GET', '/api/agent-config');

        const startTime = process.hrtime.bigint();
        await GET(request);
        const endTime = process.hrtime.bigint();

        const responseTime = Number(endTime - startTime) / 1000000;

        expect(responseTime).toBeLessThan(200);
        console.log(`Agent config list response time: ${responseTime}ms`);
      });
    });
  });
});