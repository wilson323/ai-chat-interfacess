import { NextRequest, NextResponse } from 'next/server';
import ChatHistory from '@/lib/db/models/chat-history';
import AgentConfig from '@/lib/db/models/agent-config';
import { Op } from 'sequelize';

// 清理2天前的历史
async function cleanupOldHistory() {
  const cutoff = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  await ChatHistory.destroy({ where: { updatedAt: { [Op.lt]: cutoff } } });
}

// 获取聊天历史（分页、可筛选）
export async function GET(request: NextRequest) {
  await cleanupOldHistory();
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const agentId = searchParams.get('agentId');
    const keyword = searchParams.get('keyword');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const where: any = {};
    if (userId) where.userId = userId;
    if (agentId) where.agentId = agentId;
    if (keyword) where['messages'] = { [Op.iLike]: `%${keyword}%` };
    const { count, rows } = await ChatHistory.findAndCountAll({
      where,
      order: [['updatedAt', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });
    return NextResponse.json({ total: count, list: rows });
  } catch (error) {
    return NextResponse.json({ error: '获取聊天历史失败', detail: String(error) }, { status: 500 });
  }
}

// 新增聊天历史（新会话或追加消息）
export async function POST(request: NextRequest) {
  await cleanupOldHistory();
  try {
    const body = await request.json();
    // 校验 agentId 是否存在
    const agent = await AgentConfig.findByPk(body.agentId);
    if (!agent) {
      return NextResponse.json({ error: '无效的 agentId' }, { status: 400 });
    }
    const history = await ChatHistory.create({ ...body });
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: '新增聊天历史失败', detail: String(error) }, { status: 500 });
  }
}

// 更新聊天历史（如编辑消息）
export async function PUT(request: NextRequest) {
  await cleanupOldHistory();
  try {
    const body = await request.json();
    const { chatId, userId, messages } = body;
    const history = await ChatHistory.findOne({ where: { chatId, userId } });
    if (!history) {
      return NextResponse.json({ error: '未找到对应聊天历史' }, { status: 404 });
    }
    await history.update({ messages, updatedAt: new Date() });
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: '更新聊天历史失败', detail: String(error) }, { status: 500 });
  }
}

// 删除聊天历史
export async function DELETE(request: NextRequest) {
  await cleanupOldHistory();
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const userId = searchParams.get('userId');
    if (!chatId || !userId) {
      return NextResponse.json({ error: '缺少 chatId 或 userId' }, { status: 400 });
    }
    const count = await ChatHistory.destroy({ where: { chatId, userId } });
    return NextResponse.json({ success: true, deleted: count });
  } catch (error) {
    return NextResponse.json({ error: '删除聊天历史失败', detail: String(error) }, { status: 500 });
  }
} 