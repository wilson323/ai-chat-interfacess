/**
 * 测试数据工厂
 * 生成测试用的模拟数据
 */

import { faker } from '@faker-js/faker'
import type { 
  Agent, 
  ChatMessage, 
  User, 
  ChatHistory,
  AgentConfig,
  GlobalVariable,
  ApiResponse
} from '@/types'

// 基础数据工厂
export class BaseFactory {
  /**
   * 生成随机ID
   */
  static generateId(): string {
    return faker.string.uuid()
  }
  
  /**
   * 生成随机时间戳
   */
  static generateTimestamp(): number {
    return faker.date.recent().getTime()
  }
  
  /**
   * 生成随机布尔值
   */
  static generateBoolean(): boolean {
    return faker.datatype.boolean()
  }
  
  /**
   * 生成随机数字
   */
  static generateNumber(min: number = 0, max: number = 100): number {
    return faker.number.int({ min, max })
  }
  
  /**
   * 生成随机字符串
   */
  static generateString(length: number = 10): string {
    return faker.string.alphanumeric(length)
  }
  
  /**
   * 生成随机数组
   */
  static generateArray<T>(
    generator: () => T,
    length: number = 5
  ): T[] {
    return Array.from({ length }, generator)
  }
  
  /**
   * 生成随机选择
   */
  static generateChoice<T>(choices: T[]): T {
    return faker.helpers.arrayElement(choices)
  }
  
  /**
   * 生成随机子集
   */
  static generateSubset<T>(
    array: T[],
    count: number = 3
  ): T[] {
    return faker.helpers.arrayElements(array, count)
  }
}

// 用户数据工厂
export class UserFactory extends BaseFactory {
  /**
   * 生成用户数据
   */
  static generate(overrides: Partial<User> = {}): User {
    return {
      id: this.generateId(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
      role: this.generateChoice(['user', 'admin']),
      isActive: this.generateBoolean(),
      createdAt: this.generateTimestamp(),
      updatedAt: this.generateTimestamp(),
      ...overrides
    }
  }
  
  /**
   * 生成管理员用户
   */
  static generateAdmin(overrides: Partial<User> = {}): User {
    return this.generate({
      role: 'admin',
      isActive: true,
      ...overrides
    })
  }
  
  /**
   * 生成普通用户
   */
  static generateUser(overrides: Partial<User> = {}): User {
    return this.generate({
      role: 'user',
      isActive: true,
      ...overrides
    })
  }
  
  /**
   * 生成用户数组
   */
  static generateMany(count: number = 5): User[] {
    return this.generateArray(() => this.generate(), count)
  }
}

// 智能体数据工厂
export class AgentFactory extends BaseFactory {
  /**
   * 生成智能体数据
   */
  static generate(overrides: Partial<Agent> = {}): Agent {
    return {
      id: this.generateId(),
      name: faker.person.fullName(),
      description: faker.lorem.sentence(),
      avatar: faker.image.avatar(),
      type: this.generateChoice(['fastgpt', 'cad-analyzer', 'image-editor']),
      isActive: this.generateBoolean(),
      config: AgentConfigFactory.generate(),
      createdAt: this.generateTimestamp(),
      updatedAt: this.generateTimestamp(),
      ...overrides
    }
  }
  
  /**
   * 生成FastGPT智能体
   */
  static generateFastGPT(overrides: Partial<Agent> = {}): Agent {
    return this.generate({
      type: 'fastgpt',
      name: 'FastGPT助手',
      description: '通用对话智能体',
      ...overrides
    })
  }
  
  /**
   * 生成CAD分析智能体
   */
  static generateCADAnalyzer(overrides: Partial<Agent> = {}): Agent {
    return this.generate({
      type: 'cad-analyzer',
      name: 'CAD分析器',
      description: 'CAD文件分析智能体',
      ...overrides
    })
  }
  
  /**
   * 生成图像编辑智能体
   */
  static generateImageEditor(overrides: Partial<Agent> = {}): Agent {
    return this.generate({
      type: 'image-editor',
      name: '图像编辑器',
      description: '图像编辑智能体',
      ...overrides
    })
  }
  
