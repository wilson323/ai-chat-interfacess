import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const BACKUP_DIR = path.resolve(process.cwd(), 'db_backups')
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR)

export async function GET(req: NextRequest) {
  // ?file=xxx.sql 下载指定快照，否则列出所有快照
  const url = new URL(req.url || '', 'http://localhost')
  const file = url.searchParams.get('file')
  if (file) {
    const filePath = path.join(BACKUP_DIR, file)
    if (!fs.existsSync(filePath)) return NextResponse.json({ error: '文件不存在' }, { status: 404 })
    const data = fs.readFileSync(filePath)
    return new Response(data, { headers: { 'Content-Type': 'application/octet-stream', 'Content-Disposition': `attachment; filename=${file}` } })
  }
  const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.sql')).sort().reverse()
  return NextResponse.json({ files })
}

export async function POST() {
  // 手动备份
  const file = `backup_${Date.now()}.sql`
  const filePath = path.join(BACKUP_DIR, file)
  execSync(`pg_dump -U $POSTGRES_USER -h $POSTGRES_HOST -p $POSTGRES_PORT $POSTGRES_DB > ${filePath}`, { stdio: 'inherit', env: process.env })
  return NextResponse.json({ file })
}

export async function PUT(req: NextRequest) {
  // 恢复
  const { file } = await req.json()
  if (!file) return NextResponse.json({ error: '缺少文件名' }, { status: 400 })
  const filePath = path.join(BACKUP_DIR, file)
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: '文件不存在' }, { status: 404 })
  execSync(`psql -U $POSTGRES_USER -h $POSTGRES_HOST -p $POSTGRES_PORT $POSTGRES_DB < ${filePath}`, { stdio: 'inherit', env: process.env })
  return NextResponse.json({ success: true })
} 