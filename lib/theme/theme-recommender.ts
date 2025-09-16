/**
 * 智能主题推荐系统
 * 基于用户行为、时间上下文、设备类型和内容类型的个性化推荐
 */

import {
  EnhancedThemeConfig,
  ThemeRecommendation,
  ThemeRecommendationConfig
} from '../../types/theme-enhanced';
import { lovartHexSystem } from './lovart-color-mapping';

/**
 * 用户行为数据接口
 */
export interface UserBehavior {
  /** 用户ID */
  userId: string;
  /** 主题使用历史 */
  themeUsageHistory: ThemeUsageRecord[];
  /** 交互偏好 */
  interactionPreferences: InteractionPreference[];
  /** 时间偏好 */
  timePreferences: TimePreference[];
  /** 设备偏好 */
  devicePreferences: DevicePreference[];
  /** 内容类型偏好 */
  contentTypePreferences: ContentTypePreference[];
  /** 色彩偏好 */
  colorPreferences: ColorPreference[];
}

/**
 * 主题使用记录
 */
export interface ThemeUsageRecord {
  /** 主题ID */
  themeId: string;
  /** 使用时间 */
  timestamp: string;
  /** 使用时长（秒） */
  duration: number;
  /** 交互次数 */
  interactionCount: number;
  /** 满意度评分（1-5） */
  satisfactionScore: number;
  /** 使用设备类型 */
  deviceType: 'mobile' | 'tablet' | 'desktop';
  /** 使用时间段 */
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  /** 内容类型 */
  contentType: string;
}

/**
 * 交互偏好
 */
export interface InteractionPreference {
  /** 交互类型 */
  interactionType: 'click' | 'hover' | 'scroll' | 'focus';
  /** 偏好程度（0-1） */
  preference: number;
  /** 时间戳 */
  timestamp: string;
}

/**
 * 时间偏好
 */
export interface TimePreference {
  /** 时间段 */
  timePeriod: 'morning' | 'afternoon' | 'evening' | 'night';
  /** 偏好程度（0-1） */
  preference: number;
  /** 使用频率 */
  frequency: number;
}

/**
 * 设备偏好
 */
export interface DevicePreference {
  /** 设备类型 */
  deviceType: 'mobile' | 'tablet' | 'desktop';
  /** 偏好程度（0-1） */
  preference: number;
  /** 使用频率 */
  frequency: number;
}

/**
 * 内容类型偏好
 */
export interface ContentTypePreference {
  /** 内容类型 */
  contentType: string;
  /** 偏好程度（0-1） */
  preference: number;
  /** 使用频率 */
  frequency: number;
}

/**
 * 色彩偏好
 */
export interface ColorPreference {
  /** 色彩类型 */
  colorType: 'warm' | 'cool' | 'neutral' | 'vibrant' | 'muted';
  /** 偏好程度（0-1） */
  preference: number;
  /** 具体色彩 */
  colors: string[];
}

/**
 * 时间上下文
 */
export interface TimeContext {
  /** 当前时间 */
  currentTime: Date;
  /** 季节 */
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  /** 时间段 */
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  /** 工作日/周末 */
  dayType: 'weekday' | 'weekend';
  /** 节假日 */
  isHoliday: boolean;
}

/**
 * 设备上下文
 */
export interface DeviceContext {
  /** 设备类型 */
  deviceType: 'mobile' | 'tablet' | 'desktop';
  /** 屏幕尺寸 */
  screenSize: {
    width: number;
    height: number;
  };
  /** 屏幕密度 */
  pixelRatio: number;
  /** 操作系统 */
  os: string;
  /** 浏览器 */
  browser: string;
}

/**
 * 内容上下文
 */
export interface ContentContext {
  /** 内容类型 */
  contentType: 'professional' | 'creative' | 'educational' | 'entertainment' | 'social';
  /** 内容主题 */
  contentTheme: string;
  /** 内容复杂度 */
  complexity: 'simple' | 'moderate' | 'complex';
  /** 目标受众 */
  targetAudience: 'general' | 'professional' | 'academic' | 'creative';
}

/**
 * 推荐上下文
 */
