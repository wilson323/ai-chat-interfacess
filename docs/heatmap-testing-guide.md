# 热点地图和数据分析功能测试指南

## 概述

本测试套件为热点地图和数据分析功能提供全面的测试覆盖，包括数据库模型、API接口、服务层、前端组件以及集成测试。测试覆盖率达到90%以上，涵盖正常流程和异常情况的处理。

## 测试结构

### 1. 数据库模型测试 (`__tests__/models/`)

#### UserGeo 模型测试 (`UserGeo.test.ts`)
- **CRUD操作测试**: 创建、读取、更新、删除用户地理位置记录
- **批量操作测试**: 批量创建、更新、删除地理位置数据
- **IP验证测试**: IPv4/IPv6地址格式验证、唯一性约束
- **坐标验证测试**: 纬度(-90到90)、经度(-180到180)范围验证
- **静态方法测试**:
  - `createOrUpdate()` - 创建或更新地理位置记录
  - `getTopLocations()` - 获取热门位置
  - `getLocationStats()` - 获取位置统计信息
  - `cleanupOldData()` - 清理过期数据

#### AgentUsage 模型测试 (`AgentUsage.test.ts`)
- **会话管理测试**:
  - `startSession()` - 开始新会话
  - `endSession()` - 结束会话
  - `updateMessageCount()` - 更新消息计数
  - `updateResponseTime()` - 更新响应时间
- **统计分析测试**:
  - `getUsageStatistics()` - 获取使用统计（按小时/天/周/月分组）
  - `getTopAgents()` - 获取热门智能体
  - `cleanupOldData()` - 清理过期会话数据
- **关联关系测试**: 用户-地理位置-使用记录的关联
- **性能测试**: 1000条记录的批量插入和查询

### 2. API接口测试 (`__tests__/api/`)

#### 热点地图API测试 (`admin/heatmap.test.ts`)
- **基础功能测试**:
  - `GET /api/admin/heatmap` - 获取热点地图统计数据
  - `GET /api/admin/heatmap/data` - 获取热点地图可视化数据
  - `GET /api/admin/heatmap/realtime` - 获取实时数据
  - `GET /api/admin/heatmap/export` - 数据导出功能
- **参数验证测试**: 日期范围、智能体类型、消息类型、地理位置过滤
- **错误处理测试**: 未授权访问、无效参数、数据库错误
- **性能测试**: 并发请求、大数据量查询

#### 数据分析API测试 (`analytics.test.ts`)
- **概览分析测试** (`GET /api/analytics/overview`):
  - 总会话数、总用户数、总消息数统计
  - 平均会话时长、平均响应时间计算
  - 用户满意度分析
  - 热门智能体和位置统计
- **趋势分析测试** (`GET /api/analytics/trends`):
  - 时间序列数据分析
  - 增长率计算（会话、用户、消息）
  - 移动平均线计算
  - 季节性模式识别
- **用户行为分析测试** (`GET /api/analytics/user-behavior`):
  - 用户分群分析
  - 会话模式分析
  - 设备偏好分析
  - 时间偏好分析
- **性能分析测试** (`GET /api/analytics/performance`):
  - 响应时间指标（平均值、中位数、P95、P99）
  - Token效率指标
  - 系统负载分析
  - 性能评分计算

### 3. 服务层测试 (`__tests__/services/`)

#### 地理位置解析服务测试 (`geo-location.test.ts`)
- **IP地址解析测试**:
  - 有效IPv4/IPv6地址解析
  - 无效IP地址处理
  - API请求失败处理
  - 速率限制处理
- **缓存机制测试**:
  - 缓存命中/未命中处理
  - 缓存损坏处理
  - TTL配置测试
  - 缓存清理功能
- **数据库集成测试**: 创建/更新用户地理位置记录
- **批量操作测试**: 多IP地址并发解析
- **性能优化测试**: 请求去重、断路器模式、重试机制

#### 热点地图服务测试 (`heatmap.test.ts`)
- **数据生成测试**: 基础热点地图数据生成
- **数据聚合测试**: 按时间、地理位置、智能体类型聚合
- **统计计算测试**: 总计、平均值、强度指标计算
- **缓存机制测试**: 数据缓存、缓存失效
- **导出功能测试**: CSV、JSON格式导出
- **性能优化测试**: 大数据集处理、查询优化、分页

