# 代码规范文档

## TypeScript 规范

### 类型安全

- **禁止使用 `any` 类型**：除非绝对必要，否则必须使用具体类型
- **使用 `unknown` 替代 `any`**：当类型未知时，使用 `unknown` 并添加类型守卫
- **使用 `Record<string, unknown>` 替代 `any`**：用于对象类型
- **使用 `Array<Record<string, unknown>>` 替代 `any[]`**：用于对象数组

### 类型定义

```typescript
// ✅ 推荐
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// ✅ 推荐 - 未知对象结构
const data: Record<string, unknown> = {};

// ✅ 推荐 - 对象数组
const items: Array<Record<string, unknown>> = [];

// ❌ 禁止
const data: any = {};
const items: any[] = [];
```

### 函数类型

- **禁止使用 `Function` 类型**：使用具体的函数签名
- **使用泛型**：提高类型复用性

```typescript
// ✅ 推荐
type EventHandler = (event: Event) => void;
type AsyncHandler<T> = (data: T) => Promise<void>;

// ❌ 禁止
const handler: Function = () => {};
```

## ESLint 规范

### 变量使用

- **清理未使用的变量**：删除所有未使用的变量和导入
- **使用下划线前缀**：对于必须存在但未使用的参数，使用 `_` 前缀

```typescript
// ✅ 推荐
function processData(data: string, _options: Options) {
  return data.toUpperCase();
}

// ❌ 禁止
function processData(data: string, options: Options) {
  return data.toUpperCase(); // options 未使用
}
```

### 导入规范

- **使用 ES6 导入**：禁止使用 `require()` 语法
- **命名导出优先**：优先使用命名导出而非默认导出

```typescript
// ✅ 推荐
import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/user';

// ❌ 禁止
const { NextRequest } = require('next/server');
import User from '@/types/user'; // 除非必要
```

### 接口规范

- **避免空接口**：接口必须包含至少一个成员
- **使用具体类型**：避免使用空对象类型

```typescript
// ✅ 推荐
interface UserConfig {
  theme: 'light' | 'dark';
  language: string;
}

// ❌ 禁止
interface EmptyInterface {}
interface UserConfig extends EmptyInterface {}
```

## 代码质量

### 错误处理

- **统一错误格式**：使用项目统一的错误响应格式
- **添加类型注解**：所有函数参数和返回值都要有类型注解
- **JSDoc 注释**：复杂函数必须添加 JSDoc 注释

```typescript
/**
 * 处理用户认证
 * @param token JWT token
 * @returns 用户信息或null
 */
export async function authenticateUser(token: string): Promise<User | null> {
  try {
    // 实现逻辑
    return user;
  } catch (error) {
    console.error('Authentication failed:', error);
    return null;
  }
}
```

### 命名规范

- **camelCase**：变量和函数使用 camelCase
- **PascalCase**：类和接口使用 PascalCase
- **kebab-case**：文件名使用 kebab-case

```typescript
// ✅ 推荐
const userName = 'john';
const userAge = 25;

interface UserProfile {
  firstName: string;
  lastName: string;
}

// 文件名：user-profile.ts
```

## 构建配置

### TypeScript 配置

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### ESLint 配置

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-require-imports": "error",
    "@typescript-eslint/no-empty-object-type": "error"
  }
}
```

## 检查清单

### 提交前检查

- [ ] 所有 `any` 类型已替换为具体类型
- [ ] 所有 `Function` 类型已替换为具体函数签名
- [ ] 所有未使用变量已清理
- [ ] 所有 `require()` 导入已改为 ES6 导入
- [ ] 所有空接口已修复
- [ ] TypeScript 编译无错误
- [ ] ESLint 检查通过
- [ ] 单元测试通过

### 代码审查要点

- [ ] 类型安全性
- [ ] 错误处理完整性
- [ ] 代码可读性
- [ ] 性能影响
- [ ] 安全性考虑
