/**
 * 主题演示页面
 * 展示所有主题效果和Lovart资源
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { useTheme, useLovartResources } from '@/lib/theme';
import { ThemeGrid, ThemeDetails } from '@/components/theme/theme-preview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Layers, Eye } from 'lucide-react';

export default function ThemeDemoPage() {
  const { currentTheme, themes, switchTheme } = useTheme();
  const { getResourceStats, getResourcesByCategory, getRandomResource } = useLovartResources();

  const stats = getResourceStats();
  const randomIcon = getRandomResource('icons');
  const randomIllustration = getRandomResource('illustrations');
  const randomBackground = getRandomResource('backgrounds');

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <Palette className="h-10 w-10 text-primary" />
          Lovart主题演示
        </h1>
        <p className="text-lg text-muted-foreground">
          体验基于Lovart设计的完整主题系统，感受熵基绿带来的视觉魅力
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="themes">主题展示</TabsTrigger>
          <TabsTrigger value="resources">资源展示</TabsTrigger>
          <TabsTrigger value="interactive">交互体验</TabsTrigger>
        </TabsList>

        {/* 概览标签页 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 当前主题信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  当前主题
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full border"
                      style={{ backgroundColor: currentTheme.colors.primary }}
                    />
                    <div>
                      <h3 className="font-semibold">{currentTheme.name}</h3>
                      <p className="text-sm text-muted-foreground">{currentTheme.category}</p>
                    </div>
                  </div>
                  <p className="text-sm">{currentTheme.description}</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">{currentTheme.category}</Badge>
                    <Badge variant="secondary">熵基绿</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 主题统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  主题统计
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>总主题数</span>
                    <Badge variant="secondary">{themes.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>资源总数</span>
                    <Badge variant="secondary">{stats.total}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>当前主题资源</span>
                    <Badge variant="default">
                      {Object.values(currentTheme.lovartResources || {}).reduce((sum, arr) => sum + (arr?.length || 0), 0)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 快速操作 */}
            <Card>
              <CardHeader>
                <CardTitle>快速操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => switchTheme('modern')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  切换到现代主题
                </Button>
                <Button
                  onClick={() => switchTheme('business')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  切换到商务主题
                </Button>
                <Button
                  onClick={() => switchTheme('tech')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  切换到科技主题
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 当前主题详情 */}
          <Card>
            <CardHeader>
              <CardTitle>当前主题详情</CardTitle>
              <CardDescription>查看当前主题的完整配置信息</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeDetails theme={currentTheme} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 主题展示标签页 */}
        <TabsContent value="themes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>所有主题</CardTitle>
              <CardDescription>点击任意主题卡片即可切换</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeGrid
                themes={themes}
                selectedThemeId={currentTheme.id}
                onThemeSelect={switchTheme}
                showResources={true}
                size="lg"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 资源展示标签页 */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 随机资源展示 */}
            <Card>
              <CardHeader>
                <CardTitle>随机资源展示</CardTitle>
                <CardDescription>当前主题的随机Lovart资源</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {randomIcon && (
                  <div>
                    <h4 className="font-medium mb-2">随机图标</h4>
                    <div className="w-16 h-16 border rounded-lg flex items-center justify-center bg-muted">
                      <Image src={randomIcon} alt="随机图标" width={48} height={48} className="object-contain" />
                    </div>
                  </div>
                )}

                {randomIllustration && (
                  <div>
                    <h4 className="font-medium mb-2">随机插画</h4>
                    <div className="w-full h-32 border rounded-lg overflow-hidden relative">
                      <Image
                        src={randomIllustration}
                        alt="随机插画"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                )}

                {randomBackground && (
                  <div>
                    <h4 className="font-medium mb-2">随机背景</h4>
                    <div className="w-full h-24 border rounded-lg overflow-hidden relative">
                      <Image
                        src={randomBackground}
                        alt="随机背景"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 资源统计 */}
            <Card>
              <CardHeader>
                <CardTitle>资源统计</CardTitle>
                <CardDescription>当前主题的Lovart资源分布</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.byCategory).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="capitalize">{category}</span>
                      <Badge variant="outline">{String(count)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 按类别展示资源 */}
          <Card>
            <CardHeader>
              <CardTitle>按类别展示资源</CardTitle>
              <CardDescription>查看当前主题的所有Lovart资源</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(getResourcesByCategory).map(([category, resources]) => (
                  <div key={category} className="space-y-3">
                    <h4 className="font-medium capitalize">{category}</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {(resources as string[]).slice(0, 8).map((resource: string, index: number) => (
                        <div key={index} className="aspect-square border rounded-lg overflow-hidden relative">
                          <Image
                            src={resource}
                            alt={`${category} ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 33vw"
                          />
                        </div>
                      ))}
                    </div>
                    {(resources as string[]).length > 8 && (
                      <p className="text-sm text-muted-foreground">
                        还有 {(resources as string[]).length - 8} 个资源...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 交互体验标签页 */}
        <TabsContent value="interactive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>交互体验</CardTitle>
              <CardDescription>体验不同主题下的UI组件效果</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 按钮展示 */}
              <div>
                <h4 className="font-medium mb-3">按钮样式</h4>
                <div className="flex flex-wrap gap-3">
                  <Button>主要按钮</Button>
                  <Button variant="secondary">次要按钮</Button>
                  <Button variant="outline">轮廓按钮</Button>
                  <Button variant="ghost">幽灵按钮</Button>
                  <Button variant="destructive">危险按钮</Button>
                </div>
              </div>

              {/* 卡片展示 */}
              <div>
                <h4 className="font-medium mb-3">卡片样式</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>示例卡片</CardTitle>
                      <CardDescription>展示当前主题的卡片样式</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>这是卡片内容，展示了当前主题的文本颜色和背景效果。</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>另一个卡片</CardTitle>
                      <CardDescription>更多样式展示</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Badge>标签</Badge>
                        <Badge variant="secondary">次要标签</Badge>
                        <Badge variant="outline">轮廓标签</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* 表单元素展示 */}
              <div>
                <h4 className="font-medium mb-3">表单元素</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <input
                      id="themeDemoInput"
                      name="themeDemoInput"
                      type="text"
                      placeholder="输入框示例"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                    <select id="themeDemoSelect" name="themeDemoSelect" className="w-full px-3 py-2 border rounded-md">
                      <option>选择选项</option>
                      <option>选项1</option>
                      <option>选项2</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <textarea
                      id="themeDemoTextarea"
                      name="themeDemoTextarea"
                      placeholder="文本域示例"
                      className="w-full px-3 py-2 border rounded-md h-20"
                    />
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="checkbox" />
                      <label htmlFor="checkbox">复选框示例</label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
