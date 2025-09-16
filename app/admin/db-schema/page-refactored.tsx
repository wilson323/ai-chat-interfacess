'use client';

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
import { useDbSchema } from '@/hooks/useDbSchema';
import { ExportActions } from '@/components/admin/db-schema/ExportActions';
import { OperationLogs } from '@/components/admin/db-schema/OperationLogs';
import { SystemStatus } from '@/components/admin/db-schema/SystemStatus';
import type { TableInfo } from '@/types/db-schema';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SchemaComparisonTableProps {
  table: TableInfo;
  modelTable?: TableInfo;
  title: string;
  isModelView: boolean;
}

function SchemaComparisonTable({ table, modelTable, title }: SchemaComparisonTableProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">{title}: {table.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>字段名</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>可空</TableHead>
              <TableHead>默认值</TableHead>
              {modelTable && <TableHead>状态</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.columns.map((column, index) => {
              const modelColumn = modelTable?.columns.find(c => c.name === column.name);
              const hasDifference = modelColumn && (
                column.type !== modelColumn.type ||
                column.allowNull !== modelColumn.allowNull ||
                column.defaultValue !== modelColumn.defaultValue
              );

              return (
                <TableRow key={index} className={hasDifference ? 'bg-yellow-50' : ''}>
                  <TableCell>{column.name}</TableCell>
                  <TableCell>{column.type}</TableCell>
                  <TableCell>{column.allowNull ? '是' : '否'}</TableCell>
                  <TableCell>{String(column.defaultValue ?? '')}</TableCell>
                  {modelTable && (
                    <TableCell>
                      {hasDifference ? (
                        <span className="text-yellow-600">不一致</span>
                      ) : modelColumn ? (
                        <span className="text-green-600">一致</span>
                      ) : (
                        <span className="text-red-600">模型中缺失</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {modelTable?.columns
              .filter(modelCol => !table.columns.find(col => col.name === modelCol.name))
              .map((missingColumn, index) => (
                <TableRow key={`missing-${index}`} className="bg-red-50">
                  <TableCell>{missingColumn.name}</TableCell>
                  <TableCell>{missingColumn.type}</TableCell>
                  <TableCell>{missingColumn.allowNull ? '是' : '否'}</TableCell>
                  <TableCell>{String(missingColumn.defaultValue ?? '')}</TableCell>
                  {modelTable && <TableCell><span className="text-red-600">数据库中缺失</span></TableCell>}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function DbSchemaPage() {
  const {
    tables,
    modelTables,
    syncNeeded,
    loading,
    syncing,
    error,
    success,
    diffs,
    confirmOpen,
    exporting,
    logs,
    logPage,
    logTotal,
    health,
    perf,
    backups,
    handleSync,
    handleRollback,
    handleBackup,
    handleRestore,
    updateState,
  } = useDbSchema();

  const logPageSize = 20;

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
                      <b>{diff.tableName}</b>：{diff.details}
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
            onClick={() => updateState({ confirmOpen: true })}
            disabled={syncing || loading}
            className='mb-6'
          >
            {syncing ? '同步中...' : '手动同步表结构'}
          </Button>

          <Dialog
            open={confirmOpen}
            onOpenChange={open => updateState({ confirmOpen: open })}
          >
            <DialogContent>
              <DialogTitle>确认同步</DialogTitle>
              <div>同步表结构是高风险操作，确定要继续吗？</div>
              <DialogFooter>
                <Button
                  onClick={() => updateState({ confirmOpen: false })}
                  variant='outline'
                >
                  取消
                </Button>
                <Button
                  onClick={async () => {
                    updateState({ confirmOpen: false });
                    await handleSync();
                  }}
                  variant='destructive'
                >
                  确认同步
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <ExportActions
            tables={tables}
            exporting={exporting}
            onRollback={handleRollback}
          />

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 my-8'>
            <div>
              <h3 className='font-bold mb-2'>系统模型定义的表结构</h3>
              {modelTables.length === 0 ? (
                <div className='text-muted-foreground'>无</div>
              ) : (
                modelTables.map((modelTable, idx) => {
                  const dbTable = tables.find(t => t.name === modelTable.name);
                  return (
                    <SchemaComparisonTable
                      key={modelTable.name + '-model-' + idx}
                      table={modelTable}
                      modelTable={dbTable}
                      title='模型表'
                      isModelView={true}
                    />
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
                  return (
                    <SchemaComparisonTable
                      key={dbTable.name + '-db-' + idx}
                      table={dbTable}
                      modelTable={modelTable}
                      title='数据库表'
                      isModelView={false}
                    />
                  );
                })
              )}
            </div>
          </div>

          <OperationLogs
            logs={logs}
            logPage={logPage}
            logTotal={logTotal}
            logPageSize={logPageSize}
            onPageChange={page => updateState({ logPage: page })}
          />

          <SystemStatus
            health={health}
            perf={perf}
            backups={backups}
            onBackup={handleBackup}
            onRestore={handleRestore}
          />
        </CardContent>
      </Card>
    </div>
  );
}
