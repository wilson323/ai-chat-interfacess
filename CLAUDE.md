# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 项目核心信息

**项目名称**: NeuroGlass AI Chat Interface (熵犇犇智能体)
**技术栈**: Next.js 15 + React 18 + TypeScript 5 + PostgreSQL + Docker
**部署方式**: Docker 一键部署 (端口: 3009)
**数据库**: PostgreSQL (端口: 5452)

## 📋 开发规则遵循

**必须严格遵守以下规则**:
1. **成熟组件库优先**: 自定义代码占比 < 20%，优先使用 shadcn/ui → Ant Design → Radix UI
2. **代码质量至上**: TypeScript 严格模式，零错误容忍，禁止 any 类型
3. **全局一致性**: 统一配置、错误处理、API 设计，遵循 SOLID 原则和 KISS 原则
4. **中文回复**: 所有沟通和文档使用中文

### 🔴 核心开发原则 (优先级: 绝对遵守)

#### 1. 成熟组件库优先原则 ⭐⭐⭐
- **自定义代码占比**: < 20%
- **shadcn/ui优先**: 基于Radix UI的无障碍组件
- **Ant Design补充**: 企业级复杂组件
- **避免重复造轮子**: 优先使用现有解决方案

#### 2. 代码质量至上原则 ⭐⭐⭐
- **TypeScript严格模式**: 禁止使用any类型
- **零容忍错误**: 所有代码必须通过检查
- **DRY原则**: 严格禁止代码重复
- **单一职责**: 每个函数/组件只负责一个功能

#### 3. 全局一致性原则 ⭐⭐⭐
- **统一配置源**: 所有配置通过.env管理
- **统一错误处理**: 全局错误处理中间件
- **统一API设计**: 标准化响应格式
- **统一组件接口**: 标准化Props接口

### 🟡 TypeScript类型安全规范 (优先级: 严格遵守)

#### 1. 严格类型检查 ⭐⭐⭐
- **禁止any类型**: 严格禁止使用any类型，必须使用具体类型
- **类型定义统一**: 所有类型定义必须在`types/`目录下统一管理
- **类型导入规范**: 统一从`types/index.ts`导入类型
- **类型安全优先**: 类型安全优于开发便利性

#### 2. 类型定义规范 ⭐⭐⭐
- **统一类型中心**: 所有类型定义在`types/index.ts`中统一导出
- **避免重复定义**: 禁止在多个文件中重复定义相同类型
- **类型命名规范**: 使用PascalCase命名接口和类型
- **类型文档化**: 复杂类型必须添加JSDoc注释

#### 3. 严格禁止的类型使用
```typescript
// ❌ 严格禁止
function processData(data: any): any {
  return data.someProperty
}

// ✅ 正确做法
interface DataType {
  someProperty: string
}
function processData(data: DataType): string {
  return data.someProperty
}
```

### 🟢 组件库使用规范 (优先级: 严格遵守)

#### 组件库优先级 (必须严格遵守)
1. **shadcn/ui** (最高优先级) ⭐⭐⭐
   - 基础UI组件: Button, Input, Card, Dialog, Select, Form, Table等
   - 必须使用shadcn/ui组件，禁止自定义基础UI组件

2. **Ant Design** (复杂业务组件) ⭐⭐
   - 复杂业务组件: Table, Form, DatePicker, Upload, Tree等
   - 必须使用Ant Design，禁止自定义复杂业务组件

3. **Radix UI** (无障碍组件) ⭐⭐
   - 无障碍组件: AlertDialog, DropdownMenu等
   - 必须使用Radix UI，禁止自定义无障碍组件

#### 禁止自定义的组件类型
- **基础UI组件**: 按钮、输入框、选择器、对话框、提示框、加载状态、空状态
- **复杂业务组件**: 表格、表单、日期选择器、时间选择器、文件上传
- **无障碍组件**: 所有需要无障碍支持的交互组件

#### 允许自定义的组件类型
- **业务特定组件**: 聊天消息组件、智能体卡片组件、CAD分析器组件、图像编辑器组件
- **复合组件**: 页面布局组件、数据展示组件、业务流程组件
- **包装组件**: 基于成熟库的包装组件

