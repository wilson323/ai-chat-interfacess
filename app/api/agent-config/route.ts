import { NextResponse } from 'next/server';
import AgentConfig from '@/lib/db/models/agent-config';

// 获取所有已发布的智能体列表（用户端）
export async function GET() {
  try {
    const agents = await AgentConfig.findAll({
      where: { isPublished: true },
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
    }));

    return NextResponse.json({ success: true, data: safeAgents });
  } catch (error) {
    console.error('获取智能体列表失败:', error);
    return NextResponse.json({ success: false, error: '获取智能体列表失败', detail: String(error) }, { status: 500 });
  }
}