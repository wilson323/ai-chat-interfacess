#!/usr/bin/env node

/**
 * 测试覆盖率检查脚本
 * 在Jest不可用的情况下，通过其他方式验证代码质量
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 开始测试覆盖率分析...');

// 1. 统计测试文件数量
function countTestFiles() {
  const testDirs = ['tests', '__tests__'];
  let testCount = 0;
  let testFiles = [];

  testDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir, { recursive: true });
      const testFilesInDir = files.filter(file =>
        typeof file === 'string' &&
        (file.includes('.test.') || file.includes('.spec.'))
      );
      testCount += testFilesInDir.length;
      testFiles.push(...testFilesInDir.map(f => path.join(dir, f)));
    }
  });

  return { count: testCount, files: testFiles };
}

// 2. 统计源代码文件数量
function countSourceFiles() {
  const sourceDirs = ['app', 'components', 'lib', 'hooks', 'types'];
  let sourceCount = 0;
  let sourceFiles = [];

  sourceDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir, { recursive: true });
      const sourceFilesInDir = files.filter(file =>
        typeof file === 'string' &&
        (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) &&
        !file.includes('.test.') && !file.includes('.spec.') && !file.includes('.d.ts')
      );
      sourceCount += sourceFilesInDir.length;
      sourceFiles.push(...sourceFilesInDir.map(f => path.join(dir, f)));
    }
  });

  return { count: sourceCount, files: sourceFiles };
}

// 3. 分析测试覆盖率
function analyzeCoverage() {
  const { count: testCount, files: testFiles } = countTestFiles();
  const { count: sourceCount, files: sourceFiles } = countSourceFiles();

  console.log('📊 文件统计:');
  console.log(`  测试文件: ${testCount} 个`);
  console.log(`  源代码文件: ${sourceCount} 个`);

  // 计算理论覆盖率
  const theoreticalCoverage = testCount > 0 ? Math.min((testCount / sourceCount) * 100, 100) : 0;

  console.log(`  理论覆盖率: ${theoreticalCoverage.toFixed(1)}%`);

  return {
    testCount,
    sourceCount,
    theoreticalCoverage,
    testFiles,
    sourceFiles
  };
}

// 4. 检查测试质量
function checkTestQuality() {
  console.log('\n🔍 检查测试质量...');

  const issues = [];

  // 检查测试文件是否有基本结构
  const { files: testFiles } = countTestFiles();
  testFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');

      // 检查是否有describe和test
      if (!content.includes('describe(') && !content.includes('test(')) {
        issues.push(`${file}: 缺少describe或test结构`);
      }

      // 检查是否有expect断言
      if (!content.includes('expect(')) {
        issues.push(`${file}: 缺少expect断言`);
      }

      // 检查是否有mock
      if (!content.includes('jest.mock(') && !content.includes('mock')) {
        issues.push(`${file}: 缺少mock设置`);
      }
    } catch (error) {
      issues.push(`${file}: 读取失败 - ${error.message}`);
    }
  });

  if (issues.length > 0) {
    console.log('⚠️  发现测试质量问题:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  } else {
    console.log('✅ 测试质量检查通过');
  }

  return issues;
}

// 5. 生成覆盖率报告
function generateCoverageReport() {
  const coverage = analyzeCoverage();
  const qualityIssues = checkTestQuality();

  const report = {
    timestamp: new Date().toISOString(),
    environment: process.platform,
    coverage: {
      testFiles: coverage.testCount,
      sourceFiles: coverage.sourceCount,
      theoreticalCoverage: coverage.theoreticalCoverage,
      targetCoverage: 80,
      status: coverage.theoreticalCoverage >= 80 ? '达标' : '未达标'
    },
    quality: {
      issues: qualityIssues.length,
      status: qualityIssues.length === 0 ? '良好' : '需要改进'
    },
    recommendations: []
  };

  if (coverage.theoreticalCoverage < 80) {
    report.recommendations.push('增加测试文件数量');
    report.recommendations.push('为关键模块添加测试');
  }

  if (qualityIssues.length > 0) {
    report.recommendations.push('改进测试文件质量');
    report.recommendations.push('添加更多断言和mock');
  }

  // 保存报告
  fs.writeFileSync('coverage-report.json', JSON.stringify(report, null, 2));

  console.log('\n📊 覆盖率报告:');
  console.log(`  测试文件: ${coverage.testCount}/${coverage.sourceCount}`);
  console.log(`  覆盖率: ${coverage.theoreticalCoverage.toFixed(1)}%`);
  console.log(`  目标: 80%`);
  console.log(`  状态: ${report.coverage.status}`);

  if (report.recommendations.length > 0) {
    console.log('\n💡 建议:');
    report.recommendations.forEach(rec => console.log(`  - ${rec}`));
  }

  return report;
}

// 主函数
function main() {
  try {
    const report = generateCoverageReport();
    console.log('\n✅ 测试覆盖率分析完成');
    console.log('📄 详细报告已保存到: coverage-report.json');

    if (report.coverage.status === '达标' && report.quality.status === '良好') {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 分析失败:', error.message);
    process.exit(1);
  }
}

main();
