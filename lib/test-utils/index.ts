/**
 * 测试工具库
 * 提供统一的测试工具和助手函数
 */

import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProvider } from '@/context/agent-context'

// 创建测试用的QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
      staleTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
})

// 自定义渲染函数
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const queryClient = createTestQueryClient()
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        {children}
      </AppProvider>
    </QueryClientProvider>
  )
  
  return render(ui, { wrapper: Wrapper, ...options })
}

// 重新导出所有内容
export * from '@testing-library/react'
export { customRender as render }

// 测试数据工厂
export const testDataFactory = {
  createUser: (overrides = {}) => ({
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    isAdmin: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }),
  
  createAgent: (overrides = {}) => ({
    id: 'test-agent-id',
    name: 'Test Agent',
    description: 'Test agent description',
    type: 'chat',
    iconType: 'robot',
    avatar: '',
    order: 100,
    isPublished: true,
    apiKey: 'test-api-key',
    appId: 'test-app-id',
    apiUrl: 'https://api.example.com',
    systemPrompt: 'You are a helpful assistant.',
    temperature: 0.7,
    maxTokens: 2000,
    multimodalModel: '',
    globalVariables: [],
    welcomeText: 'Hello! How can I help you?',
    ...overrides
  }),
  
  createMessage: (overrides = {}) => ({
    id: 'test-message-id',
    content: 'Test message',
    role: 'user' as const,
    timestamp: Date.now(),
    metadata: {},
    ...overrides
  }),
  
  createChatSession: (overrides = {}) => ({
    id: 'test-session-id',
    agentId: 'test-agent-id',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  })
}

// Mock函数工厂
export const mockFactory = {
  createMockFunction: <T extends (...args: any[]) => any>(implementation?: T) => {
    return jest.fn(implementation) as jest.MockedFunction<T>
  },
  
  createMockPromise: <T>(value: T, delay = 0) => {
    return new Promise<T>((resolve) => {
      setTimeout(() => resolve(value), delay)
    })
  },
  
  createMockRejectedPromise: (error: Error, delay = 0) => {
    return new Promise((_, reject) => {
      setTimeout(() => reject(error), delay)
    })
  }
}

// 测试助手函数
export const testHelpers = {
  // 等待异步操作完成
  waitFor: (callback: () => void | Promise<void>, options?: { timeout?: number }) => {
    return new Promise<void>((resolve, reject) => {
      const timeout = options?.timeout || 5000
      const startTime = Date.now()
      
      const check = async () => {
        try {
          await callback()
          resolve()
        } catch (error) {
          if (Date.now() - startTime > timeout) {
            reject(new Error(`Timeout after ${timeout}ms`))
          } else {
            setTimeout(check, 10)
          }
        }
      }
      
      check()
    })
  },
  
  // 模拟用户输入
  simulateUserInput: (element: HTMLElement, value: string) => {
    const input = element as HTMLInputElement
    input.value = value
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  },
  
  // 模拟键盘事件
  simulateKeyboardEvent: (element: HTMLElement, key: string, options?: KeyboardEventInit) => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, ...options }))
    element.dispatchEvent(new KeyboardEvent('keyup', { key, ...options }))
  },
  
  // 模拟鼠标事件
  simulateMouseEvent: (element: HTMLElement, eventType: string, options?: MouseEventInit) => {
    element.dispatchEvent(new MouseEvent(eventType, { bubbles: true, ...options }))
  },
  
  // 模拟文件上传
  simulateFileUpload: (element: HTMLElement, files: File[]) => {
    const input = element as HTMLInputElement
    Object.defineProperty(input, 'files', {
      value: files,
      writable: false
    })
    input.dispatchEvent(new Event('change', { bubbles: true }))
  },
  
  // 模拟网络请求
  mockFetch: (response: any, status = 200) => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response))
    })
  },
  
  // 模拟网络错误
  mockFetchError: (error: Error) => {
    global.fetch = jest.fn().mockRejectedValue(error)
  },
  
  // 清理所有mocks
  cleanupMocks: () => {
    jest.clearAllMocks()
    jest.resetAllMocks()
    jest.restoreAllMocks()
  }
}

// 测试断言助手
export const assertionHelpers = {
  // 断言元素存在
  expectElementToExist: (element: HTMLElement | null) => {
    expect(element).toBeInTheDocument()
  },
  
  // 断言元素不存在
  expectElementNotToExist: (element: HTMLElement | null) => {
    expect(element).not.toBeInTheDocument()
  },
  
  // 断言元素可见
  expectElementToBeVisible: (element: HTMLElement | null) => {
    expect(element).toBeVisible()
  },
  
  // 断言元素不可见
  expectElementNotToBeVisible: (element: HTMLElement | null) => {
    expect(element).not.toBeVisible()
  },
  
  // 断言元素包含文本
  expectElementToContainText: (element: HTMLElement | null, text: string) => {
    expect(element).toHaveTextContent(text)
  },
  
  // 断言元素有特定属性
  expectElementToHaveAttribute: (element: HTMLElement | null, attribute: string, value?: string) => {
    if (value) {
      expect(element).toHaveAttribute(attribute, value)
    } else {
      expect(element).toHaveAttribute(attribute)
    }
  },
  
  // 断言元素有特定类名
  expectElementToHaveClass: (element: HTMLElement | null, className: string) => {
    expect(element).toHaveClass(className)
  }
}

// 测试环境设置
export const testEnvironment = {
  // 设置测试环境变量
  setup: () => {
    process.env.NODE_ENV = 'test'
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api'
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
  },
  
  // 清理测试环境
  cleanup: () => {
    jest.clearAllMocks()
    jest.resetAllMocks()
    jest.restoreAllMocks()
    
    // 清理localStorage
    localStorage.clear()
    sessionStorage.clear()
    
    // 清理DOM
    document.body.innerHTML = ''
  }
}

// 测试工具函数
export * from './e2e'
export * from './performance'
export * from './factories'
export * from './config'

// 默认导出
export default {
  render: customRender,
  testDataFactory,
  mockFactory,
  testHelpers,
  assertionHelpers,
  testEnvironment
}
