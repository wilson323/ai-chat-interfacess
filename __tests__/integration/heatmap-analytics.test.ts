import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { createServer } from 'http';
import { apiResolver } from 'next/dist/server/api-utils/node';
import { NextApiRequest, NextApiResponse } from 'next';
import { AgentUsage } from '@/lib/db/models/agent-usage';
import { UserGeo } from '@/lib/db/models/user-geo';
import { GeoLocationService } from '@/lib/services/geo-location';
import { HeatmapService } from '@/lib/services/heatmap';
import sequelize from '@/lib/db/sequelize';

describe('Heatmap and Analytics Integration Tests', () => {
  let testUserGeo: UserGeo;
  let geoLocationService: GeoLocationService;
  let heatmapService: HeatmapService;

  beforeEach(async () => {
    // Initialize services
    geoLocationService = new GeoLocationService();
    heatmapService = new HeatmapService();

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

    // Create comprehensive test data
    const baseDate = new Date();
    const testData = [
      {
        sessionId: 'integration-session-1',
        userId: 1,
        agentId: 1,
        messageType: 'text' as const,
        messageCount: 15,
        tokenUsage: 3000,
        responseTime: 250,
        startTime: new Date(baseDate.getTime() - 4 * 60 * 60 * 1000),
        endTime: new Date(baseDate.getTime() - 4 * 60 * 60 * 1000 + 45000),
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
        sessionId: 'integration-session-2',
        userId: 2,
        agentId: 2,
        messageType: 'image' as const,
        messageCount: 8,
        tokenUsage: 2500,
        responseTime: 500,
        startTime: new Date(baseDate.getTime() - 3 * 60 * 60 * 1000),
        endTime: new Date(baseDate.getTime() - 3 * 60 * 60 * 1000 + 60000),
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
        sessionId: 'integration-session-3',
        userId: 1,
        agentId: 1,
        messageType: 'file' as const,
        messageCount: 3,
        tokenUsage: 800,
        responseTime: 150,
        startTime: new Date(baseDate.getTime() - 2 * 60 * 60 * 1000),
        endTime: new Date(baseDate.getTime() - 2 * 60 * 60 * 1000 + 20000),
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
        sessionId: 'integration-session-4',
        userId: 3,
        agentId: 3,
        messageType: 'voice' as const,
        messageCount: 12,
        tokenUsage: 1800,
        responseTime: 300,
        startTime: new Date(baseDate.getTime() - 1 * 60 * 60 * 1000),
        endTime: new Date(baseDate.getTime() - 1 * 60 * 60 * 1000 + 35000),
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

    await AgentUsage.bulkCreate(testData);
  });

  afterEach(async () => {
    // Clean up test data
    await AgentUsage.destroy({ where: {} });
    await UserGeo.destroy({ where: {} });
  });

  describe('End-to-End User Session Tracking', () => {
    it('should track complete user session lifecycle', async () => {
      // Simulate user session start
      const sessionId = 'e2e-session-tracking';
      const userId = 4;
      const agentId = 1;
      const ipAddress = '192.168.1.200';

      // Resolve IP address
      const geoData = await geoLocationService.resolveIP(ipAddress);
      expect(geoData).toBeDefined();

      // Create user geo record
      const userGeo = await geoLocationService.createOrUpdateUserGeo(geoData);
      expect(userGeo).toBeDefined();

      // Start session
      const session = await AgentUsage.startSession(
        sessionId,
        userId,
        agentId,
        'text',
        userGeo.id,
        {
          browser: 'Chrome',
          os: 'Windows 10',
          deviceType: 'desktop',
        }
      );

      expect(session.sessionId).toBe(sessionId);
      expect(session.userId).toBe(userId);
      expect(session.agentId).toBe(agentId);
      expect(session.isCompleted).toBe(false);

      // Simulate message exchanges
      await AgentUsage.updateMessageCount(sessionId, 5);
      await AgentUsage.updateResponseTime(sessionId, 200);

      // End session
      const endedSession = await AgentUsage.endSession(
        sessionId,
        1500,
        'positive'
      );

      expect(endedSession).toBeTruthy();
      expect(endedSession!.isCompleted).toBe(true);
      expect(endedSession!.tokenUsage).toBe(1500);
      expect(endedSession!.userSatisfaction).toBe('positive');
      expect(endedSession!.duration).toBeGreaterThan(0);

      // Verify session data integrity
      const savedSession = await AgentUsage.findOne({
        where: { sessionId },
        include: ['geoLocation', 'agent'],
      });

      expect(savedSession).toBeTruthy();
      expect(savedSession!.geoLocation).toBeDefined();
      expect(savedSession!.geoLocation!.ipAddress).toBe(ipAddress);
      expect(savedSession!.messageCount).toBe(5);
      expect(savedSession!.responseTime).toBe(200);
    });

    it('should handle concurrent user sessions', async () => {
      const concurrentSessions = [];
      const userId = 5;

      // Start multiple concurrent sessions
      for (let i = 0; i < 3; i++) {
        const sessionId = `concurrent-session-${i}`;
        const session = await AgentUsage.startSession(
          sessionId,
          userId,
          1,
          'text',
          testUserGeo.id,
          {
            browser: 'Chrome',
            os: 'Windows 10',
            deviceType: 'desktop',
          }
        );
        concurrentSessions.push(session);
      }

      // Verify all sessions are active
      const activeSessions = await AgentUsage.findAll({
        where: {
          userId,
          isCompleted: false,
        },
      });

      expect(activeSessions).toHaveLength(3);

      // End all sessions
      for (const session of concurrentSessions) {
        await AgentUsage.endSession(session.sessionId);
      }

      // Verify all sessions are completed
      const completedSessions = await AgentUsage.findAll({
        where: {
          userId,
          isCompleted: true,
        },
      });

      expect(completedSessions).toHaveLength(3);
    });

    it('should track cross-device user sessions', async () => {
      const userId = 6;
      const devices = [
        { browser: 'Chrome', os: 'Windows 10', deviceType: 'desktop' },
        { browser: 'Safari', os: 'iOS', deviceType: 'mobile' },
        { browser: 'Firefox', os: 'macOS', deviceType: 'desktop' },
      ];

      const userSessions = [];

      // Create sessions for different devices
      for (let i = 0; i < devices.length; i++) {
        const sessionId = `device-session-${i}`;
        const session = await AgentUsage.startSession(
          sessionId,
          userId,
          1,
          'text',
          testUserGeo.id,
          devices[i]
        );
        userSessions.push(session);

        // Update session with some activity
        await AgentUsage.updateMessageCount(sessionId, i + 3);
        await AgentUsage.updateResponseTime(sessionId, 100 + i * 50);

        await AgentUsage.endSession(sessionId);
      }

      // Verify all sessions are tracked
      const allUserSessions = await AgentUsage.findAll({
        where: { userId },
        order: [['startTime', 'ASC']],
      });

      expect(allUserSessions).toHaveLength(3);

      // Verify device information is preserved
      allUserSessions.forEach((session, index) => {
        expect(session.deviceInfo).toEqual(devices[index]);
      });
    });
  });

  describe('FastGPT Data Integration', () => {
    it('should integrate FastGPT agent usage data', async () => {
      // Create FastGPT-specific sessions
      const fastgptSessions = [
        {
          sessionId: 'fastgpt-session-1',
          userId: 7,
          agentId: 1, // Assuming agentId 1 is FastGPT
          messageType: 'text' as const,
          messageCount: 20,
          tokenUsage: 5000,
          responseTime: 180,
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000),
          duration: 30,
          isCompleted: true,
          userSatisfaction: 'positive' as const,
          geoLocationId: testUserGeo.id,
        },
        {
          sessionId: 'fastgpt-session-2',
          userId: 8,
          agentId: 1,
          messageType: 'mixed' as const,
          messageCount: 12,
          tokenUsage: 3500,
          responseTime: 220,
          startTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 1 * 60 * 60 * 1000 + 25000),
          duration: 25,
          isCompleted: true,
          userSatisfaction: 'neutral' as const,
          geoLocationId: testUserGeo.id,
        },
      ];

      await AgentUsage.bulkCreate(fastgptSessions);

      // Query FastGPT specific data
      const params = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
        agentType: 'fastgpt',
      };

      const heatmapData = await heatmapService.getHeatmapData(params);

      expect(heatmapData.locations).toHaveLength(1);
      expect(heatmapData.locations[0].count).toBe(2);
      expect(heatmapData.locations[0].totalMessages).toBe(32);
      expect(heatmapData.locations[0].totalTokens).toBe(8500);
    });

    it('should handle FastGPT API integration', async () => {
      // Mock FastGPT API response
      const mockFastGPTData = {
        conversations: [
          {
            id: 'fastgpt-conversation-1',
            messages: [
              { role: 'user', content: 'Hello', timestamp: new Date() },
              {
                role: 'assistant',
                content: 'Hi there!',
                timestamp: new Date(),
              },
            ],
            metadata: {
              totalTokens: 150,
              responseTime: 120,
              userId: 9,
            },
          },
          {
            id: 'fastgpt-conversation-2',
            messages: [
              { role: 'user', content: 'How are you?', timestamp: new Date() },
              {
                role: 'assistant',
                content: "I'm doing well!",
                timestamp: new Date(),
              },
            ],
            metadata: {
              totalTokens: 180,
              responseTime: 150,
              userId: 10,
            },
          },
        ],
      };

      // This would integrate with actual FastGPT API
      // For testing, we simulate the integration

      // Simulate creating sessions from FastGPT data
      for (const conversation of mockFastGPTData.conversations) {
        await AgentUsage.create({
          sessionId: conversation.id,
          userId: conversation.metadata.userId,
          agentId: 1, // FastGPT agent
          messageType: 'text',
          messageCount: conversation.messages.length,
          tokenUsage: conversation.metadata.totalTokens,
          responseTime: conversation.metadata.responseTime,
          startTime: conversation.messages[0].timestamp,
          endTime:
            conversation.messages[conversation.messages.length - 1].timestamp,
          duration: Math.floor(
            (conversation.messages[
              conversation.messages.length - 1
            ].timestamp.getTime() -
              conversation.messages[0].timestamp.getTime()) /
              1000
          ),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        });
      }

      // Verify integration
      const fastgptSessions = await AgentUsage.findAll({
        where: { agentId: 1 },
        include: ['geoLocation'],
      });

      expect(fastgptSessions).toHaveLength(2);
      expect(fastgptSessions[0].messageCount).toBe(2);
      expect(fastgptSessions[1].messageCount).toBe(2);
    });

    it('should sync FastGPT data with local analytics', async () => {
      // Create FastGPT and custom agent sessions
      const mixedSessions = [
        {
          sessionId: 'mixed-fastgpt-1',
          userId: 11,
          agentId: 1, // FastGPT
          messageType: 'text',
          messageCount: 10,
          tokenUsage: 2000,
          startTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
        {
          sessionId: 'mixed-custom-1',
          userId: 11,
          agentId: 2, // Custom agent
          messageType: 'image',
          messageCount: 5,
          tokenUsage: 1500,
          startTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
      ];

      await AgentUsage.bulkCreate(mixedSessions);

      // Test filtering by agent type
      const fastgptData = await heatmapService.getHeatmapData({
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
        agentType: 'fastgpt',
      });

      const customData = await heatmapService.getHeatmapData({
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
        agentType: 'custom',
      });

      expect(fastgptData.locations[0].count).toBe(1);
      expect(customData.locations[0].count).toBe(1);

      // Test combined analytics
      const allData = await heatmapService.getHeatmapData({
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
      });

      expect(allData.locations[0].count).toBe(2);
    });
  });

  describe('Data Analysis Pipeline', () => {
    it('should process complete analysis workflow', async () => {
      // Create diverse test data
      const analysisData = [];
      const userCount = 20;
      const sessionsPerUser = 3;

      for (let userId = 12; userId < 12 + userCount; userId++) {
        for (
          let sessionIndex = 0;
          sessionIndex < sessionsPerUser;
          sessionIndex++
        ) {
          analysisData.push({
            sessionId: `analysis-session-${userId}-${sessionIndex}`,
            userId,
            agentId: (userId % 3) + 1,
            messageType: ['text', 'image', 'file', 'voice'][
              Math.floor(Math.random() * 4)
            ],
            messageCount: Math.floor(Math.random() * 15) + 1,
            tokenUsage: Math.floor(Math.random() * 3000) + 100,
            responseTime: Math.floor(Math.random() * 500) + 100,
            startTime: new Date(
              Date.now() - Math.random() * 24 * 60 * 60 * 1000
            ),
            isCompleted: Math.random() > 0.1,
            userSatisfaction: ['positive', 'negative', 'neutral'][
              Math.floor(Math.random() * 3)
            ],
            geoLocationId: testUserGeo.id,
          });
        }
      }

      await AgentUsage.bulkCreate(analysisData);

      // Test analysis pipeline
      const params = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
      };

      // 1. Generate heatmap data
      const heatmapData = await heatmapService.getHeatmapData(params);
      expect(heatmapData).toBeDefined();
      expect(heatmapData.locations).toHaveLength(1);
      expect(heatmapData.summary.totalSessions).toBe(
        userCount * sessionsPerUser
      );
      expect(heatmapData.summary.totalUsers).toBe(userCount);

      // 2. Generate statistics
      const stats = await AgentUsage.getUsageStatistics({
        startDate: params.startDate,
        endDate: params.endDate,
        groupBy: 'hour',
      });

      expect(stats).toBeDefined();
      expect(stats.length).toBeGreaterThan(0);

      // 3. Generate top agents
      const topAgents = await AgentUsage.getTopAgents(5, {
        start: params.startDate,
        end: params.endDate,
      });

      expect(topAgents).toBeDefined();
      expect(topAgents.length).toBeLessThanOrEqual(3); // Only 3 agents in test data

      // 4. Generate location stats
      const locationStats = await UserGeo.getLocationStats({
        startDate: params.startDate,
        endDate: params.endDate,
        groupBy: 'city',
      });

      expect(locationStats).toBeDefined();
      expect(locationStats.length).toBeGreaterThan(0);
    });

    it('should handle real-time data processing', async () => {
      // Simulate real-time session creation and processing
      const realTimeSessions = [];
      const sessionCount = 5;

      for (let i = 0; i < sessionCount; i++) {
        const sessionId = `realtime-analysis-${i}`;
        const startTime = new Date(Date.now() - i * 60 * 1000); // Sessions from last 5 minutes

        const session = await AgentUsage.startSession(
          sessionId,
          13 + i,
          1,
          'text',
          testUserGeo.id,
          {
            browser: 'Chrome',
            os: 'Windows 10',
            deviceType: 'desktop',
          }
        );

        // Simulate session activity
        await new Promise(resolve => setTimeout(resolve, 100));
        await AgentUsage.updateMessageCount(
          sessionId,
          Math.floor(Math.random() * 10) + 1
        );
        await AgentUsage.updateResponseTime(
          sessionId,
          Math.floor(Math.random() * 300) + 100
        );

        realTimeSessions.push(session);
      }

      // Process real-time data
      const realTimeParams = {
        startDate: new Date(Date.now() - 10 * 60 * 1000), // Last 10 minutes
        endDate: new Date(),
      };

      const realTimeData = await heatmapService.getHeatmapData(realTimeParams);

      expect(realTimeData).toBeDefined();
      expect(realTimeData.locations[0].count).toBe(sessionCount);
      expect(realTimeData.metadata.dateRange.startDate).toBeDefined();
      expect(realTimeData.metadata.dateRange.endDate).toBeDefined();

      // End all sessions
      for (const session of realTimeSessions) {
        await AgentUsage.endSession(session.sessionId);
      }
    });

    it('should handle data aggregation and rollup', async () => {
      // Create test data spanning multiple time periods
      const rollupData = [];
      const baseDate = new Date();
      baseDate.setHours(0, 0, 0, 0);

      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          const sessionCount = Math.floor(Math.random() * 5) + 1;
          for (let session = 0; session < sessionCount; session++) {
            rollupData.push({
              sessionId: `rollup-session-${day}-${hour}-${session}`,
              userId: 14 + session,
              agentId: (day % 3) + 1,
              messageType: 'text',
              messageCount: Math.floor(Math.random() * 10) + 1,
              tokenUsage: Math.floor(Math.random() * 2000) + 100,
              startTime: new Date(
                baseDate.getTime() +
                  day * 24 * 60 * 60 * 1000 +
                  hour * 60 * 60 * 1000
              ),
              isCompleted: true,
              geoLocationId: testUserGeo.id,
            });
          }
        }
      }

      await AgentUsage.bulkCreate(rollupData);

      // Test hourly aggregation
      const hourlyStats = await AgentUsage.getUsageStatistics({
        startDate: baseDate,
        endDate: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        groupBy: 'hour',
      });

      expect(hourlyStats).toBeDefined();
      expect(hourlyStats.length).toBe(7 * 24); // 7 days * 24 hours

      // Test daily aggregation
      const dailyStats = await AgentUsage.getUsageStatistics({
        startDate: baseDate,
        endDate: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        groupBy: 'day',
      });

      expect(dailyStats).toBeDefined();
      expect(dailyStats.length).toBe(7);

      // Verify aggregation accuracy
      const totalSessionsFromHourly = hourlyStats.reduce(
        (sum, stat) => sum + parseInt(stat.session_count),
        0
      );
      const totalSessionsFromDaily = dailyStats.reduce(
        (sum, stat) => sum + parseInt(stat.session_count),
        0
      );

      expect(totalSessionsFromHourly).toBe(totalSessionsFromDaily);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large-scale data processing', async () => {
      // Create large dataset
      const largeDataset = [];
      const sessionCount = 1000;
      const userCount = 100;

      for (let i = 0; i < sessionCount; i++) {
        largeDataset.push({
          sessionId: `large-scale-session-${i}`,
          userId: (i % userCount) + 1,
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
          isCompleted: true,
          userSatisfaction: ['positive', 'negative', 'neutral'][
            Math.floor(Math.random() * 3)
          ],
          geoLocationId: testUserGeo.id,
        });
      }

      const startTime = Date.now();
      await AgentUsage.bulkCreate(largeDataset);
      const creationTime = Date.now() - startTime;

      expect(creationTime).toBeLessThan(10000); // Should complete within 10 seconds

      // Test query performance
      const queryStartTime = Date.now();
      const heatmapData = await heatmapService.getHeatmapData({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      });
      const queryTime = Date.now() - queryStartTime;

      expect(queryTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(heatmapData.summary.totalSessions).toBe(sessionCount);
    });

    it('should handle concurrent data operations', async () => {
      const concurrentOperations = 10;
      const operations = [];

      for (let i = 0; i < concurrentOperations; i++) {
        operations.push(async () => {
          // Create session
          const sessionId = `concurrent-op-${i}`;
          const session = await AgentUsage.startSession(
            sessionId,
            15 + i,
            1,
            'text',
            testUserGeo.id
          );

          // Update session
          await AgentUsage.updateMessageCount(
            sessionId,
            Math.floor(Math.random() * 10) + 1
          );
          await AgentUsage.updateResponseTime(
            sessionId,
            Math.floor(Math.random() * 500) + 100
          );

          // End session
          await AgentUsage.endSession(sessionId);

          // Query data
          await heatmapService.getHeatmapData({
            startDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
            endDate: new Date(),
          });
        });
      }

      const startTime = Date.now();
      await Promise.all(operations);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(15000); // Should complete within 15 seconds

      // Verify data integrity
      const finalCount = await AgentUsage.count({
        where: {
          startTime: {
            [sequelize.Op.gte]: new Date(Date.now() - 1 * 60 * 60 * 1000),
          },
        },
      });

      expect(finalCount).toBe(concurrentOperations);
    });

    it('should handle memory efficiency with large datasets', async () => {
      // Test memory usage with pagination
      const largePageCount = 100;
      const pageSize = 100;

      const memoryBefore = process.memoryUsage().heapUsed;

      // Process data in pages
      for (let page = 0; page < largePageCount; page++) {
        const pageData = [];
        for (let i = 0; i < pageSize; i++) {
          pageData.push({
            sessionId: `memory-test-${page}-${i}`,
            userId: 16 + i,
            agentId: 1,
            messageType: 'text',
            messageCount: 1,
            startTime: new Date(),
            isCompleted: true,
            geoLocationId: testUserGeo.id,
          });
        }

        await AgentUsage.bulkCreate(pageData);

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }

        // Check memory usage
        const memoryAfter = process.memoryUsage().heapUsed;
        const memoryIncrease = memoryAfter - memoryBefore;

        // Memory increase should be reasonable (less than 100MB per page)
        expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
      }

      // Verify all data was created
      const totalCount = await AgentUsage.count({
        where: {
          sessionId: {
            [sequelize.Op.like]: 'memory-test-%',
          },
        },
      });

      expect(totalCount).toBe(largePageCount * pageSize);
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should handle database connection failures gracefully', async () => {
      // Mock database connection failure
      jest
        .spyOn(sequelize, 'query')
        .mockRejectedValue(new Error('Connection failed'));

      const sessionId = 'recovery-session-1';

      // Attempt to start session
      await expect(
        AgentUsage.startSession(sessionId, 17, 1, 'text', testUserGeo.id)
      ).rejects.toThrow();

      // Verify no incomplete data was created
      const session = await AgentUsage.findOne({ where: { sessionId } });
      expect(session).toBeNull();

      // Restore database connection
      jest.restoreAllMocks();

      // Retry operation should succeed
      const recoveredSession = await AgentUsage.startSession(
        sessionId,
        17,
        1,
        'text',
        testUserGeo.id
      );

      expect(recoveredSession).toBeDefined();
    });

    it('should handle partial data corruption', async () => {
      // Create session with corrupted data
      const corruptedSession = await AgentUsage.create({
        sessionId: 'corrupted-session-1',
        userId: 18,
        agentId: 1,
        messageType: 'text',
        messageCount: -1, // Invalid negative count
        startTime: new Date(),
        isCompleted: false,
        geoLocationId: testUserGeo.id,
      });

      // Query should handle corrupted data gracefully
      const heatmapData = await heatmapService.getHeatmapData({
        startDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
        endDate: new Date(),
      });

      expect(heatmapData).toBeDefined();
      // The corrupted session should be filtered out or handled appropriately
    });

    it('should recover from service interruptions', async () => {
      // Simulate service interruption
      let shouldFail = true;
      let attemptCount = 0;

      jest
        .spyOn(heatmapService, 'getHeatmapData')
        .mockImplementation(async params => {
          attemptCount++;
          if (shouldFail && attemptCount <= 2) {
            throw new Error('Service temporarily unavailable');
          }
          shouldFail = false;
          // Return mock data after recovery
          return {
            locations: [],
            summary: { totalSessions: 0, totalUsers: 0 },
            metadata: { dateRange: params, filters: {} },
          };
        });

      // First attempt should fail
      await expect(
        heatmapService.getHeatmapData({
          startDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
          endDate: new Date(),
        })
      ).rejects.toThrow();

      // Second attempt should fail
      await expect(
        heatmapService.getHeatmapData({
          startDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
          endDate: new Date(),
        })
      ).rejects.toThrow();

      // Third attempt should succeed
      const recoveredData = await heatmapService.getHeatmapData({
        startDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
        endDate: new Date(),
      });

      expect(recoveredData).toBeDefined();
      expect(attemptCount).toBe(3);
    });
  });
});
