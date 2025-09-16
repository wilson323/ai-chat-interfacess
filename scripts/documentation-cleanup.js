#!/usr/bin/env node

/**
 * 文档整理脚本
 * 清理重复文档，更新过时文档
 */

const fs = require('fs');
const path = require('path');

console.log('📚 开始文档整理...');

// 1. 扫描docs目录
function scanDocsDirectory() {
  const docsDir = 'docs';
  const files = [];

  function scanDir(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (item.endsWith('.md')) {
        files.push({
          path: fullPath,
          name: item,
          size: stat.size,
          mtime: stat.mtime,
          dir: dir
        });
      }
    });
  }

  if (fs.existsSync(docsDir)) {
    scanDir(docsDir);
  }

  return files;
}

// 2. 分析重复文档
function analyzeDuplicates(files) {
  const duplicates = [];
  const groups = {};

  files.forEach(file => {
    const key = file.name.toLowerCase();
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(file);
  });

  Object.keys(groups).forEach(key => {
    if (groups[key].length > 1) {
      duplicates.push({
        name: key,
        files: groups[key],
        count: groups[key].length
      });
    }
  });

  return duplicates;
}

// 3. 分析过时文档
function analyzeOutdated(files) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return files.filter(file => {
    return file.mtime < thirtyDaysAgo;
  }).sort((a, b) => a.mtime - b.mtime);
}

// 4. 生成整理建议
function generateCleanupSuggestions(duplicates, outdated) {
  const suggestions = [];

  // 处理重复文档
  duplicates.forEach(dup => {
    const files = dup.files.sort((a, b) => b.mtime - a.mtime);
    const keep = files[0]; // 保留最新的
    const remove = files.slice(1);

    suggestions.push({
      type: 'duplicate',
      action: 'merge_or_remove',
      keep: keep.path,
      remove: remove.map(f => f.path),
      reason: `发现 ${dup.count} 个重复文档: ${dup.name}`
    });
  });

  // 处理过时文档
  outdated.forEach(file => {
    suggestions.push({
      type: 'outdated',
      action: 'update_or_archive',
      file: file.path,
      reason: `文档超过30天未更新: ${file.name}`
    });
  });

  return suggestions;
}

// 5. 执行文档整理
function executeCleanup(suggestions) {
  let cleaned = 0;
  let errors = 0;

  console.log('\n🧹 执行文档整理...');

  suggestions.forEach(suggestion => {
    try {
      if (suggestion.type === 'duplicate') {
        console.log(`📝 处理重复文档: ${suggestion.keep}`);

        // 创建备份
        const backupDir = 'docs/backups';
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }

        // 移动重复文件到备份目录
        suggestion.remove.forEach(filePath => {
          const backupPath = path.join(backupDir, path.basename(filePath));
          fs.renameSync(filePath, backupPath);
          console.log(`  ✅ 已备份: ${filePath} -> ${backupPath}`);
          cleaned++;
        });
      } else if (suggestion.type === 'outdated') {
        console.log(`📅 标记过时文档: ${suggestion.file}`);
        // 在文件开头添加过时标记
        const content = fs.readFileSync(suggestion.file, 'utf8');
        if (!content.includes('⚠️ 此文档可能已过时')) {
          const updatedContent = `⚠️ **此文档可能已过时，最后更新于 ${new Date().toISOString().split('T')[0]}**\n\n${content}`;
          fs.writeFileSync(suggestion.file, updatedContent);
          console.log(`  ✅ 已添加过时标记`);
          cleaned++;
        }
      }
    } catch (error) {
      console.error(`  ❌ 处理失败: ${error.message}`);
      errors++;
    }
  });

  return { cleaned, errors };
}

// 6. 生成整理报告
function generateCleanupReport(files, duplicates, outdated, suggestions, results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: files.length,
      duplicates: duplicates.length,
      outdated: outdated.length,
      suggestions: suggestions.length,
      cleaned: results.cleaned,
      errors: results.errors
    },
    duplicates: duplicates.map(dup => ({
      name: dup.name,
      count: dup.count,
      files: dup.files.map(f => f.path)
    })),
    outdated: outdated.map(file => ({
      path: file.path,
      mtime: file.mtime.toISOString()
    })),
    suggestions: suggestions
  };

  fs.writeFileSync('documentation-cleanup-report.json', JSON.stringify(report, null, 2));

  console.log('\n📊 文档整理报告:');
  console.log(`  总文档数: ${files.length}`);
  console.log(`  重复文档组: ${duplicates.length}`);
  console.log(`  过时文档: ${outdated.length}`);
  console.log(`  处理建议: ${suggestions.length}`);
  console.log(`  已清理: ${results.cleaned}`);
  console.log(`  错误: ${results.errors}`);

  return report;
}

// 主函数
function main() {
  try {
    console.log('🔍 扫描文档目录...');
    const files = scanDocsDirectory();
    console.log(`找到 ${files.length} 个文档文件`);

    console.log('🔍 分析重复文档...');
    const duplicates = analyzeDuplicates(files);
    console.log(`发现 ${duplicates.length} 组重复文档`);

    console.log('🔍 分析过时文档...');
    const outdated = analyzeOutdated(files);
    console.log(`发现 ${outdated.length} 个过时文档`);

    console.log('💡 生成整理建议...');
    const suggestions = generateCleanupSuggestions(duplicates, outdated);

    console.log('🧹 执行文档整理...');
    const results = executeCleanup(suggestions);

    console.log('📊 生成整理报告...');
    const report = generateCleanupReport(files, duplicates, outdated, suggestions, results);

    console.log('\n✅ 文档整理完成');
    console.log('📄 详细报告已保存到: documentation-cleanup-report.json');

  } catch (error) {
    console.error('❌ 文档整理失败:', error.message);
    process.exit(1);
  }
}

main();
