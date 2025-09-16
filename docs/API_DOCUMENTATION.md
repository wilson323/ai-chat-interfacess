# API 文档

## 概述

AI Chat Interface 提供了一套完整的 RESTful API，支持聊天、分析、管理等功能。

## 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: NextAuth.js JWT Token
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证

所有需要认证的API都需要在请求头中包含有效的JWT token：

```http
Authorization: Bearer <your-jwt-token>
```

## API 端点

### 聊天相关

#### 1. 发送消息

```http
POST /api/chat
```

**请求体:**

```json
{
  "message": "你好，请介绍一下自己",
  "agentId": "agent-1",
  "options": {
    "temperature": 0.7,
    "maxTokens": 1000
  }
}
```

**响应:**

```json
{
  "success": true,
  "data": {
    "id": "msg-123",
    "content": "你好！我是一个AI助手...",
    "timestamp": "2024-01-01T00:00:00Z",
    "agentId": "agent-1"
  }
}
```

#### 2. 获取聊天历史

```http
GET /api/chat-history?sessionId=session-123&limit=50
```

**查询参数:**

- `sessionId` (string): 会话ID
- `limit` (number): 返回消息数量限制，默认50

**响应:**

```json
{
  "success": true,
  "data": [
    {
      "id": "msg-123",
      "content": "你好！",
      "role": "user",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 分析相关

#### 1. 获取使用统计

```http
GET /api/analytics/usage?startDate=2024-01-01&endDate=2024-01-31
```

**查询参数:**

- `startDate` (string): 开始日期 (ISO 8601)
- `endDate` (string): 结束日期 (ISO 8601)
- `agentId` (string, 可选): 智能体ID

**响应:**

```json
{
  "success": true,
  "data": {
    "totalMessages": 1500,
    "totalUsers": 100,
    "averageResponseTime": 250,
    "usageByAgent": [
      {
        "agentId": "agent-1",
        "name": "通用助手",
        "messageCount": 800,
        "userCount": 60
      }
    ]
  }
}
```

#### 2. 导出数据

```http
GET /api/analytics/export?format=csv&dataType=usage
```

**查询参数:**

- `format` (string): 导出格式 (csv, json, excel)
- `dataType` (string): 数据类型 (usage, sessions, agents, locations)
- `startDate` (string, 可选): 开始日期
- `endDate` (string, 可选): 结束日期

**响应:**

- CSV格式: 直接返回CSV文件
- JSON格式: 返回JSON数据
- Excel格式: 返回Excel文件

### 管理相关

#### 1. 获取用户列表

```http
GET /api/admin/users?page=1&limit=20
```

**查询参数:**

- `page` (number): 页码，默认1
- `limit` (number): 每页数量，默认20
- `search` (string, 可选): 搜索关键词

**响应:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-123",
        "email": "user@example.com",
        "name": "用户名",
        "role": "user",
        "createdAt": "2024-01-01T00:00:00Z",
        "lastActiveAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

#### 2. 更新用户信息

```http
PUT /api/admin/users/{userId}
```

**请求体:**

```json
{
  "name": "新用户名",
  "role": "moderator",
  "isActive": true
}
```

**响应:**

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "name": "新用户名",
    "role": "moderator",
    "isActive": true,
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 系统相关

#### 1. 健康检查

```http
GET /api/health
```

**响应:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0",
    "uptime": 86400
  }
}
```

#### 2. 系统状态

```http
GET /api/system/status
```

**响应:**

```json
{
  "success": true,
  "data": {
    "database": "connected",
    "redis": "connected",
    "fastgpt": "connected",
    "memoryUsage": {
      "used": "512MB",
      "total": "2GB",
      "percentage": 25.6
    },
    "cpuUsage": 15.2
  }
}
```

## 错误处理

所有API都遵循统一的错误响应格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": "详细错误信息"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req-123"
  }
}
```

### 常见错误代码

| 错误代码              | HTTP状态码 | 描述             |
| --------------------- | ---------- | ---------------- |
| `VALIDATION_ERROR`    | 400        | 请求参数验证失败 |
| `UNAUTHORIZED`        | 401        | 未授权访问       |
| `FORBIDDEN`           | 403        | 权限不足         |
| `NOT_FOUND`           | 404        | 资源不存在       |
| `RATE_LIMITED`        | 429        | 请求频率过高     |
| `INTERNAL_ERROR`      | 500        | 服务器内部错误   |
| `SERVICE_UNAVAILABLE` | 503        | 服务不可用       |

## 数据验证

所有API都使用Zod进行数据验证，确保输入数据的类型安全和格式正确。

### 示例验证规则

```typescript
// 用户创建请求
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['user', 'moderator', 'admin']),
  password: z.string().min(8),
});

// 聊天消息请求
const chatMessageSchema = z.object({
  message: z.string().min(1).max(4000),
  agentId: z.string().optional(),
  options: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().min(1).max(4000).optional(),
    })
    .optional(),
});
```

## 限流

API实现了基于用户和IP的限流机制：

- **普通用户**: 100请求/分钟
- **认证用户**: 500请求/分钟
- **管理员**: 1000请求/分钟

超出限制时返回 `429 Too Many Requests` 错误。

## 版本控制

API版本通过URL路径控制：

- 当前版本: `v1` (默认)
- 版本格式: `/api/v1/...`

## 开发工具

### Postman集合

项目提供了完整的Postman集合文件，位于 `docs/postman/` 目录。

### OpenAPI规范

API的OpenAPI 3.0规范文件位于 `docs/openapi.yaml`。

## 更新日志

### v1.0.0 (2024-01-15)

- 初始版本发布
- 基础聊天功能
- 用户管理功能
- 数据分析功能
- 身份验证系统

---

**注意**: 本文档会随着API的更新而持续维护，请定期查看最新版本。
