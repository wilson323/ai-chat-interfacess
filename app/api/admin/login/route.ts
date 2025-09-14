import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';

// 在实际应用中，这些值应该存储在环境变量中
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'damin';
const DEFAULT_PASSWORD = 'admin';

async function getAdminPassword() {
  try {
    const filePassword = await fs.readFile('./data/admin-password.txt', 'utf8');
    if (filePassword && filePassword.trim() !== '') return filePassword.trim();
  } catch {}
  // 优先用环境变量，否则用明文admin
  return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
}

// 用于追踪登录尝试
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  let valid = false;
  console.log('登录尝试', username, password);
  // 检查默认管理员凭据（仅开发环境）
  const defaultAdminUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
  const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin';
  
  if (username === defaultAdminUsername && password === defaultAdminPassword && process.env.NODE_ENV !== 'production') {
    valid = true;
  } else {
    // 兼容自定义密码和哈希
    const filePassword = await getAdminPassword();
    if (filePassword.startsWith('$2a$')) {
      valid = await bcrypt.compare(password, filePassword);
    } else {
      valid = password === filePassword;
    }
    valid = valid && username === ADMIN_USERNAME;
  }
  if (valid) {
    const token = Math.random().toString(36).slice(2);
    const res = NextResponse.json({ success: true });
    res.cookies.set('adminToken', token, {
      httpOnly: process.env.NODE_ENV === 'production' ? true : false, // 开发环境允许前端检测Cookie
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    return res;
  }
  return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
}
