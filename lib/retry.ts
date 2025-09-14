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
