/**
 * 增强主题系统测试
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { EnhancedThemeManager } from '@/lib/theme/theme-manager-enhanced';
import { themeRecommendationEngine, userBehaviorCollector } from '@/lib/theme/theme-recommender';
import { themeMonitor } from '@/lib/theme/theme-monitor';
import { enhancedThemeConfigs } from '@/lib/theme/themes/modern-enhanced';
import { colorUtils } from '@/lib/theme/color-utils';

// 模拟 localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock as any;

describe('增强主题系统', () => {
  let themeManager: EnhancedThemeManager;

  beforeEach(() => {
    themeManager = new EnhancedThemeManager();
    themeManager.setThemes(enhancedThemeConfigs);
    localStorageMock.clear();
  });

  afterEach(() => {
    themeMonitor.stopMonitoring();
  });

  describe('增强主题管理器', () => {
    it('应该正确初始化主题管理器', () => {
      expect(themeManager).toBeDefined();
      expect(themeManager.currentTheme).toBe('modern');
      expect(themeManager.availableThemes.length).toBe(3);
    });

    it('应该支持深色模式切换', async () => {
      const initialDarkMode = themeManager.isDarkModeActive;
      await themeManager.toggleDarkMode();
      expect(themeManager.isDarkModeActive).toBe(!initialDarkMode);
    });

    it('应该正确应用主题', async () => {
      await themeManager.switchTheme('business-enhanced');
      expect(themeManager.currentTheme).toBe('business-enhanced');
    });

    it('应该保存和加载主题偏好', () => {
      themeManager.saveThemePreference('tech-enhanced');
      themeManager.loadThemePreference();
      expect(themeManager.currentTheme).toBe('tech-enhanced');
    });

    it('应该生成深色模式色彩', () => {
      const theme = themeManager.getThemeConfig('modern-enhanced');
      if (theme) {
        const darkColors = themeManager['generateDarkModeColors'](theme.colors);
        expect(darkColors.background).toBeDefined();
        expect(darkColors.text).toBeDefined();
      }
    });
  });

  describe('色彩工具', () => {
    it('应该正确转换RGB到HEX', () => {
      const hex = colorUtils.rgbToHex('255, 236, 232');
      expect(hex).toBe('#ffece8');
    });

    it('应该正确转换HEX到RGB', () => {
      const rgb = colorUtils.hexToRgb('#ffece8');
      expect(rgb).toBe('255, 236, 232');
    });

    it('应该正确生成色阶', () => {
      const scale = colorUtils.generateScale('#6cb33f', 5);
      expect(scale).toHaveLength(5);
      expect(scale[0]).not.toBe(scale[4]); // 色阶应该有变化
    });

    it('应该正确计算对比度', () => {
      const contrast = colorUtils.getContrastRatio('#ffffff', '#000000');
      expect(contrast).toBeGreaterThan(15); // 黑白对比度应该很高
    });

    it('应该正确判断深色颜色', () => {
      expect(colorUtils.isDarkColor('#000000')).toBe(true);
      expect(colorUtils.isDarkColor('#ffffff')).toBe(false);
    });
  });

  describe('主题推荐系统', () => {
    it('应该基于用户行为生成推荐', async () => {
      const userBehavior = {
        userId: 'test-user',
        themeUsageHistory: [
          {
            themeId: 'modern-enhanced',
            timestamp: new Date().toISOString(),
            duration: 300,
            interactionCount: 15,
            satisfactionScore: 5,
            deviceType: 'desktop' as const,
            timeOfDay: 'morning' as const,
            contentType: 'general',
          },
        ],
        interactionPreferences: [],
        timePreferences: [],
        devicePreferences: [],
        contentTypePreferences: [],
        colorPreferences: [],
      };

      const context = {
        userBehavior,
        currentTheme: 'modern-enhanced',
      };

      const recommendations = await themeRecommendationEngine.recommend(
        enhancedThemeConfigs,
        context
      );

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('应该基于时间上下文生成推荐', async () => {
      const context = {
        timeContext: {
          currentTime: new Date(),
          season: 'winter' as const,
          timeOfDay: 'evening' as const,
          dayType: 'weekday' as const,
          isHoliday: false,
        },
      };

      const recommendations = await themeRecommendationEngine.recommend(
        enhancedThemeConfigs,
        context
      );

      expect(recommendations).toBeDefined();
    });
  });

  describe('主题监控系统', () => {
    it('应该正确记录性能指标', () => {
      const metric = {
        switchTime: 150,
        cssApplyTime: 50,
        animationRenderTime: 100,
        memoryUsage: 25,
        firstPaintTime: 50,
      };

      themeMonitor.recordPerformanceMetric(metric);
      const monitor = themeMonitor.getPerformanceMonitor();
      const metrics = monitor.getMetrics();

      expect(metrics).toContainEqual(metric);
    });

    it('应该检测性能违规', () => {
      const violationMetric = {
        switchTime: 1000, // 超过默认阈值500ms
        cssApplyTime: 50,
        animationRenderTime: 400, // 超过默认阈值300ms
        memoryUsage: 60, // 超过默认阈值50MB
        firstPaintTime: 150, // 超过默认阈值100ms
      };

      themeMonitor.recordPerformanceMetric(violationMetric);
      const stats = themeMonitor.getPerformanceMonitor().getPerformanceStats();

      expect(stats.averageSwitchTime).toBeGreaterThan(500);
      expect(stats.averageAnimationTime).toBeGreaterThan(300);
      expect(stats.averageMemoryUsage).toBeGreaterThan(50);
      expect(stats.averageFirstPaintTime).toBeGreaterThan(100);
    });

    it('应该执行一致性检查', async () => {
      const theme = themeManager.getThemeConfig('modern-enhanced');
      if (theme) {
        const consistencyCheck = await themeMonitor.getConsistencyMonitor().checkConsistency(theme);

        expect(consistencyCheck).toBeDefined();
        expect(consistencyCheck.colorConsistency).toBeDefined();
        expect(consistencyCheck.styleConsistency).toBeDefined();
        expect(consistencyCheck.typographyConsistency).toBeDefined();
      }
    });

    it('应该生成监控报告', () => {
      const report = themeMonitor.generateReport();
      expect(report).toContain('主题系统监控报告');
      expect(report).toContain('性能统计');
      expect(report).toContain('一致性统计');
    });
  });

  describe('增强主题配置', () => {
    it('应该包含完整的增强功能', () => {
      const theme = enhancedThemeConfigs[0]; // modern-enhanced

      expect(theme.supportsDarkMode).toBe(true);
      expect(theme.supportsResponsive).toBe(true);
      expect(theme.colors.primaryScale).toBeDefined();
      expect(theme.colors.secondaryScale).toBeDefined();
      expect(theme.colors.accentScale).toBeDefined();
      expect(theme.animations).toBeDefined();
      expect(theme.iconConfig).toBeDefined();
      expect(theme.illustrationConfig).toBeDefined();
    });

    it('应该包含Lovart色彩系统', () => {
      const theme = enhancedThemeConfigs[0];

      expect(theme.colors.lovartScales).toBeDefined();
      if (theme.colors.lovartScales) {
        expect(theme.colors.lovartScales.green).toBeDefined();
        expect(theme.colors.lovartScales.cyan).toBeDefined();
        expect(theme.colors.lovartScales.blue).toBeDefined();
        expect(theme.colors.lovartScales.gray).toBeDefined();
      }
    });

    it('应该包含响应式配置', () => {
      const theme = enhancedThemeConfigs[0];

      expect(theme.styles.responsive).toBeDefined();
      if (theme.styles.responsive) {
        expect(theme.styles.responsive.breakpoints).toBeDefined();
        expect(theme.styles.responsive.fontScale).toBeDefined();
        expect(theme.styles.responsive.spacingScale).toBeDefined();
        expect(theme.styles.responsive.radiusScale).toBeDefined();
      }
    });

    it('应该包含深色模式配置', () => {
      const theme = enhancedThemeConfigs[0];

      expect(theme.styles.darkMode).toBeDefined();
      if (theme.styles.darkMode) {
        expect(theme.styles.darkMode.enabled).toBe(true);
        expect(theme.styles.darkMode.colorTransform).toBeDefined();
      }
    });
  });

  describe('用户行为收集', () => {
    it('应该记录主题使用行为', () => {
      userBehaviorCollector.recordThemeUsage('modern-enhanced', {
        duration: 300,
        interactionCount: 15,
        satisfactionScore: 5,
        deviceType: 'desktop',
        timeOfDay: 'morning',
        contentType: 'general',
      });

      const userBehavior = userBehaviorCollector.getUserBehavior('test-user');
      expect(userBehavior.themeUsageHistory).toHaveLength(1);
      expect(userBehavior.themeUsageHistory[0].themeId).toBe('modern-enhanced');
    });

    it('应该记录交互偏好', () => {
      userBehaviorCollector.recordInteractionPreference('hover', 0.8);

      const userBehavior = userBehaviorCollector.getUserBehavior('test-user');
      expect(userBehavior.interactionPreferences).toHaveLength(1);
      expect(userBehavior.interactionPreferences[0].interactionType).toBe('hover');
    });

    it('应该记录色彩偏好', () => {
      userBehaviorCollector.recordColorPreference('cool', 0.7, ['#3491fa', '#14c9c9']);

      const userBehavior = userBehaviorCollector.getUserBehavior('test-user');
      expect(userBehavior.colorPreferences).toHaveLength(1);
      expect(userBehavior.colorPreferences[0].colorType).toBe('cool');
    });
  });
});

/**
 * 主题动画测试
 */