### 🔵 脚本安全规范 (优先级: 绝对遵守)

#### 1. 代码修改禁令 ⭐⭐⭐
- **禁止脚本修改**: 严格禁止任何脚本自动修改现有代码文件
- **只读操作**: 脚本只能进行读取、分析、检查等只读操作
- **人工确认**: 所有代码修改必须经过人工确认和审查
- **安全优先**: 代码安全性优于自动化便利性

#### 2. 脚本操作限制 ⭐⭐⭐
- **只允许检查**: 脚本只能进行代码质量检查、分析、报告
- **禁止写入**: 严格禁止脚本向代码文件写入内容
- **禁止删除**: 严格禁止脚本删除代码文件或内容
- **禁止替换**: 严格禁止脚本替换代码文件内容

#### 3. 允许的脚本操作
```bash
# ✅ 允许：代码质量检查
npm run type:check
npm run lint
npm run test

# ✅ 允许：代码分析
npm run analyze
npm run coverage
npm run performance

# ✅ 允许：配置检查
npm run config:check
npm run db:check
```

### 🟠 代码质量标准 (优先级: 严格遵守)

#### 质量指标要求
- **自定义代码占比**: < 20%
- **单元测试覆盖率**: ≥ 80%
- **集成测试覆盖率**: ≥ 60%
- **关键业务逻辑覆盖率**: ≥ 90%
- **代码重复率**: < 3%
- **圈复杂度**: < 10

#### 代码规范要求
```typescript
// ✅ 正确的代码风格
export interface UserProps {
  id: string
  name: string
  email: string
}

export function UserCard({ id, name, email }: UserProps) {
  // 单一职责，清晰逻辑
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{email}</p>
      </CardContent>
    </Card>
  )
}

// ❌ 禁止的代码风格
export function BadComponent(props: any) { // 禁止any类型
  // 复杂逻辑，多职责
  // 重复代码
  // 无类型检查
}
```

完整规则参考: [PROJECT_RULES.md](./PROJECT_RULES.md)

## 🛠️ 常用开发命令

### 基础开发
```bash
# 启动开发服务器
npm run dev                    # 端口: 3000
npm run build                  # 构建生产版本
npm run start                  # 启动生产服务器

# 代码质量检查
npm run check-code             # lint + typecheck + format:check
npm run lint                   # ESLint 检查
npm run check-types           # TypeScript 类型检查
npm run format                 # Prettier 格式化
npm run fix-code               # 自动修复代码问题
```

### 测试相关
```bash
npm test                       # 运行所有测试
npm run test:unit             # 单元测试
npm run test:integration      # 集成测试
npm run test:e2e              # 端到端测试
npm run test:coverage         # 生成覆盖率报告
npm run test:watch           # 监听模式运行测试
```

### 数据库操作
```bash
npm run check-db              # 数据库连接检查
npm run db:optimize          # 数据库优化
npm run db:backup            # 数据库备份
npm run db:migrate           # 数据库迁移
npm run db:monitor           # 数据库监控
```

### 环境配置
```bash
npm run check-config          # 环境配置检查
npm run setup:all            # 设置所有环境
npm run setup:dev            # 开发环境设置
npm run setup:test           # 测试环境设置
npm run setup:production    # 生产环境设置
```

### 质量检查
```bash
npm run check:custom-ratio   # 自定义代码占比检查
npm run check:rules         # 规则一致性检查
npm run script:check        # 脚本安全检查
npm run check:cross-platform # 跨平台兼容性检查
```

## 🏗️ 架构概览

### 技术架构
- **前端**: Next.js 15 (App Router) + React 18 + TypeScript 5
- **UI库**: shadcn/ui (基于 Radix UI) + Ant Design + Tailwind CSS
- **状态管理**: React Context API + Zustand
- **后端**: Next.js API Routes + PostgreSQL + Sequelize
- **缓存**: Redis + 本地存储
- **部署**: Docker + Docker Compose

