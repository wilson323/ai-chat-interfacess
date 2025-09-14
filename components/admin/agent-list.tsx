'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgent } from '@/context/agent-context';
import { Bot, Plus, Search, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast/use-toast';
import { useLanguage } from '@/context/language-context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CadIcon } from '@/components/ui/icons/CadIcon';
import { AgentForm } from '@/components/admin/agent-form';
import { Switch } from '@/components/ui/switch';
import {
  fetchAgents,
  createAgent,
  updateAgent,
  deleteAgent,
} from '@/lib/services/admin-agent-service';
import { AgentType } from '@/types/agent';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface AgentListProps {
  typeFilter?: string;
}

export function AgentList({ typeFilter: propTypeFilter }: AgentListProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>(
    propTypeFilter || 'fastgpt'
  );
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [switchLoadingId, setSwitchLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (propTypeFilter) setTypeFilter(propTypeFilter);
    setLoading(true);
    fetchAgents()
      .then(setAgents)
      .catch(err => {
        toast({
          title: '加载失败',
          description: String(err?.message || err),
          variant: 'destructive',
        });
        if (String(err?.message).includes('无权限')) {
          setTimeout(() => {
            window.location.href = '/admin/login';
          }, 1500);
        }
      })
      .finally(() => setLoading(false));
  }, [propTypeFilter]);

  const isFastgptType = (type: string) =>
    type === 'fastgpt' || type === 'cad-analyzer' || type === 'image-editor';

  const filteredAgents = useMemo(() => {
    // 根据typeFilter过滤不同类型的智能体
    if (typeFilter === 'fastgpt') {
      return agents.filter(
        agent =>
          agent.type === 'fastgpt' &&
          agent.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (typeFilter === 'cad-analyzer') {
      return agents.filter(
        agent =>
          agent.type === 'cad-analyzer' &&
          agent.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (typeFilter === 'image-editor') {
      return agents.filter(
        agent =>
          agent.type === 'image-editor' &&
          agent.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // 如果没有指定typeFilter或者是其他类型，显示所有智能体
    return agents.filter(agent =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [agents, searchQuery, typeFilter]);

  const typeLabel = (type: string) => {
    switch (type) {
      case 'fastgpt':
        return 'FastGPT';
      case 'chat':
        return '聊天型';
      case 'image-editor':
        return '图像编辑';
      case 'cad-analyzer':
        return 'CAD解读';
      default:
        return type;
    }
  };

  const getAgentIcon = (agent: any) => {
    if (agent.iconType === 'cad') return <CadIcon className='h-5 w-5' />;
    return (
      <Bot className='h-5 w-5 text-pantone369-600 dark:text-pantone369-400' />
    );
  };

  const handleAddAgentClick = () => {
    setEditingAgent(null);
    setShowAgentForm(true);
  };

  const handleEditAgentClick = (agent: any) => {
    setEditingAgent(agent);
    setShowAgentForm(true);
  };

  const handleAgentFormSave = async (agentData: any) => {
    console.log(
      'AgentList - handleAgentFormSave 开始执行, 编辑模式:',
      !!editingAgent
    );
    let newAgentId = null;
    try {
      if (editingAgent) {
        console.log('更新现有智能体:', editingAgent.id);
        await handleUpdateAgent({ ...editingAgent, ...agentData });
      } else {
        // 根据当前的typeFilter设置智能体类型
        const agentType = typeFilter || 'fastgpt';
        console.log('创建新智能体, 类型:', agentType);

        try {
          const newAgent = await createAgent({
            ...agentData,
            type: agentType, // 使用当前选中的类型
          });
          console.log('新智能体创建成功:', newAgent);
          newAgentId = newAgent.id;
          toast({ title: '智能体创建成功', variant: 'default' });
        } catch (createError) {
          console.error('创建智能体失败:', createError);
          toast({
            title: '创建智能体失败',
            description: String(createError),
            variant: 'destructive',
          });
          return; // 创建失败时直接返回，不关闭表单
        }
      }

      setLoading(true);
      // 刷新列表后自动选中新建的智能体
      fetchAgents()
        .then(fetched => {
          console.log('刷新智能体列表成功, 数量:', fetched.length);
          setAgents(fetched);
          if (newAgentId) {
            const created = fetched.find(a => a.id === newAgentId);
            console.log('查找新创建的智能体:', created ? '找到' : '未找到');
            setSelectedAgent(created || null);
          }
        })
        .catch(error => {
          console.error('刷新智能体列表失败:', error);
        })
        .finally(() => setLoading(false));

      setShowAgentForm(false);
      setEditingAgent(null);
    } catch (error) {
      console.error('handleAgentFormSave 执行失败:', error);
      toast({
        title: '操作失败',
        description: String(error),
        variant: 'destructive',
      });
    }
  };

  const handleUpdateAgent = async (agent: any) => {
    console.log(`开始更新智能体[${agent.id}:${agent.name}]，数据:`, {
      id: agent.id,
      name: agent.name,
      isPublished: agent.isPublished,
      type: agent.type,
    });

    try {
      // 调用API更新智能体
      const updated = await updateAgent(agent);

      console.log(`智能体[${agent.id}:${agent.name}]更新成功，返回数据:`, {
        id: updated.id,
        name: updated.name,
        isPublished: updated.isPublished,
        type: updated.type,
      });

      // 更新本地状态
      setAgents(prev => prev.map(a => (a.id === updated.id ? updated : a)));

      // 显示成功提示
      toast({ title: t('agentUpdated'), description: agent.name });

      return updated;
    } catch (e) {
      console.error(`更新智能体[${agent.id}:${agent.name}]失败:`, e);
      toast({ title: '错误', description: String(e), variant: 'destructive' });
      throw e; // 重新抛出错误，让调用者可以处理
    }
  };

  const handleDeleteAgent = async (id: string) => {
    try {
      await deleteAgent(id);
      setLoading(true);
      fetchAgents()
        .then(setAgents)
        .finally(() => setLoading(false));
      toast({ title: t('agentDeleted') });
    } catch (e) {
      toast({ title: '错误', description: String(e), variant: 'destructive' });
    }
  };

  return (
    <>
      <Card className='h-full flex flex-col max-h-[90vh]'>
        <CardHeader className='pb-3 sticky top-0 z-10 bg-background'>
          <CardTitle className='text-lg font-medium flex items-center justify-between'>
            <span className='flex items-center gap-2'>
              <Bot className='h-4 w-4 text-pantone369-500' />
              {typeFilter === 'fastgpt' && 'FastGPT 智能体管理'}
              {typeFilter === 'cad-analyzer' && 'CAD 智能体管理'}
              {typeFilter === 'image-editor' && '图像编辑智能体管理'}
              {!typeFilter && t('agents')}
            </span>
            <div className='flex gap-2'>
              {!propTypeFilter && (
                <>
                  <Button
                    size='sm'
                    variant={typeFilter === 'fastgpt' ? 'default' : 'outline'}
                    onClick={() => setTypeFilter('fastgpt')}
                  >
                    FastGPT
                  </Button>
                  <Button
                    size='sm'
                    variant={
                      typeFilter === 'cad-analyzer' ? 'default' : 'outline'
                    }
                    onClick={() => setTypeFilter('cad-analyzer')}
                  >
                    CAD
                  </Button>
                  <Button
                    size='sm'
                    variant={
                      typeFilter === 'image-editor' ? 'default' : 'outline'
                    }
                    onClick={() => setTypeFilter('image-editor')}
                  >
                    图像编辑
                  </Button>
                </>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent
          className='flex-1 min-h-0 overflow-y-auto pt-6 md:pt-8'
          style={{ scrollMarginTop: '64px' }}
        >
          <div className='relative mb-4'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder={t('searchAgents')}
              className='pl-9 bg-background'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <ScrollArea className='h-[400px] pr-4'>
            <div className='space-y-2'>
              <Button
                size='sm'
                onClick={() => {
                  setEditingAgent(null);
                  setSelectedAgent(null);
                  setShowAgentForm(true);
                  // 不再强制设置typeFilter为'fastgpt'，保持当前页面的typeFilter
                }}
                className='w-full mb-2 bg-pantone369-500 hover:bg-pantone369-600'
              >
                <Plus className='h-3.5 w-3.5 mr-1' />
                {typeFilter === 'fastgpt' && '新增 FastGPT 智能体'}
                {typeFilter === 'cad-analyzer' && '新增 CAD 智能体'}
                {typeFilter === 'image-editor' && '新增图像编辑智能体'}
                {!typeFilter && '新增智能体'}
              </Button>
              {filteredAgents.length > 0 ? (
                filteredAgents.map(agent => (
                  <div
                    key={agent.id}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-all',
                      'hover:bg-accent/50 relative group',
                      selectedAgent?.id === agent.id
                        ? 'bg-accent/70 border-pantone369-200 dark:border-pantone369-800'
                        : 'border-border'
                    )}
                    onClick={() => {
                      setSelectedAgent(agent);
                      handleEditAgentClick(agent);
                    }}
                  >
                    <div className='flex gap-2 mr-3 shrink-0 z-10 items-center'>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 rounded-full text-pantone369-600 dark:text-pantone369-400 hover:bg-pantone369-50 dark:hover:bg-pantone369-900/20'
                              onClick={e => {
                                e.stopPropagation();
                                handleEditAgentClick(agent);
                              }}
                            >
                              <Settings className='h-4 w-4' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('editAgent')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {agent.type === 'cad-analyzer' && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant='outline'
                                size='sm'
                                className='ml-2'
                                onClick={e => {
                                  e.stopPropagation();
                                  window.open(
                                    `/admin/cad-analyzer-history`,
                                    '_blank'
                                  );
                                }}
                              >
                                查看历史记录
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>查看CAD分析历史记录</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-md bg-pantone369-100 dark:bg-pantone369-900/30 flex items-center justify-center shrink-0'>
                        {getAgentIcon(agent)}
                      </div>

                      <div className='min-w-0 flex-1'>
                        <div className='font-medium truncate flex items-center gap-2'>
                          {agent.name}
                          {agent.isPublished ? (
                            <Badge
                              variant='outline'
                              className='bg-pantone369-100 dark:bg-pantone369-900/30 text-pantone369-700 dark:text-pantone369-400 border-pantone369-200 dark:border-pantone369-800'
                            >
                              {t('published')}
                            </Badge>
                          ) : (
                            <Badge
                              variant='outline'
                              className='bg-muted/30 text-muted-foreground'
                            >
                              {t('draft')}
                            </Badge>
                          )}
                          <Switch
                            checked={agent.isPublished}
                            disabled={switchLoadingId === agent.id}
                            onCheckedChange={async checked => {
                              setSwitchLoadingId(agent.id);
                              const prev = agent.isPublished;

                              // 先更新UI状态
                              setAgents(prevAgents =>
                                prevAgents.map(a =>
                                  a.id === agent.id
                                    ? { ...a, isPublished: checked }
                                    : a
                                )
                              );

                              console.log(
                                `尝试更新智能体[${agent.id}:${agent.name}]发布状态: ${prev} -> ${checked}`
                              );

                              try {
                                // 确保isPublished字段是布尔值
                                const updated = {
                                  ...agent,
                                  isPublished: checked,
                                };

                                // 调用API更新
                                const result = await handleUpdateAgent(updated);
                                console.log(
                                  `智能体[${agent.id}:${agent.name}]发布状态更新结果:`,
                                  result
                                );

                                // 刷新智能体列表
                                fetchAgents()
                                  .then(newAgents => {
                                    setAgents(newAgents);
                                    console.log('已刷新智能体列表');
                                  })
                                  .catch(err =>
                                    console.error('刷新智能体列表失败:', err)
                                  );
                              } catch (e) {
                                console.error(
                                  `更新智能体[${agent.id}:${agent.name}]发布状态失败:`,
                                  e
                                );

                                // 恢复UI状态
                                setAgents(prevAgents =>
                                  prevAgents.map(a =>
                                    a.id === agent.id
                                      ? { ...a, isPublished: prev }
                                      : a
                                  )
                                );

                                toast({
                                  title: '发布状态更新失败',
                                  description: String(e),
                                  variant: 'destructive',
                                });
                              } finally {
                                setSwitchLoadingId(null);
                              }
                            }}
                            className='ml-2'
                          />
                        </div>
                        <div className='text-xs text-muted-foreground truncate'>
                          {agent.description || t('description')}
                        </div>

                        <div className='flex items-center gap-2 mt-1'>
                          <Badge
                            variant='outline'
                            className='text-[10px] h-4 px-1'
                          >
                            {typeLabel(agent.type)}
                          </Badge>
                          {agent.apiKey && agent.appId ? (
                            <Badge
                              variant='outline'
                              className='text-[10px] h-4 px-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                            >
                              {t('configured')}
                            </Badge>
                          ) : (
                            <Badge
                              variant='outline'
                              className='text-[10px] h-4 px-1 bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
                            >
                              {t('notConfigured')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-center text-muted-foreground py-8'>
                  暂无智能体，请点击上方按钮新增
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <Dialog open={showAgentForm} onOpenChange={setShowAgentForm}>
        <DialogContent className='max-w-2xl w-full'>
          <DialogHeader>
            <DialogTitle>
              {editingAgent ? '编辑智能体' : '新增智能体'}
            </DialogTitle>
          </DialogHeader>
          <AgentForm
            agent={editingAgent}
            onSave={handleAgentFormSave}
            onClose={() => {
              setShowAgentForm(false);
              setEditingAgent(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