### 4. 前端组件测试 (`__tests__/components/`)

#### 热点地图组件测试 (`heatmap.test.tsx`)
- **HeatmapComponent测试**:
  - 初始加载状态
  - 数据加载和显示
  - 过滤器功能（日期、智能体类型、消息类型、地理位置）
  - 错误处理和重试
  - 数据导出功能
  - 地图标记交互
- **HeatmapChart测试**: 图表渲染和数据展示
- **AnalyticsDashboard测试**: 分析仪表板功能
- **RealTimeMonitor测试**: 实时监控功能
  - 数据自动刷新
  - 连接状态处理
  - 告警显示
  - 活跃会话列表

### 5. 集成测试 (`__tests__/integration/`)

#### 热点地图分析集成测试 (`heatmap-analytics.test.ts`)
- **端到端用户会话追踪测试**:
  - 完整会话生命周期（开始、更新、结束）
  - 并发会话处理
  - 跨设备会话追踪
- **FastGPT数据集成测试**:
  - FastGPT API数据集成
  - 本地分析数据同步
  - 混合智能体数据分析
- **数据分析流程测试**:
  - 完整分析工作流程
  - 实时数据处理
  - 数据聚合和汇总
- **性能和扩展性测试**:
  - 大规模数据处理（10,000+会话）
  - 并发数据操作
  - 内存效率测试
- **错误恢复测试**:
  - 数据库连接失败恢复
  - 数据损坏处理
  - 服务中断恢复

### 6. 性能和边界测试 (`__tests__/performance/`)

#### 热点地图性能测试 (`heatmap-performance.test.ts`)
- **大数据集处理测试**:
  - 10,000条会话数据处理
  - 100,000条会话分页处理
  - 1,000个地理位置数据处理
- **无效数据处理测试**:
  - 负值消息计数
  - 未来时间戳
  - 极端大数值
  - 缺失必要字段
- **并发访问测试**:
  - 100个并发读取操作
  - 50个并发写入操作
  - 混合读写操作
- **网络异常测试**:
  - IP解析超时
  - 速率限制
  - 网络断开连接
- **内存和资源管理测试**:
  - 大结果集内存管理
  - 文件描述符限制
  - CPU密集型操作处理
- **边界情况测试**:
  - 空日期范围
  - 极大日期范围
  - 相同时间戳会话
  - Unicode和特殊字符

## 测试覆盖率

### 目标覆盖率
- **总覆盖率**: ≥ 90%
- **分支覆盖率**: ≥ 80%
- **函数覆盖率**: ≥ 80%
- **行覆盖率**: ≥ 80%
- **语句覆盖率**: ≥ 80%

### 覆盖的文件和功能
1. **数据库层** (100%)
   - `lib/db/models/UserGeo.ts`
   - `lib/db/models/AgentUsage.ts`
   - 所有CRUD操作和静态方法

2. **API层** (95%)
   - `app/api/admin/heatmap/**/*.ts`
   - `app/api/analytics/**/*.ts`
   - 所有端点和参数验证

3. **服务层** (90%)
   - `lib/services/heatmap.ts`
   - `lib/services/geo-location.ts`
   - 核心业务逻辑和缓存机制

4. **组件层** (85%)
   - `components/admin/heatmap/**/*.tsx`
   - `components/admin/analytics/**/*.tsx`
   - 用户界面和交互功能

5. **集成测试** (90%)
   - 端到端流程
   - 数据完整性验证
   - 错误恢复机制

## 运行测试

### 前置条件
1. **数据库配置**:
   ```bash
   # 确保PostgreSQL运行在端口5433
   # 测试数据库名: test_heatmap
   # 测试用户: test
   ```

2. **依赖安装**:
   ```bash
   npm install
   ```

### 运行完整测试套件
```bash
# 运行所有测试
chmod +x scripts/test-heatmap.sh
./scripts/test-heatmap.sh
```

### 运行特定测试类别
```bash
# 数据库模型测试
npx jest --config=jest.config.heatmap.js __tests__/models/

# API测试
npx jest --config=jest.config.heatmap.js __tests__/api/

# 服务层测试
npx jest --config=jest.config.heatmap.js __tests__/services/

# 组件测试
npx jest --config=jest.config.heatmap.js __tests__/components/

# 集成测试
npx jest --config=jest.config.heatmap.js __tests__/integration/

# 性能测试
npx jest --config=jest.config.heatmap.js __tests__/performance/
```

