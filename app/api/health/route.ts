import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import sequelize from '@/lib/db/sequelize';
import redis from '@/lib/db/redis';
import {
  getEnvironmentInfo,
  validateProductionConfig,
} from '@/lib/cross-platform-utils';

export async function GET(request: NextRequest) {
  let deep = false;
  // nextUrl为URL对象，url为string
  if ('searchParams' in request.nextUrl) {
    deep = request.nextUrl.searchParams.get('deep') === '1';
  } else if (typeof request.url === 'string') {
    deep = request.url.includes('deep=1');
  }
  if (!deep) {
    // 简单健康检查，包含环境信息
    const envInfo = getEnvironmentInfo();
    const configValidation = validateProductionConfig();

    return NextResponse.json(
      {
        success: true,
        message: 'ok',
        environment: envInfo,
        config: configValidation,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  }
  // 深度健康检查
  const dependencies: { db?: string; redis?: string } = {};
  let success = true;
  // 数据库检查
  try {
    await sequelize.authenticate();
    dependencies.db = 'ok';
  } catch (e) {
    success = false;
    dependencies.db = 'fail';
  }
  // Redis检查
  try {
    if (!redis.isOpen) await redis.connect();
    await redis.ping();
    dependencies.redis = 'ok';
  } catch (e) {
    success = false;
    dependencies.redis = 'fail';
  }
  // 深度健康检查也包含环境信息
  const envInfo = getEnvironmentInfo();
  const configValidation = validateProductionConfig();

  return NextResponse.json(
    {
      success,
      message: 'ok',
      dependencies,
      environment: envInfo,
      config: configValidation,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
}

export function POST() {
  return NextResponse.json(
    { success: false, error: 'Method Not Allowed' },
    { status: 405 }
  );
}

export function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method Not Allowed' },
    { status: 405 }
  );
}

export function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method Not Allowed' },
    { status: 405 }
  );
}

// 支持HEAD请求用于Docker健康检查
export async function HEAD() {
  try {
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
