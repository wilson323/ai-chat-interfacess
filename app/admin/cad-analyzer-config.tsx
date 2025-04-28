"use client"
import { useEffect, useState } from "react"
import { CadAnalyzerConfig, CadAnalyzerModelConfig } from "@/types/api/agent-config/cad-analyzer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog } from "@/components/ui/dialog"

export default function CadAnalyzerConfigPage() {
  const [config, setConfig] = useState<CadAnalyzerConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [showTestDialog, setShowTestDialog] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch("/api/admin/cad-analyzer-config")
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(e => setError("加载配置失败"))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch("/api/admin/cad-analyzer-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      })
      if (!res.ok) throw new Error("保存失败")
      setSuccess(true)
    } catch (e) {
      setError("保存失败")
    } finally {
      setSaving(false)
    }
  }

  const handleTestModel = async (model: any) => {
    const res = await fetch("/api/admin/cad-analyzer-config/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model })
    })
    const data = await res.json()
    setTestResult(data.success ? "连通性正常" : `连通性异常：${data.error}`)
    setShowTestDialog(true)
  }

  const handleRestoreDefault = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/cad-analyzer-config/default")
      const data = await res.json()
      setConfig(data)
    } catch {
      setError("恢复默认配置失败")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>加载中...</div>
  if (!config) return <div>未加载到配置</div>

  // 动态表单渲染
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">CAD 智能体配置</h2>
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
        <label className="block font-medium mb-1">最大文件大小(MB)</label>
        <Input type="number" value={config.maxFileSizeMB || 0} onChange={e => setConfig({ ...config, maxFileSizeMB: Number(e.target.value) })} />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">支持的文件格式(逗号分隔)</label>
        <Input value={config.supportedFormats?.join(",") || ""} onChange={e => setConfig({ ...config, supportedFormats: e.target.value.split(",") })} />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">分析参数</label>
        <div className="flex gap-2 mb-1">
          <Input placeholder="精度" value={config.analysisParams?.precision || ""} onChange={e => setConfig({ ...config, analysisParams: { ...config.analysisParams, precision: e.target.value } })} />
          <Input placeholder="超时时间(秒)" type="number" value={config.analysisParams?.timeoutSec || 0} onChange={e => setConfig({ ...config, analysisParams: { ...config.analysisParams, timeoutSec: Number(e.target.value) } })} />
          <Input placeholder="最大页数" type="number" value={config.analysisParams?.maxPages || 0} onChange={e => setConfig({ ...config, analysisParams: { ...config.analysisParams, maxPages: Number(e.target.value) } })} />
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
      <Button onClick={handleRestoreDefault} className="mb-4">恢复默认配置</Button>
      <Button onClick={handleSave} disabled={saving}>{saving ? "保存中..." : "保存配置"}</Button>
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <div className="p-4">{testResult}</div>
      </Dialog>
    </div>
  )
} 