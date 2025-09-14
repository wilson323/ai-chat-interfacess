'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface CrossPlatformContextType {
  // 设备信息
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isWindows: boolean;
  isMac: boolean;
  isLinux: boolean;

  // 浏览器信息
  isChrome: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  isEdge: boolean;
  isIE: boolean;

  // 功能支持
  supportsTouch: boolean;
  supportsPointer: boolean;
  supportsHover: boolean;
  supportsWebGL: boolean;
  supportsWebRTC: boolean;
  supportsWebSpeech: boolean;
  supportsServiceWorker: boolean;
  supportsPWA: boolean;

  // 屏幕信息
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  orientation: 'portrait' | 'landscape';

  // 网络信息
  connectionType: string;
  isOnline: boolean;
  isSlowConnection: boolean;
}

const CrossPlatformContext = createContext<CrossPlatformContextType | null>(
  null
);

interface CrossPlatformProviderProps {
  children: React.ReactNode;
}

export function CrossPlatformProvider({
  children,
}: CrossPlatformProviderProps) {
  const [contextValue, setContextValue] = useState<CrossPlatformContextType>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isIOS: false,
    isAndroid: false,
    isWindows: false,
    isMac: false,
    isLinux: false,
    isChrome: false,
    isFirefox: false,
    isSafari: false,
    isEdge: false,
    isIE: false,
    supportsTouch: false,
    supportsPointer: false,
    supportsHover: false,
    supportsWebGL: false,
    supportsWebRTC: false,
    supportsWebSpeech: false,
    supportsServiceWorker: false,
    supportsPWA: false,
    screenWidth: 0,
    screenHeight: 0,
    pixelRatio: 1,
    orientation: 'portrait',
    connectionType: 'unknown',
    isOnline: true,
    isSlowConnection: false,
  });

  useEffect(() => {
    const detectPlatform = () => {
      if (typeof window === 'undefined') return;

      const userAgent = navigator.userAgent;
      const platform = navigator.platform;
      const maxTouchPoints = navigator.maxTouchPoints || 0;

      // 设备检测
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent
        ) || maxTouchPoints > 0;
      const isTablet =
        /iPad|Android/i.test(userAgent) && !/Mobile/i.test(userAgent);
      const isDesktop = !isMobile && !isTablet;

      // 操作系统检测
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/i.test(userAgent);
      const isWindows = /Win/i.test(platform);
      const isMac = /Mac/i.test(platform);
      const isLinux = /Linux/i.test(platform);

      // 浏览器检测
      const isChrome = /Chrome/i.test(userAgent) && !/Edge/i.test(userAgent);
      const isFirefox = /Firefox/i.test(userAgent);
      const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);
      const isEdge = /Edge/i.test(userAgent);
      const isIE = /Trident/i.test(userAgent);

      // 功能支持检测
      const supportsTouch = 'ontouchstart' in window || maxTouchPoints > 0;
      const supportsPointer = 'onpointerdown' in window;
      const supportsHover = window.matchMedia('(hover: hover)').matches;
      const supportsWebGL = !!window.WebGLRenderingContext;
      const supportsWebRTC = !!(
        window.RTCPeerConnection || window.webkitRTCPeerConnection
      );
      const supportsWebSpeech =
        'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      const supportsServiceWorker = 'serviceWorker' in navigator;
      const supportsPWA = supportsServiceWorker && 'PushManager' in window;

      // 屏幕信息
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      const pixelRatio = window.devicePixelRatio || 1;
      const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait';

      // 网络信息
      const connection =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;
      const connectionType = connection?.effectiveType || 'unknown';
      const isOnline = navigator.onLine;
      const isSlowConnection =
        connectionType === 'slow-2g' || connectionType === '2g';

      setContextValue({
        isMobile,
        isTablet,
        isDesktop,
        isIOS,
        isAndroid,
        isWindows,
        isMac,
        isLinux,
        isChrome,
        isFirefox,
        isSafari,
        isEdge,
        isIE,
        supportsTouch,
        supportsPointer,
        supportsHover,
        supportsWebGL,
        supportsWebRTC,
        supportsWebSpeech,
        supportsServiceWorker,
        supportsPWA,
        screenWidth,
        screenHeight,
        pixelRatio,
        orientation,
        connectionType,
        isOnline,
        isSlowConnection,
      });
    };

    // 初始检测
    detectPlatform();

    // 监听窗口大小变化
    const handleResize = () => {
      detectPlatform();
    };

    // 监听网络状态变化
    const handleOnline = () => {
      detectPlatform();
    };

    const handleOffline = () => {
      detectPlatform();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <CrossPlatformContext.Provider value={contextValue}>
      {children}
    </CrossPlatformContext.Provider>
  );
}

export function useCrossPlatform() {
  const context = useContext(CrossPlatformContext);
  if (!context) {
    throw new Error(
      'useCrossPlatform must be used within a CrossPlatformProvider'
    );
  }
  return context;
}

// 便捷的Hook
export function useDevice() {
  const { isMobile, isTablet, isDesktop, isIOS, isAndroid } =
    useCrossPlatform();
  return { isMobile, isTablet, isDesktop, isIOS, isAndroid };
}

export function useBrowser() {
  const { isChrome, isFirefox, isSafari, isEdge, isIE } = useCrossPlatform();
  return { isChrome, isFirefox, isSafari, isEdge, isIE };
}

export function useCapabilities() {
  const {
    supportsTouch,
    supportsPointer,
    supportsHover,
    supportsWebGL,
    supportsWebRTC,
    supportsWebSpeech,
    supportsServiceWorker,
    supportsPWA,
  } = useCrossPlatform();
  return {
    supportsTouch,
    supportsPointer,
    supportsHover,
    supportsWebGL,
    supportsWebRTC,
    supportsWebSpeech,
    supportsServiceWorker,
    supportsPWA,
  };
}

export function useScreen() {
  const { screenWidth, screenHeight, pixelRatio, orientation } =
    useCrossPlatform();
  return { screenWidth, screenHeight, pixelRatio, orientation };
}

export function useNetwork() {
  const { connectionType, isOnline, isSlowConnection } = useCrossPlatform();
  return { connectionType, isOnline, isSlowConnection };
}
