#!/usr/bin/env node

/**
 * 综合功能测试脚本
 * 执行项目的所有功能测试，包括单元测试、集成测试和端到端测试
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class ComprehensiveTester {
  constructor() {
    this.testResults = {
      unit: { passed: 0, failed: 0, errors: [] },
      integration: { passed: 0, failed: 0, errors: [] },
      e2e: { passed: 0, failed: 0, errors: [] },
      performance: { passed: 0, failed: 0, errors: [] }
    };
    this.startTime = Date.now();
  }

  /**
   * 执行命令并返回结果
   */
  async executeCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        console.log(`\n🔧 执行命令: ${command}`);
        const result = execSync(command, {
          encoding: 'utf8',
          stdio: 'inherit',
          ...options
        });
        resolve(result);
      } catch (error) {
        console.error(`❌ 命令执行失败: ${error.message}`);
        reject(error);
      }
    });
  }

  /**
   * 检查环境依赖
   */
  async checkDependencies() {
    console.log('\n📋 检查环境依赖...');

    const checks = [
      { name: 'Node.js', command: 'node --version', minVersion: '18.0.0' },
      { name: 'npm', command: 'npm --version', minVersion: '8.0.0' },
      { name: 'TypeScript', command: 'npx tsc --version' },
    ];

    for (const check of checks) {
      try {
        const version = execSync(check.command, { encoding: 'utf8' }).trim();
        console.log(`✅ ${check.name}: ${version}`);
      } catch (error) {
        console.error(`❌ ${check.name} 检查失败: ${error.message}`);
        throw new Error(`环境依赖检查失败: ${check.name}`);
      }
    }
  }

  /**
   * 执行代码质量检查
   */
  async runCodeQualityChecks() {
    console.log('\n🔍 执行代码质量检查...');

    try {
      // TypeScript类型检查
      await this.executeCommand('npm run check-types');

      // ESLint检查
      await this.executeCommand('npm run lint');

      // Prettier格式检查
      await this.executeCommand('npm run format:check');

      console.log('✅ 代码质量检查通过');
    } catch (error) {
      console.error('❌ 代码质量检查失败');
      throw error;
    }
  }

  /**
   * 执行单元测试
   */
  async runUnitTests() {
    console.log('\n🧪 执行单元测试...');

    try {
      await this.executeCommand('npm run test:coverage');
      this.testResults.unit.passed++;
      console.log('✅ 单元测试通过');
    } catch (error) {
      this.testResults.unit.failed++;
      this.testResults.unit.errors.push(error.message);
      console.error('❌ 单元测试失败');
    }
  }

  /**
   * 执行集成测试
   */
  async runIntegrationTests() {
    console.log('\n🔗 执行集成测试...');

    try {
      // 启动开发服务器进行集成测试
      console.log('🚀 启动开发服务器...');
      const serverProcess = spawn('npm', ['run', 'dev'], {
        stdio: 'pipe',
        detached: false
      });

      // 等待服务器启动
      await new Promise(resolve => setTimeout(resolve, 10000));

      // 执行集成测试
      await this.executeCommand('npm run test -- __tests__/integration/');

      // 停止服务器
      serverProcess.kill();

      this.testResults.integration.passed++;
      console.log('✅ 集成测试通过');
    } catch (error) {
      this.testResults.integration.failed++;
      this.testResults.integration.errors.push(error.message);
      console.error('❌ 集成测试失败');
    }
  }

  /**
   * 执行端到端测试
   */
  async runE2ETests() {
    console.log('\n🎭 执行端到端测试...');

    try {
      await this.executeCommand('npx playwright test');
      this.testResults.e2e.passed++;
      console.log('✅ 端到端测试通过');
    } catch (error) {
      this.testResults.e2e.failed++;
      this.testResults.e2e.errors.push(error.message);
      console.error('❌ 端到端测试失败');
    }
  }

  /**
   * 执行性能测试
   */
  async runPerformanceTests() {
    console.log('\n⚡ 执行性能测试...');

    try {
      // 构建项目
      await this.executeCommand('npm run build');

      // 执行性能测试
      await this.executeCommand('npm run test -- __tests__/performance/');

      this.testResults.performance.passed++;
      console.log('✅ 性能测试通过');
    } catch (error) {
      this.testResults.performance.failed++;
      this.testResults.performance.errors.push(error.message);
      console.error('❌ 性能测试失败');
    }
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    const endTime = Date.now();
    const duration = Math.round((endTime - this.startTime) / 1000);

    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}秒`,
      summary: {
        totalTests: Object.values(this.testResults).reduce((sum, result) => sum + result.passed + result.failed, 0),
        passedTests: Object.values(this.testResults).reduce((sum, result) => sum + result.passed, 0),
        failedTests: Object.values(this.testResults).reduce((sum, result) => sum + result.failed, 0),
        successRate: 0
      },
      details: this.testResults,
      recommendations: this.generateRecommendations()
    };

    report.summary.successRate = Math.round(
      (report.summary.passedTests / report.summary.totalTests) * 100
    );

    return report;
  }

  /**
   * 生成修复建议
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.testResults.unit.failed > 0) {
      recommendations.push('修复单元测试失败问题，提高代码覆盖率');
    }

    if (this.testResults.integration.failed > 0) {
      recommendations.push('检查API接口和数据库连接问题');
    }

    if (this.testResults.e2e.failed > 0) {
      recommendations.push('修复用户界面和交互流程问题');
    }

    if (this.testResults.performance.failed > 0) {
      recommendations.push('优化性能瓶颈，提升响应速度');
    }

    if (recommendations.length === 0) {
      recommendations.push('所有测试通过，系统运行正常');
    }

    return recommendations;
  }

  /**
   * 保存测试报告
   */
  async saveReport(report) {
    const reportDir = path.join(__dirname, '../test-results');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportFile = path.join(reportDir, `test-report-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    console.log(`\n📊 测试报告已保存: ${reportFile}`);
    return reportFile;
  }

  /**
   * 执行完整测试流程
   */
  async runAllTests() {
    try {
      console.log('🚀 开始综合功能测试...');

      // 1. 环境检查
      await this.checkDependencies();

      // 2. 代码质量检查
      await this.runCodeQualityChecks();

      // 3. 单元测试
      await this.runUnitTests();

      // 4. 集成测试
      await this.runIntegrationTests();

      // 5. 端到端测试
      await this.runE2ETests();

      // 6. 性能测试
      await this.runPerformanceTests();

      // 7. 生成报告
      const report = this.generateReport();
      await this.saveReport(report);

      // 8. 输出总结
      this.printSummary(report);

      return report;

    } catch (error) {
      console.error('\n💥 测试流程执行失败:', error.message);
      throw error;
    }
  }

  /**
   * 打印测试总结
   */
  printSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📋 测试总结报告');
    console.log('='.repeat(60));
    console.log(`⏱️  执行时间: ${report.duration}`);
    console.log(`📊 总测试数: ${report.summary.totalTests}`);
    console.log(`✅ 通过测试: ${report.summary.passedTests}`);
    console.log(`❌ 失败测试: ${report.summary.failedTests}`);
    console.log(`📈 成功率: ${report.summary.successRate}%`);

    console.log('\n🔧 修复建议:');
    report.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });

    console.log('\n' + '='.repeat(60));
  }
}

// 主执行函数
async function main() {
  const tester = new ComprehensiveTester();

  try {
    const report = await tester.runAllTests();

    if (report.summary.failedTests > 0) {
      console.log('\n⚠️  存在测试失败，请检查并修复相关问题');
      process.exit(1);
    } else {
      console.log('\n🎉 所有测试通过！系统功能正常');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n💥 测试执行过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = ComprehensiveTester;
