/**
 * FastGPT API 统一处理模块 - 重构版本
 * 基于统一管理器，消除重复代码
 */

// 重新导出统一类型定义
export type {
  UnifiedAgent as Agent,
  AgentConfig,
  GlobalVariable,
  FastGPTMessage,
  FastGPTContentItem,
  FastGPTChatRequest,
  FastGPTStreamChunk,
  FastGPTChatResponse,
  FastGPTChatDetailResponse,
  FastGPTResponseData,
  FastGPTQuote,
  FastGPTCompleteMessage,
  // FastGPTGetResDataRequest,
  // FastGPTResDataResponse,
  // FastGPTResDataItem,
  // FastGPTHistoryPreview,
  // FastGPTDeleteChatRequest,
  // FastGPTDeleteChatResponse,
  // FastGPTFeedbackRequest,
  // FastGPTFeedbackResponse,
  // FastGPTCreateQuestionGuideRequest,
  // FastGPTCreateQuestionGuideResponse,
  FastGPTClientConfig,
  FastGPTRequestOptions,
  FastGPTError,
  FastGPTErrorResponse,
  createFastGPTMessage,
  createTextContent,
  createImageContent,
  createFileContent,
  createFastGPTChatRequest
} from '@/types/unified-agent';

// 重新导出统一API管理器
export {
  UnifiedAgentManager,
  getGlobalUnifiedAgentManager as getGlobalAgentManager,
  resetGlobalUnifiedAgentManager as resetGlobalAgentManager
} from '../unified-agent-manager';

// 导入全局管理器函数
import {
  getGlobalUnifiedAgentManager as getGlobalAgentManager,
  getGlobalCacheManager
} from '../unified-agent-manager';

// 导入类型
import type {
  FastGPTMessage,
  FastGPTRequestOptions
} from '@/types/unified-agent';

// 重新导出统一工具函数
export {
  UnifiedErrorHandler,
  UnifiedCacheManager,
  UnifiedValidator,
  getGlobalCacheManager,
  resetGlobalCacheManager,
  handleError,
  validate,
  cache
} from '@/lib/utils/shared';

// 移除重复的 Agent 导出，已在上面通过 UnifiedAgent as Agent 导出

// ================ 向后兼容的类型定义 ================

/**
 * 流式选项接口 - 向后兼容
 */
export interface StreamOptions {
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  detail?: boolean;
  timeout?: number;
  retryCount?: number;
  variables?: Record<string, any>;
  onStart?: () => void;
  onChunk?: (chunk: string) => void;
  onIntermediateValue?: (value: unknown, eventType: string) => void;
  onProcessingStep?: (step: unknown) => void;
  onError?: (error: Error) => void;
  onFinish?: () => void;
  signal?: AbortSignal;
}

/**
 * 聊天历史记录接口 - 向后兼容
 */
export interface ChatHistoryRecord {
  _id: string;
  dataId: string;
  obj: 'Human' | 'AI';
  value: {
    type: string;
    text?: {
      content: string;
    };
    image?: {
      url: string;
    };
  }[];
  customFeedbacks: unknown[];
  llmModuleAccount?: number;
  totalQuoteList?: unknown[];
  totalRunningTime?: number;
  historyPreviewLength?: number;
}

/**
 * 聊天历史响应接口 - 向后兼容
 */
export interface ChatHistoryResponse {
  code: number;
  data: {
    list: ChatHistoryRecord[];
    total: number;
  };
}

/**
 * 聊天初始化响应接口 - 向后兼容
 */
export interface ChatInitResponse {
  chatId: string;
  agentId: string;
  success: boolean;
  code?: number;
  data?: {
    chatId: string;
    appId: string;
    variables: Record<string, unknown>;
    app: {
      chatConfig: {
        questionGuide: boolean;
        ttsConfig: {
          type: string;
        };
        whisperConfig: {
          open: boolean;
          autoSend: boolean;
          autoTTSResponse: boolean;
        };
        chatInputGuide: {
          open: boolean;
          textList: string[];
          customUrl: string;
        };
        instruction: string;
        variables: unknown[];
        fileSelectConfig: {
          canSelectFile: boolean;
          canSelectImg: boolean;
          maxFiles: number;
        };
        _id: string;
        welcomeText: string;
      };
      chatModels: string[];
      name: string;
      avatar: string;
      intro: string;
      type: string;
      pluginInputs: unknown[];
    };
    interacts?: unknown[];
  };
}

/**
 * 问题建议响应接口 - 向后兼容
 */
export interface QuestionGuideResponse {
  code: number;
  data: string[];
}

// ================ 向后兼容的工具函数 ================

/**
 * 生成本地回退聊天ID - 向后兼容
 */
