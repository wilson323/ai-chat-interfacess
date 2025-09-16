'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Info, Settings, Zap, Shield } from 'lucide-react';
import type {
  ModelConfigFormData,
  CapabilityType,
} from '../../../types/model-config';


interface ModelConfigFormProps {
  initialData?: Partial<ModelConfigFormData>;
  onSubmit: (data: ModelConfigFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const capabilityTypes: {
  value: CapabilityType;
  label: string;
  description: string;
}[] = [
  { value: 'text', label: '文本生成', description: '支持文本生成和对话' },
  { value: 'image', label: '图像处理', description: '支持图像理解和生成' },
  { value: 'audio', label: '音频处理', description: '支持语音识别和合成' },
  { value: 'multimodal', label: '多模态', description: '支持多种输入类型' },
  { value: 'code', label: '代码生成', description: '支持代码生成和解释' },
  { value: 'function', label: '函数调用', description: '支持函数调用功能' },
];

export function ModelConfigForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: ModelConfigFormProps) {
  const [newTag, setNewTag] = useState('');
  const [newStopSequence, setNewStopSequence] = useState('');

  const form = useForm<ModelConfigFormData>({
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'openai',
      provider: initialData?.provider || '',
      version: initialData?.version || '',
      status: initialData?.status || 'active',
      capabilities: initialData?.capabilities || [
        { type: 'text', supported: true, maxTokens: 4000 },
      ],
      parameters: initialData?.parameters || {
        temperature: 0.7,
        maxTokens: 4000,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        stopSequences: [],
        customParameters: {},
      },
      metadata: {
        description: initialData?.metadata?.description || '',
        tags: initialData?.metadata?.tags || [],
        category: initialData?.metadata?.category || '',
        costPerToken: initialData?.metadata?.costPerToken || 0,
        latency: initialData?.metadata?.latency || 0,
        accuracy: initialData?.metadata?.accuracy || 0,
        version: initialData?.metadata?.version || '',
        releaseDate: initialData?.metadata?.releaseDate,
        documentation: initialData?.metadata?.documentation || '',
        examples: initialData?.metadata?.examples || [],
      },
      apiKey: initialData?.apiKey || '',
      apiEndpoint: initialData?.apiEndpoint || '',
      isDefault: initialData?.isDefault || false,
    },
  });

  const handleSubmit = (data: ModelConfigFormData) => {
    onSubmit(data);
  };

  const addCapability = (type: CapabilityType) => {
    const currentCapabilities = form.getValues('capabilities');
    if (!currentCapabilities.some((cap: any) => cap.type === type)) {
      form.setValue('capabilities', [
        ...currentCapabilities,
        { type, supported: true },
      ]);
    }
  };

  const removeCapability = (index: number) => {
    const currentCapabilities = form.getValues('capabilities');
    form.setValue(
      'capabilities',
      currentCapabilities.filter((_: any, i: number) => i !== index)
    );
  };