export interface RecommendationContext {
  /** 用户行为 */
  userBehavior?: UserBehavior;
  /** 时间上下文 */
  timeContext?: TimeContext;
  /** 设备上下文 */
  deviceContext?: DeviceContext;
  /** 内容上下文 */
  contentContext?: ContentContext;
  /** 当前主题 */
  currentTheme?: string;
  /** 主题历史 */
  themeHistory?: string[];
}

/**
 * 主题推荐算法接口
 */
export interface IThemeRecommendationAlgorithm {
  /** 算法名称 */
  name: string;
  /** 算法权重 */
  weight: number;
  /** 推荐方法 */
  recommend(themes: EnhancedThemeConfig[], context: RecommendationContext): ThemeRecommendation[];
}

/**
 * 基于用户行为的推荐算法
 */
export class BehaviorBasedRecommendation implements IThemeRecommendationAlgorithm {
  name = 'behavior-based';
  weight = 0.4;

  recommend(themes: EnhancedThemeConfig[], context: RecommendationContext): ThemeRecommendation[] {
    const recommendations: ThemeRecommendation[] = [];
    const userBehavior = context.userBehavior;

    if (!userBehavior) {
      return recommendations;
    }

    // 1. 基于使用频率推荐
    const usageFrequency = this.calculateUsageFrequency(userBehavior.themeUsageHistory);

    // 2. 基于满意度推荐
    const satisfactionScores = this.calculateSatisfactionScores(userBehavior.themeUsageHistory);

    // 3. 基于交互偏好推荐
    const interactionPreferences = this.analyzeInteractionPreferences(userBehavior.interactionPreferences);

    // 4. 基于色彩偏好推荐
    const colorPreferences = this.analyzeColorPreferences(userBehavior.colorPreferences);

    themes.forEach(theme => {
      let score = 0;
      let reasons: string[] = [];

      // 使用频率评分
      const frequencyScore = usageFrequency[theme.id] || 0;
      score += frequencyScore * 0.3;
      if (frequencyScore > 0.5) {
        reasons.push('您经常使用此主题');
      }

      // 满意度评分
      const satisfactionScore = satisfactionScores[theme.id] || 0;
      score += satisfactionScore * 0.3;
      if (satisfactionScore > 0.7) {
        reasons.push('您对此主题评价很高');
      }

      // 交互偏好匹配
      const interactionScore = this.calculateInteractionMatch(theme, interactionPreferences);
      score += interactionScore * 0.2;
      if (interactionScore > 0.6) {
        reasons.push('符合您的交互偏好');
      }

      // 色彩偏好匹配
      const colorScore = this.calculateColorMatch(theme, colorPreferences);
      score += colorScore * 0.2;
      if (colorScore > 0.6) {
        reasons.push('符合您的色彩偏好');
      }

      if (score > 0.3) { // 最低推荐阈值
        recommendations.push({
          theme,
          score: Math.min(score, 1),
          reason: reasons.join('，'),
          algorithm: 'behavior',
        });
      }
    });

    return recommendations.sort((a, b) => b.score - a.score);
  }

  private calculateUsageFrequency(usageHistory: ThemeUsageRecord[]): Record<string, number> {
    const frequency: Record<string, number> = {};
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 统计最近30天的使用情况
    const recentUsage = usageHistory.filter(record =>
      new Date(record.timestamp) >= thirtyDaysAgo
    );

    recentUsage.forEach(record => {
      frequency[record.themeId] = (frequency[record.themeId] || 0) + 1;
    });

    // 标准化到0-1范围
    const maxFrequency = Math.max(...Object.values(frequency), 1);
    Object.keys(frequency).forEach(themeId => {
      frequency[themeId] = frequency[themeId] / maxFrequency;
    });

    return frequency;
  }

  private calculateSatisfactionScores(usageHistory: ThemeUsageRecord[]): Record<string, number> {
    const scores: Record<string, { total: number; count: number }> = {};

    usageHistory.forEach(record => {
      if (!scores[record.themeId]) {
        scores[record.themeId] = { total: 0, count: 0 };
      }
      scores[record.themeId].total += record.satisfactionScore;
      scores[record.themeId].count += 1;
    });

    const result: Record<string, number> = {};
    Object.keys(scores).forEach(themeId => {
      const avgScore = scores[themeId].total / scores[themeId].count;
      result[themeId] = avgScore / 5; // 标准化到0-1
    });

    return result;
  }

