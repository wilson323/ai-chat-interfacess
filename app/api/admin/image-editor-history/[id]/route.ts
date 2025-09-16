import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 强鉴权：校验 cookie 中的 adminToken
async function checkAdminAuth(req: NextRequest) {
  const token = req.cookies.get('adminToken')?.value;
  if (!token) return false;
  try {
    const decoded = verify(token, JWT_SECRET);
    return decoded && typeof decoded === 'object' && 'role' in decoded && decoded.role === 'admin';
  } catch {
    return false;
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的ID' }, { status: 400 });
    }

    // 这里应该从数据库删除
    console.log('删除图片编辑历史记录:', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: '删除失败', detail: String(error) },
      { status: 500 }
    );
  }
}
