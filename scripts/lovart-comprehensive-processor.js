/**
 * Lovart全面资源处理器
 * 充分利用Lovart路径下的所有设计图资源
 */

const fs = require('fs');
const path = require('path');

// 获取所有PNG文件
function getAllPngFiles(dir) {
  const files = [];

  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.toLowerCase().endsWith('.png')) {
        files.push({
          name: item,
          path: fullPath,
          size: stat.size,
          relativePath: path.relative(dir, fullPath)
        });
      }
    }
  }

  scanDirectory(dir);
  return files;
}

// 智能分类所有资源
function classifyAllResources(files) {
  const categories = {
    'ui-interface': [],
    'components': [],
    'icons': [],
    'icon-sets': [],
    'illustrations': [],
    'backgrounds': [],
    'logos': [],
    'decorations': []
  };

  files.forEach(file => {
    const size = file.size;
    const name = file.name.toLowerCase();

    // 基于文件大小和名称进行更精确的分类
    if (size > 1000000) { // > 1MB - 大型UI界面
      categories['ui-interface'].push(file);
    } else if (size > 500000) { // 500KB - 1MB - 组件设计
      categories['components'].push(file);
    } else if (size > 100000) { // 100KB - 500KB - 插画或图标集合
      if (name.includes('set') || name.includes('collection') || name.includes('group')) {
        categories['icon-sets'].push(file);
      } else if (name.includes('illustration') || name.includes('art') || name.includes('drawing')) {
        categories['illustrations'].push(file);
      } else {
        categories['components'].push(file);
      }
    } else if (size > 50000) { // 50KB - 100KB - 中等图标
      if (name.includes('logo') || name.includes('brand')) {
        categories['logos'].push(file);
      } else {
        categories['icons'].push(file);
      }
    } else if (size > 10000) { // 10KB - 50KB - 小图标
      categories['icons'].push(file);
    } else { // < 10KB - 装饰元素
      categories['decorations'].push(file);
    }
  });

  return categories;
}

// 按主题风格分配资源
function assignToThemes(categories) {
  const themes = {
    'modern': {
      'ui-interface': [],
      'components': [],
      'icons': [],
      'icon-sets': [],
      'illustrations': [],
      'backgrounds': [],
      'logos': [],
      'decorations': []
    },
    'business': {
      'ui-interface': [],
      'components': [],
      'icons': [],
      'icon-sets': [],
      'illustrations': [],
      'backgrounds': [],
      'logos': [],
      'decorations': []
    },
    'tech': {
      'ui-interface': [],
      'components': [],
      'icons': [],
      'icon-sets': [],
      'illustrations': [],
      'backgrounds': [],
      'logos': [],
      'decorations': []
    },
    'nature': {
      'ui-interface': [],
      'components': [],
      'icons': [],
      'icon-sets': [],
      'illustrations': [],
      'backgrounds': [],
      'logos': [],
      'decorations': []
    },
    'art': {
      'ui-interface': [],
      'components': [],
      'icons': [],
      'icon-sets': [],
      'illustrations': [],
      'backgrounds': [],
      'logos': [],
      'decorations': []
    }
  };

  // 为每个主题分配资源
  Object.keys(categories).forEach(category => {
    const resources = categories[category];
    const themeNames = Object.keys(themes);

    // 平均分配资源到各个主题
    resources.forEach((resource, index) => {
      const themeIndex = index % themeNames.length;
      const themeName = themeNames[themeIndex];
      themes[themeName][category].push(resource);
    });
  });

  return themes;
}

