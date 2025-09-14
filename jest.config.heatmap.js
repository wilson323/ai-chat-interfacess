module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.heatmap.js'],
  testTimeout: 30000,
  maxWorkers: 4,
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage/heatmap',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'lib/services/heatmap.ts',
    'lib/services/geo-location.ts',
    'lib/db/models/agent-usage.ts',
    'lib/db/models/user-geo.ts',
    'app/api/admin/heatmap/**/*.ts',
    'app/api/analytics/**/*.ts',
    'components/admin/heatmap/**/*.tsx',
    'components/admin/analytics/**/*.tsx',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFiles: ['<rootDir>/jest.setup.heatmap.js'],
};