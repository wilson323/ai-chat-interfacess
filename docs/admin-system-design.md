# 管理端系统设计方案

## 项目概述

基于现有的 NeuroGlass AI Chat Interface 管理端，设计全面的后台管理功能系统。本方案扩展了现有架构，增加了智能体管理、系统管理、模型管理等核心功能模块。

## 系统架构分析

### 现有架构特点
- **技术栈**: Next.js 15 + React 18 + TypeScript 5 + PostgreSQL
- **UI框架**: shadcn/ui + Ant Design + Tailwind CSS
- **状态管理**: React Context API + Zustand
- **数据库**: PostgreSQL + Sequelize ORM
- **缓存**: Redis

### 现有管理端功能
- FastGPT 智能体管理
- CAD 智能体配置
- 图像编辑智能体配置
- 模型配置管理
- 性能监控
- 安全监控
- 缓存监控
- 自研智能体存储管理
- 数据表结构与同步

## 1. 智能体管理功能设计

### 1.1 功能模块划分

#### 1.1.1 FastGPT 智能体管理
- **智能体列表管理**
  - 分页显示智能体
  - 搜索和筛选功能
  - 批量操作（启用/禁用、删除）
  - 状态监控（在线/离线、响应时间）

- **智能体配置管理**
  - 基本信息：名称、描述、图标
  - API配置：App ID、API Key、端点URL
  - 模型参数：温度、最大Token、系统提示词
  - 功能开关：流式响应、详细信息、文件上传

- **权限控制设计**
  - 角色分级：超级管理员、管理员、操作员
  - 权限矩阵：读、写、删除、配置
  - 审计日志：操作记录、变更历史

#### 1.1.2 自研智能体管理
- **CAD 分析器管理**
  - 模型配置：识别算法、参数调优
  - 历史记录：分析结果查看、批量导出
  - 性能监控：准确率、处理时间、资源使用

- **图像编辑器管理**
  - 功能配置：画笔工具、标记功能、文件处理
  - 存储管理：图片存储空间、清理策略
  - 使用统计：调用次数、用户分布

#### 1.1.3 智能体状态监控
- **实时状态监控**
  - 健康检查：API连通性、响应时间
  - 错误监控：失败率、错误类型分析
  - 性能指标：QPS、并发数、资源占用

- **告警系统**
  - 阈值设置：响应时间、错误率
  - 告警通知：邮件、短信、系统内通知
  - 自动恢复：重启服务、切换备用节点

### 1.2 数据库表结构设计

