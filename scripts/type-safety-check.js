#!/usr/bin/env node

/**
 * TypeScript 类型安全检查脚本
 * 用于持续维护类型安全和代码质量
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
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// 日志函数
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 检查 TypeScript 编译
function checkTypeScriptCompilation() {
  log('\n🔍 检查 TypeScript 编译...', 'blue');

  try {
    execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    log('✅ TypeScript 编译通过', 'green');
    return true;
  } catch (error) {
    log('❌ TypeScript 编译失败', 'red');
    console.log(error.stdout?.toString() || error.message);
    return false;
  }
}

// 检查类型覆盖率
function checkTypeCoverage() {
  log('\n📊 检查类型覆盖率...', 'blue');

  try {
    // 检查是否有 any 类型使用
    const anyUsage = execSync('grep -r "any" --include="*.ts" --include="*.tsx" lib/ app/ components/ || true', { encoding: 'utf8' });

    if (anyUsage.trim()) {
      const anyCount = anyUsage.split('\n').filter(line => line.trim()).length;
      log(`⚠️  发现 ${anyCount} 个 any 类型使用`, 'yellow');

      // 显示前5个 any 使用
      const anyLines = anyUsage.split('\n').slice(0, 5);
      anyLines.forEach(line => {
        if (line.trim()) {
          log(`   ${line}`, 'yellow');
        }
      });

      if (anyCount > 5) {
        log(`   ... 还有 ${anyCount - 5} 个`, 'yellow');
      }
    } else {
      log('✅ 未发现 any 类型使用', 'green');
    }

    return true;
  } catch (error) {
    log('❌ 类型覆盖率检查失败', 'red');
    console.log(error.message);
    return false;
  }
}

// 检查未使用的导入
function checkUnusedImports() {
  log('\n🧹 检查未使用的导入...', 'blue');

  try {
    execSync('npx tsc --noEmit --noUnusedLocals --noUnusedParameters', { stdio: 'pipe' });
    log('✅ 未发现未使用的导入', 'green');
    return true;
  } catch (error) {
    log('⚠️  发现未使用的导入或参数', 'yellow');
    console.log(error.stdout?.toString() || error.message);
    return false;
  }
}

// 检查类型定义文件
function checkTypeDefinitions() {
  log('\n📝 检查类型定义文件...', 'blue');

  const typeFiles = [
    'types/global.d.ts',
    'types/database.ts',
    'types/api.ts',
    'types/component.ts'
  ];

  let allExists = true;

  typeFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log(`✅ ${file} 存在`, 'green');
    } else {
      log(`❌ ${file} 不存在`, 'red');
      allExists = false;
    }
  });

  return allExists;
}

// 生成类型安全报告
function generateTypeSafetyReport() {
  log('\n📋 生成类型安全报告...', 'blue');

  const report = {
    timestamp: new Date().toISOString(),
    checks: {
      compilation: checkTypeScriptCompilation(),
      coverage: checkTypeCoverage(),
      unusedImports: checkUnusedImports(),
      typeDefinitions: checkTypeDefinitions()
    }
  };

  // 计算总体评分
  const totalChecks = Object.keys(report.checks).length;
  const passedChecks = Object.values(report.checks).filter(Boolean).length;
  const score = Math.round((passedChecks / totalChecks) * 100);

  report.score = score;
  report.status = score >= 90 ? 'excellent' : score >= 70 ? 'good' : 'needs-improvement';

  // 保存报告
  const reportPath = 'reports/type-safety-report.json';
  const reportDir = path.dirname(reportPath);

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // 显示结果
  log(`\n📊 类型安全评分: ${score}%`, score >= 90 ? 'green' : score >= 70 ? 'yellow' : 'red');
  log(`📈 状态: ${report.status}`, score >= 90 ? 'green' : score >= 70 ? 'yellow' : 'red');
  log(`📄 报告已保存到: ${reportPath}`, 'blue');

  return report;
}

// 主函数
function main() {
  log('🚀 TypeScript 类型安全检查开始', 'bold');
  log('=' .repeat(50), 'blue');

  const report = generateTypeSafetyReport();

  log('\n' + '=' .repeat(50), 'blue');

  if (report.status === 'excellent') {
    log('🎉 类型安全检查完成！所有检查都通过了！', 'green');
    process.exit(0);
  } else if (report.status === 'good') {
    log('✅ 类型安全检查完成！大部分检查通过，建议优化。', 'yellow');
    process.exit(0);
  } else {
    log('⚠️  类型安全检查完成！需要改进类型安全。', 'red');
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  checkTypeScriptCompilation,
  checkTypeCoverage,
  checkUnusedImports,
  checkTypeDefinitions,
  generateTypeSafetyReport
};
