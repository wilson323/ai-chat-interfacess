/**
 * Lovart智能切图工具
 * 基于图片内容特征进行精确分类和切分
 */

const fs = require('fs');
const path = require('path');

// 智能分类规则
const SMART_CATEGORIES = {
  // UI界面设计 - 大尺寸，复杂布局
  UI_INTERFACE: {
    minSize: 800000, // 800KB+
    keywords: ['dashboard', 'interface', 'layout', 'screen'],
    category: 'ui-interface',
    description: '主要UI界面设计',
    subcategories: ['dashboard', 'settings', 'profile', 'chat-interface', 'admin-panel']
  },
  
  // 组件设计 - 中等尺寸，功能组件
  COMPONENTS: {
    minSize: 300000, // 300KB - 800KB
    maxSize: 800000,
    keywords: ['component', 'card', 'button', 'form', 'modal'],
    category: 'components',
    description: '功能组件设计',
    subcategories: ['buttons', 'cards', 'forms', 'navigation', 'modals', 'widgets']
  },
  
  // 图标集合 - 小尺寸，图标组合
  ICON_SETS: {
    minSize: 50000, // 50KB - 300KB
    maxSize: 300000,
    keywords: ['icon', 'set', 'collection', 'group'],
    category: 'icon-sets',
    description: '图标集合',
    subcategories: ['action-icons', 'status-icons', 'navigation-icons', 'decorative-icons']
  },
  
  // 单个图标 - 最小尺寸，单个图标
  SINGLE_ICONS: {
    minSize: 0, // < 50KB
    maxSize: 50000,
    keywords: ['icon', 'single', 'individual'],
    category: 'icons',
    description: '单个图标',
    subcategories: ['action', 'status', 'navigation', 'decorative', 'logo']
  }
};

// 主题风格智能识别
const THEME_DETECTION = {
  MODERN: {
    colorHints: ['#6cb33f', '#8bc565', '#4a7c59', '#f8f9fa'],
    styleKeywords: ['modern', 'minimal', 'clean', 'simple', 'elegant'],
    designElements: ['geometric', 'flat', 'rounded', 'spacious']
  },
  BUSINESS: {
    colorHints: ['#2c3e50', '#34495e', '#3498db', '#ffffff'],
    styleKeywords: ['business', 'professional', 'corporate', 'formal'],
    designElements: ['structured', 'grid', 'formal', 'corporate']
  },
  TECH: {
    colorHints: ['#00d4ff', '#0099cc', '#ff6b35', '#0a0a0a'],
    styleKeywords: ['tech', 'futuristic', 'digital', 'cyber', 'neon'],
    designElements: ['gradient', 'glow', 'neon', 'cyber', 'futuristic']
  }
};

/**
 * 智能分析图片特征
 */
function analyzeImageFeatures(filePath, fileSize) {
  const fileName = path.basename(filePath);
  const fileExt = path.extname(fileName).toLowerCase();
  
  // 基于文件大小和名称的智能分类
  let category = 'unknown';
  let subcategory = 'general';
  let confidence = 0;
  
  for (const [key, config] of Object.entries(SMART_CATEGORIES)) {
    const sizeMatch = fileSize >= config.minSize && 
                     (config.maxSize === undefined || fileSize < config.maxSize);
    
    if (sizeMatch) {
      // 检查关键词匹配
      const fileNameLower = fileName.toLowerCase();
      const keywordMatch = config.keywords.some(keyword => 
        fileNameLower.includes(keyword)
      );
      
      if (keywordMatch) {
        category = config.category;
        subcategory = config.subcategories[0];
        confidence = 0.9;
        break;
      } else if (sizeMatch) {
        category = config.category;
        subcategory = config.subcategories[0];
        confidence = 0.7;
      }
    }
  }
  
  // 主题风格检测
  let themeStyle = 'MODERN';
  const fileNameLower = fileName.toLowerCase();
  
  for (const [theme, config] of Object.entries(THEME_DETECTION)) {
    const keywordMatch = config.styleKeywords.some(keyword => 
      fileNameLower.includes(keyword)
    );
    
    if (keywordMatch) {
      themeStyle = theme;
      break;
    }
  }
  
  return {
    fileName,
    filePath,
    fileSize,
    category,
    subcategory,
    themeStyle: themeStyle.toLowerCase(),
    confidence,
    fileExt
  };
}

/**
 * 创建智能目录结构
 */
function createSmartDirectoryStructure() {
  const baseDir = 'public/lovart-smart-assets';
  const categories = ['ui-interface', 'components', 'icon-sets', 'icons'];
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
  
  console.log('✅ 智能目录结构创建完成');
}