```sql
-- 智能体配置扩展表
CREATE TABLE agent_config_enhanced (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agent_config(id),

  -- 高级配置
  rate_limit INTEGER DEFAULT 100,           -- 请求限制（次/分钟）
  timeout INTEGER DEFAULT 30000,           -- 超时时间（毫秒）
  retry_count INTEGER DEFAULT 3,           -- 重试次数
  backup_endpoints TEXT[],                 -- 备用端点

  -- 性能配置
  cache_enabled BOOLEAN DEFAULT true,      -- 启用缓存
  cache_ttl INTEGER DEFAULT 3600,          -- 缓存过期时间（秒）
  compression_enabled BOOLEAN DEFAULT true, -- 启用压缩

  -- 安全配置
  ip_whitelist TEXT[],                     -- IP白名单
  allowed_origins TEXT[],                  -- 允许的来源
  max_file_size BIGINT DEFAULT 10485760,   -- 最大文件大小（字节）

  -- 监控配置
  monitoring_enabled BOOLEAN DEFAULT true, -- 启用监控
  alert_thresholds JSONB,                  -- 告警阈值配置
  webhook_url TEXT,                       -- Webhook通知地址

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 智能体监控数据表
CREATE TABLE agent_monitoring (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agent_config(id),

  -- 性能指标
  response_time INTEGER,                  -- 响应时间（毫秒）
  request_count INTEGER DEFAULT 0,        -- 请求次数
  success_count INTEGER DEFAULT 0,        -- 成功次数
  error_count INTEGER DEFAULT 0,          -- 错误次数

  -- 资源使用
  memory_usage BIGINT,                     -- 内存使用（字节）
  cpu_usage DECIMAL(5,2),                 -- CPU使用率
  disk_usage BIGINT,                      -- 磁盘使用（字节）

  -- 状态信息
  status VARCHAR(20) DEFAULT 'active',     -- 状态：active/inactive/error
  error_message TEXT,                     -- 错误信息

  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 智能体权限表
CREATE TABLE agent_permissions (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agent_config(id),
  user_id INTEGER,                         -- 用户ID（可选）
  role_id INTEGER NOT NULL,               -- 角色ID

  -- 权限设置
  can_read BOOLEAN DEFAULT true,          -- 读取权限
  can_write BOOLEAN DEFAULT false,         -- 写入权限
  can_delete BOOLEAN DEFAULT false,       -- 删除权限
  can_configure BOOLEAN DEFAULT false,    -- 配置权限

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 智能体审计日志表
CREATE TABLE agent_audit_log (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agent_config(id),

  -- 操作信息
  action VARCHAR(50) NOT NULL,           -- 操作类型
  user_id INTEGER,                         -- 操作用户
  user_ip INET,                           -- 用户IP
  user_agent TEXT,                        -- 用户代理

  -- 变更内容
  old_data JSONB,                         -- 旧数据
  new_data JSONB,                         -- 新数据
  change_summary TEXT,                    -- 变更摘要

  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 2. 系统管理功能设计

### 2.1 用户和权限管理

#### 2.1.1 用户管理
- **用户信息管理**
  - 基本信息：用户名、邮箱、手机号
  - 账号状态：启用/禁用/锁定
  - 密码管理：修改密码、重置密码、强制修改

- **用户角色管理**
  - 角色定义：超级管理员、管理员、操作员、访客
  - 角色权限：功能模块访问权限
  - 角色分配：用户-角色关联管理

#### 2.1.2 权限管理
- **权限矩阵设计**
  - 模块权限：智能体管理、系统管理、模型管理
  - 操作权限：读取、创建、修改、删除
  - 数据权限：全部数据、部门数据、个人数据

- **权限继承**
  - 角色继承：子角色继承父角色权限
  - 部门继承：部门管理员管理本部门用户

### 2.2 系统配置管理

#### 2.2.1 全局配置
- **基础配置**
  - 系统名称、Logo、主题色
  - 时区、语言、日期格式
  - 联系方式、版权信息

- **功能配置**
  - 功能开关：注册、登录、文件上传
  - 安全设置：密码复杂度、登录限制
  - 通知设置：邮件通知、短信通知

#### 2.2.2 模块配置
- **智能体配置**
  - 默认参数、限制设置
  - 缓存策略、监控设置

- **模型配置**
  - 模型选择、参数默认值
  - 成本控制、使用限制

### 2.3 日志和监控

#### 2.3.1 操作日志
- **用户操作日志**
  - 登录日志：成功/失败记录
  - 操作记录：增删改查操作
  - 异常日志：错误信息、堆栈跟踪

- **系统日志**
  - API调用日志：请求/响应记录
  - 错误日志：系统错误、异常
  - 性能日志：响应时间、资源使用

#### 2.3.2 系统监控
- **服务器监控**
  - CPU使用率、内存使用率
  - 磁盘使用率、网络流量
  - 进程状态、服务状态

- **数据库监控**
  - 连接数、查询性能
  - 慢查询、锁等待
  - 备份状态、同步状态

### 2.4 数据备份和恢复

#### 2.4.1 备份策略
- **自动备份**
  - 定时备份：每日/每周/每月
  - 增量备份：仅备份变更数据
  - 异地备份：多地域存储

- **手动备份**
  - 即时备份：手动触发
  - 选择备份：指定表或数据

#### 2.4.2 恢复功能
- **数据恢复**
  - 时间点恢复：选择恢复时间点
  - 表级恢复：恢复指定表
  - 数据验证：恢复后数据校验

- **备份管理**
  - 备份列表：查看历史备份
  - 备份清理：过期备份清理
  - 备份验证：备份完整性检查

### 2.5 数据库表结构设计

```sql
-- 用户表
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,

  -- 用户信息
  full_name VARCHAR(100),
  avatar_url TEXT,
  department VARCHAR(100),
  position VARCHAR(100),

  -- 账号状态
  status VARCHAR(20) DEFAULT 'active',     -- active/inactive/locked
  last_login TIMESTAMP,
  login_attempts INTEGER DEFAULT 0,

  -- 安全设置
  two_factor_enabled BOOLEAN DEFAULT false,
  password_changed_at TIMESTAMP,
  email_verified BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 角色表
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,

  -- 角色层级
  parent_id INTEGER REFERENCES roles(id),
  level INTEGER DEFAULT 0,

  -- 角色状态
  status VARCHAR(20) DEFAULT 'active',     -- active/inactive

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 权限表
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,

  -- 权限分组
  module VARCHAR(50) NOT NULL,            -- 模块名称
  action VARCHAR(50) NOT NULL,            -- 操作类型

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户角色关联表
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  role_id INTEGER NOT NULL REFERENCES roles(id),

  -- 分配信息
  assigned_by INTEGER REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,                   -- 过期时间

  UNIQUE(user_id, role_id)
);

