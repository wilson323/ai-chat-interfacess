'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';

interface TableColumn {
  name: string;
  type: string;
  allowNull: boolean;
  defaultValue: unknown;
}

interface TableInfo {
  name: string;
  columns: TableColumn[];
}

interface ModelField {
  type: string;
  allowNull: boolean;
  defaultValue: unknown;
}

interface DatabaseField {
  type: string;
  allowNull: boolean;
  defaultValue: unknown;
}

interface SchemaDiff {
  tableName: string;
  fieldName: string;
  fieldType: string;
  diffType: 'new' | 'missing' | 'diff';
  details: string;
}

function getFieldDiff(
  modelField: ModelField | undefined,
  dbField: DatabaseField | undefined
) {
  if (!modelField) return 'missing'; // 数据库有，模型无
  if (!dbField) return 'new'; // 模型有，数据库无
  if (
    modelField.type !== dbField.type ||
    modelField.allowNull !== dbField.allowNull ||
    (modelField.defaultValue ?? '') !== (dbField.defaultValue ?? '')
  )
    return 'diff'; // 类型/可空/默认值不一致
  return 'same';
}

function renderFieldCell(
  field: string | number | boolean,
  diffType: string,
  tooltip?: string,
  key?: string
) {
  let className = '';
  if (diffType === 'new') className = 'bg-green-100 text-green-800';
  if (diffType === 'missing') className = 'bg-red-100 text-red-800';
  if (diffType === 'diff') className = 'bg-yellow-100 text-yellow-800';
  if (tooltip) {
    return (
      <TooltipProvider key={key}>
        <Tooltip>
          <TooltipTrigger asChild>
            <td className={className} key={key}>
              {field}
            </td>
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return (
    <td className={className} key={key}>
      {field}
    </td>
  );
}

export default function DbSchemaPage() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [syncNeeded, setSyncNeeded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [diffs, setDiffs] = useState<SchemaDiff[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [logTotal, setLogTotal] = useState(0);
  const [logPage, setLogPage] = useState(1);
  const logPageSize = 20;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const [modelTables, setModelTables] = useState<TableInfo[]>([]);

  // 自动检测表结构
  useEffect(() => {
    fetch('/api/admin/db-schema/check')
      .then(res => res.json())
      .then(data => {
        setSyncNeeded(data.syncNeeded);
        setDiffs(data.diffs || []);
      })
      .catch(() => setError('检测表结构失败'))
      .finally(() => setLoading(false));
  }, []);

  // 获取表结构
  useEffect(() => {
    fetch('/api/admin/db-schema/tables')
      .then(res => res.json())
      .then(data => {
        setTables(data.dbTables || []);
        setModelTables(data.modelTables || []);
      })
      .catch(() => setError('获取表结构失败'));
  }, [success]);

  // 获取操作日志
  const fetchLogs = useCallback(() => {
    fetch(`/api/admin/db-schema/log?page=${logPage}&pageSize=${logPageSize}`)
      .then(res => res.json())
      .then(data => {
        setLogs(data.logs || []);
        setLogTotal(data.total || 0);
      });
  }, [logPage]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // 导出表结构
  const handleExport = async (type: 'json' | 'csv') => {
    setExporting(true);
    try {
      const res = await fetch('/api/admin/db-schema/tables');
      const data = await res.json();
      if (type === 'json') {
        const blob = new Blob([JSON.stringify(data.tables, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'db-schema.json';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // CSV
        const rows = [
          ['表名', '字段名', '类型', '可空', '默认值'],
          ...data.tables.flatMap((table: TableInfo) =>
            table.columns.map((col: TableColumn) => [
              table.name,
              col.name,
              col.type,
              col.allowNull ? '是' : '否',
              col.defaultValue ?? '',
            ])
          ),
        ];
        const csv = rows
          .map(r =>
            r
              .map((v: string | number) => `"${String(v).replace(/"/g, '""')}`)
              .join(',')
          )
          .join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'db-schema.csv';
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setExporting(false);
    }
  };

  // 导出SQL快照
  const handleExportSQL = async () => {
    const res = await fetch('/api/admin/db-schema/tables');
    const data = await res.json();
    // 这里只做简单示例，实际应用可用sequelize-auto等工具生成完整SQL
    const sql = data.tables
      .map(
        (table: TableInfo) =>
          `-- ${table.name}\nCREATE TABLE IF NOT EXISTS "${table.name}" (...);`
      )
      .join('\n\n');
    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'db-schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 回滚SQL快照
  const handleRollback = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sql = await file.text();
    const res = await fetch('/api/admin/db-schema/rollback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql }),
    });
    if (res.ok) alert('回滚成功');
    else alert('回滚失败: ' + (await res.text()));
    fileInputRef.current!.value = '';
  };

  // 手动同步
  const handleSync = async () => {
    setSyncing(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/db-schema/sync', { method: 'POST' });
      const data = await res.json();
      // 记录操作日志
      await fetch('/api/admin/db-schema/log', {
        method: 'POST',
        body: JSON.stringify({
          action: 'sync',
          result: res.ok ? 'success' : 'fail',
          detail: data,
        }),
      });
      if (res.ok) {
        setSuccess('表结构同步成功');
        setSyncNeeded(false);
      } else {
        setError(data.error || '同步失败');
      }
    } catch {
      setError('同步失败');
    } finally {
      setSyncing(false);
    }
  };

  // 健康监控
  const [health, setHealth] = useState<{
    db?: string;
    api?: string;
    agent?: string;
  } | null>(null);
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(setHealth);
  }, []);
  // 性能分析
  const [perf, setPerf] = useState<{
    cpu?: string[];
    memory?: { heapUsed?: string };
  } | null>(null);
  useEffect(() => {
    fetch('/api/admin/monitor/performance')
      .then(r => r.json())
      .then(setPerf);
  }, []);
  // 备份恢复
  const [backups, setBackups] = useState<string[]>([]);
  useEffect(() => {
    fetch('/api/admin/db-schema/backup')
      .then(r => r.json())
      .then(d => setBackups(d.files || []));
  }, [success]);
  const handleBackup = async () => {
    await fetch('/api/admin/db-schema/backup', { method: 'POST' });
    setSuccess('备份成功');
  };
  const handleRestore = async (file: string) => {
    await fetch('/api/admin/db-schema/backup', {
      method: 'PUT',
      body: JSON.stringify({ file }),
      headers: { 'Content-Type': 'application/json' },
    });
    setSuccess('恢复成功');
  };

  return (
    <div className='max-w-5xl mx-auto mt-10'>
      <Card>
        <CardHeader>
          <CardTitle>数据表结构与同步</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <div>检测中...</div>}
          {error && (
            <Alert variant='destructive' className='mb-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {syncNeeded && !loading && (
            <Alert variant='default' className='mb-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                检测到表结构需要同步，请点击下方按钮同步。
              </AlertDescription>
            </Alert>
          )}
          {diffs.length > 0 && !loading && (
            <Alert variant='default' className='mb-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                <div>存在以下表结构不健全项：</div>
                <ul className='list-disc pl-5'>
                  {diffs.map((diff, i) => (
                    <li key={i}>
                      <b>{diff.table}</b>：
                      {diff.missingFields.length > 0 && (
                        <span>缺少字段：{diff.missingFields.join(', ')}；</span>
                      )}
                      {diff.extraFields.length > 0 && (
                        <span>多余字段：{diff.extraFields.join(', ')}；</span>
                      )}
                      {diff.typeMismatch.length > 0 && (
                        <span>类型不符：{diff.typeMismatch.join(', ')}；</span>
                      )}
                      {diff.nullMismatch.length > 0 && (
                        <span>
                          可空性不符：{diff.nullMismatch.join(', ')}；
                        </span>
                      )}
                      {diff.defaultMismatch.length > 0 && (
                        <span>
                          默认值不符：{diff.defaultMismatch.join(', ')}；
                        </span>
                      )}
                      {diff.missingIndexes.length > 0 && (
                        <span>
                          缺少索引：{diff.missingIndexes.join(', ')}；
                        </span>
                      )}
                      {diff.missingUniques.length > 0 && (
                        <span>
                          缺少唯一约束：{diff.missingUniques.join(', ')}；
                        </span>
                      )}
                      {diff.missingForeignKeys.length > 0 && (
                        <span>
                          缺少外键：{diff.missingForeignKeys.join(', ')}；
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant='default' className='mb-4'>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={syncing || loading}
            className='mb-6'
          >
            {syncing ? '同步中...' : '手动同步表结构'}
          </Button>
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent>
              <DialogTitle>确认同步</DialogTitle>
              <div>同步表结构是高风险操作，确定要继续吗？</div>
              <DialogFooter>
                <Button onClick={() => setConfirmOpen(false)} variant='outline'>
                  取消
                </Button>
                <Button
                  onClick={async () => {
                    setConfirmOpen(false);
                    await handleSync();
                  }}
                  variant='destructive'
                >
                  确认同步
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className='flex gap-4 mt-8'>
            <Button onClick={() => handleExport('json')} disabled={exporting}>
              导出JSON
            </Button>
            <Button onClick={() => handleExport('csv')} disabled={exporting}>
              导出CSV
            </Button>
            <Button onClick={handleExportSQL}>导出SQL快照</Button>
            <input
              ref={fileInputRef}
              type='file'
              accept='.sql'
              className='hidden'
              onChange={handleRollback}
            />
            <Button
              variant='destructive'
              onClick={() => fileInputRef.current?.click()}
            >
              回滚SQL快照
            </Button>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 my-8'>
            <div>
              <h3 className='font-bold mb-2'>系统模型定义的表结构</h3>
              {modelTables.length === 0 ? (
                <div className='text-muted-foreground'>无</div>
              ) : (
                modelTables.map((modelTable, idx) => {
                  const dbTable = tables.find(t => t.name === modelTable.name);
                  const allFieldNames = Array.from(
                    new Set([
                      ...modelTable.columns.map(c => c.name),
                      ...(dbTable?.columns.map(c => c.name) || []),
                    ])
                  );
                  const dbTableMap = Object.fromEntries(
                    (dbTable?.columns || []).map(c => [c.name, c])
                  );
                  const modelTableMap = Object.fromEntries(
                    modelTable.columns.map(c => [c.name, c])
                  );
                  return (
                    <div
                      key={modelTable.name + '-model-' + idx}
                      className='mb-4'
                    >
                      <div className='font-semibold'>{modelTable.name}</div>
                      <TooltipProvider>
                        <table className='w-full text-xs border mb-2'>
                          <thead>
                            <tr>
                              <th>字段名</th>
                              <th>类型</th>
                              <th>可空</th>
                              <th>默认值</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allFieldNames.map(fieldName => {
                              const modelField = modelTableMap[fieldName];
                              const dbField = dbTableMap[fieldName];
                              const diffType = getFieldDiff(
                                modelField,
                                dbField
                              );
                              let tooltip = '';
                              if (diffType === 'diff') {
                                tooltip = `模型: 类型${modelField?.type}, 可空${modelField?.allowNull ? '是' : '否'}, 默认${modelField?.defaultValue ?? ''}\n数据库: 类型${dbField?.type}, 可空${dbField?.allowNull ? '是' : '否'}, 默认${dbField?.defaultValue ?? ''}`;
                              } else if (diffType === 'new') {
                                tooltip = '模型有，数据库无';
                              } else if (diffType === 'missing') {
                                tooltip = '数据库有，模型无';
                              }
                              return (
                                <tr key={modelTable.name + '-' + fieldName}>
                                  {renderFieldCell(
                                    fieldName,
                                    diffType,
                                    tooltip,
                                    modelTable.name + '-' + fieldName + '-name'
                                  )}
                                  {renderFieldCell(
                                    modelField?.type ?? '',
                                    diffType,
                                    tooltip,
                                    modelTable.name + '-' + fieldName + '-type'
                                  )}
                                  {renderFieldCell(
                                    modelField?.allowNull !== undefined
                                      ? modelField.allowNull
                                        ? '是'
                                        : '否'
                                      : '',
                                    diffType,
                                    tooltip,
                                    modelTable.name + '-' + fieldName + '-null'
                                  )}
                                  {renderFieldCell(
                                    modelField?.defaultValue ?? '',
                                    diffType,
                                    tooltip,
                                    modelTable.name +
                                      '-' +
                                      fieldName +
                                      '-default'
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </TooltipProvider>
                    </div>
                  );
                })
              )}
            </div>
            <div>
              <h3 className='font-bold mb-2'>数据库实际表结构</h3>
              {tables.length === 0 ? (
                <div className='text-muted-foreground'>无</div>
              ) : (
                tables.map((dbTable, idx) => {
                  const modelTable = modelTables.find(
                    t => t.name === dbTable.name
                  );
                  const allFieldNames = Array.from(
                    new Set([
                      ...dbTable.columns.map(c => c.name),
                      ...(modelTable?.columns.map(c => c.name) || []),
                    ])
                  );
                  const dbTableMap = Object.fromEntries(
                    dbTable.columns.map(c => [c.name, c])
                  );
                  const modelTableMap = Object.fromEntries(
                    (modelTable?.columns || []).map(c => [c.name, c])
                  );
                  return (
                    <div key={dbTable.name + '-db-' + idx} className='mb-4'>
                      <div className='font-semibold'>{dbTable.name}</div>
                      <TooltipProvider>
                        <table className='w-full text-xs border mb-2'>
                          <thead>
                            <tr>
                              <th>字段名</th>
                              <th>类型</th>
                              <th>可空</th>
                              <th>默认值</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allFieldNames.map(fieldName => {
                              const dbField = dbTableMap[fieldName];
                              const modelField = modelTableMap[fieldName];
                              const diffType = getFieldDiff(
                                modelField,
                                dbField
                              );
                              let tooltip = '';
                              if (diffType === 'diff') {
                                tooltip = `数据库: 类型${dbField?.type}, 可空${dbField?.allowNull ? '是' : '否'}, 默认${dbField?.defaultValue ?? ''}\n模型: 类型${modelField?.type}, 可空${modelField?.allowNull ? '是' : '否'}, 默认${modelField?.defaultValue ?? ''}`;
                              } else if (diffType === 'new') {
                                tooltip = '模型有，数据库无';
                              } else if (diffType === 'missing') {
                                tooltip = '数据库有，模型无';
                              }
                              return (
                                <tr key={dbTable.name + '-' + fieldName}>
                                  {renderFieldCell(
                                    fieldName,
                                    diffType,
                                    tooltip,
                                    dbTable.name + '-' + fieldName + '-name'
                                  )}
                                  {renderFieldCell(
                                    dbField?.type ?? '',
                                    diffType,
                                    tooltip,
                                    dbTable.name + '-' + fieldName + '-type'
                                  )}
                                  {renderFieldCell(
                                    dbField?.allowNull !== undefined
                                      ? dbField.allowNull
                                        ? '是'
                                        : '否'
                                      : '',
                                    diffType,
                                    tooltip,
                                    dbTable.name + '-' + fieldName + '-null'
                                  )}
                                  {renderFieldCell(
                                    dbField?.defaultValue ?? '',
                                    diffType,
                                    tooltip,
                                    dbTable.name + '-' + fieldName + '-default'
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </TooltipProvider>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className='mt-10'>
            <Card>
              <CardHeader>
                <CardTitle>操作日志</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='max-h-60 overflow-y-auto text-xs font-mono bg-muted p-2 rounded'>
                  {logs.length === 0 ? (
                    <div>暂无日志</div>
                  ) : (
                    logs.map((line, i) => <div key={i}>{line}</div>)
                  )}
                </div>
                <div className='flex gap-2 mt-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    disabled={logPage === 1}
                    onClick={() => setLogPage(p => Math.max(1, p - 1))}
                  >
                    上一页
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    disabled={logPage * logPageSize >= logTotal}
                    onClick={() => setLogPage(p => p + 1)}
                  >
                    下一页
                  </Button>
                  <span className='text-xs text-muted-foreground'>
                    {logPage} / {Math.ceil(logTotal / logPageSize)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          <h2
            className='text-xl font-bold mt-10'
            tabIndex={0}
            aria-label={t('dbSchema.health')}
          >
            {t('dbSchema.health')}
          </h2>
          <div
            className='flex gap-8 my-2'
            role='region'
            aria-label='health-status'
          >
            <div>
              {t('dbSchema.dbStatus')}:{' '}
              <span aria-live='polite'>{health?.db}</span>
            </div>
            <div>
              {t('dbSchema.apiStatus')}:{' '}
              <span aria-live='polite'>{health?.api}</span>
            </div>
            <div>
              {t('dbSchema.agentStatus')}:{' '}
              <span aria-live='polite'>{health?.agent}</span>
            </div>
          </div>
          <h2
            className='text-xl font-bold mt-10'
            tabIndex={0}
            aria-label={t('dbSchema.performance')}
          >
            {t('dbSchema.performance')}
          </h2>
          <div
            className='flex gap-8 my-2'
            role='region'
            aria-label='performance-status'
          >
            <div>
              {t('dbSchema.cpu')}: {perf?.cpu?.join(', ')}
            </div>
            <div>
              {t('dbSchema.memory')}: {perf?.memory?.heapUsed}
            </div>
          </div>
          <h2
            className='text-xl font-bold mt-10'
            tabIndex={0}
            aria-label={t('dbSchema.backup')}
          >
            {t('dbSchema.backup')}
          </h2>
          <div
            className='flex gap-4 my-2'
            role='region'
            aria-label='backup-list'
          >
            <Button onClick={handleBackup}>{t('dbSchema.backup')}</Button>
            {backups.map(f => (
              <Button key={f} onClick={() => handleRestore(f)}>
                {t('dbSchema.restore')} {f}
              </Button>
            ))}
          </div>
          <h2
            className='text-xl font-bold mt-10'
            tabIndex={0}
            aria-label={t('dbSchema.approval')}
          >
            {t('dbSchema.approval')}
          </h2>
          {/* 审批流UI可根据实际需求补充，已支持API */}
        </CardContent>
      </Card>
    </div>
  );
}
