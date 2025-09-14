#!/usr/bin/env tsx

/**
 * 性能优化脚本
 * 分析和优化代码性能问题
 */

import fs from 'fs';
import path from 'path';

interface PerformanceIssue {
  file: string;
  line: number;
  type:
    | 'bundle-size'
    | 'runtime-performance'
    | 'memory-usage'
    | 'network-requests';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
}

class PerformanceOptimizer {
  private issues: PerformanceIssue[] = [];
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  /**
   * 运行所有性能优化检查
   */
  async runOptimization(): Promise<void> {
    console.log('⚡ 开始性能优化分析...');

    await this.checkBundleSize();
    await this.checkRuntimePerformance();
    await this.checkMemoryUsage();
    await this.checkNetworkOptimization();
    await this.checkImageOptimization();
    await this.checkDatabaseQueries();

    this.generateReport();
  }

  /**
   * 检查包大小问题
   */
  private async checkBundleSize(): Promise<void> {
    console.log('📦 检查包大小...');

    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // 检查大型依赖
      const largeDependencies = [
        'lodash',
        'moment',
        'jquery',
        'bootstrap',
        'antd',
        'material-ui',
      ];

      for (const dep of largeDependencies) {
        if (dependencies[dep]) {
          this.addIssue({
            file: 'package.json',
            line: 0,
            type: 'bundle-size',
            severity: 'medium',
            message: `大型依赖 ${dep} 可能影响包大小`,
            suggestion: `考虑使用更轻量的替代方案，如 lodash-es 替代 lodash`,
          });
        }
      }
    }