export function generateFallbackChatId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 生成回退初始化响应 - 向后兼容
 */
export function generateFallbackResponse(
  agent: any,
  chatId: string
): ChatInitResponse {
  // 为不同类型的智能体生成不同的欢迎消息
  let welcomeMessage =
    '您好！我是智能助手，很高兴为您服务。请问有什么我可以帮助您的？';
  let interacts: string[] = [];

  if (agent.type === 'image-editor') {
    welcomeMessage =
      '欢迎使用图像编辑助手！您可以上传图片，我将帮助您进行编辑和处理。';
    interacts = [
      '如何裁剪图片？',
      '能帮我调整图片亮度吗？',
      '如何添加滤镜效果？',
      '能帮我去除图片背景吗？',
      '如何调整图片大小？',
    ];
  } else if (agent.type === 'cad-analyzer') {
    welcomeMessage =
      '欢迎使用CAD分析助手！您可以上传CAD图纸，我将帮助您分析其中的安防设备布局。';
    interacts = [
      '如何分析CAD图纸中的安防设备？',
      '能识别图纸中的摄像头位置吗？',
      '如何计算布线长度？',
      '能帮我优化设备布局吗？',
      '如何导出分析报告？',
    ];
  } else {
    // 默认聊天智能体
    interacts = [
      '你能做什么？',
      '介绍一下你的功能',
      '如何使用你的服务？',
      '你有哪些限制？',
      '能给我一些使用示例吗？',
    ];
  }

  // 优先使用agent中的welcomeText，如果没有则使用默认欢迎消息
  const finalWelcomeMessage = agent.welcomeText || welcomeMessage;

  return {
    chatId: chatId,
    agentId: agent.id,
    success: true,
    code: 200,
    data: {
      chatId: chatId,
      appId: agent.appId || 'fallback-app-id',
      variables: {},
      app: {
        chatConfig: {
          questionGuide: true,
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
          welcomeText: finalWelcomeMessage,
        },
        chatModels: [agent.multimodalModel || 'gpt-3.5-turbo'],
        name: agent.name || 'AI Assistant',
        avatar: '',
        intro: agent.description || '',
        type: 'chat',
        pluginInputs: [],
      },
      interacts: interacts,
    },
  };
}

/**
 * 获取默认问题建议 - 向后兼容
 */
export function getDefaultSuggestions(): string[] {
  return [
    '这个产品有哪些功能？',
    '如何使用这个系统？',
    '有没有相关的使用案例？',
    '能提供一些示例吗？',
    '有哪些限制？',
  ];
}

// ================ 向后兼容的FastGPT客户端类 ================

/**
 * FastGPT客户端类 - 向后兼容
 * 基于统一管理器，提供面向对象的API访问方式
 */
export class FastGPTClient {
  private agent: any;

  constructor(
    agent: any,
    _retryOptions?: {
      maxRetries?: number;
      onRetry?: (attempt: number, error: Error) => void;
    }
  ) {
    this.agent = agent;
    // Note: retryOptions parameter is kept for API compatibility but not currently used
  }

  /**
   * 初始化聊天会话 - 向后兼容
   */
  async initializeChat(chatId?: string): Promise<ChatInitResponse> {
    // 使用统一管理器进行初始化
    const manager = getGlobalAgentManager();
    if (manager) {
      const result = await manager.initializeChat(this.agent, chatId);
      return {
        chatId: result.chatId,
        agentId: result.agentId,
        success: true
      };
    }

    // 回退到本地实现
    return generateFallbackResponse(this.agent, chatId || generateFallbackChatId());
  }

  /**
   * 发送聊天请求到 FastGPT API - 向后兼容
   * 支持流式响应和自动重试
   */
  async streamChat(
    messages: unknown[],
    options: StreamOptions = {}
  ): Promise<void> {
    // 使用统一管理器进行流式聊天
    const manager = getGlobalAgentManager();
    if (manager) {
      const fastGPTMessages = messages as FastGPTMessage[];
      const fastGPTOptions: FastGPTRequestOptions = {
        stream: true,
        detail: options.detail,
        timeout: options.timeout,
        retryCount: options.retryCount,
        variables: options.variables
      };
      await manager.streamChat(this.agent, fastGPTMessages, fastGPTOptions);
              return;
    }

    // 回退到本地实现
    if (options.onStart) options.onStart();
        if (options.onChunk) {
      options.onChunk('抱歉，智能体管理器未初始化，无法处理您的请求。');
    }
    if (options.onFinish) options.onFinish();
  }

