/**
 * 临时内存存储管理器
 * 在数据库不可用时提供基础的数据存储功能
 */

interface AgentData {
  id: string;
  name: string;
  description: string;
  type: string;
  iconType: string;
  avatar: string;
  order: number;
  isPublished: boolean;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  multimodalModel: string;
  supportsStream: boolean;
  supportsDetail: boolean;
  globalVariables: any[];
  welcomeText: string;
  apiKey: string;
  appId: string;
  apiUrl: string;
  configType: 'fastgpt' | 'selfbuilt';
  selfBuiltConfig?: {
    endpoint: string;
    supportsFileUpload: boolean;
    supportedFormats: string[];
  };
}

class MemoryStorage {
  private agents: AgentData[] = [
    {
      id: '1',
      name: '默认助手',
      description: '系统默认智能助手',
      type: 'fastgpt',
      iconType: '',
      avatar: '',
      order: 1,
      isPublished: true,
      systemPrompt: '你是一个专业的AI助手。',
      temperature: 0.7,
      maxTokens: 2000,
      multimodalModel: '',
      supportsStream: true,
      supportsDetail: true,
      globalVariables: [],
      welcomeText: '您好！我是您的AI助手，有什么可以帮助您的吗？',
      apiKey: process.env.NEXT_PUBLIC_FASTGPT_API_KEY || '',
      appId: process.env.NEXT_PUBLIC_FASTGPT_APP_ID || '',
      apiUrl: process.env.NEXT_PUBLIC_FASTGPT_API_URL || 'https://zktecoaihub.com/api/v1/chat/completions',
      configType: 'fastgpt',
    },
    {
      id: '2',
      name: '图像编辑器',
      description: 'AI图像编辑和处理工具',
      type: 'image-editor',
      iconType: '',
      avatar: '',
      order: 2,
      isPublished: true,
      systemPrompt: '我是一个专业的图像编辑助手。',
      temperature: 0.7,
      maxTokens: 2000,
      multimodalModel: '',
      supportsStream: true,
      supportsDetail: true,
      globalVariables: [],
      welcomeText: '欢迎使用图像编辑器！请上传您需要处理的图片。',
      apiKey: '',
      appId: '',
      apiUrl: '',
      configType: 'selfbuilt',
      selfBuiltConfig: {
        endpoint: '/api/image-editor/analyze',
        supportsFileUpload: true,
        supportedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      },
    },
    {
      id: '3',
      name: 'CAD分析器',
      description: 'CAD图纸分析和安防设备识别',
      type: 'cad-analyzer',
      iconType: '',
      avatar: '',
      order: 3,
      isPublished: true,
      systemPrompt: '我是一个专业的CAD图纸分析助手。',
      temperature: 0.7,
      maxTokens: 2000,
      multimodalModel: '',
      supportsStream: true,
      supportsDetail: true,
      globalVariables: [],
      welcomeText: '欢迎使用CAD分析器！请上传您的CAD图纸。',
      apiKey: '',
      appId: '',
      apiUrl: '',
      configType: 'selfbuilt',
      selfBuiltConfig: {
        endpoint: '/api/cad-analyzer/analyze',
        supportsFileUpload: true,
        supportedFormats: ['jpg', 'jpeg', 'png', 'dwg', 'dxf', 'pdf'],
      },
    },
  ];

  async findAll(where: any = {}, order: any[] = []): Promise<AgentData[]> {
    // 简单过滤
    let filteredAgents = [...this.agents];

    if (where.isPublished !== undefined) {
      filteredAgents = filteredAgents.filter(agent => agent.isPublished === where.isPublished);
    }

    // 简单排序
    if (order.length > 0) {
      const [field, direction] = order[0];
      filteredAgents.sort((a: any, b: any) => {
        const aVal = a[field];
        const bVal = b[field];
        return direction === 'ASC' ? aVal - bVal : bVal - aVal;
      });
    }

    return filteredAgents;
  }

  async create(data: any): Promise<AgentData> {
    const newAgent: AgentData = {
      id: String(this.agents.length + 1),
      ...data,
    };
    this.agents.push(newAgent);
    return newAgent;
  }

  async update(id: string, data: any): Promise<[number, AgentData[]]> {
    const index = this.agents.findIndex(agent => agent.id === id);
    if (index !== -1) {
      this.agents[index] = { ...this.agents[index], ...data };
      return [1, [this.agents[index]]];
    }
    return [0, []];
  }

  async destroy(id: string): Promise<number> {
    const index = this.agents.findIndex(agent => agent.id === id);
    if (index !== -1) {
      this.agents.splice(index, 1);
      return 1;
    }
    return 0;
  }

  async findOne(where: any): Promise<AgentData | null> {
    const filteredAgents = this.agents.filter(agent => {
      return Object.entries(where).every(([key, value]) => (agent as any)[key] === value);
    });
    return filteredAgents[0] || null;
  }
}

// 创建全局实例
export const memoryStorage = new MemoryStorage();

// 创建一个兼容Sequelize模型的接口
export class MemoryAgentModel {
  static async findAll(options: any = {}) {
    return memoryStorage.findAll(options.where, options.order);
  }

  static async create(data: any) {
    return memoryStorage.create(data);
  }

  static async update(data: any, options: any) {
    return memoryStorage.update(options.where.id, data);
  }

  static async destroy(options: any) {
    return memoryStorage.destroy(options.where.id);
  }

  static async findOne(options: any) {
    return memoryStorage.findOne(options.where);
  }
}