/**
 * 状态选择器
 * 提供精确的状态订阅，避免不必要的重渲染
 */

import { useAppStore, selectors } from './appStore'

/**
 * 用户状态选择器
 */
export const useUser = () => useAppStore(selectors.user)
export const useUserActions = () => useAppStore(selectors.userActions)

/**
 * 智能体状态选择器
 */
export const useAgents = () => useAppStore(selectors.agents)
export const useSelectedAgent = () => useAppStore(selectors.selectedAgent)
export const useAgentActions = () => useAppStore(selectors.agentActions)

/**
 * UI状态选择器
 */
export const useUI = () => useAppStore(selectors.ui)
export const useSidebar = () => useAppStore(selectors.sidebar)
export const useTheme = () => useAppStore((state) => state.ui.theme)
export const useLanguage = () => useAppStore((state) => state.ui.language)

/**
 * 聊天状态选择器
 */
export const useChat = () => useAppStore(selectors.chat)
export const useMessages = () => useAppStore(selectors.messages)
export const useChatActions = () => useAppStore(selectors.chatActions)
export const useTyping = () => useAppStore((state) => state.chat.isTyping)
export const useRequestActive = () => useAppStore((state) => state.chat.isRequestActive)

/**
 * 全局变量选择器
 */
export const useGlobalVariables = () => useAppStore(selectors.globalVariables)
export const useGlobalVariableActions = () => useAppStore(selectors.globalVariableActions)

/**
 * 语音状态选择器
 */
export const useVoice = () => useAppStore(selectors.voice)
export const useVoiceActions = () => useAppStore(selectors.voiceActions)
export const useVoiceRecording = () => useAppStore((state) => state.voice.isRecording)
export const useVoicePlaying = () => useAppStore((state) => state.voice.isPlaying)

/**
 * 组合选择器 - 常用状态组合
 */
export const useAppState = () => useAppStore((state) => ({
  user: state.user,
  agents: state.agents,
  ui: state.ui,
  chat: state.chat,
  globalVariables: state.globalVariables,
  voice: state.voice
}))

/**
 * 认证状态选择器
 */
export const useAuth = () => useAppStore((state) => ({
  isAuthenticated: state.user.isAuthenticated,
  user: state.user,
  setUser: state.setUser,
  clearUser: state.clearUser
}))

/**
 * 智能体管理选择器
 */
export const useAgentManagement = () => useAppStore((state) => ({
  agents: state.agents.list,
  selectedAgent: state.agents.selected,
  loading: state.agents.loading,
  error: state.agents.error,
  setAgents: state.setAgents,
  selectAgent: state.selectAgent,
  updateAgent: state.updateAgent,
  setAgentsLoading: state.setAgentsLoading,
  setAgentsError: state.setAgentsError
}))

/**
 * 聊天管理选择器
 */
export const useChatManagement = () => useAppStore((state) => ({
  currentChatId: state.chat.currentChatId,
  messages: state.chat.messages,
  isTyping: state.chat.isTyping,
  isRequestActive: state.chat.isRequestActive,
  abortController: state.chat.abortController,
  setCurrentChatId: state.setCurrentChatId,
  addMessage: state.addMessage,
  updateMessage: state.updateMessage,
  removeMessage: state.removeMessage,
  clearMessages: state.clearMessages,
  setTyping: state.setTyping,
  setRequestActive: state.setRequestActive,
  setAbortController: state.setAbortController
}))

/**
 * UI管理选择器
 */
export const useUIManagement = () => useAppStore((state) => ({
  sidebarOpen: state.ui.sidebarOpen,
  historySidebarOpen: state.ui.historySidebarOpen,
  theme: state.ui.theme,
  language: state.ui.language,
  isMobile: state.ui.isMobile,
  breakpoint: state.ui.breakpoint,
  toggleSidebar: state.toggleSidebar,
  toggleHistorySidebar: state.toggleHistorySidebar,
  closeSidebars: state.closeSidebars,
  setTheme: state.setTheme,
  setLanguage: state.setLanguage,
  setMobile: state.setMobile,
  setBreakpoint: state.setBreakpoint
}))

/**
 * 全局变量管理选择器
 */
export const useGlobalVariableManagement = () => useAppStore((state) => ({
  globalVariables: state.globalVariables,
  setGlobalVariables: state.setGlobalVariables,
  updateGlobalVariable: state.updateGlobalVariable,
  clearGlobalVariables: state.clearGlobalVariables
}))

/**
 * 语音管理选择器
 */
export const useVoiceManagement = () => useAppStore((state) => ({
  isRecording: state.voice.isRecording,
  isPlaying: state.voice.isPlaying,
  isSupported: state.voice.isSupported,
  config: state.voice.config,
  setVoiceRecording: state.setVoiceRecording,
  setVoicePlaying: state.setVoicePlaying,
  setVoiceSupported: state.setVoiceSupported,
  updateVoiceConfig: state.updateVoiceConfig
}))

/**
 * 性能优化选择器 - 返回稳定的引用
 */
export const useStableSelectors = () => {
  const user = useUser()
  const userActions = useUserActions()
  const agents = useAgents()
  const selectedAgent = useSelectedAgent()
  const agentActions = useAgentActions()
  const ui = useUI()
  const sidebar = useSidebar()
  const chat = useChat()
  const messages = useMessages()
  const chatActions = useChatActions()
  const globalVariables = useGlobalVariables()
  const globalVariableActions = useGlobalVariableActions()
  const voice = useVoice()
  const voiceActions = useVoiceActions()

  return {
    user,
    userActions,
    agents,
    selectedAgent,
    agentActions,
    ui,
    sidebar,
    chat,
    messages,
    chatActions,
    globalVariables,
    globalVariableActions,
    voice,
    voiceActions
  }
}
