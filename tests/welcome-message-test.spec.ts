import { test, expect } from '@playwright/test';

test('初始化欢迎消息测试', async ({ page }) => {
  // 导航到应用首页
  await page.goto('http://localhost:3001');
  
  // 等待页面加载完成
  await page.waitForSelector('.message-bubble-assistant', { timeout: 10000 });
  
  // 检查欢迎消息是否正确显示
  const welcomeMessage = await page.locator('.message-bubble-assistant').first();
  await expect(welcomeMessage).toBeVisible();
  
  // 记录初始欢迎消息
  const initialWelcomeText = await welcomeMessage.textContent();
  console.log('初始欢迎消息:', initialWelcomeText);
  
  // 在输入框中输入消息
  const inputField = await page.locator('textarea');
  await inputField.fill('测试消息');
  
  // 提交消息
  await page.keyboard.press('Enter');
  
  // 等待用户消息显示
  await page.waitForSelector('.message-bubble-user', { timeout: 10000 });
  
  // 检查用户消息是否显示
  const userMessage = await page.locator('.message-bubble-user').first();
  await expect(userMessage).toBeVisible();
  
  // 等待助手响应
  await page.waitForSelector('.message-bubble-assistant >> nth=1', { timeout: 30000 });
  
  // 刷新页面
  await page.reload();
  
  // 等待页面重新加载完成
  await page.waitForSelector('.message-bubble-assistant', { timeout: 10000 });
  
  // 检查欢迎消息是否与之前相同
  const newWelcomeMessage = await page.locator('.message-bubble-assistant').first();
  const newWelcomeText = await newWelcomeMessage.textContent();
  console.log('刷新后的欢迎消息:', newWelcomeText);
  
  // 验证欢迎消息是否与之前相同
  expect(newWelcomeText).toBe(initialWelcomeText);
});
