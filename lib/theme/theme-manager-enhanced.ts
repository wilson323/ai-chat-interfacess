/**
 * 增强主题管理器
 * 支持Lovart色彩系统、响应式设计、深色模式、智能推荐等高级功能
 */

import {
  EnhancedThemeConfig,
  EnhancedColorScheme,
  DarkModeConfig,
  ResponsiveConfig,
  ThemePerformanceMetrics,
  ThemeConsistencyCheck,
  ThemeRecommendation,
  ThemeRecommendationConfig,
  ThemeRecommendationContext,
  ThemeUserBehaviorData,
  TimeContextData,
  DeviceTypeData,
  ContentTypeData,
} from '../../types/theme-enhanced';
import { DEFAULT_THEME_ID, THEME_STORAGE_KEY } from '../../types/theme';
import { colorUtils } from './color-utils';
import { themeToLovartMappings, generateLovartColorScales } from './lovart-color-mapping';

/**
 * 增强主题管理器类
 */
export class EnhancedThemeManager {
  private themes: EnhancedThemeConfig[] = [];
  private currentThemeId: string = DEFAULT_THEME_ID;
  private isDarkMode: boolean = false;
  private responsiveConfig: ResponsiveConfig;
  private darkModeConfig: DarkModeConfig;
  private performanceMetrics: ThemePerformanceMetrics[] = [];
  private listeners: Set<(themeId: string, isDarkMode: boolean) => void> = new Set();
  private recommendationConfig: ThemeRecommendationConfig;

  constructor() {
    this.responsiveConfig = this.getDefaultResponsiveConfig();
    this.darkModeConfig = this.getDefaultDarkModeConfig();
    this.recommendationConfig = this.getDefaultRecommendationConfig();
    this.loadThemePreference();
    this.initializeDarkMode();
    this.initializeResponsive();
  }

