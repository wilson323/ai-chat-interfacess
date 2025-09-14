#!/usr/bin/env node

/**
 * 安全的自动化修复脚本
 * 确保修复过程不会破坏代码
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 创建备份
function createBackup() {
  log('📦 创建修复前备份...', 'blue');
  try {
    execSync('git add -A', { stdio: 'inherit' });
    execSync('git commit -m "backup: before safe auto-fix"', { stdio: 'inherit' });
    log('✅ 备份创建成功', 'green');
    return true;
  } catch (error) {
    log('❌ 备份创建失败', 'red');
    return false;
  }
}

// 安全修复HTML实体编码
function safeFixHtmlEntities(filePath) {
  log(`🔧 安全修复文件: ${filePath}`, 'blue');

  const content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // 只修复明确的HTML实体编码问题
  const fixes = [
    { from: '&lt;', to: "{'<'}" },
    { from: '&gt;', to: "{'>'}" },
    { from: '&amp;', to: "{'&'}" },
    { from: '&quot;', to: '{"'}"' },
    { from: '&#x27;', to: "{'\\''}" }
  ];

  let fixedContent = content;
  let hasChanges = false;

  fixes.forEach(fix => {
    const regex = new RegExp(fix.from, 'g');
    if (regex.test(fixedContent)) {
      fixedContent = fixedContent.replace(regex, fix.to);
      hasChanges = true;
      log(`  ✅ 修复: ${fix.from} → ${fix.to}`, 'green');
    }
  });

  if (hasChanges) {
    // 验证修复后的语法
    if (validateJsxSyntax(fixedContent)) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      log(`✅ 文件修复成功: ${filePath}`, 'green');
      return true;
    } else {
      log(`❌ 修复后语法验证失败: ${filePath}`, 'red');
      return false;
    }
  } else {
    log(`ℹ️  文件无需修复: ${filePath}`, 'yellow');
    return true;
  }
}

// 验证JSX语法
function validateJsxSyntax(content) {
  try {
    // 简单的JSX语法验证
    const jsxRegex = /<[^>]*>/g;
    const matches = content.match(jsxRegex);

    if (matches) {
      // 检查是否有未闭合的标签
      const openTags = content.match(/<[^/][^>]*>/g) || [];
      const closeTags = content.match(/<\/[^>]*>/g) || [];

      if (openTags.length !== closeTags.length) {
        log('⚠️  发现未闭合的JSX标签', 'yellow');
        return false;
      }
    }

    return true;
  } catch (error) {
    log(`❌ JSX语法验证失败: ${error.message}`, 'red');
    return false;
  }
}

// 验证修复结果
function validateFix() {
  log('🔍 验证修复结果...', 'blue');

  try {
    // 1. 类型检查
    log('📋 运行TypeScript类型检查...', 'yellow');
    execSync('npm run check-types', { stdio: 'inherit' });
    log('✅ 类型检查通过', 'green');

    // 2. 构建检查
    log('📋 运行构建检查...', 'yellow');
    execSync('npm run build', { stdio: 'inherit' });
    log('✅ 构建检查通过', 'green');

    // 3. 测试运行
    log('📋 运行测试...', 'yellow');
    execSync('npm run test', { stdio: 'inherit' });
    log('✅ 测试通过', 'green');

    return true;
  } catch (error) {
    log('❌ 验证失败，准备回滚', 'red');
    return false;
  }
}

// 回滚修复
function rollbackFix() {
  log('🔄 回滚修复...', 'yellow');
  try {
    execSync('git reset --hard HEAD~1', { stdio: 'inherit' });
    log('✅ 回滚成功', 'green');
    return true;
  } catch (error) {
    log('❌ 回滚失败', 'red');
    return false;
  }
}

// 主修复流程
function safeAutoFix() {
  log('🚀 开始安全自动化修复...', 'blue');

  // 1. 创建备份
  if (!createBackup()) {
    log('❌ 无法创建备份，终止修复', 'red');
    process.exit(1);
  }

  // 2. 查找需要修复的文件
  const filesToFix = [
    'components/admin/performance/MobilePerformance.tsx'
  ];

  let allFixed = true;

  // 3. 逐个修复文件
  filesToFix.forEach(file => {
    if (fs.existsSync(file)) {
      if (!safeFixHtmlEntities(file)) {
        allFixed = false;
      }
    }
  });

  if (!allFixed) {
    log('❌ 部分文件修复失败，回滚所有更改', 'red');
    rollbackFix();
    process.exit(1);
  }

  // 4. 验证修复结果
  if (!validateFix()) {
    log('❌ 修复验证失败，回滚所有更改', 'red');
    rollbackFix();
    process.exit(1);
  }

  log('🎉 安全自动化修复完成！', 'green');
  log('✅ 所有文件修复成功', 'green');
  log('✅ 所有验证通过', 'green');
  log('✅ 代码质量提升', 'green');
}

// 运行修复
if (require.main === module) {
  safeAutoFix();
}

module.exports = { safeAutoFix };
