# 热点地图功能集成指南

## 概述

本文档介绍如何在现有的AI聊天界面中集成热点地图功能，用于追踪和分析用户地理位置和智能体使用情况。

## 核心组件

### 1. 数据模型

#### 用户地理位置表 (`user_geo`)
```sql
CREATE TABLE user_geo (
    id SERIAL PRIMARY KEY,
    userId INTEGER REFERENCES users(id),
    sessionId UUID,
    ipAddress VARCHAR(45) NOT NULL,
    location JSONB NOT NULL, -- 国家、城市、经纬度等
    lastSeen TIMESTAMP DEFAULT NOW(),
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);
```

#### 智能体使用统计表 (`agent_usage`)
```sql
CREATE TABLE agent_usage (
    id SERIAL PRIMARY KEY,
    sessionId UUID REFERENCES chat_sessions(id),
    userId INTEGER REFERENCES users(id),
    agentId INTEGER REFERENCES agent_config(id),
    messageType ENUM('text', 'image', 'file', 'voice', 'mixed'),
    messageCount INTEGER DEFAULT 1,
    tokenUsage INTEGER,
    responseTime INTEGER, -- 毫秒
    startTime TIMESTAMP NOT NULL,
    endTime TIMESTAMP,
    duration INTEGER, -- 秒
    isCompleted BOOLEAN DEFAULT FALSE,
    userSatisfaction ENUM('positive', 'negative', 'neutral'),
    geoLocationId INTEGER REFERENCES user_geo(id),
    deviceInfo JSONB,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);
```

### 2. 服务层

#### 地理位置解析服务
```typescript
import { geoLocationService } from '@/lib/services/geo-location-service';

// 获取用户地理位置
const location = await geoLocationService.getLocationByIp(userIp);

// 批量获取地理位置
const locations = await geoLocationService.getLocationByBatch(['192.168.1.1', '10.0.0.1']);
```

#### 热点地图数据聚合服务
```typescript
import { heatmapService } from '@/lib/services/heatmap-service';

// 获取统计数据
const stats = await heatmapService.getUsageStatistics({
    timeRange: '7d',
    agentType: 'fastgpt'
});

// 获取热点地图数据
const heatmapData = await heatmapService.getHeatmapData({
    startDate: new Date('2024-01-01'),
    endDate: new Date(),
    granularity: 'day'
});
```

### 3. 中间件

#### 使用追踪中间件
```typescript
import { usageTracking } from '@/lib/middleware/usage-tracking';

// 在聊天会话开始时追踪
await usageTracking.trackSessionStart(
    sessionId,
    userId,
    agentId,
    'text',
    request
);

// 追踪消息发送
await usageTracking.trackMessage(sessionId, 1);

// 追踪响应时间
await usageTracking.trackResponseTime(sessionId, 1500);

// 在会话结束时追踪
await usageTracking.trackSessionEnd(sessionId, 1000, 'positive');
```

## 集成步骤

### 1. 数据库迁移

运行迁移脚本创建新表：
```bash
npm run db:migrate
```

### 2. 在聊天API中集成

在 `/app/api/chat-proxy/route.ts` 中添加追踪：

```typescript
import { usageTracking } from '@/lib/middleware/usage-tracking';

export async function POST(request: NextRequest) {
    try {
        const { sessionId, userId, agentId, messages } = await request.json();

        // 开始追踪会话
        await usageTracking.trackSessionStart(
            sessionId,
            userId,
            agentId,
            'mixed', // 根据消息类型判断
            request
        );

        // 处理聊天请求...
        const startTime = Date.now();
        const response = await processChat(messages);
        const responseTime = Date.now() - startTime;

        // 追踪响应时间
        await usageTracking.trackResponseTime(sessionId, responseTime);

        // 追踪消息数量
        await usageTracking.trackMessage(sessionId, messages.length);

        return NextResponse.json(response);
    } catch (error) {
        // 错误处理...
    }
}
```

### 3. 在聊天界面中集成

在聊天组件中添加用户满意度追踪：

```typescript
// 用户点击点赞/点踩时
const handleFeedback = async (sessionId: string, feedback: 'positive' | 'negative') => {
    await usageTracking.trackSessionEnd(sessionId, undefined, feedback);

    // 更新UI状态
    setFeedback(feedback);
};
```

### 4. 管理后台集成

热点地图管理页面已创建在 `/app/admin/heatmap/page.tsx`，可以通过以下方式访问：

```typescript
// 在管理后台导航中添加链接
<Link href="/admin/heatmap">热点地图分析</Link>
```

## API 接口

### 1. 统计数据接口

```
GET /api/admin/heatmap
```

查询参数：
- `timeRange`: 1h, 24h, 7d, 30d, 90d, 1y
- `agentType`: fastgpt, cad-analyzer, image-editor
- `messageType`: text, image, file, voice, mixed
- `country`: 国家名称
- `startDate`: 开始日期 (ISO格式)
- `endDate`: 结束日期 (ISO格式)

