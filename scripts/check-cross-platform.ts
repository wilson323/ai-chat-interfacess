#!/usr/bin/env tsx

/**
 * 跨多端兼容性检查脚本
 * 检查移动端、PC浏览器、响应式设计等兼容性
 */

import fs from 'fs';
import path from 'path';

interface CompatibilityCheck {
  category: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  recommendation?: string;
}

interface CrossPlatformOptions {
  checkCSS?: boolean;
  checkJS?: boolean;
  checkHTML?: boolean;
  checkResponsive?: boolean;
  checkBrowserSupport?: boolean;
  generateReport?: boolean;
  verbose?: boolean;
}

class CrossPlatformChecker {
  private options: CrossPlatformOptions;
  private checks: CompatibilityCheck[] = [];

  constructor(options: CrossPlatformOptions = {}) {
    this.options = {
      checkCSS: true,
      checkJS: true,
      checkHTML: true,
      checkResponsive: true,
      checkBrowserSupport: true,
      generateReport: true,
      verbose: false,
      ...options,
    };
  }

  /**
   * 添加检查结果
   */
  private addCheck(
    category: string,
    status: 'pass' | 'fail' | 'warning',
    message: string,
    recommendation?: string
  ): void {
    this.checks.push({ category, status, message, recommendation });
  }

  /**
   * 检查CSS兼容性
   */
  checkCSSCompatibility(): void {
    console.log('🎨 检查CSS兼容性...');

    const cssFiles = ['app/globals.css', 'styles/globals.css'];

    for (const file of cssFiles) {
      if (!fs.existsSync(file)) continue;

      const content = fs.readFileSync(file, 'utf8');

      // 检查CSS变量使用
      if (content.includes('var(--')) {
        this.addCheck('CSS变量', 'pass', '✓ 使用CSS变量，支持现代浏览器');
      }

      // 检查Flexbox使用
      if (content.includes('display: flex') || content.includes('flex:')) {
        this.addCheck('Flexbox', 'pass', '✓ 使用Flexbox布局');
      }

      // 检查Grid使用
      if (content.includes('display: grid') || content.includes('grid:')) {
        this.addCheck('CSS Grid', 'pass', '✓ 使用CSS Grid布局');
      }

      // 检查媒体查询
      if (content.includes('@media')) {
        this.addCheck('响应式设计', 'pass', '✓ 使用媒体查询实现响应式设计');
      }

      // 检查backdrop-filter支持
      if (content.includes('backdrop-filter')) {
        this.addCheck(
          'Backdrop Filter',
          'warning',
          '⚠️ 使用backdrop-filter，需要检查浏览器支持',
          '考虑添加fallback'
        );
      }

      // 检查CSS Grid的fallback
      if (
        content.includes('display: grid') &&
        !content.includes('display: -ms-grid')
      ) {
        this.addCheck(
          'CSS Grid Fallback',
          'warning',
          '⚠️ CSS Grid缺少IE fallback',
          '考虑添加-ms-grid fallback'
        );
      }
    }
  }

  /**
   * 检查JavaScript兼容性
   */
  checkJSCompatibility(): void {
    console.log('⚡ 检查JavaScript兼容性...');

    // 检查TypeScript配置
    if (fs.existsSync('tsconfig.json')) {
      const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));

