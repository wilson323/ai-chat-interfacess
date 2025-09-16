/**
 * 主题设置页面
 * 提供完整的主题管理和预览功能
 */

'use client';

import React from 'react';
import { useTheme } from '@/lib/theme';
import { ThemeGrid, ThemeDetails } from '@/components/theme/theme-preview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Palette, Eye, Settings, Download, Upload } from 'lucide-react';

export default function ThemeSettingsPage() {
  const { currentTheme, themes, switchTheme } = useTheme();

  const handleThemeSelect = (themeId: string) => {
    switchTheme(themeId);
  };

  const handleExportTheme = () => {
    const themeData = {
      currentTheme,
      allThemes: themes,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-export-${currentTheme.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const themeData = JSON.parse(e.target?.result as string);
        if (themeData.currentTheme) {
          switchTheme(themeData.currentTheme.id);
        }
      } catch (error) {
        console.error('Failed to import theme:', error);
        alert('主题文件格式错误');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">主题设置</h1>
        <p className="text-muted-foreground">
          自定义您的界面外观，选择最适合您工作风格的主题
        </p>
      </div>

      <Tabs defaultValue="preview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            主题预览
          </TabsTrigger>
          <TabsTrigger value="current" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            当前主题
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            主题管理
          </TabsTrigger>
        </TabsList>

        {/* 主题预览标签页 */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                选择主题
              </CardTitle>
              <CardDescription>
                点击任意主题卡片即可切换到该主题
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeGrid
                themes={themes}
                selectedThemeId={currentTheme.id}
                onThemeSelect={handleThemeSelect}
                showResources={true}
                size="lg"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 当前主题详情标签页 */}
        <TabsContent value="current" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                当前主题详情
              </CardTitle>
              <CardDescription>
                查看当前主题的详细信息和配置
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeDetails theme={currentTheme} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 主题管理标签页 */}
        <TabsContent value="manage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 主题统计 */}
            <Card>
              <CardHeader>
                <CardTitle>主题统计</CardTitle>
                <CardDescription>当前可用的主题资源统计</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>总主题数</span>
                  <Badge variant="secondary">{themes.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>当前主题</span>
                  <Badge variant="default">{currentTheme.name}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>主题分类</span>
                  <Badge variant="outline">{currentTheme.category}</Badge>
                </div>
                {currentTheme.lovartResources && (
                  <div className="pt-2 border-t">
                    <div className="text-sm font-medium mb-2">Lovart资源</div>
                    {Object.entries(currentTheme.lovartResources).map(([category, resources]) => (
                      <div key={category} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{category}</span>
                        <Badge variant="outline">{Array.isArray(resources) ? resources.length : 0}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 主题操作 */}
            <Card>
              <CardHeader>
                <CardTitle>主题操作</CardTitle>
                <CardDescription>导入、导出和管理主题配置</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleExportTheme}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  导出当前主题
                </Button>

                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportTheme}
                    className="hidden"
                    id="import-theme"
                  />
                  <Button
                    asChild
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <label htmlFor="import-theme" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      导入主题文件
                    </label>
                  </Button>
                </div>

                <Button
                  onClick={() => switchTheme('modern')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  重置为默认主题
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 主题列表 */}
          <Card>
            <CardHeader>
              <CardTitle>所有主题</CardTitle>
              <CardDescription>查看所有可用主题的详细信息</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      theme.id === currentTheme.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleThemeSelect(theme.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full border"
                          style={{ backgroundColor: theme.colors.primary }}
                        />
                        <div>
                          <h3 className="font-medium">{theme.name}</h3>
                          <p className="text-sm text-muted-foreground">{theme.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{theme.category}</Badge>
                        {theme.id === currentTheme.id && (
                          <Badge variant="default">当前</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
