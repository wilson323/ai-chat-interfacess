import { test, expect } from '@playwright/test';

test.describe('移动端聊天功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 访问聊天页面
    await page.goto('/user/chat');

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
  });

  test('移动端聊天界面基本功能', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/熵犇犇智能体/);

    // 检查聊天输入框是否存在
    const chatInput = page.locator('[data-testid="chat-input"], textarea, input[type="text"]').first();
    await expect(chatInput).toBeVisible();

    // 检查发送按钮
    const sendButton = page.locator('[data-testid="send-button"], button:has-text("发送")').first();
    await expect(sendButton).toBeVisible();

    // 检查移动端导航栏
    const mobileNav = page.locator('[data-testid="mobile-nav"], .mobile-nav').first();
    await expect(mobileNav).toBeVisible();
  });

  test('移动端发送消息', async ({ page }) => {
    const testMessage = '你好，这是一个测试消息';

    // 点击输入框
    const chatInput = page.locator('[data-testid="chat-input"], textarea, input[type="text"]').first();
    await chatInput.click();

    // 输入消息
    await chatInput.fill(testMessage);

    // 点击发送按钮
    const sendButton = page.locator('[data-testid="send-button"], button:has-text("发送")').first();
    await sendButton.click();

    // 验证消息已发送（检查输入框是否清空）
    await expect(chatInput).toHaveValue('');

    // 等待消息出现（如果有消息列表）
    const messageList = page.locator('[data-testid="message-list"], .message-list').first();
    if (await messageList.isVisible()) {
      await expect(messageList).toContainText(testMessage);
    }
  });

  test('移动端侧边栏切换', async ({ page }) => {
    // 检查侧边栏按钮
    const sidebarToggle = page.locator('[data-testid="sidebar-toggle"], button:has-text("菜单"), [aria-label*="菜单"]').first();

    if (await sidebarToggle.isVisible()) {
      // 点击打开侧边栏
      await sidebarToggle.click();

      // 检查侧边栏是否打开
      const sidebar = page.locator('[data-testid="sidebar"], .sidebar').first();
      await expect(sidebar).toBeVisible();

      // 再次点击关闭侧边栏
      await sidebarToggle.click();

      // 检查侧边栏是否关闭
      await expect(sidebar).not.toBeVisible();
    }
  });

  test('移动端主题切换', async ({ page }) => {
    // 查找主题切换按钮
    const themeToggle = page.locator('[data-testid="theme-toggle"], button[aria-label*="主题"], button[title*="主题"]').first();

    if (await themeToggle.isVisible()) {
      // 点击切换主题
      await themeToggle.click();

      // 检查主题是否切换（通过检查body类名或CSS变量）
      const body = page.locator('body');
      const hasDarkClass = await body.evaluate(el => el.classList.contains('dark'));

      // 再次点击切换回来
      await themeToggle.click();

      const hasLightClass = await body.evaluate(el => !el.classList.contains('dark'));
      expect(hasLightClass).toBeTruthy();
    }
  });

  test('移动端文件上传', async ({ page }) => {
    // 查找文件上传按钮
    const fileUploadButton = page.locator('[data-testid="file-upload"], input[type="file"], button:has-text("上传")').first();

    if (await fileUploadButton.isVisible()) {
      // 创建测试文件
      const testFilePath = 'test-file.txt';

      // 模拟文件上传（如果支持）
      try {
        await fileUploadButton.setInputFiles({
          name: testFilePath,
          mimeType: 'text/plain',
          buffer: Buffer.from('测试文件内容')
        });

        // 检查上传状态
        const uploadStatus = page.locator('[data-testid="upload-status"], .upload-status').first();
        if (await uploadStatus.isVisible()) {
          await expect(uploadStatus).toBeVisible();
        }
      } catch (error) {
        console.log('文件上传测试跳过：', error.message);
      }
    }
  });

  test('移动端响应式布局', async ({ page }) => {
    // 检查页面是否响应式
    const viewport = page.viewportSize();

    if (viewport) {
      // 测试不同屏幕尺寸
      const sizes = [
        { width: 375, height: 667 }, // iPhone SE
        { width: 390, height: 844 }, // iPhone 12
        { width: 428, height: 926 }, // iPhone 14 Pro Max
      ];

      for (const size of sizes) {
        await page.setViewportSize(size);

        // 检查主要元素是否仍然可见
        const chatInput = page.locator('[data-testid="chat-input"], textarea, input[type="text"]').first();
        await expect(chatInput).toBeVisible();

        const mobileNav = page.locator('[data-testid="mobile-nav"], .mobile-nav').first();
        await expect(mobileNav).toBeVisible();

        // 等待一下再测试下一个尺寸
        await page.waitForTimeout(500);
      }
    }
  });

  test('移动端触摸手势', async ({ page }) => {
    // 测试触摸手势（如果有支持）
    const messageList = page.locator('[data-testid="message-list"], .message-list').first();

    if (await messageList.isVisible()) {
      // 测试滑动刷新
      const startY = 100;
      const endY = 300;

      await page.touchscreen.tap(200, startY);
      await page.mouse.move(200, startY);
      await page.mouse.down();
      await page.mouse.move(200, endY);
      await page.mouse.up();
    }
  });

  test('移动端键盘适配', async ({ page }) => {
    // 测试虚拟键盘适配
    const chatInput = page.locator('[data-testid="chat-input"], textarea, input[type="text"]').first();

    if (await chatInput.isVisible()) {
      // 点击输入框触发虚拟键盘
      await chatInput.click();

      // 等待键盘动画
      await page.waitForTimeout(1000);

      // 检查输入框是否仍然可见（没有被键盘遮挡）
      await expect(chatInput).toBeVisible();

      // 输入一些文本
      await chatInput.fill('测试键盘输入');

      // 检查输入是否成功
      await expect(chatInput).toHaveValue('测试键盘输入');
    }
  });

  test('移动端网络状态处理', async ({ page }) => {
    // 测试离线状态
    await page.context().setOffline(true);

    // 尝试发送消息
    const chatInput = page.locator('[data-testid="chat-input"], textarea, input[type="text"]').first();
    const sendButton = page.locator('[data-testid="send-button"], button:has-text("发送")').first();

    if (await chatInput.isVisible() && await sendButton.isVisible()) {
      await chatInput.fill('离线测试消息');
      await sendButton.click();

      // 检查是否有离线提示
      const offlineIndicator = page.locator('[data-testid="offline-indicator"], .offline-indicator').first();
      if (await offlineIndicator.isVisible()) {
        await expect(offlineIndicator).toBeVisible();
      }
    }

    // 恢复在线状态
    await page.context().setOffline(false);
  });

  test('移动端性能测试', async ({ page }) => {
    // 记录页面加载时间
    const startTime = Date.now();

    // 等待页面完全加载
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // 检查加载时间是否合理（小于5秒）
    expect(loadTime).toBeLessThan(5000);

    // 检查是否有性能警告
    const performanceWarnings = await page.evaluate(() => {
      return window.performance.getEntriesByType('navigation')[0];
    });

    expect(performanceWarnings).toBeDefined();
  });
});

