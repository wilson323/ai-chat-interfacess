/**
 * 测试配置优化
 * 统一管理测试配置和设置
 */

import { Config } from 'jest'
import { PlaywrightTestConfig } from '@playwright/test'

// Jest配置
export const jestConfig: Partial<Config> = {
  // 测试环境
  testEnvironment: 'jsdom',
  
  // 模块路径映射
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '^@/context/(.*)$': '<rootDir>/context/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1'
  },
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/__tests__/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/components/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/lib/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/app/**/*.test.{js,jsx,ts,tsx}'
  ],
  
  // 覆盖率配置
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/__tests__/**',
    '!**/test-utils/**'
  ],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // 覆盖率报告
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  
  // 测试设置
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // 模块文件扩展名
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // 转换配置
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  
  // 忽略模式
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
    '<rootDir>/playwright-report/'
  ],
  
  // 模块忽略模式
  modulePathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/'
  ],
  
  // 全局变量
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  
  // 测试超时
  testTimeout: 10000,
  
  // 最大工作进程数
  maxWorkers: '50%',
  
  // 缓存配置
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // 详细输出
  verbose: true,
  
  // 错误处理
  errorOnDeprecated: true,
  
  // 清理模拟
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
}

// Playwright配置
export const playwrightConfig: PlaywrightTestConfig = {
  // 测试目录
  testDir: './__tests__/e2e',
  
  // 测试匹配模式
  testMatch: '**/*.e2e.{js,ts}',
  
  // 全局设置
  globalSetup: require.resolve('./global-setup.ts'),
  globalTeardown: require.resolve('./global-teardown.ts'),
  
  // 超时配置
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  
  // 失败重试
  retries: process.env.CI ? 2 : 0,
  
  // 工作进程
  workers: process.env.CI ? 1 : undefined,
  
  // 报告配置
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }]
  ],
  
  // 使用配置
  use: {
    // 基础URL
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    // 浏览器配置
    browserName: 'chromium',
    headless: process.env.CI ? true : false,
    viewport: { width: 1280, height: 720 },
    
    // 截图配置
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // 网络配置
    ignoreHTTPSErrors: true,
    
    // 动作配置
    actionTimeout: 10000,
    navigationTimeout: 30000
  },
  
  // 项目配置
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' }
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' }
    }
  ],
  
  // 输出目录
  outputDir: 'test-results/',
  
  // 测试忽略
  testIgnore: [
    '**/node_modules/**',
    '**/coverage/**',
    '**/playwright-report/**'
  ]
}

// 测试环境变量
export const testEnvVars = {
  NODE_ENV: 'test',
  NEXT_PUBLIC_API_URL: 'http://localhost:3000/api',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
  REDIS_URL: 'redis://localhost:6379',
  JWT_SECRET: 'test-jwt-secret',
  ENCRYPTION_KEY: 'test-encryption-key'
}

// 测试数据库配置
export const testDbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'test_db',
  username: 'test',
  password: 'test',
  dialect: 'postgres' as const,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
}

// 测试Redis配置
export const testRedisConfig = {
  host: 'localhost',
  port: 6379,
  password: '',
  db: 1,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
}

// 测试文件配置
export const testFileConfig = {
  // 测试文件命名规范
  testFilePattern: /\.(test|spec)\.(js|jsx|ts|tsx)$/,
  
  // 测试目录结构
  testDirs: [
    '__tests__/',
    'components/',
    'lib/',
    'app/',
    'hooks/',
    'context/'
  ],
  
  // 测试文件模板
  testFileTemplate: `/**
 * 测试文件
 * 自动生成的测试文件模板
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'

describe('ComponentName', () => {
  beforeEach(() => {
    // 测试前设置
  })
  
  afterEach(() => {
    // 测试后清理
  })
  
  it('should render correctly', () => {
    // 测试逻辑
  })
})
`,
  
  // 测试覆盖率目标
  coverageTargets: {
    statements: 80,
    branches: 80,
    functions: 80,
    lines: 80
  }
}

// 测试性能配置
export const testPerformanceConfig = {
  // 性能阈值
  thresholds: {
    // 测试执行时间阈值（毫秒）
    testExecutionTime: 5000,
    
    // 内存使用阈值（MB）
    memoryUsage: 100,
    
    // CPU使用阈值（秒）
    cpuUsage: 1,
    
    // 页面加载时间阈值（毫秒）
    pageLoadTime: 3000,
    
    // API响应时间阈值（毫秒）
    apiResponseTime: 1000
  },
  
  // 性能监控配置
  monitoring: {
    enabled: true,
    interval: 1000,
    maxSamples: 100
  },
  
  // 性能报告配置
  reporting: {
    enabled: true,
    outputDir: 'test-results/performance',
    format: 'json'
  }
}

// 测试安全配置
export const testSecurityConfig = {
  // 安全测试配置
  security: {
    // 启用安全测试
    enabled: true,
    
    // 测试类型
    types: ['xss', 'csrf', 'sql-injection', 'authentication'],
    
    // 测试深度
    depth: 'medium',
    
    // 测试超时
    timeout: 30000
  },
  
  // 测试数据配置
  testData: {
    // 使用真实数据
    useRealData: false,
    
    // 数据脱敏
    dataMasking: true,
    
    // 数据清理
    dataCleanup: true
  }
}

// 测试配置验证
export const validateTestConfig = () => {
  const errors: string[] = []
  
  // 验证Jest配置
  if (!jestConfig.testEnvironment) {
    errors.push('Jest testEnvironment is required')
  }
  
  if (!jestConfig.testMatch || jestConfig.testMatch.length === 0) {
    errors.push('Jest testMatch is required')
  }
  
  // 验证Playwright配置
  if (!playwrightConfig.testDir) {
    errors.push('Playwright testDir is required')
  }
  
  if (!playwrightConfig.use?.baseURL) {
    errors.push('Playwright baseURL is required')
  }
  
  // 验证环境变量
  const requiredEnvVars = ['NODE_ENV', 'NEXT_PUBLIC_API_URL']
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      errors.push(`Environment variable ${envVar} is required`)
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Test configuration validation failed:\n${errors.join('\n')}`)
  }
  
  return true
}

// 默认导出
export default {
  jestConfig,
  playwrightConfig,
  testEnvVars,
  testDbConfig,
  testRedisConfig,
  testFileConfig,
  testPerformanceConfig,
  testSecurityConfig,
  validateTestConfig
}
