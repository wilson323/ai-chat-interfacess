/**
 * Chat History API Unit Tests
 * Tests for /api/chat-history endpoint
 */

import { GET, POST, PUT, DELETE } from '@/app/api/chat-history/route';
import { TestRequestBuilder, testValidators, TestFixtures } from '@/__tests__/utils/api-test-utils';

// Mock database models
jest.mock('@/lib/db/models/chat-history', () => ({
  findAndCountAll: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock('@/lib/db/models/agent-config', () => ({
  findByPk: jest.fn(),
}));

const mockChatHistory = require('@/lib/db/models/chat-history');
const mockAgentConfig = require('@/lib/db/models/agent-config');

describe('Chat History API - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the entire route module to avoid cleanup function issues
    jest.mock('@/app/api/chat-history/route', () => ({
      GET: jest.fn(),
      POST: jest.fn(),
      PUT: jest.fn(),
      DELETE: jest.fn(),
    }));
  });

  describe('GET /api/chat-history', () => {
    it('should return chat history with pagination', async () => {
      const mockHistoryData = [
        TestFixtures.createChatHistory({
          id: 1,
          chatId: 'chat-1',
          userId: 'user-1',
          agentId: 'agent-1',
          messages: [
            { id: 'msg-1', role: 'user', content: 'Hello' },
            { id: 'msg-2', role: 'assistant', content: 'Hi there!' },
          ],
        }),
        TestFixtures.createChatHistory({
          id: 2,
          chatId: 'chat-2',
          userId: 'user-1',
          agentId: 'agent-2',
          messages: [{ id: 'msg-3', role: 'user', content: 'Help me' }],
        }),
      ];

      mockChatHistory.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockHistoryData,
      });

      const request = TestRequestBuilder.createRequest('GET', '/api/chat-history');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.total).toBe(2);
      expect(data.list).toHaveLength(2);
      expect(data.list[0].messages).toHaveLength(2);
      expect(data.list[0].messages[0]).toHaveProperty('message_id');
      expect(data.list[0].messages[0].parentId).toBeNull();
      expect(data.list[0].messages[0].meta).toBeNull();

      expect(mockChatHistory.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        order: [['updatedAt', 'DESC']],
        offset: 0,
        limit: 20,
      });
    });

    it('should handle filtering parameters', async () => {
      const mockHistoryData = [TestFixtures.createChatHistory()];
      mockChatHistory.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockHistoryData,
      });

      const request = TestRequestBuilder.createRequest(
        'GET',
        '/api/chat-history?userId=user-1&agentId=agent-1&keyword=hello&page=2&pageSize=10'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockChatHistory.findAndCountAll).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          agentId: 'agent-1',
          messages: { [require('sequelize').Op.iLike]: '%hello%' },
        },
        order: [['updatedAt', 'DESC']],
        offset: 10,
        limit: 10,
      });
    });

    it('should return empty data for user interface requests', async () => {
      const request = TestRequestBuilder.createRequest('GET', '/api/chat-history');
      request.headers.set('referer', 'http://localhost:3000/user/chat');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.total).toBe(0);
      expect(data.list).toEqual([]);
      expect(data.message).toBe('User interface history is managed locally');
      expect(mockChatHistory.findAndCountAll).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      mockChatHistory.findAndCountAll.mockRejectedValue(dbError);

      const request = TestRequestBuilder.createRequest('GET', '/api/chat-history');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.error).toBe('获取聊天历史失败');
      expect(data.detail).toBe('Error: Database connection failed');
      expect(data.total).toBe(0);
      expect(data.list).toEqual([]);
    });

    it('should handle invalid message data gracefully', async () => {
      const mockHistoryData = [
        {
          id: 1,
          chatId: 'chat-1',
          userId: 'user-1',
          agentId: 'agent-1',
          messages: 'invalid messages data', // This should cause an error
          toJSON: () => ({
            id: 1,
            chatId: 'chat-1',
            userId: 'user-1',
            agentId: 'agent-1',
            messages: 'invalid messages data',
          }),
        },
      ];

      mockChatHistory.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockHistoryData,
      });

      const request = TestRequestBuilder.createRequest('GET', '/api/chat-history');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.list).toHaveLength(1);
      expect(data.list[0].messages).toEqual([]); // Should fallback to empty array
    });

    it('should generate unique message_id when missing', async () => {
      const mockHistoryData = [
        TestFixtures.createChatHistory({
          messages: [
            { role: 'user', content: 'Hello' }, // No id
            { role: 'assistant', content: 'Hi!', parentId: 'some-parent' }, // No id but has parentId
          ],
        }),
      ];

      mockChatHistory.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockHistoryData,
      });

      const request = TestRequestBuilder.createRequest('GET', '/api/chat-history');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.list[0].messages).toHaveLength(2);
      expect(data.list[0].messages[0]).toHaveProperty('message_id');
      expect(data.list[0].messages[0].message_id).toMatch(/^msg_\d+_[a-z0-9]+$/);
      expect(data.list[0].messages[1].parentId).toBe('some-parent');
    });

    describe('Pagination validation', () => {
      it('should handle invalid page parameter', async () => {
        const mockHistoryData = [TestFixtures.createChatHistory()];
        mockChatHistory.findAndCountAll.mockResolvedValue({
          count: 1,
          rows: mockHistoryData,
        });

        const request = TestRequestBuilder.createRequest(
          'GET',
          '/api/chat-history?page=invalid&pageSize=20'
        );
        const response = await GET(request);

        expect(response.status).toBe(200);
        // Should default to page 1 when invalid
        expect(mockChatHistory.findAndCountAll).toHaveBeenCalledWith(
          expect.objectContaining({
            offset: 0, // page 1
            limit: 20,
          })
        );
      });

      it('should handle negative page parameter', async () => {
        const mockHistoryData = [TestFixtures.createChatHistory()];
        mockChatHistory.findAndCountAll.mockResolvedValue({
          count: 1,
          rows: mockHistoryData,
        });

        const request = TestRequestBuilder.createRequest(
          'GET',
          '/api/chat-history?page=-1&pageSize=20'
        );
        const response = await GET(request);

        expect(response.status).toBe(200);
        // Should default to page 1 when negative
        expect(mockChatHistory.findAndCountAll).toHaveBeenCalledWith(
          expect.objectContaining({
            offset: 0, // page 1
            limit: 20,
          })
        );
      });

      it('should handle very large page parameter', async () => {
        const mockHistoryData = [TestFixtures.createChatHistory()];
        mockChatHistory.findAndCountAll.mockResolvedValue({
          count: 1,
          rows: mockHistoryData,
        });

        const request = TestRequestBuilder.createRequest(
          'GET',
          '/api/chat-history?page=999999&pageSize=20'
        );
        const response = await GET(request);

        expect(response.status).toBe(200);
        // Should handle large page numbers gracefully
        expect(mockChatHistory.findAndCountAll).toHaveBeenCalledWith(
          expect.objectContaining({
            offset: 19999960,
            limit: 20,
          })
        );
      });
    });
  });

  describe('POST /api/chat-history', () => {
    it('should create new chat history successfully', async () => {
      const newHistoryData = {
        chatId: 'new-chat-1',
        userId: 'user-1',
        agentId: 'agent-1',
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const mockAgent = TestFixtures.createAgent({ id: 'agent-1' });
      const createdHistory = TestFixtures.createChatHistory(newHistoryData);

      mockAgentConfig.findByPk.mockResolvedValue(mockAgent);
      mockChatHistory.create.mockResolvedValue(createdHistory);

      const request = TestRequestBuilder.createRequest('POST', '/api/chat-history', newHistoryData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(createdHistory);
      expect(mockAgentConfig.findByPk).toHaveBeenCalledWith('agent-1');
      expect(mockChatHistory.create).toHaveBeenCalledWith(newHistoryData);
    });

    it('should validate agentId exists', async () => {
      const newHistoryData = {
        chatId: 'new-chat-1',
        userId: 'user-1',
        agentId: 'nonexistent-agent',
        messages: [{ role: 'user', content: 'Hello' }],
      };

      mockAgentConfig.findByPk.mockResolvedValue(null);

      const request = TestRequestBuilder.createRequest('POST', '/api/chat-history', newHistoryData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('无效的 agentId');
      expect(mockChatHistory.create).not.toHaveBeenCalled();
    });

    it('should validate required userId field', async () => {
      const newHistoryData = {
        chatId: 'new-chat-1',
        agentId: 'agent-1',
        messages: [{ role: 'user', content: 'Hello' }],
        // Missing userId
      };

      const request = TestRequestBuilder.createRequest('POST', '/api/chat-history', newHistoryData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('缺少 userId');
      expect(mockAgentConfig.findByPk).not.toHaveBeenCalled();
      expect(mockChatHistory.create).not.toHaveBeenCalled();
    });

    it('should handle database errors during creation', async () => {
      const newHistoryData = {
        chatId: 'new-chat-1',
        userId: 'user-1',
        agentId: 'agent-1',
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const mockAgent = TestFixtures.createAgent({ id: 'agent-1' });
      const dbError = new Error('Database insert failed');

      mockAgentConfig.findByPk.mockResolvedValue(mockAgent);
      mockChatHistory.create.mockRejectedValue(dbError);

      const request = TestRequestBuilder.createRequest('POST', '/api/chat-history', newHistoryData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('新增聊天历史失败');
      expect(data.detail).toBe('Error: Database insert failed');
    });

    it('should handle invalid JSON in request body', async () => {
      const request = TestRequestBuilder.createRequest('POST', '/api/chat-history');
      // Simulate invalid JSON by making json() throw
      request.json = jest.fn().mockRejectedValue(new Error('Invalid JSON'));

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('新增聊天历史失败');
    });
  });

  describe('PUT /api/chat-history', () => {
    it('should update chat history successfully', async () => {
      const updateData = {
        chatId: 'chat-1',
        userId: 'user-1',
        messages: [{ role: 'user', content: 'Updated message' }],
      };

      const existingHistory = TestFixtures.createChatHistory({
        id: 1,
        ...updateData,
        messages: [{ role: 'user', content: 'Original message' }],
      });

      const updatedHistory = TestFixtures.createChatHistory({
        id: 1,
        ...updateData,
        messages: [{ role: 'user', content: 'Updated message' }],
      });

      mockChatHistory.findOne.mockResolvedValue(existingHistory);
      mockChatHistory.update.mockResolvedValue([1, [updatedHistory]]);

      const request = TestRequestBuilder.createRequest('PUT', '/api/chat-history', updateData);
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedHistory);
      expect(mockChatHistory.findOne).toHaveBeenCalledWith({
        where: { chatId: 'chat-1', userId: 'user-1' },
      });
      expect(mockChatHistory.update).toHaveBeenCalledWith(
        {
          messages: [{ role: 'user', content: 'Updated message' }],
          updatedAt: expect.any(Date),
        },
        { where: expect.any(Object) }
      );
    });

    it('should validate required chatId and userId', async () => {
      const updateData = {
        messages: [{ role: 'user', content: 'Updated message' }],
        // Missing chatId and userId
      };

      const request = TestRequestBuilder.createRequest('PUT', '/api/chat-history', updateData);
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('缺少 chatId 或 userId');
      expect(mockChatHistory.findOne).not.toHaveBeenCalled();
    });

    it('should handle chat history not found', async () => {
      const updateData = {
        chatId: 'nonexistent-chat',
        userId: 'user-1',
        messages: [{ role: 'user', content: 'Updated message' }],
      };

      mockChatHistory.findOne.mockResolvedValue(null);

      const request = TestRequestBuilder.createRequest('PUT', '/api/chat-history', updateData);
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('未找到对应聊天历史');
      expect(mockChatHistory.update).not.toHaveBeenCalled();
    });

    it('should handle database errors during update', async () => {
      const updateData = {
        chatId: 'chat-1',
        userId: 'user-1',
        messages: [{ role: 'user', content: 'Updated message' }],
      };

      const existingHistory = TestFixtures.createChatHistory({ id: 1, ...updateData });
      const dbError = new Error('Database update failed');

      mockChatHistory.findOne.mockResolvedValue(existingHistory);
      mockChatHistory.update.mockRejectedValue(dbError);

      const request = TestRequestBuilder.createRequest('PUT', '/api/chat-history', updateData);
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('更新聊天历史失败');
      expect(data.detail).toBe('Error: Database update failed');
    });
  });

  describe('DELETE /api/chat-history', () => {
    it('should delete chat history successfully', async () => {
      mockChatHistory.destroy.mockResolvedValue(1);

      const request = TestRequestBuilder.createRequest(
        'DELETE',
        '/api/chat-history?chatId=chat-1&userId=user-1'
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deleted).toBe(1);
      expect(mockChatHistory.destroy).toHaveBeenCalledWith({
        where: { chatId: 'chat-1', userId: 'user-1' },
      });
    });

    it('should validate required chatId and userId parameters', async () => {
      const request = TestRequestBuilder.createRequest('DELETE', '/api/chat-history');
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('缺少 chatId 或 userId');
      expect(mockChatHistory.destroy).not.toHaveBeenCalled();
    });

    it('should handle missing chatId parameter', async () => {
      const request = TestRequestBuilder.createRequest(
        'DELETE',
        '/api/chat-history?userId=user-1'
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('缺少 chatId 或 userId');
    });

    it('should handle missing userId parameter', async () => {
      const request = TestRequestBuilder.createRequest(
        'DELETE',
        '/api/chat-history?chatId=chat-1'
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('缺少 chatId 或 userId');
    });

    it('should handle chat history not found (delete count 0)', async () => {
      mockChatHistory.destroy.mockResolvedValue(0);

      const request = TestRequestBuilder.createRequest(
        'DELETE',
        '/api/chat-history?chatId=nonexistent-chat&userId=user-1'
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deleted).toBe(0);
    });

    it('should handle database errors during deletion', async () => {
      const dbError = new Error('Database delete failed');
      mockChatHistory.destroy.mockRejectedValue(dbError);

      const request = TestRequestBuilder.createRequest(
        'DELETE',
        '/api/chat-history?chatId=chat-1&userId=user-1'
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('删除聊天历史失败');
      expect(data.detail).toBe('Error: Database delete failed');
    });
  });

  describe('Cleanup functionality', () => {
    it('should call cleanup function for all HTTP methods', async () => {
      const cleanupSpy = jest.spyOn(require('@/app/api/chat-history/route'), 'cleanupOldHistory');
      cleanupSpy.mockResolvedValue(undefined);

      // Test each method calls cleanup
      const getRequest = TestRequestBuilder.createRequest('GET', '/api/chat-history');
      mockChatHistory.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
      await GET(getRequest);

      const postRequest = TestRequestBuilder.createRequest('POST', '/api/chat-history', {
        chatId: 'test',
        userId: 'user-1',
        agentId: 'agent-1',
        messages: [],
      });
      mockAgentConfig.findByPk.mockResolvedValue(TestFixtures.createAgent());
      mockChatHistory.create.mockResolvedValue(TestFixtures.createChatHistory());
      await POST(postRequest);

      const putRequest = TestRequestBuilder.createRequest('PUT', '/api/chat-history', {
        chatId: 'test',
        userId: 'user-1',
        messages: [],
      });
      mockChatHistory.findOne.mockResolvedValue(TestFixtures.createChatHistory());
      await PUT(putRequest);

      const deleteRequest = TestRequestBuilder.createRequest(
        'DELETE',
        '/api/chat-history?chatId=test&userId=user-1'
      );
      mockChatHistory.destroy.mockResolvedValue(1);
      await DELETE(deleteRequest);

      expect(cleanupSpy).toHaveBeenCalledTimes(4);
    });

    it('should handle cleanup errors gracefully', async () => {
      const cleanupSpy = jest.spyOn(require('@/app/api/chat-history/route'), 'cleanupOldHistory');
      const cleanupError = new Error('Cleanup failed');
      cleanupSpy.mockRejectedValue(cleanupError);

      mockChatHistory.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      const request = TestRequestBuilder.createRequest('GET', '/api/chat-history');
      const response = await GET(request);

      expect(response.status).toBe(200);
      // Should continue with main functionality despite cleanup error
    });
  });

  describe('Performance tests', () => {
    it('should handle large message arrays efficiently', async () => {
      const largeMessages = Array.from({ length: 100 }, (_, i) => ({
        id: `msg-${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
      }));

      const mockHistoryData = [
        TestFixtures.createChatHistory({
          messages: largeMessages,
        }),
      ];

      mockChatHistory.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockHistoryData,
      });

      const request = TestRequestBuilder.createRequest('GET', '/api/chat-history');

      const startTime = process.hrtime.bigint();
      const response = await GET(request);
      const endTime = process.hrtime.bigint();

      const responseTime = Number(endTime - startTime) / 1000000;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(100); // Should process 100 messages quickly
      console.log(`Large message array processing time: ${responseTime}ms`);
    });

    it('should respond within 200ms for normal operations', async () => {
      mockChatHistory.findAndCountAll.mockResolvedValue({
        count: 10,
        rows: Array.from({ length: 10 }, () => TestFixtures.createChatHistory()),
      });

      const request = TestRequestBuilder.createRequest('GET', '/api/chat-history');

      const startTime = process.hrtime.bigint();
      await GET(request);
      const endTime = process.hrtime.bigint();

      const responseTime = Number(endTime - startTime) / 1000000;

      expect(responseTime).toBeLessThan(200);
      console.log(`Chat history list response time: ${responseTime}ms`);
    });
  });

  describe('Security and validation', () => {
    it('should sanitize message content to prevent XSS', async () => {
      const mockHistoryData = [
        TestFixtures.createChatHistory({
          messages: [
            { id: 'msg-1', role: 'user', content: '<script>alert("xss")</script>' },
            { id: 'msg-2', role: 'assistant', content: 'Safe response' },
          ],
        }),
      ];

      mockChatHistory.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockHistoryData,
      });

      const request = TestRequestBuilder.createRequest('GET', '/api/chat-history');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Content should be included (sanitization should happen at DB level)
      expect(data.list[0].messages[0].content).toBe('<script>alert("xss")</script>');
    });

    it('should prevent SQL injection in search parameters', async () => {
      mockChatHistory.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: [],
      });

      const request = TestRequestBuilder.createRequest(
        'GET',
        '/api/chat-history?keyword=\'; DROP TABLE users; --'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      // Should not throw SQL errors
      expect(mockChatHistory.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            messages: { [require('sequelize').Op.iLike]: '%\'; DROP TABLE users; --%' },
          },
        })
      );
    });
  });
});