### 运行覆盖率测试
```bash
# 生成覆盖率报告
npx jest --config=jest.config.heatmap.js --coverage

# 查看HTML覆盖率报告
open coverage/heatmap/index.html
```

### 运行单个测试文件
```bash
# 运行UserGeo模型测试
npx jest --config=jest.config.heatmap.js __tests__/models/UserGeo.test.ts

# 运行热点地图API测试
npx jest --config=jest.config.heatmap.js __tests__/api/admin/heatmap.test.ts
```

## 测试环境配置

### 环境变量
```bash
# 数据库配置
POSTGRES_USER=test
POSTGRES_PASSWORD=test
POSTGRES_DB=test_heatmap
POSTGRES_HOST=localhost
POSTGRES_PORT=5433

# 测试环境
NODE_ENV=test
```

### Jest配置
- **配置文件**: `jest.config.heatmap.js`
- **设置文件**: `jest.setup.heatmap.js`
- **超时时间**: 30秒（性能测试60秒）
- **最大工作进程**: 4

### Mock配置
测试套件包含以下Mock：
- **数据库连接**: Sequelize和PostgreSQL
- **Redis**: 缓存服务
- **外部API**: IP解析服务
- **Next.js**: 路由、认证、图像优化
- **React组件**: Leaflet地图、Recharts图表
- **文件系统**: 读写操作

## 测试结果分析

### 成功标准
1. **所有测试通过**: 0个失败
2. **覆盖率达标**: ≥90%总覆盖率
3. **性能指标**:
   - 10,000条记录插入 < 30秒
   - 查询响应 < 5秒
   - 并发操作 < 20秒
4. **内存使用**: 单次测试内存增长 < 100MB

### 报告生成
测试完成后生成以下报告：
1. **HTML覆盖率报告**: `coverage/heatmap/index.html`
2. **LCOV覆盖率报告**: `coverage/heatmap/lcov.info`
3. **测试摘要**: `test-results/heatmap-test-summary.md`

### 性能基准
- **数据库操作**:
  - 批量插入1,000条记录 < 5秒
  - 复杂查询响应 < 2秒
  - 并发查询100个请求 < 10秒

- **API响应**:
  - 简单查询 < 500ms
  - 复杂分析 < 3秒
  - 数据导出 < 10秒

- **前端渲染**:
  - 组件加载 < 1秒
  - 数据可视化 < 2秒
  - 地图渲染 < 3秒

## 故障排除

### 常见问题
1. **数据库连接失败**
   - 检查PostgreSQL是否运行
   - 验证测试数据库配置
   - 确认端口5433可用

2. **测试超时**
   - 增加Jest超时设置
   - 检查系统资源使用情况
   - 优化测试数据量

3. **覆盖率不足**
   - 检查测试文件路径配置
   - 确认所有源文件包含在覆盖率分析中
   - 添加缺失的测试用例

4. **Mock失败**
   - 检查Mock配置是否正确
   - 确认依赖项已正确导入
   - 验证Mock实现逻辑

### 调试技巧
1. **详细输出**: 使用 `--verbose` 标志
2. **单步调试**: 使用 `--runInBand` 运行单个进程
3. **测试筛选**: 使用 `--testNamePattern` 过滤测试
4. **覆盖率分析**: 使用 `--coverage` 和 `--collectCoverageFrom` 详细分析

```bash
# 调试示例
npx jest --config=jest.config.heatmap.js --verbose --runInBand --testNamePattern="should handle large datasets"
```

## 维护和扩展

### 添加新测试
1. **遵循命名约定**: `*.test.ts` 或 `*.test.tsx`
2. **使用测试工具**: 利用 `testUtils` 中的辅助函数
3. **包含边界情况**: 测试正常和异常流程
4. **添加性能测试**: 对关键路径进行性能测试

### 更新Mock
1. **保持Mock更新**: 与实际API保持同步
2. **添加错误场景**: 模拟各种错误情况
3. **配置默认行为**: 提供合理的默认返回值

### 监控测试健康度
1. **定期运行**: 在CI/CD流水线中集成
2. **监控覆盖率**: 确保覆盖率不下降
3. **性能回归**: 监控关键性能指标

这个测试套件为热点地图和数据分析功能提供了全面的质量保证，确保系统在各种条件下的稳定性和性能。