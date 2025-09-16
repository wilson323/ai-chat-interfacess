'use client';
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { logger } from '@/lib/utils/logger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bot, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLanguage } from '../../context/language-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { deleteAgent } from '@/lib/services/admin-agent-service';
import { initializeChat } from '@/lib/api/fastgpt';
import type { GlobalVariable, UnifiedAgent } from '@/types/agent';

export interface AgentFormProps {
  agent?: UnifiedAgent;
  onSave: (agentData: UnifiedAgent | undefined) => void;
  onClose: () => void;
}

export function AgentForm({ agent, onSave, onClose }: AgentFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();

  // 2. 初始化表单状态
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [apiUrl, setApiUrl] = useState(
    'https://zktecoaihub.com/api/v1/chat/completions'
  ); // API端点
  const [apiKey, setApiKey] = useState('');
  const [appId, setAppId] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  // 根据agent的类型设置初始类型，如果是新建则使用"fastgpt"
  const [type] = useState<import('@/types/agent').AgentType>(
    agent?.type || 'fastgpt'
  );
  const [activeTab, setActiveTab] = useState('basic');
  const [multimodalModel, setMultimodalModel] = useState('qwen-vl-max');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [supportsFileUpload, setSupportsFileUpload] = useState(true);
  const [supportsImageUpload, setSupportsImageUpload] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGettingParams, setIsGettingParams] = useState(false);
  const [order, setOrder] = useState<number>(agent?.order ?? 100);
  const [supportsStream, setSupportsStream] = useState(true);
  const [supportsDetail, setSupportsDetail] = useState(true);
  const [globalVariables, setGlobalVariables] = useState<GlobalVariable[]>([]);
  const [welcomeText, setWelcomeText] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (agent) {
      logger.debug(`Agent loaded: ${agent.name}, Type: ${agent.type}`);
      setName(agent.name || '');
      setDescription(agent.description || '');
      setApiUrl(
        agent.apiUrl || 'https://zktecoaihub.com/api/v1/chat/completions'
      );
      setApiKey(agent.apiKey || '');
      setAppId(agent.appId || '');
      setIsPublished(agent.isPublished || false);
      setMultimodalModel(agent.multimodalModel || 'qwen-vl-max');
      setSystemPrompt(agent.systemPrompt || '');
      setTemperature(agent.temperature ?? 0.7);
      setMaxTokens(agent.maxTokens ?? 2000);
      setSupportsFileUpload(
        agent.supportsFileUpload !== undefined ? agent.supportsFileUpload : true
      );
      setSupportsImageUpload(
        agent.supportsImageUpload !== undefined
          ? agent.supportsImageUpload
          : true
      );
      setOrder(agent.order ?? 100);
      setSupportsStream(
        agent.supportsStream !== undefined ? agent.supportsStream : true
      );
      setSupportsDetail(
        agent.supportsDetail !== undefined ? agent.supportsDetail : true
      );
      setGlobalVariables(agent.globalVariables || []);
      setWelcomeText(agent.welcomeText || '');
    } else {
      // 新增智能体时的默认值
      setName('');
      setDescription('');
      setApiUrl('https://zktecoaihub.com/api/v1/chat/completions');
      setApiKey('');
      setAppId('');
      setIsPublished(false);
      setMultimodalModel('qwen-vl-max');
      setSystemPrompt('');
      setTemperature(0.7);
      setMaxTokens(2000);
      setSupportsFileUpload(true);
      setSupportsImageUpload(true);
      setOrder(100);
      setSupportsStream(true);
      setSupportsDetail(true);
      setGlobalVariables([]);
      setWelcomeText('');
    }
  }, [agent]);

  // 验证API端点的有效性
  const validateApiEndpoint = (endpoint: string): boolean => {
    try {
      const url = new URL(endpoint);
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch (e) {
      return false;
    }
  };

  // 变量类型标签映射
  const getVariableTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      text: '文本',
      select: '选择框',
      custom: '自定义',
      number: '数字',
      boolean: '布尔值',
      option: '选项',
    };
    return typeMap[type] || type;
  };

  // 3. handleSubmit 支持新增和编辑
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logger.debug(`表单提交，类型: ${type}, 是否编辑模式: ${!!agent}`);

    // 对于FastGPT智能体，API Key和App ID是必填的，但在新增时可以先保存空值
    if (type === 'fastgpt' && (!apiKey || !appId) && agent) {
      toast({
        title: '保存失败',
        description: 'API Key 和 App ID 必填',
        variant: 'destructive',
      });
      return;
    }

    // 验证CAD智能体的API端点
    if (agent?.type === 'cad-analyzer' && !validateApiEndpoint(apiUrl)) {
      toast({
        title: 'API端点格式错误',
        description: '请输入有效的URL地址，以http://或https://开头',
        variant: 'destructive',
      });
      return;
    }

    // 如果CAD智能体的API端点被修改，显示确认对话框
    if (
      agent?.type === 'cad-analyzer' &&
      apiUrl !== 'https://zktecoaihub.com/api/v1/chat/completions' &&
      apiUrl !== agent?.apiUrl
    ) {
      if (
        !window.confirm(
          '您已修改CAD智能体的API端点，这可能会影响用户界面的功能。确定要保存吗？'
        )
      ) {
        return;
      }
    }

    setIsSaving(true);
    try {
      // 确保使用正确的type值，如果是编辑现有智能体，优先使用agent.type
      const agentType = agent?.type || type;
      logger.debug(`保存智能体，使用类型: ${agentType}, 原始类型: ${agent?.type}, 表单类型: ${type}`);

      const agentData: UnifiedAgent = {
        // 基础标识
        id: agent?.id || Date.now().toString(),
        name: name || '默认智能体',
        description: description || '',
        type: agentType,

        // 显示属性
        welcomeText: welcomeText || '',

        // 排序和状态
        order: Number(order) || 100,
        isPublished,
        isActive: true,

        // API配置
        apiUrl: apiUrl || 'https://zktecoaihub.com/api/v1/chat/completions',
        apiKey: apiKey || '',
        appId: appId || '',

        // 模型配置
        systemPrompt: systemPrompt || '',
        temperature: temperature ?? 0.7,
        maxTokens: maxTokens ?? 2000,
        ...(agentType === 'image-editor' || agentType === 'cad-analyzer'
          ? { multimodalModel: multimodalModel || 'qwen-vl-max' }
          : {}),

        // 功能支持
        supportsFileUpload,
        supportsImageUpload,
        supportsStream: true,
        supportsDetail: true,

        // 全局变量
        globalVariables: globalVariables || [],

        // 统一配置（必需）
        config: {
          version: '1.0.0',
          type: agentType,
          id: agent?.id || Date.now().toString(),
          name: name || '默认智能体',
          description: description || '',
          apiKey: apiKey || '',
          appId: appId || '',
          apiUrl: apiUrl || 'https://zktecoaihub.com/api/v1/chat/completions',
          systemPrompt: systemPrompt || '',
          temperature: temperature ?? 0.7,
          maxTokens: maxTokens ?? 2000,
          multimodalModel: agentType === 'image-editor' || agentType === 'cad-analyzer' ? (multimodalModel || 'qwen-vl-max') : undefined,
          supportsFileUpload,
          supportsImageUpload,
          supportsStream: true,
          supportsDetail: true,
          globalVariables: globalVariables || [],
          welcomeText: welcomeText || '',
          order: Number(order) || 100,
          isPublished,
          isActive: true,
          settings: {
            timeout: 30000,
            retryCount: 3,
            cacheEnabled: true,
            logLevel: 'info' as const,
            healthCheckInterval: 60000,
            circuitBreakerThreshold: 5,
            loadBalanceWeight: 1,
          },
          features: {
            streaming: true,
            fileUpload: supportsFileUpload,
            imageUpload: supportsImageUpload,
            voiceInput: false,
            voiceOutput: false,
            multimodal: agentType === 'image-editor' || agentType === 'cad-analyzer',
            detail: true,
            questionGuide: true,
          },
          limits: {
            maxTokens: maxTokens ?? 2000,
            maxFileSize: 10 * 1024 * 1024, // 10MB
            maxRequests: 1000,
            rateLimit: 100,
            maxConnections: 10,
          },
        },
      };

      logger.debug('准备保存智能体数据:', JSON.stringify(agentData, null, 2));

      try {
        await onSave(agentData);
        logger.debug('智能体保存成功');
        toast({
          title: agent ? '智能体已更新' : '智能体已创建',
          variant: 'default',
        });
      } catch (saveError) {
        logger.error('调用onSave失败:', saveError);
        toast({
          title: '保存失败',
          description: String(saveError),
          variant: 'destructive',
        });
      }
    } catch (err) {
      logger.error('表单提交过程中发生错误:', err);
      toast({
        title: '保存失败',
        description: String(err),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };


  const handleDelete = async () => {
    if (!agent) return;
    if (window.confirm(`${t('confirmDelete')} ${agent.name}?`)) {
      try {
        await deleteAgent(agent.id);
        toast({
          title: t('agentDeleted'),
          description: `${agent.name} ${t('agentDeleted')}.`,
          variant: 'destructive',
        });
        // 兼容未选中状态
        if (typeof onSave === 'function') onSave(undefined);
      } catch (error) {
        toast({
          title: '错误',
          description: '删除智能体失败',
          variant: 'destructive',
        });
      }
    }
  };

  // 获取参数处理函数
  const handleGetParameters = async () => {
    if (!apiKey || !appId) {
      toast({
        title: '参数不完整',
        description: '请先输入 API 密钥和 App ID',
        variant: 'destructive',
      });
      return;
    }

    setIsGettingParams(true);
    try {
      toast({ title: '正在获取参数...', description: '请稍候' });

      // 构造临时智能体对象用于调用初始化接口
      const tempAgent = {
        id: Date.now().toString(), // 临时ID
        description: '', // 默认空描述
        apiKey,
        appId,
        apiUrl: apiUrl || 'https://zktecoaihub.com/api/v1/chat/completions',
        name: name || '临时智能体',
        type: 'fastgpt' as const,
        supportsStream: true, // 默认值
        supportsDetail: true, // 默认值
        isActive: true, // 默认激活
      };

      // 调用 FastGPT 初始化接口
      const response = await initializeChat(tempAgent);

      if (response.code === 200 && response.data) {
        const { app } = response.data;

        // 自动回填字段
        if (app.name && !name) {
          setName(app.name);
        }

        if (app.intro && !description) {
          setDescription(app.intro);
        }

        if (app.chatConfig?.welcomeText) {
          setWelcomeText(app.chatConfig.welcomeText);
          if (!systemPrompt) {
            setSystemPrompt(app.chatConfig.welcomeText);
          }
        }

        // 处理全局变量
        if (
          app.chatConfig?.variables &&
          Array.isArray(app.chatConfig.variables)
        ) {
          setGlobalVariables(app.chatConfig.variables as GlobalVariable[]);
        }

        // 如果有模型信息，设置多模态模型
        if (app.chatModels && app.chatModels.length > 0) {
          setMultimodalModel(app.chatModels[0]);
        }

        // 设置文件上传支持
        if (app.chatConfig?.fileSelectConfig) {
          setSupportsFileUpload(
            app.chatConfig.fileSelectConfig.canSelectFile || false
          );
          setSupportsImageUpload(
            app.chatConfig.fileSelectConfig.canSelectImg || false
          );
        }

        toast({
          title: '参数获取成功',
          description: '已自动回填相关配置信息',
          variant: 'default',
        });
      } else {
        toast({
          title: '获取参数失败',
          description:
            '无法从 FastGPT 获取配置信息，请检查 API 密钥和 App ID 是否正确',
          variant: 'destructive',
        });
      }
    } catch (error) {
      logger.error('获取参数失败:', error);
      toast({
        title: '获取参数失败',
        description: String(error),
        variant: 'destructive',
      });
    } finally {
      setIsGettingParams(false);
    }
  };

  // 移除了对agent为null的判断，使新增智能体时也能显示表单

  return (
    <Card className='border-pantone369-100 dark:border-pantone369-900/30 h-full flex flex-col max-h-[90vh]'>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className='flex flex-col h-full'
      >
        <CardHeader className='bg-pantone369-50/50 dark:bg-pantone369-900/10 flex flex-row items-center justify-between'>
          <div className='flex items-center gap-4 w-full'>
            <CardTitle className='flex items-center gap-2'>
              <Bot className='h-5 w-5 text-pantone369-500' />
              {agent ? t('editAgent') : t('newAgent')}
            </CardTitle>
            <div className='flex items-center gap-2 ml-auto'>
              <Label htmlFor='isPublished' className='text-xs'>
                {isPublished ? t('published') : t('draft')}
              </Label>
              <Switch
                id='isPublished'
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
            </div>
          </div>
          <Button type='button' variant='ghost' onClick={onClose}>
            关闭
          </Button>
        </CardHeader>
        <CardContent className='space-y-4 p-6 flex-1 overflow-y-auto min-h-0'>
          <Alert className='bg-pantone369-50/50 dark:bg-pantone369-900/10 border-pantone369-200 dark:border-pantone369-800/30'>
            <AlertCircle className='h-4 w-4 text-pantone369-500' />
            <AlertTitle>{t('fastGPTConfiguration')}</AlertTitle>
            <AlertDescription>
              {t('fastGPTConfigurationDescription')}
            </AlertDescription>
          </Alert>

          <Tabs
            defaultValue='basic'
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='grid grid-cols-3 w-full mb-4 bg-pantone369-50 dark:bg-pantone369-900/20'>
              <TabsTrigger
                value='basic'
                className='data-[state=active]:bg-pantone369-100 dark:data-[state=active]:bg-pantone369-800/30'
              >
                {t('basicSettings')}
              </TabsTrigger>
              <TabsTrigger
                value='advanced'
                className='data-[state=active]:bg-pantone369-100 dark:data-[state=active]:bg-pantone369-800/30'
              >
                {t('advancedSettings')}
              </TabsTrigger>
              <TabsTrigger
                value='model'
                className='data-[state=active]:bg-pantone369-100 dark:data-[state=active]:bg-pantone369-800/30'
              >
                {t('modelSettings')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value='basic' className='space-y-4'>
              <div className='flex items-center justify-between p-3 rounded-md bg-pantone369-50/50 dark:bg-pantone369-900/10'>
                <Label
                  htmlFor='published'
                  className='flex items-center gap-2 font-medium'
                >
                  {t('publishedStatus')}
                </Label>
                <div className='flex items-center gap-2'>
                  <Switch
                    id='published'
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                  <span className='text-sm text-muted-foreground'>
                    {isPublished ? t('published') : t('draft')}
                  </span>
                </div>
              </div>

              <div className='grid gap-2'>
                <Label
                  htmlFor='name'
                  className='text-pantone369-700 dark:text-pantone369-300'
                >
                  {t('agentName')} <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='name'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder='e.g., Customer Support Bot'
                  required
                  className='border-pantone369-200 dark:border-pantone369-800/30 focus:border-pantone369-500 focus:ring-pantone369-500/20'
                />
              </div>

              <div className='grid gap-2'>
                <Label
                  htmlFor='description'
                  className='text-pantone369-700 dark:text-pantone369-300'
                >
                  {t('description')}
                </Label>
                <Textarea
                  id='description'
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={t('agentDescriptionPlaceholder')}
                  rows={3}
                  className='border-pantone369-200 dark:border-pantone369-800/30 focus:border-pantone369-500 focus:ring-pantone369-500/20'
                />
              </div>
            </TabsContent>

            <TabsContent value='advanced' className='space-y-4'>
              <div className='grid gap-2'>
                <Label
                  htmlFor='apiUrl'
                  className='text-pantone369-700 dark:text-pantone369-300'
                >
                  {t('apiEndpoint')} <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='apiUrl'
                  value={apiUrl}
                  onChange={e => setApiUrl(e.target.value)}
                  placeholder='https://zktecoaihub.com/api/v1/chat/completions'
                  required
                  className='border-pantone369-200 dark:border-pantone369-800/30 focus:border-pantone369-500 focus:ring-pantone369-500/20'
                  disabled={agent?.type !== 'cad-analyzer'} // 只允许CAD智能体修改API端点
                />
                {agent?.type === 'cad-analyzer' && (
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    className='mt-2'
                    onClick={async () => {
                      if (!validateApiEndpoint(apiUrl)) {
                        toast({
                          title: 'API端点格式错误',
                          description:
                            '请输入有效的URL地址，以http://或https://开头',
                          variant: 'destructive',
                        });
                        return;
                      }

                      try {
                        toast({
                          title: '正在测试API端点...',
                          description: '请稍候',
                        });
                        const response = await fetch('/api/chat-proxy', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            targetUrl: apiUrl,
                            method: 'GET',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${apiKey || 'test-key'}`,
                            },
                          }),
                        });

                        if (response.ok) {
                          toast({
                            title: 'API端点测试成功',
                            description: '连接正常，可以保存设置',
                            variant: 'default',
                          });
                        } else {
                          toast({
                            title: 'API端点测试失败',
                            description: `HTTP状态码: ${response.status}`,
                            variant: 'destructive',
                          });
                        }
                      } catch (error) {
                        toast({
                          title: 'API端点测试失败',
                          description: String(error),
                          variant: 'destructive',
                        });
                      }
                    }}
                  >
                    测试API端点
                  </Button>
                )}
                <p className='text-xs text-muted-foreground'>
                  {agent?.type === 'cad-analyzer'
                    ? '注意：修改API端点可能会影响CAD智能体的功能，请确保输入正确的API端点。建议使用默认值：https://zktecoaihub.com/api/v1/chat/completions'
                    : t('apiEndpointDescription')}
                </p>
                {agent?.type === 'cad-analyzer' &&
                  apiUrl !==
                    'https://zktecoaihub.com/api/v1/chat/completions' && (
                    <p className='text-xs text-amber-500 mt-1'>
                      警告：您已修改默认API端点，这可能会影响CAD智能体的功能。请确保新的API端点支持相同的请求格式。
                    </p>
                  )}
              </div>

              <div className='grid gap-2'>
                <Label
                  htmlFor='apiKey'
                  className='text-pantone369-700 dark:text-pantone369-300'
                >
                  {t('apiKey')} <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='apiKey'
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder='fastgpt-xxxx'
                  type='password'
                  required
                  className='border-pantone369-200 dark:border-pantone369-800/30 focus:border-pantone369-500 focus:ring-pantone369-500/20'
                />
                <p className='text-xs text-muted-foreground'>
                  {t('apiKeyDescription')}
                </p>
              </div>

              <div className='grid gap-2'>
                <Label
                  htmlFor='appId'
                  className='text-pantone369-700 dark:text-pantone369-300'
                >
                  {t('appId')} <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='appId'
                  value={appId}
                  onChange={e => setAppId(e.target.value)}
                  placeholder='c-xxxxxxxxxxxxxxxx'
                  className='border-pantone369-200 dark:border-pantone369-800/30 focus:border-pantone369-500 focus:ring-pantone369-500/20'
                  required
                />
                <p className='text-xs text-muted-foreground'>
                  {t('appIdDescription')}
                </p>
              </div>

              {/* 获取参数按钮 - 仅对FastGPT智能体显示 */}
              {type === 'fastgpt' && apiKey && appId && (
                <div className='flex justify-center'>
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    className='bg-pantone369-50 hover:bg-pantone369-100 border-pantone369-200 text-pantone369-700'
                    onClick={handleGetParameters}
                    disabled={isGettingParams}
                  >
                    {isGettingParams ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-pantone369-500 mr-2'></div>
                        获取参数中...
                      </>
                    ) : (
                      <>
                        <svg
                          className='w-4 h-4 mr-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12'
                          />
                        </svg>
                        获取参数
                      </>
                    )}
                  </Button>
                </div>
              )}
              {type === 'fastgpt' && (!apiKey || !appId) && (
                <div className='text-center'>
                  <p className='text-xs text-muted-foreground'>
                    请先输入 API 密钥和 App ID 后点击&quot;获取参数&quot;按钮
                  </p>
                </div>
              )}

              <div className='flex items-center justify-between p-3 rounded-md bg-pantone369-50/50 dark:bg-pantone369-900/10'>
                <Label
                  htmlFor='supportsFileUpload'
                  className='flex items-center gap-2 font-medium'
                >
                  <span>允许文件上传</span>
                  <Switch
                    id='supportsFileUpload'
                    checked={supportsFileUpload}
                    onCheckedChange={setSupportsFileUpload}
                    className='ml-2'
                  />
                  <span className='text-sm text-muted-foreground'>
                    {supportsFileUpload ? '已启用' : '已禁用'}
                  </span>
                </Label>
                <Label
                  htmlFor='supportsImageUpload'
                  className='flex items-center gap-2 font-medium'
                >
                  <span>允许图片上传</span>
                  <Switch
                    id='supportsImageUpload'
                    checked={supportsImageUpload}
                    onCheckedChange={setSupportsImageUpload}
                    className='ml-2'
                  />
                  <span className='text-sm text-muted-foreground'>
                    {supportsImageUpload ? '已启用' : '已禁用'}
                  </span>
                </Label>
              </div>
              <p className='text-xs text-muted-foreground'>
                启用后，用户可以向此智能体上传文件和图片
              </p>

              <div className='grid gap-2'>
                <Label
                  htmlFor='systemPrompt'
                  className='text-pantone369-700 dark:text-pantone369-300'
                >
                  开场白
                </Label>
                <Textarea
                  id='systemPrompt'
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  placeholder='设置智能体的开场白，定义其初始问候...'
                  rows={5}
                  className='border-pantone369-200 dark:border-pantone369-800/30 focus:border-pantone369-500 focus:ring-pantone369-500/20'
                />
                <p className='text-xs text-muted-foreground'>
                  定义智能体的初始问候语
                </p>
              </div>

              <div className='grid gap-2'>
                <Label
                  htmlFor='order'
                  className='text-pantone369-700 dark:text-pantone369-300'
                >
                  排序权重 <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='order'
                  type='number'
                  min={1}
                  step={1}
                  value={order}
                  onChange={e => setOrder(Number(e.target.value))}
                  required
                  className='border-pantone369-200 dark:border-pantone369-800/30 focus:border-pantone369-500 focus:ring-pantone369-500/20'
                  placeholder='数值越小越靠前，默认100'
                />
                <p className='text-xs text-muted-foreground'>
                  用于控制智能体在列表中的显示顺序，数值越小越靠前
                </p>
              </div>

              {/* 全局变量显示区域 - 仅对FastGPT智能体显示 */}
              {type === 'fastgpt' && (
                <div className='space-y-2'>
                  <Label className='text-pantone369-700 dark:text-pantone369-300'>
                    全局变量
                  </Label>
                  <div className='border rounded-md p-4 space-y-2 bg-pantone369-50/30 dark:bg-pantone369-900/10'>
                    {globalVariables.length > 0 ? (
                      <div className='space-y-2'>
                        <div className='grid grid-cols-4 gap-2 font-medium text-sm text-pantone369-600 dark:text-pantone369-400 pb-1 border-b border-pantone369-200 dark:border-pantone369-800'>
                          <div>变量名</div>
                          <div>类型</div>
                          <div>是否必填</div>
                          <div>描述</div>
                        </div>
                        {globalVariables.map((variable, index) => (
                          <div
                            key={variable.id || index}
                            className='grid grid-cols-4 gap-2 items-center text-sm py-1 border-b border-pantone369-100 dark:border-pantone369-800/30'
                          >
                            <div className='font-medium text-pantone369-700 dark:text-pantone369-300'>
                              {variable.label || variable.key}
                            </div>
                            <div className='text-pantone369-600 dark:text-pantone369-400'>
                              {getVariableTypeLabel(variable.type)}
                            </div>
                            <div
                              className={
                                variable.required
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-green-600 dark:text-green-400'
                              }
                            >
                              {variable.required ? '必填' : '选填'}
                            </div>
                            <div
                              className='truncate text-pantone369-600 dark:text-pantone369-400'
                              title={variable.description}
                            >
                              {variable.description || '-'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='text-pantone369-500 dark:text-pantone369-400 text-center py-4'>
                        {apiKey && appId
                          ? '暂无全局变量，点击"获取参数"按钮从FastGPT获取'
                          : '请先输入API密钥和App ID，然后点击"获取参数"按钮'}
                      </div>
                    )}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    全局变量由FastGPT应用配置决定，用于在对话中传递特定参数。点击&quot;获取参数&quot;按钮可自动获取最新配置。
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value='model' className='space-y-4'>
              <div className='grid gap-2'>
                <Label
                  htmlFor='temperature'
                  className='text-pantone369-700 dark:text-pantone369-300'
                >
                  {t('temperature')}: {temperature.toFixed(1)}
                </Label>
                <Slider
                  id='temperature'
                  min={0}
                  max={2}
                  step={0.1}
                  value={[temperature]}
                  onValueChange={value => setTemperature(value[0])}
                  className='py-4'
                />
                <p className='text-xs text-muted-foreground'>
                  {t('temperatureDescription')}
                </p>
              </div>

              <div className='grid gap-2'>
                <Label
                  htmlFor='maxTokens'
                  className='text-pantone369-700 dark:text-pantone369-300'
                >
                  {t('maxTokens')}: {maxTokens}{' '}
                  {type !== 'fastgpt' && (
                    <span className='text-red-500'>*</span>
                  )}
                </Label>
                <Slider
                  id='maxTokens'
                  min={100}
                  max={8000}
                  step={100}
                  value={[maxTokens]}
                  onValueChange={value => setMaxTokens(value[0])}
                  className='py-4'
                  disabled={type === 'fastgpt'}
                />
                <p className='text-xs text-muted-foreground'>
                  {t('maxTokensDescription')}
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className='flex gap-4 mt-4'>
            <div>
              <label className='block text-xs text-muted-foreground mb-1'>
                支持流式
              </label>
              <span className='inline-block px-2 py-1 rounded bg-muted text-xs'>
                {String(supportsStream ?? true)}
              </span>
            </div>
            <div>
              <label className='block text-xs text-muted-foreground mb-1'>
                支持详细
              </label>
              <span className='inline-block px-2 py-1 rounded bg-muted text-xs'>
                {String(supportsDetail ?? true)}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className='flex justify-end gap-2 mt-6'>
          {agent && (
            <Button variant='destructive' type='button' onClick={handleDelete}>
              删除
            </Button>
          )}
          <Button
            type='submit'
            disabled={isSaving}
            className='bg-pantone369-500 hover:bg-pantone369-600'
          >
            {isSaving ? '保存中...' : agent ? '更新' : '创建'}
          </Button>
          <Button type='button' variant='outline' onClick={onClose}>
            关闭
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