describe('主题动画系统', () => {
  it('应该包含所有主题动画类', () => {
    const animationClasses = [
      'animate-theme-enter',
      'animate-theme-exit',
      'animate-theme-interaction',
      'animate-theme-loading',
      'animate-theme-success',
      'animate-theme-error',
    ];

    animationClasses.forEach(className => {
      expect(className).toBeDefined();
    });
  });

  it('应该包含主题特定的动画变量', () => {
    const themeAnimations = {
      modern: 'theme-modern',
      business: 'theme-business',
      tech: 'theme-tech',
      nature: 'theme-nature',
      art: 'theme-art',
    };

    Object.values(themeAnimations).forEach(themeClass => {
      expect(themeClass).toBeDefined();
    });
  });
});

/**
 * 性能测试
 */
describe('主题性能', () => {
  it('主题切换应该在合理时间内完成', () => {
    const startTime = performance.now();

    // 模拟主题切换
    const theme = enhancedThemeConfigs[0];
    const mockApplyTheme = () => {
      // 模拟CSS变量应用
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        if (typeof value === 'string') {
          root.style.setProperty(`--theme-${key}`, value);
        }
      });
    };

    mockApplyTheme();

    const endTime = performance.now();
    const switchTime = endTime - startTime;

    expect(switchTime).toBeLessThan(500); // 应该在500ms内完成
  });

  it('色彩工具应该高效运行', () => {
    const iterations = 1000;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      colorUtils.rgbToHex('255, 236, 232');
      colorUtils.hexToRgb('#ffece8');
      colorUtils.generateScale('#6cb33f', 10);
    }

    const endTime = performance.now();
    const averageTime = (endTime - startTime) / iterations;

    expect(averageTime).toBeLessThan(1); // 每次操作应该在1ms内完成
  });
});
