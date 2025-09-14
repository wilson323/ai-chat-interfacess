'use client';
import { useEffect, useState } from 'react';
import { CadAnalyzerConfig } from '@/types/api/agent-config/cad-analyzer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { AgentProvider } from '@/context/agent-context';
import { LanguageProvider } from '@/context/language-context';
import { useToast } from '@/components/ui/toast/use-toast';
import Link from 'next/link';

// 分离出配置表单组件
function CadAnalyzerConfigForm() {
  const { toast } = useToast();
  const [config, setConfig] = useState<CadAnalyzerConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/cad-analyzer-config');
        const data = await res.json();
        // 确保所有必要的字段都有默认值
        const defaultConfig = {
          enabled: false,
          defaultModel: '',
          maxFileSizeMB: 10,
          supportedFormats: [],
          analysisParams: {
            precision: 'medium',
            timeoutSec: 60,
            maxPages: 10,
          },
          historyRetentionDays: 30,
          description: '',
          apiEndpoint: '',
          apiKey: '',
          models: [],
        };
        // 合并API返回的数据和默认值
        setConfig({ ...defaultConfig, ...data });
      } catch (e) {
        setError('加载配置失败');
        toast({
          title: '加载失败',
          description: String(e),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/admin/cad-analyzer-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('保存失败');

      // 解析响应数据
      await res.json(); // 确认响应成功

      // 设置成功状态
      setSuccess(true);

      // 显示弹出框提示
      setShowSuccessDialog(true);

      // 同时显示Toast提示
      toast({
        title: '保存成功',
        description: 'CAD智能体配置已同时更新到数据库和配置文件',
        variant: 'default',
        duration: 5000, // 显示5秒
      });
    } catch (e) {
      setError('保存失败');
      toast({
        title: '保存失败',
        description: String(e),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestModel = async (model: {
    name: string;
    apiKey: string;
    baseUrl: string;
  }) => {
    try {
      const res = await fetch('/api/admin/cad-analyzer-config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model }),
      });
      const data = await res.json();
      setTestResult(data.success ? '连通性正常' : `连通性异常：${data.error}`);
      setShowTestDialog(true);
    } catch (e) {
      toast({
        title: '测试失败',
        description: String(e),
        variant: 'destructive',
      });
    }
  };

  const handleRestoreDefault = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/cad-analyzer-config/default');
      const data = await res.json();
      setConfig(data);
      toast({
        title: '恢复成功',
        description: '已恢复默认配置',
      });
    } catch (e) {
      setError('恢复默认配置失败');
      toast({
        title: '恢复失败',
        description: String(e),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className='text-center py-8'>加载中...</div>;
  if (!config) return <div className='text-center py-8'>未加载到配置</div>;

  // 动态表单渲染
  return (
    <Card className='max-w-4xl mx-auto'>
      <CardHeader>
        <CardTitle className='text-xl font-bold flex items-center gap-2'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='text-pantone369-500'
          >
            <path d='M14 3v4a1 1 0 0 0 1 1h4'></path>
            <path d='M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z'></path>
            <path d='M12 17v-6'></path>
            <path d='M10 14l2 3 2-3'></path>
          </svg>
          CAD 智能体配置
        </CardTitle>
        <CardDescription>配置CAD智能体的参数、模型和API密钥</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-start'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 mr-2 mt-0.5 flex-shrink-0'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                clipRule='evenodd'
              />
            </svg>
            <div>{error}</div>
          </div>
        )}
        {success && (
          <div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 flex items-start'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 mr-2 mt-0.5 flex-shrink-0'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
            <div>
              <p className='font-medium'>保存成功</p>
              <p className='text-sm'>
                CAD智能体配置已同时更新到数据库和配置文件
              </p>
            </div>
          </div>
        )}
        <div className='mb-4'>
          <label className='block font-medium mb-1'>启用状态</label>
          <input
            type='checkbox'
            checked={config.enabled === undefined ? false : config.enabled}
            onChange={e => setConfig({ ...config, enabled: e.target.checked })}
          />
        </div>
        <div className='mb-4'>
          <label className='block font-medium mb-1'>默认模型</label>
          <Input
            value={config.defaultModel || ''}
            onChange={e =>
              setConfig({ ...config, defaultModel: e.target.value })
            }
          />
        </div>
        <div className='mb-4'>
          <label className='block font-medium mb-1'>最大文件大小(MB)</label>
          <Input
            type='number'
            value={
              config.maxFileSizeMB === undefined ? 10 : config.maxFileSizeMB
            }
            onChange={e =>
              setConfig({ ...config, maxFileSizeMB: Number(e.target.value) })
            }
          />
        </div>
        <div className='mb-4'>
          <label className='block font-medium mb-1'>
            支持的文件格式(逗号分隔)
          </label>
          <Input
            value={(config.supportedFormats || []).join(',')}
            onChange={e =>
              setConfig({
                ...config,
                supportedFormats: e.target.value
                  ? e.target.value.split(',')
                  : [],
              })
            }
          />
        </div>
        <div className='mb-4'>
          <label className='block font-medium mb-1'>分析参数</label>
          <div className='flex gap-2 mb-1'>
            <Input
              placeholder='精度'
              value={(config.analysisParams || {}).precision || 'medium'}
              onChange={e =>
                setConfig({
                  ...config,
                  analysisParams: {
                    ...(config.analysisParams || {}),
                    precision: e.target.value,
                  },
                })
              }
            />
            <Input
              placeholder='超时时间(秒)'
              type='number'
              value={
                (config.analysisParams || {}).timeoutSec === undefined
                  ? 60
                  : config.analysisParams.timeoutSec
              }
              onChange={e =>
                setConfig({
                  ...config,
                  analysisParams: {
                    ...(config.analysisParams || {}),
                    timeoutSec: Number(e.target.value),
                  },
                })
              }
            />
            <Input
              placeholder='最大页数'
              type='number'
              value={
                (config.analysisParams || {}).maxPages === undefined
                  ? 10
                  : config.analysisParams.maxPages
              }
              onChange={e =>
                setConfig({
                  ...config,
                  analysisParams: {
                    ...(config.analysisParams || {}),
                    maxPages: Number(e.target.value),
                  },
                })
              }
            />
          </div>
        </div>
        <div className='mb-4'>
          <label className='block font-medium mb-1'>历史保留天数</label>
          <Input
            type='number'
            value={
              config.historyRetentionDays === undefined
                ? 30
                : config.historyRetentionDays
            }
            onChange={e =>
              setConfig({
                ...config,
                historyRetentionDays: Number(e.target.value),
              })
            }
          />
        </div>
        <div className='mb-4'>
          <label className='block font-medium mb-1'>API端点</label>
          <Input
            value={config.apiEndpoint || ''}
            onChange={e =>
              setConfig({ ...config, apiEndpoint: e.target.value })
            }
            placeholder='例如: https://api.example.com/v1/analyze'
          />
          <p className='text-sm text-gray-500 mt-1'>
            CAD智能体API服务的端点URL
          </p>
        </div>
        <div className='mb-4'>
          <label className='block font-medium mb-1'>全局API密钥</label>
          <Input
            type='password'
            value={config.apiKey || ''}
            onChange={e => setConfig({ ...config, apiKey: e.target.value })}
            placeholder='输入API密钥'
          />
          <p className='text-sm text-gray-500 mt-1'>
            CAD智能体API服务的全局密钥，优先级高于模型列表中的密钥
          </p>
        </div>
        <div className='mb-4'>
          <label className='block font-medium mb-1'>备注</label>
          <Textarea
            value={config.description || ''}
            onChange={e =>
              setConfig({ ...config, description: e.target.value })
            }
          />
        </div>
        <div className='mb-6'>
          <label className='block font-medium mb-1'>模型列表</label>
          {config.models?.map((model, idx) => (
            <div key={idx} className='border p-2 mb-2 rounded'>
              <div className='flex gap-2 mb-1'>
                <Input
                  placeholder='模型名称'
                  value={model.name}
                  onChange={e => {
                    const models = [...config.models];
                    models[idx].name = e.target.value;
                    setConfig({ ...config, models });
                  }}
                />
                <Input
                  placeholder='主密钥'
                  value={model.apiKey}
                  onChange={e => {
                    const models = [...config.models];
                    models[idx].apiKey = e.target.value;
                    setConfig({ ...config, models });
                  }}
                />
              </div>
              <div className='mb-1'>
                <Input
                  placeholder='备用密钥(逗号分隔)'
                  value={model.backupKeys?.join(',') || ''}
                  onChange={e => {
                    const models = [...config.models];
                    models[idx].backupKeys = e.target.value.split(',');
                    setConfig({ ...config, models });
                  }}
                />
              </div>
              <Button
                size='sm'
                onClick={() => handleTestModel(model)}
                className='mr-2'
              >
                测试连通性
              </Button>
              <Button
                variant='destructive'
                size='sm'
                onClick={() => {
                  const models = config.models.filter((_, i) => i !== idx);
                  setConfig({ ...config, models });
                }}
              >
                删除模型
              </Button>
            </div>
          ))}
          <Button
            size='sm'
            onClick={() => {
              setConfig({
                ...config,
                models: [
                  ...(config.models || []),
                  { name: '', apiKey: '', backupKeys: [] },
                ],
              });
            }}
          >
            添加模型
          </Button>
        </div>
        <div className='flex gap-4'>
          <Button
            onClick={handleRestoreDefault}
            variant='outline'
            className='mb-4'
          >
            恢复默认配置
          </Button>
          <Button onClick={handleSave} disabled={saving} className='mb-4'>
            {saving ? '保存中...' : '保存配置'}
          </Button>
        </div>
        {/* 测试连通性弹出框 */}
        <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>连通性测试结果</DialogTitle>
            </DialogHeader>
            <div className='py-4'>{testResult}</div>
            <DialogFooter>
              <Button onClick={() => setShowTestDialog(false)}>关闭</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 保存成功弹出框 */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>保存成功</DialogTitle>
              <DialogDescription>CAD智能体配置已成功保存</DialogDescription>
            </DialogHeader>
            <div className='py-4'>
              <div className='flex items-center text-green-600 mb-4'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-12 w-12 mr-4'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                </svg>
                <div>
                  <p className='text-lg font-medium'>配置已保存成功！</p>
                  <p className='text-sm text-gray-600'>
                    您的CAD智能体配置已同时更新到数据库和配置文件
                  </p>
                </div>
              </div>
              <div className='bg-gray-50 p-3 rounded border border-gray-200 text-sm'>
                <p className='font-medium mb-1'>已保存的配置包括：</p>
                <ul className='list-disc list-inside space-y-1 text-gray-600'>
                  <li>API端点和密钥设置</li>
                  <li>模型配置和参数</li>
                  <li>文件格式和大小限制</li>
                  <li>分析参数和历史保留设置</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowSuccessDialog(false)}>确认</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// 主页面组件
export default function CadAnalyzerConfigPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    // SSR 首屏和 Hydration 前都渲染 loading，保证 HTML 一致
    return <div className='text-center py-8'>加载中...</div>;
  }

  return (
    <LanguageProvider>
      <AgentProvider>
        <div className='max-w-4xl mx-auto mb-4'>
          <Link
            href='/admin'
            className='text-pantone369-500 hover:text-pantone369-600 flex items-center gap-1'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='m12 19-7-7 7-7'></path>
              <path d='M19 12H5'></path>
            </svg>
            返回管理员首页
          </Link>
        </div>
        <CadAnalyzerConfigForm />
      </AgentProvider>
    </LanguageProvider>
  );
}