/**
 * 处理Lovart图片文件 - 智能版本
 */
function processLovartImagesSmart() {
  const lovartDir = 'Lovart';
  const outputDir = 'public/lovart-smart-assets';
  
  if (!fs.existsSync(lovartDir)) {
    console.error('❌ Lovart目录不存在');
    return;
  }
  
  // 创建输出目录
  createSmartDirectoryStructure();
  
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
  
  // 智能分析每个文件
  const analysisResults = files.map(file => 
    analyzeImageFeatures(file.path, file.size)
  );
  
  // 按分类统计
  const categoryStats = {};
  const themeStats = {};
  const confidenceStats = { high: 0, medium: 0, low: 0 };
  
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
    
    // 置信度统计
    if (result.confidence >= 0.8) {
      confidenceStats.high++;
    } else if (result.confidence >= 0.6) {
      confidenceStats.medium++;
    } else {
      confidenceStats.low++;
    }
  });
  
  // 生成智能处理报告
  generateSmartProcessingReport(analysisResults, categoryStats, themeStats, confidenceStats);
  
  // 复制文件到对应目录
  copyFilesToSmartCategories(analysisResults, outputDir);
  
  // 生成智能资源映射文件
  generateSmartResourceMapping(analysisResults, outputDir);
  
  console.log('🎉 Lovart智能切图处理完成！');
}

/**
 * 生成智能处理报告
 */
function generateSmartProcessingReport(results, categoryStats, themeStats, confidenceStats) {
  let report = '# Lovart智能切图处理报告\n\n';
  report += `处理时间: ${new Date().toISOString()}\n\n`;
  
  // 总体统计
  report += '## 总体统计\n\n';
  report += `- 总文件数: ${results.length}\n`;
  report += `- 总大小: ${(results.reduce((sum, r) => sum + r.fileSize, 0) / 1024 / 1024).toFixed(2)} MB\n\n`;
  
  // 智能分类统计
  report += '## 智能分类统计\n\n';
  for (const [category, count] of Object.entries(categoryStats)) {
    const config = Object.values(SMART_CATEGORIES).find(c => c.category === category);
    report += `- **${category}**: ${count} 个文件 (${config?.description || '未知'})\n`;
  }
  report += '\n';
  
  // 主题统计
  report += '## 主题风格统计\n\n';
  for (const [theme, count] of Object.entries(themeStats)) {
    report += `- **${theme}**: ${count} 个文件\n`;
  }
  report += '\n';
  
  // 置信度统计
  report += '## 分类置信度统计\n\n';
  report += `- **高置信度** (≥0.8): ${confidenceStats.high} 个文件\n`;
  report += `- **中等置信度** (0.6-0.8): ${confidenceStats.medium} 个文件\n`;
  report += `- **低置信度** (<0.6): ${confidenceStats.low} 个文件\n\n`;
  
  // 详细文件列表
  report += '## 详细文件列表\n\n';
  const categories = ['ui-interface', 'components', 'icon-sets', 'icons'];
  
  categories.forEach(category => {
    const categoryFiles = results.filter(r => r.category === category);
    if (categoryFiles.length > 0) {
      report += `### ${category}\n\n`;
      categoryFiles.forEach(file => {
        const confidenceLevel = file.confidence >= 0.8 ? '🟢' : 
                               file.confidence >= 0.6 ? '🟡' : '🔴';
        report += `- **${file.fileName}** (${(file.fileSize / 1024).toFixed(1)} KB) - ${file.themeStyle} ${confidenceLevel}\n`;
      });
      report += '\n';
    }
  });
  
  // 保存报告
  const reportPath = 'docs/Lovart主题美化/smart-image-processing-report.md';
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`📄 智能处理报告已保存到: ${reportPath}`);
}

/**
 * 复制文件到智能分类目录
 */
