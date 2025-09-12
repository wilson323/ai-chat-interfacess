/**
 * E2E测试工具
 * 提供页面对象模型和测试助手函数
 */

import { Page, expect, Locator } from '@playwright/test'

// 基础页面类
export abstract class BasePage {
  constructor(protected page: Page) {}
  
  async goto(url: string) {
    await this.page.goto(url)
    await this.waitForPageLoad()
  }
  
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
  }
  
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true
    })
  }
  
  async getTitle() {
    return await this.page.title()
  }
  
  async getURL() {
    return this.page.url()
  }
}

// 登录页面
export class LoginPage extends BasePage {
  private usernameInput = this.page.locator('#username')
  private passwordInput = this.page.locator('#password')
  private submitButton = this.page.locator('button[type="submit"]')
  private errorMessage = this.page.locator('.error-message')
  
  async goto() {
    await super.goto('/admin/login')
  }
  
  async login(username: string, password: string) {
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
  
  async expectLoginSuccess() {
    await expect(this.page).toHaveURL('/admin')
    await expect(this.page.locator('text=退出登录')).toBeVisible()
  }
  
  async expectLoginError(message: string = '用户名或密码错误') {
    await expect(this.errorMessage).toContainText(message)
  }
  
  async expectValidationError(field: 'username' | 'password') {
    const fieldElement = field === 'username' ? this.usernameInput : this.passwordInput
    await expect(fieldElement).toHaveAttribute('aria-invalid', 'true')
  }
}

// 聊天页面
export class ChatPage extends BasePage {
  private messageInput = this.page.locator('textarea[placeholder*="输入"]')
  private sendButton = this.page.locator('button[type="submit"]')
  private messageList = this.page.locator('.message-list')
  private userMessages = this.page.locator('.message-bubble-user')
  private assistantMessages = this.page.locator('.message-bubble-assistant')
  private loadingIndicator = this.page.locator('.loading-indicator')
  
  async goto() {
    await super.goto('/')
  }
  
  async sendMessage(message: string) {
    await this.messageInput.fill(message)
    await this.messageInput.press('Enter')
  }
  
  async sendMessageWithButton(message: string) {
    await this.messageInput.fill(message)
    await this.sendButton.click()
  }
  
  async expectMessage(message: string, role: 'user' | 'assistant' = 'user') {
    const messageElement = role === 'user' ? this.userMessages : this.assistantMessages
    await expect(messageElement.last()).toContainText(message)
  }
  
  async expectResponse() {
    await expect(this.assistantMessages.nth(1)).toBeVisible({ timeout: 30000 })
  }
  
  async expectLoadingState() {
    await expect(this.loadingIndicator).toBeVisible()
  }
  
  async expectNoLoadingState() {
    await expect(this.loadingIndicator).not.toBeVisible()
  }
  
  async getLastMessage(role: 'user' | 'assistant' = 'assistant') {
    const messageElement = role === 'user' ? this.userMessages : this.assistantMessages
    return await messageElement.last().textContent()
  }
  
  async clearMessages() {
    await this.page.click('[data-testid="clear-messages"]')
  }
  
  async expectEmptyChat() {
    await expect(this.userMessages).toHaveCount(0)
    await expect(this.assistantMessages).toHaveCount(1) // 欢迎消息
  }
}

// 智能体管理页面
export class AgentManagementPage extends BasePage {
  private agentList = this.page.locator('.agent-list')
  private addAgentButton = this.page.locator('[data-testid="add-agent"]')
  private agentForm = this.page.locator('.agent-form')
  private agentNameInput = this.page.locator('#agent-name')
  private agentDescriptionInput = this.page.locator('#agent-description')
  private agentTypeSelect = this.page.locator('#agent-type')
  private saveButton = this.page.locator('button[type="submit"]')
  private cancelButton = this.page.locator('button[type="button"]')
  
  async goto() {
    await super.goto('/admin/agents')
  }
  
  async addAgent(agentData: {
    name: string
    description: string
    type: string
  }) {
    await this.addAgentButton.click()
    await this.agentNameInput.fill(agentData.name)
    await this.agentDescriptionInput.fill(agentData.description)
    await this.agentTypeSelect.selectOption(agentData.type)
    await this.saveButton.click()
  }
  
  async editAgent(agentId: string, updates: Partial<{
    name: string
    description: string
    type: string
  }>) {
    const agentRow = this.page.locator(`[data-agent-id="${agentId}"]`)
    await agentRow.locator('[data-testid="edit-agent"]').click()
    
    if (updates.name) {
      await this.agentNameInput.fill(updates.name)
    }
    if (updates.description) {
      await this.agentDescriptionInput.fill(updates.description)
    }
    if (updates.type) {
      await this.agentTypeSelect.selectOption(updates.type)
    }
    
    await this.saveButton.click()
  }
  
  async deleteAgent(agentId: string) {
    const agentRow = this.page.locator(`[data-agent-id="${agentId}"]`)
    await agentRow.locator('[data-testid="delete-agent"]').click()
    await this.page.click('[data-testid="confirm-delete"]')
  }
  
  async expectAgentInList(agentName: string) {
    await expect(this.agentList).toContainText(agentName)
  }
  
  async expectAgentNotInList(agentName: string) {
    await expect(this.agentList).not.toContainText(agentName)
  }
  
