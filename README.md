# NeuroGlass AI Chat Interface

## Docker 一键部署指南

### 前提条件

- 安装 [Docker](https://docs.docker.com/get-docker/)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/)
- Git

### 部署步骤

1. 克隆仓库：
   ```bash
   git clone https://github.com/zqqzqqz/ai-chat-interface.git
   cd ai-chat-interface
   ```

2. 创建环境变量文件（可选）：
   ```bash
   cp .env.example .env
   ```
   根据需要编辑 `.env` 文件中的数据库配置。

3. 运行部署脚本：
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. 访问应用：
   打开浏览器，访问 http://localhost:3000

### 手动部署

如果不使用部署脚本，可以手动执行以下命令：

```bash
# 构建并启动容器
docker-compose up -d --build

# 初始化数据库
docker-compose exec app npx ts-node scripts/check-db.ts
```

### 环境变量配置

可以通过 `.env` 文件或直接在 `docker-compose.yaml` 中配置以下环境变量：

- `POSTGRES_USER`: 数据库用户名（默认：root）
- `POSTGRES_PASSWORD`: 数据库密码（默认：ZKTeco##123）
- `POSTGRES_DB`: 数据库名称（默认：agent_config）
- `POSTGRES_HOST`: 数据库主机（默认：db）
- `POSTGRES_PORT`: 数据库端口（默认：5432）

### 数据备份与恢复

备份数据库：
```bash
docker-compose exec db pg_dump -U root agent_config > backup_$(date +%Y%m%d%H%M%S).sql
```

恢复数据库：
```bash
docker-compose exec -T db psql -U root agent_config < backup_file.sql
```

<div align="center">
  <img src="/placeholder.svg?height=120&width=120&query=NeuroGlass Logo" alt="NeuroGlass Logo" width="120" />
  <h3>智能对话平台 | Intelligent Conversation Platform</h3>
</div>

[English](#english) | [中文](#chinese)

---

<a id="chinese"></a>

## 中文文档

### 项目概述

NeuroGlass 是一个功能强大的跨平台 AI 对话系统，集成了多种智能体类型，支持多模态交互，并提供了丰富的用户体验功能。系统基于 FastGPT API 构建，支持在线和离线模式，确保用户在各种网络环境下都能获得流畅的使用体验。

### 主要功能

#### 核心功能

- **多智能体支持**：系统内置多种专业智能体，包括通用助手、图像编辑器和 CAD 分析器
- **多模态交互**：支持文本、图像、文件等多种输入方式
- **在线/离线模式**：自动检测网络状态，在网络不可用时切换到离线模式
- **消息管理**：支持消息编辑、删除和重新生成
- **对话历史**：保存和加载历史对话记录
- **文件上传**：支持上传图片和文档文件
- **语音输入**：支持语音录制和转文本功能
- **多语言支持**：内置多种语言界面，包括中文、英文、日语等

#### 智能体类型

1. **通用助手**：
   - 回答问题和提供信息
   - 支持上下文对话
   - 提供建议问题
   - 支持流式响应

2. **图像编辑器**：
   - 上传和编辑图像
   - 提供画笔和坐标标记工具
   - 支持参考图片上传
   - 保存编辑后的图像

3. **CAD 分析器**：
   - 分析 CAD 图纸和图像
   - 识别安防设备布局
   - 生成专业分析报告
   - 支持多种文件格式

#### 用户体验功能

- **响应式设计**：适配桌面和移动设备
- **暗色/亮色模式**：自动适应系统主题或手动切换
- **消息反馈**：点赞/点踩功能
- **代码高亮**：支持多种编程语言的代码块高亮
- **Markdown 渲染**：支持富文本格式化
- **网络状态指示器**：实时显示 API 连接状态
- **设置面板**：自定义 API 配置和界面语言

### 系统架构

#### 前端架构

- **框架**：Next.js (App Router)
- **UI 库**：shadcn/ui + Tailwind CSS
- **状态管理**：React Context API
- **国际化**：自定义 i18n 实现

#### 后端集成

- **API 代理**：内置代理服务器避免 CORS 问题
- **流式响应**：支持 SSE (Server-Sent Events) 处理
- **本地存储**：优化的本地存储管理系统
- **离线模式**：网络不可用时的回退机制

#### 安全特性

- **输入验证**：防止 XSS 和注入攻击
- **API 密钥保护**：安全存储和掩码显示
- **错误恢复**：自动重试和错误处理机制
- **数据隐私**：本地存储加密

### 安装与设置

1. 克隆仓库：
   \`\`\`bash
   git clone https://github.com/yourusername/neuroglass-ai.git
   cd neuroglass-ai
   \`\`\`

2. 安装依赖：
   \`\`\`bash
   npm install
   \`\`\`

3. 配置环境变量：
   创建 `.env.local` 文件并添加以下内容：
   \`\`\`
   NEXT_PUBLIC_FASTGPT_APP_ID=your_app_id
   NEXT_PUBLIC_FASTGPT_API_KEY=your_api_key
   NEXT_PUBLIC_FASTGPT_API_URL=https://zktecoaihub.com/api/v1/chat/completions
   \`\`\`

4. 启动开发服务器：
   \`\`\`bash
   npm run dev
   \`\`\`

5. 构建生产版本：
   \`\`\`bash
   npm run build
   npm start
   \`\`\`

### 使用指南

#### 基本使用

1. **选择智能体**：从左侧边栏选择合适的智能体类型
2. **发送消息**：在底部输入框中输入文本或使用语音输入
3. **上传文件**：点击回形针图标上传图片或文档
4. **查看历史**：点击右上角历史图标查看对话历史
5. **管理消息**：悬停在消息上可以编辑、删除或重新生成

#### 高级功能

1. **离线模式**：
   - 系统会自动检测网络状态
   - 网络不可用时自动切换到离线模式
   - 恢复连接后可以继续在线对话

2. **图像编辑**：
   - 选择"图像编辑器"智能体
   - 上传需要编辑的图片
   - 使用画笔工具进行编辑
   - 使用坐标标记工具标记关键点
   - 保存编辑后的图片

3. **CAD 分析**：
   - 选择"CAD 分析器"智能体
   - 上传 CAD 图纸或图片
   - 系统自动分析安防设备布局
   - 查看和下载分析报告

### 配置选项

#### API 配置

- **API 端点**：FastGPT API 的 URL
- **API 密钥**：访问 API 的授权密钥
- **应用 ID**：FastGPT 应用的唯一标识符

#### 智能体配置

- **系统提示词**：定义智能体的行为和专业知识
- **温度**：控制响应的随机性
- **最大令牌数**：控制响应的最大长度
- **流式响应**：启用/禁用实时流式输出

#### 界面设置

- **语言**：选择界面语言
- **主题**：选择亮色或暗色主题
- **文件上传**：启用/禁用文件上传功能

### 管理员功能

- **智能体管理**：创建、编辑和删除智能体
- **发布状态**：控制智能体的可见性
- **高级设置**：配置多模态模型和系统提示词

### 故障排除

#### 常见问题

1. **API 连接失败**：
   - 检查 API 密钥和应用 ID 是否正确
   - 确认网络连接状态
   - 查看浏览器控制台中的错误信息

2. **消息未显示**：
   - 检查是否处于离线模式
   - 尝试刷新页面
   - 清除浏览器缓存

3. **文件上传失败**：
   - 确认文件格式是否支持
   - 检查文件大小是否超过限制
   - 尝试使用不同的浏览器

#### 联系支持

如果您遇到无法解决的问题，请通过以下方式联系我们：

- 电子邮件：support@zktecoaihub.com
- 问题报告：https://github.com/yourusername/neuroglass-ai/issues

### 智能体数据分层与最佳实践

### 智能体类型区分
- 每个智能体配置（agent_config）包含 type 字段：
  - `fastgpt`：数据源为 FastGPT API，所有对话/历史/消息仅通过 API 分页拉取，不在本地数据库存储。
  - `cad-analyzer`、`image-editor` 等自研类型：所有业务数据（如 CAD 文件、分析结果、用户交互历史等）本地数据库存储，API 全量可控。

### 数据存储策略
- **平台数据库**：
  - 只存智能体配置、用户、权限、调用日志等平台级数据。
  - 自研智能体业务数据（如 CAD 解读历史、分析结果等）全部本地存储。
- **FastGPT 智能体**：
  - 不在本地数据库存储对话内容，所有历史/消息通过 FastGPT API 分页拉取。
  - 前端（H5/APP/PC）可用 localStorage/IndexedDB 做短期缓存，提升体验，断网/刷新后自动失效或定期清理。

### 前端数据流
- 统一智能体入口，根据 type 自动切换数据源和 API 路径。
- fastgpt 智能体：只做本地缓存，主数据全靠 FastGPT。
- 自研智能体：所有数据本地存储，支持全量增删改查、审计、导出等。

### 未来扩展
- 自研智能体可随时扩展新表/新功能，如图像标注、语音分析等。
- 平台可统一管理所有智能体配置、权限、调用日志，便于运维和合规。

### 语音输入功能说明

#### 功能简介
- 支持用户通过语音录音输入，自动识别为文本并发送给智能体。
- 适配移动端与桌面端，支持暗色/亮色主题。
- 识别失败、网络异常等均有友好提示，支持重试。

#### 技术实现
- 前端：`components/ui/voice-recorder.tsx` 负责录音、上传、识别、UI反馈。
- 对话输入集成：`components/chat-input.tsx`，点击麦克风按钮弹出录音UI。
- 后端API：`app/api/voice-to-text/route.ts`，调用阿里云ASR接口。
- 环境变量：
  - `ALIYUN_APP_KEY`
  - `ALIYUN_ACCESS_KEY_ID`
  - `ALIYUN_ACCESS_KEY_SECRET`

#### 响应式与主题适配
- 采用 Tailwind CSS 响应式类，自动适配桌面与移动端。
- 颜色、按钮、背景等自动适配暗色/亮色主题。

#### 消息反馈与错误恢复
- 录音、识别、错误、进度全链路提示。
- 识别失败、网络异常等均有明确提示，允许用户重试。
- 录音完成可回放音频。

#### 管理后台配置
- 管理员可在后台设置中开启/关闭语音输入功能。
- 相关配置项：
  - 是否启用语音输入
  - 选择ASR服务类型（如阿里云、硅基流动等）
  - 配置ASR服务密钥

#### 扩展建议
- 支持多语言识别、TTS语音合成、语音消息历史等。
- 完善API安全与异常监控。

---
如需详细开发/集成说明，请参考各功能模块源码注释。

---

## 主要功能与技术实现

### 1. 多智能体与多模态交互
- 支持通用助手、图像编辑器、CAD分析器等多类型智能体。
- FastGPT 智能体对接，支持文本、图片、文件、语音等多模态输入。

### 2. 语音输入与ASR厂商切换
- 前端语音录音组件，支持移动端/桌面端、暗色/亮色主题。
- 后端支持阿里云、硅基流动ASR厂商切换，管理员可在设置中选择。
- 语音识别全链路消息反馈、错误恢复机制健全。

### 3. 图像编辑器
- 图片上传、画笔、坐标标记、参考图上传、编辑后保存。
- 后端API支持图片与标记数据保存，返回可访问URL。

### 4. CAD分析器
- 支持CAD/图片上传，自动识别安防设备，生成分析报告。
- 前后端API闭环，支持报告下载。

### 5. 对话历史分页/搜索
- 支持关键词搜索、分页加载历史记录。
- 支持标签筛选、批量删除、标签编辑。

### 6. 消息反馈（点赞/点踩）
- 每条消息支持点赞/点踩，前端高亮，后端API记录反馈。

### 7. TTS语音合成
- 支持AI回复一键语音播放，提升无障碍与多模态体验。

### 8. 管理后台
- 智能体管理、API配置、语音输入开关、ASR厂商切换。

### 9. 安全与健壮性
- 输入验证、防XSS、API密钥保护、错误恢复、离线模式、本地存储加密。

---

## 代码结构梳理

- `components/`
  - `chat-input.tsx`：消息输入区，集成语音、文件、文本输入
  - `chat-history.tsx`：对话历史分页、搜索、标签、批量操作
  - `chat-message.tsx`：消息渲染，支持点赞/点踩、TTS播放
  - `image-editor/image-editor.tsx`：图像编辑器
  - `cad-analyzer/cad-analyzer-container.tsx`：CAD分析器
  - `ui/voice-recorder.tsx`：语音录音组件
  - `settings-dialog.tsx`：管理员设置面板，ASR厂商切换
- `app/api/`
  - `voice-to-text/route.ts`：语音识别API，支持多厂商
  - `image-editor/save/route.ts`：图片编辑保存API
  - `cad-analyzer/analyze/route.ts`：CAD分析API
  - `message-feedback/route.ts`：消息反馈API
- `app/image-editor/page.tsx`：图像编辑器页面
- `app/admin/cad-analyzer-history/`：CAD分析历史页面

---

## TTS语音合成功能说明
- 每条AI回复消息支持一键语音播放。
- 前端调用浏览器SpeechSynthesis API，支持多语言自动朗读。
- 可扩展为调用第三方TTS服务（如阿里云、讯飞等）。

---

## 快速开始
1. 克隆仓库并安装依赖
2. 配置环境变量（API密钥、ASR厂商等）
3. 启动开发或生产环境
4. 管理员后台可配置ASR厂商、语音输入开关等

---

如需详细开发/集成说明，请参考各功能模块源码注释。

## License

MIT License © 2023 ZKTeco AI Hub

## 用户端分离试点说明

本项目已完成用户端（/user 路由）与管理端的物理分离试点：
- 用户端页面、组件、状态、API 已独立于管理端，互不干扰
- 用户端入口：/user，首页自动跳转到 /user/chat
- 聊天、历史、设置等功能完整迁移，UI、配色、交互与原有一致
- 管理端暂未调整，功能不受影响
- 目录结构、开发规范已同步更新

如需开发或测试用户端功能，请在 app/user 及相关目录下进行。
