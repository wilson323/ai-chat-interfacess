/**
 * 主题配置管理
 * 管理所有主题配置的注册和获取
 */

import { ThemeConfig } from '../../types/theme';
import { modernTheme } from './themes/modern';
import { businessTheme } from './themes/business';
import { techTheme } from './themes/tech';
import { natureTheme } from './themes/nature';
import { artTheme } from './themes/art';

/**
 * 所有主题配置
 */
export const themeConfigs: ThemeConfig[] = [
  modernTheme,
  businessTheme,
  techTheme,
  natureTheme,
  artTheme,
];

/**
 * 根据ID获取主题配置
 */
export function getThemeById(id: string): ThemeConfig | undefined {
  return themeConfigs.find(theme => theme.id === id);
}

/**
 * 根据分类获取主题配置
 */
export function getThemesByCategory(category: string): ThemeConfig[] {
  return themeConfigs.filter(theme => theme.category === category);
}

/**
 * 获取默认主题配置
 */
export function getDefaultTheme(): ThemeConfig {
  return themeConfigs.find(theme => theme.isDefault) || modernTheme;
}

/**
 * 获取所有主题分类
 */
export function getThemeCategories(): string[] {
  return [...new Set(themeConfigs.map(theme => theme.category))];
}

/**
 * 验证主题配置
 */
export function validateThemeConfig(theme: ThemeConfig): boolean {
  try {
    // 检查必需字段
    if (!theme.id || !theme.name || !theme.colors || !theme.styles) {
      return false;
    }

    // 检查色彩配置
    const requiredColors = [
      'primary',
      'secondary',
      'accent',
      'background',
      'surface',
      'text',
    ];
    for (const color of requiredColors) {
      if (!theme.colors[color as keyof typeof theme.colors]) {
        return false;
      }
    }

    // 检查样式配置
    if (
      !theme.styles.borderRadius ||
      !theme.styles.shadows ||
      !theme.styles.typography
    ) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Theme validation error:', error);
    return false;
  }
}

/**
 * 注册新主题
 */
export function registerTheme(theme: ThemeConfig): boolean {
  if (!validateThemeConfig(theme)) {
    console.error('Invalid theme configuration:', theme);
    return false;
  }

  const existingIndex = themeConfigs.findIndex(t => t.id === theme.id);
  if (existingIndex >= 0) {
    themeConfigs[existingIndex] = theme;
  } else {
    themeConfigs.push(theme);
  }

  return true;
}

/**
 * 移除主题
 */
export function unregisterTheme(themeId: string): boolean {
  const index = themeConfigs.findIndex(theme => theme.id === themeId);
  if (index >= 0) {
    themeConfigs.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * 导出所有主题配置
 */
export { themeConfigs as themes };
