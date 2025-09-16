/**
 * 统一智能体API管理器
 * 整合所有智能体相关的API功能，消除重复代码
 */

import type {
  UnifiedAgent,
  AgentConfig,
  AgentMetrics,
  // LoadBalanceStrategy,
  MultiAgentOptions,
  FastGPTMessage,
  FastGPTChatResponse,
  // FastGPTStreamChunk,
  FastGPTRequestOptions,
  FastGPTError
} from '@/types/unified-agent';
import { logger } from '@/lib/utils/logger';
// 移除不存在的导入

// ================ 统一配置管理 ================

/**
 * 统一配置管理器
 */
export class UnifiedConfigManager {
  private configs: Map<string, AgentConfig> = new Map();
  private defaultConfig: AgentConfig;

  constructor(defaultConfig?: AgentConfig) {
    this.defaultConfig = defaultConfig || {
      version: '1.0.0',
      settings: {
        timeout: 30000,
        retryCount: 3,
        cacheEnabled: true,
        logLevel: 'info',
        healthCheckInterval: 30000,
        circuitBreakerThreshold: 5
      },
      features: {
        streaming: true,
        fileUpload: false,
        imageUpload: false,
        voiceInput: false,
        voiceOutput: false,
        multimodal: false,
        detail: true,
        questionGuide: true
      },
      limits: {
        maxTokens: 2048,
        maxFileSize: 10 * 1024 * 1024,
        maxRequests: 1000,
        rateLimit: 100,
        maxConnections: 10
      }
    };
  }

  /**
   * 设置智能体配置
   */
  setAgentConfig(agentId: string, config: AgentConfig): void {
    this.configs.set(agentId, { ...this.defaultConfig, ...config });
    logger.debug(`配置已设置: ${agentId}, config: ${JSON.stringify(config)}`);
  }

  /**
   * 获取智能体配置
   */
  getAgentConfig(agentId: string): AgentConfig {
    return this.configs.get(agentId) || this.defaultConfig;
  }

  /**
   * 验证配置
   */
  validateConfig(config: AgentConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.version) {
      errors.push('配置版本不能为空');
    }

    if (config.settings.timeout && config.settings.timeout < 1000) {
      errors.push('超时时间不能少于1秒');
    }

    if (config.settings.retryCount && config.settings.retryCount < 0) {
      errors.push('重试次数不能为负数');
    }

    if (config.limits.maxTokens && config.limits.maxTokens < 1) {
      errors.push('最大令牌数不能少于1');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// ================ 统一缓存管理 ================

/**
 * 统一缓存管理器
 */
export class UnifiedCacheManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  /**
   * 设置缓存
   */
  set(key: string, data: any, ttl: number = 3600): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000
    });
  }

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// ================ 统一错误处理 ================

/**
 * 统一错误处理器
 */
export class UnifiedErrorHandler {
  /**
   * 处理API错误
   */
  handleApiError(error: any, context: string): FastGPTError {
    const errorInfo: FastGPTError = {
      code: 500,
      statusText: 'Internal Server Error',
      message: '未知错误',
      details: error
    };

    if (error instanceof Error) {
      errorInfo.message = error.message;
    }

    if (error?.response) {
      errorInfo.code = error.response.status || 500;
      errorInfo.statusText = error.response.statusText || 'Unknown Error';
      errorInfo.message = error.response.data?.message || error.message;
    }

    logger.error(`API错误 [${context}]:`, errorInfo);
    return errorInfo;
  }

  /**
   * 处理网络错误
   */
  handleNetworkError(error: any, context: string): FastGPTError {
    const errorInfo: FastGPTError = {
      code: 0,
      statusText: 'Network Error',
      message: '网络连接失败',
      details: error
    };

    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorInfo.message = '网络请求失败，请检查网络连接';
    }

    logger.error(`网络错误 [${context}]:`, errorInfo);
    return errorInfo;
  }

  /**
   * 处理配置错误
   */
  handleConfigError(error: any, context: string): FastGPTError {
    const errorInfo: FastGPTError = {
      code: 400,
      statusText: 'Bad Request',
      message: '配置错误',
      details: error
    };

    logger.error(`配置错误 [${context}]:`, errorInfo);
    return errorInfo;
  }

}