### 目录结构
```
ai-chat-interfacess/
├── app/                      # Next.js App Router
│   ├── (user)/              # 用户端页面 (独立于管理端)
│   │   ├── chat/           # 聊天界面
│   │   ├── history/        # 历史记录
│   │   └── settings/       # 用户设置
│   ├── admin/              # 管理后台
│   ├── api/                # API 路由
│   ├── layout.tsx          # 根布局
│   └── page.tsx            # 重定向到 /user/chat
├── components/              # React 组件
│   ├── ui/                 # shadcn/ui 组件
│   ├── shared/             # 共享业务组件
│   ├── chat/               # 聊天相关组件
│   ├── voice/              # 语音相关组件
│   ├── image-editor/       # 图像编辑器
│   └── cad-analyzer/       # CAD 分析器
├── lib/                    # 核心库
│   ├── api/                # API 工具
│   ├── config/             # 配置管理
│   ├── services/           # 业务服务
│   ├── storage/            # 存储管理
│   └── utils/              # 工具函数
├── types/                  # TypeScript 类型定义
├── hooks/                  # 自定义 Hooks
├── scripts/                # 工具脚本
├── config/                 # 配置文件
├── __tests__/              # 测试文件
└── docker-compose.yaml     # Docker 配置
```

### 用户端分离架构
项目已完成用户端与管理端的物理分离:
- **用户端**: `/user` 路径，包含聊天、历史、设置等功能
- **管理端**: `/admin` 路径，功能保持不变
- **入口**: 主页自动重定向到 `/user/chat`

## 🤖 智能体系统

### 智能体类型区分
- **FastGPT 智能体**: 数据源为 FastGPT API，对话内容通过 API 分页拉取，不在本地存储
- **自研智能体** (CAD分析器、图像编辑器等): 业务数据本地存储，API 全量可控

### 数据存储策略
- **平台数据库**: 只存智能体配置、用户、权限、调用日志等平台级数据
- **FastGPT 智能体**: 不在本地存储对话内容，前端可用 localStorage/IndexedDB 短期缓存
- **自研智能体**: 所有数据本地存储，支持全量增删改查、审计、导出

## 🎯 核心功能模块

### 1. 聊天系统
- **多智能体支持**: 通用助手、图像编辑器、CAD分析器
- **多模态交互**: 文本、图像、文件、语音输入
- **消息管理**: 编辑、删除、重新生成、点赞/点踩反馈
- **对话历史**: 分页加载、搜索、标签筛选、批量操作
- **流式响应**: 支持 SSE (Server-Sent Events)

### 2. 语音功能
- **语音输入**: 支持移动端和桌面端，最长 60 秒录音
- **ASR 服务**: 支持阿里云、硅基流动等厂商切换
- **TTS 播放**: AI 回复一键语音播放
- **全链路反馈**: 录音、识别、错误、进度完整提示

### 3. 图像编辑器
- **功能**: 图片上传、画笔绘制、坐标标记、参考图上传
- **技术**: Canvas 绘图 + 后端保存，返回可访问 URL
- **路径**: `/image-editor` 独立页面

### 4. CAD 分析器
- **功能**: CAD 图纸分析、安防设备识别、报告生成
- **技术**: AI 图像分析 + 结构化报告输出
- **路径**: `/admin/cad-analyzer-history` 历史管理

### 5. 管理后台
- **智能体管理**: 创建、编辑、删除智能体配置
- **API 配置**: FastGPT 接口设置、语音服务配置
- **数据库管理**: 备份、优化、监控
- **用户管理**: 权限控制、使用统计

## 🔧 环境配置

### 必需环境变量
```bash
# FastGPT API 配置
NEXT_PUBLIC_FASTGPT_APP_ID=your_app_id
NEXT_PUBLIC_FASTGPT_API_KEY=your_api_key
NEXT_PUBLIC_FASTGPT_API_URL=https://zktecoaihub.com/api/v1/chat/completions

# 语音识别服务
OPENAI_AUDIO_API_URL=https://api.openai.com/v1/audio/transcriptions
OPENAI_AUDIO_API_KEY=your_audio_api_key

# 数据库配置
POSTGRES_USER=root
POSTGRES_PASSWORD=ZKTeco##123
POSTGRES_DB=agent_config
POSTGRES_HOST=localhost
POSTGRES_PORT=5452
```

