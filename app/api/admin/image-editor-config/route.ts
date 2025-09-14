import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { ImageEditorConfig } from '@/types/api/agent-config/image-editor';
import { verify } from 'jsonwebtoken';

const CONFIG_PATH = path.resolve(
  process.cwd(),
  'config/image-editor-config.json'
);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 强鉴权：校验 cookie 中的 adminToken
async function checkAdminAuth(req: NextRequest) {
  const token = req.cookies.get('adminToken')?.value;
  if (!token) return false;
  try {
    const decoded = verify(token, JWT_SECRET);
    return decoded && (decoded as any).role === 'admin';
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }
  try {
    const content = await fs.readFile(CONFIG_PATH, 'utf-8');
    const config: ImageEditorConfig = JSON.parse(content);
    return NextResponse.json(config);
  } catch (e) {
    return NextResponse.json(
      { error: '读取配置失败', detail: String(e) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }
  try {
    const body = await req.json();
    await fs.writeFile(CONFIG_PATH, JSON.stringify(body, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: '保存配置失败', detail: String(e) },
      { status: 500 }
    );
  }
}
