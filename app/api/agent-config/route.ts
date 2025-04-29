import { NextResponse } from 'next/server';
import AgentConfig from '@/lib/db/models/agent-config';

// 只允许 GET，返回已发布的智能体列表，异常结构统一
export async function GET() {
  try {
    const agents = await AgentConfig.findAll({
      where: { isPublished: true },
      order: [['order', 'ASC'], ['updatedAt', 'DESC']],
    });
    console.log("API 返回 agents 数量:", agents.length, agents.map((a: any) => a.name));
    // 返回公开字段和必要的API配置信息
    const safeAgents = agents.map((a: any) => ({
      id: String(a.id),
      name: a.name,
      description: a.description ?? '',
      type: a.type,
      iconType: a.iconType ?? '',
      avatar: a.avatar ?? '',
      order: a.order ?? 100,
      // 添加必要的API配置信息
      apiEndpoint: "https://zktecoaihub.com/api/v1/chat/completions", // 默认API端点
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

// 禁止其他方法，返回统一结构
export function POST() { return NextResponse.json({ success: false, error: '禁止操作' }, { status: 403 }); }
export function PUT() { return NextResponse.json({ success: false, error: '禁止操作' }, { status: 403 }); }
export function DELETE() { return NextResponse.json({ success: false, error: '禁止操作' }, { status: 403 }); }