### 2. 热点地图数据接口

```
GET /api/admin/heatmap/data
```

返回格式：
```json
{
    "success": true,
    "data": [
        {
            "id": "point_1",
            "latitude": 39.9042,
            "longitude": 116.4074,
            "count": 150,
            "country": "China",
            "city": "Beijing",
            "timeRange": {
                "start": "2024-01-01T00:00:00.000Z",
                "end": "2024-01-08T00:00:00.000Z"
            }
        }
    ]
}
```

### 3. 实时数据接口

```
GET /api/admin/heatmap/realtime
```

返回最近5分钟内的实时活动数据。

### 4. 数据导出接口

```
GET /api/admin/heatmap/export?format=csv
GET /api/admin/heatmap/export?format=json
```

## 配置说明

### 1. IP地理位置服务

当前使用的是基础的IP地理位置解析器，生产环境建议配置专业的服务：

```typescript
// 在 geo-location-service.ts 中添加真实的解析器
class IpApiResolver implements IpGeoResolver {
    public readonly name = 'IpApiResolver';

    public async resolve(ipAddress: string): Promise<GeoLocation> {
        const response = await fetch(`http://ip-api.com/json/${ipAddress}`);
        const data = await response.json();

        return {
            country: data.country,
            countryCode: data.countryCode,
            region: data.regionName,
            city: data.city,
            latitude: data.lat,
            longitude: data.lon,
            timezone: data.timezone,
        };
    }

    public async isAvailable(): Promise<boolean> {
        // 检查服务可用性
        return true;
    }
}
```

### 2. 缓存配置

地理位置数据默认缓存24小时，可以根据需要调整：

```typescript
const geoLocationService = new GeoLocationService(cacheManager);
geoLocationService.setCacheTTL(12 * 60 * 60 * 1000); // 12小时
```

### 3. 数据清理

自动清理90天前的地理位置数据和365天前的使用统计数据：

```typescript
// 手动触发清理
await usageTracking.cleanupOldData();

// 或者使用定时任务
setInterval(() => {
    usageTracking.cleanupOldData();
}, 24 * 60 * 60 * 1000); // 每天清理一次
```

## 性能优化

### 1. 数据库索引

已创建以下索引优化查询性能：
- 用户IP地址唯一索引
- 会话ID索引
- 时间戳索引
- 复合索引（用户+智能体+时间）
- 地理位置索引

### 2. 查询优化

- 使用分页查询避免大数据集
- 合理使用时间范围筛选
- 批量操作减少数据库访问

### 3. 缓存策略

- 地理位置数据缓存
- 统计数据缓存
- 实时数据使用WebSocket

## 监控和日志

### 1. 关键指标

- IP解析成功率
- 数据写入延迟
- 查询响应时间
- 数据清理效果

### 2. 错误处理

```typescript
try {
    const location = await geoLocationService.getLocationByIp(ip);
} catch (error) {
    logger.error('IP解析失败:', error);
    // 使用默认位置或重试
    const fallbackLocation = { country: 'Unknown', latitude: 0, longitude: 0 };
}
```

## 安全考虑

### 1. 数据隐私

- IP地址脱敏处理
- 不在客户端暴露真实地理位置数据
- 遵循GDPR等隐私法规

### 2. 权限控制

- 热点地图数据仅管理员可访问
- API接口需要身份验证
- 敏感数据加密存储

## 前端集成建议

### 1. 地图组件

推荐使用以下地图库：
- react-leaflet (开源)
- mapbox-gl (商业)
- google-maps-react (商业)

### 2. 图表组件

推荐使用以下图表库：
- recharts
- chart.js
- echarts

### 3. 实时更新

使用WebSocket或Server-Sent Events实现实时数据更新：

```typescript
const ws = new WebSocket('/api/admin/heatmap/realtime');
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updateHeatmap(data);
};
```

## 故障排除

### 1. 常见问题

**IP解析失败**
- 检查网络连接
- 验证API密钥
- 查看服务限制

**数据库查询慢**
- 检查索引是否生效
- 优化查询条件
- 考虑分表分区

**内存占用高**
- 调整缓存策略
- 优化数据结构
- 定期清理数据

### 2. 调试工具

- 使用浏览器开发者工具检查网络请求
- 查看数据库慢查询日志
- 监控API响应时间

## 扩展功能

### 1. 高级分析

- 用户行为分析
- 智能体性能对比
- 地区偏好分析
- 时间序列预测

### 2. 告警系统

- 异常访问检测
- 系统性能监控
- 用户满意度追踪

### 3. 数据导出

- 多格式导出 (CSV, JSON, Excel)
- 定时报告生成
- 自定义报表模板

---

通过以上集成步骤，可以在现有系统中完整实现热点地图功能，提供全面的用户行为分析和地理分布可视化。