-- 角色权限关联表
CREATE TABLE role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  permission_id INTEGER NOT NULL REFERENCES permissions(id),

  -- 权限设置
  granted_by INTEGER REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(role_id, permission_id)
);

-- 系统配置表
CREATE TABLE system_config (
  id SERIAL PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,

  -- 配置信息
  config_type VARCHAR(20) DEFAULT 'string', -- string/number/boolean/json
  description TEXT,

  -- 配置分组
  category VARCHAR(50) DEFAULT 'general',
  is_system BOOLEAN DEFAULT false,         -- 系统配置（不可修改）

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 操作日志表
CREATE TABLE operation_logs (
  id SERIAL PRIMARY KEY,

  -- 操作信息
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(50) NOT NULL,             -- 操作类型
  module VARCHAR(50) NOT NULL,             -- 操作模块
  resource_id VARCHAR(100),                -- 资源ID

  -- 请求信息
  method VARCHAR(10),                     -- HTTP方法
  path VARCHAR(255),                      -- 请求路径
  params JSONB,                           -- 请求参数

  -- 结果信息
  status_code INTEGER,                    -- 状态码
  response_time INTEGER,                 -- 响应时间（毫秒）
  error_message TEXT,                    -- 错误信息

  -- 客户端信息
  ip_address INET,                        -- IP地址
  user_agent TEXT,                        -- 用户代理

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 备份记录表
CREATE TABLE backup_records (
  id SERIAL PRIMARY KEY,

  -- 备份信息
  backup_type VARCHAR(20) NOT NULL,        -- full/incremental
  backup_size BIGINT,                     -- 备份大小（字节）
  file_path TEXT NOT NULL,                -- 备份文件路径

  -- 备份范围
  tables TEXT[],                          -- 备份的表
  data_filter JSONB,                      -- 数据过滤条件

  -- 备份状态
  status VARCHAR(20) DEFAULT 'completed',  -- pending/running/completed/failed
  error_message TEXT,                     -- 错误信息

  -- 时间信息
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,

  -- 操作信息
  created_by INTEGER REFERENCES users(id)
);
```

## 3. 模型管理功能设计

### 3.1 模型配置管理

#### 3.1.1 模型基本信息
- **基础配置**
  - 模型名称、显示名称、描述
  - 提供商、版本号、模型类型
  - 状态管理：活跃、非活跃、已弃用、测试中

- **技术规格**
  - 支持的能力：文本、图像、音频、视频
  - 最大Token限制、上下文窗口大小
  - 支持的语言、地区限制

#### 3.1.2 模型参数配置
- **基础参数**
  - Temperature（温度）、Top P、Top K
  - Max Tokens（最大输出长度）
  - Frequency Penalty（重复惩罚）
  - Presence Penalty（存在惩罚）

- **高级参数**
  - Stop Sequences（停止序列）
  - Logit Bias（输出偏置）
  - 自定义参数：模型特定配置

#### 3.1.3 成本和限制
- **成本设置**
  - 输入Token单价、输出Token单价
  - 图像处理单价、音频处理单价
  - 月度预算、单次调用上限

- **使用限制**
  - 每分钟请求限制（RPM）
  - 每日Token限制（TPD）
  - 并发请求数限制
  - 超时时间设置

### 3.2 性能监控

#### 3.2.1 实时监控
- **性能指标**
  - 响应时间：平均、P95、P99
  - 成功率：请求成功率、错误率
  - 吞吐量：QPS、TPS、并发数

- **资源使用**
  - GPU使用率、内存使用率
  - 网络带宽、磁盘I/O
  - 模型加载时间、推理时间

#### 3.2.2 历史分析
- **趋势分析**
  - 性能趋势：响应时间变化趋势
  - 使用趋势：调用量增长趋势
  - 成本趋势：费用变化趋势

- **异常检测**
  - 性能异常：响应时间异常升高
  - 错误异常：错误率异常升高
  - 资源异常：资源使用异常

### 3.3 资源调度

#### 3.3.1 模型部署
- **部署管理**
  - 部署策略：热部署、蓝绿部署
  - 版本管理：版本切换、回滚
  - 实例管理：扩容、缩容、负载均衡

- **资源分配**
  - GPU资源：显存分配、算力分配
  - 内存资源：内存池管理、缓存策略
  - 网络资源：带宽分配、连接池管理

#### 3.3.2 负载均衡
- **请求分发**
  - 策略配置：轮询、权重、最小响应时间
  - 健康检查：实例状态检查
  - 故障转移：自动切换备用实例

- **缓存管理**
  - 缓存策略：LRU、LFU、TTL
  - 缓存预热：预加载常用模型
  - 缓存清理：过期缓存清理

### 3.4 成本控制

#### 3.4.1 成本分析
- **使用统计**
  - Token使用量：输入/输出统计
  - 调用次数：按模型、按用户、按时间
  - 资源使用：GPU小时数、内存使用量

- **成本分析**
  - 模型成本：各模型成本占比
  - 用户成本：各部门/用户成本
  - 趋势分析：成本增长趋势

#### 3.4.2 优化建议
- **成本优化**
  - 模型选择：推荐性价比高的模型
  - 参数优化：优化模型参数配置
  - 缓存策略：增加缓存减少重复调用

- **预算控制**
  - 预算设置：部门预算、项目预算
  - 超预算告警：接近预算时通知
  - 成本审批：大额使用审批流程

### 3.5 数据库表结构设计

```sql
-- 模型配置表
CREATE TABLE model_configs (
  id SERIAL PRIMARY KEY,

  -- 基本信息
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,

  -- 技术规格
  provider VARCHAR(50) NOT NULL,           -- 提供商
  model_type VARCHAR(50) NOT NULL,         -- 模型类型
  version VARCHAR(50) NOT NULL,            -- 版本号

  -- 能力配置
  capabilities JSONB,                     -- 支持的能力
  max_tokens INTEGER DEFAULT 4000,        -- 最大Token数
  context_window INTEGER DEFAULT 8000,     -- 上下文窗口大小

  -- 参数配置
  parameters JSONB,                        -- 默认参数
  custom_parameters JSONB,                 -- 自定义参数

  -- 成本配置
  input_token_price DECIMAL(10,6) DEFAULT 0,    -- 输入Token单价
  output_token_price DECIMAL(10,6) DEFAULT 0,   -- 输出Token单价
  image_price DECIMAL(10,6) DEFAULT 0,          -- 图像处理单价
  audio_price DECIMAL(10,6) DEFAULT 0,          -- 音频处理单价

  -- 限制配置
  max_requests_per_minute INTEGER DEFAULT 60,  -- 每分钟最大请求
  max_tokens_per_day BIGINT DEFAULT 1000000,   -- 每日最大Token
  max_concurrent_requests INTEGER DEFAULT 10,  -- 最大并发请求
  timeout_ms INTEGER DEFAULT 30000,            -- 超时时间（毫秒）

  -- 状态管理
  status VARCHAR(20) DEFAULT 'active',     -- active/inactive/deprecated/testing
  is_default BOOLEAN DEFAULT false,       -- 是否默认模型

  -- 元数据
  tags TEXT[],                             -- 标签
  category VARCHAR(50),                    -- 分类
  metadata JSONB,                         -- 其他元数据

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id)
);

-- 模型实例表
CREATE TABLE model_instances (
  id SERIAL PRIMARY KEY,
  model_id INTEGER NOT NULL REFERENCES model_configs(id),

  -- 实例信息
  instance_id VARCHAR(100) NOT NULL,      -- 实例ID
  endpoint_url TEXT NOT NULL,              -- 服务端点
  region VARCHAR(50),                     -- 部署区域

  -- 资源配置
  gpu_count INTEGER DEFAULT 1,            -- GPU数量
  gpu_memory BIGINT,                       -- GPU内存（MB）
  cpu_cores INTEGER DEFAULT 4,             -- CPU核心数
  memory_gb INTEGER DEFAULT 8,            -- 内存（GB）

  -- 状态信息
  status VARCHAR(20) DEFAULT 'running',  -- running/stopped/error
  health_score DECIMAL(3,2) DEFAULT 1.0,   -- 健康分数
  last_health_check TIMESTAMP,             -- 最后健康检查时间

  -- 负载信息
  current_load DECIMAL(5,2) DEFAULT 0,    -- 当前负载率
  max_load DECIMAL(5,2) DEFAULT 80,        -- 最大负载率

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 模型监控数据表
CREATE TABLE model_monitoring (
  id SERIAL PRIMARY KEY,
  model_id INTEGER NOT NULL REFERENCES model_configs(id),
  instance_id INTEGER REFERENCES model_instances(id),

  -- 性能指标
  response_time INTEGER,                   -- 响应时间（毫秒）
  success_count INTEGER DEFAULT 0,        -- 成功次数
  error_count INTEGER DEFAULT 0,          -- 错误次数
  timeout_count INTEGER DEFAULT 0,        -- 超时次数

  -- 资源使用
  gpu_usage DECIMAL(5,2),                 -- GPU使用率
  gpu_memory_usage BIGINT,                -- GPU内存使用（MB）
  cpu_usage DECIMAL(5,2),                 -- CPU使用率
  memory_usage BIGINT,                    -- 内存使用（MB）

  -- 成本统计
  input_tokens BIGINT DEFAULT 0,          -- 输入Token数
  output_tokens BIGINT DEFAULT 0,         -- 输出Token数
  estimated_cost DECIMAL(10,6) DEFAULT 0, -- 预估成本

  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 模型成本统计表
CREATE TABLE model_cost_stats (
  id SERIAL PRIMARY KEY,
  model_id INTEGER NOT NULL REFERENCES model_configs(id),

  -- 统计周期
  stat_date DATE NOT NULL,                -- 统计日期
  user_id INTEGER REFERENCES users(id),   -- 用户ID（可选）
  department_id INTEGER,                  -- 部门ID（可选）

  -- 使用统计
  request_count INTEGER DEFAULT 0,        -- 请求次数
  input_tokens BIGINT DEFAULT 0,          -- 输入Token数
  output_tokens BIGINT DEFAULT 0,         -- 输出Token数
  image_count INTEGER DEFAULT 0,          -- 图像处理次数
  audio_count INTEGER DEFAULT 0,          -- 音频处理次数

  -- 成本统计
  token_cost DECIMAL(12,6) DEFAULT 0,     -- Token成本
  image_cost DECIMAL(12,6) DEFAULT 0,     -- 图像成本
  audio_cost DECIMAL(12,6) DEFAULT 0,     -- 音频成本
  total_cost DECIMAL(12,6) DEFAULT 0,     -- 总成本

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 模型告警规则表
CREATE TABLE model_alert_rules (
  id SERIAL PRIMARY KEY,
  model_id INTEGER NOT NULL REFERENCES model_configs(id),

  -- 告警条件
  metric_type VARCHAR(50) NOT NULL,       -- 指标类型：response_time/error_rate/cpu_usage
  operator VARCHAR(20) NOT NULL,          -- 操作符：>/</>=/<=/==
  threshold_value DECIMAL(12,6) NOT NULL, -- 阈值
  duration INTEGER DEFAULT 5,              -- 持续时间（分钟）

  -- 告警配置
  severity VARCHAR(20) DEFAULT 'warning', -- 严重程度：info/warning/error/critical
  notification_channels TEXT[],           -- 通知渠道：email/sms/webhook

  -- 告警状态
  is_active BOOLEAN DEFAULT true,         -- 是否启用
  last_triggered TIMESTAMP,               -- 最后触发时间

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id)
);
```

## 4. API接口规范

### 4.1 智能体管理API

#### 4.1.1 FastGPT智能体管理
```typescript
// 智能体列表
GET /api/admin/agents/fastgpt
GET /api/admin/agents/fastgpt?page=1&limit=10&search=keyword&status=active

// 智能体详情
GET /api/admin/agents/fastgpt/:id

// 创建智能体
POST /api/admin/agents/fastgpt
{
  "name": "智能助手",
  "description": "通用AI助手",
  "apiKey": "sk-xxx",
  "appId": "app-xxx",
  "apiUrl": "https://api.example.com/v1/chat/completions",
  "systemPrompt": "你是一个智能助手...",
  "temperature": 0.7,
  "maxTokens": 2000,
  "supportsStream": true,
  "supportsDetail": true
}

// 更新智能体
PUT /api/admin/agents/fastgpt/:id
PATCH /api/admin/agents/fastgpt/:id/status  // 状态更新

// 删除智能体
DELETE /api/admin/agents/fastgpt/:id

// 批量操作
POST /api/admin/agents/fastgpt/batch
{
  "action": "enable|disable|delete",
  "ids": [1, 2, 3]
}

// 测试连通性
POST /api/admin/agents/fastgpt/:id/test
```

#### 4.1.2 智能体监控API
```typescript
// 获取监控数据
GET /api/admin/agents/:id/monitoring
GET /api/admin/agents/:id/monitoring/history?period=24h

// 获取健康状态
GET /api/admin/agents/:id/health

// 获取性能指标
GET /api/admin/agents/:id/metrics
```

### 4.2 系统管理API

#### 4.2.1 用户管理API
```typescript
// 用户列表
GET /api/admin/users?page=1&limit=10&search=keyword&role=admin

// 用户详情
GET /api/admin/users/:id

// 创建用户
POST /api/admin/users
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "password123",
  "fullName": "管理员",
  "roleIds": [1, 2]
}

// 更新用户
PUT /api/admin/users/:id

// 删除用户
DELETE /api/admin/users/:id

// 重置密码
POST /api/admin/users/:id/reset-password

// 用户角色管理
GET /api/admin/users/:id/roles
POST /api/admin/users/:id/roles
DELETE /api/admin/users/:id/roles/:roleId
```

#### 4.2.2 角色权限API
```typescript
// 角色列表
GET /api/admin/roles

// 角色详情
GET /api/admin/roles/:id

// 创建角色
POST /api/admin/roles
{
  "name": "operator",
  "displayName": "操作员",
  "description": "系统操作员",
  "permissions": ["user:read", "agent:read"]
}

// 权限列表
GET /api/admin/permissions

// 系统配置
GET /api/admin/config
PUT /api/admin/config
{
  "key": "value"
}
```

#### 4.2.3 日志监控API
```typescript
// 操作日志
GET /api/admin/logs/operations?page=1&limit=10&userId=1&action=create

// 系统日志
GET /api/admin/logs/system

// 性能日志
GET /api/admin/logs/performance

// 日志导出
POST /api/admin/logs/export
```

### 4.3 模型管理API

#### 4.3.1 模型配置API
```typescript
// 模型列表
GET /api/admin/models?page=1&limit=10&type=openai&status=active

// 模型详情
GET /api/admin/models/:id

// 创建模型
POST /api/admin/models
{
  "name": "gpt-4",
  "displayName": "GPT-4",
  "provider": "OpenAI",
  "modelType": "text",
  "version": "gpt-4",
  "maxTokens": 8000,
  "parameters": {
    "temperature": 0.7,
    "maxTokens": 2000
  },
  "capabilities": ["text", "code"],
  "inputTokenPrice": 0.00003,
  "outputTokenPrice": 0.00006
}

// 更新模型
PUT /api/admin/models/:id

// 删除模型
DELETE /api/admin/models/:id

// 模型测试
POST /api/admin/models/:id/test
{
  "prompt": "Hello, how are you?",
  "parameters": {
    "temperature": 0.7
  }
}
```

#### 4.3.2 性能监控API
```typescript
// 获取性能数据
GET /api/admin/models/:id/performance
GET /api/admin/models/:id/performance/history?period=24h

// 获取成本统计
GET /api/admin/models/:id/costs
GET /api/admin/models/:id/costs/summary?period=month

// 获取实例状态
GET /api/admin/models/:id/instances
```

### 4.4 通用响应格式

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## 5. 前端组件设计

### 5.1 组件架构

#### 5.1.1 基础组件
- **Layout组件**
  - AdminLayout：管理端布局
  - Sidebar：侧边栏导航
  - Header：顶部导航栏
  - Footer：底部信息

- **通用组件**
  - DataTable：数据表格
  - SearchFilter：搜索筛选
  - Pagination：分页组件
  - Loading：加载状态
  - ErrorBoundary：错误边界

#### 5.1.2 业务组件
- **智能体管理组件**
  - AgentList：智能体列表
  - AgentForm：智能体表单
  - AgentMonitor：智能体监控
  - AgentPermissions：权限管理

- **系统管理组件**
  - UserList：用户列表
  - UserForm：用户表单
  - RoleList：角色列表
  - SystemConfig：系统配置
  - LogViewer：日志查看器

- **模型管理组件**
  - ModelList：模型列表
  - ModelForm：模型表单
  - PerformanceMonitor：性能监控
  - CostAnalysis：成本分析

### 5.2 关键组件实现

#### 5.2.1 智能体列表组件
```typescript
// components/admin/agents/AgentList.tsx
interface AgentListProps {
  type: 'fastgpt' | 'cad-analyzer' | 'image-editor';
  onEdit?: (agent: Agent) => void;
  onDelete?: (id: string) => void;
}

export function AgentList({ type, onEdit, onDelete }: AgentListProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredAgents = useMemo(() => {
    return agents.filter(agent =>
      agent.type === type &&
      (selectedStatus === 'all' || agent.status === selectedStatus) &&
      agent.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [agents, type, selectedStatus, searchTerm]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateAgentStatus(id, status);
      setAgents(prev => prev.map(agent =>
        agent.id === id ? { ...agent, status } : agent
      ));
    } catch (error) {
      console.error('更新状态失败:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{getAgentTypeTitle(type)}管理</CardTitle>
          <Button onClick={() => onEdit?.()}>
            <Plus className="h-4 w-4 mr-2" />
            新增智能体
          </Button>
        </div>

        <div className="flex gap-4">
          <SearchInput
            placeholder="搜索智能体..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
          <StatusFilter
            value={selectedStatus}
            onChange={setSelectedStatus}
          />
        </div>
      </CardHeader>

      <CardContent>
        <DataTable
          data={filteredAgents}
          columns={getAgentColumns(type, handleStatusChange, onEdit, onDelete)}
          loading={loading}
        />
      </CardContent>
    </Card>
  );
}
```

#### 5.2.2 智能体监控组件
```typescript
// components/admin/agents/AgentMonitor.tsx
interface AgentMonitorProps {
  agentId: string;
}

export function AgentMonitor({ agentId }: AgentMonitorProps) {
  const [metrics, setMetrics] = useState<AgentMetrics[]>([]);
  const [health, setHealth] = useState<HealthStatus>('healthy');

  useEffect(() => {
    // 实时更新监控数据
    const interval = setInterval(async () => {
      try {
        const [metricsData, healthData] = await Promise.all([
          getAgentMetrics(agentId),
          getAgentHealth(agentId)
        ]);
        setMetrics(metricsData);
        setHealth(healthData.status);
      } catch (error) {
        console.error('获取监控数据失败:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [agentId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="响应时间"
        value={formatResponseTime(getLatestMetric('response_time'))}
        trend={calculateTrend('response_time')}
        status={getMetricStatus('response_time')}
      />

      <MetricCard
        title="成功率"
        value={formatPercentage(getLatestMetric('success_rate'))}
        trend={calculateTrend('success_rate')}
        status={getMetricStatus('success_rate')}
      />

      <MetricCard
        title="请求数"
        value={formatNumber(getLatestMetric('request_count'))}
        trend={calculateTrend('request_count')}
        status="normal"
      />

      <HealthCard
        status={health}
        lastCheck={getLastHealthCheck()}
      />

      <div className="col-span-full">
        <PerformanceChart
          data={metrics}
          metrics={['response_time', 'success_rate']}
          timeRange="1h"
        />
      </div>
    </div>
  );
}
```

#### 5.2.3 用户管理组件
```typescript
// components/admin/users/UserList.tsx
interface UserListProps {
  onEdit?: (user: User) => void;
  onDelete?: (id: string) => void;
}

export function UserList({ onEdit, onDelete }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  const columns = [
    {
      key: 'username',
      title: '用户名',
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <Avatar src={user.avatarUrl} />
          <span>{user.username}</span>
        </div>
      )
    },
    {
      key: 'email',
      title: '邮箱',
      dataIndex: 'email'
    },
    {
      key: 'roles',
      title: '角色',
      render: (user: User) => (
        <div className="flex gap-1">
          {user.roles?.map(role => (
            <Badge key={role.id} variant="outline">
              {role.displayName}
            </Badge>
          ))}
        </div>
      )
    },
    {
      key: 'status',
      title: '状态',
      render: (user: User) => (
        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
          {user.status === 'active' ? '活跃' : '禁用'}
        </Badge>
      )
    },
    {
      key: 'actions',
      title: '操作',
      render: (user: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onEdit?.(user)}>
              <Edit className="h-4 w-4 mr-2" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => resetPassword(user.id)}>
              <Key className="h-4 w-4 mr-2" />
              重置密码
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete?.(user.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>用户管理</CardTitle>
          <Button onClick={() => onEdit?.()}>
            <Plus className="h-4 w-4 mr-2" />
            新增用户
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </CardContent>
    </Card>
  );
}
```

### 5.3 路由设计

```typescript
// app/admin/layout.tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// 路由结构
/app/admin/
├── /agents/fastgpt                 # FastGPT智能体管理
├── /agents/cad-analyzer           # CAD智能体管理
├── /agents/image-editor           # 图像编辑智能体管理
├── /users                         # 用户管理
├── /roles                         # 角色管理
├── /permissions                   # 权限管理
├── /models                        # 模型管理
├── /models/monitoring             # 模型监控
├── /models/costs                  # 成本分析
├── /system/config                 # 系统配置
├── /logs/operations               # 操作日志
├── /logs/system                   # 系统日志
├── /backup                        # 备份管理
└── /dashboard                     # 管理面板
```

## 6. 部署和配置

### 6.1 环境配置

```bash
# .env.admin
# 管理端配置
ADMIN_SECRET_KEY=your_admin_secret_key
ADMIN_SESSION_TIMEOUT=3600

# 数据库配置
POSTGRES_ADMIN_USER=admin
POSTGRES_ADMIN_PASSWORD=admin_password
POSTGRES_ADMIN_DB=admin_db

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# 监控配置
ENABLE_MONITORING=true
MONITORING_INTERVAL=5

# 告警配置
ALERT_EMAIL_ENABLED=true
ALERT_EMAIL_SMTP=smtp.example.com
ALERT_EMAIL_PORT=587
ALERT_EMAIL_USER=alert@example.com
ALERT_EMAIL_PASSWORD=email_password
```

### 6.2 Docker配置

```yaml
# docker-compose.admin.yml
version: '3.8'
services:
  admin-app:
    build:
      context: .
      dockerfile: Dockerfile.admin
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://admin:admin_password@postgres:5432/admin_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs

  postgres-admin:
    image: postgres:15
    environment:
      POSTGRES_DB: admin_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin_password
    volumes:
      - postgres_admin_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"

  redis-admin:
    image: redis:7-alpine
    command: redis-server --requirepass redis_password
    volumes:
      - redis_admin_data:/data
    ports:
      - "6380:6379"

  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  postgres_admin_data:
  redis_admin_data:
  grafana_data:
```

## 7. 安全考虑

### 7.1 认证和授权
- **JWT认证**: 使用JWT进行用户认证
- **角色权限**: 基于角色的访问控制（RBAC）
- **IP白名单**: 管理端访问IP限制
- **登录限制**: 登录失败次数限制

### 7.2 数据安全
- **敏感数据加密**: 密码、API密钥等敏感数据加密存储
- **SQL注入防护**: 使用参数化查询和ORM
- **XSS防护**: 输入验证和输出编码
- **CSRF防护**: CSRF令牌验证

### 7.3 操作安全
- **操作审计**: 记录所有管理操作
- **数据备份**: 定期备份重要数据
- **权限分离**: 最小权限原则
- **安全扫描**: 定期安全漏洞扫描

## 8. 监控和告警

### 8.1 性能监控
- **APM监控**: 应用性能监控
- **数据库监控**: 查询性能、连接池状态
- **缓存监控**: Redis性能和命中率
- **API监控**: 响应时间、错误率

### 8.2 业务监控
- **用户行为**: 用户操作统计
- **智能体使用**: 各智能体调用情况
- **模型使用**: 模型调用量和成本
- **系统健康**: 服务状态和资源使用

### 8.3 告警策略
- **实时告警**: 关键指标异常立即告警
- **趋势告警**: 指标趋势异常告警
- **容量告警**: 资源使用率过高告警
- **业务告警**: 业务指标异常告警

## 9. 扩展性设计

### 9.1 插件系统
- **智能体插件**: 支持第三方智能体接入
- **模型插件**: 支持新模型类型扩展
- **功能插件**: 支持功能模块扩展
- **主题插件**: 支持界面主题定制

### 9.2 API扩展
- **RESTful API**: 标准REST API设计
- **GraphQL**: 支持GraphQL查询
- **WebSocket**: 实时数据推送
- **Webhook**: 事件通知机制

### 9.3 国际化支持
- **多语言**: 支持中文、英文等多语言
- **时区支持**: 支持多时区显示
- **本地化**: 数字、日期、货币格式化

## 总结

本管理端系统设计方案基于现有的NeuroGlass AI Chat Interface架构，提供了完整的智能体管理、系统管理、模型管理等功能模块。方案注重：

1. **可扩展性**: 模块化设计，支持功能扩展
2. **安全性**: 完善的权限控制和安全措施
3. **可维护性**: 清晰的代码结构和组件设计
4. **用户体验**: 直观的界面和流畅的操作流程
5. **性能优化**: 高效的数据处理和缓存策略

该方案可以满足企业级AI平台的管理需求，为平台的安全、稳定运行提供保障。