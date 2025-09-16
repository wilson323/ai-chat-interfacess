/**
 * 增强主题选择器组件
 * 支持Lovart色彩系统、响应式设计、深色模式和智能推荐
 */

import React, { useState, useEffect, useCallback } from 'react';

/**
 * 根据月份获取季节
 */
const getSeason = (date: Date): 'spring' | 'summer' | 'autumn' | 'winter' => {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
};

/**
 * 根据小时获取时间段
 */
const getTimeOfDay = (hour: number): 'morning' | 'afternoon' | 'evening' | 'night' => {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

/**
 * 获取一致性状态图标
 */
const getConsistencyIcon = (consistencyCheck: ThemeConsistencyCheck | null) => {
  if (!consistencyCheck) return null;

  const { colorConsistency, styleConsistency, typographyConsistency } = consistencyCheck;

  const overallScore = (
    colorConsistency.accessibilityScore +
    styleConsistency.borderRadiusConsistency +
    styleConsistency.shadowConsistency +
    styleConsistency.spacingConsistency +
    typographyConsistency.hierarchyScore +
    typographyConsistency.readabilityScore +
    typographyConsistency.fontPairingScore
  ) / 7;

  if (overallScore >= 0.8) {
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  } else if (overallScore >= 0.6) {
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  } else {
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  }
};
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  EnhancedThemeConfig,
  ThemeRecommendation,
  ThemeConsistencyCheck
} from '../../types/theme-enhanced';
import { enhancedThemeManager } from '../../lib/theme/theme-manager-enhanced';
import {
  Palette,
  Monitor,
  Smartphone,
  Tablet,
  Sun,
  Moon,
  Star,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Eye,
  Download,
  Share2
} from 'lucide-react';

