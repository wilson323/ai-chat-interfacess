/**
 * API中间件
 * 提供统一的API中间件功能，包括日志、验证、认证、限流等
 */

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, ApiErrorCode } from './response';
import { validateQueryParams } from './validators';
import jwt from 'jsonwebtoken';
import { appConfig } from '@/lib/config';

/**
 * 请求日志中间件
 * 记录API请求和响应信息
 */
export function withLogging(handler: Function) {
  return async (request: NextRequest) => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const method = request.method;
    const url = request.url;
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ip = getClientIP(request);

    // 记录请求开始
    console.log(`[${requestId}] ${method} ${url} - ${userAgent} - ${ip}`);

    try {
      const response = await handler(request);
      const duration = Date.now() - startTime;
      const status = response.status;

      // 记录请求完成
      console.log(
        `[${requestId}] ${method} ${url} - ${status} - ${duration}ms`
      );

      // 添加请求ID到响应头
      response.headers.set('X-Request-ID', requestId);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[${requestId}] ${method} ${url} - Error - ${duration}ms:`,
        error
      );

      // 添加请求ID到错误响应
      if (error instanceof NextResponse) {
        error.headers.set('X-Request-ID', requestId);
        return error;
      }

      throw error;
    }
  };
}

/**
 * 请求验证中间件
 * 验证请求参数和格式
 */
export function withValidation(handler: Function) {
  return async (request: NextRequest) => {
    try {
      // 验证查询参数
      const queryParams = validateQueryParams(request);

      // 将验证后的参数添加到请求对象
      (request as any).queryParams = queryParams;

      return await handler(request);
    } catch (error) {
      return error;
    }
  };
}

/**
 * 认证中间件
 * 验证JWT令牌
 */
export function withAuth(handler: Function) {
  return async (request: NextRequest) => {
    const token = getAuthToken(request);

    if (!token) {
      return createErrorResponse(
        ApiErrorCode.AUTHENTICATION_ERROR,
        '缺少认证令牌'
      );
    }

    try {
      // 验证JWT令牌
      const payload = await verifyJWT(token);
      (request as any).user = payload;

      return await handler(request);
    } catch (error) {
      console.error('JWT验证失败:', error);
      return createErrorResponse(
        ApiErrorCode.AUTHENTICATION_ERROR,
        '认证令牌无效或已过期'
      );
    }
  };
}

/**
 * 权限检查中间件
 * 检查用户权限
 */
export function withPermission(permission: string) {
  return function (handler: Function) {
    return async (request: NextRequest) => {
      const user = (request as any).user;

      if (!user) {
        return createErrorResponse(
          ApiErrorCode.AUTHENTICATION_ERROR,
          '用户未认证'
        );
      }

      if (!user.permissions || !user.permissions.includes(permission)) {
        return createErrorResponse(
          ApiErrorCode.AUTHORIZATION_ERROR,
          `权限不足，需要权限: ${permission}`
        );
      }

      return await handler(request);
    };
  };
}

/**
 * 管理员权限中间件
 * 检查管理员权限
 */
export function withAdminAuth(handler: Function) {
  return async (request: NextRequest) => {
    const token = getAuthToken(request);

    if (!token) {
      return createErrorResponse(
        ApiErrorCode.AUTHENTICATION_ERROR,
        '缺少认证令牌'
      );
    }

    try {
      const payload = await verifyJWT(token);

      if (!payload.isAdmin) {
        return createErrorResponse(
          ApiErrorCode.AUTHORIZATION_ERROR,
          '需要管理员权限'
        );
      }

      (request as any).user = payload;
      return await handler(request);
    } catch (error) {
      console.error('管理员认证失败:', error);
      return createErrorResponse(
        ApiErrorCode.AUTHENTICATION_ERROR,
        '管理员认证失败'
      );
    }
  };
}

/**
 * 请求限流中间件
 * 防止API滥用
 */
export function withRateLimit(handler: Function) {
  return async (request: NextRequest) => {
    const clientId = getClientId(request);
    const pathname = new URL(request.url).pathname;

    // 检查限流
    if (!checkRateLimit(clientId, pathname)) {
      return createErrorResponse(
        ApiErrorCode.RATE_LIMIT_EXCEEDED,
        '请求过于频繁，请稍后再试'
      );
    }

    return await handler(request);
  };
}

/**
 * CORS中间件
 * 处理跨域请求
 */
export function withCORS(handler: Function) {
  return async (request: NextRequest) => {
    const response = await handler(request);

    // 添加CORS头
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    response.headers.set('Access-Control-Max-Age', '86400');

    return response;
  };
}

/**
 * 缓存中间件
 * 添加缓存头
 */
export function withCache(ttl: number = 300) {
  return function (handler: Function) {
    return async (request: NextRequest) => {
      const response = await handler(request);

      // 只缓存GET请求
      if (request.method === 'GET') {
        response.headers.set('Cache-Control', `public, max-age=${ttl}`);
        response.headers.set('ETag', generateETag());
      }

      return response;
    };
  };
}

/**
 * 压缩中间件
 * 启用响应压缩
 */
export function withCompression(handler: Function) {
  return async (request: NextRequest) => {
    const response = await handler(request);

    // 只压缩JSON响应
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      response.headers.set('Content-Encoding', 'gzip');
    }

    return response;
  };
}

/**
 * 错误处理中间件
 * 统一错误处理
 */
export function withErrorHandler(handler: Function) {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error('API Error:', error);

      // 如果已经是NextResponse，直接返回
      if (error instanceof NextResponse) {
        return error;
      }

      // 处理不同类型的错误
      if (error instanceof Error) {
        // 数据库错误
        if (
          error.message.includes('database') ||
          error.message.includes('sequelize')
        ) {
          return createErrorResponse(
            ApiErrorCode.DATABASE_ERROR,
            '数据库操作失败',
            process.env.NODE_ENV === 'development' ? error.message : undefined
          );
        }

        // 外部API错误
        if (
          error.message.includes('fetch') ||
          error.message.includes('network')
        ) {
          return createErrorResponse(
            ApiErrorCode.EXTERNAL_API_ERROR,
            '外部服务调用失败',
            process.env.NODE_ENV === 'development' ? error.message : undefined
          );
        }

        // 其他错误
        return createErrorResponse(
          ApiErrorCode.INTERNAL_ERROR,
          '服务器内部错误',
          process.env.NODE_ENV === 'development' ? error.message : undefined
        );
      }

      // 未知错误
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, '未知错误');
    }
  };
}

/**
 * 组合中间件
 * 将多个中间件组合使用
 */
export function compose(...middlewares: Function[]) {
  return middlewares.reduce((acc, middleware) => {
    return (handler: Function) => middleware(acc(handler));
  });
}

/**
 * 常用中间件组合
 */
export const commonMiddlewares = {
  // 基础中间件组合
  basic: compose(withLogging, withErrorHandler),

  // 认证中间件组合
  auth: compose(withLogging, withAuth, withErrorHandler),

  // 管理员中间件组合
  admin: compose(withLogging, withAdminAuth, withErrorHandler),

  // 限流中间件组合
  rateLimited: compose(withLogging, withRateLimit, withErrorHandler),

  // 缓存中间件组合
  cached: compose(withLogging, withCache(), withErrorHandler),

  // 完整中间件组合
  full: compose(
    withLogging,
    withCORS,
    withCompression,
    withRateLimit,
    withErrorHandler
  ),
};

/**
 * 工具函数
 */

/**
 * 生成请求ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 获取客户端IP
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

/**
 * 获取客户端ID
 */
function getClientId(request: NextRequest): string {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${ip}_${userAgent}`;
}

/**
 * 获取认证令牌
 */
function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

/**
 * 验证JWT令牌
 */
async function verifyJWT(token: string): Promise<any> {
  try {
    const secret = appConfig.security.jwtSecret;
    const payload = jwt.verify(token, secret) as any;

    // 检查令牌是否过期
    if (payload.exp && payload.exp < Date.now() / 1000) {
      throw new Error('Token expired');
    }

    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * 检查限流
 */
function checkRateLimit(clientId: string, pathname: string): boolean {
  // 简单的内存限流实现
  // 在生产环境中应该使用Redis
  const now = Date.now();
  const windowMs = 60000; // 1分钟
  const maxRequests = 100; // 最大请求数

  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }

  const key = `${clientId}:${pathname}`;
  const requests = global.rateLimitStore.get(key) || [];

  // 清理过期请求
  const validRequests = requests.filter(
    (time: number) => now - time < windowMs
  );

  // 检查是否超过限制
  if (validRequests.length >= maxRequests) {
    return false;
  }

  // 记录当前请求
  validRequests.push(now);
  global.rateLimitStore.set(key, validRequests);

  return true;
}

/**
 * 生成ETag
 */
function generateETag(): string {
  return `"${Date.now()}-${Math.random().toString(36).substr(2, 9)}"`;
}

/**
 * 扩展全局类型
 */
declare global {
  var rateLimitStore: Map<string, number[]> | undefined;
}

/**
 * 默认导出
 */
export default {
  withLogging,
  withValidation,
  withAuth,
  withPermission,
  withAdminAuth,
  withRateLimit,
  withCORS,
  withCache,
  withCompression,
  withErrorHandler,
  compose,
  commonMiddlewares,
};
