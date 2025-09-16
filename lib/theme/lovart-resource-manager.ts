/**
 * Lovart资源管理器
 * 用于管理和使用切图后的设计资源
 */

import { ThemeConfig } from '@/types/theme';

export interface LovartResource {
  id: string;
  name: string;
  path: string;
  category: 'ui-interface' | 'components' | 'icons' | 'icon-sets';
  theme: 'modern' | 'business' | 'tech' | 'nature' | 'art';
  size: number;
  confidence: number;
  tags: string[];
  description?: string;
}

export interface LovartResourceCategory {
  name: string;
  description: string;
  resources: LovartResource[];
  count: number;
}

export interface LovartResourceManager {
  getResourcesByCategory(category: string): LovartResourceCategory;
  getResourcesByTheme(theme: string): LovartResource[];
  getResourceById(id: string): LovartResource | undefined;
  searchResources(query: string): LovartResource[];
  getRandomResource(category?: string, theme?: string): LovartResource | undefined;
  getResourceStats(): {
    total: number;
    byCategory: Record<string, number>;
    byTheme: Record<string, number>;
  };
}

/**
 * Lovart资源管理器实现
 */
export class LovartResourceManagerImpl implements LovartResourceManager {
  private resources: LovartResource[] = [];
  private resourceMap: Map<string, LovartResource> = new Map();

  constructor() {
    this.loadResources();
  }

  /**
   * 加载资源数据
   */
  private loadResources(): void {
    // 从智能切图结果中加载资源
    // 这里使用模拟数据，实际应该从JSON文件加载
    this.resources = this.generateMockResources();
    
    // 构建资源映射
    this.resources.forEach(resource => {
      this.resourceMap.set(resource.id, resource);
    });
  }

  /**
   * 生成模拟资源数据
   */
  private generateMockResources(): LovartResource[] {
    const resources: LovartResource[] = [];
    
    // UI界面资源
    const uiInterfaces = [
      '0467120e-fecf-4833-bab4-b92b8aa7102a(1).png',
      '054b05e8-fda6-4bc0-862d-eb2fddf5412c(1).png',
      '0d5ccf94-742a-42c2-848d-fce3d26a312f(1).png',
      '0d8ddb75-d08b-48c0-be15-127dfb7e9e98(1).png',
      '114bf95c-312d-48f3-b51b-67f607d865aa(1).png',
    ];

    uiInterfaces.forEach((filename, index) => {
      resources.push({
        id: `ui-${index}`,
        name: `UI界面设计 ${index + 1}`,
        path: `/lovart-smart-assets/ui-interface/modern/${filename}`,
        category: 'ui-interface',
        theme: 'modern',
        size: 800000 + Math.random() * 200000,
        confidence: 0.7,
        tags: ['dashboard', 'interface', 'layout'],
        description: '主要UI界面设计，包含完整的页面布局和交互元素'
      });
    });

    // 组件资源
    const components = [
      '006c8387-5285-4e59-84a7-adb96b3d96a7(1).png',
      '038bf7a8-4966-452d-8c6c-fe78a9bf0e86(1).png',
      '042f185c-e76a-429e-b9ef-25f5e6745959(1).png',
      '07db38d9-d7d8-407f-9be6-d6d8ea1aaa3d(1).png',
      '09d65e82-3492-45e0-975a-4378ecfc4048(1).png',
    ];

    components.forEach((filename, index) => {
      resources.push({
        id: `comp-${index}`,
        name: `功能组件 ${index + 1}`,
        path: `/lovart-smart-assets/components/modern/${filename}`,
        category: 'components',
        theme: 'modern',
        size: 400000 + Math.random() * 200000,
        confidence: 0.7,
        tags: ['button', 'card', 'form', 'modal'],
        description: '功能组件设计，包含按钮、卡片、表单等UI元素'
      });
    });

    // 图标资源
    const icons = [
      '006c8387-5285-4e59-84a7-adb96b3d96a7(2).png',
      '038bf7a8-4966-452d-8c6c-fe78a9bf0e86(2).png',
      '042f185c-e76a-429e-b9ef-25f5e6745959(2).png',
      '0467120e-fecf-4833-bab4-b92b8aa7102a(2).png',
      '054b05e8-fda6-4bc0-862d-eb2fddf5412c(2).png',
    ];

    icons.forEach((filename, index) => {
      resources.push({
        id: `icon-${index}`,
        name: `图标 ${index + 1}`,
        path: `/lovart-smart-assets/icons/modern/${filename}`,
        category: 'icons',
        theme: 'modern',
        size: 5000 + Math.random() * 15000,
        confidence: 0.7,
        tags: ['action', 'status', 'navigation'],
        description: '单个图标，用于界面中的各种功能标识'
      });
    });

    // 图标集合
    const iconSets = [
      '9666dcc96aaac0ce6cf4a11b5a80ddaf0056f46d.png',
      '9df65d9a-d1f5-4ac2-93a5-4d7ce1e73217(1).png',
      '9f1c7af1171478b0a972190c9e3f2dbd4583b77a.png',
    ];

    iconSets.forEach((filename, index) => {
      resources.push({
        id: `icon-set-${index}`,
        name: `图标集合 ${index + 1}`,
        path: `/lovart-smart-assets/icon-sets/modern/${filename}`,
        category: 'icon-sets',
        theme: 'modern',
        size: 50000 + Math.random() * 100000,
        confidence: 0.7,
        tags: ['collection', 'set', 'group'],
        description: '图标集合，包含多个相关功能的图标组合'
      });
    });

    return resources;
  }