  private analyzeInteractionPreferences(preferences: InteractionPreference[]): Record<string, number> {
    const analysis: Record<string, number> = {};

    preferences.forEach(pref => {
      analysis[pref.interactionType] = (analysis[pref.interactionType] || 0) + pref.preference;
    });

    return analysis;
  }

  private analyzeColorPreferences(preferences: ColorPreference[]): Record<string, number> {
    const analysis: Record<string, number> = {};

    preferences.forEach(pref => {
      analysis[pref.colorType] = (analysis[pref.colorType] || 0) + pref.preference;
    });

    return analysis;
  }

  private calculateInteractionMatch(theme: EnhancedThemeConfig, preferences: Record<string, number>): number {
    // 简化的交互偏好匹配逻辑
    const hasAnimations = theme.animations && Object.keys(theme.animations).length > 0;
    const interactionScore = hasAnimations ? 0.6 : 0.4;

    // 根据偏好调整分数
    if (preferences.hover > 0.7 && hasAnimations) {
      return Math.min(interactionScore + 0.3, 1);
    }

    return interactionScore;
  }

  private calculateColorMatch(theme: EnhancedThemeConfig, preferences: Record<string, number>): number {
    let score = 0;
    const primaryColor = theme.colors.primary;

    // 分析主色的色彩类型
    const colorType = this.analyzeColorType(primaryColor);
    const preferenceScore = preferences[colorType] || 0;

    score += preferenceScore * 0.8; // 主色彩偏好权重较高

    // 检查其他色彩是否匹配偏好
    const secondaryColorType = this.analyzeColorType(theme.colors.secondary);
    const secondaryPreferenceScore = preferences[secondaryColorType] || 0;
    score += secondaryPreferenceScore * 0.2;

    return Math.min(score, 1);
  }

  private analyzeColorType(color: string): 'warm' | 'cool' | 'neutral' | 'vibrant' | 'muted' {
    // 简化的色彩类型分析
    const hue = this.getHueFromColor(color);
    const saturation = this.getSaturationFromColor(color);
    // const lightness = this.getLightnessFromColor(color); // 暂时未使用，保留供将来扩展

    if (saturation < 0.2) return 'neutral';
    if (saturation > 0.8) return 'vibrant';
    if (saturation < 0.4) return 'muted';

    if (hue >= 0 && hue <= 60 || hue >= 300) return 'warm';
    if (hue >= 120 && hue <= 300) return 'cool';

    return 'neutral';
  }

  private getHueFromColor(color: string): number {
    // 简化的色相提取逻辑
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const diff = max - min;

      let hue = 0;
      if (diff !== 0) {
        if (max === r) hue = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        else if (max === g) hue = ((b - r) / diff + 2) / 6;
        else hue = ((r - g) / diff + 4) / 6;
      }

      return Math.round(hue * 360);
    }
    return 0;
  }

  private getSaturationFromColor(color: string): number {
    // 简化的饱和度提取逻辑
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const diff = max - min;

      return max === 0 ? 0 : diff / max;
    }
    return 0;
  }
}

/**
 * 基于时间上下文的推荐算法
 */
export class TimeBasedRecommendation implements IThemeRecommendationAlgorithm {
  name = 'time-based';
  weight = 0.2;

