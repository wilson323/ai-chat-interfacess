#!/usr/bin/env node

/**
 * 代码质量监控系统
 * 实时监控代码质量，提供质量报告和告警
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 质量指标收集
class QualityMonitor {
  constructor() {
    this.metrics = {
      syntax: { passed: 0, failed: 0, errors: [] },
      types: { passed: 0, failed: 0, errors: [] },
      lint: { passed: 0, failed: 0, errors: [] },
      test: { passed: 0, failed: 0, errors: [] },
      build: { passed: 0, failed: 0, errors: [] },
      security: { passed: 0, failed: 0, errors: [] },
      performance: { passed: 0, failed: 0, errors: [] }
    };
  }

  // 检查语法错误
  async checkSyntax() {
    log('🔍 检查语法错误...', 'blue');
    try {
      execSync('npm run check-types', { stdio: 'pipe' });
      this.metrics.syntax.passed++;
      log('✅ 语法检查通过', 'green');
      return true;
    } catch (error) {
      this.metrics.syntax.failed++;
      this.metrics.syntax.errors.push(error.message);
      log('❌ 语法检查失败', 'red');
      return false;
    }
  }

  // 检查类型安全
  async checkTypes() {
    log('🔍 检查类型安全...', 'blue');
    try {
      execSync('npx tsc --noEmit --strict', { stdio: 'pipe' });
      this.metrics.types.passed++;
      log('✅ 类型检查通过', 'green');
      return true;
    } catch (error) {
      this.metrics.types.failed++;
      this.metrics.types.errors.push(error.message);
      log('❌ 类型检查失败', 'red');
      return false;
    }
  }

  // 检查代码规范
  async checkLint() {
    log('🔍 检查代码规范...', 'blue');
    try {
      execSync('npm run lint', { stdio: 'pipe' });
      this.metrics.lint.passed++;
      log('✅ 代码规范检查通过', 'green');
      return true;
    } catch (error) {
      this.metrics.lint.failed++;
      this.metrics.lint.errors.push(error.message);
      log('❌ 代码规范检查失败', 'red');
      return false;
    }
  }

  // 检查测试覆盖率
  async checkTests() {
    log('🔍 检查测试覆盖率...', 'blue');
    try {
      execSync('npm run test:coverage', { stdio: 'pipe' });
      this.metrics.test.passed++;
      log('✅ 测试检查通过', 'green');
      return true;
    } catch (error) {
      this.metrics.test.failed++;
      this.metrics.test.errors.push(error.message);
      log('❌ 测试检查失败', 'red');
      return false;
    }
  }

  // 检查构建
  async checkBuild() {
    log('🔍 检查构建...', 'blue');
    try {
      execSync('npm run build', { stdio: 'pipe' });
      this.metrics.build.passed++;
      log('✅ 构建检查通过', 'green');
      return true;
    } catch (error) {
      this.metrics.build.failed++;
      this.metrics.build.errors.push(error.message);
      log('❌ 构建检查失败', 'red');
      return false;
    }
  }

  // 检查安全问题
  async checkSecurity() {
    log('🔍 检查安全问题...', 'blue');
    try {
      // 检查依赖漏洞
      execSync('npm audit --audit-level moderate', { stdio: 'pipe' });
      this.metrics.security.passed++;
      log('✅ 安全检查通过', 'green');
      return true;
    } catch (error) {
      this.metrics.security.failed++;
      this.metrics.security.errors.push(error.message);
      log('❌ 安全检查失败', 'red');
      return false;
    }
  }

  // 检查性能问题
  async checkPerformance() {
    log('🔍 检查性能问题...', 'blue');
    try {
      // 检查包大小
      const buildOutput = execSync('npm run build', { stdio: 'pipe' }).toString();
      const bundleSize = this.extractBundleSize(buildOutput);

      if (bundleSize > 1000000) { // 1MB
        this.metrics.performance.failed++;
        this.metrics.performance.errors.push(`Bundle size too large: ${bundleSize} bytes`);
        log('⚠️  包大小过大', 'yellow');
        return false;
      }

      this.metrics.performance.passed++;
      log('✅ 性能检查通过', 'green');
      return true;
    } catch (error) {
      this.metrics.performance.failed++;
      this.metrics.performance.errors.push(error.message);
      log('❌ 性能检查失败', 'red');
      return false;
    }
  }

  // 提取包大小
  extractBundleSize(output) {
    const match = output.match(/First Load JS shared by all[^\d]+(\d+\.?\d*)\s*kB/);
    return match ? parseFloat(match[1]) * 1024 : 0;
  }

  // 生成质量报告
  generateReport() {
    log('\n📊 代码质量报告', 'cyan');
    log('=' * 50, 'cyan');

    const totalChecks = Object.values(this.metrics).reduce((sum, metric) => sum + metric.passed + metric.failed, 0);
    const passedChecks = Object.values(this.metrics).reduce((sum, metric) => sum + metric.passed, 0);
    const successRate = totalChecks > 0 ? (passedChecks / totalChecks * 100).toFixed(2) : 0;

    log(`总体通过率: ${successRate}%`, successRate >= 80 ? 'green' : 'red');
    log(`通过检查: ${passedChecks}/${totalChecks}`, 'blue');

    // 详细报告
    Object.entries(this.metrics).forEach(([category, metric]) => {
      const status = metric.failed === 0 ? '✅' : '❌';
      const color = metric.failed === 0 ? 'green' : 'red';
      log(`${status} ${category}: ${metric.passed}通过, ${metric.failed}失败`, color);

      if (metric.errors.length > 0) {
        metric.errors.forEach(error => {
          log(`  - ${error}`, 'yellow');
        });
      }
    });

    return {
      successRate: parseFloat(successRate),
      totalChecks,
      passedChecks,
      metrics: this.metrics
    };
  }

  // 保存报告
  saveReport(report) {
    const reportPath = 'logs/quality-report.json';
    const reportDir = path.dirname(reportPath);

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportData = {
      timestamp: new Date().toISOString(),
      ...report
    };

    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    log(`📄 质量报告已保存: ${reportPath}`, 'green');
  }

  // 运行所有检查
  async runAllChecks() {
    log('🚀 开始代码质量监控...', 'magenta');

    await this.checkSyntax();
    await this.checkTypes();
    await this.checkLint();
    await this.checkTests();
    await this.checkBuild();
    await this.checkSecurity();
    await this.checkPerformance();

    const report = this.generateReport();
    this.saveReport(report);

    return report;
  }
}

// 主函数
async function main() {
  const monitor = new QualityMonitor();
  const report = await monitor.runAllChecks();

  if (report.successRate >= 80) {
    log('\n🎉 代码质量优秀！', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  代码质量需要改进', 'yellow');
    process.exit(1);
  }
}

// 运行监控
if (require.main === module) {
  main().catch(error => {
    log(`❌ 监控失败: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { QualityMonitor };
