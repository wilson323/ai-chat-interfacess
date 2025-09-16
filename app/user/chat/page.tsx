'use client';
import type { Viewport } from 'next';
import React, { useEffect, useState } from 'react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { logger } from '@/lib/utils/logger';
import { errorHandler } from '@/lib/utils/error-handler';

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

export default function UserChatPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);

        logger.chatInfo('Initializing chat page');

        // 延迟加载主要组件，避免水合错误
        await new Promise(resolve => setTimeout(resolve, 200));

        setIsLoading(false);
        logger.chatInfo('Chat page initialized successfully');
      } catch (err) {
        const errorInfo = errorHandler.handleChatError(err, 'UserChatPage.initialize');
        setError(errorInfo.message);
        setIsLoading(false);
        logger.chatError('Failed to initialize chat page', errorInfo);
      }
    };

    initialize();

    return () => {
      logger.chatInfo('Chat page cleanup');
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">正在加载聊天界面...</h2>
          <p className="text-gray-600">请稍候，正在初始化聊天功能</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">加载错误</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">请刷新页面重试</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <ChatContainer className="flex-1" />
    </div>
  );
}
