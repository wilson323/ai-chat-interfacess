/**
 * 懒加载组件工具
 * 提供统一的懒加载功能和性能优化
 */

import {
  lazy,
  Suspense,
  ComponentType,
  ReactNode,
  useRef,
  useEffect,
  useState,
} from 'react';
import { Loader2 } from 'lucide-react';

/**
 * 懒加载组件包装器
 */
export function withLazyLoading<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFunc);

  return function LazyWrapper(props: any) {
    return (
      <Suspense fallback={fallback || <DefaultFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * 默认加载组件
 */
function DefaultFallback() {
  return (
    <div className='flex items-center justify-center p-8'>
      <Loader2 className='h-8 w-8 animate-spin text-primary' />
    </div>
  );
}

/**
 * 自定义加载组件
 */
export function CustomFallback({
  message = '加载中...',
  className = '',
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className='flex flex-col items-center space-y-2'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
        <span className='text-sm text-muted-foreground'>{message}</span>
      </div>
    </div>
  );
}

/**
 * 预加载组件
 */
export function preloadComponent(importFunc: () => Promise<any>) {
  return () => {
    importFunc();
  };
}

/**
 * 懒加载容器组件
 * 当组件进入视口时才加载
 */
export function LazyContainer({
  children,
  fallback,
  rootMargin = '100px',
  threshold = 0.1,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  useEffect(() => {
    if (isVisible) {
      // 延迟加载，避免阻塞渲染
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <div ref={ref}>{isLoaded ? children : fallback || <DefaultFallback />}</div>
  );
}

/**
 * 懒加载图片组件
 */
export function LazyImage({
  src,
  alt,
  className,
  fallbackSrc = '/placeholder.svg',
  blurPlaceholder = true,
  loadingComponent,
  rootMargin = '200px',
  threshold = 0.01,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  blurPlaceholder?: boolean;
  loadingComponent?: ReactNode;
  rootMargin?: string;
  threshold?: number;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // 使用IntersectionObserver检测图片是否在视口中
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          // 一旦图片进入视口，就不再需要观察它
          if (imgRef.current) {
            observer.unobserve(imgRef.current);
          }
        }
      },
      { rootMargin, threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [rootMargin, threshold]);

  // 处理图片加载完成
  const handleLoad = () => {
    setIsLoaded(true);
  };

  // 处理图片加载错误
  const handleError = () => {
    setIsError(true);
    console.error(`Failed to load image: ${src}`);
  };

  // 实际显示的图片源
  const displaySrc = isError ? fallbackSrc : isInView ? src : fallbackSrc;

  return (
    <div className='relative'>
      {/* 加载状态 */}
      {isInView && !isLoaded && !isError && (
        <div className='absolute inset-0 flex items-center justify-center bg-muted/20 backdrop-blur-sm'>
          {loadingComponent || (
            <Loader2 className='h-6 w-6 text-primary animate-spin' />
          )}
        </div>
      )}

      {/* 图片 */}
      <img
        ref={imgRef}
        src={displaySrc || '/placeholder.svg'}
        alt={alt || ''}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${blurPlaceholder && !isLoaded && !isError ? 'blur-sm' : 'blur-0'} ${className || ''}`}
        onLoad={handleLoad}
        onError={handleError}
        loading='lazy'
        {...props}
      />
    </div>
  );
}

/**
 * 懒加载视频组件
 */
export function LazyVideo({
  src,
  poster,
  className,
  fallbackSrc,
  loadingComponent,
  rootMargin = '200px',
  threshold = 0.1,
  ...props
}: {
  src: string;
  poster?: string;
  className?: string;
  fallbackSrc?: string;
  loadingComponent?: ReactNode;
  rootMargin?: string;
  threshold?: number;
} & React.VideoHTMLAttributes<HTMLVideoElement>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          if (videoRef.current) {
            observer.unobserve(videoRef.current);
          }
        }
      },
      { rootMargin, threshold }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [rootMargin, threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setIsError(true);
    console.error(`Failed to load video: ${src}`);
  };

  const displaySrc = isError ? fallbackSrc : isInView ? src : fallbackSrc;

  return (
    <div className='relative'>
      {/* 加载状态 */}
      {isInView && !isLoaded && !isError && (
        <div className='absolute inset-0 flex items-center justify-center bg-muted/20 backdrop-blur-sm'>
          {loadingComponent || (
            <Loader2 className='h-6 w-6 text-primary animate-spin' />
          )}
        </div>
      )}

      {/* 视频 */}
      <video
        ref={videoRef}
        src={displaySrc}
        poster={poster}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className || ''}`}
        onLoadedData={handleLoad}
        onError={handleError}
        preload='none'
        {...props}
      />
    </div>
  );
}

/**
 * 懒加载iframe组件
 */
export function LazyIframe({
  src,
  title,
  className,
  fallbackSrc,
  loadingComponent,
  rootMargin = '200px',
  threshold = 0.1,
  ...props
}: {
  src: string;
  title?: string;
  className?: string;
  fallbackSrc?: string;
  loadingComponent?: ReactNode;
  rootMargin?: string;
  threshold?: number;
} & React.IframeHTMLAttributes<HTMLIFrameElement>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          if (iframeRef.current) {
            observer.unobserve(iframeRef.current);
          }
        }
      },
      { rootMargin, threshold }
    );

    if (iframeRef.current) {
      observer.observe(iframeRef.current);
    }

    return () => {
      if (iframeRef.current) {
        observer.unobserve(iframeRef.current);
      }
    };
  }, [rootMargin, threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setIsError(true);
    console.error(`Failed to load iframe: ${src}`);
  };

  const displaySrc = isError ? fallbackSrc : isInView ? src : fallbackSrc;

  return (
    <div className='relative'>
      {/* 加载状态 */}
      {isInView && !isLoaded && !isError && (
        <div className='absolute inset-0 flex items-center justify-center bg-muted/20 backdrop-blur-sm'>
          {loadingComponent || (
            <Loader2 className='h-6 w-6 text-primary animate-spin' />
          )}
        </div>
      )}

      {/* iframe */}
      <iframe
        ref={iframeRef}
        src={displaySrc}
        title={title}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className || ''}`}
        onLoad={handleLoad}
        onError={handleError}
        loading='lazy'
        {...props}
      />
    </div>
  );
}

/**
 * 懒加载Hook
 */
export function useLazyLoading(
  options: {
    rootMargin?: string;
    threshold?: number;
  } = {}
) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: options.rootMargin || '100px',
        threshold: options.threshold || 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options.rootMargin, options.threshold]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return { ref, isVisible, isLoaded };
}

/**
 * 预加载Hook
 */
export function usePreload() {
  const preloadedComponents = useRef<Set<string>>(new Set());

  const preload = (importFunc: () => Promise<any>, key: string) => {
    if (!preloadedComponents.current.has(key)) {
      preloadedComponents.current.add(key);
      importFunc();
    }
  };

  const isPreloaded = (key: string) => {
    return preloadedComponents.current.has(key);
  };

  return { preload, isPreloaded };
}

/**
 * 默认导出
 */
export default {
  withLazyLoading,
  CustomFallback,
  preloadComponent,
  LazyContainer,
  LazyImage,
  LazyVideo,
  LazyIframe,
  useLazyLoading,
  usePreload,
};
