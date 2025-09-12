/**
 * 文件上传组件
 * 支持拖拽上传、多文件、预览、进度显示
 */

'use client'

import React, { useState, useRef, useCallback, DragEvent } from 'react'
import { Upload, X, File, Image, FileText, Music, Video, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { FileUploadProps } from './types'

// 文件类型图标映射
const getFileIcon = (file: File) => {
  const type = file.type.split('/')[0]
  const extension = file.name.split('.').pop()?.toLowerCase()
  
  if (type === 'image') return <Image className="h-8 w-8 text-blue-500" />
  if (type === 'video') return <Video className="h-8 w-8 text-purple-500" />
  if (type === 'audio') return <Music className="h-8 w-8 text-green-500" />
  if (extension === 'zip' || extension === 'rar' || extension === '7z') {
    return <Archive className="h-8 w-8 text-orange-500" />
  }
  if (extension === 'pdf' || extension === 'doc' || extension === 'docx' || extension === 'txt') {
    return <FileText className="h-8 w-8 text-red-500" />
  }
  return <File className="h-8 w-8 text-gray-500" />
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 文件预览组件
const FilePreview: React.FC<{
  file: File
  onRemove: () => void
  progress?: number
}> = ({ file, onRemove, progress }) => {
  const [preview, setPreview] = useState<string | null>(null)

  // 生成预览
  React.useEffect(() => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }, [file])

  return (
    <Card className="relative group">
      <CardContent className="p-3">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {preview ? (
              <img
                src={preview}
                alt={file.name}
                className="h-12 w-12 object-cover rounded"
              />
            ) : (
              getFileIcon(file)
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(file.size)}
            </p>
            
            {progress !== undefined && (
              <div className="mt-2">
                <Progress value={progress} className="h-1" />
                <p className="text-xs text-gray-500 mt-1">
                  {progress}% 上传中...
                </p>
              </div>
            )}
          </div>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      accept,
      multiple = false,
      maxSize = 10 * 1024 * 1024, // 10MB
      maxFiles = 10,
      disabled = false,
      loading = false,
      onUpload,
      onError,
      preview = true,
      dragAndDrop = true,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const [files, setFiles] = useState<File[]>([])
    const [dragActive, setDragActive] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
    const fileInputRef = useRef<HTMLInputElement>(null)

    // 验证文件
    const validateFile = useCallback(
      (file: File): string | null => {
        // 检查文件大小
        if (file.size > maxSize) {
          return `文件 ${file.name} 超过最大大小限制 ${formatFileSize(maxSize)}`
        }

        // 检查文件类型
        if (accept) {
          const acceptedTypes = accept.split(',').map(type => type.trim())
          const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
          const mimeType = file.type

          const isAccepted = acceptedTypes.some(type => {
            if (type.startsWith('.')) {
              return fileExtension === type.toLowerCase()
            }
            if (type.includes('/')) {
              return mimeType === type
            }
            if (type.endsWith('/*')) {
              return mimeType.startsWith(type.replace('/*', '/'))
            }
            return false
          })

          if (!isAccepted) {
            return `文件 ${file.name} 类型不被支持`
          }
        }

        return null
      },
      [accept, maxSize]
    )

    // 处理文件选择
    const handleFiles = useCallback(
      (newFiles: FileList | File[]) => {
        const fileArray = Array.from(newFiles)
        const validFiles: File[] = []
        const errors: string[] = []

        // 检查文件数量限制
        if (files.length + fileArray.length > maxFiles) {
          onError?.(`最多只能上传 ${maxFiles} 个文件`)
          return
        }

        // 验证每个文件
        fileArray.forEach(file => {
          const error = validateFile(file)
          if (error) {
            errors.push(error)
          } else {
            validFiles.push(file)
          }
        })

        // 报告错误
        if (errors.length > 0) {
          onError?.(errors.join('\n'))
        }

        // 添加有效文件
        if (validFiles.length > 0) {
          const updatedFiles = [...files, ...validFiles]
          setFiles(updatedFiles)
          onUpload?.(updatedFiles)
        }
      },
      [files, maxFiles, validateFile, onUpload, onError]
    )

    // 处理文件输入变化
    const handleFileInputChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files
        if (selectedFiles) {
          handleFiles(selectedFiles)
        }
        // 重置input值，允许选择相同文件
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      },
      [handleFiles]
    )

    // 处理拖拽
    const handleDrag = useCallback((e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }, [])

    const handleDragIn = useCallback(
      (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
          setDragActive(true)
        }
      },
      []
    )

    const handleDragOut = useCallback(
      (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
      },
      []
    )

    const handleDrop = useCallback(
      (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleFiles(e.dataTransfer.files)
        }
      },
      [handleFiles]
    )

    // 移除文件
    const removeFile = useCallback(
      (index: number) => {
        const updatedFiles = files.filter((_, i) => i !== index)
        setFiles(updatedFiles)
        onUpload?.(updatedFiles)
      },
      [files, onUpload]
    )

    // 清空所有文件
    const clearFiles = useCallback(() => {
      setFiles([])
      setUploadProgress({})
      onUpload?.([])
    }, [onUpload])

    // 打开文件选择器
    const openFileDialog = useCallback(() => {
      if (fileInputRef.current && !disabled && !loading) {
        fileInputRef.current.click()
      }
    }, [disabled, loading])

    return (
      <div ref={ref} className={cn('w-full', className)} style={style} {...props}>
        {/* 文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {/* 上传区域 */}
        {dragAndDrop && (
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400',
              disabled && 'opacity-50 cursor-not-allowed',
              loading && 'opacity-50 cursor-not-allowed'
            )}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              拖拽文件到此处或{' '}
              <span className="text-blue-600 hover:text-blue-500 cursor-pointer">
                点击选择文件
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              支持 {accept || '所有文件类型'}，最大 {formatFileSize(maxSize)}
            </p>
          </div>
        )}

        {/* 上传按钮 */}
        {!dragAndDrop && (
          <Button
            type="button"
            onClick={openFileDialog}
            disabled={disabled || loading}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {loading ? '上传中...' : '选择文件'}
          </Button>
        )}

        {/* 文件预览 */}
        {preview && files.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                已选择文件 ({files.length})
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFiles}
                className="text-red-600 hover:text-red-700"
              >
                清空
              </Button>
            </div>
            
            <div className="space-y-2">
              {files.map((file, index) => (
                <FilePreview
                  key={`${file.name}-${index}`}
                  file={file}
                  onRemove={() => removeFile(index)}
                  progress={uploadProgress[file.name]}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
)

FileUpload.displayName = 'FileUpload'

export default FileUpload

