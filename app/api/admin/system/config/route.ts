import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/api/auth';
import { ApiResponse } from '@/types';
import { SystemConfig, ConfigType } from '@/types/admin';
import { z } from 'zod';

// 配置验证模式
const createConfigSchema = z.object({
  configKey: z.string().min(1).max(100),
  configValue: z.string().min(1),
  configType: z.nativeEnum(ConfigType),
  description: z.string().optional(),
  isSensitive: z.boolean().default(false),
});

const updateConfigSchema = z.object({
  configValue: z.string().min(1),
  configType: z.nativeEnum(ConfigType).optional(),
  description: z.string().optional(),
  isSensitive: z.boolean().optional(),
});

// 模拟系统配置服务
class SystemConfigService {
  private configs: Map<string, SystemConfig> = new Map();

  constructor() {
    // 初始化默认配置
    this.initializeDefaultConfigs();
  }

  private initializeDefaultConfigs() {
    const defaultConfigs: Omit<
      SystemConfig,
      'id' | 'createdAt' | 'updatedAt'
    >[] = [
      {
        configKey: 'system.name',
        configValue: 'NeuroGlass AI Chat Interface',
        configType: ConfigType.STRING,
        description: '系统名称',
        isSensitive: false,
        version: 1,
      },
      {
        configKey: 'system.description',
        configValue: '智能对话平台',
        configType: ConfigType.STRING,
        description: '系统描述',
        isSensitive: false,
        version: 1,
      },
      {
        configKey: 'system.enable_registration',
        configValue: 'false',
        configType: ConfigType.BOOLEAN,
        description: '是否允许用户注册',
        isSensitive: false,
        version: 1,
      },
      {
        configKey: 'system.session_timeout',
        configValue: '3600',
        configType: ConfigType.NUMBER,
        description: '会话超时时间（秒）',
        isSensitive: false,
        version: 1,
      },
      {
        configKey: 'system.max_upload_size',
        configValue: '10485760',
        configType: ConfigType.NUMBER,
        description: '最大上传文件大小（字节）',
        isSensitive: false,
        version: 1,
      },
      {
        configKey: 'email.smtp_host',
        configValue: 'smtp.example.com',
        configType: ConfigType.STRING,
        description: 'SMTP服务器地址',
        isSensitive: false,
        version: 1,
      },
      {
        configKey: 'email.smtp_port',
        configValue: '587',
        configType: ConfigType.NUMBER,
        description: 'SMTP服务器端口',
        isSensitive: false,
        version: 1,
      },
    ];

    let id = 1;
    for (const config of defaultConfigs) {
      this.configs.set(config.configKey, {
        id: id++,
        ...config,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  async getConfigs(): Promise<SystemConfig[]> {
    return Array.from(this.configs.values());
  }

  async getConfig(key: string): Promise<SystemConfig | null> {
    return this.configs.get(key) || null;
  }

  async createConfig(
    configData: z.infer<typeof createConfigSchema>
  ): Promise<SystemConfig> {
    // 检查配置键是否已存在
    if (this.configs.has(configData.configKey)) {
      throw new Error('配置键已存在');
    }

    const newConfig: SystemConfig = {
      id: Date.now(),
      ...configData,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.configs.set(configData.configKey, newConfig);
    return newConfig;
  }

  async updateConfig(
    key: string,
    updateData: z.infer<typeof updateConfigSchema>
  ): Promise<SystemConfig | null> {
    const existingConfig = this.configs.get(key);
    if (!existingConfig) return null;

    const updatedConfig: SystemConfig = {
      ...existingConfig,
      ...updateData,
      version: existingConfig.version + 1,
      updatedAt: new Date(),
    };

    this.configs.set(key, updatedConfig);
    return updatedConfig;
  }

  async deleteConfig(key: string): Promise<boolean> {
    return this.configs.delete(key);
  }

  async getConfigsByType(type: ConfigType): Promise<SystemConfig[]> {
    return Array.from(this.configs.values()).filter(
      config => config.configType === type
    );
  }

  async getSensitiveConfigs(): Promise<SystemConfig[]> {
    return Array.from(this.configs.values()).filter(
      config => config.isSensitive
    );
  }
}

const systemConfigService = new SystemConfigService();

// GET /api/admin/system/config - 获取系统配置
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const isAdminUser = await isAdmin(request);
    if (!isAdminUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '需要管理员权限',
          },
        } as ApiResponse,
        { status: 401 }
      );
    }

    // 解析查询参数
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as ConfigType | null;
    const sensitive = searchParams.get('sensitive') === 'true';

    let configs: SystemConfig[];

    if (type) {
      configs = await systemConfigService.getConfigsByType(type);
    } else if (sensitive) {
      configs = await systemConfigService.getSensitiveConfigs();
    } else {
      configs = await systemConfigService.getConfigs();
    }

    // 如果不是获取敏感配置，则隐藏敏感字段的值
    if (!sensitive) {
      configs = configs.map(config => ({
        ...config,
        configValue: config.isSensitive ? '***HIDDEN***' : config.configValue,
      }));
    }

    return NextResponse.json({
      success: true,
      data: configs,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    } as ApiResponse<SystemConfig[]>);
  } catch (error) {
    console.error('获取系统配置失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取系统配置失败',
          details: error instanceof Error ? error.message : error,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
        },
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// POST /api/admin/system/config - 创建系统配置
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const isAdminUser = await isAdmin(request);
    if (!isAdminUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '需要管理员权限',
          },
        } as ApiResponse,
        { status: 401 }
      );
    }

    // 解析和验证请求数据
    const body = await request.json();
    const validatedData = createConfigSchema.parse(body);

    // 创建配置
    const newConfig = await systemConfigService.createConfig(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: newConfig,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
        },
      } as ApiResponse<SystemConfig>,
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '请求数据验证失败',
            details: error.errors,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
          },
        } as ApiResponse,
        { status: 400 }
      );
    }

    console.error('创建系统配置失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '创建系统配置失败',
          details: error instanceof Error ? error.message : error,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
        },
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// PUT /api/admin/system/config/:key - 更新系统配置
export async function PUT(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    // 验证管理员权限
    const isAdminUser = await isAdmin(request);
    if (!isAdminUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '需要管理员权限',
          },
        } as ApiResponse,
        { status: 401 }
      );
    }

    // 解析和验证请求数据
    const body = await request.json();
    const validatedData = updateConfigSchema.parse(body);

    // 更新配置
    const updatedConfig = await systemConfigService.updateConfig(
      params.key,
      validatedData
    );
    if (!updatedConfig) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '配置不存在',
          },
        } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedConfig,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    } as ApiResponse<SystemConfig>);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '请求数据验证失败',
            details: error.errors,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
          },
        } as ApiResponse,
        { status: 400 }
      );
    }

    console.error('更新系统配置失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '更新系统配置失败',
          details: error instanceof Error ? error.message : error,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
        },
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// DELETE /api/admin/system/config/:key - 删除系统配置
export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    // 验证管理员权限
    const isAdminUser = await isAdmin(request);
    if (!isAdminUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '需要管理员权限',
          },
        } as ApiResponse,
        { status: 401 }
      );
    }

    // 删除配置
    const deleted = await systemConfigService.deleteConfig(params.key);
    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '配置不存在',
          },
        } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    } as ApiResponse);
  } catch (error) {
    console.error('删除系统配置失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '删除系统配置失败',
          details: error instanceof Error ? error.message : error,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
        },
      } as ApiResponse,
      { status: 500 }
    );
  }
}
