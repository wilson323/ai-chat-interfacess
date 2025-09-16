import { test, expect } from '@playwright/test';

test('聊天页渲染并显示聊天/历史 Tabs', async ({ page }) => {
  await page.goto('/user/chat');
  // 等待 Tabs 出现，不强依赖加载态文案
  await expect(page.getByRole('tab', { name: '聊天' })).toBeVisible();
  await expect(page.getByRole('tab', { name: '历史' })).toBeVisible();
});
