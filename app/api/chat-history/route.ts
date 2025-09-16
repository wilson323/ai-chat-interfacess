import { NextRequest, NextResponse } from 'next/server';
import ChatHistory from '../../../lib/db/models/chat-history';
import AgentConfig from '../../../lib/db/models/agent-config';
import { Op } from 'sequelize';

// 清理2天前的历史（内部使用，不导出）
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

    // 检查是否为user界面请求
    const isUserInterface = request.headers.get('referer')?.includes('/user');

    // 如果是user界面，返回空数据，避免报错
    if (isUserInterface) {
      console.log('User interface detected, returning empty history list');
      return NextResponse.json({
        total: 0,
        list: [],
        message: 'User interface history is managed locally',
      });
    }

    // 构建查询条件
    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (agentId) where.agentId = agentId;
    if (keyword) where['messages'] = { [Op.iLike]: `%${keyword}%` };

    // 执行数据库查询
    const { count, rows } = await ChatHistory.findAndCountAll({
      where,
      order: [['updatedAt', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });

    // 确保每条消息有唯一 message_id
    const list = rows.map(row => {
      try {
        const messages = Array.isArray(row.messages) ? row.messages : [];
        return {
          ...row.toJSON(),
          messages: messages.map((msg: Record<string, unknown>) => ({
            ...msg,
            message_id:
              msg.id ||
              `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // 确保有唯一ID
            parentId: msg.parentId || null,
            meta: msg.meta || null,
          })),
        };
      } catch (err) {
        console.error('Error processing chat history row:', err);
        // 返回简化版本，避免解析错误
        return {
          id: row.id,
          userId: row.userId,
          agentId: row.agentId,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          messages: [],
        };
      }
    });

    return NextResponse.json({ total: count, list });
  } catch (error) {
    console.error('获取聊天历史失败:', error);
    return NextResponse.json(
      {
        error: '获取聊天历史失败',
        detail: String(error),
        total: 0,
        list: [],
      },
      { status: 200 }
    ); // 使用200状态码，确保前端能正常解析
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
    if (!body.userId) {
      return NextResponse.json({ error: '缺少 userId' }, { status: 400 });
    }
    const history = await ChatHistory.create({ ...body });
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json(
      { error: '新增聊天历史失败', detail: String(error) },
      { status: 500 }
    );
  }
}

// 更新聊天历史（如编辑消息）
export async function PUT(request: NextRequest) {
  await cleanupOldHistory();
  try {
    const body = await request.json();
    const { chatId, userId, messages } = body;
    if (!chatId || !userId) {
      return NextResponse.json(
        { error: '缺少 chatId 或 userId' },
        { status: 400 }
      );
    }
    const history = await ChatHistory.findOne({ where: { chatId, userId } });
    if (!history) {
      return NextResponse.json(
        { error: '未找到对应聊天历史' },
        { status: 404 }
      );
    }
    await history.update({ messages, updatedAt: new Date() });
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json(
      { error: '更新聊天历史失败', detail: String(error) },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: '缺少 chatId 或 userId' },
        { status: 400 }
      );
    }
    const count = await ChatHistory.destroy({ where: { chatId, userId } });
    return NextResponse.json({ success: true, deleted: count });
  } catch (error) {
    return NextResponse.json(
      { error: '删除聊天历史失败', detail: String(error) },
      { status: 500 }
    );
  }
}
