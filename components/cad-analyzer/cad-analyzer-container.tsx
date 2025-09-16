'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  Loader2,
  Download,
  Info,
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  Upload,
  X,
  Maximize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '../../context/language-context';
import { MarkdownMessage } from '../markdown-message';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
// import DxfParser from 'dxf-parser'; // Unused import


interface CADEntity {
  type: string;
  layer: string;
  position?: [number, number, number];
  text?: string;
  name?: string;
  points?: [number, number, number][];
}

interface CADData {
  metadata: {
    layers: string[];
    units: number;
    total_entities: number;
  };
  security_devices: CADEntity[];
  text_annotations: CADEntity[];
  dimensions: CADEntity[];
  wiring: CADEntity[];
  totalDevices?: number; // 添加可选的totalDevices字段
}

interface AnalysisResult {
  filename: string;
  time: string;
  preview?: string;
  metadata: {
    layers: string[];
    units: number;
    total_entities: number;
  } | null;
  analysis: string;
  raw_data: CADData | null;
  isImage: boolean;
  imageData?: string;
  reportUrl?: string;
}

export function CADAnalyzerContainer() {
  const { toast } = useToast();
  const { t } = useLanguage();

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('upload');
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(
    null
  );
  const [showImageModal, setShowImageModal] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 从localStorage加载分析结果
  useEffect(() => {
    try {
      // 只在组件挂载时加载一次
      const savedResults = localStorage.getItem('cad_analysis_results');
      const savedCurrentResult = localStorage.getItem('cad_current_result');

      if (savedResults) {
        const parsedResults = JSON.parse(savedResults);
        // 确保时间戳是Date对象
        const processedResults = parsedResults.map((result: unknown) => {
          const typedResult = result as AnalysisResult;
          return {
            ...typedResult,
            time: typedResult.time || new Date().toLocaleString(),
          };
        });
        console.log('从localStorage恢复CAD分析结果:', processedResults.length);
        setAnalysisResults(processedResults);
      }

      if (savedCurrentResult) {
        const parsedCurrentResult = JSON.parse(savedCurrentResult);
        console.log('从localStorage恢复当前CAD分析结果');
        setCurrentResult(parsedCurrentResult);

        // 如果有当前结果，自动切换到结果标签页
        if (parsedCurrentResult) {
          setActiveTab('results');
        }
      }
    } catch (error) {
      console.error('从localStorage恢复CAD分析结果失败:', error);
    }
  }, []);

  // 模拟进度条
  useEffect(() => {
    if (isLoading && progress < 95) {
      const timer = setTimeout(() => {
        setProgress(prev => {
          const increment = Math.random() * 10;
          return Math.min(prev + increment, 95);
        });
      }, 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isLoading, progress]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log('handleFileUpload 被调用', event);
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log('没有选择文件');
      return;
    }

    console.log(
      `选择了 ${files.length} 个文件:`,
      Array.from(files).map(f => f.name)
    );
    setIsLoading(true);
    setProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        const isImageFile = [
          'jpg',
          'jpeg',
          'png',
          'gif',
          'bmp',
          'webp',
        ].includes(fileExtension);
        const isCADFile = ['dxf', 'dwg'].includes(fileExtension);
        if (!isImageFile && !isCADFile) {
          toast({
            title: '不支持的文件格式',
            description: '请上传DXF、DWG格式的CAD文件或JPG、PNG等图片文件',
            variant: 'destructive',
          });
          continue;
        }
        // === 后端API分析 ===
        console.log(`开始上传文件: ${file.name}, 大小: ${file.size} 字节`);
        const formData = new FormData();
        formData.append('file', file);
        // 添加管理员token头，确保API调用成功
        console.log('发送API请求...');

        try {
          const res = await fetch('/api/cad-analyzer/analyze', {
            method: 'POST',
            headers: {
              'x-admin-token': 'admin123', // 使用环境变量中配置的默认值
            },
            body: formData,
          });

          let data;
          try {
            // 尝试解析响应为JSON
            data = await res.json();
            console.log('API响应数据:', data);
            // 检查是否有错误
            if (!res.ok || data.error) {
              const errorMessage =
                data.error || `API请求失败: ${res.status} ${res.statusText}`;
              const detailMessage = data.detail ? `(${data.detail})` : '';
              console.error(`API请求失败: ${errorMessage} ${detailMessage}`);

              toast({
                title: '分析失败',
                description: `${errorMessage} ${detailMessage}`,
                variant: 'destructive',
              });
              continue;
            }
          } catch (parseError) {
            // JSON解析失败，尝试获取文本响应
            const errorText = await res.text();
            console.error(`API响应解析失败: ${parseError}`, errorText);
            toast({
              title: '分析失败',
              description: '服务器响应格式错误，请稍后重试',
              variant: 'destructive',
            });
            continue;
          }

          console.log('API请求成功，正在处理响应...');

          // 打印API返回的数据，用于调试
          console.log('API返回的完整数据:', data);

          // 检查preview_image是否存在
          if (data.preview_image) {
            console.log(
              '发现preview_image字段:',
              data.preview_image.substring(0, 100) + '...'
            );
          } else {
            console.log('未找到preview_image字段');
          }

          const resultData = {
            filename: file.name,
            time: new Date().toLocaleString(),
            preview: data.preview_image || data.url, // 优先使用preview_image
            metadata: data.metadata || null,
            analysis: data.analysis,
            raw_data: data.structured || data.raw_data || null, // 使用structured数据或raw_data作为raw_data
            isImage: isImageFile,
            imageData: isImageFile ? data.url : undefined,
            reportUrl: data.reportUrl,
          };

          // 更新状态
          setAnalysisResults(prev => {
            const newResults = [resultData, ...prev];

            // 保存到localStorage
            try {
              localStorage.setItem(
                'cad_analysis_results',
                JSON.stringify(newResults)
              );
              console.log(
                '已保存CAD分析结果到localStorage:',
                newResults.length
              );
            } catch (error) {
              console.error('保存CAD分析结果到localStorage失败:', error);
            }

            return newResults;
          });

          // 更新当前结果
          setCurrentResult(resultData);

          // 保存当前结果到localStorage
          try {
            localStorage.setItem(
              'cad_current_result',
              JSON.stringify(resultData)
            );
            console.log('已保存当前CAD分析结果到localStorage');
          } catch (error) {
            console.error('保存当前CAD分析结果到localStorage失败:', error);
          }

          setProgress(100);
        } catch (uploadError) {
          console.error('文件上传或处理失败:', uploadError);
          toast({
            title: '处理失败',
            description:
              uploadError instanceof Error
                ? uploadError.message
                : '文件处理过程中发生错误',
            variant: 'destructive',
          });
          continue;
        }
      }

      // Switch to results tab if we have results
      if (analysisResults.length > 0 || currentResult) {
        setActiveTab('results');
      }
    } catch (error) {
      console.error('处理文件时出错:', error);
      toast({
        title: '处理失败',
        description:
          error instanceof Error
            ? error.message
            : '解析文件时发生错误，请检查文件格式是否正确',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setProgress(100);

      // Reset file input
      if (fileInputRef.current) {
        try {
          fileInputRef.current.value = '';
        } catch (e) {
          console.error('重置文件输入框失败:', e);
        }
      }

      // Reset progress bar
      try {
        setTimeout(() => setProgress(0), 1000);
      } catch (e) {
        console.error('重置进度条失败:', e);
      }
    }
  };

  // 处理图片点击，打开放大查看模态框
  const handleImageClick = (imageUrl: string) => {
    setExpandedImage(imageUrl);
    setShowImageModal(true);
  };

  // 下载分析报告
  const downloadReport = (result: AnalysisResult) => {
    const reportData = {
      filename: result.filename,
      analysis: result.analysis,
      devices: result.raw_data?.security_devices?.map(d => d.name) || [],
      metadata: result.metadata,
      timestamp: result.time,
      isImage: result.isImage,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.filename.split('.')[0]}_安防分析报告.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 清除分析结果
  const clearAnalysisResults = () => {
    // 确认是否要清除
    if (window.confirm('确定要清除所有分析记录吗？此操作不可恢复。')) {
      // 清除状态
      setAnalysisResults([]);
      setCurrentResult(null);

      // 清除localStorage
      try {
        localStorage.removeItem('cad_analysis_results');
        localStorage.removeItem('cad_current_result');
        console.log('已清除CAD分析结果');

        // 显示成功提示
        toast({
          title: '清除成功',
          description: '所有CAD分析记录已清除',
          variant: 'default',
        });

        // 切换到上传标签页
        setActiveTab('upload');
      } catch (error) {
        console.error('清除CAD分析结果失败:', error);

        // 显示错误提示
        toast({
          title: '清除失败',
          description: '清除CAD分析记录时出错',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className='flex flex-col h-full relative'>
      {/* 图片放大查看模态框 */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className='max-w-5xl w-full p-0 overflow-hidden bg-transparent border-none'>
          {/* 添加DialogTitle但使用sr-only类使其只对屏幕阅读器可见 */}
          <DialogTitle className='sr-only'>CAD图纸预览</DialogTitle>
          <div className='relative w-full h-full max-h-[80vh] flex items-center justify-center'>
            {expandedImage && (
              <Image
                src={expandedImage}
                alt='放大查看'
                width={1200}
                height={800}
                className='max-w-full max-h-[80vh] object-contain'
                style={{ objectFit: 'contain' }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              />
            )}
            <button
              className='absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70'
              onClick={() => setShowImageModal(false)}
            >
              <X className='h-6 w-6' />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ScrollArea className='flex-1 px-2 sm:px-4 py-4 sm:py-6'>
        <div className='max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-20'>
          <Card className='shadow-lg border-pantone369-100 dark:border-pantone369-900/30 overflow-hidden'>
            <CardHeader className='bg-gradient-to-r from-pantone369-50 to-pantone369-100 dark:from-pantone369-900/20 dark:to-pantone369-900/30 p-3 sm:p-4'>
              <CardTitle className='text-lg sm:text-2xl font-bold flex items-center gap-2'>
                <FileText className='h-5 w-5 sm:h-6 sm:w-6 text-pantone369-500' />
                CAD解读智能体
              </CardTitle>
              <CardDescription className='text-sm'>
                专业CAD图纸解析工具，识别安防设备布局并提供详细分析报告
              </CardDescription>
            </CardHeader>

            <CardContent className='p-3 sm:p-6'>
              <Tabs
                defaultValue='upload'
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className='grid grid-cols-2 w-full mb-4 sm:mb-6 bg-pantone369-50 dark:bg-pantone369-900/20'>
                  <TabsTrigger
                    value='upload'
                    disabled={isLoading}
                    className='data-[state=active]:bg-pantone369-100 dark:data-[state=active]:bg-pantone369-800/30 text-xs sm:text-sm py-1.5 sm:py-2'
                  >
                    上传文件
                  </TabsTrigger>
                  <TabsTrigger
                    value='results'
                    disabled={analysisResults.length === 0}
                    className='data-[state=active]:bg-pantone369-100 dark:data-[state=active]:bg-pantone369-800/30 text-xs sm:text-sm py-1.5 sm:py-2'
                  >
                    分析结果 ({analysisResults.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='upload'>
                  <div className='space-y-4 sm:space-y-6'>
                    <Alert className='bg-pantone369-50 dark:bg-pantone369-900/20 border-pantone369-200 dark:border-pantone369-800/30 text-xs sm:text-sm'>
                      <Info className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-pantone369-500' />
                      <AlertTitle className='text-sm sm:text-base'>
                        {t('instructions')}
                      </AlertTitle>
                      <AlertDescription className='text-xs sm:text-sm'>
                        {t('uploadInstructions')}
                      </AlertDescription>
                    </Alert>

                    <div
                      className={cn(
                        'border-2 border-dashed rounded-lg p-3 sm:p-12 text-center',
                        'transition-colors duration-200',
                        isLoading
                          ? 'border-primary bg-primary/5'
                          : 'border-pantone369-200 dark:border-pantone369-800/30',
                        'hover:border-pantone369-500 hover:bg-pantone369-50 dark:hover:bg-pantone369-900/10',
                        'touch-auto cursor-pointer' // Added for better touch handling
                      )}
                      onClick={() =>
                        !isLoading && fileInputRef.current?.click()
                      }
                    >
                      <input
                        ref={fileInputRef}
                        type='file'
                        className='hidden'
                        accept='.dxf,.dwg,.jpg,.jpeg,.png,.gif,.bmp,.webp'
                        multiple
                        onChange={e => {
                          console.log('文件选择事件触发', e.target.files);
                          handleFileUpload(e);
                        }}
                        disabled={isLoading}
                        id='cad-file-input'
                      />

                      {isLoading ? (
                        <div className='flex flex-col items-center gap-3 sm:gap-4'>
                          <Loader2 className='h-7 sm:h-12 w-7 sm:w-12 text-pantone369-500 animate-spin' />
                          <div>
                            <p className='text-sm sm:text-lg font-medium mb-2'>
                              {t('processing')}
                            </p>
                            <p className='text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4'>
                              {t('pleaseWait')}
                            </p>
                            <Progress
                              value={progress}
                              className='w-full sm:w-[300px] mx-auto'
                            />
                          </div>
                        </div>
                      ) : (
                        <div className='flex flex-col items-center gap-3 sm:gap-4'>
                          <div className='flex gap-3 sm:gap-4'>
                            <div className='p-2 sm:p-4 rounded-full bg-pantone369-100 dark:bg-pantone369-900/30'>
                              <FileText className='h-5 sm:h-10 w-5 sm:w-10 text-pantone369-500' />
                            </div>
                            <div className='p-2 sm:p-4 rounded-full bg-pantone369-100 dark:bg-pantone369-900/30'>
                              <ImageIcon className='h-5 sm:h-10 w-5 sm:w-10 text-pantone369-500' />
                            </div>
                          </div>
                          <div>
                            <p className='text-sm sm:text-lg font-medium mb-1 sm:mb-2'>
                              {t('dragAndDrop')}
                            </p>
                            <p className='text-xs sm:text-sm text-muted-foreground'>
                              {t('supportedFormats')}: DXF, DWG
                            </p>
                          </div>
                          <Button
                            type='button'
                            className='mt-3 sm:mt-4 bg-pantone369-500 hover:bg-pantone369-600 text-white flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-10'
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('选择文件按钮被点击');
                              if (fileInputRef.current) {
                                fileInputRef.current.click();
                              } else {
                                console.error('文件输入引用为空');
                              }
                            }}
                          >
                            <Upload className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
                            {t('selectFile')}
                          </Button>
                        </div>
                      )}
                    </div>

                    {analysisResults.length > 0 && (
                      <div className='mt-6 sm:mt-8'>
                        <div className='flex justify-between items-center mb-3 sm:mb-4'>
                          <h3 className='text-base sm:text-lg font-medium flex items-center'>
                            <FileText className='h-4 w-4 sm:h-5 sm:w-5 text-pantone369-500 mr-2' />
                            {t('historicalRecords')}
                          </h3>
                          <Button
                            variant='outline'
                            size='sm'
                            className='text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-7 sm:h-8'
                            onClick={clearAnalysisResults}
                          >
                            清除记录
                          </Button>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4'>
                          {analysisResults.map((result, index) => (
                            <Card
                              key={index}
                              className='overflow-hidden border-pantone369-100 dark:border-pantone369-900/30 hover:shadow-md transition-shadow'
                            >
                              <CardHeader className='p-3 sm:p-4 bg-pantone369-50/50 dark:bg-pantone369-900/10'>
                                <CardTitle className='text-sm sm:text-base'>
                                  {result.filename}
                                </CardTitle>
                                <CardDescription className='text-xs sm:text-sm'>
                                  {result.time}
                                </CardDescription>
                              </CardHeader>
                              <CardFooter className='p-3 sm:p-4 pt-2 sm:pt-3 flex justify-between'>
                                <Badge
                                  variant='outline'
                                  className='bg-pantone369-50 dark:bg-pantone369-900/20 text-pantone369-700 dark:text-pantone369-300 border-pantone369-200 dark:border-pantone369-800/30 text-xs'
                                >
                                  {result.isImage
                                    ? '图片分析'
                                    : `${result.raw_data?.totalDevices || result.raw_data?.security_devices?.length || 0} 个安防设备`}
                                </Badge>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='text-pantone369-600 hover:text-pantone369-700 hover:bg-pantone369-50 text-xs h-7 sm:h-8'
                                  onClick={() => {
                                    // 设置当前结果
                                    setCurrentResult(result);

                                    // 保存当前结果到localStorage
                                    try {
                                      localStorage.setItem(
                                        'cad_current_result',
                                        JSON.stringify(result)
                                      );
                                      console.log(
                                        '已保存当前CAD分析结果到localStorage'
                                      );
                                    } catch (error) {
                                      console.error(
                                        '保存当前CAD分析结果到localStorage失败:',
                                        error
                                      );
                                    }

                                    setActiveTab('results');
                                  }}
                                >
                                  {t('viewAnalysis')}
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value='results'>
                  {currentResult ? (
                    <div className='space-y-4 sm:space-y-6'>
                      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0'>
                        <div>
                          <h2 className='text-lg sm:text-2xl font-bold'>
                            {currentResult.filename}
                          </h2>
                          <p className='text-xs sm:text-sm text-muted-foreground'>
                            {currentResult.time}
                          </p>
                          <Badge
                            variant='outline'
                            className='mt-2 bg-pantone369-50 dark:bg-pantone369-900/20 text-pantone369-700 dark:text-pantone369-300 border-pantone369-200 dark:border-pantone369-800/30 text-xs'
                          >
                            {currentResult.isImage ? '图片分析' : 'CAD文件分析'}
                          </Badge>
                        </div>
                        <Button
                          variant='outline'
                          className='flex items-center gap-2 border-pantone369-200 dark:border-pantone369-800/30 hover:bg-pantone369-50 dark:hover:bg-pantone369-900/20 text-pantone369-700 dark:text-pantone369-300 text-xs sm:text-sm h-8 sm:h-9 mt-2 sm:mt-0'
                          onClick={() => downloadReport(currentResult)}
                        >
                          <Download className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
                          {t('downloadAnalysisReport')}
                        </Button>
                      </div>

                      <Separator className='bg-pantone369-200 dark:bg-pantone369-800/30' />

                      <div className='grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3'>
                        <div className='md:col-span-1'>
                          <Card className='border-pantone369-100 dark:border-pantone369-900/30'>
                            <CardHeader className='bg-pantone369-50/50 dark:bg-pantone369-900/10 p-3 sm:p-4'>
                              <CardTitle className='text-sm sm:text-lg'>
                                {currentResult.isImage
                                  ? t('imagePreview')
                                  : t('cadPreview')}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className='p-3 sm:p-4'>
                              <div className='aspect-square bg-muted rounded-md overflow-hidden border border-pantone369-100 dark:border-pantone369-900/30'>
                                {currentResult.preview ||
                                currentResult.imageData ? (
                                  <>
                                    {/* 打印预览图URL，用于调试 */}
                                    {console.log(
                                      '显示预览图:',
                                      currentResult.preview ||
                                        currentResult.imageData
                                    )}
                                    <div
                                      className='relative w-full h-full group cursor-pointer'
                                      onClick={() =>
                                        handleImageClick(
                                          currentResult.preview ||
                                            currentResult.imageData ||
                                            '/placeholder.svg'
                                        )
                                      }
                                    >
                                      <Image
                                        src={
                                          currentResult.preview ||
                                          currentResult.imageData ||
                                          '/placeholder.svg'
                                        }
                                        alt={
                                          currentResult.isImage
                                            ? '图片预览'
                                            : 'CAD预览'
                                        }
                                        width={400}
                                        height={300}
                                        className='w-full h-full object-contain'
                                        style={{ objectFit: 'contain' }}
                                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                          console.error('预览图加载失败:', e);
                                          // 如果图片加载失败，显示占位图
                                          e.currentTarget.src =
                                            '/placeholder.svg';
                                        }}
                                      />
                                      <div className='absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity'>
                                        <Maximize2 className='h-8 w-8 text-white' />
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <div className='w-full h-full flex items-center justify-center'>
                                    <p className='text-xs sm:text-sm text-muted-foreground'>
                                      {t('noPreview')}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {!currentResult.isImage &&
                                currentResult.metadata && (
                                  <div className='mt-3 sm:mt-4 space-y-1 sm:space-y-2'>
                                    <div className='flex justify-between'>
                                      <span className='text-xs sm:text-sm font-medium'>
                                        {t('totalEntities')}:
                                      </span>
                                      <span className='text-xs sm:text-sm'>
                                        {currentResult.metadata
                                          ?.total_entities || 0}
                                      </span>
                                    </div>
                                    <div className='flex justify-between'>
                                      <span className='text-xs sm:text-sm font-medium'>
                                        {t('securityDeviceCount')}:
                                      </span>
                                      <span className='text-xs sm:text-sm'>
                                        {currentResult.raw_data?.totalDevices ||
                                          currentResult.raw_data
                                            ?.security_devices?.length ||
                                          0}
                                      </span>
                                    </div>
                                    <div className='flex justify-between'>
                                      <span className='text-xs sm:text-sm font-medium'>
                                        {t('wireCount')}:
                                      </span>
                                      <span className='text-xs sm:text-sm'>
                                        {currentResult.raw_data?.wiring
                                          ?.length || 0}
                                      </span>
                                    </div>
                                  </div>
                                )}

                              {!currentResult.isImage &&
                                currentResult.metadata && (
                                  <>
                                    <Separator className='my-3 sm:my-4 bg-pantone369-200 dark:bg-pantone369-800/30' />
                                    <div>
                                      <h4 className='text-xs sm:text-sm font-medium mb-1 sm:mb-2'>
                                        {t('layerInfo')}:
                                      </h4>
                                      <div className='flex flex-wrap gap-1 sm:gap-2'>
                                        {currentResult.metadata?.layers?.map(
                                          (layer, index) => (
                                            <Badge
                                              key={index}
                                              variant='outline'
                                              className='bg-pantone369-50 dark:bg-pantone369-900/20 text-pantone369-700 dark:text-pantone369-300 border-pantone369-200 dark:border-pantone369-800/30 text-xs'
                                            >
                                              {layer}
                                            </Badge>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )}
                            </CardContent>
                          </Card>
                        </div>

                        <div className='md:col-span-2'>
                          <Card className='border-pantone369-100 dark:border-pantone369-900/30'>
                            <CardHeader className='bg-pantone369-50/50 dark:bg-pantone369-900/10 p-3 sm:p-4'>
                              <CardTitle className='text-sm sm:text-lg'>
                                {t('securitySystemAnalysisReport')}
                              </CardTitle>
                              {currentResult.isImage && (
                                <CardDescription className='text-xs sm:text-sm'>
                                  {t('multimodalAnalysis')}
                                </CardDescription>
                              )}
                            </CardHeader>
                            <CardContent className='p-3 sm:p-6'>
                              <div className='prose prose-sm max-w-none text-xs sm:text-sm'>
                                <MarkdownMessage
                                  content={currentResult.analysis}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      <Alert className='bg-pantone369-50 dark:bg-pantone369-900/20 border-pantone369-200 dark:border-pantone369-800/30 text-xs sm:text-sm'>
                        <CheckCircle2 className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-pantone369-500' />
                        <AlertTitle className='text-sm sm:text-base'>
                          {t('analysisComplete')}
                        </AlertTitle>
                        <AlertDescription className='text-xs sm:text-sm'>
                          {currentResult.isImage
                            ? t('imageAnalysis')
                            : t('cadFileAnalysis')}
                          {t('analysisComplete')}
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <div className='text-center py-8 sm:py-12'>
                      <AlertCircle className='h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4' />
                      <h3 className='text-base sm:text-lg font-medium mb-1 sm:mb-2'>
                        {t('noAnalysisResults')}
                      </h3>
                      <p className='text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6'>
                        {t('uploadFirst')}
                      </p>
                      <Button
                        onClick={() => setActiveTab('upload')}
                        className='bg-pantone369-500 hover:bg-pantone369-600 text-white text-xs sm:text-sm h-8 sm:h-9'
                      >
                        {t('uploadFile')}
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
  );
}
