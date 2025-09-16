/**
 * Lovart设计验证脚本
 * 验证主题配置是否符合Lovart设计规范
 */

import { ThemeConfig } from '../types/theme.js';
import { modernTheme } from '../lib/theme/themes/modern.js';
import { businessTheme } from '../lib/theme/themes/business.js';
import { techTheme } from '../lib/theme/themes/tech.js';
// import { validateLovartCompliance } from '../lib/theme/lovart-analyzer';

interface ValidationResult {
  themeId: string;
  themeName: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

/**
 * 验证单个主题配置
 */
function validateTheme(theme: ThemeConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // 检查必需字段
  if (!theme.id) {
    errors.push('Missing theme ID');
    score -= 20;
  }
  if (!theme.name) {
    errors.push('Missing theme name');
    score -= 20;
  }
  if (!theme.colors) {
    errors.push('Missing color configuration');
    score -= 30;
  }
  if (!theme.styles) {
    errors.push('Missing style configuration');
    score -= 30;
  }

  // 检查Lovart资源
  if (!theme.lovartResources) {
    warnings.push('Missing Lovart resources configuration');
    score -= 10;
  } else {
    if (!theme.lovartResources.icons || theme.lovartResources.icons.length === 0) {
      warnings.push('No Lovart icons configured');
      score -= 5;
    }
    if (!theme.lovartResources.illustrations || theme.lovartResources.illustrations.length === 0) {
      warnings.push('No Lovart illustrations configured');
      score -= 5;
    }
  }

  // 检查颜色配置
  if (theme.colors) {
    const requiredColors = ['primary', 'secondary', 'accent', 'background', 'surface', 'text'];
    for (const color of requiredColors) {
      if (!theme.colors[color as keyof typeof theme.colors]) {
        errors.push(`Missing required color: ${color}`);
        score -= 5;
      }
    }
  }

  // 检查样式配置
  if (theme.styles) {
    if (!theme.styles.borderRadius) {
      errors.push('Missing borderRadius configuration');
      score -= 10;
    }
    if (!theme.styles.shadows) {
      errors.push('Missing shadows configuration');
      score -= 10;
    }
    if (!theme.styles.animations) {
      errors.push('Missing animations configuration');
      score -= 10;
    }
    if (!theme.styles.spacing) {
      errors.push('Missing spacing configuration');
      score -= 10;
    }
    if (!theme.styles.typography) {
      errors.push('Missing typography configuration');
      score -= 10;
    }
  }

  // 检查预览图片
  if (!theme.preview) {
    warnings.push('Missing preview image');
    score -= 5;
  }

  return {
    themeId: theme.id,
    themeName: theme.name,
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score),
  };
}

/**
 * 验证所有主题配置
 */
function validateAllThemes(): ValidationResult[] {
  const themes = [modernTheme, businessTheme, techTheme];
  return themes.map(validateTheme);
}

/**
 * 生成验证报告
 */
function generateReport(results: ValidationResult[]): string {
  let report = '# Lovart设计验证报告\n\n';
  report += `生成时间: ${new Date().toISOString()}\n\n`;

  // 总体统计
  const totalThemes = results.length;
  const validThemes = results.filter(r => r.isValid).length;
  const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalThemes;

  report += '## 总体统计\n\n';
  report += `- 总主题数: ${totalThemes}\n`;
  report += `- 有效主题数: ${validThemes}\n`;
  report += `- 平均得分: ${averageScore.toFixed(1)}/100\n\n`;

  // 详细结果
  report += '## 详细结果\n\n';
  for (const result of results) {
    report += `### ${result.themeName} (${result.themeId})\n\n`;
    report += `**得分**: ${result.score}/100\n`;
    report += `**状态**: ${result.isValid ? '✅ 通过' : '❌ 失败'}\n\n`;

    if (result.errors.length > 0) {
      report += '**错误**:\n';
      for (const error of result.errors) {
        report += `- ❌ ${error}\n`;
      }
      report += '\n';
    }

    if (result.warnings.length > 0) {
      report += '**警告**:\n';
      for (const warning of result.warnings) {
        report += `- ⚠️ ${warning}\n`;
      }
      report += '\n';
    }

    if (result.isValid && result.warnings.length === 0) {
      report += '✅ 所有检查通过，无问题\n\n';
    }
  }

  // 建议
  report += '## 改进建议\n\n';
  const failedThemes = results.filter(r => !r.isValid);
  if (failedThemes.length > 0) {
    report += '### 需要修复的问题\n\n';
    for (const result of failedThemes) {
      report += `- **${result.themeName}**: ${result.errors.join(', ')}\n`;
    }
    report += '\n';
  }

  const warningThemes = results.filter(r => r.warnings.length > 0);
  if (warningThemes.length > 0) {
    report += '### 建议改进\n\n';
    for (const result of warningThemes) {
      report += `- **${result.themeName}**: ${result.warnings.join(', ')}\n`;
    }
    report += '\n';
  }

  report += '## 总结\n\n';
  if (validThemes === totalThemes) {
    report += '🎉 所有主题配置都符合Lovart设计规范！\n';
  } else {
    report += `⚠️ 有 ${totalThemes - validThemes} 个主题需要修复问题。\n`;
  }

  return report;
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 开始验证Lovart设计合规性...\n');

  const results = validateAllThemes();
  const report = generateReport(results);

  console.log(report);

  // 保存报告到文件
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(__dirname, '../docs/Lovart主题美化/validation-report.md');
  
  try {
    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`📄 验证报告已保存到: ${reportPath}`);
  } catch (error) {
    console.error('❌ 保存报告失败:', error);
  }

  // 返回验证结果
  const allValid = results.every(r => r.isValid);
  if (allValid) {
    console.log('\n✅ 所有主题验证通过！');
    process.exit(0);
  } else {
    console.log('\n❌ 部分主题验证失败，请查看报告修复问题。');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { validateTheme, validateAllThemes, generateReport };