// ================ 统一智能体管理器 ================

/**
 * 统一智能体管理器
 * 整合所有智能体管理功能
 */
export class UnifiedAgentManager {
  private agents: Map<string, UnifiedAgent> = new Map();
  private metrics: Map<string, AgentMetrics> = new Map();
  private configManager: UnifiedConfigManager;
  private cacheManager: UnifiedCacheManager;
  private errorHandler: UnifiedErrorHandler;
  private options: Required<MultiAgentOptions>;
  private currentIndex = 0;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(options: MultiAgentOptions = {}) {
    this.configManager = new UnifiedConfigManager();
    this.cacheManager = new UnifiedCacheManager();
    this.errorHandler = new UnifiedErrorHandler();

    this.options = {
      cacheEnabled: options.cacheEnabled ?? true,
      loadBalanceStrategy: options.loadBalanceStrategy ?? { type: 'round-robin' },
      healthCheckInterval: options.healthCheckInterval ?? 30000,
      maxRetriesPerAgent: options.maxRetriesPerAgent ?? 3,
      circuitBreakerThreshold: options.circuitBreakerThreshold ?? 5,
      fallbackAgentId: options.fallbackAgentId || ''
    };

    this.startHealthCheck();
  }

  /**
   * 注册智能体
   */
  async registerAgent(agent: UnifiedAgent): Promise<void> {
    try {
      // 验证智能体配置
      const validation = this.configManager.validateConfig(agent.config);
      if (!validation.valid) {
        throw new Error(`配置验证失败: ${validation.errors.join(', ')}`);
      }

      // 设置配置
      this.configManager.setAgentConfig(agent.id, agent.config);

      // 保存智能体
      this.agents.set(agent.id, agent);

      // 初始化指标
      this.metrics.set(agent.id, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        lastUsed: 0,
        errorRate: 0
      });

      // 预热缓存
      if (this.options.cacheEnabled) {
        await this.warmupAgentCache(agent.id);
      }

      logger.debug(`✅ 智能体注册成功: ${agent.name} (${agent.id})`);
    } catch (error) {
      const errorInfo = this.errorHandler.handleConfigError(error, `注册智能体: ${agent.name}`);
      throw new Error(errorInfo.message);
    }
  }

  /**
   * 注销智能体
   */
  async unregisterAgent(agentId: string): Promise<void> {
    try {
      const agent = this.agents.get(agentId);
      if (!agent) {
        throw new Error(`智能体不存在: ${agentId}`);
      }

      // 清理缓存
      if (this.options.cacheEnabled) {
        this.cacheManager.delete(`agent:${agentId}`);
      }

      // 移除智能体
      this.agents.delete(agentId);
      this.metrics.delete(agentId);

      logger.debug(`✅ 智能体注销成功: ${agent.name} (${agentId})`);
    } catch (error) {
      const errorInfo = this.errorHandler.handleConfigError(error, `注销智能体: ${agentId}`);
      throw new Error(errorInfo.message);
    }
  }

  /**
   * 更新智能体配置
   */
  async updateAgentConfig(agentId: string, updates: Partial<UnifiedAgent>): Promise<void> {
    try {
      const existingAgent = this.agents.get(agentId);
      if (!existingAgent) {
        throw new Error(`智能体不存在: ${agentId}`);
      }

      // 合并配置
      const updatedAgent = { ...existingAgent, ...updates };

      // 重新注册智能体
      await this.unregisterAgent(agentId);
      await this.registerAgent(updatedAgent);

      logger.debug(`✅ 智能体配置更新成功: ${updatedAgent.name} (${agentId})`);
    } catch (error) {
      const errorInfo = this.errorHandler.handleConfigError(error, `更新智能体配置: ${agentId}`);
      throw new Error(errorInfo.message);
    }
  }

  /**
   * 获取最佳智能体
   */
  async getOptimalAgent(): Promise<UnifiedAgent> {
    const enabledAgents = Array.from(this.agents.values()).filter(agent => agent.isActive);

    if (enabledAgents.length === 0) {
      throw new Error('没有可用的智能体');
    }

    // 根据负载均衡策略选择智能体
    const agentId = this.selectAgentByStrategy(enabledAgents.map(agent => agent.id));
    const agent = this.agents.get(agentId);

    if (!agent) {
      throw new Error(`智能体不存在: ${agentId}`);
    }

    return agent;
  }

  /**
   * 根据ID获取智能体
   */
  getAgentById(agentId: string): UnifiedAgent {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`智能体不存在: ${agentId}`);
    }

    if (!agent.isActive) {
      throw new Error(`智能体不可用: ${agentId}`);
    }

    return agent;
  }



  /**
   * 获取所有智能体
   */
  getAllAgents(): UnifiedAgent[] {
    return Array.from(this.agents.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  /**
   * 获取智能体指标
   */
  getAgentMetrics(agentId: string): AgentMetrics | undefined {
    return this.metrics.get(agentId);
  }

  /**
   * 获取所有指标
   */
  getAllMetrics(): Record<string, AgentMetrics> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [agentId, agent] of Array.from(this.agents)) {
      if (!agent.isActive) {
        results[agentId] = false;
        continue;
      }

      try {
        // 简单的健康检查：尝试初始化聊天
        await this.initializeChat(agent);
        results[agentId] = true;
      } catch (error) {
        results[agentId] = false;
        this.handleAgentError(agentId, error as Error);
      }
    }

    return results;
  }

  /**
   * 销毁管理器
   */
  async destroy(): Promise<void> {
    // 停止健康检查
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // 清理缓存
    this.cacheManager.clear();

    // 清理数据
    this.agents.clear();
    this.metrics.clear();

    logger.debug('✅ 统一智能体管理器已销毁');
  }

  // ================ 私有方法 ================

  /**
   * 根据策略选择智能体
   */
  private selectAgentByStrategy(agentIds: string[]): string {
    if (agentIds.length === 1) {
      return agentIds[0];
    }

    const strategy = this.options.loadBalanceStrategy;

    switch (strategy.type) {
      case 'round-robin':
        return agentIds[this.currentIndex++ % agentIds.length];

      case 'weighted':
        return this.selectByWeight(agentIds, strategy.weights || {});

      case 'least-connections':
        return this.selectByLeastConnections(agentIds);

      case 'fastest-response':
        return this.selectByFastestResponse(agentIds);

      default:
        return agentIds[0];
    }
  }

  /**
   * 按权重选择智能体
   */
  private selectByWeight(agentIds: string[], weights: Record<string, number>): string {
    const availableAgents = agentIds.filter(id => this.agents.get(id)?.isActive);
    if (availableAgents.length === 0) return agentIds[0];

    let totalWeight = 0;
    const agentWeights = availableAgents.map(id => {
      const weight = weights[id] || 1;
      totalWeight += weight;
      return { id, weight };
    });

    const random = Math.random() * totalWeight;
    let currentWeight = 0;

    for (const { id, weight } of agentWeights) {
      currentWeight += weight;
      if (random <= currentWeight) {
        return id;
      }
    }

    return availableAgents[0];
  }

  /**
   * 按最少连接数选择智能体
   */
  private selectByLeastConnections(agentIds: string[]): string {
    let bestAgentId = agentIds[0];
    let minConnections = Infinity;

    for (const agentId of agentIds) {
      const metrics = this.metrics.get(agentId);
      const currentConnections = metrics?.totalRequests || 0;

      if (currentConnections < minConnections) {
        minConnections = currentConnections;
        bestAgentId = agentId;
      }
    }

    return bestAgentId;
  }

  /**
   * 按最快响应时间选择智能体
   */
  private selectByFastestResponse(agentIds: string[]): string {
    let bestAgentId = agentIds[0];
    let bestResponseTime = Infinity;

    for (const agentId of agentIds) {
      const metrics = this.metrics.get(agentId);
      const avgResponseTime = metrics?.averageResponseTime || Infinity;

      if (avgResponseTime < bestResponseTime) {
        bestResponseTime = avgResponseTime;
        bestAgentId = agentId;
      }
    }

    return bestAgentId;
  }


  /**
   * 计算平均响应时间
   */

  /**
   * 处理智能体错误
   */
  private handleAgentError(agentId: string, error: Error): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    logger.error(`智能体错误: ${agent.name} (${agentId}) - ${error.message}`);

    // 这里可以实现熔断器逻辑
    // 如果错误次数超过阈值，可以暂时禁用智能体
  }

  /**
   * 预热智能体缓存
   */
  private async warmupAgentCache(agentId: string): Promise<void> {
    try {
      const agent = this.agents.get(agentId);
      if (agent && this.options.cacheEnabled) {
        this.cacheManager.set(`agent:${agentId}`, agent, 3600);
      }
    } catch (error) {
      logger.warn(`智能体缓存预热失败: ${agentId}`, error);
    }
  }

  /**
   * 启动健康检查
   */
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.healthCheck();
      } catch (error) {
        logger.error('健康检查失败:', error);
      }
    }, this.options.healthCheckInterval);
  }

  /**
   * 初始化聊天
   */


  // ================ 公共API方法 ================

  /**
   * 初始化聊天会话 - 公共方法
   */
  async initializeChat(agent: UnifiedAgent, chatId?: string): Promise<{ chatId: string; agentId: string }> {
    try {
      const newChatId = chatId || this.generateChatId();
      // 这里可以添加实际的聊天初始化逻辑
      return { chatId: newChatId, agentId: agent.id };
    } catch (error) {
      logger.error('初始化聊天失败:', error);
      throw this.errorHandler.handleApiError(error, 'initializeChat');
    }
  }

  /**
   * 流式聊天 - 公共方法
   */
  async streamChat(agent: UnifiedAgent, messages: FastGPTMessage[], _options: FastGPTRequestOptions = {}): Promise<void> {
    try {
      // 这里可以添加实际的流式聊天逻辑
      logger.info(`流式聊天: ${agent.name}, messageCount: ${messages.length}`);
    } catch (error) {
      logger.error('流式聊天失败:', error);
      throw this.errorHandler.handleApiError(error, 'streamChat');
    }
  }

  /**
   * 非流式聊天 - 公共方法
   */
  async chat(agent: UnifiedAgent, messages: FastGPTMessage[], _options: FastGPTRequestOptions = {}): Promise<FastGPTChatResponse> {
    try {
      // 这里可以添加实际的聊天逻辑
      logger.info(`聊天: ${agent.name}, messageCount: ${messages.length}`);

      // 返回模拟响应
      return {
        id: 'mock-chat-id',
        object: 'chat.completion',
        created: Date.now(),
        model: agent.config.multimodalModel || 'gpt-3.5-turbo',
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: '这是一个模拟响应'
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15
        }
      };
    } catch (error) {
      logger.error('聊天失败:', error);
      throw this.errorHandler.handleApiError(error, 'chat');
    }
  }

  /**
   * 获取问题建议 - 公共方法
   */
  async getQuestionSuggestions(_agent: UnifiedAgent, _customConfig?: any): Promise<string[]> {
    try {
      // 模拟问题建议生成
      const suggestions = [
        '请介绍一下这个功能',
        '如何使用这个工具？',
        '有什么注意事项吗？',
        '能否提供更多示例？'
      ];

      return suggestions;
    } catch (error) {
      logger.error('获取问题建议失败:', error);
      throw this.errorHandler.handleApiError(error, 'getQuestionSuggestions');
    }
  }

  /**
   * 获取缓存管理器
   */
  getCacheManager() {
    return this.cacheManager;
  }

  /**
   * 生成聊天ID
   */
  private generateChatId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ================ 单例实例 ================

/**
 * 全局统一智能体管理器实例
 */
let globalUnifiedAgentManager: UnifiedAgentManager | null = null;

/**
 * 获取全局统一智能体管理器实例
 */
export function getGlobalUnifiedAgentManager(): UnifiedAgentManager {
  if (!globalUnifiedAgentManager) {
    globalUnifiedAgentManager = new UnifiedAgentManager();
  }
  return globalUnifiedAgentManager;
}

/**
 * 重置全局统一智能体管理器实例
 */
export function resetGlobalUnifiedAgentManager(): void {
  if (globalUnifiedAgentManager) {
    globalUnifiedAgentManager.destroy();
    globalUnifiedAgentManager = null;
  }
}

/**
 * 获取全局缓存管理器实例
 */
export function getGlobalCacheManager(): UnifiedCacheManager {
  return getGlobalUnifiedAgentManager().getCacheManager();
}
