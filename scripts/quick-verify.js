#!/usr/bin/env node

/**
 * 快速验证脚本
 * 验证代码质量保障体系是否正常工作
 */

const { execSync } = require('child_process');

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 验证步骤
const verificationSteps = [
  {
    name: 'TypeScript类型检查',
    command: 'npm run check-types',
    timeout: 30000
  },
  {
    name: '代码规范检查',
    command: 'npm run lint',
    timeout: 30000
  },
  {
    name: '代码格式化检查',
    command: 'npm run format:check',
    timeout: 30000
  },
  {
    name: '测试运行',
    command: 'npm run test',
    timeout: 60000
  },
  {
    name: '项目构建',
    command: 'npm run build',
    timeout: 120000
  }
];

// 执行验证步骤
async function runVerification() {
  log('🚀 开始快速验证...', 'magenta');
  log('=' * 50, 'cyan');

  let allPassed = true;
  const results = [];

  for (const step of verificationSteps) {
    log(`\n📋 ${step.name}...`, 'blue');

    try {
      const startTime = Date.now();
      execSync(step.command, {
        stdio: 'pipe',
        timeout: step.timeout
      });
      const duration = Date.now() - startTime;

      log(`✅ ${step.name} 通过 (${duration}ms)`, 'green');
      results.push({ step: step.name, status: 'passed', duration });

    } catch (error) {
      log(`❌ ${step.name} 失败`, 'red');
      log(`错误: ${error.message}`, 'red');
      results.push({ step: step.name, status: 'failed', error: error.message });
      allPassed = false;
    }
  }

  // 生成验证报告
  log('\n📊 验证报告', 'cyan');
  log('=' * 50, 'cyan');

  results.forEach(result => {
    const status = result.status === 'passed' ? '✅' : '❌';
    const color = result.status === 'passed' ? 'green' : 'red';
    log(`${status} ${result.step}`, color);

    if (result.duration) {
      log(`   耗时: ${result.duration}ms`, 'yellow');
    }

    if (result.error) {
      log(`   错误: ${result.error}`, 'red');
    }
  });

  // 总结
  const passedCount = results.filter(r => r.status === 'passed').length;
  const totalCount = results.length;
  const successRate = (passedCount / totalCount * 100).toFixed(1);

  log(`\n📈 验证结果`, 'blue');
  log(`通过率: ${successRate}% (${passedCount}/${totalCount})`,
      successRate >= 80 ? 'green' : 'red');

  if (allPassed) {
    log('\n🎉 所有验证通过！代码质量保障体系工作正常', 'green');
    log('✅ 可以安全地进行开发工作', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  部分验证失败，请检查上述错误', 'yellow');
    log('🔧 建议运行以下命令进行修复:', 'blue');
    log('   npm run lint:fix', 'cyan');
    log('   npm run format', 'cyan');
    log('   npm run check-types', 'cyan');
    process.exit(1);
  }
}

// 运行验证
if (require.main === module) {
  runVerification().catch(error => {
    log(`❌ 验证过程出错: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runVerification };
