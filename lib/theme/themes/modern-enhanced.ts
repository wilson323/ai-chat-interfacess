/**
 * 现代简约主题配置 - 增强版
 * 整合Lovart色彩系统和高级功能
 */

import { EnhancedThemeConfig, EnhancedColorScheme } from '../../../types/theme-enhanced';
import { generateThemeColorsFromLovart, generateLovartColorScales, themeToLovartMappings, lovartHexSystem } from '../lovart-color-mapping';

/**
 * 现代简约主题 - 增强配置
 */
export const modernThemeEnhanced: EnhancedThemeConfig = {
  id: 'modern-enhanced',
  name: '现代简约 (增强版)',
  description: '基于Lovart设计系统的现代简约风格，支持色阶系统和智能推荐',
  category: 'modern',
  isDefault: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  preview: '/theme-previews/modern-enhanced-preview.png',

  // 支持高级功能
  supportsDarkMode: true,
  supportsResponsive: true,

  // 标签和评分
  tags: ['modern', 'minimal', 'clean', 'lovart', 'enhanced'],
  rating: 4.8,
  usageStats: {
    usageCount: 1250,
    lastUsed: '2024-01-15T12:30:00Z',
    userRatings: [5, 4, 5, 5, 4, 5, 5, 4, 5, 5],
  },

  // 基于Lovart色彩系统生成
  colors: {
    // 基础色彩（从Lovart系统生成）
    ...(generateThemeColorsFromLovart(themeToLovartMappings.modern, 6) as unknown as EnhancedColorScheme),

    // Lovart色阶系统
    lovartScales: {
      green: {
        1: '#e8ffe8', 2: '#aff0b5', 3: '#7be188', 4: '#4cd263', 5: '#23c343',
        6: '#00b42a', 7: '#009a29', 8: '#008026', 9: '#006622', 10: '#004d1c'
      },
      cyan: {
        1: '#e8fffb', 2: '#b7f4ec', 3: '#89e9e0', 4: '#5edfd6', 5: '#37d4cf',
        6: '#14c9c9', 7: '#0da5aa', 8: '#07828b', 9: '#03616c', 10: '#00424d'
      },
      blue: {
        1: '#e8f7ff', 2: '#c3e7fe', 3: '#9fd4fd', 4: '#7bc0fc', 5: '#57a9fb',
        6: '#3491fa', 7: '#206ccf', 8: '#114ba3', 9: '#063078', 10: '#001a4d'
      },
      gray: {
        1: '#f7f8fa', 2: '#f2f3f5', 3: '#e5e6eb', 4: '#c9cdd4', 5: '#a9aeb8',
        6: '#86909c', 7: '#6b7785', 8: '#4e5969', 9: '#272e3b', 10: '#1d2129'
      }
    },

    // 完整色阶系统
    ...generateLovartColorScales(themeToLovartMappings.modern)
  },

  // 增强样式配置
  styles: {
    // 基础样式
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

    // 响应式设计配置
    responsive: {
      breakpoints: {
        xs: '320px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
      fontScale: {
        xs: 0.875,
        sm: 0.9375,
        md: 1,
        lg: 1.0625,
        xl: 1.125,
      },
      spacingScale: {
        xs: 0.75,
        sm: 0.875,
        md: 1,
        lg: 1.125,
        xl: 1.25,
      },
      radiusScale: {
        xs: 0.875,
        sm: 0.9375,
        md: 1,
        lg: 1.0625,
        xl: 1.125,
      },
    },

    // 深色模式配置
    darkMode: {
      enabled: true,
      autoSwitch: {
        darkStart: '20:00',
        lightStart: '07:00',
      },
      colorTransform: {
        backgroundDarken: 0.85,
        textLighten: 0.9,
        surfaceDarken: 0.8,
      },
    },

    // 自定义CSS属性
    customProperties: {
      '--theme-shadow-primary': '0 0 0 1px var(--theme-primary)',
      '--theme-glow-primary': '0 0 20px rgba(var(--theme-primary-rgb), 0.3)',
      '--theme-gradient-primary': 'linear-gradient(135deg, var(--theme-primary-1), var(--theme-primary-6))',
      '--theme-gradient-secondary': 'linear-gradient(135deg, var(--theme-secondary-1), var(--theme-secondary-6))',
    }
  },

  // 动效配置
  animations: {
    themeTransition: {
      name: 'theme-transition',
      duration: '0.3s',
      easing: 'ease-out',
      delay: '0s',
    },
    componentEnter: {
      name: 'theme-fade-in',
      duration: '0.3s',
      easing: 'ease-out',
    },
    componentExit: {
      name: 'theme-fade-out',
      duration: '0.2s',
      easing: 'ease-in',
    },
    interaction: {
      name: 'theme-hover',
      duration: '0.2s',
      easing: 'ease-out',
    },
    loading: {
      name: 'theme-pulse',
      duration: '2s',
      easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
      iteration: 'infinite',
    },
    success: {
      name: 'theme-success',
      duration: '0.5s',
      easing: 'ease-out',
    },
    error: {
      name: 'theme-error',
      duration: '0.5s',
      easing: 'ease-out',
    },
  },

  // 图标配置
  iconConfig: {
    library: 'lucide',
    style: 'outlined',
    sizes: {
      small: 16,
      medium: 20,
      large: 24,
    },
    customIcons: {
      'theme-modern': '🎨',
      'theme-business': '💼',
      'theme-tech': '🚀',
      'theme-nature': '🌿',
      'theme-art': '🎭',
    }
  },

  // 插画配置
  illustrationConfig: {
    style: 'flat',
    primaryColor: '#00b42a',
    secondaryColor: '#14c9c9',
    assetPath: '/illustrations/modern/',
    customIllustrations: {
      'empty-state': 'modern-empty.svg',
      'loading-state': 'modern-loading.svg',
      'success-state': 'modern-success.svg',
      'error-state': 'modern-error.svg',
    }
  }
};

/**
 * 商务专业主题 - 增强配置
 */
export const businessThemeEnhanced: EnhancedThemeConfig = {
  id: 'business-enhanced',
  name: '商务专业 (增强版)',
  description: '基于Lovart设计系统的商务专业风格，稳重专业的企业级主题',
  category: 'business',
  isDefault: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  preview: '/theme-previews/business-enhanced-preview.png',

  supportsDarkMode: true,
  supportsResponsive: true,

  tags: ['business', 'professional', 'corporate', 'lovart', 'enhanced'],
  rating: 4.6,
  usageStats: {
    usageCount: 980,
    lastUsed: '2024-01-15T14:20:00Z',
    userRatings: [4, 5, 4, 4, 5, 4, 4, 5, 4, 4],
  },

  colors: {
    ...(generateThemeColorsFromLovart(themeToLovartMappings.business, 6) as unknown as EnhancedColorScheme),
    ...(generateLovartColorScales(themeToLovartMappings.business) as Partial<EnhancedColorScheme>),
    lovartScales: {
      blue: lovartHexSystem.blue,
      gray: lovartHexSystem.gray,
      arcoblue: lovartHexSystem.arcoblue,
      // ... 其他色彩
    },
  },

  styles: {
    borderRadius: {
      sm: '2px',
      md: '4px',
      lg: '6px',
      xl: '8px',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.12)',
      md: '0 4px 6px rgba(0, 0, 0, 0.15)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.20)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.25)',
    },
    animations: {
      fast: '0.1s ease-out',
      normal: '0.2s ease-out',
      slow: '0.3s ease-out',
    },
    spacing: {
      xs: '2px',
      sm: '6px',
      md: '12px',
      lg: '20px',
      xl: '28px',
    },
    typography: {
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: {
        xs: '11px',
        sm: '13px',
        base: '15px',
        lg: '17px',
        xl: '19px',
        '2xl': '23px',
        '3xl': '28px',
      },
      lineHeight: {
        tight: '1.2',
        normal: '1.45',
        relaxed: '1.7',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
    responsive: {
      breakpoints: {
        xs: '320px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
      fontScale: {
        xs: 0.9,
        sm: 0.95,
        md: 1,
        lg: 1.05,
        xl: 1.1,
      },
      spacingScale: {
        xs: 0.8,
        sm: 0.9,
        md: 1,
        lg: 1.1,
        xl: 1.2,
      },
      radiusScale: {
        xs: 0.9,
        sm: 0.95,
        md: 1,
        lg: 1.05,
        xl: 1.1,
      },
    },
    darkMode: {
      enabled: true,
      colorTransform: {
        backgroundDarken: 0.9,
        textLighten: 0.95,
        surfaceDarken: 0.85,
      },
    },
    customProperties: {
      '--theme-shadow-business': '0 2px 4px rgba(0, 0, 0, 0.1)',
      '--theme-border-business': '1px solid rgba(0, 0, 0, 0.08)',
    }
  },

  animations: {
    themeTransition: {
      name: 'theme-slide-in',
      duration: '0.4s',
      easing: 'ease-out',
    },
    componentEnter: {
      name: 'theme-slide-in',
      duration: '0.4s',
      easing: 'ease-out',
    },
    componentExit: {
      name: 'theme-slide-out',
      duration: '0.3s',
      easing: 'ease-in',
    },
    interaction: {
      name: 'theme-press',
      duration: '0.1s',
      easing: 'ease-out',
    },
    loading: {
      name: 'theme-dots',
      duration: '1.4s',
      easing: 'ease-in-out',
      iteration: 'infinite',
    },
  },

  iconConfig: {
    library: 'lucide',
    style: 'filled',
    sizes: {
      small: 14,
      medium: 18,
      large: 22,
    },
    customIcons: {
      'theme-business': '🏢',
      'professional': '💼',
      'corporate': '📊',
    }
  },

  illustrationConfig: {
    style: 'gradient',
    primaryColor: '#3491fa',
    secondaryColor: '#86909c',
    assetPath: '/illustrations/business/',
    customIllustrations: {
      'meeting': 'business-meeting.svg',
      'report': 'business-report.svg',
      'analytics': 'business-analytics.svg',
    }
  }
};

/**
 * 科技未来主题 - 增强配置
 */
export const techThemeEnhanced: EnhancedThemeConfig = {
  id: 'tech-enhanced',
  name: '科技未来 (增强版)',
  description: '基于Lovart设计系统的科技未来风格，充满创新和未来感',
  category: 'tech',
  isDefault: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  preview: '/theme-previews/tech-enhanced-preview.png',

  supportsDarkMode: true,
  supportsResponsive: true,

  tags: ['tech', 'futuristic', 'innovation', 'lovart', 'enhanced'],
  rating: 4.7,
  usageStats: {
    usageCount: 750,
    lastUsed: '2024-01-15T16:45:00Z',
    userRatings: [5, 5, 4, 5, 5, 4, 5, 5, 4, 5],
  },

  colors: {
    ...(generateThemeColorsFromLovart(themeToLovartMappings.tech, 6) as unknown as EnhancedColorScheme),
    ...(generateLovartColorScales(themeToLovartMappings.tech) as Partial<EnhancedColorScheme>),
    lovartScales: {
      arcoblue: lovartHexSystem.arcoblue,
      cyan: lovartHexSystem.cyan,
      purple: lovartHexSystem.purple,
      // ... 其他色彩
    },
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
      sm: '0 2px 4px rgba(0, 102, 255, 0.15)',
      md: '0 4px 12px rgba(0, 102, 255, 0.2)',
      lg: '0 8px 24px rgba(0, 102, 255, 0.25)',
      xl: '0 16px 48px rgba(0, 102, 255, 0.3)',
    },
    animations: {
      fast: '0.1s cubic-bezier(0.4, 0, 0.2, 1)',
      normal: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      slow: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    spacing: {
      xs: '2px',
      sm: '6px',
      md: '14px',
      lg: '22px',
      xl: '30px',
    },
    typography: {
      fontFamily: 'Inter, Roboto, -apple-system, sans-serif',
      fontSize: {
        xs: '11px',
        sm: '13px',
        base: '15px',
        lg: '17px',
        xl: '19px',
        '2xl': '24px',
        '3xl': '32px',
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
    responsive: {
      breakpoints: {
        xs: '320px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
      fontScale: {
        xs: 0.85,
        sm: 0.92,
        md: 1,
        lg: 1.08,
        xl: 1.15,
      },
      spacingScale: {
        xs: 0.75,
        sm: 0.85,
        md: 1,
        lg: 1.15,
        xl: 1.3,
      },
      radiusScale: {
        xs: 0.8,
        sm: 0.9,
        md: 1,
        lg: 1.1,
        xl: 1.2,
      },
    },
    darkMode: {
      enabled: true,
      colorTransform: {
        backgroundDarken: 0.8,
        textLighten: 0.85,
        surfaceDarken: 0.75,
      },
    },
    customProperties: {
      '--theme-glow-tech': '0 0 30px rgba(var(--theme-primary-rgb), 0.4)',
      '--theme-gradient-tech': 'linear-gradient(135deg, var(--theme-primary-1), var(--theme-accent-6))',
      '--theme-border-tech': '1px solid rgba(var(--theme-primary-rgb), 0.2)',
    }
  },

  animations: {
    themeTransition: {
      name: 'theme-flip-in',
      duration: '0.5s',
      easing: 'ease-out',
    },
    componentEnter: {
      name: 'theme-flip-in',
      duration: '0.5s',
      easing: 'ease-out',
    },
    componentExit: {
      name: 'theme-fade-out',
      duration: '0.2s',
      easing: 'ease-in',
    },
    interaction: {
      name: 'theme-focus',
      duration: '0.3s',
      easing: 'ease-out',
    },
    loading: {
      name: 'theme-spin',
      duration: '1s',
      easing: 'linear',
      iteration: 'infinite',
    },
  },

  iconConfig: {
    library: 'lucide',
    style: 'outlined',
    sizes: {
      small: 16,
      medium: 20,
      large: 24,
    },
    customIcons: {
      'theme-tech': '🚀',
      'innovation': '💡',
      'digital': '⚡',
    }
  },

  illustrationConfig: {
    style: '3d',
    primaryColor: '#165dff',
    secondaryColor: '#14c9c9',
    assetPath: '/illustrations/tech/',
    customIllustrations: {
      'ai': 'tech-ai.svg',
      'robot': 'tech-robot.svg',
      'spaceship': 'tech-spaceship.svg',
    }
  }
};

/**
 * 增强主题配置导出
 */
const enhancedThemeConfigs = [
  modernThemeEnhanced,
  businessThemeEnhanced,
  techThemeEnhanced,
];

/**
 * 主题配置映射
 */
const themeConfigMap = {
  'modern-enhanced': modernThemeEnhanced,
  'business-enhanced': businessThemeEnhanced,
  'tech-enhanced': techThemeEnhanced,
};

export {
  enhancedThemeConfigs,
  themeConfigMap,
};