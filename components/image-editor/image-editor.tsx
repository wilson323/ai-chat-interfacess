import React, { useRef, useState } from 'react';
import { saveEditedImage } from '@/lib/api/user';
import { useToast } from '@/components/ui/toast/use-toast';

interface ImageEditorProps {
  onSave: (
    file: File | Blob,
    meta: { marks: { x: number; y: number }[] }
  ) => void;
  referenceImageUrl?: string;
}

const CANVAS_SIZE = 480;

const ImageEditor: React.FC<ImageEditorProps> = ({
  onSave,
  referenceImageUrl,
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [marks, setMarks] = useState<{ x: number; y: number }[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#ff0000');
  const [brushSize, setBrushSize] = useState(3);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // 加载图片
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new window.Image();
    img.onload = () => setImage(img);
    img.src = URL.createObjectURL(file);
  };

  // 画笔绘制
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    setDrawing(true);
    drawDot(e);
  };
  const handleCanvasMouseUp = () => setDrawing(false);
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (drawing) drawDot(e);
  };
  const drawDot = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.arc(x, y, brushSize, 0, 2 * Math.PI);
      ctx.fillStyle = brushColor;
      ctx.fill();
    }
  };

  // 坐标标记
  const handleMark = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMarks([...marks, { x, y }]);
  };

  // 保存图片
  const handleSave = async () => {
    if (!canvasRef.current) return;
    setSaving(true);
    canvasRef.current.toBlob(async blob => {
      if (blob) {
        try {
          const data = await saveEditedImage(blob, marks);
          toast({
            title: '保存成功',
            description: data.url,
            variant: 'default',
          });
          window.open(data.url, '_blank');
        } catch (e: any) {
          toast({
            title: '保存失败',
            description: e.message,
            variant: 'destructive',
          });
        } finally {
          setSaving(false);
        }
      }
    }, 'image/png');
  };

  // 渲染图片到画布
  React.useEffect(() => {
    if (!image || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.drawImage(image, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    // 重新渲染标记
    marks.forEach(({ x, y }) => {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#00f';
      ctx.fill();
    });
  }, [image, marks]);

  return (
    <div className='flex flex-col gap-4 items-center w-full max-w-lg mx-auto p-4 bg-background rounded-xl shadow-lg'>
      <div className='flex gap-2 w-full justify-between'>
        <input
          type='file'
          accept='image/*'
          ref={fileInputRef}
          onChange={handleFileChange}
          className='hidden'
        />
        <button
          className='px-3 py-1 bg-blue-600 text-white rounded'
          onClick={() => fileInputRef.current?.click()}
        >
          上传图片
        </button>
        <label className='flex items-center gap-1 text-sm'>
          画笔颜色
          <input
            type='color'
            value={brushColor}
            onChange={e => setBrushColor(e.target.value)}
          />
        </label>
        <label className='flex items-center gap-1 text-sm'>
          粗细
          <input
            type='range'
            min={1}
            max={10}
            value={brushSize}
            onChange={e => setBrushSize(Number(e.target.value))}
          />
        </label>
        <button
          className='px-3 py-1 bg-green-600 text-white rounded'
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '保存中...' : '保存编辑'}
        </button>
      </div>
      <div className='relative'>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className='border rounded shadow'
          onMouseDown={handleCanvasMouseDown}
          onMouseUp={handleCanvasMouseUp}
          onMouseMove={handleCanvasMouseMove}
          onDoubleClick={handleMark}
        />
        {referenceImageUrl && (
          <img
            src={referenceImageUrl}
            alt='参考图'
            className='absolute top-0 right-0 w-24 h-24 object-contain border bg-white/80'
          />
        )}
      </div>
      <div className='text-xs text-gray-500'>
        单击画布绘制，双击添加坐标标记，支持参考图上传
      </div>
    </div>
  );
};

export default ImageEditor;
