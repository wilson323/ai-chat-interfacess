/**
 * FastGPT API测试
 * 测试FastGPT API的集成和功能
 */

import {
  sendMessage,
  getChatHistory,
  createChatSession,
  updateChatSession,
  deleteChatSession,
  getAvailableModels,
  validateApiKey,
} from '@/lib/api/fastgpt';

// Mock fetch
global.fetch = jest.fn();

describe('FastGPT API测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('sendMessage函数测试', () => {
    it('应该成功发送消息', async () => {
      const mockResponse = {
        id: 'msg-123',
        content: 'Hello from AI',
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await sendMessage({
        message: 'Hello',
        sessionId: 'session-123',
        model: 'gpt-3.5-turbo',
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            message: 'Hello',
            sessionId: 'session-123',
            model: 'gpt-3.5-turbo',
          }),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('应该处理API错误', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid request' }),
      });

      await expect(
        sendMessage({
          message: '',
          sessionId: 'session-123',
          model: 'gpt-3.5-turbo',
        })
      ).rejects.toThrow('Invalid request');
    });

    it('应该处理网络错误', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        sendMessage({
          message: 'Hello',
          sessionId: 'session-123',
          model: 'gpt-3.5-turbo',
        })
      ).rejects.toThrow('Network error');
    });

    it('应该支持流式响应', async () => {
      const mockStreamResponse = new ReadableStream({
        start(controller) {
          controller.enqueue(
            new TextEncoder().encode('data: {"content":"Hello"}\n\n')
          );
          controller.enqueue(
            new TextEncoder().encode('data: {"content":" World"}\n\n')
          );
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: mockStreamResponse,
      });

      const onChunk = jest.fn();
      await sendMessage({
        message: 'Hello',
        sessionId: 'session-123',
        model: 'gpt-3.5-turbo',
        stream: true,
        onChunk,
      });

      expect(onChunk).toHaveBeenCalledWith('Hello');
      expect(onChunk).toHaveBeenCalledWith(' World');
    });
  });

  describe('getChatHistory函数测试', () => {
    it('应该获取聊天历史', async () => {
      const mockHistory = [
        {
          id: '1',
          content: 'Hello',
          role: 'user',
          timestamp: '2023-01-01T00:00:00Z',
        },
        {
          id: '2',
          content: 'Hi there!',
          role: 'assistant',
          timestamp: '2023-01-01T00:01:00Z',
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: mockHistory }),
      });

      const result = await getChatHistory('session-123');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat/history'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer'),
          }),
        })
      );

      expect(result.messages).toEqual(mockHistory);
    });

    it('应该支持分页参数', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [], total: 0 }),
      });

      await getChatHistory('session-123', { page: 2, limit: 20 });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2&limit=20'),
        expect.any(Object)
      );
    });

    it('应该处理空历史记录', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [] }),
      });

      const result = await getChatHistory('session-123');
      expect(result.messages).toEqual([]);
    });
  });

  describe('createChatSession函数测试', () => {
    it('应该创建新的聊天会话', async () => {
      const mockSession = {
        id: 'session-123',
        name: 'New Chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession,
      });

      const result = await createChatSession({
        name: 'New Chat',
        model: 'gpt-3.5-turbo',
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat/sessions'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            name: 'New Chat',
            model: 'gpt-3.5-turbo',
          }),
        })
      );

      expect(result).toEqual(mockSession);
    });

    it('应该处理创建会话失败', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ error: 'Session already exists' }),
      });

      await expect(
        createChatSession({
          name: 'Existing Chat',
          model: 'gpt-3.5-turbo',
        })
      ).rejects.toThrow('Session already exists');
    });
  });

  describe('updateChatSession函数测试', () => {
    it('应该更新聊天会话', async () => {
      const mockUpdatedSession = {
        id: 'session-123',
        name: 'Updated Chat',
        updatedAt: new Date().toISOString(),
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedSession,
      });

      const result = await updateChatSession('session-123', {
        name: 'Updated Chat',
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat/sessions/session-123'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            name: 'Updated Chat',
          }),
        })
      );

      expect(result).toEqual(mockUpdatedSession);
    });

    it('应该处理会话不存在', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Session not found' }),
      });

      await expect(
        updateChatSession('nonexistent-session', {
          name: 'Updated Chat',
        })
      ).rejects.toThrow('Session not found');
    });
  });

  describe('deleteChatSession函数测试', () => {
    it('应该删除聊天会话', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await deleteChatSession('session-123');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat/sessions/session-123'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );

      expect(result.success).toBe(true);
    });

    it('应该处理删除失败', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Permission denied' }),
      });

      await expect(deleteChatSession('session-123')).rejects.toThrow(
        'Permission denied'
      );
    });
  });

  describe('getAvailableModels函数测试', () => {
    it('应该获取可用的模型列表', async () => {
      const mockModels = [
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 4096 },
        { id: 'gpt-4', name: 'GPT-4', maxTokens: 8192 },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ models: mockModels }),
      });

      const result = await getAvailableModels();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/models'),
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result.models).toEqual(mockModels);
    });

    it('应该处理获取模型失败', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      await expect(getAvailableModels()).rejects.toThrow(
        'Internal server error'
      );
    });
  });

  describe('validateApiKey函数测试', () => {
    it('应该验证有效的API密钥', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true, user: { id: 'user-123' } }),
      });

      const result = await validateApiKey('valid-api-key');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/validate'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer valid-api-key',
          }),
        })
      );

      expect(result.valid).toBe(true);
    });

    it('应该拒绝无效的API密钥', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid API key' }),
      });

      const result = await validateApiKey('invalid-api-key');
      expect(result.valid).toBe(false);
    });

    it('应该处理网络错误', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(validateApiKey('test-key')).rejects.toThrow('Network error');
    });
  });

  describe('错误处理和重试机制测试', () => {
    it('应该自动重试失败的请求', async () => {
      (fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      const result = await sendMessage({
        message: 'Hello',
        sessionId: 'session-123',
        model: 'gpt-3.5-turbo',
        retryCount: 1,
      });

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
    });

    it('应该处理超时', async () => {
      jest.useFakeTimers();

      (fetch as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true }),
                }),
              30000
            )
          )
      );

      const promise = sendMessage({
        message: 'Hello',
        sessionId: 'session-123',
        model: 'gpt-3.5-turbo',
        timeout: 5000,
      });

      jest.advanceTimersByTime(5000);

      await expect(promise).rejects.toThrow('Request timeout');

      jest.useRealTimers();
    });
  });

  describe('请求拦截器测试', () => {
    it('应该添加认证头', async () => {
      const mockApiKey = 'test-api-key';

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await sendMessage({
        message: 'Hello',
        sessionId: 'session-123',
        model: 'gpt-3.5-turbo',
        apiKey: mockApiKey,
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
          }),
        })
      );
    });

    it('应该添加用户代理头', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await sendMessage({
        message: 'Hello',
        sessionId: 'session-123',
        model: 'gpt-3.5-turbo',
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': expect.stringContaining('AI-Chat-Interface'),
          }),
        })
      );
    });
  });
});
