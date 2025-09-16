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

// 重定向到图像编辑智能体配置页面
export default function ImageEditorRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/image-editor-config');
  }, [router]);

  return (
    <div className='text-center py-8'>正在跳转到图像编辑智能体配置页面...</div>
  );
}
