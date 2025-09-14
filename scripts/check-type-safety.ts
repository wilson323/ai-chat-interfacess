#!/usr/bin/env tsx

/**
 * 类型安全检查脚本
 * 检查项目中any类型使用情况，确保类型安全
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { execSync } from 'child_process';

interface TypeSafetyReport {
  totalFiles: number;
  filesWithAny: number;
  anyTypeCount: number;
  anyTypeLocations: Array<{
    file: string;
    line: number;
    content: string;
  }>;
  typeDefinitionFiles: string[];
  missingTypeDefinitions: string[];
  recommendations: string[];
}

class TypeSafetyChecker {
  private report: TypeSafetyReport = {
    totalFiles: 0,
    filesWithAny: 0,
    anyTypeCount: 0,
    anyTypeLocations: [],
    typeDefinitionFiles: [],
    missingTypeDefinitions: [],
    recommendations: [],
  };

  private readonly allowedAnyPatterns = [
    /\/\/.*any/, // 注释中的any
    /\/\*[\s\S]*?\*\/.*any/, // 块注释中的any
    /any\[\]/, // any[] 在某些情况下允许
    /Record<string,\s*any>/, // Record<string, any> 在某些情况下允许
  ];

  private readonly excludePatterns = [
    /node_modules/,
    /\.next/,
    /dist/,
    /build/,
    /coverage/,
    /\.git/,
    /playwright-report/,
    /test-results/,
  ];

  private readonly typeDefinitionFiles = [
    'types/index.ts',
    'types/agent.ts',
    'types/message.ts',
    'types/api.ts',
    'types/global.ts',
    'types/errors.ts',
    'types/voice.ts',
  ];

  /**
   * 检查文件是否应该被排除
   */
  private shouldExcludeFile(filePath: string): boolean {
    return this.excludePatterns.some(pattern => pattern.test(filePath));
  }

  /**
   * 检查文件是否为TypeScript文件
   */
  private isTypeScriptFile(filePath: string): boolean {
    const ext = extname(filePath);
    return ext === '.ts' || ext === '.tsx';
  }

  /**
   * 扫描目录中的TypeScript文件
   */
  private scanDirectory(dirPath: string): string[] {
    const files: string[] = [];

    try {
      const items = readdirSync(dirPath);

      for (const item of items) {
        const fullPath = join(dirPath, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          if (!this.shouldExcludeFile(fullPath)) {
            files.push(...this.scanDirectory(fullPath));
          }
        } else if (stat.isFile() && this.isTypeScriptFile(fullPath)) {
          if (!this.shouldExcludeFile(fullPath)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Cannot read directory ${dirPath}:`, error);
    }

    return files;
  }

  /**
   * 检查文件中的any类型使用
   */
  private checkFileForAny(filePath: string): void {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      let hasAny = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNumber = i + 1;

        // 检查是否包含any类型
        if (line.includes('any')) {
          // 检查是否在允许的模式中
          const isAllowed = this.allowedAnyPatterns.some(pattern =>
            pattern.test(line)
          );

          if (!isAllowed) {
            hasAny = true;
            this.report.anyTypeCount++;
            this.report.anyTypeLocations.push({
              file: filePath,
              line: lineNumber,
              content: line.trim(),
            });
          }
        }
      }

      if (hasAny) {
        this.report.filesWithAny++;
      }

      this.report.totalFiles++;
    } catch (error) {
      console.warn(`Warning: Cannot read file ${filePath}:`, error);
    }
  }

  /**
   * 检查类型定义文件是否存在
   */
  private checkTypeDefinitionFiles(): void {
    for (const typeFile of this.typeDefinitionFiles) {
      try {
        const content = readFileSync(typeFile, 'utf-8');
        this.report.typeDefinitionFiles.push(typeFile);
      } catch (error) {
        this.report.missingTypeDefinitions.push(typeFile);
      }
    }
  }

  /**
   * 生成改进建议
   */
  private generateRecommendations(): void {
    if (this.report.anyTypeCount > 0) {
      this.report.recommendations.push(
        `发现 ${this.report.anyTypeCount} 个any类型使用，需要替换为具体类型`
      );
    }

    if (this.report.filesWithAny > 0) {
      this.report.recommendations.push(
        `${this.report.filesWithAny} 个文件包含any类型，需要重构`
      );
    }

    if (this.report.missingTypeDefinitions.length > 0) {
      this.report.recommendations.push(
        `缺少类型定义文件: ${this.report.missingTypeDefinitions.join(', ')}`
      );
    }

    if (this.report.anyTypeCount === 0) {
      this.report.recommendations.push('✅ 未发现any类型使用，类型安全良好');
    }
  }

  /**
   * 运行类型安全检查
   */
  public async runCheck(): Promise<TypeSafetyReport> {
    console.log('🔍 开始类型安全检查...');

    // 扫描所有TypeScript文件
    const files = this.scanDirectory('.');
    console.log(`📁 扫描到 ${files.length} 个TypeScript文件`);

    // 检查每个文件
    for (const file of files) {
      this.checkFileForAny(file);
    }

    // 检查类型定义文件
    this.checkTypeDefinitionFiles();

    // 生成建议
    this.generateRecommendations();

    return this.report;
  }

  /**
   * 打印检查报告
   */
  public printReport(): void {
    console.log('\n📊 类型安全检查报告');
    console.log('='.repeat(50));

    console.log(`📁 总文件数: ${this.report.totalFiles}`);
    console.log(`⚠️  包含any的文件数: ${this.report.filesWithAny}`);
    console.log(`🚫 any类型总数: ${this.report.anyTypeCount}`);
    console.log(`📝 类型定义文件: ${this.report.typeDefinitionFiles.length}`);
    console.log(
      `❌ 缺少的类型定义: ${this.report.missingTypeDefinitions.length}`
    );

    if (this.report.anyTypeLocations.length > 0) {
      console.log('\n🚫 any类型使用位置:');
      this.report.anyTypeLocations.forEach((location, index) => {
        console.log(`${index + 1}. ${location.file}:${location.line}`);
        console.log(`   ${location.content}`);
      });
    }

    if (this.report.missingTypeDefinitions.length > 0) {
      console.log('\n❌ 缺少的类型定义文件:');
      this.report.missingTypeDefinitions.forEach(file => {
        console.log(`   - ${file}`);
      });
    }

    if (this.report.recommendations.length > 0) {
      console.log('\n💡 改进建议:');
      this.report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    // 计算类型安全分数
    const safetyScore = this.calculateSafetyScore();
    console.log(`\n🎯 类型安全分数: ${safetyScore}/100`);

    if (safetyScore >= 90) {
      console.log('✅ 类型安全状况良好');
    } else if (safetyScore >= 70) {
      console.log('⚠️  类型安全需要改进');
    } else {
      console.log('❌ 类型安全状况较差，需要立即改进');
    }
  }

  /**
   * 计算类型安全分数
   */
  private calculateSafetyScore(): number {
    let score = 100;

    // any类型使用扣分
    if (this.report.anyTypeCount > 0) {
      score -= Math.min(this.report.anyTypeCount * 2, 50);
    }

    // 缺少类型定义文件扣分
    if (this.report.missingTypeDefinitions.length > 0) {
      score -= this.report.missingTypeDefinitions.length * 10;
    }

    // 包含any的文件扣分
    if (this.report.filesWithAny > 0) {
      score -= Math.min(this.report.filesWithAny * 5, 30);
    }

    return Math.max(score, 0);
  }
}

/**
 * 运行TypeScript编译器检查
 */
async function runTypeScriptCheck(): Promise<boolean> {
  try {
    console.log('🔧 运行TypeScript编译器检查...');
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    console.log('✅ TypeScript编译器检查通过');
    return true;
  } catch (error) {
    console.error('❌ TypeScript编译器检查失败:');
    console.error(error.toString());
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  const checker = new TypeSafetyChecker();

  try {
    // 运行类型安全检查
    const report = await checker.runCheck();

    // 打印报告
    checker.printReport();

    // 运行TypeScript编译器检查
    const tscPassed = await runTypeScriptCheck();

    // 根据检查结果决定退出码
    if (report.anyTypeCount > 0 || !tscPassed) {
      console.log('\n❌ 类型安全检查未通过');
      process.exit(1);
    } else {
      console.log('\n✅ 类型安全检查通过');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ 类型安全检查失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { TypeSafetyChecker };
