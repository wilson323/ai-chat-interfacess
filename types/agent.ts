/**
 * 智能体类型定义 - 重构版本
 * 基于统一类型定义，消除重复代码
 */

// 重新导出统一类型定义
export type {
  UnifiedAgent,
  UnifiedAgent as Agent,
  AgentConfig,
  ConversationAgentType,
  NonConversationAgentType,
  AgentType
} from './unified-agent';

// 为了向后兼容，保留原有的类型别名
export type { GlobalVariable } from './global-variable';
