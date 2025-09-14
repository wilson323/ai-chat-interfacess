'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { HeatmapQueryParams, UsageStatistics, HeatmapDataPoint } from '@/types/heatmap';
import { ApiResponse } from '@/types';

// 热点地图组件 (使用react-leaflet或类似的地图库)
const HeatmapMap: React.FC<{ data: HeatmapDataPoint[]; loading: boolean }> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-gray-500 text-center">
        <div className="text-lg font-semibold mb-2">热点地图</div>
        <div className="text-sm">需要集成地图库 (如 react-leaflet)</div>
        <div className="text-xs mt-2 text-gray-400">
          数据点: {data.length} 个
        </div>
      </div>
    </div>
  );
};

// 统计卡片组件
const StatCard: React.FC<{ title: string; value: string | number; description?: string; trend?: 'up' | 'down' }> = ({
  title,
  value,
  description,
  trend,
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {trend && (
        <Badge variant={trend === 'up' ? 'default' : 'destructive'}>
          {trend === 'up' ? '↗' : '↘'}
        </Badge>
      )}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

export default function HeatmapPage() {
  const [stats, setStats] = useState<UsageStatistics | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<HeatmapQueryParams>({
    timeRange: '7d',
    granularity: 'day',
  });

  // 获取统计数据
  const fetchStats = async () => {
    setLoading(true);
    try {
      const queryString = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryString.append(key, String(value));
        }
      });

      const response = await fetch(`/api/admin/heatmap?${queryString}`);
      const result: ApiResponse<UsageStatistics> = await response.json();

      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取热点地图数据
  const fetchHeatmapData = async () => {
    setLoading(true);
    try {
      const queryString = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryString.append(key, String(value));
        }
      });

      const response = await fetch(`/api/admin/heatmap/data?${queryString}`);
      const result: ApiResponse<HeatmapDataPoint[]> = await response.json();

      if (result.success && result.data) {
        setHeatmapData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 导出数据
  const exportData = async (format: 'csv' | 'json') => {
    try {
      const queryString = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryString.append(key, String(value));
        }
      });
      queryString.append('format', format);

      const response = await fetch(`/api/admin/heatmap/export?${queryString}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `heatmap_data_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchHeatmapData();
  }, [params]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">热点地图分析</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportData('csv')}>
            导出 CSV
          </Button>
          <Button variant="outline" onClick={() => exportData('json')}>
            导出 JSON
          </Button>
        </div>
      </div>

      {/* 筛选器 */}
      <Card>
        <CardHeader>
          <CardTitle>数据筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div>
              <label className="text-sm font-medium">时间范围</label>
              <Select
                value={params.timeRange}
                onValueChange={(value) => setParams({ ...params, timeRange: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1小时</SelectItem>
                  <SelectItem value="24h">24小时</SelectItem>
                  <SelectItem value="7d">7天</SelectItem>
                  <SelectItem value="30d">30天</SelectItem>
                  <SelectItem value="90d">90天</SelectItem>
                  <SelectItem value="1y">1年</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">智能体类型</label>
              <Select
                value={params.agentType || ''}
                onValueChange={(value) => setParams({ ...params, agentType: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部</SelectItem>
                  <SelectItem value="fastgpt">FastGPT</SelectItem>
                  <SelectItem value="cad-analyzer">CAD分析器</SelectItem>
                  <SelectItem value="image-editor">图像编辑器</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">消息类型</label>
              <Select
                value={params.messageType || ''}
                onValueChange={(value) => setParams({ ...params, messageType: value as any || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部</SelectItem>
                  <SelectItem value="text">文本</SelectItem>
                  <SelectItem value="image">图像</SelectItem>
                  <SelectItem value="file">文件</SelectItem>
                  <SelectItem value="voice">语音</SelectItem>
                  <SelectItem value="mixed">混合</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">聚合粒度</label>
              <Select
                value={params.granularity}
                onValueChange={(value) => setParams({ ...params, granularity: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">小时</SelectItem>
                  <SelectItem value="day">天</SelectItem>
                  <SelectItem value="week">周</SelectItem>
                  <SelectItem value="month">月</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">国家</label>
              <Select
                value={params.country || ''}
                onValueChange={(value) => setParams({ ...params, country: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部</SelectItem>
                  <SelectItem value="China">中国</SelectItem>
                  <SelectItem value="United States">美国</SelectItem>
                  <SelectItem value="Japan">日本</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={fetchStats} disabled={loading}>
                刷新数据
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="总会话数"
            value={stats.totalSessions.toLocaleString()}
            description="活跃会话总数"
          />
          <StatCard
            title="总消息数"
            value={stats.totalMessages.toLocaleString()}
            description="处理的消息总数"
          />
          <StatCard
            title="独立用户"
            value={stats.totalUsers.toLocaleString()}
            description="活跃用户数量"
          />
          <StatCard
            title="地理分布"
            value={stats.uniqueLocations.toLocaleString()}
            description="覆盖的地区数量"
          />
        </div>
      )}

      {/* 主要内容区域 */}
      <Tabs defaultValue="map" className="space-y-4">
        <TabsList>
          <TabsTrigger value="map">热点地图</TabsTrigger>
          <TabsTrigger value="agents">智能体分析</TabsTrigger>
          <TabsTrigger value="geography">地理分析</TabsTrigger>
          <TabsTrigger value="timeline">时间趋势</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>全球用户分布热点图</CardTitle>
            </CardHeader>
            <CardContent>
              <HeatmapMap data={heatmapData} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>智能体使用排行</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.topAgents ? (
                  <div className="space-y-2">
                    {stats.topAgents.map((agent, index) => (
                      <div key={agent.agentId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          <span className="font-medium">{agent.agentName}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{agent.usageCount.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{agent.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">暂无数据</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>消息类型分布</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.messageTypeDistribution ? (
                  <div className="space-y-2">
                    {stats.messageTypeDistribution.map((type, index) => (
                      <div key={type.type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          <span className="font-medium">{type.type}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{type.count.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{type.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">暂无数据</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>地区分布排行</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.topCountries ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.topCountries.map((country, index) => (
                    <div key={country.country} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant={index < 3 ? 'default' : 'outline'}>{index + 1}</Badge>
                        <span className="font-semibold">{country.country}</span>
                      </div>
                      <div className="text-2xl font-bold">{country.count.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{country.percentage.toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">暂无数据</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>时间趋势分析</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.timeSeriesData && stats.timeSeriesData.length > 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-lg font-semibold mb-2">时间趋势图表</div>
                  <div className="text-sm">需要集成图表库 (如 recharts)</div>
                  <div className="text-xs mt-2 text-gray-400">
                    数据点: {stats.timeSeriesData.length} 个
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">暂无数据</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}