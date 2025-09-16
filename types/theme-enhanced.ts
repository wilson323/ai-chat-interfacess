/**
 * 增强主题系统类型定义
 * 整合Lovart设计资源的色彩系统和增强功能
 */

import { ColorScheme, StyleScheme, ThemeConfig } from './theme';

/**
 * Lovart色彩色阶定义
 * 每个颜色包含10个色阶（1-10，从浅到深）
 */
export interface LovartColorScale {
  /** 色阶1（最浅） */
  1: string;
  /** 色阶2 */
  2: string;
  /** 色阶3 */
  3: string;
  /** 色阶4 */
  4: string;
  /** 色阶5 */
  5: string;
  /** 色阶6（主色） */
  6: string;
  /** 色阶7 */
  7: string;
  /** 色阶8 */
  8: string;
  /** 色阶9 */
  9: string;
  /** 色阶10（最深） */
  10: string;
}

/**
 * Lovart完整色彩系统
 */
export interface LovartColorSystem {
  /** 红色色阶 */
  red: LovartColorScale;
  /** 橙红色阶 */
  orangered: LovartColorScale;
  /** 橙色色阶 */
  orange: LovartColorScale;
  /** 金色色阶 */
  gold: LovartColorScale;
  /** 黄色色阶 */
  yellow: LovartColorScale;
  /** 青柠色色阶 */
  lime: LovartColorScale;
  /** 绿色色阶 */
  green: LovartColorScale;
  /** 青色色阶 */
  cyan: LovartColorScale;
  /** 蓝色色阶 */
  blue: LovartColorScale;
  /** 弧蓝色阶 */
  arcoblue: LovartColorScale;
  /** 紫色色阶 */
  purple: LovartColorScale;
  /** 粉紫色色阶 */
  pinkpurple: LovartColorScale;
  /** 洋红色色阶 */
  magenta: LovartColorScale;
  /** 灰色色阶 */
  gray: LovartColorScale;
}

/**
 * 增强色彩方案接口
 * 在原有ColorScheme基础上添加Lovart色彩系统支持
 */
export interface EnhancedColorScheme extends ColorScheme {
  /** Lovart色彩色阶系统 */
  lovartScales?: Partial<LovartColorSystem>;
  /** 主色色阶（10个色阶） */
  primaryScale?: string[];
  /** 辅助色色阶（10个色阶） */
  secondaryScale?: string[];
  /** 强调色色阶（10个色阶） */
  accentScale?: string[];
  /** 背景色色阶（10个色阶） */
  backgroundScale?: string[];
  /** 表面色色阶（10个色阶） */
  surfaceScale?: string[];
  /** 文字色色阶（10个色阶） */
  textScale?: string[];
}

/**
 * 响应式设计配置
 */
