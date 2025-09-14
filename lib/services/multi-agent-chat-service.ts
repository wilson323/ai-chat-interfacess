/**
 * 多智能体聊天服务
 * 整合FastGPT多智能体管理器和智能客户端，提供统一的聊天接口
 */

import { FastGPTIntelligentClient } from './fastgpt/intelligent-client';
import { getGlobalIntelligentClient } from './fastgpt/global-client';
import type { Agent } from '@/types/agent';
import type { Message } from '@/types/message';
import type {
  StreamOptions,
  ChatInitResponse,
  FastGPTChatResponse
} from './fastgpt';

export interface ChatServiceOptions {
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  variables?: Record<string, any>;
  onChunk?: (chunk: string) => void;
  onProcessingStep?: (step: any) => void;
  onIntermediateValue?: (value: any, eventType: string) => void;
  onError?: (error: Error) => void;
  onStart?: () => void;
  onFinish?: () => void;
  signal?: AbortSignal;
}

export interface ChatServiceResponse {
  agentId: string;
  response: Promise<void>;
  agentName: string;
  agentType: string;
}

/**
 * 多智能体聊天服务类
 */
export class MultiAgentChatService {
  private intelligentClient: FastGPTIntelligentClient;
  private currentAgentId: string | null = null;

  constructor() {
    this.intelligentClient = getGlobalIntelligentClient();
  }

  /**
   * 初始化聊天会话
   */
  async initializeChat(agent: Agent, chatId?: string): Promise<ChatInitResponse> {
    try {
      // 如果是FastGPT智能体，使用智能客户端
      if (agent.type === 'fastgpt') {
        const fastGPTClient = this.intelligentClient.getClient(agent.id);
        if (fastGPTClient) {
          return await fastGPTClient.initializeChat(chatId);
        }
      }

      // 对于自研智能体或其他类型，返回默认初始化响应
      return this.generateFallbackInitResponse(agent, chatId);
    } catch (error) {
      console.error('Chat initialization error:', error);
      return this.generateFallbackInitResponse(agent, chatId);
    }
  }

  /**
   * 发送聊天消息
   * 支持多智能体动态选择和负载均衡
   */
  async sendMessage(
    messages: Message[],
    agent: Agent,
    options: ChatServiceOptions = {}
  ): Promise<ChatServiceResponse> {

    // 设置当前智能体
    this.currentAgentId = agent.id;

    console.log(`🚀 MultiAgentChatService: Sending message to agent ${agent.name} (${agent.type})`);

    // 根据智能体类型选择不同的处理策略
    switch (agent.type) {
      case 'fastgpt':
        return this.handleFastGPTChat(messages, agent, options);
      case 'image-editor':
        return this.handleImageEditorChat(messages, agent, options);
      case 'cad-analyzer':
        return this.handleCADAnalyzerChat(messages, agent, options);
      default:
        return this.handleGenericChat(messages, agent, options);
    }
  }

  /**
   * 处理FastGPT智能体聊天
   */
  private async handleFastGPTChat(
    messages: Message[],
    agent: Agent,
    options: ChatServiceOptions
  ): Promise<ChatServiceResponse> {

    // 转换消息格式
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // 转换选项格式
    const streamOptions: StreamOptions = {
      stream: options.stream ?? true,
      temperature: options.temperature ?? agent.temperature,
      maxTokens: options.maxTokens ?? agent.maxTokens,
      variables: options.variables || {},
      onStart: options.onStart,
      onChunk: options.onChunk,
      onProcessingStep: options.onProcessingStep,
      onIntermediateValue: options.onIntermediateValue,
      onError: options.onError,
      onFinish: options.onFinish,
      signal: options.signal
    };

    try {
      // 使用智能客户端进行聊天，支持多智能体动态选择
      const { agentId: selectedAgentId, response } = await this.intelligentClient.streamChat(
        formattedMessages,
        streamOptions,
        agent.id // 优先使用指定的智能体
      );

      const selectedAgent = this.intelligentClient.getAgent(selectedAgentId) || agent;

      return {
        agentId: selectedAgentId,
        response,
        agentName: selectedAgent.name,
        agentType: selectedAgent.type
      };
    } catch (error) {
      console.error('FastGPT chat error:', error);
      throw error;
    }
  }

