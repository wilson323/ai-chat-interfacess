#!/usr/bin/env tsx

/**
 * 代码质量检查脚本
 * 检查代码规范、类型安全、性能问题等
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface QualityReport {
  timestamp: string;
  totalFiles: number;
  issues: QualityIssue[];
  summary: {
    errors: number;
    warnings: number;
    suggestions: number;
  };
  categories: {
    [key: string]: number;
  };
}

interface QualityIssue {
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'suggestion';
  category: string;
  message: string;
  rule?: string;
}

class CodeQualityChecker {
  private report: QualityReport;
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.report = {
      timestamp: new Date().toISOString(),
      totalFiles: 0,
      issues: [],
      summary: {
        errors: 0,
        warnings: 0,
        suggestions: 0,
      },
      categories: {},
    };
  }

  /**
   * 运行所有质量检查
   */
  async runAllChecks(): Promise<QualityReport> {
    console.log('🔍 开始代码质量检查...');

    await this.checkTypeScriptErrors();
    await this.checkESLintIssues();
    await this.checkUnusedImports();
    await this.checkConsoleStatements();
    await this.checkErrorHandling();
    await this.checkPerformanceIssues();
    await this.checkSecurityIssues();
    await this.checkDocumentation();

    this.generateSummary();
    this.generateReport();

    return this.report;
  }

  /**
   * 检查TypeScript错误
   */
  private async checkTypeScriptErrors(): Promise<void> {
    console.log('📝 检查TypeScript错误...');

    try {
      const result = execSync('npx tsc --noEmit --pretty false', {
        encoding: 'utf8',
        cwd: this.projectRoot,
      });
    } catch (error: any) {
      const output = error.stdout || error.stderr || '';
      this.parseTypeScriptErrors(output);
    }
  }

  /**
   * 解析TypeScript错误输出
   */
  private parseTypeScriptErrors(output: string): void {
    const lines = output.split('\n');

    for (const line of lines) {
      const match = line.match(/^(.+?)\((\d+),(\d+)\): error TS(\d+): (.+)$/);
      if (match) {
        const [, file, lineNum, column, code, message] = match;
        this.addIssue({
          file: path.relative(this.projectRoot, file),
          line: parseInt(lineNum),
          column: parseInt(column),
          severity: 'error',
          category: 'TypeScript',
          message: `TS${code}: ${message}`,
          rule: `TS${code}`,
        });
      }
    }
  }

  /**
   * 检查ESLint问题
   */
  private async checkESLintIssues(): Promise<void> {
    console.log('🔧 检查ESLint问题...');

    try {
      const result = execSync('npx eslint . --format json', {
        encoding: 'utf8',
        cwd: this.projectRoot,
      });
    } catch (error: any) {
      const output = error.stdout || error.stderr || '';
      this.parseESLintOutput(output);
    }
  }

  /**
   * 解析ESLint输出
   */
  private parseESLintOutput(output: string): void {
    try {
      const results = JSON.parse(output);

      for (const file of results) {
        for (const message of file.messages) {
          this.addIssue({
            file: path.relative(this.projectRoot, file.filePath),
            line: message.line,
            column: message.column,
            severity: message.severity === 2 ? 'error' : 'warning',
            category: 'ESLint',
            message: message.message,
            rule: message.ruleId,
          });
        }
      }
    } catch (error) {
      console.warn('无法解析ESLint输出:', error);
    }
  }

  /**
   * 检查未使用的导入
   */
  private async checkUnusedImports(): Promise<void> {
    console.log('📦 检查未使用的导入...');

    const tsFiles = this.getTypeScriptFiles();

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const importMatch = line.match(/^import\s+.*?from\s+['"]([^'"]+)['"]/);

        if (importMatch) {
          const importPath = importMatch[1];
          const isUsed = this.isImportUsed(content, importPath, line);

          if (!isUsed) {
            this.addIssue({
              file: path.relative(this.projectRoot, file),
              line: i + 1,
              column: 1,
              severity: 'warning',
              category: 'Unused Imports',
              message: `未使用的导入: ${importPath}`,
              rule: 'unused-import',
            });
          }
        }
      }
    }
  }

  /**
   * 检查是否使用了导入
   */
  private isImportUsed(
    content: string,
    importPath: string,
    importLine: string
  ): boolean {
    // 简单的使用检查，可以根据需要改进
    const importName = importLine.match(/import\s+.*?(\w+).*?from/)?.[1];
    if (!importName) return true;

    const usageCount = (
      content.match(new RegExp(`\\b${importName}\\b`, 'g')) || []
    ).length;
    return usageCount > 1; // 导入语句本身算一次
  }

  /**
   * 检查console语句
   */
  private async checkConsoleStatements(): Promise<void> {
    console.log('📢 检查console语句...');

    const tsFiles = this.getTypeScriptFiles();

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const consoleMatch = line.match(/console\.(log|warn|error|debug|info)/);

        if (consoleMatch) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            column: line.indexOf('console'),
            severity: 'warning',
            category: 'Console Usage',
            message: `生产环境应避免使用console.${consoleMatch[1]}`,
            rule: 'no-console',
          });
        }
      }
    }
  }

  /**
   * 检查错误处理
   */
  private async checkErrorHandling(): Promise<void> {
    console.log('⚠️ 检查错误处理...');

    const tsFiles = this.getTypeScriptFiles();

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 检查未处理的Promise
        if (
          line.includes('await') &&
          !line.includes('try') &&
          !line.includes('catch')
        ) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            column: 1,
            severity: 'warning',
            category: 'Error Handling',
            message: '异步操作缺少错误处理',
            rule: 'unhandled-promise',
          });
        }

        // 检查空的catch块
        if (line.includes('catch') && lines[i + 1]?.trim() === '}') {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            column: 1,
            severity: 'warning',
            category: 'Error Handling',
            message: '空的catch块应至少记录错误',
            rule: 'empty-catch',
          });
        }
      }
    }
  }

  /**
   * 检查性能问题
   */
  private async checkPerformanceIssues(): Promise<void> {
    console.log('⚡ 检查性能问题...');

    const tsFiles = this.getTypeScriptFiles();

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 检查循环中的异步操作
        if (line.includes('for') && lines[i + 1]?.includes('await')) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            column: 1,
            severity: 'suggestion',
            category: 'Performance',
            message: '循环中的异步操作应考虑使用Promise.all',
            rule: 'async-in-loop',
          });
        }

        // 检查大对象创建
        if (line.includes('JSON.parse') && line.length > 200) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            column: 1,
            severity: 'suggestion',
            category: 'Performance',
            message: '大对象解析应考虑流式处理',
            rule: 'large-json-parse',
          });
        }
      }
    }
  }

  /**
   * 检查安全问题
   */
  private async checkSecurityIssues(): Promise<void> {
    console.log('🔒 检查安全问题...');

    const tsFiles = this.getTypeScriptFiles();

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 检查硬编码密码
        if (line.match(/password\s*[:=]\s*['"][^'"]+['"]/i)) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            column: 1,
            severity: 'error',
            category: 'Security',
            message: '硬编码密码应使用环境变量',
            rule: 'hardcoded-password',
          });
        }

        // 检查SQL注入风险
        if (
          line.includes('query') &&
          line.includes('+') &&
          !line.includes('?') &&
          !line.includes('$')
        ) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            column: 1,
            severity: 'warning',
            category: 'Security',
            message: '字符串拼接查询可能存在SQL注入风险',
            rule: 'sql-injection',
          });
        }
      }
    }
  }

  /**
   * 检查文档完整性
   */
  private async checkDocumentation(): Promise<void> {
    console.log('📚 检查文档完整性...');

    const tsFiles = this.getTypeScriptFiles();

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      // 检查导出的函数是否有JSDoc
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.match(/^export\s+(async\s+)?function/)) {
          const hasJSDoc =
            lines[i - 1]?.includes('/**') || lines[i - 2]?.includes('/**');

          if (!hasJSDoc) {
            this.addIssue({
              file: path.relative(this.projectRoot, file),
              line: i + 1,
              column: 1,
              severity: 'suggestion',
              category: 'Documentation',
              message: '导出的函数应包含JSDoc注释',
              rule: 'missing-jsdoc',
            });
          }
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
   * 添加问题到报告
   */
  private addIssue(issue: QualityIssue): void {
    this.report.issues.push(issue);
    this.report.summary[
      issue.severity === 'error'
        ? 'errors'
        : issue.severity === 'warning'
          ? 'warnings'
          : 'suggestions'
    ]++;
    this.report.categories[issue.category] =
      (this.report.categories[issue.category] || 0) + 1;
  }

  /**
   * 生成摘要
   */
  private generateSummary(): void {
    this.report.totalFiles = this.getTypeScriptFiles().length;
  }

  /**
   * 生成报告
   */
  private generateReport(): void {
    const reportPath = path.join(this.projectRoot, 'quality-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));

    console.log('\n📊 代码质量检查完成!');
    console.log(`总文件数: ${this.report.totalFiles}`);
    console.log(`错误: ${this.report.summary.errors}`);
    console.log(`警告: ${this.report.summary.warnings}`);
    console.log(`建议: ${this.report.summary.suggestions}`);
    console.log(`报告已保存到: ${reportPath}`);

    if (this.report.summary.errors > 0) {
      console.log('\n❌ 发现错误，请修复后重新检查');
      process.exit(1);
    } else if (this.report.summary.warnings > 0) {
      console.log('\n⚠️ 发现警告，建议修复');
    } else {
      console.log('\n✅ 代码质量良好!');
    }
  }
}

// 运行检查
if (require.main === module) {
  const checker = new CodeQualityChecker();
  checker.runAllChecks().catch(console.error);
}

export { CodeQualityChecker };
