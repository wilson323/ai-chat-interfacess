# API设计统一规范

## 🎯 API设计原则

### 1. 统一响应格式

- **标准化响应**: 所有API使用统一的响应格式
- **错误处理**: 统一的错误码和错误信息
- **状态码**: 正确使用HTTP状态码
- **类型安全**: 完整的TypeScript类型定义

### 2. RESTful设计

- **资源导向**: 基于资源的URL设计
- **HTTP方法**: 正确使用GET、POST、PUT、DELETE
- **状态码**: 使用标准HTTP状态码
- **版本控制**: API版本管理策略

### 3. 性能优化

- **响应时间**: API响应时间 < 500ms
- **缓存策略**: 合理使用HTTP缓存
- **分页**: 大数据集使用分页
- **压缩**: 启用响应压缩

## 🏗️ API架构设计

### 1. 统一响应格式

```typescript
// 成功响应
interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
    requestId: string;
  };
}

// 错误响应
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
  };
}

// 分页元数据
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

### 2. 错误码规范

```typescript
// 错误码枚举
enum ApiErrorCode {
  // 通用错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',

  // 业务错误
  AGENT_NOT_FOUND = 'AGENT_NOT_FOUND',
  CHAT_SESSION_EXPIRED = 'CHAT_SESSION_EXPIRED',
  FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',
  VOICE_TRANSCRIPTION_FAILED = 'VOICE_TRANSCRIPTION_FAILED',

  // 外部服务错误
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  REDIS_ERROR = 'REDIS_ERROR',
}
```

### 3. API版本管理

```typescript
// API版本策略
const API_VERSION = 'v1';
const API_BASE_PATH = `/api/${API_VERSION}`;

// 版本兼容性
interface ApiVersion {
  current: string;
  supported: string[];
  deprecated: string[];
  sunset: string[];
}
```

## 🔧 技术实现

### 1. 统一响应工具

```typescript
// lib/api/response.ts
import { NextResponse } from 'next/server';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiErrorCode,
} from '@/types/api';

/**
 * 创建成功响应
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  meta?: any,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      meta: {
        ...meta,
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
      },
    },
    { status }
  );
}

/**
 * 创建错误响应
 */
export function createErrorResponse(
  code: ApiErrorCode,
  message: string,
  details?: any,
  status: number = 400
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
      },
    },
    { status }
  );
}

/**
 * 创建分页响应
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  message?: string
): NextResponse<ApiSuccessResponse<T[]>> {
  return createSuccessResponse(data, message, { pagination });
}

/**
 * 生成请求ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
```

### 2. 请求验证器

```typescript
// lib/api/validators.ts
import { z } from 'zod';
import { createErrorResponse, ApiErrorCode } from './response';

/**
 * 通用查询参数验证器
 */
export const queryParamsSchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
});

/**
 * 分页参数验证器
 */
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

/**
 * 验证请求参数
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        '请求参数验证失败',
        error.errors
      );
    }
    throw error;
  }
}

/**
 * 验证查询参数
 */
export function validateQueryParams(request: Request) {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams);
  return validateRequest(queryParamsSchema, params);
}

/**
 * 验证请求体
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return validateRequest(schema, body);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        '请求体格式错误'
      );
    }
    throw error;
  }
}
```

### 3. API中间件

```typescript
// lib/api/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, ApiErrorCode } from './response';
import { validateQueryParams } from './validators';

/**
 * 请求日志中间件
 */
