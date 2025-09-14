/**
 * 统一应用状态管理
 * 基于 Zustand 的全局状态管理，支持持久化和性能优化
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Agent, Message } from '@/types';

/**
 * 应用状态接口
 * 包含所有全局状态和操作方法
 */
interface AppState {
  // 用户状态
  user: {
    id: string | null;
    name: string | null;
    email: string | null;
    avatar: string | null;
    isAuthenticated: boolean;
  };

  // 智能体状态
  agents: {
    list: Agent[];
    selected: Agent | null;
    loading: boolean;
    error: string | null;
  };

  // UI状态
  ui: {
    sidebarOpen: boolean;
    historySidebarOpen: boolean;
    theme: 'light' | 'dark' | 'system';
    language: 'zh' | 'en';
    isMobile: boolean;
    breakpoint: 'sm' | 'md' | 'lg' | 'xl';
  };

  // 聊天状态
  chat: {
    currentChatId: string | null;
    messages: Message[];
    isTyping: boolean;
    isRequestActive: boolean;
    abortController: AbortController | null;
  };

  // 全局变量
  globalVariables: Record<string, any>;

  // 语音状态
  voice: {
    isRecording: boolean;
    isPlaying: boolean;
    isSupported: boolean;
    config: {
      language: string;
      autoStart: boolean;
      autoStop: boolean;
    };
  };

  // Actions - 用户相关
  setUser: (user: Partial<AppState['user']>) => void;
  clearUser: () => void;

  // Actions - 智能体相关
  setAgents: (agents: Agent[]) => void;
  selectAgent: (agent: Agent) => void;
  updateAgent: (agent: Partial<Agent>) => void;
  setAgentsLoading: (loading: boolean) => void;
  setAgentsError: (error: string | null) => void;

  // Actions - UI相关
  toggleSidebar: () => void;
  toggleHistorySidebar: () => void;
  closeSidebars: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'zh' | 'en') => void;
  setMobile: (isMobile: boolean) => void;
  setBreakpoint: (breakpoint: 'sm' | 'md' | 'lg' | 'xl') => void;

  // Actions - 聊天相关
  setCurrentChatId: (chatId: string | null) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  removeMessage: (messageId: string) => void;
  clearMessages: () => void;
  setTyping: (typing: boolean) => void;
  setRequestActive: (active: boolean) => void;
  setAbortController: (controller: AbortController | null) => void;

  // Actions - 全局变量相关
  setGlobalVariables: (variables: Record<string, any>) => void;
  updateGlobalVariable: (key: string, value: any) => void;
  clearGlobalVariables: () => void;

  // Actions - 语音相关
  setVoiceRecording: (recording: boolean) => void;
  setVoicePlaying: (playing: boolean) => void;
  setVoiceSupported: (supported: boolean) => void;
  updateVoiceConfig: (config: Partial<AppState['voice']['config']>) => void;
}

/**
 * 创建应用状态管理 Store
 * 使用 Zustand + Immer + Persist 中间件
 */