  /**
   * 发送非流式聊天请求 - 向后兼容
   */
  async chat(messages: unknown[], options: StreamOptions): Promise<string> {
    // 使用统一管理器进行聊天
    const manager = getGlobalAgentManager();
    if (manager) {
      const fastGPTMessages = messages as FastGPTMessage[];
      const fastGPTOptions: FastGPTRequestOptions = {
        stream: false,
        detail: options.detail,
        timeout: options.timeout,
        retryCount: options.retryCount,
        variables: options.variables
      };
      const response = await manager.chat(this.agent, fastGPTMessages, fastGPTOptions);
      return response.choices?.[0]?.message?.content || '无响应内容';
    }

    // 回退到本地实现
    return '抱歉，智能体管理器未初始化，无法处理您的请求。';
  }

  /**
   * 获取问题建议 - 向后兼容
   */
  async getQuestionSuggestions(customConfig?: {
    open?: boolean;
    model?: string;
    customPrompt?: string;
  }): Promise<string[]> {
    // 使用统一管理器获取问题建议
    const manager = getGlobalAgentManager();
    if (manager) {
      return manager.getQuestionSuggestions(this.agent, customConfig);
    }

    // 回退到本地实现
    return getDefaultSuggestions();
  }

  /**
   * 预热缓存 - 向后兼容
   */
  async warmupCache(): Promise<void> {
    // 使用统一缓存管理器
    const cacheManager = getGlobalCacheManager();
    try {
      await cacheManager.set(
        `agent:${String(this.agent.id)}`,
        this.agent,
        3600
      );
    } catch (error) {
      console.warn('Cache warmup failed:', error);
    }
  }

  /**
   * 获取缓存统计信息 - 向后兼容
   */
  async getCacheStats() {
    try {
      const cacheManager = getGlobalCacheManager();
      return cacheManager.getStats();
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
      return null;
    }
  }

  /**
   * 清理缓存 - 向后兼容
   */
  async clearCache(): Promise<void> {
    try {
      const cacheManager = getGlobalCacheManager();
      cacheManager.delete(`chat:${String(this.agent.id)}`);
    } catch (error) {
      console.warn('Cache clear failed:', error);
    }
  }
}

// ================ 向后兼容的函数式API ================

/**
 * 初始化聊天会话 - 向后兼容
 */
export async function initializeChat(
  agent: any,
  chatId?: string
): Promise<ChatInitResponse> {
  // 使用统一管理器进行初始化
  const manager = getGlobalAgentManager();
  if (manager) {
    const result = await manager.initializeChat(agent, chatId);
    return {
      chatId: result.chatId,
      agentId: result.agentId,
      success: true
    };
  }

  // 回退到本地实现
    return generateFallbackResponse(agent, chatId || generateFallbackChatId());
}

/**
 * 发送聊天请求 - 向后兼容
 */
export async function sendChatRequest(
  agent: any,
  messages: unknown[],
  options: {
    stream?: boolean;
    temperature?: number;
    maxTokens?: number;
    detail?: boolean;
    onChunk?: (chunk: string) => void;
  } = {}
): Promise<unknown> {
  // 使用统一管理器进行聊天
  const manager = getGlobalAgentManager();
  if (manager) {
    const fastGPTMessages = messages as FastGPTMessage[];
    const fastGPTOptions: FastGPTRequestOptions = {
      stream: options.stream || false,
      detail: options.detail,
      timeout: 30000,
      retryCount: 3,
      variables: {}
    };
    const response = await manager.chat(agent, fastGPTMessages, fastGPTOptions);
    return response.choices?.[0]?.message?.content || '无响应内容';
  }

  // 回退到本地实现
    if (options.stream && options.onChunk) {
    options.onChunk('抱歉，智能体管理器未初始化，无法处理您的请求。');
  }
  return { error: '智能体管理器未初始化' };
}

/**
 * 获取问题建议 - 向后兼容
 */
export async function getQuestionSuggestions(
  agent: any,
  _chatId: string,
  customConfig?: {
    open?: boolean;
    model?: string;
    customPrompt?: string;
  }
): Promise<QuestionGuideResponse> {
  // 使用统一管理器获取问题建议
  const manager = getGlobalAgentManager();
  if (manager) {
    const suggestions = await manager.getQuestionSuggestions(agent, customConfig);
    return {
      code: 200,
      data: suggestions
    };
  }

  // 回退到本地实现
    return {
      code: 200,
      data: getDefaultSuggestions(),
    };
}

/**
 * 带重试的fetch工具 - 向后兼容
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  backoff = 300
): Promise<Response> {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(res.statusText);
      return res;
    } catch (err) {
      lastError = err;
      await new Promise(r => setTimeout(r, backoff * Math.pow(2, i)));
    }
  }
  throw lastError;
}