  /**
   * 获取默认响应式配置
   */
  private getDefaultResponsiveConfig(): ResponsiveConfig {
    return {
      breakpoints: {
        xs: '320px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
      fontScale: {
        xs: 0.875, // 14px base -> 12px
        sm: 0.9375, // 14px base -> 13px
        md: 1, // 14px base -> 14px
        lg: 1.0625, // 14px base -> 15px
        xl: 1.125, // 14px base -> 16px
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
    };
  }

  /**
   * 获取默认深色模式配置
   */
  private getDefaultDarkModeConfig(): DarkModeConfig {
    return {
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
    };
  }

  /**
   * 获取默认推荐配置
   */
  private getDefaultRecommendationConfig(): ThemeRecommendationConfig {
    return {
      behaviorWeight: 0.3,
      timeContextWeight: 0.2,
      deviceTypeWeight: 0.2,
      contentTypeWeight: 0.3,
      recommendationCount: 3,
    };
  }

  /**
   * 设置主题列表
   */
  setThemes(themes: EnhancedThemeConfig[]): void {
    this.themes = themes.map(theme => this.enhanceThemeConfig(theme));
  }

  /**
   * 增强主题配置
   */
  private enhanceThemeConfig(theme: EnhancedThemeConfig): EnhancedThemeConfig {
    const mapping = themeToLovartMappings[theme.category] || themeToLovartMappings.modern;

    // 如果没有定义Lovart色阶，自动生成
    if (!theme.colors.primaryScale || !theme.colors.secondaryScale) {
      const scales = generateLovartColorScales(mapping);
      theme.colors.primaryScale = theme.colors.primaryScale || scales.primaryScale;
      theme.colors.secondaryScale = theme.colors.secondaryScale || scales.secondaryScale;
      theme.colors.accentScale = theme.colors.accentScale || scales.accentScale;
      theme.colors.backgroundScale = theme.colors.backgroundScale || scales.backgroundScale;
      theme.colors.surfaceScale = theme.colors.surfaceScale || scales.surfaceScale;
      theme.colors.textScale = theme.colors.textScale || scales.textScale;
    }

    // 确保深色模式支持
    if (theme.supportsDarkMode === undefined) {
      theme.supportsDarkMode = true;
    }

    // 确保响应式设计支持
    if (theme.supportsResponsive === undefined) {
      theme.supportsResponsive = true;
    }

    return theme;
  }

  /**
   * 切换主题
   */
  async switchTheme(themeId: string): Promise<void> {
    const startTime = performance.now();

    try {
      const theme = this.getThemeConfig(themeId);
      if (!theme) {
        throw new Error(`Theme with id "${themeId}" not found`);
      }

      this.currentThemeId = themeId;
      await this.applyTheme(theme);
      this.saveThemePreference(themeId);
      this.notifyListeners(themeId, this.isDarkMode);

      // 记录性能指标
      const endTime = performance.now();
      this.recordPerformanceMetric({
        switchTime: endTime - startTime,
        cssApplyTime: 0, // 将在applyTheme中更新
        animationRenderTime: 0,
        memoryUsage: 0,
        firstPaintTime: 0,
      });
    } catch (error) {
      console.error('Failed to switch theme:', error);
      throw error;
    }
  }

  /**
   * 应用主题
   */
  private async applyTheme(theme: EnhancedThemeConfig): Promise<void> {
    if (typeof window === 'undefined') return;

    const startTime = performance.now();
    const root = document.documentElement;

    // 获取当前应用的颜色方案
    const colorScheme = this.isDarkMode && theme.supportsDarkMode
      ? this.generateDarkModeColors(theme.colors)
      : theme.colors;

    // 应用色彩变量
    Object.entries(colorScheme).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--theme-${key}`, value);
      }
    });

    // 应用色阶变量
    if (theme.colors.primaryScale) {
      theme.colors.primaryScale.forEach((color, index) => {
        root.style.setProperty(`--theme-primary-${index + 1}`, color);
      });
    }

    if (theme.colors.secondaryScale) {
      theme.colors.secondaryScale.forEach((color, index) => {
        root.style.setProperty(`--theme-secondary-${index + 1}`, color);
      });
    }

    if (theme.colors.accentScale) {
      theme.colors.accentScale.forEach((color, index) => {
        root.style.setProperty(`--theme-accent-${index + 1}`, color);
      });
    }

    // 应用样式变量
    if (theme.styles.borderRadius) {
      Object.entries(theme.styles.borderRadius).forEach(([key, value]) => {
        root.style.setProperty(`--theme-radius-${key}`, value);
      });
    }

    if (theme.styles.shadows) {
      Object.entries(theme.styles.shadows).forEach(([key, value]) => {
        root.style.setProperty(`--theme-shadow-${key}`, value);
      });
    }

    if (theme.styles.animations) {
      Object.entries(theme.styles.animations).forEach(([key, value]) => {
        root.style.setProperty(`--theme-animation-${key}`, value);
      });
    }

    if (theme.styles.spacing) {
      Object.entries(theme.styles.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--theme-spacing-${key}`, value);
      });
    }

    // 应用排版变量
    if (theme.styles.typography) {
      Object.entries(theme.styles.typography.fontSize || {}).forEach(([key, value]) => {
        root.style.setProperty(`--theme-font-size-${key}`, value);
      });

      Object.entries(theme.styles.typography.lineHeight || {}).forEach(([key, value]) => {
        root.style.setProperty(`--theme-line-height-${key}`, value);
      });

      Object.entries(theme.styles.typography.fontWeight || {}).forEach(([key, value]) => {
        root.style.setProperty(`--theme-font-weight-${key}`, value);
      });

      if (theme.styles.typography.fontFamily) {
        root.style.setProperty('--theme-font-family', theme.styles.typography.fontFamily);
      }
    }

    // 应用响应式变量
    if (theme.supportsResponsive && theme.styles.responsive) {
      this.applyResponsiveStyles(theme.styles.responsive);
    }

    // 应用自定义CSS属性
    if (theme.styles.customProperties) {
      Object.entries(theme.styles.customProperties).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }

    // 应用深色模式类
    if (this.isDarkMode) {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }

    // 应用主题切换动画
    if (theme.animations?.themeTransition) {
      this.applyThemeTransition(theme.animations.themeTransition);
    }

    // 更新性能指标
    const endTime = performance.now();
    if (this.performanceMetrics.length > 0) {
      const lastMetric = this.performanceMetrics[this.performanceMetrics.length - 1];
      lastMetric.cssApplyTime = endTime - startTime;
    }
  }

  /**
   * 生成深色模式色彩
   */
  private generateDarkModeColors(colors: EnhancedColorScheme): EnhancedColorScheme {
    const config = this.darkModeConfig.colorTransform || {
      backgroundDarken: 0.85,
      textLighten: 0.9,
      surfaceDarken: 0.8,
    };

    return {
      ...colors,
      background: colorUtils.darken(colors.background, 1 - config.backgroundDarken),
      surface: colorUtils.darken(colors.surface, 1 - config.surfaceDarken),
      text: colorUtils.lighten(colors.text, config.textLighten),
      textSecondary: colorUtils.lighten(colors.textSecondary, config.textLighten * 0.7),
    };
  }

  /**
   * 应用响应式样式
   */
  private applyResponsiveStyles(responsiveConfig: ResponsiveConfig): void {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const screenWidth = window.innerWidth;

    // 确定当前断点
    let currentBreakpoint: keyof typeof responsiveConfig.fontScale = 'md';
    const breakpoints = responsiveConfig.breakpoints;

    if (screenWidth < parseInt(breakpoints.sm)) {
      currentBreakpoint = 'xs';
    } else if (screenWidth < parseInt(breakpoints.md)) {
      currentBreakpoint = 'sm';
    } else if (screenWidth < parseInt(breakpoints.lg)) {
      currentBreakpoint = 'md';
    } else if (screenWidth < parseInt(breakpoints.xl)) {
      currentBreakpoint = 'lg';
    } else {
      currentBreakpoint = 'xl';
    }

    // 应用缩放比例
    const fontScale = responsiveConfig.fontScale[currentBreakpoint];
    const spacingScale = responsiveConfig.spacingScale[currentBreakpoint];
    const radiusScale = responsiveConfig.radiusScale[currentBreakpoint];

    root.style.setProperty('--theme-responsive-font-scale', fontScale.toString());
    root.style.setProperty('--theme-responsive-spacing-scale', spacingScale.toString());
    root.style.setProperty('--theme-responsive-radius-scale', radiusScale.toString());
  }

  /**
   * 应用主题切换动画
   */
  private applyThemeTransition(animation: any): void {
    if (typeof document === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = `
      * {
        transition: all ${animation.duration} ${animation.easing} ${animation.delay || '0s'} !important;
      }
    `;

    document.head.appendChild(style);

    // 动画完成后移除样式
    setTimeout(() => {
      document.head.removeChild(style);
    }, parseFloat(animation.duration) * 1000 + parseFloat(animation.delay || '0') * 1000);
  }

  /**
   * 切换深色模式
   */
  async toggleDarkMode(): Promise<void> {
    this.isDarkMode = !this.isDarkMode;
    const currentTheme = this.getThemeConfig(this.currentThemeId);
    if (currentTheme) {
      await this.applyTheme(currentTheme);
    }
    this.notifyListeners(this.currentThemeId, this.isDarkMode);
  }

  /**
   * 初始化深色模式
   */
  private initializeDarkMode(): void {
    if (typeof window === 'undefined') return;

    // 检查系统偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkMode = prefersDark;

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.darkModeConfig.enabled) {
        this.isDarkMode = e.matches;
        const currentTheme = this.getThemeConfig(this.currentThemeId);
        if (currentTheme) {
          this.applyTheme(currentTheme);
        }
      }
    });
  }

  /**
   * 初始化响应式
   */
  private initializeResponsive(): void {
    if (typeof window === 'undefined') return;

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      const currentTheme = this.getThemeConfig(this.currentThemeId);
      if (currentTheme?.supportsResponsive && currentTheme.styles.responsive) {
        this.applyResponsiveStyles(currentTheme.styles.responsive);
      }
    });
  }

  /**
   * 智能主题推荐
   */
  async recommendThemes(context: ThemeRecommendationContext = {}): Promise<ThemeRecommendation[]> {
    const recommendations: ThemeRecommendation[] = [];

    // 基于用户行为推荐
    if (context.userBehavior) {
      const behaviorRecommendations = this.recommendByBehavior(context.userBehavior);
      recommendations.push(...behaviorRecommendations);
    }

    // 基于时间上下文推荐
    if (context.timeContext) {
      const timeRecommendations = this.recommendByTime(context.timeContext);
      recommendations.push(...timeRecommendations);
    }

    // 基于设备类型推荐
    if (context.deviceType) {
      const deviceRecommendations = this.recommendByDevice(context.deviceType);
      recommendations.push(...deviceRecommendations);
    }

    // 基于内容类型推荐
    if (context.contentType) {
      const contentRecommendations = this.recommendByContent(context.contentType);
      recommendations.push(...contentRecommendations);
    }

    // 排序并返回前N个推荐
    recommendations.sort((a, b) => b.score - a.score);
    return recommendations.slice(0, this.recommendationConfig.recommendationCount);
  }

  /**
   * 基于用户行为推荐
   */
  private recommendByBehavior(_userBehavior: ThemeUserBehaviorData): ThemeRecommendation[] {
    // 简化的推荐逻辑，实际应用中需要更复杂的算法
    const recommendations: ThemeRecommendation[] = [];

    // 根据使用频率推荐
    const sortedThemes = this.themes
      .filter(theme => theme.usageStats)
      .sort((a, b) => (b.usageStats?.usageCount || 0) - (a.usageStats?.usageCount || 0));

    sortedThemes.forEach(theme => {
      recommendations.push({
        theme,
        score: Math.min(1, (theme.usageStats?.usageCount || 0) / 100),
        reason: '基于使用频率推荐',
        algorithm: 'behavior',
      });
    });

    return recommendations;
  }

  /**
   * 基于时间上下文推荐
   */
  private recommendByTime(_timeContext: TimeContextData): ThemeRecommendation[] {
    const recommendations: ThemeRecommendation[] = [];
    const hour = new Date().getHours();

    // 根据时间段推荐
    if (hour >= 6 && hour < 12) {
      // 上午推荐明亮主题
      recommendations.push({
        theme: this.themes.find(t => t.category === 'modern') || this.themes[0],
        score: 0.8,
        reason: '适合上午时段的明亮主题',
        algorithm: 'time',
      });
    } else if (hour >= 12 && hour < 18) {
      // 下午推荐活力主题
      recommendations.push({
        theme: this.themes.find(t => t.category === 'tech') || this.themes[0],
        score: 0.8,
        reason: '适合下午时段的活力主题',
        algorithm: 'time',
      });
    } else {
      // 晚上推荐深色主题
      recommendations.push({
        theme: this.themes.find(t => t.supportsDarkMode) || this.themes[0],
        score: 0.9,
        reason: '适合晚间时段的深色主题',
        algorithm: 'time',
      });
    }

    return recommendations;
  }

  /**
   * 基于设备类型推荐
   */
  private recommendByDevice(deviceType: DeviceTypeData): ThemeRecommendation[] {
    const recommendations: ThemeRecommendation[] = [];

    // 根据设备类型推荐
    if ((deviceType as any).type === 'mobile') {
      recommendations.push({
        theme: this.themes.find(t => t.supportsResponsive) || this.themes[0],
        score: 0.9,
        reason: '适合移动设备的响应式主题',
        algorithm: 'device',
      });
    } else if ((deviceType as any).type === 'desktop') {
      recommendations.push({
        theme: this.themes.find(t => t.category === 'business') || this.themes[0],
        score: 0.8,
        reason: '适合桌面设备的专业主题',
        algorithm: 'device',
      });
    }

    return recommendations;
  }

  /**
   * 基于内容类型推荐
   */
  private recommendByContent(contentType: ContentTypeData): ThemeRecommendation[] {
    const recommendations: ThemeRecommendation[] = [];

    // 根据内容类型推荐
    if ((contentType as any).purpose === 'entertainment' || (contentType as any).primaryType === 'image') {
      recommendations.push({
        theme: this.themes.find(t => t.category === 'art') || this.themes[0],
        score: 0.9,
        reason: '适合创意内容的主题',
        algorithm: 'content',
      });
    } else if ((contentType as any).purpose === 'work') {
      recommendations.push({
        theme: this.themes.find(t => t.category === 'business') || this.themes[0],
        score: 0.9,
        reason: '适合专业内容的主题',
        algorithm: 'content',
      });
    }

    return recommendations;
  }

  /**
   * 记录性能指标
   */
  private recordPerformanceMetric(metric: ThemePerformanceMetrics): void {
    this.performanceMetrics.push(metric);

    // 保持最近100条记录
    if (this.performanceMetrics.length > 100) {
      this.performanceMetrics.shift();
    }
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): ThemePerformanceMetrics[] {
    return [...this.performanceMetrics];
  }

  /**
   * 检查主题一致性
   */
  checkThemeConsistency(themeId?: string): ThemeConsistencyCheck {
    const theme = themeId ? this.getThemeConfig(themeId) : this.getThemeConfig(this.currentThemeId);
    if (!theme) {
      throw new Error('Theme not found');
    }

    const colors = this.isDarkMode && theme.supportsDarkMode
      ? this.generateDarkModeColors(theme.colors)
      : theme.colors;

    return {
      colorConsistency: {
        contrastRatioPass: this.checkContrastRatio(colors.text, colors.background) >= 4.5,
        harmonyScore: this.calculateColorHarmony(colors),
        accessibilityScore: this.calculateAccessibilityScore(colors),
      },
      styleConsistency: {
        borderRadiusConsistency: this.calculateStyleConsistency(theme.styles.borderRadius || {}),
        shadowConsistency: this.calculateStyleConsistency(theme.styles.shadows || {}),
        spacingConsistency: this.calculateStyleConsistency(theme.styles.spacing || {}),
      },
      typographyConsistency: {
        hierarchyScore: this.calculateTypographyHierarchy(theme.styles.typography),
        readabilityScore: this.calculateReadabilityScore(theme.styles.typography),
        fontPairingScore: this.calculateFontPairingScore(theme.styles.typography),
      },
    };
  }

  /**
   * 检查对比度
   */
  private checkContrastRatio(textColor: string, backgroundColor: string): number {
    return colorUtils.getContrastRatio(textColor, backgroundColor);
  }

  /**
   * 计算色彩和谐度
   */
  private calculateColorHarmony(colors: EnhancedColorScheme): number {
    // 简化的和谐度计算，实际应用中需要更复杂的算法
    const primaryHue = this.getColorHue(colors.primary);
    const secondaryHue = this.getColorHue(colors.secondary);
    const accentHue = this.getColorHue(colors.accent);

    const primarySecondaryDiff = Math.abs(primaryHue - secondaryHue);
    const primaryAccentDiff = Math.abs(primaryHue - accentHue);

    // 基于色彩理论的和谐度评分
    let score = 0.5; // 基础分

    // 主色和辅助色和谐度
    if (primarySecondaryDiff >= 30 && primarySecondaryDiff <= 60) {
      score += 0.2;
    }

    // 主色和强调色和谐度
    if (primaryAccentDiff >= 120 && primaryAccentDiff <= 180) {
      score += 0.2;
    }

    return Math.min(1, score);
  }

  /**
   * 获取颜色色相
   */
  private getColorHue(color: string): number {
    const rgb = color.startsWith('#') ? colorUtils.parseHex(color) : colorUtils.parseRgb(color);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let hue = 0;

    if (diff !== 0) {
      if (max === r) {
        hue = ((g - b) / diff) % 6;
      } else if (max === g) {
        hue = (b - r) / diff + 2;
      } else {
        hue = (r - g) / diff + 4;
      }
    }

    return Math.round(hue * 60);
  }

  /**
   * 计算可访问性评分
   */
  private calculateAccessibilityScore(colors: EnhancedColorScheme): number {
    let score = 0;

    // 文字与背景对比度
    const textBgContrast = this.checkContrastRatio(colors.text, colors.background);
    if (textBgContrast >= 7) score += 0.3;
    else if (textBgContrast >= 4.5) score += 0.2;

    // 次要文字与背景对比度
    const textSecondaryBgContrast = this.checkContrastRatio(colors.textSecondary, colors.background);
    if (textSecondaryBgContrast >= 4.5) score += 0.2;

    // 成功、警告、错误、信息色的可识别性
    const successContrast = this.checkContrastRatio(colors.success, colors.background);
    const warningContrast = this.checkContrastRatio(colors.warning, colors.background);
    const errorContrast = this.checkContrastRatio(colors.error, colors.background);
    const infoContrast = this.checkContrastRatio(colors.info, colors.background);

    if (successContrast >= 3) score += 0.1;
    if (warningContrast >= 3) score += 0.1;
    if (errorContrast >= 3) score += 0.1;
    if (infoContrast >= 3) score += 0.1;

    return Math.min(1, score);
  }

  /**
   * 计算样式一致性
   */
  private calculateStyleConsistency(styles: Record<string, string>): number {
    const values = Object.values(styles);
    if (values.length === 0) return 1;

    // 简化的样式一致性计算
    const uniqueValues = new Set(values);
    return 1 - (uniqueValues.size - 1) / values.length;
  }

  /**
   * 计算排版层次结构
   */
  private calculateTypographyHierarchy(typography: any): number {
    if (!typography || !typography.fontSize) return 0.5;

    const fontSizes = Object.values(typography.fontSize);
    if (fontSizes.length < 2) return 0.5;

    // 检查字体大小是否有合理的层次结构
    const sortedSizes = fontSizes.map(size => parseInt(size as string)).sort((a, b) => a - b);
    let score = 0.5;

    // 检查是否有递增趋势
    let increasingCount = 0;
    for (let i = 1; i < sortedSizes.length; i++) {
      if (sortedSizes[i] > sortedSizes[i - 1]) {
        increasingCount++;
      }
    }

    if (increasingCount === sortedSizes.length - 1) {
      score += 0.3;
    }

    // 检查比例是否合理
    const ratios = [];
    for (let i = 1; i < sortedSizes.length; i++) {
      ratios.push(sortedSizes[i] / sortedSizes[i - 1]);
    }

    const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    if (avgRatio >= 1.1 && avgRatio <= 1.5) {
      score += 0.2;
    }

    return Math.min(1, score);
  }

  /**
   * 计算可读性评分
   */
  private calculateReadabilityScore(typography: any): number {
    let score = 0.5;

    // 检查行高
    if (typography.lineHeight) {
      const lineHeights = Object.values(typography.lineHeight).map(lh => parseFloat(lh as string));
      const validLineHeights = lineHeights.filter(lh => lh >= 1.2 && lh <= 2.0);
      if (validLineHeights.length === lineHeights.length) {
        score += 0.2;
      }
    }

    // 检查字重
    if (typography.fontWeight) {
      const fontWeights = Object.values(typography.fontWeight);
      const hasBold = fontWeights.some(fw => fw === '700' || fw === 'bold');
      const hasNormal = fontWeights.some(fw => fw === '400' || fw === 'normal');
      if (hasBold && hasNormal) {
        score += 0.2;
      }
    }

    // 检查字体族
    if (typography.fontFamily) {
      const hasSystemFont = typography.fontFamily.includes('system-ui') ||
                           typography.fontFamily.includes('sans-serif');
      if (hasSystemFont) {
        score += 0.1;
      }
    }

    return Math.min(1, score);
  }

  /**
   * 计算字体配对评分
   */
  private calculateFontPairingScore(typography: any): number {
    // 简化的字体配对评分
    if (typography.fontFamily) {
      const fontFamily = typography.fontFamily.toLowerCase();

      // 检查是否有良好的字体回退
      if (fontFamily.includes('system-ui') && fontFamily.includes('sans-serif')) {
        return 0.9;
      }

      if (fontFamily.includes('sans-serif')) {
        return 0.7;
      }
    }

    return 0.5;
  }

  /**
   * 获取当前主题ID
   */
  get currentTheme(): string {
    return this.currentThemeId;
  }

  /**
   * 获取可用主题列表
   */
  get availableThemes(): EnhancedThemeConfig[] {
    return this.themes;
  }

  /**
   * 获取主题配置
   */
  getThemeConfig(themeId: string): EnhancedThemeConfig | null {
    return this.themes.find(theme => theme.id === themeId) || null;
  }

  /**
   * 保存主题偏好
   */
  saveThemePreference(themeId: string): void {
    try {
      if (typeof window !== 'undefined') {
        const preference = {
          themeId,
          isDarkMode: this.isDarkMode,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preference));
      }
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }

  /**
   * 获取保存的主题ID
   */
  getSavedThemeId(): string | null {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (saved) {
          const preference = JSON.parse(saved);
          return preference.themeId || null;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      return null;
    }
  }

  /**
   * 加载主题偏好
   */
  loadThemePreference(): void {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (saved) {
          const preference = JSON.parse(saved);
          this.currentThemeId = preference.themeId || DEFAULT_THEME_ID;
          this.isDarkMode = preference.isDarkMode || false;
        }
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      this.currentThemeId = DEFAULT_THEME_ID;
      this.isDarkMode = false;
    }
  }

  /**
   * 重置为默认主题
   */
  resetToDefault(): void {
    this.switchTheme(DEFAULT_THEME_ID);
    this.isDarkMode = false;
  }

  /**
   * 添加主题变化监听器
   */
  addListener(listener: (themeId: string, isDarkMode: boolean) => void): void {
    this.listeners.add(listener);
  }

  /**
   * 移除主题变化监听器
   */
  removeListener(listener: (themeId: string, isDarkMode: boolean) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(themeId: string, isDarkMode: boolean): void {
    this.listeners.forEach(listener => {
      try {
        listener(themeId, isDarkMode);
      } catch (error) {
        console.error('Theme listener error:', error);
      }
    });
  }

  /**
   * 初始化主题
   */
  async initialize(): Promise<void> {
    const savedTheme = this.getSavedThemeId();
    if (savedTheme && this.getThemeConfig(savedTheme) !== null) {
      await this.switchTheme(savedTheme);
    } else {
      await this.switchTheme(DEFAULT_THEME_ID);
    }
  }

  /**
   * 获取深色模式状态
   */
  get isDarkModeActive(): boolean {
    return this.isDarkMode;
  }

  /**
   * 获取响应式配置
   */
  get responsiveConfiguration(): ResponsiveConfig {
    return this.responsiveConfig;
  }

  /**
   * 获取深色模式配置
   */
  get darkModeConfiguration(): DarkModeConfig {
    return this.darkModeConfig;
  }

  /**
   * 更新响应式配置
   */
  updateResponsiveConfig(config: Partial<ResponsiveConfig>): void {
    this.responsiveConfig = { ...this.responsiveConfig, ...config };
  }

  /**
   * 更新深色模式配置
   */
  updateDarkModeConfig(config: Partial<DarkModeConfig>): void {
    this.darkModeConfig = { ...this.darkModeConfig, ...config };
  }

  /**
   * 更新推荐配置
   */
  updateRecommendationConfig(config: Partial<ThemeRecommendationConfig>): void {
    this.recommendationConfig = { ...this.recommendationConfig, ...config };
  }
}

// 创建单例实例
export const enhancedThemeManager = new EnhancedThemeManager();

export default EnhancedThemeManager;