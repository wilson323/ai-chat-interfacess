'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAgent } from '@/context/agent-context';
import {
  Upload,
  ImageIcon,
  Paintbrush,
  Crosshair,
  Loader2,
  Check,
  RefreshCw,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

interface Coordinate {
  x: number;
  y: number;
  id: number;
}

interface EditOperation {
  id: string;
  type: 'brush' | 'coordinate';
  timestamp: Date;
  thumbnail: string; // Base64 thumbnail
  brushColor?: string;
  brushSize?: number;
  coordinates?: Coordinate[];
}

const COLORS = [
  '#ff0000', // Red
  '#00ff00', // Green
  '#0000ff', // Blue
  '#ffff00', // Yellow
  '#ff00ff', // Magenta
  '#00ffff', // Cyan
  '#ffffff', // White
  '#000000', // Black
  '#ff8000', // Orange
];

export function ImageEditorContainer() {
  const { selectedAgent } = useAgent();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const [activeTool, setActiveTool] = useState<'brush' | 'coordinate' | null>(
    null
  );
  const [brushColor, setBrushColor] = useState('#ff0000');
  const [brushSize, setBrushSize] = useState(10);
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [operations, setOperations] = useState<EditOperation[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize canvas when source image is loaded
  useEffect(() => {
    if (sourceImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctxRef.current = ctx;

        const img = new Image();
        img.onload = () => {
          // Set canvas dimensions to match image
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw image on canvas
          ctx.drawImage(img, 0, 0);
        };
        img.src = sourceImage;
      }
    }
  }, [sourceImage]);

  // Handle file upload
  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    isReference = false
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        if (isReference) {
          setReferenceImage(result);
        } else {
          setSourceImage(result);
          setEditedImage(null);
          setShowResult(false);
          setCoordinates([]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle mouse/touch events for drawing
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (activeTool !== 'brush' || !ctxRef.current) return;

    setIsDrawing(true);

    // 防止触摸事件引起页面滚动
    if ('touches' in e) {
      e.preventDefault();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;

    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
    ctxRef.current.lineWidth = brushSize;
    ctxRef.current.lineCap = 'round';
    ctxRef.current.strokeStyle = brushColor;
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || activeTool !== 'brush' || !ctxRef.current) return;

    // 防止触摸事件引起页面滚动
    if ('touches' in e) {
      e.preventDefault();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;

    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;

      // Prevent scrolling while drawing
      e.preventDefault();
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && ctxRef.current && canvasRef.current) {
      ctxRef.current.closePath();
      setIsDrawing(false);

      // Save operation
      const canvas = canvasRef.current;
      const thumbnail = canvas.toDataURL('image/jpeg', 0.1); // Low quality for thumbnail

      const newOperation: EditOperation = {
        id: Date.now().toString(),
        type: 'brush',
        timestamp: new Date(),
        thumbnail,
        brushColor,
        brushSize,
      };

      setOperations(prev => [...prev, newOperation]);
    }
  };

  // Handle coordinate marking
  const markCoordinate = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (activeTool !== 'coordinate' || !ctxRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;

    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = Math.round((clientX - rect.left) * scaleX);
    const y = Math.round((clientY - rect.top) * scaleY);

    // Add coordinate
    const newCoordinate: Coordinate = {
      x,
      y,
      id: coordinates.length + 1,
    };

    setCoordinates(prev => [...prev, newCoordinate]);

    // Draw coordinate marker
    ctxRef.current.fillStyle = '#6cb33f';
    ctxRef.current.beginPath();
    ctxRef.current.arc(x, y, 5, 0, 2 * Math.PI);
    ctxRef.current.fill();

    // Draw coordinate number
    ctxRef.current.fillStyle = '#FFFFFF';
    ctxRef.current.font = 'bold 10px Arial';
    ctxRef.current.textAlign = 'center';
    ctxRef.current.textBaseline = 'middle';
    ctxRef.current.fillText(newCoordinate.id.toString(), x, y);

    // Save operation
    const thumbnail = canvas.toDataURL('image/jpeg', 0.1); // Low quality for thumbnail

    const newOperation: EditOperation = {
      id: Date.now().toString(),
      type: 'coordinate',
      timestamp: new Date(),
      thumbnail,
      coordinates: [...coordinates, newCoordinate],
    };

    setOperations(prev => [...prev, newOperation]);
  };

  // Handle API call for image editing
  const handleConfirmEdit = () => {
    if (!sourceImage) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // In a real implementation, this would call the API with the edited image
      setEditedImage(sourceImage); // Just using source image as placeholder
      setIsLoading(false);
      setShowResult(true);
    }, 2000);
  };

  // Handle saving the edited image
  const handleSaveImage = () => {
    if (!editedImage) return;

    const link = document.createElement('a');
    link.href = editedImage;
    link.download = 'edited-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: '图片已保存',
      description: '编辑后的图片已成功保存到您的设备',
    });
  };

  // Handle continue editing
  const handleContinueEditing = () => {
    setShowResult(false);
  };

  // Render coordinate info
  const renderCoordinateInfo = () => {
    if (coordinates.length === 0) return null;

    return (
      <div className='absolute left-4 bottom-4 bg-background/80 backdrop-blur-sm p-2 rounded-md border shadow-sm'>
        <h4 className='text-xs font-medium mb-1'>{t('coordinateMarker')}</h4>
        <div className='max-h-24 overflow-y-auto'>
          {coordinates.map(coord => (
            <div
              key={coord.id}
              className='text-xs flex items-center gap-2 mb-1'
            >
              <Badge variant='outline' className='h-4 px-1'>
                {coord.id}
              </Badge>
              <span>
                x: {coord.x}, y: {coord.y}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className='flex flex-col h-full relative'>
      <ScrollArea className='flex-1 px-4 py-6'>
        <div className='max-w-3xl mx-auto space-y-6 pb-20'>
          {!sourceImage ? (
            <div className='flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-muted-foreground/20'>
              <div className='mb-4 text-center'>
                <h3 className='text-lg font-medium mb-2'>
                  {t('welcomeImageEditor')}
                </h3>
                <p className='text-muted-foreground'>
                  {t('uploadImageToEdit')}
                </p>
              </div>

              <div className='flex flex-col sm:flex-row gap-4 mt-4'>
                <Button
                  className='flex items-center gap-2 bg-pantone369-500 hover:bg-pantone369-600 text-white'
                  onClick={() =>
                    document.getElementById('upload-image')?.click()
                  }
                >
                  <Upload className='h-4 w-4' />
                  {t('uploadImageToEdit')}
                </Button>

                <Button
                  variant='outline'
                  className='flex items-center gap-2'
                  onClick={() =>
                    document.getElementById('upload-reference')?.click()
                  }
                >
                  <ImageIcon className='h-4 w-4' />
                  {t('uploadReferenceImage')}
                </Button>
              </div>

              <input
                type='file'
                id='upload-image'
                className='hidden'
                accept='image/*'
                onChange={e => handleImageUpload(e)}
              />

              <input
                type='file'
                id='upload-reference'
                className='hidden'
                accept='image/*'
                onChange={e => handleImageUpload(e, true)}
              />
            </div>
          ) : (
            <div className='space-y-4'>
              {/* Image editing area */}
              <div
                ref={canvasContainerRef}
                className={cn(
                  "relative border rounded-lg overflow-hidden bg-[url('/placeholder.svg?height=20&width=20')] bg-repeat",
                  'flex items-center justify-center',
                  isLoading && 'opacity-50'
                )}
              >
                <canvas
                  ref={canvasRef}
                  className='max-w-full h-auto touch-none'
                  onMouseDown={
                    activeTool === 'brush'
                      ? startDrawing
                      : activeTool === 'coordinate'
                        ? markCoordinate
                        : undefined
                  }
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={
                    activeTool === 'brush'
                      ? startDrawing
                      : activeTool === 'coordinate'
                        ? markCoordinate
                        : undefined
                  }
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />

                {renderCoordinateInfo()}

                {/* Loading overlay */}
                {isLoading && (
                  <div className='absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm'>
                    <div className='flex flex-col items-center gap-2'>
                      <Loader2 className='h-8 w-8 animate-spin text-primary' />
                      <p className='text-sm font-medium'>{t('processing')}</p>
                    </div>
                  </div>
                )}

                {/* Result overlay */}
                {showResult && editedImage && (
                  <div className='absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm'>
                    <img
                      src={editedImage || '/placeholder.svg'}
                      alt='Edited'
                      className='max-w-full max-h-[70vh] object-contain animate-fadeIn'
                    />

                    <div className='mt-4 p-3 bg-background/80 backdrop-blur-md rounded-lg border shadow-md animate-fadeIn'>
                      <p className='text-center font-medium mb-3'>
                        {t('imageEditSuccess')}
                      </p>
                      <div className='flex gap-3'>
                        <Button
                          variant='default'
                          className='flex items-center gap-2'
                          onClick={handleSaveImage}
                        >
                          <Download className='h-4 w-4' />
                          {t('saveImage')}
                        </Button>

                        <Button
                          variant='outline'
                          className='flex items-center gap-2'
                          onClick={handleContinueEditing}
                        >
                          <RefreshCw className='h-4 w-4' />
                          {t('continueEditing')}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tools */}
              <div className='flex flex-wrap gap-2 sm:gap-3 items-center'>
                <div className='flex items-center gap-1 sm:gap-2'>
                  <Button
                    variant={activeTool === 'brush' ? 'default' : 'outline'}
                    className={cn(
                      'flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9',
                      activeTool === 'brush'
                        ? 'bg-pantone369-500 hover:bg-pantone369-600 text-white'
                        : 'border-pantone369-200 dark:border-pantone369-800/30 text-pantone369-700 dark:text-pantone369-300 hover:bg-pantone369-50 dark:hover:bg-pantone369-900/20'
                    )}
                    size='sm'
                    onClick={() =>
                      setActiveTool(activeTool === 'brush' ? null : 'brush')
                    }
                  >
                    <Paintbrush className='h-3 w-3 sm:h-4 sm:w-4' />
                    <span className='hidden xs:inline'>{t('brushTool')}</span>
                  </Button>

                  <Button
                    variant={
                      activeTool === 'coordinate' ? 'default' : 'outline'
                    }
                    className={cn(
                      'flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9',
                      activeTool === 'coordinate'
                        ? 'bg-pantone369-500 hover:bg-pantone369-600 text-white'
                        : 'border-pantone369-200 dark:border-pantone369-800/30 text-pantone369-700 dark:text-pantone369-300 hover:bg-pantone369-50 dark:hover:bg-pantone369-900/20'
                    )}
                    size='sm'
                    onClick={() =>
                      setActiveTool(
                        activeTool === 'coordinate' ? null : 'coordinate'
                      )
                    }
                  >
                    <Crosshair className='h-3 w-3 sm:h-4 sm:w-4' />
                    <span className='hidden xs:inline'>
                      {t('coordinateTool')}
                    </span>
                  </Button>
                </div>

                {activeTool === 'brush' && (
                  <div className='flex items-center gap-2 sm:gap-3 ml-auto flex-wrap'>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          size='sm'
                          className='flex items-center gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3'
                        >
                          <div
                            className='w-3 h-3 sm:w-4 sm:h-4 rounded-full'
                            style={{ backgroundColor: brushColor }}
                          />
                          <span className='hidden xs:inline'>{t('color')}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-48 sm:w-64 p-2 sm:p-3'>
                        <div className='grid grid-cols-3 gap-1 sm:gap-2'>
                          {COLORS.map(color => (
                            <button
                              key={color}
                              className={cn(
                                'w-full h-6 sm:h-8 rounded-md transition-all',
                                brushColor === color
                                  ? 'ring-2 ring-primary ring-offset-2'
                                  : 'hover:scale-105'
                              )}
                              style={{ backgroundColor: color }}
                              onClick={() => setBrushColor(color)}
                            />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>

                    <div className='flex items-center gap-1 sm:gap-2'>
                      <span className='text-xs sm:text-sm hidden xs:inline'>
                        {t('thickness')}:
                      </span>
                      <Slider
                        value={[brushSize]}
                        min={1}
                        max={50}
                        step={1}
                        className='w-16 sm:w-24'
                        onValueChange={value => setBrushSize(value[0])}
                      />
                      <span className='text-xs sm:text-sm w-4 sm:w-6'>
                        {brushSize}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Reference image (if uploaded) */}
              {referenceImage && (
                <div className='border rounded-lg p-3'>
                  <h4 className='text-sm font-medium mb-2'>
                    {t('referenceImage')}
                  </h4>
                  <img
                    src={referenceImage || '/placeholder.svg'}
                    alt='Reference'
                    className='max-h-40 object-contain'
                  />
                </div>
              )}

              {/* Action buttons */}
              <div className='flex justify-center mt-6'>
                <Button
                  className='flex items-center gap-2 bg-pantone369-500 hover:bg-pantone369-600 text-white px-6'
                  onClick={handleConfirmEdit}
                  disabled={isLoading || !sourceImage}
                >
                  {isLoading ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <Check className='h-4 w-4' />
                  )}
                  {t('confirmEdit')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Right sidebar for operation history */}
      {sourceImage && operations.length > 0 && (
        <div className='absolute right-4 top-20 bottom-24 w-48 bg-background/80 backdrop-blur-xl border rounded-lg shadow-md overflow-hidden'>
          <div className='p-3 border-b'>
            <h3 className='text-sm font-medium'>{t('operationHistory')}</h3>
          </div>

          <ScrollArea className='h-full p-2'>
            <div className='space-y-2'>
              {operations.map(op => (
                <div
                  key={op.id}
                  className='p-2 border rounded-md hover:bg-accent/50 cursor-pointer'
                  title={`${op.type === 'brush' ? '画笔操作' : '坐标标记'} - ${op.timestamp.toLocaleTimeString()}`}
                >
                  <div className='flex items-center gap-2 mb-1'>
                    {op.type === 'brush' ? (
                      <Paintbrush className='h-3 w-3 text-primary' />
                    ) : (
                      <Crosshair className='h-3 w-3 text-primary' />
                    )}
                    <span className='text-xs font-medium'>
                      {op.type === 'brush'
                        ? t('brushOperation')
                        : t('coordinateMarker')}
                    </span>
                  </div>

                  <div className='relative'>
                    <img
                      src={op.thumbnail || '/placeholder.svg'}
                      alt='Operation thumbnail'
                      className='w-full h-20 object-cover rounded-sm'
                    />

                    <div className='absolute bottom-1 right-1 bg-background/70 backdrop-blur-sm rounded px-1 py-0.5'>
                      <span className='text-[10px]'>
                        {op.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {op.type === 'brush' && op.brushColor && (
                    <div className='mt-1 flex items-center gap-1'>
                      <div
                        className='w-2 h-2 rounded-full'
                        style={{ backgroundColor: op.brushColor }}
                      />
                      <span className='text-[10px]'>
                        {t('thickness')}: {op.brushSize}
                      </span>
                    </div>
                  )}

                  {op.type === 'coordinate' && (
                    <div className='mt-1'>
                      <span className='text-[10px]'>
                        {op.coordinates?.length} {t('markers')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
