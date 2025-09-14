/**
 * 安全扫描测试脚本
 */

import { SecurityScanner } from '../lib/security/security-scanner';

async function testSecurityScanner() {
  console.log('🔒 开始安全扫描测试...\n');

  const scanner = new SecurityScanner();

  // 测试代码样本
  const testCode = `
const query = 'SELECT * FROM users WHERE id = ' + userId;
const html = '<div>' + userInput + '</div>';
fetch('/api/data', { method: 'POST' });
const password = 'hardcoded123';
console.log('API key:', apiKey);
`;

  console.log('📝 测试代码:');
  console.log(testCode);

  const issues = await scanner.scanCode(testCode, 'test.js');
  
  console.log(`\n🔍 发现 ${issues.length} 个安全问题:`);
  
  if (issues.length > 0) {
    issues.forEach((issue, index) => {
      console.log(`\n${index + 1}. ${issue.title} (${issue.severity.toUpperCase()})`);
      console.log(`   描述: ${issue.description}`);
      console.log(`   建议: ${issue.recommendation}`);
      if (issue.cwe) console.log(`   CWE: ${issue.cwe}`);
      if (issue.owasp) console.log(`   OWASP: ${issue.owasp}`);
    });
  }

  const report = scanner.generateReport();
  
  console.log(`\n📊 安全评分: ${report.summary.score}/100`);
  console.log(`🏆 安全等级: ${report.summary.grade}`);
  
  console.log(`\n💡 修复建议:`);
  report.summary.recommendations.forEach((rec, index) => {
    console.log(`   ${index + 1}. ${rec}`);
  });

  return report;
}

// 运行测试
testSecurityScanner()
  .then(report => {
    console.log('\n✅ 安全扫描测试完成');
    process.exit(report.summary.grade === 'A' || report.summary.grade === 'B' ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  });
