/**
 * 跨平台兼容性工具函数
 * 解决Windows和Linux环境差异问题
 */

/**
 * 安全的JSON解析，处理跨平台字符编码问题
 */
export function safeCrossPlatformJSONParse<T>(
  value: any,
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
      console.warn('跨平台JSON解析失败:', {
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
      arch: process.arch,
    };
  } else {
    // 客户端
    return {
      type: 'client',
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
    };
  }
}

/**
 * 深度克隆对象，避免跨平台引用问题
 */
export function safeCrossPlatformClone<T>(obj: T): T {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.warn('跨平台对象克隆失败:', error);
    return obj;
  }
}

/**
 * 验证交互节点数据结构
 */
export interface InteractiveNodeValidationResult {
  isValid: boolean;
  type: 'userSelect' | 'userInput' | 'unknown';
  errors: string[];
  platform: any;
}

export function validateInteractiveNodeData(
  data: any
): InteractiveNodeValidationResult {
  const result: InteractiveNodeValidationResult = {
    isValid: false,
    type: 'unknown',
    errors: [],
    platform: getPlatformInfo(),
  };

  // 基础结构验证
  if (!data || typeof data !== 'object') {
    result.errors.push('数据不是有效对象');
    return result;
  }

  if (!data.interactive || typeof data.interactive !== 'object') {
    result.errors.push('缺少interactive字段或类型错误');
    return result;
  }

  if (!data.interactive.type || typeof data.interactive.type !== 'string') {
    result.errors.push('缺少interactive.type字段或类型错误');
    return result;
  }

  if (!data.interactive.params || typeof data.interactive.params !== 'object') {
    result.errors.push('缺少interactive.params字段或类型错误');
    return result;
  }

  // 根据类型进行具体验证
  const type = data.interactive.type;
  result.type = type as any;

  if (type === 'userSelect') {
    const options = data.interactive.params.userSelectOptions;

    if (!Array.isArray(options)) {
      result.errors.push('userSelectOptions不是数组');
      return result;
    }

    if (options.length === 0) {
      result.errors.push('userSelectOptions为空数组');
      return result;
    }

    // 验证每个选项
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      if (!option || typeof option !== 'object') {
        result.errors.push(`选项${i}不是有效对象`);
        continue;
      }
      if (typeof option.value !== 'string') {
        result.errors.push(`选项${i}的value不是字符串`);
      }
      if (typeof option.key !== 'string') {
        result.errors.push(`选项${i}的key不是字符串`);
      }
    }
  } else if (type === 'userInput') {
    const inputForm = data.interactive.params.inputForm;

    if (!Array.isArray(inputForm)) {
      result.errors.push('inputForm不是数组');
      return result;
    }

    if (inputForm.length === 0) {
      result.errors.push('inputForm为空数组');
      return result;
    }
  } else {
    result.errors.push(`未知的交互类型: ${type}`);
    return result;
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * 标准化文本内容，处理跨平台换行符差异
 */
export function normalizeTextContent(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/\r\n/g, '\n') // Windows -> Unix
    .replace(/\r/g, '\n') // Mac -> Unix
    .trim();
}

/**
 * 创建跨平台兼容的调试信息
 */
export function createCrossPlatformDebugInfo(context: string, data: any) {
  return {
    context,
    timestamp: new Date().toISOString(),
    platform: getPlatformInfo(),
    data: typeof data === 'object' ? safeCrossPlatformClone(data) : data,
    dataType: typeof data,
    isArray: Array.isArray(data),
    stringLength: typeof data === 'string' ? data.length : undefined,
  };
}

/**
 * 检查是否为生产环境
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * 检查是否为开发环境
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * 检查是否在Docker容器中运行
 */
export function isDockerEnvironment(): boolean {
  try {
    // 检查常见的Docker环境标识
    return !!(
      process.env.DOCKER_CONTAINER ||
      process.env.KUBERNETES_SERVICE_HOST ||
      (typeof window === 'undefined' &&
        process.env.HOSTNAME?.includes('docker'))
    );
  } catch {
    return false;
  }
}

/**
 * 获取运行环境信息
 */
