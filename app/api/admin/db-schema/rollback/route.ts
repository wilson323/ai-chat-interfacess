import { NextRequest, NextResponse } from 'next/server';
import sequelize from '@/lib/db/sequelize';

export async function POST(req: NextRequest) {
  const { sql } = await req.json();
  if (!sql) return NextResponse.json({ error: '缺少SQL快照' }, { status: 400 });
  try {
    await sequelize.query(sql);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
