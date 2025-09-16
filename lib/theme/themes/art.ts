/**
 * 艺术创意主题配置
 * 基于Lovart设计资源提取的艺术创意风格
 */

import { ThemeConfig } from '../../../types/theme';

export const artTheme: ThemeConfig = {
  id: 'art',
  name: '艺术创意',
  description: '基于Lovart设计的艺术创意风格，充满想象力和创造力',
  category: 'art',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: new Date().toISOString(),
  preview: '/lovart-analysis/art-preview.png',
  colors: {
    primary: '#6cb33f', // 熵基绿主色
    secondary: '#8bc565', // 浅熵基绿
    accent: '#4a7c59', // 深熵基绿
    background: '#ffffff', // 纯白背景
    surface: '#f8f9fa', // 浅灰表面
    text: '#2c3e50', // 深蓝文本
    textSecondary: '#7f8c8d', // 中灰文本
    border: '#bdc3c7', // 浅灰边框
    success: '#27ae60', // 成功绿
    warning: '#f39c12', // 警告橙
    error: '#e74c3c', // 错误红
    info: '#3498db', // 信息蓝
  },
  styles: {
    borderRadius: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '20px',
      full: '9999px',
    },
    shadows: {
      sm: '0 2px 8px rgba(231, 76, 60, 0.15)',
      md: '0 4px 12px rgba(231, 76, 60, 0.2)',
      lg: '0 8px 20px rgba(231, 76, 60, 0.25)',
      xl: '0 16px 32px rgba(231, 76, 60, 0.3)',
    },
    animations: {
      fast: '0.15s ease-out',
      normal: '0.25s ease-out',
      slow: '0.4s ease-out',
    },
    spacing: {
      xs: '6px',
      sm: '12px',
      md: '20px',
      lg: '28px',
      xl: '36px',
    },
    typography: {
      fontFamily: 'Playfair Display, serif',
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      lineHeight: {
        tight: '1.2',
        normal: '1.4',
        relaxed: '1.6',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
  },
  // Lovart全面设计资源集成
  lovartResources: {
    icons: [
      '/lovart-comprehensive-assets/icons/art/0d5ccf94-742a-42c2-848d-fce3d26a312f(2).png',
      '/lovart-comprehensive-assets/icons/art/0d8ddb75-d08b-48c0-be15-127dfb7e9e98(2).png',
      '/lovart-comprehensive-assets/icons/art/17aaf1b8-5215-4cc8-99aa-0645625f0d5b(2).png',
      '/lovart-comprehensive-assets/icons/art/1a069307-0244-4e66-86bb-486727c8b1e2(2).png',
      '/lovart-comprehensive-assets/icons/art/1e2f3c9c-506c-4599-8735-06aea7aa21dd(2).png',
    ],
    illustrations: [
      '/lovart-comprehensive-assets/ui-interface/art/054b05e8-fda6-4bc0-862d-eb2fddf5412c(1).png',
      '/lovart-comprehensive-assets/ui-interface/art/0d5ccf94-742a-42c2-848d-fce3d26a312f(1).png',
    ],
    backgrounds: [
      '/lovart-comprehensive-assets/components/art/0467120e-fecf-4833-bab4-b92b8aa7102a(1).png',
      '/lovart-comprehensive-assets/components/art/054b05e8-fda6-4bc0-862d-eb2fddf5412c(1).png',
      '/lovart-comprehensive-assets/components/art/0d5ccf94-742a-42c2-848d-fce3d26a312f(1).png',
    ],
    decorations: [
      '/lovart-comprehensive-assets/decorations/art/0d5ccf94-742a-42c2-848d-fce3d26a312f.png',
      '/lovart-comprehensive-assets/decorations/art/0d8ddb75-d08b-48c0-be15-127dfb7e9e98.png',
      '/lovart-comprehensive-assets/decorations/art/17aaf1b8-5215-4cc8-99aa-0645625f0d5b.png',
    ],
  },
};
