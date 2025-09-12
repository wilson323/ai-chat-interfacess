/**
 * 应用状态管理测试
 * 测试 Zustand store 的功能和性能
 */

import { renderHook, act } from '@testing-library/react'
import { useAppStore } from '@/lib/store/appStore'

describe('AppStore', () => {
  beforeEach(() => {
    // 清理 store 状态
    useAppStore.setState({
      user: {
        id: null,
        name: null,
        email: null,
        avatar: null,
        isAuthenticated: false
      },
      agents: {
        list: [],
        selected: null,
        loading: false,
        error: null
      },
      ui: {
        sidebarOpen: false,
        historySidebarOpen: false,
        theme: 'system',
        language: 'zh',
        isMobile: false,
        breakpoint: 'lg'
      },
      chat: {
        currentChatId: null,
        messages: [],
        isTyping: false,
        isRequestActive: false,
        abortController: null
      },
      globalVariables: {},
      voice: {
        isRecording: false,
        isPlaying: false,
        isSupported: false,
        config: {
          language: 'zh-CN',
          autoStart: false,
          autoStop: true
        }
      }
    })
  })

  describe('用户状态管理', () => {
    it('应该正确设置用户信息', () => {
      const { result } = renderHook(() => useAppStore())
      
      act(() => {
        result.current.setUser({
          id: '1',
          name: 'Test User',
          email: 'test@example.com'
        })
      })
      
      expect(result.current.user.id).toBe('1')
      expect(result.current.user.name).toBe('Test User')
      expect(result.current.user.email).toBe('test@example.com')
      expect(result.current.user.isAuthenticated).toBe(true)
    })

    it('应该正确清除用户信息', () => {
      const { result } = renderHook(() => useAppStore())
      
      // 先设置用户信息
      act(() => {
        result.current.setUser({
          id: '1',
          name: 'Test User'
        })
      })
      
      // 然后清除
      act(() => {
        result.current.clearUser()
      })
      
      expect(result.current.user.id).toBe(null)
      expect(result.current.user.name).toBe(null)
      expect(result.current.user.isAuthenticated).toBe(false)
    })
  })

  describe('智能体状态管理', () => {
    it('应该正确设置智能体列表', () => {
      const { result } = renderHook(() => useAppStore())
      const mockAgents = [
        { id: '1', name: 'Agent 1', type: 'chat' },
        { id: '2', name: 'Agent 2', type: 'cad' }
      ]
      
      act(() => {
        result.current.setAgents(mockAgents)
      })
      
      expect(result.current.agents.list).toEqual(mockAgents)
      expect(result.current.agents.loading).toBe(false)
      expect(result.current.agents.error).toBe(null)
    })

    it('应该正确选择智能体', () => {
      const { result } = renderHook(() => useAppStore())
      const mockAgent = { id: '1', name: 'Agent 1', type: 'chat' }
      
      act(() => {
        result.current.selectAgent(mockAgent)
      })
      
      expect(result.current.agents.selected).toEqual(mockAgent)
    })

    it('应该正确更新智能体', () => {
      const { result } = renderHook(() => useAppStore())
      const mockAgents = [
        { id: '1', name: 'Agent 1', type: 'chat' },
        { id: '2', name: 'Agent 2', type: 'cad' }
      ]
      
      // 先设置智能体列表
      act(() => {
        result.current.setAgents(mockAgents)
      })
      
      // 然后更新智能体
      act(() => {
        result.current.updateAgent({
          id: '1',
          name: 'Updated Agent 1'
        })
      })
      
      const updatedAgent = result.current.agents.list.find(a => a.id === '1')
      expect(updatedAgent?.name).toBe('Updated Agent 1')
    })
  })

  describe('UI状态管理', () => {
    it('应该正确切换侧边栏', () => {
      const { result } = renderHook(() => useAppStore())
      
      expect(result.current.ui.sidebarOpen).toBe(false)
      
      act(() => {
        result.current.toggleSidebar()
      })
      
      expect(result.current.ui.sidebarOpen).toBe(true)
    })

    it('应该正确设置主题', () => {
      const { result } = renderHook(() => useAppStore())
      
      act(() => {
        result.current.setTheme('dark')
      })
      
      expect(result.current.ui.theme).toBe('dark')
    })

    it('应该正确设置语言', () => {
      const { result } = renderHook(() => useAppStore())
      
      act(() => {
        result.current.setLanguage('en')
      })
      
      expect(result.current.ui.language).toBe('en')
    })
  })

  describe('聊天状态管理', () => {
    it('应该正确添加消息', () => {
      const { result } = renderHook(() => useAppStore())
      const mockMessage = {
        id: '1',
        content: 'Hello',
        role: 'user' as const,
        timestamp: Date.now()
      }
      
      act(() => {
        result.current.addMessage(mockMessage)
      })
      
      expect(result.current.chat.messages).toHaveLength(1)
      expect(result.current.chat.messages[0]).toEqual(mockMessage)
    })

    it('应该正确更新消息', () => {
      const { result } = renderHook(() => useAppStore())
      const mockMessage = {
        id: '1',
        content: 'Hello',
        role: 'user' as const,
        timestamp: Date.now()
      }
      
      // 先添加消息
      act(() => {
        result.current.addMessage(mockMessage)
      })
      
      // 然后更新消息
      act(() => {
        result.current.updateMessage('1', {
          content: 'Updated Hello'
        })
      })
      
      const updatedMessage = result.current.chat.messages.find(m => m.id === '1')
      expect(updatedMessage?.content).toBe('Updated Hello')
    })

    it('应该正确清除消息', () => {
      const { result } = renderHook(() => useAppStore())
      const mockMessages = [
        { id: '1', content: 'Hello', role: 'user' as const, timestamp: Date.now() },
        { id: '2', content: 'Hi', role: 'assistant' as const, timestamp: Date.now() }
      ]
      
      // 先添加消息
      act(() => {
        mockMessages.forEach(msg => result.current.addMessage(msg))
      })
      
      expect(result.current.chat.messages).toHaveLength(2)
      
      // 然后清除消息
      act(() => {
        result.current.clearMessages()
      })
      
      expect(result.current.chat.messages).toHaveLength(0)
    })
  })

  describe('全局变量管理', () => {
    it('应该正确设置全局变量', () => {
      const { result } = renderHook(() => useAppStore())
      const mockVariables = {
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com'
      }
      
      act(() => {
        result.current.setGlobalVariables(mockVariables)
      })
      
      expect(result.current.globalVariables).toEqual(mockVariables)
    })

    it('应该正确更新单个全局变量', () => {
      const { result } = renderHook(() => useAppStore())
      
      // 先设置全局变量
      act(() => {
        result.current.setGlobalVariables({
          apiKey: 'test-key',
          baseUrl: 'https://api.example.com'
        })
      })
      
      // 然后更新单个变量
      act(() => {
        result.current.updateGlobalVariable('apiKey', 'updated-key')
      })
      
      expect(result.current.globalVariables.apiKey).toBe('updated-key')
      expect(result.current.globalVariables.baseUrl).toBe('https://api.example.com')
    })
  })

  describe('语音状态管理', () => {
    it('应该正确设置语音录制状态', () => {
      const { result } = renderHook(() => useAppStore())
      
      act(() => {
        result.current.setVoiceRecording(true)
      })
      
      expect(result.current.voice.isRecording).toBe(true)
    })

    it('应该正确更新语音配置', () => {
      const { result } = renderHook(() => useAppStore())
      
      act(() => {
        result.current.updateVoiceConfig({
          language: 'en-US',
          autoStart: true
        })
      })
      
      expect(result.current.voice.config.language).toBe('en-US')
      expect(result.current.voice.config.autoStart).toBe(true)
      expect(result.current.voice.config.autoStop).toBe(true) // 保持原有值
    })
  })

  describe('性能测试', () => {
    it('应该支持大量状态更新而不影响性能', () => {
      const { result } = renderHook(() => useAppStore())
      const startTime = performance.now()
      
      // 执行大量状态更新
      act(() => {
        for (let i = 0; i < 1000; i++) {
          result.current.setGlobalVariable(`key${i}`, `value${i}`)
        }
      })
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 1000次更新应该在100ms内完成
      expect(duration).toBeLessThan(100)
      expect(Object.keys(result.current.globalVariables)).toHaveLength(1000)
    })

    it('应该支持并发状态更新', () => {
      const { result } = renderHook(() => useAppStore())
      
      act(() => {
        // 并发执行多个状态更新
        result.current.setTheme('dark')
        result.current.setLanguage('en')
        result.current.toggleSidebar()
        result.current.setGlobalVariable('test', 'value')
      })
      
      expect(result.current.ui.theme).toBe('dark')
      expect(result.current.ui.language).toBe('en')
      expect(result.current.ui.sidebarOpen).toBe(true)
      expect(result.current.globalVariables.test).toBe('value')
    })
  })
})
