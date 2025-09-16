import { test, expect } from '@playwright/test';

test('图像编辑器基本元素与标签页', async ({ page }) => {
  await page.goto('/image-editor');
  await expect(page.getByText('AI图像编辑器')).toBeVisible();
  await expect(page.getByRole('tab', { name: '上传' })).toBeVisible();
  await expect(page.getByRole('tab', { name: '编辑' })).toBeVisible();
  await expect(page.getByRole('tab', { name: '工具' })).toBeVisible();
  await expect(page.getByRole('tab', { name: '效果' })).toBeVisible();
});
