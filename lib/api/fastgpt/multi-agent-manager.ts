/**
 * FastGPT 多智能体动态配置管理器
 * 支持多个FastGPT智能体的配置管理、动态切换和负载均衡
 */

import type { Agent, GlobalVariable } from '@/types/agent';
import { FastGPTClient } from './index';
import { logger } from '@/lib/utils/logger';

export interface AgentConfig {
  id: string;
  name: string;
  appId: string;
  apiKey: string;
  apiUrl: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  multimodalModel: string;
  supportsStream: boolean;
  supportsDetail: boolean;
  globalVariables: GlobalVariable[];
  welcomeText: string;
  isEnabled: boolean;
  order: number;
  lastUsed?: number;
  usageCount?: number;
  errorCount?: number;
  lastError?: string;
}

export interface AgentMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastUsed: number;
  errorRate: number;
}

export interface LoadBalanceStrategy {
  type: 'round-robin' | 'weighted' | 'least-connections' | 'fastest-response';
  weights?: Record<string, number>; // 用于 weighted 策略
}

export interface MultiAgentOptions {
  cacheEnabled?: boolean;
  loadBalanceStrategy?: LoadBalanceStrategy;
  healthCheckInterval?: number;
  maxRetriesPerAgent?: number;
  circuitBreakerThreshold?: number;
  fallbackAgentId?: string;
}

/**
 * FastGPT 多智能体管理器
 * 提供智能体配置管理、动态切换、负载均衡和容错机制
 */
export class FastGPTMultiAgentManager {
  private agents: Map<string, AgentConfig> = new Map();
  private clients: Map<string, FastGPTClient> = new Map();
  private metrics: Map<string, AgentMetrics> = new Map();
  private currentIndex = 0;
  private options: Required<MultiAgentOptions>;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(options: MultiAgentOptions = {}) {
    this.options = {
      cacheEnabled: options.cacheEnabled ?? true,
      loadBalanceStrategy: options.loadBalanceStrategy ?? {
        type: 'round-robin',
      },
      healthCheckInterval: options.healthCheckInterval ?? 30000, // 30秒
      maxRetriesPerAgent: options.maxRetriesPerAgent ?? 3,
      circuitBreakerThreshold: options.circuitBreakerThreshold ?? 5,
      fallbackAgentId: options.fallbackAgentId || '',
    };

    // 初始化健康检查
    this.startHealthCheck();
  }

