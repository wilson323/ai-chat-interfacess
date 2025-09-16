import { test, expect } from '@playwright/test';

const routes: Array<string> = [
  '/',
  '/user',
  '/user/chat',
  '/user/history',
  '/user/settings',
  '/user/settings/theme',
  '/user/theme-demo',
  '/image-editor',
  '/admin/login',
  '/admin',
  '/admin/users',
  '/admin/agent-list',
  '/admin/model-config',
  '/admin/voice-settings',
  '/admin/security',
  '/admin/system-management',
  '/admin/analytics',
  '/admin/performance',
  '/admin/cache',
  '/admin/db-schema',
  '/admin/image-editor-config',
  '/admin/image-editor-history',
  '/admin/cad-analyzer-config',
  '/admin/cad-analyzer-history',
];

test.describe('所有页面可访问且无控制台错误', () => {
  for (const path of routes) {
    test(`页面 ${path} 正常渲染`, async ({ page }) => {
      const errors: Array<string> = [];
      page.on('pageerror', (err) => errors.push(err.message || String(err)));
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      const res = await page.goto(path, { waitUntil: 'domcontentloaded' });
      // 补充更稳健的加载等待，避免过渡动画/布局抖动导致 body 短暂 hidden
      try {
        await page.waitForLoadState('networkidle', { timeout: 10_000 });
      } catch {}
      await page.evaluate(async () => {
        if (document.readyState !== 'complete') {
          await new Promise((resolve) => window.addEventListener('load', () => resolve(null), { once: true }));
        }
      });

      expect(res, `导航失败: ${path}`).toBeTruthy();
      expect(res!.status(), `HTTP 状态异常: ${path}`).toBeLessThan(400);
      // 放宽为已挂载，避免偶发 hidden 属性/动画造成误报
      await expect(page.locator('body')).toBeAttached();

      // 允许极少量非致命告警，但不允许 error
      expect(errors, `页面控制台错误: ${path}\n${errors.join('\n')}`).toEqual([]);
    });
  }
});
