/**
 * Redis缓存使用示例
 * 展示如何使用redis-manager进行各种缓存操作
 */

import { redisManager } from '@/lib/cache/redis-manager';

// 基本使用示例
export class CacheExamples {
  /**
   * 基本缓存操作
   */
  static async basicOperations() {
    try {
      // 1. 连接到Redis
      await redisManager.connect();
      console.log('✅ Redis连接成功');

      // 2. 设置缓存
      await redisManager.set(
        'user:123',
        {
          id: 123,
          name: '张三',
          email: 'zhangsan@example.com',
          preferences: { theme: 'dark', language: 'zh-CN' },
        },
        3600
      ); // 1小时过期

      // 3. 获取缓存
      const user = await redisManager.get('user:123');
      console.log('获取用户:', user);

      // 4. 检查键是否存在
      const exists = await redisManager.exists('user:123');
      console.log('用户是否存在:', exists);

      // 5. 删除缓存
      await redisManager.delete('user:123');
      console.log('用户缓存已删除');
    } catch (error) {
      console.error('缓存操作失败:', error);
    }
  }

  /**
   * 批量操作示例
   */
  static async batchOperations() {
    try {
      // 批量设置
      await redisManager.mset([
        {
          key: 'product:1',
          value: { id: 1, name: '商品1', price: 100 },
          ttl: 1800,
        },
        {
          key: 'product:2',
          value: { id: 2, name: '商品2', price: 200 },
          ttl: 1800,
        },
        {
          key: 'product:3',
          value: { id: 3, name: '商品3', price: 300 },
          ttl: 1800,
        },
      ]);

      // 批量获取
      const products = await redisManager.mget([
        'product:1',
        'product:2',
        'product:3',
      ]);
      console.log('批量获取商品:', products);
    } catch (error) {
      console.error('批量操作失败:', error);
    }
  }

  /**
   * 统计和监控示例
   */
  static async monitoringExample() {
    try {
      // 获取基本统计信息
      const stats = await redisManager.getStats();
      console.log('缓存统计:', {
        命中率: `${stats.hitRate.toFixed(2)}%`,
        总键数: stats.totalKeys,
        命中次数: stats.hits,
        未命中次数: stats.misses,
        内存使用: `${stats.memoryUsage.toFixed(2)}MB`,
        连接状态: stats.connectionStatus,
      });

      // 获取详细统计信息
      const detailedStats = await redisManager.getDetailedStats();
      console.log('详细统计:', detailedStats);

      // 健康检查
      const health = await redisManager.healthCheck();
      console.log('健康状态:', health);
    } catch (error) {
      console.error('监控操作失败:', error);
    }
  }

  /**
   * 缓存策略示例
   */
  static async cacheStrategyExample() {
    try {
      // 缓存预热
      await redisManager.warmup([
        {
          key: 'config:app',
          value: { version: '1.0.0', debug: false },
          ttl: 7200,
        },
        {
          key: 'config:features',
          value: { chat: true, voice: true, image: true },
          ttl: 7200,
        },
      ]);

      // 获取热点键
      const hotKeys = await redisManager.getHotKeys(10);
      console.log('热点键:', hotKeys);

      // 实施LRU策略（限制最多1000个键）
      await redisManager.implementLRU(1000);

      // 清理过期缓存
      const expiredCount = await redisManager.cleanupExpired();
      console.log(`清理了 ${expiredCount} 个过期缓存`);
    } catch (error) {
      console.error('缓存策略操作失败:', error);
    }
  }

  /**
   * 错误处理和重试示例
   */
  static async errorHandlingExample() {
    try {
      // 模拟错误情况下的操作
      // redis-manager会自动重试，我们只需要处理最终错误
      const result = await redisManager.set('test:key', 'test value');
      console.log('设置结果:', result);
    } catch (error) {
      console.error('最终错误:', error);
      // 这里可以进行降级处理，比如使用本地缓存或数据库
    }
  }
}

// 智能体缓存使用示例
export class AgentCacheExample {
  /**
   * 缓存智能体配置
   */
  static async cacheAgentConfig(agentId: string, config: Record<string, unknown>) {
    const cacheKey = `agent:config:${agentId}`;
    return await redisManager.set(cacheKey, config, 1800); // 30分钟缓存
  }

