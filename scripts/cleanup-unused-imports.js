#!/usr/bin/env node

/**
 * 清理未使用的导入和变量脚本
 * 自动检测并修复未使用的导入、变量等问题
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
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 清理未使用的导入
function cleanupUnusedImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;

    // 检查并移除未使用的 Optional 导入
    if (content.includes('import { DataTypes, Model, Optional } from \'sequelize\';')) {
      // 检查是否真的使用了 Optional
      const optionalUsage = content.match(/Optional</g);
      if (!optionalUsage || optionalUsage.length === 0) {
        newContent = newContent.replace(
          'import { DataTypes, Model, Optional } from \'sequelize\';',
          'import { DataTypes, Model } from \'sequelize\';'
        );
        modified = true;
        log(`  ✅ 移除未使用的 Optional 导入: ${filePath}`, 'green');
      }
    }

    // 检查并移除未使用的 Op 导入
    if (content.includes('import sequelize, { Op } from \'../sequelize\';')) {
      const opUsage = content.match(/Op\./g);
      if (!opUsage || opUsage.length === 0) {
        newContent = newContent.replace(
          'import sequelize, { Op } from \'../sequelize\';',
          'import sequelize from \'../sequelize\';'
        );
        modified = true;
        log(`  ✅ 移除未使用的 Op 导入: ${filePath}`, 'green');
      }
    }

    // 检查并移除未使用的 useState, useEffect, createElement 导入
    if (content.includes('import React, { useState, useEffect, createElement } from \'react\';')) {
      const reactHooksUsage = content.match(/(useState|useEffect|createElement)/g);
      if (!reactHooksUsage || reactHooksUsage.length === 0) {
        newContent = newContent.replace(
          'import React, { useState, useEffect, createElement } from \'react\';',
          'import React from \'react\';'
        );
        modified = true;
        log(`  ✅ 移除未使用的 React hooks 导入: ${filePath}`, 'green');
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, newContent);
      return true;
    }

    return false;
  } catch (error) {
    log(`  ❌ 处理文件失败: ${filePath} - ${error.message}`, 'red');
    return false;
  }
}

// 修复性能监控组件的导出冲突
function fixPerformanceMonitorExports() {
  const filePath = 'lib/performance/enhanced-monitor.ts';

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // 检查是否有重复导出
    const exportLines = content.split('\n').filter(line => line.includes('export'));
    const duplicateExports = [];

    exportLines.forEach((line, index) => {
      const match = line.match(/export\s+(?:type\s+)?(\w+)/);
      if (match) {
        const exportName = match[1];
        const otherOccurrences = exportLines.filter((otherLine, otherIndex) =>
          otherIndex !== index && otherLine.includes(exportName)
        );

        if (otherOccurrences.length > 0) {
          duplicateExports.push({ name: exportName, line: index + 1 });
        }
      }
    });

    if (duplicateExports.length > 0) {
      log(`  ⚠️  发现重复导出: ${duplicateExports.map(e => e.name).join(', ')}`, 'yellow');

      // 移除重复的导出声明
      let newContent = content;
      duplicateExports.forEach(dup => {
        const lines = newContent.split('\n');
        const duplicateLine = lines.find(line =>
          line.includes(`export {`) && line.includes(dup.name)
        );

        if (duplicateLine) {
          newContent = newContent.replace(duplicateLine + '\n', '');
          log(`  ✅ 移除重复导出: ${dup.name}`, 'green');
        }
      });

      fs.writeFileSync(filePath, newContent);
      return true;
    }

    return false;
  } catch (error) {
    log(`  ❌ 修复性能监控导出失败: ${error.message}`, 'red');
    return false;
  }
}

// 修复数据库模型类型问题
function fixDatabaseModelTypes() {
  const modelFiles = [
    'lib/db/models/user-geo.ts',
    'lib/db/models/operation-log.ts',
    'lib/db/models/user.ts',
    'lib/db/models/agent-config.ts',
    'lib/db/models/db-schema-approval.ts',
    'lib/db/models/ChatSession.ts',
    'lib/db/models/ChatMessage.ts',
    'lib/db/models/chat-history.ts',
    'lib/db/models/cad-history.ts'
  ];

  let fixedFiles = 0;

  modelFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      if (cleanupUnusedImports(filePath)) {
        fixedFiles++;
      }
    }
  });

  return fixedFiles;
}

// 修复类型导出问题
function fixTypeExports() {
  const files = [
    'lib/db/models/operation-log.ts',
    'lib/db/models/user.ts'
  ];

  let fixedFiles = 0;

  files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');

        // 修复 re-exporting 类型问题
        if (content.includes('export {') && content.includes('export type')) {
          // 将普通导出改为类型导出
          let newContent = content.replace(
            /export\s*{\s*(\w+),\s*(\w+),\s*(\w+)\s*};/g,
            'export type { $1, $2, $3 };'
          );

          if (newContent !== content) {
            fs.writeFileSync(filePath, newContent);
            log(`  ✅ 修复类型导出: ${filePath}`, 'green');
            fixedFiles++;
          }
        }
      } catch (error) {
        log(`  ❌ 修复类型导出失败: ${filePath} - ${error.message}`, 'red');
      }
    }
  });

  return fixedFiles;
}

// 主函数
function main() {
  log('🧹 开始清理未使用的导入和变量...', 'bold');
  log('=' .repeat(50), 'blue');

  let totalFixed = 0;

  // 修复性能监控导出冲突
  log('\n🔧 修复性能监控组件导出冲突...', 'cyan');
  if (fixPerformanceMonitorExports()) {
    totalFixed++;
  }

  // 修复数据库模型类型问题
  log('\n🗄️ 修复数据库模型类型问题...', 'cyan');
  const modelFixed = fixDatabaseModelTypes();
  totalFixed += modelFixed;
  log(`  📊 修复了 ${modelFixed} 个模型文件`, 'blue');

  // 修复类型导出问题
  log('\n📝 修复类型导出问题...', 'cyan');
  const typeFixed = fixTypeExports();
  totalFixed += typeFixed;
  log(`  📊 修复了 ${typeFixed} 个类型文件`, 'blue');

  // 运行类型检查验证修复结果
  log('\n🔍 验证修复结果...', 'cyan');
  try {
    execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    log('  ✅ TypeScript 编译通过', 'green');
  } catch (error) {
    log('  ❌ TypeScript 编译失败', 'red');
    console.log(error.stdout?.toString() || error.message);
  }

  log('\n' + '=' .repeat(50), 'blue');
  log(`🎉 清理完成！共修复了 ${totalFixed} 个问题`, 'green');
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  cleanupUnusedImports,
  fixPerformanceMonitorExports,
  fixDatabaseModelTypes,
  fixTypeExports
};
