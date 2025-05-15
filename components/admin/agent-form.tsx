"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAgent } from "@/context/agent-context"
import { Bot, Save, Trash2, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/context/language-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { updateAgent, deleteAgent } from "@/lib/services/admin-agent-service"

// 1. props 定义
export interface AgentFormProps {
  agent?: any;
  onSave: (agentData: any) => void;
  onClose: () => void;
}

export function AgentForm({ agent, onSave, onClose }: AgentFormProps) {
  const { t } = useLanguage()
  const formRef = useRef<HTMLFormElement>(null)
  const { toast } = useToast()

  // 2. 初始化表单状态
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [apiUrl, setApiUrl] = useState("https://zktecoaihub.com/api/v1/chat/completions") // API端点
  const [apiKey, setApiKey] = useState("")
  const [appId, setAppId] = useState("")
  const [model, setModel] = useState("qwen-max")
  const [isPublished, setIsPublished] = useState(false)
  // 根据agent的类型设置初始类型，如果是新建则使用"fastgpt"
  const [type] = useState<import("@/types/agent").AgentType>(agent?.type || "fastgpt")
  const [activeTab, setActiveTab] = useState("basic")
  const [multimodalModel, setMultimodalModel] = useState("qwen-vl-max")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(2000)
  const [supportsFileUpload, setSupportsFileUpload] = useState(true)
  const [supportsImageUpload, setSupportsImageUpload] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [order, setOrder] = useState<number>(agent?.order ?? 100)
  const [supportsStream, setSupportsStream] = useState(true)
  const [supportsDetail, setSupportsDetail] = useState(true)

  useEffect(() => {
    if (agent) {
      console.log("Agent loaded:", agent.name, "Type:", agent.type);
      setName(agent.name || "")
      setDescription(agent.description || "")
      setApiUrl(agent.apiUrl || "https://zktecoaihub.com/api/v1/chat/completions")
      setApiKey(agent.apiKey || "")
      setAppId(agent.appId || "")
      setIsPublished(agent.isPublished || false)
      setMultimodalModel(agent.multimodalModel || "qwen-vl-max")
      setSystemPrompt(agent.systemPrompt || "")
      setTemperature(agent.temperature ?? 0.7)
      setMaxTokens(agent.maxTokens ?? 2000)
      setSupportsFileUpload(agent.supportsFileUpload !== undefined ? agent.supportsFileUpload : true)
      setSupportsImageUpload(agent.supportsImageUpload !== undefined ? agent.supportsImageUpload : true)
      setOrder(agent.order ?? 100)
      setSupportsStream(agent.supportsStream !== undefined ? agent.supportsStream : true)
      setSupportsDetail(agent.supportsDetail !== undefined ? agent.supportsDetail : true)
    } else {
      setName("")
      setDescription("")
      setApiUrl("https://zktecoaihub.com/api/v1/chat/completions")
      setApiKey("")
      setAppId("")
      setIsPublished(false)
      setMultimodalModel("qwen-vl-max")
      setSystemPrompt("")
      setTemperature(0.7)
      setMaxTokens(2000)
      setSupportsFileUpload(true)
      setSupportsImageUpload(true)
      setOrder(100)
      setSupportsStream(true)
      setSupportsDetail(true)
    }
  }, [agent])

  // 验证API端点的有效性
  const validateApiEndpoint = (endpoint: string): boolean => {
    try {
      const url = new URL(endpoint);
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch (e) {
      return false;
    }
  }

  // 3. handleSubmit 支持新增和编辑
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (type === 'fastgpt' && (!apiKey || !appId)) {
      toast({ title: "保存失败", description: "API Key 和 App ID 必填", variant: "destructive" });
      return;
    }

    // 验证CAD智能体的API端点
    if (agent?.type === 'cad-analyzer' && !validateApiEndpoint(apiUrl)) {
      toast({
        title: "API端点格式错误",
        description: "请输入有效的URL地址，以http://或https://开头",
        variant: "destructive"
      });
      return;
    }

    // 如果CAD智能体的API端点被修改，显示确认对话框
    if (agent?.type === 'cad-analyzer' &&
        apiUrl !== "https://zktecoaihub.com/api/v1/chat/completions" &&
        apiUrl !== agent?.apiUrl) {
      if (!window.confirm("您已修改CAD智能体的API端点，这可能会影响用户界面的功能。确定要保存吗？")) {
        return;
      }
    }

    setIsSaving(true)
    try {
      // 确保使用正确的type值，如果是编辑现有智能体，优先使用agent.type
      const agentType = agent?.type || type;
      console.log("保存智能体，使用类型:", agentType, "原始类型:", agent?.type, "表单类型:", type);

      const agentData = {
        name: name || "默认智能体",
        description: description || "",
        apiUrl: apiUrl || "https://zktecoaihub.com/api/v1/chat/completions",
        apiKey: apiKey || "",
        appId: appId || "",
        isPublished,
        type: agentType, // 使用确定的类型
        systemPrompt: systemPrompt || "",
        temperature: temperature ?? 0.7,
        maxTokens: maxTokens ?? 2000,
        supportsFileUpload,
        supportsImageUpload,
        supportsStream: true, // 强制为 true
        supportsDetail: true, // 强制为 true
        ...(agentType === "image-editor" || agentType === "cad-analyzer" ? { multimodalModel: multimodalModel || "qwen-vl-max" } : {}),
        order: Number(order) || 100,
      }
      await onSave(agentData)
    } catch (err) {
      toast({ title: "保存失败", description: String(err), variant: "destructive" });
    } finally {
      setIsSaving(false)
    }
  }

  // 添加直接保存方法，不依赖表单提交
  const handleSaveClick = () => {
    console.log("Save button clicked")
    if (formRef.current) {
      formRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
    } else {
      // 如果表单引用不可用，直接调用handleSubmit
      handleSubmit({ preventDefault: () => {} } as React.FormEvent)
    }
  }

  const handleDelete = async () => {
    if (!agent) return;
    if (window.confirm(`${t("confirmDelete")} ${agent.name}?`)) {
      try {
        await deleteAgent(agent.id);
        toast({ title: t("agentDeleted"), description: `${agent.name} ${t("agentDeleted")}.`, variant: "destructive" });
        // 兼容未选中状态
        if (typeof onSave === 'function') onSave(undefined as any);
      } catch (error) {
        toast({ title: "错误", description: "删除智能体失败", variant: "destructive" });
      }
    }
  };

  if (!agent) {
    return (
      <Card className="h-full flex items-center justify-center min-h-[500px] border-pantone369-100 dark:border-pantone369-900/30">
        <CardContent className="text-center p-6">
          <Bot className="h-12 w-12 text-pantone369-500/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">{t("noAgentSelected")}</h3>
          <p className="text-muted-foreground">{t("selectAgentToEdit")}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-pantone369-100 dark:border-pantone369-900/30 h-full flex flex-col max-h-[90vh]">
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col h-full">
        <CardHeader className="bg-pantone369-50/50 dark:bg-pantone369-900/10 flex flex-row items-center justify-between">
          <div className="flex items-center gap-4 w-full">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-pantone369-500" />
              {agent ? t("editAgent") : t("newAgent")}
            </CardTitle>
            <div className="flex items-center gap-2 ml-auto">
              <Label htmlFor="isPublished" className="text-xs">{isPublished ? t("published") : t("draft")}</Label>
              <Switch id="isPublished" checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
          </div>
          <Button type="button" variant="ghost" onClick={onClose}>关闭</Button>
        </CardHeader>
        <CardContent className="space-y-4 p-6 flex-1 overflow-y-auto min-h-0">
          <Alert className="bg-pantone369-50/50 dark:bg-pantone369-900/10 border-pantone369-200 dark:border-pantone369-800/30">
            <AlertCircle className="h-4 w-4 text-pantone369-500" />
            <AlertTitle>{t("fastGPTConfiguration")}</AlertTitle>
            <AlertDescription>{t("fastGPTConfigurationDescription")}</AlertDescription>
          </Alert>

          <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-4 bg-pantone369-50 dark:bg-pantone369-900/20">
              <TabsTrigger
                value="basic"
                className="data-[state=active]:bg-pantone369-100 dark:data-[state=active]:bg-pantone369-800/30"
              >
                {t("basicSettings")}
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="data-[state=active]:bg-pantone369-100 dark:data-[state=active]:bg-pantone369-800/30"
              >
                {t("advancedSettings")}
              </TabsTrigger>
              <TabsTrigger
                value="model"
                className="data-[state=active]:bg-pantone369-100 dark:data-[state=active]:bg-pantone369-800/30"
              >
                {t("modelSettings")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-md bg-pantone369-50/50 dark:bg-pantone369-900/10">
                <Label htmlFor="published" className="flex items-center gap-2 font-medium">
                  {t("publishedStatus")}
                </Label>
                <div className="flex items-center gap-2">
                  <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
                  <span className="text-sm text-muted-foreground">{isPublished ? t("published") : t("draft")}</span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name" className="text-pantone369-700 dark:text-pantone369-300">
                  {t("agentName")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Customer Support Bot"
                  required
                  className="border-pantone369-200 dark:border-pantone369-800/30 focus:border-pantone369-500 focus:ring-pantone369-500/20"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className="text-pantone369-700 dark:text-pantone369-300">
                  {t("description")}
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("agentDescriptionPlaceholder")}
                  rows={3}
                  className="border-pantone369-200 dark:border-pantone369-800/30 focus:border-pantone369-500 focus:ring-pantone369-500/20"
                />
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="apiUrl" className="text-pantone369-700 dark:text-pantone369-300">
                  {t("apiEndpoint")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="apiUrl"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://zktecoaihub.com/api/v1/chat/completions"
                  required
                  className="border-pantone369-200 dark:border-pantone369-800/30 focus:border-pantone369-500 focus:ring-pantone369-500/20"
                  disabled={agent?.type !== 'cad-analyzer'} // 只允许CAD智能体修改API端点
                />
                {agent?.type === 'cad-analyzer' && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={async () => {
                      if (!validateApiEndpoint(apiUrl)) {
                        toast({
                          title: "API端点格式错误",
                          description: "请输入有效的URL地址，以http://或https://开头",
                          variant: "destructive"
                        });
                        return;
                      }

                      try {
                        toast({ title: "正在测试API端点...", description: "请稍候" });
                        const response = await fetch("/api/chat-proxy", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            targetUrl: apiUrl,
                            method: "GET",
                            headers: {
                              "Content-Type": "application/json",
                              "Authorization": `Bearer ${apiKey || "test-key"}`
                            }
                          })
                        });

                        if (response.ok) {
                          toast({
                            title: "API端点测试成功",
                            description: "连接正常，可以保存设置",
                            variant: "default"
                          });
                        } else {
                          toast({
                            title: "API端点测试失败",
                            description: `HTTP状态码: ${response.status}`,
                            variant: "destructive"
                          });
                        }
                      } catch (error) {
                        toast({
                          title: "API端点测试失败",
                          description: String(error),
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    测试API端点
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">
                  {agent?.type === 'cad-analyzer'
                    ? "注意：修改API端点可能会影响CAD智能体的功能，请确保输入正确的API端点。建议使用默认值：https://zktecoaihub.com/api/v1/chat/completions"
                    : t("apiEndpointDescription")}
                </p>
                {agent?.type === 'cad-analyzer' && apiUrl !== "https://zktecoaihub.com/api/v1/chat/completions" && (
                  <p className="text-xs text-amber-500 mt-1">
                    警告：您已修改默认API端点，这可能会影响CAD智能体的功能。请确保新的API端点支持相同的请求格式。
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="apiKey" className="text-pantone369-700 dark:text-pantone369-300">
                  {t("apiKey")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="fastgpt-xxxx"
                  type="password"
                  required
                  className="border-pantone369-200 dark:border-pantone369-800/30 focus:border-pantone369-500 focus:ring-pantone369-500/20"
                />
                <p className="text-xs text-muted-foreground">{t("apiKeyDescription")}</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="appId" className="text-pantone369-700 dark:text-pantone369-300">
                  {t("appId")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="appId"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="c-xxxxxxxxxxxxxxxx"
                  className="border-pantone369-200 dark:border-pantone369-800/30 focus:border-pantone369-500 focus:ring-pantone369-500/20"
                  required
                />
                <p className="text-xs text-muted-foreground">{t("appIdDescription")}</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-md bg-pantone369-50/50 dark:bg-pantone369-900/10">
                <Label htmlFor="supportsFileUpload" className="flex items-center gap-2 font-medium">
                  <span>允许文件上传</span>
                  <Switch
                    id="supportsFileUpload"
                    checked={supportsFileUpload}
                    onCheckedChange={setSupportsFileUpload}
                    className="ml-2"
                  />
                  <span className="text-sm text-muted-foreground">{supportsFileUpload ? "已启用" : "已禁用"}</span>
                </Label>
                <Label htmlFor="supportsImageUpload" className="flex items-center gap-2 font-medium">
                  <span>允许图片上传</span>
                  <Switch
                    id="supportsImageUpload"
                    checked={supportsImageUpload}
                    onCheckedChange={setSupportsImageUpload}
                    className="ml-2"
                  />
                  <span className="text-sm text-muted-foreground">{supportsImageUpload ? "已启用" : "已禁用"}</span>
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">启用后，用户可以向此智能体上传文件和图片</p>

              <div className="grid gap-2">
                <Label htmlFor="systemPrompt" className="text-pantone369-700 dark:text-pantone369-300">
                  开场白
                </Label>
                <Textarea
                  id="systemPrompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="设置智能体的开场白，定义其初始问候..."
                  rows={5}
                  className="border-pantone369-200 dark:border-pantone369-800/30 focus:border-pantone369-500 focus:ring-pantone369-500/20"
                />
                <p className="text-xs text-muted-foreground">定义智能体的初始问候语</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="order" className="text-pantone369-700 dark:text-pantone369-300">
                  排序权重 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="order"
                  type="number"
                  min={1}
                  step={1}
                  value={order}
                  onChange={e => setOrder(Number(e.target.value))}
                  required
                  className="border-pantone369-200 dark:border-pantone369-800/30 focus:border-pantone369-500 focus:ring-pantone369-500/20"
                  placeholder="数值越小越靠前，默认100"
                />
                <p className="text-xs text-muted-foreground">用于控制智能体在列表中的显示顺序，数值越小越靠前</p>
              </div>
            </TabsContent>

            <TabsContent value="model" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="temperature" className="text-pantone369-700 dark:text-pantone369-300">
                  {t("temperature")}: {temperature.toFixed(1)}
                </Label>
                <Slider
                  id="temperature"
                  min={0}
                  max={2}
                  step={0.1}
                  value={[temperature]}
                  onValueChange={(value) => setTemperature(value[0])}
                  className="py-4"
                />
                <p className="text-xs text-muted-foreground">{t("temperatureDescription")}</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="maxTokens" className="text-pantone369-700 dark:text-pantone369-300">
                  {t("maxTokens")}: {maxTokens} {type !== "fastgpt" && <span className="text-red-500">*</span>}
                </Label>
                <Slider
                  id="maxTokens"
                  min={100}
                  max={8000}
                  step={100}
                  value={[maxTokens]}
                  onValueChange={(value) => setMaxTokens(value[0])}
                  className="py-4"
                  disabled={type === "fastgpt"}
                />
                <p className="text-xs text-muted-foreground">{t("maxTokensDescription")}</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4 mt-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">支持流式</label>
              <span className="inline-block px-2 py-1 rounded bg-muted text-xs">{String(supportsStream ?? true)}</span>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">支持详细</label>
              <span className="inline-block px-2 py-1 rounded bg-muted text-xs">{String(supportsDetail ?? true)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 mt-6">
          {agent && (
            <Button variant="destructive" type="button" onClick={handleDelete}>删除</Button>
          )}
          <Button type="submit" disabled={isSaving}>{isSaving ? "保存中..." : "保存"}</Button>
          <Button type="button" variant="outline" onClick={onClose}>关闭</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
