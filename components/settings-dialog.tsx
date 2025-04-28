"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAgent } from "@/context/agent-context"
import { Settings, Globe, AlertCircle } from "lucide-react"
import { useLanguage } from "@/context/language-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Language } from "@/lib/i18n/translations"
import { validateApiEndpoint, validateApiKey, validateAppId } from "@/lib/security"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Update the SettingsDialog component to hide API settings for regular users
export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { selectedAgent, updateAgentConfig } = useAgent()
  const { t, language, setLanguage, availableLanguages } = useLanguage()

  const [apiEndpoint, setApiEndpoint] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [appId, setAppId] = useState("")
  const [activeTab, setActiveTab] = useState("language") // Default to language tab instead of API
  const [isAdmin, setIsAdmin] = useState(false)
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

  // 新增：验证状态
  const [endpointError, setEndpointError] = useState<string | null>(null)
  const [apiKeyError, setApiKeyError] = useState<string | null>(null)
  const [appIdError, setAppIdError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is admin
    const adminLoggedIn = localStorage.getItem("adminLoggedIn") === "true"
    setIsAdmin(adminLoggedIn)

    if (selectedAgent) {
      // 确保API端点正确设置为v1/chat/completions
      setApiEndpoint("https://zktecoaihub.com/api/v1/chat/completions")
      setApiKey(selectedAgent.apiKey || "")
      setAppId(selectedAgent.appId || "")
    }
  }, [selectedAgent, open])

  // 新增：验证输入
  const validateInputs = () => {
    let isValid = true

    // 验证API端点
    if (!validateApiEndpoint(apiEndpoint)) {
      setEndpointError(t("validUrlRequired"))
      isValid = false
    } else {
      setEndpointError(null)
    }

    // 验证API密钥
    if (apiKey && !validateApiKey(apiKey)) {
      setApiKeyError(t("invalidApiKeyFormat"))
      isValid = false
    } else {
      setApiKeyError(null)
    }

    // 验证AppID
    if (appId && !validateAppId(appId)) {
      setAppIdError(t("invalidAppIdFormat"))
      isValid = false
    } else {
      setAppIdError(null)
    }

    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Only allow API configuration for admins
    if (isAdmin && activeTab === "api") {
      // 验证输入
      if (!validateInputs()) {
        return
      }

      updateAgentConfig({
        apiEndpoint,
        apiKey,
        appId,
      })
    }

    // 保存语音输入开关和ASR服务类型
    localStorage.setItem('voiceInputEnabled', voiceInputEnabled ? 'true' : 'false')
    localStorage.setItem('asrProvider', asrProvider)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              {t("settings")}
            </DialogTitle>
            <DialogDescription>
              {selectedAgent?.name} {t("settings")}
            </DialogDescription>
            <div className="mt-2 text-sm text-red-500">{!selectedAgent?.apiKey && t("configIncomplete")}</div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-2">
              {isAdmin && <TabsTrigger value="api">{t("apiSettings")}</TabsTrigger>}
              <TabsTrigger value="language" className={isAdmin ? "" : "col-span-2"}>
                {t("languageSettings")}
              </TabsTrigger>
            </TabsList>

            {isAdmin && (
              <TabsContent value="api" className="space-y-4 mt-4">
                <div className="grid gap-2">
                  <label htmlFor="apiEndpoint" className="text-sm font-medium">
                    {t("apiEndpoint")}
                  </label>
                  <Input
                    id="apiEndpoint"
                    value={apiEndpoint}
                    onChange={(e) => {
                      setApiEndpoint(e.target.value)
                      setEndpointError(null) // 清除错误
                    }}
                    placeholder="https://zktecoaihub.com/api"
                    required
                    className="border-pantone369-200 dark:border-pantone369-800/30 focus:border-pantone369-500 focus:ring-pantone369-500/20"
                    disabled={true} // 禁用输入框，防止用户修改
                  />
                  {endpointError && <p className="text-xs text-red-500">{endpointError}</p>}
                </div>

                <div className="grid gap-2">
                  <label htmlFor="apiKey" className="text-sm font-medium">
                    {t("apiKey")}
                  </label>
                  <Input
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value)
                      setApiKeyError(null) // 清除错误
                    }}
                    placeholder="fastgpt-xxxx"
                    required
                    type="password"
                    className={apiKeyError ? "border-red-500" : ""}
                  />
                  {apiKeyError && <p className="text-xs text-red-500">{apiKeyError}</p>}
                </div>

                <div className="grid gap-2">
                  <label htmlFor="appId" className="text-sm font-medium">
                    {t("appId")}
                  </label>
                  <Input
                    id="appId"
                    value={appId}
                    onChange={(e) => {
                      setAppId(e.target.value)
                      setAppIdError(null) // 清除错误
                    }}
                    placeholder="c-xxxxxxxxxxxxxxxx"
                    required
                    className={appIdError ? "border-red-500" : ""}
                  />
                  {appIdError && <p className="text-xs text-red-500">{appIdError}</p>}
                </div>

                <div className="grid gap-2">
                  <label htmlFor="voiceInput" className="text-sm font-medium flex items-center gap-2">
                    语音输入
                    <Switch
                      id="voiceInput"
                      checked={voiceInputEnabled}
                      onCheckedChange={setVoiceInputEnabled}
                    />
                  </label>
                  <p className="text-xs text-gray-500">开启后，用户可通过语音输入与智能体对话</p>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="asrProvider" className="text-sm font-medium flex items-center gap-2">
                    语音识别服务
                    <select
                      id="asrProvider"
                      value={asrProvider}
                      onChange={e => setAsrProvider(e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="aliyun">阿里云</option>
                      <option value="siliconbase">硅基流动</option>
                    </select>
                  </label>
                  <p className="text-xs text-gray-500">选择语音识别服务厂商</p>
                </div>

                {/* 新增：安全提示 */}
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <AlertTitle>{t("securityTip")}</AlertTitle>
                  <AlertDescription className="text-xs">{t("apiKeySecurity")}</AlertDescription>
                </Alert>
              </TabsContent>
            )}

            <TabsContent value="language" className="space-y-4 mt-4">
              <div className="grid gap-2">
                <label htmlFor="language" className="text-sm font-medium">
                  {t("selectLanguage")}
                </label>
                <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("selectLanguage")} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(availableLanguages).map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>{name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit">{t("save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