export function withLogging(handler: Function) {
  return async (request: NextRequest) => {
    const startTime = Date.now();
    const requestId = generateRequestId();

    console.log(`[${requestId}] ${request.method} ${request.url}`);

    try {
      const response = await handler(request);
      const duration = Date.now() - startTime;

      console.log(`[${requestId}] ${response.status} ${duration}ms`);
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[${requestId}] Error ${duration}ms:`, error);
      throw error;
    }
  };
}

/**
 * 请求验证中间件
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
 */
export function withAuth(handler: Function) {
  return async (request: NextRequest) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

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
      return createErrorResponse(
        ApiErrorCode.AUTHENTICATION_ERROR,
        '认证令牌无效'
      );
    }
  };
}

/**
 * 权限检查中间件
 */
export function withPermission(permission: string) {
  return function (handler: Function) {
    return async (request: NextRequest) => {
      const user = (request as any).user;

      if (!user || !user.permissions?.includes(permission)) {
        return createErrorResponse(
          ApiErrorCode.AUTHORIZATION_ERROR,
          '权限不足'
        );
      }

      return await handler(request);
    };
  };
}

/**
 * 错误处理中间件
 */
export function withErrorHandler(handler: Function) {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof NextResponse) {
        return error;
      }

      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, '服务器内部错误');
    }
  };
}
```

### 4. API路由模板

```typescript
// app/api/example/route.ts
import { NextRequest } from 'next/server';
import {
  withErrorHandler,
  withLogging,
  withValidation,
  withAuth,
} from '@/lib/api/middleware';
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
} from '@/lib/api/response';
import { validateRequestBody } from '@/lib/api/validators';
import { z } from 'zod';

// 请求体验证模式
const createExampleSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  description: z.string().optional(),
  type: z.enum(['type1', 'type2']),
});

// GET /api/example - 获取列表
export const GET = withErrorHandler(
  withLogging(
    withValidation(async (request: NextRequest) => {
      const queryParams = (request as any).queryParams;
      const { page = 1, limit = 20 } = queryParams;

      // 业务逻辑
      const examples = await getExamples({ page, limit });
      const total = await getExamplesCount();

      const pagination = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      };

      return createPaginatedResponse(examples, pagination);
    })
  )
);

// POST /api/example - 创建
export const POST = withErrorHandler(
  withLogging(
    withAuth(async (request: NextRequest) => {
      const body = await validateRequestBody(request, createExampleSchema);
      const user = (request as any).user;

      // 业务逻辑
      const example = await createExample({
        ...body,
        createdBy: user.id,
      });

      return createSuccessResponse(example, '创建成功', undefined, 201);
    })
  )
);

// PUT /api/example - 更新
export const PUT = withErrorHandler(
  withLogging(
    withAuth(async (request: NextRequest) => {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');

      if (!id) {
        return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, '缺少ID参数');
      }

      const body = await validateRequestBody(request, createExampleSchema);

      // 业务逻辑
      const example = await updateExample(id, body);

      return createSuccessResponse(example, '更新成功');
    })
  )
);

// DELETE /api/example - 删除
export const DELETE = withErrorHandler(
  withLogging(
    withAuth(async (request: NextRequest) => {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');

      if (!id) {
        return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, '缺少ID参数');
      }

      // 业务逻辑
      await deleteExample(id);

      return createSuccessResponse(null, '删除成功');
    })
  )
);
```

## 📊 性能优化策略

### 1. 响应缓存

```typescript
// lib/api/cache.ts
import { NextResponse } from 'next/server';

/**
 * 缓存配置
 */
const CACHE_CONFIG = {
  'GET /api/agents': { ttl: 300 }, // 5分钟
  'GET /api/config': { ttl: 600 }, // 10分钟
  'GET /api/health': { ttl: 60 }, // 1分钟
};

/**
 * 添加缓存头
 */
export function addCacheHeaders(
  response: NextResponse,
  ttl: number = 300
): NextResponse {
  response.headers.set('Cache-Control', `public, max-age=${ttl}`);
  response.headers.set('ETag', generateETag());
  return response;
}

/**
 * 生成ETag
 */
function generateETag(): string {
  return `"${Date.now()}-${Math.random().toString(36).substr(2, 9)}"`;
}
```

### 2. 请求限流

```typescript
// lib/api/rate-limit.ts
import { NextRequest } from 'next/server';
import { createErrorResponse, ApiErrorCode } from './response';

/**
 * 限流配置
 */
const RATE_LIMITS = {
  '/api/chat': { requests: 10, window: 60000 }, // 1分钟10次
  '/api/voice': { requests: 5, window: 60000 }, // 1分钟5次
  '/api/upload': { requests: 3, window: 60000 }, // 1分钟3次
};

/**
 * 限流中间件
 */
export function withRateLimit(handler: Function) {
  return async (request: NextRequest) => {
    const pathname = new URL(request.url).pathname;
    const clientId = getClientId(request);

    const limit = RATE_LIMITS[pathname];
    if (limit && !checkRateLimit(clientId, pathname, limit)) {
      return createErrorResponse(
        ApiErrorCode.RATE_LIMIT_EXCEEDED,
        '请求过于频繁，请稍后再试'
      );
    }

    return await handler(request);
  };
}
```

### 3. 响应压缩

```typescript
// lib/api/compression.ts
import { NextResponse } from 'next/server';
import { compress } from 'compression';

/**
 * 响应压缩中间件
 */
export function withCompression(handler: Function) {
  return async (request: NextRequest) => {
    const response = await handler(request);

    // 只压缩JSON响应
    if (response.headers.get('content-type')?.includes('application/json')) {
      const compressed = await compress(response.body);
      response.headers.set('content-encoding', 'gzip');
      response.headers.set('content-length', compressed.length.toString());
    }

    return response;
  };
}
```

## 🧪 测试规范

### 1. API测试

```typescript
// __tests__/api/example.test.ts
import { GET, POST, PUT, DELETE } from '@/app/api/example/route';
import { NextRequest } from 'next/server';

describe('/api/example', () => {
  describe('GET', () => {
    it('应该返回示例列表', async () => {
      const request = new NextRequest('http://localhost:3000/api/example');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('POST', () => {
    it('应该创建新示例', async () => {
      const request = new NextRequest('http://localhost:3000/api/example', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Example',
          type: 'type1',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Test Example');
    });
  });
});
```

### 2. 集成测试

```typescript
// __tests__/api/integration.test.ts
import { testClient } from '@/lib/test-utils';

describe('API集成测试', () => {
  it('应该完成完整的CRUD流程', async () => {
    // 创建
    const createResponse = await testClient.post('/api/example', {
      name: 'Test',
      type: 'type1',
    });
    expect(createResponse.status).toBe(201);

    const { id } = createResponse.data.data;

    // 读取
    const getResponse = await testClient.get(`/api/example?id=${id}`);
    expect(getResponse.status).toBe(200);

    // 更新
    const updateResponse = await testClient.put(`/api/example?id=${id}`, {
      name: 'Updated Test',
    });
    expect(updateResponse.status).toBe(200);

    // 删除
    const deleteResponse = await testClient.delete(`/api/example?id=${id}`);
    expect(deleteResponse.status).toBe(200);
  });
});
```

## 📋 开发检查清单

### API设计检查

- [ ] 使用统一响应格式
- [ ] 正确使用HTTP状态码
- [ ] 实现错误处理
- [ ] 添加请求验证
- [ ] 实现分页功能

### 性能检查

- [ ] 响应时间 < 500ms
- [ ] 启用响应缓存
- [ ] 实现请求限流
- [ ] 启用响应压缩
- [ ] 优化数据库查询

### 安全检查

- [ ] 实现身份认证
- [ ] 实现权限控制
- [ ] 输入验证完整
- [ ] 防止SQL注入
- [ ] 防止XSS攻击

### 测试检查

- [ ] 单元测试覆盖 > 80%
- [ ] 集成测试完整
- [ ] 错误场景测试
- [ ] 性能测试通过
- [ ] 安全测试通过

## ⚠️ 注意事项

1. **统一性**: 所有API必须使用统一的响应格式
2. **性能**: 确保API响应时间在可接受范围内
3. **安全**: 实现完整的身份认证和权限控制
4. **测试**: 确保API有完整的测试覆盖
5. **文档**: 保持API文档的时效性

## 🎯 最佳实践

### 1. API设计

- 使用RESTful设计原则
- 实现统一的响应格式
- 正确使用HTTP状态码
- 实现完整的错误处理

### 2. 性能优化

- 实现响应缓存
- 启用请求限流
- 使用响应压缩
- 优化数据库查询

### 3. 安全防护

- 实现身份认证
- 实现权限控制
- 输入验证完整
- 防止常见攻击

### 4. 测试保障

- 单元测试覆盖充分
- 集成测试完整
- 性能测试通过
- 安全测试通过

**记住: 好的API设计是应用成功的基础，统一的API设计确保应用的可维护性和可扩展性。**