### Docker 部署
```bash
# 克隆并部署
git clone https://github.com/zqqzqqz/ai-chat-interface.git
cd ai-chat-interface
chmod +x deploy.sh
./deploy.sh

# 访问: http://localhost:3009
```

## 📦 组件库使用规范

### 优先级顺序 (严格遵守)
1. **shadcn/ui** (最高): 基础 UI 组件 - Button, Input, Card, Dialog 等
2. **Ant Design** (补充): 复杂业务组件 - Table, Form, DatePicker, Upload 等
3. **Radix UI** (无障碍): AlertDialog, DropdownMenu 等无障碍组件

### 禁止自定义的组件类型
- 基础 UI 组件 (按钮、输入框、选择器等)
- 复杂业务组件 (表格、表单、日期选择器等)

### 允许自定义的组件类型
- 业务特定组件 (聊天消息、智能体卡片等)
- 复合组件 (页面布局、数据展示等)

## 🧪 测试架构

### 测试分层
- **单元测试** (`__tests__/components/`): 组件功能测试
- **集成测试** (`__tests__/api/`): API 接口测试
- **端到端测试** (`__tests__/e2e/`): 完整流程测试
- **安全测试** (`__tests__/api/security/`): 安全性验证
- **性能测试** (`__tests__/api/performance/`): 性能指标测试

### 测试要求
- 单元测试覆盖率 ≥ 80%
- 集成测试覆盖率 ≥ 60%
- 关键业务逻辑覆盖率 ≥ 90%
- 自定义代码占比 < 20%

## 🛡️ 安全规范

### 输入验证
- 使用 Zod 进行严格的数据验证
- 防止 XSS 注入攻击
- API 密钥安全存储和环境变量管理

### 错误处理
- 统一的错误处理中间件
- 友好的错误提示
- 自动重试机制

### 数据保护
- 本地存储加密
- 敏感信息脱敏显示
- 权限验证机制

## ⚡ 性能要求

### 前端性能
- 首屏加载时间 < 3 秒
- API 响应时间 < 500ms
- 内存使用率 < 80%
- 包体积增长 < 10%

### 优化策略
- 代码分割和懒加载
- 组件记忆化 (memo)
- 虚拟滚动长列表
- 图片优化和懒加载

## 🔄 开发工作流程

### 🔴 工作流程规则 (优先级: 绝对遵守)

#### 1. 任务模式规范
- **任务模式**: Understand → Plan (with parallelization analysis) → TodoWrite(3+ tasks) → Execute → Track → Validate
- **批量操作**: 总是并行工具调用，仅在依赖时串行
- **验证门限**: 执行前验证，完成后验证
- **质量检查**: 任务完成前运行lint/typecheck
- **上下文保持**: 跨操作保持≥90%理解
- **基于证据**: 所有声明必须通过测试或文档验证

#### 2. 会话生命周期
- **会话模式**: /sc:load → Work → Checkpoint (30min) → /sc:save
- **检查点触发器**: 任务完成、30分钟间隔、风险操作
- **上下文保留**: 保持项目跨会话理解

#### 3. 开发前检查清单
- [ ] 阅读相关规则文档
- [ ] 检查现有组件库支持
- [ ] 评估自定义代码占比
- [ ] 确认测试覆盖率要求
- [ ] 验证安全规范遵循

#### 4. 开发中规范
- 优先使用成熟组件库
- 遵循单一职责原则
- 保持代码风格一致
- 及时编写测试

#### 5. 提交前检查
```bash
npm run check-code              # 代码质量检查
npm run test:coverage         # 测试覆盖率检查
npm run check:custom-ratio   # 自定义代码占比检查
```

### 🟡 测试规范 (优先级: 严格遵守)

#### 测试覆盖率要求
- **单元测试覆盖率**: ≥ 80%
- **集成测试覆盖率**: ≥ 60%
- **关键业务逻辑覆盖率**: ≥ 90%

