# 需求对齐文档 - ESLint错误修复

## 原始需求

修复项目中所有TypeScript ESLint错误，包括：

- `@typescript-eslint/no-explicit-any` - 禁止使用any类型
- `@typescript-eslint/no-unused-vars` - 禁止未使用的变量
- `@typescript-eslint/no-empty-object-type` - 禁止空对象类型接口
- `@typescript-eslint/no-require-imports` - 禁止require导入
- `import/no-anonymous-default-export` - 禁止匿名默认导出
- `prefer-const` - 优先使用const
- `prefer-rest-params` - 优先使用rest参数
- `@typescript-eslint/no-unsafe-function-type` - 禁止不安全的函数类型
- `react-hooks/exhaustive-deps` - React Hook依赖检查
- `@next/next/no-img-element` - 禁止使用img元素

## 项目上下文

### 技术栈

- 编程语言：TypeScript 5.x
- 框架版本：Next.js 14.0.4
- 数据库：PostgreSQL + Prisma
- 部署环境：Windows

### 现有架构理解

- 架构模式：Next.js App Router + 分层架构
- 核心模块：lib/目录下的各种服务模块
- 集成点：API路由、数据库模型、缓存系统

## 需求理解

### 功能边界

**包含功能：**

- [x] 修复所有TypeScript ESLint错误
- [x] 替换any类型为具体类型
- [x] 移除未使用的变量和导入
- [x] 修复空接口定义
- [x] 替换require为import
- [x] 修复匿名默认导出
- [x] 优化变量声明（const vs let）
- [x] 修复React Hook依赖问题
- [x] 替换img为Next.js Image组件

**明确不包含（Out of Scope）：**

- [x] 不修改业务逻辑
- [x] 不改变API接口
- [x] 不重构整体架构

## 疑问澄清

### P0级问题（必须澄清）

1. **类型定义策略**
   - 背景：大量any类型需要替换为具体类型
   - 影响：类型安全性
   - 建议方案：基于上下文推断具体类型，复杂场景使用泛型

2. **未使用变量处理**
   - 背景：很多变量声明但未使用
   - 影响：代码清洁度
   - 建议方案：删除未使用的变量，保留有意义的注释

3. **空接口处理**
   - 背景：多个接口继承但无额外属性
   - 影响：类型定义冗余
   - 建议方案：直接使用父类型或添加具体属性

## 验收标准

### 功能验收

- [ ] 所有ESLint错误修复完成
- [ ] 代码通过TypeScript严格模式检查
- [ ] 保持现有功能完整性
- [ ] 代码可读性和维护性提升

### 质量验收

- [ ] ESLint检查通过（0错误）
- [ ] TypeScript编译无错误
- [ ] 代码风格统一
- [ ] 无破坏性变更

## 技术约束

### 代码规范

- 使用camelCase命名变量和函数
- 优先使用命名导出而非默认导出
- 使用Array<T>而非T[]
- 严格类型检查（strict: true）

### 质量要求

- 为所有函数添加错误处理
- 复杂函数添加JSDoc注释
- 优先代码可读性
- 避免代码冗余
