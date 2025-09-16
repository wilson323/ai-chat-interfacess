// 为 @testing-library/jest-dom 匹配器提供类型增强
import '@testing-library/jest-dom';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare global {
  namespace jest {
    // 兼容旧的全局 jest Matchers 声明（@jest/globals 仍可使用）
    interface Matchers<R = void, T = {}> extends TestingLibraryMatchers<T, R> {}
  }
}

declare module '@jest/expect' {
  // 兼容使用 @jest/globals 的类型增强
  interface Matchers<R, T> extends TestingLibraryMatchers<T, R> {}
}

export {};
