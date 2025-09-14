'use client';

import { useState, useEffect } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('lg');
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // 初始化宽度
    setWidth(window.innerWidth);

    // 设置初始断点
    updateBreakpoint(window.innerWidth);

    // 添加窗口大小变化监听
    const handleResize = () => {
      setWidth(window.innerWidth);
      updateBreakpoint(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 根据宽度更新断点
  const updateBreakpoint = (width: number) => {
    if (width < 640) {
      setBreakpoint('xs');
    } else if (width >= 640 && width < 768) {
      setBreakpoint('sm');
    } else if (width >= 768 && width < 1024) {
      setBreakpoint('md');
    } else if (width >= 1024 && width < 1280) {
      setBreakpoint('lg');
    } else if (width >= 1280 && width < 1536) {
      setBreakpoint('xl');
    } else {
      setBreakpoint('2xl');
    }
  };

  // 断点检查函数
  const isXs = breakpoint === 'xs';
  const isSm = breakpoint === 'sm';
  const isMd = breakpoint === 'md';
  const isLg = breakpoint === 'lg';
  const isXl = breakpoint === 'xl';
  const is2xl = breakpoint === '2xl';

  // 断点范围检查
  const isSmAndUp = width >= 640;
  const isMdAndUp = width >= 768;
  const isLgAndUp = width >= 1024;
  const isXlAndUp = width >= 1280;
  const is2xlAndUp = width >= 1536;

  const isSmAndDown = width < 768;
  const isMdAndDown = width < 1024;
  const isLgAndDown = width < 1280;
  const isXlAndDown = width < 1536;

  return {
    width,
    breakpoint,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
    isSmAndUp,
    isMdAndUp,
    isLgAndUp,
    isXlAndUp,
    is2xlAndUp,
    isSmAndDown,
    isMdAndDown,
    isLgAndDown,
    isXlAndDown,
  };
}
