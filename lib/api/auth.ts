import { NextRequest } from 'next/server';

export async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get('adminToken')?.value;
  if (!token) {
    throw new Response(JSON.stringify({ error: '无权限' }), { status: 403 });
  }
}

/**
 * 检查是否为管理员
 */
export async function isAdmin(req: NextRequest): Promise<boolean> {
  try {
    const token = req.cookies.get('adminToken')?.value;
    return !!token;
  } catch {
    return false;
  }
}