  recommend(themes: EnhancedThemeConfig[], context: RecommendationContext): ThemeRecommendation[] {
    const recommendations: ThemeRecommendation[] = [];
    const timeContext = context.timeContext;

    if (!timeContext) {
      return recommendations;
    }

    const { season, timeOfDay, dayType, isHoliday } = timeContext;

    themes.forEach(theme => {
      let score = 0;
      let reasons: string[] = [];

      // 1. 基于季节的推荐
      const seasonScore = this.calculateSeasonMatch(theme, season);
      score += seasonScore * 0.3;
      if (seasonScore > 0.6) {
        reasons.push(`适合${this.getSeasonName(season)}季节`);
      }

      // 2. 基于时间段的推荐
      const timeOfDayScore = this.calculateTimeOfDayMatch(theme, timeOfDay);
      score += timeOfDayScore * 0.4;
      if (timeOfDayScore > 0.6) {
        reasons.push(`适合${this.getTimeOfDayName(timeOfDay)}使用`);
      }

      // 3. 基于工作日/周末的推荐
      const dayTypeScore = this.calculateDayTypeMatch(theme, dayType);
      score += dayTypeScore * 0.2;
      if (dayTypeScore > 0.6) {
        reasons.push(`适合${dayType === 'weekday' ? '工作日' : '周末'}使用`);
      }

      // 4. 基于节假日的推荐
      if (isHoliday) {
        const holidayScore = this.calculateHolidayMatch(theme);
        score += holidayScore * 0.1;
        if (holidayScore > 0.6) {
          reasons.push('适合节假日使用');
        }
      }

      if (score > 0.3) {
        recommendations.push({
          theme,
          score: Math.min(score, 1),
          reason: reasons.join('，'),
          algorithm: 'time',
        });
      }
    });

    return recommendations.sort((a, b) => b.score - a.score);
  }

  private calculateSeasonMatch(theme: EnhancedThemeConfig, season: string): number {
    const seasonColorMap: Record<string, string[]> = {
      spring: ['green', 'lime', 'yellow'],
      summer: ['blue', 'cyan', 'orange'],
      autumn: ['orange', 'gold', 'red'],
      winter: ['blue', 'purple', 'gray'],
    };

    const seasonColors = seasonColorMap[season] || [];
    const primaryColor = theme.colors.primary;

    // 分析主题主色是否匹配季节色彩
    for (const seasonColor of seasonColors) {
      if (lovartHexSystem[seasonColor as keyof typeof lovartHexSystem]) {
        const scale = lovartHexSystem[seasonColor as keyof typeof lovartHexSystem];
        if (Object.values(scale).includes(primaryColor)) {
          return 0.8;
        }
      }
    }

    // 基于主题分类的匹配
    const seasonThemeMap: Record<string, string[]> = {
      spring: ['nature', 'modern'],
      summer: ['tech', 'modern'],
      autumn: ['art', 'business'],
      winter: ['business', 'tech'],
    };

    const seasonThemes = seasonThemeMap[season] || [];
    if (seasonThemes.includes(theme.category)) {
      return 0.6;
    }

    return 0.3;
  }

  private calculateTimeOfDayMatch(theme: EnhancedThemeConfig, timeOfDay: string): number {
    // 基于时间段的主题推荐
    const timeThemeMap: Record<string, string[]> = {
      morning: ['modern', 'nature'],
      afternoon: ['tech', 'business'],
      evening: ['business', 'art'],
      night: ['tech', 'art'],
    };

    const timeThemes = timeThemeMap[timeOfDay] || [];
    if (timeThemes.includes(theme.category)) {
      return 0.7;
    }

    // 深色模式支持度评分
    if (timeOfDay === 'night' && theme.supportsDarkMode) {
      return 0.8;
    }

    return 0.4;
  }

  private calculateDayTypeMatch(theme: EnhancedThemeConfig, dayType: string): number {
    if (dayType === 'weekday') {
      return theme.category === 'business' ? 0.8 : 0.5;
    } else {
      return theme.category === 'art' || theme.category === 'nature' ? 0.7 : 0.5;
    }
  }

  private calculateHolidayMatch(theme: EnhancedThemeConfig): number {
    // 节假日推荐轻松、创意的主题
    const holidayThemes = ['art', 'nature'];
    return holidayThemes.includes(theme.category) ? 0.7 : 0.4;
  }

  private getSeasonName(season: string): string {
    const seasonNames: Record<string, string> = {
      spring: '春',
      summer: '夏',
      autumn: '秋',
      winter: '冬',
    };
    return seasonNames[season] || season;
  }

  private getTimeOfDayName(timeOfDay: string): string {
    const timeNames: Record<string, string> = {
      morning: '上午',
      afternoon: '下午',
      evening: '晚上',
      night: '深夜',
    };
    return timeNames[timeOfDay] || timeOfDay;
  }
}

