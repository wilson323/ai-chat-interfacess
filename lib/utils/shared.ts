/**
 * 统一工具函数库
 * 整合所有公共工具函数，消除重复代码
 */

import { logger } from './logger';

// ================ 错误处理 ================

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  CONFIG = 'CONFIG',
  UNKNOWN = 'UNKNOWN'
}

/**
 * 统一错误接口
 */
export interface UnifiedError {
  type: ErrorType;
  code: number;
  message: string;
  details?: any;
  timestamp: number;
  context?: string;
}

/**
 * 统一错误处理器
 */
export class UnifiedErrorHandler {
  /**
   * 处理错误并返回统一格式
   */
  static handleError(error: any, context?: string): UnifiedError {
    const timestamp = Date.now();
    let unifiedError: UnifiedError;

    if (error instanceof Error) {
      unifiedError = {
        type: this.categorizeError(error),
        code: this.getErrorCode(error),
        message: error.message,
        details: error.stack,
        timestamp,
        context
      };
    } else if (typeof error === 'string') {
      unifiedError = {
        type: ErrorType.UNKNOWN,
        code: 500,
        message: error,
        timestamp,
        context
      };
    } else {
      unifiedError = {
        type: ErrorType.UNKNOWN,
        code: 500,
        message: '未知错误',
        details: error,
        timestamp,
        context
      };
    }

    // 记录错误日志
    this.logError(unifiedError);

    return unifiedError;
  }

  /**
   * 分类错误类型
   */
  private static categorizeError(error: Error): ErrorType {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return ErrorType.NETWORK;
    }
    if (message.includes('api') || message.includes('http') || message.includes('status')) {
      return ErrorType.API;
    }
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return ErrorType.VALIDATION;
    }
    if (message.includes('config') || message.includes('configuration')) {
      return ErrorType.CONFIG;
    }

    return ErrorType.UNKNOWN;
  }

  /**
   * 获取错误代码
   */
  private static getErrorCode(error: Error): number {
    const message = error.message;

    // 尝试从错误消息中提取HTTP状态码
    const statusMatch = message.match(/(\d{3})/);
    if (statusMatch) {
      return parseInt(statusMatch[1], 10);
    }

    // 根据错误类型返回默认代码
    switch (this.categorizeError(error)) {
      case ErrorType.NETWORK:
        return 0;
      case ErrorType.API:
        return 500;
      case ErrorType.VALIDATION:
        return 400;
      case ErrorType.CONFIG:
        return 500;
      default:
        return 500;
    }
  }

  /**
   * 记录错误日志
   */
  private static logError(error: UnifiedError): void {
    const logMessage = `[${error.type}] ${error.message}`;
    const logData = {
      code: error.code,
      context: error.context,
      details: error.details
    };

    switch (error.type) {
      case ErrorType.NETWORK:
        logger.warn(logMessage, logData);
        break;
      case ErrorType.API:
        logger.error(logMessage, logData);
        break;
      case ErrorType.VALIDATION:
        logger.warn(logMessage, logData);
        break;
      case ErrorType.CONFIG:
        logger.error(logMessage, logData);
        break;
      default:
        logger.error(logMessage, logData);
    }
  }
}

// ================ 缓存管理 ================

/**
 * 缓存项接口
 */
interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * 统一缓存管理器
 */
export class UnifiedCacheManager {
  private cache: Map<string, CacheItem> = new Map();
  private maxSize: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
    this.startCleanup();
  }

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, ttl: number = 3600): void {
    // 检查缓存大小限制
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000 // 转换为毫秒
    });
  }

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 获取缓存统计
   */
  getStats(): { size: number; keys: string[]; hitRate?: number } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * 驱逐最旧的缓存项
   */
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // 每分钟清理一次
  }

  /**
   * 清理过期缓存
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      logger.debug(`清理了 ${keysToDelete.length} 个过期缓存项`);
    }
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

// ================ 验证工具 ================

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * 统一验证器
 */
