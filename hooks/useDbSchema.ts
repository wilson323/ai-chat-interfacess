'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DbSchemaState,
} from '@/types/db-schema';

const initialState: DbSchemaState = {
  tables: [],
  modelTables: [],
  syncNeeded: false,
  loading: true,
  syncing: false,
  error: '',
  success: '',
  diffs: [],
  confirmOpen: false,
  exporting: false,
  logs: [],
  logTotal: 0,
  logPage: 1,
  health: null,
  perf: null,
  backups: [],
};

export function useDbSchema() {
  const [state, setState] = useState<DbSchemaState>(initialState);
  const logPageSize = 20;

  // 自动检测表结构
  useEffect(() => {
    fetch('/api/admin/db-schema/check')
      .then(res => res.json())
      .then(data => {
        setState(prev => ({
          ...prev,
          syncNeeded: data.syncNeeded,
          diffs: data.diffs || [],
          loading: false,
        }));
      })
      .catch(() =>
        setState(prev => ({ ...prev, error: '检测表结构失败', loading: false }))
      );
  }, []);

  // 获取表结构
  useEffect(() => {
    fetch('/api/admin/db-schema/tables')
      .then(res => res.json())
      .then(data => {
        setState(prev => ({
          ...prev,
          tables: data.dbTables || [],
          modelTables: data.modelTables || [],
        }));
      })
      .catch(() => setState(prev => ({ ...prev, error: '获取表结构失败' })));
  }, [state.success]);

  // 获取操作日志
  const fetchLogs = useCallback(() => {
    fetch(
      `/api/admin/db-schema/log?page=${state.logPage}&pageSize=${logPageSize}`
    )
      .then(res => res.json())
      .then(data => {
        setState(prev => ({
          ...prev,
          logs: data.logs || [],
          logTotal: data.total || 0,
        }));
      });
  }, [state.logPage]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // 获取健康状态
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(health => setState(prev => ({ ...prev, health })));
  }, []);

  // 获取性能状态
  useEffect(() => {
    fetch('/api/admin/monitor/performance')
      .then(r => r.json())
      .then(perf => setState(prev => ({ ...prev, perf })));
  }, []);

  // 获取备份列表
  useEffect(() => {
    fetch('/api/admin/db-schema/backup')
      .then(r => r.json())
      .then(d => setState(prev => ({ ...prev, backups: d.files || [] })));
  }, [state.success]);

  // 手动同步
  const handleSync = async () => {
    setState(prev => ({ ...prev, syncing: true, error: '', success: '' }));
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
        setState(prev => ({
          ...prev,
          success: '表结构同步成功',
          syncNeeded: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: data.error || '同步失败',
        }));
      }
    } catch {
      setState(prev => ({ ...prev, error: '同步失败' }));
    } finally {
      setState(prev => ({ ...prev, syncing: false }));
    }
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
  };

  // 备份
  const handleBackup = async () => {
    await fetch('/api/admin/db-schema/backup', { method: 'POST' });
    setState(prev => ({ ...prev, success: '备份成功' }));
  };

  // 恢复
  const handleRestore = async (file: string) => {
    await fetch('/api/admin/db-schema/backup', {
      method: 'PUT',
      body: JSON.stringify({ file }),
      headers: { 'Content-Type': 'application/json' },
    });
    setState(prev => ({ ...prev, success: '恢复成功' }));
  };

  // 更新状态
  const updateState = (updates: Partial<DbSchemaState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return {
    ...state,
    handleSync,
    handleRollback,
    handleBackup,
    handleRestore,
    updateState,
  };
}
