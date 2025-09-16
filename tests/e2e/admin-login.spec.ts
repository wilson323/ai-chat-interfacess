import { test, expect } from '@playwright/test';

test('管理员登录页渲染并校验字段', async ({ page }) => {
  await page.goto('/admin/login');
  await expect(page.getByText('管理员登录')).toBeVisible();
  await expect(page.getByLabel('用户名')).toBeVisible();
  await expect(page.getByLabel('密码')).toBeVisible();
  await expect(page.getByRole('button', { name: '登录' })).toBeVisible();
});
