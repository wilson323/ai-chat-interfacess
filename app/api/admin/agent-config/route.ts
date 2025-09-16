/**
 * 管理员智能体配置API - 重构版本
 * 基于统一配置管理器，消除重复代码
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGlobalUnifiedConfigManager as getGlobalConfigManager } from '@/lib/services/unified-config-manager';
import { handleError, validate } from '@/lib/utils/shared';
import type { AgentConfig } from '@/types/unified-agent';
import type { GlobalVariable } from '@/types/global-variable';

export const dynamic = 'force-dynamic';

// 安全响应类型 - 向后兼容
interface SafeAgentResponse {
  id: string;
  name: string;
  description: string;
  type: string;
  iconType: string;
  avatar: string;
  order: number;
  isPublished: boolean;
  apiKey: string;
  appId: string;
  apiUrl: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  multimodalModel: string;
  supportsStream: boolean;
  supportsDetail: boolean;
  globalVariables: GlobalVariable[];
  welcomeText: string;
  updatedAt: string | null;
}

// 管理端权限校验
function checkAdminAuth(req: NextRequest) {
  const token = req.cookies.get('adminToken')?.value;
  console.log('管理员权限校验, token:', token ? '存在' : '不存在');

  // 开发环境下，始终返回true以便于测试
  if (process.env.NODE_ENV === 'development') {
    console.log('开发环境，跳过权限校验');
    return true;
  }

  if (!token) return false;
  // 可扩展JWT校验
  return true;
}

// 获取所有智能体列表（管理端） - 重构版本
export async function GET() {
  try {
    const configManager = getGlobalConfigManager();
    if (!configManager) {
      return NextResponse.json(
        { success: false, error: '配置管理器未初始化' },
        { status: 500 }
      );
    }

    const agents = await configManager.getAllAgents();

    // 转换为安全响应格式
    const safeAgents: SafeAgentResponse[] = agents.map((agent: any) => ({
      id: String(agent.id),
      name: agent.name,
      description: agent.description ?? '',
      type: agent.type,
      iconType: '', // 数据库模型中没有这些字段
      avatar: '',
      order: agent.order ?? 100,
      isPublished: agent.isPublished ?? true,
      apiKey: agent.apiKey ?? '',
      appId: agent.appId ?? '',
      apiUrl: agent.apiUrl ?? 'https://zktecoaihub.com/api/v1/chat/completions',
      systemPrompt: agent.systemPrompt ?? '',
      temperature: agent.temperature ?? 0.7,
      maxTokens: agent.maxTokens ?? 2000,
      multimodalModel: agent.multimodalModel ?? '',
      supportsStream: agent.supportsStream ?? true,
      supportsDetail: agent.supportsDetail ?? true,
      globalVariables: agent.globalVariables ?? [],
      welcomeText: agent.welcomeText ?? '',
      updatedAt: agent.updatedAt ? agent.updatedAt.toISOString() : null,
    }));

    return NextResponse.json({ success: true, data: safeAgents });
  } catch (error) {
    const unifiedError = handleError(error, '获取智能体列表');
    return NextResponse.json(
      {
        success: false,
        error: '获取智能体列表失败',
        detail: unifiedError.message
      },
      { status: 500 }
    );
  }
}

// 新增智能体 - 重构版本
export async function POST(req: NextRequest) {
  console.log('POST /api/admin/agent-config - 开始处理新增智能体请求');

  if (!checkAdminAuth(req)) {
    console.log('POST /api/admin/agent-config - 权限校验失败');
    return NextResponse.json(
      { success: false, error: '无权限' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    console.log(
      'POST /api/admin/agent-config - 请求体:',
      JSON.stringify(body, null, 2)
    );

    // 使用统一验证器进行参数校验
    const validationResult = validate(body, {
      name: { type: 'string', required: true, name: '智能体名称' },
      type: { type: 'string', required: true, name: '智能体类型' }
    });

    if (!validationResult.valid) {
      console.log(
        'POST /api/admin/agent-config - 参数校验失败:',
        validationResult.errors
      );
      return NextResponse.json(
        { success: false, error: '参数校验失败', details: validationResult.errors },
        { status: 400 }
      );
    }

    const configManager = getGlobalConfigManager();
    if (!configManager) {
      return NextResponse.json(
        { success: false, error: '配置管理器未初始化' },
        { status: 500 }
      );
    }

    // 构建智能体配置数据
    const agentData: Partial<AgentConfig> = {
      // name: body.name, // 注释掉不存在的字段
      type: body.type,
      apiKey: body.apiKey || '',
      appId: body.appId || '',
      apiUrl: body.apiUrl || 'https://zktecoaihub.com/api/v1/chat/completions',
      systemPrompt: body.systemPrompt || '',
      temperature: typeof body.temperature === 'number' ? body.temperature : 0.7,
      maxTokens: typeof body.maxTokens === 'number' ? body.maxTokens : 2000,
      multimodalModel: body.multimodalModel || '',
      isPublished: typeof body.isPublished === 'boolean' ? body.isPublished : true,
      description: body.description || '',
      order: typeof body.order === 'number' ? body.order : 100,
      supportsStream: typeof body.supportsStream === 'boolean' ? body.supportsStream : true,
      supportsDetail: typeof body.supportsDetail === 'boolean' ? body.supportsDetail : true,
      globalVariables: Array.isArray(body.globalVariables) ? body.globalVariables : [],
      welcomeText: body.welcomeText || '',
    };

    console.log(
      'POST /api/admin/agent-config - 准备保存数据:',
      JSON.stringify(agentData, null, 2)
    );

    const agent = await configManager.createAgent(agentData);
    console.log('POST /api/admin/agent-config - 智能体创建成功:', agent.id);
    return NextResponse.json({ success: true, data: agent });
  } catch (error) {
    const unifiedError = handleError(error, '新增智能体');
    console.error('AgentConfig-POST异常:', unifiedError);
    return NextResponse.json(
      {
        success: false,
        error: '新增智能体失败',
        detail: unifiedError.message,
      },
      { status: 500 }
    );
  }
}

// 更新智能体 - 重构版本
export async function PUT(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json(
      { success: false, error: '无权限' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    console.log('更新智能体请求体:', JSON.stringify(body, null, 2));

    // 使用统一验证器进行参数校验
    const validationResult = validate(body, {
      id: { type: 'string', required: true, name: '智能体ID' }
    });

    if (!validationResult.valid) {
      return NextResponse.json(
        { success: false, error: '参数校验失败', details: validationResult.errors },
        { status: 400 }
      );
    }

    const configManager = getGlobalConfigManager();
    if (!configManager) {
      return NextResponse.json(
        { success: false, error: '配置管理器未初始化' },
        { status: 500 }
      );
    }

    // 检查智能体是否存在
    const existingAgent = await configManager.getAgentById(body.id);
    if (!existingAgent) {
      return NextResponse.json(
        { success: false, error: '智能体不存在' },
        { status: 404 }
      );
    }

    // 构建更新数据
    const updateData: Partial<AgentConfig> = {
      // name: body.name ?? existingAgent.name, // 注释掉不存在的字段
      type: body.type ?? existingAgent.type,
      apiKey: body.apiKey ?? existingAgent.apiKey,
      appId: body.appId ?? existingAgent.appId,
      apiUrl: body.apiUrl ?? existingAgent.apiUrl,
      systemPrompt: body.systemPrompt ?? existingAgent.systemPrompt,
      temperature: typeof body.temperature === 'number' ? body.temperature : existingAgent.temperature,
      maxTokens: typeof body.maxTokens === 'number' ? body.maxTokens : existingAgent.maxTokens,
      multimodalModel: body.multimodalModel ?? existingAgent.multimodalModel,
      isPublished: typeof body.isPublished === 'boolean' ? body.isPublished : existingAgent.isPublished,
      description: body.description ?? existingAgent.description,
      order: typeof body.order === 'number' ? body.order : existingAgent.order,
      supportsStream: typeof body.supportsStream === 'boolean' ? body.supportsStream : existingAgent.supportsStream,
      supportsDetail: typeof body.supportsDetail === 'boolean' ? body.supportsDetail : existingAgent.supportsDetail,
      globalVariables: Array.isArray(body.globalVariables) ? body.globalVariables : existingAgent.globalVariables,
      welcomeText: body.welcomeText ?? existingAgent.welcomeText,
    };

    const updatedAgent = await configManager.updateAgent(body.id, updateData);
    console.log(`智能体[${body.id}] 更新成功`);
    return NextResponse.json({ success: true, data: updatedAgent });
  } catch (error) {
    const unifiedError = handleError(error, '更新智能体');
    console.error('AgentConfig-PUT异常:', unifiedError);
    return NextResponse.json(
      { success: false, error: '更新失败', detail: unifiedError.message },
      { status: 500 }
    );
  }
}

// 删除智能体 - 重构版本
export async function DELETE(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json(
      { success: false, error: '无权限' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    // 使用统一验证器进行参数校验
    const validationResult = validate(body, {
      id: { type: 'string', required: true, name: '智能体ID' }
    });

    if (!validationResult.valid) {
      return NextResponse.json(
        { success: false, error: '参数校验失败', details: validationResult.errors },
        { status: 400 }
      );
    }

    const configManager = getGlobalConfigManager();
    if (!configManager) {
      return NextResponse.json(
        { success: false, error: '配置管理器未初始化' },
        { status: 500 }
      );
    }

    // 检查智能体是否存在
    const existingAgent = await configManager.getAgentById(body.id);
    if (!existingAgent) {
      return NextResponse.json(
        { success: false, error: '智能体不存在' },
        { status: 404 }
      );
    }

    await configManager.deleteAgent(body.id);
    console.log(`智能体[${body.id}] 删除成功`);
    return NextResponse.json({ success: true });
  } catch (error) {
    const unifiedError = handleError(error, '删除智能体');
    console.error('AgentConfig-DELETE异常:', unifiedError);
    return NextResponse.json(
      { success: false, error: '删除失败', detail: unifiedError.message },
      { status: 500 }
    );
  }
}
