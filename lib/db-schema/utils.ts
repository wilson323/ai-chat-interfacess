/**
 * 数据库模式工具函数
 */

import { ModelField, DatabaseField } from '@/types/db-schema';
import type { JsonValue, DatabaseTable } from '@/types/common';

/**
 * 比较字段差异
 */
export function getFieldDiff(
  modelField: ModelField | undefined,
  dbField: DatabaseField | undefined
): 'new' | 'missing' | 'diff' | 'same' {
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

/**
 * 导出JSON格式
 */
export function exportToJSON(data: JsonValue, filename: string = 'db-schema.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 导出CSV格式
 */
export function exportToCSV(tables: DatabaseTable[], filename: string = 'db-schema.csv') {
  const rows = [
    ['表名', '字段名', '类型', '可空', '默认值'],
    ...tables.flatMap((table: DatabaseTable) =>
      table.columns.map((col) => [
        table.name,
        col.name,
        col.type,
        col.nullable ? '是' : '否',
        col.defaultValue ?? '',
      ])
    ),
  ];
  const csv = rows
    .map(r =>
      r
        .map((v: unknown) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 导出SQL快照
 */
export function exportToSQL(tables: DatabaseTable[], filename: string = 'db-schema.sql') {
  const sql = tables
    .map(
      (table: DatabaseTable) =>
        `-- ${table.name}\nCREATE TABLE IF NOT EXISTS "${table.name}" (...);`
    )
    .join('\n\n');
  const blob = new Blob([sql], { type: 'text/sql' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
