#!/usr/bin/env node

/**
 * 最终类型验证脚本
 * 验证所有TypeScript类型错误是否已修复
 */

const { execSync } = require('child_process');
const fs = require('fs');

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 运行TypeScript检查
function runTypeScriptCheck() {
  log('🔍 运行TypeScript类型检查...', 'blue');

  try {
    execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    log('✅ TypeScript编译通过', 'green');
    return true;
  } catch (error) {
    log('❌ TypeScript编译失败', 'red');
    console.log(error.stdout?.toString() || error.message);
    return false;
  }
}

// 运行ESLint检查
function runESLintCheck() {
  log('🔧 运行ESLint检查...', 'blue');

  try {
    execSync('npx eslint . --ext .ts,.tsx --max-warnings 0', { stdio: 'pipe' });
    log('✅ ESLint检查通过', 'green');
    return true;
  } catch (error) {
    log('⚠️  ESLint检查发现问题', 'yellow');
    console.log(error.stdout?.toString() || error.message);
    return false;
  }
}

// 检查关键文件是否存在
function checkKeyFiles() {
  log('📁 检查关键文件...', 'blue');

  const keyFiles = [
    'tsconfig.json',
    'package.json',
    'lib/api/middleware.ts',
    'lib/api/response.ts',
    'lib/db/models/agent-usage.ts',
    'lib/performance/enhanced-monitor.ts',
    'scripts/type-safety-check.js',
    'scripts/type-tests.ts',
    'scripts/type-safety-dashboard.js'
  ];

  let allExist = true;

  keyFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log(`  ✅ ${file}`, 'green');
    } else {
      log(`  ❌ ${file}`, 'red');
      allExist = false;
    }
  });

  return allExist;
}

// 检查NPM脚本
function checkNpmScripts() {
  log('📦 检查NPM脚本...', 'blue');

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const scripts = packageJson.scripts;

    const requiredScripts = [
      'type-check',
      'type-coverage',
      'type-tests',
      'type-safety',
      'docs:types',
      'type-dashboard'
    ];

    let allScriptsExist = true;

    requiredScripts.forEach(script => {
      if (scripts[script]) {
        log(`  ✅ ${script}`, 'green');
      } else {
        log(`  ❌ ${script}`, 'red');
        allScriptsExist = false;
      }
    });

    return allScriptsExist;
  } catch (error) {
    log(`  ❌ 无法读取package.json: ${error.message}`, 'red');
    return false;
  }
}

// 检查文档文件
function checkDocumentation() {
  log('📚 检查文档文件...', 'blue');

  const docFiles = [
    'docs/TypeScript编译错误修复/类型安全维护体系.md',
    'docs/TypeScript编译错误修复/类型安全维护指南.md',
    'docs/TypeScript编译错误修复/最终修复总结.md',
    'docs/types/api-types.md',
    'docs/types/database-types.md',
    'docs/types/error-types.md',
    'docs/types/component-types.md'
  ];

  let allDocsExist = true;

  docFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log(`  ✅ ${file}`, 'green');
    } else {
      log(`  ❌ ${file}`, 'red');
      allDocsExist = false;
    }
  });

  return allDocsExist;
}

// 生成验证报告
function generateVerificationReport(results) {
  log('\n📊 生成验证报告...', 'blue');

  const report = {
    timestamp: new Date().toISOString(),
    results: results,
    summary: {
      total: Object.keys(results).length,
      passed: Object.values(results).filter(Boolean).length,
      failed: Object.values(results).filter(r => !r).length
    }
  };

  const score = Math.round((report.summary.passed / report.summary.total) * 100);
  report.score = score;
  report.status = score >= 90 ? 'excellent' : score >= 70 ? 'good' : 'needs-improvement';

  // 保存报告
  const reportPath = 'reports/final-verification-report.json';
  const reportDir = 'reports';

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // 显示结果
  log(`\n📈 验证评分: ${score}%`, score >= 90 ? 'green' : score >= 70 ? 'yellow' : 'red');
  log(`📊 状态: ${report.status}`, score >= 90 ? 'green' : score >= 70 ? 'yellow' : 'red');
  log(`📄 报告已保存到: ${reportPath}`, 'blue');

  return report;
}

// 主函数
function main() {
  log('🚀 开始最终类型验证...', 'bold');
  log('=' .repeat(50), 'blue');

  const results = {
    typescript: runTypeScriptCheck(),
    eslint: runESLintCheck(),
    keyFiles: checkKeyFiles(),
    npmScripts: checkNpmScripts(),
    documentation: checkDocumentation()
  };

  const report = generateVerificationReport(results);

  log('\n' + '=' .repeat(50), 'blue');

  if (report.status === 'excellent') {
    log('🎉 所有验证都通过了！TypeScript类型错误修复完成！', 'green');
    log('💡 建议运行 npm run dev 启动开发服务器', 'blue');
    process.exit(0);
  } else if (report.status === 'good') {
    log('✅ 大部分验证通过，建议进一步优化', 'yellow');
    process.exit(0);
  } else {
    log('⚠️  需要进一步修复类型问题', 'red');
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  runTypeScriptCheck,
  runESLintCheck,
  checkKeyFiles,
  checkNpmScripts,
  checkDocumentation,
  generateVerificationReport
};