  /**
   * 生成智能体数组
   */
  static generateMany(count: number = 5): Agent[] {
    return this.generateArray(() => this.generate(), count)
  }
}

// 智能体配置工厂
export class AgentConfigFactory extends BaseFactory {
  /**
   * 生成智能体配置
   */
  static generate(overrides: Partial<AgentConfig> = {}): AgentConfig {
    return {
      id: this.generateId(),
      agentId: this.generateId(),
      model: this.generateChoice(['gpt-4', 'gpt-3.5-turbo', 'claude-3']),
      temperature: faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
      maxTokens: this.generateNumber(100, 4000),
      systemPrompt: faker.lorem.paragraph(),
      supportsFileUpload: this.generateBoolean(),
      supportsImageUpload: this.generateBoolean(),
      supportsVoiceInput: this.generateBoolean(),
      supportsVoiceOutput: this.generateBoolean(),
      isActive: this.generateBoolean(),
      createdAt: this.generateTimestamp(),
      updatedAt: this.generateTimestamp(),
      ...overrides
    }
  }
  
  /**
   * 生成FastGPT配置
   */
  static generateFastGPT(overrides: Partial<AgentConfig> = {}): AgentConfig {
    return this.generate({
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: '你是一个有用的AI助手',
      supportsFileUpload: true,
      supportsImageUpload: true,
      supportsVoiceInput: false,
      supportsVoiceOutput: false,
      ...overrides
    })
  }
  
  /**
   * 生成CAD分析器配置
   */
  static generateCADAnalyzer(overrides: Partial<AgentConfig> = {}): AgentConfig {
    return this.generate({
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 4000,
      systemPrompt: '你是一个专业的CAD文件分析助手',
      supportsFileUpload: true,
      supportsImageUpload: false,
      supportsVoiceInput: false,
      supportsVoiceOutput: false,
      ...overrides
    })
  }
  
  /**
   * 生成图像编辑器配置
   */
  static generateImageEditor(overrides: Partial<AgentConfig> = {}): AgentConfig {
    return this.generate({
      model: 'gpt-4-vision',
      temperature: 0.5,
      maxTokens: 2000,
      systemPrompt: '你是一个专业的图像编辑助手',
      supportsFileUpload: false,
      supportsImageUpload: true,
      supportsVoiceInput: false,
      supportsVoiceOutput: false,
      ...overrides
    })
  }
}

// 聊天消息工厂
export class ChatMessageFactory extends BaseFactory {
  /**
   * 生成聊天消息
   */
  static generate(overrides: Partial<ChatMessage> = {}): ChatMessage {
    return {
      id: this.generateId(),
      chatId: this.generateId(),
      role: this.generateChoice(['user', 'assistant', 'system']),
      content: faker.lorem.paragraph(),
      timestamp: this.generateTimestamp(),
      metadata: {
        agentId: this.generateId(),
        model: this.generateChoice(['gpt-4', 'gpt-3.5-turbo']),
        tokens: this.generateNumber(10, 1000),
        processingTime: this.generateNumber(100, 5000)
      },
      ...overrides
    }
  }
  
  /**
   * 生成用户消息
   */
  static generateUserMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
    return this.generate({
      role: 'user',
      content: faker.lorem.sentence(),
      ...overrides
    })
  }
  
  /**
   * 生成助手消息
   */
  static generateAssistantMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
    return this.generate({
      role: 'assistant',
      content: faker.lorem.paragraph(),
      ...overrides
    })
  }
  
  /**
   * 生成系统消息
   */
  static generateSystemMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
    return this.generate({
      role: 'system',
      content: faker.lorem.sentence(),
      ...overrides
    })
  }
  
  /**
   * 生成消息数组
   */
  static generateMany(count: number = 5): ChatMessage[] {
    return this.generateArray(() => this.generate(), count)
  }
  
  /**
   * 生成对话历史
   */
  static generateConversation(count: number = 10): ChatMessage[] {
    const messages: ChatMessage[] = []
    
    for (let i = 0; i < count; i++) {
      const isUser = i % 2 === 0
      const message = isUser 
        ? this.generateUserMessage()
        : this.generateAssistantMessage()
      
      message.timestamp = Date.now() - (count - i) * 1000
      messages.push(message)
    }
    
    return messages
  }
}