  /**
   * 获取智能体配置
   */
  static async getAgentConfig(agentId: string) {
    const cacheKey = `agent:config:${agentId}`;
    let config = await redisManager.get(cacheKey);

    if (!config) {
      // 缓存未命中，从数据库加载
      console.log(`缓存未命中，从数据库加载智能体 ${agentId} 配置`);
      // 这里应该调用数据库查询
      config = { id: agentId, name: `智能体 ${agentId}`, model: 'gpt-4' };

      // 缓存配置
      await this.cacheAgentConfig(agentId, config);
    }

    return config;
  }

  /**
   * 批量缓存智能体列表
   */
  static async cacheAgentList(agents: Record<string, unknown>[]) {
    const cacheItems = agents.map(agent => ({
      key: `agent:config:${agent.id}`,
      value: agent,
      ttl: 1800,
    }));

    await redisManager.mset(cacheItems);
    console.log(`批量缓存了 ${agents.length} 个智能体配置`);
  }
}

// 聊天会话缓存示例
export class ChatCacheExample {
  /**
   * 缓存聊天会话
   */
  static async cacheChatSession(sessionId: string, sessionData: Record<string, unknown>) {
    const cacheKey = `chat:session:${sessionId}`;
    return await redisManager.set(cacheKey, sessionData, 3600); // 1小时缓存
  }

  /**
   * 获取聊天会话
   */
  static async getChatSession(sessionId: string) {
    const cacheKey = `chat:session:${sessionId}`;
    return await redisManager.get(cacheKey);
  }

  /**
   * 缓存用户最近的消息
   */
  static async cacheRecentMessages(userId: string, messages: Record<string, unknown>[]) {
    const cacheKey = `user:recent_messages:${userId}`;
    return await redisManager.set(cacheKey, messages, 1800); // 30分钟缓存
  }

  /**
   * 获取用户最近的消息
   */
  static async getRecentMessages(userId: string) {
    const cacheKey = `user:recent_messages:${userId}`;
    return await redisManager.get(cacheKey);
  }
}

// 性能测试示例
export class PerformanceTestExample {
  /**
   * 基本性能测试
   */
  static async runBasicPerformanceTest() {
    const iterations = 1000;
    const startTime = Date.now();

    // 测试写入性能
    for (let i = 0; i < iterations; i++) {
      await redisManager.set(`test:key:${i}`, {
        value: i,
        timestamp: Date.now(),
      });
    }

    const writeTime = Date.now() - startTime;
    console.log(`写入 ${iterations} 条数据耗时: ${writeTime}ms`);

    // 测试读取性能
    const readStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      await redisManager.get(`test:key:${i}`);
    }

    const readTime = Date.now() - readStart;
    console.log(`读取 ${iterations} 条数据耗时: ${readTime}ms`);

    // 清理测试数据
    for (let i = 0; i < iterations; i++) {
      await redisManager.delete(`test:key:${i}`);
    }

    return {
      writeTime,
      readTime,
      writeOps: iterations / (writeTime / 1000),
      readOps: iterations / (readTime / 1000),
    };
  }

  /**
   * 并发性能测试
   */
  static async runConcurrentTest() {
    const concurrentUsers = 50;
    const operationsPerUser = 20;

    const promises = [];
    for (let user = 0; user < concurrentUsers; user++) {
      promises.push(this.runUserOperations(user, operationsPerUser));
    }

    const startTime = Date.now();
    await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    const totalOperations = concurrentUsers * operationsPerUser * 2; // 每个用户进行读写操作
    const opsPerSecond = totalOperations / (totalTime / 1000);

    console.log(`并发测试完成:`);
    console.log(`  并发用户数: ${concurrentUsers}`);
    console.log(`  总操作数: ${totalOperations}`);
    console.log(`  总耗时: ${totalTime}ms`);
    console.log(`  吞吐量: ${opsPerSecond.toFixed(2)} ops/sec`);

    return { opsPerSecond, totalTime };
  }

  private static async runUserOperations(userId: number, operations: number) {
    for (let i = 0; i < operations; i++) {
      // 写操作
      await redisManager.set(`concurrent:user:${userId}:op:${i}`, {
        userId,
        operation: i,
        timestamp: Date.now(),
      });

      // 读操作
      await redisManager.get(`concurrent:user:${userId}:op:${i}`);
    }
  }
}

// 导出所有示例
export default {
  CacheExamples,
  AgentCacheExample,
  ChatCacheExample,
  PerformanceTestExample,
};
