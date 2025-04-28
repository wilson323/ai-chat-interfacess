"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Upload, ImageIcon, FileText, FileIcon, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useMobile } from "@/hooks/use-mobile"
import { useToast } from "@/components/ui/use-toast"

interface FileUploaderProps {
  onClose: () => void
  onFileUpload?: (files: UploadedFile[]) => void
}

export interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  progress: number
  status: "uploading" | "complete" | "error"
  url?: string
  content?: string
}

export function FileUploader({ onClose, onFileUpload }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const isMobile = useMobile()
  const { toast } = useToast()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = useCallback(
    (files: FileList) => {
      // 检查文件大小限制 (10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      const validFiles = Array.from(files).filter((file) => {
        if (file.size > maxSize) {
          toast({
            title: "文件过大",
            description: `文件 ${file.name} 超过10MB限制`,
            variant: "destructive",
          })
          return false
        }
        return true
      })

      if (validFiles.length === 0) return

      // 处理有效文件
      validFiles.forEach((file) => {
        // 创建新文件对象
        const newFile: UploadedFile = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          progress: 0,
          status: "uploading",
        }

        setUploadedFiles((prev) => [...prev, newFile])

        // 模拟上传进度
        const interval = setInterval(() => {
          setUploadedFiles((prev) =>
            prev.map((f) => {
              if (f.id === newFile.id) {
                const newProgress = f.progress + 20
                if (newProgress >= 100) {
                  clearInterval(interval)

                  // 读取文件内容（如果是文本文件）
                  if (file.type.startsWith("text/") || file.type.includes("json")) {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                      const content = e.target?.result as string
                      setUploadedFiles((prev) =>
                        prev.map((f) => (f.id === newFile.id ? { ...f, content, status: "complete" } : f)),
                      )

                      // 通知父组件文件上传完成
                      if (onFileUpload) {
                        const updatedFiles = prev.map((f) =>
                          f.id === newFile.id ? { ...f, content, status: "complete" } : f,
                        )
                        onFileUpload(updatedFiles)
                      }
                    }
                    reader.readAsText(file)
                  } else if (file.type.startsWith("image/")) {
                    // 处理图片文件
                    const reader = new FileReader()
                    reader.onload = (e) => {
                      const url = e.target?.result as string
                      setUploadedFiles((prev) =>
                        prev.map((f) => (f.id === newFile.id ? { ...f, url, status: "complete" } : f)),
                      )

                      // 通知父组件文件上传完成
                      if (onFileUpload) {
                        const updatedFiles = prev.map((f) =>
                          f.id === newFile.id ? { ...f, url, status: "complete" } : f,
                        )
                        onFileUpload(updatedFiles)
                      }
                    }
                    reader.readAsDataURL(file)
                  } else {
                    // 其他类型文件
                    setUploadedFiles((prev) =>
                      prev.map((f) => (f.id === newFile.id ? { ...f, status: "complete" } : f)),
                    )

                    // 通知父组件文件上传完成
                    if (onFileUpload) {
                      const updatedFiles = prev.map((f) => (f.id === newFile.id ? { ...f, status: "complete" } : f))
                      onFileUpload(updatedFiles)
                    }
                  }

                  return { ...f, progress: 100, status: "complete" }
                }
                return { ...f, progress: newProgress }
              }
              return f
            }),
          )
        }, 500)
      })
    },
    [toast, onFileUpload],
  )

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    if (type.includes("pdf")) return <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    return <FileIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <Card className="p-3 sm:p-4 mb-4 relative">
      <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 sm:h-7 sm:w-7" onClick={onClose}>
        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Button>

      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-4 sm:p-6 text-center",
          "transition-colors duration-200",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20",
          uploadedFiles.length > 0 ? "pb-2" : "",
        )}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input type="file" id="file-upload" multiple className="hidden" onChange={handleFileInput} />

        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-2">
            <div className="p-2 sm:p-3 rounded-full bg-primary/10">
              <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <p className="text-xs sm:text-sm font-medium">点击或拖放文件到此处</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">支持图片、PDF和文本文件（最大10MB）</p>

            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" className="gap-1 text-xs h-7 sm:h-8" asChild>
                <label htmlFor="file-upload">
                  <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>图片</span>
                </label>
              </Button>
              <Button size="sm" variant="outline" className="gap-1 text-xs h-7 sm:h-8" asChild>
                <label htmlFor="file-upload">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>文档</span>
                </label>
              </Button>
            </div>
          </div>
        </label>

        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-2 bg-accent/50 p-2 rounded-md text-left">
                <div className="p-1.5 rounded-md bg-background">{getFileIcon(file.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] sm:text-xs font-medium truncate">{file.name}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
                  <Progress value={file.progress} className="h-1 mt-1" />
                </div>
                {file.status === "uploading" ? (
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 sm:h-7 sm:w-7"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
