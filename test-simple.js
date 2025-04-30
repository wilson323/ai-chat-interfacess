// 简单测试脚本
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 导航到用户聊天页面
    await page.goto('http://localhost:3001/user/chat');
    console.log('页面已加载');
    
    // 等待页面完全加载
    await page.waitForTimeout(3000);
    
    // 截图初始状态
    await page.screenshot({ path: 'initial-state.png' });
    
    // 模拟点击右上角的智能体切换按钮
    await page.click('.agent-switcher select');
    console.log('点击了智能体切换器');
    
    // 等待下拉菜单出现
    await page.waitForTimeout(1000);
    
    // 截图下拉菜单状态
    await page.screenshot({ path: 'dropdown-open.png' });
    
    // 选择第二个选项（假设是CAD智能体）
    await page.selectOption('.agent-switcher select', { index: 1 });
    console.log('选择了第二个智能体选项');
    
    // 等待页面更新
    await page.waitForTimeout(3000);
    
    // 截图切换后状态
    await page.screenshot({ path: 'after-switch.png' });
    
    console.log('测试完成，没有发现错误');
  } catch (error) {
    console.error('测试过程中出错:', error);
    await page.screenshot({ path: 'error-state.png' });
  } finally {
    await browser.close();
  }
})();
