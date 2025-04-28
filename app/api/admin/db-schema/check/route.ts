import { NextRequest, NextResponse } from 'next/server'
import { checkDbSchema } from '@/lib/db/models/db-schema'
import { requireAdmin } from '@/lib/api/auth'

export async function GET(req: NextRequest) {
  await requireAdmin(req)
  // 检查数据库表结构是否需要同步，返回详细diff
  const { syncNeeded, diffs } = await checkDbSchema()
  return NextResponse.json({ syncNeeded, diffs })
} 