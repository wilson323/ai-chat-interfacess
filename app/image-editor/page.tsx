"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Image, 
  Upload, 
  Download, 
  RotateCcw, 
  RotateCw, 
  ZoomIn, 
  ZoomOut,
  Crop,
  Palette,
  Type,
  Shapes,
  ArrowLeft
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import ImageEditor from '@/components/image-editor/image-editor'

export default function ImageEditorPage() {
  const router = useRouter()
  const [referenceUrl, setReferenceUrl] = useState<string | undefined>()
  const [activeTab, setActiveTab] = useState('edit')
  const [imageHistory, setImageHistory] = useState<string[]>([])
  const [currentImage, setCurrentImage] = useState<string | null>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setCurrentImage(result)
        setImageHistory(prev => [...prev, result])
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = (imageData: string) => {
    // 保存图像逻辑
    setImageHistory(prev => [...prev, imageData])
  }

  const handleUndo = () => {
    if (imageHistory.length > 1) {
      const newHistory = imageHistory.slice(0, -1)
      setImageHistory(newHistory)
      setCurrentImage(newHistory[newHistory.length - 1])
    }
  }

  const handleRedo = () => {
    // 重做逻辑
    if (imageHistory.length > 0) {
      setCurrentImage(imageHistory[imageHistory.length - 1])
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 页面头部 */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">AI图像编辑器</h1>
                <p className="text-sm text-gray-600">智能图像编辑和处理工具</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleUndo}>
                <RotateCcw className="h-4 w-4 mr-2" />
                撤销
              </Button>
              <Button variant="outline" size="sm" onClick={handleRedo}>
                <RotateCw className="h-4 w-4 mr-2" />
                重做
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">上传</TabsTrigger>
            <TabsTrigger value="edit">编辑</TabsTrigger>
            <TabsTrigger value="tools">工具</TabsTrigger>
            <TabsTrigger value="effects">效果</TabsTrigger>
          </TabsList>

          {/* 上传标签页 */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  上传图像
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="file-upload">从文件上传</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reference-url">参考图URL</Label>
                    <Input
                      id="reference-url"
                      type="url"
                      value={referenceUrl || ''}
                      onChange={(e) => setReferenceUrl(e.target.value)}
                      placeholder="粘贴参考图片URL"
                      className="mt-2"
                    />
                  </div>
                </div>
                
                {currentImage && (
                  <div className="mt-4">
                    <Label>预览图像</Label>
                    <div className="mt-2 border rounded-lg p-4">
                      <img 
                        src={currentImage} 
                        alt="预览" 
                        className="max-w-full h-auto max-h-64 mx-auto"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 编辑标签页 */}
          <TabsContent value="edit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  图像编辑
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentImage ? (
                  <ImageEditor 
                    onSave={handleSave} 
                    referenceImageUrl={referenceUrl}
                    initialImage={currentImage}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">请先上传图像开始编辑</p>
                    <Button onClick={() => setActiveTab('upload')}>
                      上传图像
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 工具标签页 */}
          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Crop className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-medium">裁剪</h3>
                  <p className="text-sm text-gray-600">裁剪图像区域</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <ZoomIn className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-medium">缩放</h3>
                  <p className="text-sm text-gray-600">调整图像大小</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <RotateCw className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <h3 className="font-medium">旋转</h3>
                  <p className="text-sm text-gray-600">旋转图像角度</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Type className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-medium">文字</h3>
                  <p className="text-sm text-gray-600">添加文字水印</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 效果标签页 */}
          <TabsContent value="effects" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Palette className="h-8 w-8 mx-auto mb-2 text-pink-600" />
                  <h3 className="font-medium">滤镜</h3>
                  <p className="text-sm text-gray-600">应用各种滤镜效果</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Shapes className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                  <h3 className="font-medium">形状</h3>
                  <p className="text-sm text-gray-600">添加几何形状</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <ZoomOut className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <h3 className="font-medium">模糊</h3>
                  <p className="text-sm text-gray-600">应用模糊效果</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Image className="h-8 w-8 mx-auto mb-2 text-teal-600" />
                  <h3 className="font-medium">AI增强</h3>
                  <p className="text-sm text-gray-600">AI智能图像增强</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 