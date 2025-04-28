import { NextRequest, NextResponse } from 'next/server'
import { syncDbSchema } from '@/lib/db/models/db-schema'
import { requireAdmin } from '@/lib/api/auth'

export async function POST(req: NextRequest) {
  await requireAdmin(req)
  await syncDbSchema()
  return NextResponse.json({ success: true })
} 