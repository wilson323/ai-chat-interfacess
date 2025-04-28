import { NextRequest, NextResponse } from 'next/server'
import { getSchemaDiffSQL } from '@/lib/db/models/db-schema'

export async function GET(req: NextRequest) {
  // 生成SQL变更脚本
  const sql = await getSchemaDiffSQL()
  return NextResponse.json({ sql })
} 