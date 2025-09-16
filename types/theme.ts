/**
 * 主题系统类型定义
 */

export interface ColorScheme {
  /** 主色调 */
  primary: string;
  /** 辅助色 */
  secondary: string;
  /** 强调色 */
  accent: string;
  /** 背景色 */
  background: string;
  /** 表面色 */
  surface: string;
  /** 文字色 */
  text: string;
  /** 次要文字色 */
  textSecondary: string;
  /** 边框色 */
  border: string;
  /** 成功色 */
  success: string;
  /** 警告色 */
  warning: string;
  /** 错误色 */
  error: string;
  /** 信息色 */
  info: string;
}

export interface TypographyConfig {
  /** 字体族 */
  fontFamily: string;
  /** 字体大小 */
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  /** 行高 */
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
  /** 字重 */
  fontWeight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
}

export interface StyleScheme {
  /** 圆角 */
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  /** 阴影 */
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  /** 动画 */
  animations: {
    fast: string;
    normal: string;
    slow: string;
  };
  /** 间距 */
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  /** 排版配置 */
  typography: TypographyConfig;
}

export interface ThemeConfig {
  /** 主题唯一标识 */
  id: string;
  /** 主题显示名称 */
  name: string;
  /** 主题描述 */
  description: string;
  /** 主题分类 */
  category: 'modern' | 'business' | 'tech' | 'nature' | 'art';
  /** 色彩配置 */
  colors: ColorScheme;
  /** 样式配置 */
  styles: StyleScheme;
  /** 预览图片路径 */
  preview: string;
  /** 是否为默认主题 */
  isDefault?: boolean;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** Lovart设计资源 */
  lovartResources?: {
    /** 图标资源 */
    icons?: string[];
    /** 插画资源 */
    illustrations?: string[];
    /** 背景资源 */
    backgrounds?: string[];
    /** 装饰资源 */
    decorations?: string[];
    /** 图标集资源 */
    iconSets?: string[];
    /** 标志资源 */
    logos?: string[];
  };
}

export interface ThemeManager {
  /** 当前主题ID */
  currentTheme: string;
  /** 可用主题列表 */
  availableThemes: ThemeConfig[];
  /** 切换主题 */
  switchTheme: (themeId: string) => Promise<void>;
  /** 获取主题配置 */
  getThemeConfig: (themeId: string) => ThemeConfig | null;
  /** 保存主题偏好 */
  saveThemePreference: (themeId: string) => void;
  /** 加载主题偏好 */
  loadThemePreference: () => string | null;
  /** 重置为默认主题 */
  resetToDefault: () => void;
}

export interface ThemeSelectorProps {
  /** 可用主题列表 */
  themes: ThemeConfig[];
  /** 当前主题ID */
  currentTheme: string;
  /** 主题切换回调 */
  onThemeChange: (themeId: string) => void;
  /** 是否显示预览 */
  showPreview?: boolean;
  /** 是否显示描述 */
  showDescription?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

export interface ThemePreviewProps {
  /** 主题配置 */
  theme: ThemeConfig;
  /** 是否选中 */
  selected?: boolean;
  /** 点击回调 */
  onClick?: () => void;
  /** 自定义样式类名 */
  className?: string;
}

export interface ThemeCardProps {
  /** 主题配置 */
  theme: ThemeConfig;
  /** 是否选中 */
  selected?: boolean;
  /** 点击回调 - 传入主题ID */
  onClick?: (themeId: string) => void;
  /** 自定义样式类名 */
  className?: string;
  /** 是否显示预览 */
  showPreview?: boolean;
  /** 是否显示描述 */
  showDescription?: boolean;
}

/** 主题存储键名 */
export const THEME_STORAGE_KEY = 'ai-chat-theme';

/** 默认主题ID */
export const DEFAULT_THEME_ID = 'modern';

/** 主题分类映射 */
export const THEME_CATEGORIES = {
  modern: '现代简约',
  business: '商务专业',
  tech: '科技未来',
  nature: '自然清新',
  art: '艺术创意',
} as const;

/** 主题分类类型 */
export type ThemeCategory = keyof typeof THEME_CATEGORIES;