// 聊天历史工厂
export class ChatHistoryFactory extends BaseFactory {
  /**
   * 生成聊天历史
   */
  static generate(overrides: Partial<ChatHistory> = {}): ChatHistory {
    return {
      id: this.generateId(),
      userId: this.generateId(),
      agentId: this.generateId(),
      title: faker.lorem.sentence(3),
      messages: ChatMessageFactory.generateMany(5),
      createdAt: this.generateTimestamp(),
      updatedAt: this.generateTimestamp(),
      ...overrides
    }
  }
  
  /**
   * 生成聊天历史数组
   */
  static generateMany(count: number = 5): ChatHistory[] {
    return this.generateArray(() => this.generate(), count)
  }
}

// 全局变量工厂
export class GlobalVariableFactory extends BaseFactory {
  /**
   * 生成全局变量
   */
  static generate(overrides: Partial<GlobalVariable> = {}): GlobalVariable {
    return {
      id: this.generateId(),
      key: faker.lorem.word(),
      value: faker.lorem.sentence(),
      description: faker.lorem.sentence(),
      type: this.generateChoice(['string', 'number', 'boolean', 'object']),
      isActive: this.generateBoolean(),
      createdAt: this.generateTimestamp(),
      updatedAt: this.generateTimestamp(),
      ...overrides
    }
  }
  
  /**
   * 生成全局变量数组
   */
  static generateMany(count: number = 5): GlobalVariable[] {
    return this.generateArray(() => this.generate(), count)
  }
}

// API响应工厂
export class ApiResponseFactory extends BaseFactory {
  /**
   * 生成成功响应
   */
  static generateSuccess<T>(
    data: T,
    overrides: Partial<ApiResponse<T>> = {}
  ): ApiResponse<T> {
    return {
      success: true,
      data,
      message: 'Success',
      timestamp: this.generateTimestamp(),
      ...overrides
    }
  }
  
  /**
   * 生成错误响应
   */
  static generateError(
    message: string = 'Error',
    code: string = 'ERROR',
    overrides: Partial<ApiResponse<null>> = {}
  ): ApiResponse<null> {
    return {
      success: false,
      data: null,
      message,
      code,
      timestamp: this.generateTimestamp(),
      ...overrides
    }
  }
  
  /**
   * 生成分页响应
   */
  static generatePaginated<T>(
    data: T[],
    page: number = 1,
    pageSize: number = 10,
    total: number = 100,
    overrides: Partial<ApiResponse<T[]>> = {}
  ): ApiResponse<T[]> {
    return {
      success: true,
      data,
      message: 'Success',
      timestamp: this.generateTimestamp(),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      },
      ...overrides
    }
  }
}

// 测试场景工厂
export class TestScenarioFactory extends BaseFactory {
  /**
   * 生成完整测试场景
   */
  static generateCompleteScenario() {
    const user = UserFactory.generate()
    const agent = AgentFactory.generate()
    const chatHistory = ChatHistoryFactory.generate({
      userId: user.id,
      agentId: agent.id
    })
    const messages = ChatMessageFactory.generateConversation(10)
    
    return {
      user,
      agent,
      chatHistory: {
        ...chatHistory,
        messages
      },
      globalVariables: GlobalVariableFactory.generateMany(3)
    }
  }
  
  /**
   * 生成管理员测试场景
   */
  static generateAdminScenario() {
    const admin = UserFactory.generateAdmin()
    const agents = AgentFactory.generateMany(5)
    const users = UserFactory.generateMany(10)
    
    return {
      admin,
      agents,
      users,
      globalVariables: GlobalVariableFactory.generateMany(5)
    }
  }
  
  /**
   * 生成用户测试场景
   */
  static generateUserScenario() {
    const user = UserFactory.generateUser()
    const agent = AgentFactory.generateFastGPT()
    const chatHistory = ChatHistoryFactory.generate({
      userId: user.id,
      agentId: agent.id
    })
    
    return {
      user,
      agent,
      chatHistory
    }
  }
}

// 默认导出
export default {
  BaseFactory,
  UserFactory,
  AgentFactory,
  AgentConfigFactory,
  ChatMessageFactory,
  ChatHistoryFactory,
  GlobalVariableFactory,
  ApiResponseFactory,
  TestScenarioFactory
}
