import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const LOG_PATH = path.resolve(process.cwd(), 'db-schema-ops.log')

export async function POST(req: NextRequest) {
  const body = await req.text()
  const log = `[${new Date().toISOString()}] ${body}\n`
  fs.appendFileSync(LOG_PATH, log)
  return NextResponse.json({ success: true })
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url || '', 'http://localhost')
  const page = parseInt(url.searchParams.get('page') || '1', 10)
  const pageSize = parseInt(url.searchParams.get('pageSize') || '50', 10)
  if (!fs.existsSync(LOG_PATH)) return NextResponse.json({ logs: [], total: 0 })
  const lines = fs.readFileSync(LOG_PATH, 'utf-8').split('\n').filter(Boolean)
  const total = lines.length
  const logs = lines.slice((page-1)*pageSize, page*pageSize)
  return NextResponse.json({ logs, total })
} 