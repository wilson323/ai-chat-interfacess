'use client';

import { Button } from '@/components/ui/button';
import { exportToJSON, exportToCSV, exportToSQL } from '../../../lib/db-schema/utils';
import { TableInfo } from '../../../types/db-schema';
import type { DatabaseTable, DatabaseColumn } from '../../../types/common';
import { useRef } from 'react';

interface ExportActionsProps {
  tables: TableInfo[];
  exporting: boolean;
  onRollback: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ExportActions({
  tables,
  exporting,
  onRollback,
}: ExportActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async (type: 'json' | 'csv') => {
    // 转换 TableInfo[] 为 DatabaseTable[]
    const databaseTables: DatabaseTable[] = tables.map(table => ({
      name: table.name,
      columns: table.columns.map(col => ({
        name: col.name,
        type: col.type,
        nullable: col.allowNull,
        defaultValue: col.defaultValue,
        isPrimaryKey: false,
      } as DatabaseColumn))
    }));

    if (type === 'json') {
      exportToJSON(tables as any, 'db-schema.json');
    } else {
      exportToCSV(databaseTables, 'db-schema.csv');
    }
  };

  const handleExportSQL = () => {
    // 转换 TableInfo[] 为 DatabaseTable[]
    const databaseTables: DatabaseTable[] = tables.map(table => ({
      name: table.name,
      columns: table.columns.map(col => ({
        name: col.name,
        type: col.type,
        nullable: col.allowNull,
        defaultValue: col.defaultValue,
        isPrimaryKey: false,
      } as DatabaseColumn))
    }));

    exportToSQL(databaseTables, 'db-schema.sql');
  };

  return (
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
        onChange={onRollback}
      />
      <Button
        variant='destructive'
        onClick={() => fileInputRef.current?.click()}
      >
        回滚SQL快照
      </Button>
    </div>
  );
}
