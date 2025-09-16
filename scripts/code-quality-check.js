#!/usr/bin/env node

/**
 * 代码质量检查脚本
 * 检查代码质量、性能、安全性等方面
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始代码质量检查...\n');

// 检查TypeScript严格模式
function checkTypeScriptStrictMode() {
  console.log('📝 检查TypeScript严格模式...');

  const tsconfigPath = './tsconfig.json';
  if (!fs.existsSync(tsconfigPath)) {
    console.log('❌ 未找到tsconfig.json');
    return false;
  }

  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  const options = tsconfig.compilerOptions || {};

  const strictOptions = [
    'strict',
    'noImplicitAny',
    'noImplicitReturns',
    'noImplicitThis',
    'noUnusedLocals',
    'noUnusedParameters',
    'exactOptionalPropertyTypes',
    'noImplicitOverride',
    'noPropertyAccessFromIndexSignature',
    'noUncheckedIndexedAccess',
  ];

  let allStrict = true;
  strictOptions.forEach(option => {
    if (options[option] !== true) {
      console.log(`⚠️  ${option}: ${options[option] || false} (建议: true)`);
      allStrict = false;
    }
  });

  if (allStrict) {
    console.log('✅ TypeScript严格模式配置完整');
  }

  return allStrict;
}

// 检查any类型使用
function checkAnyTypeUsage() {
  console.log('\n🚫 检查any类型使用...');

  const checkFile = filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let anyCount = 0;
    let anyLines = [];

    lines.forEach((line, index) => {
      // 检查any类型使用（排除注释和字符串）
      if (
        line.includes(': any') &&
        !line.trim().startsWith('//') &&
        !line.includes('"any"') &&
        !line.includes("'any'")
      ) {
        anyCount++;
        anyLines.push({
          line: index + 1,
          content: line.trim(),
        });
      }
    });

    return { anyCount, anyLines };
  };

  const checkDirectory = dir => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    let totalAnyCount = 0;
    let filesWithAny = [];

    files.forEach(file => {
      const filePath = path.join(dir, file.name);
      if (
        file.isDirectory() &&
        !file.name.startsWith('.') &&
        file.name !== 'node_modules'
      ) {
        const result = checkDirectory(filePath);
        totalAnyCount += result.totalAnyCount;
        filesWithAny.push(...result.filesWithAny);
      } else if (
        file.isFile() &&
        (file.name.endsWith('.ts') || file.name.endsWith('.tsx'))
      ) {
        const result = checkFile(filePath);
        if (result.anyCount > 0) {
          totalAnyCount += result.anyCount;
          filesWithAny.push({
            file: filePath,
            anyCount: result.anyCount,
            anyLines: result.anyLines,
          });
        }
      }
    });

    return { totalAnyCount, filesWithAny };
  };

  const result = checkDirectory('./app');
  const result2 = checkDirectory('./components');
  const result3 = checkDirectory('./lib');

  const totalAnyCount =
    result.totalAnyCount + result2.totalAnyCount + result3.totalAnyCount;
  const allFilesWithAny = [
    ...result.filesWithAny,
    ...result2.filesWithAny,
    ...result3.filesWithAny,
  ];

  if (totalAnyCount === 0) {
    console.log('✅ 未发现any类型使用');
    return true;
  } else {
    console.log(`⚠️  发现 ${totalAnyCount} 个any类型使用:`);
    allFilesWithAny.slice(0, 10).forEach(file => {
      console.log(`  - ${file.file}: ${file.anyCount} 个`);
      file.anyLines.slice(0, 3).forEach(line => {
        console.log(`    Line ${line.line}: ${line.content}`);
      });
    });
    if (allFilesWithAny.length > 10) {
      console.log(`    ... 还有 ${allFilesWithAny.length - 10} 个文件`);
    }
    return false;
  }
}

// 检查未使用的导入
function checkUnusedImports() {
  console.log('\n📦 检查未使用的导入...');

  const checkFile = filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let unusedImports = [];

    lines.forEach((line, index) => {
      if (
        line.trim().startsWith('import') &&
        line.includes('{') &&
        line.includes('}')
      ) {
        const importMatch = line.match(/import\s*{\s*([^}]+)\s*}\s*from/);
        if (importMatch) {
          const imports = importMatch[1].split(',').map(imp => imp.trim());
          imports.forEach(imp => {
            const variable = imp.split(' as ')[0].trim();
            if (
              variable &&
              !content.includes(variable) &&
              !content.includes(`<${variable}`)
            ) {
              unusedImports.push({
                line: index + 1,
                variable,
                content: line.trim(),
              });
            }
          });
        }
      }
    });

    return unusedImports;
  };

  const checkDirectory = dir => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    let allUnusedImports = [];

    files.forEach(file => {
      const filePath = path.join(dir, file.name);
      if (
        file.isDirectory() &&
        !file.name.startsWith('.') &&
        file.name !== 'node_modules'
      ) {
        allUnusedImports.push(...checkDirectory(filePath));
      } else if (
        file.isFile() &&
        (file.name.endsWith('.ts') || file.name.endsWith('.tsx'))
      ) {
        const unusedImports = checkFile(filePath);
        if (unusedImports.length > 0) {
          allUnusedImports.push({
            file: filePath,
            unusedImports,
          });
        }
      }
    });

    return allUnusedImports;
  };

  const result = checkDirectory('./app');
  const result2 = checkDirectory('./components');
  const result3 = checkDirectory('./lib');

  const allUnusedImports = [...result, ...result2, ...result3];

  if (allUnusedImports.length === 0) {
    console.log('✅ 未发现未使用的导入');
    return true;
  } else {
    console.log(`⚠️  发现未使用的导入:`);
    allUnusedImports.slice(0, 5).forEach(file => {
      console.log(`  - ${file.file}:`);
      file.unusedImports.slice(0, 3).forEach(imp => {
        console.log(`    Line ${imp.line}: ${imp.variable} in ${imp.content}`);
      });
    });
    if (allUnusedImports.length > 5) {
      console.log(`    ... 还有 ${allUnusedImports.length - 5} 个文件`);
    }
    return false;
  }
}

// 检查代码重复
function checkCodeDuplication() {
  console.log('\n🔄 检查代码重复...');

  const checkFile = filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim().length > 0);

    // 简单的重复检测：检查相同的行
    const lineCounts = {};
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.length > 20) {
        // 只检查较长的行
        lineCounts[trimmed] = (lineCounts[trimmed] || 0) + 1;
      }
    });

    const duplicates = Object.entries(lineCounts)
      .filter(([line, count]) => count > 3)
      .map(([line, count]) => ({ line, count }));

    return duplicates;
  };

  const checkDirectory = dir => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    let allDuplicates = [];

    files.forEach(file => {
      const filePath = path.join(dir, file.name);
      if (
        file.isDirectory() &&
        !file.name.startsWith('.') &&
        file.name !== 'node_modules'
      ) {
        allDuplicates.push(...checkDirectory(filePath));
      } else if (
        file.isFile() &&
        (file.name.endsWith('.ts') || file.name.endsWith('.tsx'))
      ) {
        const duplicates = checkFile(filePath);
        if (duplicates.length > 0) {
          allDuplicates.push({
            file: filePath,
            duplicates,
          });
        }
      }
    });

    return allDuplicates;
  };

  const result = checkDirectory('./app');
  const result2 = checkDirectory('./components');
  const result3 = checkDirectory('./lib');

  const allDuplicates = [...result, ...result2, ...result3];

  if (allDuplicates.length === 0) {
    console.log('✅ 未发现明显的代码重复');
    return true;
  } else {
    console.log(`⚠️  发现可能的代码重复:`);
    allDuplicates.slice(0, 3).forEach(file => {
      console.log(`  - ${file.file}:`);
      file.duplicates.slice(0, 2).forEach(dup => {
        console.log(
          `    "${dup.line.substring(0, 50)}..." 重复 ${dup.count} 次`
        );
      });
    });
    return false;
  }
}

// 检查性能问题
function checkPerformanceIssues() {
  console.log('\n⚡ 检查性能问题...');

  const checkFile = filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    // 检查可能的性能问题
    const performancePatterns = [
      { pattern: /\.map\(.*\.map\(/g, issue: '嵌套map操作' },
      { pattern: /for\s*\(.*for\s*\(/g, issue: '嵌套for循环' },
      { pattern: /\.filter\(.*\.map\(.*\.filter\(/g, issue: '链式数组操作' },
      { pattern: /JSON\.parse\(.*JSON\.stringify\(/g, issue: '深拷贝性能问题' },
      { pattern: /document\.querySelectorAll\(/g, issue: '大量DOM查询' },
      { pattern: /setInterval\(/g, issue: '定时器使用' },
      { pattern: /setTimeout\(/g, issue: '异步操作' },
    ];

    performancePatterns.forEach(({ pattern, issue }) => {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          issue,
          count: matches.length,
        });
      }
    });

    return issues;
  };

  const checkDirectory = dir => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    let allIssues = [];

    files.forEach(file => {
      const filePath = path.join(dir, file.name);
      if (
        file.isDirectory() &&
        !file.name.startsWith('.') &&
        file.name !== 'node_modules'
      ) {
        allIssues.push(...checkDirectory(filePath));
      } else if (
        file.isFile() &&
        (file.name.endsWith('.ts') || file.name.endsWith('.tsx'))
      ) {
        const issues = checkFile(filePath);
        if (issues.length > 0) {
          allIssues.push({
            file: filePath,
            issues,
          });
        }
      }
    });

    return allIssues;
  };

  const result = checkDirectory('./app');
  const result2 = checkDirectory('./components');
  const result3 = checkDirectory('./lib');

  const allIssues = [...result, ...result2, ...result3];

  if (allIssues.length === 0) {
    console.log('✅ 未发现明显的性能问题');
    return true;
  } else {
    console.log(`⚠️  发现可能的性能问题:`);
    allIssues.slice(0, 5).forEach(file => {
      console.log(`  - ${file.file}:`);
      file.issues.forEach(issue => {
        console.log(`    ${issue.issue}: ${issue.count} 次`);
      });
    });
    return false;
  }
}

// 主函数
function main() {
  const results = [
    checkTypeScriptStrictMode(),
    checkAnyTypeUsage(),
    checkUnusedImports(),
    checkCodeDuplication(),
    checkPerformanceIssues(),
  ];

  const passed = results.filter(Boolean).length;
  const total = results.length;

  console.log(`\n📊 代码质量检查完成: ${passed}/${total} 项通过`);

  if (passed === total) {
    console.log('🎉 代码质量优秀！所有检查都通过了。');
  } else {
    console.log('⚠️  发现一些问题，建议进行优化。');
  }

  return passed === total;
}

if (require.main === module) {
  main();
}

module.exports = {
  main,
  checkTypeScriptStrictMode,
  checkAnyTypeUsage,
  checkUnusedImports,
  checkCodeDuplication,
  checkPerformanceIssues,
};
