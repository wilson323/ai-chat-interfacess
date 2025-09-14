'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Settings,
  BarChart3,
  Play,
  Trash2,
  Edit,
  Eye,
  Download,
  Upload,
} from 'lucide-react';
import type { ModelConfig } from '@/types/model-config';

export default function ModelConfigPage() {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // 模拟数据
  useEffect(() => {
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

    setModels(mockModels);
    setLoading(false);
  }, []);

  const filteredModels = models.filter(model => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || model.type === selectedType;
    const matchesStatus =
      selectedStatus === 'all' || model.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

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

  return (
    <div className='container mx-auto py-6 space-y-6'>
      {/* 页面标题 */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>模型配置管理</h1>
          <p className='text-gray-600 mt-2'>管理AI模型配置、参数和性能监控</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm'>
            <Upload className='h-4 w-4 mr-2' />
            导入配置
          </Button>
          <Button variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-2' />
            导出配置
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className='h-4 w-4 mr-2' />
            添加模型
          </Button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                <Input
                  placeholder='搜索模型名称或提供商...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='模型类型' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>所有类型</SelectItem>
                <SelectItem value='openai'>OpenAI</SelectItem>
                <SelectItem value='fastgpt'>FastGPT</SelectItem>
                <SelectItem value='local'>本地模型</SelectItem>
                <SelectItem value='custom'>自定义</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='状态' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>所有状态</SelectItem>
                <SelectItem value='active'>活跃</SelectItem>
                <SelectItem value='inactive'>非活跃</SelectItem>
                <SelectItem value='deprecated'>已弃用</SelectItem>
                <SelectItem value='testing'>测试中</SelectItem>
              </SelectContent>
            </Select>
            <Button variant='outline' size='sm'>
              <Filter className='h-4 w-4 mr-2' />
              更多筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 模型列表 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Settings className='h-5 w-5' />
            模型配置列表
            <Badge variant='secondary'>{filteredModels.length} 个模型</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>模型名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>提供商</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>能力</TableHead>
                <TableHead>使用次数</TableHead>
                <TableHead>最后更新</TableHead>
                <TableHead className='w-12'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModels.map(model => (
                <TableRow key={model.id}>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <div>
                        <div className='font-medium'>{model.name}</div>
                        <div className='text-sm text-gray-500'>
                          {model.version}
                        </div>
                      </div>
                      {model.isDefault && (
                        <Badge variant='outline' className='text-xs'>
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
                  <TableCell>{model.provider}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(model.status)}>
                      {model.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-1'>
                      {model.capabilities
                        .filter(cap => cap.supported)
                        .map((cap, index) => (
                          <Badge
                            key={index}
                            variant='outline'
                            className='text-xs'
                          >
                            {cap.type}
                          </Badge>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {model.metadata.usageCount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(model.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem>
                          <Eye className='h-4 w-4 mr-2' />
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className='h-4 w-4 mr-2' />
                          编辑配置
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className='h-4 w-4 mr-2' />
                          性能监控
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Play className='h-4 w-4 mr-2' />
                          测试模型
                        </DropdownMenuItem>
                        <DropdownMenuItem className='text-red-600'>
                          <Trash2 className='h-4 w-4 mr-2' />
                          删除模型
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 创建模型对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>添加新模型</DialogTitle>
            <DialogDescription>
              配置新的AI模型，包括基本信息和参数设置
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium'>模型名称</label>
                <Input placeholder='输入模型名称' />
              </div>
              <div>
                <label className='text-sm font-medium'>模型类型</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder='选择类型' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='openai'>OpenAI</SelectItem>
                    <SelectItem value='fastgpt'>FastGPT</SelectItem>
                    <SelectItem value='local'>本地模型</SelectItem>
                    <SelectItem value='custom'>自定义</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium'>提供商</label>
                <Input placeholder='输入提供商名称' />
              </div>
              <div>
                <label className='text-sm font-medium'>版本</label>
                <Input placeholder='输入版本号' />
              </div>
            </div>
            <div>
              <label className='text-sm font-medium'>描述</label>
              <Input placeholder='输入模型描述' />
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => setIsCreateDialogOpen(false)}
              >
                取消
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                创建模型
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
