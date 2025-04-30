// 使用 Playwright 测试 CAD 智能体文件上传功能
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 导航到用户聊天页面
    await page.goto('http://localhost:3002/user/chat');
    console.log('页面已加载');
    
    // 等待页面完全加载
    await page.waitForTimeout(2000);
    
    // 查找并点击智能体切换器
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
    let foundCAD = false;
    for (let i = 0; i < count; i++) {
      const optionText = await options.nth(i).textContent();
      console.log(`选项 ${i}: ${optionText}`);
      
      if (optionText.includes('CAD')) {
        await options.nth(i).click();
        console.log('选择了 CAD 智能体');
        foundCAD = true;
        break;
      }
    }
    
    if (!foundCAD) {
      console.log('未找到 CAD 智能体选项，尝试选择第二个选项');
      if (count > 1) {
        await options.nth(1).click();
      }
    }
    
    // 等待页面更新
    await page.waitForTimeout(3000);
    
    // 截图切换后状态
    await page.screenshot({ path: 'cad-agent-loaded.png' });
    
    // 创建一个测试文件
    const testFilePath = path.join(__dirname, 'test-cad-file.jpg');
    // 如果文件不存在，创建一个简单的测试图片
    if (!fs.existsSync(testFilePath)) {
      // 创建一个简单的文本文件，模拟图片
      fs.writeFileSync(testFilePath, 'This is a test file');
      console.log(`创建测试文件: ${testFilePath}`);
    }
    
    // 查找"选择文件"按钮并点击
    const selectFileButton = await page.getByText('选择文件');
    if (await selectFileButton.count() > 0) {
      console.log('找到"选择文件"按钮');
      
      // 设置文件选择器
      const fileChooserPromise = page.waitForEvent('filechooser');
      await selectFileButton.click();
      const fileChooser = await fileChooserPromise;
      
      // 选择测试文件
      await fileChooser.setFiles(testFilePath);
      console.log('已选择测试文件');
      
      // 等待文件上传和处理
      await page.waitForTimeout(5000);
      
      // 截图上传后状态
      await page.screenshot({ path: 'after-file-upload.png' });
      
      console.log('测试完成');
    } else {
      console.error('未找到"选择文件"按钮');
    }
  } catch (error) {
    console.error('测试过程中出错:', error);
    await page.screenshot({ path: 'error-state.png' });
  } finally {
    // 等待一段时间后关闭浏览器
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();
