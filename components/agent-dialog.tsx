'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAgent } from '@/context/agent-context';
import { Bot, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/context/language-context';

interface AgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentDialog({ open, onOpenChange }: AgentDialogProps) {
  const { addAgent } = useAgent();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('chat');

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setName('');
      setDescription('');
      setType('chat');
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate a unique ID
    const id = `agent-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create the new agent
    const newAgent = {
      id,
      name: name || 'New Agent',
      description: description || '',
      type,
      apiEndpoint: 'https://zktecoaihub.com/api/v1/chat/completions', // 确保使用正确的API端点
      apiKey: '',
      appId: '',
      isPublished: false,
    };

    // Add the agent
    addAgent(newAgent);

    // Close the dialog
    onOpenChange(false);
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
            >
              {t('cancel')}
            </Button>
            <Button type='submit'>{t('create')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
