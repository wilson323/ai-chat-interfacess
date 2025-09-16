#!/usr/bin/env node

/**
 * 清理和重建脚本
 * 清理所有编译文件并重新构建
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🧹 开始清理和重建...');

// 需要清理的目录和文件
const cleanTargets = [
  // Next.js 构建文件
  '.next',
  'out',
  'build',
  'dist',

  // TypeScript 编译文件
  '*.tsbuildinfo',
  'tsconfig.tsbuildinfo',
  'tsconfig.strict.tsbuildinfo',

  // 缓存文件
  '.cache',
  'node_modules/.cache',
  'coverage',

  // 日志文件
  '*.log',
  'npm-debug.log*',
  'yarn-debug.log*',
  'yarn-error.log*',

  // 临时文件
  '.tmp',
  'temp',
  '*.tmp',

  // 构建报告
  'build-report.json',
  'smart-build-report.json',

  // Jest 缓存
  'jest-cache',
  '.jest-cache'
];

// 清理函数
function cleanDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ 已清理: ${dirPath}`);
      return true;
    } catch (error) {
      console.log(`⚠️  清理失败: ${dirPath} - ${error.message}`);
      return false;
    }
  }
  return true;
}

// 清理文件
function cleanFile(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ 已清理: ${filePath}`);
      return true;
    } catch (error) {
      console.log(`⚠️  清理失败: ${filePath} - ${error.message}`);
      return false;
    }
  }
  return true;
}

// 清理通配符文件
function cleanGlobPattern(pattern) {
  const glob = require('glob');
  try {
    const files = glob.sync(pattern, { cwd: process.cwd() });
    files.forEach(file => {
      cleanFile(file);
    });
    if (files.length > 0) {
      console.log(`✅ 已清理通配符: ${pattern} (${files.length} 个文件)`);
    }
  } catch (error) {
    console.log(`⚠️  通配符清理失败: ${pattern} - ${error.message}`);
  }
}

// 执行清理
async function performCleanup() {
  console.log('🧹 开始清理编译文件...');

  let cleanedCount = 0;
  let failedCount = 0;

  // 清理目录
  for (const target of cleanTargets) {
    if (target.includes('*')) {
      cleanGlobPattern(target);
    } else {
      const result = cleanDirectory(target);
      if (result) {
        cleanedCount++;
      } else {
        failedCount++;
      }
    }
  }

  // 清理 node_modules 缓存
  console.log('🧹 清理 node_modules 缓存...');
  try {
    const cacheDir = path.join('node_modules', '.cache');
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
      console.log('✅ 已清理 node_modules 缓存');
    }
  } catch (error) {
    console.log('⚠️  清理 node_modules 缓存失败:', error.message);
  }

  console.log(`📊 清理完成: 成功 ${cleanedCount} 个, 失败 ${failedCount} 个`);
  console.log('');
}

// 重新安装依赖
async function reinstallDependencies() {
  console.log('📦 重新安装依赖...');

  return new Promise((resolve) => {
    const process = spawn('npm', ['install'], {
      stdio: 'inherit',
      shell: true
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log('✅ 依赖安装完成');
        resolve(true);
      } else {
        console.log('❌ 依赖安装失败');
        resolve(false);
      }
    });

    process.on('error', (error) => {
      console.log('❌ 依赖安装错误:', error.message);
      resolve(false);
    });
  });
}

// 执行类型检查
async function runTypeCheck() {
  console.log('🔍 执行 TypeScript 类型检查...');

  return new Promise((resolve) => {
    const process = spawn('npx', ['tsc', '--noEmit', '--strict', '--skipLibCheck'], {
      stdio: 'inherit',
      shell: true
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log('✅ TypeScript 类型检查通过');
        resolve(true);
      } else {
        console.log('❌ TypeScript 类型检查失败');
        resolve(false);
      }
    });

    process.on('error', (error) => {
      console.log('❌ TypeScript 类型检查错误:', error.message);
      resolve(false);
    });
  });
}

// 执行构建
async function runBuild() {
  console.log('🔨 执行智能构建...');

  return new Promise((resolve) => {
    const process = spawn('node', ['scripts/smart-build.js'], {
      stdio: 'inherit',
      shell: true
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log('✅ 构建完成');
        resolve(true);
      } else {
        console.log('❌ 构建失败');
        resolve(false);
      }
    });

    process.on('error', (error) => {
      console.log('❌ 构建错误:', error.message);
      resolve(false);
    });
  });
}

// 主执行流程
async function main() {
  try {
    // 步骤1: 清理
    await performCleanup();

    // 步骤2: 重新安装依赖
    const depsSuccess = await reinstallDependencies();
    if (!depsSuccess) {
      console.log('❌ 依赖安装失败，停止重建');
      process.exit(1);
    }

    // 步骤3: 类型检查
    const typeCheckSuccess = await runTypeCheck();
    if (!typeCheckSuccess) {
      console.log('❌ 类型检查失败，停止重建');
      process.exit(1);
    }

    // 步骤4: 构建
    const buildSuccess = await runBuild();
    if (!buildSuccess) {
      console.log('❌ 构建失败');
      process.exit(1);
    }

    console.log('');
    console.log('🎉 清理和重建完成！');
    console.log('');
    console.log('📋 重建总结:');
    console.log('  ✅ 清理编译文件: 完成');
    console.log('  ✅ 重新安装依赖: 完成');
    console.log('  ✅ TypeScript 类型检查: 通过');
    console.log('  ✅ 智能构建: 完成');
    console.log('');
    console.log('💡 项目已准备就绪，可以开始开发或部署');

  } catch (error) {
    console.error('❌ 重建过程出错:', error.message);
    process.exit(1);
  }
}

// 开始执行
main();
