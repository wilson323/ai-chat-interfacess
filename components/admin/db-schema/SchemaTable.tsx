'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { DatabaseTable } from '../../../types/common';

interface SchemaTableProps {
  schemas?: DatabaseTable[];
  onEdit?: (schema: DatabaseTable) => void;
  onDelete?: (schema: DatabaseTable) => void;
}

export function SchemaTable({ schemas = [], onEdit, onDelete }: SchemaTableProps) {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>表名</TableHead>
            <TableHead>字段数</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schemas.map((schema, index) => (
            <TableRow key={index}>
              <TableCell>{schema.name || '未知表'}</TableCell>
              <TableCell>{schema.columns?.length || 0}</TableCell>
              <TableCell>正常</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(schema)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      编辑
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(schema)}
                      className="text-red-600 hover:text-red-800"
                    >
                      删除
                    </button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
