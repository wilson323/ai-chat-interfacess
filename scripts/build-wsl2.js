#!/usr/bin/env node

/**
 * WSL2专用构建脚本
 * 解决WSL2环境下的Bus error问题
 */

const { spawn } = require('child_process');
const fs = require('fs');

console.log('🚀 启动WSL2专用构建...');

// WSL2环境检测
function isWSL2() {
  try {
    const release = fs.readFileSync('/proc/version', 'utf8');
    return release.includes('microsoft') && release.includes('WSL2');
  } catch {
    return false;
  }
}

if (!isWSL2()) {
  console.log('⚠️  当前不在WSL2环境，使用标准构建');
  process.exit(0);
}

console.log('✅ 检测到WSL2环境，使用优化配置');

// WSL2优化配置
const buildConfig = {
  // 减少内存使用
  NODE_OPTIONS: '--max-old-space-size=2048 --max-semi-space-size=128',
  // 禁用某些可能导致Bus error的功能
  NEXT_TELEMETRY_DISABLED: '1',
  // 减少并发处理
  NODE_ENV: 'production',
  // 禁用某些优化
  NEXT_PRIVATE_SKIP_MEMORY_WARNING: '1'
};

console.log('📋 构建配置:', buildConfig);

// 执行构建
const buildProcess = spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    ...buildConfig
  }
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ WSL2构建成功完成');
  } else {
    console.log(`❌ WSL2构建失败，退出码: ${code}`);
    console.log('');
    console.log('💡 建议解决方案:');
    console.log('  1. 在Windows原生环境构建');
    console.log('  2. 使用Docker容器构建');
    console.log('  3. 增加WSL2内存分配');
    console.log('  4. 使用 npm run build:alternative');
  }
  process.exit(code);
});

buildProcess.on('error', (error) => {
  console.error('❌ 构建进程错误:', error.message);
  process.exit(1);
});

// 设置超时
setTimeout(() => {
  buildProcess.kill();
  console.log('⏰ 构建超时，强制终止');
  process.exit(1);
}, 10 * 60 * 1000); // 10分钟超时
