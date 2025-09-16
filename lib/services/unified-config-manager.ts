/**
 * 统一配置管理服务
 * 基于现有管理端配置系统进行整合，避免重复开发
 */

import type { UnifiedAgent } from '@/types/unified-agent';
import { logger } from '@/lib/utils/logger';

// ================ 现有配置接口适配 ================

/**
 * 现有智能体配置接口（来自数据库）
 */
export interface ExistingAgentConfig {
  id: string | number;
  name: string;
  description?: string;
  type: string;
  iconType?: string;
  avatar?: string;
  order?: number;
  isPublished: boolean;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  multimodalModel?: string;
  supportsStream?: boolean;
  supportsDetail?: boolean;
  globalVariables?: string;
  welcomeText?: string;
  apiKey?: string;
  appId?: string;
  apiUrl?: string;
  updatedAt?: Date | string;
}

/**
 * 安全智能体响应接口（来自现有API）
 */
export interface SafeAgentResponse {
  id: string;
  name: string;
  description: string;
  type: string;
  iconType: string;
  avatar: string;
  order: number;
  isPublished: boolean;
  apiKey: string;
  appId: string;
  apiUrl: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  multimodalModel: string;
  supportsStream: boolean;
  supportsDetail: boolean;
  globalVariables: any[];
  welcomeText: string;
  updatedAt: string | null;
}

// ================ 统一配置管理器 ================

/**
 * 统一配置管理器
 * 整合现有管理端配置系统，提供统一的配置管理接口
 */
export class UnifiedConfigManager {
  private cache: Map<string, UnifiedAgent> = new Map();
  private lastSync: number = 0;
  private syncInterval: number = 30000; // 30秒同步一次

  constructor() {
    // 启动定期同步
    this.startPeriodicSync();
  }

  /**
   * 从现有API获取所有智能体配置
   */
  async getAllAgents(): Promise<UnifiedAgent[]> {
    try {
      const response = await fetch('/api/admin/agent-config');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '获取智能体配置失败');
      }

      const agents = result.data.map((agent: SafeAgentResponse) =>
        this.convertToUnifiedAgent(agent)
      );

      // 更新缓存
      this.updateCache(agents);

