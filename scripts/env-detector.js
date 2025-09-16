#!/usr/bin/env node

/**
 * 环境检测工具
 * 自动检测开发环境（Windows/WSL）和生产环境（Linux）
 */

const fs = require('fs');
const os = require('os');

/**
 * 检测当前运行环境
 */
function detectEnvironment() {
  const platform = os.platform();
  const arch = os.arch();
  const release = os.release();

  // 检测WSL环境
  const isWSL = (() => {
    try {
      if (platform === 'linux') {
        const version = fs.readFileSync('/proc/version', 'utf8');
        return version.includes('microsoft') || version.includes('WSL');
      }
      return false;
    } catch {
      return false;
    }
  })();

  // 检测Docker环境
  const isDocker = (() => {
    try {
      return fs.existsSync('/.dockerenv') || fs.existsSync('/proc/1/cgroup');
    } catch {
      return false;
    }
  })();

  // 检测CI环境
  const isCI = (() => {
    return process.env.CI === 'true' ||
           process.env.GITHUB_ACTIONS === 'true' ||
           process.env.GITLAB_CI === 'true' ||
           process.env.JENKINS_URL !== undefined;
  })();

  // 环境分类
  let environment = 'unknown';
  let environmentType = 'development';

  if (isDocker || isCI) {
    environment = 'production';
    environmentType = 'container';
  } else if (isWSL) {
    environment = 'development';
    environmentType = 'wsl';
  } else if (platform === 'win32') {
    environment = 'development';
    environmentType = 'windows';
  } else if (platform === 'linux') {
    environment = 'production';
    environmentType = 'linux';
  } else if (platform === 'darwin') {
    environment = 'development';
    environmentType = 'macos';
  }

  return {
    platform,
    arch,
    release,
    isWSL,
    isDocker,
    isCI,
    environment,
    environmentType,
    nodeVersion: process.version,
    memory: os.totalmem(),
    cpus: os.cpus().length
  };
}

/**
 * 获取环境特定的配置
 */
function getEnvironmentConfig(envInfo) {
  const baseConfig = {
    // 基础配置
    NODE_ENV: 'production',
    NEXT_TELEMETRY_DISABLED: '1',

    // 内存配置
    NODE_OPTIONS: '--max-old-space-size=4096',

    // 构建配置
    NEXT_PRIVATE_SKIP_MEMORY_WARNING: '1',
    NEXT_PRIVATE_SKIP_CACHE: '0'
  };

  // 根据环境类型调整配置
  switch (envInfo.environmentType) {
    case 'wsl':
      return {
        ...baseConfig,
        NODE_OPTIONS: '--max-old-space-size=2048 --max-semi-space-size=128',
        NEXT_PRIVATE_SKIP_MEMORY_WARNING: '1',
        NEXT_PRIVATE_SKIP_CACHE: '1',
        // WSL特定优化
        NEXT_PRIVATE_SKIP_BUILD_CACHE: '1'
      };

    case 'windows':
      return {
        ...baseConfig,
        NODE_OPTIONS: '--max-old-space-size=4096',
        // Windows特定优化
        NEXT_PRIVATE_SKIP_BUILD_CACHE: '0'
      };

    case 'linux':
    case 'container':
      return {
        ...baseConfig,
        NODE_OPTIONS: '--max-old-space-size=8192',
        // Linux/容器优化
        NEXT_PRIVATE_SKIP_BUILD_CACHE: '0',
        // 生产环境优化
        NEXT_PRIVATE_SKIP_MEMORY_WARNING: '0'
      };

    case 'macos':
      return {
        ...baseConfig,
        NODE_OPTIONS: '--max-old-space-size=4096',
        // macOS特定优化
        NEXT_PRIVATE_SKIP_BUILD_CACHE: '0'
      };

    default:
      return baseConfig;
  }
}

/**
 * 获取构建策略
 */
function getBuildStrategy(envInfo) {
  const strategies = {
    // WSL环境：使用替代构建
    wsl: {
      strategy: 'alternative',
      reason: 'WSL2环境存在Bus error问题',
      commands: ['npm run build:alternative'],
      fallback: ['npm run build:wsl2']
    },

    // Windows环境：标准构建
    windows: {
      strategy: 'standard',
      reason: 'Windows原生环境，支持标准构建',
      commands: ['npm run build'],
      fallback: ['npm run build:alternative']
    },

    // Linux/容器环境：优化构建
    linux: {
      strategy: 'optimized',
      reason: 'Linux生产环境，使用优化构建',
      commands: ['npm run build'],
      fallback: ['npm run build:alternative']
    },

    // 容器环境：容器优化构建
    container: {
      strategy: 'container',
      reason: '容器环境，使用容器优化构建',
      commands: ['npm run build'],
      fallback: ['npm run build:alternative']
    },

    // macOS环境：标准构建
    macos: {
      strategy: 'standard',
      reason: 'macOS环境，支持标准构建',
      commands: ['npm run build'],
      fallback: ['npm run build:alternative']
    }
  };

  return strategies[envInfo.environmentType] || strategies.windows;
}

// 如果直接运行此脚本
if (require.main === module) {
  const envInfo = detectEnvironment();
  const config = getEnvironmentConfig(envInfo);
  const strategy = getBuildStrategy(envInfo);

  console.log('🔍 环境检测结果:');
  console.log(`  平台: ${envInfo.platform} (${envInfo.arch})`);
  console.log(`  环境: ${envInfo.environment} (${envInfo.environmentType})`);
  console.log(`  WSL: ${envInfo.isWSL ? '是' : '否'}`);
  console.log(`  Docker: ${envInfo.isDocker ? '是' : '否'}`);
  console.log(`  CI: ${envInfo.isCI ? '是' : '否'}`);
  console.log(`  Node版本: ${envInfo.nodeVersion}`);
  console.log(`  内存: ${Math.round(envInfo.memory / 1024 / 1024 / 1024)}GB`);
  console.log(`  CPU核心: ${envInfo.cpus}`);
  console.log('');
  console.log('📋 构建策略:');
  console.log(`  策略: ${strategy.strategy}`);
  console.log(`  原因: ${strategy.reason}`);
  console.log(`  命令: ${strategy.commands.join(', ')}`);
  if (strategy.fallback.length > 0) {
    console.log(`  备用: ${strategy.fallback.join(', ')}`);
  }
  console.log('');
  console.log('⚙️  环境配置:');
  Object.entries(config).forEach(([key, value]) => {
    console.log(`  ${key}=${value}`);
  });
}

module.exports = {
  detectEnvironment,
  getEnvironmentConfig,
  getBuildStrategy
};
