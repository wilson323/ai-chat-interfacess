# Test info

- Name: Voice input button is visible
- Location: F:\jj\ai-chat-interface\__tests__\e2e\user-chat.e2e.spec.ts:55:5

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/user/chat", waiting until "load"

    at F:\jj\ai-chat-interface\__tests__\e2e\user-chat.e2e.spec.ts:56:14
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | // 1. 智能体切换（左上角下拉）
   4 | test('Agent switcher renders and can switch agent', async ({ page }) => {
   5 |   await page.goto('/user/chat');
   6 |   const switcher = page.locator('select');
   7 |   await expect(switcher).toBeVisible();
   8 |   const options = await switcher.locator('option').allTextContents();
   9 |   expect(options.length).toBeGreaterThan(0);
  10 |   // 切换到第2个智能体（如有）
  11 |   if (options.length > 1) {
  12 |     await switcher.selectOption({ index: 1 });
  13 |     await expect(switcher).toHaveValue(await switcher.locator('option').nth(1).getAttribute('value'));
  14 |   }
  15 | });
  16 |
  17 | // 2. 切换到 fastgpt 智能体后开场白展示
  18 | test('FastGPT agent shows welcome message', async ({ page }) => {
  19 |   await page.goto('/user/chat');
  20 |   const switcher = page.locator('select');
  21 |   const fastgptOption = await switcher.locator('option', { hasText: /fastgpt/i }).first();
  22 |   if (await fastgptOption.count() > 0) {
  23 |     const value = await fastgptOption.getAttribute('value');
  24 |     await switcher.selectOption(value!);
  25 |     // 检查开场白
  26 |     await expect(page.locator('.prose')).toContainText(/(你好|welcome|hi|hello)/i);
  27 |   }
  28 | });
  29 |
  30 | // 3. 发送消息并收到响应
  31 | test('Send message and receive response', async ({ page }) => {
  32 |   await page.goto('/user/chat');
  33 |   const textarea = page.locator('textarea');
  34 |   await textarea.fill('你好');
  35 |   await page.getByRole('button', { name: /发送|send/i }).click();
  36 |   // 检查消息流中出现用户消息
  37 |   await expect(page.locator('.prose')).toContainText('你好');
  38 |   // 检查有助手响应（可根据实际 className 调整）
  39 |   await expect(page.locator('.prose')).not.toBeEmpty();
  40 | });
  41 |
  42 | // 4. 文件上传按钮可见
  43 | test('File upload button is visible', async ({ page }) => {
  44 |   await page.goto('/user/chat');
  45 |   await expect(page.getByRole('button', { name: /上传|upload|file/i })).toBeVisible();
  46 | });
  47 |
  48 | // 5. 历史记录按钮可见
  49 | test('History button is visible', async ({ page }) => {
  50 |   await page.goto('/user/chat');
  51 |   await expect(page.getByRole('button', { name: /历史|history/i })).toBeVisible();
  52 | });
  53 |
  54 | // 6. 语音输入按钮可见
  55 | test('Voice input button is visible', async ({ page }) => {
> 56 |   await page.goto('/user/chat');
     |              ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  57 |   await expect(page.getByRole('button', { name: /语音|voice|mic|录音/i })).toBeVisible();
  58 | });
  59 |
  60 | // 7. 国际化切换（如有）
  61 | test('Language switcher is visible (if exists)', async ({ page }) => {
  62 |   await page.goto('/user/chat');
  63 |   const langSwitcher = page.locator('select[name=language],button[aria-label*=语言]');
  64 |   if (await langSwitcher.count() > 0) {
  65 |     await expect(langSwitcher).toBeVisible();
  66 |   }
  67 | });
  68 |
  69 | // 8. UI 响应式（桌面/移动）
  70 | test('Responsive UI: mobile layout', async ({ page, browserName }) => {
  71 |   await page.setViewportSize({ width: 375, height: 700 });
  72 |   await page.goto('/user/chat');
  73 |   // 检查移动端下拉、按钮等是否可见
  74 |   await expect(page.locator('select')).toBeVisible();
  75 |   await expect(page.locator('textarea')).toBeVisible();
  76 | }); 
```