# TypeScript类型安全规范

## 概述

本文档详细说明了项目中TypeScript类型安全的要求和规范，确保全局类型定义统一，避免any类型使用，提升代码质量和类型安全。

## 核心原则

### 1. 严格类型检查 ⭐⭐⭐

- **禁止any类型**: 严格禁止使用any类型，必须使用具体类型
- **类型定义统一**: 所有类型定义必须在`types/`目录下统一管理
- **类型导入规范**: 统一从`types/index.ts`导入类型
- **类型安全优先**: 类型安全优于开发便利性

### 2. 类型定义规范 ⭐⭐⭐

- **统一类型中心**: 所有类型定义在`types/index.ts`中统一导出
- **避免重复定义**: 禁止在多个文件中重复定义相同类型
- **类型命名规范**: 使用PascalCase命名接口和类型
- **类型文档化**: 复杂类型必须添加JSDoc注释

## 类型定义要求

### 1. 基础类型规范

#### 正确的类型定义

```typescript
// ✅ 接口定义
export interface UserProps {
  id: string;
  name: string;
  email: string;
  age?: number;
  isActive: boolean;
}

// ✅ 联合类型
export type Status = 'pending' | 'approved' | 'rejected';

// ✅ 泛型接口
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// ✅ 枚举类型
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}
```

#### 禁止的类型使用

```typescript
// ❌ 禁止使用any类型
export function badFunction(data: any): any {
  // 严格禁止
}

// ❌ 禁止使用object类型
function handleObject(obj: object) {
  // 太宽泛，不明确
}

// ❌ 禁止使用Function类型
function handleCallback(callback: Function) {
  // 不明确参数和返回值
}
```

### 2. 组件Props类型规范

```typescript
// ✅ 组件Props类型定义
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

// ✅ 使用泛型Props
export interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

// ✅ 事件处理类型
export interface FormProps {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  onChange: (field: string, value: unknown) => void;
}
```

### 3. API类型规范

```typescript
// ✅ API请求类型
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

// ✅ API响应类型
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// ✅ 统一API响应格式
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}
```

## 类型文件组织规范

### 1. 统一类型导出

```typescript
// types/index.ts - 统一类型导出中心
export * from './agent';
export * from './message';
export * from './api';
export * from './global';

// 重新导出常用类型
export type { Agent, Message, ApiResponse, UserProps } from './agent';
```

### 2. 类型文件命名规范

```
types/
├── index.ts          # 统一导出中心
├── agent.ts          # 智能体相关类型
├── message.ts        # 消息相关类型
├── api.ts           # API相关类型
├── global.ts        # 全局类型定义
└── errors.ts        # 错误类型定义
```

### 3. 类型导入规范

```typescript
// ✅ 统一从types/index.ts导入
import type { Agent, Message, ApiResponse } from '@/types';

// ❌ 禁止从具体文件导入
import type { Agent } from '@/types/agent';
import type { Message } from '@/types/message';
```

## 类型工具和助手

### 1. 类型守卫

```typescript
// ✅ 类型守卫函数
export function isAgent(obj: unknown): obj is Agent {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'description' in obj
  );
}

// ✅ 使用类型守卫
function processAgent(data: unknown) {
  if (isAgent(data)) {
    // data现在是Agent类型
    console.log(data.name);
  }
}
```

### 2. 类型断言规范

```typescript
// ✅ 安全的类型断言
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    // 使用Record类型而不是any
  }
}

// ❌ 不安全的类型断言
function badProcessData(data: unknown) {
  const obj = data as any; // 禁止
}
```

### 3. 泛型约束

```typescript
// ✅ 使用泛型约束
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

// ✅ 条件类型
type NonNullable<T> = T extends null | undefined ? never : T;
```

## 类型测试规范

### 1. 类型测试要求

