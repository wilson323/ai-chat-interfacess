import { test, expect } from '@playwright/test';

test('默认智能体初始化信息测试', async ({ page }) => {
  // 导航到应用首页
  await page.goto('http://localhost:3000');
  
  // 等待页面加载完成
  await page.waitForSelector('.message-bubble-assistant', { timeout: 10000 });
  
  // 检查欢迎消息是否正确显示
  const welcomeMessage = await page.locator('.message-bubble-assistant').first();
  await expect(welcomeMessage).toBeVisible();
  
  // 检查欢迎消息内容是否包含预期文本
  const welcomeText = await welcomeMessage.textContent();
  expect(welcomeText).toContain('你好');
  
  // 检查交互选项是否显示
  const interactButtons = await page.locator('button:has-text("你能做什么？")');
  await expect(interactButtons).toBeVisible();
  
  // 点击一个交互选项
  await interactButtons.click();
  
  // 检查输入框是否填充了选中的交互选项文本
  const inputField = await page.locator('textarea');
  const inputValue = await inputField.inputValue();
  expect(inputValue).toBe('你能做什么？');
  
  // 提交消息
  await page.keyboard.press('Enter');
  
  // 等待响应
  await page.waitForSelector('.message-bubble-user', { timeout: 10000 });
  
  // 检查用户消息是否显示
  const userMessage = await page.locator('.message-bubble-user').first();
  await expect(userMessage).toBeVisible();
  
  // 检查用户消息内容
  const userText = await userMessage.textContent();
  expect(userText).toContain('你能做什么？');
  
  // 等待助手响应
  await page.waitForSelector('.message-bubble-assistant >> nth=1', { timeout: 30000 });
  
  // 检查助手响应是否显示
  const assistantResponse = await page.locator('.message-bubble-assistant').nth(1);
  await expect(assistantResponse).toBeVisible();
});
