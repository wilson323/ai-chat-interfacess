'use client';
import type { Viewport } from 'next';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 自动重定向到聊天页面
    const timer = setTimeout(() => {
      router.push('/user/chat');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">正在加载聊天界面...</h1>
        <p className="text-gray-600">页面将在2秒后自动跳转</p>
        <button
          onClick={() => router.push('/user/chat')}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          立即进入聊天
        </button>
      </div>
    </div>
  );
}
