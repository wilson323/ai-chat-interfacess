/**
 * 商务专业主题配置
 * 基于Lovart设计资源提取的商务专业风格
 */

import { ThemeConfig } from '../../../types/theme';

export const businessTheme: ThemeConfig = {
  id: 'business',
  name: '商务专业',
  description: '基于Lovart设计的专业稳重商务风格，适合企业级应用',
  category: 'business',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: new Date().toISOString(),
  preview: '/lovart-analysis/avatar.png',
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
      sm: '2px',
      md: '4px',
      lg: '8px',
      xl: '12px',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.12)',
      md: '0 2px 4px rgba(0, 0, 0, 0.12)',
      lg: '0 4px 8px rgba(0, 0, 0, 0.12)',
      xl: '0 8px 16px rgba(0, 0, 0, 0.12)',
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
      fontFamily: 'Roboto, system-ui, sans-serif',
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
          '/lovart-comprehensive-assets/icons/business/042f185c-e76a-429e-b9ef-25f5e6745959(2).png',
          '/lovart-comprehensive-assets/icons/business/0aa518d0-450c-4337-984b-1efad25253d4(2).png',
          '/lovart-comprehensive-assets/icons/business/1283c5cb-4606-41aa-8c11-759c95d755ed(2).png',
          '/lovart-comprehensive-assets/icons/business/27dbd717-42f5-4ad1-962b-e0dd4c4ef7a8(2).png',
          '/lovart-comprehensive-assets/icons/business/2dbc9555-3d61-4f66-ad72-9cfee9372d6a(2).png',
          '/lovart-comprehensive-assets/icons/business/3eb25b31-457e-47dc-a691-20e399ea580b(2).png',
          '/lovart-comprehensive-assets/icons/business/5122054d-82ae-4eca-948a-7c856a70e435(2).png',
          '/lovart-comprehensive-assets/icons/business/59e7631d-f6d7-4172-a524-4738237f03ac(2).png',
          '/lovart-comprehensive-assets/icons/business/678af2be-b04f-4c2a-b291-2982c76725cd(2).png',
          '/lovart-comprehensive-assets/icons/business/78824c5d-0eab-4f76-a369-1e1d94d3f029(2).png',
        ],
        illustrations: [
          '/lovart-comprehensive-assets/ui-interface/business/2dbc9555-3d61-4f66-ad72-9cfee9372d6a(1).png',
        ],
        backgrounds: [
          '/lovart-comprehensive-assets/components/business/038bf7a8-4966-452d-8c6c-fe78a9bf0e86(1).png',
          '/lovart-comprehensive-assets/components/business/09d65e82-3492-45e0-975a-4378ecfc4048(1).png',
          '/lovart-comprehensive-assets/components/business/1283c5cb-4606-41aa-8c11-759c95d755ed(1).png',
          '/lovart-comprehensive-assets/components/business/239d3751-e13c-4c3f-91db-ece731449203(1).png',
          '/lovart-comprehensive-assets/components/business/2824771b-f2dd-47cf-889b-f029bbaa76e8(1).png',
        ],
        decorations: [
          '/lovart-comprehensive-assets/decorations/business/006c8387-5285-4e59-84a7-adb96b3d96a7.png',
          '/lovart-comprehensive-assets/decorations/business/07db38d9-d7d8-407f-9be6-d6d8ea1aaa3d.png',
          '/lovart-comprehensive-assets/decorations/business/0d8ddb75-d08b-48c0-be15-127dfb7e9e98.png',
          '/lovart-comprehensive-assets/decorations/business/17aaf1b8-5215-4cc8-99aa-0645625f0d5b.png',
        ],
      },
};
