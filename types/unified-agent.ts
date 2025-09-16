/**
 * 统一智能体类型定义
 * 整合所有智能体相关的类型定义，消除重复
 */

import type { GlobalVariable } from './global-variable';

// 重新导出 GlobalVariable
export type { GlobalVariable };

// ================ 基础类型 ================

export type ConversationAgentType = 'fastgpt' | 'chat';
export type NonConversationAgentType = 'image-editor' | 'cad-analyzer';
export type AgentType = ConversationAgentType | NonConversationAgentType;

// ================ 统一智能体接口 ================

/**
 * 统一智能体接口
 * 整合所有智能体类型的基础属性和功能
 */
export interface UnifiedAgent {
  // 基础标识
  id: string;
  name: string;
  description: string;
  type: AgentType;

  // 显示属性
  iconType?: string;
  icon?: React.ReactNode;
  avatar?: string;
  welcomeText?: string;
  welcomeMessage?: string;

  // 排序和状态
  order?: number;
  isPublished?: boolean;
  isActive: boolean;

  // API配置
  apiEndpoint?: string;
  apiUrl?: string;
  apiKey?: string;
  appId?: string;

  // 模型配置
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  multimodalModel?: string;

  // 功能支持
  supportsFileUpload?: boolean;
  supportsImageUpload?: boolean;
  supportsStream: boolean;
  supportsDetail: boolean;

  // 全局变量
  globalVariables?: GlobalVariable[];

  // 聊天会话
  chatId?: string;

  // 统一配置
  config: AgentConfig;
}

// ================ 智能体配置 ================

/**
 * 统一智能体配置接口
 * 整合所有配置相关的属性
 */
export interface AgentConfig {
  version: string;
  type?: AgentType;
  // 智能体基本属性
  id?: string;
  name?: string;
  description?: string;
  apiKey?: string;
  appId?: string;
  apiUrl?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  multimodalModel?: string;
  supportsFileUpload?: boolean;
  supportsImageUpload?: boolean;
  supportsStream?: boolean;
  supportsDetail?: boolean;
  globalVariables?: GlobalVariable[];
  welcomeText?: string;
  order?: number;
  isPublished?: boolean;
  isActive?: boolean;
  // 时间戳
  createdAt?: Date;
  updatedAt?: Date;
  // 配置属性
  settings: AgentSettings;
  features: AgentFeatures;
  limits: AgentLimits;
  metadata?: Record<string, unknown>;
}

/**
 * 智能体设置
 */
export interface AgentSettings {
  timeout?: number;
  retryCount?: number;
  cacheEnabled?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  healthCheckInterval?: number;
  circuitBreakerThreshold?: number;
  loadBalanceWeight?: number;
}

/**
 * 智能体功能特性
 */
export interface AgentFeatures {
  streaming?: boolean;
  fileUpload?: boolean;
  imageUpload?: boolean;
  voiceInput?: boolean;
  voiceOutput?: boolean;
  multimodal?: boolean;
  detail?: boolean;
  questionGuide?: boolean;
}

/**
 * 智能体限制
 */
export interface AgentLimits {
  maxTokens?: number;
  maxFileSize?: number;
  maxRequests?: number;
  rateLimit?: number;
  maxConnections?: number;
}

// ================ FastGPT 特定类型 ================

/**
 * FastGPT 消息类型
 */
export interface FastGPTMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | FastGPTContentItem[];
}

/**
 * FastGPT 内容项
 */
export interface FastGPTContentItem {
  type: 'text' | 'image_url' | 'file_url';
  text?: string;
  image_url?: {
    url: string;
  };
  file_url?: {
    name: string;
    url: string;
  };
}

/**
 * FastGPT 对话请求
 */
export interface FastGPTChatRequest {
  chatId?: string;
  stream?: boolean;
  detail?: boolean;
  responseChatItemId?: string;
  variables?: Record<string, string | number | boolean>;
  messages: FastGPTMessage[];
}

/**
 * FastGPT 流式响应
 */
export interface FastGPTStreamChunk {
  id: string;
  object: string;
  created: number;
  choices: Array<{
    delta: {
      content: string;
    };
    index: number;
    finish_reason: string | null;
  }>;
}

/**
 * FastGPT 非流式响应
 */
export interface FastGPTChatResponse {
  id: string;
  object?: string;
  created?: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: Array<{
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
    index: number;
  }>;
}

/**
 * FastGPT 详细响应
 */
export interface FastGPTChatDetailResponse extends FastGPTChatResponse {
  responseData: FastGPTResponseData[];
}

/**
 * FastGPT 响应数据项
 */
export interface FastGPTResponseData {
  moduleName: string;
  price?: number;
  model?: string;
  tokens?: number;
  similarity?: number;
  limit?: number;
  question?: string;
  answer?: string;
  maxToken?: number;
  quoteList?: FastGPTQuote[];
  completeMessages?: FastGPTCompleteMessage[];
  customFeedbacks?: any[];
  _id?: string;
  dataId?: string;
  obj?: 'System' | 'Human' | 'AI';
  value?: any;
  llmModuleAccount?: number;
  totalQuoteList?: any[];
  totalRunningTime?: number;
  historyPreviewLength?: number;
}

/**
 * FastGPT 引用信息
 */
export interface FastGPTQuote {
  dataset_id: string;
  id: string;
  q: string;
  a: string;
  source: string;
}

/**
 * FastGPT 完整消息
 */
export interface FastGPTCompleteMessage {
  obj: 'System' | 'Human' | 'AI';
  value: any;
  customFeedbacks?: any[];
}

// ================ 多智能体管理类型 ================

/**
 * 智能体指标
 */