  /**
   * 根据分类获取资源
   */
  getResourcesByCategory(category: string): LovartResourceCategory {
    const categoryResources = this.resources.filter(resource => resource.category === category);
    
    return {
      name: category,
      description: this.getCategoryDescription(category),
      resources: categoryResources,
      count: categoryResources.length
    };
  }

  /**
   * 根据主题获取资源
   */
  getResourcesByTheme(theme: string): LovartResource[] {
    return this.resources.filter(resource => resource.theme === theme);
  }

  /**
   * 根据ID获取资源
   */
  getResourceById(id: string): LovartResource | undefined {
    return this.resourceMap.get(id);
  }

  /**
   * 搜索资源
   */
  searchResources(query: string): LovartResource[] {
    const lowercaseQuery = query.toLowerCase();
    
    return this.resources.filter(resource => 
      resource.name.toLowerCase().includes(lowercaseQuery) ||
      resource.description?.toLowerCase().includes(lowercaseQuery) ||
      resource.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * 获取随机资源
   */
  getRandomResource(category?: string, theme?: string): LovartResource | undefined {
    let filteredResources = this.resources;
    
    if (category) {
      filteredResources = filteredResources.filter(resource => resource.category === category);
    }
    
    if (theme) {
      filteredResources = filteredResources.filter(resource => resource.theme === theme);
    }
    
    if (filteredResources.length === 0) {
      return undefined;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredResources.length);
    return filteredResources[randomIndex];
  }

  /**
   * 获取资源统计信息
   */
  getResourceStats(): {
    total: number;
    byCategory: Record<string, number>;
    byTheme: Record<string, number>;
  } {
    const byCategory: Record<string, number> = {};
    const byTheme: Record<string, number> = {};
    
    this.resources.forEach(resource => {
      byCategory[resource.category] = (byCategory[resource.category] || 0) + 1;
      byTheme[resource.theme] = (byTheme[resource.theme] || 0) + 1;
    });
    
    return {
      total: this.resources.length,
      byCategory,
      byTheme
    };
  }

  /**
   * 获取分类描述
   */
  private getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      'ui-interface': '主要UI界面设计，包含完整的页面布局和交互元素',
      'components': '功能组件设计，包含按钮、卡片、表单等UI元素',
      'icons': '单个图标，用于界面中的各种功能标识',
      'icon-sets': '图标集合，包含多个相关功能的图标组合'
    };
    
    return descriptions[category] || '未知分类';
  }
}

/**
 * 创建资源管理器实例
 */
export function createLovartResourceManager(): LovartResourceManager {
  return new LovartResourceManagerImpl();
}

/**
 * 获取主题相关的Lovart资源
 */
export function getThemeLovartResources(theme: ThemeConfig): {
  icons: string[];
  illustrations: string[];
  backgrounds: string[];
} {
  const manager = createLovartResourceManager();
  const themeResources = manager.getResourcesByTheme(theme.id);
  
  const icons = themeResources
    .filter(resource => resource.category === 'icons' || resource.category === 'icon-sets')
    .map(resource => resource.path);
  
  const illustrations = themeResources
    .filter(resource => resource.category === 'ui-interface')
    .map(resource => resource.path);
  
  const backgrounds = themeResources
    .filter(resource => resource.category === 'components')
    .map(resource => resource.path);
  
  return {
    icons,
    illustrations,
    backgrounds
  };
}

/**
 * 更新主题配置中的Lovart资源
 */
export function updateThemeWithLovartResources(theme: ThemeConfig): ThemeConfig {
  const lovartResources = getThemeLovartResources(theme);
  
  return {
    ...theme,
    lovartResources: {
      icons: lovartResources.icons,
      illustrations: lovartResources.illustrations,
      backgrounds: lovartResources.backgrounds
    }
  };
}