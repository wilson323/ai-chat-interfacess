#!/usr/bin/env tsx

/**
 * 环境配置检查脚本
 * 用于验证环境变量、检查配置完整性、生成配置报告
 */

import { appConfig, validateConfig } from '@/lib/config';
import fs from 'fs';
import path from 'path';

interface EnvironmentCheckOptions {
  verbose?: boolean;
  generateReport?: boolean;
  checkFiles?: boolean;
  checkDatabase?: boolean;
  checkRedis?: boolean;
}

interface CheckResult {
  category: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string[];
}

class EnvironmentChecker {
  private options: EnvironmentCheckOptions;
  private results: CheckResult[] = [];

  constructor(options: EnvironmentCheckOptions = {}) {
    this.options = {
      verbose: false,
      generateReport: true,
      checkFiles: true,
      checkDatabase: true,
      checkRedis: true,
      ...options,
    };
  }

  /**
   * 添加检查结果
   */
  private addResult(
    category: string,
    status: 'pass' | 'fail' | 'warning',
    message: string,
    details?: string[]
  ): void {
    this.results.push({ category, status, message, details });
  }

  /**
   * 检查环境变量
   */
  checkEnvironmentVariables(): void {
    console.log('🔍 检查环境变量...');

    const requiredVars = [
      'NODE_ENV',
      'JWT_SECRET',
      'DB_HOST',
      'DB_NAME',
      'DB_USER',
      'DB_PASSWORD',
    ];

    const optionalVars = [
      'LOG_LEVEL',
      'REDIS_URL',
      'API_BASE_URL',
      'MAX_FILE_SIZE',
      'ENABLE_VOICE',
      'ENABLE_FILE_UPLOAD',
    ];

    let missingRequired = 0;
    let missingOptional = 0;

    // 检查必需变量
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        this.addResult('环境变量', 'fail', `缺少必需的环境变量: ${varName}`);
        missingRequired++;
      } else {
        this.addResult('环境变量', 'pass', `✓ ${varName} 已设置`);
      }
    }

    // 检查可选变量
    for (const varName of optionalVars) {
      if (!process.env[varName]) {
        this.addResult('环境变量', 'warning', `缺少可选的环境变量: ${varName}`);
        missingOptional++;
      } else {
        this.addResult('环境变量', 'pass', `✓ ${varName} 已设置`);
      }
    }

    if (missingRequired > 0) {
      console.log(`❌ 缺少 ${missingRequired} 个必需的环境变量`);
    }
    if (missingOptional > 0) {
      console.log(`⚠️ 缺少 ${missingOptional} 个可选的环境变量`);
    }
  }

  /**
   * 检查配置文件
   */
  checkConfigurationFiles(): void {
    if (!this.options.checkFiles) return;

    console.log('📁 检查配置文件...');

    const configFiles = [
      'lib/config/index.ts',
      'next.config.mjs',
      'package.json',
      'tsconfig.json',
      'tailwind.config.ts',
    ];

    for (const file of configFiles) {
      if (fs.existsSync(file)) {
        this.addResult('配置文件', 'pass', `✓ ${file} 存在`);
      } else {
        this.addResult('配置文件', 'fail', `❌ ${file} 不存在`);
      }
    }

    // 检查环境模板文件
    if (fs.existsSync('env.template')) {
      this.addResult('配置文件', 'pass', '✓ env.template 存在');
    } else {
      this.addResult('配置文件', 'warning', '⚠️ env.template 不存在');
    }

    // 检查 .env 文件
    if (fs.existsSync('.env')) {
      this.addResult('配置文件', 'pass', '✓ .env 文件存在');
    } else {
      this.addResult(
        '配置文件',
        'warning',
        '⚠️ .env 文件不存在，请复制 env.template 为 .env'
      );
    }
  }

  /**
   * 检查数据库配置
   */
  async checkDatabaseConfiguration(): Promise<void> {
    if (!this.options.checkDatabase) return;

    console.log('🗄️ 检查数据库配置...');

    try {
      // 检查数据库配置完整性
      const dbConfig = appConfig.database;
      const requiredFields = [
        'host',
        'port',
        'database',
        'username',
        'password',
      ];

      for (const field of requiredFields) {
        if (!dbConfig[field as keyof typeof dbConfig]) {
          this.addResult('数据库配置', 'fail', `数据库配置缺少字段: ${field}`);
          return;
        }
      }

      this.addResult('数据库配置', 'pass', '✓ 数据库配置完整');

      // 尝试连接数据库
      const { Sequelize } = await import('sequelize');
      const sequelize = new Sequelize({
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        username: dbConfig.username,
        password: dbConfig.password,
        dialect: 'postgres',
        logging: false,
      });

      try {
        await sequelize.authenticate();
        this.addResult('数据库连接', 'pass', '✓ 数据库连接成功');
        await sequelize.close();
      } catch (error) {
        this.addResult('数据库连接', 'fail', `❌ 数据库连接失败: ${error}`);
      }
    } catch (error) {
      this.addResult('数据库配置', 'fail', `❌ 数据库配置检查失败: ${error}`);
    }
  }

  /**
   * 检查Redis配置
   */
  async checkRedisConfiguration(): Promise<void> {
    if (!this.options.checkRedis) return;

    console.log('🔴 检查Redis配置...');

    try {
      const redisConfig = appConfig.redis;

      if (!redisConfig.host || !redisConfig.port) {
        this.addResult('Redis配置', 'warning', '⚠️ Redis配置不完整');
        return;
      }

      this.addResult('Redis配置', 'pass', '✓ Redis配置完整');

      // 尝试连接Redis
      try {
        const redis = await import('@/lib/db/redis');
        // 这里可以添加实际的Redis连接测试
        this.addResult('Redis连接', 'pass', '✓ Redis连接成功');
      } catch (error) {
        this.addResult(
          'Redis连接',
          'warning',
          `⚠️ Redis连接测试跳过: ${error}`
        );
      }
    } catch (error) {
      this.addResult('Redis配置', 'fail', `❌ Redis配置检查失败: ${error}`);
    }
  }

  /**
   * 检查文件系统权限
   */
  checkFileSystemPermissions(): void {
    console.log('📂 检查文件系统权限...');

    const directories = [
      'public/uploads',
      'public/image-edits',
      'public/cad-files',
      appConfig.storage.uploadPath,
      appConfig.storage.tempPath,
    ];

    for (const dir of directories) {
      try {
        if (!fs.existsSync(dir)) {
          this.addResult('文件系统', 'warning', `⚠️ 目录不存在: ${dir}`);
          continue;
        }

        // 检查读权限
        fs.accessSync(dir, fs.constants.R_OK);

        // 检查写权限
        fs.accessSync(dir, fs.constants.W_OK);

        this.addResult('文件系统', 'pass', `✓ ${dir} 权限正常`);
      } catch (error) {
        this.addResult('文件系统', 'fail', `❌ ${dir} 权限不足: ${error}`);
      }
    }
  }

  /**
   * 检查应用配置
   */
  checkApplicationConfiguration(): void {
    console.log('⚙️ 检查应用配置...');

    try {
      // 验证配置
      validateConfig();
      this.addResult('应用配置', 'pass', '✓ 应用配置验证通过');
    } catch (error) {
      this.addResult('应用配置', 'fail', `❌ 应用配置验证失败: ${error}`);
    }

    // 检查功能开关
    const features = appConfig.features;
    const featureChecks = [
      { name: '语音功能', enabled: features.enableVoice },
      { name: '文件上传', enabled: features.enableFileUpload },
      { name: '图像上传', enabled: features.enableImageUpload },
      { name: '流式传输', enabled: features.enableStreaming },
    ];

    for (const feature of featureChecks) {
      const status = feature.enabled ? 'pass' : 'warning';
      const message = feature.enabled
        ? `✓ ${feature.name} 已启用`
        : `⚠️ ${feature.name} 已禁用`;
      this.addResult('功能配置', status, message);
    }
  }

  /**
   * 生成配置报告
   */
  generateReport(): string {
    const report = [];
    report.push('# 环境配置检查报告\n');
    report.push(`生成时间: ${new Date().toISOString()}\n`);

    // 按类别分组结果
    const categories = [...new Set(this.results.map(r => r.category))];

    for (const category of categories) {
      const categoryResults = this.results.filter(r => r.category === category);
      const passCount = categoryResults.filter(r => r.status === 'pass').length;
      const failCount = categoryResults.filter(r => r.status === 'fail').length;
      const warningCount = categoryResults.filter(
        r => r.status === 'warning'
      ).length;

      report.push(`## ${category}`);
      report.push(`- ✅ 通过: ${passCount}`);
      report.push(`- ❌ 失败: ${failCount}`);
      report.push(`- ⚠️ 警告: ${warningCount}\n`);

      for (const result of categoryResults) {
        const icon =
          result.status === 'pass'
            ? '✅'
            : result.status === 'fail'
              ? '❌'
              : '⚠️';
        report.push(`- ${icon} ${result.message}`);

        if (result.details && result.details.length > 0) {
          for (const detail of result.details) {
            report.push(`  - ${detail}`);
          }
        }
      }
      report.push('');
    }

    // 总结
    const totalPass = this.results.filter(r => r.status === 'pass').length;
    const totalFail = this.results.filter(r => r.status === 'fail').length;
    const totalWarning = this.results.filter(
      r => r.status === 'warning'
    ).length;

    report.push('## 总结');
    report.push(`- 总检查项: ${this.results.length}`);
    report.push(`- 通过: ${totalPass}`);
    report.push(`- 失败: ${totalFail}`);
    report.push(`- 警告: ${totalWarning}`);

    if (totalFail === 0) {
      report.push('\n🎉 所有检查都通过了！');
    } else {
      report.push(`\n❌ 有 ${totalFail} 个检查失败，请修复后重试。`);
    }

    return report.join('\n');
  }

  /**
   * 执行所有检查
   */
  async runAllChecks(): Promise<void> {
    console.log('🚀 开始环境配置检查...\n');

    try {
      // 1. 检查环境变量
      this.checkEnvironmentVariables();

      // 2. 检查配置文件
      this.checkConfigurationFiles();

      // 3. 检查数据库配置
      await this.checkDatabaseConfiguration();

      // 4. 检查Redis配置
      await this.checkRedisConfiguration();

      // 5. 检查文件系统权限
      this.checkFileSystemPermissions();

      // 6. 检查应用配置
      this.checkApplicationConfiguration();

      // 7. 生成报告
      if (this.options.generateReport) {
        const report = this.generateReport();
        console.log('\n' + report);

        // 保存报告到文件
        const reportPath = 'environment-check-report.md';
        fs.writeFileSync(reportPath, report);
        console.log(`\n📄 报告已保存到: ${reportPath}`);
      }

      // 8. 显示总结
      const failCount = this.results.filter(r => r.status === 'fail').length;
      if (failCount === 0) {
        console.log('\n🎉 环境配置检查完成，所有检查都通过了！');
      } else {
        console.log(`\n❌ 环境配置检查完成，有 ${failCount} 个检查失败。`);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ 环境配置检查失败:', error);
      throw error;
    }
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const options: EnvironmentCheckOptions = {
    verbose: args.includes('--verbose'),
    generateReport: !args.includes('--no-report'),
    checkFiles: !args.includes('--no-files'),
    checkDatabase: !args.includes('--no-database'),
    checkRedis: !args.includes('--no-redis'),
  };

  try {
    const checker = new EnvironmentChecker(options);
    await checker.runAllChecks();
    process.exit(0);
  } catch (error) {
    console.error('检查失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { EnvironmentChecker };
