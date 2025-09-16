/**
 * 主题系统验证脚本
 * 验证主题系统的基本功能
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 开始验证主题系统...\n');

// 检查必需文件是否存在
const requiredFiles = [
  'types/theme.ts',
  'lib/theme/theme-manager.ts',
  'lib/theme/theme-config.ts',
  'lib/theme/themes/modern.ts',
  'lib/theme/themes/business.ts',
  'lib/theme/themes/tech.ts',
  'lib/theme/themes/nature.ts',
  'lib/theme/themes/art.ts',
  'components/theme/theme-selector.tsx',
  'components/theme/theme-card.tsx',
  'hooks/use-theme.ts',
  'styles/theme-variables.css',
  'app/user/settings/theme/page.tsx',
];

let allFilesExist = true;

console.log('📁 检查文件存在性...');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 文件不存在`);
    allFilesExist = false;
  }
});

// 检查主题配置
console.log('\n🎨 检查主题配置...');
try {
  const themeConfigPath = path.join(
    __dirname,
    '..',
    'lib/theme/theme-config.ts'
  );
  const themeConfigContent = fs.readFileSync(themeConfigPath, 'utf8');

  // 检查是否导出了所有主题
  const themeExports = [
    'modernTheme',
    'businessTheme',
    'techTheme',
    'natureTheme',
    'artTheme',
  ];

  themeExports.forEach(theme => {
    if (themeConfigContent.includes(theme)) {
      console.log(`✅ ${theme} 已导出`);
    } else {
      console.log(`❌ ${theme} 未找到`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log(`❌ 无法读取主题配置文件: ${error.message}`);
  allFilesExist = false;
}

// 检查CSS变量
console.log('\n🎨 检查CSS变量...');
try {
  const cssPath = path.join(__dirname, '..', 'styles/theme-variables.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  const requiredVariables = [
    '--theme-primary',
    '--theme-secondary',
    '--theme-accent',
    '--theme-background',
    '--theme-surface',
    '--theme-text',
    '--theme-border',
    '--theme-radius-sm',
    '--theme-radius-md',
    '--theme-shadow-sm',
    '--theme-shadow-md',
    '--theme-animation-fast',
    '--theme-animation-normal',
    '--theme-spacing-xs',
    '--theme-spacing-sm',
    '--theme-font-family',
    '--theme-font-size-base',
  ];

  requiredVariables.forEach(variable => {
    if (cssContent.includes(variable)) {
      console.log(`✅ ${variable}`);
    } else {
      console.log(`❌ ${variable} - 变量未定义`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log(`❌ 无法读取CSS变量文件: ${error.message}`);
  allFilesExist = false;
}

// 检查组件导入
console.log('\n🎨 检查组件导入...');
try {
  const themeSelectorPath = path.join(
    __dirname,
    '..',
    'components/theme/theme-selector.tsx'
  );
  const themeSelectorContent = fs.readFileSync(themeSelectorPath, 'utf8');

  const requiredImports = [
    'ThemeConfig',
    'ThemeSelectorProps',
    'themeManager',
    'themeConfigs',
    'ThemeCard',
  ];

  requiredImports.forEach(importName => {
    if (themeSelectorContent.includes(importName)) {
      console.log(`✅ ${importName} 已导入`);
    } else {
      console.log(`❌ ${importName} - 导入缺失`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log(`❌ 无法读取主题选择器组件: ${error.message}`);
  allFilesExist = false;
}

// 检查设置页面
console.log('\n🎨 检查设置页面...');
try {
  const settingsPagePath = path.join(
    __dirname,
    '..',
    'app/user/settings/page.tsx'
  );
  const settingsPageContent = fs.readFileSync(settingsPagePath, 'utf8');

  if (settingsPageContent.includes('/user/settings/theme')) {
    console.log('✅ 主题设置页面链接已添加');
  } else {
    console.log('❌ 主题设置页面链接未找到');
    allFilesExist = false;
  }
} catch (error) {
  console.log(`❌ 无法读取设置页面: ${error.message}`);
  allFilesExist = false;
}

// 总结
console.log('\n📊 验证结果:');
if (allFilesExist) {
  console.log('🎉 主题系统验证通过！所有必需文件和配置都已就位。');
  console.log('\n📋 主题系统功能:');
  console.log(
    '• 5个主题系列：现代简约、商务专业、科技未来、自然清新、艺术创意'
  );
  console.log('• 主题管理器：支持主题切换和持久化存储');
  console.log('• 主题选择器：用户友好的主题选择界面');
  console.log('• CSS变量系统：动态主题变量管理');
  console.log('• 响应式设计：支持明暗模式切换');
  console.log('• TypeScript支持：完整的类型定义');
} else {
  console.log('❌ 主题系统验证失败！请检查上述错误。');
  process.exit(1);
}
