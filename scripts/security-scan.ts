/**
 * 安全扫描脚本
 * 扫描整个项目代码库的安全漏洞
 */

import { SecurityScanner, SecurityIssue, SecurityScanResult } from '@/lib/security/security-scanner';
import * as fs from 'fs';
import * as path from 'path';

interface ScanOptions {
  includePatterns: string[];
  excludePatterns: string[];
  maxFileSize: number;
  outputFormat: 'json' | 'html' | 'console';
  outputFile?: string;
}

class ProjectSecurityScanner {
  private scanner: SecurityScanner;
  private options: ScanOptions;
  private allIssues: SecurityIssue[] = [];

  constructor(options: Partial<ScanOptions> = {}) {
    this.scanner = new SecurityScanner();
    this.options = {
      includePatterns: [
        '**/*.ts',
        '**/*.tsx',
        '**/*.js',
        '**/*.jsx',
        '**/*.json'
      ],
      excludePatterns: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/*.d.ts',
        '**/coverage/**',
        '**/.next/**'
      ],
      maxFileSize: 1024 * 1024, // 1MB
      outputFormat: 'console',
      ...options
    };
  }

  /**
   * 扫描单个文件
   */
  private async scanFile(filePath: string): Promise<SecurityIssue[]> {
    try {
      const stats = fs.statSync(filePath);
      
      // 检查文件大小
      if (stats.size > this.options.maxFileSize) {
        console.warn(`⚠️ 跳过大文件: ${filePath} (${stats.size} bytes)`);
        return [];
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const issues = await this.scanner.scanCode(content, filePath);
      
      if (issues.length > 0) {
        console.log(`🔍 扫描 ${filePath}: 发现 ${issues.length} 个问题`);
      }
      
      return issues;
    } catch (error) {
      console.error(`❌ 扫描文件失败 ${filePath}:`, error);
      return [];
    }
  }

  /**
   * 获取所有需要扫描的文件
   */
  private getFilesToScan(dir: string): string[] {
    const files: string[] = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // 检查是否应该排除此目录
          const shouldExclude = this.options.excludePatterns.some(pattern => {
            const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
            return regex.test(fullPath);
          });
          
          if (!shouldExclude) {
            files.push(...this.getFilesToScan(fullPath));
          }
        } else if (entry.isFile()) {
          // 检查是否应该包含此文件
          const shouldInclude = this.options.includePatterns.some(pattern => {
            const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
            return regex.test(fullPath);
          });
          
          if (shouldInclude) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`❌ 读取目录失败 ${dir}:`, error);
    }
    
    return files;
  }

  /**
   * 扫描整个项目
   */
  public async scanProject(projectRoot: string = '.'): Promise<SecurityScanResult> {
    console.log('🔒 开始安全扫描...\n');
    console.log(`📁 扫描目录: ${path.resolve(projectRoot)}`);
    console.log(`📋 包含模式: ${this.options.includePatterns.join(', ')}`);
    console.log(`🚫 排除模式: ${this.options.excludePatterns.join(', ')}\n`);

    const filesToScan = this.getFilesToScan(projectRoot);
    console.log(`📄 找到 ${filesToScan.length} 个文件需要扫描\n`);

    let scannedFiles = 0;
    this.allIssues = [];

    // 扫描每个文件
    for (const filePath of filesToScan) {
      const issues = await this.scanFile(filePath);
      this.allIssues.push(...issues);
      scannedFiles++;
      
      if (scannedFiles % 10 === 0) {
        console.log(`📊 已扫描 ${scannedFiles}/${filesToScan.length} 个文件`);
      }
    }

    console.log(`\n✅ 扫描完成! 共扫描 ${scannedFiles} 个文件`);
    
    // 生成报告
    const report = this.generateReport();
    this.outputReport(report);
    
    return report;
  }

  /**
   * 生成扫描报告
   */
  private generateReport(): SecurityScanResult {
    const criticalIssues = this.allIssues.filter(i => i.severity === 'critical').length;
    const highIssues = this.allIssues.filter(i => i.severity === 'high').length;
    const mediumIssues = this.allIssues.filter(i => i.severity === 'medium').length;
    const lowIssues = this.allIssues.filter(i => i.severity === 'low').length;

    // 计算安全评分
    const score = Math.max(
      0,
      100 - (criticalIssues * 20 + highIssues * 10 + mediumIssues * 5 + lowIssues * 2)
    );
    
    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

    // 生成建议
    const recommendations = this.generateRecommendations();

    return {
      timestamp: Date.now(),
      totalIssues: this.allIssues.length,
      criticalIssues,
      highIssues,
      mediumIssues,
      lowIssues,
      issues: this.allIssues,
      summary: {
        score,
        grade,
        recommendations
      }
    };
  }

  /**
   * 生成修复建议
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.allIssues.some(i => i.type === 'vulnerability' && i.severity === 'critical')) {
      recommendations.push('🚨 立即修复所有关键漏洞');
    }

    if (this.allIssues.some(i => i.title.includes('SQL注入'))) {
      recommendations.push('🔐 实施参数化查询防止SQL注入');
    }

    if (this.allIssues.some(i => i.title.includes('XSS'))) {
      recommendations.push('🛡️ 对用户输入进行适当的转义和验证');
    }

    if (this.allIssues.some(i => i.title.includes('CSRF'))) {
      recommendations.push('🔑 实施CSRF令牌验证');
    }

    if (this.allIssues.some(i => i.title.includes('敏感数据'))) {
      recommendations.push('🔒 使用环境变量存储敏感信息');
    }

    if (this.allIssues.some(i => i.title.includes('身份验证'))) {
      recommendations.push('👤 实施适当的身份验证和授权机制');
    }

    if (this.allIssues.some(i => i.title.includes('日志记录'))) {
      recommendations.push('📝 实施全面的安全日志记录');
    }

    if (this.allIssues.some(i => i.title.includes('保护不足'))) {
      recommendations.push('⚡ 实施API速率限制和安全头保护');
    }

    if (this.allIssues.length === 0) {
      recommendations.push('🎉 未发现安全问题，保持良好的安全实践');
    }

    return recommendations;
  }

  /**
   * 输出报告
   */
  private outputReport(report: SecurityScanResult): void {
    console.log('\n' + '='.repeat(60));
    console.log('🔒 安全扫描报告');
    console.log('='.repeat(60));
    
    console.log(`📊 总体统计:`);
    console.log(`   总问题数: ${report.totalIssues}`);
    console.log(`   关键问题: ${report.criticalIssues}`);
    console.log(`   高危问题: ${report.highIssues}`);
    console.log(`   中危问题: ${report.mediumIssues}`);
    console.log(`   低危问题: ${report.lowIssues}`);
    
    console.log(`\n🏆 安全评分: ${report.summary.score}/100 (等级: ${report.summary.grade})`);
    
    if (report.totalIssues > 0) {
      console.log(`\n⚠️ 发现的问题:`);
      
      // 按严重程度分组显示
      const issuesBySeverity = {
        critical: this.allIssues.filter(i => i.severity === 'critical'),
        high: this.allIssues.filter(i => i.severity === 'high'),
        medium: this.allIssues.filter(i => i.severity === 'medium'),
        low: this.allIssues.filter(i => i.severity === 'low')
      };

      Object.entries(issuesBySeverity).forEach(([severity, issues]) => {
        if (issues.length > 0) {
          console.log(`\n🔴 ${severity.toUpperCase()} (${issues.length}个):`);
          issues.forEach(issue => {
            console.log(`   • ${issue.title}`);
            console.log(`     文件: ${issue.file}`);
            if (issue.line) console.log(`     行号: ${issue.line}`);
            console.log(`     建议: ${issue.recommendation}`);
            console.log('');
          });
        }
      });
    }
    
    console.log(`\n💡 修复建议:`);
    report.summary.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });

    // 保存报告到文件
    if (this.options.outputFile) {
      const reportData = {
        ...report,
        issues: report.issues.map(issue => ({
          ...issue,
          // 移除代码片段以减少文件大小
          code: undefined
        }))
      };
      
      fs.writeFileSync(this.options.outputFile, JSON.stringify(reportData, null, 2));
      console.log(`\n📄 详细报告已保存到: ${this.options.outputFile}`);
    }

    console.log('\n' + '='.repeat(60));
  }

  /**
   * 获取问题统计
   */
  public getIssueStats(): {
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    byFile: Record<string, number>;
  } {
    const bySeverity = this.allIssues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = this.allIssues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byFile = this.allIssues.reduce((acc, issue) => {
      if (issue.file) {
        acc[issue.file] = (acc[issue.file] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return { bySeverity, byType, byFile };
  }
}

// 运行扫描
async function main() {
  const scanner = new ProjectSecurityScanner({
    outputFormat: 'console',
    outputFile: 'security-scan-report.json'
  });

  try {
    const report = await scanner.scanProject();
    
    // 根据扫描结果设置退出码
    const exitCode = report.summary.grade === 'A' || report.summary.grade === 'B' ? 0 : 1;
    
    console.log(`\n🏁 扫描完成，退出码: ${exitCode}`);
    process.exit(exitCode);
    
  } catch (error) {
    console.error('❌ 扫描过程中发生错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { ProjectSecurityScanner };
