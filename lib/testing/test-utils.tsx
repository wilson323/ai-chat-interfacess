/**
 * 测试工具函数
 * 提供通用的测试辅助函数和Mock组件
 */

import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AgentProvider } from '@/context/agent-context'
import { LanguageProvider } from '@/context/language-context'

// 创建测试用的QueryClient
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

// 测试用的Wrapper组件
interface TestWrapperProps {
  children: React.ReactNode
  queryClient?: QueryClient
}

export function TestWrapper({ children, queryClient }: TestWrapperProps) {
  const client = queryClient || createTestQueryClient()
  
  return (
    <QueryClientProvider client={client}>
      <LanguageProvider>
        <AgentProvider>
          {children}
        </AgentProvider>
      </LanguageProvider>
    </QueryClientProvider>
  )
}

// 自定义渲染函数
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    queryClient?: QueryClient
  }
) {
  const { queryClient, ...renderOptions } = options || {}
  
  return render(ui, {
    wrapper: ({ children }) => (
      <TestWrapper queryClient={queryClient}>
        {children}
      </TestWrapper>
    ),
    ...renderOptions,
  })
}

// Mock函数
export const mockFetch = (data: any, status = 200) => {
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  })
}

// Mock localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
  }
}

// Mock sessionStorage
export const mockSessionStorage = () => {
  const store: Record<string, string> = {}
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
  }
}

// Mock window.location
export const mockLocation = (url: string) => {
  const location = new URL(url)
  
  Object.defineProperty(window, 'location', {
    value: {
      href: location.href,
      origin: location.origin,
      protocol: location.protocol,
      host: location.host,
      hostname: location.hostname,
      port: location.port,
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
    },
    writable: true,
  })
}

// Mock IntersectionObserver
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  })
  window.IntersectionObserver = mockIntersectionObserver
}

// Mock ResizeObserver
export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn()
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  })
  window.ResizeObserver = mockResizeObserver
}

// Mock matchMedia
export const mockMatchMedia = (matches = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// 等待异步操作完成
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟用户输入
export const simulateUserInput = (element: HTMLElement, value: string) => {
  const input = element as HTMLInputElement
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

// 模拟点击事件
export const simulateClick = (element: HTMLElement) => {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
}

// 模拟键盘事件
export const simulateKeyPress = (element: HTMLElement, key: string) => {
  element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
  element.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }))
}

// 模拟滚动事件
export const simulateScroll = (element: HTMLElement, scrollTop: number) => {
  Object.defineProperty(element, 'scrollTop', {
    value: scrollTop,
    writable: true,
  })
  element.dispatchEvent(new Event('scroll', { bubbles: true }))
}

// 测试数据生成器
export const generateTestData = {
  // 生成用户数据
  user: (overrides = {}) => ({
    id: 'test-user-1',
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg',
    ...overrides,
  }),

  // 生成智能体数据
  agent: (overrides = {}) => ({
    id: 'test-agent-1',
    name: 'Test Agent',
    description: 'Test agent description',
    type: 'chat',
    isPublished: true,
    ...overrides,
  }),

  // 生成消息数据
  message: (overrides = {}) => ({
    id: 'test-message-1',
    content: 'Test message content',
    role: 'user',
    timestamp: Date.now(),
    ...overrides,
  }),

  // 生成模型配置数据
  modelConfig: (overrides = {}) => ({
    id: 'test-model-1',
    name: 'Test Model',
    type: 'openai',
    provider: 'OpenAI',
    version: 'gpt-4',
    status: 'active',
    ...overrides,
  }),
}

// 测试断言辅助函数
export const expectToBeInDocument = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument()
}

export const expectToHaveTextContent = (element: HTMLElement | null, text: string) => {
  expect(element).toHaveTextContent(text)
}

export const expectToHaveClass = (element: HTMLElement | null, className: string) => {
  expect(element).toHaveClass(className)
}

export const expectToBeVisible = (element: HTMLElement | null) => {
  expect(element).toBeVisible()
}

export const expectToBeDisabled = (element: HTMLElement | null) => {
  expect(element).toBeDisabled()
}

export const expectToBeEnabled = (element: HTMLElement | null) => {
  expect(element).toBeEnabled()
}

// 测试覆盖率辅助函数
export const getCoverageReport = () => {
  if (typeof window !== 'undefined' && (window as any).__coverage__) {
    return (window as any).__coverage__
  }
  return null
}

// 清理测试环境
export const cleanupTestEnvironment = () => {
  // 清理DOM
  document.body.innerHTML = ''
  
  // 清理localStorage
  localStorage.clear()
  
  // 清理sessionStorage
  sessionStorage.clear()
  
  // 重置所有Mock
  jest.clearAllMocks()
}

// 测试配置
export const testConfig = {
  timeout: 10000,
  retries: 3,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

