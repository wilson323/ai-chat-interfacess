/**
 * FastGPT 智能客户端
 * 基于多智能体管理器，提供智能路由、自动重试和性能优化
 */

import type { Agent } from '../../../types/agent';
import type { Message } from '../../../types/message';
import {
  FastGPTMultiAgentManager,
  type AgentConfig,
  type LoadBalanceStrategy,
  getGlobalMultiAgentManager,
  initializeMultiAgentManagerFromDB,
} from './multi-agent-manager';
import { simpleCacheManager } from '@/lib/cache/simple-cache';
import { API_CONSTANTS } from '@/lib/storage/shared/constants';

export interface IntelligentClientOptions {
  autoInitialize?: boolean;
  loadBalanceStrategy?: LoadBalanceStrategy;
  enableCache?: boolean;
  enableMetrics?: boolean;
  maxRetries?: number;
  fallbackToOffline?: boolean;
  smartAgentSelection?: boolean;
}

export interface ChatRequestOptions {
  temperature?: number;
  maxTokens?: number;
  detail?: boolean;
  stream?: boolean;
  agentId?: string; // 指定智能体ID
  variables?: Record<string, any>;
  onStart?: () => void;
  onChunk?: (chunk: string) => void;
  onIntermediateValue?: (value: any, eventType: string) => void;
  onProcessingStep?: (step: any) => void;
  onError?: (error: Error) => void;
  onFinish?: () => void;
  signal?: AbortSignal;
}

export interface IntelligentClientMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  agentUsage: Record<string, number>;
  errorRate: number;
}

/**
 * FastGPT 智能客户端
 * 提供统一的API接口，内部自动处理多智能体管理、缓存、重试等
 */
export class FastGPTIntelligentClient {
  private manager: FastGPTMultiAgentManager;
  private options: Required<IntelligentClientOptions>;
  private metrics: IntelligentClientMetrics;
  private isInitialized = false;
  private initializationPromise?: Promise<void>;

  constructor(options: IntelligentClientOptions = {}) {
    this.manager = getGlobalMultiAgentManager();
    this.options = {
      autoInitialize: options.autoInitialize ?? true,
      loadBalanceStrategy: options.loadBalanceStrategy ?? { type: 'round-robin' },
      enableCache: options.enableCache ?? true,
      enableMetrics: options.enableMetrics ?? true,
      maxRetries: options.maxRetries ?? 3,
      fallbackToOffline: options.fallbackToOffline ?? true,
      smartAgentSelection: options.smartAgentSelection ?? true,
    };

    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      agentUsage: {},
      errorRate: 0,
    };

