/**
 * 存储模块共享常量
 */

// 存储前缀和键名
export const STORAGE_PREFIX = 'zkteco_';
export const AGENTS_KEY = `${STORAGE_PREFIX}agents`;
export const SELECTED_AGENT_ID_KEY = `${STORAGE_PREFIX}selected_agent_id`;
export const MESSAGES_PREFIX = `${STORAGE_PREFIX}messages_`;
export const CHAT_INDEX_KEY = `${STORAGE_PREFIX}chat_index`;
export const LOCALLY_MODIFIED_AGENTS_KEY = `${STORAGE_PREFIX}locally_modified_agents`;
export const STORAGE_META_KEY = `${STORAGE_PREFIX}storage_meta`;
export const DEVICE_ID_KEY = `${STORAGE_PREFIX}device_id`;

// 存储限制
export const MAX_STORAGE_SIZE_MB = 10; // 最大存储大小（MB）
export const MAX_MESSAGES_PER_CHAT = 200; // 每个聊天的最大消息数
export const MAX_CHAT_AGE_DAYS = 60; // 聊天的最大保存天数

// API端点常量
export const API_CONSTANTS = {
  // FastGPT API端点
  FASTGPT_API_ENDPOINT: 'https://zktecoaihub.com/api/v1/chat/completions',
  FASTGPT_BASE_API: 'https://zktecoaihub.com/api',

  // 存储相关常量
  STORAGE_PREFIX: 'zkteco_',

  // 超时设置
  DEFAULT_TIMEOUT: 30000, // 30秒
  STREAM_TIMEOUT: 60000, // 60秒
  INIT_TIMEOUT: 15000, // 15秒

  // 重试设置
  DEFAULT_MAX_RETRIES: 3,
  INITIAL_RETRY_DELAY: 1000,
  MAX_RETRY_DELAY: 10000,
};

// 默认智能体设置
export const DEFAULT_AGENT_SETTINGS = {
  temperature: 0.7,
  maxTokens: 1000,
  streamResponse: true,
};

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR:
    '抱歉，连接服务器时出现问题。请检查您的网络连接或API配置，然后重试。',
  INCOMPLETE_CONFIG: 'API 配置不完整。请配置 API 端点、密钥和 AppId。',
  SERVER_ERROR:
    '抱歉，服务器返回了一个错误。我将以离线模式为您服务。请问有什么我可以帮助您的？',
  PROCESSING_ERROR:
    '抱歉，处理您的请求时出现错误。我将以离线模式为您服务。请问有什么我可以帮助您的？',
};
