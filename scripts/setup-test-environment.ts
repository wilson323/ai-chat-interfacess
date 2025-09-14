#!/usr/bin/env tsx

/**
 * 测试环境设置脚本
 * 用于配置测试环境、运行测试、验证功能
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface TestEnvironmentOptions {
  setupDatabase?: boolean;
  runTests?: boolean;
  generateReport?: boolean;
  verbose?: boolean;
  coverage?: boolean;
}

interface TestResult {
  suite: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  message?: string;
}

class TestEnvironmentSetup {
  private options: TestEnvironmentOptions;
  private testResults: TestResult[] = [];

  constructor(options: TestEnvironmentOptions = {}) {
    this.options = {
      setupDatabase: true,
      runTests: true,
      generateReport: true,
      verbose: false,
      coverage: true,
      ...options,
    };
  }

  /**
   * 设置测试环境变量
   */
  setupTestEnvironment(): void {
    console.log('🔧 设置测试环境变量...');

    const testEnvVars = {
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      DB_NAME: 'ai_chat_test',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_USER: 'postgres',
      DB_PASSWORD: process.env.DB_PASSWORD || 'test_password',
      REDIS_URL: 'redis://localhost:6379/1',
      JWT_SECRET: 'test_jwt_secret',
      API_BASE_URL: 'http://localhost:3001',
      MAX_FILE_SIZE: '1048576', // 1MB for tests
      ENABLE_VOICE: 'false',
      ENABLE_FILE_UPLOAD: 'true',
      ENABLE_IMAGE_UPLOAD: 'true',
      ENABLE_STREAMING: 'false',
      ENABLE_MONITORING: 'false',
    };

    for (const [key, value] of Object.entries(testEnvVars)) {
      process.env[key] = value;
      if (this.options.verbose) {
        console.log(`  ✓ ${key}=${value}`);
      }
    }

    console.log('✅ 测试环境变量设置完成');
  }

  /**
   * 创建测试数据库
   */
  async setupTestDatabase(): Promise<void> {
    if (!this.options.setupDatabase) {
      console.log('⏭️ 跳过测试数据库设置');
      return;
    }

    console.log('🗄️ 设置测试数据库...');

    try {
      // 使用数据库设置脚本创建测试数据库
      const { DatabaseSetup } = await import('./setup-database');
      const dbSetup = new DatabaseSetup({
        force: true,
        validate: true,
        backup: false,
        verbose: this.options.verbose,
      });

      await dbSetup.setup();
      console.log('✅ 测试数据库设置完成');
    } catch (error) {
      console.error('❌ 测试数据库设置失败:', error);
      throw error;
    }
  }

  /**
   * 创建测试文件
   */
  createTestFiles(): void {
    console.log('📄 创建测试文件...');

    const testFiles = [
      {
        path: 'test-uploads/test-image.jpg',
        content: Buffer.from('fake image data'),
        description: '测试图像文件',
      },
      {
        path: 'test-uploads/test-document.pdf',
        content: Buffer.from('fake pdf data'),
        description: '测试PDF文件',
      },
      {
        path: 'test-uploads/test-cad.dxf',
        content: Buffer.from('fake dxf data'),
        description: '测试CAD文件',
      },
    ];

    for (const file of testFiles) {
      try {
        const dir = path.dirname(file.path);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(file.path, file.content);
        if (this.options.verbose) {
          console.log(`  ✓ 创建测试文件: ${file.path}`);
        }
      } catch (error) {
        console.error(`  ❌ 创建测试文件失败: ${file.path}`, error);
      }
    }

    console.log('✅ 测试文件创建完成');
  }

  /**
   * 运行单元测试
   */
  async runUnitTests(): Promise<TestResult[]> {
    console.log('🧪 运行单元测试...');

    try {
      const startTime = Date.now();
      const command = this.options.coverage
        ? 'npm run test:coverage'
        : 'npm run test:unit';

      const output = execSync(command, {
        encoding: 'utf8',
        stdio: this.options.verbose ? 'inherit' : 'pipe',
      });

      const duration = Date.now() - startTime;
      const result: TestResult = {
        suite: '单元测试',
        status: 'pass',
        duration,
      };

      this.testResults.push(result);
      console.log('✅ 单元测试通过');
      return [result];
    } catch (error) {
      const duration = Date.now() - Date.now();
      const result: TestResult = {
        suite: '单元测试',
        status: 'fail',
        duration,
        message: error instanceof Error ? error.message : String(error),
      };

      this.testResults.push(result);
      console.error('❌ 单元测试失败:', error);
      return [result];
    }
  }

  /**
   * 运行集成测试
   */
  async runIntegrationTests(): Promise<TestResult[]> {
    console.log('🔗 运行集成测试...');

    try {
      const startTime = Date.now();
      const command = 'npm run test:integration';

      const output = execSync(command, {
        encoding: 'utf8',
        stdio: this.options.verbose ? 'inherit' : 'pipe',
      });

      const duration = Date.now() - startTime;
      const result: TestResult = {
        suite: '集成测试',
        status: 'pass',
        duration,
      };

      this.testResults.push(result);
      console.log('✅ 集成测试通过');
      return [result];
    } catch (error) {
      const duration = Date.now() - Date.now();
      const result: TestResult = {
        suite: '集成测试',
        status: 'fail',
        duration,
        message: error instanceof Error ? error.message : String(error),
      };

      this.testResults.push(result);
      console.error('❌ 集成测试失败:', error);
      return [result];
    }
  }

  /**
   * 运行E2E测试
   */
  async runE2ETests(): Promise<TestResult[]> {
    console.log('🌐 运行E2E测试...');

    try {
      const startTime = Date.now();
      const command = 'npm run test:e2e';

      const output = execSync(command, {
        encoding: 'utf8',
        stdio: this.options.verbose ? 'inherit' : 'pipe',
      });

      const duration = Date.now() - startTime;
      const result: TestResult = {
        suite: 'E2E测试',
        status: 'pass',
        duration,
      };

      this.testResults.push(result);
      console.log('✅ E2E测试通过');
      return [result];
    } catch (error) {
      const duration = Date.now() - Date.now();
      const result: TestResult = {
        suite: 'E2E测试',
        status: 'fail',
        duration,
        message: error instanceof Error ? error.message : String(error),
      };

      this.testResults.push(result);
      console.error('❌ E2E测试失败:', error);
      return [result];
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests(): Promise<void> {
    if (!this.options.runTests) {
      console.log('⏭️ 跳过测试运行');
      return;
    }

    console.log('🚀 开始运行所有测试...\n');

    try {
      // 1. 运行单元测试
      await this.runUnitTests();

      // 2. 运行集成测试
      await this.runIntegrationTests();

      // 3. 运行E2E测试
      await this.runE2ETests();

      // 4. 生成测试报告
      if (this.options.generateReport) {
        this.generateTestReport();
      }

      // 5. 显示测试总结
      this.showTestSummary();
    } catch (error) {
      console.error('❌ 测试运行失败:', error);
      throw error;
    }
  }

  /**
   * 生成测试报告
   */
  generateTestReport(): void {
    console.log('📊 生成测试报告...');

    const report = [];
    report.push('# 测试环境设置报告\n');
    report.push(`生成时间: ${new Date().toISOString()}\n`);

    report.push('## 测试结果');
    for (const result of this.testResults) {
      const status =
        result.status === 'pass'
          ? '✅'
          : result.status === 'fail'
            ? '❌'
            : '⏭️';
      report.push(`- ${status} ${result.suite}`);
      report.push(`  - 状态: ${result.status}`);
      report.push(`  - 耗时: ${result.duration}ms`);
      if (result.message) {
        report.push(`  - 消息: ${result.message}`);
      }
      report.push('');
    }

    report.push('## 测试统计');
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(
      r => r.status === 'pass'
    ).length;
    const failedTests = this.testResults.filter(
      r => r.status === 'fail'
    ).length;
    const skippedTests = this.testResults.filter(
      r => r.status === 'skip'
    ).length;

    report.push(`- 总测试套件: ${totalTests}`);
    report.push(`- 通过: ${passedTests}`);
    report.push(`- 失败: ${failedTests}`);
    report.push(`- 跳过: ${skippedTests}`);
    report.push(
      `- 通过率: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0}%`
    );

    const reportPath = 'test-environment-report.md';
    fs.writeFileSync(reportPath, report.join('\n'));
    console.log(`📄 测试报告已保存到: ${reportPath}`);
  }

  /**
   * 显示测试总结
   */
  showTestSummary(): void {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(
      r => r.status === 'pass'
    ).length;
    const failedTests = this.testResults.filter(
      r => r.status === 'fail'
    ).length;

    console.log('\n📊 测试总结:');
    console.log(`- 总测试套件: ${totalTests}`);
    console.log(`- 通过: ${passedTests}`);
    console.log(`- 失败: ${failedTests}`);

    if (failedTests === 0) {
      console.log('\n🎉 所有测试都通过了！');
    } else {
      console.log(`\n❌ 有 ${failedTests} 个测试失败。`);
    }
  }

  /**
   * 清理测试环境
   */
  async cleanupTestEnvironment(): Promise<void> {
    console.log('🧹 清理测试环境...');

    try {
      // 清理测试文件
      const testDirs = ['test-uploads', 'test-temp'];
      for (const dir of testDirs) {
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
          console.log(`  ✓ 清理目录: ${dir}`);
        }
      }

      // 清理测试数据库（可选）
      if (this.options.setupDatabase) {
        console.log('  ℹ️ 测试数据库保留，可用于调试');
      }

      console.log('✅ 测试环境清理完成');
    } catch (error) {
      console.error('❌ 测试环境清理失败:', error);
    }
  }

  /**
   * 执行完整的测试环境设置
   */
  async setup(): Promise<void> {
    console.log('🚀 开始测试环境设置...\n');

    try {
      // 1. 设置测试环境变量
      this.setupTestEnvironment();

      // 2. 设置测试数据库
      await this.setupTestDatabase();

      // 3. 创建测试文件
      this.createTestFiles();

      // 4. 运行所有测试
      await this.runAllTests();

      console.log('\n🎉 测试环境设置完成!');
    } catch (error) {
      console.error('❌ 测试环境设置失败:', error);
      throw error;
    } finally {
      // 5. 清理测试环境（可选）
      if (process.argv.includes('--cleanup')) {
        await this.cleanupTestEnvironment();
      }
    }
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const options: TestEnvironmentOptions = {
    setupDatabase: !args.includes('--no-database'),
    runTests: !args.includes('--no-tests'),
    generateReport: !args.includes('--no-report'),
    verbose: args.includes('--verbose'),
    coverage: !args.includes('--no-coverage'),
  };

  try {
    const setup = new TestEnvironmentSetup(options);
    await setup.setup();
    process.exit(0);
  } catch (error) {
    console.error('设置失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { TestEnvironmentSetup };
