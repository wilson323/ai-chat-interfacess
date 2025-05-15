// FastGPT Chat Completion 请求体
export interface ChatCompletionRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant' | 'function';
    content: string;
    function_call?: any;
  }>;
  model?: string;
  agent_id?: string;
  knowledge_id?: string;
  user?: string;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
  stop?: string[];
  tools?: any[];
}

// FastGPT Chat Completion 非流式响应体
export interface ChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      function_call?: any;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// FastGPT Chat Completion 流式响应体（SSE chunk）
export interface ChatCompletionChunk {
  id: string;
  object: 'chat.completion.chunk';
  choices: Array<{
    delta: {
      content?: string;
      function_call?: any;
    };
    index: number;
  }>;
}

// FastGPT 会话初始化请求体
export interface InitChatRequest {
  model?: string;
  agent_id?: string;
  knowledge_id?: string;
  user?: string;
}

// FastGPT 会话初始化响应体
export interface InitChatResponse {
  system_prompt: string;
  welcome_message: string;
  model: string;
  knowledge_id?: string;
  agent_id?: string;
  agent_config?: {
    name: string;
    avatar: string;
    description: string;
  };
  user: string;
  tools?: any[];
  interacts?: any[];
}

// FastGPT 历史会话
export interface ChatSession {
  session_id: string;
  last_message: string;
  updated_at: number;
  created_at: number;
  agent_id: string;
  name: string;
  unread_count: number;
}

// FastGPT 历史消息
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  timestamp: number;
  message_id: string;
}

// FastGPT 消息反馈请求
export interface MessageFeedbackRequest {
  dataId: string;
  type: 'like' | 'unlike';
}

// FastGPT 消息反馈响应
export interface MessageFeedbackResponse {
  code: number;
  message: string;
}

// 新增/补全工具调用、插件、节点、resume等类型定义
export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface FunctionCall {
  name: string;
  arguments: Record<string, any>;
}

export interface NodeResponse {
  nodeId: string;
  status: 'success' | 'error' | 'wait' | 'continue' | 'pending';
  outputs: Record<string, any>;
  message?: string;
  error?: string | null;
  awaitInput?: boolean;
  missingFields?: string[];
  logs?: string[];
  runTime?: number;
}

export interface ResumeNodeRequest {
  nodeId: string;
  resumeData: Record<string, any>;
}

export interface ResumeNodeResponse extends NodeResponse {} 