export function getEnvironmentInfo() {
  return {
    nodeEnv: process.env.NODE_ENV,
    isProduction: isProduction(),
    isDevelopment: isDevelopment(),
    isDocker: isDockerEnvironment(),
    platform: getPlatformInfo(),
    port: process.env.PORT || '3000',
    timestamp: new Date().toISOString(),
  };
}

/**
 * 验证生产环境配置
 */
export function validateProductionConfig(): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (!isProduction()) {
    return { isValid: true, issues: [] }; // 非生产环境不需要验证
  }

  // 检查必要的生产环境配置
  if (!process.env.PORT) {
    issues.push('PORT环境变量未设置');
  }

  // 检查Next.js配置
  if (typeof window === 'undefined') {
    try {
      // 服务端检查
      const hasStandalone = process.env.NEXT_OUTPUT_MODE === 'standalone';
      if (!hasStandalone) {
        console.warn('建议在生产环境中使用standalone模式');
      }
    } catch (error) {
      console.warn('无法检查Next.js配置:', error);
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * 安全的控制台日志，在生产环境中可以禁用
 */
export function safeCrossPlatformLog(
  level: 'log' | 'warn' | 'error',
  message: string,
  data?: any
) {
  if (isProduction() && level === 'log') {
    return; // 生产环境不输出普通日志
  }

  const debugInfo = createCrossPlatformDebugInfo(message, data);

  switch (level) {
    case 'log':
      console.log(`[跨平台] ${message}`, debugInfo);
      break;
    case 'warn':
      console.warn(`[跨平台警告] ${message}`, debugInfo);
      break;
    case 'error':
      console.error(`[跨平台错误] ${message}`, debugInfo);
      break;
  }
}

// 🔥 新增：流式数据处理的跨平台兼容性函数
export function normalizeStreamData(data: string): string {
  // 处理不同平台的换行符差异
  return data
    .replace(/\r\n/g, '\n') // Windows -> Unix
    .replace(/\r/g, '\n') // Mac -> Unix
    .trim();
}

export function createCrossPlatformTextDecoder(): TextDecoder {
  // 确保在所有平台上使用一致的文本解码器
  return new TextDecoder('utf-8', {
    stream: true,
    fatal: false, // 不因解码错误而抛出异常
    ignoreBOM: true, // 忽略字节顺序标记
  });
}

export function createCrossPlatformTextEncoder(): TextEncoder {
  // 确保在所有平台上使用一致的文本编码器
  return new TextEncoder();
}

// 🔥 新增：检测流式响应的内容类型
export function isStreamingContentType(contentType: string): boolean {
  if (!contentType) return false;

  const normalizedType = contentType.toLowerCase();
  return (
    normalizedType.includes('text/event-stream') ||
    normalizedType.includes('text/plain') ||
    normalizedType.includes('application/octet-stream') ||
    normalizedType.includes('text/stream')
  );
}

// 🔥 新增：处理流式数据行的跨平台兼容性
export function processStreamLines(buffer: string): {
  lines: string[];
  remainingBuffer: string;
} {
  // 使用正则表达式处理所有类型的换行符
  const lines = buffer.split(/\r?\n/);
  const remainingBuffer = lines.pop() || ''; // 保留最后一个不完整的行

  return {
    lines: lines.filter(line => line.trim() !== ''), // 过滤空行
    remainingBuffer,
  };
}

// 🔥 新增：增强的错误处理
export function categorizeStreamError(error: any): {
  type: 'network' | 'timeout' | 'content-type' | 'abort' | 'unknown';
  message: string;
  shouldRetry: boolean;
} {
  if (!error) {
    return { type: 'unknown', message: '未知错误', shouldRetry: false };
  }

  const errorMessage = error.message || String(error);

  if (error.name === 'AbortError') {
    return { type: 'abort', message: '请求被中断', shouldRetry: false };
  }

  if (
    errorMessage.includes('content-type') ||
    errorMessage.includes('text/event-stream')
  ) {
    return {
      type: 'content-type',
      message: '服务器不支持流式响应',
      shouldRetry: true,
    };
  }

  if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
    return { type: 'timeout', message: '请求超时', shouldRetry: false };
  }

  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('ENOTFOUND')
  ) {
    return { type: 'network', message: '网络连接失败', shouldRetry: true };
  }

  return { type: 'unknown', message: errorMessage, shouldRetry: true };
}
