'use client';
import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '500 - 服务器错误',
  description: '服务器内部错误',
};

/**
 * 500错误页面组件
 * 当服务器发生内部错误时显示
 */
export default function Custom500() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="mb-4">
          <h1 className="text-6xl font-bold text-red-500">500</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mt-2">
            服务器内部错误
          </h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            抱歉，服务器遇到了一个内部错误。我们正在努力修复这个问题。
          </p>
          <p className="text-sm text-gray-500">
            如果问题持续存在，请联系技术支持。
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            刷新页面
          </button>

          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            返回上页
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            返回首页
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            错误代码: 500 | 时间: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
