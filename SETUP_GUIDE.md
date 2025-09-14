# AI Chat Interface 环境设置指南

## 快速开始

### 1. 一键设置所有环境

```bash
npm run setup:all
```

### 2. 分步设置

#### 开发环境

```bash
npm run setup:dev
```

#### 测试环境

```bash
npm run setup:test
```

#### 生产环境

```bash
npm run setup:prod
```

## 详细设置步骤

### 1. 环境变量配置

#### 复制环境变量模板

```bash
cp env.template .env
```

#### 编辑 .env 文件

```bash
# 必需配置
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
DB_HOST=localhost
DB_NAME=ai_chat
DB_USER=postgres
DB_PASSWORD=your_password_here

# 可选配置
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
MAX_FILE_SIZE=10485760
```

### 2. 数据库设置

#### 安装PostgreSQL

- Windows: 下载并安装 PostgreSQL
- macOS: `brew install postgresql`
- Linux: `sudo apt-get install postgresql`

#### 创建数据库

```sql
CREATE DATABASE ai_chat;
CREATE USER postgres WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ai_chat TO postgres;
```

#### 运行数据库迁移

```bash
npm run setup:db
```

### 3. 文件系统设置

#### 创建必要目录

```bash
npm run setup:files
```

#### 手动创建目录（如果需要）

```bash
mkdir -p public/uploads public/image-edits public/cad-files
mkdir -p logs backups data
```

### 4. 测试环境设置

#### 运行测试

```bash
npm run setup:test
```

#### 手动运行测试

```bash
npm test
npm run test:coverage
```

### 5. 生产环境设置

#### 安全检查

```bash
npm run setup:production
```

#### 部署准备

```bash
npm run deploy:check
```

## 环境检查

### 检查环境配置

```bash
npm run setup:env
```

### 检查数据库连接

```bash
npm run db:check
```

### 检查文件权限

```bash
npm run setup:files -- --report
```

## 常见问题

### 1. 数据库连接失败

- 检查 PostgreSQL 服务是否运行
- 验证数据库连接参数
- 确认数据库用户权限

### 2. 文件权限错误

- 检查目录是否存在
- 验证写权限
- 运行 `npm run setup:files` 修复

### 3. 环境变量未设置

- 检查 .env 文件是否存在
- 验证变量名称拼写
- 重启应用

### 4. 测试失败

- 检查测试数据库配置
- 验证测试文件权限
- 查看测试日志

## 部署指南

### 开发环境

```bash
npm run dev
```

### 生产环境

```bash
npm run build
npm run start
```

### Docker 部署

```bash
docker-compose -f docker-compose.production.yml up -d
```

## 监控和维护

### 健康检查

访问 `http://localhost:3000/api/health`

### 日志查看

```bash
tail -f logs/combined.log
```

### 数据库备份

```bash
npm run db:backup
```

### 性能监控

```bash
npm run db:monitor
```

## 故障排除

### 查看设置报告

```bash
cat setup-report.md
```

### 查看环境检查报告

```bash
cat environment-check-report.md
```

### 查看安全报告

```bash
cat production-security-report.md
```

## 支持

如有问题，请参考：

1. 项目文档：`docs/` 目录
2. 设置报告：`setup-report.md`
3. 环境检查报告：`environment-check-report.md`
4. 安全报告：`production-security-report.md`

---

**最后更新**：2024年12月19日  
**版本**：1.0.0
