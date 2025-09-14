import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/db/redis-cache';
import { getQuestionSuggestionsCore } from '@/lib/api/fastgpt/server-only';
import { Agent } from '@/types/agent';

const CACHE_TTL = 5 * 60; // 5分钟

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { error: '该接口已被管理员临时关闭' },
    { status: 403 }
  );
}
