#!/usr/bin/env node

/**
 * 快速功能测试脚本
 * 验证核心功能是否正常工作
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class QuickTester {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  /**
   * 添加测试结果
   */
  addResult(testName, success, message = '') {
    this.results.push({
      test: testName,
      success,
      message,
      timestamp: new Date().toISOString()
    });

    const icon = success ? '✅' : '❌';
    console.log(`${icon} ${testName}: ${message}`);
  }

  /**
   * 执行命令并捕获结果
   */
  async runCommand(command, testName) {
    try {
      console.log(`\n🔧 执行: ${testName}`);
      execSync(command, { stdio: 'pipe' });
      this.addResult(testName, true, '通过');
      return true;
    } catch (error) {
      this.addResult(testName, false, error.message);
      return false;
    }
  }

  /**
   * 检查文件是否存在
   */
  checkFileExists(filePath, testName) {
    const exists = fs.existsSync(filePath);
    this.addResult(testName, exists, exists ? '文件存在' : '文件不存在');
    return exists;
  }

  /**
   * 检查目录是否存在
   */
  checkDirExists(dirPath, testName) {
    const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
    this.addResult(testName, exists, exists ? '目录存在' : '目录不存在');
    return exists;
  }

  /**
   * 验证项目结构
   */
  async validateProjectStructure() {
    console.log('\n📁 验证项目结构...');

    const requiredFiles = [
      { path: 'package.json', name: 'package.json 配置文件' },
      { path: 'next.config.mjs', name: 'Next.js 配置文件' },
      { path: 'tsconfig.json', name: 'TypeScript 配置文件' },
      { path: 'tailwind.config.ts', name: 'Tailwind 配置文件' },
      { path: 'jest.config.js', name: 'Jest 测试配置' },
      { path: 'playwright.config.ts', name: 'Playwright 配置' }
    ];

    const requiredDirs = [
      { path: 'app', name: 'app 目录' },
      { path: 'components', name: 'components 目录' },
      { path: 'lib', name: 'lib 目录' },
      { path: '__tests__', name: '__tests__ 目录' },
      { path: 'docs', name: 'docs 目录' }
    ];

    // 检查必需文件
    for (const file of requiredFiles) {
      this.checkFileExists(file.path, file.name);
    }

    // 检查必需目录
    for (const dir of requiredDirs) {
      this.checkDirExists(dir.path, dir.name);
    }
  }

  /**
   * 验证核心API路由
   */
  async validateAPIRoutes() {
    console.log('\n🔗 验证API路由...');

    const apiRoutes = [
      { path: 'app/api/health/route.ts', name: '健康检查API' },
      { path: 'app/api/chat-proxy/route.ts', name: '聊天代理API' },
      { path: 'app/api/agent-config/route.ts', name: '代理配置API' },
      { path: 'app/api/upload/route.ts', name: '文件上传API' },
      { path: 'app/api/voice-to-text/route.ts', name: '语音转文字API' }
    ];

    for (const route of apiRoutes) {
      this.checkFileExists(route.path, route.name);
    }
  }

  /**
   * 验证核心组件
   */
  async validateComponents() {
    console.log('\n🧩 验证核心组件...');

    const components = [
      { path: 'components/chat-message.tsx', name: '聊天消息组件' },
      { path: 'components/chat-input.tsx', name: '聊天输入组件' },
      { path: 'components/message-list.tsx', name: '消息列表组件' },
      { path: 'components/header.tsx', name: '头部组件' },
      { path: 'components/sidebar.tsx', name: '侧边栏组件' },
      { path: 'components/file-uploader.tsx', name: '文件上传组件' }
    ];

    for (const component of components) {
      this.checkFileExists(component.path, component.name);
    }
  }

  /**
   * 执行代码质量检查
   */
  async runQualityChecks() {
    console.log('\n🔍 执行代码质量检查...');

    await this.runCommand('npm run check-types', 'TypeScript 类型检查');
    await this.runCommand('npm run lint', 'ESLint 代码检查');
    await this.runCommand('npm run format:check', 'Prettier 格式检查');
  }

  /**
   * 执行基础测试
   */
  async runBasicTests() {
    console.log('\n🧪 执行基础测试...');

    // 检查测试文件是否存在
    const testFiles = [
      '__tests__/simple.test.ts',
      '__tests__/functionality.test.ts'
    ];

    for (const testFile of testFiles) {
      this.checkFileExists(testFile, `测试文件: ${testFile}`);
    }

    // 运行简单测试
    await this.runCommand('npm test -- __tests__/simple.test.ts', '简单功能测试');
  }

  /**
   * 验证构建过程
   */
  async validateBuild() {
    console.log('\n🏗️ 验证构建过程...');

    await this.runCommand('npm run build', '项目构建测试');
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    const endTime = Date.now();
    const duration = Math.round((endTime - this.startTime) / 1000);

    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const total = this.results.length;
    const successRate = Math.round((passed / total) * 100);

    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}秒`,
      summary: {
        total,
        passed,
        failed,
        successRate
      },
      results: this.results
    };

    return report;
  }

  /**
   * 保存报告
   */
  async saveReport(report) {
    const reportDir = path.join(__dirname, '../test-results');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportFile = path.join(reportDir, `quick-test-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    console.log(`\n📊 测试报告已保存: ${reportFile}`);
    return reportFile;
  }

  /**
   * 打印总结
   */
  printSummary(report) {
    console.log('\n' + '='.repeat(50));
    console.log('📋 快速测试总结');
    console.log('='.repeat(50));
    console.log(`⏱️  执行时间: ${report.duration}`);
    console.log(`📊 总测试数: ${report.summary.total}`);
    console.log(`✅ 通过测试: ${report.summary.passed}`);
    console.log(`❌ 失败测试: ${report.summary.failed}`);
    console.log(`📈 成功率: ${report.summary.successRate}%`);

    if (report.summary.failed > 0) {
      console.log('\n❌ 失败的测试:');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`   • ${result.test}: ${result.message}`);
      });
    }

    console.log('\n' + '='.repeat(50));
  }

  /**
   * 执行快速测试
   */
  async runQuickTest() {
    try {
      console.log('🚀 开始快速功能测试...');

      // 1. 验证项目结构
      await this.validateProjectStructure();

      // 2. 验证API路由
      await this.validateAPIRoutes();

      // 3. 验证核心组件
      await this.validateComponents();

      // 4. 执行代码质量检查
      await this.runQualityChecks();

      // 5. 执行基础测试
      await this.runBasicTests();

      // 6. 验证构建过程
      await this.validateBuild();

      // 7. 生成报告
      const report = this.generateReport();
      await this.saveReport(report);

      // 8. 打印总结
      this.printSummary(report);

      return report;

    } catch (error) {
      console.error('\n💥 快速测试执行失败:', error.message);
      throw error;
    }
  }
}

// 主执行函数
async function main() {
  const tester = new QuickTester();

  try {
    const report = await tester.runQuickTest();

    if (report.summary.failed > 0) {
      console.log('\n⚠️  部分测试失败，请检查相关问题');
      process.exit(1);
    } else {
      console.log('\n🎉 所有快速测试通过！核心功能正常');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n💥 快速测试执行过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = QuickTester;
