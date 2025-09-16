# TypeScript严格模式规范

## 概述

本文档定义了项目中TypeScript严格模式的使用规范，确保代码质量和类型安全。

## 核心原则

### 1. 禁止使用any类型

- **原因**: `any`类型会绕过TypeScript的类型检查，失去类型安全的优势
- **替代方案**: 使用`unknown`、具体类型或泛型

```typescript
// ❌ 错误
function processData(data: any) {
  return data.someProperty;
}

// ✅ 正确
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'someProperty' in data) {
    return (data as { someProperty: unknown }).someProperty;
  }
  return undefined;
}

// ✅ 更好 - 使用泛型
function processData<T>(data: T): T {
  return data;
}
```

### 2. 禁止使用Function类型

- **原因**: `Function`类型过于宽泛，无法提供有意义的类型信息
- **替代方案**: 使用具体的函数签名

```typescript
// ❌ 错误
function addCallback(callback: Function) {
  callback();
}

// ✅ 正确
function addCallback(callback: () => void) {
  callback();
}

// ✅ 更好 - 使用泛型
function addCallback<T extends (...args: unknown[]) => unknown>(callback: T) {
  callback();
}
```

### 3. 处理未使用变量

- **原因**: 未使用的变量会增加代码复杂度，可能表示逻辑错误
- **解决方案**: 删除未使用的变量或使用下划线前缀

```typescript
// ❌ 错误
function processData(data: string) {
  const unused = 'not used';
  return data.toUpperCase();
}

// ✅ 正确 - 删除未使用变量
function processData(data: string) {
  return data.toUpperCase();
}

// ✅ 正确 - 使用下划线前缀表示故意未使用
function processData(data: string, _options: unknown) {
  return data.toUpperCase();
}
```

### 4. 使用ES6导入而非require

- **原因**: `require`是CommonJS语法，在TypeScript中应该使用ES6导入
- **解决方案**: 将`require`改为`import`

```typescript
// ❌ 错误
const config = require('./config');

// ✅ 正确
import config from './config';

// ✅ 正确 - 动态导入
const config = await import('./config');
```

### 5. 避免空接口

- **原因**: 空接口没有意义，应该使用类型别名或具体类型
- **解决方案**: 使用类型别名或添加属性

```typescript
// ❌ 错误
interface EmptyInterface {}

// ✅ 正确 - 使用类型别名
type EmptyType = Record<string, never>;

// ✅ 正确 - 添加属性
interface UserInterface {
  id: string;
  name: string;
}
```

### 6. 避免匿名默认导出

- **原因**: 匿名默认导出不利于代码可读性和调试
- **解决方案**: 先声明变量再导出

```typescript
// ❌ 错误
export default {
  method1: () => {},
  method2: () => {},
};

// ✅ 正确
const utils = {
  method1: () => {},
  method2: () => {},
};

export default utils;
```

## 类型定义规范

### 1. 基础类型使用

```typescript
// 字符串
const name: string = 'John';

// 数字
const age: number = 25;

// 布尔值
const isActive: boolean = true;

// 数组
const items: string[] = ['a', 'b', 'c'];
const numbers: Array<number> = [1, 2, 3];

// 对象
const user: { name: string; age: number } = { name: 'John', age: 25 };

// 联合类型
const status: 'pending' | 'success' | 'error' = 'pending';
```

### 2. 接口定义

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  createdAt: Date;
  updatedAt: Date;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
```

### 3. 泛型使用

```typescript
// 泛型函数
function identity<T>(arg: T): T {
  return arg;
}

// 泛型接口
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

// 泛型类
class Cache<T> {
  private data: Map<string, T> = new Map();

  set(key: string, value: T): void {
    this.data.set(key, value);
  }

  get(key: string): T | undefined {
    return this.data.get(key);
  }
}
```

### 4. 类型守卫

```typescript
// 类型守卫函数
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  );
}

// 使用类型守卫
function processValue(value: unknown) {
  if (isString(value)) {
    // 这里value被推断为string类型
    console.log(value.toUpperCase());
  }
}
```

## 错误处理规范

### 1. 异常处理

```typescript
// 使用try-catch处理异常
async function fetchData(url: string): Promise<unknown> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error;
  }
}

// 使用Result模式
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

async function safeFetchData(url: string): Promise<Result<unknown>> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return {
        success: false,
        error: new Error(`HTTP error! status: ${response.status}`),
      };
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

### 2. 空值处理

```typescript
// 使用可选链和空值合并
function getUserName(user: { name?: string } | null): string {
  return user?.name ?? 'Unknown';
}

// 使用类型守卫
function processUser(user: unknown): string {
  if (user && typeof user === 'object' && 'name' in user) {
    const userObj = user as { name: unknown };
    if (typeof userObj.name === 'string') {
      return userObj.name;
    }
  }
  return 'Unknown';
}
```

## 工具函数规范

### 1. 类型安全的工具函数

```typescript
// 安全的JSON解析
function safeJsonParse<T>(json: string): Result<T> {
  try {
    const data = JSON.parse(json) as T;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// 类型安全的数组操作
function filterByType<T>(
  items: unknown[],
  typeGuard: (item: unknown) => item is T
): T[] {
  return items.filter(typeGuard);
}

// 类型安全的对象属性访问
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] | undefined {
  return obj[key];
}
```

### 2. 配置类型定义

```typescript
// 环境变量配置
interface AppConfig {
  database: {
    url: string;
    maxConnections: number;
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
  features: {
    enableAnalytics: boolean;
    enableCaching: boolean;
  };
}

// 类型安全的配置加载
function loadConfig(): AppConfig {
  return {
    database: {
      url: process.env.DATABASE_URL || 'sqlite://memory',
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
    },
    api: {
      baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
      timeout: parseInt(process.env.API_TIMEOUT || '5000'),
    },
    features: {
      enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
      enableCaching: process.env.ENABLE_CACHING === 'true',
    },
  };
}
```

## 代码审查检查清单

### 类型安全检查

- [ ] 没有使用`any`类型
- [ ] 没有使用`Function`类型
- [ ] 所有变量都有明确的类型
- [ ] 泛型使用恰当
- [ ] 类型守卫使用正确

### 代码质量检查

- [ ] 没有未使用的变量
- [ ] 没有未使用的导入
- [ ] 使用ES6导入而非require
- [ ] 没有空接口
- [ ] 没有匿名默认导出

### 错误处理检查

- [ ] 异常处理完整
- [ ] 错误类型明确
- [ ] 空值处理安全
- [ ] 类型断言使用恰当

## 工具配置

### ESLint配置

```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-function-type": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-require-imports": "error",
    "@typescript-eslint/no-empty-object-type": "error",
    "import/no-anonymous-default-export": "error"
  }
}
```

### TypeScript配置

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

## 总结

遵循这些规范可以确保：

1. **类型安全**: 编译时发现更多错误
2. **代码可读性**: 类型信息提供更好的文档
3. **维护性**: 重构时更安全
4. **团队协作**: 统一的代码风格

记住：TypeScript的类型系统是工具，不是负担。正确使用类型系统可以让代码更安全、更可维护。
