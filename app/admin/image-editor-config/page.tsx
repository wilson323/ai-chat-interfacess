"use client"
import { useEffect, useState } from "react"
import { ImageEditorConfig, ImageEditorModelConfig } from "@/types/api/agent-config/image-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AgentProvider } from "@/context/agent-context"
import { LanguageProvider } from "@/context/language-context"
import { useToast } from "@/components/ui/use-toast"

// 分离出配置表单组件
function ImageEditorConfigForm() {
  const { toast } = useToast()
  const [config, setConfig] = useState<ImageEditorConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [showTestDialog, setShowTestDialog] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch("/api/admin/image-editor-config")
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(e => {
        setError("加载配置失败")
        toast({
          title: "加载失败",
          description: String(e),
          variant: "destructive",
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch("/api/admin/image-editor-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      })
      if (!res.ok) throw new Error("保存失败")
      setSuccess(true)
      toast({
        title: "保存成功",
        description: "图像编辑智能体配置已更新",
      })
    } catch (e) {
      setError("保存失败")
      toast({
        title: "保存失败",
        description: String(e),
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTestModel = async (model: any) => {
    try {
      const res = await fetch("/api/admin/image-editor-config/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model })
      })
      const data = await res.json()
      setTestResult(data.success ? "连通性正常" : `连通性异常：${data.error}`)
      setShowTestDialog(true)
    } catch (e) {
      toast({
        title: "测试失败",
        description: String(e),
        variant: "destructive",
      })
    }
  }

  const handleRestoreDefault = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/image-editor-config/default")
      const data = await res.json()
      setConfig(data)
      toast({
        title: "恢复成功",
        description: "已恢复默认配置",
      })
    } catch (e) {
      setError("恢复默认配置失败")
      toast({
        title: "恢复失败",
        description: String(e),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-8">加载中...</div>
  if (!config) return <div className="text-center py-8">未加载到配置</div>

  // 动态表单渲染
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">图像编辑智能体配置</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">保存成功</div>}
        <div className="mb-4">
          <label className="block font-medium mb-1">启用状态</label>
          <input type="checkbox" checked={config.enabled} onChange={e => setConfig({ ...config, enabled: e.target.checked })} />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">默认模型</label>
          <Input value={config.defaultModel || ""} onChange={e => setConfig({ ...config, defaultModel: e.target.value })} />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">最大图片大小(MB)</label>
          <Input type="number" value={config.maxImageSizeMB || 0} onChange={e => setConfig({ ...config, maxImageSizeMB: Number(e.target.value) })} />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">支持的图片格式(逗号分隔)</label>
          <Input value={config.supportedFormats?.join(",") || ""} onChange={e => setConfig({ ...config, supportedFormats: e.target.value.split(",") })} />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">编辑参数</label>
          <div className="flex gap-2 mb-1">
            <Input placeholder="画笔粗细" type="number" value={config.editParams?.brushSize || 0} onChange={e => setConfig({ ...config, editParams: { ...config.editParams, brushSize: Number(e.target.value) } })} />
            <Input placeholder="标记颜色" value={config.editParams?.markerColor || ""} onChange={e => setConfig({ ...config, editParams: { ...config.editParams, markerColor: e.target.value } })} />
            <Input placeholder="最大编辑步数" type="number" value={config.editParams?.maxEditSteps || 0} onChange={e => setConfig({ ...config, editParams: { ...config.editParams, maxEditSteps: Number(e.target.value) } })} />
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">历史保留天数</label>
          <Input type="number" value={config.historyRetentionDays || 0} onChange={e => setConfig({ ...config, historyRetentionDays: Number(e.target.value) })} />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">备注</label>
          <Textarea value={config.description || ""} onChange={e => setConfig({ ...config, description: e.target.value })} />
        </div>
        <div className="mb-6">
          <label className="block font-medium mb-1">模型列表</label>
          {config.models?.map((model, idx) => (
            <div key={idx} className="border p-2 mb-2 rounded">
              <div className="flex gap-2 mb-1">
                <Input placeholder="模型名称" value={model.name} onChange={e => {
                  const models = [...config.models]
                  models[idx].name = e.target.value
                  setConfig({ ...config, models })
                }} />
                <Input placeholder="主密钥" value={model.apiKey} onChange={e => {
                  const models = [...config.models]
                  models[idx].apiKey = e.target.value
                  setConfig({ ...config, models })
                }} />
              </div>
              <div className="mb-1">
                <Input placeholder="备用密钥(逗号分隔)" value={model.backupKeys?.join(",") || ""} onChange={e => {
                  const models = [...config.models]
                  models[idx].backupKeys = e.target.value.split(",")
                  setConfig({ ...config, models })
                }} />
              </div>
              <Button size="sm" onClick={() => handleTestModel(model)} className="mr-2">测试连通性</Button>
              <Button variant="destructive" size="sm" onClick={() => {
                const models = config.models.filter((_, i) => i !== idx)
                setConfig({ ...config, models })
              }}>删除模型</Button>
            </div>
          ))}
          <Button size="sm" onClick={() => {
            setConfig({ ...config, models: [...(config.models || []), { name: "", apiKey: "", backupKeys: [] }] })
          }}>添加模型</Button>
        </div>
        <div className="flex gap-4">
          <Button onClick={handleRestoreDefault} variant="outline" className="mb-4">恢复默认配置</Button>
          <Button onClick={handleSave} disabled={saving} className="mb-4">{saving ? "保存中..." : "保存配置"}</Button>
        </div>
        <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
          <div className="p-4">{testResult}</div>
        </Dialog>
      </CardContent>
    </Card>
  )
}

// 主页面组件
export default function ImageEditorConfigPage() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  if (!ready) {
    // SSR 首屏和 Hydration 前都渲染 loading，保证 HTML 一致
    return <div className="text-center py-8">加载中...</div>
  }

  return (
    <LanguageProvider>
      <AgentProvider>
        <ImageEditorConfigForm />
      </AgentProvider>
    </LanguageProvider>
  )
}
