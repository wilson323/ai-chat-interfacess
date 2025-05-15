import { NextResponse } from 'next/server';
import AgentConfig from '@/lib/db/models/agent-config';

export async function POST() {
  try {
    // 清空表
    await AgentConfig.destroy({ where: {} });
    // 插入默认数据
    await AgentConfig.bulkCreate([
      {
        name: '默认智能体',
        type: 'fastgpt',
        apiKey: 'demo-key',
        appId: 'demo-appid',
        apiUrl: 'https://zktecoaihub.com/api/v1/chat/completions',
        systemPrompt: '你是一个专业的AI助手。',
        temperature: 0.7,
        maxTokens: 2000,
        multimodalModel: '',
        isPublished: true,
        description: '系统内置默认智能体',
        order: 1,
      },
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
} 