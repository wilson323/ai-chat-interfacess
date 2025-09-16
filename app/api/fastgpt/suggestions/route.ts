import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  return NextResponse.json(
    { error: '该接口已被管理员临时关闭' },
    { status: 403 }
  );
}
