import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type {
  ModelConfig,
  ModelConfigQuery,
  ModelConfigResponse,
} from '@/types/model-config';

// 模型配置验证模式
const modelConfigSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['openai', 'fastgpt', 'local', 'custom', 'azure', 'anthropic']),
  provider: z.string().min(1),
  version: z.string().min(1),
  status: z.enum(['active', 'inactive', 'deprecated', 'testing']),
  capabilities: z.array(
    z.object({
      type: z.enum([
        'text',
        'image',
        'audio',
        'multimodal',
        'code',
        'function',
      ]),
      supported: z.boolean(),
      maxTokens: z.number().optional(),
      maxImages: z.number().optional(),
      maxAudioDuration: z.number().optional(),
      maxFileSize: z.number().optional(),
      supportedFormats: z.array(z.string()).optional(),
      description: z.string().optional(),
    })
  ),
  parameters: z.object({
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().min(1),
    topP: z.number().min(0).max(1),
    frequencyPenalty: z.number().min(-2).max(2),
    presencePenalty: z.number().min(-2).max(2),
    stopSequences: z.array(z.string()),
    customParameters: z.record(z.any()),
    timeout: z.number().optional(),
    retryCount: z.number().optional(),
  }),
  metadata: z.object({
    description: z.string().min(1),
    tags: z.array(z.string()),
    category: z.string().min(1),
    costPerToken: z.number().min(0),
    latency: z.number().min(0),
    accuracy: z.number().min(0).max(1),
    version: z.string().min(1),
    releaseDate: z.date().optional(),
    documentation: z.string().optional(),
    examples: z.array(z.string()).optional(),
  }),
  apiKey: z.string().optional(),
  apiEndpoint: z.string().optional(),
  isDefault: z.boolean(),
});

// 模拟数据库
let modelConfigs: ModelConfig[] = [
  {
    id: '1',
    name: 'GPT-4 Turbo',
    type: 'openai',
    provider: 'OpenAI',
    version: 'gpt-4-turbo-preview',
    status: 'active',
    capabilities: [
      { type: 'text', supported: true, maxTokens: 128000 },
      { type: 'multimodal', supported: true, maxImages: 10 },
    ],
    parameters: {
      temperature: 0.7,
      maxTokens: 4000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      stopSequences: [],
      customParameters: {},
    },
    metadata: {
      description: '最新的GPT-4模型，支持多模态输入',
      tags: ['gpt-4', 'multimodal', 'latest'],
      category: 'General Purpose',
      costPerToken: 0.00003,
      latency: 1200,
      accuracy: 0.95,
      usageCount: 1250,
      version: '1.0.0',
      releaseDate: new Date('2024-01-01'),
    },
    isDefault: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'admin',
    updatedBy: 'admin',
  },
];

// GET /api/admin/model-config - 获取模型配置列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 解析查询参数
    const query: ModelConfigQuery = {
      search: searchParams.get('search') || undefined,
      type: (searchParams.get('type') as any) || undefined,
      status: (searchParams.get('status') as any) || undefined,
      provider: searchParams.get('provider') || undefined,
      category: searchParams.get('category') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sortBy: (searchParams.get('sortBy') as any) || 'name',
      sortOrder: (searchParams.get('sortOrder') as any) || 'asc',
    };

    // 过滤数据
    let filteredModels = modelConfigs;

    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filteredModels = filteredModels.filter(
        model =>
          model.name.toLowerCase().includes(searchLower) ||
          model.provider.toLowerCase().includes(searchLower) ||
          model.metadata.description.toLowerCase().includes(searchLower)
      );
    }

    if (query.type) {
      filteredModels = filteredModels.filter(
        model => model.type === query.type
      );
    }

    if (query.status) {
      filteredModels = filteredModels.filter(
        model => model.status === query.status
      );
    }

    if (query.provider) {
      filteredModels = filteredModels.filter(
        model => model.provider === query.provider
      );
    }

    if (query.category) {
      filteredModels = filteredModels.filter(
        model => model.metadata.category === query.category
      );
    }

    // 排序
    filteredModels.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (query.sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'updatedAt':
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
        case 'usageCount':
          aValue = a.metadata.usageCount;
          bValue = b.metadata.usageCount;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (query.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    // 分页
    const total = filteredModels.length;
    const totalPages = Math.ceil(total / query.limit!);
    const startIndex = (query.page! - 1) * query.limit!;
    const endIndex = startIndex + query.limit!;
    const paginatedModels = filteredModels.slice(startIndex, endIndex);

    const response: ModelConfigResponse = {
      models: paginatedModels,
      total,
      page: query.page!,
      limit: query.limit!,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('获取模型配置列表失败:', error);
    return NextResponse.json(
      { error: '获取模型配置列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/admin/model-config - 创建模型配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证数据
    const validatedData = modelConfigSchema.parse(body);

    // 创建新模型配置
    const newModel: ModelConfig = {
      id: Date.now().toString(),
      ...validatedData,
      metadata: {
        ...validatedData.metadata,
        usageCount: 0,
        lastUsed: undefined,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin', // 实际应用中从认证信息获取
      updatedBy: 'admin',
    };

    // 如果设置为默认模型，取消其他模型的默认状态
    if (newModel.isDefault) {
      modelConfigs = modelConfigs.map(model => ({
        ...model,
        isDefault: false,
      }));
    }

    modelConfigs.push(newModel);

    return NextResponse.json({
      success: true,
      message: '模型配置创建成功',
      data: newModel,
    });
  } catch (error) {
    console.error('创建模型配置失败:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: '数据验证失败',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: '创建模型配置失败' }, { status: 500 });
  }
}

// PUT /api/admin/model-config - 批量更新模型配置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: '更新数据格式错误' }, { status: 400 });
    }

    const updatedModels: ModelConfig[] = [];

    for (const update of updates) {
      const { id, ...updateData } = update;
      const modelIndex = modelConfigs.findIndex(model => model.id === id);

      if (modelIndex === -1) {
        continue;
      }

      // 如果设置为默认模型，取消其他模型的默认状态
      if (updateData.isDefault) {
        modelConfigs = modelConfigs.map(model => ({
          ...model,
          isDefault: model.id === id ? true : false,
        }));
      }

      const updatedModel: ModelConfig = {
        ...modelConfigs[modelIndex],
        ...updateData,
        updatedAt: new Date(),
        updatedBy: 'admin',
      };

      modelConfigs[modelIndex] = updatedModel;
      updatedModels.push(updatedModel);
    }

    return NextResponse.json({
      success: true,
      message: '模型配置更新成功',
      data: updatedModels,
    });
  } catch (error) {
    console.error('批量更新模型配置失败:', error);
    return NextResponse.json(
      { error: '批量更新模型配置失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/model-config - 批量删除模型配置
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: '删除数据格式错误' }, { status: 400 });
    }

    const deletedCount = modelConfigs.length;
    modelConfigs = modelConfigs.filter(model => !ids.includes(model.id));

    return NextResponse.json({
      success: true,
      message: `成功删除 ${deletedCount - modelConfigs.length} 个模型配置`,
      deletedCount: deletedCount - modelConfigs.length,
    });
  } catch (error) {
    console.error('批量删除模型配置失败:', error);
    return NextResponse.json(
      { error: '批量删除模型配置失败' },
      { status: 500 }
    );
  }
}
