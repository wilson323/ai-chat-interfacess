/**
 * FastGPT专用缓存管理器
 * 针对对话历史和API响应进行智能缓存
 */

import { redisManager } from './redis-manager';
import { AgentConfig } from '../db/models/agent-config';

interface FastGPTCacheKey {
  agentId: string;
  chatId?: string;
  messageId?: string;
  userId?: string;
  type: 'chat' | 'config' | 'response';
}

interface CachedChatResponse {
  response: string;
  timestamp: number;
  ttl: number;
  hitCount: number;
}

export class FastGPTCacheManager {
  private readonly CHAT_TTL = 1800; // 30分钟
  private readonly CONFIG_TTL = 3600; // 1小时
  private readonly RESPONSE_TTL = 900; // 15分钟

  /**
   * 生成缓存键
   */
  private generateKey(key: FastGPTCacheKey): string {
    const parts = [
      'fastgpt',
      key.type,
      key.agentId,
      key.chatId || 'no-chat',
      key.messageId || 'no-message',
      key.userId || 'anonymous'
    ];
    return parts.join(':');
  }

  /**
   * 缓存聊天响应
   */
  async cacheChatResponse(
    key: Omit<FastGPTCacheKey, 'type'>,
    response: string
  ): Promise<boolean> {
    const cacheKey: FastGPTCacheKey = { ...key, type: 'chat' };
    const fullKey = this.generateKey(cacheKey);

    const cachedData: CachedChatResponse = {
      response,
      timestamp: Date.now(),
      ttl: this.CHAT_TTL,
      hitCount: 0
    };

    return await redisManager.set(fullKey, cachedData, this.CHAT_TTL);
  }

  /**
   * 获取缓存的聊天响应
   */
  async getCachedChatResponse(
    key: Omit<FastGPTCacheKey, 'type'>
  ): Promise<CachedChatResponse | null> {
    const cacheKey: FastGPTCacheKey = { ...key, type: 'chat' };
    const fullKey = this.generateKey(cacheKey);

    const cached = await redisManager.get<CachedChatResponse>(fullKey);

    if (cached) {
      // 更新访问统计
      cached.hitCount++;
      await redisManager.set(fullKey, cached, cached.ttl);
    }

    return cached;
  }

  /**
   * 缓存智能体配置
   */
  async cacheAgentConfig(agentId: string, config: AgentConfig): Promise<boolean> {
    const cacheKey: FastGPTCacheKey = {
      agentId,
      type: 'config'
    };
    const fullKey = this.generateKey(cacheKey);

    return await redisManager.set(fullKey, config, this.CONFIG_TTL);
  }

  /**
   * 获取缓存的智能体配置
   */
  async getCachedAgentConfig(agentId: string): Promise<AgentConfig | null> {
    const cacheKey: FastGPTCacheKey = {
      agentId,
      type: 'config'
    };
    const fullKey = this.generateKey(cacheKey);

    return await redisManager.get<AgentConfig>(fullKey);
  }

  /**
   * 缓存API响应
   */
  async cacheAPIResponse(
    url: string,
    params: Record<string, any>,
    response: any
  ): Promise<boolean> {
    const cacheKey: FastGPTCacheKey = {
      agentId: 'api',
      type: 'response',
      messageId: this.hashRequest(url, params)
    };
    const fullKey = this.generateKey(cacheKey);

    return await redisManager.set(fullKey, {
      response,
      timestamp: Date.now()
    }, this.RESPONSE_TTL);
  }

  /**
   * 获取缓存的API响应
   */
  async getCachedAPIResponse(
    url: string,
    params: Record<string, any>
  ): Promise<any | null> {
    const cacheKey: FastGPTCacheKey = {
      agentId: 'api',
      type: 'response',
      messageId: this.hashRequest(url, params)
    };
    const fullKey = this.generateKey(cacheKey);

    const cached = await redisManager.get(fullKey);
    return cached?.response || null;
  }

  /**
   * 批量预热缓存
   */
  async warmupCache(agents: AgentConfig[]): Promise<boolean> {
    const warmupItems = agents.map(agent => ({
      key: this.generateKey({
        agentId: String(agent.id),
        type: 'config'
      }),
      value: agent,
      ttl: this.CONFIG_TTL
    }));

    return await redisManager.warmup(warmupItems);
  }

  /**
   * 清理过期缓存
   */
  async cleanup(): Promise<number> {
    const stats = await redisManager.getStats();
    const hotKeys = await redisManager.getHotKeys(50);

    let cleanedCount = 0;

    for (const key of hotKeys) {
      if (key.accessCount < 2) { // 清理低频访问的键
        await redisManager.delete(key.key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * 获取缓存统计
   */
  async getCacheStats() {
    const stats = await redisManager.getStats();
    const hotKeys = await redisManager.getHotKeys(10);

    return {
      ...stats,
      hotKeys,
      efficiency: this.calculateEfficiency(stats)
    };
  }

  /**
   * 计算缓存效率
   */
  private calculateEfficiency(stats: any): number {
    if (stats.totalKeys === 0) return 0;

    const memoryEfficiency = stats.memoryUsage < 80 ? 1 : (100 - stats.memoryUsage) / 100;
    const hitRateEfficiency = stats.hitRate / 100;

    return Math.round((memoryEfficiency + hitRateEfficiency) / 2 * 100);
  }

  /**
   * 请求哈希
   */
  private hashRequest(url: string, params: Record<string, any>): string {
    const str = JSON.stringify({ url, params });
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }

    return Math.abs(hash).toString(36);
  }
}

export const fastgptCacheManager = new FastGPTCacheManager();