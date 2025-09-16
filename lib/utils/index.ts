/**
 * 统一工具函数
 * 整合了utils.ts, retry.ts和device-id.ts的常用功能
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 从utils.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 从retry.ts
/**
 * 使用指数退避重试函数
 * @param fn 要重试的函数
 * @param maxRetries 最大重试次数
 * @param initialDelay 初始延迟（毫秒）
 * @param maxDelay 最大延迟（毫秒）
 * @param onRetry 每次重试时调用的回调函数
 * @returns 函数的结果
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 2, // 默认减少为2次重试
  initialDelay = 500,
  maxDelay = 5000, // 最大延迟减少到5秒
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
  let attempt = 0;
  let delay = initialDelay;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;

      if (attempt >= maxRetries) {
        console.error(`已达到最大重试次数(${maxRetries})，不再重试`);
        throw error;
      }

      // 如果提供了 onRetry 回调，则调用它
      if (onRetry && error instanceof Error) {
        onRetry(attempt, error);
      }

      // 使用指数退避计算下一个延迟
      delay = Math.min(delay * 1.5, maxDelay); // 使用1.5而不是2，减少退避增长速度

      // 添加一些抖动以防止所有重试同时发生
      const jitter = Math.random() * 0.2 * delay; // 减少抖动范围
      const actualDelay = delay + jitter;

      console.log(
        `重试 ${attempt}/${maxRetries}，延迟 ${Math.round(actualDelay)}ms`
      );

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, actualDelay));
    }
  }
}

/**
 * 带超时的重试函数
 * @param fn 要重试的函数
 * @param options 重试选项
 * @returns 函数的结果
 */
export async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    timeout?: number;
    onRetry?: (attempt: number, error: Error) => void;
    onTimeout?: () => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 2,
    initialDelay = 500,
    maxDelay = 5000,
    timeout = 10000,
    onRetry,
    onTimeout,
  } = options;

  return new Promise<T>(async (resolve, reject) => {
    // 设置超时
    const timeoutId = setTimeout(() => {
      const timeoutError = new Error('操作超时');
      if (onTimeout) {
        onTimeout();
      }
      reject(timeoutError);
    }, timeout);

    try {
      // 使用普通重试函数
      const result = await retry(
        fn,
        maxRetries,
        initialDelay,
        maxDelay,
        onRetry
      );
      clearTimeout(timeoutId);
      resolve(result);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

// 从device-id.ts
// Key for storing the device ID in localStorage
const DEVICE_ID_KEY = 'zkteco_device_id';

/**
 * Generates a random device ID
 */
function generateDeviceId(): string {
  // Generate a random string with timestamp to ensure uniqueness
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `device_${timestamp}_${randomStr}`;
}

/**
 * Gets the device ID from localStorage or generates a new one if it doesn't exist
 */
export function getDeviceId(): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return 'server_side';
  }

  try {
    // Try to get the existing device ID from localStorage
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);

    // If no device ID exists, generate a new one and store it
    if (!deviceId) {
      deviceId = generateDeviceId();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }

    return deviceId;
  } catch (error) {
    // If localStorage is not available (e.g., in private browsing mode),
    // generate a temporary ID for the session
    console.warn('Could not access localStorage for device ID:', error);
    return generateDeviceId();
  }
}

/**
 * Resets the device ID (useful for testing or when user wants to clear their identity)
 */
export function resetDeviceId(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(DEVICE_ID_KEY);
    } catch (error) {
      console.warn('Could not remove device ID from localStorage:', error);
    }
  }
}

// 其他常用工具函数

/**
 * 格式化日期时间
 * @param date 日期对象或时间戳
 * @param format 格式字符串
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(
  date: Date | number,
  format = 'YYYY-MM-DD HH:mm:ss'
): string {
  const d = typeof date === 'number' ? new Date(date) : date;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 深度克隆对象
 * @param obj 要克隆的对象
 * @returns 克隆后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  if (obj instanceof Object) {
    const copy = {} as Record<string, any>;
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone((obj as Record<string, any>)[key]);
    });
    return copy as T;
  }

  return obj;
}

/**
 * 防抖函数
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null;

  return function (this: unknown, ...args: Parameters<T>): void {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

/**
 * 节流函数
 * @param fn 要节流的函数
 * @param limit 时间限制（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;

  return function (this: unknown, ...args: Parameters<T>): void {
    if (!inThrottle) {
      fn.apply(this, args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);

      lastFunc = setTimeout(
        () => {
          if (Date.now() - lastRan >= limit) {
            fn.apply(this, args);
            lastRan = Date.now();
          }
        },
        limit - (Date.now() - lastRan)
      );
    }
  };
}
