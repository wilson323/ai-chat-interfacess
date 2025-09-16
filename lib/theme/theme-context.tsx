/**
 * 主题上下文提供者
 * 提供主题切换和状态管理功能
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeConfig } from '../../types/theme';
import { getThemeById, getDefaultTheme, themeConfigs } from './theme-config';

interface ThemeContextType {
  currentTheme: ThemeConfig;
  themes: ThemeConfig[];
  switchTheme: (themeId: string) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialThemeId?: string;
}

export function ThemeProvider({ children, initialThemeId }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(getDefaultTheme());
  const [isLoading, setIsLoading] = useState(true);

  // 初始化主题
  useEffect(() => {
    const initializeTheme = (): void => {
      try {
        // 从localStorage获取保存的主题
        const savedThemeId = typeof window !== 'undefined' ? localStorage.getItem('selectedTheme') : null;
        const themeId = initialThemeId || savedThemeId || 'modern';

        const theme = getThemeById(themeId) || getDefaultTheme();
        setCurrentTheme(theme);

        // 应用主题到document
        applyThemeToDocument(theme);

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize theme:', error);
        setCurrentTheme(getDefaultTheme());
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, [initialThemeId]);

  // 切换主题
  const switchTheme = (themeId: string): void => {
    try {
      const theme = getThemeById(themeId);
      if (!theme) {
        console.error(`Theme not found: ${themeId}`);
        return;
      }

      setCurrentTheme(theme);
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedTheme', themeId);
      }
      applyThemeToDocument(theme);
    } catch (error) {
      console.error('Failed to switch theme:', error);
    }
  };

  // 应用主题到document
  const applyThemeToDocument = (theme: ThemeConfig): void => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // 应用颜色变量
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
    root.style.setProperty('--theme-font-family', theme.styles.typography.fontFamily);

    Object.entries(theme.styles.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--theme-font-size-${key}`, value);
    });

    Object.entries(theme.styles.typography.lineHeight).forEach(([key, value]) => {
      root.style.setProperty(`--theme-line-height-${key}`, value);
    });

    Object.entries(theme.styles.typography.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`--theme-font-weight-${key}`, value);
    });

    // 添加主题类名到body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme.id}`);
  };

  const value: ThemeContextType = {
    currentTheme,
    themes: themeConfigs,
    switchTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook to get current theme resources
export function useThemeResources() {
  const { currentTheme } = useTheme();
  return currentTheme.lovartResources || {};
}
