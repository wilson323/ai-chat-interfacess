#!/usr/bin/env node

/**
 * 代码质量检查脚本
 * 执行TypeScript类型检查、ESLint检查、构建验证等
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n🔍 ${step}: ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// 检查工具是否安装
function checkDependencies() {
  logStep('1', '检查依赖项');

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const devDeps = packageJson.devDependencies || {};

  const requiredDeps = [
    'typescript',
    'eslint',
    'eslint-config-next',
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
  ];

  const missingDeps = requiredDeps.filter(dep => !devDeps[dep]);

  if (missingDeps.length > 0) {
    logError(`缺少依赖项: ${missingDeps.join(', ')}`);
    log('请运行: npm install --save-dev ' + missingDeps.join(' '), 'yellow');
    process.exit(1);
  }

  logSuccess('所有依赖项已安装');
}

// TypeScript类型检查
function checkTypeScript() {
  logStep('2', 'TypeScript类型检查');

  try {
    execSync('npx --package=typescript tsc --noEmit', {
      stdio: 'pipe',
      cwd: process.cwd(),
    });
    logSuccess('TypeScript类型检查通过');
    return true;
  } catch (error) {
    logError('TypeScript类型检查失败');
    console.log(error.stdout?.toString() || error.message);
    return false;
  }
}

// ESLint检查
function checkESLint() {
  logStep('3', 'ESLint代码规范检查');

  try {
    execSync('npx eslint . --ext .ts,.tsx --max-warnings 0', {
      stdio: 'pipe',
      cwd: process.cwd(),
    });
    logSuccess('ESLint检查通过');
    return true;
  } catch (error) {
    logError('ESLint检查失败');
    console.log(error.stdout?.toString() || error.message);
    return false;
  }
}

// 代码格式化检查
function checkPrettier() {
  logStep('4', '代码格式化检查');

  try {
    execSync('npx prettier --check .', {
      stdio: 'pipe',
      cwd: process.cwd(),
    });
    logSuccess('代码格式化检查通过');
    return true;
  } catch (error) {
    logWarning('代码格式化检查失败');
    console.log(error.stdout?.toString() || error.message);
    log('运行 npm run format 来自动修复格式问题', 'yellow');
    return false;
  }
}

// 构建检查
function checkBuild() {
  logStep('5', '构建检查');

  try {
    execSync('npm run build', {
      stdio: 'pipe',
      cwd: process.cwd(),
    });
    logSuccess('构建检查通过');
    return true;
  } catch (error) {
    logError('构建检查失败');
    console.log(error.stdout?.toString() || error.message);
    return false;
  }
}

// 生成质量报告
function generateReport(results) {
  logStep('6', '生成质量报告');

  const report = {
    timestamp: new Date().toISOString(),
    project: 'ai-chat-interfaces',
    results: {
      typescript: results.typescript,
      eslint: results.eslint,
      prettier: results.prettier,
      build: results.build,
    },
    overallScore: calculateScore(results),
    status: getOverallStatus(results),
  };

  // 保存报告
  const reportPath = 'reports/quality-report.json';
  if (!fs.existsSync('reports')) {
    fs.mkdirSync('reports', { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  logSuccess(`质量报告已保存到: ${reportPath}`);

  // 显示总结
  log('\n📊 质量检查总结:', 'magenta');
  log(
    `TypeScript: ${results.typescript ? '✅ 通过' : '❌ 失败'}`,
    results.typescript ? 'green' : 'red'
  );
  log(
    `ESLint: ${results.eslint ? '✅ 通过' : '❌ 失败'}`,
    results.eslint ? 'green' : 'red'
  );
  log(
    `Prettier: ${results.prettier ? '✅ 通过' : '⚠️ 失败'}`,
    results.prettier ? 'green' : 'yellow'
  );
  log(
    `构建: ${results.build ? '✅ 通过' : '❌ 失败'}`,
    results.build ? 'green' : 'red'
  );
  log(
    `总体评分: ${report.overallScore}/100`,
    report.overallScore >= 80 ? 'green' : 'yellow'
  );
  log(`状态: ${report.status}`, report.status === 'PASS' ? 'green' : 'red');

  return report;
}

// 计算质量评分
function calculateScore(results) {
  const weights = {
    typescript: 0.4,
    eslint: 0.3,
    prettier: 0.1,
    build: 0.2,
  };

  let score = 0;
  if (results.typescript) score += weights.typescript * 100;
  if (results.eslint) score += weights.eslint * 100;
  if (results.prettier) score += weights.prettier * 100;
  if (results.build) score += weights.build * 100;

  return Math.round(score);
}

// 获取总体状态
function getOverallStatus(results) {
  const critical = results.typescript && results.eslint && results.build;
  const warnings = !results.prettier;

  if (critical) {
    return warnings ? 'PASS_WITH_WARNINGS' : 'PASS';
  } else {
    return 'FAIL';
  }
}

// 主函数
function main() {
  log('🚀 开始代码质量检查...', 'blue');

  const results = {
    typescript: false,
    eslint: false,
    prettier: false,
    build: false,
  };

  try {
    // 检查依赖
    checkDependencies();

    // 执行各项检查
    results.typescript = checkTypeScript();
    results.eslint = checkESLint();
    results.prettier = checkPrettier();
    results.build = checkBuild();

    // 生成报告
    const report = generateReport(results);

    // 根据结果决定退出码
    if (report.status === 'FAIL') {
      logError('质量检查失败，请修复问题后重试');
      process.exit(1);
    } else if (report.status === 'PASS_WITH_WARNINGS') {
      logWarning('质量检查通过，但有警告');
      process.exit(0);
    } else {
      logSuccess('所有质量检查通过！');
      process.exit(0);
    }
  } catch (error) {
    logError(`质量检查过程中发生错误: ${error.message}`);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  checkDependencies,
  checkTypeScript,
  checkESLint,
  checkPrettier,
  checkBuild,
  generateReport,
};
