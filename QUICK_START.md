# AI Chat Interface 快速开始指南

## 🚀 一键设置

### 1. 环境准备

```bash
# 1. 复制环境变量模板
cp env.template .env

# 2. 编辑环境变量（必需）
# 编辑 .env 文件，至少配置以下变量：
# - NODE_ENV=development
# - JWT_SECRET=your_jwt_secret_here
# - DB_HOST=localhost
# - DB_NAME=ai_chat
# - DB_USER=postgres
# - DB_PASSWORD=your_password_here
```

### 2. 一键设置所有环境

```bash
npm run setup:all
```

### 3. 启动开发服务器

```bash
npm run dev
```

## 📋 分步设置

如果一键设置遇到问题，可以分步执行：

### 步骤1：检查环境配置

```bash
npm run setup:env
```

### 步骤2：设置文件系统

```bash
npm run setup:files
```

### 步骤3：设置数据库

```bash
npm run setup:db
```

### 步骤4：设置测试环境

```bash
npm run setup:test
```

### 步骤5：设置生产环境

```bash
npm run setup:production
```

## 🔧 环境特定设置

### 开发环境

```bash
npm run setup:dev
```

### 测试环境

```bash
npm run setup:test
```

### 生产环境

```bash
npm run setup:prod
```

## 📊 检查和管理

### 环境检查

```bash
# 检查环境配置
npm run setup:env

# 检查数据库
npm run db:check

# 检查文件权限
npm run setup:files -- --report
```

### 测试运行

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 运行E2E测试
npm run test:e2e
```

### 代码质量检查

```bash
# 代码质量检查
npm run check-code

# 类型检查
npm run type:check

# 代码规范检查
npm run lint
```

## 🚀 部署

### 开发部署

```bash
npm run dev
```

### 生产部署

```bash
# 1. 部署前检查
npm run deploy:check

# 2. 生产环境部署
npm run deploy:production
```

### Docker 部署

```bash
# 使用 Docker Compose
docker-compose -f docker-compose.production.yml up -d
```

## 📁 项目结构

```
ai-chat-interfacess/
├── scripts/                    # 环境设置脚本
│   ├── check-environment.ts    # 环境检查
│   ├── setup-database.ts       # 数据库设置
│   ├── setup-file-system.ts    # 文件系统设置
│   ├── setup-test-environment.ts # 测试环境设置
│   ├── setup-production.ts     # 生产环境设置
│   └── setup-all-environments.ts # 综合环境设置
├── env.template               # 环境变量模板
├── SETUP_GUIDE.md            # 详细设置指南
├── QUICK_START.md            # 快速开始指南
└── docs/                     # 项目文档
    └── 项目全局梳理分析/
        ├── TODO_全局代码梳理分析.md
        └── 环境配置完成报告.md
```

## 🆘 故障排除

### 常见问题

1. **环境变量未设置**

   ```bash
   # 检查环境变量
   npm run setup:env
   ```

2. **数据库连接失败**

   ```bash
   # 检查数据库配置
   npm run db:check
   ```

3. **文件权限错误**

   ```bash
   # 修复文件权限
   npm run setup:files
   ```

4. **测试失败**
   ```bash
   # 重新设置测试环境
   npm run setup:test
   ```

### 调试模式

```bash
# 详细输出模式
npm run setup:all -- --verbose

# 生成详细报告
npm run setup:env -- --report
npm run setup:files -- --report
```

### 查看报告

- 环境检查报告：`environment-check-report.md`
- 文件系统报告：`file-system-report.md`
- 测试报告：`test-environment-report.md`
- 安全报告：`production-security-report.md`
- 设置报告：`setup-report.md`

## 📞 支持

如有问题，请参考：

1. 详细设置指南：`SETUP_GUIDE.md`
2. 项目文档：`docs/` 目录
3. 环境配置报告：`docs/项目全局梳理分析/环境配置完成报告.md`

---

**版本**：1.0.0  
**最后更新**：2024年12月19日  
**状态**：✅ 环境配置和部署系统已全部实现
