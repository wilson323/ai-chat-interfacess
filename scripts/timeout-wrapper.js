#!/usr/bin/env node
/**
 * 跨平台超时包装脚本
 * 用法: node timeout-wrapper.js <超时秒数> <命令>
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const timeoutSeconds = parseInt(process.argv[2]);
const command = process.argv[3];

if (!timeoutSeconds || !command) {
  console.error('用法: node timeout-wrapper.js <超时秒数> <命令>');
  process.exit(1);
}

console.log(`执行命令: ${command}`);
console.log(`超时设置: ${timeoutSeconds} 秒`);

// 解析命令和参数（保持最小侵入，按空格拆分）
const [rawCmd, ...args] = command.split(' ');

// 解析本地可执行路径（优先使用 node_modules/.bin）
function resolveCommandPath(cmd) {
  const isWin = process.platform === 'win32';
  const binName = isWin ? `${cmd}.cmd` : cmd;
  const localBin = path.join(process.cwd(), 'node_modules', '.bin', binName);
  if (fs.existsSync(localBin)) return localBin;
  return cmd; // 回退到 PATH 查找
}

// 为常见工具提供 Node 直执行入口，避免 .cmd 差异
function resolveNodeEntrypoint(cmd) {
  try {
    switch (cmd) {
      case 'next':
        return require.resolve('next/dist/bin/next');
      case 'jest':
        return require.resolve('jest/bin/jest.js');
      case 'prettier':
        return require.resolve('prettier/bin-prettier.js');
      case 'tsc':
        return require.resolve('typescript/lib/tsc.js');
      default:
        return '';
    }
  } catch (_e) {
    return '';
  }
}

let cmdPath = resolveCommandPath(rawCmd);
let finalArgs = args;

const nodeEntrypoint = resolveNodeEntrypoint(rawCmd);
if (nodeEntrypoint) {
  cmdPath = process.execPath; // 使用当前 node 可执行文件
  finalArgs = [nodeEntrypoint, ...args];
}

// 创建子进程
const child = spawn(cmdPath, finalArgs, {
  stdio: 'inherit',
  // 在 Windows 下启用 shell 可避免某些可执行文件触发 EINVAL
  shell: process.platform === 'win32',
  // 关闭隐藏窗口，避免在部分 Node 版本/终端下 EINVAL
  windowsHide: false,
  cwd: process.cwd()
});

// 设置超时
const timeout = setTimeout(() => {
  console.error(`\n命令执行超时 (${timeoutSeconds} 秒)`);
  child.kill('SIGTERM');
  process.exit(124); // 超时退出码
}, timeoutSeconds * 1000);

// 处理子进程退出
child.on('exit', (code, signal) => {
  clearTimeout(timeout);
  if (signal === 'SIGTERM') {
    console.error('命令被超时终止');
    process.exit(124);
  } else {
    process.exit(code);
  }
});

// 处理错误
child.on('error', (error) => {
  clearTimeout(timeout);
  console.error('命令执行错误:', error.message);
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
