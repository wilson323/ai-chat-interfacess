#!/usr/bin/env node

/**
 * 静态资源验证脚本
 * 检查项目中所有引用的静态资源是否存在
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const CONFIG = {
  publicDir: 'public',
  sourceDirs: ['app', 'components', 'lib'],
  resourceExtensions: ['.svg', '.png', '.ico', '.jpg', '.jpeg', '.gif'],
  excludePatterns: [
    /node_modules/,
    /\.next/,
    /\.git/,
    /\.vscode/,
    /\.idea/
  ]
};

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

/**
 * 获取所有源文件
 */
function getSourceFiles() {
  const files = [];

  for (const dir of CONFIG.sourceDirs) {
    if (fs.existsSync(dir)) {
      const dirFiles = getAllFiles(dir);
      files.push(...dirFiles);
    }
  }

  return files.filter(file => {
    const ext = path.extname(file);
    return ['.ts', '.tsx', '.js', '.jsx', '.json'].includes(ext);
  });
}

/**
 * 递归获取目录下所有文件
 */
function getAllFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!CONFIG.excludePatterns.some(pattern => pattern.test(fullPath))) {
        files.push(...getAllFiles(fullPath));
      }
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * 从文件中提取静态资源引用
 */
function extractResourceReferences(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const references = [];

  // 匹配各种资源引用模式
  const patterns = [
    // src="/path/to/resource.ext"
    /src=["']([^"']*\.(svg|png|ico|jpg|jpeg|gif))["']/g,
    // href="/path/to/resource.ext"
    /href=["']([^"']*\.(svg|png|ico|jpg|jpeg|gif))["']/g,
    // 在manifest.json中的引用
    /"src":\s*["']([^"']*\.(svg|png|ico|jpg|jpeg|gif))["']/g,
    // 在metadata中的引用
    /icon:\s*["']([^"']*\.(svg|png|ico|jpg|jpeg|gif))["']/g,
    // 在CSS中的引用
    /url\(["']?([^"')]*\.(svg|png|ico|jpg|jpeg|gif))["']?\)/g
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const resourcePath = match[1];
      if (resourcePath.startsWith('/')) {
        references.push({
          path: resourcePath,
          file: filePath,
          line: content.substring(0, match.index).split('\n').length
        });
      }
    }
  }

  return references;
}

/**
 * 检查资源文件是否存在
 */
function checkResourceExists(resourcePath) {
  const fullPath = path.join(CONFIG.publicDir, resourcePath);
  return fs.existsSync(fullPath);
}

/**
 * 获取public目录下的所有资源文件
 */
function getPublicResources() {
  const resources = [];

  if (fs.existsSync(CONFIG.publicDir)) {
    const files = getAllFiles(CONFIG.publicDir);
    for (const file of files) {
      const ext = path.extname(file);
      if (CONFIG.resourceExtensions.includes(ext)) {
        const relativePath = path.relative(CONFIG.publicDir, file);
        resources.push(`/${relativePath.replace(/\\/g, '/')}`);
      }
    }
  }

  return resources;
}

/**
 * 主验证函数
 */
function validateStaticResources() {
  log('🔍 开始验证静态资源...', 'blue');

  const sourceFiles = getSourceFiles();
  const allReferences = [];
  const missingResources = [];
  const unusedResources = [];

  // 收集所有资源引用
  for (const file of sourceFiles) {
    const references = extractResourceReferences(file);
    allReferences.push(...references);
  }

  // 检查引用的资源是否存在
  const uniqueReferences = [...new Set(allReferences.map(ref => ref.path))];
  for (const resourcePath of uniqueReferences) {
    if (!checkResourceExists(resourcePath)) {
      missingResources.push(resourcePath);
    }
  }

  // 检查未使用的资源
  const publicResources = getPublicResources();
  const usedResources = new Set(uniqueReferences);
  for (const resource of publicResources) {
    if (!usedResources.has(resource)) {
      unusedResources.push(resource);
    }
  }

  // 输出结果
  log('\n📊 验证结果:', 'blue');
  log(`总文件数: ${sourceFiles.length}`, 'reset');
  log(`资源引用数: ${allReferences.length}`, 'reset');
  log(`唯一资源数: ${uniqueReferences.length}`, 'reset');
  log(`公共资源数: ${publicResources.length}`, 'reset');

  // 缺失资源
  if (missingResources.length > 0) {
    log('\n❌ 缺失的资源文件:', 'red');
    for (const resource of missingResources) {
      log(`  - ${resource}`, 'red');

      // 显示引用位置
      const references = allReferences.filter(ref => ref.path === resource);
      for (const ref of references) {
        log(`    在 ${ref.file}:${ref.line}`, 'yellow');
      }
    }
  } else {
    log('\n✅ 所有引用的资源文件都存在', 'green');
  }

  // 未使用的资源
  if (unusedResources.length > 0) {
    log('\n⚠️  未使用的资源文件:', 'yellow');
    for (const resource of unusedResources) {
      log(`  - ${resource}`, 'yellow');
    }
  } else {
    log('\n✅ 没有未使用的资源文件', 'green');
  }

  // 返回验证结果
  return {
    success: missingResources.length === 0,
    missingResources,
    unusedResources,
    totalReferences: allReferences.length,
    totalResources: publicResources.length
  };
}

/**
 * 生成资源报告
 */
function generateResourceReport(result) {
  const report = {
    timestamp: new Date().toISOString(),
    success: result.success,
    missingResources: result.missingResources,
    unusedResources: result.unusedResources,
    totalReferences: result.totalReferences,
    totalResources: result.totalResources
  };

  const reportPath = 'static-resources-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📄 资源报告已生成: ${reportPath}`, 'blue');
}

// 主程序
if (require.main === module) {
  try {
    const result = validateStaticResources();
    generateResourceReport(result);

    if (!result.success) {
      log('\n❌ 静态资源验证失败', 'red');
      process.exit(1);
    } else {
      log('\n✅ 静态资源验证通过', 'green');
      process.exit(0);
    }
  } catch (error) {
    log(`\n💥 验证过程中发生错误: ${error.message}`, 'red');
    process.exit(1);
  }
}

module.exports = {
  validateStaticResources,
  generateResourceReport
};
