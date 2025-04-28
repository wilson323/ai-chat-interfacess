import { test, expect } from '@playwright/test';

const ADMIN_URL = 'http://localhost:3000/admin/login';
const ADMIN_PAGE = 'http://localhost:3000/admin';
const USER_URL = 'http://localhost:3000/';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';

// 管理端登录、智能体管理、用户端同步、权限校验全流程

test.describe('全功能E2E自动化测试', () => {
  test('管理端登录-正确用户名密码', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.fill('#username', ADMIN_USERNAME);
    await page.fill('#password', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(ADMIN_PAGE);
    await expect(page.locator('text=退出登录')).toBeVisible();
  });

  test('管理端登录-错误用户名密码', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.fill('#username', 'wrong');
    await page.fill('#password', 'wrong');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=用户名或密码错误')).toBeVisible();
  });

  test('智能体管理-新增/编辑/删除', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.fill('#username', ADMIN_USERNAME);
    await page.fill('#password', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(ADMIN_PAGE);
    // 新增智能体
    await page.click('text=新增智能体');
    await page.fill('input[name="name"]', '测试智能体');
    await page.click('button:text("保存")');
    await expect(page.locator('text=测试智能体')).toBeVisible();
    // 编辑智能体
    await page.click('text=测试智能体');
    await page.fill('input[name="name"]', '测试智能体-已编辑');
    await page.click('button:text("保存")');
    await expect(page.locator('text=测试智能体-已编辑')).toBeVisible();
    // 删除智能体
    await page.click('text=测试智能体-已编辑');
    await page.click('button:text("删除")');
    await expect(page.locator('text=测试智能体-已编辑')).not.toBeVisible();
  });

  test('默认智能体可用性', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.fill('#username', ADMIN_USERNAME);
    await page.fill('#password', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(ADMIN_PAGE);
    await expect(page.locator('text=默认智能体')).toBeVisible();
  });

  test('智能体变更后用户端实时同步', async ({ page, context }) => {
    // 管理端新增智能体
    await page.goto(ADMIN_URL);
    await page.fill('#username', ADMIN_USERNAME);
    await page.fill('#password', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(ADMIN_PAGE);
    await page.click('text=新增智能体');
    await page.fill('input[name="name"]', '同步测试智能体');
    await page.click('button:text("保存")');
    await expect(page.locator('text=同步测试智能体')).toBeVisible();
    // 用户端刷新应能看到
    const userPage = await context.newPage();
    await userPage.goto(USER_URL);
    await expect(userPage.locator('text=同步测试智能体')).toBeVisible();
    // 清理
    await page.click('text=同步测试智能体');
    await page.click('button:text("删除")');
    await expect(page.locator('text=同步测试智能体')).not.toBeVisible();
  });

  test('用户端功能-会话/消息/切换/历史', async ({ page }) => {
    await page.goto(USER_URL);
    // 选择默认智能体
    await page.click('text=默认智能体');
    // 发起会话
    await page.fill('textarea', '你好');
    await page.click('button:text("发送")');
    await expect(page.locator('text=你好')).toBeVisible();
    // 切换智能体
    await page.click('text=智能体列表');
    await page.click('text=默认智能体');
    // 查看历史
    await page.click('text=历史会话');
    await expect(page.locator('text=你好')).toBeVisible();
  });

  test('权限校验-未登录不能访问后台', async ({ page }) => {
    await page.goto(ADMIN_PAGE);
    await expect(page).toHaveURL(ADMIN_URL);
  });
}); 