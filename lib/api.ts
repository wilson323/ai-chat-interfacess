import type { Agent } from '../types/agent';
import { logger } from './utils/logger';
import type { Message } from '../types/message';

interface ChatCompletionRequest {
  model: string;
  messages: {
    role: string;
    content: string | Array<{ type: string; [key: string]: unknown }>;
  }[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  tools?: Array<Record<string, unknown>>;
  tool_choice?: string | object;
  files?: File[];
  detail?: boolean;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
      tool_calls?: Array<Record<string, unknown>>;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  detail?: Record<string, unknown>;
}

export async function sendChatRequest(
  agent: Agent,
  messages: Message[],
  options: {
    stream?: boolean;
    temperature?: number;
    maxTokens?: number;
    onChunk?: (chunk: string) => void;
  } = {}
): Promise<ChatCompletionResponse> {
  if (!agent.apiEndpoint || !agent.apiKey || !agent.appId) {
    throw new Error(
      'API configuration is incomplete. Please configure API endpoint, key, and appId.'
    );
  }

  const formattedMessages = messages.map(msg => ({
    role: msg.role,
    content: typeof msg.content === 'string' ? msg.content : msg.content,
  }));

  const requestBody: ChatCompletionRequest = {
    model: agent.appId,
    messages: formattedMessages,
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 1000,
    stream: options.stream || true, // Default to stream: true
  };

  try {
    if (options.stream && options.onChunk) {
      // Handle streaming response
      const response = await fetch(agent.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${agent.apiKey}`,
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      let content = '';

      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(5);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const textChunk = parsed.choices[0]?.delta?.content || '';
              content += textChunk;
              options.onChunk(textChunk);
            } catch (e) {
              logger.error('Error parsing SSE chunk:', e);
            }
          }
        }
      }

      // Return a simulated response for streaming
      return {
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: agent.appId,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: content,
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
      };
    } else {
      // Handle regular response
      const response = await fetch(agent.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${agent.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }

      return await response.json();
    }
  } catch (error) {
    logger.error('API request error:', error);
    throw error;
  }
}
