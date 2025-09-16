'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { logger } from '../lib/utils/logger';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { useAgent } from '../context/agent-context';
import { useCreateAgent } from '../lib/hooks/useAgents';
import { Bot, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useLanguage } from '../context/language-context';
import { toast } from './ui/toast/use-toast';

interface AgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentDialog({ open, onOpenChange }: AgentDialogProps) {
  const { } = useAgent();
  const { t } = useLanguage();
  const createAgentMutation = useCreateAgent();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('fastgpt');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setName('');
      setDescription('');
      setType('fastgpt');
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // 验证必填字段
      if (!name.trim()) {
        toast({
          title: '错误',
          description: '请输入智能体名称',
          variant: 'destructive',
        });
        return;
      }

      // 创建智能体数据
      const agentData = {
        name: name.trim(),
        description: description.trim(),
        type: type as 'fastgpt',
        apiKey: '',
        appId: '',
        apiUrl: '',
        systemPrompt: '',
        temperature: 0.7,
        maxTokens: 2000,
        multimodalModel: '',
        isPublished: false,
        order: 0,
        supportsStream: true,
        supportsDetail: true,
      };

      // 调用创建智能体API
      await createAgentMutation.mutateAsync(agentData);

      // 显示成功消息
      toast({
        title: '成功',
        description: '智能体创建成功',
      });

      // 关闭对话框
      onOpenChange(false);
    } catch (error) {
      logger.error('创建智能体失败:', error);
      toast({
        title: '错误',
        description: error instanceof Error ? error.message : '创建智能体失败',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Plus className='h-5 w-5 text-primary' />
              {t('createNewAgent')}
            </DialogTitle>
            <DialogDescription>
              {t('createNewAgentDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <label htmlFor='name' className='text-sm font-medium'>
                {t('agentName')}
              </label>
              <Input
                id='name'
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t('agentNamePlaceholder')}
                className='col-span-3'
              />
            </div>

            <div className='grid gap-2'>
              <label htmlFor='type' className='text-sm font-medium'>
                {t('agentType')}
              </label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectAgentType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='fastgpt'>
                    <div className='flex items-center gap-2'>
                      <Bot className='h-4 w-4' />
                      <span>FastGPT</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='grid gap-2'>
              <label htmlFor='description' className='text-sm font-medium'>
                {t('description')}
              </label>
              <Textarea
                id='description'
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={t('agentDescriptionPlaceholder')}
                className='col-span-3'
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? '创建中...' : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
