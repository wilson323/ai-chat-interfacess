/**
 * 现代简约主题配置
 * 基于Lovart设计资源提取的现代简约风格
 */

import { ThemeConfig } from '../../../types/theme';

export const modernTheme: ThemeConfig = {
  id: 'modern',
  name: '现代简约',
  description: '基于Lovart设计的简洁优雅现代风格，注重留白和几何形状',
  category: 'modern',
  isDefault: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: new Date().toISOString(),
  preview: '/lovart-analysis/avatar.png',
  colors: {
    primary: '#6cb33f', // Lovart绿色主色
    secondary: '#8bc565', // 浅绿色
    accent: '#4a7c59', // 深绿色
    background: '#ffffff', // 纯白背景
    surface: '#f8f9fa', // 浅灰表面
    text: '#2d3436', // 深灰文本
    textSecondary: '#636e72', // 中灰文本
    border: '#e9ecef', // 浅灰边框
    success: '#00b894', // 成功绿
    warning: '#fdcb6e', // 警告橙
    error: '#e17055', // 错误红
    info: '#74b9ff', // 信息蓝
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
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
    },
    animations: {
      fast: '0.15s ease-out',
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
      '/lovart-comprehensive-assets/icons/modern/038bf7a8-4966-452d-8c6c-fe78a9bf0e86(2).png',
          '/lovart-comprehensive-assets/icons/modern/09d65e82-3492-45e0-975a-4378ecfc4048(2).png',
          '/lovart-comprehensive-assets/icons/modern/114bf95c-312d-48f3-b51b-67f607d865aa(2).png',
          '/lovart-comprehensive-assets/icons/modern/26360e34-6732-411a-b777-1fd9622e1bb6(2).png',
          '/lovart-comprehensive-assets/icons/modern/2dac7146-e195-4fb5-a8c1-8ce9dbd93066(2).png',
          '/lovart-comprehensive-assets/icons/modern/3c9038b9-a062-4fed-85f2-bbd67093c4f1(2).png',
          '/lovart-comprehensive-assets/icons/modern/4ec73d19-7e5a-4be5-a51d-ca9e097e8e93(2).png',
          '/lovart-comprehensive-assets/icons/modern/5909ee5f-bd78-4b3e-b953-e83c28855d82(2).png',
          '/lovart-comprehensive-assets/icons/modern/65b47960-76e7-42e9-a604-4e9d9ba53ef7(2).png',
          '/lovart-comprehensive-assets/icons/modern/72f3576e-caec-4176-b9d9-d4c13a994a39(2).png',
        ],
        illustrations: [
          '/lovart-comprehensive-assets/ui-interface/modern/0d8ddb75-d08b-48c0-be15-127dfb7e9e98(1).png',
          '/lovart-comprehensive-assets/ui-interface/modern/c9457355-729f-43e4-b7ee-fa7f037c3228(1).png',
        ],
        backgrounds: [
          '/lovart-comprehensive-assets/components/modern/006c8387-5285-4e59-84a7-adb96b3d96a7(1).png',
          '/lovart-comprehensive-assets/components/modern/07db38d9-d7d8-407f-9be6-d6d8ea1aaa3d(1).png',
          '/lovart-comprehensive-assets/components/modern/114bf95c-312d-48f3-b51b-67f607d865aa(1).png',
          '/lovart-comprehensive-assets/components/modern/1e2f3c9c-506c-4599-8735-06aea7aa21dd(1).png',
          '/lovart-comprehensive-assets/components/modern/27dbd717-42f5-4ad1-962b-e0dd4c4ef7a8(1).png',
        ],
        decorations: [
          '/lovart-comprehensive-assets/decorations/modern/006c8387-5285-4e59-84a7-adb96b3d96a7(2).png',
          '/lovart-comprehensive-assets/decorations/modern/054b05e8-fda6-4bc0-862d-eb2fddf5412c.png',
          '/lovart-comprehensive-assets/decorations/modern/0d5ccf94-742a-42c2-848d-fce3d26a312f.png',
          '/lovart-comprehensive-assets/decorations/modern/17aaf1b8-5215-4cc8-99aa-0645625f0d5b(2).png',
        ],
      },
};
