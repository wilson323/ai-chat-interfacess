import { test, expect } from '@playwright/test';

test('首页可进入聊天页', async ({ page }) => {
  await page.goto('/');
  // 容忍不同跳转时序：尝试点击按钮进入
  const button = page.getByRole('button', { name: '立即进入聊天' });
  if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
    await button.click();
  } else {
    await page.waitForTimeout(2000);
  }
  await expect(page).toHaveURL(/\/user\/chat$/);
});
