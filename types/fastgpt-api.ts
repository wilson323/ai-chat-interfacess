/**
 * FastGPT API 类型定义 - 重构版本
 * 基于统一类型定义，消除重复代码
 */

// 重新导出统一类型定义
export type {
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
} from './unified-agent';
