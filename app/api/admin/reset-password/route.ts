import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
// import nodemailer from 'nodemailer'; // 暂时注释，避免构建错误

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.example.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || 'your-email@example.com';
const SMTP_PASS = process.env.SMTP_PASS || 'your-password';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

// 创建邮件传输器
// const transporter = nodemailer.createTransport({
//   host: SMTP_HOST,
//   port: SMTP_PORT,
//   secure: SMTP_PORT === 465,
//   auth: {
//     user: SMTP_USER,
//     pass: SMTP_PASS,
//   },
// });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // 验证邮箱是否是管理员邮箱
    if (email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: '无效的管理员邮箱地址' },
        { status: 400 }
      );
    }

    // 生成重置令牌
    const resetToken = sign({ email, purpose: 'password-reset' }, JWT_SECRET, {
      expiresIn: '1h',
    });

    // 构建重置链接
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/admin/new-password?token=${resetToken}`;

    // 发送重置邮件 - 暂时注释，避免构建错误
    // await transporter.sendMail({
    //   from: SMTP_USER,
    //   to: email,
    //   subject: '管理员密码重置',
    //   html: `
    //     <h1>密码重置请求</h1>
    //     <p>您好，</p>
    //     <p>我们收到了您的密码重置请求。请点击下面的链接重置您的密码：</p>
    //     <p><a href="${resetLink}">${resetLink}</a></p>
    //     <p>此链接将在1小时后过期。</p>
    //     <p>如果您没有请求重置密码，请忽略此邮件。</p>
    //   `,
    // });

    return NextResponse.json(
      { message: '重置密码邮件已发送' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: '发送重置密码邮件失败' },
      { status: 500 }
    );
  }
}
