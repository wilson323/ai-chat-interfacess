#!/usr/bin/env node

/**
 * WSL2环境专用的Jest启动脚本
 * 解决WSL2环境下的Bus error问题
 */

const { spawn } = require('child_process');
const path = require('path');

// WSL2环境检测
const isWSL2 = process.env.WSL_DISTRO_NAME || process.env.WSLENV;

if (!isWSL2) {
  console.log('⚠️  此脚本专为WSL2环境设计');
  process.exit(1);
}

// WSL2环境变量设置
process.env.NODE_OPTIONS = '--max-old-space-size=4096 --no-deprecation';
process.env.JEST_WORKER_ID = '1';

// Jest参数配置
const jestArgs = [
  '--config', 'jest.config.js',
  '--maxWorkers=1',
  '--forceExit',
  '--detectOpenHandles=false',
  '--testTimeout=30000',
  '--clearCache',
  ...process.argv.slice(2) // 传递其他参数
];

console.log('🚀 启动WSL2专用Jest测试...');
console.log('📋 参数:', jestArgs.join(' '));

// 启动Jest进程
const jestProcess = spawn('npx', ['jest', ...jestArgs], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=4096 --no-deprecation',
    JEST_WORKER_ID: '1',
    // WSL2特定环境变量
    WSLENV: process.env.WSLENV,
    WSL_DISTRO_NAME: process.env.WSL_DISTRO_NAME,
  },
  shell: true
});

jestProcess.on('close', (code) => {
  console.log(`\n✅ Jest进程结束，退出码: ${code}`);
  process.exit(code);
});

jestProcess.on('error', (error) => {
  console.error('❌ Jest进程错误:', error);
  process.exit(1);
});

// 处理进程信号
process.on('SIGINT', () => {
  console.log('\n🛑 收到中断信号，正在关闭Jest进程...');
  jestProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 收到终止信号，正在关闭Jest进程...');
  jestProcess.kill('SIGTERM');
});
