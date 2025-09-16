/**
 * Lovart图片处理工具
 * 基于文件大小和特征对Lovart设计资源进行分类和切分
 */

const fs = require('fs');
const path = require('path');

// 图片分类规则
const IMAGE_CATEGORIES = {
  // 大文件 - 主要UI界面设计
  LARGE_UI: {
    minSize: 800000, // 800KB+
    maxSize: Infinity,
    category: 'ui-interface',
    description: '主要UI界面设计',
    subcategories: ['dashboard', 'settings', 'profile', 'chat-interface']
  },
  
  // 中文件 - 组件设计、图标集合
  MEDIUM_COMPONENT: {
    minSize: 400000, // 400KB - 800KB
    maxSize: 800000,
    category: 'components',
    description: '组件设计、图标集合',
    subcategories: ['buttons', 'cards', 'forms', 'navigation', 'modals']
  },
  
  // 小文件 - 单个图标、装饰元素
  SMALL_ICON: {
    minSize: 0, // < 400KB
    maxSize: 400000,
    category: 'icons',
    description: '单个图标、装饰元素',
    subcategories: ['action-icons', 'status-icons', 'decorative', 'logos']
  }
};

// 主题风格分类
const THEME_STYLES = {
  MODERN: {
    keywords: ['modern', 'minimal', 'clean', 'simple'],
    colorPalette: ['#6cb33f', '#8bc565', '#4a7c59'],
    style: '现代简约'
  },
  BUSINESS: {
    keywords: ['business', 'professional', 'corporate', 'formal'],
    colorPalette: ['#2c3e50', '#34495e', '#3498db'],
    style: '商务专业'
  },
  TECH: {
    keywords: ['tech', 'futuristic', 'digital', 'cyber'],
    colorPalette: ['#00d4ff', '#0099cc', '#ff6b35'],
    style: '科技未来'
  }
};

/**
 * 分析图片文件
 */
function analyzeImageFile(filePath, fileSize) {
  const fileName = path.basename(filePath);
  const fileExt = path.extname(fileName).toLowerCase();
  
  // 确定文件分类
  let category = 'unknown';
  let subcategory = 'general';
  
  for (const [key, config] of Object.entries(IMAGE_CATEGORIES)) {
    if (fileSize >= config.minSize && fileSize < config.maxSize) {
      category = config.category;
      subcategory = config.subcategories[0]; // 默认第一个子分类
      break;
    }
  }
  
  // 基于文件名推测主题风格
  let themeStyle = 'MODERN';
  const fileNameLower = fileName.toLowerCase();
  
  for (const [style, config] of Object.entries(THEME_STYLES)) {
    if (config.keywords.some(keyword => fileNameLower.includes(keyword))) {
      themeStyle = style;
      break;
    }
  }
  
  return {
    fileName,
    filePath,
    fileSize,
    category,
    subcategory,
    themeStyle,
    fileExt
  };
}

/**
 * 创建目录结构
 */
function createDirectoryStructure() {
  const baseDir = 'public/lovart-assets';
  const categories = ['ui-interface', 'components', 'icons'];
  const themes = ['modern', 'business', 'tech'];
  
  // 创建基础目录
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  
  // 创建分类目录
  categories.forEach(category => {
    const categoryDir = path.join(baseDir, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
    
    // 为每个分类创建主题子目录
    themes.forEach(theme => {
      const themeDir = path.join(categoryDir, theme);
      if (!fs.existsSync(themeDir)) {
        fs.mkdirSync(themeDir, { recursive: true });
      }
    });
  });
  
  console.log('✅ 目录结构创建完成');
}

/**
 * 处理Lovart图片文件
 */
function processLovartImages() {
  const lovartDir = 'Lovart';
  const outputDir = 'public/lovart-assets';
  
  if (!fs.existsSync(lovartDir)) {
    console.error('❌ Lovart目录不存在');
    return;
  }
  
  // 创建输出目录
  createDirectoryStructure();
  
  // 读取Lovart目录下的所有PNG文件
  const files = fs.readdirSync(lovartDir)
    .filter(file => file.toLowerCase().endsWith('.png'))
    .map(file => {
      const filePath = path.join(lovartDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: filePath,
        size: stats.size
      };
    });
  
  console.log(`📁 找到 ${files.length} 个PNG文件`);
  
  // 分析每个文件
  const analysisResults = files.map(file => analyzeImageFile(file.path, file.size));
  
  // 按分类统计
  const categoryStats = {};
  const themeStats = {};
  
  analysisResults.forEach(result => {
    // 分类统计
    if (!categoryStats[result.category]) {
      categoryStats[result.category] = 0;
    }
    categoryStats[result.category]++;
    
    // 主题统计
    if (!themeStats[result.themeStyle]) {
      themeStats[result.themeStyle] = 0;
    }
    themeStats[result.themeStyle]++;
  });
  
  // 生成处理报告
  generateProcessingReport(analysisResults, categoryStats, themeStats);
  
  // 复制文件到对应目录
  copyFilesToCategories(analysisResults, outputDir);
  
  // 生成资源映射文件
  generateResourceMapping(analysisResults, outputDir);
  
  console.log('🎉 Lovart图片处理完成！');
}

/**
 * 生成处理报告
 */
function generateProcessingReport(results, categoryStats, themeStats) {
  let report = '# Lovart图片处理报告\n\n';
  report += `处理时间: ${new Date().toISOString()}\n\n`;
  
  // 总体统计
  report += '## 总体统计\n\n';
  report += `- 总文件数: ${results.length}\n`;
  report += `- 总大小: ${(results.reduce((sum, r) => sum + r.fileSize, 0) / 1024 / 1024).toFixed(2)} MB\n\n`;
  
  // 分类统计
  report += '## 分类统计\n\n';
  for (const [category, count] of Object.entries(categoryStats)) {
    const config = Object.values(IMAGE_CATEGORIES).find(c => c.category === category);
    report += `- **${category}**: ${count} 个文件 (${config?.description || '未知'})\n`;
  }
  report += '\n';
  
  // 主题统计
  report += '## 主题风格统计\n\n';
  for (const [theme, count] of Object.entries(themeStats)) {
    const config = THEME_STYLES[theme];
    report += `- **${theme}**: ${count} 个文件 (${config?.style || '未知'})\n`;
  }
  report += '\n';
  
  // 详细文件列表
  report += '## 详细文件列表\n\n';
  const categories = ['ui-interface', 'components', 'icons'];
  
  categories.forEach(category => {
    const categoryFiles = results.filter(r => r.category === category);
    if (categoryFiles.length > 0) {
      report += `### ${category}\n\n`;
      categoryFiles.forEach(file => {
        report += `- **${file.fileName}** (${(file.fileSize / 1024).toFixed(1)} KB) - ${file.themeStyle}\n`;
      });
      report += '\n';
    }
  });
  
  // 保存报告
  const reportPath = 'docs/Lovart主题美化/image-processing-report.md';
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`📄 处理报告已保存到: ${reportPath}`);
}