```typescript
// ✅ 类型测试示例
import type { Agent } from '@/types';

// 确保类型正确性
const testAgent: Agent = {
  id: 'test-id',
  name: 'Test Agent',
  description: 'Test Description',
  type: 'conversation',
  isActive: true,
  config: {
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
  },
};

// 确保类型错误会被捕获
// const invalidAgent: Agent = {
//   id: 'test-id',
//   name: 'Test Agent'
//   // 缺少必需属性，TypeScript会报错
// }
```

### 2. 类型兼容性测试

```typescript
// ✅ 测试类型兼容性
function testTypeCompatibility() {
  const agent: Agent = testAgent;
  const message: Message = {
    id: 'msg-1',
    role: 'user',
    content: 'Hello',
    timestamp: new Date().toISOString(),
  };

  // 确保类型兼容
  const response: ApiResponse<Message> = {
    success: true,
    data: message,
  };
}
```

## 类型检查工具

### 1. TypeScript配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 2. ESLint类型规则

```json
// .eslintrc.json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-inferrable-types": "error"
  }
}
```

## 类型质量指标

### 1. 类型覆盖率要求

- **any类型使用**: 0个
- **类型定义完整性**: 100%
- **类型导入统一性**: 100%
- **类型文档覆盖率**: ≥ 80%

### 2. 类型检查命令

```bash
# 类型检查
npm run type:check

# 类型覆盖率检查
npm run type:coverage

# 类型安全扫描
npm run type:scan
```

## 常见类型错误

### 1. 类型定义错误

```typescript
// ❌ 错误：使用any类型
interface BadInterface {
  data: any;
  callback: any;
}

// ✅ 正确：使用具体类型
interface GoodInterface {
  data: Record<string, unknown>;
  callback: (value: string) => void;
}
```

### 2. 类型导入错误

```typescript
// ❌ 错误：分散导入
import type { Agent } from '@/types/agent';
import type { Message } from '@/types/message';

// ✅ 正确：统一导入
import type { Agent, Message } from '@/types';
```

### 3. 类型使用错误

```typescript
// ❌ 错误：类型不匹配
function processUser(user: any) {
  return user.name.toUpperCase();
}

// ✅ 正确：类型安全
function processUser(user: { name: string }) {
  return user.name.toUpperCase();
}
```

## 类型安全最佳实践

### 1. 开发前检查

- [ ] 确认类型定义在`types/`目录下
- [ ] 检查是否使用了any类型
- [ ] 验证类型导入是否统一
- [ ] 确保类型文档完整

### 2. 代码审查要点

- [ ] 类型定义是否清晰明确
- [ ] 是否避免了any类型使用
- [ ] 类型导入是否统一规范
- [ ] 类型测试是否充分

### 3. 持续改进

- [ ] 定期检查any类型使用
- [ ] 优化类型定义结构
- [ ] 完善类型文档
- [ ] 提升类型覆盖率

## 类型安全检查脚本

项目提供了自动化的类型安全检查脚本：

```bash
# 运行类型安全检查
npm run type:check

# 运行完整的类型扫描
npm run type:scan

# 检查类型覆盖率
npm run type:coverage
```

脚本会检查：

- any类型使用情况
- 类型定义文件完整性
- 类型导入规范性
- TypeScript编译错误

## 总结

TypeScript类型安全规范是项目代码质量的重要保障：

1. **严格类型检查**: 禁止any类型，使用具体类型
2. **统一类型管理**: 在`types/`目录下统一管理类型定义
3. **规范类型导入**: 统一从`types/index.ts`导入类型
4. **完善类型测试**: 确保类型定义的正确性
5. **持续类型检查**: 定期进行类型安全检查和优化

遵循这些规范能够显著提升代码质量、开发效率和系统稳定性。

## 重要提醒

1. **零容忍any类型**: 严格禁止使用any类型
2. **统一类型管理**: 所有类型定义在`types/`目录下统一管理
3. **类型安全优先**: 类型安全优于开发便利性
4. **持续类型检查**: 定期进行类型安全检查和优化

**记住**: 好的类型定义是代码质量的基础，严格遵循类型安全规范！