#### 测试分层
- **单元测试** (`__tests__/components/`): 组件功能测试
- **集成测试** (`__tests__/api/`): API 接口测试
- **端到端测试** (`__tests__/e2e/`): 完整流程测试
- **安全测试** (`__tests__/api/security/`): 安全性验证
- **性能测试** (`__tests__/api/performance/`): 性能指标测试

#### 测试示例
```typescript
// ✅ 组件测试示例
import { render, screen } from '@testing-library/react'
import { UserCard } from '@/components/UserCard'

describe('UserCard', () => {
  it('should render user information correctly', () => {
    const user = { id: '1', name: 'John Doe', email: 'john@example.com' }

    render(<UserCard {...user} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })
})
```

### 🔵 安全规范 (优先级: 绝对遵守)

#### 输入验证
```typescript
// ✅ 使用Zod进行严格验证
const UserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().min(0).max(150)
})

export function validateUser(data: unknown) {
  return UserSchema.parse(data)
}
```

#### 敏感信息管理
- **API密钥**: 必须放在.env文件中
- **密码**: 必须加密存储
- **用户数据**: 必须进行权限验证

#### 错误处理规范
```typescript
// ✅ 统一错误处理
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ✅ 错误处理中间件
export function errorHandler(error: Error) {
  if (error instanceof ApiError) {
    return { code: error.code, message: error.message }
  }
  return { code: 'UNKNOWN_ERROR', message: '未知错误' }
}
```

### 🟠 性能规范 (优先级: 严格遵守)

#### 前端性能要求
- **首屏加载时间**: < 3秒
- **API响应时间**: < 500ms
- **内存使用率**: < 80%
- **包体积增长**: < 10%

#### 性能优化策略
```typescript
// ✅ 代码分割
const LazyComponent = lazy(() => import('./LazyComponent'))

// ✅ 记忆化
const MemoizedComponent = memo(Component)

// ✅ 虚拟滚动
import { FixedSizeList as List } from 'react-window'
```

### 🟢 Git工作流程 (优先级: 绝对遵守)

#### Git规范
- **状态检查**: 每次会话开始运行 `git status` 和 `git branch`
- **功能分支**: 所有工作必须在功能分支上，绝不在main/master上工作
- **增量提交**: 频繁提交，有意义的提交信息，避免巨型提交
- **提交验证**: 提交前总是 `git diff` 检查更改
- **恢复点**: 风险操作前提交以便回滚
- **实验分支**: 使用分支安全测试不同方法
- **清洁历史**: 使用描述性提交信息，避免"fix"、"update"、"changes"

#### 正确的Git工作流程
```bash
# ✅ 正确
git checkout -b feature/auth    # 创建功能分支
git add .                       # 添加更改
git commit -m "feat: add JWT authentication middleware" # 描述性提交
git push origin feature/auth    # 推送到远程
```

#### 错误的Git工作流程
```bash
# ❌ 错误
# 直接在main/master分支上工作
git commit -m "fix"              # 无意义的提交信息
git commit -am "changes"        # 巨型提交
```

### 📦 文件组织规范 (优先级: 严格遵守)

#### 文件创建原则
- **先思考后写入**: 创建文件前先考虑合适的位置
- **Claude专用文档**: 报告、分析、摘要放在`claudedocs/`目录
- **测试组织**: 所有测试放在`tests/`、`__tests__/`或`test/`目录
- **脚本组织**: 工具脚本放在`scripts/`、`tools/`或`bin/`目录
- **检查现有模式**: 创建新文件前先查找现有的测试/脚本目录
- **禁止分散测试**: 绝不在源文件旁创建test_*.py或*.test.js
- **禁止随机脚本**: 绝不在随机位置创建debug.sh、script.py、utility.js

#### 正确的文件组织
```
✅ 正确:
tests/auth.test.js
scripts/deploy.sh
claudedocs/analysis.md

❌ 错误:
auth.test.js (在源文件旁)
debug.sh (在项目根)
script.py (随机位置)
```

### 🔧 工具优化规范 (优先级: 严格遵守)

