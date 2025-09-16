'use client';
import type { Viewport } from 'next';
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
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 重定向到CAD智能体配置页面
export default function CadAnalyzerRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/cad-analyzer-config');
  }, [router]);

  return (
    <div className='text-center py-8'>正在跳转到 CAD 智能体配置页面...</div>
  );
}