/**
 * 基于设备类型的推荐算法
 */
export class DeviceBasedRecommendation implements IThemeRecommendationAlgorithm {
  name = 'device-based';
  weight = 0.2;

  recommend(themes: EnhancedThemeConfig[], context: RecommendationContext): ThemeRecommendation[] {
    const recommendations: ThemeRecommendation[] = [];
    const deviceContext = context.deviceContext;

    if (!deviceContext) {
      return recommendations;
    }

    const { deviceType, screenSize, pixelRatio } = deviceContext;

    themes.forEach(theme => {
      let score = 0;
      let reasons: string[] = [];

      // 1. 基于设备类型的推荐
      const deviceTypeScore = this.calculateDeviceTypeMatch(theme, deviceType);
      score += deviceTypeScore * 0.5;
      if (deviceTypeScore > 0.6) {
        reasons.push(`适合${this.getDeviceTypeName(deviceType)}使用`);
      }

      // 2. 基于屏幕尺寸的推荐
      const screenSizeScore = this.calculateScreenSizeMatch(theme, screenSize);
      score += screenSizeScore * 0.3;
      if (screenSizeScore > 0.6) {
        reasons.push('适合当前屏幕尺寸');
      }

      // 3. 基于屏幕密度的推荐
      const pixelRatioScore = this.calculatePixelRatioMatch(theme, pixelRatio);
      score += pixelRatioScore * 0.2;
      if (pixelRatioScore > 0.6) {
        reasons.push('适配高分辨率屏幕');
      }

      if (score > 0.3) {
        recommendations.push({
          theme,
          score: Math.min(score, 1),
          reason: reasons.join('，'),
          algorithm: 'device',
        });
      }
    });

    return recommendations.sort((a, b) => b.score - a.score);
  }

  private calculateDeviceTypeMatch(theme: EnhancedThemeConfig, deviceType: string): number {
    if (!theme.supportsResponsive) {
      return 0.3; // 不支持响应式设计的主题得分较低
    }

    // 基于设备类型的主题特征
    const deviceThemeScores: Record<string, Record<string, number>> = {
      mobile: {
        modern: 0.8,
        nature: 0.7,
        tech: 0.6,
        business: 0.5,
        art: 0.4,
      },
      tablet: {
        modern: 0.7,
        business: 0.8,
        tech: 0.7,
        nature: 0.6,
        art: 0.6,
      },
      desktop: {
        business: 0.8,
        tech: 0.7,
        modern: 0.6,
        art: 0.7,
        nature: 0.5,
      },
    };

    const scores = deviceThemeScores[deviceType] || {};
    return scores[theme.category] || 0.5;
  }

  private calculateScreenSizeMatch(theme: EnhancedThemeConfig, screenSize: { width: number; height: number }): number {
    const { width, height } = screenSize;
    const aspectRatio = width / height;

    // 基于屏幕比例的推荐
    if (aspectRatio > 1.7) { // 宽屏
      return theme.category === 'business' || theme.category === 'tech' ? 0.8 : 0.6;
    } else if (aspectRatio < 0.7) { // 竖屏
      return theme.category === 'modern' || theme.category === 'nature' ? 0.7 : 0.5;
    }

    return 0.6;
  }

  private calculatePixelRatioMatch(theme: EnhancedThemeConfig, pixelRatio: number): number {
    if (pixelRatio >= 2) {
      // 高分辨率屏幕，推荐支持高清显示的主题
      return theme.supportsResponsive ? 0.8 : 0.4;
    } else if (pixelRatio >= 1.5) {
      return theme.supportsResponsive ? 0.7 : 0.5;
    }

    return 0.6;
  }

  private getDeviceTypeName(deviceType: string): string {
    const deviceNames: Record<string, string> = {
      mobile: '手机',
      tablet: '平板',
      desktop: '桌面',
    };
    return deviceNames[deviceType] || deviceType;
  }
}

/**
 * 基于内容类型的推荐算法
 */
export class ContentBasedRecommendation implements IThemeRecommendationAlgorithm {
  name = 'content-based';
  weight = 0.2;

