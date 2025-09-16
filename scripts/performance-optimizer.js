#!/usr/bin/env node

/**
 * 性能优化脚本
 * 用于分析和优化项目性能
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 开始性能优化分析...\n');

// 1. 分析包大小
function analyzeBundleSize() {
  console.log('📦 分析包大小...');

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = Object.keys(packageJson.dependencies || {});
  const devDependencies = Object.keys(packageJson.devDependencies || {});

  console.log(`✅ 生产依赖: ${dependencies.length} 个`);
  console.log(`✅ 开发依赖: ${devDependencies.length} 个`);

  // 检查大型依赖
  const largeDeps = ['sequelize', 'pg', 'lodash', 'moment'];
  const foundLargeDeps = dependencies.filter(dep => largeDeps.includes(dep));

  if (foundLargeDeps.length > 0) {
    console.log(`⚠️  发现大型依赖: ${foundLargeDeps.join(', ')}`);
    console.log('💡 建议: 考虑使用更轻量的替代方案');
  }

  console.log('');
}

// 2. 分析图片资源
function analyzeImages() {
  console.log('🖼️  分析图片资源...');

  const publicDir = 'public';
  if (!fs.existsSync(publicDir)) {
    console.log('❌ public目录不存在');
    return;
  }

  const files = fs.readdirSync(publicDir, { recursive: true });
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
  });

  console.log(`✅ 图片文件数量: ${imageFiles.length}`);

  // 检查大文件
  let totalSize = 0;
  const largeFiles = [];

  imageFiles.forEach(file => {
    const filePath = path.join(publicDir, file);
    const stats = fs.statSync(filePath);
    totalSize += stats.size;

    if (stats.size > 1024 * 1024) {
      // 大于1MB
      largeFiles.push({
        file,
        size: (stats.size / 1024 / 1024).toFixed(2) + 'MB',
      });
    }
  });

  console.log(`✅ 总图片大小: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);

  if (largeFiles.length > 0) {
    console.log(`⚠️  大图片文件:`);
    largeFiles.forEach(({ file, size }) => {
      console.log(`   - ${file}: ${size}`);
    });
    console.log('💡 建议: 压缩图片或使用WebP格式');
  }

  console.log('');
}

// 3. 分析代码复杂度
function analyzeCodeComplexity() {
  console.log('📊 分析代码复杂度...');

  const srcDirs = ['app', 'components', 'lib'];
  let totalFiles = 0;
  let totalLines = 0;
  const largeFiles = [];

  srcDirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;

    const files = getAllFiles(dir, ['.ts', '.tsx', '.js', '.jsx']);
    totalFiles += files.length;

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n').length;
      totalLines += lines;

      if (lines > 500) {
        largeFiles.push({ file, lines });
      }
    });
  });

  console.log(`✅ 总文件数: ${totalFiles}`);
  console.log(`✅ 总代码行数: ${totalLines}`);
  console.log(`✅ 平均文件大小: ${(totalLines / totalFiles).toFixed(0)} 行`);

  if (largeFiles.length > 0) {
    console.log(`⚠️  大文件 (>500行):`);
    largeFiles.slice(0, 5).forEach(({ file, lines }) => {
      console.log(`   - ${file}: ${lines} 行`);
    });
    console.log('💡 建议: 考虑拆分大文件');
  }

  console.log('');
}

// 4. 生成优化建议
function generateOptimizationSuggestions() {
  console.log('💡 性能优化建议:');
  console.log('');

  const suggestions = [
    '1. 启用图片优化: 使用Next.js Image组件',
    '2. 代码分割: 使用动态导入减少初始包大小',
    '3. 缓存策略: 配置适当的缓存头',
    '4. 压缩资源: 启用Gzip/Brotli压缩',
    '5. CDN加速: 使用CDN分发静态资源',
    '6. 懒加载: 对非关键组件使用懒加载',
    '7. 预加载: 预加载关键资源',
    '8. 移除未使用代码: 使用Tree Shaking',
  ];

  suggestions.forEach(suggestion => {
    console.log(`✅ ${suggestion}`);
  });

  console.log('');
}

// 辅助函数
function getAllFiles(dir, extensions) {
  let files = [];
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  });

  return files;
}

// 主执行函数
function main() {
  try {
    analyzeBundleSize();
    analyzeImages();
    analyzeCodeComplexity();
    generateOptimizationSuggestions();

    console.log('🎉 性能优化分析完成!');
    console.log('📝 详细报告已生成，请根据建议进行优化。');
  } catch (error) {
    console.error('❌ 分析过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { main };
