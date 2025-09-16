import { NextRequest, NextResponse } from 'next/server';
// Removed invalid typescript import
import CadHistory from '@/lib/db/models/cad-history';

// GET /api/admin/cad-history?agentId=xx&userId=xx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get('agentId');
  const userId = searchParams.get('userId');
  const where: Record<string, string> = {};
  if (agentId) where.agentId = agentId;
  if (userId) where.userId = userId;
  const list = await CadHistory.findAll({
    where,
    order: [['createdAt', 'DESC']],
  });
  return NextResponse.json({ code: 0, data: list });
}

// POST /api/admin/cad-history
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { agentId, userId, fileName, fileUrl, analysisResult } = body;
  if (!agentId || !userId || !fileName || !fileUrl || !analysisResult) {
    return NextResponse.json(
      { code: 1, message: '参数不完整' },
      { status: 400 }
    );
  }
  const record = await CadHistory.create({
    agentId,
    userId,
    fileName,
    fileUrl,
    analysisResult,
    createdAt: new Date(),
  });
  return NextResponse.json({ code: 0, data: record });
}

// PUT /api/admin/cad-history?id=xx
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id)
    return NextResponse.json({ code: 1, message: '缺少ID' }, { status: 400 });
  const body = await req.json();
  const record = await CadHistory.findByPk(id);
  if (!record)
    return NextResponse.json(
      { code: 1, message: '记录不存在' },
      { status: 404 }
    );
  await record.update(body);
  return NextResponse.json({ code: 0, data: record });
}

// DELETE /api/admin/cad-history?id=xx
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id)
    return NextResponse.json({ code: 1, message: '缺少ID' }, { status: 400 });
  const record = await CadHistory.findByPk(id);
  if (!record)
    return NextResponse.json(
      { code: 1, message: '记录不存在' },
      { status: 404 }
    );
  await record.destroy();
  return NextResponse.json({ code: 0, message: '删除成功' });
}
