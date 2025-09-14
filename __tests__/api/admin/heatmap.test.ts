import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { createServer } from 'http';
import { apiResolver } from 'next/dist/server/api-utils/node';
import { NextApiRequest, NextApiResponse } from 'next';
import heatmapRoute from '@/app/api/admin/heatmap/route';
import heatmapDataRoute from '@/app/api/admin/heatmap/data/route';
import heatmapRealtimeRoute from '@/app/api/admin/heatmap/realtime/route';
import heatmapExportRoute from '@/app/api/admin/heatmap/export/route';
import { AgentUsage } from '@/lib/db/models/agent-usage';
import { UserGeo } from '@/lib/db/models/user-geo';
import sequelize from '@/lib/db/sequelize';

describe('Heatmap API Tests', () => {
  let server: any;
  let testUserGeo: UserGeo;

  beforeEach(async () => {
    // 清空测试数据
    await AgentUsage.destroy({ where: {} });
    await UserGeo.destroy({ where: {} });

    // 创建测试地理位置
    testUserGeo = await UserGeo.create({
      ipAddress: '192.168.1.100',
      country: '中国',
      region: '广东省',
      city: '深圳市',
      latitude: 22.5431,
      longitude: 114.0579,
    });

    // 创建测试数据
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);

    const testSessions = [
      {
        sessionId: 'api-test-session-1',
        userId: 1,
        agentId: 1,
        messageType: 'text' as const,
        messageCount: 10,
        tokenUsage: 2000,
        responseTime: 300,
        startTime: new Date(baseDate.getTime() + 1 * 60 * 60 * 1000),
        endTime: new Date(baseDate.getTime() + 1 * 60 * 60 * 1000 + 30000),
        duration: 30,
        isCompleted: true,
        userSatisfaction: 'positive' as const,
        geoLocationId: testUserGeo.id,
      },
      {
        sessionId: 'api-test-session-2',
        userId: 2,
        agentId: 2,
        messageType: 'image' as const,
        messageCount: 5,
        tokenUsage: 1500,
        responseTime: 400,
        startTime: new Date(baseDate.getTime() + 2 * 60 * 60 * 1000),
        endTime: new Date(baseDate.getTime() + 2 * 60 * 60 * 1000 + 45000),
        duration: 45,
        isCompleted: true,
        userSatisfaction: 'neutral' as const,
        geoLocationId: testUserGeo.id,
      },
    ];

    await AgentUsage.bulkCreate(testSessions);
  });

  afterEach(async () => {
    // 清理测试数据
    await AgentUsage.destroy({ where: {} });
    await UserGeo.destroy({ where: {} });

    if (server) {
      server.close();
    }
  });

  const createMockRequest = (method: string = 'GET', query: any = {}, body: any = {}, headers: any = {}): NextApiRequest => {
    return {
      method,
      query,
      body,
      headers,
      cookies: {},
      url: `/api/admin/heatmap?${new URLSearchParams(query)}`,
    } as NextApiRequest;
  };

  const createMockResponse = (): NextApiResponse => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    res.end = jest.fn().mockReturnValue(res);
    return res as NextApiResponse;
  };

  describe('GET /api/admin/heatmap', () => {
    it('should return heatmap statistics successfully', async () => {
      const req = createMockRequest('GET', {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      // Mock admin session
      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await heatmapRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Object),
        })
      );
    });

    it('should handle date range parameters', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const req = createMockRequest('GET', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        agentId: '1',
        country: '中国',
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await heatmapRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.dateRange).toEqual({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
    });

    it('should handle missing date parameters', async () => {
      const req = createMockRequest('GET', {});
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await heatmapRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
    });

    it('should handle unauthorized access', async () => {
      const req = createMockRequest('GET', {});
      const res = createMockResponse();

      // No session cookie
      await heatmapRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: '未授权访问',
        })
      );
    });

    it('should handle invalid date format', async () => {
      const req = createMockRequest('GET', {
        startDate: 'invalid-date',
        endDate: 'invalid-date',
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await heatmapRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('日期格式'),
        })
      );
    });
  });

  describe('GET /api/admin/heatmap/data', () => {
    it('should return heatmap visualization data', async () => {
      const req = createMockRequest('GET', {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        limit: '50',
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await heatmapDataRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);
    });

    it('should filter by agent type', async () => {
      const req = createMockRequest('GET', {
        agentType: 'fastgpt',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await heatmapDataRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
    });

    it('should filter by message type', async () => {
      const req = createMockRequest('GET', {
        messageType: 'text',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await heatmapDataRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
    });

    it('should filter by geographic location', async () => {
      const req = createMockRequest('GET', {
        country: '中国',
        region: '广东省',
        city: '深圳市',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await heatmapDataRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
    });

    it('should handle limit parameter', async () => {
      const req = createMockRequest('GET', {
        limit: '10',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await heatmapDataRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data.length).toBeLessThanOrEqual(10);
    });

    it('should return aggregated location data', async () => {
      const req = createMockRequest('GET', {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await heatmapDataRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);

      // Check if data contains location information
      const firstLocation = response.data[0];
      expect(firstLocation).toHaveProperty('country');
      expect(firstLocation).toHaveProperty('latitude');
      expect(firstLocation).toHaveProperty('longitude');
      expect(firstLocation).toHaveProperty('count');
      expect(firstLocation).toHaveProperty('totalMessages');
      expect(firstLocation).toHaveProperty('totalTokens');
      expect(firstLocation).toHaveProperty('totalDuration');
    });
  });

  describe('GET /api/admin/heatmap/realtime', () => {
    it('should return real-time heatmap data', async () => {
      const req = createMockRequest('GET', {
        timeframe: '1h',
        limit: '100',
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await heatmapRealtimeRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data).toBeInstanceOf(Array);
    });

    it('should handle different timeframes', async () => {
      const timeframes = ['5m', '15m', '30m', '1h', '6h', '24h'];

      for (const timeframe of timeframes) {
        const req = createMockRequest('GET', {
          timeframe,
        });
        const res = createMockResponse();

        req.cookies = {
          'next-auth.session-token': 'mock-session-token',
        };

        await heatmapRealtimeRoute.GET(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(200);
        const response = res.json.mock.calls[0][0];
        expect(response.success).toBe(true);
      }
    });

    it('should handle invalid timeframe', async () => {
      const req = createMockRequest('GET', {
        timeframe: 'invalid',
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await heatmapRealtimeRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('时间范围'),
        })
      );
    });
  });

  describe('GET /api/admin/heatmap/export', () => {
    it('should export data as CSV', async () => {
      const req = createMockRequest('GET', {
        format: 'csv',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await heatmapExportRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv'
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('.csv')
      );
    });

    it('should export data as JSON', async () => {
      const req = createMockRequest('GET', {
        format: 'json',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await heatmapExportRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/json'
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('.json')
      );
    });

    it('should handle invalid export format', async () => {
      const req = createMockRequest('GET', {
        format: 'invalid',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await heatmapExportRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('格式'),
        })
      );
    });

    it('should handle large dataset export', async () => {
      // Create large dataset for export test
      const bulkData = [];
      for (let i = 0; i < 100; i++) {
        bulkData.push({
          sessionId: `export-session-${i}`,
          userId: (i % 5) + 1,
          agentId: 1,
          messageType: ['text', 'image', 'file'][Math.floor(Math.random() * 3)],
          messageCount: Math.floor(Math.random() * 10) + 1,
          tokenUsage: Math.floor(Math.random() * 2000) + 100,
          startTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        });
      }

      await AgentUsage.bulkCreate(bulkData);

      const req = createMockRequest('GET', {
        format: 'csv',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await heatmapExportRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Mock database error
      jest.spyOn(sequelize, 'query').mockRejectedValue(new Error('Database connection failed'));

      const req = createMockRequest('GET', {});
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await heatmapRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('数据库'),
        })
      );

      // Restore mock
      jest.restoreAllMocks();
    });

    it('should handle validation errors', async () => {
      const req = createMockRequest('GET', {
        startDate: 'invalid-date',
        endDate: 'invalid-date',
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await heatmapRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('日期格式'),
        })
      );
    });

    it('should handle empty result sets', async () => {
      // Clear test data to simulate empty results
      await AgentUsage.destroy({ where: {} });

      const req = createMockRequest('GET', {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await heatmapRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      const requests = [];
      const responses = [];

      // Create 10 concurrent requests
      for (let i = 0; i < 10; i++) {
        const req = createMockRequest('GET', {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        });
        const res = createMockResponse();

        req.cookies = {
          'next-auth.session-token': 'mock-session-token',
        };

        requests.push(heatmapRoute.GET(req as any, res as any));
        responses.push(res);
      }

      // Wait for all requests to complete
      await Promise.all(requests);

      // Check all responses
      responses.forEach((res) => {
        expect(res.status).toHaveBeenCalledWith(200);
        const response = res.json.mock.calls[0][0];
        expect(response.success).toBe(true);
      });
    });

    it('should handle large date range queries', async () => {
      const req = createMockRequest('GET', {
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      const startTime = Date.now();
      await heatmapRoute.GET(req as any, res as any);
      const endTime = Date.now();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});