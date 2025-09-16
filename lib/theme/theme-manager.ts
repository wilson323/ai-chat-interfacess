/**
 * 主题管理器
 * 负责主题状态管理、切换逻辑和持久化存储
 */

import {
  ThemeConfig,
  ThemeManager,
  THEME_STORAGE_KEY,
  DEFAULT_THEME_ID,
} from '@/types/theme';

class ThemeManagerImpl implements ThemeManager {
  private themes: ThemeConfig[] = [];
  private currentThemeId: string = DEFAULT_THEME_ID;
  private listeners: Set<(themeId: string) => void> = new Set();

  constructor() {
    this.loadThemePreference();
  }

  /**
   * 获取当前主题ID
   */
  get currentTheme(): string {
    return this.currentThemeId;
  }

  /**
   * 获取可用主题列表
   */
  get availableThemes(): ThemeConfig[] {
    return this.themes;
  }

  /**
   * 设置主题列表
   */
  setThemes(themes: ThemeConfig[]): void {
    this.themes = themes;
  }

  /**
   * 切换主题
   */
  async switchTheme(themeId: string): Promise<void> {
    try {
      const theme = this.getThemeConfig(themeId);
      if (!theme) {
        throw new Error(`Theme with id "${themeId}" not found`);
      }

      this.currentThemeId = themeId;
      this.applyTheme(theme);
      this.saveThemePreference(themeId);
      this.notifyListeners(themeId);
    } catch (error) {
      console.error('Failed to switch theme:', error);
      throw error;
    }
  }

  /**
   * 获取主题配置
   */
  getThemeConfig(themeId: string): ThemeConfig | null {
    return this.themes.find(theme => theme.id === themeId) || null;
  }

  /**
   * 保存主题偏好
   */
  saveThemePreference(themeId: string): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, themeId);
      }
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }

  /**
   * 加载主题偏好
   */
  loadThemePreference(): string | null {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(THEME_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
    return null;
  }

  /**
   * 重置为默认主题
   */
  resetToDefault(): void {
    this.switchTheme(DEFAULT_THEME_ID);
  }

  /**
   * 应用主题到DOM
   */
  private applyTheme(theme: ThemeConfig): void {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // 应用色彩变量
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });

    // 应用样式变量
    Object.entries(theme.styles.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--theme-radius-${key}`, value);
    });

    Object.entries(theme.styles.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--theme-shadow-${key}`, value);
    });

    Object.entries(theme.styles.animations).forEach(([key, value]) => {
      root.style.setProperty(`--theme-animation-${key}`, value);
    });

    Object.entries(theme.styles.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--theme-spacing-${key}`, value);
    });

    // 应用排版变量
    Object.entries(theme.styles.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--theme-font-size-${key}`, value);
    });

    Object.entries(theme.styles.typography.lineHeight).forEach(
      ([key, value]) => {
        root.style.setProperty(`--theme-line-height-${key}`, value);
      }
    );

    Object.entries(theme.styles.typography.fontWeight).forEach(
      ([key, value]) => {
        root.style.setProperty(`--theme-font-weight-${key}`, value);
      }
    );

    root.style.setProperty(
      '--theme-font-family',
      theme.styles.typography.fontFamily
    );
  }

  /**
   * 添加主题变化监听器
   */
  addListener(listener: (themeId: string) => void): void {
    this.listeners.add(listener);
  }

  /**
   * 移除主题变化监听器
   */
  removeListener(listener: (themeId: string) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(themeId: string): void {
    this.listeners.forEach(listener => {
      try {
        listener(themeId);
      } catch (error) {
        console.error('Theme listener error:', error);
      }
    });
  }

  /**
   * 初始化主题
   */
  async initialize(): Promise<void> {
    const savedTheme = this.loadThemePreference();
    if (savedTheme && this.getThemeConfig(savedTheme)) {
      await this.switchTheme(savedTheme);
    } else {
      await this.switchTheme(DEFAULT_THEME_ID);
    }
  }
}

// 创建单例实例
export const themeManager = new ThemeManagerImpl();

// 导出类型
export type { ThemeManager };
