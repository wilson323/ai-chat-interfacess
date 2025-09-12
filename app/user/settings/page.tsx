"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { 
  Settings, 
  User, 
  Globe, 
  Mic, 
  Palette, 
  Bell,
  Shield,
  ArrowLeft
} from 'lucide-react'
import { useLanguage } from '@/context/language-context'
import { useAgent } from '@/context/agent-context'
import { useRouter } from 'next/navigation'
import type { Language } from '@/lib/i18n/translations'

export default function UserSettingsPage() {
  const router = useRouter()
  const { t, language, setLanguage, availableLanguages } = useLanguage()
  const { selectedAgent } = useAgent()
  
  // 用户偏好设置
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('voiceInputEnabled') !== 'false'
    }
    return true
  })
  
  const [asrProvider, setAsrProvider] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('asrProvider') || 'aliyun'
    }
    return 'aliyun'
  })
  
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'system'
    }
    return 'system'
  })
  
  const [notifications, setNotifications] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('notifications') !== 'false'
    }
    return true
  })
  
  const [autoSave, setAutoSave] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('autoSave') !== 'false'
    }
    return true
  })

  // 保存设置到localStorage
  const saveSetting = (key: string, value: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value.toString())
    }
  }

  // 处理语言切换
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    saveSetting('language', newLanguage)
  }

  // 处理语音输入设置
  const handleVoiceInputToggle = (enabled: boolean) => {
    setVoiceInputEnabled(enabled)
    saveSetting('voiceInputEnabled', enabled)
  }

  // 处理ASR提供商切换
  const handleAsrProviderChange = (provider: string) => {
    setAsrProvider(provider)
    saveSetting('asrProvider', provider)
  }

  // 处理主题切换
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    saveSetting('theme', newTheme)
    
    // 应用主题
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      if (newTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        root.classList.add(systemTheme)
      } else {
        root.classList.add(newTheme)
      }
    }
  }

  // 处理通知设置
  const handleNotificationsToggle = (enabled: boolean) => {
    setNotifications(enabled)
    saveSetting('notifications', enabled)
  }

  // 处理自动保存设置
  const handleAutoSaveToggle = (enabled: boolean) => {
    setAutoSave(enabled)
    saveSetting('autoSave', enabled)
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* 页面头部 */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">用户设置</h1>
          <p className="text-gray-600 mt-1">管理您的个人偏好和系统设置</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">常规</TabsTrigger>
          <TabsTrigger value="voice">语音</TabsTrigger>
          <TabsTrigger value="appearance">外观</TabsTrigger>
          <TabsTrigger value="privacy">隐私</TabsTrigger>
        </TabsList>

        {/* 常规设置 */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">界面语言</Label>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLanguages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="current-agent">当前智能体</Label>
                  <Input 
                    value={selectedAgent?.name || '未选择'} 
                    disabled 
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                通知设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">启用通知</Label>
                  <p className="text-sm text-gray-600">接收系统通知和更新提醒</p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={handleNotificationsToggle}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-save">自动保存</Label>
                  <p className="text-sm text-gray-600">自动保存对话和设置</p>
                </div>
                <Switch
                  id="auto-save"
                  checked={autoSave}
                  onCheckedChange={handleAutoSaveToggle}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 语音设置 */}
        <TabsContent value="voice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                语音输入设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="voice-input">启用语音输入</Label>
                  <p className="text-sm text-gray-600">允许使用语音进行输入</p>
                </div>
                <Switch
                  id="voice-input"
                  checked={voiceInputEnabled}
                  onCheckedChange={handleVoiceInputToggle}
                />
              </div>
              
              {voiceInputEnabled && (
                <div>
                  <Label htmlFor="asr-provider">语音识别提供商</Label>
                  <Select value={asrProvider} onValueChange={handleAsrProviderChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aliyun">阿里云</SelectItem>
                      <SelectItem value="baidu">百度</SelectItem>
                      <SelectItem value="tencent">腾讯云</SelectItem>
                      <SelectItem value="azure">Azure</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600 mt-1">
                    选择语音识别服务提供商
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 外观设置 */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                主题设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">主题模式</Label>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">浅色模式</SelectItem>
                    <SelectItem value="dark">深色模式</SelectItem>
                    <SelectItem value="system">跟随系统</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-1">
                  选择您喜欢的主题模式
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 隐私设置 */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                隐私与安全
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">数据使用</h4>
                <p className="text-sm text-gray-600">
                  您的对话数据仅用于提供更好的服务体验，我们不会将您的数据用于其他用途。
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">数据存储</h4>
                <p className="text-sm text-gray-600">
                  对话历史记录将安全存储在本地，您可以随时清除。
                </p>
              </div>
              
              <div className="pt-4">
                <Button variant="outline" className="w-full">
                  清除所有数据
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  此操作将清除所有本地存储的数据，包括对话历史
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 保存按钮 */}
      <div className="flex justify-end mt-6">
        <Button size="lg">
          保存设置
        </Button>
      </div>
    </div>
  )
}