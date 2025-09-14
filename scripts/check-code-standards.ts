#!/usr/bin/env tsx

/**
 * 代码规范检查脚本
 * 检查代码是否符合项目规范
 */

import fs from 'fs';
import path from 'path';

interface CodeStandardIssue {
  file: string;
  line: number;
  column: number;
  rule: string;
  severity: 'error' | 'warning' | 'suggestion';
  message: string;
  suggestion: string;
}

class CodeStandardChecker {
  private issues: CodeStandardIssue[] = [];
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  /**
   * 运行所有规范检查
   */
  async runAllChecks(): Promise<void> {
    console.log('📋 开始代码规范检查...');

    await this.checkNamingConventions();
    await this.checkFileStructure();
    await this.checkImportOrder();
    await this.checkFunctionStructure();
    await this.checkErrorHandling();
    await this.checkDocumentation();
    await this.checkTypeScriptUsage();
    await this.checkReactPatterns();

    this.generateReport();
  }

  /**
   * 检查命名规范
   */
  private async checkNamingConventions(): Promise<void> {
    console.log('🏷️ 检查命名规范...');

    const tsFiles = this.getTypeScriptFiles();

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 检查变量命名（camelCase）
        const varMatch = line.match(
          /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/
        );
        if (varMatch) {
          const varName = varMatch[1];
          if (!this.isCamelCase(varName) && !this.isConstant(varName)) {
            this.addIssue({
              file: path.relative(this.projectRoot, file),
              line: i + 1,
              column: line.indexOf(varName),
              rule: 'naming-convention',
              severity: 'warning',
              message: `变量名 "${varName}" 应使用camelCase命名`,
              suggestion: `将 "${varName}" 改为 "${this.toCamelCase(varName)}"`,
            });
          }
        }

        // 检查函数命名（camelCase）
        const funcMatch = line.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
        if (funcMatch) {
          const funcName = funcMatch[1];
          if (!this.isCamelCase(funcName)) {
            this.addIssue({
              file: path.relative(this.projectRoot, file),
              line: i + 1,
              column: line.indexOf(funcName),
              rule: 'naming-convention',
              severity: 'warning',
              message: `函数名 "${funcName}" 应使用camelCase命名`,
              suggestion: `将 "${funcName}" 改为 "${this.toCamelCase(funcName)}"`,
            });
          }
        }

        // 检查接口命名（PascalCase）
        const interfaceMatch = line.match(
          /interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/
        );
        if (interfaceMatch) {
          const interfaceName = interfaceMatch[1];
          if (!this.isPascalCase(interfaceName)) {
            this.addIssue({
              file: path.relative(this.projectRoot, file),
              line: i + 1,
              column: line.indexOf(interfaceName),
              rule: 'naming-convention',
              severity: 'warning',
              message: `接口名 "${interfaceName}" 应使用PascalCase命名`,
              suggestion: `将 "${interfaceName}" 改为 "${this.toPascalCase(interfaceName)}"`,
            });
          }
        }
      }
    }
  }

  /**
   * 检查文件结构
   */
  private async checkFileStructure(): Promise<void> {
    console.log('📁 检查文件结构...');

    const tsFiles = this.getTypeScriptFiles();

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      // 检查文件头部注释
      if (!lines[0]?.includes('/*') && !lines[0]?.includes('//')) {
        this.addIssue({
          file: path.relative(this.projectRoot, file),
          line: 1,
          column: 1,
          rule: 'file-header',
          severity: 'suggestion',
          message: '文件缺少头部注释',
          suggestion: '添加文件描述注释',
        });
      }

      // 检查导入顺序
      const importLines = lines.filter((line, index) => {
        return line.startsWith('import') && index < 20; // 只检查前20行
      });

      if (importLines.length > 1) {
        const sortedImports = [...importLines].sort();
        if (JSON.stringify(importLines) !== JSON.stringify(sortedImports)) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: lines.indexOf(importLines[0]) + 1,
            column: 1,
            rule: 'import-order',
            severity: 'warning',
            message: '导入语句未按字母顺序排列',
            suggestion: '按字母顺序重新排列导入语句',
          });
        }
      }
    }
  }

  /**
   * 检查导入顺序
   */
  private async checkImportOrder(): Promise<void> {
    console.log('📦 检查导入顺序...');

    const tsFiles = this.getTypeScriptFiles();

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      let lastImportType = '';
      let lastImportLine = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('import')) {
          const importType = this.getImportType(line);

          if (
            lastImportType &&
            this.getImportPriority(importType) <
              this.getImportPriority(lastImportType)
          ) {
            this.addIssue({
              file: path.relative(this.projectRoot, file),
              line: i + 1,
              column: 1,
              rule: 'import-order',
              severity: 'warning',
              message: '导入顺序不符合规范',
              suggestion:
                '按以下顺序排列导入：1. 第三方库 2. 内部模块 3. 相对路径',
            });
          }

          lastImportType = importType;
          lastImportLine = i + 1;
        }
      }
    }
  }

  /**
   * 检查函数结构
   */
  private async checkFunctionStructure(): Promise<void> {
    console.log('🔧 检查函数结构...');

    const tsFiles = this.getTypeScriptFiles();

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 检查函数长度
        if (line.includes('function') || line.includes('=>')) {
          const functionEnd = this.findFunctionEnd(lines, i);
          if (functionEnd - i > 50) {
            this.addIssue({
              file: path.relative(this.projectRoot, file),
              line: i + 1,
              column: 1,
              rule: 'function-length',
              severity: 'warning',
              message: '函数过长，建议拆分',
              suggestion: '将函数拆分为更小的函数，每个函数不超过50行',
            });
          }
        }

        // 检查参数数量
        const paramMatch = line.match(/\(([^)]*)\)/);
        if (paramMatch) {
          const params = paramMatch[1].split(',').filter(p => p.trim());
          if (params.length > 5) {
            this.addIssue({
              file: path.relative(this.projectRoot, file),
              line: i + 1,
              column: 1,
              rule: 'function-params',
              severity: 'warning',
              message: '函数参数过多',
              suggestion: '考虑使用对象参数或拆分函数',
            });
          }
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
        if (line.includes('await') && !this.hasErrorHandling(lines, i)) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            column: 1,
            rule: 'error-handling',
            severity: 'warning',
            message: '异步操作缺少错误处理',
            suggestion: '使用try-catch包装异步操作',
          });
        }

        // 检查空的catch块
        if (line.includes('catch') && this.isEmptyCatch(lines, i)) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            column: 1,
            rule: 'error-handling',
            severity: 'warning',
            message: '空的catch块',
            suggestion: '至少记录错误或重新抛出',
          });
        }
      }
    }
  }

  /**
   * 检查文档
   */
  private async checkDocumentation(): Promise<void> {
    console.log('📚 检查文档...');

    const tsFiles = this.getTypeScriptFiles();

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 检查导出的函数是否有JSDoc
        if (line.match(/^export\s+(async\s+)?function/)) {
          const hasJSDoc = this.hasJSDoc(lines, i);
          if (!hasJSDoc) {
            this.addIssue({
              file: path.relative(this.projectRoot, file),
              line: i + 1,
              column: 1,
              rule: 'jsdoc',
              severity: 'suggestion',
              message: '导出的函数缺少JSDoc注释',
              suggestion: '添加JSDoc注释描述函数功能、参数和返回值',
            });
          }
        }

        // 检查复杂逻辑是否有注释
        if (this.isComplexLogic(line)) {
          const hasComment = this.hasComment(lines, i);
          if (!hasComment) {
            this.addIssue({
              file: path.relative(this.projectRoot, file),
              line: i + 1,
              column: 1,
              rule: 'comments',
              severity: 'suggestion',
              message: '复杂逻辑缺少注释',
              suggestion: '添加注释解释复杂逻辑的目的',
            });
          }
        }
      }
    }
  }

  /**
   * 检查TypeScript使用
   */
  private async checkTypeScriptUsage(): Promise<void> {
    console.log('🔷 检查TypeScript使用...');

    const tsFiles = this.getTypeScriptFiles();

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 检查any类型使用
        if (line.includes(': any')) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            column: line.indexOf(': any'),
            rule: 'typescript-any',
            severity: 'warning',
            message: '使用了any类型',
            suggestion: '使用更具体的类型定义',
          });
        }

        // 检查未使用的变量
        const varMatch = line.match(
          /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/
        );
        if (varMatch) {
          const varName = varMatch[1];
          if (!this.isVariableUsed(content, varName)) {
            this.addIssue({
              file: path.relative(this.projectRoot, file),
              line: i + 1,
              column: line.indexOf(varName),
              rule: 'unused-variable',
              severity: 'warning',
              message: `未使用的变量 "${varName}"`,
              suggestion: '删除未使用的变量或使用下划线前缀',
            });
          }
        }
      }
    }
  }

  /**
   * 检查React模式
   */
  private async checkReactPatterns(): Promise<void> {
    console.log('⚛️ 检查React模式...');

    const tsxFiles = this.getTypeScriptFiles().filter(f => f.endsWith('.tsx'));

    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 检查useEffect依赖
        if (
          line.includes('useEffect') &&
          !line.includes('[]') &&
          !line.includes('[deps]')
        ) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            column: 1,
            rule: 'react-hooks',
            severity: 'warning',
            message: 'useEffect缺少依赖数组',
            suggestion: '添加依赖数组以避免无限循环',
          });
        }

        // 检查内联函数
        if (line.includes('onClick') && line.includes('=>')) {
          this.addIssue({
            file: path.relative(this.projectRoot, file),
            line: i + 1,
            column: 1,
            rule: 'react-performance',
            severity: 'suggestion',
            message: '内联函数可能导致不必要的重渲染',
            suggestion: '将函数提取到组件外部或使用useCallback',
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
   * 检查是否为camelCase
   */
  private isCamelCase(str: string): boolean {
    return /^[a-z][a-zA-Z0-9]*$/.test(str);
  }

  /**
   * 检查是否为PascalCase
   */
  private isPascalCase(str: string): boolean {
    return /^[A-Z][a-zA-Z0-9]*$/.test(str);
  }

  /**
   * 检查是否为常量
   */
  private isConstant(str: string): boolean {
    return /^[A-Z_][A-Z0-9_]*$/.test(str);
  }

  /**
   * 转换为camelCase
   */
  private toCamelCase(str: string): string {
    return str.replace(/([A-Z])/g, (match, p1, offset) =>
      offset === 0 ? p1.toLowerCase() : p1.toLowerCase()
    );
  }

  /**
   * 转换为PascalCase
   */
  private toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * 获取导入类型
   */
  private getImportType(line: string): string {
    if (line.includes("from '@/")) return 'internal';
    if (line.includes("from './") || line.includes("from '../"))
      return 'relative';
    return 'external';
  }

  /**
   * 获取导入优先级
   */
  private getImportPriority(type: string): number {
    const priorities = { external: 1, internal: 2, relative: 3 };
    return priorities[type as keyof typeof priorities] || 4;
  }

  /**
   * 查找函数结束位置
   */
  private findFunctionEnd(lines: string[], start: number): number {
    let braceCount = 0;
    let inFunction = false;

    for (let i = start; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('{')) {
        braceCount++;
        inFunction = true;
      }

      if (line.includes('}')) {
        braceCount--;
        if (inFunction && braceCount === 0) {
          return i;
        }
      }
    }

    return lines.length;
  }

  /**
   * 检查是否有错误处理
   */
  private hasErrorHandling(lines: string[], lineIndex: number): boolean {
    // 简单检查：查找try-catch块
    for (
      let i = Math.max(0, lineIndex - 10);
      i < Math.min(lines.length, lineIndex + 10);
      i++
    ) {
      if (lines[i].includes('try') || lines[i].includes('catch')) {
        return true;
      }
    }
    return false;
  }

  /**
   * 检查是否为空catch块
   */
  private isEmptyCatch(lines: string[], lineIndex: number): boolean {
    for (let i = lineIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('}')) {
        return true;
      }
      if (line.trim() && !line.includes('//') && !line.includes('/*')) {
        return false;
      }
    }
    return true;
  }

  /**
   * 检查是否有JSDoc
   */
  private hasJSDoc(lines: string[], lineIndex: number): boolean {
    for (let i = Math.max(0, lineIndex - 5); i < lineIndex; i++) {
      if (lines[i].includes('/**')) {
        return true;
      }
    }
    return false;
  }

  /**
   * 检查是否为复杂逻辑
   */
  private isComplexLogic(line: string): boolean {
    return (
      line.includes('&&') ||
      line.includes('||') ||
      line.includes('?') ||
      line.match(/if\s*\([^)]{50,}\)/)
    );
  }

  /**
   * 检查是否有注释
   */
  private hasComment(lines: string[], lineIndex: number): boolean {
    for (let i = Math.max(0, lineIndex - 2); i <= lineIndex; i++) {
      if (lines[i].includes('//') || lines[i].includes('/*')) {
        return true;
      }
    }
    return false;
  }

  /**
   * 检查变量是否被使用
   */
  private isVariableUsed(content: string, varName: string): boolean {
    const regex = new RegExp(`\\b${varName}\\b`, 'g');
    const matches = content.match(regex) || [];
    return matches.length > 1; // 声明本身算一次
  }

  /**
   * 添加问题
   */
  private addIssue(issue: CodeStandardIssue): void {
    this.issues.push(issue);
  }

  /**
   * 生成报告
   */
  private generateReport(): void {
    const reportPath = path.join(
      this.projectRoot,
      'code-standards-report.json'
    );
    const report = {
      timestamp: new Date().toISOString(),
      totalIssues: this.issues.length,
      issues: this.issues,
      summary: {
        errors: this.issues.filter(i => i.severity === 'error').length,
        warnings: this.issues.filter(i => i.severity === 'warning').length,
        suggestions: this.issues.filter(i => i.severity === 'suggestion')
          .length,
      },
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📊 代码规范检查完成!');
    console.log(`总问题数: ${this.issues.length}`);
    console.log(`错误: ${report.summary.errors}`);
    console.log(`警告: ${report.summary.warnings}`);
    console.log(`建议: ${report.summary.suggestions}`);
    console.log(`报告已保存到: ${reportPath}`);

    if (this.issues.length > 0) {
      console.log('\n🔧 建议修复的问题:');
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

// 运行检查
if (require.main === module) {
  const checker = new CodeStandardChecker();
  checker.runAllChecks().catch(console.error);
}

export { CodeStandardChecker };