#### 工具选择矩阵
| 任务类型 | 最佳工具 | 替代工具 |
|---------|---------|---------|
| 多文件编辑 | MultiEdit | 单独Edit |
| 复杂分析 | Sequential MCP | 原生推理 |
| UI组件 | Magic MCP | 手动编码 |
| 符号操作 | Serena MCP | 手动搜索 |
| 模式编辑 | Morphllm MCP | 单独编辑 |
| 文档 | Context7 MCP | Web搜索 |
| 浏览器测试 | Playwright MCP | 单元测试 |

#### 并行执行原则
- **并行一切**: 执行独立操作时并行，绝不串行
- **批量读取**: 使用MultiRead而非单独Read调用
- **智能批处理**: 按操作类型批量处理

### 🛡️ 安全规则 (优先级: 绝对遵守)

#### 框架尊重
- **依赖检查**: 使用库前检查package.json/deps
- **模式遵循**: 遵循现有项目约定和导入样式
- **事务安全**: 优先选择具有回滚能力的批量操作

#### 临时感知
- **日期验证**: 任何时间引用前检查<env>上下文中的"今日日期"
- **禁止假设**: 不要默认从知识截止日期或2025年1月开始
- **明确时间引用**: 始终说明日期和时间信息的来源
- **版本上下文**: 讨论"最新"版本时始终对照当前日期验证

## 📚 重要参考文档

- [PROJECT_RULES.md](./PROJECT_RULES.md) - 项目核心开发规则
- [README.md](./README.md) - 项目详细介绍和使用指南
- [docs/](./docs/) - 各功能模块详细文档

## 🎯 质量保证体系

### 🔴 代码质量检查清单

#### 开发前检查
- [ ] 阅读相关规则文档
- [ ] 检查现有组件库支持
- [ ] 评估自定义代码占比
- [ ] 确认测试覆盖率要求
- [ ] 验证安全规范遵循

#### 组件选择检查
- [ ] 优先使用shadcn/ui组件
- [ ] 复杂组件使用Ant Design
- [ ] 无障碍组件使用Radix UI
- [ ] 避免重复造轮子
- [ ] 自定义代码占比 < 20%

#### 组件实现检查
- [ ] 使用成熟库的API
- [ ] 保持主题一致性
- [ ] 确保无障碍支持
- [ ] 遵循设计系统
- [ ] 性能优化合理

#### 组件测试检查
- [ ] 单元测试覆盖
- [ ] 集成测试覆盖
- [ ] 无障碍测试通过
- [ ] 性能测试通过
- [ ] 视觉回归测试通过

### 🟡 自动化检查命令

#### 代码质量检查
```bash
# 代码质量检查
npm run check-code

# 自定义代码占比检查
npm run check:custom-ratio

# 环境配置检查
npm run check:config

# 数据库连接检查
npm run check:db

# 规则一致性检查
npm run check:rules
```

#### 测试和质量验证
```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 生成覆盖率报告
npm run test:coverage

# 端到端测试
npm run test:e2e
```

#### 性能和安全检查
```bash
# 性能测试
npm run test:performance

# 安全扫描
npm run security:scan

# 跨平台兼容性检查
npm run check:cross-platform

# 类型安全检查
npm run check-types
```

### 🟠 专业标准规范

#### 诚信标准
- **禁止营销语言**: 绝不使用" blazingly fast"、"100% secure"、"magnificent"、"excellent"
- **禁止虚假指标**: 绝不编造时间估算、百分比、评分等无依据数据
- **关键评估**: 提供诚实的权衡分析和潜在问题
- **合理反驳**: 在需要时礼貌地指出提议的问题
- **基于证据的声明**: 所有技术声明必须可验证，不是推测
- **避免谄媚行为**: 停止过度赞美，提供专业反馈
- **现实评估**: 声明"untested"、"MVP"、"needs validation" - 而非"production-ready"

