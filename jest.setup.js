// 模拟全局对象
global.console = {
  ...console,
  // 保持控制台输出干净
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}

// 模拟Date.now以便测试
const originalDateNow = Date.now
global.Date.now = jest.fn(() => 1600000000000) // 固定时间戳

// 在所有测试后恢复原始方法
afterAll(() => {
  global.Date.now = originalDateNow
})