  /**
   * 处理图像编辑器智能体聊天
   */
  private async handleImageEditorChat(
    messages: Message[],
    agent: Agent,
    options: ChatServiceOptions
  ): Promise<ChatServiceResponse> {

    const response = new Promise<void>(async (resolve, reject) => {
      try {
        if (options.onStart) options.onStart();

        // 模拟图像编辑器的处理逻辑
        const lastMessage = messages[messages.length - 1];
        const responseText = await this.processImageEditorRequest(lastMessage.content, agent);

        if (options.onChunk) {
          // 分块发送响应以模拟流式效果
          for (let i = 0; i < responseText.length; i += 10) {
            const chunk = responseText.slice(i, i + 10);
            options.onChunk(chunk);
            await new Promise(r => setTimeout(r, 20));
          }
        }

        if (options.onFinish) options.onFinish();
        resolve();
      } catch (error) {
        if (options.onError) options.onError(error as Error);
        reject(error);
      }
    });

    return {
      agentId: agent.id,
      response,
      agentName: agent.name,
      agentType: agent.type
    };
  }

  /**
   * 处理CAD分析器智能体聊天
   */
  private async handleCADAnalyzerChat(
    messages: Message[],
    agent: Agent,
    options: ChatServiceOptions
  ): Promise<ChatServiceResponse> {

    const response = new Promise<void>(async (resolve, reject) => {
      try {
        if (options.onStart) options.onStart();

        // 模拟CAD分析器的处理逻辑
        const lastMessage = messages[messages.length - 1];
        const responseText = await this.processCADAnalyzerRequest(lastMessage.content, agent);

        if (options.onChunk) {
          // 分块发送响应以模拟流式效果
          for (let i = 0; i < responseText.length; i += 10) {
            const chunk = responseText.slice(i, i + 10);
            options.onChunk(chunk);
            await new Promise(r => setTimeout(r, 20));
          }
        }

        if (options.onFinish) options.onFinish();
        resolve();
      } catch (error) {
        if (options.onError) options.onError(error as Error);
        reject(error);
      }
    });

    return {
      agentId: agent.id,
      response,
      agentName: agent.name,
      agentType: agent.type
    };
  }

  /**
   * 处理通用智能体聊天
   */
  private async handleGenericChat(
    messages: Message[],
    agent: Agent,
    options: ChatServiceOptions
  ): Promise<ChatServiceResponse> {

    const response = new Promise<void>(async (resolve, reject) => {
      try {
        if (options.onStart) options.onStart();

        // 模拟通用智能体的处理逻辑
        const lastMessage = messages[messages.length - 1];
        const responseText = await this.processGenericRequest(lastMessage.content, agent);

        if (options.onChunk) {
          // 分块发送响应以模拟流式效果
          for (let i = 0; i < responseText.length; i += 10) {
            const chunk = responseText.slice(i, i + 10);
            options.onChunk(chunk);
            await new Promise(r => setTimeout(r, 20));
          }
        }

        if (options.onFinish) options.onFinish();
        resolve();
      } catch (error) {
        if (options.onError) options.onError(error as Error);
        reject(error);
      }
    });

    return {
      agentId: agent.id,
      response,
      agentName: agent.name,
      agentType: agent.type
    };
  }

  /**
   * 处理图像编辑器请求
   */
  private async processImageEditorRequest(content: string, agent: Agent): Promise<string> {
    // 这里应该调用实际的图像编辑API
    // 现在返回模拟响应
    await new Promise(r => setTimeout(r, 1000));

    if (content.toLowerCase().includes('上传') || content.toLowerCase().includes('图片')) {
      return '我可以帮您处理图片编辑任务。请上传您需要编辑的图片，我可以进行裁剪、调整亮度、添加滤镜等操作。您想要进行什么样的图片编辑？';
    }

    return '我是图像编辑助手，可以帮您进行各种图片处理操作，包括裁剪、调色、滤镜添加、背景去除等。请告诉我您的具体需求，或者直接上传图片开始编辑。';
  }

