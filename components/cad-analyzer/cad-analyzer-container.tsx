"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAgent } from "@/context/agent-context"
import { FileText, Loader2, Download, Info, AlertCircle, CheckCircle2, ImageIcon, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useLanguage } from "@/context/language-context"

// 安防设备关键词列表
const SECURITY_KEYWORDS = [
  "考勤",
  "门禁",
  "消费机",
  "道闸",
  "摄像机",
  "读卡器",
  "电锁",
  "门磁",
  "闸机",
  "访客机",
  "指纹机",
  "人脸机",
  "车位锁",
  "巡更点",
  "报警",
]

interface CADEntity {
  type: string
  layer: string
  position?: [number, number, number]
  text?: string
  name?: string
  points?: [number, number, number][]
}

interface CADData {
  metadata: {
    layers: string[]
    units: number
    total_entities: number
  }
  security_devices: CADEntity[]
  text_annotations: CADEntity[]
  dimensions: CADEntity[]
  wiring: CADEntity[]
}

interface AnalysisResult {
  filename: string
  time: string
  preview?: string
  metadata: {
    layers: string[]
    units: number
    total_entities: number
  } | null
  analysis: string
  raw_data: CADData | null
  isImage: boolean
  imageData?: string
  reportUrl?: string
}

export function CADAnalyzerContainer() {
  const { selectedAgent } = useAgent()
  const { toast } = useToast()
  const { t } = useLanguage()

  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("upload")
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null)
  const [fileType, setFileType] = useState<"cad" | "image" | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // 模拟进度条
  useEffect(() => {
    if (isLoading && progress < 95) {
      const timer = setTimeout(() => {
        setProgress((prev) => {
          const increment = Math.random() * 10
          return Math.min(prev + increment, 95)
        })
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isLoading, progress])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleFileUpload 被调用", event);
    const files = event.target.files
    if (!files || files.length === 0) {
      console.log("没有选择文件");
      return;
    }

    console.log(`选择了 ${files.length} 个文件:`, Array.from(files).map(f => f.name));
    setIsLoading(true)
    setProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExtension = file.name.split(".").pop()?.toLowerCase() || ""
        const isImageFile = ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(fileExtension)
        const isCADFile = ["dxf", "dwg"].includes(fileExtension)
        if (!isImageFile && !isCADFile) {
          toast({
            title: "不支持的文件格式",
            description: "请上传DXF、DWG格式的CAD文件或JPG、PNG等图片文件",
            variant: "destructive",
          })
          continue
        }
        setFileType(isImageFile ? "image" : "cad")
        // === 新增：后端API分析 ===
        console.log(`开始上传文件: ${file.name}, 大小: ${file.size} 字节`);
        const formData = new FormData()
        formData.append('file', file)

        // 添加管理员token头，确保API调用成功
        console.log("发送API请求...");

        try {
          const res = await fetch('/api/cad-analyzer/analyze', {
            method: 'POST',
            headers: {
              'x-admin-token': 'admin123' // 使用环境变量中配置的默认值
            },
            body: formData
          })

          if (!res.ok) {
            const errorText = await res.text();
            console.error(`API请求失败: ${res.status} ${res.statusText}`, errorText);
            throw new Error(`API请求失败: ${res.status} ${res.statusText}`);
          }

          console.log("API请求成功，正在解析响应...");
          const data = await res.json()

          if (data.error) {
            toast({ title: '分析失败', description: data.error, variant: 'destructive' })
            continue
          }

          const resultData = {
            filename: file.name,
            time: new Date().toLocaleString(),
            preview: data.url,
            metadata: null,
            analysis: data.analysis,
            raw_data: null,
            isImage: isImageFile,
            imageData: isImageFile ? data.url : undefined,
            reportUrl: data.reportUrl,
          }

          console.log("创建结果数据:", resultData);
          setAnalysisResults((prev) => [resultData, ...prev])
          setCurrentResult(resultData)
          setProgress(100)
        } catch (uploadError) {
          console.error("文件上传或处理失败:", uploadError);
          toast({
            title: '处理失败',
            description: uploadError instanceof Error ? uploadError.message : '文件处理过程中发生错误',
            variant: 'destructive'
          });
          continue;
        }
      }

      // Switch to results tab if we have results
      if (analysisResults.length > 0 || currentResult) {
        setActiveTab("results")
      }
    } catch (error) {
      console.error("处理文件时出错:", error)
      toast({
        title: "处理失败",
        description: "解析文件时发生错误，请检查文件格式是否正确",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setProgress(100)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Reset progress bar
      setTimeout(() => setProgress(0), 1000)
    }
  }

  // 读取文件为ArrayBuffer
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as ArrayBuffer)
        } else {
          reject(new Error("Failed to read file as ArrayBuffer"))
        }
      }
      reader.onerror = (event) => {
        console.error("FileReader error:", event)
        reject(new Error("Error reading file: " + (reader.error?.message || "Unknown error")))
      }
      try {
        reader.readAsArrayBuffer(file)
      } catch (error) {
        console.error("Exception during readAsArrayBuffer:", error)
        reject(error)
      }
    })
  }

  // 读取文件为DataURL
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as string)
        } else {
          reject(new Error("Failed to read file as DataURL"))
        }
      }
      reader.onerror = (event) => {
        console.error("FileReader error:", event)
        reject(new Error("Error reading file: " + (reader.error?.message || "Unknown error")))
      }
      try {
        reader.readAsDataURL(file)
      } catch (error) {
        console.error("Exception during readAsDataURL:", error)
        reject(error)
      }
    })
  }

  // 解析CAD文件（模拟）
  const parseCADFile = async (file: File, fileContent: ArrayBuffer): Promise<CADData> => {
    // 在实际应用中，这里应该使用专门的CAD解析库
    // 这里我们模拟解析过程
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // 模拟CAD数据
    return {
      metadata: {
        layers: ["0", "安防设备", "线缆", "标注"],
        units: 0,
        total_entities: Math.floor(Math.random() * 5000) + 1000,
      },
      security_devices: Array(Math.floor(Math.random() * 20) + 5)
        .fill(0)
        .map((_, i) => ({
          type: "block_reference",
          name: SECURITY_KEYWORDS[Math.floor(Math.random() * SECURITY_KEYWORDS.length)],
          layer: "安防设备",
          position: [Math.random() * 1000, Math.random() * 1000, 0],
        })),
      text_annotations: Array(Math.floor(Math.random() * 15) + 5)
        .fill(0)
        .map((_, i) => ({
          type: "TEXT",
          text: `${SECURITY_KEYWORDS[Math.floor(Math.random() * SECURITY_KEYWORDS.length)]}${i}`,
          layer: "标注",
          position: [Math.random() * 1000, Math.random() * 1000, 0],
        })),
      dimensions: [],
      wiring: Array(Math.floor(Math.random() * 30) + 10)
        .fill(0)
        .map((_, i) => ({
          type: "LINE",
          layer: "线缆",
          points: [
            [Math.random() * 1000, Math.random() * 1000, 0],
            [Math.random() * 1000, Math.random() * 1000, 0],
          ],
        })),
    }
  }

  // 生成预览图（模拟）
  const generatePreview = async (cadData: CADData): Promise<string> => {
    // 在实际应用中，这里应该使用Canvas或SVG绘制预览图
    // 这里我们返回一个占位图
    return `/placeholder.svg?height=400&width=600&query=CAD安防设备布局图`
  }

  // 修改analyzeWithAI函数，增强错误处理和兼容性
  const analyzeWithAI = async (cadData: CADData): Promise<string> => {
    if (!selectedAgent?.apiUrl || !selectedAgent?.apiKey || !selectedAgent?.appId) {
      return "错误：未配置API密钥或端点。请在管理员控制台中配置API设置。"
    }

    try {
      // 准备发送到API的数据 - 确保数据格式正确
      const data = JSON.stringify(cadData, null, 2)

      // 系统提示词
      const systemPrompt =
        selectedAgent.systemPrompt ||
        `
      你是一位专业的安防系统工程师和CAD图纸分析专家。请分析以下CAD图纸数据，提供详细的安防设备分析报告，包括：
      1. 设备类型统计（考勤、门禁、消费、停车等设备的类型和数量）
      2. 摄像头信息分析
      3. 安装调试建议
      4. 预估布线数据
      5. 使用Mermaid语法描述系统拓扑关系

      请以结构化文本形式输出，包括设备统计表、摄像头信息表、安装调试建议、预估布线数据以及系统拓扑图。
    `

      // 使用代理API而不是直接调用，以避免CORS问题
      const proxyData = {
        targetUrl: selectedAgent.apiUrl,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${selectedAgent.apiKey}`,
        },
        body: {
          model: selectedAgent.multimodalModel || "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `请分析以下CAD数据:\n\n${data}` },
          ],
          temperature: 0.7,
          max_tokens: selectedAgent.maxTokens || 4000,
        },
      }

      // 使用代理API
      const response = await fetch("/api/chat-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proxyData),
      })

      if (!response.ok) {
        console.error(`API请求失败: ${response.status}`)
        return `分析过程中发生错误: HTTP ${response.status}。请检查API配置或重试。`
      }

      const responseData = await response.json()

      // 检查响应格式
      if (responseData.status !== 200 || !responseData.data || !responseData.data.choices) {
        console.error("API响应格式错误:", responseData)
        return "API返回了无效的响应格式。请检查API配置或重试。"
      }

      return responseData.data.choices[0].message.content || "无法获取分析结果。"
    } catch (error) {
      console.error("AI分析失败:", error)
      return `分析过程中发生错误: ${error instanceof Error ? error.message : "未知错误"}。请检查API配置或重试。`
    }
  }

  // 同样修改多模态AI分析函数，使用相同的代理方式
  const analyzeWithMultimodalAI = async (imageData: string): Promise<string> => {
    if (!selectedAgent?.apiUrl || !selectedAgent?.apiKey || !selectedAgent?.appId) {
      return "错误：未配置API密钥或端点。请在管理员控制台中配置API设置。"
    }

    try {
      // 系统提示词
      const systemPrompt =
        selectedAgent.systemPrompt ||
        `
      你是一位专业的安防系统工程师和CAD图纸分析专家。请分析以下CAD图纸图片，提供详细的安防设备分析报告，包括：
      1. 设备类型统计（考勤、门禁、消费、停车等设备的类型和数量）
      2. 摄像头信息分析
      3. 安装调试建议
      4. 预估布线数据
      5. 使用Mermaid语法描述系统拓扑关系

      请以结构化文本形式输出，包括设备统计表、摄像头信息表、安装调试建议、预估布线数据以及系统拓扑图。
      请特别注意识别图片中的安防设备符号和标注。
    `

      // 使用代理API
      const proxyData = {
        targetUrl: selectedAgent.apiUrl,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${selectedAgent.apiKey}`,
        },
        body: {
          model: selectedAgent.multimodalModel || "gpt-4-vision-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: "请分析这张CAD图纸图片，识别其中的安防设备并提供详细分析报告。" },
                { type: "image_url", image_url: { url: imageData } },
              ],
            },
          ],
          max_tokens: selectedAgent.maxTokens || 4000,
        },
      }

      const response = await fetch("/api/chat-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proxyData),
      })

      if (!response.ok) {
        console.error(`API请求失败: ${response.status}`)
        return `分析过程中发生错误: HTTP ${response.status}。请检查API配置或重试。`
      }

      const responseData = await response.json()

      // 检查响应格式
      if (responseData.status !== 200 || !responseData.data || !responseData.data.choices) {
        console.error("API响应格式错误:", responseData)
        return "API返回了无效的响应格式。请检查API配置或重试。"
      }

      return responseData.data.choices[0].message.content || "无法获取分析结果。"
    } catch (error) {
      console.error("多模态AI分析失败:", error)
      return `分析图片过程中发生错误: ${error instanceof Error ? error.message : "未知错误"}。请检查API配置或重试。`
    }
  }

  // 下载分析报告
  const downloadReport = (result: AnalysisResult) => {
    const reportData = {
      filename: result.filename,
      analysis: result.analysis,
      devices: result.raw_data?.security_devices.map((d) => d.name) || [],
      metadata: result.metadata,
      timestamp: result.time,
      isImage: result.isImage,
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `${result.filename.split(".")[0]}_安防分析报告.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full relative">
      <ScrollArea className="flex-1 px-2 sm:px-4 py-4 sm:py-6">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-20">
          <Card className="shadow-lg border-pantone369-100 dark:border-pantone369-900/30 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-pantone369-50 to-pantone369-100 dark:from-pantone369-900/20 dark:to-pantone369-900/30 p-3 sm:p-4">
              <CardTitle className="text-lg sm:text-2xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-pantone369-500" />
                CAD解读智能体
              </CardTitle>
              <CardDescription className="text-sm">
                专业CAD图纸解析工具，识别安防设备布局并提供详细分析报告
              </CardDescription>
            </CardHeader>

            <CardContent className="p-3 sm:p-6">
              <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 w-full mb-4 sm:mb-6 bg-pantone369-50 dark:bg-pantone369-900/20">
                  <TabsTrigger
                    value="upload"
                    disabled={isLoading}
                    className="data-[state=active]:bg-pantone369-100 dark:data-[state=active]:bg-pantone369-800/30 text-xs sm:text-sm py-1.5 sm:py-2"
                  >
                    上传文件
                  </TabsTrigger>
                  <TabsTrigger
                    value="results"
                    disabled={analysisResults.length === 0}
                    className="data-[state=active]:bg-pantone369-100 dark:data-[state=active]:bg-pantone369-800/30 text-xs sm:text-sm py-1.5 sm:py-2"
                  >
                    分析结果 ({analysisResults.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                  <div className="space-y-4 sm:space-y-6">
                    <Alert className="bg-pantone369-50 dark:bg-pantone369-900/20 border-pantone369-200 dark:border-pantone369-800/30 text-xs sm:text-sm">
                      <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-pantone369-500" />
                      <AlertTitle className="text-sm sm:text-base">{t("instructions")}</AlertTitle>
                      <AlertDescription className="text-xs sm:text-sm">
                        {t("uploadInstructions")}
                      </AlertDescription>
                    </Alert>

                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-3 sm:p-12 text-center",
                        "transition-colors duration-200",
                        isLoading
                          ? "border-primary bg-primary/5"
                          : "border-pantone369-200 dark:border-pantone369-800/30",
                        "hover:border-pantone369-500 hover:bg-pantone369-50 dark:hover:bg-pantone369-900/10",
                        "touch-auto cursor-pointer", // Added for better touch handling
                      )}
                      onClick={() => !isLoading && fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".dxf,.dwg,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                        multiple
                        onChange={(e) => {
                          console.log("文件选择事件触发", e.target.files);
                          handleFileUpload(e);
                        }}
                        disabled={isLoading}
                        id="cad-file-input"
                      />

                      {isLoading ? (
                        <div className="flex flex-col items-center gap-3 sm:gap-4">
                          <Loader2 className="h-7 sm:h-12 w-7 sm:w-12 text-pantone369-500 animate-spin" />
                          <div>
                            <p className="text-sm sm:text-lg font-medium mb-2">{t("processing")}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{t("pleaseWait")}</p>
                            <Progress value={progress} className="w-full sm:w-[300px] mx-auto" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 sm:gap-4">
                          <div className="flex gap-3 sm:gap-4">
                            <div className="p-2 sm:p-4 rounded-full bg-pantone369-100 dark:bg-pantone369-900/30">
                              <FileText className="h-5 sm:h-10 w-5 sm:w-10 text-pantone369-500" />
                            </div>
                            <div className="p-2 sm:p-4 rounded-full bg-pantone369-100 dark:bg-pantone369-900/30">
                              <ImageIcon className="h-5 sm:h-10 w-5 sm:w-10 text-pantone369-500" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">{t("dragAndDrop")}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {t("supportedFormats")}: DXF, DWG
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {t("supportedFormats")}: JPG, PNG
                            </p>
                          </div>
                          <Button
                            type="button"
                            className="mt-3 sm:mt-4 bg-pantone369-500 hover:bg-pantone369-600 text-white flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-10"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log("选择文件按钮被点击");
                              if (fileInputRef.current) {
                                fileInputRef.current.click();
                              } else {
                                console.error("文件输入引用为空");
                              }
                            }}
                          >
                            <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            {t("selectFile")}
                          </Button>
                        </div>
                      )}
                    </div>

                    {analysisResults.length > 0 && (
                      <div className="mt-6 sm:mt-8">
                        <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-pantone369-500 mr-2" />
                          {t("historicalRecords")}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          {analysisResults.map((result, index) => (
                            <Card
                              key={index}
                              className="overflow-hidden border-pantone369-100 dark:border-pantone369-900/30 hover:shadow-md transition-shadow"
                            >
                              <CardHeader className="p-3 sm:p-4 bg-pantone369-50/50 dark:bg-pantone369-900/10">
                                <CardTitle className="text-sm sm:text-base">{result.filename}</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">{result.time}</CardDescription>
                              </CardHeader>
                              <CardFooter className="p-3 sm:p-4 pt-2 sm:pt-3 flex justify-between">
                                <Badge
                                  variant="outline"
                                  className="bg-pantone369-50 dark:bg-pantone369-900/20 text-pantone369-700 dark:text-pantone369-300 border-pantone369-200 dark:border-pantone369-800/30 text-xs"
                                >
                                  {result.isImage
                                    ? "图片分析"
                                    : `${result.raw_data?.security_devices.length || 0} 个安防设备`}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-pantone369-600 hover:text-pantone369-700 hover:bg-pantone369-50 text-xs h-7 sm:h-8"
                                  onClick={() => {
                                    setCurrentResult(result)
                                    setActiveTab("results")
                                  }}
                                >
                                  {t("viewAnalysis")}
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="results">
                  {currentResult ? (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                        <div>
                          <h2 className="text-lg sm:text-2xl font-bold">{currentResult.filename}</h2>
                          <p className="text-xs sm:text-sm text-muted-foreground">{currentResult.time}</p>
                          <Badge
                            variant="outline"
                            className="mt-2 bg-pantone369-50 dark:bg-pantone369-900/20 text-pantone369-700 dark:text-pantone369-300 border-pantone369-200 dark:border-pantone369-800/30 text-xs"
                          >
                            {currentResult.isImage ? "图片分析" : "CAD文件分析"}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 border-pantone369-200 dark:border-pantone369-800/30 hover:bg-pantone369-50 dark:hover:bg-pantone369-900/20 text-pantone369-700 dark:text-pantone369-300 text-xs sm:text-sm h-8 sm:h-9 mt-2 sm:mt-0"
                          onClick={() => downloadReport(currentResult)}
                        >
                          <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          {t("downloadAnalysisReport")}
                        </Button>
                      </div>

                      <Separator className="bg-pantone369-200 dark:bg-pantone369-800/30" />

                      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                        <div className="md:col-span-1">
                          <Card className="border-pantone369-100 dark:border-pantone369-900/30">
                            <CardHeader className="bg-pantone369-50/50 dark:bg-pantone369-900/10 p-3 sm:p-4">
                              <CardTitle className="text-sm sm:text-lg">
                                {currentResult.isImage ? t("imagePreview") : t("cadPreview")}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-4">
                              <div className="aspect-square bg-muted rounded-md overflow-hidden border border-pantone369-100 dark:border-pantone369-900/30">
                                {currentResult.preview || currentResult.imageData ? (
                                  <img
                                    src={currentResult.imageData || currentResult.preview || "/placeholder.svg"}
                                    alt={currentResult.isImage ? "图片预览" : "CAD预览"}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <p className="text-xs sm:text-sm text-muted-foreground">{t("noPreview")}</p>
                                  </div>
                                )}
                              </div>

                              {!currentResult.isImage && currentResult.metadata && (
                                <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-xs sm:text-sm font-medium">{t("totalEntities")}:</span>
                                    <span className="text-xs sm:text-sm">{currentResult.metadata.total_entities}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-xs sm:text-sm font-medium">{t("securityDeviceCount")}:</span>
                                    <span className="text-xs sm:text-sm">
                                      {currentResult.raw_data?.security_devices.length}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-xs sm:text-sm font-medium">{t("wireCount")}:</span>
                                    <span className="text-xs sm:text-sm">{currentResult.raw_data?.wiring.length}</span>
                                  </div>
                                </div>
                              )}

                              {!currentResult.isImage && currentResult.metadata && (
                                <>
                                  <Separator className="my-3 sm:my-4 bg-pantone369-200 dark:bg-pantone369-800/30" />
                                  <div>
                                    <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">{t("layerInfo")}:</h4>
                                    <div className="flex flex-wrap gap-1 sm:gap-2">
                                      {currentResult.metadata.layers.map((layer, index) => (
                                        <Badge
                                          key={index}
                                          variant="outline"
                                          className="bg-pantone369-50 dark:bg-pantone369-900/20 text-pantone369-700 dark:text-pantone369-300 border-pantone369-200 dark:border-pantone369-800/30 text-xs"
                                        >
                                          {layer}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        <div className="md:col-span-2">
                          <Card className="border-pantone369-100 dark:border-pantone369-900/30">
                            <CardHeader className="bg-pantone369-50/50 dark:bg-pantone369-900/10 p-3 sm:p-4">
                              <CardTitle className="text-sm sm:text-lg">{t("securitySystemAnalysisReport")}</CardTitle>
                              {currentResult.isImage && (
                                <CardDescription className="text-xs sm:text-sm">
                                  {t("multimodalAnalysis")}
                                </CardDescription>
                              )}
                            </CardHeader>
                            <CardContent className="p-3 sm:p-6">
                              <div className="prose prose-sm max-w-none text-xs sm:text-sm">
                                {currentResult.analysis.split("\n").map((line, index) => (
                                  <div key={index}>{line.trim() === "" ? <br /> : <p>{line}</p>}</div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      <Alert className="bg-pantone369-50 dark:bg-pantone369-900/20 border-pantone369-200 dark:border-pantone369-800/30 text-xs sm:text-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-pantone369-500" />
                        <AlertTitle className="text-sm sm:text-base">{t("analysisComplete")}</AlertTitle>
                        <AlertDescription className="text-xs sm:text-sm">
                          {currentResult.isImage ? t("imageAnalysis") : t("cadFileAnalysis")}
                          {t("analysisComplete")}
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">{t("noAnalysisResults")}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">{t("uploadFirst")}</p>
                      <Button
                        onClick={() => setActiveTab("upload")}
                        className="bg-pantone369-500 hover:bg-pantone369-600 text-white text-xs sm:text-sm h-8 sm:h-9"
                      >
                        {t("uploadFile")}
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}