export const useAppStore = create<AppState>()(
  persist(
    immer((set, get) => ({
      // 初始状态
      user: {
        id: null,
        name: null,
        email: null,
        avatar: null,
        isAuthenticated: false,
      },

      agents: {
        list: [],
        selected: null,
        loading: false,
        error: null,
      },

      ui: {
        sidebarOpen: false,
        historySidebarOpen: false,
        theme: 'system',
        language: 'zh',
        isMobile: false,
        breakpoint: 'lg',
      },

      chat: {
        currentChatId: null,
        messages: [],
        isTyping: false,
        isRequestActive: false,
        abortController: null,
      },

      globalVariables: {},

      voice: {
        isRecording: false,
        isPlaying: false,
        isSupported: false,
        config: {
          language: 'zh-CN',
          autoStart: false,
          autoStop: true,
        },
      },

      // 用户相关 Actions
      setUser: user =>
        set(state => {
          Object.assign(state.user, user);
          state.user.isAuthenticated = true;
        }),

      clearUser: () =>
        set(state => {
          state.user = {
            id: null,
            name: null,
            email: null,
            avatar: null,
            isAuthenticated: false,
          };
        }),

      // 智能体相关 Actions
      setAgents: agents =>
        set(state => {
          state.agents.list = agents;
          state.agents.loading = false;
          state.agents.error = null;
        }),

      selectAgent: agent =>
        set(state => {
          state.agents.selected = agent;
        }),

      updateAgent: agent =>
        set(state => {
          const index = state.agents.list.findIndex(a => a.id === agent.id);
          if (index !== -1) {
            Object.assign(state.agents.list[index], agent);
          }
          if (state.agents.selected?.id === agent.id) {
            Object.assign(state.agents.selected, agent);
          }
        }),

      setAgentsLoading: loading =>
        set(state => {
          state.agents.loading = loading;
        }),

      setAgentsError: error =>
        set(state => {
          state.agents.error = error;
        }),

      // UI相关 Actions
      toggleSidebar: () =>
        set(state => {
          state.ui.sidebarOpen = !state.ui.sidebarOpen;
        }),

      toggleHistorySidebar: () =>
        set(state => {
          state.ui.historySidebarOpen = !state.ui.historySidebarOpen;
        }),

      closeSidebars: () =>
        set(state => {
          state.ui.sidebarOpen = false;
          state.ui.historySidebarOpen = false;
        }),

      setTheme: theme =>
        set(state => {
          state.ui.theme = theme;
        }),

      setLanguage: language =>
        set(state => {
          state.ui.language = language;
        }),

      setMobile: isMobile =>
        set(state => {
          state.ui.isMobile = isMobile;
        }),

      setBreakpoint: breakpoint =>
        set(state => {
          state.ui.breakpoint = breakpoint;
        }),

      // 聊天相关 Actions
      setCurrentChatId: chatId =>
        set(state => {
          state.chat.currentChatId = chatId;
        }),

      addMessage: message =>
        set(state => {
          state.chat.messages.push(message);
        }),

      updateMessage: (messageId, updates) =>
        set(state => {
          const index = state.chat.messages.findIndex(m => m.id === messageId);
          if (index !== -1) {
            Object.assign(state.chat.messages[index], updates);
          }
        }),

      removeMessage: messageId =>
        set(state => {
          state.chat.messages = state.chat.messages.filter(
            m => m.id !== messageId
          );
        }),

      clearMessages: () =>
        set(state => {
          state.chat.messages = [];
        }),

      setTyping: typing =>
        set(state => {
          state.chat.isTyping = typing;
        }),

      setRequestActive: active =>
        set(state => {
          state.chat.isRequestActive = active;
        }),

      setAbortController: controller =>
        set(state => {
          state.chat.abortController = controller;
        }),

      // 全局变量相关 Actions
      setGlobalVariables: variables =>
        set(state => {
          state.globalVariables = { ...state.globalVariables, ...variables };
        }),

      updateGlobalVariable: (key, value) =>
        set(state => {
          state.globalVariables[key] = value;
        }),

      clearGlobalVariables: () =>
        set(state => {
          state.globalVariables = {};
        }),

      // 语音相关 Actions
      setVoiceRecording: recording =>
        set(state => {
          state.voice.isRecording = recording;
        }),

      setVoicePlaying: playing =>
        set(state => {
          state.voice.isPlaying = playing;
        }),

      setVoiceSupported: supported =>
        set(state => {
          state.voice.isSupported = supported;
        }),

      updateVoiceConfig: config =>
        set(state => {
          Object.assign(state.voice.config, config);
        }),
    })),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      // 只持久化关键状态，避免存储大量临时数据
      partialize: state => ({
        user: state.user,
        ui: {
          theme: state.ui.theme,
          language: state.ui.language,
        },
        globalVariables: state.globalVariables,
        voice: {
          config: state.voice.config,
        },
      }),
    }
  )
);

/**
 * 状态选择器 - 用于精确订阅状态片段
 * 避免不必要的重渲染
 */
export const selectors = {
  // 用户状态选择器
  user: (state: AppState) => state.user,
  userActions: (state: AppState) => ({
    setUser: state.setUser,
    clearUser: state.clearUser,
  }),

  // 智能体状态选择器
  agents: (state: AppState) => state.agents,
  selectedAgent: (state: AppState) => state.agents.selected,
  agentActions: (state: AppState) => ({
    setAgents: state.setAgents,
    selectAgent: state.selectAgent,
    updateAgent: state.updateAgent,
    setAgentsLoading: state.setAgentsLoading,
    setAgentsError: state.setAgentsError,
  }),

  // UI状态选择器
  ui: (state: AppState) => state.ui,
  sidebar: (state: AppState) => ({
    sidebarOpen: state.ui.sidebarOpen,
    historySidebarOpen: state.ui.historySidebarOpen,
    toggleSidebar: state.toggleSidebar,
    toggleHistorySidebar: state.toggleHistorySidebar,
    closeSidebars: state.closeSidebars,
  }),

  // 聊天状态选择器
  chat: (state: AppState) => state.chat,
  messages: (state: AppState) => state.chat.messages,
  chatActions: (state: AppState) => ({
    setCurrentChatId: state.setCurrentChatId,
    addMessage: state.addMessage,
    updateMessage: state.updateMessage,
    removeMessage: state.removeMessage,
    clearMessages: state.clearMessages,
    setTyping: state.setTyping,
    setRequestActive: state.setRequestActive,
    setAbortController: state.setAbortController,
  }),

  // 全局变量选择器
  globalVariables: (state: AppState) => state.globalVariables,
  globalVariableActions: (state: AppState) => ({
    setGlobalVariables: state.setGlobalVariables,
    updateGlobalVariable: state.updateGlobalVariable,
    clearGlobalVariables: state.clearGlobalVariables,
  }),

  // 语音状态选择器
  voice: (state: AppState) => state.voice,
  voiceActions: (state: AppState) => ({
    setVoiceRecording: state.setVoiceRecording,
    setVoicePlaying: state.setVoicePlaying,
    setVoiceSupported: state.setVoiceSupported,
    updateVoiceConfig: state.updateVoiceConfig,
  }),
};

/**
 * 状态调试工具
 * 开发环境下提供状态调试功能
 */
if (process.env.NODE_ENV === 'development') {
  // 全局暴露 store 用于调试
  (window as any).__APP_STORE__ = useAppStore;

  // 状态变化监听
  useAppStore.subscribe(state => {
    console.log('App State Changed:', state);
  });
}
