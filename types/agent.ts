import type React from 'react';

export type ConversationAgentType = 'fastgpt';
export type NonConversationAgentType = 'image-editor' | 'cad-analyzer';
export type AgentType = ConversationAgentType | NonConversationAgentType;

// 全局变量类型定义
export interface GlobalVariable {
  id: string;
  key: string;
  label: string;
  type: string; // 'custom' | 'select' | 'text' | 'number' | 'boolean' 等
  required: boolean;
  valueType: string; // 'any' | 'string' | 'number' | 'boolean'
  description?: string;
  defaultValue?: string;
  maxLen?: number;
  icon?: string;
  enums?: Array<{ value: string; label?: string }>;
  list?: Array<{ value: string; label?: string }>;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  iconType?: string;
  icon?: React.ReactNode;
  apiEndpoint?: string;
  apiUrl?: string;
  apiKey?: string;
  appId?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  supportsFileUpload?: boolean;
  supportsImageUpload?: boolean;
  multimodalModel?: string;
  isPublished?: boolean;
  chatId?: string;
  avatar?: string;
  welcomeText?: string;
  welcomeMessage?: string;
  order?: number;
  supportsStream: boolean;
  supportsDetail: boolean;
  globalVariables?: GlobalVariable[]; // 新增全局变量字段
}
