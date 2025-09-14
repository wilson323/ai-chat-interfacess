import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import AgentUsage from '@/lib/db/models/agent-usage';
import UserGeo from '@/lib/db/models/UserGeo';
import sequelize from '@/lib/db/sequelize';
import { Op } from 'sequelize';

describe('AgentUsage Model Tests', () => {
  let testUserGeo: UserGeo;
  let testAgentId: number;

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

    testAgentId = 1; // 模拟智能体ID
  });

  afterEach(async () => {
    // 清理测试数据
    await AgentUsage.destroy({ where: {} });
    await UserGeo.destroy({ where: {} });
  });

  describe('CRUD Operations', () => {
    it('should create a new AgentUsage record', async () => {
      const usageData = {
        sessionId: 'test-session-1',
        userId: 1,
        agentId: testAgentId,
        messageType: 'text' as const,
        messageCount: 5,
        tokenUsage: 1000,
        responseTime: 500,
        startTime: new Date(),
        endTime: new Date(Date.now() + 30000),
        duration: 30,
        isCompleted: true,
        userSatisfaction: 'positive' as const,
        geoLocationId: testUserGeo.id,
        deviceInfo: {
          browser: 'Chrome',
          os: 'Windows 10',
          deviceType: 'desktop',
        },
      };

      const agentUsage = await AgentUsage.create(usageData);

      expect(agentUsage.id).toBeDefined();
      expect(agentUsage.sessionId).toBe(usageData.sessionId);
      expect(agentUsage.userId).toBe(usageData.userId);
      expect(agentUsage.agentId).toBe(usageData.agentId);
      expect(agentUsage.messageType).toBe(usageData.messageType);
      expect(agentUsage.messageCount).toBe(usageData.messageCount);
      expect(agentUsage.tokenUsage).toBe(usageData.tokenUsage);
      expect(agentUsage.responseTime).toBe(usageData.responseTime);
      expect(agentUsage.duration).toBe(usageData.duration);
      expect(agentUsage.isCompleted).toBe(usageData.isCompleted);
      expect(agentUsage.userSatisfaction).toBe(usageData.userSatisfaction);
      expect(agentUsage.geoLocationId).toBe(usageData.geoLocationId);
      expect(agentUsage.deviceInfo).toEqual(usageData.deviceInfo);
    });

    it('should read AgentUsage record with associations', async () => {
      const usageData = {
        sessionId: 'test-session-2',
        userId: 1,
        agentId: testAgentId,
        messageType: 'image' as const,
        messageCount: 3,
        startTime: new Date(),
        isCompleted: false,
        geoLocationId: testUserGeo.id,
      };

      const created = await AgentUsage.create(usageData);
      const found = await AgentUsage.findByPk(created.id, {
        include: ['geoLocation', 'agent'],
      });

      expect(found).toBeTruthy();
      expect(found!.sessionId).toBe(usageData.sessionId);
      expect(found!.geoLocation).toBeDefined();
      expect(found!.geoLocation!.id).toBe(testUserGeo.id);
    });

    it('should update AgentUsage record', async () => {
      const usageData = {
        sessionId: 'test-session-3',
        userId: 1,
        agentId: testAgentId,
        messageType: 'file' as const,
        messageCount: 2,
        startTime: new Date(),
        isCompleted: false,
        geoLocationId: testUserGeo.id,
      };

      const agentUsage = await AgentUsage.create(usageData);

      await agentUsage.update({
        messageCount: 5,
        tokenUsage: 800,
        isCompleted: true,
        endTime: new Date(),
      });

      const updated = await AgentUsage.findByPk(agentUsage.id);
      expect(updated!.messageCount).toBe(5);
      expect(updated!.tokenUsage).toBe(800);
      expect(updated!.isCompleted).toBe(true);
      expect(updated!.endTime).toBeDefined();
    });

    it('should delete AgentUsage record', async () => {
      const usageData = {
        sessionId: 'test-session-4',
        userId: 1,
        agentId: testAgentId,
        messageType: 'voice' as const,
        messageCount: 1,
        startTime: new Date(),
        isCompleted: true,
        geoLocationId: testUserGeo.id,
      };

      const agentUsage = await AgentUsage.create(usageData);
      const id = agentUsage.id;

      await agentUsage.destroy();
      const deleted = await AgentUsage.findByPk(id);

      expect(deleted).toBeNull();
    });
  });

  describe('Session Management', () => {
    it('should start a new session', async () => {
      const sessionId = 'new-session-1';
      const userId = 1;
      const deviceInfo = {
        browser: 'Firefox',
        os: 'macOS',
        deviceType: 'desktop',
      };

      const session = await AgentUsage.startSession(
        sessionId,
        userId,
        testAgentId,
        'mixed',
        testUserGeo.id,
        deviceInfo
      );

      expect(session.sessionId).toBe(sessionId);
      expect(session.userId).toBe(userId);
      expect(session.agentId).toBe(testAgentId);
      expect(session.messageType).toBe('mixed');
      expect(session.messageCount).toBe(0);
      expect(session.isCompleted).toBe(false);
      expect(session.geoLocationId).toBe(testUserGeo.id);
      expect(session.deviceInfo).toEqual(deviceInfo);
    });

    it('should end a session', async () => {
      const sessionId = 'session-to-end-1';

      // Start session
      await AgentUsage.startSession(sessionId, 1, testAgentId, 'text', testUserGeo.id);

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
      expect(endedSession!.endTime).toBeDefined();
      expect(endedSession!.duration).toBeGreaterThan(0);
    });

    it('should update message count', async () => {
      const sessionId = 'session-update-1';

      // Start session
      await AgentUsage.startSession(sessionId, 1, testAgentId, 'text', testUserGeo.id);

      // Update message count
      await AgentUsage.updateMessageCount(sessionId, 3);

      // Verify update
      const session = await AgentUsage.findOne({
        where: { sessionId, isCompleted: false },
      });

      expect(session).toBeTruthy();
      expect(session!.messageCount).toBe(3);
    });

    it('should update response time', async () => {
      const sessionId = 'session-response-1';

      // Start session
      await AgentUsage.startSession(sessionId, 1, testAgentId, 'text', testUserGeo.id);

      // Update response time
      await AgentUsage.updateResponseTime(sessionId, 250);

      // Verify update
      const session = await AgentUsage.findOne({
        where: { sessionId, isCompleted: false },
      });

      expect(session).toBeTruthy();
      expect(session!.responseTime).toBe(250);
    });
  });

  describe('Statistics and Analytics', () => {
    beforeEach(async () => {
      // Create test data for statistics
      const baseDate = new Date();
      baseDate.setHours(0, 0, 0, 0);

      const testSessions = [
        {
          sessionId: 'stats-session-1',
          userId: 1,
          agentId: testAgentId,
          messageType: 'text' as const,
          messageCount: 10,
          tokenUsage: 2000,
          responseTime: 300,
          startTime: new Date(baseDate.getTime() + 1 * 60 * 60 * 1000),
          endTime: new Date(baseDate.getTime() + 1 * 60 * 60 * 1000 + 30000),
          duration: 30,
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
        {
          sessionId: 'stats-session-2',
          userId: 1,
          agentId: testAgentId,
          messageType: 'image' as const,
          messageCount: 5,
          tokenUsage: 1500,
          responseTime: 400,
          startTime: new Date(baseDate.getTime() + 2 * 60 * 60 * 1000),
          endTime: new Date(baseDate.getTime() + 2 * 60 * 60 * 1000 + 45000),
          duration: 45,
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
        {
          sessionId: 'stats-session-3',
          userId: 2,
          agentId: testAgentId,
          messageType: 'file' as const,
          messageCount: 3,
          tokenUsage: 800,
          responseTime: 200,
          startTime: new Date(baseDate.getTime() + 3 * 60 * 60 * 1000),
          endTime: new Date(baseDate.getTime() + 3 * 60 * 60 * 1000 + 20000),
          duration: 20,
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        },
      ];

      await AgentUsage.bulkCreate(testSessions);
    });

    it('should get usage statistics by day', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);

      const stats = await AgentUsage.getUsageStatistics({
        startDate,
        endDate,
        groupBy: 'day',
      });

      expect(stats).toHaveLength(1); // All sessions on same day
      expect(stats[0].session_count).toBe('3');
      expect(stats[0].total_messages).toBe('18');
      expect(parseFloat(stats[0].avg_duration)).toBeCloseTo(31.67, 1);
      expect(parseFloat(stats[0].avg_response_time)).toBeCloseTo(300, 0);
      expect(stats[0].total_tokens).toBe('4300');
    });

    it('should get usage statistics by hour', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);

      const stats = await AgentUsage.getUsageStatistics({
        startDate,
        endDate,
        groupBy: 'hour',
      });

      expect(stats.length).toBeGreaterThan(0);
      expect(stats[0].session_count).toBeDefined();
    });

    it('should get usage statistics filtered by agent', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);

      const stats = await AgentUsage.getUsageStatistics({
        startDate,
        endDate,
        agentId: testAgentId,
        groupBy: 'day',
      });

      expect(stats).toHaveLength(1);
      expect(stats[0].session_count).toBe('3');
    });

    it('should get usage statistics filtered by user', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);

      const stats = await AgentUsage.getUsageStatistics({
        startDate,
        endDate,
        userId: 1,
        groupBy: 'day',
      });

      expect(stats).toHaveLength(1);
      expect(stats[0].session_count).toBe('2');
    });

    it('should get top agents', async () => {
      const timeRange = {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: new Date(),
      };

      const topAgents = await AgentUsage.getTopAgents(5, timeRange);

      expect(topAgents).toHaveLength(1);
      expect(topAgents[0].agentId).toBe(testAgentId);
      expect(topAgents[0].usageCount).toBe('3');
    });
  });

  describe('Data Cleanup', () => {
    it('should identify cleanup candidates', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 400);

      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 10);

      // Create old record
      await AgentUsage.create({
        sessionId: 'old-session-1',
        userId: 1,
        agentId: testAgentId,
        messageType: 'text',
        messageCount: 1,
        startTime: oldDate,
        isCompleted: true,
        geoLocationId: testUserGeo.id,
      });

      // Create recent record
      await AgentUsage.create({
        sessionId: 'recent-session-1',
        userId: 1,
        agentId: testAgentId,
        messageType: 'text',
        messageCount: 1,
        startTime: recentDate,
        isCompleted: true,
        geoLocationId: testUserGeo.id,
      });

      const candidates = await AgentUsage.getCleanupCandidates(365);
      expect(candidates).toHaveLength(1);
      expect(candidates[0].sessionId).toBe('old-session-1');
    });

    it('should cleanup old data', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 400);

      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 10);

      // Create old record
      await AgentUsage.create({
        sessionId: 'old-session-2',
        userId: 1,
        agentId: testAgentId,
        messageType: 'text',
        messageCount: 1,
        startTime: oldDate,
        isCompleted: true,
        geoLocationId: testUserGeo.id,
      });

      // Create recent record
      await AgentUsage.create({
        sessionId: 'recent-session-2',
        userId: 1,
        agentId: testAgentId,
        messageType: 'text',
        messageCount: 1,
        startTime: recentDate,
        isCompleted: true,
        geoLocationId: testUserGeo.id,
      });

      const cleanupCount = await AgentUsage.cleanupOldData(365);
      expect(cleanupCount).toBe(1);

      const remaining = await AgentUsage.findAll();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].sessionId).toBe('recent-session-2');
    });
  });

  describe('Association Tests', () => {
    it('should associate with UserGeo', async () => {
      const usageData = {
        sessionId: 'assoc-session-1',
        userId: 1,
        agentId: testAgentId,
        messageType: 'text',
        messageCount: 5,
        startTime: new Date(),
        isCompleted: false,
        geoLocationId: testUserGeo.id,
      };

      const agentUsage = await AgentUsage.create(usageData);

      // Test association
      const usageWithGeo = await AgentUsage.findByPk(agentUsage.id, {
        include: ['geoLocation'],
      });

      expect(usageWithGeo).toBeTruthy();
      expect(usageWithGeo!.geoLocation).toBeDefined();
      expect(usageWithGeo!.geoLocation!.id).toBe(testUserGeo.id);
      expect(usageWithGeo!.geoLocation!.country).toBe('中国');
    });

    it('should handle multiple sessions for same user', async () => {
      const sessionIds = ['multi-session-1', 'multi-session-2', 'multi-session-3'];

      for (const sessionId of sessionIds) {
        await AgentUsage.create({
          sessionId,
          userId: 1,
          agentId: testAgentId,
          messageType: 'text',
          messageCount: Math.floor(Math.random() * 10) + 1,
          startTime: new Date(),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        });
      }

      const userSessions = await AgentUsage.findAll({
        where: { userId: 1 },
        order: [['startTime', 'DESC']],
      });

      expect(userSessions).toHaveLength(3);
      expect(userSessions.map(s => s.sessionId)).toEqual(expect.arrayContaining(sessionIds));
    });

    it('should handle multiple sessions for different agents', async () => {
      const agentIds = [1, 2, 3];

      for (const agentId of agentIds) {
        await AgentUsage.create({
          sessionId: `agent-session-${agentId}`,
          userId: 1,
          agentId,
          messageType: 'text',
          messageCount: 5,
          startTime: new Date(),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        });
      }

      const agentSessions = await AgentUsage.findAll({
        where: { userId: 1 },
        order: [['agentId', 'ASC']],
      });

      expect(agentSessions).toHaveLength(3);
      expect(agentSessions.map(s => s.agentId)).toEqual(agentIds);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid session ID format', async () => {
      const invalidData = {
        sessionId: '', // Empty session ID
        userId: 1,
        agentId: testAgentId,
        messageType: 'text',
        messageCount: 1,
        startTime: new Date(),
        isCompleted: false,
      };

      await expect(AgentUsage.create(invalidData)).rejects.toThrow();
    });

    it('should handle invalid message type', async () => {
      const invalidData = {
        sessionId: 'invalid-type-session',
        userId: 1,
        agentId: testAgentId,
        messageType: 'invalid_type' as any, // Invalid message type
        messageCount: 1,
        startTime: new Date(),
        isCompleted: false,
      };

      await expect(AgentUsage.create(invalidData)).rejects.toThrow();
    });

    it('should handle end session for non-existent session', async () => {
      const result = await AgentUsage.endSession('non-existent-session');
      expect(result).toBeNull();
    });

    it('should handle update for non-existent session', async () => {
      // These should not throw errors, just silently fail
      await AgentUsage.updateMessageCount('non-existent-session', 5);
      await AgentUsage.updateResponseTime('non-existent-session', 100);
    });
  });

  describe('Performance Tests', () => {
    it('should handle bulk insert of 1000 records', async () => {
      const bulkData = [];
      for (let i = 0; i < 1000; i++) {
        bulkData.push({
          sessionId: `bulk-session-${i}`,
          userId: (i % 10) + 1, // 10 different users
          agentId: testAgentId,
          messageType: ['text', 'image', 'file', 'voice'][Math.floor(Math.random() * 4)],
          messageCount: Math.floor(Math.random() * 10) + 1,
          startTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
          isCompleted: Math.random() > 0.2, // 80% completed
          geoLocationId: testUserGeo.id,
        });
      }

      const startTime = Date.now();
      await AgentUsage.bulkCreate(bulkData);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds

      const count = await AgentUsage.count();
      expect(count).toBe(1000);
    });

    it('should handle statistics query with large dataset', async () => {
      // Create 100 records
      const bulkData = [];
      for (let i = 0; i < 100; i++) {
        bulkData.push({
          sessionId: `perf-session-${i}`,
          userId: (i % 5) + 1,
          agentId: testAgentId,
          messageType: 'text',
          messageCount: Math.floor(Math.random() * 20) + 1,
          tokenUsage: Math.floor(Math.random() * 5000) + 100,
          startTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          isCompleted: true,
          geoLocationId: testUserGeo.id,
        });
      }

      await AgentUsage.bulkCreate(bulkData);

      const startTime = Date.now();
      const stats = await AgentUsage.getUsageStatistics({
        groupBy: 'day',
      });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(stats.length).toBeGreaterThan(0);
    });
  });
});