/**
 * 主题管理器测试
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { themeManager } from '@/lib/theme/theme-manager';
import { themeConfigs } from '@/lib/theme/theme-config';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock document.documentElement
const mockDocumentElement = {
  style: {
    setProperty: jest.fn(),
  },
};
Object.defineProperty(document, 'documentElement', {
  value: mockDocumentElement,
});

describe('ThemeManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    themeManager.setThemes(themeConfigs);
  });

  describe('初始化', () => {
    it('应该正确设置主题列表', () => {
      expect(themeManager.availableThemes).toHaveLength(5);
      expect(themeManager.availableThemes[0].id).toBe('modern');
    });

    it('应该正确获取当前主题', () => {
      expect(themeManager.currentTheme).toBe('modern');
    });
  });

  describe('主题切换', () => {
    it('应该能够切换到指定主题', async () => {
      await themeManager.switchTheme('business');
      expect(themeManager.currentTheme).toBe('business');
    });

    it('应该能够获取主题配置', () => {
      const theme = themeManager.getThemeConfig('modern');
      expect(theme).toBeDefined();
      expect(theme?.id).toBe('modern');
    });

    it('应该返回null当主题不存在时', () => {
      const theme = themeManager.getThemeConfig('nonexistent');
      expect(theme).toBeNull();
    });
  });

  describe('主题持久化', () => {
    it('应该保存主题偏好到localStorage', () => {
      themeManager.saveThemePreference('tech');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ai-chat-theme',
        'tech'
      );
    });

    it('应该从localStorage加载主题偏好', () => {
      (localStorageMock.getItem as jest.Mock).mockReturnValue('nature');
      const theme = themeManager.loadThemePreference();
      expect(theme).toBe('nature');
    });

    it('应该处理localStorage错误', () => {
      (localStorageMock.getItem as jest.Mock).mockImplementation(() => {
        throw new Error('localStorage error');
      });
      const theme = themeManager.loadThemePreference();
      expect(theme).toBeNull();
    });
  });

  describe('主题应用', () => {
    it('应该应用主题到DOM', async () => {
      const theme = themeManager.getThemeConfig('modern');
      await themeManager.switchTheme('modern');

      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--theme-primary',
        theme?.colors.primary
      );
    });
  });

  describe('监听器', () => {
    it('应该能够添加和移除监听器', () => {
      const listener = jest.fn();
      themeManager.addListener(listener);
      themeManager.removeListener(listener);
      // 监听器应该被正确管理
    });
  });
});
