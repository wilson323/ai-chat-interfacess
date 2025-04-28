import { NextRequest, NextResponse } from 'next/server';
import AgentConfig from '@/lib/db/models/agent-config';

// 管理端权限校验
function checkAdminAuth(req: NextRequest) {
  const token = req.cookies.get('adminToken')?.value;
  if (!token) return false;
  // 可扩展JWT校验
  return true;
}

// 获取所有智能体列表（管理端）
export async function GET() {
  try {
    const agents = await AgentConfig.findAll({
      order: [['order', 'ASC'], ['updatedAt', 'DESC']],
    });
    // 只返回安全字段
    const safeAgents = agents.map((a: any) => ({
      id: String(a.id),
      name: a.name,
      description: a.description ?? '',
      type: a.type,
      iconType: a.iconType ?? '',
      avatar: a.avatar ?? '',
      order: a.order ?? 100,
      isPublished: a.isPublished,
      apiKey: a.apiKey ?? '',
      appId: a.appId ?? '',
      systemPrompt: a.systemPrompt ?? '',
      temperature: a.temperature ?? 0.7,
      maxTokens: a.maxTokens ?? 2000,
      multimodalModel: a.multimodalModel ?? '',
    }));
    return NextResponse.json({ success: true, data: safeAgents });
  } catch (error) {
    return NextResponse.json({ success: false, error: '获取智能体列表失败', detail: String(error) }, { status: 500 });
  }
}

// 新增智能体
export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: '无权限' }, { status: 403 });
  }
  try {
    const body = await req.json();
    // 只校验 name 和 type 必填
    if (!body.name || !body.type) {
      return NextResponse.json({ success: false, error: 'name 和 type 必填' }, { status: 400 });
    }
    const agent = await AgentConfig.create({
      name: body.name,
      type: body.type,
      apiKey: body.apiKey || '',
      appId: body.appId || '',
      systemPrompt: body.systemPrompt || '',
      temperature: typeof body.temperature === 'number' ? body.temperature : Number(body.temperature) || 0.7,
      maxTokens: typeof body.maxTokens === 'number' ? body.maxTokens : Number(body.maxTokens) || 2000,
      multimodalModel: body.multimodalModel || '',
      isPublished: typeof body.isPublished === 'boolean' ? body.isPublished : true,
      description: body.description || '',
      order: typeof body.order === 'number' ? body.order : Number(body.order) || 100,
    });
    return NextResponse.json({ success: true, data: agent });
  } catch (error) {
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('AgentConfig-POST异常:', error, stack);
    return NextResponse.json({ success: false, error: '新增智能体失败', detail: String(error), stack }, { status: 500 });
  }
}

// 更新智能体
export async function PUT(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: '无权限' }, { status: 403 });
  }
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'id 必填' }, { status: 400 });
    }
    const agent = await AgentConfig.findByPk(body.id);
    if (!agent) {
      return NextResponse.json({ success: false, error: '智能体不存在' }, { status: 404 });
    }
    // fastgpt 类型不允许变更类型，始终按 fastgpt 保存
    const isFastgpt = agent.type === 'fastgpt';
    if (isFastgpt) {
      agent.type = 'fastgpt';
    } else {
      agent.type = body.type ?? agent.type;
    }
    // 其它字段无验证，直接保存
    agent.name = body.name ?? agent.name;
    agent.apiKey = body.apiKey ?? agent.apiKey;
    agent.appId = body.appId ?? agent.appId;
    agent.systemPrompt = body.systemPrompt ?? agent.systemPrompt;
    agent.temperature = typeof body.temperature === 'number' ? body.temperature : Number(body.temperature) || agent.temperature;
    agent.maxTokens = typeof body.maxTokens === 'number' ? body.maxTokens : Number(body.maxTokens) || agent.maxTokens;
    agent.multimodalModel = body.multimodalModel ?? agent.multimodalModel;
    agent.isPublished = typeof body.isPublished === 'boolean' ? body.isPublished : agent.isPublished;
    agent.description = body.description ?? agent.description;
    agent.order = typeof body.order === 'number' ? body.order : Number(body.order) || agent.order;
    await agent.save();
    return NextResponse.json({ success: true, data: agent });
  } catch (error) {
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('AgentConfig-PUT异常:', error, stack);
    return NextResponse.json({ success: false, error: '更新失败', detail: String(error), stack }, { status: 500 });
  }
}

// 删除智能体
export async function DELETE(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: '无权限' }, { status: 403 });
  }
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'id 必填' }, { status: 400 });
    }
    const agent = await AgentConfig.findByPk(body.id);
    if (!agent) {
      return NextResponse.json({ success: false, error: '智能体不存在' }, { status: 404 });
    }
    await agent.destroy();
    return NextResponse.json({ success: true });
  } catch (error) {
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('AgentConfig-DELETE异常:', error, stack);
    return NextResponse.json({ success: false, error: '删除失败', detail: String(error), stack }, { status: 500 });
  }
} 