// 创建完整的目录结构
function createDirectoryStructure(baseDir, themes) {
  Object.keys(themes).forEach(theme => {
    Object.keys(themes[theme]).forEach(category => {
      const dir = path.join(baseDir, 'lovart-comprehensive-assets', category, theme);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  });
}

// 复制资源到对应目录
function copyResources(themes, sourceDir, targetDir) {
  let totalCopied = 0;

  Object.keys(themes).forEach(theme => {
    Object.keys(themes[theme]).forEach(category => {
      const resources = themes[theme][category];

      resources.forEach(resource => {
        const sourcePath = resource.path;
        const targetPath = path.join(targetDir, 'lovart-comprehensive-assets', category, theme, resource.name);

        try {
          fs.copyFileSync(sourcePath, targetPath);
          totalCopied++;
          console.log(`✅ 复制: ${resource.name} -> ${category}/${theme}/`);
        } catch (error) {
          console.error(`❌ 复制失败: ${resource.name} - ${error.message}`);
        }
      });
    });
  });

  return totalCopied;
}

// 生成资源映射文件
function generateResourceMapping(themes) {
  const mapping = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalThemes: Object.keys(themes).length,
      totalCategories: Object.keys(themes[Object.keys(themes)[0]]).length
    },
    themes: {}
  };

  Object.keys(themes).forEach(theme => {
    mapping.themes[theme] = {};

    Object.keys(themes[theme]).forEach(category => {
      mapping.themes[theme][category] = themes[theme][category].map(resource => ({
        name: resource.name,
        path: `/lovart-comprehensive-assets/${category}/${theme}/${resource.name}`,
        size: resource.size,
        originalPath: resource.relativePath
      }));
    });
  });

  return mapping;
}

