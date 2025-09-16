/**
 * 主题选择器组件
 * 提供主题选择和预览功能
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ThemeConfig, ThemeSelectorProps } from '../../types/theme';
import { themeManager } from '../../lib/theme/theme-manager';
import { themeConfigs } from '../../lib/theme/theme-config';
import { ThemeCard } from './theme-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { THEME_CATEGORIES } from '../../types/theme';

export function ThemeSelector({
  themes = themeConfigs,
  currentTheme,
  onThemeChange,
  showPreview = true,
  showDescription = true,
  className = '',
}: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [themesByCategory, setThemesByCategory] = useState<
    Record<string, ThemeConfig[]>
  >({});

  useEffect(() => {
    // 按分类组织主题
    const categorized = themes.reduce(
      (acc, theme) => {
        if (!acc[theme.category]) {
          acc[theme.category] = [];
        }
        acc[theme.category].push(theme);
        return acc;
      },
      {} as Record<string, ThemeConfig[]>
    );

    setThemesByCategory(categorized);
  }, [themes]);

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    onThemeChange(themeId);
  };

  const handleApplyTheme = async () => {
    try {
      await themeManager.switchTheme(selectedTheme);
    } catch (error) {
      console.error('Failed to apply theme:', error);
    }
  };

  const getCategoryName = (category: string) => {
    return (
      THEME_CATEGORIES[category as keyof typeof THEME_CATEGORIES] || category
    );
  };

  return (
    <div className={`theme-selector ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>选择主题</span>
            <Badge variant='outline'>{themes.length} 个主题</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue={Object.keys(themesByCategory)[0]}
            className='w-full'
          >
            <TabsList className='grid w-full grid-cols-5'>
              {Object.keys(themesByCategory).map(category => (
                <TabsTrigger key={category} value={category}>
                  {getCategoryName(category)}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(themesByCategory).map(
              ([category, categoryThemes]) => (
                <TabsContent key={category} value={category} className='mt-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {categoryThemes.map(theme => (
                      <ThemeCard
                        key={theme.id}
                        theme={theme}
                        selected={selectedTheme === theme.id}
                        onClick={() => handleThemeSelect(theme.id)}
                        showPreview={showPreview}
                        showDescription={showDescription}
                      />
                    ))}
                  </div>
                </TabsContent>
              )
            )}
          </Tabs>

          <div className='mt-6 flex justify-end space-x-2'>
            <Button
              variant='outline'
              onClick={() => setSelectedTheme(currentTheme)}
            >
              重置
            </Button>
            <Button
              onClick={handleApplyTheme}
              disabled={selectedTheme === currentTheme}
            >
              应用主题
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
