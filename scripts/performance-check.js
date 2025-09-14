#!/usr/bin/env node

/**
 * 性能检查脚本
 * 检查项目的性能指标和优化建议
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 开始性能检查...\n');

// 检查文件大小
function checkFileSizes() {
  console.log('📁 检查文件大小...');
  
  const checkDir = (dir, maxSize = 100 * 1024) => { // 100KB
    const files = fs.readdirSync(dir, { withFileTypes: true });
    let totalSize = 0;
    let largeFiles = [];
    
    files.forEach(file => {
      const filePath = path.join(dir, file.name);
      if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
        const { total, large } = checkDir(filePath, maxSize);
        totalSize += total;
        largeFiles.push(...large);
      } else if (file.isFile() && file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
        if (stats.size > maxSize) {
          largeFiles.push({
            file: filePath,
            size: stats.size,
            sizeKB: Math.round(stats.size / 1024)
          });
        }
      }
    });
    
    return { total: totalSize, large: largeFiles };
  };
  
  const { total, large } = checkDir('./app');
  
  console.log(`总代码大小: ${Math.round(total / 1024)}KB`);
  
  if (large.length > 0) {
    console.log('⚠️  发现大文件:');
    large.forEach(file => {
      console.log(`  - ${file.file}: ${file.sizeKB}KB`);
    });
  } else {
    console.log('✅ 所有文件大小正常');
  }
  
  return large.length === 0;
}

// 检查导入优化
function checkImports() {
  console.log('\n📦 检查导入优化...');
  
  const checkFile = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let issues = [];
    
    lines.forEach((line, index) => {
      // 检查是否有未使用的导入
      if (line.trim().startsWith('import') && line.includes('{') && line.includes('}')) {
        const importMatch = line.match(/import\s*{\s*([^}]+)\s*}\s*from/);
        if (importMatch) {
          const imports = importMatch[1].split(',').map(imp => imp.trim());
          // 简单检查：如果导入的变量在文件中没有使用
          imports.forEach(imp => {
            const variable = imp.split(' as ')[0].trim();
            if (variable && !content.includes(variable) && !content.includes(`<${variable}`)) {
              issues.push({
                file: filePath,
                line: index + 1,
                variable,
                type: 'unused-import'
              });
            }
          });
        }
      }
    });
    
    return issues;
  };
  
  const checkDirectory = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    let allIssues = [];
    
    files.forEach(file => {
      const filePath = path.join(dir, file.name);
      if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
        allIssues.push(...checkDirectory(filePath));
      } else if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.tsx'))) {
        allIssues.push(...checkFile(filePath));
      }
    });
    
    return allIssues;
  };
  
  const issues = checkDirectory('./app');
  
  if (issues.length > 0) {
    console.log('⚠️  发现导入问题:');
    issues.slice(0, 10).forEach(issue => {
      console.log(`  - ${issue.file}:${issue.line} 未使用的导入: ${issue.variable}`);
    });
    if (issues.length > 10) {
      console.log(`  ... 还有 ${issues.length - 10} 个问题`);
    }
  } else {
    console.log('✅ 导入优化良好');
  }
  
  return issues.length === 0;
}

// 检查TypeScript配置
function checkTypeScriptConfig() {
  console.log('\n🔧 检查TypeScript配置...');
  
  const tsconfigPath = './tsconfig.json';
  if (!fs.existsSync(tsconfigPath)) {
    console.log('❌ 未找到tsconfig.json');
    return false;
  }
  
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  const options = tsconfig.compilerOptions || {};
  
  const checks = [
    { key: 'strict', expected: true, name: '严格模式' },
    { key: 'noImplicitAny', expected: true, name: '禁止隐式any' },
    { key: 'noUnusedLocals', expected: true, name: '未使用局部变量检查' },
    { key: 'noUnusedParameters', expected: true, name: '未使用参数检查' },
  ];
  
  let allGood = true;
  checks.forEach(check => {
    if (options[check.key] !== check.expected) {
      console.log(`⚠️  ${check.name}: ${options[check.key] || false} (建议: ${check.expected})`);
      allGood = false;
    }
  });
  
  if (allGood) {
    console.log('✅ TypeScript配置优化良好');
  }
  
  return allGood;
}

// 检查依赖包
function checkDependencies() {
  console.log('\n📚 检查依赖包...');
  
  const packageJsonPath = './package.json';
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ 未找到package.json');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // 检查是否有重复的依赖
  const duplicateDeps = [];
  const depNames = Object.keys(deps);
  const uniqueNames = new Set(depNames);
  
  if (depNames.length !== uniqueNames.size) {
    console.log('⚠️  发现重复依赖');
  } else {
    console.log('✅ 依赖包配置正常');
  }
  
  // 检查关键依赖
  const criticalDeps = ['next', 'react', 'typescript'];
  const missingDeps = criticalDeps.filter(dep => !deps[dep]);
  
  if (missingDeps.length > 0) {
    console.log(`⚠️  缺少关键依赖: ${missingDeps.join(', ')}`);
    return false;
  }
  
  return true;
}

// 主函数
function main() {
  const results = [
    checkFileSizes(),
    checkImports(),
    checkTypeScriptConfig(),
    checkDependencies(),
  ];
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`\n📊 性能检查完成: ${passed}/${total} 项通过`);
  
  if (passed === total) {
    console.log('🎉 所有检查都通过了！项目性能配置良好。');
  } else {
    console.log('⚠️  发现一些问题，建议进行优化。');
  }
  
  return passed === total;
}

if (require.main === module) {
  main();
}

module.exports = { main, checkFileSizes, checkImports, checkTypeScriptConfig, checkDependencies };