// 主处理函数
function processLovartResources() {
  console.log('🎨 开始Lovart全面资源处理...\n');

  const sourceDir = 'Lovart';
  const targetDir = 'public';

  // 获取所有PNG文件
  console.log('📁 扫描Lovart目录...');
  const allFiles = getAllPngFiles(sourceDir);
  console.log(`✅ 找到 ${allFiles.length} 个PNG文件\n`);

  // 分类资源
  console.log('🔍 智能分类资源...');
  const categories = classifyAllResources(allFiles);

  // 显示分类统计
  console.log('📊 分类统计:');
  Object.keys(categories).forEach(category => {
    console.log(`  ${category}: ${categories[category].length} 个文件`);
  });
  console.log();

  // 按主题分配资源
  console.log('🎯 按主题分配资源...');
  const themes = assignToThemes(categories);

  // 创建目录结构
  console.log('📁 创建目录结构...');
  createDirectoryStructure(targetDir, themes);
  console.log('✅ 目录结构创建完成\n');

  // 复制资源
  console.log('📋 开始复制资源...');
  const totalCopied = copyResources(themes, sourceDir, targetDir);
  console.log(`✅ 成功复制 ${totalCopied} 个文件\n`);

  // 生成资源映射
  console.log('📝 生成资源映射...');
  const mapping = generateResourceMapping(themes);
  const mappingPath = path.join(targetDir, 'lovart-comprehensive-assets', 'resource-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log(`✅ 资源映射已保存到: ${mappingPath}\n`);

  // 生成TypeScript类型定义
  console.log('🔧 生成TypeScript类型定义...');
  generateTypeScriptTypes(mapping, targetDir);
  console.log('✅ TypeScript类型定义已生成\n');

  // 生成处理报告
  console.log('📄 生成处理报告...');
  generateProcessingReport(themes, allFiles.length, totalCopied, targetDir);
  console.log('✅ 处理报告已生成\n');

  console.log('🎉 Lovart全面资源处理完成！');
  console.log(`📊 总计处理: ${allFiles.length} 个文件`);
  console.log(`📋 成功复制: ${totalCopied} 个文件`);
  console.log(`🎨 主题数量: ${Object.keys(themes).length}`);
  console.log(`📁 分类数量: ${Object.keys(categories).length}`);
}

// 生成TypeScript类型定义
function generateTypeScriptTypes(mapping, targetDir) {
  const typeDefinition = `/**
 * Lovart全面资源类型定义
 * 自动生成于: ${new Date().toISOString()}
 */

export interface LovartResource {
  name: string;
  path: string;
  size: number;
  originalPath: string;
}

export interface LovartThemeResources {
  'ui-interface': LovartResource[];
  'components': LovartResource[];
  'icons': LovartResource[];
  'icon-sets': LovartResource[];
  'illustrations': LovartResource[];
  'backgrounds': LovartResource[];
  'logos': LovartResource[];
  'decorations': LovartResource[];
}

export interface LovartResourceMapping {
  metadata: {
    generatedAt: string;
    totalThemes: number;
    totalCategories: number;
  };
  themes: {
    modern: LovartThemeResources;
    business: LovartThemeResources;
    tech: LovartThemeResources;
    nature: LovartThemeResources;
    art: LovartThemeResources;
  };
}

export const lovartResourceMapping: LovartResourceMapping = ${JSON.stringify(mapping, null, 2)};

export function getLovartResources(theme: keyof LovartResourceMapping['themes'], category: keyof LovartThemeResources): LovartResource[] {
  return lovartResourceMapping.themes[theme][category];
}

export function getAllLovartResources(theme: keyof LovartResourceMapping['themes']): LovartThemeResources {
  return lovartResourceMapping.themes[theme];
}

export function getLovartResourceStats() {
  const stats: Record<string, Record<string, number>> = {};

  Object.keys(lovartResourceMapping.themes).forEach(theme => {
    stats[theme] = {};
    Object.keys(lovartResourceMapping.themes[theme as keyof LovartResourceMapping['themes']]).forEach(category => {
      stats[theme][category] = lovartResourceMapping.themes[theme as keyof LovartResourceMapping['themes']][category as keyof LovartThemeResources].length;
    });
  });

  return stats;
}
`;

  const typePath = path.join(targetDir, 'lovart-comprehensive-assets', 'types.ts');
  fs.writeFileSync(typePath, typeDefinition);
}

// 生成处理报告
function generateProcessingReport(themes, totalFiles, totalCopied, targetDir) {
  const report = `# Lovart全面资源处理报告

处理时间: ${new Date().toISOString()}

## 总体统计

- 总文件数: ${totalFiles}
- 成功复制: ${totalCopied}
- 处理成功率: ${((totalCopied / totalFiles) * 100).toFixed(1)}%

## 主题资源分布

${Object.keys(themes).map(theme => {
  const themeResources = themes[theme];
  const totalResources = Object.values(themeResources).reduce((sum, resources) => sum + resources.length, 0);

  return `### ${theme} 主题 (${totalResources} 个资源)

${Object.keys(themeResources).map(category => {
  const resources = themeResources[category];
  return `- **${category}**: ${resources.length} 个文件`;
}).join('\n')}`;
}).join('\n\n')}

## 资源分类说明

- **ui-interface**: 大型UI界面设计 (>1MB)
- **components**: 功能组件设计 (500KB-1MB)
- **icons**: 单个图标 (<100KB)
- **icon-sets**: 图标集合 (100KB-500KB)
- **illustrations**: 插画设计 (100KB-500KB)
- **backgrounds**: 背景设计
- **logos**: 品牌标识
- **decorations**: 装饰元素 (<10KB)

## 使用方式

\`\`\`typescript
import { getLovartResources, getAllLovartResources } from '@/public/lovart-comprehensive-assets/types';

// 获取特定主题和分类的资源
const modernIcons = getLovartResources('modern', 'icons');

// 获取特定主题的所有资源
const modernResources = getAllLovartResources('modern');
\`\`\`

## 文件结构

\`\`\`
public/lovart-comprehensive-assets/
├── types.ts                    # TypeScript类型定义
├── resource-mapping.json       # 资源映射文件
├── ui-interface/              # UI界面设计
│   ├── modern/
│   ├── business/
│   ├── tech/
│   ├── nature/
│   └── art/
├── components/                # 功能组件
│   ├── modern/
│   ├── business/
│   ├── tech/
│   ├── nature/
│   └── art/
├── icons/                     # 单个图标
│   ├── modern/
│   ├── business/
│   ├── tech/
│   ├── nature/
│   └── art/
├── icon-sets/                 # 图标集合
│   ├── modern/
│   ├── business/
│   ├── tech/
│   ├── nature/
│   └── art/
├── illustrations/             # 插画设计
│   ├── modern/
│   ├── business/
│   ├── tech/
│   ├── nature/
│   └── art/
├── backgrounds/               # 背景设计
│   ├── modern/
│   ├── business/
│   ├── tech/
│   ├── nature/
│   └── art/
├── logos/                     # 品牌标识
│   ├── modern/
│   ├── business/
│   ├── tech/
│   ├── nature/
│   └── art/
└── decorations/               # 装饰元素
    ├── modern/
    ├── business/
    ├── tech/
    ├── nature/
    └── art/
\`\`\`

## 总结

Lovart全面资源处理成功完成，充分利用了所有可用的设计图资源，为不同主题提供了丰富的视觉元素支持。
`;

  const reportPath = path.join(targetDir, 'lovart-comprehensive-assets', 'processing-report.md');
  fs.writeFileSync(reportPath, report);
}

// 运行处理
processLovartResources();
