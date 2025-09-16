/**
 * 统一的Agent相关类型定义
 * 整合了分散在各个文件中的Agent类型
 */

import type React from 'react';
import type { GlobalVariable } from './global-variable';
import type { AgentConfig } from './unified-agent';

// 基础类型定义
export type ConversationAgentType = 'fastgpt';
export type NonConversationAgentType = 'image-editor' | 'cad-analyzer';
export type AgentType = ConversationAgentType | NonConversationAgentType;

// 核心Agent接口
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
  supportsVoiceInput?: boolean;
  supportsVoiceOutput?: boolean;
  multimodalModel?: string;
  isPublished?: boolean;
  isActive?: boolean;
  chatId?: string;
  avatar?: string;
  welcomeText?: string;
  welcomeMessage?: string;
  order?: number;
  supportsStream: boolean;
  supportsDetail: boolean;
  globalVariables?: GlobalVariable[];
  config?: AgentConfig;
}

// Agent配置接口
// AgentConfig 已移至 unified-agent.ts 中统一定义

// Agent使用统计
export interface AgentUsageStats {
  id: number;
  agentId: number;
  userId?: string;
  date: Date;
  requestCount: number;
  sessionCount: number;
  createdAt: Date;
}

// 扩展的Agent配置（数据库模型）
export interface ExtendedAgentConfig {
  id: number;
  name: string;
  type: string;
  apiKey: string;
  appId: string;
  apiUrl?: string;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
  supportsFileUpload?: boolean;
  supportsImageUpload?: boolean;
  supportsVoiceInput?: boolean;
  supportsVoiceOutput?: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Agent性能数据
export interface AgentPerformanceData {
  agentId: string;
  responseTime: number;
  successRate: number;
  errorRate: number;
  requestCount: number;
  timestamp: Date;
}

// Agent使用数据（分析用）
export interface AgentUsageData {
  agentId: string;
  agentName: string;
  usageCount: number;
  uniqueUsers: number;
  averageSessionDuration: number;
  successRate: number;
  lastUsed: Date;
}

// Agent类型比较数据
export interface AgentTypeComparisonData {
  agentType: string;
  totalUsage: number;
  averageResponseTime: number;
  successRate: number;
  userSatisfaction: number;
}

// Agent使用属性（数据库）
export interface AgentUsageAttributes {
  id: number;
  sessionId: string;
  userId: number;
  agentId: number;
  messageType: 'text' | 'image' | 'file' | 'voice';
  messageCount: number;
  tokenUsage: number;
  responseTime: number;
  startTime: Date;
  endTime: Date;
  duration: number;
  isCompleted: boolean;
  userSatisfaction: 'positive' | 'neutral' | 'negative';
  geoLocationId?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Agent使用创建属性
export interface AgentUsageCreationAttributes {
  sessionId: string;
  userId: number;
  agentId: number;
  messageType: 'text' | 'image' | 'file' | 'voice';
  messageCount: number;
  tokenUsage: number;
  responseTime: number;
  startTime: Date;
  endTime: Date;
  duration: number;
  isCompleted: boolean;
  userSatisfaction: 'positive' | 'neutral' | 'negative';
  geoLocationId?: number;
}