export interface ResponsiveConfig {
  /** 断点配置 */
  breakpoints: {
    /** 超小屏幕（手机） */
    xs: string;
    /** 小屏幕（平板） */
    sm: string;
    /** 中等屏幕（小桌面） */
    md: string;
    /** 大屏幕（桌面） */
    lg: string;
    /** 超大屏幕（大桌面） */
    xl: string;
  };
  /** 字体缩放比例 */
  fontScale: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  /** 间距缩放比例 */
  spacingScale: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  /** 圆角缩放比例 */
  radiusScale: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

/**
 * 深色模式配置
 */
export interface DarkModeConfig {
  /** 是否启用深色模式 */
  enabled: boolean;
  /** 自动切换时间（可选） */
  autoSwitch?: {
    /** 深色模式开始时间（24小时制） */
    darkStart: string;
    /** 浅色模式开始时间（24小时制） */
    lightStart: string;
  };
  /** 深色模式色彩映射函数 */
  colorTransform?: {
    /** 背景色变暗程度（0-1） */
    backgroundDarken: number;
    /** 文字色变亮程度（0-1） */
    textLighten: number;
    /** 表面色变暗程度（0-1） */
    surfaceDarken: number;
  };
}

/**
 * 增强样式配置
 */
export interface EnhancedStyleScheme extends StyleScheme {
  /** 响应式设计配置 */
  responsive?: ResponsiveConfig;
  /** 深色模式配置 */
  darkMode?: DarkModeConfig;
  /** CSS自定义属性 */
  customProperties?: Record<string, string>;
}

/**
 * 主题动画配置
 */
export interface ThemeAnimation {
  /** 动画名称 */
  name: string;
  /** 动画持续时间 */
  duration: string;
  /** 动画缓动函数 */
  easing: string;
  /** 动画延迟 */
  delay?: string;
  /** 动画迭代次数 */
  iteration?: string;
  /** 动画方向 */
  direction?: string;
}

/**
 * 主题动效系统
 */
export interface ThemeAnimations {
  /** 主题切换动画 */
  themeTransition?: ThemeAnimation;
  /** 组件出现动画 */
  componentEnter?: ThemeAnimation;
  /** 组件消失动画 */
  componentExit?: ThemeAnimation;
  /** 交互动画 */
  interaction?: ThemeAnimation;
  /** 加载动画 */
  loading?: ThemeAnimation;
  /** 成功动画 */
  success?: ThemeAnimation;
  /** 错误动画 */
  error?: ThemeAnimation;
}

/**
 * 图标配置
 */
export interface IconConfig {
  /** 图标库名称 */
  library: string;
  /** 图标样式 */
  style: 'filled' | 'outlined' | 'two-tone';
  /** 图标大小映射 */
  sizes: {
    small: number;
    medium: number;
    large: number;
  };
  /** 自定义图标映射 */
  customIcons?: Record<string, string>;
}

/**
 * 插画配置
 */
export interface IllustrationConfig {
  /** 插画风格 */
  style: 'flat' | 'gradient' | 'outline' | '3d';
  /** 主色调 */
  primaryColor: string;
  /** 辅助色调 */
  secondaryColor: string;
  /** 插画库路径 */
  assetPath: string;
  /** 自定义插画映射 */
  customIllustrations?: Record<string, string>;
}

/**
 * 增强主题配置
 */
export interface EnhancedThemeConfig extends ThemeConfig {
  /** 增强色彩配置 */
  colors: EnhancedColorScheme;
  /** 增强样式配置 */
  styles: EnhancedStyleScheme;
  /** 动效配置 */
  animations?: ThemeAnimations;
  /** 图标配置 */
  iconConfig?: IconConfig;
  /** 插画配置 */
  illustrationConfig?: IllustrationConfig;
  /** 支持深色模式 */
  supportsDarkMode?: boolean;
  /** 支持响应式设计 */
  supportsResponsive?: boolean;
  /** 主题标签 */
  tags?: string[];
  /** 主题评分 */
  rating?: number;
  /** 使用统计 */
  usageStats?: {
    /** 使用次数 */
    usageCount: number;
    /** 最后使用时间 */
    lastUsed: string;
    /** 用户评分 */
    userRatings: number[];
  };
}

/**
 * 主题推荐算法配置
 */
export interface ThemeRecommendationConfig {
  /** 基于用户行为的推荐权重 */
  behaviorWeight: number;
  /** 基于时间上下文的推荐权重 */
  timeContextWeight: number;
  /** 基于设备类型的推荐权重 */
  deviceTypeWeight: number;
  /** 基于内容类型的推荐权重 */
  contentTypeWeight: number;
  /** 推荐结果数量 */
  recommendationCount: number;
}

/**
 * 主题推荐结果
 */
export interface ThemeRecommendation {
  /** 推荐的主题 */
  theme: EnhancedThemeConfig;
  /** 推荐分数（0-1） */
  score: number;
  /** 推荐理由 */
  reason: string;
  /** 推荐算法类型 */
  algorithm: 'behavior' | 'time' | 'device' | 'content' | 'hybrid';
}

/**
 * 色彩转换工具类型
 */
export interface ColorUtils {
  /** RGB转HEX */
  rgbToHex: (rgb: string) => string;
  /** HEX转RGB */
  hexToRgb: (hex: string) => string;
  /** 颜色变暗 */
  darken: (color: string, amount: number) => string;
  /** 颜色变亮 */
  lighten: (color: string, amount: number) => string;
  /** 生成色阶 */
  generateScale: (baseColor: string, steps: number) => string[];
  /** 颜色对比度计算 */
  getContrastRatio: (color1: string, color2: string) => number;
  /** 判断是否为深色 */
  isDarkColor: (color: string) => boolean;
}

/**
 * 主题性能监控
 */
export interface ThemePerformanceMetrics {
  /** 主题切换时间（毫秒） */
  switchTime: number;
  /** CSS变量应用时间 */
  cssApplyTime: number;
  /** 动画渲染时间 */
  animationRenderTime: number;
  /** 内存使用量 */
  memoryUsage: number;
  /** 首次渲染时间 */
  firstPaintTime: number;
}

/**
 * 主题一致性检查
 */
export interface ThemeConsistencyCheck {
  /** 色彩一致性检查 */
  colorConsistency: {
    /** 对比度是否通过WCAG标准 */
    contrastRatioPass: boolean;
    /** 色彩和谐度评分（0-1） */
    harmonyScore: number;
    /** 色彩可访问性评分（0-1） */
    accessibilityScore: number;
  };
  /** 样式一致性检查 */
  styleConsistency: {
    /** 圆角一致性评分（0-1） */
    borderRadiusConsistency: number;
    /** 阴影一致性评分（0-1） */
    shadowConsistency: number;
    /** 间距一致性评分（0-1） */
    spacingConsistency: number;
  };
  /** 字体一致性检查 */
  typographyConsistency: {
    /** 字体层次结构评分（0-1） */
    hierarchyScore: number;
    /** 可读性评分（0-1） */
    readabilityScore: number;
    /** 字体配对评分（0-1） */
    fontPairingScore: number;
  };
}

/**
 * 主题系统配置
 */
export interface ThemeSystemConfig {
  /** 是否启用增强功能 */
  enhancedFeatures: {
    /** 色彩系统增强 */
    colorEnhancement: boolean;
    /** 响应式设计 */
    responsiveDesign: boolean;
    /** 深色模式 */
    darkMode: boolean;
    /** 动效系统 */
    animations: boolean;
    /** 智能推荐 */
    smartRecommendation: boolean;
    /** 性能监控 */
    performanceMonitoring: boolean;
    /** 一致性检查 */
    consistencyCheck: boolean;
  };
  /** 性能阈值配置 */
  performanceThresholds: {
    /** 主题切换时间阈值（毫秒） */
    maxSwitchTime: number;
    /** 动画渲染时间阈值（毫秒） */
    maxAnimationTime: number;
    /** 内存使用阈值（MB） */
    maxMemoryUsage: number;
  };
  /** 一致性阈值配置 */
  consistencyThresholds: {
    /** 最小对比度比例 */
    minContrastRatio: number;
    /** 最小和谐度评分 */
    minHarmonyScore: number;
    /** 最小可访问性评分 */
    minAccessibilityScore: number;
  };
}

/**
 * 主题推荐上下文接口
 */
export interface ThemeRecommendationContext {
  /** 用户行为数据 */
  userBehavior?: ThemeUserBehaviorData;
  /** 时间上下文 */
  timeContext?: TimeContextData;
  /** 设备类型信息 */
  deviceType?: DeviceTypeData;
  /** 内容类型信息 */
  contentType?: ContentTypeData;
}

/**
 * 用户行为数据接口
 */
export interface ThemeUserBehaviorData {
  /** 主题切换历史 */
  themeSwitchHistory: Array<{
    themeId: string;
    timestamp: Date;
    reason: 'manual' | 'auto' | 'recommendation';
  }>;
  /** 停留时间统计 */
  dwellTimeStats: Record<string, number>;
  /** 交互频率 */
  interactionFrequency: number;
  /** 偏好设置 */
  preferences: {
    darkMode: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
  };
}

/**
 * 时间上下文数据接口
 */
export interface TimeContextData {
  /** 当前时间 */
  currentTime: Date;
  /** 时区 */
  timezone: string;
  /** 是否为工作时间 */
  isWorkHours: boolean;
  /** 季节 */
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  /** 一天中的时段 */
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

/**
 * 设备类型数据接口
 */
export interface DeviceTypeData {
  /** 设备类型 */
  type: 'desktop' | 'laptop' | 'tablet' | 'mobile';
  /** 操作系统 */
  os: 'windows' | 'macos' | 'linux' | 'ios' | 'android';
  /** 屏幕尺寸 */
  screenSize: {
    width: number;
    height: number;
  };
  /** 网络类型 */
  networkType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  /** 性能等级 */
  performanceTier: 'high' | 'medium' | 'low';
}

/**
 * 内容类型数据接口
 */
export interface ContentTypeData {
  /** 主要内容类型 */
  primaryType: 'text' | 'image' | 'video' | 'mixed';
  /** 内容用途 */
  purpose: 'work' | 'entertainment' | 'education' | 'social';
  /** 复杂度等级 */
  complexity: 'simple' | 'moderate' | 'complex';
  /** 预计停留时间 */
  estimatedDuration: number;
  /** 是否需要高对比度 */
  requiresHighContrast: boolean;
}

