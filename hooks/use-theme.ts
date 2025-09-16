/**
 * 主题Hook
 * 提供主题状态管理和操作方法
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ThemeConfig } from '../types/theme';
import { themeManager } from '../lib/theme/theme-manager';
import { themeConfigs } from '../lib/theme/theme-config';

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<string>(
    themeManager.currentTheme
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化主题管理器
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        setIsLoading(true);
        themeManager.setThemes(themeConfigs);
        await themeManager.initialize();
        setCurrentTheme(themeManager.currentTheme);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to initialize theme'
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, []);

  // 监听主题变化
  useEffect(() => {
    const handleThemeChange = (themeId: string) => {
      setCurrentTheme(themeId);
    };

    themeManager.addListener(handleThemeChange);

    return () => {
      themeManager.removeListener(handleThemeChange);
    };
  }, []);

  // 切换主题
  const switchTheme = useCallback(async (themeId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await themeManager.switchTheme(themeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch theme');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 获取当前主题配置
  const getCurrentThemeConfig = useCallback((): ThemeConfig | null => {
    return themeManager.getThemeConfig(currentTheme);
  }, [currentTheme]);

  // 重置为默认主题
  const resetToDefault = useCallback(() => {
    themeManager.resetToDefault();
  }, []);

  // 根据分类获取主题
  const getThemesByCategory = useCallback(
    (category: string) => {
      return themeConfigs.filter(theme => theme.category === category);
    },
    []
  );

  return {
    currentTheme,
    themes: themeConfigs,
    isLoading,
    error,
    switchTheme,
    getCurrentThemeConfig,
    resetToDefault,
    getThemesByCategory,
  };
}
