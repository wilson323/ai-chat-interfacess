import { NextRequest, NextResponse } from 'next/server'
import os from 'os'

export async function GET() {
  // 这里只返回简单的CPU/内存，慢查询/接口耗时建议用专业APM
  const mem = process.memoryUsage()
  const cpu = os.loadavg()
  return NextResponse.json({
    memory: {
      rss: mem.rss,
      heapTotal: mem.heapTotal,
      heapUsed: mem.heapUsed,
      external: mem.external
    },
    cpu,
    // 可扩展慢查询、接口耗时等
  })
} 