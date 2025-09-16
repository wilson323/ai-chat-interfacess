/**
 * 聊天界面统一类型定义
 * 重构后的聊天相关类型，消除冗余
 */

import type { MessageRole } from './message';

// 基础消息类型
export interface BaseMessage {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
  metadata?: MessageMetadata;
}

// 用户消息
export interface UserMessage extends BaseMessage {
  role: 'user';
}

// AI消息
export interface AIMessage extends BaseMessage {
  role: 'assistant';
  thinkingSteps?: ProcessingStep[];
  interactiveData?: InteractiveData;
  thinkingStatus?: ThinkingStatus;
  interactionStatus?: InteractionStatus;
}

// 联合类型
export type Message = UserMessage | AIMessage;

// 消息元数据
export interface MessageMetadata {
  thinkingSteps?: ProcessingStep[];
  interactiveData?: InteractiveData;
  thinkingStatus?: ThinkingStatus;
  interactionStatus?: InteractionStatus;
  processingSteps?: ProcessingStep[];
  roleRaw?: string;
  offline?: boolean;
  [key: string]: unknown;
}

// 思考状态
export type ThinkingStatus = 'idle' | 'thinking' | 'completed' | 'error';

// 交互状态
export type InteractionStatus = 'none' | 'ready' | 'completed';

// 处理步骤
export interface ProcessingStep {
  id: string;
  type: string;
  name: string; // 必需字段，用于统一消息列表
  content?: string;
  status:
    | 'pending'
    | 'running'
    | 'success'
    | 'error'
    | 'processing'
    | 'completed'; // 兼容所有状态类型
  timestamp?: Date;
}

// 交互数据
export interface InteractiveData {
  type: 'userSelect' | 'confirmation' | 'input';
  params?: {
    userSelectOptions?: Array<{
      key: string;
      value: string;
      description?: string;
    }>;
    description?: string;
  };
  processed?: boolean;
  selectedValue?: string;
  selectedKey?: string;
  selectedAt?: Date;
}

// 聊天容器属性
export interface ChatContainerProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onEditMessage: (id: string, content: string) => void;
  onDeleteMessage: (id: string) => void;
  onRegenerateMessage: (id: string) => void;
  onCopyMessage: (content: string) => void;
  className?: string;
}

// 消息列表属性
export interface MessageListProps {
  messages: Message[];
  renderMessage: (message: Message, index: number) => React.ReactNode;
  enableVirtualization?: boolean;
  className?: string;
}

// 消息项属性
export interface MessageItemProps {
  message: Message;
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
  onRegenerate?: (id: string) => void;
  onCopy?: (content: string) => void;
  className?: string;
}

// 消息内容属性
export interface MessageContentProps {
  content: string;
  role: MessageRole;
  metadata?: MessageMetadata;
  className?: string;
}

// 思考展示属性
export interface ThinkingDisplayProps {
  thinkingSteps: ProcessingStep[];
  interactiveData: InteractiveData | undefined;
  thinkingStatus: ThinkingStatus;
  interactionStatus: InteractionStatus;
  onInteractiveSelect?: (value: string, key: string) => void;
  className?: string;
}

// 消息操作属性
export interface MessageActionsProps {
  message: Message;
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
  onRegenerate?: (id: string) => void;
  onCopy?: (content: string) => void;
  className?: string;
}

// 虚拟化选项
export interface VirtualizationOptions {
  messages: Message[];
  containerHeight: number;
  enableVirtualization: boolean;
  estimateSize?: (index: number) => number;
  overscan?: number;
}

// 思考上下文值
export interface ThinkingContextValue {
  thinkingSteps: ProcessingStep[];
  thinkingStatus: ThinkingStatus;
  interactionStatus: InteractionStatus;
  interactiveData: InteractiveData | undefined;
  updateThinkingSteps: (steps: ProcessingStep[]) => void;
  updateThinkingStatus: (status: ThinkingStatus) => void;
  updateInteractionStatus: (status: InteractionStatus) => void;
  onInteractiveSelect: (value: string, key: string) => void;
}

// 消息上下文值
export interface MessageContextValue {
  messages: Message[];
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  deleteMessage: (id: string) => void;
  clearMessages: () => void;
}

// 上传文件类型
export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string; // 统一为必需字段
  content?: string;
  status: 'uploading' | 'complete' | 'error' | 'completed'; // 兼容所有状态
  progress: number;
  error?: string;
}

// 虚拟化消息列表属性
export interface VirtualizedMessageListProps {
  messages: Message[];
  renderMessage: (message: Message, index: number) => React.ReactNode;
  enableVirtualization: boolean;
  className?: string;
}

// 聊天输入属性
export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFileUpload: (files: File[]) => void;
  onVoiceStart: () => void;
  onVoiceStop: () => void;
  onVoiceTextRecognized?: (text: string) => void;
  placeholder?: string;
  disabled: boolean;
}

// 聊天消息属性
export interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
  processingSteps: ProcessingStep[];
  showProcessingFlow: boolean;
  onEditMessage: (message: Message) => void;
  onDeleteMessage: (message: Message) => void;
  onCopyMessage: (message: Message) => void;
  onLikeMessage: (message: Message) => void;
  onDislikeMessage: (message: Message) => void;
}

// 聊天历史属性
export interface ChatHistoryProps {
  onClose: () => void;
  onSelect: (messages: Message[], chatId: string) => void;
  onNewChat: () => void;
  onManageHistory: () => void;
}
