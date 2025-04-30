import { test, expect } from '@playwright/test';

test('用户界面发送消息测试', async ({ page }) => {
  // 导航到应用首页
  await page.goto('http://localhost:3002');
  
  // 等待页面加载完成
  await page.waitForSelector('.message-bubble-assistant', { timeout: 10000 });
  
  // 检查欢迎消息是否正确显示
  const welcomeMessage = await page.locator('.message-bubble-assistant').first();
  await expect(welcomeMessage).toBeVisible();
  
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
  
  // 检查用户消息内容
  const userText = await userMessage.textContent();
  expect(userText).toContain('测试消息');
  
  // 等待助手响应
  await page.waitForSelector('.message-bubble-assistant >> nth=1', { timeout: 30000 });
  
  // 检查助手响应是否显示
  const assistantResponse = await page.locator('.message-bubble-assistant').nth(1);
  await expect(assistantResponse).toBeVisible();
  
  // 确认没有显示设置对话框
  const settingsDialog = await page.locator('dialog:has-text("设置")');
  await expect(settingsDialog).not.toBeVisible();
});