      return agents;
    } catch (error) {
      logger.error('获取智能体配置失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取智能体配置
   */
  async getAgentById(agentId: string): Promise<UnifiedAgent | null> {
    try {
      // 先检查缓存
      const cached = this.cache.get(agentId);
      if (cached && Date.now() - this.lastSync < this.syncInterval) {
        return cached;
      }

      // 从API获取
      const response = await fetch(`/api/admin/agent-config/${agentId}`);
      const result = await response.json();

      if (!result.success) {
        return null;
      }

      const agent = this.convertToUnifiedAgent(result.data);
      this.cache.set(agentId, agent);

      return agent;
    } catch (error) {
      logger.error(`获取智能体配置失败 [${agentId}]:`, error);
      return null;
    }
  }

  /**
   * 创建新智能体配置
   */
  async createAgent(agentData: Partial<UnifiedAgent>): Promise<UnifiedAgent> {
    try {
      const response = await fetch('/api/admin/agent-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.convertFromUnifiedAgent(agentData)),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '创建智能体失败');
      }

      const agent = this.convertToUnifiedAgent(result.data);
      this.cache.set(agent.id, agent);

      logger.debug(`✅ 智能体创建成功: ${agent.name} (${agent.id})`);
      return agent;
    } catch (error) {
      logger.error('创建智能体失败:', error);
      throw error;
    }
  }

  /**
   * 更新智能体配置
   */
  async updateAgent(agentId: string, updates: Partial<UnifiedAgent>): Promise<UnifiedAgent> {
    try {
      const response = await fetch('/api/admin/agent-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: agentId,
          ...this.convertFromUnifiedAgent(updates),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '更新智能体失败');
      }

      const agent = this.convertToUnifiedAgent(result.data);
      this.cache.set(agentId, agent);

      logger.debug(`✅ 智能体更新成功: ${agent.name} (${agentId})`);
      return agent;
    } catch (error) {
      logger.error(`更新智能体失败 [${agentId}]:`, error);
      throw error;
    }
  }

  /**
   * 删除智能体配置
   */
  async deleteAgent(agentId: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/agent-config/${agentId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '删除智能体失败');
      }

      this.cache.delete(agentId);
      logger.debug(`✅ 智能体删除成功: ${agentId}`);
    } catch (error) {
      logger.error(`删除智能体失败 [${agentId}]:`, error);
      throw error;
    }
  }

  /**
   * 获取已发布的智能体（用户端）
   */
  async getPublishedAgents(): Promise<UnifiedAgent[]> {
    try {
      const response = await fetch('/api/agent-config');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '获取已发布智能体失败');
      }

      const agents = result.data.map((agent: SafeAgentResponse) =>
        this.convertToUnifiedAgent(agent)
      );

      return agents;
    } catch (error) {
      logger.error('获取已发布智能体失败:', error);
      throw error;
    }
  }

  /**
   * 验证智能体配置
   */
  validateAgentConfig(agent: Partial<UnifiedAgent>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!agent.name?.trim()) {
      errors.push('智能体名称不能为空');
    }

    if (!agent.type) {
      errors.push('智能体类型不能为空');
    }

    if (agent.type === 'fastgpt') {
      if (!agent.apiKey?.trim()) {
        errors.push('FastGPT智能体需要API密钥');
      }
      if (!agent.appId?.trim()) {
        errors.push('FastGPT智能体需要AppID');
      }
    }

    if (agent.temperature !== undefined && (agent.temperature < 0 || agent.temperature > 2)) {
      errors.push('温度参数必须在0-2之间');
    }

    if (agent.maxTokens !== undefined && (agent.maxTokens < 1 || agent.maxTokens > 100000)) {
      errors.push('最大令牌数必须在1-100000之间');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 获取配置统计信息
   */
  getConfigStats(): { totalAgents: number; publishedAgents: number; fastgptAgents: number } {
    const agents = Array.from(this.cache.values());
    return {
      totalAgents: agents.length,
      publishedAgents: agents.filter(agent => agent.isPublished).length,
      fastgptAgents: agents.filter(agent => agent.type === 'fastgpt').length
    };
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear();
    this.lastSync = 0;
  }

  // ================ 私有方法 ================

  /**
   * 将现有API响应转换为统一智能体格式
   */
  private convertToUnifiedAgent(agent: SafeAgentResponse): UnifiedAgent {
    return {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      type: agent.type as any,
      iconType: agent.iconType,
      avatar: agent.avatar,
      order: agent.order,
      isPublished: agent.isPublished,
      isActive: agent.isPublished, // 已发布的智能体默认为激活状态
      apiKey: agent.apiKey,
      appId: agent.appId,
      apiUrl: agent.apiUrl,
      systemPrompt: agent.systemPrompt,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
      multimodalModel: agent.multimodalModel,
      supportsStream: agent.supportsStream,
      supportsDetail: agent.supportsDetail,
      globalVariables: agent.globalVariables || [],
      welcomeText: agent.welcomeText,
      config: {
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
          streaming: agent.supportsStream,
          fileUpload: false,
          imageUpload: false,
          voiceInput: false,
          voiceOutput: false,
          multimodal: !!agent.multimodalModel,
          detail: agent.supportsDetail,
          questionGuide: true
        },
        limits: {
          maxTokens: agent.maxTokens,
          maxFileSize: 10 * 1024 * 1024,
          maxRequests: 1000,
          rateLimit: 100,
          maxConnections: 10
        }
      }
    };
  }

  /**
   * 将统一智能体格式转换为现有API格式
   */
  private convertFromUnifiedAgent(agent: Partial<UnifiedAgent>): Partial<ExistingAgentConfig> {
    return {
      name: agent.name,
      description: agent.description,
      type: agent.type,
      iconType: agent.iconType,
      avatar: agent.avatar,
      order: agent.order,
      isPublished: agent.isPublished,
      systemPrompt: agent.systemPrompt,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
      multimodalModel: agent.multimodalModel,
      supportsStream: agent.supportsStream,
      supportsDetail: agent.supportsDetail,
      globalVariables: agent.globalVariables ? JSON.stringify(agent.globalVariables) : undefined,
      welcomeText: agent.welcomeText,
      apiKey: agent.apiKey,
      appId: agent.appId,
      apiUrl: agent.apiUrl
    };
  }

  /**
   * 更新缓存
   */
  private updateCache(agents: UnifiedAgent[]): void {
    this.cache.clear();
    agents.forEach(agent => {
      this.cache.set(agent.id, agent);
    });
    this.lastSync = Date.now();
  }

  /**
   * 启动定期同步
   */
  private startPeriodicSync(): void {
    setInterval(async () => {
      try {
        await this.getAllAgents();
        logger.debug('配置同步完成');
      } catch (error) {
        logger.warn('配置同步失败:', error);
      }
    }, this.syncInterval);
  }
}

// ================ 单例实例 ================

/**
 * 全局统一配置管理器实例
 */
let globalUnifiedConfigManager: UnifiedConfigManager | null = null;

/**
 * 获取全局统一配置管理器实例
 */
export function getGlobalUnifiedConfigManager(): UnifiedConfigManager {
  if (!globalUnifiedConfigManager) {
    globalUnifiedConfigManager = new UnifiedConfigManager();
  }
  return globalUnifiedConfigManager;
}

/**
 * 重置全局统一配置管理器实例
 */
export function resetGlobalUnifiedConfigManager(): void {
  if (globalUnifiedConfigManager) {
    globalUnifiedConfigManager.clearCache();
    globalUnifiedConfigManager = null;
  }
}

// ================ 便捷函数 ================

/**
 * 快速获取所有智能体
 */
export async function getAllAgents(): Promise<UnifiedAgent[]> {
  const manager = getGlobalUnifiedConfigManager();
  return await manager.getAllAgents();
}

/**
 * 快速获取已发布智能体
 */
export async function getPublishedAgents(): Promise<UnifiedAgent[]> {
  const manager = getGlobalUnifiedConfigManager();
  return await manager.getPublishedAgents();
}

/**
 * 快速创建智能体
 */
export async function createAgent(agentData: Partial<UnifiedAgent>): Promise<UnifiedAgent> {
  const manager = getGlobalUnifiedConfigManager();
  return await manager.createAgent(agentData);
}

/**
 * 快速更新智能体
 */
export async function updateAgent(agentId: string, updates: Partial<UnifiedAgent>): Promise<UnifiedAgent> {
  const manager = getGlobalUnifiedConfigManager();
  return await manager.updateAgent(agentId, updates);
}

/**
 * 快速删除智能体
 */
export async function deleteAgent(agentId: string): Promise<void> {
  const manager = getGlobalUnifiedConfigManager();
  return await manager.deleteAgent(agentId);
}
