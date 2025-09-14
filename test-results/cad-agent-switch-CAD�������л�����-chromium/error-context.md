# Test info

- Name: CAD智能体切换测试
- Location: E:\pyydemo\ai-chat-interface\tests\cad-agent-switch.test.js:4:1

# Error details

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('select.border') to be visible

    at E:\pyydemo\ai-chat-interface\tests\cad-agent-switch.test.js:9:14
```

# Test source

```ts
   1 | // @ts-check
   2 | const { test, expect } = require('@playwright/test');
   3 |
   4 | test('CAD智能体切换测试', async ({ page }) => {
   5 |   // 访问用户聊天页面
   6 |   await page.goto('/user/chat');
   7 |
   8 |   // 等待页面加载完成
>  9 |   await page.waitForSelector('select.border');
     |              ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  10 |
  11 |   // 查找智能体切换器
  12 |   const agentSwitcher = await page.locator('select.border');
  13 |
  14 |   // 获取所有可用的智能体选项
  15 |   const options = await agentSwitcher.locator('option').all();
  16 |   console.log(`找到 ${options.length} 个智能体选项`);
  17 |
  18 |   // 查找CAD解读智能体选项
  19 |   let cadAgentOption = null;
  20 |   for (const option of options) {
  21 |     const text = await option.textContent();
  22 |     if (text && text.includes('CAD解读')) {
  23 |       cadAgentOption = option;
  24 |       break;
  25 |     }
  26 |   }
  27 |
  28 |   // 如果找到CAD智能体，切换到它
  29 |   if (cadAgentOption) {
  30 |     console.log('找到CAD解读智能体，切换中...');
  31 |     const value = await cadAgentOption.getAttribute('value');
  32 |     await agentSwitcher.selectOption(value);
  33 |
  34 |     // 等待CAD分析器容器加载
  35 |     await page.waitForSelector('.card-title:has-text("CAD解读智能体")');
  36 |
  37 |     // 验证CAD分析器界面是否正确加载
  38 |     const title = await page.locator('.card-title:has-text("CAD解读智能体")').first();
  39 |     expect(await title.isVisible()).toBeTruthy();
  40 |
  41 |     console.log('CAD智能体加载成功');
  42 |   } else {
  43 |     console.log('未找到CAD解读智能体');
  44 |   }
  45 |
  46 |   // 切换回默认智能体
  47 |   const defaultOption = options[0];
  48 |   const defaultValue = await defaultOption.getAttribute('value');
  49 |   await agentSwitcher.selectOption(defaultValue);
  50 |
  51 |   // 等待默认聊天界面加载
  52 |   await page.waitForSelector('textarea[placeholder]');
  53 |
  54 |   // 验证默认聊天界面是否正确加载
  55 |   const textarea = await page.locator('textarea[placeholder]').first();
  56 |   expect(await textarea.isVisible()).toBeTruthy();
  57 |
  58 |   console.log('默认智能体加载成功');
  59 | });
  60 |
```
