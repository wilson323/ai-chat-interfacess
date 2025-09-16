/**
 * Lovart设计分析工具
 * 分析Lovart目录下的设计图片，提取设计风格和色彩方案
 */

export interface LovartDesignAnalysis {
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  designElements: {
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      full: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    typography: {
      fontFamily: string;
      fontSize: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
      };
      fontWeight: {
        normal: string;
        medium: string;
        semibold: string;
        bold: string;
      };
    };
  };
  visualStyle: {
    shadows: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    animations: {
      fast: string;
      normal: string;
      slow: string;
    };
  };
  imageResources: {
    icons: string[];
    illustrations: string[];
    backgrounds: string[];
  };
}

/**
 * 现代简约风格分析
 * 基于Lovart设计提取的现代简约风格特征
 */
export const modernLovartAnalysis: LovartDesignAnalysis = {
  colorPalette: {
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
  designElements: {
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
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
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
  },
  visualStyle: {
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
  },
  imageResources: {
    icons: [
      '/lovart-analysis/sample1.png',
      '/lovart-analysis/sample2.png',
      '/lovart-analysis/sample3.png',
    ],
    illustrations: [
      '/lovart-analysis/avatar.png',
    ],
    backgrounds: [],
  },
};

/**
 * 商务专业风格分析
 * 基于Lovart设计提取的商务专业风格特征
 */
export const businessLovartAnalysis: LovartDesignAnalysis = {
  colorPalette: {
    primary: '#2c3e50', // 深蓝主色
    secondary: '#34495e', // 中蓝
    accent: '#3498db', // 亮蓝强调
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
  designElements: {
    borderRadius: {
      sm: '2px',
      md: '4px',
      lg: '8px',
      xl: '12px',
      full: '9999px',
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
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
  },
  visualStyle: {
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
  },
  imageResources: {
    icons: [
      '/lovart-analysis/sample1.png',
      '/lovart-analysis/sample2.png',
    ],
    illustrations: [
      '/lovart-analysis/avatar.png',
    ],
    backgrounds: [],
  },
};

/**
 * 科技未来风格分析
 * 基于Lovart设计提取的科技未来风格特征
 */
export const techLovartAnalysis: LovartDesignAnalysis = {
  colorPalette: {
    primary: '#00d4ff', // 科技蓝主色
    secondary: '#0099cc', // 深科技蓝
    accent: '#ff6b35', // 橙色强调
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
  designElements: {
    borderRadius: {
      sm: '6px',
      md: '12px',
      lg: '18px',
      xl: '24px',
      full: '9999px',
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
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
  },
  visualStyle: {
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
  },
  imageResources: {
    icons: [
      '/lovart-analysis/sample1.png',
      '/lovart-analysis/sample2.png',
      '/lovart-analysis/sample3.png',
    ],
    illustrations: [
      '/lovart-analysis/avatar.png',
    ],
    backgrounds: [],
  },
};

/**
 * 获取Lovart设计分析
 */
export function getLovartAnalysis(themeType: 'modern' | 'business' | 'tech'): LovartDesignAnalysis {
  switch (themeType) {
    case 'modern':
      return modernLovartAnalysis;
    case 'business':
      return businessLovartAnalysis;
    case 'tech':
      return techLovartAnalysis;
    default:
      return modernLovartAnalysis;
  }
}

/**
 * 验证Lovart设计合规性
 */
export function validateLovartCompliance(analysis: LovartDesignAnalysis): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 检查必需的颜色
  const requiredColors = ['primary', 'secondary', 'accent', 'background', 'surface', 'text'];
  for (const color of requiredColors) {
    if (!analysis.colorPalette[color as keyof typeof analysis.colorPalette]) {
      errors.push(`Missing required color: ${color}`);
    }
  }

  // 检查设计元素
  if (!analysis.designElements.borderRadius) {
    errors.push('Missing borderRadius configuration');
  }
  if (!analysis.designElements.spacing) {
    errors.push('Missing spacing configuration');
  }
  if (!analysis.designElements.typography) {
    errors.push('Missing typography configuration');
  }

  // 检查视觉样式
  if (!analysis.visualStyle.shadows) {
    errors.push('Missing shadows configuration');
  }
  if (!analysis.visualStyle.animations) {
    errors.push('Missing animations configuration');
  }

  // 检查图片资源
  if (!analysis.imageResources.icons || analysis.imageResources.icons.length === 0) {
    errors.push('Missing icon resources');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 生成Lovart主题配置
 */
export function generateLovartThemeConfig(
  themeType: 'modern' | 'business' | 'tech',
  themeId: string,
  themeName: string
) {
  const analysis = getLovartAnalysis(themeType);
  
  return {
    id: themeId,
    name: themeName,
    description: `基于Lovart设计的${themeName}主题`,
    category: themeType,
    isDefault: themeType === 'modern',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preview: analysis.imageResources.illustrations[0] || '/lovart-analysis/avatar.png',
    colors: analysis.colorPalette,
    styles: {
      borderRadius: analysis.designElements.borderRadius,
      shadows: analysis.visualStyle.shadows,
      animations: analysis.visualStyle.animations,
      spacing: analysis.designElements.spacing,
      typography: analysis.designElements.typography,
    },
    lovartResources: analysis.imageResources,
  };
}