  recommend(themes: EnhancedThemeConfig[], context: RecommendationContext): ThemeRecommendation[] {
    const recommendations: ThemeRecommendation[] = [];
    const contentContext = context.contentContext;

    if (!contentContext) {
      return recommendations;
    }

    const { contentType, contentTheme, complexity, targetAudience } = contentContext;

    themes.forEach(theme => {
      let score = 0;
      let reasons: string[] = [];

      // 1. 基于内容类型的推荐
      const contentTypeScore = this.calculateContentTypeMatch(theme, contentType);
      score += contentTypeScore * 0.4;
      if (contentTypeScore > 0.6) {
        reasons.push(`适合${this.getContentTypeName(contentType)}内容`);
      }

      // 2. 基于内容主题的推荐
      const contentThemeScore = this.calculateContentThemeMatch(theme, contentTheme);
      score += contentThemeScore * 0.3;
      if (contentThemeScore > 0.6) {
        reasons.push(`适合${contentTheme}主题内容`);
      }

      // 3. 基于复杂度的推荐
      const complexityScore = this.calculateComplexityMatch(theme, complexity);
      score += complexityScore * 0.2;
      if (complexityScore > 0.6) {
        reasons.push(`适合${this.getComplexityName(complexity)}内容`);
      }

      // 4. 基于目标受众的推荐
      const audienceScore = this.calculateAudienceMatch(theme, targetAudience);
      score += audienceScore * 0.1;
      if (audienceScore > 0.6) {
        reasons.push(`适合${this.getAudienceName(targetAudience)}受众`);
      }

      if (score > 0.3) {
        recommendations.push({
          theme,
          score: Math.min(score, 1),
          reason: reasons.join('，'),
          algorithm: 'content',
        });
      }
    });

    return recommendations.sort((a, b) => b.score - a.score);
  }

  private calculateContentTypeMatch(theme: EnhancedThemeConfig, contentType: string): number {
    const contentTypeThemeMap: Record<string, string[]> = {
      professional: ['business', 'modern'],
      creative: ['art', 'nature'],
      educational: ['modern', 'tech'],
      entertainment: ['art', 'tech'],
      social: ['modern', 'nature'],
    };

    const suitableThemes = contentTypeThemeMap[contentType] || [];
    return suitableThemes.includes(theme.category) ? 0.8 : 0.4;
  }

  private calculateContentThemeMatch(theme: EnhancedThemeConfig, contentTheme: string): number {
    // 简化的内容主题匹配逻辑
    const themeKeywords: Record<string, string[]> = {
      modern: ['modern', 'clean', 'minimal', 'contemporary'],
      business: ['professional', 'corporate', 'formal', 'serious'],
      tech: ['technology', 'digital', 'futuristic', 'innovation'],
      nature: ['natural', 'organic', 'environmental', 'green'],
      art: ['creative', 'artistic', 'colorful', 'expressive'],
    };

    const keywords = themeKeywords[theme.category] || [];
    const contentThemeLower = contentTheme.toLowerCase();

    let matchCount = 0;
    keywords.forEach(keyword => {
      if (contentThemeLower.includes(keyword)) {
        matchCount++;
      }
    });

    return Math.min(matchCount / keywords.length, 1);
  }

  private calculateComplexityMatch(theme: EnhancedThemeConfig, complexity: string): number {
    if (complexity === 'simple') {
      return theme.category === 'modern' ? 0.8 : 0.6;
    } else if (complexity === 'moderate') {
      return ['business', 'tech', 'nature'].includes(theme.category) ? 0.7 : 0.5;
    } else {
      return theme.category === 'art' ? 0.8 : 0.6;
    }
  }

  private calculateAudienceMatch(theme: EnhancedThemeConfig, targetAudience: string): number {
    const audienceThemeMap: Record<string, string[]> = {
      general: ['modern', 'nature'],
      professional: ['business', 'tech'],
      academic: ['tech', 'modern'],
      creative: ['art', 'nature'],
    };

    const suitableThemes = audienceThemeMap[targetAudience] || [];
    return suitableThemes.includes(theme.category) ? 0.7 : 0.5;
  }

