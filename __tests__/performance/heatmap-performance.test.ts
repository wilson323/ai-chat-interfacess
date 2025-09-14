import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { AgentUsage } from '@/lib/db/models/agent-usage';
import { UserGeo } from '@/lib/db/models/user-geo';
import { HeatmapService } from '@/lib/services/heatmap';
import { GeoLocationService } from '@/lib/services/geo-location';
import sequelize from '@/lib/db/sequelize';

describe('Heatmap Performance and Boundary Tests', () => {
  let testUserGeo: UserGeo;
  let heatmapService: HeatmapService;
  let geoLocationService: GeoLocationService;

  beforeEach(async () => {
    heatmapService = new HeatmapService();
    geoLocationService = new GeoLocationService();

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

  describe('Large Dataset Processing', () => {
    it('should handle 10,000 sessions efficiently', async () => {
      const sessionCount = 10000;
      const userCount = 1000;
      const bulkData = [];

      // Generate test data
      for (let i = 0; i < sessionCount; i++) {
        bulkData.push({
          sessionId: `large-session-${i}`,
          userId: (i % userCount) + 1,
          agentId: (i % 5) + 1,
          messageType: ['text', 'image', 'file', 'voice'][Math.floor(Math.random() * 4)],
          messageCount: Math.floor(Math.random() * 20) + 1,
          tokenUsage: Math.floor(Math.random() * 5000) + 100,
          responseTime: Math.floor(Math.random() * 1000) + 100,
          startTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          isCompleted: Math.random() > 0.1,
          userSatisfaction: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)],
          geoLocationId: testUserGeo.id,
        });
      }

      // Test bulk insert performance
      const insertStartTime = Date.now();
      await AgentUsage.bulkCreate(bulkData);
      const insertEndTime = Date.now();

      console.log(`Bulk insert of ${sessionCount} sessions took ${insertEndTime - insertStartTime}ms`);
      expect(insertEndTime - insertStartTime).toBeLessThan(30000); // Should complete within 30 seconds

      // Test query performance
      const queryStartTime = Date.now();
      const heatmapData = await heatmapService.getHeatmapData({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      });
      const queryEndTime = Date.now();

      console.log(`Query of ${sessionCount} sessions took ${queryEndTime - queryStartTime}ms`);
      expect(queryEndTime - queryStartTime).toBeLessThan(10000); // Should complete within 10 seconds

      // Verify data integrity
      expect(heatmapData.summary.totalSessions).toBe(sessionCount);
      expect(heatmapData.summary.totalUsers).toBe(userCount);
    });

    it('should handle 100,000 sessions with pagination', async () => {
      const sessionCount = 100000;
      const userCount = 10000;
      const pageSize = 1000;
      const pageCount = sessionCount / pageSize;

      // Insert data in batches to avoid memory issues
      for (let page = 0; page < pageCount; page++) {
        const bulkData = [];
        for (let i = 0; i < pageSize; i++) {
          const sessionId = `huge-session-${page * pageSize + i}`;
          bulkData.push({
            sessionId,
            userId: ((page * pageSize + i) % userCount) + 1,
            agentId: ((page * pageSize + i) % 10) + 1,
            messageType: ['text', 'image', 'file', 'voice'][Math.floor(Math.random() * 4)],
            messageCount: Math.floor(Math.random() * 15) + 1,
            tokenUsage: Math.floor(Math.random() * 3000) + 100,
            responseTime: Math.floor(Math.random() * 800) + 100,
            startTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            isCompleted: Math.random() > 0.05,
            userSatisfaction: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)],
            geoLocationId: testUserGeo.id,
          });
        }

        const startTime = Date.now();
        await AgentUsage.bulkCreate(bulkData);
        const endTime = Date.now();

        console.log(`Batch ${page + 1}/${pageCount} inserted in ${endTime - startTime}ms`);
        expect(endTime - startTime).toBeLessThan(5000); // Each batch should complete within 5 seconds

        // Force garbage collection
        if (global.gc) {
          global.gc();
        }
      }

      // Test paginated queries
      for (let page = 0; page < 10; page++) { // Test first 10 pages
        const startTime = Date.now();
        const pageData = await heatmapService.getHeatmapData({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
          limit: pageSize,
          page: page + 1,
        });
        const endTime = Date.now();

        console.log(`Page ${page + 1} query took ${endTime - startTime}ms`);
        expect(endTime - startTime).toBeLessThan(2000); // Each page should complete within 2 seconds
        expect(pageData.locations.length).toBeLessThanOrEqual(pageSize);
      }

      // Verify total count
      const totalCount = await AgentUsage.count();
      expect(totalCount).toBe(sessionCount);
    });

    it('should handle geographic data with 1000 locations', async () => {
      const locationCount = 1000;
      const sessionsPerLocation = 10;

      // Create multiple geo locations
      const geoLocations = [];
      for (let i = 0; i < locationCount; i++) {
        geoLocations.push({
          ipAddress: `192.168.1.${i + 100}`,
          country: `Country${i}`,
          region: `Region${i}`,
          city: `City${i}`,
          latitude: (Math.random() * 180 - 90).toFixed(6),
          longitude: (Math.random() * 360 - 180).toFixed(6),
        });
      }

      await UserGeo.bulkCreate(geoLocations);

      // Create sessions for each location
      const sessionData = [];
      for (let i = 0; i < locationCount; i++) {
        for (let j = 0; j < sessionsPerLocation; j++) {
          sessionData.push({
            sessionId: `geo-session-${i}-${j}`,
            userId: (i * sessionsPerLocation + j) % 500 + 1,
            agentId: (i % 10) + 1,
            messageType: 'text',
            messageCount: Math.floor(Math.random() * 10) + 1,
            startTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            isCompleted: true,
            geoLocationId: i + 1, // Geo location IDs start from 1
          });
        }
      }

      await AgentUsage.bulkCreate(sessionData);

      // Test geographic query performance
      const startTime = Date.now();
      const heatmapData = await heatmapService.getHeatmapData({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      });
      const endTime = Date.now();

      console.log(`Geographic query with ${locationCount} locations took ${endTime - startTime}ms`);
      expect(endTime - startTime).toBeLessThan(15000); // Should complete within 15 seconds
      expect(heatmapData.locations.length).toBe(locationCount);
    });
  });

  describe('Invalid Data Processing', () => {
    it('should handle sessions with negative message counts', async () => {
      const invalidSessions = [
        {
          sessionId: 'invalid-session-1',
          userId: 1,
          agentId: 1,
          messageType: 'text',
          messageCount: -5, // Invalid negative count
          startTime: new Date(),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
        {
          sessionId: 'invalid-session-2',
          userId: 2,
          agentId: 1,
          messageType: 'text',
          messageCount: 10,
          startTime: new Date(),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
      ];

      await AgentUsage.bulkCreate(invalidSessions);

      const heatmapData = await heatmapService.getHeatmapData({
        startDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
        endDate: new Date(),
      });

      // Should handle invalid data gracefully
      expect(heatmapData).toBeDefined();
      expect(heatmapData.summary.totalMessages).toBe(10); // Only valid session counted
    });

    it('should handle sessions with future timestamps', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      const sessions = [
        {
          sessionId: 'future-session-1',
          userId: 1,
          agentId: 1,
          messageType: 'text',
          messageCount: 5,
          startTime: futureDate,
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
        {
          sessionId: 'past-session-1',
          userId: 2,
          agentId: 1,
          messageType: 'text',
          messageCount: 8,
          startTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
      ];

      await AgentUsage.bulkCreate(sessions);

      // Query should only return past sessions
      const heatmapData = await heatmapService.getHeatmapData({
        startDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        endDate: new Date(),
      });

      expect(heatmapData.summary.totalSessions).toBe(1);
      expect(heatmapData.summary.totalMessages).toBe(8);
    });

    it('should handle sessions with extremely large values', async () => {
      const extremeSessions = [
        {
          sessionId: 'extreme-session-1',
          userId: 1,
          agentId: 1,
          messageType: 'text',
          messageCount: 999999, // Very large message count
          tokenUsage: 999999999, // Very large token usage
          responseTime: 999999, // Very large response time
          duration: 999999, // Very large duration
          startTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
        {
          sessionId: 'extreme-session-2',
          userId: 2,
          agentId: 1,
          messageType: 'text',
          messageCount: 0, // Zero message count
          tokenUsage: 0, // Zero token usage
          responseTime: 0, // Zero response time
          duration: 0, // Zero duration
          startTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
      ];

      await AgentUsage.bulkCreate(extremeSessions);

      const heatmapData = await heatmapService.getHeatmapData({
        startDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        endDate: new Date(),
      });

      // Should handle extreme values without crashing
      expect(heatmapData).toBeDefined();
      expect(heatmapData.summary.totalSessions).toBe(2);
    });

    it('should handle sessions with missing required fields', async () => {
      // This test would require creating sessions with null/undefined values
      // In a real scenario, the database constraints would prevent this
      // Here we test the service's ability to handle such cases gracefully

      const partialSessions = [
        {
          sessionId: 'partial-session-1',
          userId: 1,
          agentId: 1,
          messageType: 'text',
          messageCount: 5,
          startTime: new Date(),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
        {
          sessionId: 'partial-session-2',
          userId: 2,
          agentId: 1,
          messageType: 'text',
          messageCount: 8,
          startTime: new Date(),
          isCompleted: true,
          // Missing geoLocationId
        },
      ];

      await AgentUsage.bulkCreate(partialSessions);

      const heatmapData = await heatmapService.getHeatmapData({
        startDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
        endDate: new Date(),
      });

      // Should handle missing fields gracefully
      expect(heatmapData).toBeDefined();
      expect(heatmapData.summary.totalSessions).toBe(1); // Only session with geo data
    });
  });

  describe('Concurrent Access Tests', () => {
    it('should handle 100 concurrent read operations', async () => {
      // Create test data
      const testData = [];
      for (let i = 0; i < 100; i++) {
        testData.push({
          sessionId: `concurrent-read-session-${i}`,
          userId: (i % 20) + 1,
          agentId: 1,
          messageType: 'text',
          messageCount: Math.floor(Math.random() * 10) + 1,
          startTime: new Date(Date.now() - Math.random() * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        });
      }

      await AgentUsage.bulkCreate(testData);

      // Perform concurrent reads
      const readOperations = [];
      for (let i = 0; i < 100; i++) {
        readOperations.push(heatmapService.getHeatmapData({
          startDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
          endDate: new Date(),
        }));
      }

      const startTime = Date.now();
      const results = await Promise.all(readOperations);
      const endTime = Date.now();

      console.log(`100 concurrent reads completed in ${endTime - startTime}ms`);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds

      // Verify all operations returned consistent results
      results.forEach((result, index) => {
        expect(result).toBeDefined();
        expect(result.summary.totalSessions).toBe(100);
      });
    });

    it('should handle 50 concurrent write operations', async () => {
      const writeOperations = [];

      for (let i = 0; i < 50; i++) {
        writeOperations.push(async () => {
          const sessionId = `concurrent-write-session-${i}`;
          const session = await AgentUsage.startSession(
            sessionId,
            100 + i,
            1,
            'text',
            testUserGeo.id
          );

          await AgentUsage.updateMessageCount(sessionId, Math.floor(Math.random() * 10) + 1);
          await AgentUsage.updateResponseTime(sessionId, Math.floor(Math.random() * 500) + 100);

          await AgentUsage.endSession(sessionId);
        });
      }

      const startTime = Date.now();
      await Promise.all(writeOperations);
      const endTime = Date.now();

      console.log(`50 concurrent writes completed in ${endTime - startTime}ms`);
      expect(endTime - startTime).toBeLessThan(15000); // Should complete within 15 seconds

      // Verify all sessions were created
      const totalCount = await AgentUsage.count({
        where: {
          sessionId: {
            [sequelize.Op.like]: 'concurrent-write-session-%',
          },
        },
      });

      expect(totalCount).toBe(50);
    });

    it('should handle mixed read-write operations', async () => {
      const operations = [];
      const operationCount = 100;

      for (let i = 0; i < operationCount; i++) {
        if (i % 3 === 0) {
          // Read operation
          operations.push(heatmapService.getHeatmapData({
            startDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
            endDate: new Date(),
          }));
        } else {
          // Write operation
          operations.push(async () => {
            const sessionId = `mixed-session-${i}`;
            const session = await AgentUsage.startSession(
              sessionId,
              200 + i,
              1,
              'text',
              testUserGeo.id
            );

            await AgentUsage.updateMessageCount(sessionId, Math.floor(Math.random() * 10) + 1);
            await AgentUsage.endSession(sessionId);
          });
        }
      }

      const startTime = Date.now();
      await Promise.all(operations);
      const endTime = Date.now();

      console.log(`Mixed operations completed in ${endTime - startTime}ms`);
      expect(endTime - startTime).toBeLessThan(20000); // Should complete within 20 seconds

      // Verify data integrity
      const finalCount = await AgentUsage.count({
        where: {
          sessionId: {
            [sequelize.Op.like]: 'mixed-session-%',
          },
        },
      });

      expect(finalCount).toBe(Math.floor(operationCount * 2 / 3)); // 2/3 are write operations
    });
  });

  describe('Network Exception Handling', () => {
    it('should handle timeout during IP resolution', async () => {
      // Mock timeout
      jest.spyOn(geoLocationService as any, 'fetchGeoData').mockImplementation(() =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 100);
        })
      );

      const startTime = Date.now();
      await expect(geoLocationService.resolveIP('192.168.1.200')).rejects.toThrow('Request timeout');
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // Should timeout quickly
    });

    it('should handle rate limiting', async () => {
      let callCount = 0;
      jest.spyOn(geoLocationService as any, 'fetchGeoData').mockImplementation(() => {
        callCount++;
        if (callCount > 5) {
          return Promise.reject(new Error('Rate limit exceeded'));
        }
        return Promise.resolve({
          ipAddress: '192.168.1.200',
          country: '中国',
          region: '广东省',
          city: '深圳市',
        });
      });

      // Make multiple rapid requests
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(geoLocationService.resolveIP('192.168.1.200'));
      }

      const results = await Promise.allSettled(requests);

      // Some should succeed, some should fail due to rate limiting
      const successes = results.filter(r => r.status === 'fulfilled').length;
      const failures = results.filter(r => r.status === 'rejected').length;

      expect(successes).toBeGreaterThan(0);
      expect(failures).toBeGreaterThan(0);
    });

    it('should handle network disconnection', async () => {
      // Simulate network disconnection
      jest.spyOn(geoLocationService as any, 'fetchGeoData').mockRejectedValue(
        new Error('Network disconnected')
      );

      await expect(geoLocationService.resolveIP('192.168.1.200')).rejects.toThrow(
        'Network disconnected'
      );

      // Service should recover on subsequent calls
      jest.spyOn(geoLocationService as any, 'fetchGeoData').mockResolvedValue({
        ipAddress: '192.168.1.200',
        country: '中国',
        region: '广东省',
        city: '深圳市',
      });

      const result = await geoLocationService.resolveIP('192.168.1.200');
      expect(result).toBeDefined();
    });
  });

  describe('Memory and Resource Management', () => {
    it('should manage memory efficiently with large result sets', async () => {
      const sessionCount = 5000;
      const bulkData = [];

      for (let i = 0; i < sessionCount; i++) {
        bulkData.push({
          sessionId: `memory-test-session-${i}`,
          userId: (i % 100) + 1,
          agentId: (i % 5) + 1,
          messageType: 'text',
          messageCount: Math.floor(Math.random() * 15) + 1,
          startTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        });
      }

      await AgentUsage.bulkCreate(bulkData);

      const initialMemory = process.memoryUsage().heapUsed;

      // Process large result set
      const heatmapData = await heatmapService.getHeatmapData({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      });

      const peakMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = peakMemory - initialMemory;

      console.log(`Memory increase for ${sessionCount} sessions: ${memoryIncrease / 1024 / 1024}MB`);
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB increase

      // Force garbage collection and check memory cleanup
      if (global.gc) {
        global.gc();
      }

      const cleanedMemory = process.memoryUsage().heapUsed;
      const memoryAfterCleanup = cleanedMemory - initialMemory;

      expect(memoryAfterCleanup).toBeLessThan(50 * 1024 * 1024); // Less than 50MB after cleanup
    });

    it('should handle file descriptor limits', async () => {
      // This test simulates handling many concurrent database connections
      const connectionCount = 50;
      const operations = [];

      for (let i = 0; i < connectionCount; i++) {
        operations.push(async () => {
          const sessionId = `fd-test-session-${i}`;
          const session = await AgentUsage.startSession(
            sessionId,
            300 + i,
            1,
            'text',
            testUserGeo.id
          );

          await new Promise(resolve => setTimeout(resolve, 100));
          await AgentUsage.endSession(sessionId);
        });
      }

      const startTime = Date.now();
      await Promise.all(operations);
      const endTime = Date.now();

      console.log(`File descriptor test with ${connectionCount} connections took ${endTime - startTime}ms`);
      expect(endTime - startTime).toBeLessThan(30000); // Should complete within 30 seconds
    });

    it('should handle CPU-intensive operations gracefully', async () => {
      // Create complex data that requires heavy computation
      const complexData = [];
      for (let i = 0; i < 1000; i++) {
        complexData.push({
          sessionId: `cpu-test-session-${i}`,
          userId: (i % 50) + 1,
          agentId: (i % 10) + 1,
          messageType: ['text', 'image', 'file', 'voice'][Math.floor(Math.random() * 4)],
          messageCount: Math.floor(Math.random() * 100) + 1,
          tokenUsage: Math.floor(Math.random() * 10000) + 100,
          responseTime: Math.floor(Math.random() * 2000) + 100,
          startTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          isCompleted: true,
          userSatisfaction: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)],
          geoLocationId: testUserGeo.id,
        });
      }

      await AgentUsage.bulkCreate(complexData);

      // Perform complex analytics operations
      const startTime = Date.now();
      const analyticsData = await heatmapService.getHeatmapData({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        groupBy: ['messageType', 'userId'],
        includeTrends: true,
        includePredictions: true,
      });
      const endTime = Date.now();

      console.log(`CPU-intensive analytics took ${endTime - startTime}ms`);
      expect(endTime - startTime).toBeLessThan(15000); // Should complete within 15 seconds

      expect(analyticsData.groupedData).toBeDefined();
      expect(analyticsData.trends).toBeDefined();
      expect(analyticsData.predictions).toBeDefined();
    });
  });

  describe('Edge Case Scenarios', () => {
    it('should handle empty date ranges', async () => {
      const sameDate = new Date();
      const heatmapData = await heatmapService.getHeatmapData({
        startDate: sameDate,
        endDate: sameDate,
      });

      expect(heatmapData).toBeDefined();
      expect(heatmapData.summary.totalSessions).toBe(0);
    });

    it('should handle very large date ranges', async () => {
      const startDate = new Date(2000, 0, 1); // Year 2000
      const endDate = new Date(); // Current date

      const startTime = Date.now();
      const heatmapData = await heatmapService.getHeatmapData({
        startDate,
        endDate,
      });
      const endTime = Date.now();

      console.log(`Large date range query took ${endTime - startTime}ms`);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
      expect(heatmapData).toBeDefined();
    });

    it('should handle sessions with identical timestamps', async () => {
      const sameTime = new Date();
      const sessions = [
        {
          sessionId: 'same-time-session-1',
          userId: 1,
          agentId: 1,
          messageType: 'text',
          messageCount: 5,
          startTime: sameTime,
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
        {
          sessionId: 'same-time-session-2',
          userId: 2,
          agentId: 1,
          messageType: 'text',
          messageCount: 8,
          startTime: sameTime,
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
      ];

      await AgentUsage.bulkCreate(sessions);

      const heatmapData = await heatmapService.getHeatmapData({
        startDate: new Date(sameTime.getTime() - 1000),
        endDate: new Date(sameTime.getTime() + 1000),
      });

      expect(heatmapData.summary.totalSessions).toBe(2);
      expect(heatmapData.timeSeries).toBeDefined();
    });

    it('should handle Unicode and special characters in location names', async () => {
      const specialGeoData = {
        ipAddress: '192.168.1.300',
        country: '🇨🇳 中国',
        region: '广东省 广深',
        city: '深圳市 🏙️',
        latitude: 22.5431,
        longitude: 114.0579,
      };

      const userGeo = await UserGeo.create(specialGeoData);

      const session = await AgentUsage.create({
        sessionId: 'unicode-session-1',
        userId: 1,
        agentId: 1,
        messageType: 'text',
        messageCount: 5,
        startTime: new Date(),
        isCompleted: true,
        geoLocationId: userGeo.id,
      });

      const heatmapData = await heatmapService.getHeatmapData({
        startDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
        endDate: new Date(),
      });

      expect(heatmapData.locations).toHaveLength(1);
      expect(heatmapData.locations[0].country).toBe('🇨🇳 中国');
      expect(heatmapData.locations[0].city).toBe('深圳市 🏙️');
    });
  });
});