/**
 * 主题配置测试
 */

import { describe, it, expect } from '@jest/globals';
import '@testing-library/jest-dom';
import {
  getThemeById,
  getThemesByCategory,
  getDefaultTheme,
  getThemeCategories,
  validateThemeConfig,
  registerTheme,
  unregisterTheme,
} from '@/lib/theme/theme-config';
import { ThemeConfig } from '@/types/theme';

describe('ThemeConfig', () => {
  describe('getThemeById', () => {
    it('应该根据ID获取主题', () => {
      const theme = getThemeById('modern');
      expect(theme).toBeDefined();
      expect(theme?.id).toBe('modern');
    });

    it('应该返回undefined当主题不存在时', () => {
      const theme = getThemeById('nonexistent');
      expect(theme).toBeUndefined();
    });
  });

  describe('getThemesByCategory', () => {
    it('应该根据分类获取主题', () => {
      const modernThemes = getThemesByCategory('modern');
      expect(modernThemes).toHaveLength(1);
      expect(modernThemes[0].category).toBe('modern');
    });

    it('应该返回空数组当分类不存在时', () => {
      const themes = getThemesByCategory('nonexistent');
      expect(themes).toHaveLength(0);
    });
  });

  describe('getDefaultTheme', () => {
    it('应该返回默认主题', () => {
      const defaultTheme = getDefaultTheme();
      expect(defaultTheme).toBeDefined();
      expect(defaultTheme.isDefault).toBe(true);
    });
  });

  describe('getThemeCategories', () => {
    it('应该返回所有主题分类', () => {
      const categories = getThemeCategories();
      expect(categories).toContain('modern');
      expect(categories).toContain('business');
      expect(categories).toContain('tech');
      expect(categories).toContain('nature');
      expect(categories).toContain('art');
    });
  });

  describe('validateThemeConfig', () => {
    it('应该验证有效的主题配置', () => {
      const validTheme: ThemeConfig = {
        id: 'test',
        name: 'Test Theme',
        description: 'Test Description',
        category: 'modern',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        preview: '/test.png',
        colors: {
          primary: '#000000',
          secondary: '#111111',
          accent: '#222222',
          background: '#ffffff',
          surface: '#f0f0f0',
          text: '#000000',
          textSecondary: '#666666',
          border: '#cccccc',
          success: '#00ff00',
          warning: '#ffff00',
          error: '#ff0000',
          info: '#0000ff',
        },
        styles: {
          borderRadius: {
            sm: '4px',
            md: '8px',
            lg: '12px',
            xl: '16px',
            full: '9999px',
          },
          shadows: {
            sm: '0 1px 2px rgba(0,0,0,0.1)',
            md: '0 4px 6px rgba(0,0,0,0.1)',
            lg: '0 10px 15px rgba(0,0,0,0.1)',
            xl: '0 20px 25px rgba(0,0,0,0.1)',
          },
          animations: {
            fast: '0.1s',
            normal: '0.3s',
            slow: '0.5s',
          },
          spacing: {
            xs: '4px',
            sm: '8px',
            md: '16px',
            lg: '24px',
            xl: '32px',
          },
          typography: {
            fontFamily: 'Arial',
            fontSize: {
              xs: '12px',
              sm: '14px',
              base: '16px',
              lg: '18px',
              xl: '20px',
              '2xl': '24px',
              '3xl': '30px',
            },
            lineHeight: {
              tight: '1.2',
              normal: '1.5',
              relaxed: '1.8',
            },
            fontWeight: {
              normal: '400',
              medium: '500',
              semibold: '600',
              bold: '700',
            },
          },
        },
      };

      expect(validateThemeConfig(validTheme)).toBe(true);
    });

    it('应该拒绝无效的主题配置', () => {
      const invalidTheme = {
        id: 'test',
        // 缺少必需字段
      } as any;

      expect(validateThemeConfig(invalidTheme)).toBe(false);
    });
  });

  describe('registerTheme', () => {
    it('应该注册新主题', () => {
      const newTheme: ThemeConfig = {
        id: 'custom',
        name: 'Custom Theme',
        description: 'Custom Description',
        category: 'modern',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        preview: '/custom.png',
        colors: {
          primary: '#000000',
          secondary: '#111111',
          accent: '#222222',
          background: '#ffffff',
          surface: '#f0f0f0',
          text: '#000000',
          textSecondary: '#666666',
          border: '#cccccc',
          success: '#00ff00',
          warning: '#ffff00',
          error: '#ff0000',
          info: '#0000ff',
        },
        styles: {
          borderRadius: {
            sm: '4px',
            md: '8px',
            lg: '12px',
            xl: '16px',
            full: '9999px',
          },
          shadows: {
            sm: '0 1px 2px rgba(0,0,0,0.1)',
            md: '0 4px 6px rgba(0,0,0,0.1)',
            lg: '0 10px 15px rgba(0,0,0,0.1)',
            xl: '0 20px 25px rgba(0,0,0,0.1)',
          },
          animations: {
            fast: '0.1s',
            normal: '0.3s',
            slow: '0.5s',
          },
          spacing: {
            xs: '4px',
            sm: '8px',
            md: '16px',
            lg: '24px',
            xl: '32px',
          },
          typography: {
            fontFamily: 'Arial',
            fontSize: {
              xs: '12px',
              sm: '14px',
              base: '16px',
              lg: '18px',
              xl: '20px',
              '2xl': '24px',
              '3xl': '30px',
            },
            lineHeight: {
              tight: '1.2',
              normal: '1.5',
              relaxed: '1.8',
            },
            fontWeight: {
              normal: '400',
              medium: '500',
              semibold: '600',
              bold: '700',
            },
          },
        },
      };

      const result = registerTheme(newTheme);
      expect(result).toBe(true);
      expect(getThemeById('custom')).toBeDefined();
    });

    it('应该拒绝无效的主题配置', () => {
      const invalidTheme = {
        id: 'invalid',
        // 缺少必需字段
      } as any;

      const result = registerTheme(invalidTheme);
      expect(result).toBe(false);
    });
  });

  describe('unregisterTheme', () => {
    it('应该移除主题', () => {
      const result = unregisterTheme('custom');
      expect(result).toBe(true);
      expect(getThemeById('custom')).toBeUndefined();
    });

    it('应该返回false当主题不存在时', () => {
      const result = unregisterTheme('nonexistent');
      expect(result).toBe(false);
    });
  });
});
