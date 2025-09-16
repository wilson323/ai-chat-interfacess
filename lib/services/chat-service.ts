/**
 * 单智能体聊天服务
 * 用于替代多智能体服务，保持与原有调用方兼容的 API（initializeChat/sendMessage/getGlobalChatService）
 */

import { FastGPTIntelligentClient, getGlobalIntelligentClient } from '../api/fastgpt/intelligent-client';
import type { Agent } from '../../types/agent';
import type { Message } from '../../types/message';
import type { ChatInitResponse } from '../../lib/api/fastgpt';

export interface ChatServiceOptions {
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  variables?: Record<string, unknown>;
  onChunk?: (chunk: string) => void;
  onProcessingStep?: (step: unknown) => void;
  onIntermediateValue?: (value: unknown, eventType: string) => void;
  onError?: (error: Error) => void;
  onStart?: () => void;
  onFinish?: () => void;
  signal?: AbortSignal;
}

export interface ChatServiceResponse {
  agentId: string;
  response: Promise<void>;
  agentName: string;
  agentType: string;
}

export class ChatService {
  private intelligentClient: FastGPTIntelligentClient;

  constructor() {
    this.intelligentClient = getGlobalIntelligentClient();
  }

  async initializeChat(agent: Agent, chatId?: string): Promise<ChatInitResponse> {
    try {
      if (agent.type === 'fastgpt') {
        const init = await this.intelligentClient.initializeChat(agent.id, chatId);
        return init as unknown as ChatInitResponse;
      }
      return this.generateFallbackInitResponse(agent, chatId);
    } catch (_e) {
      return this.generateFallbackInitResponse(agent, chatId);
    }
  }

  async sendMessage(
    messages: Array<Message>,
    agent: Agent,
    options: ChatServiceOptions = {}
  ): Promise<ChatServiceResponse> {
    // 仅针对当前选中智能体进行请求（不再做多智能体选择）
    if (agent.type === 'fastgpt') {
      const formatted = messages.map(m => ({ role: m.role, content: m.content }));
      const streamOptions = {
        stream: options.stream ?? true,
        temperature: options.temperature ?? agent.temperature,
        maxTokens: options.maxTokens ?? agent.maxTokens,
        variables: (options.variables || {}) as Record<string, string | number | boolean>,
        onStart: options.onStart,
        onChunk: options.onChunk,
        onProcessingStep: options.onProcessingStep,
        onIntermediateValue: options.onIntermediateValue,
        onError: options.onError,
        onFinish: options.onFinish,
        signal: options.signal,
      } as const;

      const { response } = await this.intelligentClient.streamChat(formatted, {
        ...streamOptions,
        agentId: agent.id,
      });

      return {
        agentId: agent.id,
        response,
        agentName: agent.name,
        agentType: agent.type,
      };
    }

    // 其他类型沿用通用处理（与原多智能体实现保持兼容）
    const response = new Promise<void>(async (resolve, reject) => {
      try {
        options.onStart?.();
        const last = messages[messages.length - 1];
        const text = last?.content || '';
        const reply = `我是${agent.name}，收到: ${text}`;
        if (options.onChunk) {
          for (let i = 0; i < reply.length; i += 10) {
            options.onChunk(reply.slice(i, i + 10));
            await new Promise(r => setTimeout(r, 10));
          }
        }
        options.onFinish?.();
        resolve();
      } catch (err) {
        options.onError?.(err as Error);
        reject(err);
      }
    });

    return {
      agentId: agent.id,
      response,
      agentName: agent.name,
      agentType: agent.type,
    };
  }

  private generateFallbackInitResponse(agent: Agent, chatId?: string): ChatInitResponse {
    const fallbackChatId = chatId || `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    return {
      chatId: fallbackChatId,
      agentId: agent.id,
      success: true,
      code: 200,
      data: {
        chatId: fallbackChatId,
        appId: agent.appId || 'fallback-app-id',
        variables: {},
        app: {
          chatConfig: {
            questionGuide: true,
            ttsConfig: { type: 'normal' },
            whisperConfig: { open: false, autoSend: false, autoTTSResponse: false },
            chatInputGuide: { open: false, textList: [], customUrl: '' },
            instruction: '',
            variables: [],
            fileSelectConfig: { canSelectFile: false, canSelectImg: false, maxFiles: 5 },
            _id: '',
            welcomeText: agent.welcomeText || '您好！我是智能助手，很高兴为您服务。',
          },
          chatModels: [agent.multimodalModel || 'gpt-3.5-turbo'],
          name: agent.name || 'AI Assistant',
          avatar: '',
          intro: agent.description || '',
          type: 'chat',
          pluginInputs: [],
        },
        interacts: [],
      },
    };
  }
}

let globalChatService: ChatService | null = null;
export function getGlobalChatService(): ChatService {
  if (!globalChatService) globalChatService = new ChatService();
  return globalChatService;
}

export function resetGlobalChatService(): void {
  globalChatService = null;
}


