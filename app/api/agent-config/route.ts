import { MemoryAgentModel } from '../../../lib/storage/memory-storage';
import { NextResponse } from 'next/server';

// 智能体数据接口定义
interface AgentData {
  id: string | number;
  name: string;
  description?: string;
  type: string;
  iconType?: string;
  avatar?: string;
  order?: number;
  isPublished: boolean;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  multimodalModel?: string;
  supportsStream?: boolean;
  supportsDetail?: boolean;
  globalVariables?: string;
  welcomeText?: string;
  apiKey?: string;
  appId?: string;
  apiUrl?: string;
  updatedAt?: Date | string;
}

// 获取所有已发布的智能体列表（用户端）
export async function GET() {
  try {
    // 从内存存储获取智能体数据
    const agents = await MemoryAgentModel.findAll({
      where: { isPublished: true },
      order: [
        ['order', 'ASC'],
        ['id', 'DESC'], // 使用id作为后备排序字段
      ],
    });

    // 处理智能体数据，分离FastGPT和自研智能体
    const processedAgents = agents.map((a: AgentData) => {
      const baseAgent = {
        id: String(a.id),
        name: a.name,
        description: a.description ?? '',
        type: a.type,
        iconType: a.iconType ?? '',
        avatar: a.avatar ?? '',
        order: a.order ?? 100,
        isPublished: a.isPublished,
        systemPrompt: a.systemPrompt ?? '',
        temperature: a.temperature ?? 0.7,
        maxTokens: a.maxTokens ?? 2000,
        multimodalModel: a.multimodalModel ?? '',
        supportsStream: a.supportsStream ?? true,
        supportsDetail: a.supportsDetail ?? true,
        globalVariables: a.globalVariables && a.globalVariables.trim() !== ''
          ? JSON.parse(a.globalVariables)
          : [],
        welcomeText: a.welcomeText ?? '',
      };

      // 根据智能体类型返回不同的配置信息
      if (a.type === 'fastgpt') {
        return {
          ...baseAgent,
          // FastGPT智能体需要完整的API配置
          apiKey: a.apiKey ?? '',
          appId: a.appId ?? '',
          apiUrl: a.apiUrl ?? 'https://zktecoaihub.com/api/v1/chat/completions',
          configType: 'fastgpt' as const,
        };
      } else {
        // 自研智能体（CAD分析器、图像编辑器等）
        return {
          ...baseAgent,
          // 自研智能体不需要敏感的API配置
          apiKey: '',
          appId: '',
          apiUrl: '',
          configType: 'selfbuilt' as const,
          // 自研智能体特定的配置
          selfBuiltConfig: {
            endpoint: `/api/${a.type}/analyze`,
            supportsFileUpload: ['image-editor', 'cad-analyzer'].includes(
              a.type
            ),
            supportedFormats:
              a.type === 'image-editor'
                ? ['jpg', 'jpeg', 'png', 'webp', 'gif']
                : a.type === 'cad-analyzer'
                  ? ['jpg', 'jpeg', 'png', 'dwg', 'dxf', 'pdf']
                  : [],
          },
        };
      }
    });

    console.log(
      `返回 ${processedAgents.length} 个已发布智能体 (FastGPT: ${processedAgents.filter(a => a.type === 'fastgpt').length}, 自研: ${processedAgents.filter(a => a.type !== 'fastgpt').length})`
    );

    return NextResponse.json({ success: true, data: processedAgents });
  } catch (error) {
    console.error('获取智能体列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取智能体列表失败', detail: String(error) },
      { status: 500 }
    );
  }
}