  async getAgentCount() {
    return await this.agentList.locator('.agent-item').count()
  }
}

// 设置页面
export class SettingsPage extends BasePage {
  private themeToggle = this.page.locator('[data-testid="theme-toggle"]')
  private languageSelect = this.page.locator('#language')
  private saveButton = this.page.locator('button[type="submit"]')
  private resetButton = this.page.locator('[data-testid="reset-settings"]')
  
  async goto() {
    await super.goto('/admin/settings')
  }
  
  async changeTheme(theme: 'light' | 'dark') {
    await this.themeToggle.click()
    await this.saveButton.click()
  }
  
  async changeLanguage(language: 'zh' | 'en') {
    await this.languageSelect.selectOption(language)
    await this.saveButton.click()
  }
  
  async resetSettings() {
    await this.resetButton.click()
    await this.page.click('[data-testid="confirm-reset"]')
  }
  
  async expectTheme(theme: 'light' | 'dark') {
    const body = this.page.locator('body')
    await expect(body).toHaveClass(new RegExp(theme))
  }
  
  async expectLanguage(language: 'zh' | 'en') {
    const html = this.page.locator('html')
    await expect(html).toHaveAttribute('lang', language)
  }
}

// 测试助手函数
export const testHelpers = {
  // 等待页面加载完成
  async waitForPageLoad(page: Page) {
    await page.waitForLoadState('networkidle')
  },
  
  // 等待元素可见
  async waitForElement(page: Page, selector: string, timeout = 30000) {
    await page.waitForSelector(selector, { timeout })
  },
  
  // 等待元素消失
  async waitForElementToDisappear(page: Page, selector: string, timeout = 30000) {
    await page.waitForSelector(selector, { state: 'hidden', timeout })
  },
  
  // 截图
  async takeScreenshot(page: Page, name: string) {
    await page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true
    })
  },
  
  // 模拟API响应
  async mockAPIResponse(page: Page, url: string, response: any, status = 200) {
    await page.route(url, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response)
      })
    })
  },
  
  // 模拟API错误
  async mockAPIError(page: Page, url: string, status = 500) {
    await page.route(url, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      })
    })
  },
  
  // 模拟网络延迟
  async mockNetworkDelay(page: Page, delay = 1000) {
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), delay)
    })
  },
  
  // 模拟网络断开
  async mockNetworkOffline(page: Page) {
    await page.context().setOffline(true)
  },
  
  // 恢复网络连接
  async mockNetworkOnline(page: Page) {
    await page.context().setOffline(false)
  },
  
  // 模拟地理位置
  async mockGeolocation(page: Page, latitude: number, longitude: number) {
    await page.context().grantPermissions(['geolocation'])
    await page.addInitScript((lat, lng) => {
      navigator.geolocation.getCurrentPosition = (success) => {
        success({
          coords: {
            latitude: lat,
            longitude: lng,
            accuracy: 10
          }
        } as GeolocationPosition)
      }
    }, latitude, longitude)
  },
  
  // 模拟设备
  async mockDevice(page: Page, device: 'mobile' | 'tablet' | 'desktop') {
    const viewport = {
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1920, height: 1080 }
    }
    
    await page.setViewportSize(viewport[device])
  },
  
  // 模拟用户代理
  async mockUserAgent(page: Page, userAgent: string) {
    await page.setExtraHTTPHeaders({
      'User-Agent': userAgent
    })
  },
  
  // 模拟Cookie
  async mockCookie(page: Page, name: string, value: string, domain?: string) {
    await page.context().addCookies([{
      name,
      value,
      domain: domain || 'localhost',
      path: '/'
    }])
  },
  
  // 清理所有mocks
  async cleanupMocks(page: Page) {
    await page.unroute('**/*')
    await page.context().clearCookies()
    await page.context().clearPermissions()
  }
}

// 测试数据工厂
export const e2eTestData = {
  // 用户数据
  users: {
    admin: {
      username: 'admin',
      password: 'admin',
      email: 'admin@example.com'
    },
    user: {
      username: 'user',
      password: 'user',
      email: 'user@example.com'
    }
  },
  
  // 智能体数据
  agents: {
    chat: {
      name: '聊天助手',
      description: '一个通用的聊天助手',
      type: 'chat'
    },
    cad: {
      name: 'CAD分析器',
      description: '用于分析CAD文件',
      type: 'cad'
    },
    image: {
      name: '图像编辑器',
      description: '用于编辑图像',
      type: 'image'
    }
  },
  
  // 消息数据
  messages: {
    greeting: '你好',
    question: '你能帮我做什么？',
    goodbye: '再见',
    test: '这是一个测试消息'
  }
}

// 测试配置
export const testConfig = {
  // 超时设置
  timeouts: {
    short: 5000,
    medium: 15000,
    long: 30000
  },
  
  // 重试设置
  retries: {
    flaky: 3,
    stable: 1
  },
  
  // 浏览器设置
  browsers: {
    chromium: 'chromium',
    firefox: 'firefox',
    webkit: 'webkit'
  },
  
  // 设备设置
  devices: {
    mobile: 'mobile',
    tablet: 'tablet',
    desktop: 'desktop'
  }
}

// 默认导出
export default {
  BasePage,
  LoginPage,
  ChatPage,
  AgentManagementPage,
  SettingsPage,
  testHelpers,
  e2eTestData,
  testConfig
}
