import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { HeatmapService } from '@/lib/services/heatmap';
import { AgentUsage } from '@/lib/db/models/agent-usage';
import { UserGeo } from '@/lib/db/models/user-geo';
import sequelize from '@/lib/db/sequelize';
import logger from '@/lib/utils/logger';

// Mock dependencies
jest.mock('@/lib/utils/logger');
jest.mock('@/lib/db/redis', () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
}));

const mockRedis = require('@/lib/db/redis');

describe('HeatmapService Tests', () => {
  let heatmapService: HeatmapService;
  let testUserGeo: UserGeo;

  beforeEach(async () => {
    heatmapService = new HeatmapService();
    jest.clearAllMocks();

    // Clear test data
    await AgentUsage.destroy({ where: {} });
    await UserGeo.destroy({ where: {} });

    // Create test geo location
    testUserGeo = await UserGeo.create({
      ipAddress: '192.168.1.100',
      country: '中国',
      region: '广东省',
      city: '深圳市',
      latitude: 22.5431,
      longitude: 114.0579,
    });
  });

  afterEach(async () => {
    // Clean up test data
    await AgentUsage.destroy({ where: {} });
    await UserGeo.destroy({ where: {} });
  });

  describe('Heatmap Data Generation', () => {
    it('should generate basic heatmap data', async () => {
      // Create test sessions
      const baseDate = new Date();
      const testSessions = [
        {
          sessionId: 'heatmap-session-1',
          userId: 1,
          agentId: 1,
          messageType: 'text' as const,
          messageCount: 10,
          tokenUsage: 2000,
          responseTime: 300,
          startTime: new Date(baseDate.getTime() - 2 * 60 * 60 * 1000),
          endTime: new Date(baseDate.getTime() - 2 * 60 * 60 * 1000 + 30000),
          duration: 30,
          isCompleted: true,
          userSatisfaction: 'positive' as const,
          geoLocationId: testUserGeo.id,
        },
        {
          sessionId: 'heatmap-session-2',
          userId: 2,
          agentId: 1,
          messageType: 'image' as const,
          messageCount: 5,
          tokenUsage: 1500,
          responseTime: 400,
          startTime: new Date(baseDate.getTime() - 1 * 60 * 60 * 1000),
          endTime: new Date(baseDate.getTime() - 1 * 60 * 60 * 1000 + 45000),
          duration: 45,
          isCompleted: true,
          userSatisfaction: 'neutral' as const,
          geoLocationId: testUserGeo.id,
        },
      ];

      await AgentUsage.bulkCreate(testSessions);

      const params = {
        startDate: new Date(baseDate.getTime() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
      };

      const heatmapData = await heatmapService.getHeatmapData(params);

      expect(heatmapData).toBeDefined();
      expect(heatmapData.locations).toHaveLength(1);
      expect(heatmapData.locations[0].country).toBe('中国');
      expect(heatmapData.locations[0].city).toBe('深圳市');
      expect(heatmapData.locations[0].count).toBe(2);
      expect(heatmapData.locations[0].totalMessages).toBe(15);
      expect(heatmapData.locations[0].totalTokens).toBe(3500);
    });

    it('should handle empty dataset', async () => {
      const params = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
      };

      const heatmapData = await heatmapService.getHeatmapData(params);

      expect(heatmapData).toBeDefined();
      expect(heatmapData.locations).toHaveLength(0);
      expect(heatmapData.summary).toBeDefined();
      expect(heatmapData.summary.totalSessions).toBe(0);
      expect(heatmapData.summary.totalUsers).toBe(0);
    });

    it('should filter by date range', async () => {
      const baseDate = new Date();
      const oldDate = new Date(baseDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const recentDate = new Date(baseDate.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago

      await AgentUsage.create({
        sessionId: 'old-session',
        userId: 1,
        agentId: 1,
        messageType: 'text',
        messageCount: 5,
        startTime: oldDate,
        isCompleted: true,
        geoLocationId: testUserGeo.id,
      });

      await AgentUsage.create({
        sessionId: 'recent-session',
        userId: 2,
        agentId: 1,
        messageType: 'text',
        messageCount: 8,
        startTime: recentDate,
        isCompleted: true,
        geoLocationId: testUserGeo.id,
      });

      // Query only recent data
      const params = {
        startDate: new Date(baseDate.getTime() - 2 * 60 * 60 * 1000),
        endDate: new Date(),
      };

      const heatmapData = await heatmapService.getHeatmapData(params);

      expect(heatmapData.locations).toHaveLength(1);
      expect(heatmapData.locations[0].count).toBe(1);
      expect(heatmapData.locations[0].totalMessages).toBe(8);
    });

    it('should filter by agent type', async () => {
      const baseDate = new Date();
      const sessions = [
        {
          sessionId: 'fastgpt-session',
          userId: 1,
          agentId: 1,
          messageType: 'text',
          messageCount: 10,
          startTime: new Date(baseDate.getTime() - 1 * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
        {
          sessionId: 'custom-session',
          userId: 2,
          agentId: 2,
          messageType: 'text',
          messageCount: 5,
          startTime: new Date(baseDate.getTime() - 1 * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
      ];

      await AgentUsage.bulkCreate(sessions);

      const params = {
        startDate: new Date(baseDate.getTime() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
        agentType: 'fastgpt',
      };

      const heatmapData = await heatmapService.getHeatmapData(params);

      expect(heatmapData.locations).toHaveLength(1);
      expect(heatmapData.locations[0].count).toBe(1);
    });

    it('should filter by message type', async () => {
      const baseDate = new Date();
      const sessions = [
        {
          sessionId: 'text-session',
          userId: 1,
          agentId: 1,
          messageType: 'text',
          messageCount: 10,
          startTime: new Date(baseDate.getTime() - 1 * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
        {
          sessionId: 'image-session',
          userId: 2,
          agentId: 1,
          messageType: 'image',
          messageCount: 5,
          startTime: new Date(baseDate.getTime() - 1 * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
      ];

      await AgentUsage.bulkCreate(sessions);

      const params = {
        startDate: new Date(baseDate.getTime() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
        messageType: 'text',
      };

      const heatmapData = await heatmapService.getHeatmapData(params);

      expect(heatmapData.locations).toHaveLength(1);
      expect(heatmapData.locations[0].count).toBe(1);
      expect(heatmapData.locations[0].totalMessages).toBe(10);
    });

    it('should filter by geographic location', async () => {
      // Create multiple geo locations
      const chinaGeo = await UserGeo.create({
        ipAddress: '192.168.1.200',
        country: '中国',
        region: '北京市',
        city: '北京',
        latitude: 39.9042,
        longitude: 116.4074,
      });

      const usGeo = await UserGeo.create({
        ipAddress: '192.168.1.300',
        country: '美国',
        region: 'California',
        city: 'San Francisco',
        latitude: 37.7749,
        longitude: -122.4194,
      });

      const sessions = [
        {
          sessionId: 'china-session',
          userId: 1,
          agentId: 1,
          messageType: 'text',
          messageCount: 10,
          startTime: new Date(),
          isCompleted: true,
          geoLocationId: chinaGeo.id,
        },
        {
          sessionId: 'us-session',
          userId: 2,
          agentId: 1,
          messageType: 'text',
          messageCount: 5,
          startTime: new Date(),
          isCompleted: true,
          geoLocationId: usGeo.id,
        },
      ];

      await AgentUsage.bulkCreate(sessions);

      const params = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
        country: '中国',
      };

      const heatmapData = await heatmapService.getHeatmapData(params);

      expect(heatmapData.locations).toHaveLength(1);
      expect(heatmapData.locations[0].country).toBe('中国');
      expect(heatmapData.locations[0].count).toBe(1);
    });
  });

  describe('Data Aggregation and Statistics', () => {
    it('should calculate summary statistics correctly', async () => {
      const baseDate = new Date();
      const sessions = [
        {
          sessionId: 'session-1',
          userId: 1,
          agentId: 1,
          messageType: 'text',
          messageCount: 10,
          tokenUsage: 2000,
          responseTime: 300,
          duration: 30,
          startTime: new Date(baseDate.getTime() - 1 * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
        {
          sessionId: 'session-2',
          userId: 2,
          agentId: 1,
          messageType: 'image',
          messageCount: 5,
          tokenUsage: 1500,
          responseTime: 400,
          duration: 45,
          startTime: new Date(baseDate.getTime() - 1 * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
        {
          sessionId: 'session-3',
          userId: 1,
          agentId: 2,
          messageType: 'file',
          messageCount: 3,
          tokenUsage: 800,
          responseTime: 200,
          duration: 20,
          startTime: new Date(baseDate.getTime() - 1 * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
      ];

      await AgentUsage.bulkCreate(sessions);

      const params = {
        startDate: new Date(baseDate.getTime() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
      };

      const heatmapData = await heatmapService.getHeatmapData(params);

      expect(heatmapData.summary).toBeDefined();
      expect(heatmapData.summary.totalSessions).toBe(3);
      expect(heatmapData.summary.totalUsers).toBe(2);
      expect(heatmapData.summary.totalMessages).toBe(18);
      expect(heatmapData.summary.totalTokens).toBe(4300);
      expect(heatmapData.summary.averageResponseTime).toBeCloseTo(300, 0);
      expect(heatmapData.summary.averageSessionDuration).toBeCloseTo(31.67, 1);
    });

    it('should handle different time granularities', async () => {
      const baseDate = new Date();
      baseDate.setHours(0, 0, 0, 0);

      const sessions = [];
      for (let i = 0; i < 24; i++) {
        sessions.push({
          sessionId: `hourly-session-${i}`,
          userId: 1,
          agentId: 1,
          messageType: 'text',
          messageCount: Math.floor(Math.random() * 10) + 1,
          startTime: new Date(baseDate.getTime() + i * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        });
      }

      await AgentUsage.bulkCreate(sessions);

      // Test hourly granularity
      const hourlyParams = {
        startDate: baseDate,
        endDate: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000),
        granularity: 'hour',
      };

      const hourlyData = await heatmapService.getHeatmapData(hourlyParams);
      expect(hourlyData.timeSeries).toHaveLength(24);

      // Test daily granularity
      const dailyParams = {
        startDate: baseDate,
        endDate: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000),
        granularity: 'day',
      };

      const dailyData = await heatmapService.getHeatmapData(dailyParams);
      expect(dailyData.timeSeries).toHaveLength(1);
    });

    it('should calculate intensity metrics', async () => {
      const baseDate = new Date();
      const sessions = [
        {
          sessionId: 'high-intensity-session',
          userId: 1,
          agentId: 1,
          messageType: 'text',
          messageCount: 20,
          tokenUsage: 5000,
          responseTime: 100,
          duration: 60,
          startTime: new Date(baseDate.getTime() - 1 * 60 * 60 * 1000),
          isCompleted: true,
          userSatisfaction: 'positive',
          geoLocationId: testUserGeo.id,
        },
        {
          sessionId: 'low-intensity-session',
          userId: 2,
          agentId: 1,
          messageType: 'text',
          messageCount: 2,
          tokenUsage: 100,
          responseTime: 800,
          duration: 10,
          startTime: new Date(baseDate.getTime() - 1 * 60 * 60 * 1000),
          isCompleted: true,
          userSatisfaction: 'negative',
          geoLocationId: testUserGeo.id,
        },
      ];

      await AgentUsage.bulkCreate(sessions);

      const params = {
        startDate: new Date(baseDate.getTime() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
      };

      const heatmapData = await heatmapService.getHeatmapData(params);

      expect(heatmapData.locations).toHaveLength(1);
      expect(heatmapData.locations[0].intensity).toBeDefined();
      expect(heatmapData.locations[0].intensity).toBeGreaterThan(0);
      expect(heatmapData.locations[0].intensity).toBeLessThanOrEqual(1);
    });

    it('should group by multiple dimensions', async () => {
      const baseDate = new Date();
      const sessions = [
        {
          sessionId: 'text-user1',
          userId: 1,
          agentId: 1,
          messageType: 'text',
          messageCount: 10,
          startTime: new Date(baseDate.getTime() - 1 * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
        {
          sessionId: 'image-user1',
          userId: 1,
          agentId: 1,
          messageType: 'image',
          messageCount: 5,
          startTime: new Date(baseDate.getTime() - 1 * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
        {
          sessionId: 'text-user2',
          userId: 2,
          agentId: 1,
          messageType: 'text',
          messageCount: 8,
          startTime: new Date(baseDate.getTime() - 1 * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
      ];

      await AgentUsage.bulkCreate(sessions);

      const params = {
        startDate: new Date(baseDate.getTime() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
        groupBy: ['messageType', 'userId'],
      };

      const heatmapData = await heatmapService.getHeatmapData(params);

      expect(heatmapData.groupedData).toBeDefined();
      expect(heatmapData.groupedData.length).toBeGreaterThan(0);
    });
  });

  describe('Caching Mechanism', () => {
    it('should cache heatmap data', async () => {
      const baseDate = new Date();
      const sessions = [
        {
          sessionId: 'cached-session',
          userId: 1,
          agentId: 1,
          messageType: 'text',
          messageCount: 10,
          startTime: new Date(baseDate.getTime() - 1 * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
      ];

      await AgentUsage.bulkCreate(sessions);

      const params = {
        startDate: new Date(baseDate.getTime() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
      };

      // First call - should generate and cache
      const result1 = await heatmapService.getHeatmapData(params);

      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('heatmap:'),
        expect.any(String),
        expect.any(Number)
      );

      // Second call - should use cache
      mockRedis.get.mockResolvedValue(JSON.stringify(result1));
      const result2 = await heatmapService.getHeatmapData(params);

      expect(result2).toEqual(result1);
    });

    it('should handle cache invalidation', async () => {
      const params = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
      };

      await heatmapService.invalidateCache(params);

      expect(mockRedis.del).toHaveBeenCalledWith(
        expect.stringContaining('heatmap:')
      );
    });

    it('should respect cache TTL', async () => {
      const params = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
        cacheTTL: 1800, // 30 minutes
      };

      await heatmapService.getHeatmapData(params);

      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        1800
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid date ranges', async () => {
      const params = {
        startDate: new Date(),
        endDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // End date before start date
      };

      await expect(heatmapService.getHeatmapData(params)).rejects.toThrow(
        'Invalid date range'
      );
    });

    it('should handle database errors gracefully', async () => {
      jest.spyOn(AgentUsage, 'findAll').mockRejectedValue(
        new Error('Database connection failed')
      );

      const params = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
      };

      await expect(heatmapService.getHeatmapData(params)).rejects.toThrow(
        'Failed to generate heatmap data'
      );

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to generate heatmap data')
      );
    });

    it('should handle missing geo location data', async () => {
      await AgentUsage.create({
        sessionId: 'no-geo-session',
        userId: 1,
        agentId: 1,
        messageType: 'text',
        messageCount: 10,
        startTime: new Date(),
        isCompleted: true,
        // No geoLocationId
      });

      const params = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
      };

      const heatmapData = await heatmapService.getHeatmapData(params);

      expect(heatmapData.locations).toHaveLength(0);
      expect(heatmapData.summary.totalSessions).toBe(0);
    });

    it('should handle invalid filter parameters', async () => {
      const params = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
        agentType: 'invalid-agent-type',
      };

      await expect(heatmapService.getHeatmapData(params)).rejects.toThrow(
        'Invalid agent type'
      );
    });
  });

  describe('Performance Optimization', () => {
    it('should handle large datasets efficiently', async () => {
      // Create large dataset
      const bulkData = [];
      for (let i = 0; i < 1000; i++) {
        bulkData.push({
          sessionId: `perf-session-${i}`,
          userId: (i % 50) + 1,
          agentId: 1,
          messageType: ['text', 'image', 'file'][Math.floor(Math.random() * 3)],
          messageCount: Math.floor(Math.random() * 20) + 1,
          tokenUsage: Math.floor(Math.random() * 5000) + 100,
          startTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        });
      }

      await AgentUsage.bulkCreate(bulkData);

      const params = {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      };

      const startTime = Date.now();
      const heatmapData = await heatmapService.getHeatmapData(params);
      const endTime = Date.now();

      expect(heatmapData.locations).toHaveLength(1);
      expect(heatmapData.summary.totalSessions).toBe(1000);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should implement data pagination', async () => {
      const baseDate = new Date();
      const sessions = [];
      for (let i = 0; i < 100; i++) {
        sessions.push({
          sessionId: `page-session-${i}`,
          userId: 1,
          agentId: 1,
          messageType: 'text',
          messageCount: 1,
          startTime: new Date(baseDate.getTime() - i * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        });
      }

      await AgentUsage.bulkCreate(sessions);

      const params = {
        startDate: new Date(baseDate.getTime() - 100 * 60 * 60 * 1000),
        endDate: new Date(),
        limit: 10,
        page: 1,
      };

      const heatmapData = await heatmapService.getHeatmapData(params);

      expect(heatmapData.pagination).toBeDefined();
      expect(heatmapData.pagination.currentPage).toBe(1);
      expect(heatmapData.pagination.totalPages).toBe(10);
      expect(heatmapData.pagination.totalItems).toBe(100);
    });

    it('should implement query optimization', async () => {
      const params = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
        optimizeQuery: true,
      };

      const heatmapData = await heatmapService.getHeatmapData(params);

      expect(heatmapData.queryOptimization).toBeDefined();
      expect(heatmapData.queryOptimization.indexesUsed).toBeDefined();
      expect(heatmapData.queryOptimization.executionTime).toBeDefined();
    });
  });

  describe('Data Export and Formatting', () => {
    it('should export data as CSV', async () => {
      const baseDate = new Date();
      const sessions = [
        {
          sessionId: 'export-session-1',
          userId: 1,
          agentId: 1,
          messageType: 'text',
          messageCount: 10,
          startTime: new Date(baseDate.getTime() - 1 * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
      ];

      await AgentUsage.bulkCreate(sessions);

      const params = {
        startDate: new Date(baseDate.getTime() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
      };

      const csvData = await heatmapService.exportData(params, 'csv');

      expect(csvData).toBeDefined();
      expect(typeof csvData).toBe('string');
      expect(csvData).toContain('Country,City,Latitude,Longitude,Count');
      expect(csvData).toContain('中国,深圳市,22.5431,114.0579,1');
    });

    it('should export data as JSON', async () => {
      const baseDate = new Date();
      const sessions = [
        {
          sessionId: 'export-session-2',
          userId: 1,
          agentId: 1,
          messageType: 'text',
          messageCount: 10,
          startTime: new Date(baseDate.getTime() - 1 * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
      ];

      await AgentUsage.bulkCreate(sessions);

      const params = {
        startDate: new Date(baseDate.getTime() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
      };

      const jsonData = await heatmapService.exportData(params, 'json');

      expect(jsonData).toBeDefined();
      expect(typeof jsonData).toBe('string');
      const parsed = JSON.parse(jsonData);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(1);
    });

    it('should handle invalid export format', async () => {
      const params = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
      };

      await expect(heatmapService.exportData(params, 'invalid')).rejects.toThrow(
        'Invalid export format'
      );
    });
  });
});