import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

export async function POST(req: NextRequest) {
  const { messageId, type } = await req.json()
  if (!messageId || !['like', 'dislike'].includes(type)) {
    return NextResponse.json({ error: '参数错误' }, { status: 400 })
  }
  const saveDir = path.join(process.cwd(), 'data')
  await fs.mkdir(saveDir, { recursive: true })
  const filePath = path.join(saveDir, 'message-feedback.json')
  let list: any[] = []
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    list = JSON.parse(raw)
  } catch {}
  // 去重：同一messageId只保留最新一条
  list = list.filter(item => item.messageId !== messageId)
  list.push({ messageId, type, time: Date.now() })
  await fs.writeFile(filePath, JSON.stringify(list, null, 2))
  return NextResponse.json({ ok: true })
} 