  /**
   * 注册新的智能体配置
   */
  async registerAgent(config: AgentConfig): Promise<void> {
    try {
      // 验证配置
      this.validateAgentConfig(config);

      // 创建客户端实例
      const agent: Agent = {
        id: config.id,
        name: config.name,
        type: 'fastgpt',
        description: '',
        iconType: 'default',
        avatar: '',
        order: config.order,
        isPublished: true,
        apiKey: config.apiKey,
        appId: config.appId,
        apiUrl: config.apiUrl,
        systemPrompt: config.systemPrompt,
        isActive: true,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        multimodalModel: config.multimodalModel,
        supportsStream: config.supportsStream,
        supportsDetail: config.supportsDetail,
        globalVariables: config.globalVariables as GlobalVariable[],
        welcomeText: config.welcomeText,
        chatId: '',
        config: {
          version: '1.0.0',
          type: 'fastgpt',
          id: config.id,
          name: config.name,
          description: (config as any).description || '',
          apiKey: config.apiKey,
          appId: config.appId,
          apiUrl: config.apiUrl,
          systemPrompt: config.systemPrompt,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          multimodalModel: config.multimodalModel,
          supportsFileUpload: (config as any).supportsFileUpload || false,
          supportsImageUpload: (config as any).supportsImageUpload || false,
          supportsStream: config.supportsStream,
          supportsDetail: config.supportsDetail,
          globalVariables: config.globalVariables,
          welcomeText: config.welcomeText,
          order: config.order,
          isPublished: (config as any).isPublished || true,
          isActive: true,
          settings: {
            timeout: 30000,
            retryCount: 3,
            cacheEnabled: true,
            logLevel: 'info',
            healthCheckInterval: 30000,
            circuitBreakerThreshold: 5
          },
          features: {
            streaming: config.supportsStream || true,
            fileUpload: (config as any).supportsFileUpload || false,
            imageUpload: (config as any).supportsImageUpload || false,
            voiceInput: false,
            voiceOutput: false,
            multimodal: !!config.multimodalModel,
            detail: config.supportsDetail || true,
            questionGuide: true
          },
          limits: {
            maxTokens: config.maxTokens || 2048,
            maxFileSize: 10 * 1024 * 1024,
            maxRequests: 1000,
            rateLimit: 100,
            maxConnections: 10
          }
        }
      };

      const client = new FastGPTClient(agent);

      // 测试连接
      await this.testAgentConnection(client);

      // 保存配置和客户端
      this.agents.set(config.id, config);
      this.clients.set(config.id, client);

      // 初始化指标
      this.metrics.set(config.id, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        lastUsed: 0,
        errorRate: 0,
      });

      // 预热缓存
      if (this.options.cacheEnabled) {
        await this.warmupAgentCache(config.id);
      }

      logger.debug(`✅ 智能体注册成功: ${config.name} (${config.id})`);
    } catch (error) {
      logger.error(`❌ 智能体注册失败: ${config.name}`, error);
      throw error;
    }
  }

  /**
   * 注销智能体
   */
  async unregisterAgent(agentId: string): Promise<void> {
    try {
      const config = this.agents.get(agentId);
      if (!config) {
        throw new Error(`智能体不存在: ${agentId}`);
      }

      // 清理缓存
      if (this.options.cacheEnabled) {
        await this.clearAgentCache(agentId);
      }

      // 清理客户端
      const client = this.clients.get(agentId);
      if (client) {
        await client.clearCache();
      }

      // 移除配置
      this.agents.delete(agentId);
      this.clients.delete(agentId);
      this.metrics.delete(agentId);

      logger.debug(`✅ 智能体注销成功: ${config.name} (${agentId})`);
    } catch (error) {
      logger.error(`❌ 智能体注销失败: ${agentId}`, error);
      throw error;
    }
  }

  /**
   * 更新智能体配置
   */
  async updateAgentConfig(
    agentId: string,
    updates: Partial<AgentConfig>
  ): Promise<void> {
    try {
      const existingConfig = this.agents.get(agentId);
      if (!existingConfig) {
        throw new Error(`智能体不存在: ${agentId}`);
      }

      // 合并配置
      const updatedConfig = { ...existingConfig, ...updates };

      // 重新注册智能体
      await this.unregisterAgent(agentId);
      await this.registerAgent(updatedConfig);

      logger.debug(`✅ 智能体配置更新成功: ${updatedConfig.name} (${agentId})`);
    } catch (error) {
      logger.error(`❌ 智能体配置更新失败: ${agentId}`, error);
      throw error;
    }
  }

  /**
   * 获取最佳智能体客户端
   */
  async getOptimalAgent(): Promise<{ agentId: string; client: FastGPTClient }> {
    const enabledAgents = Array.from(this.agents.entries()).filter(
      ([_, config]) => config.isEnabled
    );

    if (enabledAgents.length === 0) {
      throw new Error('没有可用的FastGPT智能体');
    }

    // 根据负载均衡策略选择智能体
    const agentId = this.selectAgentByStrategy(enabledAgents.map(([id]) => id));
    const client = this.clients.get(agentId);

    if (!client) {
      throw new Error(`智能体客户端不存在: ${agentId}`);
    }

    return { agentId, client };
  }

  /**
   * 根据ID获取智能体客户端
   */
  async getAgentById(agentId: string): Promise<FastGPTClient> {
    const client = this.clients.get(agentId);
    if (!client) {
      throw new Error(`智能体客户端不存在: ${agentId}`);
    }

    const config = this.agents.get(agentId);
    if (!config || !config.isEnabled) {
      throw new Error(`智能体不可用: ${agentId}`);
    }

    return client;
  }

  /**
   * 流式聊天（自动选择最佳智能体）
   */
  async streamChat(
    messages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>,
    options: Parameters<FastGPTClient['streamChat']>[1] = {},
    preferredAgentId?: string
  ): Promise<{ agentId: string; response: Promise<void> }> {
    const startTime = Date.now();
    let agentId: string = '';
    let client: FastGPTClient;

    try {
      if (preferredAgentId) {
        // 使用指定的智能体
        client = await this.getAgentById(preferredAgentId);
        agentId = preferredAgentId;
      } else {
        // 自动选择最佳智能体
        const optimal = await this.getOptimalAgent();
        agentId = optimal.agentId;
        client = optimal.client;
      }

      // 更新指标
      this.updateMetrics(agentId, 'request');

      // 创建包装的回调函数以记录指标
      const wrappedOptions = {
        ...options,
        onStart: () => {
          this.updateMetrics(agentId, 'start');
          options.onStart?.();
        },
        onFinish: () => {
          const responseTime = Date.now() - startTime;
          this.updateMetrics(agentId, 'success', responseTime);
          options.onFinish?.();
        },
        onError: (error: Error) => {
          this.updateMetrics(agentId, 'error');
          this.handleAgentError(agentId, error);
          options.onError?.(error);
        },
      };

      const response = client.streamChat(messages, wrappedOptions);

      return { agentId, response };
    } catch (error) {
      // 如果有回退智能体，尝试使用回退
      if (
        this.options.fallbackAgentId &&
        this.options.fallbackAgentId !== agentId
      ) {
        try {
          logger.debug(`🔄 尝试使用回退智能体: ${this.options.fallbackAgentId}`);
          const fallbackClient = await this.getAgentById(
            this.options.fallbackAgentId
          );
          const fallbackResponse = fallbackClient.streamChat(messages, options);
          return {
            agentId: this.options.fallbackAgentId,
            response: fallbackResponse,
          };
        } catch (fallbackError) {
          logger.error('❌ 回退智能体也失败:', fallbackError);
        }
      }

      throw error;
    }
  }

  /**
   * 获取所有智能体配置
   */
  getAllAgentConfigs(): AgentConfig[] {
    return Array.from(this.agents.values()).sort((a, b) => a.order - b.order);
  }

  /**
   * 获取智能体指标
   */
  getAgentMetrics(agentId: string): AgentMetrics | undefined {
    return this.metrics.get(agentId);
  }

  /**
   * 获取所有智能体指标
   */
  getAllMetrics(): Record<string, AgentMetrics> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * 启用/禁用智能体
   */
  async setAgentEnabled(agentId: string, enabled: boolean): Promise<void> {
    const config = this.agents.get(agentId);
    if (!config) {
      throw new Error(`智能体不存在: ${agentId}`);
    }

    config.isEnabled = enabled;
    logger.debug(
      `✅ 智能体 ${enabled ? '启用' : '禁用'}: ${config.name} (${agentId})`
    );
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [agentId, config] of Array.from(this.agents)) {
      if (!config.isEnabled) {
        results[agentId] = false;
        continue;
      }

      try {
        const client = this.clients.get(agentId);
        if (!client) {
          results[agentId] = false;
          continue;
        }

        // 简单的健康检查：尝试初始化聊天
        await client.initializeChat();
        results[agentId] = true;

        // 重置错误计数
        if (config.errorCount && config.errorCount > 0) {
          config.errorCount = 0;
          config.lastError = undefined;
        }
      } catch (error) {
        results[agentId] = false;
        this.handleAgentError(agentId, error as Error);
      }
    }

    return results;
  }

  /**
   * 重置智能体指标
   */
  resetMetrics(agentId?: string): void {
    if (agentId) {
      const metrics = this.metrics.get(agentId);
      if (metrics) {
        Object.assign(metrics, {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageResponseTime: 0,
          lastUsed: 0,
          errorRate: 0,
        });
      }
    } else {
      for (const metrics of Array.from(this.metrics.values())) {
        Object.assign(metrics, {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageResponseTime: 0,
          lastUsed: 0,
          errorRate: 0,
        });
      }
    }
  }

  /**
   * 销毁管理器
   */
  async destroy(): Promise<void> {
    // 停止健康检查
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // 清理所有客户端
    for (const client of Array.from(this.clients.values())) {
      await client.clearCache();
    }

    // 清理缓存
    if (this.options.cacheEnabled) {
      for (const agentId of Array.from(this.agents.keys())) {
        await this.clearAgentCache(agentId);
      }
    }

    this.agents.clear();
    this.clients.clear();
    this.metrics.clear();

    logger.debug('✅ FastGPT多智能体管理器已销毁');
  }

  // ================ 私有方法 ================

  /**
   * 验证智能体配置
   */
  private validateAgentConfig(config: AgentConfig): void {
    if (!config.id || !config.name) {
      throw new Error('智能体ID和名称不能为空');
    }

    if (!config.appId || !config.apiKey) {
      throw new Error('智能体AppID和API密钥不能为空');
    }

    if (!config.apiUrl) {
      throw new Error('智能体API URL不能为空');
    }

    if (config.temperature < 0 || config.temperature > 2) {
      throw new Error('温度参数必须在0-2之间');
    }

    if (config.maxTokens < 1 || config.maxTokens > 100000) {
      throw new Error('最大令牌数必须在1-100000之间');
    }
  }

  /**
   * 测试智能体连接
   */
  private async testAgentConnection(client: FastGPTClient): Promise<void> {
    try {
      await client.initializeChat();
    } catch (error) {
      throw new Error(`智能体连接测试失败: ${error}`);
    }
  }

  /**
   * 预热智能体缓存
   */
  private async warmupAgentCache(agentId: string): Promise<void> {
    try {
      const client = this.clients.get(agentId);
      if (client) {
        await client.warmupCache();
      }
    } catch (error) {
      logger.warn(`智能体缓存预热失败: ${agentId}`, error);
    }
  }

  /**
   * 清理智能体缓存
   */
  private async clearAgentCache(agentId: string): Promise<void> {
    try {
      const client = this.clients.get(agentId);
      if (client) {
        await client.clearCache();
      }
    } catch (error) {
      logger.warn(`智能体缓存清理失败: ${agentId}`, error);
    }
  }

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
  private selectByWeight(
    agentIds: string[],
    weights: Record<string, number>
  ): string {
    const availableAgents = agentIds.filter(
      id => this.agents.get(id)?.isEnabled
    );
    if (availableAgents.length === 0) return agentIds[0];

    // 计算总权重
    let totalWeight = 0;
    const agentWeights = availableAgents.map(id => {
      const weight = weights[id] || 1;
      totalWeight += weight;
      return { id, weight };
    });

    // 随机选择
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
   * 更新智能体指标
   */
  private updateMetrics(
    agentId: string,
    event: 'request' | 'start' | 'success' | 'error',
    responseTime?: number
  ): void {
    const metrics = this.metrics.get(agentId);
    if (!metrics) return;

    switch (event) {
      case 'request':
        metrics.totalRequests++;
        metrics.lastUsed = Date.now();
        break;

      case 'success':
        metrics.successfulRequests++;
        if (responseTime) {
          metrics.averageResponseTime = this.calculateAverageResponseTime(
            metrics,
            responseTime
          );
        }
        break;

      case 'error':
        metrics.failedRequests++;
        break;
    }

    // 计算错误率
    metrics.errorRate =
      metrics.totalRequests > 0
        ? metrics.failedRequests / metrics.totalRequests
        : 0;
  }

  /**
   * 计算平均响应时间
   */
  private calculateAverageResponseTime(
    metrics: AgentMetrics,
    newResponseTime: number
  ): number {
    const totalRequests = metrics.successfulRequests;
    if (totalRequests === 0) return newResponseTime;

    const currentAvg = metrics.averageResponseTime;
    return (currentAvg * (totalRequests - 1) + newResponseTime) / totalRequests;
  }

  /**
   * 处理智能体错误
   */
  private handleAgentError(agentId: string, error: Error): void {
    const config = this.agents.get(agentId);
    if (!config) return;

    // 增加错误计数
    config.errorCount = (config.errorCount || 0) + 1;
    config.lastError = error.message;

    logger.error(`智能体错误: ${config.name} (${agentId}) - ${error.message}`);

    // 如果错误次数超过阈值，禁用智能体
    if (config.errorCount >= this.options.circuitBreakerThreshold) {
      logger.warn(
        `🔥 智能体错误次数超过阈值，自动禁用: ${config.name} (${agentId})`
      );
      config.isEnabled = false;
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
}

// ================ 单例实例 ================

/**
 * 全局FastGPT多智能体管理器实例
 */
let globalMultiAgentManager: FastGPTMultiAgentManager | null = null;

/**
 * 获取全局多智能体管理器实例
 */
export function getGlobalMultiAgentManager(): FastGPTMultiAgentManager {
  if (!globalMultiAgentManager) {
    globalMultiAgentManager = new FastGPTMultiAgentManager();
  }
  return globalMultiAgentManager;
}

/**
 * 重置全局多智能体管理器实例
 */
export function resetGlobalMultiAgentManager(): void {
  if (globalMultiAgentManager) {
    globalMultiAgentManager.destroy();
    globalMultiAgentManager = null;
  }
}

// ================ 便捷函数 ================

/**
 * 从数据库配置初始化多智能体管理器
 */
export async function initializeMultiAgentManagerFromDB(): Promise<FastGPTMultiAgentManager> {
  const manager = getGlobalMultiAgentManager();

  try {
    // 获取所有已发布的FastGPT智能体配置
    const response = await fetch('/api/agent-config');
    const result = await response.json();

    let fastgptAgents: unknown[] = [];
    if (result.success && result.data) {
      fastgptAgents = result.data.filter(
        (agent: unknown) => {
          const agentData = agent as Record<string, unknown>;
          return agentData.type === 'fastgpt' || agentData.type === 'chat';
        }
      );

      for (const agent of fastgptAgents) {
        const agentData = agent as Record<string, unknown>;
        await manager.registerAgent({
          id: String(agentData.id),
          name: String(agentData.name),
          appId: String(agentData.appId),
          apiKey: String(agentData.apiKey),
          apiUrl: String(agentData.apiUrl),
          systemPrompt: String(agentData.systemPrompt),
          temperature: Number(agentData.temperature),
          maxTokens: Number(agentData.maxTokens),
          multimodalModel: String(agentData.multimodalModel),
          supportsStream: Boolean(agentData.supportsStream),
          supportsDetail: Boolean(agentData.supportsDetail),
          globalVariables: agentData.globalVariables as any[] || [],
          welcomeText: String(agentData.welcomeText),
          isEnabled: Boolean(agentData.isPublished),
          order: Number(agentData.order),
        });
      }
    }

    logger.debug(
      `✅ 多智能体管理器初始化完成，加载了 ${fastgptAgents.length || 0} 个FastGPT智能体`
    );
    return manager;
  } catch (error) {
    logger.error('❌ 多智能体管理器初始化失败:', error);
    throw error;
  }
}

/**
 * 获取智能体选择建议
 */
export function getAgentSelectionSuggestion(
  agents: AgentConfig[],
  _userQuery: string,
  _conversationHistory?: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>
): { agentId: string; reason: string } | null {
  // 这里可以实现更复杂的智能体选择逻辑
  // 基于用户查询内容、对话历史等因素选择最适合的智能体

  if (agents.length === 0) return null;

  // 简单的选择策略：可以基于智能体的描述、系统提示词等
  // 这里只是示例，实际可以根据业务需求实现更复杂的逻辑

  const defaultAgent = agents[0];
  return {
    agentId: defaultAgent.id,
    reason: '默认选择第一个可用智能体',
  };
}