  const addTag = () => {
    if (newTag.trim()) {
      const currentTags = form.getValues('metadata.tags');
      if (!currentTags.includes(newTag.trim())) {
        form.setValue('metadata.tags', [...currentTags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    const currentTags = form.getValues('metadata.tags');
    form.setValue(
      'metadata.tags',
      currentTags.filter((t: string) => t !== tag)
    );
  };

  const addStopSequence = () => {
    if (newStopSequence.trim()) {
      const currentSequences = form.getValues('parameters.stopSequences');
      if (!currentSequences.includes(newStopSequence.trim())) {
        form.setValue('parameters.stopSequences', [
          ...currentSequences,
          newStopSequence.trim(),
        ]);
      }
      setNewStopSequence('');
    }
  };

  const removeStopSequence = (sequence: string) => {
    const currentSequences = form.getValues('parameters.stopSequences');
    form.setValue(
      'parameters.stopSequences',
      currentSequences.filter((s: string) => s !== sequence)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        <Tabs defaultValue='basic' className='w-full'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='basic'>基本信息</TabsTrigger>
            <TabsTrigger value='capabilities'>能力配置</TabsTrigger>
            <TabsTrigger value='parameters'>参数设置</TabsTrigger>
            <TabsTrigger value='advanced'>高级设置</TabsTrigger>
          </TabsList>

          {/* 基本信息 */}
          <TabsContent value='basic' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Info className='h-5 w-5' />
                  基本信息
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>模型名称 *</FormLabel>
                        <FormControl>
                          <Input placeholder='输入模型名称' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='type'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>模型类型 *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='选择模型类型' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='openai'>OpenAI</SelectItem>
                            <SelectItem value='fastgpt'>FastGPT</SelectItem>
                            <SelectItem value='local'>本地模型</SelectItem>
                            <SelectItem value='custom'>自定义</SelectItem>
                            <SelectItem value='azure'>Azure OpenAI</SelectItem>
                            <SelectItem value='anthropic'>Anthropic</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='provider'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>提供商 *</FormLabel>
                        <FormControl>
                          <Input placeholder='输入提供商名称' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='version'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>版本 *</FormLabel>
                        <FormControl>
                          <Input placeholder='输入版本号' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='metadata.description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>描述 *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='输入模型描述'
                          className='min-h-[100px]'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='metadata.category'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>分类 *</FormLabel>
                        <FormControl>
                          <Input placeholder='输入分类' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='status'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>状态 *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='选择状态' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='active'>活跃</SelectItem>
                            <SelectItem value='inactive'>非活跃</SelectItem>
                            <SelectItem value='deprecated'>已弃用</SelectItem>
                            <SelectItem value='testing'>测试中</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='isDefault'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>
                          设为默认模型
                        </FormLabel>
                        <FormDescription>
                          将此模型设为系统默认模型
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 能力配置 */}
          <TabsContent value='capabilities' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Zap className='h-5 w-5' />
                  能力配置
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-2'>
                  {capabilityTypes.map(cap => (
                    <Button
                      key={cap.value}
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => addCapability(cap.value)}
                      disabled={form
                        .watch('capabilities')
                        .some(c => c.type === cap.value)}
                    >
                      <Plus className='h-4 w-4 mr-2' />
                      {cap.label}
                    </Button>
                  ))}
                </div>

                <div className='space-y-2'>
                  {form.watch('capabilities').map((capability, index) => (
                    <Card key={index} className='p-4'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <Switch
                            checked={capability.supported}
                            onCheckedChange={checked => {
                              const capabilities =
                                form.getValues('capabilities');
                              capabilities[index].supported = checked;
                              form.setValue('capabilities', capabilities);
                            }}
                          />
                          <Label className='font-medium'>
                            {
                              capabilityTypes.find(
                                c => c.value === capability.type
                              )?.label
                            }
                          </Label>
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => removeCapability(index)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                      {capability.supported && (
                        <div className='mt-2 grid grid-cols-2 gap-2'>
                          {capability.type === 'text' && (
                            <div>
                              <Label className='text-sm'>最大令牌数</Label>
                              <Input
                                type='number'
                                value={capability.maxTokens || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  const capabilities =
                                    form.getValues('capabilities');
                                  capabilities[index].maxTokens =
                                    parseInt(e.target.value) || undefined;
                                  form.setValue('capabilities', capabilities);
                                }}
                                placeholder='4000'
                              />
                            </div>
                          )}
                          {capability.type === 'image' && (
                            <div>
                              <Label className='text-sm'>最大图片数</Label>
                              <Input
                                type='number'
                                value={capability.maxImages || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  const capabilities =
                                    form.getValues('capabilities');
                                  capabilities[index].maxImages =
                                    parseInt(e.target.value) || undefined;
                                  form.setValue('capabilities', capabilities);
                                }}
                                placeholder='10'
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 参数设置 */}
          <TabsContent value='parameters' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Settings className='h-5 w-5' />
                  参数设置
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='parameters.temperature'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>温度 (Temperature)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.1'
                            min='0'
                            max='2'
                            {...field}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          控制输出的随机性，0-2之间
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='parameters.maxTokens'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>最大令牌数</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>单次请求的最大令牌数</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='parameters.topP'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Top P</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.1'
                            min='0'
                            max='1'
                            {...field}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>核采样参数，0-1之间</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='parameters.frequencyPenalty'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>频率惩罚</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.1'
                            min='-2'
                            max='2'
                            {...field}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>-2到2之间</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='parameters.presencePenalty'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>存在惩罚</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0.1'
                          min='-2'
                          max='2'
                          {...field}
                          onChange={e =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>-2到2之间</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Label>停止序列</Label>
                  <div className='flex gap-2 mt-2'>
                    <Input
                      value={newStopSequence}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStopSequence(e.target.value)}
                      placeholder='输入停止序列'
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && addStopSequence()}
                    />
                    <Button type='button' onClick={addStopSequence}>
                      <Plus className='h-4 w-4' />
                    </Button>
                  </div>
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {form
                      .watch('parameters.stopSequences')
                      .map((sequence, index) => (
                        <Badge
                          key={index}
                          variant='secondary'
                          className='flex items-center gap-1'
                        >
                          {sequence}
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='h-4 w-4 p-0'
                            onClick={() => removeStopSequence(sequence)}
                          >
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        </Badge>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 高级设置 */}
          <TabsContent value='advanced' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Shield className='h-5 w-5' />
                  高级设置
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='apiKey'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API密钥</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='输入API密钥'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>用于访问模型API的密钥</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='apiEndpoint'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API端点</FormLabel>
                      <FormControl>
                        <Input placeholder='输入API端点URL' {...field} />
                      </FormControl>
                      <FormDescription>模型的API访问地址</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Label>标签</Label>
                  <div className='flex gap-2 mt-2'>
                    <Input
                      value={newTag}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
                      placeholder='输入标签'
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && addTag()}
                    />
                    <Button type='button' onClick={addTag}>
                      <Plus className='h-4 w-4' />
                    </Button>
                  </div>
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {form.watch('metadata.tags').map((tag, index) => (
                      <Badge
                        key={index}
                        variant='secondary'
                        className='flex items-center gap-1'
                      >
                        {tag}
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='h-4 w-4 p-0'
                          onClick={() => removeTag(tag)}
                        >
                          <Trash2 className='h-3 w-3' />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className='grid grid-cols-3 gap-4'>
                  <FormField
                    control={form.control}
                    name='metadata.costPerToken'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>每令牌成本</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.00001'
                            {...field}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='metadata.latency'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>延迟 (ms)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='metadata.accuracy'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>准确率</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.01'
                            min='0'
                            max='1'
                            {...field}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className='flex justify-end gap-2'>
          <Button type='button' variant='outline' onClick={onCancel}>
            取消
          </Button>
          <Button type='submit' disabled={loading}>
            {loading ? '保存中...' : '保存配置'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
