// 使用 Playwright 测试切换到 CAD 智能体
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 导航到用户聊天页面
  await page.goto('http://localhost:3001/user/chat');
  console.log('页面已加载');
  
  // 等待页面完全加载
  await page.waitForTimeout(2000);
  
  // 查找并点击智能体切换器
  try {
    // 尝试找到智能体切换器并点击
    const agentSwitcher = await page.locator('.agent-switcher select');
    await agentSwitcher.click();
    console.log('找到智能体切换器并点击');
    
    // 等待下拉菜单出现
    await page.waitForTimeout(1000);
    
    // 查找并选择 CAD 智能体选项
    const options = await page.locator('.agent-switcher select option');
    const count = await options.count();
    
    console.log(`找到 ${count} 个智能体选项`);
    
    // 遍历所有选项，查找包含 CAD 的选项
    for (let i = 0; i < count; i++) {
      const optionText = await options.nth(i).textContent();
      console.log(`选项 ${i}: ${optionText}`);
      
      if (optionText.includes('CAD')) {
        await options.nth(i).click();
        console.log('选择了 CAD 智能体');
        break;
      }
    }
    
    // 等待页面更新
    await page.waitForTimeout(3000);
    
    // 检查是否有错误
    const errorElement = await page.locator('text=Unhandled Runtime Error').count();
    if (errorElement > 0) {
      console.error('发现错误: Unhandled Runtime Error');
    } else {
      console.log('没有发现错误，测试通过');
    }
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
  
  // 截图
  await page.screenshot({ path: 'test-result.png' });
  
  // 等待一段时间后关闭浏览器
  await page.waitForTimeout(5000);
  await browser.close();
})();
