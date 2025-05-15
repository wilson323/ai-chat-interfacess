import { NextRequest, NextResponse } from 'next/server';
import AgentConfig from '@/lib/db/models/agent-config';

// 管理端权限校验
function checkAdminAuth(req: NextRequest) {
  const token = req.cookies.get('adminToken')?.value;
  console.log("管理员权限校验, token:", token ? "存在" : "不存在");

  // 开发环境下，始终返回true以便于测试
  if (process.env.NODE_ENV === 'development') {
    console.log("开发环境，跳过权限校验");
    return true;
  }

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
      apiUrl: a.apiUrl ?? 'https://zktecoaihub.com/api/v1/chat/completions',
      systemPrompt: a.systemPrompt ?? '',
      temperature: a.temperature ?? 0.7,
      maxTokens: a.maxTokens ?? 2000,
      multimodalModel: a.multimodalModel ?? '',
      supportsStream: a.supportsStream ?? true,
      supportsDetail: a.supportsDetail ?? true,
    }));
    return NextResponse.json({ success: true, data: safeAgents });
  } catch (error) {
    return NextResponse.json({ success: false, error: '获取智能体列表失败', detail: String(error) }, { status: 500 });
  }
}

// 新增智能体
export async function POST(req: NextRequest) {
  console.log("POST /api/admin/agent-config - 开始处理新增智能体请求");

  if (!checkAdminAuth(req)) {
    console.log("POST /api/admin/agent-config - 权限校验失败");
    return NextResponse.json({ success: false, error: '无权限' }, { status: 403 });
  }

  try {
    const body = await req.json();
    console.log("POST /api/admin/agent-config - 请求体:", JSON.stringify(body, null, 2));

    // 只校验 name 和 type 必填
    if (!body.name || !body.type) {
      console.log("POST /api/admin/agent-config - 参数校验失败: name或type缺失");
      return NextResponse.json({ success: false, error: 'name 和 type 必填' }, { status: 400 });
    }

    console.log("POST /api/admin/agent-config - 开始创建智能体");
    const agentData = {
      name: body.name,
      type: body.type,
      apiKey: body.apiKey || '',
      appId: body.appId || '',
      apiUrl: body.apiUrl || 'https://zktecoaihub.com/api/v1/chat/completions',
      systemPrompt: body.systemPrompt || '',
      temperature: typeof body.temperature === 'number' ? body.temperature : Number(body.temperature) || 0.7,
      maxTokens: typeof body.maxTokens === 'number' ? body.maxTokens : Number(body.maxTokens) || 2000,
      multimodalModel: body.multimodalModel || '',
      isPublished: typeof body.isPublished === 'boolean' ? body.isPublished : true,
      description: body.description || '',
      order: typeof body.order === 'number' ? body.order : Number(body.order) || 100,
      supportsStream: typeof body.supportsStream === 'boolean' ? body.supportsStream : true,
      supportsDetail: typeof body.supportsDetail === 'boolean' ? body.supportsDetail : true,
    };

    console.log("POST /api/admin/agent-config - 准备保存数据:", JSON.stringify(agentData, null, 2));

    try {
      const agent = await AgentConfig.create(agentData);
      console.log("POST /api/admin/agent-config - 智能体创建成功:", agent.id);
      return NextResponse.json({ success: true, data: agent });
    } catch (dbError) {
      console.error("POST /api/admin/agent-config - 数据库操作失败:", dbError);
      throw dbError; // 重新抛出以便被外层catch捕获
    }
  } catch (error) {
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('AgentConfig-POST异常:', error, stack);
    return NextResponse.json({
      success: false,
      error: '新增智能体失败',
      detail: String(error),
      stack
    }, { status: 500 });
  }
}

// 更新智能体
export async function PUT(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: '无权限' }, { status: 403 });
  }
  try {
    const body = await req.json();
    console.log("更新智能体请求体:", JSON.stringify(body, null, 2));

    if (!body.id) {
      return NextResponse.json({ success: false, error: 'id 必填' }, { status: 400 });
    }
    const agent = await AgentConfig.findByPk(body.id);
    if (!agent) {
      return NextResponse.json({ success: false, error: '智能体不存在' }, { status: 404 });
    }
    // 记录原始类型，用于调试
    const originalType = agent.type;

    // fastgpt 类型不允许变更类型，始终按 fastgpt 保存
    const isFastgpt = agent.type === 'fastgpt';
    if (isFastgpt) {
      agent.type = 'fastgpt';
    } else {
      // 确保type字段不为空
      if (!body.type) {
        console.warn(`智能体[${agent.id}:${agent.name}] 更新时type字段为空，使用原始类型: ${originalType}`);
        agent.type = originalType;
      } else {
        agent.type = body.type;
      }
      console.log(`智能体[${agent.id}:${agent.name}] 类型更新: ${originalType} -> ${agent.type}`);
    }
    // 其它字段无验证，直接保存
    agent.name = body.name ?? agent.name;
    agent.apiKey = body.apiKey ?? agent.apiKey;
    agent.appId = body.appId ?? agent.appId;
    agent.apiUrl = body.apiUrl ?? agent.apiUrl;
    agent.systemPrompt = body.systemPrompt ?? agent.systemPrompt;
    agent.temperature = typeof body.temperature === 'number' ? body.temperature : Number(body.temperature) || agent.temperature;
    agent.maxTokens = typeof body.maxTokens === 'number' ? body.maxTokens : Number(body.maxTokens) || agent.maxTokens;
    agent.multimodalModel = body.multimodalModel ?? agent.multimodalModel;
    // 明确记录isPublished字段的更新
    const oldPublishState = agent.isPublished;
    agent.isPublished = typeof body.isPublished === 'boolean' ? body.isPublished : agent.isPublished;
    console.log(`智能体[${agent.id}:${agent.name}] 发布状态更新: ${oldPublishState} -> ${agent.isPublished}`);
    agent.description = body.description ?? agent.description;
    agent.order = typeof body.order === 'number' ? body.order : Number(body.order) || agent.order;
    agent.supportsStream = typeof body.supportsStream === 'boolean' ? body.supportsStream : agent.supportsStream;
    agent.supportsDetail = typeof body.supportsDetail === 'boolean' ? body.supportsDetail : agent.supportsDetail;
    try {
      // 强制设置updatedAt为当前时间
      agent.updatedAt = new Date();

      // 保存更改
      const savedAgent = await agent.save();

      // 验证保存后的状态
      const verifyAgent = await AgentConfig.findByPk(agent.id);
      console.log(`智能体[${agent.id}:${agent.name}] 保存后验证:`, {
        请求的发布状态: typeof body.isPublished === 'boolean' ? body.isPublished : '未提供',
        保存前状态: oldPublishState,
        保存后状态: verifyAgent?.isPublished,
        保存是否成功: verifyAgent?.isPublished === agent.isPublished ? '是' : '否',
        请求的类型: body.type || '未提供',
        原始类型: originalType,
        保存后类型: verifyAgent?.type,
        类型保存是否成功: verifyAgent?.type === agent.type ? '是' : '否'
      });

      return NextResponse.json({ success: true, data: savedAgent });
    } catch (saveError) {
      console.error(`智能体[${agent.id}:${agent.name}] 保存失败:`, saveError);
      throw saveError; // 重新抛出以便被外层catch捕获
    }
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