export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/db/redis-cache';
import AgentConfig from '@/lib/db/models/agent-config';
import sequelize from '@/lib/db/sequelize';

const AGENT_LIST_KEY = 'agent_list';
const AGENT_VERSION_KEY = 'agent_list_version';

// 只同步自研智能体（非 fastgpt 类型）
async function getAllCustomAgents() {
  const agents = await AgentConfig.findAll();
  return agents.filter(agent => agent.type !== 'fastgpt');
}

// 获取单个自研 agent
async function getCustomAgentById(agentId: string) {
  const agent = await AgentConfig.findOne({ where: { id: agentId } });
  if (!agent || agent.type === 'fastgpt') return null;
  return agent;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get('agentId');
  const clientVersion = Number(searchParams.get('version') || 0);

  // 单 agent 检查
  if (agentId) {
    const agent = await getCustomAgentById(agentId);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found or not a custom agent' }, { status: 404 });
    }
    // 转为纯 JSON
    return NextResponse.json({ code: 0, agent: agent.toJSON() });
  }

  // 全量同步
  let version = Number(await getCache(AGENT_VERSION_KEY) || 1);
  if (!version) version = 1;

  if (clientVersion < version) {
    // 需要返回最新数据
    let agentList = await getCache(AGENT_LIST_KEY);
    if (!agentList) {
      // 缓存失效，重新查库
      agentList = await getAllCustomAgents();
      await setCache(AGENT_LIST_KEY, agentList, 3600);
    }
    // 保证为纯 JSON
    const agents = Array.isArray(agentList)
      ? agentList.map(a => (typeof a.toJSON === 'function' ? a.toJSON() : a))
      : [];
    return NextResponse.json({ code: 0, version, agents });
  }
  // 无需更新
  return NextResponse.json({ code: 0, version });
}

// POST 方法如有业务需求可保留
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { deviceId, currentAgentIds, lastSyncTime, forceSync, locallyModifiedAgentIds = [] } = body;

    // 这里可根据实际业务扩展
    if (forceSync) {
      const agentsToUpdate = currentAgentIds.filter((id: string) => !locallyModifiedAgentIds.includes(id));
      if (agentsToUpdate.length === 0) {
        return NextResponse.json({
          hasUpdates: false,
          agents: [],
          lastUpdateTime: lastSyncTime,
        });
      }
      // 模拟有更新
      return NextResponse.json({
        hasUpdates: true,
        agents: [
          {
            id: "default-assistant",
            name: "NeuroGlass 助手 (已更新)",
            description: "全能型人工智能助手 - 最新版本",
            apiEndpoint: "https://zktecoaihub.com/api/v1/chat/completions",
            apiKey: "",
            appId: "",
            type: "chat",
            model: "GPT-4o-mini",
            isPublished: true,
            systemPrompt: "你是一位专业、友好的AI助手，能够回答用户的各种问题并提供帮助。版本已更新。",
            temperature: 0.7,
            maxTokens: 2000,
            streamResponse: true,
          },
        ],
        lastUpdateTime: Date.now(),
      });
    }

    return NextResponse.json({
      hasUpdates: false,
      agents: [],
      lastUpdateTime: lastSyncTime,
    });
  } catch (error) {
    console.error("Agent sync error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
