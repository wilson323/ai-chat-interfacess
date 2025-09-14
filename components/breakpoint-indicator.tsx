'use client';

import { useResponsive } from '@/hooks/use-responsive';

export function BreakpointIndicator() {
  const { breakpoint, width, isXs, isSm, isMd, isLg, isXl, is2xl } =
    useResponsive();

  // 只在开发环境中显示
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className='fixed bottom-20 right-4 z-50 bg-black/80 text-white text-xs p-2 rounded-md'>
      <div>Width: {width}px</div>
      <div>Breakpoint: {breakpoint}</div>
      <div className='grid grid-cols-6 gap-1 mt-1'>
        <div className={`p-1 rounded ${isXs ? 'bg-green-500' : 'bg-gray-500'}`}>
          xs
        </div>
        <div className={`p-1 rounded ${isSm ? 'bg-green-500' : 'bg-gray-500'}`}>
          sm
        </div>
        <div className={`p-1 rounded ${isMd ? 'bg-green-500' : 'bg-gray-500'}`}>
          md
        </div>
        <div className={`p-1 rounded ${isLg ? 'bg-green-500' : 'bg-gray-500'}`}>
          lg
        </div>
        <div className={`p-1 rounded ${isXl ? 'bg-green-500' : 'bg-gray-500'}`}>
          xl
        </div>
        <div
          className={`p-1 rounded ${is2xl ? 'bg-green-500' : 'bg-gray-500'}`}
        >
          2xl
        </div>
      </div>
    </div>
  );
}
