import { NextRequest, NextResponse } from 'next/server';
// Removed invalid typescript import
import sequelize from '@/lib/db/sequelize';

function checkAdminAuth(req: NextRequest) {
  const token = req.cookies.get('adminToken')?.value;
  if (!token) return false;
  return true;
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }
  try {
    const tables = [
      'agent_config',
      'chat_history',
      'chat_sessions',
      'chat_messages',
    ];
    const schema: Record<string, any> = {};
    for (const table of tables) {
      schema[table] = await sequelize.getQueryInterface().describeTable(table);
    }
    return NextResponse.json(schema);
  } catch (error) {
    return NextResponse.json(
      { error: '获取表结构失败', detail: String(error) },
      { status: 500 }
    );
  }
}