export interface AgentMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastUsed: number;
  errorRate: number;
}

/**
 * 负载均衡策略
 */
export interface LoadBalanceStrategy {
  type: 'round-robin' | 'weighted' | 'least-connections' | 'fastest-response';
  weights?: Record<string, number>;
}

/**
 * 多智能体选项
 */
export interface MultiAgentOptions {
  cacheEnabled?: boolean;
  loadBalanceStrategy?: LoadBalanceStrategy;
  healthCheckInterval?: number;
  maxRetriesPerAgent?: number;
  circuitBreakerThreshold?: number;
  fallbackAgentId?: string;
}

// ================ 客户端配置类型 ================

/**
 * FastGPT 客户端配置
 */
export interface FastGPTClientConfig {
  baseUrl: string;
  apiKey: string;
  appId: string;
  timeout?: number;
  retries?: number;
}

/**
 * FastGPT 请求选项
 */
export interface FastGPTRequestOptions {
  stream?: boolean;
  detail?: boolean;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  retryCount?: number;
  variables?: Record<string, any>;
  onChunk?: (chunk: string) => void;
  onError?: (error: Error) => void;
  onFinish?: () => void;
  signal?: AbortSignal;
}

// ================ 错误类型 ================

/**
 * FastGPT API 错误
 */
export interface FastGPTError {
  code: number;
  statusText: string;
  message: string;
  details?: any;
}

/**
 * FastGPT 错误响应
 */
export interface FastGPTErrorResponse {
  code: number;
  statusText: string;
  message: string;
  data?: any;
}

// ================ 工具函数类型 ================

/**
 * 创建 FastGPT 消息的工具函数
 */
export function createFastGPTMessage(
  role: 'user' | 'assistant' | 'system',
  content: string | FastGPTContentItem[]
): FastGPTMessage {
  return { role, content };
}

/**
 * 创建文本内容项
 */
export function createTextContent(text: string): FastGPTContentItem {
  return { type: 'text', text };
}

/**
 * 创建图片内容项
 */
export function createImageContent(url: string): FastGPTContentItem {
  return {
    type: 'image_url',
    image_url: { url }
  };
}

/**
 * 创建文件内容项
 */
export function createFileContent(name: string, url: string): FastGPTContentItem {
  return {
    type: 'file_url',
    file_url: { name, url }
  };
}

/**
 * 创建对话请求
 */
export function createFastGPTChatRequest(
  messages: FastGPTMessage[],
  options: Partial<FastGPTChatRequest> = {}
): FastGPTChatRequest {
  return {
    messages,
    stream: false,
    detail: false,
    ...options
  };
}

// ================ 类型守卫 ================

/**
 * 检查是否为对话智能体
 */
export function isConversationAgent(agent: UnifiedAgent): agent is UnifiedAgent & { type: ConversationAgentType } {
  return agent.type === 'fastgpt' || agent.type === 'chat';
}

/**
 * 检查是否为非对话智能体
 */
export function isNonConversationAgent(agent: UnifiedAgent): agent is UnifiedAgent & { type: NonConversationAgentType } {
  return agent.type === 'image-editor' || agent.type === 'cad-analyzer';
}

/**
 * 检查是否为 FastGPT 智能体
 */
export function isFastGPTAgent(agent: UnifiedAgent): boolean {
  return agent.type === 'fastgpt' && !!agent.apiKey && !!agent.appId;
}

// ================ 默认配置 ================

/**
 * 默认智能体配置
 */
export const DEFAULT_AGENT_CONFIG: AgentConfig = {
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
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxRequests: 1000,
    rateLimit: 100,
    maxConnections: 10
  }
};

/**
 * 默认智能体设置
 */
export const DEFAULT_AGENT_SETTINGS: AgentSettings = {
  timeout: 30000,
  retryCount: 3,
  cacheEnabled: true,
  logLevel: 'info',
  healthCheckInterval: 30000,
  circuitBreakerThreshold: 5
};

/**
 * 默认负载均衡策略
 */
export const DEFAULT_LOAD_BALANCE_STRATEGY: LoadBalanceStrategy = {
  type: 'round-robin'
};

/**
 * 默认多智能体选项
 */
export const DEFAULT_MULTI_AGENT_OPTIONS: Required<MultiAgentOptions> = {
  cacheEnabled: true,
  loadBalanceStrategy: DEFAULT_LOAD_BALANCE_STRATEGY,
  healthCheckInterval: 30000,
  maxRetriesPerAgent: 3,
  circuitBreakerThreshold: 5,
  fallbackAgentId: ''
};

// ================ 缺失的 FastGPT API 类型 ================

/**
 * FastGPT 获取资源数据请求
 */
export interface FastGPTGetResDataRequest {
  chatId: string;
  responseChatItemId: string;
}

/**
 * FastGPT 资源数据响应
 */
export interface FastGPTResDataResponse {
  success: boolean;
  data: FastGPTResDataItem[];
}

/**
 * FastGPT 资源数据项
 */
export interface FastGPTResDataItem {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  createTime: string;
}

/**
 * FastGPT 删除聊天请求
 */
export interface FastGPTDeleteChatRequest {
  chatId: string;
}

/**
 * FastGPT 删除聊天响应
 */
export interface FastGPTDeleteChatResponse {
  success: boolean;
  message: string;
}

/**
 * FastGPT 反馈请求
 */
export interface FastGPTFeedbackRequest {
  chatId: string;
  responseChatItemId: string;
  feedback: 'like' | 'dislike';
  comment?: string;
}

/**
 * FastGPT 反馈响应
 */
export interface FastGPTFeedbackResponse {
  success: boolean;
  message: string;
}
