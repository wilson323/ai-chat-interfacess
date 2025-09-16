/**
 * 跨平台兼容性工具函数
 * 解决Windows和Linux环境差异问题
 */

// 简单的日志实现，避免循环导入
const simpleLogger = {
  info: (message: string, data?: unknown) => console.log('[INFO]', message, data),
  warn: (message: string, data?: unknown) => console.warn('[WARN]', message, data),
  error: (message: string, data?: unknown) => console.error('[ERROR]', message, data),
  debug: (message: string, data?: unknown) => console.debug('[DEBUG]', message, data),
};

/**
 * 安全的JSON解析，处理跨平台字符编码问题
 */
export function safeCrossPlatformJSONParse<T>(
  value: unknown,
  fallback: T | null = null
): T | null {
  // 如果已经是对象，直接返回
  if (typeof value === 'object' && value !== null) {
    return value as T;
  }

  // 如果是字符串，尝试解析
  if (typeof value === 'string') {
    try {
      // 处理可能的换行符差异
      const normalizedValue = value
        .replace(/\r\n/g, '\n') // Windows -> Unix
        .replace(/\r/g, '\n') // Mac -> Unix
        .trim();

      if (!normalizedValue) {
        return fallback;
      }

      return JSON.parse(normalizedValue) as T;
    } catch (error) {
      simpleLogger.warn('跨平台JSON解析失败:', {
        error: error instanceof Error ? error.message : String(error),
        value:
          typeof value === 'string' ? value.substring(0, 100) + '...' : value,
        platform: getPlatformInfo(),
      });
      return fallback;
    }
  }

  return fallback;
}

/**
 * 获取平台信息
 */
export function getPlatformInfo() {
  if (typeof window === 'undefined') {
    // 服务器端
    return {
      type: 'server',
      os: process.platform,
      nodeVersion: process.version,
    };
  } else {
    // 客户端
    return {
      type: 'client',
      userAgent: navigator.userAgent,
      platform: navigator.platform,
    };
  }
}

/**
 * 安全的文件路径处理
 */
export function safePathJoin(...paths: string[]): string {
  return paths
    .filter(Boolean)
    .join('/')
    .replace(/\/+/g, '/') // 合并多个斜杠
    .replace(/\/$/, ''); // 移除末尾斜杠
}

/**
 * 安全的URL构建
 */
export function safeUrlJoin(baseUrl: string, ...paths: string[]): string {
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPaths = paths
    .filter(Boolean)
    .map(path => path.replace(/^\/+/, '').replace(/\/+$/, ''))
    .join('/');

  return cleanPaths ? `${cleanBase}/${cleanPaths}` : cleanBase;
}

/**
 * 错误类型分析
 */
export function analyzeErrorType(error: unknown): {
  type: 'timeout' | 'network' | 'server' | 'unknown';
  message: string;
  shouldRetry: boolean;
} {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // 超时错误
  if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
    return { type: 'timeout', message: '请求超时', shouldRetry: false };
  }

  // 网络错误
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('ENOTFOUND')
  ) {
    return { type: 'network', message: '网络连接失败', shouldRetry: true };
  }

  // 服务器错误
  if (
    errorMessage.includes('500') ||
    errorMessage.includes('502') ||
    errorMessage.includes('503') ||
    errorMessage.includes('504')
  ) {
    return { type: 'server', message: '服务器错误', shouldRetry: true };
  }

  return { type: 'unknown', message: errorMessage, shouldRetry: true };
}

/**
 * 安全的延迟函数
 */
export function safeDelay(ms: number): Promise<void> {
  return new Promise(resolve => {
    if (typeof window !== 'undefined' && window.requestIdleCallback) {
      window.requestIdleCallback(() => resolve(), { timeout: ms });
    } else {
      setTimeout(resolve, ms);
    }
  });
}

/**
 * 内存使用监控
 */
export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} {
  if (typeof window === 'undefined' || !(performance as any).memory) {
    return { used: 0, total: 0, percentage: 0 };
  }

  const memory = (performance as any).memory;
  const used = memory.usedJSHeapSize;
  const total = memory.totalJSHeapSize;
  const percentage = total > 0 ? (used / total) * 100 : 0;

  return { used, total, percentage };
}

