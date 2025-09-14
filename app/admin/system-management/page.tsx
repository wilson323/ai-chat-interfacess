'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Settings,
  Database,
  Server,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Plus,
  RefreshCw,
} from 'lucide-react';
import type { ModelConfig } from '@/types/model-config';
import { AgentProvider } from '@/context/agent-context';
import { LanguageProvider } from '@/context/language-context';
import Link from 'next/link';

interface SystemMetrics {
  totalModels: number;
  activeModels: number;
  totalRequests: number;
  errorRate: number;
  avgResponseTime: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  lastUpdated: Date;
}

interface RecentActivity {
  id: string;
  type: 'model_update' | 'system_change' | 'error' | 'deployment';
  message: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error';
}

export default function SystemManagementPage() {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<ModelConfig | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // 模拟系统指标数据
  useEffect(() => {
    const loadSystemData = async () => {
      setLoading(true);

      // 模拟模型数据
      const mockModels: ModelConfig[] = [
        {
          id: '1',
          name: 'GPT-4 Turbo',
          type: 'openai',
          provider: 'OpenAI',
          version: 'gpt-4-turbo-preview',
          status: 'active',
          capabilities: [
            { type: 'text', supported: true, maxTokens: 128000 },
            { type: 'multimodal', supported: true, maxImages: 10 },
          ],
          parameters: {
            temperature: 0.7,
            maxTokens: 4000,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0,
            stopSequences: [],
            customParameters: {},
          },
          metadata: {
            description: '最新的GPT-4模型，支持多模态输入',
            tags: ['gpt-4', 'multimodal', 'latest'],
            category: 'General Purpose',
            costPerToken: 0.00003,
            latency: 1200,
            accuracy: 0.95,
            usageCount: 1250,
            version: '1.0.0',
            releaseDate: new Date('2024-01-01'),
          },
          isDefault: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
          createdBy: 'admin',
          updatedBy: 'admin',
        },
        {
          id: '2',
          name: 'Qwen-VL-Max',
          type: 'fastgpt',
          provider: 'Alibaba',
          version: 'qwen-vl-max',
          status: 'active',
          capabilities: [
            { type: 'multimodal', supported: true, maxImages: 20 },
            { type: 'text', supported: true, maxTokens: 8000 },
          ],
          parameters: {
            temperature: 0.7,
            maxTokens: 2000,
            topP: 0.9,
            frequencyPenalty: 0,
            presencePenalty: 0,
            stopSequences: [],
            customParameters: {},
          },
          metadata: {
            description: '阿里云多模态大模型，擅长图像理解',
            tags: ['qwen', 'multimodal', 'vision'],
            category: 'Multimodal',
            costPerToken: 0.00002,
            latency: 800,
            accuracy: 0.92,
            usageCount: 890,
            version: '2.0.0',
            releaseDate: new Date('2024-02-01'),
          },
          isDefault: false,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-10'),
          createdBy: 'admin',
          updatedBy: 'admin',
        },
      ];

      // 模拟系统指标
      const mockMetrics: SystemMetrics = {
        totalModels: mockModels.length,
        activeModels: mockModels.filter(m => m.status === 'active').length,
        totalRequests: 15234,
        errorRate: 0.8,
        avgResponseTime: 950,
        systemHealth: 'excellent',
        lastUpdated: new Date(),
      };

      // 模拟最近活动
      const mockActivities: RecentActivity[] = [
        {
          id: '1',
          type: 'model_update',
          message: 'GPT-4 Turbo 配置已更新',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          status: 'success',
        },
        {
          id: '2',
          type: 'deployment',
          message: '系统部署完成',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          status: 'success',
        },
        {
          id: '3',
          type: 'error',
          message: '模型响应超时',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          status: 'error',
        },
        {
          id: '4',
          type: 'system_change',
          message: '数据库优化完成',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          status: 'success',
        },
      ];

      setModels(mockModels);
      setMetrics(mockMetrics);
      setActivities(mockActivities);
      setLoading(false);
    };

    loadSystemData();
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'deprecated':
        return 'bg-red-100 text-red-800';
      case 'testing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'openai':
        return 'bg-blue-100 text-blue-800';
      case 'fastgpt':
        return 'bg-purple-100 text-purple-800';
      case 'local':
        return 'bg-orange-100 text-orange-800';
      case 'custom':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'model_update':
        return <Settings className="h-4 w-4" />;
      case 'system_change':
        return <Server className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'deployment':
        return <Database className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const handleViewDetails = (model: ModelConfig) => {
    setSelectedModel(model);
    setIsDetailDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <AgentProvider>
        <div className="max-w-7xl mx-auto mb-4">
          <Link
            href="/admin"
            className="text-pantone369-500 hover:text-pantone369-600 flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7"></path>
              <path d="M19 12H5"></path>
            </svg>
            返回管理员首页
          </Link>
        </div>

        <div className="container mx-auto py-6 space-y-6">
          {/* 页面标题 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">系统管理</h1>
              <p className="text-gray-600 mt-2">监控系统状态、模型配置和系统性能</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新数据
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                添加模型
              </Button>
            </div>
          </div>

          {/* 系统概览卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">模型总数</p>
                    <p className="text-2xl font-bold">{metrics?.totalModels}</p>
                  </div>
                  <Server className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  活跃: {metrics?.activeModels}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">总请求数</p>
                    <p className="text-2xl font-bold">{metrics?.totalRequests?.toLocaleString()}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  今日: {Math.floor(metrics?.totalRequests! / 24)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">平均响应时间</p>
                    <p className="text-2xl font-bold">{metrics?.avgResponseTime}ms</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  目标: {"<"}1000ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">系统健康</p>
                    <p className="text-2xl font-bold">
                      <Badge className={getHealthColor(metrics?.systemHealth || 'good')}>
                        {metrics?.systemHealth}
                      </Badge>
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  错误率: {metrics?.errorRate}%
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 模型列表 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    模型配置
                    <Badge variant="secondary">{models.length} 个模型</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>模型名称</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>使用次数</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {models.map(model => (
                        <TableRow key={model.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="font-medium">{model.name}</div>
                                <div className="text-sm text-gray-500">
                                  {model.version}
                                </div>
                              </div>
                              {model.isDefault && (
                                <Badge variant="outline" className="text-xs">
                                  默认
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(model.type)}>
                              {model.type.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(model.status)}>
                              {model.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {model.metadata.usageCount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(model)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    查看详情
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    性能监控
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    编辑配置
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    删除模型
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* 最近活动 */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    最近活动
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activities.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-100' :
                        activity.status === 'warning' ? 'bg-yellow-100' :
                        'bg-red-100'
                      }`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 模型详情对话框 */}
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>模型详情</DialogTitle>
                <DialogDescription>
                  查看模型的详细配置和性能信息
                </DialogDescription>
              </DialogHeader>
              {selectedModel && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">模型名称</label>
                      <p className="text-sm text-gray-600">{selectedModel.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">提供商</label>
                      <p className="text-sm text-gray-600">{selectedModel.provider}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">版本</label>
                      <p className="text-sm text-gray-600">{selectedModel.version}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">状态</label>
                      <Badge className={getStatusColor(selectedModel.status)}>
                        {selectedModel.status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">描述</label>
                    <p className="text-sm text-gray-600">{selectedModel.metadata.description}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">能力</label>
                    <div className="flex gap-2 mt-1">
                      {selectedModel.capabilities
                        .filter(cap => cap.supported)
                        .map((cap, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {cap.type}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">延迟</label>
                      <p className="text-sm text-gray-600">{selectedModel.metadata.latency}ms</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">准确率</label>
                      <p className="text-sm text-gray-600">
                        {(selectedModel.metadata.accuracy * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">使用次数</label>
                      <p className="text-sm text-gray-600">
                        {selectedModel.metadata.usageCount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">成本/Token</label>
                      <p className="text-sm text-gray-600">
                        ${selectedModel.metadata.costPerToken.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </AgentProvider>
    </LanguageProvider>
  );
}