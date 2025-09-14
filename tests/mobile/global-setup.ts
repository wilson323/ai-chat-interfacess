import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 移动端测试全局设置开始...');

  // 启动浏览器实例进行预检查
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // iPhone SE
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
  });

  const page = await context.newPage();

  try {
    // 检查开发服务器是否运行
    await page.goto('http://localhost:3000', { timeout: 10000 });
    console.log('✅ 开发服务器连接正常');
  } catch (error) {
    console.log('⚠️ 开发服务器未运行，跳过预检查');
  }

  await browser.close();
  console.log('✅ 移动端测试全局设置完成');
}

export default globalSetup;
