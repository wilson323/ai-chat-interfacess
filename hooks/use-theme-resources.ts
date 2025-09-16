/**
 * 主题资源管理Hook
 * 提供Lovart设计资源的访问和管理功能
 */

import { useTheme as useThemeContext } from '@/lib/theme/theme-context';

export interface ThemeResource {
  path: string;
  category: 'icons' | 'illustrations' | 'backgrounds' | 'logos' | 'decorations' | 'iconSets';
  theme: string;
}

export function useThemeResources() {
  const { currentTheme } = useThemeContext();
  const lovartResources = currentTheme.lovartResources || {};

  // 获取指定类别的资源
  const getResourcesByCategory = (category: keyof typeof lovartResources): string[] => {
    return lovartResources[category] || [];
  };

  // 获取随机资源
  const getRandomResource = (category: keyof typeof lovartResources): string | null => {
    const resources = getResourcesByCategory(category);
    if (resources.length === 0) return null;
    return resources[Math.floor(Math.random() * resources.length)];
  };

  // 获取所有资源
  const getAllResources = (): ThemeResource[] => {
    const allResources: ThemeResource[] = [];

    Object.entries(lovartResources).forEach(([category, paths]) => {
      if (Array.isArray(paths)) {
        paths.forEach(path => {
          allResources.push({
            path,
            category: category as ThemeResource['category'],
            theme: 'current', // 当前主题
          });
        });
      }
    });

    return allResources;
  };

  // 搜索资源
  const searchResources = (query: string): ThemeResource[] => {
    const allResources = getAllResources();
    const lowercaseQuery = query.toLowerCase();

    return allResources.filter(resource =>
      resource.path.toLowerCase().includes(lowercaseQuery) ||
      resource.category.toLowerCase().includes(lowercaseQuery)
    );
  };

  // 按类别分组资源
  const getResourcesByCategoryGroup = (): Record<string, string[]> => {
    const grouped: Record<string, string[]> = {};

    Object.entries(lovartResources).forEach(([category, paths]) => {
      if (Array.isArray(paths)) {
        grouped[category] = paths;
      }
    });

    return grouped;
  };

  // 获取资源统计信息
  const getResourceStats = (): { total: number; byCategory: Record<string, number> } => {
    const stats = {
      total: 0,
      byCategory: {} as Record<string, number>,
    };

    Object.entries(lovartResources).forEach(([category, paths]) => {
      if (Array.isArray(paths)) {
        stats.byCategory[category] = paths.length;
        stats.total += paths.length;
      }
    });

    return stats;
  };

  return {
    lovartResources,
    getResourcesByCategory,
    getRandomResource,
    getAllResources,
    searchResources,
    getResourcesByCategoryGroup,
    getResourceStats,
  };
}

// 资源预览组件Hook
export function useResourcePreview() {
  const { getRandomResource, getResourcesByCategory, getResourceStats } = useThemeResources();

  // 获取预览图片
  const getPreviewImage = (category: 'illustrations' | 'backgrounds' | 'decorations'): string | null => {
    return getRandomResource(category);
  };

  // 获取图标集
  const getIconSet = (count: number = 5): string[] => {
    const icons = getResourcesByCategory('icons');
    return icons.slice(0, count);
  };

  // 获取背景图片
  const getBackgroundImage = (): string | null => {
    return getRandomResource('backgrounds');
  };

  return {
    getPreviewImage,
    getIconSet,
    getBackgroundImage,
    getResourceStats,
  };
}
