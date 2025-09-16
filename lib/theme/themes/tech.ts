/**
 * 科技未来主题配置
 * 基于Lovart设计资源提取的科技未来风格
 */

import { ThemeConfig } from '../../../types/theme';

export const techTheme: ThemeConfig = {
  id: 'tech',
  name: '科技未来',
  description: '基于Lovart设计的充满科技感的未来风格，渐变和发光效果',
  category: 'tech',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: new Date().toISOString(),
  preview: '/lovart-analysis/avatar.png',
  colors: {
    primary: '#6cb33f', // 熵基绿主色
    secondary: '#8bc565', // 浅熵基绿
    accent: '#4a7c59', // 深熵基绿
    background: '#0a0a0a', // 深黑背景
    surface: '#1a1a1a', // 深灰表面
    text: '#ffffff', // 白色文本
    textSecondary: '#b3b3b3', // 浅灰文本
    border: '#333333', // 深灰边框
    success: '#00ff88', // 科技绿
    warning: '#ffaa00', // 科技橙
    error: '#ff3366', // 科技红
    info: '#00d4ff', // 科技蓝
  },
  styles: {
    borderRadius: {
      sm: '6px',
      md: '12px',
      lg: '18px',
      xl: '24px',
      full: '9999px',
    },
    shadows: {
      sm: '0 0 10px rgba(0, 212, 255, 0.3)',
      md: '0 0 20px rgba(0, 212, 255, 0.4)',
      lg: '0 0 30px rgba(0, 212, 255, 0.5)',
      xl: '0 0 40px rgba(0, 212, 255, 0.6)',
    },
    animations: {
      fast: '0.1s ease-out',
      normal: '0.2s ease-out',
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
      fontFamily: 'JetBrains Mono, monospace',
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
          '/lovart-comprehensive-assets/icons/tech/0467120e-fecf-4833-bab4-b92b8aa7102a(2).png',
          '/lovart-comprehensive-assets/icons/tech/0bc199bf-0e4e-43ba-b4b5-3482291efe5a(2).png',
          '/lovart-comprehensive-assets/icons/tech/1639d850-a711-4215-9f80-335697f71e57(2).png',
          '/lovart-comprehensive-assets/icons/tech/2824771b-f2dd-47cf-889b-f029bbaa76e8(2).png',
          '/lovart-comprehensive-assets/icons/tech/31fed23f-372d-43c0-bc4c-366d220c2f19(2).png',
          '/lovart-comprehensive-assets/icons/tech/3eb78c3e-0ef0-4f37-84ff-88794d785712(2).png',
          '/lovart-comprehensive-assets/icons/tech/514652c1-f90c-415f-84d9-7180dab6b2d6(2).png',
          '/lovart-comprehensive-assets/icons/tech/59e777b8-bac2-4759-b6d8-9facb3201794(2).png',
          '/lovart-comprehensive-assets/icons/tech/6a9b4deb-ac42-4042-b43b-0dd18e9bed68(2).png',
          '/lovart-comprehensive-assets/icons/tech/7a4f38e1-f68a-4aa2-b174-28d82b9ac38d(2).png',
        ],
        illustrations: [
          '/lovart-comprehensive-assets/ui-interface/tech/3b85c55c-c6ab-4c39-97c7-7b154ea64f5a.png',
        ],
        backgrounds: [
          '/lovart-comprehensive-assets/components/tech/042f185c-e76a-429e-b9ef-25f5e6745959(1).png',
          '/lovart-comprehensive-assets/components/tech/0aa518d0-450c-4337-984b-1efad25253d4(1).png',
          '/lovart-comprehensive-assets/components/tech/1639d850-a711-4215-9f80-335697f71e57(1).png',
          '/lovart-comprehensive-assets/components/tech/23db9ea3-4a72-4667-a811-eaff4b34ed88(1).png',
          '/lovart-comprehensive-assets/components/tech/285e6817-9453-4663-98ca-599e602e29b1(1).png',
        ],
        decorations: [
          '/lovart-comprehensive-assets/decorations/tech/038bf7a8-4966-452d-8c6c-fe78a9bf0e86.png',
          '/lovart-comprehensive-assets/decorations/tech/09d65e82-3492-45e0-975a-4378ecfc4048.png',
          '/lovart-comprehensive-assets/decorations/tech/114bf95c-312d-48f3-b51b-67f607d865aa.png',
          '/lovart-comprehensive-assets/decorations/tech/1a069307-0244-4e66-86bb-486727c8b1e2(2).png',
        ],
      },
};
