#!/usr/bin/env node

/**
 * 批量修复模块导入路径脚本
 * 将所有错误的相对路径转换为正确的 @/ 路径别名
 */

const fs = require('fs');
const path = require('path');

// 需要修复的路径映射
const pathMappings = [
  {
    pattern: /\.\.\/\.\.\/\.\.\/lib\/utils\/logger/g,
    replacement: '@/lib/utils/logger'
  },
  {
    pattern: /\.\.\/\.\.\/\.\.\/lib\/services\/admin-agent-service/g,
    replacement: '@/lib/services/admin-agent-service'
  },
  {
    pattern: /\.\.\/\.\.\/\.\.\/lib\/api\/fastgpt/g,
    replacement: '@/lib/api/fastgpt'
  },
  {
    pattern: /\.\.\/\.\.\/\.\.\/types\/agent/g,
    replacement: '@/types/agent'
  },
  {
    pattern: /\.\.\/\.\.\/lib\/utils/g,
    replacement: '@/lib/utils'
  },
  {
    pattern: /\.\.\/\.\.\/types\/admin/g,
    replacement: '@/types/admin'
  },
  {
    pattern: /\.\.\/\.\.\/types\/analytics/g,
    replacement: '@/types/analytics'
  },
  {
    pattern: /\.\.\/\.\.\/lib\/performance/g,
    replacement: '@/lib/performance'
  },
  {
    pattern: /\.\.\/\.\.\/lib\/security/g,
    replacement: '@/lib/security'
  },
  {
    pattern: /\.\.\/ui\//g,
    replacement: '@/components/ui/'
  }
];

// 递归遍历目录
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (!f.startsWith('.') && f !== 'node_modules') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  });
}

// 修复单个文件
function fixFile(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  pathMappings.forEach(mapping => {
    if (content.match(mapping.pattern)) {
      content = content.replace(mapping.pattern, mapping.replacement);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

// 执行修复
console.log('开始批量修复模块导入路径...');
walkDir('./components', fixFile);
walkDir('./lib', fixFile);
walkDir('./app', fixFile);
console.log('修复完成！');