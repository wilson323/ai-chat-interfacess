/**
 * 消息类型枚举
 */
export enum MessageType {
  Text = 'text',
  Image = 'image',
  File = 'file',
  Code = 'code',
  Markdown = 'markdown',
  User = 'user',
  Assistant = 'assistant',
  System = 'system',
}

/**
 * 消息角色类型
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * 交互节点数据类型
 */
export interface InteractiveData {
  type: 'userSelect' | 'userInput';
  params: {
    description?: string;
    userSelectOptions?: Array<{ value: string; key: string }>;
    inputForm?: Array<{
      type: string;
      key: string;
      label: string;
      valueType: string;
      required: boolean;
    }>;
  };
  processed?: boolean; // 标记是否已处理
  selectedValue?: string; // 记录用户选择的值
  selectedKey?: string; // 记录用户选择的key
  selectedAt?: Date; // 记录选择时间
}

/**
 * 思考流程状态类型
 */
export type ThinkingStatus = 'in-progress' | 'completed';

/**
 * 交互状态类型
 */
export type InteractionStatus = 'none' | 'ready' | 'completed';

/**
 * 消息元数据类型
 */
export interface MessageMetadata {
  deviceId?: string;
  agentId?: string;
  offline?: boolean;
  error?: boolean;
  roleRaw?: string; // 原始角色信息
  files?: Array<{
    name: string;
    size: number;
    url: string;
  }>;
  fileName?: string;
  fileSize?: number;
  language?: string;
  // 新增交互节点数据
  interactiveData?: InteractiveData;
  // 新增思考流程状态管理
  thinkingStatus?: ThinkingStatus;
  interactionStatus?: InteractionStatus;
  // 处理步骤数据
  processingSteps?: ProcessingStep[];
  [key: string]: unknown;
}

/**
 * 消息接口
 */
export interface Message {
  id: string;
  type: MessageType;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
  agentId?: string; // 添加智能体ID字段
  avatar?: string; // 添加头像字段
  agentName?: string; // 添加智能体名称字段
  agentType?: string; // 添加智能体类型字段
}

/**
 * 流程节点/处理步骤类型
 */
export interface ProcessingStep {
  id: string;
  type: string;
  name: string;
  status: 'running' | 'success' | 'error' | 'pending';
  content?: string;
  timestamp: Date;
  details?: unknown;
  isNew?: boolean;
}
