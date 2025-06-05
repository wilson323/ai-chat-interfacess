"use client"

import type React from "react"
import type { UploadedFile } from "@/components/file-uploader"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAgent } from "@/context/agent-context"
import { Paperclip, Mic, SendHorizonal, Loader2, ImageIcon, FileIcon, X } from "lucide-react"
import { type Message, MessageType, MessageRole } from "@/types/message"
import { ChatMessage } from "@/components/chat-message"
import { FileUploader } from "@/components/file-uploader"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils" // 移除 getDeviceId 导入，因为我们现在从 storage 导入它
import { useToast } from "@/components/ui/use-toast"

import { ChatOptions } from "@/components/chat-options"
import { ChatHistory } from "@/components/chat-history"


import { useMobile } from "@/hooks/use-mobile"

import { validateInput, sanitizeInput } from "@/lib/security"

// 导入新的统一API模块
import { FastGPTClient, generateFallbackChatId, initializeChat } from "@/lib/api/fastgpt"

// 导入统一存储服务
import { HistoryManager } from "@/components/history-manager"

import type { ProcessingStep } from "@/types/message"

import { useMessageStore } from "@/lib/store/messageStore"

import { VoiceInput } from "@/components/voice/VoiceInput"
import { useLanguage } from "@/context/language-context"
import type { ConversationAgentType, Agent } from "@/types/agent"
// InteractiveNode 组件已移除，现在使用气泡内的 InlineBubbleInteractive
import { GlobalVariablesForm } from "@/components/global-variables-form"
import { NewConversationButton } from "@/components/new-conversation-button"
import {
  safeCrossPlatformJSONParse,
  validateInteractiveNodeData,
  safeCrossPlatformClone,
  safeCrossPlatformLog,
  createCrossPlatformDebugInfo
} from "@/lib/cross-platform-utils"
import { useVoiceRecorder } from './voice/hooks/useVoiceRecorder'
// 确保 VoiceConfig 类型被导入或定义
import type { VoiceConfig } from '@/types/voice' // 假设 VoiceConfig 类型路径

