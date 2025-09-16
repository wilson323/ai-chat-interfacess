/**
 * FastGPT集成测试
 * 测试API客户端、多智能体管理、错误处理
 */

import { FastGPTClient } from '@/lib/api/fastgpt';
import { FastGPTMultiAgentManager } from '@/lib/api/fastgpt/multi-agent-manager';
import { FastGPTChatResponse } from '@/types/unified-agent';

// Mock fetch
global.fetch = jest.fn();

describe('FastGPT Integration', () => {
  let client: FastGPTClient;
  let multiAgentManager: FastGPTMultiAgentManager;

  beforeEach(() => {
    client = new FastGPTClient({
      apiKey: 'test-api-key',
      baseUrl: 'https://test.fastgpt.run',
    });

    multiAgentManager = new FastGPTMultiAgentManager();

    // Reset fetch mock
    (fetch as jest.Mock).mockClear();
  });

  describe('FastGPTClient', () => {
    test('应该能够创建客户端实例', () => {
      expect(client).toBeDefined();
    });

    test('应该能够发送聊天请求', async () => {
      const mockResponse: FastGPTChatResponse = {
        id: 'chatcmpl-123',
        model: 'gpt-3.5-turbo',
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Hello! How can I help you today?',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const messages = [
        { role: 'user' as const, content: 'Hello, world!' }
      ];

      const response = await client.chat(messages, {});

      expect(fetch).toHaveBeenCalledWith(
        'https://test.fastgpt.run/api/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(response).toBeDefined();
    });

    test('应该能够处理流式聊天', async () => {
      const mockStreamResponse = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'));
          controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":" world!"}}]}\n\n'));
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: mockStreamResponse,
      });

      const messages = [
        { role: 'user' as const, content: 'Hello, world!' }
      ];

      const chunks: string[] = [];
      await client.streamChat(messages, {
        onChunk: (chunk: string) => {
          chunks.push(chunk);
        }
      });

      expect(chunks).toContain('Hello');
      expect(chunks).toContain(' world!');
    });

    test('应该能够处理API错误', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Invalid API key' }),
      });

      const messages = [
        { role: 'user' as const, content: 'Hello, world!' }
      ];

      await expect(client.chat(messages, {})).rejects.toThrow();
    });

    test('应该能够处理网络错误', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const messages = [
        { role: 'user' as const, content: 'Hello, world!' }
      ];

      await expect(client.chat(messages, {})).rejects.toThrow('Network error');
    });
  });

  describe('FastGPTMultiAgentManager', () => {
    test('应该能够创建多智能体管理器实例', () => {
      expect(multiAgentManager).toBeDefined();
    });
  });
});