interface ThemeSelectorEnhancedProps {
  /** 可用主题列表 */
  themes: EnhancedThemeConfig[];
  /** 当前主题ID */
  currentTheme: string;
  /** 主题切换回调 */
  onThemeChange: (themeId: string) => void;
  /** 深色模式切换回调 */
  onDarkModeChange?: (isDarkMode: boolean) => void;
  /** 是否显示推荐主题 */
  showRecommendations?: boolean;
  /** 是否显示一致性检查 */
  showConsistencyCheck?: boolean;
  /** 是否显示性能监控 */
  showPerformanceMetrics?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 增强主题选择器组件
 */
export function ThemeSelectorEnhanced({
  themes,
  currentTheme,
  onThemeChange,
  onDarkModeChange,
  showRecommendations = true,
  showConsistencyCheck = true,
  className = '',
}: ThemeSelectorEnhancedProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [recommendations, setRecommendations] = useState<ThemeRecommendation[]>([]);
  const [consistencyCheck, setConsistencyCheck] = useState<ThemeConsistencyCheck | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const [showPreview, setShowPreview] = useState(true);

  /**
   * 加载推荐主题
   */
  const loadRecommendations = useCallback(async () => {
    try {
      const context = {
        userBehavior: {
          themeSwitchHistory: [],
          dwellTimeStats: {},
          interactionFrequency: 0,
          preferences: {
            darkMode: false,
            highContrast: false,
            reducedMotion: false
          }
        },
        timeContext: {
          currentTime: new Date(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          isWorkHours: new Date().getHours() >= 9 && new Date().getHours() <= 17,
          season: getSeason(new Date()),
          timeOfDay: getTimeOfDay(new Date().getHours()),
        },
        deviceType: {
          type: selectedDevice as 'desktop' | 'laptop' | 'tablet' | 'mobile',
          os: 'windows' as 'windows' | 'macos' | 'linux' | 'ios' | 'android',
          screenSize: { width: 1920, height: 1080 },
          networkType: 'wifi' as 'wifi' | 'cellular' | 'ethernet' | 'unknown',
          performanceTier: 'high' as 'high' | 'medium' | 'low'
        },
        contentType: {
          primaryType: 'mixed' as 'mixed' | 'text' | 'image' | 'video',
          purpose: 'work' as 'work' | 'entertainment' | 'education' | 'social',
          complexity: 'moderate' as 'simple' | 'moderate' | 'complex',
          estimatedDuration: 30,
          requiresHighContrast: false
        },
      };

      const themeRecommendations = await enhancedThemeManager.recommendThemes(context);
      setRecommendations(themeRecommendations);
    } catch (error) {
      console.error('Failed to load theme recommendations:', error);
    }
  }, [selectedDevice]);

  /**
   * 检查当前主题一致性
   */
  const checkCurrentThemeConsistency = useCallback(async () => {
    try {
      const check = enhancedThemeManager.checkThemeConsistency(currentTheme);
      setConsistencyCheck(check);
    } catch (error) {
      console.error('Failed to check theme consistency:', error);
    }
  }, [currentTheme]);

  // 初始化主题管理器
  useEffect(() => {
    enhancedThemeManager.setThemes(themes);
    setIsDarkMode(enhancedThemeManager.isDarkModeActive);

    // 加载推荐主题
    if (showRecommendations) {
      loadRecommendations();
    }

    // 检查当前主题一致性
    if (showConsistencyCheck) {
      checkCurrentThemeConsistency();
    }

    // 添加主题变化监听器
    const handleThemeChange = (themeId: string, darkMode: boolean) => {
      setIsDarkMode(darkMode);
      onThemeChange(themeId);
      if (onDarkModeChange) {
        onDarkModeChange(darkMode);
      }
    };

    enhancedThemeManager.addListener(handleThemeChange);

    return () => {
      enhancedThemeManager.removeListener(handleThemeChange);
    };
  }, [themes, showRecommendations, showConsistencyCheck, onThemeChange, onDarkModeChange, loadRecommendations, checkCurrentThemeConsistency]);


  /**
   * 刷新推荐主题
   */
  const handleRefreshRecommendations = async () => {
    setIsRefreshing(true);
    await loadRecommendations();
    setIsRefreshing(false);
  };

  /**
   * 切换深色模式
   */
  const handleDarkModeToggle = async () => {
    await enhancedThemeManager.toggleDarkMode();
  };

  /**
   * 切换主题
   */
  const handleThemeSelect = async (themeId: string) => {
    await enhancedThemeManager.switchTheme(themeId);
  };

  /**
   * 导出主题配置
   */
  const handleExportTheme = (theme: EnhancedThemeConfig) => {
    const themeJson = JSON.stringify(theme, null, 2);
    const blob = new Blob([themeJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.id}-theme-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * 分享主题
   */
  const handleShareTheme = async (theme: EnhancedThemeConfig) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${theme.name} - AI Chat Theme`,
          text: theme.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Failed to share theme:', error);
      }
    } else {
      // 复制链接到剪贴板
      const url = `${window.location.origin}?theme=${theme.id}`;
      navigator.clipboard.writeText(url);
      alert('主题链接已复制到剪贴板');
    }
  };


  const ConsistencyIcon = getConsistencyIcon(consistencyCheck);

  return (
    <div className={`theme-selector-enhanced ${className}`}>
      <div className="space-y-6">
        {/* 控制面板 */}
        <Card className="theme-controls">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <CardTitle>主题设置</CardTitle>
              </div>
              <div className="flex items-center space-x-4">
                {/* 深色模式切换 */}
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4" />
                  <Switch
                    id="dark-mode"
                    checked={isDarkMode}
                    onCheckedChange={handleDarkModeToggle}
                  />
                  <Moon className="h-4 w-4" />
                  <Label htmlFor="dark-mode" className="text-sm">
                    深色模式
                  </Label>
                </div>

                {/* 设备选择 */}
                <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4" />
                        <span>手机</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="tablet">
                      <div className="flex items-center space-x-2">
                        <Tablet className="h-4 w-4" />
                        <span>平板</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="desktop">
                      <div className="flex items-center space-x-2">
                        <Monitor className="h-4 w-4" />
                        <span>桌面</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* 预览切换 */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-preview"
                    checked={showPreview}
                    onCheckedChange={setShowPreview}
                  />
                  <Label htmlFor="show-preview" className="text-sm">
                    预览
                  </Label>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 推荐主题 */}
        {showRecommendations && recommendations.length > 0 && (
          <Card className="theme-recommendations">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <CardTitle>推荐主题</CardTitle>
                  <Badge variant="secondary">{recommendations.length}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshRecommendations}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((recommendation) => (
                  <Card
                    key={recommendation.theme.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      currentTheme === recommendation.theme.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleThemeSelect(recommendation.theme.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{recommendation.theme.name}</CardTitle>
                        <div className="flex items-center space-x-1">
                          <Badge variant="outline" className="text-xs">
                            {Math.round(recommendation.score * 100)}%
                          </Badge>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="secondary" className="text-xs">
                                  {recommendation.algorithm}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">{recommendation.reason}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <CardDescription className="text-xs mt-1">
                        {recommendation.theme.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 主题一致性检查 */}
        {showConsistencyCheck && consistencyCheck && (
          <Card className="theme-consistency-check">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {ConsistencyIcon}
                  <CardTitle>主题一致性检查</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={checkCurrentThemeConsistency}
                >
                  <Settings className="h-4 w-4" />
                  重新检查
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 色彩一致性 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">色彩一致性</h4>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={consistencyCheck.colorConsistency.contrastRatioPass ? "default" : "destructive"}
                        className="text-xs"
                      >
                        WCAG {consistencyCheck.colorConsistency.contrastRatioPass ? '通过' : '未通过'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        和谐度 {Math.round(consistencyCheck.colorConsistency.harmonyScore * 100)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div>对比度: {Math.round(consistencyCheck.colorConsistency.contrastRatioPass ? 100 : 0)}%</div>
                    <div>和谐度: {Math.round(consistencyCheck.colorConsistency.harmonyScore * 100)}%</div>
                    <div>可访问性: {Math.round(consistencyCheck.colorConsistency.accessibilityScore * 100)}%</div>
                  </div>
                </div>

                {/* 样式一致性 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">样式一致性</h4>
                    <Badge variant="outline" className="text-xs">
                      综合 {Math.round(
                        (consistencyCheck.styleConsistency.borderRadiusConsistency +
                         consistencyCheck.styleConsistency.shadowConsistency +
                         consistencyCheck.styleConsistency.spacingConsistency) / 3 * 100
                      )}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div>圆角: {Math.round(consistencyCheck.styleConsistency.borderRadiusConsistency * 100)}%</div>
                    <div>阴影: {Math.round(consistencyCheck.styleConsistency.shadowConsistency * 100)}%</div>
                    <div>间距: {Math.round(consistencyCheck.styleConsistency.spacingConsistency * 100)}%</div>
                  </div>
                </div>

                {/* 字体一致性 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">字体一致性</h4>
                    <Badge variant="outline" className="text-xs">
                      综合 {Math.round(
                        (consistencyCheck.typographyConsistency.hierarchyScore +
                         consistencyCheck.typographyConsistency.readabilityScore +
                         consistencyCheck.typographyConsistency.fontPairingScore) / 3 * 100
                      )}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div>层次: {Math.round(consistencyCheck.typographyConsistency.hierarchyScore * 100)}%</div>
                    <div>可读性: {Math.round(consistencyCheck.typographyConsistency.readabilityScore * 100)}%</div>
                    <div>字体配对: {Math.round(consistencyCheck.typographyConsistency.fontPairingScore * 100)}%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 所有主题 */}
        <Card className="all-themes">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <CardTitle>所有主题</CardTitle>
                <Badge variant="secondary">{themes.length}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {themes.map((theme) => (
                <Card
                  key={theme.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    currentTheme === theme.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{theme.name}</CardTitle>
                      <div className="flex items-center space-x-1">
                        {theme.supportsDarkMode && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="outline">
                                  <Moon className="h-3 w-3" />
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">支持深色模式</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {theme.supportsResponsive && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="outline">
                                  <Monitor className="h-3 w-3" />
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">支持响应式设计</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {theme.category}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-xs mt-1">
                      {theme.description}
                    </CardDescription>
                  </CardHeader>


                  <CardContent className="pt-0">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant={currentTheme === theme.id ? "default" : "outline"}
                        onClick={() => handleThemeSelect(theme.id)}
                        className="flex-1"
                      >
                        {currentTheme === theme.id ? '当前主题' : '应用主题'}
                      </Button>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleExportTheme(theme)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">导出主题配置</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleShareTheme(theme)}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">分享主题</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ThemeSelectorEnhanced;