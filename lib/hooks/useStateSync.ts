/**
 * 状态同步 Hook
 * 负责同步服务端状态和客户端状态
 */

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store/appStore'
import { useAgents } from '@/lib/hooks/useAgents'
import { useUser } from '@/lib/store/selectors'

/**
 * 智能体状态同步
 * 将服务端的智能体数据同步到客户端状态
 */
export const useAgentSync = () => {
  const { data: agentsData, isLoading, error } = useAgents()
  const setAgents = useAppStore((state) => state.setAgents)
  const setAgentsLoading = useAppStore((state) => state.setAgentsLoading)
  const setAgentsError = useAppStore((state) => state.setAgentsError)
  
  useEffect(() => {
    // 同步加载状态
    setAgentsLoading(isLoading)
  }, [isLoading, setAgentsLoading])
  
  useEffect(() => {
    // 同步错误状态
    setAgentsError(error ? error.message : null)
  }, [error, setAgentsError])
  
  useEffect(() => {
    // 同步智能体数据
    if (agentsData && !isLoading) {
      setAgents(agentsData)
    }
  }, [agentsData, isLoading, setAgents])
}

/**
 * 用户状态同步
 * 从本地存储恢复用户状态
 */
export const useUserSync = () => {
  const user = useUser()
  const setUser = useAppStore((state) => state.setUser)
  
  useEffect(() => {
    // 从 localStorage 恢复用户状态
    const savedUser = localStorage.getItem('user')
    if (savedUser && !user.isAuthenticated) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      } catch (error) {
        console.error('恢复用户状态失败:', error)
        localStorage.removeItem('user')
      }
    }
  }, [user.isAuthenticated, setUser])
}

/**
 * 主题状态同步
 * 同步系统主题设置
 */
export const useThemeSync = () => {
  const theme = useAppStore((state) => state.ui.theme)
  const setTheme = useAppStore((state) => state.setTheme)
  
  useEffect(() => {
    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleThemeChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        // 如果当前主题设置为系统，则跟随系统变化
        document.documentElement.classList.toggle('dark', e.matches)
      }
    }
    
    // 初始设置
    if (theme === 'system') {
      document.documentElement.classList.toggle('dark', mediaQuery.matches)
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
    
    // 监听变化
    mediaQuery.addEventListener('change', handleThemeChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange)
    }
  }, [theme, setTheme])
}

/**
 * 语言状态同步
 * 同步语言设置到 DOM
 */
export const useLanguageSync = () => {
  const language = useAppStore((state) => state.ui.language)
  
  useEffect(() => {
    // 设置 HTML lang 属性
    document.documentElement.lang = language
    
    // 设置 localStorage
    localStorage.setItem('language', language)
  }, [language])
}

/**
 * 响应式状态同步
 * 同步屏幕尺寸和移动端状态
 */
export const useResponsiveSync = () => {
  const setMobile = useAppStore((state) => state.setMobile)
  const setBreakpoint = useAppStore((state) => state.setBreakpoint)
  
  useEffect(() => {
    const updateResponsiveState = () => {
      const width = window.innerWidth
      
      // 更新移动端状态
      setMobile(width < 768)
      
      // 更新断点状态
      if (width < 640) {
        setBreakpoint('sm')
      } else if (width < 768) {
        setBreakpoint('md')
      } else if (width < 1024) {
        setBreakpoint('lg')
      } else {
        setBreakpoint('xl')
      }
    }
    
    // 初始设置
    updateResponsiveState()
    
    // 监听窗口大小变化
    window.addEventListener('resize', updateResponsiveState)
    
    return () => {
      window.removeEventListener('resize', updateResponsiveState)
    }
  }, [setMobile, setBreakpoint])
}

/**
 * 全局状态同步
 * 组合所有状态同步功能
 */
export const useGlobalStateSync = () => {
  // 智能体状态同步
  useAgentSync()
  
  // 用户状态同步
  useUserSync()
  
  // 主题状态同步
  useThemeSync()
  
  // 语言状态同步
  useLanguageSync()
  
  // 响应式状态同步
  useResponsiveSync()
}

/**
 * 状态持久化同步
 * 将关键状态同步到 localStorage
 */
export const useStatePersistence = () => {
  const user = useUser()
  const globalVariables = useAppStore((state) => state.globalVariables)
  const theme = useAppStore((state) => state.ui.theme)
  const language = useAppStore((state) => state.ui.language)
  
  useEffect(() => {
    // 同步用户状态到 localStorage
    if (user.isAuthenticated) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])
  
  useEffect(() => {
    // 同步全局变量到 localStorage
    localStorage.setItem('globalVariables', JSON.stringify(globalVariables))
  }, [globalVariables])
  
  useEffect(() => {
    // 同步主题设置到 localStorage
    localStorage.setItem('theme', theme)
  }, [theme])
  
  useEffect(() => {
    // 同步语言设置到 localStorage
    localStorage.setItem('language', language)
  }, [language])
}

/**
 * 状态恢复 Hook
 * 应用启动时恢复持久化状态
 */
export const useStateRestore = () => {
  const setUser = useAppStore((state) => state.setUser)
  const setGlobalVariables = useAppStore((state) => state.setGlobalVariables)
  const setTheme = useAppStore((state) => state.setTheme)
  const setLanguage = useAppStore((state) => state.setLanguage)
  
  useEffect(() => {
    // 恢复用户状态
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      } catch (error) {
        console.error('恢复用户状态失败:', error)
        localStorage.removeItem('user')
      }
    }
    
    // 恢复全局变量
    const savedGlobalVariables = localStorage.getItem('globalVariables')
    if (savedGlobalVariables) {
      try {
        const variables = JSON.parse(savedGlobalVariables)
        setGlobalVariables(variables)
      } catch (error) {
        console.error('恢复全局变量失败:', error)
        localStorage.removeItem('globalVariables')
      }
    }
    
    // 恢复主题设置
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setTheme(savedTheme as 'light' | 'dark' | 'system')
    }
    
    // 恢复语言设置
    const savedLanguage = localStorage.getItem('language')
    if (savedLanguage && ['zh', 'en'].includes(savedLanguage)) {
      setLanguage(savedLanguage as 'zh' | 'en')
    }
  }, [setUser, setGlobalVariables, setTheme, setLanguage])
}
