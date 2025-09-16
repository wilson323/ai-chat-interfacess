'use client';

import React from 'react';
import type { Viewport } from 'next';
export const dynamic = 'force-dynamic';
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
import { AdvancedAnalyticsDashboard } from '@/components/admin/AdvancedAnalyticsDashboard';
import { AdminContainer } from '@/components/admin/admin-container';

export default function AdvancedAnalyticsPage() {
  return (
    <AdminContainer title='高级数据分析'>
      <AdvancedAnalyticsDashboard />
    </AdminContainer>
  );
}
