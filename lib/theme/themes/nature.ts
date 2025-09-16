/**
 * 自然生态主题配置
 * 基于Lovart设计资源提取的自然生态风格
 */

import { ThemeConfig } from '../../../types/theme';

export const natureTheme: ThemeConfig = {
  id: 'nature',
  name: '自然生态',
  description: '基于Lovart设计的自然生态风格，绿色环保主题',
  category: 'nature',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: new Date().toISOString(),
  preview: '/lovart-analysis/nature-preview.png',
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
      sm: '6px',
      md: '10px',
      lg: '14px',
      xl: '18px',
      full: '9999px',
    },
    shadows: {
      sm: '0 2px 4px rgba(39, 174, 96, 0.1)',
      md: '0 4px 8px rgba(39, 174, 96, 0.15)',
      lg: '0 8px 16px rgba(39, 174, 96, 0.2)',
      xl: '0 16px 32px rgba(39, 174, 96, 0.25)',
    },
    animations: {
      fast: '0.2s ease-out',
      normal: '0.3s ease-out',
      slow: '0.5s ease-out',
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
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
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
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
      '/lovart-comprehensive-assets/icons/nature/006c8387-5285-4e59-84a7-adb96b3d96a7(2).png',
      '/lovart-comprehensive-assets/icons/nature/038bf7a8-4966-452d-8c6c-fe78a9bf0e86(2).png',
      '/lovart-comprehensive-assets/icons/nature/042f185c-e76a-429e-b9ef-25f5e6745959(2).png',
      '/lovart-comprehensive-assets/icons/nature/0467120e-fecf-4833-bab4-b92b8aa7102a(2).png',
      '/lovart-comprehensive-assets/icons/nature/054b05e8-fda6-4bc0-862d-eb2fddf5412c(2).png',
    ],
    illustrations: [
      '/lovart-comprehensive-assets/ui-interface/nature/0d5ccf94-742a-42c2-848d-fce3d26a312f(1).png',
      '/lovart-comprehensive-assets/ui-interface/nature/0d8ddb75-d08b-48c0-be15-127dfb7e9e98(1).png',
    ],
    backgrounds: [
      '/lovart-comprehensive-assets/components/nature/006c8387-5285-4e59-84a7-adb96b3d96a7(1).png',
      '/lovart-comprehensive-assets/components/nature/038bf7a8-4966-452d-8c6c-fe78a9bf0e86(1).png',
      '/lovart-comprehensive-assets/components/nature/042f185c-e76a-429e-b9ef-25f5e6745959(1).png',
    ],
    decorations: [
      '/lovart-comprehensive-assets/decorations/nature/006c8387-5285-4e59-84a7-adb96b3d96a7.png',
      '/lovart-comprehensive-assets/decorations/nature/038bf7a8-4966-452d-8c6c-fe78a9bf0e86.png',
      '/lovart-comprehensive-assets/decorations/nature/042f185c-e76a-429e-b9ef-25f5e6745959.png',
    ],
  },
};
