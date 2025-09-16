/**
 * 统一的Message相关类型定义
 * 整合了分散在各个文件中的Message类型
 */

// 消息元数据
export interface MessageMetadata {
  timestamp: Date;
  userId: string;
  sessionId: string;
  agentId?: string;
  model?: string;
  tokens?: number;
  responseTime?: number;
  feedback?: 'positive' | 'negative' | 'neutral';
  source?: string;
  version?: string;
}

// 核心消息接口
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: MessageMetadata;
  parentId?: string;
  children?: string[];
  type?: 'text' | 'image' | 'file' | 'voice';
  attachments?: MessageAttachment[];
}

// 消息附件
export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'audio' | 'video';
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

// FastGPT聊天消息
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// 消息反馈请求
export interface MessageFeedbackRequest {
  messageId: string;
  feedback: 'positive' | 'negative' | 'neutral';
  comment?: string;
  userId: string;
}

// 消息反馈响应
export interface MessageFeedbackResponse {
  success: boolean;
  messageId: string;
  feedback: 'positive' | 'negative' | 'neutral';
  timestamp: Date;
}

// 消息状态
export type MessageStatus =
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';

// 消息类型
export type MessageType =
  | 'text'
  | 'image'
  | 'file'
  | 'voice'
  | 'video'
  | 'location'
  | 'contact';

// 消息方向
export type MessageDirection = 'incoming' | 'outgoing';

// 扩展消息接口（包含状态和方向）
export interface ExtendedMessage extends Message {
  status: MessageStatus;
  direction: MessageDirection;
  isRead: boolean;
  readAt?: Date;
  deliveredAt?: Date;
}

// 消息列表项
export interface MessageListItem {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  status: MessageStatus;
  direction: MessageDirection;
  metadata?: MessageMetadata;
}

// 消息搜索结果
export interface MessageSearchResult {
  message: Message;
  relevanceScore: number;
  context: string;
  highlights: string[];
}

// 消息统计
export interface MessageStats {
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  systemMessages: number;
  averageLength: number;
  totalTokens: number;
  averageResponseTime: number;
}
