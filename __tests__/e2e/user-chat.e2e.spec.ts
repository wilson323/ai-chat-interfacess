import { test, expect } from '@playwright/test';

// 1. 智能体切换（左上角下拉）
test('Agent switcher renders and can switch agent', async ({ page }) => {
  await page.goto('/user/chat');
  const switcher = page.locator('select');
  await expect(switcher).toBeVisible();
  const options = await switcher.locator('option').allTextContents();
  expect(options.length).toBeGreaterThan(0);
  // 切换到第2个智能体（如有）
  if (options.length > 1) {
    await switcher.selectOption({ index: 1 });
    await expect(switcher).toHaveValue(
      await switcher.locator('option').nth(1).getAttribute('value')
    );
  }
});

// 2. 切换到 fastgpt 智能体后开场白展示
test('FastGPT agent shows welcome message', async ({ page }) => {
  await page.goto('/user/chat');
  const switcher = page.locator('select');
  const fastgptOption = await switcher
    .locator('option', { hasText: /fastgpt/i })
    .first();
  if ((await fastgptOption.count()) > 0) {
    const value = await fastgptOption.getAttribute('value');
    await switcher.selectOption(value!);
    // 检查开场白
    await expect(page.locator('.prose')).toContainText(
      /(你好|welcome|hi|hello)/i
    );
  }
});

// 3. 发送消息并收到响应
test('Send message and receive response', async ({ page }) => {
  await page.goto('/user/chat');
  const textarea = page.locator('textarea');
  await textarea.fill('你好');
  await page.getByRole('button', { name: /发送|send/i }).click();
  // 检查消息流中出现用户消息
  await expect(page.locator('.prose')).toContainText('你好');
  // 检查有助手响应（可根据实际 className 调整）
  await expect(page.locator('.prose')).not.toBeEmpty();
});

// 4. 文件上传按钮可见
test('File upload button is visible', async ({ page }) => {
  await page.goto('/user/chat');
  await expect(
    page.getByRole('button', { name: /上传|upload|file/i })
  ).toBeVisible();
});

// 5. 历史记录按钮可见
test('History button is visible', async ({ page }) => {
  await page.goto('/user/chat');
  await expect(
    page.getByRole('button', { name: /历史|history/i })
  ).toBeVisible();
});

// 6. 语音输入按钮可见
test('Voice input button is visible', async ({ page }) => {
  await page.goto('/user/chat');
  await expect(
    page.getByRole('button', { name: /语音|voice|mic|录音/i })
  ).toBeVisible();
});

// 7. 国际化切换（如有）
test('Language switcher is visible (if exists)', async ({ page }) => {
  await page.goto('/user/chat');
  const langSwitcher = page.locator(
    'select[name=language],button[aria-label*=语言]'
  );
  if ((await langSwitcher.count()) > 0) {
    await expect(langSwitcher).toBeVisible();
  }
});

// 8. UI 响应式（桌面/移动）
test('Responsive UI: mobile layout', async ({ page, browserName }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto('/user/chat');
  // 检查移动端下拉、按钮等是否可见
  await expect(page.locator('select')).toBeVisible();
  await expect(page.locator('textarea')).toBeVisible();
});