/**
 * 检查是否为流式响应错误
 */
export function isStreamingError(error: unknown): boolean {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return (
    errorMessage.includes('stream') ||
    errorMessage.includes('chunked') ||
    errorMessage.includes('Transfer-Encoding')
  );
}

/**
 * 处理流式响应错误
 */
export function handleStreamingError(error: unknown): {
  type: 'streaming';
  message: string;
  shouldRetry: boolean;
} {
  const errorMessage = error instanceof Error ? error.message : String(error);

  if (errorMessage.includes('不支持流式响应')) {
    return {
      type: 'streaming',
      message: '服务器不支持流式响应',
      shouldRetry: true,
    };
  }

  return {
    type: 'streaming',
    message: '流式响应处理失败',
    shouldRetry: true,
  };
}

/**
 * 安全的跨平台日志记录
 */
export function safeCrossPlatformLog(
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  data?: unknown
): void {
  try {
    switch (level) {
      case 'info':
        simpleLogger.info(message, data);
        break;
      case 'warn':
        simpleLogger.warn(message, data);
        break;
      case 'error':
        simpleLogger.error(message, data);
        break;
      case 'debug':
        simpleLogger.debug(message, data);
        break;
    }
  } catch (error) {
    // 如果日志记录失败，至少输出到控制台
    console.error('日志记录失败:', error);
    console[level](message, data);
  }
}

/**
 * 检查是否为流式内容类型
 */
export function isStreamingContentType(contentType: string): boolean {
  return (
    contentType.includes('text/stream') ||
    contentType.includes('text/event-stream') ||
    contentType.includes('application/stream+json') ||
    contentType.includes('application/x-ndjson')
  );
}

/**
 * 创建跨平台文本解码器
 */
export function createCrossPlatformTextDecoder(): TextDecoder {
  try {
    return new TextDecoder('utf-8', { fatal: false });
  } catch (error) {
    simpleLogger.warn('创建TextDecoder失败，使用默认配置:', error);
    return new TextDecoder();
  }
}

/**
 * 创建跨平台文本编码器
 */
export function createCrossPlatformTextEncoder(): TextEncoder {
  try {
    return new TextEncoder();
  } catch (error) {
    simpleLogger.warn('创建TextEncoder失败，使用默认配置:', error);
    return new TextEncoder();
  }
}

/**
 * 处理流式数据行
 */
export function processStreamLines(
  data: string
): { lines: string[]; remainingBuffer: string } {
  const lines: string[] = [];
  let remainingBuffer = data;

  // 按换行符分割，保留空行
  const rawLines = data.split('\n');

  for (let i = 0; i < rawLines.length - 1; i++) {
    const line = rawLines[i];
    if (line.trim()) {
      lines.push(line);
    }
  }

  // 最后一个不完整的行作为剩余缓冲区
  remainingBuffer = rawLines[rawLines.length - 1] || '';

  return { lines, remainingBuffer };
}

/**
 * 分类流式错误
 */
export function categorizeStreamError(error: unknown): {
  type: 'network' | 'parsing' | 'timeout' | 'server' | 'unknown';
  message: string;
  shouldRetry: boolean;
} {
  const errorMessage = error instanceof Error ? error.message : String(error);

  if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
    return {
      type: 'timeout',
      message: '流式请求超时',
      shouldRetry: true,
    };
  }

  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('ECONNREFUSED')
  ) {
    return {
      type: 'network',
      message: '网络连接失败',
      shouldRetry: true,
    };
  }

  if (
    errorMessage.includes('parse') ||
    errorMessage.includes('JSON') ||
    errorMessage.includes('syntax')
  ) {
    return {
      type: 'parsing',
      message: '数据解析失败',
      shouldRetry: false,
    };
  }

  if (
    errorMessage.includes('500') ||
    errorMessage.includes('502') ||
    errorMessage.includes('503')
  ) {
    return {
      type: 'server',
      message: '服务器错误',
      shouldRetry: true,
    };
  }

  return {
    type: 'unknown',
    message: errorMessage,
    shouldRetry: true,
  };
}
