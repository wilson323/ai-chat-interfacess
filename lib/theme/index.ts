/**
 * 主题系统入口文件
 * 导出所有主题相关的组件、Hook和工具函数
 */

// 主题配置
export { themeConfigs, getThemeById, getThemesByCategory, getDefaultTheme } from './theme-config';

// 主题上下文和Hook
export { ThemeProvider, useTheme, useThemeResources } from './theme-context';

// 主题组件
export { ThemeSwitcher, ThemePreview } from '@/components/theme/theme-switcher';
export { ThemeGrid, ThemeDetails } from '@/components/theme/theme-preview';

// 资源管理Hook
export { useThemeResources as useLovartResources, useResourcePreview } from '@/hooks/use-theme-resources';

// 类型定义
export type {
  ThemeConfig,
  ColorScheme,
  StyleScheme,
  TypographyConfig,
  ThemeCategory
} from '@/types/theme';

// 主题常量
export { THEME_CATEGORIES, DEFAULT_THEME_ID, THEME_STORAGE_KEY } from '@/types/theme';