const createNewConversation = () => {
  window.dispatchEvent(new CustomEvent("new-conversation"))
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay = 200) {
  let timer: any
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function ChatContainer() {
  const {
    selectedAgent,
    toggleHistorySidebar,
    selectAgent,
    showGlobalVariablesForm,
    setShowGlobalVariablesForm,
    globalVariables,
    setGlobalVariables,
    setAbortController
  } = useAgent()
  const { t } = useLanguage()
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const isMobile = useMobile()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  // Declare isUploading state here to avoid initialization errors
  const [isUploading, setIsUploading] = useState(false)

  const [chatId, setChatId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const { toast } = useToast()

  // 根据智能体类型判断是否显示CAD解读界面
  const isCADAnalyzer = selectedAgent?.type === "cad-analyzer"

  // 新增状态
  const [welcomeMessage, setWelcomeMessage] = useState<string>("")
  const [systemPrompt, setSystemPrompt] = useState<string | null>(null)
  const [interacts, setInteracts] = useState<any[]>([])
  const [fastGPTClient, setFastGPTClient] = useState<FastGPTClient | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [textareaHeight, setTextareaHeight] = useState<number>(60)
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [isInitializing, setIsInitializing] = useState<boolean>(false) // 🔥 新增：初始化状态
  const [showHistoryManager, setShowHistoryManager] = useState(false)

  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([])
  const [showProcessingFlow, setShowProcessingFlow] = useState<boolean>(false) // 设置为false，禁用处理流程显示

  const [suggestions, setSuggestions] = useState<string[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)

  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [voiceInputVisible, setVoiceInputVisible] = useState(false)

  // 新增流式请求abort控制
  const abortControllerRef = useRef<AbortController | null>(null)

  // 🔥 新增：欢迎消息动画控制
  const welcomeAnimationRef = useRef<NodeJS.Timeout | null>(null)

  // 新增 currentNodeName 状态
  const [currentNodeName, setCurrentNodeName] = useState<string>("")

  // 🔥 新增：交互节点输入框禁用状态
  const [isInteractionPending, setIsInteractionPending] = useState(false)

  // 交互节点状态已移除，现在使用消息内的 interactiveData 字段

  // 🔥 新增：智能体验证机制
  const currentAgentRef = useRef<string | undefined>(selectedAgent?.id)

  // 🔥 新增：请求状态跟踪
  const [requestState, setRequestState] = useState<{
    isActive: boolean
    agentId?: string
    requestId?: string
  }>({
    isActive: false
  })

  // Get the device ID for user tracking
  const [deviceId] = useState<string>(() => generateFallbackChatId())

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 1. 定义 voiceConfig
  // 您可能需要根据 selectedAgent 或其他逻辑来动态配置它
  const voiceConfig: VoiceConfig = {
    enabled: true, // 示例配置
    sampleRate: 16000,
    maxDuration: 60,
    language: 'zh-CN', // 添加缺失的language属性
    // 根据您的 VoiceConfig 类型和 useVoiceRecorder 的需求填写其他字段
  };

  // 2. 调用 useVoiceRecorder 并移到顶层
  const {
    state: voiceState, // 假设 useVoiceRecorder 返回 state 对象
    startRecording: startRecordingVoice,
    stopRecording: stopRecordingVoice,
    // cleanup: cleanupVoice, // cleanupVoice 似乎未在 ChatContainer 中直接使用，如果需要，请解开注释
    // audioBlob, // audioBlob 现在应该从 voiceState 中获取，例如 voiceState.audioBlob
  } = useVoiceRecorder(voiceConfig); // 传递 config

  // 从 voiceState 中获取 audioBlob 和 isRecording
  const audioBlob = voiceState.audioBlob;
  const isRecordingVoice = voiceState.isRecording;
  // const voiceError = voiceState.error; // 如果需要处理错误

  // 🔥 将 handleVoiceTranscript 移动到所有 useState 之后，但在其他 useCallback 之前
  // 处理语音转录
  const handleVoiceTranscript = useCallback((text: string) => {
    if (text.trim()) {
      setInput(prev => prev + text)
      setVoiceInputVisible(false)
    }
  }, []) // setInput 和 setVoiceInputVisible 是 state setters，它们是稳定的，不需要作为依赖

  // 3. 将 handleVoiceInput 移到顶层
  const handleVoiceInput = useCallback(async () => {
    if (isRecordingVoice) {
      await stopRecordingVoice() // 确保 stopRecordingVoice 是 async 并且正确 await
    } else {
      await startRecordingVoice()
    }
  }, [isRecordingVoice, startRecordingVoice, stopRecordingVoice])

  // 4. 将处理 audioBlob 的 useEffect 移到顶层
  useEffect(() => {
    if (audioBlob) {
      // 这里可以添加音频转文字的逻辑
      console.log('收到音频数据:', audioBlob)
      // 可以调用语音识别API或其他处理逻辑
    }
  }, [audioBlob])

  // 更新当前智能体引用
  useEffect(() => {
    currentAgentRef.current = selectedAgent?.id
  }, [selectedAgent?.id])

  // 创建验证函数
  const isCurrentAgent = useCallback((agentId?: string) => {
    return agentId === currentAgentRef.current
  }, [])

  // 在发送请求前设置状态
  const startRequest = useCallback((agentId: string) => {
    const requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    setRequestState({
      isActive: true,
      agentId,
      requestId
    })
    return requestId
  }, [])

  // 在请求结束时清理状态
  const endRequest = useCallback(() => {
    setRequestState({
      isActive: false
    })
  }, [])

  // 定义toggleHistory函数
  const toggleHistory = () => {
    // 如果我们正在打开历史记录，确保我们有一个有效的chatId
    if (!chatId && selectedAgent) {
      const fallbackChatId = generateFallbackChatId()
      setChatId(fallbackChatId)
      selectedAgent.chatId = fallbackChatId
    }

    // 显示历史记录对话框
    setShowHistory(true)

    // Debug storage state when opening history
    // const storageState = debugStorageState()
    // console.log("Storage state when opening history:", storageState)
  }

  // 当智能体变化时初始化聊天会话
  useEffect(() => {
    if (selectedAgent) {
      console.log('智能体变化，初始化聊天会话:', selectedAgent.name);

      // 如果智能体已经有chatId，尝试加载现有会话
      if (selectedAgent.chatId) {
        console.log('智能体已有chatId，尝试加载现有会话:', selectedAgent.chatId);
        const existingMessages = useMessageStore.getState().loadMessages(selectedAgent.chatId as ConversationAgentType);

        if (existingMessages && existingMessages.length > 0) {
          console.log(`找到现有会话，加载 ${existingMessages.length} 条消息`);
          setMessages(existingMessages);
          setChatId(selectedAgent.chatId);

          // 尝试从localStorage恢复初始化信息
          const savedWelcomeMessage = localStorage.getItem(`agent_${selectedAgent.id}_welcome_message`);
          const savedSystemPrompt = localStorage.getItem(`agent_${selectedAgent.id}_system_prompt`);
          const savedInteracts = localStorage.getItem(`agent_${selectedAgent.id}_interacts`);

          if (savedWelcomeMessage) {
            setWelcomeMessage(savedWelcomeMessage);
          }

          if (savedSystemPrompt) {
            setSystemPrompt(savedSystemPrompt);
          }

          if (savedInteracts) {
            try {
              setInteracts(JSON.parse(savedInteracts));
            } catch (e) {
              console.error("解析保存的交互选项时出错:", e);
              setInteracts([]);
            }
          }

          return;
        }
      }

      // 如果没有现有会话或加载失败，初始化新会话
      initChatSession();
    }
  }, [selectedAgent])

  // 初始化 FastGPT 客户端
  useEffect(() => {
    if (selectedAgent) {
      const client = new FastGPTClient(selectedAgent, {
        maxRetries: 2,
        onRetry: (attempt, error) => {
          console.log(`重试连接 (${attempt}/2): ${error.message}`)
          toast({
            title: `重试连接 (${attempt}/2)`,
            description: error.message,
            variant: "default",
          })
        },
      })
      setFastGPTClient(client)
    }
  }, [selectedAgent, toast])

  // 添加自定义事件监听器以支持从其他组件打开历史记录
  useEffect(() => {
    const handleToggleHistory = () => {
      // 如果我们正在打开历史记录，确保我们有一个有效的chatId
      if (!chatId && selectedAgent) {
        const fallbackChatId = generateFallbackChatId()
        setChatId(fallbackChatId)
        selectedAgent.chatId = fallbackChatId
      }

      // 显示历史记录对话框
      setShowHistory(true)
    }

    window.addEventListener("toggle-history", handleToggleHistory)

    return () => {
      window.removeEventListener("toggle-history", handleToggleHistory)
    }
  }, [chatId, selectedAgent]) // 添加依赖项

  // 初始化存储系统
  // useEffect(() => {
  //   // 初始化存储系统
  //   initStorage()

  //   // 调试存储状态
  //   const storageState = debugStorageState()
  //   console.log("Initial storage state:", storageState)
  // }, [])

  // Add an event listener for the agent-selected event
  useEffect(() => {
    const handleAgentSelected = (event: CustomEvent) => {
      const agent = event.detail
      if (agent) {
        // Clear messages
        setMessages([])

        // Initialize chat session with the new agent
        setTimeout(() => {
          initChatSession()
        }, 100)
      }
    }

    window.addEventListener("agent-selected", handleAgentSelected as EventListener)

    return () => {
      window.removeEventListener("agent-selected", handleAgentSelected as EventListener)
    }
  }, [])

  // 🔥 新增：缓存管理函数
  const getCacheKey = useCallback((agentId: string, type: 'welcome' | 'system' | 'interacts') => {
    return `agent_${agentId}_${type}_v2` // 添加版本号避免旧缓存冲突
  }, [])

  const clearAgentCache = useCallback((agentId: string) => {
    try {
      localStorage.removeItem(getCacheKey(agentId, 'welcome'))
      localStorage.removeItem(getCacheKey(agentId, 'system'))
      localStorage.removeItem(getCacheKey(agentId, 'interacts'))
      console.log(`已清理智能体 ${agentId} 的缓存`)
    } catch (error) {
      console.error('清理智能体缓存失败:', error)
    }
  }, [getCacheKey])

  const saveAgentCache = useCallback((agent: Agent, welcomeText: string, systemPrompt: string, interacts: any[]) => {
    try {
      localStorage.setItem(getCacheKey(agent.id, 'welcome'), welcomeText)
      localStorage.setItem(getCacheKey(agent.id, 'system'), systemPrompt)
      localStorage.setItem(getCacheKey(agent.id, 'interacts'), JSON.stringify(interacts))
      console.log(`已保存智能体 ${agent.id} 的缓存`)
    } catch (error) {
      console.error('保存智能体缓存失败:', error)
    }
  }, [getCacheKey])

  const loadAgentCache = useCallback((agentId: string) => {
    try {
      return {
        welcomeMessage: localStorage.getItem(getCacheKey(agentId, 'welcome')),
        systemPrompt: localStorage.getItem(getCacheKey(agentId, 'system')),
        interacts: localStorage.getItem(getCacheKey(agentId, 'interacts'))
      }
    } catch (error) {
      console.error('加载智能体缓存失败:', error)
      return { welcomeMessage: null, systemPrompt: null, interacts: null }
    }
  }, [getCacheKey])

  // Update the initChatSession function to properly handle welcome messages
  const initChatSession = useCallback(async () => {
    if (!selectedAgent) return

    try {
      console.log("🚀 开始初始化聊天会话，智能体:", selectedAgent.name)

      // 🔥 设置初始化状态，禁用发送功能
      setIsInitializing(true)

      // 生成本地chatId
      const localChatId = generateFallbackChatId()
      setChatId(localChatId)
      if (selectedAgent) selectedAgent.chatId = localChatId

      // 清空消息队列，避免重复开场白
      setMessages([])

      setConnectionError(null)

      // 从API获取初始化信息
      const initResponse = await initializeChat(selectedAgent)

      // 优先级：FastGPT API 返回 > 管理员配置 > 默认
      let welcomeText = initResponse?.data?.app?.chatConfig?.welcomeText
      if (!welcomeText || typeof welcomeText !== 'string') {
        welcomeText = selectedAgent?.welcomeText || "你好！我是智能助手，有什么可以帮您？"
      }
      const welcomeMessage = (initResponse as any)?.welcome_message || welcomeText
      setWelcomeMessage(welcomeMessage)

      // 设置系统提示词
      const systemPromptText = (initResponse as any)?.system_prompt || selectedAgent?.systemPrompt || null
      setSystemPrompt(systemPromptText)

      // 设置交互选项
      const interactOptions = Array.isArray((initResponse as any)?.interacts)
        ? (initResponse as any).interacts
        : Array.isArray(initResponse?.data?.interacts)
          ? initResponse.data.interacts
          : []
      setInteracts(interactOptions)

      // 只插入一次开场白到消息队列
      animateWelcomeMessage(welcomeMessage)

      // 🔥 修改：使用新的缓存接口保存
      if (selectedAgent) {
        saveAgentCache(selectedAgent, welcomeMessage, systemPromptText || '', interactOptions)
      }
    } catch (error) {
      console.error("Unexpected error during chat initialization:", error)

      // 🔥 初始化失败时，恢复发送功能
      setIsInitializing(false)
      setIsTyping(false)

      if (error instanceof Error) {
        setConnectionError(error.message)
      } else {
        setConnectionError("Unexpected error during initialization")
      }

      // Generate a new emergency fallback ID
      const emergencyFallbackId = `emergency_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${deviceId}`
      setChatId(emergencyFallbackId)

      if (selectedAgent) {
        selectedAgent.chatId = emergencyFallbackId
      }

      // 🔥 修改：尝试从新缓存接口恢复初始化信息
      if (selectedAgent) {
        const cache = loadAgentCache(selectedAgent.id)

        if (cache.welcomeMessage) {
          setWelcomeMessage(cache.welcomeMessage);
        }

        if (cache.systemPrompt) {
          setSystemPrompt(cache.systemPrompt);
        }

        if (cache.interacts) {
          try {
            setInteracts(JSON.parse(cache.interacts));
          } catch (e) {
            console.error("解析保存的交互选项时出错:", e);
            setInteracts([]);
          }
        }
      }
    }
  }, [selectedAgent, deviceId, saveAgentCache, loadAgentCache]) // 🔥 修改：添加缓存函数依赖

  // 🔥 新增：专门用于智能体切换的初始化函数，接受智能体参数避免闭包陷阱
  const initChatSessionWithAgent = useCallback(async (targetAgent: Agent) => {
    if (!targetAgent) return

    try {
      console.log("🚀 立即对话模式：初始化智能体", targetAgent.name, "ID:", targetAgent.id)

      // 🔥 新增：立即清理目标智能体的旧缓存，避免污染
      clearAgentCache(targetAgent.id)

      // 🔥 立即对话：快速设置初始化状态
      setIsInitializing(true)

      // 🔥 立即设置占位符，防止显示其他智能体内容
      setWelcomeMessage("正在初始化...")
      setSystemPrompt("")
      setInteracts([])

      // 确保使用目标智能体的chatId
      if (!targetAgent.chatId) {
        const localChatId = generateFallbackChatId()
        targetAgent.chatId = localChatId
        setChatId(localChatId)
      } else {
        setChatId(targetAgent.chatId)
      }

      // 🔥 立即对话：确保消息队列为空
      setMessages([])
      setConnectionError(null)

      // 🔥 立即对话：并行处理初始化和UI更新
      console.log("🔗 立即对话：调用initializeChat，智能体:", targetAgent.name, "appId:", targetAgent.appId)
      const initResponse = await initializeChat(targetAgent)

      // 优先级：FastGPT API 返回 > 管理员配置 > 默认
      let welcomeText = initResponse?.data?.app?.chatConfig?.welcomeText
      if (!welcomeText || typeof welcomeText !== 'string') {
        welcomeText = targetAgent?.welcomeText || "你好！我是智能助手，有什么可以帮您？"
      }
      const welcomeMessage = (initResponse as any)?.welcome_message || welcomeText
      setWelcomeMessage(welcomeMessage)

      // 设置系统提示词
      const systemPromptText = (initResponse as any)?.system_prompt || targetAgent?.systemPrompt || null
      setSystemPrompt(systemPromptText)

      // 设置交互选项
      const interactOptions = Array.isArray((initResponse as any)?.interacts)
        ? (initResponse as any).interacts
        : Array.isArray(initResponse?.data?.interacts)
          ? initResponse.data.interacts
          : []
      setInteracts(interactOptions)

      // 🔥 修改：使用新的缓存接口保存
      saveAgentCache(targetAgent, welcomeMessage, systemPromptText || '', interactOptions)

      // 🔥 立即对话：快速播放欢迎消息
      console.log("🎬 立即对话：播放欢迎消息", targetAgent.name, "消息:", welcomeMessage)
      animateWelcomeMessage(welcomeMessage)
    } catch (error) {
      console.error("使用指定智能体初始化聊天会话时出错:", error, "智能体:", targetAgent?.name)

      // 🔥 新增：失败时也要清理缓存，避免显示错误内容
      clearAgentCache(targetAgent.id)

      // 🔥 初始化失败时，恢复发送功能
      setIsInitializing(false)
      setIsTyping(false)

      if (error instanceof Error) {
        setConnectionError(error.message)
      } else {
        setConnectionError("初始化失败")
      }

      // Generate a new emergency fallback ID
      const emergencyFallbackId = `emergency_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${deviceId}`
      setChatId(emergencyFallbackId)

      if (targetAgent) {
        targetAgent.chatId = emergencyFallbackId
      }

      // 🔥 修改：失败时不从缓存恢复，使用默认值
      setWelcomeMessage(targetAgent.welcomeText || "初始化失败，请重试")
      setSystemPrompt("")
      setInteracts([])
    }
  }, [deviceId, clearAgentCache, saveAgentCache]) // 🔥 修改：添加缓存函数依赖

  // 🔥 新增：智能体切换监听
  useEffect(() => {
    const handleAgentSwitching = (event: CustomEvent) => {
      const { fromAgent, toAgent, startNewConversation } = event.detail
      console.log('🚀 智能体切换开始:', fromAgent?.name, '->', toAgent?.name, '开始新对话:', startNewConversation)

      // 🔥 立即中断当前流式输出
      if (abortControllerRef.current) {
        console.log('⚡ 立即中断流式请求')
        try {
          abortControllerRef.current.abort()
        } catch (error: any) {
          // 忽略 AbortError，这是预期的行为
          if (error.name !== 'AbortError') {
            console.warn('中断流式请求时发生意外错误:', error)
          }
        }
        abortControllerRef.current = null
      }

      // 🔥 立即中断欢迎消息动画
      if (welcomeAnimationRef.current) {
        console.log('⚡ 立即中断欢迎消息动画')
        clearInterval(welcomeAnimationRef.current)
        welcomeAnimationRef.current = null
      }

      // 🔥 立即清理所有状态
      setIsTyping(false)
      setProcessingSteps([])
      setCurrentNodeName("")
      setIsInitializing(false) // 重置初始化状态
      setIsInteractionPending(false) // 🔥 重置交互节点状态

      // 🔥 立即清空所有对话记录
      setMessages([])

      // 🔥 清理消息存储
      if (fromAgent?.chatId) {
        useMessageStore.getState().clearMessages(fromAgent.chatId as ConversationAgentType)
      }

      // 🔥 立即清理前一个智能体的所有状态
      setWelcomeMessage("")
      setSystemPrompt("")
      setInteracts([])
      setConnectionError(null)


      // 🔥 清理FastGPT客户端状态
      setFastGPTClient(null)

      // 🔥 清理前一个智能体的localStorage缓存，避免污染
      if (fromAgent) {
        clearAgentCache(fromAgent.id)
      }

      // 🔥 立即对话：无延迟初始化新智能体
      if (startNewConversation && toAgent) {
        console.log('🚀 立即对话模式：初始化新智能体', toAgent.name)

        // 生成新的chatId
        const newChatId = generateFallbackChatId()
        setChatId(newChatId)
        toAgent.chatId = newChatId

        // 🔥 立即初始化，无延迟
        initChatSessionWithAgent(toAgent)
      }
    }

    window.addEventListener('agent-switching', handleAgentSwitching as EventListener)

    return () => {
      window.removeEventListener('agent-switching', handleAgentSwitching as EventListener)

      // 🔥 清理欢迎消息动画
      if (welcomeAnimationRef.current) {
        clearInterval(welcomeAnimationRef.current)
        welcomeAnimationRef.current = null
      }
    }
  }, [clearAgentCache]) // 🔥 修复：添加clearAgentCache依赖

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 自动调整文本区域大小
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200)
      textareaRef.current.style.height = `${newHeight}px`
      setTextareaHeight(newHeight)
    }
  }, [input])





  // 🔥 立即对话：优化欢迎消息动画，支持快速模式和中断控制
  const animateWelcomeMessage = (fullText: string) => {
    console.log("🎬 立即对话：开始播放欢迎消息动画:", fullText)

    // 🔥 清理之前的动画（如果存在）
    if (welcomeAnimationRef.current) {
      clearInterval(welcomeAnimationRef.current)
      welcomeAnimationRef.current = null
    }

    // 🔥 立即对话：设置typing状态，但允许快速完成
    setIsTyping(true)

    let index = 0;
    const messageId = Date.now().toString();
    setMessages([{ id: messageId, type: MessageType.Text, role: 'system', content: '', timestamp: new Date(), metadata: {} }]);

    // 🔥 使用 ref 管理 interval，便于在智能体切换时清理
    const interval = setInterval(() => {
      index++;
      setMessages([{ id: messageId, type: MessageType.Text, role: 'system', content: fullText.slice(0, index), timestamp: new Date(), metadata: {} }]);

      if (index >= fullText.length) {
        clearInterval(interval);
        welcomeAnimationRef.current = null; // 清理 ref
        console.log("✅ 立即对话：欢迎消息动画播放完成")

        // 🔥 立即对话：快速恢复发送功能，减少延迟
        setTimeout(() => {
          setIsTyping(false)
          setIsInitializing(false)
          console.log("🎯 立即对话：初始化完成，用户可以立即发送消息")
        }, 200) // 🔥 减少延迟从500ms到200ms
      }
    }, 16); // 🔥 加快打字速度从24ms到16ms

    // 🔥 保存 interval 引用，便于在智能体切换时清理
    welcomeAnimationRef.current = interval
  };

  // 处理全局变量表单提交
  const handleGlobalVariablesSubmit = (variables: Record<string, any>) => {
    setGlobalVariables(variables)
    console.log('全局变量已设置:', variables)
  }

  // 🔥 新增：统一的 AbortController 管理函数
  const createAbortController = useCallback(() => {
    // 如果已有控制器，先中断
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort()
      } catch (error: any) {
        // 忽略 AbortError，这是预期的行为
        if (error.name !== 'AbortError') {
          console.warn('中断现有控制器时发生意外错误:', error)
        }
      }
    }

    // 创建新的控制器
    const controller = new AbortController()
    abortControllerRef.current = controller

    // 通知 AgentContext
    if (setAbortController) {
      setAbortController(controller)
    }

    return controller
  }, [setAbortController])

  const clearAbortController = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current = null
      if (setAbortController) {
        setAbortController(null)
      }
    }
  }, [setAbortController])

  // 处理文件上传完成
  const handleFileUpload = (files: UploadedFile[]) => {
    setUploadedFiles(files)
    if (files.some((file) => file.status === "complete")) {
      setTimeout(() => {
        setIsUploading(false)
        if (files.length > 0) {
          setInput((prev) => {
            // 检查输入框中是否已经包含"已上传文件:"文本
            if (prev.includes("已上传文件:")) {
              // 如果已经包含，则不再添加
              return prev;
            } else {
              // 如果不包含，则添加文件名
              const fileNames = files.map((f) => f.name).join(", ")
              return prev ? `${prev}\n已上传文件: ${fileNames}` : `已上传文件: ${fileNames}`
            }
          })
        }
      }, 1000)
    }
  }

  // 发送消息
  const handleSend = async () => {
    try {
      setIsTyping(true)
      console.log('[handleSend] 触发，input:', input, 'uploadedFiles:', uploadedFiles);
      if (!input.trim() && uploadedFiles.length === 0) {
        console.log('[handleSend] 输入为空，直接返回');
        return;
      }

      // 🔥 新增：开始请求跟踪
      const requestId = startRequest(selectedAgent?.id!)

      // 验证输入
      if (input.trim() && !validateInput(input)) {
        toast({
          title: "输入无效",
          description: "您的输入包含不允许的内容",
          variant: "destructive",
        })
        return
      }

      // 过滤输入
      const sanitizedInput = input.trim() ? sanitizeInput(input) : ""

      // 创建用户消息
      const userMessage: Message = {
        id: Date.now().toString(),
        type: MessageType.Text,
        role: "user" as MessageRole,
        content: sanitizedInput,
        timestamp: new Date(),
        metadata: {
          deviceId: deviceId,
          agentId: selectedAgent?.id, // 添加智能体ID
          apiKey: selectedAgent?.apiKey, // 添加API密钥
          appId: selectedAgent?.appId, // 添加应用ID
          files: uploadedFiles.length > 0 ? uploadedFiles.map((file) => ({ name: file.name, size: file.size, url: file.url! })).filter(f => !!f.url) : undefined,
        },
      }

      // 添加用户消息到消息列表
      setMessages((prev: Message[]) => {
        console.log('[handleSend] 添加用户消息前，prev:', prev);
        return [...prev, userMessage];
      })

      // 保存消息到本地存储
      if (chatId) {
        const updatedMessages = [...messages, userMessage]
        useMessageStore.getState().saveMessages(chatId as ConversationAgentType, updatedMessages)
        console.log(`Saved ${updatedMessages.length} messages to storage for chat ID: ${chatId}`)
      }

      setInput("")
      console.log('[handleSend] 设置 isTyping 为 true');

      // 清空已上传文件列表
      setUploadedFiles([])

      // 自动调整文本区域大小
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }



      try {
        // 创建包含新用户消息的消息副本
        const currentMessages = [...messages, userMessage]

        // 格式化消息以适应 FastGPT API
        const formattedMessages = currentMessages.map((msg) => ({
          role: msg.role,
          content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
        }))

        // 如果有系统提示词且尚未包含，则将系统提示作为第一条消息添加
        if (systemPrompt && !formattedMessages.some((msg) => msg.role === "system")) {
          formattedMessages.unshift({
            role: "system" as MessageRole,
            content: systemPrompt,
          })
        } else if (selectedAgent?.systemPrompt && !formattedMessages.some((msg) => msg.role === "system")) {
          formattedMessages.unshift({
            role: "system" as MessageRole,
            content: selectedAgent.systemPrompt,
          })
        }

        if (fastGPTClient) {
          try {
            // 优先尝试使用流式模式
            try {
              // 🔥 使用统一的 AbortController 管理
              const controller = createAbortController()

              // 使用 FastGPT 客户端进行流式传输
              await fastGPTClient.streamChat(formattedMessages, {
                temperature: selectedAgent?.temperature,
                maxTokens: selectedAgent?.maxTokens,
                detail: true,
                variables: globalVariables, // 传递全局变量
                onStart: () => {
                  // 🔥 新增：智能体验证
                  if (!isCurrentAgent(selectedAgent?.id)) {
                    console.log('智能体已切换，忽略 onStart 回调')
                    return
                  }
                  console.log('[streamChat] onStart');
                  setProcessingSteps([])
                  // 立即创建 AI typing 消息，带头像和空内容
                  setMessages((prev: Message[]) => {
                    // 如果已存在 typing 消息则不重复添加
                    if (prev.some(msg => msg.id === 'typing' && msg.role === 'assistant')) return prev;
                    return [
                      ...prev,
                      {
                        id: 'typing',
                        type: MessageType.Text,
                        role: 'assistant',
                        content: '',
                        timestamp: new Date(),
                        metadata: {
                          agentId: selectedAgent?.id,
                          apiKey: selectedAgent?.apiKey,
                          appId: selectedAgent?.appId,
                          thinkingStatus: "in-progress", // 初始思考状态
                          interactionStatus: "none",     // 初始交互状态
                        },
                      },
                    ];
                  });
                },
                onChunk: (chunk: string) => {
                  // 🔥 新增：智能体验证
                  if (!isCurrentAgent(selectedAgent?.id)) {
                    console.log('智能体已切换，忽略 onChunk 回调')
                    return
                  }
                  console.log('[streamChat] onChunk:', chunk);
                  setCurrentNodeName("");
                  setMessages((prev: Message[]) => {
                    console.log('[streamChat] onChunk setMessages, prev:', prev);
                    // 移除 node-status 气泡
                    const filtered = prev.filter(msg => msg.id !== 'node-status');
                    // 后续逻辑同原来
                    const lastMessage = filtered[filtered.length - 1];
                    if (lastMessage && lastMessage.role === "assistant" && lastMessage.id === "typing") {
                      return filtered.map((msg) =>
                        msg.id === "typing" ? { ...msg, content: (msg.content as string) + chunk } : msg,
                      );
                    } else {
                      return [
                        ...filtered,
                        {
                          id: "typing",
                          type: MessageType.Text,
                          role: "assistant" as MessageRole,
                          content: chunk,
                          timestamp: new Date(),
                          metadata: {
                            agentId: selectedAgent?.id,
                            apiKey: selectedAgent?.apiKey,
                            appId: selectedAgent?.appId,
                          },
                        },
                      ];
                    }
                  })
                },
                onIntermediateValue: (value: any, eventType: string) => {
                  // 🔥 新增：智能体验证
                  if (!isCurrentAgent(selectedAgent?.id)) {
                    console.log('智能体已切换，忽略 onIntermediateValue 回调')
                    return
                  }
                  console.log('[onIntermediateValue1] 事件类型:', eventType, '内容:', value);

                  // 处理交互节点 - 将交互数据附加到typing消息，不立即创建新消息
                  if (eventType === "interactive") {
                    console.log('🎯 检测到交互节点:', value);

                    // 🔥 跨平台兼容性修复：使用统一的安全解析函数
                    const safeValue = safeCrossPlatformJSONParse(value);

                    if (!safeValue) {
                      safeCrossPlatformLog('warn', '交互节点数据解析失败', { originalValue: value });
                      return;
                    }

                    // 🔥 使用统一的验证函数
                    const validationResult = validateInteractiveNodeData(safeValue);

                    safeCrossPlatformLog('log', '交互节点数据验证结果', validationResult);

                    // 🔥 新增：禁用输入框，等待用户选择
                    console.log('🔒 交互节点出现，禁用输入框');
                    setIsInteractionPending(true);

                    if (validationResult.isValid) {
                      console.log('✅ 交互节点验证通过，将交互数据附加到typing消息:', (safeValue as any).interactive);

                      // 将交互数据附加到现有的typing消息，如果不存在则创建
                      setMessages((prev: Message[]) => {
                        console.log('🔄 准备附加交互数据，当前消息列表:', prev.map(m => ({ id: m.id, role: m.role, hasInteractive: !!m.metadata?.interactiveData })));

                        let typingMsg = prev.find(msg => msg.id === "typing" && msg.role === "assistant");

                        if (!typingMsg) {
                          console.log('⚠️ typing消息不存在，创建新的typing消息');
                          // 如果 typing 消息不存在，先创建它
                          typingMsg = {
                            id: "typing",
                            type: MessageType.Text,
                            role: "assistant" as MessageRole,
                            content: "",
                            timestamp: new Date(),
                            metadata: {
                              agentId: selectedAgent?.id,
                              apiKey: selectedAgent?.apiKey,
                              appId: selectedAgent?.appId,
                              thinkingStatus: "completed" as const, // 交互节点出现时，思考已完成
                              interactionStatus: "ready" as const,  // 交互准备就绪
                            },
                          };
                          prev = [...prev, typingMsg];
                        }

                        // 然后附加交互数据 - 使用安全验证后的数据
                        const result = prev.map((msg) => {
                          if (msg.id === "typing" && msg.role === "assistant") {
                            // 🔥 跨平台兼容性：使用安全克隆函数
                            const interactiveDataClone = safeCrossPlatformClone((safeValue as any).interactive);

                            const updatedMsg = {
                              ...msg,
                              metadata: {
                                ...msg.metadata,
                                interactiveData: {
                                  ...interactiveDataClone,
                                  processed: false,
                                  // 添加调试信息
                                  _debugInfo: createCrossPlatformDebugInfo('interactive-data-attach', interactiveDataClone)
                                },
                                thinkingStatus: "completed" as const, // 思考完成
                                interactionStatus: "ready" as const,  // 交互准备就绪
                              }
                            };
                            console.log('✅ 交互数据已附加到消息:', updatedMsg.id, updatedMsg.metadata.interactiveData);
                            return updatedMsg;
                          }
                          return msg;
                        });

                        console.log('🔄 附加交互数据后的消息列表:', result.map(m => ({ id: m.id, role: m.role, hasInteractive: !!m.metadata?.interactiveData })));
                        return result;
                      });

                      console.log('🔄 交互数据已附加到typing消息，继续流式处理...');
                    } else {
                      safeCrossPlatformLog('error', '交互节点验证失败', {
                        validationResult,
                        originalValue: value,
                        safeValue: safeValue
                      });
                    }
                  }

                  // 其他中间值处理逻辑保持不变
                  // 字段兼容处理
                  const nodeId = value?.nodeId || value?.id || value?.moduleId || `step-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                  const nodeName = value?.name || value?.moduleName || value?.toolName || eventType;
                  const nodeStatus = value?.status || value?.state || "running";
                  const step = {
                    id: nodeId,
                    type: eventType,
                    name: nodeName,
                    status: nodeStatus,
                    content: value?.content || value?.text || value?.message || undefined,
                    timestamp: new Date(),
                    details: value,
                    isNew: true,
                  };
                  // 日志：setMessages 前后打印 typing 消息的 processingSteps
                  setMessages((prev: Message[]) => {
                    // 🔥 优化：减少 node-status 消息创建，避免与 typing 消息冲突
                    // 只有在没有 typing 消息时才创建 node-status 消息
                    if (
                      (eventType === "flowNodeStatus" ||
                      eventType === "moduleStatus" ||
                      eventType === "moduleStart" ||
                      eventType === "moduleEnd" ||
                      eventType === "thinking" ||
                      eventType === "thinkingStart" ||
                      eventType === "thinkingEnd" ||
                      eventType === "toolCall" ||
                      eventType === "toolParams" ||
                      eventType === "toolResponse") &&
                      !prev.find(msg => msg.id === "typing" && msg.role === "assistant")
                    ) {
                      console.log('🔄 创建 node-status 消息，因为没有 typing 消息:', nodeName);
                      const filtered = prev.filter(msg => msg.id !== 'node-status');
                      return [
                        ...filtered,
                        {
                          id: 'node-status',
                          type: MessageType.Text,
                          role: 'assistant',
                          content: `🤖 AI正在处理：${nodeName}`,
                          timestamp: new Date(),
                          metadata: { isNodeStatus: true },
                        }
                      ];
                    } else if (prev.find(msg => msg.id === "typing" && msg.role === "assistant")) {
                      console.log('🛡️ 跳过 node-status 消息创建，因为存在 typing 消息');
                    }
                    // 原有逻辑
                    const before = prev.find(msg => msg.id === "typing" && msg.role === "assistant");
                    console.log('[onIntermediateValue][before] typing:', before);
                    const next = prev.map((msg) => {
                      if (msg.id === "typing" && msg.role === "assistant") {
                        const prevSteps = Array.isArray(msg.metadata?.processingSteps) ? msg.metadata.processingSteps : [];
                        const isThinkingEvent = eventType.includes('thinking');
                        const isThinkingEnd = eventType === 'thinkingEnd';

                        return {
                          ...msg,
                          metadata: {
                            ...msg.metadata,
                            processingSteps: [...prevSteps, step],
                            // 更新思考状态
                            thinkingStatus: isThinkingEnd ? "completed" :
                                          (isThinkingEvent ? "in-progress" : msg.metadata?.thinkingStatus),
                            // 如果还没有交互状态，设置为none
                            interactionStatus: msg.metadata?.interactionStatus || "none",
                          },
                        };
                      }
                      return msg;
                    });
                    const after = next.find(msg => msg.id === "typing" && msg.role === "assistant");
                    console.log('[onIntermediateValue][after] typing:', after);
                    return next;
                  });
                  // 捕获API响应的id字段 - 更全面的事件和id字段处理
                  if (value && (value.id || value.chatCompletionId)) {
                    const responseId = value.id || value.chatCompletionId;
                    console.log(`捕获到响应ID: ${responseId} (事件类型: ${eventType})`, value);
                    setMessages((prev: Message[]) => {
                      const lastMessage = prev[prev.length - 1]
                      if (lastMessage && lastMessage.role === "assistant" && lastMessage.id === "typing") {
                        return prev.map((msg) =>
                          msg.id === "typing" ? {
                            ...msg,
                            metadata: {
                              ...msg.metadata,
                              responseId: responseId
                            }
                          } : msg,
                        )
                      }
                      return prev
                    })
                  }
                  // 只维护 processingSteps
                  if (
                    eventType === "flowNodeStatus" ||
                    eventType === "moduleStatus" ||
                    eventType === "moduleStart" ||
                    eventType === "moduleEnd" ||
                    eventType === "thinking" ||
                    eventType === "thinkingStart" ||
                    eventType === "thinkingEnd" ||
                    eventType === "toolCall" ||
                    eventType === "toolParams" ||
                    eventType === "toolResponse"
                  ) {
                    setProcessingSteps((prev: ProcessingStep[]) => [
                      ...prev,
                      {
                        id: nodeId,
                        type: eventType,
                        name: nodeName,
                        status: nodeStatus,
                        content: value?.content || value?.text || value?.message || undefined,
                        timestamp: new Date(),
                        details: value,
                        isNew: true,
                      },
                    ])
                  }
                  // 遇到节点事件时 setCurrentNodeName
                  if (
                    eventType === "flowNodeStatus" ||
                    eventType === "moduleStatus" ||
                    eventType === "moduleStart" ||
                    eventType === "moduleEnd" ||
                    eventType === "thinking" ||
                    eventType === "thinkingStart" ||
                    eventType === "thinkingEnd" ||
                    eventType === "toolCall" ||
                    eventType === "toolParams" ||
                    eventType === "toolResponse"
                  ) {
                    setCurrentNodeName(nodeName);
                  }
                },
                onProcessingStep: (step: ProcessingStep) => {
                  console.log('[onProcessingStep]', step);
                  setProcessingSteps((prev: ProcessingStep[]) => [...prev, step]);
                },
                onError: (error: Error) => {
                  console.error('[streamChat] onError:', error);
                  setIsTyping(false);
                  // 🔥 新增：错误时重置交互状态，允许用户重新输入
                  setIsInteractionPending(false);

                  // 添加错误消息
                  setMessages((prev: Message[]) => {
                    // 查找是否已有响应消息
                    const lastMessage = prev[prev.length - 1]
                    if (lastMessage.role === "assistant" && lastMessage.id === "typing") {
                      // 更新现有消息
                      return prev.map((msg) =>
                        msg.id === "typing"
                          ? {
                              ...msg,
                              id: Date.now().toString(),
                              content:
                                (msg.content as string) || "抱歉，连接服务器时遇到网络问题，请稍后重试。",
                            }
                          : msg,
                      )
                    } else {
                      // 创建新的助手消息
                      return [
                        ...prev,
                        {
                          id: Date.now().toString(),
                          type: MessageType.Text,
                          role: "assistant" as MessageRole,
                          content: "抱歉，连接服务器时遇到网络问题，请稍后重试。",
                          timestamp: new Date(),
                          metadata: {
                            agentId: selectedAgent?.id, // 添加智能体ID
                            apiKey: selectedAgent?.apiKey, // 添加API密钥
                            appId: selectedAgent?.appId, // 添加应用ID
                          },
                        },
                      ]
                    }
                  })

                  toast({
                    title: "网络连接错误",
                    description: "请检查网络连接后重试",
                    variant: "destructive",
                  })
                },
                onFinish: () => {
                  // 🔥 新增：智能体验证
                  if (!isCurrentAgent(selectedAgent?.id)) {
                    console.log('智能体已切换，忽略 onFinish 回调')
                    return
                  }
                  console.log('[streamChat] onFinish');
                  setIsTyping(false)

                  // 🔥 新增：流式响应结束时，检查是否有未处理的交互节点
                  setMessages((prev: Message[]) => {
                    const hasUnprocessedInteraction = prev.some(msg =>
                      msg.id === "typing" && msg.metadata?.interactiveData && !msg.metadata.interactiveData.processed
                    );

                    if (!hasUnprocessedInteraction) {
                      console.log('🔓 流式响应结束且无未处理交互节点，启用输入框');
                      setIsInteractionPending(false);
                    } else {
                      console.log('🔒 流式响应结束但存在未处理交互节点，保持输入框禁用');
                    }

                    // 统一处理：将typing消息转换为永久消息（可能包含文字内容和/或交互数据）
                    console.log('📝 流式处理完成，转换typing消息为永久消息');
                    return prev.map((msg) =>
                      msg.id === "typing"
                        ? {
                            ...msg,
                            id: Date.now().toString(),
                            metadata: {
                              ...msg.metadata,
                              // 确保思考状态设置为完成
                              thinkingStatus: "completed"
                            }
                          }
                        : msg
                    );
                  });
                },
                signal: controller.signal
              })
            } catch (streamError: any) {
              // 🔥 新增：处理请求中断
              if (streamError.name === 'AbortError') {
                console.log('流式请求被中断')
                return
              }
              // 🔥 增强错误处理和分类
              console.warn('[handleSend] 流式请求失败，分析错误:', streamError);

              let shouldRetryWithNonStream = true
              let errorMessage = "流式连接失败"

              if (streamError.message) {
                if (streamError.message.includes("content-type") ||
                    streamError.message.includes("text/event-stream")) {
                  errorMessage = "服务器不支持流式响应"
                } else if (streamError.message.includes("network") ||
                          streamError.message.includes("fetch")) {
                  errorMessage = "网络连接问题"
                } else if (streamError.message.includes("timeout")) {
                  errorMessage = "请求超时"
                  shouldRetryWithNonStream = false
                }
              }

              console.log(`[handleSend] 错误分析: ${errorMessage}, 是否重试: ${shouldRetryWithNonStream}`)

              if (shouldRetryWithNonStream) {
                console.log("[handleSend] 尝试降级到非流式模式")

                // 🔥 确保有typing消息
                setMessages((prev: Message[]) => {
                  const hasTyping = prev.some(msg => msg.id === "typing" && msg.role === "assistant")
                  if (hasTyping) return prev

                  return [
                    ...prev,
                    {
                      id: "typing",
                      type: MessageType.Text,
                      role: "assistant" as MessageRole,
                      content: "",
                      timestamp: new Date(),
                      metadata: {
                        agentId: selectedAgent?.id,
                        apiKey: selectedAgent?.apiKey,
                        appId: selectedAgent?.appId,
                        fallbackMode: true,
                      },
                    },
                  ]
                });

                try {
                  // 切换到非流式模式
                  const content = await fastGPTClient.chat(formattedMessages, {
                    temperature: selectedAgent?.temperature,
                    maxTokens: selectedAgent?.maxTokens,
                    detail: true,
                    variables: globalVariables,
                    onResponseData: (responseData: any) => {
                      console.log("[非流式模式] 收到响应数据:", responseData);

                      if (responseData && (responseData.id || responseData.chatCompletionId || responseData.completionId)) {
                        const responseId = responseData.id || responseData.chatCompletionId || responseData.completionId;
                        console.log(`[非流式模式] 捕获响应ID: ${responseId}`);

                        setMessages((prev: Message[]) => {
                          return prev.map((msg) =>
                            msg.id === "typing" ? {
                              ...msg,
                              metadata: {
                                ...msg.metadata,
                                responseId: responseId
                              }
                            } : msg
                          );
                        });
                      }
                    }
                  } as any)

                  // 更新消息内容
                  setMessages((prev: Message[]) => {
                    return prev.map((msg) =>
                      msg.id === "typing" ? {
                        ...msg,
                        id: Date.now().toString(),
                        content: content,
                        metadata: {
                          ...msg.metadata,
                          fallbackMode: true
                        }
                      } : msg
                    );
                  });

                  console.log("[非流式模式] 降级处理成功")
                } catch (nonStreamError) {
                  console.error("[非流式模式] 降级也失败:", nonStreamError)

                  setMessages((prev: Message[]) => {
                    return prev.map((msg) =>
                      msg.id === "typing" ? {
                        ...msg,
                        id: Date.now().toString(),
                        content: `抱歉，遇到连接问题：${errorMessage}。请检查网络连接或稍后再试。`,
                        metadata: {
                          ...msg.metadata,
                          error: true
                        }
                      } : msg
                    );
                  });
                }
              } else {
                setMessages((prev: Message[]) => {
                  return prev.map((msg) =>
                    msg.id === "typing" ? {
                      ...msg,
                      id: Date.now().toString(),
                      content: `请求${errorMessage}，请稍后再试。`,
                      metadata: {
                        ...msg.metadata,
                        error: true
                      }
                    } : msg
                  );
                });
              }

              setIsTyping(false);
            }
          } catch (error: any) {
            // 🔥 新增：处理请求中断
            if (error.name === 'AbortError') {
              console.log('请求被用户中断')
              return
            }
            console.error("聊天请求错误:", error);

            // 添加来自助手的错误消息
            const errorMessage: Message = {
              id: Date.now().toString(),
              type: MessageType.Text,
              role: "assistant" as MessageRole,
              content: "抱歉，处理您的请求时遇到错误，请稍后重试。",
              timestamp: new Date(),
              metadata: {
                agentId: selectedAgent?.id, // 添加智能体ID
                apiKey: selectedAgent?.apiKey, // 添加API密钥
                appId: selectedAgent?.appId, // 添加应用ID
              },
            }

            setMessages((prev: Message[]) => [...prev, errorMessage])
            setIsTyping(false)

            toast({
              title: "错误",
              description: error instanceof Error ? error.message : "发送消息失败，请稍后重试",
              variant: "destructive",
            })
          }
        }
      } catch (error: any) {
        // 🔥 新增：处理请求中断
        if (error.name === 'AbortError') {
          console.log('发送消息被用户中断')
          return
        }
        console.error("发送消息时出错:", error)

        // 添加来自助手的错误消息
        const errorMessage: Message = {
          id: Date.now().toString(),
          type: MessageType.Text,
          role: "assistant" as MessageRole,
          content: "抱歉，处理您的请求时遇到错误，请稍后重试。",
          timestamp: new Date(),
          metadata: {
            agentId: selectedAgent?.id, // 添加智能体ID
          },
        }

        setMessages((prev: Message[]) => [...prev, errorMessage])
        setIsTyping(false)

        toast({
          title: "错误",
          description: error instanceof Error ? error.message : "发送消息失败，请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      // 🔥 新增：处理请求中断
      if (error.name === 'AbortError') {
        console.log('发送消息被用户中断（最外层）')
        return
      }
      console.error("发送消息时出错:", error)

      // 添加来自助手的错误消息
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: MessageType.Text,
        role: "assistant" as MessageRole,
        content: "抱歉，处理您的请求时遇到错误，请稍后重试。",
        timestamp: new Date(),
        metadata: {
          agentId: selectedAgent?.id, // 添加智能体ID
        },
      }

      setMessages((prev: Message[]) => [...prev, errorMessage])
      setIsTyping(false)

      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "发送消息失败，请稍后重试",
        variant: "destructive",
      })
    } finally {
      // 🔥 新增：清理状态
      endRequest()
      clearAbortController()
    }
  }

  // 重新生成消息
  const handleRegenerate = async (messageId: string) => {
    // 查找被点击的用户消息
    const clickedMessageIndex = messages.findIndex((msg) => msg.id === messageId)
    if (clickedMessageIndex === -1) return

    // 只保留该用户消息及之前的消息，清理掉所有 assistant 回复
    const messagesToKeep = messages.slice(0, clickedMessageIndex + 1)
    setMessages(messagesToKeep)
    setIsTyping(true)

    try {
      // 格式化消息以适应 FastGPT API
      const formattedMessages = messagesToKeep.map((msg) => ({
        role: msg.role,
        content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
      }))

      // 如果有系统提示词且尚未包含，则将系统提示作为第一条消息添加
      if (systemPrompt && !formattedMessages.some((msg) => msg.role === "system")) {
        formattedMessages.unshift({
          role: "system" as MessageRole,
          content: systemPrompt,
        })
      } else if (selectedAgent?.systemPrompt && !formattedMessages.some((msg) => msg.role === "system")) {
        formattedMessages.unshift({
          role: "system" as MessageRole,
          content: selectedAgent.systemPrompt,
        })
      }

      if (fastGPTClient && selectedAgent) {
        // 使用 FastGPT 客户端进行流式传输
        try {
          // 优先尝试使用流式模式
          try {
            await fastGPTClient.streamChat(formattedMessages, {
              temperature: selectedAgent?.temperature,
              maxTokens: selectedAgent?.maxTokens,
              detail: true,
              onStart: () => {
                console.log("重新生成流开始")
                setProcessingSteps([])
                // 🔥 新增：立即创建 AI typing 消息，消除空白期
                setMessages((prev: Message[]) => {
                  // 如果已存在 typing 消息则不重复添加
                  if (prev.some(msg => msg.id === 'typing' && msg.role === 'assistant')) return prev;
                  return [
                    ...prev,
                    {
                      id: 'typing',
                      type: MessageType.Text,
                      role: 'assistant',
                      content: '',
                      timestamp: new Date(),
                      metadata: {
                        agentId: selectedAgent?.id,
                        apiKey: selectedAgent?.apiKey,
                        appId: selectedAgent?.appId,
                        thinkingStatus: "in-progress", // 初始思考状态
                        interactionStatus: "none",     // 初始交互状态
                      },
                    },
                  ];
                });
              },
              onIntermediateValue: (value: any, eventType: string) => {
                console.log('[重新生成][onIntermediateValue0] 事件类型:', eventType, '内容:', value);
                // 字段兼容处理
                const nodeId = value?.nodeId || value?.id || value?.moduleId || `step-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                const nodeName = value?.name || value?.moduleName || value?.toolName || eventType;
                const nodeStatus = value?.status || value?.state || "running";
                const step = {
                  id: nodeId,
                  type: eventType,
                  name: nodeName,
                  status: nodeStatus,
                  content: value?.content || value?.text || value?.message || undefined,
                  timestamp: new Date(),
                  details: value,
                  isNew: true,
                };

                // 日志：setMessages 前后打印 typing 消息的 processingSteps
                setMessages((prev: Message[]) => {
                  // 🔥 优化：减少 node-status 消息创建，只在必要时显示
                  // 只有在没有 typing 消息时才创建 node-status 消息
                  if (
                    (eventType === "flowNodeStatus" ||
                    eventType === "moduleStatus" ||
                    eventType === "moduleStart" ||
                    eventType === "moduleEnd" ||
                    eventType === "thinking" ||
                    eventType === "thinkingStart" ||
                    eventType === "thinkingEnd" ||
                    eventType === "toolCall" ||
                    eventType === "toolParams" ||
                    eventType === "toolResponse") &&
                    !prev.find(msg => msg.id === "typing" && msg.role === "assistant")
                  ) {
                    const filtered = prev.filter(msg => msg.id !== 'node-status');
                    return [
                      ...filtered,
                      {
                        id: 'node-status',
                        type: MessageType.Text,
                        role: 'assistant',
                        content: `🤖 AI正在处理：${nodeName}`,
                        timestamp: new Date(),
                        metadata: { isNodeStatus: true },
                      }
                    ];
                  }
                  // 原有逻辑
                  const before = prev.find(msg => msg.id === "typing" && msg.role === "assistant");
                  console.log('[重新生成][onIntermediateValue][before] typing:', before);
                  const next = prev.map((msg) => {
                    if (msg.id === "typing" && msg.role === "assistant") {
                      const prevSteps = Array.isArray(msg.metadata?.processingSteps) ? msg.metadata.processingSteps : [];
                      const isThinkingEvent = eventType.includes('thinking');
                      const isThinkingEnd = eventType === 'thinkingEnd';

                      return {
                        ...msg,
                        metadata: {
                          ...msg.metadata,
                          processingSteps: [...prevSteps, step],
                          // 更新思考状态
                          thinkingStatus: isThinkingEnd ? "completed" :
                                        (isThinkingEvent ? "in-progress" : msg.metadata?.thinkingStatus),
                          // 如果还没有交互状态，设置为none
                          interactionStatus: msg.metadata?.interactionStatus || "none",
                        },
                      };
                    }
                    return msg;
                  });
                  const after = next.find(msg => msg.id === "typing" && msg.role === "assistant");
                  console.log('[重新生成][onIntermediateValue][after] typing:', after);
                  return next;
                });

                // 捕获API响应的id字段 - 更全面的事件和id字段处理
                if (value && (value.id || value.chatCompletionId)) {
                  const responseId = value.id || value.chatCompletionId;
                  console.log(`重新生成捕获到响应ID: ${responseId} (事件类型: ${eventType})`, value);
                  setMessages((prev: Message[]) => {
                    const lastMessage = prev[prev.length - 1]
                    if (lastMessage && lastMessage.role === "assistant" && lastMessage.id === "typing") {
                      return prev.map((msg) =>
                        msg.id === "typing" ? {
                          ...msg,
                          metadata: {
                            ...msg.metadata,
                            responseId: responseId
                          }
                        } : msg,
                      )
                    }
                    return prev
                  })
                }

                // 只维护 processingSteps
                if (
                  eventType === "flowNodeStatus" ||
                  eventType === "moduleStatus" ||
                  eventType === "moduleStart" ||
                  eventType === "moduleEnd" ||
                  eventType === "thinking" ||
                  eventType === "thinkingStart" ||
                  eventType === "thinkingEnd" ||
                  eventType === "toolCall" ||
                  eventType === "toolParams" ||
                  eventType === "toolResponse"
                ) {
                  setProcessingSteps((prev: ProcessingStep[]) => [
                    ...prev,
                    {
                      id: nodeId,
                      type: eventType,
                      name: nodeName,
                      status: nodeStatus,
                      content: value?.content || value?.text || value?.message || undefined,
                      timestamp: new Date(),
                      details: value,
                      isNew: true,
                    },
                  ])
                }

                // 遇到节点事件时 setCurrentNodeName
                if (
                  eventType === "flowNodeStatus" ||
                  eventType === "moduleStatus" ||
                  eventType === "moduleStart" ||
                  eventType === "moduleEnd" ||
                  eventType === "thinking" ||
                  eventType === "thinkingStart" ||
                  eventType === "thinkingEnd" ||
                  eventType === "toolCall" ||
                  eventType === "toolParams" ||
                  eventType === "toolResponse"
                ) {
                  setCurrentNodeName(nodeName);
                }
              },
              onChunk: (chunk: string) => {
                setCurrentNodeName("");
                setMessages((prev: Message[]) => {
                  console.log('收到流式数据:', chunk,prev);
                  // 查找是否已有响应消息
                  const lastMessage = prev[prev.length - 1]
                  if (lastMessage.role === "assistant" && lastMessage.id === "typing") {
                    // 更新现有消息
                    return prev.map((msg) =>
                      msg.id === "typing" ? { ...msg, content: (msg.content as string) + chunk } : msg,
                    )
                  } else {
                    // 创建新的助手消息
                    return [
                      ...prev,
                      {
                        id: "typing",
                        type: MessageType.Text,
                        role: "assistant" as MessageRole,
                        content: chunk,
                        timestamp: new Date(),
                        metadata: {
                          agentId: selectedAgent?.id, // 添加智能体ID
                          apiKey: selectedAgent?.apiKey, // 添加API密钥
                          appId: selectedAgent?.appId, // 添加应用ID
                          thinkingStatus: "in-progress", // 初始思考状态
                          interactionStatus: "none",     // 初始交互状态
                        },
                      },
                    ]
                  }
                })
              },
              onError: (error: Error) => {
                console.error("重新生成流错误:", error)
                // 🔥 新增：重新生成错误时重置交互状态
                setIsInteractionPending(false);
                toast({
                  title: "错误",
                  description: error.message,
                  variant: "destructive",
                })
              },
              onFinish: () => {
                console.log("重新生成流完成")
                setIsTyping(false)
                // 将临时消息 ID 更新为永久 ID，保留 metadata.processingSteps
                setMessages((prev: Message[]) => {
                  return prev.map((msg) =>
                    msg.id === "typing"
                      ? {
                          ...msg,
                          id: Date.now().toString(),
                          metadata: {
                            ...msg.metadata,
                            // 确保思考状态设置为完成
                            thinkingStatus: "completed"
                          }
                        }
                      : msg
                  );
                });
              },
            })
          } catch (streamError: any) {
            // 🔥 新增：处理请求中断
            if (streamError.name === 'AbortError') {
              console.log('重新生成流式请求被中断')
              return
            }
            console.warn("重新生成流式请求失败，尝试使用非流式模式:", streamError);

            // 创建一个占位消息，等待非流式响应
            setMessages((prev: Message[]) => [
              ...prev,
              {
                id: "typing",
                type: MessageType.Text,
                role: "assistant" as MessageRole,
                content: "",
                timestamp: new Date(),
                metadata: {
                  agentId: selectedAgent?.id,
                  apiKey: selectedAgent?.apiKey,
                  appId: selectedAgent?.appId,
                  thinkingStatus: "in-progress", // 初始思考状态
                  interactionStatus: "none",     // 初始交互状态
                },
              },
            ]);

            // 切换到非流式模式
            const content = await fastGPTClient.chat(formattedMessages, {
              temperature: selectedAgent?.temperature,
              maxTokens: selectedAgent?.maxTokens,
              detail: true,
              onResponseData: (responseData: any) => {
                console.log("重新生成收到非流式响应数据:", responseData);

                // 提取响应ID并保存到消息元数据中
                if (responseData && (responseData.id || responseData.chatCompletionId || responseData.completionId)) {
                  const responseId = responseData.id || responseData.chatCompletionId || responseData.completionId;

                  console.log(`重新生成非流式模式捕获到响应ID: ${responseId}`, responseData);

                  // 更新typing消息的元数据
                  setMessages((prev: Message[]) => {
                    return prev.map((msg) =>
                      msg.id === "typing" ? {
                        ...msg,
                        metadata: {
                          ...msg.metadata,
                          responseId: responseId  // 添加API响应的id字段
                        }
                      } : msg
                    );
                  });
                }
              }
            } as any)

            // 更新消息内容
            setMessages((prev: Message[]) => {
              return prev.map((msg) =>
                msg.id === "typing" ? {
                  ...msg,
                  id: Date.now().toString(),
                  content: content
                } : msg
              );
            });

            setIsTyping(false);
          }
        } catch (error: any) {
          // 🔥 新增：处理请求中断
          if (error.name === 'AbortError') {
            console.log('重新生成消息被用户中断')
            return
          }
          console.error("重新生成消息时出错:", error)

          // 添加错误消息
          setMessages((prev: Message[]) => [
            ...prev,
            {
              id: Date.now().toString(),
              type: MessageType.Text,
              role: "assistant" as MessageRole,
              content: "抱歉，重新生成响应时遇到错误。请稍后再试。",
              timestamp: new Date(),
              metadata: {
                agentId: selectedAgent?.id, // 添加智能体ID
                apiKey: selectedAgent?.apiKey, // 添加API密钥
                appId: selectedAgent?.appId, // 添加应用ID
              },
            },
          ])

          toast({
            title: "错误",
            description: error instanceof Error ? error.message : "重新生成消息失败",
            variant: "destructive",
          })
        }
      } else {
        // 如果客户端不可用，则显示错误消息
        setMessages((prev: Message[]) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: MessageType.Text,
            role: "assistant" as MessageRole,
            content: "抱歉，FastGPT 客户端未初始化。请刷新页面或检查您的 API 配置。",
            timestamp: new Date(),
            metadata: {
              agentId: selectedAgent?.id, // 添加智能体ID
              apiKey: selectedAgent?.apiKey, // 添加API密钥
              appId: selectedAgent?.appId, // 添加应用ID
            },
          },
        ])

        setIsTyping(false)
      }
    } catch (error: any) {
      // 🔥 新增：处理请求中断
      if (error.name === 'AbortError') {
        console.log('重新生成消息被用户中断（最外层）')
        return
      }
      console.error("重新生成消息时出错:", error)

      // 添加错误消息
      setMessages((prev: Message[]) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: MessageType.Text,
          role: "assistant" as MessageRole,
          content: "抱歉，重新生成响应时遇到错误。请稍后再试。",
          timestamp: new Date(),
          metadata: {
            agentId: selectedAgent?.id, // 添加智能体ID
            apiKey: selectedAgent?.apiKey, // 添加API密钥
            appId: selectedAgent?.appId, // 添加应用ID
          },
        },
      ])

      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "重新生成消息失败",
        variant: "destructive",
      })
    } finally {
      if (!fastGPTClient) {
        setIsTyping(false)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      // 🔥 防止在初始化或typing状态下重复提交
      if (!isTyping && !isInitializing) {
        handleSend()
      }
    }
  }

  const handleCopy = () => {
    toast({
      title: t("copied"),
      description: t("copyText"),
    })
  }

  const toggleRecording = () => {
    setShowVoiceRecorder(true)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handleHistorySelect = (selectedMessages: Message[], selectedChatId: string) => {
    setMessages(selectedMessages)
    setChatId(selectedChatId)
    if (selectedAgent) {
      selectedAgent.chatId = selectedChatId
    }
    setShowHistory(false)
    // 清空节点区
    setProcessingSteps([])
  }

  // 尝试重新连接
  const handleRetryConnection = () => {
    setConnectionError(null)
    initChatSession()
  }

  // Add message deletion functionality
  const deleteMessage = (messageId: string) => {
    setMessages((prev: Message[]) => prev.filter((msg) => msg.id !== messageId))

    // If we're deleting the last message and it's from the assistant, also delete the last user message
    const messageIndex = messages.findIndex((msg) => msg.id === messageId)
    if (messageIndex !== -1 && messageIndex === messages.length - 1 && messages[messageIndex].role === "assistant") {
      // Find the last user message
      const lastUserIndex = messages
        .slice(0, messageIndex)
        .reverse()
        .findIndex((msg) => msg.role === "user")
      if (lastUserIndex !== -1) {
        const actualIndex = messages.length - 2 - lastUserIndex
        setMessages((prev: Message[]) => prev.filter((_, i) => i !== actualIndex))
      }
    }

    // Save updated messages to local storage
    if (chatId) {
      setTimeout(() => {
        const updatedMessages = messages.filter((msg) => msg.id !== messageId)
        useMessageStore.getState().saveMessages(chatId as ConversationAgentType, updatedMessages)
        console.log(`Saved ${updatedMessages.length} messages after deletion for chat ID: ${chatId}`)
      }, 100)
    }
  }

  // Add message editing functionality
  const editMessage = (messageId: string, newContent: string) => {
    // 检查是否为管理员界面
    const isAdmin = localStorage.getItem("adminLoggedIn") === "true";

    // 只有管理员界面才能编辑消息
    if (isAdmin) {
      setMessages((prev: Message[]) => prev.map((msg) => (msg.id === messageId ? { ...msg, content: newContent } : msg)))

      // Save updated messages to local storage
      if (chatId) {
        setTimeout(() => {
          const updatedMessages = messages.map((msg) => (msg.id === messageId ? { ...msg, content: newContent } : msg))
          useMessageStore.getState().saveMessages(chatId as ConversationAgentType, updatedMessages)
          console.log(`Saved ${updatedMessages.length} messages after editing for chat ID: ${chatId}`)
        }, 100)
      }
    }
  }

  // 拉取建议问题
  const fetchSuggestions = async () => {
    setSuggestions([])
    setSuggestionsLoading(false)
    return
  }

  // 所有hooks必须在任何条件返回之前声明和使用
  // 这样可以确保hooks的调用数量在所有渲染路径中保持一致

  // 渲染前日志追踪，避免 Fragment linter 报错
  if (selectedAgent?.type === 'fastgpt' && welcomeMessage && messages.length === 0) {
    console.log('WelcomeMessage render', { selectedAgentType: selectedAgent?.type, welcomeMessage, messagesLength: messages.length })
  }

  // setMessages 后自动本地保存
  useEffect(() => {
    if (chatId) {
      console.log(`[useEffect] 自动保存 ${messages.length} 条消息到本地存储，chatId: ${chatId}`, messages);
      useMessageStore.getState().saveMessages(chatId as ConversationAgentType, messages);

      // 验证保存是否成功
      setTimeout(() => {
        const savedMessages = useMessageStore.getState().loadMessages(chatId as ConversationAgentType);
        console.log(`验证保存：从本地存储加载到 ${savedMessages.length} 条消息`);
      }, 100);
    }
  }, [messages, chatId])

  useEffect(() => {
    if (selectedAgent?.type === "fastgpt") {
      // 🔥 新增：检查是否正在初始化，如果是则不从缓存恢复
      if (isInitializing) {
        console.log('正在初始化，跳过缓存恢复')
        return
      }

      // 🔥 修改：使用新的缓存键获取保存的欢迎消息
      const cache = loadAgentCache(selectedAgent.id);

      if (cache.welcomeMessage) {
        // 优先使用保存的欢迎消息
        console.log(`从缓存恢复智能体 ${selectedAgent.id} 的欢迎消息`)
        setWelcomeMessage(cache.welcomeMessage);
      } else {
        // 如果没有保存的欢迎消息，使用智能体配置的欢迎消息
        setWelcomeMessage(selectedAgent.welcomeText || "你好！我是智能助手，有什么可以帮您？");
      }
    } else {
      setWelcomeMessage("")
    }
  }, [selectedAgent, isInitializing, loadAgentCache]) // 🔥 新增：添加isInitializing和loadAgentCache依赖

  // 日志：组件渲染
  console.log('[ChatContainer] 渲染，messages:', messages, 'isTyping:', isTyping, 'chatId:', chatId);

  // 点赞/点踩反馈方法
  const handleFeedback = async (dataId: any, type: any) => {
    // 这里假设 userId/token/selectedAgent 已有
    const userId = localStorage.getItem('userId');
    if (!dataId) {
      toast({ title: "操作失败", description: "消息ID缺失，无法点赞/点踩" });
      return;
    }
    try {
      const res = await fetch('/api/core/chat/feedback/updateUserFeedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${selectedAgent?.apiKey || ''}`,
        },
        body: JSON.stringify({
          appId: selectedAgent?.appId,
          chatId,
          dataId,
          userId,
          userGoodFeedback: type === 'like',
        }),
      });
      if (res.ok) {
        toast({ title: "操作成功", description: type === 'like' ? "已点赞" : "已点踩" });
      } else {
        toast({ title: "操作失败", description: "请稍后重试" });
      }
    } catch (e) {
      toast({ title: "操作失败", description: "网络异常" });
    }
  };

  // 切换会话/历史时自动清空节点区
  useEffect(() => {
    setProcessingSteps([])
  }, [chatId])

  // 如果是CAD解读智能体，则显示CAD解读界面
  if (isCADAnalyzer) {
    // 动态导入CADAnalyzerContainer组件
    const { CADAnalyzerContainer } = require("@/components/cad-analyzer/cad-analyzer-container");
    return <CADAnalyzerContainer />;
  }

  // 如果未选择智能体或类型不是fastgpt，直接提示并阻止输入
  if (!selectedAgent || selectedAgent.type !== 'fastgpt') {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div className="text-lg text-muted-foreground mt-32">请先选择 FastGPT 智能体后再进行对话</div>
      </div>
    )
  }

  // 处理交互节点选择
  const handleInteractiveSelect = async (value: string, key: string) => {
    try {
      console.log('[handleInteractiveSelect] 用户选择:', { value, key });

      // 🔥 立即启用输入框，允许用户继续输入
      console.log('🔓 用户已选择，启用输入框');
      setIsInteractionPending(false);

      // 标记交互消息为已处理，并记录选择信息，更新交互状态
      setMessages((prev: Message[]) =>
        prev.map(msg =>
          msg.metadata?.interactiveData && !msg.metadata.interactiveData.processed
            ? {
                ...msg,
                metadata: {
                  ...msg.metadata,
                  interactiveData: {
                    ...msg.metadata.interactiveData,
                    processed: true,
                    selectedValue: value,
                    selectedKey: key,
                    selectedAt: new Date()
                  },
                  interactionStatus: "completed", // 交互完成
                }
              }
            : msg
        )
      );

      // 创建用户选择消息
      const userMessage: Message = {
        id: Date.now().toString(),
        type: MessageType.Text,
        role: "user" as MessageRole,
        content: value,
        timestamp: new Date(),
        metadata: {
          deviceId: deviceId,
          agentId: selectedAgent?.id,
          apiKey: selectedAgent?.apiKey,
          appId: selectedAgent?.appId,
          isInteractiveResponse: true,
        },
      };

      // 添加用户消息到消息列表
      setMessages((prev: Message[]) => [...prev, userMessage]);

      // 保存消息到本地存储
      if (chatId) {
        const updatedMessages = [...messages, userMessage];
        useMessageStore.getState().saveMessages(chatId as ConversationAgentType, updatedMessages);
        console.log(`Saved ${updatedMessages.length} messages to storage for chat ID: ${chatId}`);
      }

      // 设置为正在输入状态
      setIsTyping(true);

      // 继续工作流程处理
      try {
        // ✅ 交互节点继续运行：根据FastGPT API文档，只传递用户选择的单条消息
        console.log('🔄 交互节点继续运行，只传递用户选择消息:', value);
        const formattedMessages = [{
          role: userMessage.role,
          content: userMessage.content,
        }];

        console.log('📤 交互节点继续运行的请求消息:', formattedMessages);

        if (fastGPTClient) {
          // 创建AbortController
          abortControllerRef.current = new AbortController();

          // 使用 FastGPT 客户端进行流式传输
          console.log('🚀 开始交互节点继续运行，参数:', {
            messages: formattedMessages,
            variables: globalVariables,
            chatId: chatId
          });

          await fastGPTClient.streamChat(formattedMessages, {
            temperature: selectedAgent?.temperature,
            maxTokens: selectedAgent?.maxTokens,
            detail: true,
            variables: globalVariables, // 传递全局变量
            onStart: () => {
              console.log('[streamChat] 交互节点继续运行 onStart');
              setProcessingSteps([]);
              // 立即创建 AI typing 消息，带头像和空内容
              setMessages((prev: Message[]) => {
                // 如果已存在 typing 消息则不重复添加
                if (prev.some(msg => msg.id === 'typing' && msg.role === 'assistant')) return prev;
                return [
                  ...prev,
                  {
                    id: 'typing',
                    type: MessageType.Text,
                    role: 'assistant',
                    content: '',
                    timestamp: new Date(),
                    metadata: {
                      agentId: selectedAgent?.id,
                      apiKey: selectedAgent?.apiKey,
                      appId: selectedAgent?.appId,
                      thinkingStatus: "in-progress", // 初始思考状态
                      interactionStatus: "none",     // 初始交互状态
                    },
                  },
                ];
              });
            },
            onChunk: (chunk: string) => {
              console.log('[streamChat] onChunk:', chunk);
              setCurrentNodeName("");
              setMessages((prev: Message[]) => {
                console.log('[streamChat] onChunk setMessages, prev:', prev);
                // 移除 node-status 气泡
                const filtered = prev.filter(msg => msg.id !== 'node-status');
                // 后续逻辑同原来
                const lastMessage = filtered[filtered.length - 1];
                if (lastMessage && lastMessage.role === "assistant" && lastMessage.id === "typing") {
                  return filtered.map((msg) =>
                    msg.id === "typing" ? { ...msg, content: (msg.content as string) + chunk } : msg,
                  );
                } else {
                  return [
                    ...filtered,
                    {
                      id: "typing",
                      type: MessageType.Text,
                      role: "assistant" as MessageRole,
                      content: chunk,
                      timestamp: new Date(),
                      metadata: {
                        agentId: selectedAgent?.id,
                        apiKey: selectedAgent?.apiKey,
                        appId: selectedAgent?.appId,
                        thinkingStatus: "in-progress", // 初始思考状态
                        interactionStatus: "none",     // 初始交互状态
                      },
                    },
                  ];
                }
              });
            },
            onIntermediateValue: (value: any, eventType: string) => {
              console.log('[onIntermediateValue2] 事件类型:', eventType, '内容:', value);

              // 处理交互节点 - 将交互数据附加到typing消息，不立即创建新消息
              if (eventType === "interactive") {
                console.log('🎯 [交互节点继续运行] 检测到交互节点:', value);

                // 🔥 跨平台兼容性修复：使用统一的安全解析函数（继续运行场景）
                const safeValue = safeCrossPlatformJSONParse(value);

                if (!safeValue) {
                  safeCrossPlatformLog('warn', '[交互节点继续运行] 数据解析失败', { originalValue: value });
                  return;
                }

                // 🔥 使用统一的验证函数（继续运行场景）
                const validationResult = validateInteractiveNodeData(safeValue);

                safeCrossPlatformLog('log', '[交互节点继续运行] 数据验证结果', validationResult);

                // 🔥 新增：再次禁用输入框，等待用户选择（处理连续交互节点）
                console.log('🔒 [交互节点继续运行] 交互节点出现，禁用输入框');
                setIsInteractionPending(true);

                if (validationResult.isValid) {
                  console.log('✅ [交互节点继续运行] 交互节点验证通过，将交互数据附加到typing消息:', (safeValue as any).interactive);

                  // 将交互数据附加到现有的typing消息，如果不存在则创建
                  setMessages((prev: Message[]) => {
                    console.log('🔄 [交互节点继续运行] 准备附加交互数据，当前消息列表:', prev.map(m => ({ id: m.id, role: m.role, hasInteractive: !!m.metadata?.interactiveData })));

                    let typingMsg = prev.find(msg => msg.id === "typing" && msg.role === "assistant");

                    if (!typingMsg) {
                      console.log('⚠️ [交互节点继续运行] typing消息不存在，创建新的typing消息');
                      // 如果 typing 消息不存在，先创建它
                      typingMsg = {
                        id: "typing",
                        type: MessageType.Text,
                        role: "assistant" as MessageRole,
                        content: "",
                        timestamp: new Date(),
                        metadata: {
                          agentId: selectedAgent?.id,
                          apiKey: selectedAgent?.apiKey,
                          appId: selectedAgent?.appId,
                          thinkingStatus: "completed" as const, // 交互节点出现时，思考已完成
                          interactionStatus: "ready" as const,  // 交互准备就绪
                        },
                      };
                      prev = [...prev, typingMsg];
                    }

                    // 然后附加交互数据 - 使用安全验证后的数据（继续运行场景）
                    const result = prev.map((msg) => {
                      if (msg.id === "typing" && msg.role === "assistant") {
                        // 🔥 跨平台兼容性：使用安全克隆函数（继续运行场景）
                        const interactiveDataClone = safeCrossPlatformClone((safeValue as any).interactive);

                        const updatedMsg = {
                          ...msg,
                          metadata: {
                            ...msg.metadata,
                            interactiveData: {
                              ...interactiveDataClone,
                              processed: false,
                              // 添加调试信息
                              _debugInfo: createCrossPlatformDebugInfo('interactive-data-attach-continue', interactiveDataClone)
                            },
                            thinkingStatus: "completed" as const, // 思考完成
                            interactionStatus: "ready" as const,  // 交互准备就绪
                          }
                        };
                        console.log('✅ [交互节点继续运行] 交互数据已附加到消息:', updatedMsg.id, updatedMsg.metadata.interactiveData);
                        return updatedMsg;
                      }
                      return msg;
                    });

                    console.log('🔄 [交互节点继续运行] 附加交互数据后的消息列表:', result.map(m => ({ id: m.id, role: m.role, hasInteractive: !!m.metadata?.interactiveData })));
                    return result;
                  });

                  console.log('🔄 [交互节点继续运行] 交互数据已附加到typing消息，继续流式处理...');
                } else {
                  safeCrossPlatformLog('error', '[交互节点继续运行] 验证失败', {
                    validationResult,
                    originalValue: value,
                    safeValue: safeValue,
                    scenario: 'continue-run'
                  });
                }
              }

              // 其他中间值处理逻辑保持不变
              // 字段兼容处理
              const nodeId = value?.nodeId || value?.id || value?.moduleId || `step-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
              const nodeName = value?.name || value?.moduleName || value?.toolName || eventType;
              const nodeStatus = value?.status || value?.state || "running";
              const step = {
                id: nodeId,
                type: eventType,
                name: nodeName,
                status: nodeStatus,
                content: value?.content || value?.text || value?.message || undefined,
                timestamp: new Date(),
                details: value,
                isNew: true,
              };
              // 日志：setMessages 前后打印 typing 消息的 processingSteps
              setMessages((prev: Message[]) => {
                // 🔥 优化：减少 node-status 消息创建，避免与 typing 消息冲突
                // 只有在没有 typing 消息时才创建 node-status 消息
                if (
                  (eventType === "flowNodeStatus" ||
                  eventType === "moduleStatus" ||
                  eventType === "moduleStart" ||
                  eventType === "moduleEnd" ||
                  eventType === "thinking" ||
                  eventType === "thinkingStart" ||
                  eventType === "thinkingEnd" ||
                  eventType === "toolCall" ||
                  eventType === "toolParams" ||
                  eventType === "toolResponse") &&
                  !prev.find(msg => msg.id === "typing" && msg.role === "assistant")
                ) {
                  console.log('🔄 创建 node-status 消息，因为没有 typing 消息:', nodeName);
                  const filtered = prev.filter(msg => msg.id !== 'node-status');
                  return [
                    ...filtered,
                    {
                      id: 'node-status',
                      type: MessageType.Text,
                      role: 'assistant',
                      content: `🤖 AI正在处理：${nodeName}`,
                      timestamp: new Date(),
                      metadata: { isNodeStatus: true },
                    }
                  ];
                } else if (prev.find(msg => msg.id === "typing" && msg.role === "assistant")) {
                  console.log('🛡️ 跳过 node-status 消息创建，因为存在 typing 消息');
                }
                // 原有逻辑
                const before = prev.find(msg => msg.id === "typing" && msg.role === "assistant");
                console.log('[onIntermediateValue][before] typing:', before);
                const next = prev.map((msg) => {
                  if (msg.id === "typing" && msg.role === "assistant") {
                    const prevSteps = Array.isArray(msg.metadata?.processingSteps) ? msg.metadata.processingSteps : [];
                    const isThinkingEvent = eventType.includes('thinking');
                    const isThinkingEnd = eventType === 'thinkingEnd';

                    return {
                      ...msg,
                      metadata: {
                        ...msg.metadata,
                        processingSteps: [...prevSteps, step],
                        // 更新思考状态
                        thinkingStatus: isThinkingEnd ? "completed" :
                                      (isThinkingEvent ? "in-progress" : msg.metadata?.thinkingStatus),
                        // 如果还没有交互状态，设置为none
                        interactionStatus: msg.metadata?.interactionStatus || "none",
                      },
                    };
                  }
                  return msg;
                });
                const after = next.find(msg => msg.id === "typing" && msg.role === "assistant");
                console.log('[onIntermediateValue][after] typing:', after);
                return next;
              });
              // 捕获API响应的id字段 - 更全面的事件和id字段处理
              if (value && (value.id || value.chatCompletionId)) {
                const responseId = value.id || value.chatCompletionId;
                console.log(`捕获到响应ID: ${responseId} (事件类型: ${eventType})`, value);
                setMessages((prev: Message[]) => {
                  const lastMessage = prev[prev.length - 1]
                  if (lastMessage && lastMessage.role === "assistant" && lastMessage.id === "typing") {
                    return prev.map((msg) =>
                      msg.id === "typing" ? {
                        ...msg,
                        metadata: {
                          ...msg.metadata,
                          responseId: responseId
                        }
                      } : msg,
                    )
                  }
                  return prev
                })
              }
              // 只维护 processingSteps
              if (
                eventType === "flowNodeStatus" ||
                eventType === "moduleStatus" ||
                eventType === "moduleStart" ||
                eventType === "moduleEnd" ||
                eventType === "thinking" ||
                eventType === "thinkingStart" ||
                eventType === "thinkingEnd" ||
                eventType === "toolCall" ||
                eventType === "toolParams" ||
                eventType === "toolResponse"
              ) {
                setProcessingSteps((prev: ProcessingStep[]) => [
                  ...prev,
                  {
                    id: nodeId,
                    type: eventType,
                    name: nodeName,
                    status: nodeStatus,
                    content: value?.content || value?.text || value?.message || undefined,
                    timestamp: new Date(),
                    details: value,
                    isNew: true,
                  },
                ])
              }
              // 遇到节点事件时 setCurrentNodeName
              if (
                eventType === "flowNodeStatus" ||
                eventType === "moduleStatus" ||
                eventType === "moduleStart" ||
                eventType === "moduleEnd" ||
                eventType === "thinking" ||
                eventType === "thinkingStart" ||
                eventType === "thinkingEnd" ||
                eventType === "toolCall" ||
                eventType === "toolParams" ||
                eventType === "toolResponse"
              ) {
                setCurrentNodeName(nodeName);
              }
            },
            onProcessingStep: (step: ProcessingStep) => {
              console.log('[onProcessingStep]', step);
              setProcessingSteps((prev: ProcessingStep[]) => [...prev, step]);
            },
            onError: (error: Error) => {
              console.error('[streamChat] onError:', error);
              setIsTyping(false);
              // 🔥 新增：错误时重置交互状态，允许用户重新输入
              setIsInteractionPending(false);

              // 添加错误消息
              setMessages((prev: Message[]) => {
                // 查找是否已有响应消息
                const lastMessage = prev[prev.length - 1]
                if (lastMessage.role === "assistant" && lastMessage.id === "typing") {
                  // 更新现有消息
                  return prev.map((msg) =>
                    msg.id === "typing"
                      ? {
                          ...msg,
                          id: Date.now().toString(),
                          content:
                            (msg.content as string) || "抱歉，连接服务器时遇到网络问题，请稍后重试。",
                        }
                      : msg,
                  )
                } else {
                  // 创建新的助手消息
                  return [
                    ...prev,
                    {
                      id: Date.now().toString(),
                      type: MessageType.Text,
                      role: "assistant" as MessageRole,
                      content: "抱歉，连接服务器时遇到网络问题，请稍后重试。",
                      timestamp: new Date(),
                      metadata: {
                        agentId: selectedAgent?.id, // 添加智能体ID
                        apiKey: selectedAgent?.apiKey, // 添加API密钥
                        appId: selectedAgent?.appId, // 添加应用ID
                      },
                    },
                  ]
                }
              })

              toast({
                title: "网络连接错误",
                description: "请检查网络连接后重试",
                variant: "destructive",
              })
            },
            onFinish: () => {
              console.log('[streamChat] 交互节点继续运行 onFinish');
              setIsTyping(false)

              // 🔥 新增：交互节点继续运行结束时，检查是否有新的未处理交互节点
              setMessages((prev: Message[]) => {
                const hasUnprocessedInteraction = prev.some(msg =>
                  msg.id === "typing" && msg.metadata?.interactiveData && !msg.metadata.interactiveData.processed
                );

                if (!hasUnprocessedInteraction) {
                  console.log('🔓 [交互节点继续运行] 流式响应结束且无未处理交互节点，启用输入框');
                  setIsInteractionPending(false);
                } else {
                  console.log('🔒 [交互节点继续运行] 流式响应结束但存在未处理交互节点，保持输入框禁用');
                }

                // 统一处理：将typing消息转换为永久消息（可能包含文字内容和/或交互数据）
                console.log('📝 [交互节点继续运行] 流式处理完成，转换typing消息为永久消息');
                return prev.map((msg) =>
                  msg.id === "typing"
                    ? {
                        ...msg,
                        id: Date.now().toString(),
                        metadata: {
                          ...msg.metadata,
                          // 确保思考状态设置为完成
                          thinkingStatus: "completed"
                        }
                      }
                    : msg
                );
              });
            },
            signal: abortControllerRef.current.signal
          });
        }
      } catch (error: any) {
        // 🔥 新增：处理请求中断
        if (error.name === 'AbortError') {
          console.log('交互节点选择后处理被用户中断')
          return
        }
        console.error("交互节点选择后处理错误:", error);
        setIsTyping(false);
      }
    } catch (error: any) {
      // 🔥 新增：处理请求中断
      if (error.name === 'AbortError') {
        console.log('处理交互节点选择被用户中断')
        return
      }
      console.error("处理交互节点选择时出错:", error);
    }
  };

  return (
    <div className={cn(
      "relative flex flex-col h-full w-full mx-auto",
      isMobile ? "w-full px-0" : "max-w-3xl px-2 sm:px-6"
    )}>
      {/* 状态区固定在顶部 - 已移除处理流程显示 */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm">
        {/* ProcessingFlowDisplay已移除 */}
      </div>

      {/* 语音输入弹窗 - 统一的语音输入控制 */}
      {voiceInputVisible && (
        <div className="absolute z-50 left-0 right-0 bottom-16 flex justify-center">
          <div className="bg-background border rounded-lg shadow-2xl p-4 max-w-sm w-full mx-4">
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              placeholder="开始语音输入..."
            />
            <button
              onClick={() => setVoiceInputVisible(false)}
              className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground"
            >
              关闭
            </button>
          </div>
        </div>
      )}
      {showHistory && (
        <div className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center overflow-y-auto",
          isMobile ? "p-2" : "p-4"
        )} data-testid="chat-history-modal">
          <ChatHistory
            onClose={() => setShowHistory(false)}
            onSelect={(messages, chatId) => handleHistorySelect(messages, chatId)}
            onNewChat={() => {
              createNewConversation()
              setShowHistory(false)
            }}
            onManageHistory={() => {
              setShowHistoryManager(true)
            }}
          />
        </div>
      )}
      {showHistoryManager && (
        <HistoryManager
          open={showHistoryManager}
          onOpenChange={setShowHistoryManager}
          onHistoryUpdated={() => {
            // 刷新历史记录
            if (showHistory) {
              setShowHistory(false)
              setTimeout(() => setShowHistory(true), 100)
            }
          }}
        />
      )}

      {/* 消息滚动区 */}
      <ScrollArea className={cn(
        "flex-1 pb-6 h-[calc(100vh-4rem)]",
        isMobile ? "px-0" : "px-2 sm:px-4"
      )}>
        <div className={cn(
          "mx-auto space-y-4 sm:space-y-6 pb-32",
          // 增加更多顶部间距，确保初始化信息的AI头像完整显示，不被header遮盖
          // 移动端使用mt-24（96px）确保头像完全不被64px高的header遮挡，桌面端保持mt-16
          "mt-24 sm:mt-16",
          isMobile ? "w-full px-2" : "max-w-3xl"
        )}>


          {/* 消息列表 - 过滤掉连续的助手消息，只保留最后一个，但保护包含交互数据的消息 */}
          {(() => {
            const filteredMessages = messages.filter((msg, idx, arr) => {
              // 如果不是助手消息，保留
              if (msg.role !== 'assistant') return true;

              // 🔥 最高优先级：如果是 typing 消息，必须保留（包含实际内容和思考数据）
              if (msg.id === "typing") {
                console.log('🛡️ 保护 typing 消息:', msg.id, {
                  hasContent: !!msg.content,
                  hasProcessingSteps: !!msg.metadata?.processingSteps?.length,
                  hasInteractiveData: !!msg.metadata?.interactiveData,
                  thinkingStatus: msg.metadata?.thinkingStatus,
                  interactionStatus: msg.metadata?.interactionStatus
                });
                return true;
              }

              // 🔥 关键修复：如果包含交互数据，必须保留
              if (msg.metadata?.interactiveData) {
                console.log('🛡️ 保护包含交互数据的消息:', msg.id, msg.metadata.interactiveData);
                return true;
              }

              // 🔥 过滤掉 node-status 消息，避免与交互节点冲突
              if (msg.metadata?.isNodeStatus) {
                console.log('🚫 过滤掉 node-status 消息:', msg.id);
                return false;
              }

              // 如果是最后一条消息，保留
              if (idx === arr.length - 1) return true;

              // 如果下一条消息不是助手消息，保留
              if (idx < arr.length - 1 && arr[idx + 1].role !== 'assistant') return true;

              // 否则过滤掉（连续的助手消息中的非最后一条）
              return false;
            });

            // 调试日志：检查过滤结果
            const interactiveMessagesBefore = messages.filter(m => m.metadata?.interactiveData).length;
            const interactiveMessagesAfter = filteredMessages.filter(m => m.metadata?.interactiveData).length;
            console.log('📋 消息过滤结果:', {
              总消息数_过滤前: messages.length,
              总消息数_过滤后: filteredMessages.length,
              交互消息数_过滤前: interactiveMessagesBefore,
              交互消息数_过滤后: interactiveMessagesAfter,
              交互消息是否丢失: interactiveMessagesBefore !== interactiveMessagesAfter
            });

            return filteredMessages;
          })().map((msg, idx) => (
            <ChatMessage
              key={msg.id + idx}
              message={msg}
              onRegenerate={() => handleRegenerate(msg.id)}
              onCopy={handleCopy}
              onDelete={deleteMessage}
              onEdit={editMessage}
              onInteractiveSelect={handleInteractiveSelect}
              chatId={chatId || undefined}
              isTyping={isTyping}
            />
          ))}

          {/* 主流AI风格的美化 loading 动画，仅在 AI 回复前显示 */}
          {isTyping && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
            <div className="flex items-center gap-3 mt-2 mb-2 px-5 py-3 rounded-3xl bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 dark:from-primary/30 dark:via-primary/20 dark:to-primary/10 shadow-lg border border-primary/20 w-fit animate-fade-in">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center shadow-lg ring-2 ring-blue-400/30">
                <img src="/mascot.png" alt="AI" className="w-7 h-7 rounded-full object-cover" />
              </div>
              <span className="flex gap-1 ml-1">
                <span className="inline-block w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="inline-block w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="inline-block w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />

          {/* 旧的独立交互节点渲染逻辑已移除，现在交互节点在消息气泡内渲染 */}
        </div>
      </ScrollArea>

      {showOptions && <ChatOptions onClose={() => setShowOptions(false)} />}

      {/* 工具栏 - 移动端优化 */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-10 z-20"
           style={isMobile ? {padding: "0.5rem 0"} : {padding: "0.5rem 1rem"}}>
        <div className={cn(
          "mx-auto",
          isMobile ? "w-full" : "max-w-3xl"
        )}>
          {/* 新对话按钮 - 仅在有消息时显示 */}
          {messages.length > 0 && (
            <div className="flex justify-center mb-3">
              <NewConversationButton />
            </div>
          )}

          {/* 文件上传组件 - 根据智能体配置显示或隐藏 */}
          {isUploading && selectedAgent?.supportsFileUpload !== false && (
            <FileUploader onClose={() => setIsUploading(false)} onFileUpload={handleFileUpload} />
          )}

          <div className={cn("relative", isMobile && "px-3")}>
            {/* Mobile buttons inside the input area */}
            {isMobile && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
                {/* 文件上传按钮 - 根据智能体配置显示或隐藏 */}
                {selectedAgent?.supportsFileUpload !== false && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    onClick={() => setIsUploading(true)}
                  >
                    <Paperclip className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
                  </Button>
                )}
                {/* 统一的语音输入按钮 */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  onClick={() => setVoiceInputVisible(true)}
                >
                  <Mic className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
                </Button>
              </div>
            )}

            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e)}
              placeholder={isInteractionPending ? "请先选择上方的选项..." : t("inputPlaceholder")}
              disabled={isInteractionPending}
              className={cn(
                "min-h-[60px] resize-none py-4 text-sm sm:text-base shadow-none focus:shadow-none transition-colors duration-200",
                "border-[#e9ecef] dark:border-zinc-700 focus:border-primary focus:ring-1 focus:ring-primary/20",
                isMobile ? "rounded-lg pl-[130px] pr-[70px]" : "rounded-lg pl-4 pr-32",
                isInteractionPending && "opacity-50 cursor-not-allowed bg-muted",
              )}
              rows={1}
            />

            <div
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-1.5"
              )}
            >
              <TooltipProvider>
                {/* 文件上传按钮 - 根据智能体配置显示或隐藏，移动端隐藏 */}
                {!isMobile && selectedAgent?.supportsFileUpload !== false && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        onClick={() => setIsUploading(true)}
                      >
                        <Paperclip className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-600 dark:text-zinc-300" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("uploadFile")}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {/* 统一的语音输入按钮 - 桌面端 */}
                {!isMobile && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        onClick={() => setVoiceInputVisible(true)}
                      >
                        <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-600 dark:text-zinc-300" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("recording")}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>

              <Button
                onClick={() => {
                  if (isTyping) {
                    if (abortControllerRef.current) {
                      abortControllerRef.current.abort()
                      abortControllerRef.current = null
                    }
                    setIsTyping(false)
                    // 清理相关状态
                    setProcessingSteps([])
                    setCurrentNodeName("")
                    // 🔥 新增：取消时重置交互状态，允许用户重新输入
                    setIsInteractionPending(false)
                    // 移除typing消息
                    setMessages(prev => prev.filter(msg => msg.id !== 'typing'))
                  } else {
                    handleSend()
                  }
                }}
                disabled={(!input.trim() && uploadedFiles.length === 0) && !isTyping || isInitializing || isInteractionPending}
                className={cn(
                  "btn-primary h-8 sm:h-9 text-xs sm:text-sm font-medium",
                  "bg-primary hover:bg-primary/90",
                  "transition-colors duration-200 shadow-none",
                  (isTyping || isInitializing) && "opacity-50 cursor-not-allowed",
                )}
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-4 sm:w-4 animate-spin mr-1" />
                    初始化中
                  </>
                ) : isTyping ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-4 sm:w-4 animate-spin mr-1" />
                    取消
                  </>
                ) : (
                  <>
                    <SendHorizonal className="h-4 w-4 sm:h-4 sm:w-4 mr-0 sm:mr-1.5" />
                    {!isMobile && t("send")}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 显示已上传文件的预览 */}
          {uploadedFiles.length > 0 && (
            <div className={cn("mt-2 flex flex-wrap gap-2", isMobile && "px-2")}>
              {uploadedFiles.map((file: UploadedFile) => (
                <div key={file.id} className="bg-accent/50 rounded-md p-1 px-2 text-xs flex items-center gap-1">
                  {file.type.startsWith("image/") ? (
                    <ImageIcon className="h-3 w-3" />
                  ) : (
                    <FileIcon className="h-3 w-3" />
                  )}
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 hover:bg-accent"
                    onClick={() => setUploadedFiles((prev) => prev.filter((f) => f.id !== file.id))}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Mobile disclaimer only */}
          {isMobile && (
            <div className="flex justify-center items-center mt-2 px-2">
              <div className="text-xs text-center text-muted-foreground opacity-70">{t("disclaimer")}</div>
            </div>
          )}

          {/* 免责声明 - 仅在非移动端显示 */}
          {!isMobile && (
            <div className="text-xs text-center text-muted-foreground mt-2.5 opacity-70">{t("disclaimer")}</div>
          )}
        </div>
      </div>

      {/* 全局变量表单 */}
      {selectedAgent && (
        <GlobalVariablesForm
          agent={selectedAgent}
          isOpen={showGlobalVariablesForm}
          onClose={() => setShowGlobalVariablesForm(false)}
          onSubmit={handleGlobalVariablesSubmit}
          initialValues={globalVariables}
        />
      )}
    </div>
  )
}