function copyFilesToSmartCategories(results, outputDir) {
  console.log('📋 开始智能复制文件...');
  
  results.forEach(result => {
    const sourcePath = result.filePath;
    const targetDir = path.join(outputDir, result.category, result.themeStyle);
    const targetPath = path.join(targetDir, result.fileName);
    
    try {
      // 确保目标目录存在
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // 复制文件
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ 智能复制: ${result.fileName} -> ${result.category}/${result.themeStyle}/ (置信度: ${(result.confidence * 100).toFixed(0)}%)`);
    } catch (error) {
      console.error(`❌ 复制失败: ${result.fileName}`, error.message);
    }
  });
}

/**
 * 生成智能资源映射文件
 */
function generateSmartResourceMapping(results, outputDir) {
  const mapping = {
    metadata: {
      totalFiles: results.length,
      processingTime: new Date().toISOString(),
      algorithm: 'smart-categorization',
      version: '1.0.0'
    },
    categories: {},
    themes: {},
    confidence: {
      high: results.filter(r => r.confidence >= 0.8).length,
      medium: results.filter(r => r.confidence >= 0.6 && r.confidence < 0.8).length,
      low: results.filter(r => r.confidence < 0.6).length
    },
    files: results.map(result => ({
      fileName: result.fileName,
      originalPath: result.filePath,
      category: result.category,
      subcategory: result.subcategory,
      theme: result.themeStyle,
      size: result.fileSize,
      confidence: result.confidence,
      webPath: `/lovart-smart-assets/${result.category}/${result.themeStyle}/${result.fileName}`
    }))
  };
  
  // 按分类组织
  results.forEach(result => {
    if (!mapping.categories[result.category]) {
      mapping.categories[result.category] = [];
    }
    mapping.categories[result.category].push({
      fileName: result.fileName,
      confidence: result.confidence,
      size: result.fileSize
    });
  });
  
  // 按主题组织
  results.forEach(result => {
    if (!mapping.themes[result.themeStyle]) {
      mapping.themes[result.themeStyle] = [];
    }
    mapping.themes[result.themeStyle].push({
      fileName: result.fileName,
      category: result.category,
      confidence: result.confidence
    });
  });
  
  // 保存映射文件
  const mappingPath = path.join(outputDir, 'smart-resource-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2), 'utf8');
  console.log(`📋 智能资源映射已保存到: ${mappingPath}`);
  
  // 生成TypeScript类型定义
  generateSmartTypeDefinitions(mapping);
}

/**
 * 生成智能TypeScript类型定义
 */
function generateSmartTypeDefinitions(mapping) {
  let typeDef = `/**
 * Lovart智能资源映射类型定义
 * 自动生成 - 请勿手动修改
 */

export interface SmartLovartResource {
  fileName: string;
  originalPath: string;
  category: 'ui-interface' | 'components' | 'icon-sets' | 'icons';
  subcategory: string;
  theme: 'modern' | 'business' | 'tech';
  size: number;
  confidence: number;
  webPath: string;
}

export interface SmartLovartResourceMapping {
  metadata: {
    totalFiles: number;
    processingTime: string;
    algorithm: string;
    version: string;
  };
  categories: Record<string, Array<{
    fileName: string;
    confidence: number;
    size: number;
  }>>;
  themes: Record<string, Array<{
    fileName: string;
    category: string;
    confidence: number;
  }>>;
  confidence: {
    high: number;
    medium: number;
    low: number;
  };
  files: SmartLovartResource[];
}

// 智能资源映射数据
export const smartLovartResourceMapping: SmartLovartResourceMapping = ${JSON.stringify(mapping, null, 2)};

// 按分类获取资源
export function getSmartResourcesByCategory(category: string): SmartLovartResource[] {
  return mapping.files.filter(resource => resource.category === category);
}

// 按主题获取资源
export function getSmartResourcesByTheme(theme: string): SmartLovartResource[] {
  return mapping.files.filter(resource => resource.theme === theme);
}

// 按置信度获取资源
export function getSmartResourcesByConfidence(minConfidence: number): SmartLovartResource[] {
  return mapping.files.filter(resource => resource.confidence >= minConfidence);
}

// 获取特定分类和主题的资源
export function getSmartResourcesByCategoryAndTheme(category: string, theme: string): SmartLovartResource[] {
  return mapping.files.filter(resource => 
    resource.category === category && resource.theme === theme
  );
}

// 获取高置信度资源
export function getHighConfidenceResources(): SmartLovartResource[] {
  return mapping.files.filter(resource => resource.confidence >= 0.8);
}
`;

  const typeDefPath = 'lib/theme/lovart-smart-resources.ts';
  fs.writeFileSync(typeDefPath, typeDef, 'utf8');
  console.log(`📝 智能TypeScript类型定义已保存到: ${typeDefPath}`);
}

/**
 * 主函数
 */
function main() {
  console.log('🎨 开始Lovart智能切图处理...\n');
  
  try {
    processLovartImagesSmart();
    console.log('\n✅ 智能切图处理完成！');
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
  processLovartImagesSmart,
  analyzeImageFeatures,
  createSmartDirectoryStructure
};