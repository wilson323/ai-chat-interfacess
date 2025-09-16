/**
 * 语音设置管理页面
 * 管理员可以配置全局语音参数
 */

'use client';

import type { Viewport } from 'next';
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Mic,
  Settings,
  RotateCcw,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { VoiceSettings } from '@/components/voice/VoiceSettings';
import type { VoiceConfig } from '@/types/voice';

export default function VoiceSettingsPage() {
  const [config, setConfig] = useState<VoiceConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 辅助函数：处理日期类型转换
  const processConfigDates = useCallback((configData: VoiceConfig): VoiceConfig => {
    return {
      ...configData,
      createdAt: configData.createdAt ? new Date(configData.createdAt) : new Date(),
      updatedAt: configData.updatedAt ? new Date(configData.updatedAt) : new Date(),
    };
  }, []);

  // 加载配置
  const loadConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/voice/config?userId=admin');
      const data = await response.json();

      if (data.success) {
        setConfig(processConfigDates(data.config));
      } else {
        setError(data.error || '加载配置失败');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '加载配置失败');
    } finally {
      setIsLoading(false);
    }
  }, [processConfigDates]);

  // 清除错误函数
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 刷新配置函数
  const refreshConfig = useCallback(() => {
    loadConfig();
  }, [loadConfig]);

  // 保存配置
  const saveConfig = useCallback(async (newConfig: VoiceConfig) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/voice/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'admin',
          config: newConfig,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setConfig(processConfigDates(data.config));
        setSuccess('配置保存成功');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || '保存配置失败');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '保存配置失败');
    } finally {
      setIsSaving(false);
    }
  }, [processConfigDates]);

  // 重置配置
  const resetConfig = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch('/api/voice/config?userId=admin', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await loadConfig();
        setSuccess('配置已重置');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || '重置配置失败');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '重置配置失败');
    } finally {
      setIsSaving(false);
    }
  }, [loadConfig]);

  // 初始化
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  if (isLoading) {
    return (
      <div className='container mx-auto p-6'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
            <p className='text-muted-foreground'>加载语音配置...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* 页面标题 */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <div className='p-2 bg-primary/10 rounded-lg'>
            <Mic className='w-6 h-6 text-primary' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>语音设置管理</h1>
            <p className='text-muted-foreground'>
              配置全局语音参数和提供商设置
            </p>
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <Badge variant='outline' className='flex items-center space-x-1'>
            <Settings className='w-3 h-3' />
            <span>管理员配置</span>
          </Badge>
        </div>
      </div>

      {/* 状态提示 */}
      {error && (
        <Alert variant='destructive'>
          <XCircle className='h-4 w-4' />
          <AlertDescription>
            {error}
            <Button
              onClick={clearError}
              variant='ghost'
              size='sm'
              className='ml-2'
            >
              关闭
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className='border-green-200 bg-green-50'>
          <CheckCircle className='h-4 w-4 text-green-600' />
          <AlertDescription className='text-green-800'>
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* 当前配置概览 */}
      {config && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Settings className='w-5 h-5' />
              <span>当前配置概览</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div className='space-y-1'>
                <p className='text-sm font-medium text-muted-foreground'>
                  识别服务
                </p>
                <Badge variant='outline'>{config.asrProvider}</Badge>
              </div>
              <div className='space-y-1'>
                <p className='text-sm font-medium text-muted-foreground'>
                  合成服务
                </p>
                <Badge variant='outline'>{config.ttsProvider}</Badge>
              </div>
              <div className='space-y-1'>
                <p className='text-sm font-medium text-muted-foreground'>
                  语言
                </p>
                <Badge variant='outline'>{config.language}</Badge>
              </div>
              <div className='space-y-1'>
                <p className='text-sm font-medium text-muted-foreground'>
                  语速
                </p>
                <Badge variant='outline'>{config.speed}x</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 语音设置组件 */}
      <VoiceSettings
        userId='admin'
        onConfigChange={newConfig => {
          setConfig(newConfig);
          saveConfig(newConfig);
        }}
        onError={setError}
        className='w-full'
      />

      {/* 操作按钮 */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <h3 className='font-medium'>配置操作</h3>
              <p className='text-sm text-muted-foreground'>
                管理语音配置的保存和重置
              </p>
            </div>

            <div className='flex items-center space-x-2'>
              <Button
                onClick={resetConfig}
                variant='outline'
                disabled={isSaving}
                className='flex items-center space-x-2'
              >
                <RotateCcw className='w-4 h-4' />
                <span>重置配置</span>
              </Button>

              <Button
                onClick={refreshConfig}
                variant='outline'
                disabled={isSaving}
                className='flex items-center space-x-2'
              >
                <Settings className='w-4 h-4' />
                <span>刷新配置</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 服务状态 */}
      <Card>
        <CardHeader>
          <CardTitle>服务状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <h4 className='font-medium'>语音识别服务</h4>
              <div className='space-y-1'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Web Speech API</span>
                  <Badge variant='outline'>可用</Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>阿里云</span>
                  <Badge variant='outline'>可用</Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>百度</span>
                  <Badge variant='outline'>可用</Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>讯飞</span>
                  <Badge variant='outline'>可用</Badge>
                </div>
              </div>
            </div>

            <div className='space-y-2'>
              <h4 className='font-medium'>语音合成服务</h4>
              <div className='space-y-1'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Web Speech API</span>
                  <Badge variant='outline'>可用</Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>阿里云</span>
                  <Badge variant='outline'>可用</Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>百度</span>
                  <Badge variant='outline'>可用</Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>讯飞</span>
                  <Badge variant='outline'>可用</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
