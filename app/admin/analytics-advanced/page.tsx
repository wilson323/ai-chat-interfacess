'use client';

import React from 'react';
import { AdvancedAnalyticsDashboard } from '@/components/admin/AdvancedAnalyticsDashboard';
import { AdminContainer } from '@/components/admin/admin-container';

export default function AdvancedAnalyticsPage() {
  return (
    <AdminContainer title='高级数据分析'>
      <AdvancedAnalyticsDashboard />
    </AdminContainer>
  );
}
