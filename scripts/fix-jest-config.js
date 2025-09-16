#!/usr/bin/env node
/**
 * 修复Jest配置脚本
 * 解决Bus error和worker异常问题
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 修复Jest配置...');

// 更新Jest配置
const jestConfig = `const nextJest = require('next/jest');

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
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
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
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
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
  testTimeout: 30000,
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
`;

// 写入Jest配置
fs.writeFileSync('jest.config.js', jestConfig);

// 更新package.json中的测试脚本
const packageJsonPath = 'package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// 添加简化的测试脚本（移除冲突参数）
packageJson.scripts = {
  ...packageJson.scripts,
  'test:simple': 'jest --forceExit',
  'test:single': 'jest --testPathPattern=tests/api/unified-agent-manager.test.ts --forceExit',
  'test:debug': 'jest --testPathPattern=tests/api/unified-agent-manager.test.ts --verbose --forceExit',
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('✅ Jest配置修复完成');
console.log('📝 可用的测试命令:');
console.log('  npm run test:simple    - 简化测试（单worker）');
console.log('  npm run test:single    - 运行单个测试文件');
console.log('  npm run test:debug     - 调试模式运行测试');
