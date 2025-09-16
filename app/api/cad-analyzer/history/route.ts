import { NextRequest, NextResponse } from 'next/server';
import CadHistory from '@/lib/db/models/cad-history';

// GET /api/cad-analyzer/history?agentId=xx&userId=xx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get('agentId');
  const userId = searchParams.get('userId');
  const where: Record<string, unknown> = {};
  if (agentId) where.agentId = agentId;
  if (userId) where.userId = userId;
  // 只返回非敏感字段，按创建时间倒序
  const list = await CadHistory.findAll({
    where,
    order: [['createdAt', 'DESC']],
    attributes: [
      'id',
      'agentId',
      'userId',
      'filename',
      'analysis',
      'createdAt',
    ],
  });
  return NextResponse.json({ code: 0, data: list });
}
