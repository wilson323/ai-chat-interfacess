'use client';
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 - 页面未找到',
  description: '请求的页面不存在',
};

/**
 * 404错误页面组件
 * 当页面不存在时显示
 */
export default function Custom404() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="mb-4">
          <h1 className="text-6xl font-bold text-blue-500">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mt-2">
            页面未找到
          </h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            抱歉，您访问的页面不存在或已被移除。
          </p>
          <p className="text-sm text-gray-500">
            请检查URL是否正确，或使用下面的链接导航。
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            返回首页
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            返回上页
          </button>

          <Link
            href="/user/chat"
            className="block w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            开始聊天
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            错误代码: 404 | 时间: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