#### 工作空间卫生
- **操作后清理**: 删除操作完成后的临时文件、脚本和目录
- **无工件污染**: 删除构建工件、日志和调试输出
- **临时文件管理**: 任务完成前清理所有临时文件
- **专业工作空间**: 保持清洁的项目结构，无杂乱
- **会话结束清理**: 会话结束前删除任何临时资源
- **版本控制卫生**: 绝不提交可能被意外提交的临时文件
- **资源管理**: 删除未使用的目录和文件以防止工作空间膨胀

#### 失败调查
- **根本原因分析**: 总是调查失败发生的原因，而不仅仅是失败的事实
- **绝不跳过测试**: 绝不禁用、注释或跳过测试以获得结果
- **绝不跳过验证**: 绝不绕过质量检查或验证以使事情正常工作
- **系统化调试**: 退后一步，评估错误消息，彻底调查工具故障
- **修复不要变通**: 解决根本问题，而不仅仅是症状
- **工具故障调查**: 当MCP工具或脚本失败时，在切换方法之前进行调试
- **质量完整性**: 绝不为短期结果妥协系统完整性

### 📊 项目目标指标

#### 短期目标 (3个月)
- 完成核心功能开发
- 达到生产级别质量
- 完成性能优化
- 建立完整的测试体系

#### 中期目标 (6个月)
- 支持更多智能体类型
- 实现高级分析功能
- 优化用户体验
- 建立监控体系

#### 长期目标 (1年)
- 成为行业标杆产品
- 支持大规模部署
- 建立生态体系
- 实现商业化运营

## 🐛 常见问题与解决方案

### 开发环境问题
- **端口冲突**: 检查 3000/3009/5452 端口占用
- **数据库连接**: 确认 PostgreSQL 服务启动
- **API 调用失败**: 检查 FastGPT API 密钥配置

### 部署问题
- **Docker 构建失败**: 检查 Dockerfile 和 docker-compose.yaml
- **环境变量缺失**: 确认 .env 文件配置
- **数据库迁移失败**: 运行 `npm run db:migrate`

### 代码质量问题
- **TypeScript 错误**: 运行 `npm run check-types` 检查类型错误
- **ESLint 警告**: 运行 `npm run lint` 检查代码风格
- **测试覆盖率低**: 运行 `npm run test:coverage` 查看覆盖率

### 性能问题
- **首屏加载慢**: 检查代码分割和懒加载实现
- **API 响应慢**: 检查数据库查询和缓存策略
- **内存占用高**: 检查组件记忆化和虚拟滚动实现

## ⚠️ 重要提醒

### 🔴 绝对遵守的原则
1. **成熟库优先**: 优先使用成熟组件库，自定义代码占比 < 20%
2. **全局一致性**: 确保配置、错误处理、API 设计全局一致
3. **代码质量**: 零容忍错误，严格类型检查
4. **性能优化**: 代码分割、懒加载、缓存策略
5. **安全防护**: 输入验证、输出编码、权限控制

### 🟡 严格禁止的行为
1. **脚本修改代码**: 严格禁止任何脚本自动修改现有代码文件
2. **使用 any 类型**: 绝对禁止在 TypeScript 中使用 any 类型
3. **重复造轮子**: 优先使用现有解决方案，避免重复实现
4. **直接在 main/master 工作**: 必须使用功能分支进行开发
5. **提交无意义信息**: 使用描述性提交信息，避免"fix"、"update"

### 🟢 推荐的最佳实践
1. **组件库优先**: shadcn/ui → Ant Design → Radix UI
2. **类型安全**: 统一类型定义，避免重复定义
3. **测试驱动**: 先写测试，再实现功能
4. **性能优化**: 代码分割、懒加载、缓存策略
5. **安全编码**: 输入验证、错误处理、权限控制

---

## 🎯 最终准则

**核心理念**: 好的代码是设计出来的，不是改出来的。优先使用成熟解决方案，确保项目高质量交付。

**开发原则**:
- 设计 > 实现 > 测试 > 部署
- 质量 > 速度
- 安全 > 便利
- 可维护性 > 功能

**记住**: 严格遵守所有规则，确保代码质量和项目成功。每次开发前先阅读相关规则，开发中严格遵循，开发后全面检查。

**最后更新**: 2025-09-13
**版本**: v2.0.0
**维护者**: 开发团队