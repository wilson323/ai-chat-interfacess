// Vitest 兼容层（在 Jest 中提供最小 API）
const jestGlobals = require('@jest/globals');

const vi = {
  fn: jestGlobals.jest.fn,
  spyOn: jestGlobals.jest.spyOn,
  // 兼容定时器 API（最常用）
  useFakeTimers: jestGlobals.jest.useFakeTimers,
  useRealTimers: jestGlobals.jest.useRealTimers,
  advanceTimersByTime: jestGlobals.jest.advanceTimersByTime,
  runAllTimers: jestGlobals.jest.runAllTimers,
};

module.exports = {
  ...jestGlobals,
  vi,
};
