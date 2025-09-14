'use client';
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