  private getContentTypeName(contentType: string): string {
    const contentTypeNames: Record<string, string> = {
      professional: '专业',
      creative: '创意',
      educational: '教育',
      entertainment: '娱乐',
      social: '社交',
    };
    return contentTypeNames[contentType] || contentType;
  }

  private getComplexityName(complexity: string): string {
    const complexityNames: Record<string, string> = {
      simple: '简单',
      moderate: '中等',
      complex: '复杂',
    };
    return complexityNames[complexity] || complexity;
  }

  private getAudienceName(audience: string): string {
    const audienceNames: Record<string, string> = {
      general: '一般',
      professional: '专业',
      academic: '学术',
      creative: '创意',
    };
    return audienceNames[audience] || audience;
  }
}

/**
 * 主题推荐引擎
 */
export class ThemeRecommendationEngine {
  private algorithms: IThemeRecommendationAlgorithm[] = [];
  private config: ThemeRecommendationConfig;

  constructor(config: ThemeRecommendationConfig) {
    this.config = config;
    this.initializeAlgorithms();
  }

  private initializeAlgorithms(): void {
    this.algorithms = [
      new BehaviorBasedRecommendation(),
      new TimeBasedRecommendation(),
      new DeviceBasedRecommendation(),
      new ContentBasedRecommendation(),
    ];
  }

  /**
   * 生成主题推荐
   */
  async recommend(
    themes: EnhancedThemeConfig[],
    context: RecommendationContext
  ): Promise<ThemeRecommendation[]> {
    const allRecommendations: ThemeRecommendation[] = [];

    // 运行所有推荐算法
    for (const algorithm of this.algorithms) {
      const recommendations = algorithm.recommend(themes, context);

      // 应用算法权重
      const weightedRecommendations = recommendations.map(rec => ({
        ...rec,
        score: rec.score * algorithm.weight,
      }));

      allRecommendations.push(...weightedRecommendations);
    }

    // 合并相同主题的推荐结果
    const mergedRecommendations = this.mergeRecommendations(allRecommendations);

    // 按分数排序并限制数量
    return mergedRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.recommendationCount);
  }

  private mergeRecommendations(recommendations: ThemeRecommendation[]): ThemeRecommendation[] {
    const themeMap = new Map<string, ThemeRecommendation>();

    recommendations.forEach(rec => {
      const existing = themeMap.get(rec.theme.id);
      if (existing) {
        // 合并分数和理由
        existing.score = Math.max(existing.score, rec.score);
        existing.reason = `${existing.reason}；${rec.reason}`;
        existing.algorithm = 'hybrid';
      } else {
        themeMap.set(rec.theme.id, { ...rec });
      }
    });

    return Array.from(themeMap.values());
  }

  /**
   * 更新推荐配置
   */
  updateConfig(config: Partial<ThemeRecommendationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 添加自定义推荐算法
   */
  addAlgorithm(algorithm: IThemeRecommendationAlgorithm): void {
    this.algorithms.push(algorithm);
  }

  /**
   * 移除推荐算法
   */
  removeAlgorithm(algorithmName: string): void {
    this.algorithms = this.algorithms.filter(alg => alg.name !== algorithmName);
  }
}

/**
 * 用户行为数据收集器
 */
export class UserBehaviorCollector {
  private storageKey = 'user-behavior-data';

  /**
   * 记录主题使用行为
   */
  recordThemeUsage(themeId: string, usageData: Partial<ThemeUsageRecord>): void {
    const record: ThemeUsageRecord = {
      themeId,
      timestamp: new Date().toISOString(),
      duration: usageData.duration || 0,
      interactionCount: usageData.interactionCount || 0,
      satisfactionScore: usageData.satisfactionScore || 3,
      deviceType: usageData.deviceType || 'desktop',
      timeOfDay: usageData.timeOfDay || this.getCurrentTimeOfDay(),
      contentType: usageData.contentType || 'general',
    };

    const existingData = this.getStoredData();
    existingData.themeUsageHistory.push(record);

    // 限制历史记录数量（最近1000条）
    if (existingData.themeUsageHistory.length > 1000) {
      existingData.themeUsageHistory = existingData.themeUsageHistory.slice(-1000);
    }

    this.storeData(existingData);
  }

