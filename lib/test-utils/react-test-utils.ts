/**
 * React测试工具函数
 * 用于解决React测试中的act()警告问题
 */

import { act } from '@testing-library/react';

/**
 * 安全的状态更新函数
 * 在测试环境中自动包装act()，在生产环境中直接执行
 */
export const safeStateUpdate = <T extends (...args: any[]) => void>(
  updateFn: T,
  ...args: Parameters<T>
): void => {
  const isTestEnv = typeof process !== 'undefined' && !!process.env.JEST_WORKER_ID;
  
  if (isTestEnv) {
    act(() => {
      updateFn(...args);
    });
  } else {
    updateFn(...args);
  }
};

/**
 * 批量状态更新函数
 * 在测试环境中使用act()包装多个状态更新
 */
export const batchStateUpdate = (updates: (() => void)[]): void => {
  const isTestEnv = typeof process !== 'undefined' && !!process.env.JEST_WORKER_ID;
  
  if (isTestEnv) {
    act(() => {
      updates.forEach(update => update());
    });
  } else {
    updates.forEach(update => update());
  }
};

/**
 * 异步状态更新函数
 * 用于处理异步状态更新
 */
export const asyncStateUpdate = async <T extends (...args: any[]) => Promise<void>>(
  updateFn: T,
  ...args: Parameters<T>
): Promise<void> => {
  const isTestEnv = typeof process !== 'undefined' && !!process.env.JEST_WORKER_ID;
  
  if (isTestEnv) {
    await act(async () => {
      await updateFn(...args);
    });
  } else {
    await updateFn(...args);
  }
};

/**
 * 延迟状态更新函数
 * 用于处理需要延迟的状态更新
 */
export const delayedStateUpdate = (updateFn: () => void, delay: number = 0): void => {
  const isTestEnv = typeof process !== 'undefined' && !!process.env.JEST_WORKER_ID;
  
  if (isTestEnv) {
    act(() => {
      setTimeout(updateFn, delay);
    });
  } else {
    setTimeout(updateFn, delay);
  }
};