    // 自动初始化
    if (this.options.autoInitialize) {
      this.initialize();
    }
  }

  /**
   * 初始化客户端
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (!this.initializationPromise) {
      this.initializationPromise = this.doInitialize();
    }

    return this.initializationPromise;
  }

  /**
   * 执行初始化
   */
  private async doInitialize(): Promise<void> {
    try {
      console.log('🚀 正在初始化FastGPT智能客户端...');

      // 从数据库初始化多智能体管理器
      await initializeMultiAgentManagerFromDB();

      // 预热缓存
      if (this.options.enableCache) {
        await this.warmupCache();
      }

      this.isInitialized = true;
      console.log('✅ FastGPT智能客户端初始化完成');
    } catch (error) {
      console.error('❌ FastGPT智能客户端初始化失败:', error);
      throw error;
    }
  }

  /**
   * 流式聊天
   */
  async streamChat(
    messages: any[],
    options: ChatRequestOptions = {}
  ): Promise<{ agentId: string; response: Promise<void> }> {
    const startTime = Date.now();
    this.updateMetrics('request');

    try {
      // 确保已初始化
      if (!this.isInitialized) {
        await this.initialize();
      }

      // 检查缓存
      if (this.options.enableCache && !options.stream) {
        const cached = await this.getFromCache(messages, options.agentId);
        if (cached) {
          this.updateMetrics('cacheHit');
          return this.handleCachedResponse(cached, options);
        }
      }

      // 智能选择智能体
      let selectedAgentId = options.agentId;
      if (!selectedAgentId && this.options.smartAgentSelection) {
        selectedAgentId = await this.selectBestAgent(messages, options);
      }

      // 发送请求
      const result = await this.manager.streamChat(
        messages,
        {
          ...options,
          variables: options.variables || {},
        },
        selectedAgentId
      );

      // 记录智能体使用情况
      if (result.agentId) {
        this.metrics.agentUsage[result.agentId] = (this.metrics.agentUsage[result.agentId] || 0) + 1;
      }

      // 包装响应以记录指标
      const wrappedResponse = result.response
        .then(() => {
          const responseTime = Date.now() - startTime;
          this.updateMetrics('success', responseTime);
        })
        .catch((error) => {
          this.updateMetrics('error');
          throw error;
        });

      return { agentId: result.agentId, response: wrappedResponse };
    } catch (error) {
      this.updateMetrics('error');

      if (this.options.fallbackToOffline) {
        return this.handleFallbackResponse(messages, options, error as Error);
      }

      throw error;
    }
  }

  /**
   * 初始化聊天会话
   */
  async initializeChat(agentId?: string, chatId?: string): Promise<any> {
    try {
      // 确保已初始化
      if (!this.isInitialized) {
        await this.initialize();
      }

      let client;
      if (agentId) {
        client = await this.manager.getAgentById(agentId);
      } else {
        const optimal = await this.manager.getOptimalAgent();
        client = optimal.client;
      }

      return await client.initializeChat(chatId);
    } catch (error) {
      if (this.options.fallbackToOffline) {
        return this.generateFallbackInitializeResponse(agentId, chatId);
      }
      throw error;
    }
  }

  /**
   * 获取问题建议
   */
  async getQuestionSuggestions(
    agentId?: string,
    chatId?: string,
    customConfig?: {
      open?: boolean;
      model?: string;
      customPrompt?: string;
    }
  ): Promise<string[]> {
    try {
      // 确保已初始化
      if (!this.isInitialized) {
        await this.initialize();
      }

      let client;
      if (agentId) {
        client = await this.manager.getAgentById(agentId);
      } else {
        const optimal = await this.manager.getOptimalAgent();
        client = optimal.client;
      }

      return await client.getQuestionSuggestions(customConfig);
    } catch (error) {
      console.warn('获取问题建议失败:', error);
      return this.getDefaultSuggestions();
    }
  }

  /**
   * 获取所有可用智能体
   */
  async getAvailableAgents(): Promise<AgentConfig[]> {
    try {
      // 确保已初始化
      if (!this.isInitialized) {
        await this.initialize();
      }

      return this.manager.getAllAgentConfigs().filter(agent => agent.isEnabled);
    } catch (error) {
      console.error('获取可用智能体失败:', error);
      return [];
    }
  }

  /**
   * 获取智能体指标
   */
  async getAgentMetrics(agentId?: string): Promise<Record<string, any> | undefined> {
    try {
      if (agentId) {
        return this.manager.getAgentMetrics(agentId);
      }
      return this.manager.getAllMetrics();
    } catch (error) {
      console.error('获取智能体指标失败:', error);
      return undefined;
    }
  }

  /**
   * 获取客户端指标
   */
  getClientMetrics(): IntelligentClientMetrics {
    return { ...this.metrics };
  }

  /**
   * 重置指标
   */
  resetMetrics(agentId?: string): void {
    if (agentId) {
      this.manager.resetMetrics(agentId);
    } else {
      this.manager.resetMetrics();
      this.resetClientMetrics();
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      return await this.manager.healthCheck();
    } catch (error) {
      console.error('健康检查失败:', error);
      return {};
    }
  }

  /**
   * 重新加载智能体配置
   */
  async reloadAgentConfigs(): Promise<void> {
    try {
      // 销毁现有管理器
      await this.manager.destroy();

      // 重新初始化
      resetGlobalMultiAgentManager();
      this.manager = getGlobalMultiAgentManager();

      // 重新加载配置
      await initializeMultiAgentManagerFromDB();

      console.log('✅ 智能体配置重新加载完成');
    } catch (error) {
      console.error('重新加载智能体配置失败:', error);
      throw error;
    }
  }

  /**
   * 销毁客户端
   */
  async destroy(): Promise<void> {
    try {
      await this.manager.destroy();
      this.isInitialized = false;
      this.initializationPromise = undefined;
      console.log('✅ FastGPT智能客户端已销毁');
    } catch (error) {
      console.error('销毁智能客户端失败:', error);
    }
  }

  // ================ 私有方法 ================

  /**
   * 从缓存获取响应
   */
  private async getFromCache(
    messages: any[],
    agentId?: string
  ): Promise<string | null> {
    try {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage) return null;

      const cacheKey = {
        agentId: agentId || 'auto',
        chatId: 'default',
        messageId: this.hashMessage(lastMessage.content),
        userId: 'anonymous',
      };

      const cached = await simpleCacheManager.get<any>(`${cacheKey.agentId}:${cacheKey.chatId}:${cacheKey.messageId}`);
      if (cached && this.isValidCache(cached)) {
        console.log('🎯 智能客户端缓存命中');
        return cached.response;
      }
    } catch (error) {
      console.warn('缓存查询失败:', error);
    }
    return null;
  }

  /**
   * 处理缓存响应
   */
  private handleCachedResponse(
    cachedResponse: string,
    options: ChatRequestOptions
  ): { agentId: string; response: Promise<void> } {
    const response = new Promise<void>((resolve) => {
      if (options.onStart) options.onStart();
      if (options.onChunk) {
        // 模拟流式输出
        const chunks = this.splitIntoChunks(cachedResponse, 10);
        chunks.forEach((chunk, index) => {
          setTimeout(() => options.onChunk!(chunk), index * 50);
        });
      }
      if (options.onFinish) {
        setTimeout(() => {
          options.onFinish();
          resolve();
        }, chunks.length * 50 + 100);
      }
    });

    return { agentId: 'cached', response };
  }

  /**
   * 智能选择最佳智能体
   */
  private async selectBestAgent(
    messages: any[],
    options: ChatRequestOptions
  ): Promise<string | undefined> {
    try {
      const availableAgents = await this.getAvailableAgents();
      if (availableAgents.length === 0) {
        return undefined;
      }

      // 简单的智能选择策略
      // 可以根据查询内容、对话历史、智能体专长等进行选择
      const lastMessage = messages[messages.length - 1];
      const query = lastMessage?.content || '';

      // 基于关键词匹配选择智能体
      for (const agent of availableAgents) {
        if (this.isAgentSuitableForQuery(agent, query)) {
          console.log(`🎯 智能选择智能体: ${agent.name} (${agent.id})`);
          return agent.id;
        }
      }

      // 默认返回第一个可用智能体
      return availableAgents[0].id;
    } catch (error) {
      console.warn('智能选择智能体失败:', error);
      return undefined;
    }
  }

  /**
   * 判断智能体是否适合处理查询
   */
  private isAgentSuitableForQuery(agent: AgentConfig, query: string): boolean {
    const lowerQuery = query.toLowerCase();

    // 基于系统提示词和描述进行匹配
    const contexts = [
      agent.systemPrompt,
      agent.welcomeText,
      agent.name,
    ].join(' ').toLowerCase();

    // 简单的关键词匹配逻辑
    // 可以根据业务需求扩展更复杂的匹配算法
    const keywords = {
      // 可以添加更多关键词匹配规则
    };

    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => lowerQuery.includes(word)) && contexts.includes(category)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 处理回退响应
   */
  private async handleFallbackResponse(
    messages: any[],
    options: ChatRequestOptions,
    error: Error
  ): Promise<{ agentId: string; response: Promise<void> }> {
    console.warn('🔄 使用回退响应模式:', error.message);

    const fallbackMessage = this.generateFallbackMessage(error);
    const response = new Promise<void>((resolve) => {
      if (options.onStart) options.onStart();
      if (options.onChunk) options.onChunk(fallbackMessage);
      if (options.onFinish) {
        setTimeout(() => {
          options.onFinish!();
          resolve();
        }, 100);
      }
    });

    return { agentId: 'fallback', response };
  }

  /**
   * 生成回退消息
   */
  private generateFallbackMessage(error: Error): string {
    if (error.message.includes('API') || error.message.includes('密钥')) {
      return '抱歉，我暂时无法连接到AI服务。请稍后再试，或联系管理员检查服务配置。';
    }

    if (error.message.includes('网络') || error.message.includes('连接')) {
      return '网络连接出现问题，请检查您的网络连接后重试。';
    }

    return '抱歉，服务暂时不可用。请稍后再试。';
  }

  /**
   * 生成回退初始化响应
   */
  private generateFallbackInitializeResponse(agentId?: string, chatId?: string): any {
    return {
      code: 200,
      data: {
        chatId: chatId || `fallback_${Date.now()}`,
        appId: 'fallback',
        variables: {},
        app: {
          chatConfig: {
            questionGuide: false,
            ttsConfig: { type: 'normal' },
            whisperConfig: {
              open: false,
              autoSend: false,
              autoTTSResponse: false,
            },
            chatInputGuide: { open: false, textList: [], customUrl: '' },
            instruction: '',
            variables: [],
            fileSelectConfig: {
              canSelectFile: false,
              canSelectImg: false,
              maxFiles: 5,
            },
            _id: '',
            welcomeText: '欢迎使用智能助手！',
          },
          chatModels: ['gpt-3.5-turbo'],
          name: 'AI Assistant',
          avatar: '',
          intro: '智能助手',
          type: 'chat',
          pluginInputs: [],
        },
      },
    };
  }

  /**
   * 获取默认问题建议
   */
  private getDefaultSuggestions(): string[] {
    return [
      '你能做什么？',
      '介绍一下你的功能',
      '如何使用你的服务？',
      '你有哪些限制？',
      '能给我一些使用示例吗？',
    ];
  }

  /**
   * 预热缓存
   */
  private async warmupCache(): Promise<void> {
    try {
      console.log('🔥 预热智能客户端缓存...');
      // 预热逻辑可以根据需要实现
    } catch (error) {
      console.warn('缓存预热失败:', error);
    }
  }

  /**
   * 更新客户端指标
   */
  private updateMetrics(
    event: 'request' | 'success' | 'error' | 'cacheHit',
    responseTime?: number
  ): void {
    if (!this.options.enableMetrics) return;

    switch (event) {
      case 'request':
        this.metrics.totalRequests++;
        break;

      case 'success':
        this.metrics.successfulRequests++;
        if (responseTime) {
          this.metrics.averageResponseTime = this.calculateAverageResponseTime(responseTime);
        }
        break;

      case 'error':
        this.metrics.failedRequests++;
        break;

      case 'cacheHit':
        // 缓存命中率计算可以在获取指标时进行
        break;
    }

    // 计算错误率
    this.metrics.errorRate = this.metrics.totalRequests > 0
      ? this.metrics.failedRequests / this.metrics.totalRequests
      : 0;
  }

  /**
   * 计算平均响应时间
   */
  private calculateAverageResponseTime(newResponseTime: number): number {
    const totalRequests = this.metrics.successfulRequests;
    if (totalRequests === 0) return newResponseTime;

    const currentAvg = this.metrics.averageResponseTime;
    return (currentAvg * (totalRequests - 1) + newResponseTime) / totalRequests;
  }

  /**
   * 重置客户端指标
   */
  private resetClientMetrics(): void {
    Object.assign(this.metrics, {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      agentUsage: {},
      errorRate: 0,
    });
  }

  /**
   * 哈希消息内容
   */
  private hashMessage(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 分割文本为块
   */
  private splitIntoChunks(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * 检查缓存是否有效
   */
  private isValidCache(cached: any): boolean {
    const now = Date.now();
    const age = now - cached.timestamp;
    return age < cached.ttl * 1000;
  }
}

// ================ 便捷函数 ================

/**
 * 创建智能客户端实例
 */
export function createIntelligentClient(
  options?: IntelligentClientOptions
): FastGPTIntelligentClient {
  return new FastGPTIntelligentClient(options);
}

/**
 * 获取全局智能客户端实例
 */
let globalIntelligentClient: FastGPTIntelligentClient | null = null;

export function getGlobalIntelligentClient(
  options?: IntelligentClientOptions
): FastGPTIntelligentClient {
  if (!globalIntelligentClient) {
    globalIntelligentClient = new FastGPTIntelligentClient(options);
  }
  return globalIntelligentClient;
}

/**
 * 重置全局智能客户端
 */
export function resetGlobalIntelligentClient(): void {
  if (globalIntelligentClient) {
    globalIntelligentClient.destroy();
    globalIntelligentClient = null;
  }
}