  /**
   * 记录交互偏好
   */
  recordInteractionPreference(interactionType: string, preference: number): void {
    const data = this.getStoredData();

    const existingPref = data.interactionPreferences.find((p: InteractionPreference) => p.interactionType === interactionType);
    if (existingPref) {
      existingPref.preference = (existingPref.preference + preference) / 2;
      existingPref.timestamp = new Date().toISOString();
    } else {
      data.interactionPreferences.push({
        interactionType,
        preference,
        timestamp: new Date().toISOString(),
      });
    }

    this.storeData(data);
  }

  /**
   * 记录色彩偏好
   */
  recordColorPreference(colorType: string, preference: number, colors?: string[]): void {
    const data = this.getStoredData();

    const existingPref = data.colorPreferences.find((p: ColorPreference) => p.colorType === colorType);
    if (existingPref) {
      existingPref.preference = (existingPref.preference + preference) / 2;
      if (colors) {
        existingPref.colors = Array.from(new Set([...existingPref.colors, ...colors]));
      }
    } else {
      data.colorPreferences.push({
        colorType,
        preference,
        colors: colors || [],
      });
    }

    this.storeData(data);
  }

  /**
   * 获取用户行为数据
   */
  getUserBehavior(userId: string): UserBehavior {
    const data = this.getStoredData();
    return {
      userId,
      themeUsageHistory: data.themeUsageHistory,
      interactionPreferences: data.interactionPreferences,
      timePreferences: this.calculateTimePreferences(data.themeUsageHistory),
      devicePreferences: this.calculateDevicePreferences(data.themeUsageHistory),
      contentTypePreferences: this.calculateContentTypePreferences(data.themeUsageHistory),
      colorPreferences: data.colorPreferences,
    };
  }

  private getStoredData(): any {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : this.getDefaultData();
    } catch {
      return this.getDefaultData();
    }
  }

  private storeData(data: any): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to store user behavior data:', error);
    }
  }

  private getDefaultData(): any {
    return {
      themeUsageHistory: [],
      interactionPreferences: [],
      colorPreferences: [],
    };
  }

  private getCurrentTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  private calculateTimePreferences(usageHistory: ThemeUsageRecord[]): TimePreference[] {
    const timeCounts: Record<string, number> = {};

    usageHistory.forEach(record => {
      timeCounts[record.timeOfDay] = (timeCounts[record.timeOfDay] || 0) + 1;
    });

    const total = Object.values(timeCounts).reduce((sum, count) => sum + count, 0);

    return Object.entries(timeCounts).map(([timeOfDay, count]) => ({
      timePeriod: timeOfDay as any,
      preference: count / total,
      frequency: count,
    }));
  }

  private calculateDevicePreferences(usageHistory: ThemeUsageRecord[]): DevicePreference[] {
    const deviceCounts: Record<string, number> = {};

    usageHistory.forEach(record => {
      deviceCounts[record.deviceType] = (deviceCounts[record.deviceType] || 0) + 1;
    });

    const total = Object.values(deviceCounts).reduce((sum, count) => sum + count, 0);

    return Object.entries(deviceCounts).map(([deviceType, count]) => ({
      deviceType: deviceType as any,
      preference: count / total,
      frequency: count,
    }));
  }

  private calculateContentTypePreferences(usageHistory: ThemeUsageRecord[]): ContentTypePreference[] {
    const contentCounts: Record<string, number> = {};

    usageHistory.forEach(record => {
      contentCounts[record.contentType] = (contentCounts[record.contentType] || 0) + 1;
    });

    const total = Object.values(contentCounts).reduce((sum, count) => sum + count, 0);

    return Object.entries(contentCounts).map(([contentType, count]) => ({
      contentType,
      preference: count / total,
      frequency: count,
    }));
  }
}

// 创建推荐引擎实例
export const themeRecommendationEngine = new ThemeRecommendationEngine({
  behaviorWeight: 0.4,
  timeContextWeight: 0.2,
  deviceTypeWeight: 0.2,
  contentTypeWeight: 0.2,
  recommendationCount: 5,
});

// 创建用户行为收集器实例
export const userBehaviorCollector = new UserBehaviorCollector();
