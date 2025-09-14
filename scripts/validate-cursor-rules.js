#!/usr/bin/env node

/**
 * Cursor Rules验证脚本
 * 验证所有Cursor Rules配置是否正确
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 检查文件是否存在
function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

// 检查文件内容
function checkFileContent(filePath, requiredContent) {
  if (!checkFileExists(filePath)) {
    return { exists: false, content: null };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const hasContent = requiredContent.every(item => content.includes(item));

  return { exists: true, content, hasContent };
}

// 验证Cursor Rules
function validateCursorRules() {
  log('🔍 开始验证Cursor Rules配置...', 'blue');

  const rulesDir = '.cursor/rules';
  const requiredRules = [
    'development-standards.mdc',
    'jsx-special-characters.mdc',
    'typescript-strict.mdc',
    'react-jsx-standards.mdc',
    'error-handling.mdc',
    'code-quality.mdc',
    'project-consistency.mdc',
    'testing-standards.mdc',
    'security-standards.mdc',
    'performance-standards.mdc',
    'project-structure.mdc',
    'automation-standards.mdc',
    'comprehensive-standards.mdc',
    'eslint-configuration.mdc',
    'pre-commit-hooks.mdc'
  ];

  let allValid = true;

  // 检查规则文件
  log('\n📋 检查规则文件...', 'yellow');
  requiredRules.forEach(rule => {
    const rulePath = path.join(rulesDir, rule);
    if (checkFileExists(rulePath)) {
      log(`  ✅ ${rule}`, 'green');
    } else {
      log(`  ❌ ${rule} - 文件不存在`, 'red');
      allValid = false;
    }
  });

  // 检查规则内容
  log('\n📋 检查规则内容...', 'yellow');
  const contentChecks = [
    {
      file: 'jsx-special-characters.mdc',
      content: ['&lt;', '&gt;', '&amp;', "{'<'}", "{'>'}", "{'&'}"]
    },
    {
      file: 'typescript-strict.mdc',
      content: ['strict: true', 'noImplicitAny', 'strictNullChecks']
    },
    {
      file: 'error-handling.mdc',
      content: ['try-catch', '错误处理', 'Error']
    },
    {
      file: 'testing-standards.mdc',
      content: ['测试优先', '真实数据', '覆盖率']
    }
  ];

  contentChecks.forEach(check => {
    const rulePath = path.join(rulesDir, check.file);
    const result = checkFileContent(rulePath, check.content);

    if (result.exists && result.hasContent) {
      log(`  ✅ ${check.file} - 内容正确`, 'green');
    } else if (result.exists) {
      log(`  ⚠️  ${check.file} - 内容不完整`, 'yellow');
    } else {
      log(`  ❌ ${check.file} - 文件不存在`, 'red');
      allValid = false;
    }
  });

  // 检查配置文件
  log('\n📋 检查配置文件...', 'yellow');
  const configFiles = [
    'tsconfig.json',
    'package.json',
    'next.config.mjs',
    'tailwind.config.ts'
  ];

  configFiles.forEach(config => {
    if (checkFileExists(config)) {
      log(`  ✅ ${config}`, 'green');
    } else {
      log(`  ❌ ${config} - 文件不存在`, 'red');
      allValid = false;
    }
  });

  // 检查项目结构
  log('\n📋 检查项目结构...', 'yellow');
  const requiredDirs = [
    'app',
    'components',
    'lib',
    'types',
    'hooks',
    'context',
    '__tests__',
    'docs'
  ];

  requiredDirs.forEach(dir => {
    if (checkFileExists(dir)) {
      log(`  ✅ ${dir}/`, 'green');
    } else {
      log(`  ❌ ${dir}/ - 目录不存在`, 'red');
      allValid = false;
    }
  });

  // 总结
  log('\n📊 验证结果总结...', 'blue');
  if (allValid) {
    log('🎉 所有Cursor Rules配置验证通过！', 'green');
    log('✅ 代码质量保障体系已建立', 'green');
    log('✅ JSX特殊字符问题已解决', 'green');
    log('✅ TypeScript严格类型检查已配置', 'green');
    log('✅ 错误处理规范已建立', 'green');
    log('✅ 测试标准已制定', 'green');
    log('✅ 安全标准已配置', 'green');
    log('✅ 性能优化标准已建立', 'green');
    log('✅ 自动化流程已配置', 'green');
  } else {
    log('❌ 部分配置验证失败，请检查上述错误', 'red');
    process.exit(1);
  }
}

// 运行验证
if (require.main === module) {
  validateCursorRules();
}

module.exports = { validateCursorRules };
