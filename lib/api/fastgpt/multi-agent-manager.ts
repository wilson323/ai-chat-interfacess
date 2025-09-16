/**
 * 多智能体管理器（最小可用实现）
 * - 从本地配置加载智能体
 * - 提供基础接口以供 IntelligentClient 编译及运行
 * - 遵循严格类型与错误处理
 */

import { DEFAULT_AGENTS } from '@/config/default-agents';
import type { Agent } from '@/types/agent';
import { logger } from '@/lib/utils/logger';

export interface LoadBalanceStrategy {
  type: 'round-robin' | 'random' | string;
}

export interface AgentConfig {
  id: string;
  name: string;
  description?: string;
  systemPrompt?: string;
  welcomeText?: string;
  type?: string;
  isEnabled?: boolean;
}

interface StreamOptions {
  stream?: boolean;
  variables?: Record<string, string | number | boolean>;
  onStart?: () => void;
  onChunk?: (chunk: string) => void;
  onProcessingStep?: (step: unknown) => void;
  onIntermediateValue?: (value: unknown, eventType: string) => void;
  onError?: (error: Error) => void;
  onFinish?: () => void;
  signal?: AbortSignal;
}

interface SimpleAgentClient {
  initializeChat: (chatId?: string) => Promise<Record<string, unknown>>;
  getQuestionSuggestions: (config?: Record<string, unknown>) => Promise<string[]>;
}

function toAgentConfig(agent: Agent): AgentConfig {
  return {
    id: agent.id,
    name: agent.name,
    description: agent.description,
    systemPrompt: agent.systemPrompt,
    welcomeText: agent.welcomeText,
    type: agent.type,
    isEnabled: agent.isPublished ?? true,
  };
}

class InMemoryAgentClient implements SimpleAgentClient {
  private readonly agent: AgentConfig;

  constructor(agent: AgentConfig) {
    this.agent = agent;
  }

  async initializeChat(chatId?: string): Promise<Record<string, unknown>> {
    try {
      const id = chatId || `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      return {
        code: 200,
        data: {
          chatId: id,
          appId: this.agent.id,
          variables: {},
          app: {
            chatConfig: {
              questionGuide: false,
              ttsConfig: { type: 'normal' },
              whisperConfig: { open: false, autoSend: false, autoTTSResponse: false },
              chatInputGuide: { open: false, textList: [], customUrl: '' },
              instruction: '',
              variables: [],
              fileSelectConfig: { canSelectFile: false, canSelectImg: false, maxFiles: 5 },
              _id: '',
              welcomeText: this.agent.welcomeText || '欢迎使用智能助手！',
            },
            chatModels: ['gpt-3.5-turbo'],
            name: this.agent.name,
            avatar: '',
            intro: this.agent.description || '',
            type: 'chat',
            pluginInputs: [],
          },
        },
      } as Record<string, unknown>;
    } catch (error) {
      logger.error('initializeChat failed', error);
      throw error;
    }
  }

  async getQuestionSuggestions(_config?: Record<string, unknown>): Promise<string[]> {
    return ['可以做什么？', '如何开始使用？', '支持哪些能力？'];
  }
}

export class FastGPTMultiAgentManager {
  private agents: AgentConfig[] = [];
  private rrIndex = 0;

  constructor() {
    // 初始化为空，等待 initializeMultiAgentManagerFromDB 填充
  }

  setAgents(agents: AgentConfig[]): void {
    this.agents = agents.filter(a => a.isEnabled !== false);
  }

  getAllAgentConfigs(): AgentConfig[] {
    return [...this.agents];
  }

  async getOptimalAgent(): Promise<{ client: SimpleAgentClient; agent: AgentConfig }>
  {
    if (this.agents.length === 0) {
      throw new Error('No available agents');
    }
    const agent = this.agents[this.rrIndex % this.agents.length];
    this.rrIndex++;
    return { client: new InMemoryAgentClient(agent), agent };
  }

  async getAgentById(id: string): Promise<SimpleAgentClient> {
    const agent = this.agents.find(a => a.id === id) || this.agents[0];
    return new InMemoryAgentClient(agent);
  }

  async streamChat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: StreamOptions,
    selectedAgentId?: string
  ): Promise<{ agentId: string; response: Promise<void> }>
  {
    const agentId = selectedAgentId || (this.agents[0]?.id || 'default');
    const content = String(messages[messages.length - 1]?.content || '');
    const reply = `（本地路由）${agentId} 已收到：${content}`;

    const response = new Promise<void>(async (resolve, reject) => {
      try {
        options.onStart?.();
        if (options.onChunk) {
          for (let i = 0; i < reply.length; i += 8) {
            if (options.signal?.aborted) break;
            options.onChunk(reply.slice(i, i + 8));
            await new Promise(r => setTimeout(r, 8));
          }
        }
        options.onFinish?.();
        resolve();
      } catch (err) {
        options.onError?.(err as Error);
        reject(err);
      }
    });

    return { agentId, response };
  }

  getAgentMetrics(_id: string): Record<string, unknown> | undefined {
    return { requests: 0 } as Record<string, unknown>;
  }

  getAllMetrics(): Record<string, unknown> {
    return { agents: this.agents.length } as Record<string, unknown>;
  }

  resetMetrics(_id?: string): void {
    // no-op
  }

  async healthCheck(): Promise<Record<string, boolean>> {
    return { ok: true } as Record<string, boolean>;
  }

  async destroy(): Promise<void> {
    // 清理资源（当前无持久资源）
  }
}

let globalManager: FastGPTMultiAgentManager | null = null;

export function getGlobalMultiAgentManager(): FastGPTMultiAgentManager {
  if (!globalManager) {
    globalManager = new FastGPTMultiAgentManager();
  }
  return globalManager;
}

export async function initializeMultiAgentManagerFromDB(): Promise<void> {
  try {
    const manager = getGlobalMultiAgentManager();
    const configs: AgentConfig[] = DEFAULT_AGENTS.map(toAgentConfig);
    manager.setAgents(configs);
    logger.debug(`MultiAgentManager initialized with ${configs.length} agents`);
  } catch (error) {
    logger.error('initializeMultiAgentManagerFromDB failed', error);
    throw error;
  }
}
