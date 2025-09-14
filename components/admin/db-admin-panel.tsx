'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DbAdminPanel() {
  const [schema, setSchema] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [activeTable, setActiveTable] = useState<string>('');
  const [migrating, setMigrating] = useState(false);
  const [migrateResult, setMigrateResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchSchema = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/db-schema');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '获取表结构失败');
      setSchema(data);
      setActiveTable(Object.keys(data)[0] || '');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMigrate = async () => {
    setMigrating(true);
    setMigrateResult(null);
    setError(null);
    try {
      const res = await fetch('/api/admin/db-migrate', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '迁移失败');
      setMigrateResult(data.output || '迁移成功');
      fetchSchema();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setMigrating(false);
    }
  };

  const handleInitData = async () => {
    if (!window.confirm('确定要初始化数据吗？这将覆盖现有数据！')) return;
    try {
      const res = await fetch('/api/admin/db/init-data', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('初始化成功！');
        fetchSchema();
      } else {
        alert('初始化失败：' + data.error);
      }
    } catch (e: any) {
      alert('初始化失败：' + e.message);
    }
  };

  useEffect(() => {
    fetchSchema();
  }, []);

  return (
    <Card className='h-full flex flex-col max-h-[90vh]'>
      <CardHeader className='flex flex-row items-center justify-between bg-pantone369-50/50 dark:bg-pantone369-900/10'>
        <CardTitle className='flex items-center gap-2'>
          <Database className='h-5 w-5 text-pantone369-500' />
          数据库管理
        </CardTitle>
        <div className='flex gap-2'>
          <Button
            onClick={handleMigrate}
            disabled={migrating}
            className='bg-pantone369-500 hover:bg-pantone369-600 text-white'
          >
            <RefreshCw
              className='h-4 w-4 mr-1 animate-spin'
              style={{ display: migrating ? 'inline' : 'none' }}
            />
            {migrating ? '正在更新表结构...' : '检测并更新表结构'}
          </Button>
          <Button
            onClick={handleInitData}
            className='bg-pantone369-500 hover:bg-pantone369-600 text-white'
          >
            初始化数据
          </Button>
          <Button variant='outline' onClick={() => router.push('/admin')}>
            返回管理员界面
          </Button>
        </div>
      </CardHeader>
      <CardContent className='flex-1 overflow-y-auto p-6'>
        {error && (
          <Alert variant='destructive' className='mb-4'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {migrateResult && (
          <Alert className='mb-4'>
            <AlertCircle className='h-4 w-4 text-pantone369-500' />
            <AlertTitle>迁移结果</AlertTitle>
            <AlertDescription>
              <pre className='whitespace-pre-wrap text-xs'>{migrateResult}</pre>
            </AlertDescription>
          </Alert>
        )}
        <Tabs
          value={activeTable}
          onValueChange={setActiveTable}
          className='w-full'
        >
          <TabsList className='mb-4'>
            {Object.keys(schema).map(table => (
              <TabsTrigger key={table} value={table} className='capitalize'>
                {table.replace(/_/g, ' ')}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(schema).map(([table, fields]) => (
            <TabsContent key={table} value={table} className='overflow-x-auto'>
              <table className='min-w-full text-xs border border-pantone369-100 dark:border-pantone369-900/30'>
                <thead className='bg-pantone369-50 dark:bg-pantone369-900/10'>
                  <tr>
                    <th className='p-2 border'>字段名</th>
                    <th className='p-2 border'>类型</th>
                    <th className='p-2 border'>主键</th>
                    <th className='p-2 border'>可空</th>
                    <th className='p-2 border'>默认值</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(fields as any).map(([field, info]: any) => (
                    <tr key={field}>
                      <td className='p-2 border font-mono'>{field}</td>
                      <td className='p-2 border font-mono'>{info.type}</td>
                      <td className='p-2 border text-center'>
                        {info.primaryKey ? '是' : ''}
                      </td>
                      <td className='p-2 border text-center'>
                        {info.allowNull ? '是' : '否'}
                      </td>
                      <td className='p-2 border font-mono'>
                        {info.defaultValue === undefined
                          ? ''
                          : String(info.defaultValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
