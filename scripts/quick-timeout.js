#!/usr/bin/env node
/**
 * 快速超时包装脚本 - 10分钟超时
 * 用法: node quick-timeout.js <命令>
 */

const { spawn } = require('child_process');

const command = process.argv.slice(2).join(' ');
const TIMEOUT_SECONDS = 600; // 10分钟

if (!command) {
  console.error('用法: node quick-timeout.js <命令>');
  process.exit(1);
}

console.log(`执行命令: ${command}`);
console.log(`超时设置: ${TIMEOUT_SECONDS} 秒 (10分钟)`);

// 解析命令和参数
const [cmd, ...args] = command.split(' ');

// 创建子进程
const child = spawn(cmd, args, {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

// 设置超时
const timeout = setTimeout(() => {
  console.error(`\n⚠️  命令执行超时 (${TIMEOUT_SECONDS} 秒 / 10分钟)`);
  child.kill('SIGTERM');
  process.exit(124); // 超时退出码
}, TIMEOUT_SECONDS * 1000);

// 处理子进程退出
child.on('exit', (code, signal) => {
  clearTimeout(timeout);
  if (signal === 'SIGTERM') {
    console.error('❌ 命令被超时终止');
    process.exit(124);
  } else {
    console.log(`✅ 命令执行完成，退出码: ${code}`);
    process.exit(code);
  }
});

// 处理错误
child.on('error', (error) => {
  clearTimeout(timeout);
  console.error('❌ 命令执行错误:', error.message);
  process.exit(1);
});

// 处理进程信号
process.on('SIGINT', () => {
  clearTimeout(timeout);
  child.kill('SIGINT');
  process.exit(130);
});

process.on('SIGTERM', () => {
  clearTimeout(timeout);
  child.kill('SIGTERM');
  process.exit(143);
});
