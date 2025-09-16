#!/usr/bin/env node

/**
 * TypeScript 类型安全监控仪表板
 * 提供实时的类型安全状态监控
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 获取类型安全报告
function getTypeSafetyReport() {
  const reportPath = 'reports/type-safety-report.json';

  if (fs.existsSync(reportPath)) {
    return JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  }

  return null;
}

// 获取类型覆盖率趋势
function getTypeCoverageTrend() {
  const trendPath = 'reports/trends/type-coverage.json';

  if (fs.existsSync(trendPath)) {
    const data = fs.readFileSync(trendPath, 'utf8');
    return data.split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  return [];
}

// 获取项目统计信息
function getProjectStats() {
  try {
    // 统计 TypeScript 文件数量
    const tsFiles = execSync('find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | wc -l', { encoding: 'utf8' }).trim();

    // 统计类型定义文件数量
    const typeFiles = execSync('find . -name "*.d.ts" | grep -v node_modules | wc -l', { encoding: 'utf8' }).trim();

    // 统计接口数量
    const interfaces = execSync('grep -r "interface " --include="*.ts" --include="*.tsx" . | grep -v node_modules | wc -l', { encoding: 'utf8' }).trim();

    // 统计类型别名数量
    const typeAliases = execSync('grep -r "type " --include="*.ts" --include="*.tsx" . | grep -v node_modules | wc -l', { encoding: 'utf8' }).trim();

    // 统计枚举数量
    const enums = execSync('grep -r "enum " --include="*.ts" --include="*.tsx" . | grep -v node_modules | wc -l', { encoding: 'utf8' }).trim();

    return {
      tsFiles: parseInt(tsFiles),
      typeFiles: parseInt(typeFiles),
      interfaces: parseInt(interfaces),
      typeAliases: parseInt(typeAliases),
      enums: parseInt(enums)
    };
  } catch (error) {
    log('⚠️  无法获取项目统计信息', 'yellow');
    return {
      tsFiles: 0,
      typeFiles: 0,
      interfaces: 0,
      typeAliases: 0,
      enums: 0
    };
  }
}

// 获取编译时间
function getCompilationTime() {
  try {
    const startTime = Date.now();
    execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    const endTime = Date.now();
    return endTime - startTime;
  } catch (error) {
    return null;
  }
}

// 显示仪表板
function displayDashboard() {
  log('🚀 TypeScript 类型安全监控仪表板', 'bold');
  log('=' .repeat(60), 'blue');

  // 获取数据
  const report = getTypeSafetyReport();
  const trend = getTypeCoverageTrend();
  const stats = getProjectStats();
  const compilationTime = getCompilationTime();

  // 显示当前状态
  log('\n📊 当前状态', 'cyan');
  log('─' .repeat(30), 'dim');

  if (report) {
    const score = report.score;
    const status = report.status;
    const statusEmoji = score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴';
    const statusText = status === 'excellent' ? '优秀' :
                     status === 'good' ? '良好' : '需要改进';

    log(`${statusEmoji} 类型安全评分: ${score}%`, score >= 90 ? 'green' : score >= 70 ? 'yellow' : 'red');
    log(`📈 状态: ${statusText}`, score >= 90 ? 'green' : score >= 70 ? 'yellow' : 'red');

    // 显示检查结果
    log('\n🔍 检查结果', 'cyan');
    log('─' .repeat(30), 'dim');
    log(`TypeScript 编译: ${report.checks.compilation ? '✅ 通过' : '❌ 失败'}`, report.checks.compilation ? 'green' : 'red');
    log(`类型覆盖率: ${report.checks.coverage ? '✅ 通过' : '❌ 失败'}`, report.checks.coverage ? 'green' : 'red');
    log(`未使用导入: ${report.checks.unusedImports ? '✅ 通过' : '❌ 失败'}`, report.checks.unusedImports ? 'green' : 'red');
    log(`类型定义: ${report.checks.typeDefinitions ? '✅ 通过' : '❌ 失败'}`, report.checks.typeDefinitions ? 'green' : 'red');
  } else {
    log('⚠️  未找到类型安全报告，请先运行 npm run type-coverage', 'yellow');
  }

  // 显示项目统计
  log('\n📈 项目统计', 'cyan');
  log('─' .repeat(30), 'dim');
  log(`TypeScript 文件: ${stats.tsFiles}`, 'blue');
  log(`类型定义文件: ${stats.typeFiles}`, 'blue');
  log(`接口定义: ${stats.interfaces}`, 'blue');
  log(`类型别名: ${stats.typeAliases}`, 'blue');
  log(`枚举定义: ${stats.enums}`, 'blue');

  // 显示编译时间
  if (compilationTime !== null) {
    log(`\n⏱️  编译时间: ${compilationTime}ms`, compilationTime < 5000 ? 'green' : compilationTime < 10000 ? 'yellow' : 'red');
  }

  // 显示趋势
  if (trend.length > 0) {
    log('\n📈 类型覆盖率趋势', 'cyan');
    log('─' .repeat(30), 'dim');

    const recentTrend = trend.slice(-7); // 最近7天
    recentTrend.forEach(item => {
      const date = new Date(item.date).toLocaleDateString();
      const score = item.score;
      const emoji = score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴';
      log(`${emoji} ${date}: ${score}%`, score >= 90 ? 'green' : score >= 70 ? 'yellow' : 'red');
    });

    // 计算趋势
    if (recentTrend.length >= 2) {
      const latest = recentTrend[recentTrend.length - 1].score;
      const previous = recentTrend[recentTrend.length - 2].score;
      const change = latest - previous;
      const changeEmoji = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
      const changeColor = change > 0 ? 'green' : change < 0 ? 'red' : 'yellow';
      log(`\n${changeEmoji} 变化: ${change > 0 ? '+' : ''}${change}%`, changeColor);
    }
  }

  // 显示建议
  log('\n💡 建议', 'cyan');
  log('─' .repeat(30), 'dim');

  if (report) {
    if (report.score < 90) {
      log('• 建议提高类型安全评分到90%以上', 'yellow');
    }
    if (!report.checks.compilation) {
      log('• 修复 TypeScript 编译错误', 'red');
    }
    if (!report.checks.coverage) {
      log('• 检查 any 类型使用情况', 'yellow');
    }
    if (!report.checks.unusedImports) {
      log('• 清理未使用的导入', 'yellow');
    }
    if (!report.checks.typeDefinitions) {
      log('• 完善类型定义文件', 'yellow');
    }
  }

  if (compilationTime && compilationTime > 10000) {
    log('• 考虑优化编译性能', 'yellow');
  }

  log('\n' + '=' .repeat(60), 'blue');
  log('🎯 保持类型安全，提升代码质量！', 'green');
}

// 主函数
function main() {
  displayDashboard();
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  getTypeSafetyReport,
  getTypeCoverageTrend,
  getProjectStats,
  getCompilationTime,
  displayDashboard
};