export class UnifiedValidator {
  /**
   * 验证字符串
   */
  static validateString(value: any, options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    name?: string;
  } = {}): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const { required = false, minLength, maxLength, pattern, name = '字段' } = options;

    if (required && (!value || value.trim() === '')) {
      errors.push(`${name}不能为空`);
      return { valid: false, errors, warnings };
    }

    if (value !== undefined && value !== null) {
      const str = String(value);

      if (minLength !== undefined && str.length < minLength) {
        errors.push(`${name}长度不能少于${minLength}个字符`);
      }

      if (maxLength !== undefined && str.length > maxLength) {
        errors.push(`${name}长度不能超过${maxLength}个字符`);
      }

      if (pattern && !pattern.test(str)) {
        errors.push(`${name}格式不正确`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 验证数字
   */
  static validateNumber(value: any, options: {
    required?: boolean;
    min?: number;
    max?: number;
    integer?: boolean;
    name?: string;
  } = {}): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const { required = false, min, max, integer = false, name = '字段' } = options;

    if (required && (value === undefined || value === null || value === '')) {
      errors.push(`${name}不能为空`);
      return { valid: false, errors, warnings };
    }

    if (value !== undefined && value !== null && value !== '') {
      const num = Number(value);

      if (isNaN(num)) {
        errors.push(`${name}必须是有效数字`);
        return { valid: false, errors, warnings };
      }

      if (integer && !Number.isInteger(num)) {
        errors.push(`${name}必须是整数`);
      }

      if (min !== undefined && num < min) {
        errors.push(`${name}不能小于${min}`);
      }

      if (max !== undefined && num > max) {
        errors.push(`${name}不能大于${max}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 验证邮箱
   */
  static validateEmail(email: string): ValidationResult {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.validateString(email, {
      required: true,
      pattern,
      name: '邮箱'
    });
  }

  /**
   * 验证URL
   */
  static validateUrl(url: string): ValidationResult {
    try {
      new URL(url);
      return { valid: true, errors: [] };
    } catch {
      return { valid: false, errors: ['URL格式不正确'] };
    }
  }

  /**
   * 验证对象
   */
  static validateObject(obj: any, schema: Record<string, any>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const [key, rules] of Object.entries(schema)) {
      const value = obj[key];
      const result = this.validateField(value, rules, key);

      if (!result.valid) {
        errors.push(...result.errors);
      }

      if (result.warnings) {
        warnings.push(...result.warnings);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 验证字段
   */
  private static validateField(value: any, rules: any, name: string): ValidationResult {
    if (rules.type === 'string') {
      return this.validateString(value, { ...rules, name });
    }

    if (rules.type === 'number') {
      return this.validateNumber(value, { ...rules, name });
    }

    if (rules.type === 'email') {
      return this.validateEmail(value);
    }

    if (rules.type === 'url') {
      return this.validateUrl(value);
    }

    return { valid: true, errors: [] };
  }
}

// ================ 工具函数 ================

/**
 * 生成唯一ID
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}${timestamp}_${random}`;
}

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }

  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化时间
 */
export function formatTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const target = new Date(date);
  const diff = now.getTime() - target.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}天前`;
  } else if (hours > 0) {
    return `${hours}小时前`;
  } else if (minutes > 0) {
    return `${minutes}分钟前`;
  } else {
    return '刚刚';
  }
}

/**
 * 安全的JSON解析
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
}

/**
 * 安全的JSON字符串化
 */
export function safeJsonStringify(obj: any, defaultValue: string = '{}'): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return defaultValue;
  }
}

/**
 * 生成随机字符串
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 检查是否为移动设备
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * 检查是否为开发环境
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * 检查是否为生产环境
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// ================ 单例实例 ================

/**
 * 全局缓存管理器实例
 */
let globalCacheManager: UnifiedCacheManager | null = null;

/**
 * 获取全局缓存管理器实例
 */
export function getGlobalCacheManager(): UnifiedCacheManager {
  if (!globalCacheManager) {
    globalCacheManager = new UnifiedCacheManager();
  }
  return globalCacheManager;
}

/**
 * 重置全局缓存管理器实例
 */
export function resetGlobalCacheManager(): void {
  if (globalCacheManager) {
    globalCacheManager.destroy();
    globalCacheManager = null;
  }
}

// ================ 便捷函数 ================

/**
 * 快速错误处理
 */
export function handleError(error: any, context?: string): UnifiedError {
  return UnifiedErrorHandler.handleError(error, context);
}

/**
 * 快速验证
 */
export function validate(data: any, schema: Record<string, any>): ValidationResult {
  return UnifiedValidator.validateObject(data, schema);
}

/**
 * 快速缓存操作
 */
export const cache = {
  set: <T>(key: string, data: T, ttl?: number) => getGlobalCacheManager().set(key, data, ttl),
  get: <T>(key: string) => getGlobalCacheManager().get<T>(key),
  delete: (key: string) => getGlobalCacheManager().delete(key),
  clear: () => getGlobalCacheManager().clear(),
  has: (key: string) => getGlobalCacheManager().has(key)
};
