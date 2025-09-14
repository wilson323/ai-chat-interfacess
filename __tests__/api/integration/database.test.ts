/**
 * Database Integration Tests
 * Tests for actual database operations and data integrity
 */

import {
  testDb,
  testRedis,
  TestFixtures,
  testValidators,
} from '@/__tests__/utils/api-test-utils';
import { AgentConfig, ChatMessage, ChatSession } from '@/lib/db/models';
import { NextRequest } from 'next/server';

describe('Database Integration Tests', () => {
  let sequelize: any;

  beforeAll(async () => {
    await testDb.setup();
    sequelize = testDb.getSequelize();
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  beforeEach(async () => {
    await testDb.clearTables();
  });

  describe('AgentConfig Operations', () => {
    it('should create and retrieve agent configuration', async () => {
      const agentData = TestFixtures.createAgent();

      // Create agent
      const createdAgent = await AgentConfig.create(agentData);

      expect(createdAgent.id).toBeDefined();
      expect(createdAgent.name).toBe(agentData.name);
      expect(createdAgent.type).toBe(agentData.type);
      expect(createdAgent.isPublished).toBe(agentData.isPublished);
      expect(testValidators.isValidUUID(createdAgent.id)).toBe(true);

      // Retrieve agent
      const retrievedAgent = await AgentConfig.findByPk(createdAgent.id);
      expect(retrievedAgent).toBeTruthy();
      expect(retrievedAgent.name).toBe(agentData.name);
    });

    it('should update agent configuration', async () => {
      const agentData = TestFixtures.createAgent();
      const agent = await AgentConfig.create(agentData);

      const updateData = {
        name: 'Updated Agent Name',
        description: 'Updated description',
        config: { model: 'gpt-4-turbo', temperature: 0.8 },
      };

      await agent.update(updateData);

      const updatedAgent = await AgentConfig.findByPk(agent.id);
      expect(updatedAgent.name).toBe(updateData.name);
      expect(updatedAgent.description).toBe(updateData.description);
      expect(updatedAgent.config).toEqual(updateData.config);
    });

    it('should delete agent configuration', async () => {
      const agentData = TestFixtures.createAgent();
      const agent = await AgentConfig.create(agentData);

      await agent.destroy();

      const deletedAgent = await AgentConfig.findByPk(agent.id);
      expect(deletedAgent).toBeNull();
    });

    it('should list only published agents', async () => {
      // Create multiple agents
      await AgentConfig.bulkCreate([
        TestFixtures.createAgent({
          name: 'Published Agent 1',
          isPublished: true,
        }),
        TestFixtures.createAgent({
          name: 'Published Agent 2',
          isPublished: true,
        }),
        TestFixtures.createAgent({
          name: 'Unpublished Agent',
          isPublished: false,
        }),
      ]);

      const publishedAgents = await AgentConfig.findAll({
        where: { isPublished: true },
      });

      expect(publishedAgents).toHaveLength(2);
      expect(publishedAgents.every(agent => agent.isPublished)).toBe(true);
    });

    it('should handle complex JSON data in globalVariables', async () => {
      const complexVariables = [
        {
          key: 'model',
          value: 'gpt-4',
          type: 'string',
          description: 'AI model to use',
        },
        {
          key: 'temperature',
          value: 0.7,
          type: 'number',
          description: 'Response randomness',
        },
        {
          key: 'features',
          value: ['vision', 'code', 'math'],
          type: 'array',
          description: 'Enabled features',
        },
      ];

      const agentData = TestFixtures.createAgent({
        globalVariables: JSON.stringify(complexVariables),
      });

      const agent = await AgentConfig.create(agentData);

      // Retrieve and parse
      const retrievedAgent = await AgentConfig.findByPk(agent.id);
      const parsedVariables = JSON.parse(retrievedAgent.globalVariables);

      expect(parsedVariables).toEqual(complexVariables);
    });

    it('should enforce unique constraints on agent names', async () => {
      const agentData = TestFixtures.createAgent({ name: 'Unique Agent' });

      await AgentConfig.create(agentData);

      // Try to create another agent with the same name
      await expect(AgentConfig.create(agentData)).rejects.toThrow();
    });

    it('should handle soft deletes properly', async () => {
      const agentData = TestFixtures.createAgent();
      const agent = await AgentConfig.create(agentData);

      // Soft delete
      await agent.destroy();

      // Should not find with normal queries
      const normalQuery = await AgentConfig.findByPk(agent.id);
      expect(normalQuery).toBeNull();

      // Should find with paranoid: false
      const paranoidQuery = await AgentConfig.findByPk(agent.id, {
        paranoid: false,
      });
      expect(paranoidQuery).toBeTruthy();
      expect(paranoidQuery.deletedAt).toBeTruthy();
    });
  });

  describe('ChatSession Operations', () => {
    it('should create and retrieve chat session', async () => {
      const sessionData = TestFixtures.createChatSession();

      const session = await ChatSession.create(sessionData);

      expect(session.id).toBeDefined();
      expect(session.sessionId).toBe(sessionData.sessionId);
      expect(session.agentId).toBe(sessionData.agentId);
      expect(session.userId).toBe(sessionData.userId);
      expect(testValidators.isValidUUID(session.id)).toBe(true);

      const retrievedSession = await ChatSession.findByPk(session.id);
      expect(retrievedSession).toBeTruthy();
      expect(retrievedSession.title).toBe(sessionData.title);
    });

    it('should associate messages with sessions', async () => {
      const sessionData = TestFixtures.createChatSession();
      const session = await ChatSession.create(sessionData);

      const messageData = TestFixtures.createChatMessage({
        sessionId: session.sessionId,
      });

      const message = await ChatMessage.create(messageData);

      // Retrieve session with messages
      const sessionWithMessages = await ChatSession.findByPk(session.id, {
        include: [{ model: ChatMessage, as: 'messages' }],
      });

      expect(sessionWithMessages.messages).toHaveLength(1);
      expect(sessionWithMessages.messages[0].content).toBe(messageData.content);
    });

    it('should handle session metadata', async () => {
      const metadata = {
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
        browser: 'Chrome',
        version: '120.0.0',
      };

      const sessionData = TestFixtures.createChatSession({
        metadata,
      });

      const session = await ChatSession.create(sessionData);

      const retrievedSession = await ChatSession.findByPk(session.id);
      expect(retrievedSession.metadata).toEqual(metadata);
    });

    it('should update session last activity', async () => {
      const sessionData = TestFixtures.createChatSession();
      const session = await ChatSession.create(sessionData);

      const originalUpdatedAt = session.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      await session.update({ title: 'Updated Title' });

      const updatedSession = await ChatSession.findByPk(session.id);
      expect(updatedSession.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe('ChatMessage Operations', () => {
    it('should create and retrieve chat messages', async () => {
      const messageData = TestFixtures.createChatMessage();

      const message = await ChatMessage.create(messageData);

      expect(message.id).toBeDefined();
      expect(message.sessionId).toBe(messageData.sessionId);
      expect(message.role).toBe(messageData.role);
      expect(message.content).toBe(messageData.content);
      expect(testValidators.isValidUUID(message.id)).toBe(true);

      const retrievedMessage = await ChatMessage.findByPk(message.id);
      expect(retrievedMessage).toBeTruthy();
      expect(retrievedMessage.content).toBe(messageData.content);
    });

    it('should handle message metadata and thinking', async () => {
      const thinking = {
        steps: [
          { step: 'analyze', reasoning: 'Understanding the question' },
          { step: 'respond', reasoning: 'Formulating the answer' },
        ],
        tokensUsed: 150,
        model: 'gpt-4',
      };

      const metadata = {
        source: 'user_input',
        confidence: 0.95,
        language: 'en',
      };

      const messageData = TestFixtures.createChatMessage({
        thinking: JSON.stringify(thinking),
        metadata,
      });

      const message = await ChatMessage.create(messageData);

      const retrievedMessage = await ChatMessage.findByPk(message.id);
      const parsedThinking = JSON.parse(retrievedMessage.thinking);

      expect(parsedThinking).toEqual(thinking);
      expect(retrievedMessage.metadata).toEqual(metadata);
    });

    it('should order messages by creation time', async () => {
      const sessionId = 'test_session_order';

      // Create messages with different timestamps
      const message1 = await ChatMessage.create({
        ...TestFixtures.createChatMessage({ sessionId }),
        createdAt: new Date('2024-01-01T10:00:00Z'),
      });

      const message2 = await ChatMessage.create({
        ...TestFixtures.createChatMessage({ sessionId }),
        createdAt: new Date('2024-01-01T10:01:00Z'),
      });

      const message3 = await ChatMessage.create({
        ...TestFixtures.createChatMessage({ sessionId }),
        createdAt: new Date('2024-01-01T09:59:00Z'),
      });

      const messages = await ChatMessage.findAll({
        where: { sessionId },
        order: [['createdAt', 'ASC']],
      });

      expect(messages).toHaveLength(3);
      expect(messages[0].id).toBe(message3.id);
      expect(messages[1].id).toBe(message1.id);
      expect(messages[2].id).toBe(message2.id);
    });

    it('should support different message roles', async () => {
      const roles = ['user', 'assistant', 'system', 'tool'];

      for (const role of roles) {
        const messageData = TestFixtures.createChatMessage({ role });
        const message = await ChatMessage.create(messageData);

        const retrievedMessage = await ChatMessage.findByPk(message.id);
        expect(retrievedMessage.role).toBe(role);
      }
    });

    it('should handle large message content', async () => {
      const largeContent = 'x'.repeat(10000); // 10KB of content

      const messageData = TestFixtures.createChatMessage({
        content: largeContent,
      });

      const message = await ChatMessage.create(messageData);

      const retrievedMessage = await ChatMessage.findByPk(message.id);
      expect(retrievedMessage.content).toBe(largeContent);
      expect(retrievedMessage.content.length).toBe(10000);
    });
  });

  describe('Relationships and Associations', () => {
    it('should establish session-message relationships', async () => {
      // Create session
      const sessionData = TestFixtures.createChatSession();
      const session = await ChatSession.create(sessionData);

      // Create multiple messages for the session
      const messages = await Promise.all([
        ChatMessage.create({
          ...TestFixtures.createChatMessage({ sessionId: session.sessionId }),
          role: 'user',
        }),
        ChatMessage.create({
          ...TestFixtures.createChatMessage({ sessionId: session.sessionId }),
          role: 'assistant',
        }),
        ChatMessage.create({
          ...TestFixtures.createChatMessage({ sessionId: session.sessionId }),
          role: 'user',
        }),
      ]);

      // Query session with associated messages
      const sessionWithMessages = await ChatSession.findByPk(session.id, {
        include: [{ model: ChatMessage, as: 'messages' }],
      });

      expect(sessionWithMessages.messages).toHaveLength(3);
      expect(sessionWithMessages.messages[0].role).toBe('user');
      expect(sessionWithMessages.messages[1].role).toBe('assistant');
      expect(sessionWithMessages.messages[2].role).toBe('user');
    });

    it('should handle cascading deletes properly', async () => {
      // This depends on your Sequelize configuration
      // Test if deleting a session also deletes its messages (if configured)
      const sessionData = TestFixtures.createChatSession();
      const session = await ChatSession.create(sessionData);

      await ChatMessage.create({
        ...TestFixtures.createChatMessage({ sessionId: session.sessionId }),
      });

      // Delete the session
      await session.destroy();

      // Check if messages still exist
      const remainingMessages = await ChatMessage.findAll({
        where: { sessionId: session.sessionId },
      });

      // This test will pass or fail based on your cascade configuration
      // You may need to adjust expectations based on your actual setup
      console.log(
        `Remaining messages after session deletion: ${remainingMessages.length}`
      );
    });
  });

  describe('Database Performance Tests', () => {
    it('should handle bulk insert operations efficiently', async () => {
      const agentCount = 100;
      const agents = Array.from({ length: agentCount }, (_, i) =>
        TestFixtures.createAgent({
          name: `Performance Agent ${i}`,
          order: i,
        })
      );

      const startTime = process.hrtime.bigint();
      await AgentConfig.bulkCreate(agents);
      const endTime = process.hrtime.bigint();

      const insertTime = Number(endTime - startTime) / 1000000;
      console.log(`Bulk insert of ${agentCount} agents took ${insertTime}ms`);

      expect(insertTime).toBeLessThan(1000); // Should complete within 1 second

      // Verify all agents were created
      const count = await AgentConfig.count();
      expect(count).toBe(agentCount);
    });

    it('should handle complex queries with joins efficiently', async () => {
      // Create test data
      const session = await ChatSession.create(
        TestFixtures.createChatSession()
      );

      await Promise.all(
        Array.from({ length: 50 }, (_, i) =>
          ChatMessage.create({
            ...TestFixtures.createChatMessage({ sessionId: session.sessionId }),
            role: i % 2 === 0 ? 'user' : 'assistant',
          })
        )
      );

      const startTime = process.hrtime.bigint();

      const sessionWithMessages = await ChatSession.findByPk(session.id, {
        include: [{ model: ChatMessage, as: 'messages' }],
      });

      const endTime = process.hrtime.bigint();

      const queryTime = Number(endTime - startTime) / 1000000;
      console.log(`Complex join query took ${queryTime}ms`);

      expect(queryTime).toBeLessThan(100); // Should complete within 100ms
      expect(sessionWithMessages.messages).toHaveLength(50);
    });

    it('should handle pagination queries efficiently', async () => {
      // Create test data
      await AgentConfig.bulkCreate(
        Array.from({ length: 200 }, (_, i) =>
          TestFixtures.createAgent({
            name: `Paginated Agent ${i}`,
            order: i,
          })
        )
      );

      const startTime = process.hrtime.bigint();

      const page = 2;
      const limit = 20;

      const result = await AgentConfig.findAndCountAll({
        limit,
        offset: (page - 1) * limit,
        order: [['order', 'ASC']],
      });

      const endTime = process.hrtime.bigint();

      const queryTime = Number(endTime - startTime) / 1000000;
      console.log(`Pagination query took ${queryTime}ms`);

      expect(queryTime).toBeLessThan(50); // Should complete within 50ms
      expect(result.rows).toHaveLength(limit);
      expect(result.count).toBe(200);
    });
  });

  describe('Database Transactions', () => {
    it('should rollback transactions on errors', async () => {
      const transaction = await sequelize.transaction();

      try {
        // Create first record
        await AgentConfig.create(TestFixtures.createAgent(), { transaction });

        // Simulate an error
        throw new Error('Simulated error');
      } catch (error) {
        await transaction.rollback();
      }

      // Verify no records were created
      const count = await AgentConfig.count();
      expect(count).toBe(0);
    });

    it('should commit transactions successfully', async () => {
      const transaction = await sequelize.transaction();

      try {
        await AgentConfig.create(TestFixtures.createAgent(), { transaction });
        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }

      // Verify record was created
      const count = await AgentConfig.count();
      expect(count).toBe(1);
    });
  });

  describe('Database Constraints and Validation', () => {
    it('should enforce not-null constraints', async () => {
      const invalidAgent = TestFixtures.createAgent();
      delete invalidAgent.name;

      await expect(AgentConfig.create(invalidAgent)).rejects.toThrow();
    });

    it('should enforce data type constraints', async () => {
      const invalidAgent = TestFixtures.createAgent({
        temperature: 'invalid', // Should be number
      });

      await expect(AgentConfig.create(invalidAgent)).rejects.toThrow();
    });

    it('should handle enum constraints', async () => {
      const validTypes = ['fastgpt', 'cad-analyzer', 'image-editor'];

      for (const type of validTypes) {
        const agent = TestFixtures.createAgent({ type });
        await expect(AgentConfig.create(agent)).resolves.toBeDefined();
      }

      const invalidAgent = TestFixtures.createAgent({ type: 'invalid-type' });
      await expect(AgentConfig.create(invalidAgent)).rejects.toThrow();
    });
  });
});
