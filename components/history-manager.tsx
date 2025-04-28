"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Download, Upload, RefreshCw, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/context/language-context"
import {
  clearAllChatSessions,
  exportAllChatSessions,
  importChatSessions,
  getStorageStats,
  rebuildChatIndex,
} from "@/lib/storage/index"

interface HistoryManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onHistoryUpdated?: () => void
}

export function HistoryManager({ open, onOpenChange, onHistoryUpdated }: HistoryManagerProps) {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("manage")
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [storageStats, setStorageStats] = useState({
    totalSizeMB: 0,
    maxSizeMB: 0,
    usagePercent: 0,
    chatCount: 0,
  })
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    // 获取存储统计信息
    const stats = getStorageStats()
    setStorageStats(stats)
  }, [open])

  const handleClearAllHistory = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    setIsDeleting(true)
    try {
      const success = clearAllChatSessions()
      if (success) {
        toast({
          title: "已清除所有历史记录",
          description: "所有聊天历史记录已被删除",
        })
        setStorageStats({
          totalSizeMB: 0,
          maxSizeMB: storageStats.maxSizeMB,
          usagePercent: 0,
          chatCount: 0,
        })
        if (onHistoryUpdated) {
          onHistoryUpdated()
        }
      } else {
        throw new Error("Failed to clear history")
      }
    } catch (error) {
      console.error("Failed to clear history:", error)
      toast({
        title: "清除失败",
        description: "无法清除历史记录，请稍后再试",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setConfirmDelete(false)
    }
  }

  const handleExportHistory = () => {
    try {
      const jsonData = exportAllChatSessions()
      if (!jsonData) {
        throw new Error("No data to export")
      }

      // 创建下载链接
      const blob = new Blob([jsonData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `chat_history_export_${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "导出成功",
        description: "聊天历史记录已导出为JSON文件",
      })
    } catch (error) {
      console.error("Failed to export history:", error)
      toast({
        title: "导出失败",
        description: "无法导出历史记录，请稍后再试",
        variant: "destructive",
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0])
    }
  }

  const handleImportHistory = async () => {
    if (!importFile) {
      toast({
        title: "请选择文件",
        description: "请先选择要导入的JSON文件",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)
    try {
      const fileContent = await importFile.text()
      const success = importChatSessions(fileContent)
      if (success) {
        toast({
          title: "导入成功",
          description: "聊天历史记录已成功导入",
        })
        // 更新存储统计信息
        const stats = getStorageStats()
        setStorageStats(stats)
        if (onHistoryUpdated) {
          onHistoryUpdated()
        }
      } else {
        throw new Error("Failed to import history")
      }
    } catch (error) {
      console.error("Failed to import history:", error)
      toast({
        title: "导入失败",
        description: "无法导入历史记录，请确保文件格式正确",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
      setImportFile(null)
      // 重置文件输入
      const fileInput = document.getElementById("import-file") as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }
    }
  }

  const handleRebuildIndex = () => {
    try {
      rebuildChatIndex()
      toast({
        title: "索引重建成功",
        description: "聊天历史索引已重建",
      })
      // 更新存储统计信息
      const stats = getStorageStats()
      setStorageStats(stats)
      if (onHistoryUpdated) {
        onHistoryUpdated()
      }
    } catch (error) {
      console.error("Failed to rebuild index:", error)
      toast({
        title: "索引重建失败",
        description: "无法重建聊天历史索引",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>历史记录管理</DialogTitle>
          <DialogDescription>管理您的聊天历史记录，包括导出、导入和清除</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="manage">管理</TabsTrigger>
            <TabsTrigger value="import-export">导入/导出</TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">存储使用情况</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>已使用空间</span>
                  <span>
                    {storageStats.totalSizeMB.toFixed(2)} MB / {storageStats.maxSizeMB.toFixed(2)} MB
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2"
                    style={{ width: `${Math.min(storageStats.usagePercent, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs">
                  <span>聊天会话数</span>
                  <span>{storageStats.chatCount}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start" onClick={handleRebuildIndex}>
                <RefreshCw className="h-4 w-4 mr-2" />
                重建聊天索引
              </Button>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-destructive mb-2">危险区域</h3>
                {confirmDelete ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>此操作将永久删除所有聊天历史记录，且无法恢复。确定要继续吗？</AlertDescription>
                  </Alert>
                ) : null}
                <Button variant="destructive" className="w-full" onClick={handleClearAllHistory} disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      正在清除...
                    </>
                  ) : confirmDelete ? (
                    "确认清除所有历史记录"
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      清除所有历史记录
                    </>
                  )}
                </Button>
                {confirmDelete && (
                  <Button variant="outline" className="w-full mt-2" onClick={() => setConfirmDelete(false)}>
                    取消
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="import-export" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">导出历史记录</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  将您的聊天历史记录导出为JSON文件，以便备份或迁移到其他设备
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleExportHistory}
                  disabled={storageStats.chatCount === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  导出历史记录
                </Button>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-2">导入历史记录</h3>
                <p className="text-xs text-muted-foreground mb-3">从之前导出的JSON文件中导入聊天历史记录</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="file" id="import-file" accept=".json" className="hidden" onChange={handleFileChange} />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById("import-file")?.click()}
                      disabled={isImporting}
                    >
                      选择文件
                    </Button>
                  </div>
                  {importFile && (
                    <div className="text-xs bg-muted/50 p-2 rounded">
                      已选择: {importFile.name} ({(importFile.size / 1024).toFixed(2)} KB)
                    </div>
                  )}
                  <Button className="w-full" onClick={handleImportHistory} disabled={!importFile || isImporting}>
                    {isImporting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        正在导入...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        导入历史记录
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
