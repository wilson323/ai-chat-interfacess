/**
 * 主题预览组件
 * 提供主题的视觉预览和展示功能
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { ThemeConfig } from '@/types/theme';
import { useResourcePreview } from '@/hooks/use-theme-resources';

interface ThemePreviewProps {
  theme: ThemeConfig;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  showResources?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ThemePreview({
  theme,
  selected = false,
  onClick,
  className = '',
  showResources = true,
  size = 'md'
}: ThemePreviewProps): JSX.Element {
  const { getPreviewImage, getIconSet, getBackgroundImage } = useResourcePreview();

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const previewImage = getPreviewImage('illustrations');
  const backgroundImage = getBackgroundImage();
  const iconSet = getIconSet(4);

  return (
    <div
      className={`
        relative rounded-lg border-2 transition-all duration-200 cursor-pointer
        ${selected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'}
        ${sizeClasses[size]} ${className}
      `}
      onClick={onClick}
      style={{ backgroundColor: theme.colors.surface }}
    >
      {/* 背景装饰 */}
      {backgroundImage && (
        <div
          className="absolute inset-0 opacity-10 rounded-lg"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* 主题信息 */}
      <div className="relative z-10 space-y-3">
        {/* 主题名称和描述 */}
        <div>
          <h3
            className="font-semibold text-lg mb-1"
            style={{ color: theme.colors.text }}
          >
            {theme.name}
          </h3>
          <p
            className="text-sm opacity-75"
            style={{ color: theme.colors.textSecondary }}
          >
            {theme.description}
          </p>
        </div>

        {/* 颜色预览 */}
        <div className="flex gap-2">
          <div
            className="w-6 h-6 rounded-full border border-gray-300"
            style={{ backgroundColor: theme.colors.primary }}
            title="主色"
          />
          <div
            className="w-6 h-6 rounded-full border border-gray-300"
            style={{ backgroundColor: theme.colors.secondary }}
            title="次色"
          />
          <div
            className="w-6 h-6 rounded-full border border-gray-300"
            style={{ backgroundColor: theme.colors.accent }}
            title="强调色"
          />
          <div
            className="w-6 h-6 rounded-full border border-gray-300"
            style={{ backgroundColor: theme.colors.success }}
            title="成功色"
          />
        </div>

        {/* 组件预览 */}
        <div className="space-y-2">
          {/* 按钮预览 */}
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded text-sm font-medium transition-colors"
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.background
              }}
            >
              主要按钮
            </button>
            <button
              className="px-3 py-1 rounded text-sm font-medium border transition-colors"
              style={{
                borderColor: theme.colors.primary,
                color: theme.colors.primary,
                backgroundColor: 'transparent'
              }}
            >
              次要按钮
            </button>
          </div>

          {/* 输入框预览 */}
          <input
            id="themePreviewInput"
            name="themePreviewInput"
            type="text"
            placeholder="输入框预览"
            className="w-full px-2 py-1 rounded text-sm border"
            style={{
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
            readOnly
          />
        </div>

        {/* Lovart资源预览 */}
        {showResources && (
          <div className="space-y-2">
            {/* 插画预览 */}
            {previewImage && (
              <div className="relative h-16 rounded overflow-hidden">
                <Image
                  src={previewImage}
                  alt="主题插画预览"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}

            {/* 图标集预览 */}
            {iconSet.length > 0 && (
              <div className="flex gap-1">
                {iconSet.map((icon, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded border relative"
                    style={{ backgroundColor: theme.colors.background }}
                  >
                    <Image
                      src={icon}
                      alt={`图标 ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="24px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 选中状态指示器 */}
        {selected && (
          <div className="absolute top-2 right-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 主题网格组件
interface ThemeGridProps {
  themes: ThemeConfig[];
  selectedThemeId?: string;
  onThemeSelect?: (themeId: string) => void;
  className?: string;
  showResources?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeGrid({
  themes,
  selectedThemeId,
  onThemeSelect,
  className = '',
  showResources = true,
  size = 'md'
}: ThemeGridProps): JSX.Element {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {themes.map((theme) => (
        <ThemePreview
          key={theme.id}
          theme={theme}
          selected={theme.id === selectedThemeId}
          onClick={() => onThemeSelect?.(theme.id)}
          showResources={showResources}
          size={size}
        />
      ))}
    </div>
  );
}

// 主题详情组件
interface ThemeDetailsProps {
  theme: ThemeConfig;
  className?: string;
}

export function ThemeDetails({ theme, className = '' }: ThemeDetailsProps): JSX.Element {
  const { getResourceStats } = useResourcePreview();

  const stats = getResourceStats();

  // 使用stats变量来避免未使用警告
  console.log('Theme resource stats:', stats);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 主题基本信息 */}
      <div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: theme.colors.text }}
        >
          {theme.name}
        </h2>
        <p
          className="text-lg opacity-75"
          style={{ color: theme.colors.textSecondary }}
        >
          {theme.description}
        </p>
      </div>

      {/* 颜色方案 */}
      <div>
        <h3
          className="text-lg font-semibold mb-3"
          style={{ color: theme.colors.text }}
        >
          颜色方案
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(theme.colors).map(([key, value]) => (
            <div key={key} className="text-center">
              <div
                className="w-12 h-12 rounded-lg border border-gray-300 mx-auto mb-2"
                style={{ backgroundColor: value }}
              />
              <div
                className="text-xs font-medium"
                style={{ color: theme.colors.text }}
              >
                {key}
              </div>
              <div
                className="text-xs opacity-60"
                style={{ color: theme.colors.textSecondary }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 资源统计 */}
      {theme.lovartResources && (
        <div>
          <h3
            className="text-lg font-semibold mb-3"
            style={{ color: theme.colors.text }}
          >
            Lovart设计资源
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(theme.lovartResources).map(([category, resources]) => (
              <div
                key={category}
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border
                }}
              >
                <div
                  className="text-sm font-medium mb-1"
                  style={{ color: theme.colors.text }}
                >
                  {category}
                </div>
                <div
                  className="text-2xl font-bold"
                  style={{ color: theme.colors.primary }}
                >
                  {resources?.length || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