      if (
        tsConfig.compilerOptions?.target === 'ES6' ||
        tsConfig.compilerOptions?.target === 'ES2015'
      ) {
        this.addCheck(
          'TypeScript Target',
          'pass',
          '✓ TypeScript目标为ES6，支持现代浏览器'
        );
      } else if (tsConfig.compilerOptions?.target === 'ES5') {
        this.addCheck(
          'TypeScript Target',
          'warning',
          '⚠️ TypeScript目标为ES5，可能影响性能',
          '考虑升级到ES6+'
        );
      }
    }

    // 检查package.json中的浏览器支持
    if (fs.existsSync('package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

      if (packageJson.browserslist) {
        this.addCheck('Browserslist', 'pass', '✓ 配置了browserslist');
      } else {
        this.addCheck(
          'Browserslist',
          'warning',
          '⚠️ 未配置browserslist',
          '建议添加browserslist配置'
        );
      }
    }

    // 检查现代JavaScript特性使用
    const jsFiles = this.findJSFiles();
    let hasModernJS = false;

    for (const file of jsFiles) {
      const content = fs.readFileSync(file, 'utf8');

      if (content.includes('const ') || content.includes('let ')) {
        hasModernJS = true;
      }

      if (content.includes('async ') || content.includes('await ')) {
        this.addCheck('Async/Await', 'pass', '✓ 使用async/await');
      }

      if (content.includes('=>')) {
        this.addCheck('Arrow Functions', 'pass', '✓ 使用箭头函数');
      }
    }

    if (hasModernJS) {
      this.addCheck('现代JavaScript', 'pass', '✓ 使用现代JavaScript特性');
    }
  }

  /**
   * 检查HTML兼容性
   */
  checkHTMLCompatibility(): void {
    console.log('📄 检查HTML兼容性...');

    const htmlFiles = this.findHTMLFiles();

    for (const file of htmlFiles) {
      const content = fs.readFileSync(file, 'utf8');

      // 检查viewport meta标签
      if (content.includes('viewport')) {
        this.addCheck('Viewport Meta', 'pass', '✓ 包含viewport meta标签');
      } else {
        this.addCheck(
          'Viewport Meta',
          'fail',
          '❌ 缺少viewport meta标签',
          '添加 <meta name="viewport" content="width=device-width, initial-scale=1">'
        );
      }

      // 检查charset声明
      if (content.includes('charset') || content.includes('UTF-8')) {
        this.addCheck('字符编码', 'pass', '✓ 声明了字符编码');
      }

      // 检查语义化HTML
      if (
        content.includes('<main>') ||
        content.includes('<header>') ||
        content.includes('<nav>')
      ) {
        this.addCheck('语义化HTML', 'pass', '✓ 使用语义化HTML标签');
      }

      // 检查无障碍支持
      if (content.includes('aria-') || content.includes('role=')) {
        this.addCheck('无障碍支持', 'pass', '✓ 包含ARIA属性');
      } else {
        this.addCheck(
          '无障碍支持',
          'warning',
          '⚠️ 缺少ARIA属性',
          '考虑添加无障碍支持'
        );
      }
    }
  }

  /**
   * 检查响应式设计
   */
  checkResponsiveDesign(): void {
    console.log('📱 检查响应式设计...');

    // 检查Tailwind配置
    if (fs.existsSync('tailwind.config.ts')) {
      const tailwindConfig = fs.readFileSync('tailwind.config.ts', 'utf8');

      if (tailwindConfig.includes('screens:')) {
        this.addCheck('响应式断点', 'pass', '✓ 配置了响应式断点');
      }

      if (
        tailwindConfig.includes('xs:') ||
        tailwindConfig.includes('sm:') ||
        tailwindConfig.includes('md:')
      ) {
        this.addCheck('移动端断点', 'pass', '✓ 配置了移动端断点');
      }
    }

    // 检查响应式组件
    const componentFiles = this.findComponentFiles();
    let hasResponsiveComponents = false;

    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf8');

      if (
        content.includes('useResponsive') ||
        content.includes('useMobile') ||
        content.includes('isMobile')
      ) {
        hasResponsiveComponents = true;
      }

      if (
        content.includes('sm:') ||
        content.includes('md:') ||
        content.includes('lg:')
      ) {
        hasResponsiveComponents = true;
      }
    }

    if (hasResponsiveComponents) {
      this.addCheck('响应式组件', 'pass', '✓ 使用响应式组件和类名');
    } else {
      this.addCheck(
        '响应式组件',
        'warning',
        '⚠️ 缺少响应式组件',
        '考虑添加响应式设计'
      );
    }

    // 检查移动端导航
    if (fs.existsSync('components/mobile-nav.tsx')) {
      this.addCheck('移动端导航', 'pass', '✓ 包含移动端导航组件');
    } else {
      this.addCheck(
        '移动端导航',
        'warning',
        '⚠️ 缺少移动端导航',
        '考虑添加移动端导航'
      );
    }
  }

  /**
   * 检查浏览器支持
   */
  checkBrowserSupport(): void {
    console.log('🌐 检查浏览器支持...');

    // 检查Polyfill使用
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    if (dependencies['core-js'] || dependencies['@babel/polyfill']) {
      this.addCheck('Polyfill', 'pass', '✓ 包含Polyfill支持');
    } else {
      this.addCheck(
        'Polyfill',
        'warning',
        '⚠️ 未包含Polyfill',
        '考虑添加core-js或babel-polyfill'
      );
    }

    // 检查Next.js配置
    if (fs.existsSync('next.config.mjs')) {
      const nextConfig = fs.readFileSync('next.config.mjs', 'utf8');

      if (nextConfig.includes('transpilePackages')) {
        this.addCheck('包转译', 'pass', '✓ 配置了包转译');
      }

      if (nextConfig.includes("output: 'standalone'")) {
        this.addCheck('Standalone模式', 'pass', '✓ 启用standalone模式');
      }
    }

    // 检查TypeScript配置
    if (fs.existsSync('tsconfig.json')) {
      const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));

      if (tsConfig.compilerOptions?.lib?.includes('dom')) {
        this.addCheck('DOM支持', 'pass', '✓ 包含DOM库支持');
      }

      if (
        tsConfig.compilerOptions?.target === 'ES6' ||
        tsConfig.compilerOptions?.target === 'ES2015'
      ) {
        this.addCheck('ES6支持', 'pass', '✓ 支持ES6特性');
      }
    }
  }

  /**
   * 查找JavaScript文件
   */
  private findJSFiles(): string[] {
    const files: string[] = [];
    const extensions = ['.js', '.jsx', '.ts', '.tsx'];

    const searchDir = (dir: string) => {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (
          stat.isDirectory() &&
          !item.startsWith('.') &&
          item !== 'node_modules'
        ) {
          searchDir(fullPath);
        } else if (
          stat.isFile() &&
          extensions.some(ext => item.endsWith(ext))
        ) {
          files.push(fullPath);
        }
      }
    };

    searchDir('.');
    return files.slice(0, 10); // 限制检查文件数量
  }

  /**
   * 查找HTML文件
   */
  private findHTMLFiles(): string[] {
    const files: string[] = [];
    const extensions = ['.html', '.htm'];

    const searchDir = (dir: string) => {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (
          stat.isDirectory() &&
          !item.startsWith('.') &&
          item !== 'node_modules'
        ) {
          searchDir(fullPath);
        } else if (
          stat.isFile() &&
          extensions.some(ext => item.endsWith(ext))
        ) {
          files.push(fullPath);
        }
      }
    };

    searchDir('.');
    return files;
  }

  /**
   * 查找组件文件
   */
  private findComponentFiles(): string[] {
    const files: string[] = [];
    const extensions = ['.tsx', '.jsx'];

    const searchDir = (dir: string) => {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (
          stat.isDirectory() &&
          !item.startsWith('.') &&
          item !== 'node_modules'
        ) {
          searchDir(fullPath);
        } else if (
          stat.isFile() &&
          extensions.some(ext => item.endsWith(ext))
        ) {
          files.push(fullPath);
        }
      }
    };

    searchDir('components');
    return files.slice(0, 20); // 限制检查文件数量
  }

  /**
   * 生成兼容性报告
   */
  generateCompatibilityReport(): string {
    const report = [];
    report.push('# 跨多端兼容性检查报告\n');
    report.push(`生成时间: ${new Date().toISOString()}\n`);

    // 按类别分组检查结果
    const categories = [...new Set(this.checks.map(c => c.category))];

    for (const category of categories) {
      const categoryChecks = this.checks.filter(c => c.category === category);
      const passCount = categoryChecks.filter(c => c.status === 'pass').length;
      const failCount = categoryChecks.filter(c => c.status === 'fail').length;
      const warningCount = categoryChecks.filter(
        c => c.status === 'warning'
      ).length;

      report.push(`## ${category}`);
      report.push(`- ✅ 通过: ${passCount}`);
      report.push(`- ❌ 失败: ${failCount}`);
      report.push(`- ⚠️ 警告: ${warningCount}\n`);

      for (const check of categoryChecks) {
        const icon =
          check.status === 'pass'
            ? '✅'
            : check.status === 'fail'
              ? '❌'
              : '⚠️';
        report.push(`- ${icon} ${check.message}`);
        if (check.recommendation) {
          report.push(`  - 建议: ${check.recommendation}`);
        }
      }
      report.push('');
    }

    // 总结
    const totalPass = this.checks.filter(c => c.status === 'pass').length;
    const totalFail = this.checks.filter(c => c.status === 'fail').length;
    const totalWarning = this.checks.filter(c => c.status === 'warning').length;

    report.push('## 总结');
    report.push(`- 总检查项: ${this.checks.length}`);
    report.push(`- 通过: ${totalPass}`);
    report.push(`- 失败: ${totalFail}`);
    report.push(`- 警告: ${totalWarning}`);

    if (totalFail === 0) {
      report.push('\n🎉 所有兼容性检查都通过了！');
    } else {
      report.push(`\n❌ 有 ${totalFail} 个兼容性问题需要修复。`);
    }

    // 添加改进建议
    report.push('\n## 改进建议');
    report.push('1. 添加browserslist配置以明确支持的浏览器');
    report.push('2. 考虑添加CSS Grid的IE fallback');
    report.push('3. 添加更多ARIA属性以改善无障碍支持');
    report.push('4. 考虑添加Service Worker以支持离线功能');
    report.push('5. 添加PWA支持以改善移动端体验');

    return report.join('\n');
  }

  /**
   * 执行所有兼容性检查
   */
  async runAllChecks(): Promise<void> {
    console.log('🚀 开始跨多端兼容性检查...\n');

    try {
      if (this.options.checkCSS) {
        this.checkCSSCompatibility();
      }

      if (this.options.checkJS) {
        this.checkJSCompatibility();
      }

      if (this.options.checkHTML) {
        this.checkHTMLCompatibility();
      }

      if (this.options.checkResponsive) {
        this.checkResponsiveDesign();
      }

      if (this.options.checkBrowserSupport) {
        this.checkBrowserSupport();
      }

      // 生成报告
      if (this.options.generateReport) {
        const report = this.generateCompatibilityReport();
        console.log('\n' + report);

        // 保存报告到文件
        const reportPath = 'cross-platform-compatibility-report.md';
        fs.writeFileSync(reportPath, report);
        console.log(`\n📄 报告已保存到: ${reportPath}`);
      }

      // 显示总结
      const failCount = this.checks.filter(c => c.status === 'fail').length;
      if (failCount === 0) {
        console.log('\n🎉 跨多端兼容性检查完成，所有检查都通过了！');
      } else {
        console.log(
          `\n❌ 跨多端兼容性检查完成，有 ${failCount} 个问题需要修复。`
        );
      }
    } catch (error) {
      console.error('❌ 兼容性检查失败:', error);
      throw error;
    }
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const options: CrossPlatformOptions = {
    checkCSS: !args.includes('--no-css'),
    checkJS: !args.includes('--no-js'),
    checkHTML: !args.includes('--no-html'),
    checkResponsive: !args.includes('--no-responsive'),
    checkBrowserSupport: !args.includes('--no-browser'),
    generateReport: !args.includes('--no-report'),
    verbose: args.includes('--verbose'),
  };

  try {
    const checker = new CrossPlatformChecker(options);
    await checker.runAllChecks();
    process.exit(0);
  } catch (error) {
    console.error('检查失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { CrossPlatformChecker };
