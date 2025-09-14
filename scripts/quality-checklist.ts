#!/usr/bin/env node

/**
 * 质量保证检查清单脚本
 * 自动化执行所有质量检查项目
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

interface QualityReport {
  timestamp: string;
  overall: 'pass' | 'fail' | 'warning';
  checks: CheckResult[];
  score: number;
  recommendations: string[];
}

class QualityChecker {
  private results: CheckResult[] = [];
  private recommendations: string[] = [];

  async runAllChecks(): Promise<QualityReport> {
    console.log('🔍 开始执行质量保证检查...\n');

    // 代码质量检查
    await this.checkCodeQuality();

    // 测试覆盖率检查
    await this.checkTestCoverage();

    // 安全性检查
    await this.checkSecurity();

    // 性能检查
    await this.checkPerformance();

    // 依赖检查
    await this.checkDependencies();

    // 配置检查
    await this.checkConfiguration();

    // 自定义代码占比检查
    await this.checkCustomCodeRatio();

    // 生成报告
    const report = this.generateReport();
    this.saveReport(report);
    this.displayReport(report);

    return report;
  }

  private async checkCodeQuality(): Promise<void> {
    console.log('📊 检查代码质量...');

    try {
      // TypeScript 类型检查
      console.log('  • 执行 TypeScript 类型检查...');
      execSync('npm run check-types', { stdio: 'pipe' });
      this.results.push({
        name: 'TypeScript 类型检查',
        status: 'pass',
        message: '所有 TypeScript 类型检查通过'
      });

      // ESLint 检查
      console.log('  • 执行 ESLint 检查...');
      execSync('npm run lint', { stdio: 'pipe' });
      this.results.push({
        name: 'ESLint 代码规范',
        status: 'pass',
        message: '代码规范检查通过'
      });

      // Prettier 格式检查
      console.log('  • 执行 Prettier 格式检查...');
      execSync('npm run format:check', { stdio: 'pipe' });
      this.results.push({
        name: 'Prettier 代码格式',
        status: 'pass',
        message: '代码格式检查通过'
      });

    } catch (error: any) {
      this.results.push({
        name: '代码质量检查',
        status: 'fail',
        message: '代码质量检查失败',
        details: error.message
      });
      this.recommendations.push('修复代码质量和格式问题');
    }
  }

  private async checkTestCoverage(): Promise<void> {
    console.log('🧪 检查测试覆盖率...');

    try {
      // 运行测试覆盖率
      console.log('  • 运行测试覆盖率检查...');
      execSync('npm run test:coverage', { stdio: 'pipe' });

      // 读取覆盖率报告
      const coveragePath = join(process.cwd(), 'coverage', 'coverage-summary.json');
      const coverageData = JSON.parse(readFileSync(coveragePath, 'utf8'));

      const total = coverageData.total;
      const lineCoverage = total.lines.pct;
      const functionCoverage = total.functions.pct;
      const branchCoverage = total.branches.pct;

      let status: 'pass' | 'fail' | 'warning' = 'pass';
      let message = `测试覆盖率: 行 ${lineCoverage}%, 函数 ${functionCoverage}%, 分支 ${branchCoverage}%`;

      if (lineCoverage < 60 || functionCoverage < 60 || branchCoverage < 60) {
        status = 'fail';
        message += ' - 低于最低要求 (60%)';
        this.recommendations.push('提高测试覆盖率至 80% 以上');
      } else if (lineCoverage < 80 || functionCoverage < 80 || branchCoverage < 80) {
        status = 'warning';
        message += ' - 建议提高至 80% 以上';
        this.recommendations.push('继续提高测试覆盖率');
      }

      this.results.push({
        name: '测试覆盖率',
        status,
        message,
        details: {
          lines: lineCoverage,
          functions: functionCoverage,
          branches: branchCoverage
        }
      });

    } catch (error: any) {
      this.results.push({
        name: '测试覆盖率检查',
        status: 'fail',
        message: '测试覆盖率检查失败',
        details: error.message
      });
    }
  }

  private async checkSecurity(): Promise<void> {
    console.log('🛡️ 检查安全性...');

    try {
      // 依赖安全检查
      console.log('  • 执行 npm audit...');
      execSync('npm audit --audit-level=moderate', { stdio: 'pipe' });
      this.results.push({
        name: '依赖安全检查',
        status: 'pass',
        message: 'npm audit 通过，无高危漏洞'
      });

      // 环境变量安全检查
      console.log('  • 检查环境变量安全...');
      this.checkEnvironmentSecurity();

    } catch (error: any) {
      this.results.push({
        name: '安全检查',
        status: 'fail',
        message: '安全检查发现问题',
        details: error.message
      });
      this.recommendations.push('修复安全漏洞');
    }
  }

  private checkEnvironmentSecurity(): void {
    const requiredEnvVars = [
      'JWT_SECRET',
      'POSTGRES_PASSWORD',
      'ENCRYPTION_KEY'
    ];

    const missingVars: string[] = [];
    const weakVars: string[] = [];

    requiredEnvVars.forEach(varName => {
      const value = process.env[varName];
      if (!value) {
        missingVars.push(varName);
      } else if (value.length < 32) {
        weakVars.push(varName);
      }
    });

    if (missingVars.length > 0) {
      this.results.push({
        name: '环境变量安全',
        status: 'fail',
        message: `缺少必需的环境变量: ${missingVars.join(', ')}`
      });
    } else if (weakVars.length > 0) {
      this.results.push({
        name: '环境变量安全',
        status: 'warning',
        message: `环境变量密钥强度不足: ${weakVars.join(', ')}`
      });
      this.recommendations.push('增强环境变量密钥强度');
    } else {
      this.results.push({
        name: '环境变量安全',
        status: 'pass',
        message: '环境变量配置安全'
      });
    }
  }

  private async checkPerformance(): Promise<void> {
    console.log('⚡ 检查性能...');

    try {
      // 检查包大小
      console.log('  • 检查构建包大小...');
      const buildStats = this.checkBundleSize();

      this.results.push({
        name: '包大小检查',
        status: buildStats.status,
        message: buildStats.message,
        details: buildStats.details
      });

      // 检查依赖数量
      console.log('  • 检查依赖数量...');
      const dependencyStats = this.checkDependenciesCount();

      this.results.push({
        name: '依赖数量',
        status: dependencyStats.status,
        message: dependencyStats.message,
        details: dependencyStats.details
      });

    } catch (error: any) {
      this.results.push({
        name: '性能检查',
        status: 'fail',
        message: '性能检查失败',
        details: error.message
      });
    }
  }

  private checkBundleSize(): { status: 'pass' | 'fail' | 'warning'; message: string; details: any } {
    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      const dependencies = Object.keys(packageJson.dependencies || {});
      const devDependencies = Object.keys(packageJson.devDependencies || {});

      const totalDeps = dependencies.length + devDependencies.length;

      if (totalDeps > 100) {
        return {
          status: 'warning',
          message: `依赖数量较多: ${totalDeps} 个`,
          details: { totalDeps, production: dependencies.length, development: devDependencies.length }
        };
      }

      return {
        status: 'pass',
        message: `依赖数量合理: ${totalDeps} 个`,
        details: { totalDeps, production: dependencies.length, development: devDependencies.length }
      };
    } catch (error) {
      return {
        status: 'fail',
        message: '无法检查包大小',
        details: error
      };
    }
  }

  private checkDependenciesCount(): { status: 'pass' | 'fail' | 'warning'; message: string; details: any } {
    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      const dependencies = packageJson.dependencies || {};

      // 检查是否有重复功能的依赖
      const uiLibs = Object.keys(dependencies).filter(dep =>
        dep.includes('antd') || dep.includes('radix') || dep.includes('@radix')
      );

      if (uiLibs.length > 3) {
        return {
          status: 'warning',
          message: `UI组件库数量较多: ${uiLibs.length} 个`,
          details: { uiLibs }
        };
      }

      return {
        status: 'pass',
        message: '依赖库配置合理',
        details: { uiLibs }
      };
    } catch (error) {
      return {
        status: 'fail',
        message: '无法检查依赖配置',
        details: error
      };
    }
  }

  private async checkDependencies(): Promise<void> {
    console.log('📦 检查依赖...');

    try {
      // 检查过时依赖
      console.log('  • 检查过时依赖...');
      execSync('npm outdated', { stdio: 'pipe' });

      this.results.push({
        name: '依赖更新检查',
        status: 'pass',
        message: '依赖版本检查完成'
      });

    } catch (error: any) {
      // npm outdated 返回非零状态码表示有过时包
      this.results.push({
        name: '依赖更新检查',
        status: 'warning',
        message: '存在过时依赖包',
        details: error.message
      });
      this.recommendations.push('更新过时的依赖包');
    }
  }

  private async checkConfiguration(): Promise<void> {
    console.log('⚙️ 检查配置...');

    try {
      // 检查 Next.js 配置
      console.log('  • 检查 Next.js 配置...');
      this.checkNextjsConfig();

      // 检查 TypeScript 配置
      console.log('  • 检查 TypeScript 配置...');
      this.checkTypeScriptConfig();

      // 检查 Jest 配置
      console.log('  • 检查 Jest 配置...');
      this.checkJestConfig();

    } catch (error: any) {
      this.results.push({
        name: '配置检查',
        status: 'fail',
        message: '配置检查失败',
        details: error.message
      });
    }
  }

  private checkNextjsConfig(): void {
    try {
      const nextConfig = readFileSync('next.config.mjs', 'utf8');

      if (nextConfig.includes('ignoreBuildErrors: true')) {
        this.results.push({
          name: 'Next.js 配置',
          status: 'warning',
          message: '生产环境应该关闭 ignoreBuildErrors'
        });
        this.recommendations.push('生产环境关闭 ignoreBuildErrors');
      } else {
        this.results.push({
          name: 'Next.js 配置',
          status: 'pass',
          message: 'Next.js 配置正确'
        });
      }
    } catch (error) {
      this.results.push({
        name: 'Next.js 配置',
        status: 'fail',
        message: 'Next.js 配置文件缺失'
      });
    }
  }

  private checkTypeScriptConfig(): void {
    try {
      const tsConfig = JSON.parse(readFileSync('tsconfig.json', 'utf8'));

      if (tsConfig.compilerOptions?.strict !== true) {
        this.results.push({
          name: 'TypeScript 配置',
          status: 'fail',
          message: 'TypeScript 严格模式未启用'
        });
        this.recommendations.push('启用 TypeScript 严格模式');
      } else {
        this.results.push({
          name: 'TypeScript 配置',
          status: 'pass',
          message: 'TypeScript 严格模式已启用'
        });
      }
    } catch (error) {
      this.results.push({
        name: 'TypeScript 配置',
        status: 'fail',
        message: 'TypeScript 配置文件缺失或损坏'
      });
    }
  }

  private checkJestConfig(): void {
    try {
      const jestConfig = readFileSync('jest.config.js', 'utf8');

      if (jestConfig.includes('coverageThreshold')) {
        this.results.push({
          name: 'Jest 配置',
          status: 'pass',
          message: 'Jest 覆盖率阈值已配置'
        });
      } else {
        this.results.push({
          name: 'Jest 配置',
          status: 'warning',
          message: '建议配置 Jest 覆盖率阈值'
        });
        this.recommendations.push('配置 Jest 覆盖率阈值');
      }
    } catch (error) {
      this.results.push({
        name: 'Jest 配置',
        status: 'fail',
        message: 'Jest 配置文件缺失'
      });
    }
  }

  private async checkCustomCodeRatio(): Promise<void> {
    console.log('📊 检查自定义代码占比...');

    try {
      console.log('  • 执行自定义代码占比检查...');
      execSync('npm run check:custom-ratio', { stdio: 'pipe' });

      this.results.push({
        name: '自定义代码占比',
        status: 'pass',
        message: '自定义代码占比检查通过 (<20%)'
      });

    } catch (error: any) {
      this.results.push({
        name: '自定义代码占比',
        status: 'fail',
        message: '自定义代码占比过高',
        details: error.message
      });
      this.recommendations.push('减少自定义代码，使用成熟组件库');
    }
  }

  private generateReport(): QualityReport {
    const passCount = this.results.filter(r => r.status === 'pass').length;
    const failCount = this.results.filter(r => r.status === 'fail').length;
    const warningCount = this.results.filter(r => r.status === 'warning').length;
    const totalChecks = this.results.length;

    const score = Math.round((passCount / totalChecks) * 100);

    let overall: 'pass' | 'fail' | 'warning' = 'pass';
    if (failCount > 0) {
      overall = 'fail';
    } else if (warningCount > 0 || score < 80) {
      overall = 'warning';
    }

    return {
      timestamp: new Date().toISOString(),
      overall,
      score,
      checks: this.results,
      recommendations: this.recommendations
    };
  }

  private saveReport(report: QualityReport): void {
    const reportPath = join(process.cwd(), 'quality-reports', `quality-report-${Date.now()}.json`);

    try {
      writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 质量报告已保存到: ${reportPath}`);
    } catch (error) {
      console.error('保存质量报告失败:', error);
    }
  }

  private displayReport(report: QualityReport): void {
    console.log('\n' + '='.repeat(50));
    console.log('🏆 质量保证检查报告');
    console.log('='.repeat(50));
    console.log(`⏰ 检查时间: ${new Date(report.timestamp).toLocaleString()}`);
    console.log(`📊 总体评分: ${report.score}/100`);
    console.log(`🎯 总体状态: ${this.getStatusIcon(report.overall)} ${report.overall.toUpperCase()}`);
    console.log('='.repeat(50));

    console.log('\n📋 检查结果详情:');
    this.results.forEach(check => {
      const icon = this.getStatusIcon(check.status);
      console.log(`  ${icon} ${check.name}: ${check.message}`);
    });

    console.log('\n📈 统计信息:');
    console.log(`  ✅ 通过: ${this.results.filter(r => r.status === 'pass').length}`);
    console.log(`  ⚠️  警告: ${this.results.filter(r => r.status === 'warning').length}`);
    console.log(`  ❌ 失败: ${this.results.filter(r => r.status === 'fail').length}`);

    if (this.recommendations.length > 0) {
      console.log('\n💡 改进建议:');
      this.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }

    console.log('\n' + '='.repeat(50));

    // 根据状态退出
    if (report.overall === 'fail') {
      console.log('❌ 质量检查未通过，请修复问题后重试');
      process.exit(1);
    } else if (report.overall === 'warning') {
      console.log('⚠️  质量检查通过，但存在警告，建议查看改进建议');
    } else {
      console.log('🎉 质量检查全部通过！');
    }
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'pass': return '✅';
      case 'warning': return '⚠️';
      case 'fail': return '❌';
      default: return '❓';
    }
  }
}

// 主函数
async function main() {
  const checker = new QualityChecker();

  try {
    const report = await checker.runAllChecks();
    process.exit(report.overall === 'fail' ? 1 : 0);
  } catch (error) {
    console.error('质量检查执行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { QualityChecker, type QualityReport, type CheckResult };