    // 检查重复导入
    await this.checkDuplicateImports();
  }

  /**
   * 检查重复导入
   */
  private async checkDuplicateImports(): Promise<void> {
    const tsFiles = this.getTypeScriptFiles();

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      const imports = new Map<string, number[]>();

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const importMatch = line.match(/import\s+.*?from\s+['"]([^'"]+)['"]/);

        if (importMatch) {
          const importPath = importMatch[1];
          if (!imports.has(importPath)) {
            imports.set(importPath, []);
          }
          imports.get(importPath)!.push(i + 1);
        }
      }

      for (const [importPath, lineNumbers] of imports) {
        if (lineNumbers.length > 1) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: lineNumbers[0],
            type: 'bundle-size',
            severity: 'low',
            message: `重复导入 ${importPath}`,
            suggestion: '合并重复的导入语句以减少包大小',
          });
        }
      }
    }
  }

  /**
   * 检查运行时性能
   */
  private async checkRuntimePerformance(): Promise<void> {
    console.log('🏃 检查运行时性能...');

    const tsFiles = this.getTypeScriptFiles();

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 检查循环中的DOM操作
        if (line.includes('for') && lines[i + 1]?.includes('document.')) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            type: 'runtime-performance',
            severity: 'high',
            message: '循环中的DOM操作可能导致性能问题',
            suggestion: '使用DocumentFragment或批量更新DOM',
          });
        }

        // 检查未优化的正则表达式
        if (line.includes('new RegExp') && line.includes('+')) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            type: 'runtime-performance',
            severity: 'medium',
            message: '动态构建的正则表达式可能影响性能',
            suggestion: '预编译正则表达式或使用字符串方法',
          });
        }

        // 检查深度嵌套的对象访问
        if (line.match(/\.\w+\.\w+\.\w+\.\w+/)) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            type: 'runtime-performance',
            severity: 'low',
            message: '深度嵌套的对象访问可能影响性能',
            suggestion: '使用可选链操作符或解构赋值',
          });
        }
      }
    }
  }

  /**
   * 检查内存使用
   */
  private async checkMemoryUsage(): Promise<void> {
    console.log('💾 检查内存使用...');

    const tsFiles = this.getTypeScriptFiles();

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 检查可能的内存泄漏
        if (
          line.includes('addEventListener') &&
          !line.includes('removeEventListener')
        ) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            type: 'memory-usage',
            severity: 'medium',
            message: '添加事件监听器但未移除可能导致内存泄漏',
            suggestion: '在组件卸载时移除事件监听器',
          });
        }

        // 检查大数组操作
        if (
          line.includes('map') &&
          line.includes('filter') &&
          line.includes('reduce')
        ) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            type: 'memory-usage',
            severity: 'low',
            message: '链式数组操作可能创建多个中间数组',
            suggestion: '考虑使用单一循环或流式处理',
          });
        }

        // 检查全局变量
        if (line.includes('window.') && !line.includes('declare')) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            type: 'memory-usage',
            severity: 'low',
            message: '全局变量可能导致内存泄漏',
            suggestion: '使用模块作用域或清理全局变量',
          });
        }
      }
    }
  }

  /**
   * 检查网络优化
   */
  private async checkNetworkOptimization(): Promise<void> {
    console.log('🌐 检查网络优化...');

    const tsFiles = this.getTypeScriptFiles();

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 检查未优化的API调用
        if (line.includes('fetch') && !line.includes('cache')) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            type: 'network-requests',
            severity: 'medium',
            message: 'API调用未使用缓存策略',
            suggestion: '添加适当的缓存头或使用缓存库',
          });
        }

        // 检查串行API调用
        if (line.includes('await') && lines[i + 1]?.includes('await')) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            type: 'network-requests',
            severity: 'high',
            message: '串行API调用可能影响性能',
            suggestion: '使用Promise.all并行执行API调用',
          });
        }

        // 检查大文件上传
        if (line.includes('FormData') && line.includes('append')) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            type: 'network-requests',
            severity: 'medium',
            message: '文件上传未进行分片处理',
            suggestion: '对大文件使用分片上传或压缩',
          });
        }
      }
    }
  }

  /**
   * 检查图像优化
   */
  private async checkImageOptimization(): Promise<void> {
    console.log('🖼️ 检查图像优化...');

    const tsFiles = this.getTypeScriptFiles();

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 检查图像懒加载
        if (line.includes('<img') && !line.includes('loading=')) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            type: 'network-requests',
            severity: 'medium',
            message: '图像未使用懒加载',
            suggestion: '添加loading="lazy"属性或使用懒加载库',
          });
        }

        // 检查图像格式
        if (line.includes('.jpg') || line.includes('.png')) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            type: 'network-requests',
            severity: 'low',
            message: '使用传统图像格式',
            suggestion: '考虑使用WebP或AVIF格式以获得更好的压缩',
          });
        }
      }
    }
  }

  /**
   * 检查数据库查询
   */
  private async checkDatabaseQueries(): Promise<void> {
    console.log('🗄️ 检查数据库查询...');

    const tsFiles = this.getTypeScriptFiles();

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 检查N+1查询问题
        if (line.includes('findAll') && lines[i + 1]?.includes('findByPk')) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            type: 'runtime-performance',
            severity: 'high',
            message: '可能存在N+1查询问题',
            suggestion: '使用include或join优化查询',
          });
        }

        // 检查未优化的查询
        if (line.includes('SELECT *')) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            type: 'runtime-performance',
            severity: 'medium',
            message: '使用SELECT *可能影响性能',
            suggestion: '只选择需要的字段',
          });
        }

        // 检查缺少索引的查询
        if (
          line.includes('WHERE') &&
          line.includes('LIKE') &&
          line.includes('%')
        ) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            type: 'runtime-performance',
            severity: 'medium',
            message: 'LIKE查询可能影响性能',
            suggestion: '考虑添加索引或使用全文搜索',
          });
        }
      }
    }
  }

  /**
   * 获取TypeScript文件列表
   */
  private getTypeScriptFiles(): string[] {
    const files: string[] = [];

    const scanDir = (dir: string) => {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (
          stat.isDirectory() &&
          !item.startsWith('.') &&
          item !== 'node_modules'
        ) {
          scanDir(fullPath);
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    };

    scanDir(this.projectRoot);
    return files;
  }

  /**
   * 添加性能问题
   */
  private addIssue(issue: PerformanceIssue): void {
    this.issues.push(issue);
  }

  /**
   * 生成报告
   */
  private generateReport(): void {
    const reportPath = path.join(this.projectRoot, 'performance-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      totalIssues: this.issues.length,
      issues: this.issues,
      summary: {
        bundleSize: this.issues.filter(i => i.type === 'bundle-size').length,
        runtimePerformance: this.issues.filter(
          i => i.type === 'runtime-performance'
        ).length,
        memoryUsage: this.issues.filter(i => i.type === 'memory-usage').length,
        networkRequests: this.issues.filter(i => i.type === 'network-requests')
          .length,
      },
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📊 性能优化分析完成!');
    console.log(`总问题数: ${this.issues.length}`);
    console.log(`包大小问题: ${report.summary.bundleSize}`);
    console.log(`运行时性能问题: ${report.summary.runtimePerformance}`);
    console.log(`内存使用问题: ${report.summary.memoryUsage}`);
    console.log(`网络请求问题: ${report.summary.networkRequests}`);
    console.log(`报告已保存到: ${reportPath}`);

    if (this.issues.length > 0) {
      console.log('\n🔧 建议优化的问题:');
      this.issues.forEach((issue, index) => {
        console.log(
          `${index + 1}. [${issue.severity.toUpperCase()}] ${issue.file}:${issue.line}`
        );
        console.log(`   ${issue.message}`);
        console.log(`   建议: ${issue.suggestion}`);
        console.log('');
      });
    }
  }
}

// 运行优化
if (require.main === module) {
  const optimizer = new PerformanceOptimizer();
  optimizer.runOptimization().catch(console.error);
}

export { PerformanceOptimizer };
