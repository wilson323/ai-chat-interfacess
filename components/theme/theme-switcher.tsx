/**
 * 主题切换器组件
 * 提供主题选择和切换功能
 */

'use client';

import React, { useState } from 'react';
import { useTheme } from '@/lib/theme/theme-context';
import { ThemeConfig } from '@/types/theme';

interface ThemeSwitcherProps {
  className?: string;
  showPreview?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeSwitcher({
  className = '',
  showPreview = true,
  size = 'md'
}: ThemeSwitcherProps) {
  const { currentTheme, themes, switchTheme, isLoading } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-3',
  };

  const handleThemeSelect = (theme: ThemeConfig): void => {
    switchTheme(theme.id);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg ${sizeClasses[size]} ${className}`}>
        加载中...
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* 当前主题显示 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 bg-white border border-gray-300 rounded-lg shadow-sm
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-all duration-200 ${sizeClasses[size]}
        `}
      >
        {showPreview && (
          <div
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: currentTheme.colors.primary }}
          />
        )}
        <span className="font-medium">{currentTheme.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 主题选择下拉菜单 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeSelect(theme)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50
                transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg
                ${currentTheme.id === theme.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
              `}
            >
              {showPreview && (
                <div
                  className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: theme.colors.primary }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{theme.name}</div>
                <div className="text-sm text-gray-500 truncate">{theme.description}</div>
              </div>
              {currentTheme.id === theme.id && (
                <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 点击外部关闭菜单 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// 主题预览组件
export function ThemePreview({ theme, className = '' }: { theme: ThemeConfig; className?: string }): JSX.Element {
  return (
    <div className={`p-4 rounded-lg border ${className}`} style={{ backgroundColor: theme.colors.surface }}>
      <div className="space-y-3">
        {/* 颜色预览 */}
        <div className="flex gap-2">
          <div
            className="w-8 h-8 rounded-full border border-gray-300"
            style={{ backgroundColor: theme.colors.primary }}
            title="主色"
          />
          <div
            className="w-8 h-8 rounded-full border border-gray-300"
            style={{ backgroundColor: theme.colors.secondary }}
            title="次色"
          />
          <div
            className="w-8 h-8 rounded-full border border-gray-300"
            style={{ backgroundColor: theme.colors.accent }}
            title="强调色"
          />
        </div>

        {/* 文本预览 */}
        <div>
          <h3
            className="font-semibold mb-1"
            style={{ color: theme.colors.text }}
          >
            {theme.name}
          </h3>
          <p
            className="text-sm"
            style={{ color: theme.colors.textSecondary }}
          >
            {theme.description}
          </p>
        </div>

        {/* 按钮预览 */}
        <button
          className="px-3 py-1 rounded text-sm font-medium transition-colors"
          style={{
            backgroundColor: theme.colors.primary,
            color: theme.colors.background
          }}
        >
          预览按钮
        </button>
      </div>
    </div>
  );
}
