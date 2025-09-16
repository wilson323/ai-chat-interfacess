# 🔥 安全漏洞紧急修复指南

## 立即执行（24小时内必须完成）

### 1. 更改硬编码密码（最紧急）

```bash
# 1. 生成新的强密码
openssl rand -base64 32
# 输出: R9Xk2m8PqL5vN7jW...

# 2. 更新 .env 文件
POSTGRES_PASSWORD=新生成的强密码
JWT_SECRET=新生成的JWT密钥
ADMIN_TOKEN=新生成的管理员令牌

# 3. 更新 docker-compose.yaml
environment:
  - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
```

### 2. 修复文件上传漏洞

**替换 `/app/api/upload/route.ts` 的全部内容**：

```typescript
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type';

// 安全配置
const ALLOWED_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// 确保目录存在
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '未上传文件' }, { status: 400 });
    }

    // 1. 检查文件大小
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: '文件过大，最大10MB' }, { status: 400 });
    }

    // 2. 检查文件扩展名
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_TYPES.includes(ext)) {
      return NextResponse.json({ error: '不支持的文件类型' }, { status: 400 });
    }

    // 3. 检查文件真实类型
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const type = await fileTypeFromBuffer(buffer);

    if (!type || !ALLOWED_TYPES.includes(`.${type.ext}`)) {
      return NextResponse.json({ error: '文件内容与类型不符' }, { status: 400 });
    }

    // 4. 生成安全的文件名
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${sanitizedName}`;
    const filePath = path.join(uploadDir, fileName);

    // 5. 写入文件
    fs.writeFileSync(filePath, buffer);

    // 6. 返回安全的URL
    const url = `/uploads/${fileName}`;
    return NextResponse.json({
      url,
      name: sanitizedName,
      size: file.size,
      type: type.mime
    });

  } catch (error) {
    console.error('文件上传错误:', error);
    return NextResponse.json({ error: '文件上传失败' }, { status: 500 });
  }
}
```

### 3. 修复管理员登录漏洞

**替换 `/app/api/admin/login/route.ts`**：

```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 必须的环境变量
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET;

if (!ADMIN_TOKEN || !JWT_SECRET) {
  throw new Error('缺少必要的环境变量');
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // 基本验证
    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    // 验证管理员令牌（临时方案，应使用数据库）
    const expectedToken = ADMIN_TOKEN;
    if (username !== 'admin' || password !== expectedToken) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 生成JWT令牌
    const token = jwt.sign(
      {
        username: 'admin',
        role: 'admin',
        iat: Math.floor(Date.now() / 1000)
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        username: 'admin',
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
```

### 4. 添加安全中间件

**创建 `/lib/security/middleware.ts`**：

```typescript
import { NextRequest, NextResponse } from 'next/server';

export function addSecurityHeaders(response: NextResponse) {
  // 添加安全响应头
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 内容安全策略
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
    ].join('; ')
  );

  return response;
}

export function validateCSRF(request: NextRequest) {
  // 简单的CSRF检查（生产环境应使用更复杂的实现）
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  // 允许同源请求
  if (origin && host && !origin.includes(host)) {
    return false;
  }

  return true;
}
```

### 5. 更新全局中间件

**替换 `/middleware.ts`**：

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { addSecurityHeaders } from '@/lib/security/middleware';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 添加安全头
  addSecurityHeaders(response);

  // 在生产环境中阻止访问开发模式端点
  if (process.env.NODE_ENV === 'production') {
    const { pathname } = request.nextUrl;

    // 阻止访问webpack-hmr和其他开发模式端点
    if (
      pathname.startsWith('/_next/webpack-hmr') ||
      pathname.startsWith('/_next/static/chunks/webpack') ||
      pathname.includes('hot-reload')
    ) {
      return new NextResponse(null, { status: 404 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api/health|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### 6. 修复SQL注入漏洞

**在 `/lib/db/sequelize.ts` 中修改**：

```typescript
// 替换第35-36行
// 从:
const res = await client.query(
  `SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'`
);

// 改为:
const res = await client.query(
  'SELECT 1 FROM pg_database WHERE datname = $1',
  [DB_NAME]
);
```

## 快速验证命令

```bash
# 1. 检查环境变量
npm run check-config

# 2. 运行类型检查
npm run check-types

# 3. 运行代码检查
npm run lint

# 4. 测试文件上传
curl -X POST http://localhost:3009/api/upload \
  -F "file=@test.jpg" \
  -H "Content-Type: multipart/form-data"

# 5. 测试管理员登录
curl -X POST http://localhost:3009/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"你的新密码"}'
```

## 后续步骤

1. **立即重启所有服务**
```bash
docker-compose down
docker-compose up -d
```

2. **监控日志**
```bash
docker-compose logs -f app
```

3. **更新文档**
- 更新所有密码文档
- 通知团队成员密码变更

4. **定期轮换**
- 设置每月密码轮换提醒
- 实施自动化密钥管理

## 紧急联系方式

如果遇到问题：
- 安全团队：security@example.com
- 紧急电话：+86 XXX-XXXX-XXXX

---

**记住：安全第一！立即行动！** 🚨