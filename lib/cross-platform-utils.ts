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
        .replace(/\r\n/g, '\n')  // Windows -> Unix
        .replace(/\r/g, '\n')    // Mac -> Unix
        .trim();

      if (!normalizedValue) {
        return fallback;
      }

      return JSON.parse(normalizedValue) as T;
    } catch (error) {
      console.warn('跨平台JSON解析失败:', {
        error: error instanceof Error ? error.message : String(error),
        value: typeof value === 'string' ? value.substring(0, 100) + '...' : value,
        platform: getPlatformInfo()
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
      arch: process.arch
    };
  } else {
    // 客户端
    return {
      type: 'client',
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language
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

export function validateInteractiveNodeData(data: any): InteractiveNodeValidationResult {
  const result: InteractiveNodeValidationResult = {
    isValid: false,
    type: 'unknown',
    errors: [],
    platform: getPlatformInfo()
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
    .replace(/\r\n/g, '\n')  // Windows -> Unix
    .replace(/\r/g, '\n')    // Mac -> Unix
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
    stringLength: typeof data === 'string' ? data.length : undefined
  };
}

/**
 * 检查是否为生产环境
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * 安全的控制台日志，在生产环境中可以禁用
 */
export function safeCrossPlatformLog(level: 'log' | 'warn' | 'error', message: string, data?: any) {
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
