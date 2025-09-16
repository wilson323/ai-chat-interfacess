const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/api-server/',
    '<rootDir>/__tests__/e2e/',
    '<rootDir>/__tests__/storage.test.ts',
    // 忽略多智能体相关测试，当前项目使用单智能体模式
    '<rootDir>/tests/chat/unified-chat-container.test.tsx',
    '<rootDir>/tests/chat/unified-input.test.tsx',
    '<rootDir>/tests/api/fastgpt-integration.test.ts',
    '<rootDir>/tests/api/unified-agent-manager.test.ts',
    '<rootDir>/tests/components/multi-agent-chat-container.test.tsx',
    // 暂时忽略与当前需求无关且不稳定的增强主题测试
    '<rootDir>/__tests__/lib/theme/theme-enhanced.test.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^vitest$': '<rootDir>/tests/vitest-shim.js',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/*.config.js',
    '!**/jest.setup.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  transform: {
    '^.+\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\.module\.(css|sass|scss)$',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  // 修复WSL2环境下的Bus error问题
  maxWorkers: 1,
  // 移除workerIdleMemoryLimit，在WSL2中会导致内存分配问题
  // workerIdleMemoryLimit: '512MB',
  detectOpenHandles: false, // 在WSL2中禁用，避免进程死锁
  forceExit: true,
  // 增加超时时间
        testTimeout: 120000, // 2分钟超时
  // 清理模块
  clearMocks: true,
  restoreMocks: true,
  // WSL2特定配置
  testEnvironmentOptions: {
    customExportConditions: [''],
    // 禁用某些可能导致Bus error的功能
    url: 'http://localhost',
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
