import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_PASSWORD_FILE =
  process.env.ADMIN_PASSWORD_FILE || './admin-password.txt';
const fs = require('fs').promises;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 验证令牌
    try {
      const decoded = verify(token, JWT_SECRET) as {
        email: string;
        purpose: string;
      };

      if (decoded.purpose !== 'password-reset') {
        throw new Error('无效的令牌用途');
      }
    } catch (err) {
      return NextResponse.json(
        { error: '无效或过期的重置令牌' },
        { status: 401 }
      );
    }

    // 验证密码强度
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      return NextResponse.json({ error: '密码不符合要求' }, { status: 400 });
    }

    // 生成密码哈希
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 保存新密码（在实际应用中，这里应该更新数据库）
    await fs.writeFile(ADMIN_PASSWORD_FILE, hashedPassword);

    return NextResponse.json({ message: '密码已成功重置' }, { status: 200 });
  } catch (error) {
    console.error('New password error:', error);
    return NextResponse.json({ error: '设置新密码失败' }, { status: 500 });
  }
}