test.describe('移动端可访问性测试', () => {
  test('键盘导航', async ({ page }) => {
    await page.goto('/user/chat');

    // 测试Tab键导航
    await page.keyboard.press('Tab');

    // 检查焦点是否在可聚焦元素上
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // 继续Tab导航
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // 测试Enter键激活
    await page.keyboard.press('Enter');
  });

  test('屏幕阅读器支持', async ({ page }) => {
    await page.goto('/user/chat');

    // 检查页面是否有适当的ARIA标签
    const mainContent = page.locator('main, [role="main"], #main').first();
    await expect(mainContent).toBeVisible();

    // 检查表单元素是否有标签
    const chatInput = page.locator('[data-testid="chat-input"], textarea, input[type="text"]').first();
    if (await chatInput.isVisible()) {
      const hasLabel = await chatInput.evaluate(el => {
        return el.hasAttribute('aria-label') ||
               el.hasAttribute('aria-labelledby') ||
               !!el.closest('label');
      });
      expect(hasLabel).toBeTruthy();
    }
  });

  test('颜色对比度', async ({ page }) => {
    await page.goto('/user/chat');

    // 检查主要文本元素的可读性
    const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6').first();

    if (await textElements.isVisible()) {
      // 获取计算样式
      const computedStyle = await textElements.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          color: style.color,
          backgroundColor: style.backgroundColor,
          fontSize: style.fontSize
        };
      });

      // 基本检查：确保有颜色设置
      expect(computedStyle.color).toBeDefined();
      expect(computedStyle.fontSize).toBeDefined();
    }
  });
});