  /**
   * 处理CAD分析器请求
   */
  private async processCADAnalyzerRequest(content: string, agent: Agent): Promise<string> {
    // 这里应该调用实际的CAD分析API
    // 现在返回模拟响应
    await new Promise(r => setTimeout(r, 1500));

    if (content.toLowerCase().includes('图纸') || content.toLowerCase().includes('cad')) {
      return '我是CAD图纸分析助手，可以帮您分析CAD图纸中的安防设备布局。请上传您的CAD图纸，我将识别其中的摄像头、报警器等安防设备，并生成详细的分析报告。';
    }

    return '我可以分析CAD图纸中的安防设备布局，包括摄像头、报警器、门禁等设备的位置和覆盖范围。请上传您的CAD图纸开始分析。';
  }

  /**
   * 处理通用请求
   */
  private async processGenericRequest(content: string, agent: Agent): Promise<string> {
    // 通用智能体的处理逻辑
    await new Promise(r => setTimeout(r, 800));

    return `我是${agent.name}，很高兴为您服务。您的问题是："${content}"。我会尽力为您提供帮助。请问有什么具体需要我协助的吗？`;
  }

  /**
   * 生成回退初始化响应
   */
  private generateFallbackInitResponse(agent: Agent, chatId?: string): ChatInitResponse {
    const fallbackChatId = chatId || `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    let welcomeMessage = '您好！我是智能助手，很高兴为您服务。';
    let interacts: string[] = [];

    if (agent.type === 'image-editor') {
      welcomeMessage = '欢迎使用图像编辑助手！';
      interacts = ['如何裁剪图片？', '能帮我调整图片亮度吗？', '如何添加滤镜效果？'];
    } else if (agent.type === 'cad-analyzer') {
      welcomeMessage = '欢迎使用CAD分析助手！';
      interacts = ['如何分析CAD图纸？', '能识别摄像头位置吗？', '如何生成分析报告？'];
    }

    return {
      code: 200,
      data: {
        chatId: fallbackChatId,
        appId: agent.appId || 'fallback-app-id',
        variables: {},
        app: {
          chatConfig: {
            questionGuide: true,
            ttsConfig: { type: 'normal' },
            whisperConfig: { open: false, autoSend: false, autoTTSResponse: false },
            chatInputGuide: { open: false, textList: [], customUrl: '' },
            instruction: '',
            variables: [],
            fileSelectConfig: { canSelectFile: false, canSelectImg: false, maxFiles: 5 },
            _id: '',
            welcomeText: agent.welcomeText || welcomeMessage,
          },
          chatModels: [agent.multimodalModel || 'gpt-3.5-turbo'],
          name: agent.name || 'AI Assistant',
          avatar: '',
          intro: agent.description || '',
          type: 'chat',
          pluginInputs: [],
        },
        interacts,
      },
    };
  }

  /**
   * 获取当前活跃的智能体信息
   */
  getCurrentAgentInfo(): { agentId: string | null; agentName: string | null } {
    if (!this.currentAgentId) {
      return { agentId: null, agentName: null };
    }

    const agent = this.intelligentClient.getAgent(this.currentAgentId);
    return {
      agentId: this.currentAgentId,
      agentName: agent?.name || null
    };
  }

  /**
   * 获取可用的智能体列表
   */
  getAvailableAgents(): Agent[] {
    return this.intelligentClient.getAllAgents();
  }

  /**
   * 添加新的智能体配置
   */
  async addAgent(agent: Agent): Promise<void> {
    await this.intelligentClient.addAgent(agent);
  }

  /**
   * 移除智能体配置
   */
  async removeAgent(agentId: string): Promise<void> {
    await this.intelligentClient.removeAgent(agentId);
  }

  /**
   * 更新智能体配置
   */
  async updateAgent(agent: Agent): Promise<void> {
    await this.intelligentClient.updateAgent(agent);
  }

  /**
   * 获取智能体统计信息
   */
  getAgentStats() {
    return this.intelligentClient.getAgentStats();
  }
}

// 创建全局聊天服务实例
let globalChatService: MultiAgentChatService | null = null;

/**
 * 获取全局聊天服务实例
 */
export function getGlobalChatService(): MultiAgentChatService {
  if (!globalChatService) {
    globalChatService = new MultiAgentChatService();
  }
  return globalChatService;
}

/**
 * 重置全局聊天服务实例（主要用于测试）
 */
export function resetGlobalChatService(): void {
  globalChatService = null;
}