/**
 * 选择主题预览图片脚本
 * 从Lovart设计资源中选择合适的图片作为主题预览
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 开始选择主题预览图片...\n');

// 主题预览图片映射
const themePreviews = {
  modern: {
    name: '现代简约',
    keywords: ['modern', 'minimal', 'clean', 'simple', 'geometric'],
    selectedImages: [],
  },
  business: {
    name: '商务专业',
    keywords: ['business', 'professional', 'corporate', 'formal', 'suit'],
    selectedImages: [],
  },
  tech: {
    name: '科技未来',
    keywords: [
      'tech',
      'future',
      'robot',
      'astronaut',
      'space',
      'digital',
      'cyber',
    ],
    selectedImages: [],
  },
  nature: {
    name: '自然清新',
    keywords: ['nature', 'green', 'leaf', 'tree', 'flower', 'organic', 'eco'],
    selectedImages: [],
  },
  art: {
    name: '艺术创意',
    keywords: ['art', 'creative', 'colorful', 'abstract', 'artistic', 'design'],
    selectedImages: [],
  },
};

// 获取Lovart目录中的所有PNG文件
const lovartDir = path.join(__dirname, '..', 'Lovart');
const publicDir = path.join(__dirname, '..', 'public', 'theme-previews');

// 确保目录存在
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

try {
  const files = fs.readdirSync(lovartDir);
  const pngFiles = files.filter(file => file.endsWith('.png'));

  console.log(`📁 找到 ${pngFiles.length} 个PNG文件\n`);

  // 为每个主题选择预览图片
  Object.entries(themePreviews).forEach(([themeId, config]) => {
    console.log(`🎨 为 ${config.name} 主题选择预览图片...`);

    // 根据关键词筛选文件
    const relevantFiles = pngFiles.filter(file => {
      const fileName = file.toLowerCase();
      return config.keywords.some(keyword => fileName.includes(keyword));
    });

    if (relevantFiles.length > 0) {
      // 选择第一个相关文件作为预览
      const selectedFile = relevantFiles[0];
      const sourcePath = path.join(lovartDir, selectedFile);
      const targetPath = path.join(publicDir, `${themeId}-preview.png`);

      try {
        // 复制文件
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✅ 已选择: ${selectedFile} -> ${themeId}-preview.png`);
        config.selectedImages.push(selectedFile);
      } catch (error) {
        console.log(`❌ 复制失败: ${selectedFile} - ${error.message}`);
      }
    } else {
      console.log(`⚠️  未找到匹配的图片，将使用默认预览`);
    }
  });

  // 生成预览图片映射文件
  const previewMapping = {
    generatedAt: new Date().toISOString(),
    themes: {},
  };

  Object.entries(themePreviews).forEach(([themeId, config]) => {
    previewMapping.themes[themeId] = {
      name: config.name,
      previewImage: config.selectedImages[0] || null,
      localPath: `/theme-previews/${themeId}-preview.png`,
    };
  });

  // 保存映射文件
  const mappingPath = path.join(publicDir, 'preview-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(previewMapping, null, 2));
  console.log(`\n📄 已生成预览映射文件: ${mappingPath}`);

  // 更新主题配置中的预览路径
  console.log('\n🔄 更新主题配置...');
  const themesDir = path.join(__dirname, '..', 'lib', 'theme', 'themes');

  Object.keys(themePreviews).forEach(themeId => {
    const themeFile = path.join(themesDir, `${themeId}.ts`);
    if (fs.existsSync(themeFile)) {
      let content = fs.readFileSync(themeFile, 'utf8');

      // 更新预览路径
      const newPreviewPath = `/theme-previews/${themeId}-preview.png`;
      content = content.replace(
        /preview: '\/theme-previews\/[^']+'/,
        `preview: '${newPreviewPath}'`
      );

      fs.writeFileSync(themeFile, content);
      console.log(`✅ 已更新 ${themeId}.ts 预览路径`);
    }
  });

  console.log('\n🎉 主题预览图片选择完成！');
  console.log('\n📋 选择的预览图片:');
  Object.entries(themePreviews).forEach(([themeId, config]) => {
    if (config.selectedImages.length > 0) {
      console.log(`• ${config.name}: ${config.selectedImages[0]}`);
    } else {
      console.log(`• ${config.name}: 使用默认预览`);
    }
  });
} catch (error) {
  console.error('❌ 选择预览图片时出错:', error.message);
  process.exit(1);
}
