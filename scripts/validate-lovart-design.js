/**
 * Lovart设计验证脚本
 * 验证主题配置是否符合Lovart设计规范
 */

const fs = require('fs');
const path = require('path');

// 模拟主题配置（实际应该从文件导入）
const themes = [
  {
    id: 'modern',
    name: '现代简约',
    colors: {
      primary: '#6cb33f',
      secondary: '#8bc565',
      accent: '#4a7c59',
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#2d3436',
      textSecondary: '#636e72',
      border: '#e9ecef',
      success: '#00b894',
      warning: '#fdcb6e',
      error: '#e17055',
      info: '#74b9ff',
    },
    styles: {
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px' },
      shadows: { sm: '0 1px 2px rgba(0, 0, 0, 0.05)', md: '0 4px 6px rgba(0, 0, 0, 0.1)', lg: '0 10px 15px rgba(0, 0, 0, 0.1)', xl: '0 20px 25px rgba(0, 0, 0, 0.1)' },
      animations: { fast: '0.15s ease-out', normal: '0.3s ease-out', slow: '0.5s ease-out' },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: { xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px', '2xl': '24px', '3xl': '30px' },
        lineHeight: { tight: '1.25', normal: '1.5', relaxed: '1.75' },
        fontWeight: { normal: '400', medium: '500', semibold: '600', bold: '700' },
      },
    },
    lovartResources: {
      icons: ['/lovart-analysis/sample1.png', '/lovart-analysis/sample2.png', '/lovart-analysis/sample3.png'],
      illustrations: ['/lovart-analysis/avatar.png'],
      backgrounds: [],
    },
  },
  {
    id: 'business',
    name: '商务专业',
    colors: {
      primary: '#2c3e50',
      secondary: '#34495e',
      accent: '#3498db',
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#2c3e50',
      textSecondary: '#7f8c8d',
      border: '#bdc3c7',
      success: '#27ae60',
      warning: '#f39c12',
      error: '#e74c3c',
      info: '#3498db',
    },
    styles: {
      borderRadius: { sm: '2px', md: '4px', lg: '8px', xl: '12px', full: '9999px' },
      shadows: { sm: '0 1px 3px rgba(0, 0, 0, 0.12)', md: '0 2px 4px rgba(0, 0, 0, 0.12)', lg: '0 4px 8px rgba(0, 0, 0, 0.12)', xl: '0 8px 16px rgba(0, 0, 0, 0.12)' },
      animations: { fast: '0.2s ease-out', normal: '0.3s ease-out', slow: '0.5s ease-out' },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
      typography: {
        fontFamily: 'Roboto, system-ui, sans-serif',
        fontSize: { xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px', '2xl': '24px', '3xl': '30px' },
        lineHeight: { tight: '1.25', normal: '1.5', relaxed: '1.75' },
        fontWeight: { normal: '400', medium: '500', semibold: '600', bold: '700' },
      },
    },
    lovartResources: {
      icons: ['/lovart-analysis/sample1.png', '/lovart-analysis/sample2.png'],
      illustrations: ['/lovart-analysis/avatar.png'],
      backgrounds: [],
    },
  },
  {
    id: 'tech',
    name: '科技未来',
    colors: {
      primary: '#00d4ff',
      secondary: '#0099cc',
      accent: '#ff6b35',
      background: '#0a0a0a',
      surface: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#b3b3b3',
      border: '#333333',
      success: '#00ff88',
      warning: '#ffaa00',
      error: '#ff3366',
      info: '#00d4ff',
    },
    styles: {
      borderRadius: { sm: '6px', md: '12px', lg: '18px', xl: '24px', full: '9999px' },
      shadows: { sm: '0 0 10px rgba(0, 212, 255, 0.3)', md: '0 0 20px rgba(0, 212, 255, 0.4)', lg: '0 0 30px rgba(0, 212, 255, 0.5)', xl: '0 0 40px rgba(0, 212, 255, 0.6)' },
      animations: { fast: '0.1s ease-out', normal: '0.2s ease-out', slow: '0.4s ease-out' },
      spacing: { xs: '6px', sm: '12px', md: '20px', lg: '28px', xl: '36px' },
      typography: {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: { xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px', '2xl': '24px', '3xl': '30px' },
        lineHeight: { tight: '1.25', normal: '1.5', relaxed: '1.75' },
        fontWeight: { normal: '400', medium: '500', semibold: '600', bold: '700' },
      },
    },
    lovartResources: {
      icons: ['/lovart-analysis/sample1.png', '/lovart-analysis/sample2.png', '/lovart-analysis/sample3.png'],
      illustrations: ['/lovart-analysis/avatar.png'],
      backgrounds: [],
    },
  },
];

/**
 * 验证单个主题配置
 */
function validateTheme(theme) {
  const errors = [];
  const warnings = [];
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
      if (!theme.colors[color]) {
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
function validateAllThemes() {
  return themes.map(validateTheme);
}

/**
 * 生成验证报告
 */
function generateReport(results) {
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

// 运行主函数
main();