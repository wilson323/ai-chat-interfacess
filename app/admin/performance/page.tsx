'use client';

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
import React from 'react';
import { PerformanceDashboard } from '@/components/admin/performance/PerformanceDashboard';

export default function PerformancePage() {
  return (
    <div className='container mx-auto py-6'>
      <PerformanceDashboard />
    </div>
  );
}
