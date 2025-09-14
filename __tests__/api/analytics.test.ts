import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { createServer } from 'http';
import { apiResolver } from 'next/dist/server/api-utils/node';
import { NextApiRequest, NextApiResponse } from 'next';
import analyticsOverviewRoute from '@/app/api/analytics/overview/route';
import analyticsTrendsRoute from '@/app/api/analytics/trends/route';
import analyticsUserBehaviorRoute from '@/app/api/analytics/user-behavior/route';
import analyticsPerformanceRoute from '@/app/api/analytics/performance/route';
import { AgentUsage } from '@/lib/db/models/agent-usage';
import { UserGeo } from '@/lib/db/models/user-geo';
import sequelize from '@/lib/db/sequelize';

describe('Analytics API Tests', () => {
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
        sessionId: 'analytics-session-1',
        userId: 1,
        agentId: 1,
        messageType: 'text' as const,
        messageCount: 15,
        tokenUsage: 3000,
        responseTime: 250,
        startTime: new Date(baseDate.getTime() + 1 * 60 * 60 * 1000),
        endTime: new Date(baseDate.getTime() + 1 * 60 * 60 * 1000 + 45000),
        duration: 45,
        isCompleted: true,
        userSatisfaction: 'positive' as const,
        geoLocationId: testUserGeo.id,
        deviceInfo: {
          browser: 'Chrome',
          os: 'Windows 10',
          deviceType: 'desktop',
        },
      },
      {
        sessionId: 'analytics-session-2',
        userId: 2,
        agentId: 2,
        messageType: 'image' as const,
        messageCount: 8,
        tokenUsage: 2500,
        responseTime: 500,
        startTime: new Date(baseDate.getTime() + 2 * 60 * 60 * 1000),
        endTime: new Date(baseDate.getTime() + 2 * 60 * 60 * 1000 + 60000),
        duration: 60,
        isCompleted: true,
        userSatisfaction: 'neutral' as const,
        geoLocationId: testUserGeo.id,
        deviceInfo: {
          browser: 'Safari',
          os: 'macOS',
          deviceType: 'desktop',
        },
      },
      {
        sessionId: 'analytics-session-3',
        userId: 1,
        agentId: 1,
        messageType: 'file' as const,
        messageCount: 3,
        tokenUsage: 800,
        responseTime: 150,
        startTime: new Date(baseDate.getTime() + 3 * 60 * 60 * 1000),
        endTime: new Date(baseDate.getTime() + 3 * 60 * 60 * 1000 + 20000),
        duration: 20,
        isCompleted: true,
        userSatisfaction: 'negative' as const,
        geoLocationId: testUserGeo.id,
        deviceInfo: {
          browser: 'Chrome',
          os: 'Android',
          deviceType: 'mobile',
        },
      },
      {
        sessionId: 'analytics-session-4',
        userId: 3,
        agentId: 3,
        messageType: 'voice' as const,
        messageCount: 12,
        tokenUsage: 1800,
        responseTime: 300,
        startTime: new Date(baseDate.getTime() + 4 * 60 * 60 * 1000),
        endTime: new Date(baseDate.getTime() + 4 * 60 * 60 * 1000 + 35000),
        duration: 35,
        isCompleted: true,
        userSatisfaction: 'positive' as const,
        geoLocationId: testUserGeo.id,
        deviceInfo: {
          browser: 'Firefox',
          os: 'Linux',
          deviceType: 'desktop',
        },
      },
    ];

    await AgentUsage.bulkCreate(testSessions);
  });

  afterEach(async () => {
    // 清理测试数据
    await AgentUsage.destroy({ where: {} });
    await UserGeo.destroy({ where: {} });
  });

  const createMockRequest = (
    method: string = 'GET',
    query: any = {},
    body: any = {},
    headers: any = {}
  ): NextApiRequest => {
    return {
      method,
      query,
      body,
      headers,
      cookies: {},
      url: `/api/analytics?${new URLSearchParams(query)}`,
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

  describe('GET /api/analytics/overview', () => {
    it('should return comprehensive overview statistics', async () => {
      const req = createMockRequest('GET', {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await analyticsOverviewRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();

      // Check overview structure
      const overview = response.data;
      expect(overview).toHaveProperty('totalSessions');
      expect(overview).toHaveProperty('totalUsers');
      expect(overview).toHaveProperty('totalMessages');
      expect(overview).toHaveProperty('totalTokens');
      expect(overview).toHaveProperty('averageSessionDuration');
      expect(overview).toHaveProperty('averageResponseTime');
      expect(overview).toHaveProperty('userSatisfaction');
      expect(overview).toHaveProperty('topAgents');
      expect(overview).toHaveProperty('topLocations');
      expect(overview).toHaveProperty('messageTypeDistribution');
      expect(overview).toHaveProperty('timeSeriesData');
    });

    it('should calculate correct totals', async () => {
      const req = createMockRequest('GET', {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await analyticsOverviewRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      const overview = response.data;

      expect(overview.totalSessions).toBe(4);
      expect(overview.totalUsers).toBe(3);
      expect(overview.totalMessages).toBe(38); // 15 + 8 + 3 + 12
      expect(overview.totalTokens).toBe(8100); // 3000 + 2500 + 800 + 1800
    });

    it('should handle date range filtering', async () => {
      const startDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const req = createMockRequest('GET', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await analyticsOverviewRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.dateRange).toEqual({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
    });

    it('should handle missing parameters', async () => {
      const req = createMockRequest('GET', {});
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await analyticsOverviewRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
    });

    it('should handle empty result sets', async () => {
      // Clear test data
      await AgentUsage.destroy({ where: {} });

      const req = createMockRequest('GET', {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await analyticsOverviewRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data.totalSessions).toBe(0);
      expect(response.data.totalUsers).toBe(0);
    });
  });

  describe('GET /api/analytics/trends', () => {
    it('should return trend analysis data', async () => {
      const req = createMockRequest('GET', {
        startDate: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date().toISOString(),
        granularity: 'day',
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await analyticsTrendsRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();

      // Check trends structure
      const trends = response.data;
      expect(trends).toHaveProperty('timeSeries');
      expect(trends).toHaveProperty('growthRates');
      expect(trends).toHaveProperty('movingAverages');
      expect(trends).toHaveProperty('seasonalPatterns');
      expect(trends).toHaveProperty('predictions');
    });

    it('should handle different granularity levels', async () => {
      const granularities = ['hour', 'day', 'week', 'month'];

      for (const granularity of granularities) {
        const req = createMockRequest('GET', {
          startDate: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          endDate: new Date().toISOString(),
          granularity,
        });
        const res = createMockResponse();

        req.cookies = {
          'next-auth.session-token': 'mock-session-token',
        };

        await analyticsTrendsRoute.GET(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(200);
        const response = res.json.mock.calls[0][0];
        expect(response.success).toBe(true);
        expect(response.data.granularity).toBe(granularity);
      }
    });

    it('should calculate growth rates correctly', async () => {
      const req = createMockRequest('GET', {
        startDate: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date().toISOString(),
        granularity: 'day',
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await analyticsTrendsRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      const trends = response.data;

      expect(trends.growthRates).toBeDefined();
      expect(trends.growthRates).toHaveProperty('sessionGrowth');
      expect(trends.growthRates).toHaveProperty('userGrowth');
      expect(trends.growthRates).toHaveProperty('messageGrowth');
    });

    it('should handle invalid granularity', async () => {
      const req = createMockRequest('GET', {
        startDate: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date().toISOString(),
        granularity: 'invalid',
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await analyticsTrendsRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('粒度'),
        })
      );
    });
  });

  describe('GET /api/analytics/user-behavior', () => {
    it('should return user behavior analysis', async () => {
      const req = createMockRequest('GET', {
        startDate: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await analyticsUserBehaviorRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();

      // Check behavior structure
      const behavior = response.data;
      expect(behavior).toHaveProperty('userSegments');
      expect(behavior).toHaveProperty('sessionPatterns');
      expect(behavior).toHaveProperty('messagePatterns');
      expect(behavior).toHaveProperty('devicePreferences');
      expect(behavior).toHaveProperty('timePreferences');
      expect(behavior).toHaveProperty('satisfactionAnalysis');
    });

    it('should analyze user segments correctly', async () => {
      const req = createMockRequest('GET', {
        startDate: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await analyticsUserBehaviorRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      const behavior = response.data;

      expect(behavior.userSegments).toBeDefined();
      expect(Array.isArray(behavior.userSegments)).toBe(true);

      // Check that segments have required properties
      if (behavior.userSegments.length > 0) {
        const segment = behavior.userSegments[0];
        expect(segment).toHaveProperty('segment');
        expect(segment).toHaveProperty('userCount');
        expect(segment).toHaveProperty('averageSessions');
        expect(segment).toHaveProperty('averageMessages');
      }
    });

    it('should analyze device preferences', async () => {
      const req = createMockRequest('GET', {
        startDate: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await analyticsUserBehaviorRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      const behavior = response.data;

      expect(behavior.devicePreferences).toBeDefined();
      expect(Array.isArray(behavior.devicePreferences)).toBe(true);

      // Check device preference structure
      if (behavior.devicePreferences.length > 0) {
        const device = behavior.devicePreferences[0];
        expect(device).toHaveProperty('deviceType');
        expect(device).toHaveProperty('usageCount');
        expect(device).toHaveProperty('percentage');
      }
    });

    it('should analyze time preferences', async () => {
      const req = createMockRequest('GET', {
        startDate: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await analyticsUserBehaviorRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      const behavior = response.data;

      expect(behavior.timePreferences).toBeDefined();
      expect(Array.isArray(behavior.timePreferences)).toBe(true);
    });
  });

  describe('GET /api/analytics/performance', () => {
    it('should return performance metrics', async () => {
      const req = createMockRequest('GET', {
        startDate: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await analyticsPerformanceRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();

      // Check performance structure
      const performance = response.data;
      expect(performance).toHaveProperty('responseTimeMetrics');
      expect(performance).toHaveProperty('tokenEfficiency');
      expect(performance).toHaveProperty('systemLoad');
      expect(performance).toHaveProperty('errorRates');
      expect(performance).toHaveProperty('availabilityMetrics');
      expect(performance).toHaveProperty('performanceScore');
    });

    it('should calculate response time metrics correctly', async () => {
      const req = createMockRequest('GET', {
        startDate: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await analyticsPerformanceRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      const performance = response.data;

      expect(performance.responseTimeMetrics).toBeDefined();
      expect(performance.responseTimeMetrics).toHaveProperty('average');
      expect(performance.responseTimeMetrics).toHaveProperty('median');
      expect(performance.responseTimeMetrics).toHaveProperty('p95');
      expect(performance.responseTimeMetrics).toHaveProperty('p99');
      expect(performance.responseTimeMetrics).toHaveProperty('min');
      expect(performance.responseTimeMetrics).toHaveProperty('max');
    });

    it('should calculate token efficiency metrics', async () => {
      const req = createMockRequest('GET', {
        startDate: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await analyticsPerformanceRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      const performance = response.data;

      expect(performance.tokenEfficiency).toBeDefined();
      expect(performance.tokenEfficiency).toHaveProperty(
        'averageTokensPerSession'
      );
      expect(performance.tokenEfficiency).toHaveProperty(
        'averageTokensPerMessage'
      );
      expect(performance.tokenEfficiency).toHaveProperty('efficiencyScore');
    });

    it('should calculate overall performance score', async () => {
      const req = createMockRequest('GET', {
        startDate: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await analyticsPerformanceRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      const performance = response.data;

      expect(performance.performanceScore).toBeDefined();
      expect(typeof performance.performanceScore).toBe('number');
      expect(performance.performanceScore).toBeGreaterThanOrEqual(0);
      expect(performance.performanceScore).toBeLessThanOrEqual(100);
    });

    it('should handle performance alerts', async () => {
      const req = createMockRequest('GET', {
        startDate: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date().toISOString(),
        includeAlerts: 'true',
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await analyticsPerformanceRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      const performance = response.data;

      expect(performance.alerts).toBeDefined();
      expect(Array.isArray(performance.alerts)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle unauthorized access', async () => {
      const req = createMockRequest('GET', {});
      const res = createMockResponse();

      // No session cookie
      await analyticsOverviewRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: '未授权访问',
        })
      );
    });

    it('should handle invalid date parameters', async () => {
      const req = createMockRequest('GET', {
        startDate: 'invalid-date',
        endDate: 'invalid-date',
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await analyticsOverviewRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('日期格式'),
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      jest
        .spyOn(sequelize, 'query')
        .mockRejectedValue(new Error('Database connection failed'));

      const req = createMockRequest('GET', {});
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      await analyticsOverviewRoute.GET(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('数据库'),
        })
      );

      // Restore mock
      jest.restoreAllMocks();
    });
  });

  describe('Performance Tests', () => {
    it('should handle large datasets efficiently', async () => {
      // Create large dataset
      const bulkData = [];
      for (let i = 0; i < 1000; i++) {
        bulkData.push({
          sessionId: `perf-session-${i}`,
          userId: (i % 100) + 1,
          agentId: (i % 5) + 1,
          messageType: ['text', 'image', 'file', 'voice'][
            Math.floor(Math.random() * 4)
          ],
          messageCount: Math.floor(Math.random() * 20) + 1,
          tokenUsage: Math.floor(Math.random() * 5000) + 100,
          responseTime: Math.floor(Math.random() * 1000) + 100,
          startTime: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ),
          isCompleted: Math.random() > 0.1,
          userSatisfaction: ['positive', 'negative', 'neutral'][
            Math.floor(Math.random() * 3)
          ],
          geoLocationId: testUserGeo.id,
          deviceInfo: {
            browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][
              Math.floor(Math.random() * 4)
            ],
            os: ['Windows', 'macOS', 'Linux', 'Android', 'iOS'][
              Math.floor(Math.random() * 5)
            ],
            deviceType: ['desktop', 'mobile', 'tablet'][
              Math.floor(Math.random() * 3)
            ],
          },
        });
      }

      await AgentUsage.bulkCreate(bulkData);

      const req = createMockRequest('GET', {
        startDate: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date().toISOString(),
      });
      const res = createMockResponse();

      req.cookies = {
        'next-auth.session-token': 'mock-session-token',
      };

      const startTime = Date.now();
      await analyticsOverviewRoute.GET(req as any, res as any);
      const endTime = Date.now();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent requests', async () => {
      const requests = [];
      const responses = [];

      // Create 5 concurrent requests
      for (let i = 0; i < 5; i++) {
        const req = createMockRequest('GET', {
          startDate: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          endDate: new Date().toISOString(),
        });
        const res = createMockResponse();

        req.cookies = {
          'next-auth.session-token': 'mock-session-token',
        };

        requests.push(analyticsOverviewRoute.GET(req as any, res as any));
        responses.push(res);
      }

      // Wait for all requests to complete
      await Promise.all(requests);

      // Check all responses
      responses.forEach(res => {
        expect(res.status).toHaveBeenCalledWith(200);
        const response = res.json.mock.calls[0][0];
        expect(response.success).toBe(true);
      });
    });
  });
});
