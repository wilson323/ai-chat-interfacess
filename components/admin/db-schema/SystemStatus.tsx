'use client';

import { HealthStatus, PerformanceStatus } from '../../../types/db-schema';
import { useTranslation } from '../../../lib/i18n';

interface SystemStatusProps {
  health: HealthStatus | null;
  perf: PerformanceStatus | null;
  backups: string[];
  onBackup: () => void;
  onRestore: (file: string) => void;
}

export function SystemStatus({
  health,
  perf,
  backups,
  onBackup,
  onRestore,
}: SystemStatusProps) {
  const { t } = useTranslation();

  return (
    <>
      <h2
        className='text-xl font-bold mt-10'
        tabIndex={0}
        aria-label={t('dbSchema.health')}
      >
        {t('dbSchema.health')}
      </h2>
      <div className='flex gap-8 my-2' role='region' aria-label='health-status'>
        <div>
          {t('dbSchema.dbStatus')}: <span aria-live='polite'>{health?.db}</span>
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
      <div className='flex gap-4 my-2' role='region' aria-label='backup-list'>
        <button onClick={onBackup}>{t('dbSchema.backup')}</button>
        {backups.map(f => (
          <button key={f} onClick={() => onRestore(f)}>
            {t('dbSchema.restore')} {f}
          </button>
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
    </>
  );
}