/**
 * 复制文件到对应目录
 */
function copyFilesToCategories(results, outputDir) {
  console.log('📋 开始复制文件...');
  
  results.forEach(result => {
    const sourcePath = result.filePath;
    const targetDir = path.join(outputDir, result.category, result.themeStyle.toLowerCase());
    const targetPath = path.join(targetDir, result.fileName);
    
    try {
      // 确保目标目录存在
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // 复制文件
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ 复制: ${result.fileName} -> ${result.category}/${result.themeStyle.toLowerCase()}/`);
    } catch (error) {
      console.error(`❌ 复制失败: ${result.fileName}`, error.message);
    }
  });
}

/**
 * 生成资源映射文件
 */
function generateResourceMapping(results, outputDir) {
  const mapping = {
    categories: {},
    themes: {},
    files: results.map(result => ({
      fileName: result.fileName,
      originalPath: result.filePath,
      category: result.category,
      theme: result.themeStyle.toLowerCase(),
      size: result.fileSize,
      webPath: `/lovart-assets/${result.category}/${result.themeStyle.toLowerCase()}/${result.fileName}`
    }))
  };
  
  // 按分类组织
  results.forEach(result => {
    if (!mapping.categories[result.category]) {
      mapping.categories[result.category] = [];
    }
    mapping.categories[result.category].push(result.fileName);
  });
  
  // 按主题组织
  results.forEach(result => {
    const theme = result.themeStyle.toLowerCase();
    if (!mapping.themes[theme]) {
      mapping.themes[theme] = [];
    }
    mapping.themes[theme].push(result.fileName);
  });
  
  // 保存映射文件
  const mappingPath = path.join(outputDir, 'resource-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2), 'utf8');
  console.log(`📋 资源映射已保存到: ${mappingPath}`);
  
  // 生成TypeScript类型定义
  generateTypeDefinitions(mapping);
}

/**
 * 生成TypeScript类型定义
 */
function generateTypeDefinitions(mapping) {
  let typeDef = `/**
 * Lovart资源映射类型定义
 * 自动生成 - 请勿手动修改
 */

export interface LovartResource {
  fileName: string;
  originalPath: string;
  category: 'ui-interface' | 'components' | 'icons';
  theme: 'modern' | 'business' | 'tech';
  size: number;
  webPath: string;
}

export interface LovartResourceMapping {
  categories: Record<string, string[]>;
  themes: Record<string, string[]>;
  files: LovartResource[];
}

// 资源映射数据
export const lovartResourceMapping: LovartResourceMapping = ${JSON.stringify(mapping, null, 2)};

// 按分类获取资源
export function getResourcesByCategory(category: string): LovartResource[] {
  return mapping.files.filter(resource => resource.category === category);
}

// 按主题获取资源
export function getResourcesByTheme(theme: string): LovartResource[] {
  return mapping.files.filter(resource => resource.theme === theme);
}

// 获取特定分类和主题的资源
export function getResourcesByCategoryAndTheme(category: string, theme: string): LovartResource[] {
  return mapping.files.filter(resource => 
    resource.category === category && resource.theme === theme
  );
}
`;

  const typeDefPath = 'lib/theme/lovart-resources.ts';
  fs.writeFileSync(typeDefPath, typeDef, 'utf8');
  console.log(`📝 TypeScript类型定义已保存到: ${typeDefPath}`);
}

/**
 * 主函数
 */
function main() {
  console.log('🎨 开始处理Lovart图片资源...\n');
  
  try {
    processLovartImages();
    console.log('\n✅ 所有处理完成！');
  } catch (error) {
    console.error('\n❌ 处理过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  processLovartImages,
  analyzeImageFile,
  createDirectoryStructure
};