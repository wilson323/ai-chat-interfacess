"use client"

import type React from "react"
import type { UploadedFile } from "@/components/file-uploader"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAgent } from "@/context/agent-context"
import { Paperclip, Mic, StopCircle, WifiOff, SendHorizonal, Loader2, ImageIcon, FileIcon, X, History } from "lucide-react"
import { type Message, MessageType, MessageRole } from "@/types/message"
import { ChatMessage } from "@/components/chat-message"
import { FileUploader } from "@/components/file-uploader"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils" // 移除 getDeviceId 导入，因为我们现在从 storage 导入它
import { useToast } from "@/components/ui/use-toast"
import { Bot } from "lucide-react"
import { ImageEditorContainer } from "@/components/image-editor/image-editor-container"
import { CADAnalyzerContainer } from "@/components/cad-analyzer/cad-analyzer-container"
import { useLanguage } from "@/context/language-context"
import { SettingsDialog } from "@/components/settings-dialog"
import { ChatOptions } from "@/components/chat-options"
import { ChatHistory } from "@/components/chat-history"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { WelcomeMessage } from "@/components/welcome-message"
import { useMobile } from "@/hooks/use-mobile"
import { generateOfflineResponse, checkNetworkConnection } from "@/lib/offline-mode"
import { validateInput, sanitizeInput } from "@/lib/security"

// 导入新的统一API模块
import { FastGPTClient, generateFallbackChatId, initializeChat } from "@/lib/api/fastgpt"

// 导入统一存储服务
import { HistoryManager } from "@/components/history-manager"

import { ProcessingFlowDisplay, type ProcessingStep } from "@/components/processing-flow-display"
import { FastGPTFlowDisplay } from "@/components/fastgpt-flow-display"

import { useMessageStore } from "@/lib/store/messageStore"
import { QuestionSuggestions } from "@/components/question-suggestions"
import VoiceRecorder from "@/components/ui/voice-recorder"

const createNewConversation = () => {
  window.dispatchEvent(new CustomEvent("new-conversation"))
}

export function ChatContainer() {
  const { selectedAgent, toggleHistorySidebar, selectAgent } = useAgent()
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
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const { toast } = useToast()

  // 新增状态
  const [welcomeMessage, setWelcomeMessage] = useState<string>("")
  const [systemPrompt, setSystemPrompt] = useState<string | null>(null)
  const [interacts, setInteracts] = useState<any[]>([])
  const [fastGPTClient, setFastGPTClient] = useState<FastGPTClient | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [textareaHeight, setTextareaHeight] = useState<number>(60)
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [showHistoryManager, setShowHistoryManager] = useState(false)

  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([])
  const [showProcessingFlow, setShowProcessingFlow] = useState<boolean>(false)
  const [flowNodes, setFlowNodes] = useState<any[]>([])
  const [showFlowNodes, setShowFlowNodes] = useState<boolean>(false)

  const [suggestions, setSuggestions] = useState<string[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)

  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)

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

  // Get the device ID for user tracking
  const [deviceId] = useState<string>(() => generateFallbackChatId())

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Log the device ID when the component mounts
  useEffect(() => {
    console.log("Device ID for tracking:", deviceId)
    // You can use this deviceId to fetch chat history for this specific device
  }, [deviceId])

  // 当智能体变化时初始化聊天会话
  useEffect(() => {
    if (selectedAgent) {
      console.log('智能体变化，初始化聊天会话:', selectedAgent.name);

      // 如果智能体已经有chatId，尝试加载现有会话
      if (selectedAgent.chatId) {
        console.log('智能体已有chatId，尝试加载现有会话:', selectedAgent.chatId);
        const existingMessages = useMessageStore.getState().loadMessages(selectedAgent.chatId);

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
      toggleHistory()
    }

    window.addEventListener("toggle-history", handleToggleHistory)

    return () => {
      window.removeEventListener("toggle-history", handleToggleHistory)
    }
  }, []) // 移除toggleHistory依赖，避免循环依赖

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

  // 在useEffect中添加网络检查
  useEffect(() => {
    // 定期检查网络连接
    const checkNetwork = async () => {
      const isOnline = await checkNetworkConnection()
      if (isOnline !== !isOfflineMode) {
        setIsOfflineMode(!isOnline)

        if (isOnline && isOfflineMode) {
          toast({
            title: "网络已恢复",
            description: "已切换到在线模式",
            variant: "default",
          })
        } else if (!isOnline && !isOfflineMode) {
          toast({
            title: "网络连接丢失",
            description: "已切换到离线模式",
            variant: "destructive",
          })
        }
      }
    }

    // 初始检查
    checkNetwork()

    // 设置定期检查
    const intervalId = setInterval(checkNetwork, 30000) // 每30秒检查一次

    return () => clearInterval(intervalId)
  }, [isOfflineMode, toast])

  // Update the initChatSession function to properly handle welcome messages
  const initChatSession = async () => {
    if (!selectedAgent) return

    try {
      // 生成本地chatId
      const localChatId = generateFallbackChatId()
      setChatId(localChatId)
      console.log(`Generated new chat ID: ${localChatId}`)

      // 尝试从本地存储加载消息
      console.log(`尝试从本地存储加载消息，chatId: ${localChatId}`);
      const localMessages = useMessageStore.getState().loadMessages(localChatId);

      if (localMessages && localMessages.length > 0) {
        console.log(`成功从本地存储加载到 ${localMessages.length} 条消息`);
        setMessages(localMessages);

        // 确保消息被正确保存到localStorage
        useMessageStore.getState().saveMessages(localChatId, localMessages);
      } else {
        console.log(`本地存储中没有找到消息，初始化空消息列表`);
        setMessages([]);
      }

      setConnectionError(null)

      // 从API获取初始化信息
      console.log("从API获取初始化信息...");
      const initResponse = await initializeChat(selectedAgent)
      console.log("API初始化响应:", initResponse);

      // 优先级：FastGPT API 返回 > 管理员配置 > 默认
      let welcomeText = initResponse?.data?.app?.chatConfig?.welcomeText
      if (!welcomeText || typeof welcomeText !== 'string') {
        welcomeText = selectedAgent.welcomeText || "你好！我是智能助手，有什么可以帮您？"
      }

      // 设置系统提示词，优先使用API返回的系统提示词
      const systemPromptText = (initResponse as any)?.system_prompt || selectedAgent.systemPrompt || null
      setSystemPrompt(systemPromptText)

      // 设置欢迎消息，优先使用API返回的欢迎消息
      const welcomeMessage = (initResponse as any)?.welcome_message || welcomeText
      setWelcomeMessage(welcomeMessage)

      // 设置交互选项，优先使用API返回的交互选项
      const interactOptions = Array.isArray((initResponse as any)?.interacts)
        ? (initResponse as any).interacts
        : Array.isArray(initResponse?.data?.interacts)
          ? initResponse.data.interacts
          : []
      setInteracts(interactOptions)

      // 日志追踪
      console.log('initChatSession完成', {
        selectedAgent,
        welcomeMessage,
        systemPrompt: systemPromptText,
        interacts: interactOptions,
        localMessages,
        initResponse
      })

      if (selectedAgent) {
        selectedAgent.chatId = localChatId
      }

      // 保存初始化信息到localStorage，以便在页面刷新后恢复
      localStorage.setItem(`agent_${selectedAgent.id}_welcome_message`, welcomeMessage);
      localStorage.setItem(`agent_${selectedAgent.id}_system_prompt`, systemPromptText || '');
      localStorage.setItem(`agent_${selectedAgent.id}_interacts`, JSON.stringify(interactOptions));

    } catch (error) {
      console.error("Unexpected error during chat initialization:", error)
      setIsOfflineMode(true)

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

      // 尝试从localStorage恢复初始化信息
      if (selectedAgent) {
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
      }
    }
  }

  // 处理文件上传完成
  const handleFileUpload = (files: UploadedFile[]) => {
    setUploadedFiles(files)
    if (files.some((file) => file.status === "complete")) {
      setTimeout(() => {
        setIsUploading(false)
        if (files.length > 0) {
          setInput((prev) => {
            const fileNames = files.map((f) => f.name).join(", ")
            return prev ? `${prev}\n已上传文件: ${fileNames}` : `已上传文件: ${fileNames}`
          })
        }
      }, 1000)
    }
  }

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return

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
    setMessages((prev) => [...prev, userMessage])

    // 保存消息到本地存储
    if (chatId) {
      const updatedMessages = [...messages, userMessage]
      useMessageStore.getState().saveMessages(chatId, updatedMessages)
      console.log(`Saved ${updatedMessages.length} messages to storage for chat ID: ${chatId}`)
    }

    setInput("")
    setIsTyping(true)

    // 清空已上传文件列表
    setUploadedFiles([])

    // 自动调整文本区域大小
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    // 如果处于离线模式，生成离线响应
    if (isOfflineMode) {
      // 延迟一下，模拟思考时间
      setTimeout(() => {
        const offlineResponse = generateOfflineResponse(input)

        // 添加助手消息
        const assistantMessage = {
          id: Date.now().toString(),
          type: MessageType.Text,
          role: "assistant" as MessageRole,
          content: offlineResponse,
          timestamp: new Date(),
          metadata: {
            offline: true,
            agentId: selectedAgent?.id, // 添加智能体ID
            apiKey: selectedAgent?.apiKey, // 添加API密钥
            appId: selectedAgent?.appId, // 添加应用ID
          },
        }

        setMessages((prev) => [...prev, assistantMessage])
        setIsTyping(false)

        // 保存消息到本地存储
        if (chatId) {
          const updatedMessages = [...messages, userMessage, assistantMessage]
          useMessageStore.getState().saveMessages(chatId, updatedMessages)
          console.log(`Saved offline response to storage for chat ID: ${chatId}`)
        }
      }, 1000)

      return
    }

    // 检查API是否配置 - 只在管理员模式下检查API配置
    const isAdmin = localStorage.getItem("adminLoggedIn") === "true";

    // 如果是管理员模式，则检查API配置
    if (isAdmin) {
      if (!selectedAgent?.apiEndpoint) {
        setShowSettings(true)
        toast({
          title: "需要API配置",
          description: "请在设置中配置API端点以继续",
          variant: "destructive",
        })
        return
      }

      if (!selectedAgent?.apiKey || !selectedAgent?.appId) {
        setShowSettings(true)
        toast({
          title: "需要API配置",
          description: "请在设置中配置API密钥和AppID以继续",
          variant: "destructive",
        })
        return
      }
    }

    // 非管理员模式下，不检查API配置，直接继续

    // 确保我们有一个chatId，即使初始化失败
    if (!chatId && selectedAgent) {
      // 如果没有chatId，使用已保存的初始化信息
      const savedWelcomeMessage = localStorage.getItem(`agent_${selectedAgent.id}_welcome_message`);
      const savedSystemPrompt = localStorage.getItem(`agent_${selectedAgent.id}_system_prompt`);
      const savedInteracts = localStorage.getItem(`agent_${selectedAgent.id}_interacts`);

      // 如果有保存的初始化信息，直接使用
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

      // 生成一个新的chatId
      const fallbackChatId = generateFallbackChatId()
      setChatId(fallbackChatId)
      selectedAgent.chatId = fallbackChatId

      console.log("使用保存的初始化信息和新的chatId:", {
        chatId: fallbackChatId,
        welcomeMessage: savedWelcomeMessage,
        systemPrompt: savedSystemPrompt,
        interacts: savedInteracts ? JSON.parse(savedInteracts) : []
      });
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
      } else if (selectedAgent.systemPrompt && !formattedMessages.some((msg) => msg.role === "system")) {
        formattedMessages.unshift({
          role: "system" as MessageRole,
          content: selectedAgent.systemPrompt,
        })
      }

      if (fastGPTClient) {
        try {
          // 优先尝试使用流式模式
          try {
            // 使用 FastGPT 客户端进行流式传输
            await fastGPTClient.streamChat(formattedMessages, {
              temperature: selectedAgent.temperature,
              maxTokens: selectedAgent.maxTokens,
              onStart: () => {
                console.log("流开始")
                // 重置处理步骤和流节点
                setProcessingSteps([])
                setFlowNodes([])
                setShowProcessingFlow(true)
                setShowFlowNodes(true)
              },
              onChunk: (chunk) => {
                setMessages((prev) => {
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
                        },
                      },
                    ]
                  }
                })
              },
              onIntermediateValue: (value, eventType) => {
                console.log(`收到中间值事件: ${eventType}`, value)

                // 捕获API响应的id字段 - 更全面的事件和id字段处理
                // 检查所有可能包含id的事件类型，不限于特定事件类型
                if (value && (value.id || value.chatCompletionId)) {
                  const responseId = value.id || value.chatCompletionId;
                  console.log(`捕获到响应ID: ${responseId} (事件类型: ${eventType})`, value);

                  // 更新消息的metadata，添加API响应的id字段
                  setMessages((prev) => {
                    // 查找是否已有响应消息
                    const lastMessage = prev[prev.length - 1]
                    if (lastMessage && lastMessage.role === "assistant" && lastMessage.id === "typing") {
                      // 更新现有消息的metadata
                      return prev.map((msg) =>
                        msg.id === "typing" ? {
                          ...msg,
                          metadata: {
                            ...msg.metadata,
                            responseId: responseId  // 添加API响应的id字段
                          }
                        } : msg,
                      )
                    }
                    return prev
                  })
                }

                // 处理不同类型的中间值
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
                  // 追加到 processingSteps，带动画标记
                  setProcessingSteps((prev) => [
                    ...prev,
                    {
                      id: value.nodeId || value.id || `step-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                      type: eventType,
                      name: value.name || value.moduleName || value.toolName || eventType,
                      status: value.status || "running",
                      content: value.content || value.text || value.message || undefined,
                      timestamp: new Date(),
                      details: value,
                      isNew: true, // 新增动画标记
                    },
                  ])
                }
                // 兼容原有 flowNodes 逻辑
                if (
                  eventType === "flowNodeStatus" ||
                  eventType === "moduleStatus" ||
                  eventType === "moduleStart" ||
                  eventType === "moduleEnd"
                ) {
                  setFlowNodes((prev) => {
                    const nodeName = value.name || value.moduleName || "未知节点"
                    const nodeStatus = value.status || "running"
                    const existingNodeIndex = prev.findIndex((node) => node.id === value.nodeId || node.name === nodeName)
                    if (existingNodeIndex >= 0) {
                      const updatedNodes = [...prev]
                      updatedNodes[existingNodeIndex] = {
                        ...updatedNodes[existingNodeIndex],
                        status: nodeStatus,
                        timestamp: new Date(),
                        details: value,
                      }
                      return updatedNodes
                    } else {
                      return [
                        ...prev,
                        {
                          id: value.nodeId || `node-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                          name: nodeName,
                          status: nodeStatus,
                          timestamp: new Date(),
                          details: value,
                        },
                      ]
                    }
                  })
                }
              },
              onProcessingStep: (step) => {
                console.log("处理步骤:", step)
                setProcessingSteps((prev) => [...prev, step])
              },
              onError: (error) => {
                console.error("流错误:", error)

                // 设置离线模式
                setIsOfflineMode(true)

                // 添加错误消息
                setMessages((prev) => {
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
                              (msg.content as string) || "抱歉，连接服务器时遇到网络问题。我将以离线模式为您服务。",
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
                        content: "抱歉，连接服务器时遇到网络问题。我将以离线模式为您服务。",
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

                setIsTyping(false)

                // 保存消息到本地存储
                if (chatId) {
                  setTimeout(() => {
                    useMessageStore.getState().saveMessages(chatId, messages)
                  }, 100)
                }

                toast({
                  title: "网络连接错误",
                  description: "已切换到离线模式",
                  variant: "destructive",
                })
              },
              onFinish: () => {
                setIsTyping(false)
                // 将临时消息 ID 更新为永久 ID
                setMessages((prev) => {
                  console.log("流完成----------=",prev)
                  const updatedMessages = prev.map((msg) =>
                    msg.id === "typing" ? { ...msg, id: Date.now().toString() } : msg,
                  )

                  // 保存更新后的消息到本地存储
                  if (chatId) {
                    useMessageStore.getState().saveMessages(chatId, updatedMessages)
                    console.log(`Saved ${updatedMessages.length} messages after stream completion for chat ID: ${chatId}`)
                  }

                  return updatedMessages
                })
              },
            })
          } catch (streamError) {
            console.warn("流式请求失败，尝试使用非流式模式:", streamError);

            // 创建一个占位消息，等待非流式响应
            setMessages((prev) => [
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
                },
              },
            ]);

            // 切换到非流式模式
            const content = await fastGPTClient.chat(formattedMessages, {
              temperature: selectedAgent.temperature,
              maxTokens: selectedAgent.maxTokens,
              // 处理非流式响应数据，特别是提取ID
              onResponseData: (responseData: any) => {
                console.log("收到非流式响应数据:", responseData);

                // 提取响应ID并保存到消息元数据中
                if (responseData && (responseData.id || responseData.chatCompletionId || responseData.completionId)) {
                  const responseId = responseData.id || responseData.chatCompletionId || responseData.completionId;

                  console.log(`非流式模式捕获到响应ID: ${responseId}`, responseData);

                  // 更新typing消息的元数据
                  setMessages((prev) => {
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
            });

            // 更新消息内容
            setMessages((prev) => {
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
        } catch (error) {
          console.error("聊天请求错误:", error);

          // 设置离线模式
          setIsOfflineMode(true)

          // 添加来自助手的错误消息
          const errorMessage = {
            id: Date.now().toString(),
            type: MessageType.Text,
            role: "assistant" as MessageRole,
            content: "抱歉，处理您的请求时遇到错误。我将以离线模式为您服务。",
            timestamp: new Date(),
            metadata: {
              agentId: selectedAgent?.id, // 添加智能体ID
              apiKey: selectedAgent?.apiKey, // 添加API密钥
              appId: selectedAgent?.appId, // 添加应用ID
            },
          }

          setMessages((prev) => [...prev, errorMessage])
          setIsTyping(false)

          toast({
            title: "错误",
            description: error instanceof Error ? error.message : "发送消息失败，已切换到离线模式",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("发送消息时出错:", error)

      // 设置离线模式
      setIsOfflineMode(true)

      // 添加来自助手的错误消息
      const errorMessage = {
        id: Date.now().toString(),
        type: MessageType.Text,
        role: "assistant" as MessageRole,
        content: "抱歉，处理您的请求时遇到错误。我将以离线模式为您服务。",
        timestamp: new Date(),
        metadata: {
          agentId: selectedAgent?.id, // 添加智能体ID
        },
      }

      setMessages((prev) => [...prev, errorMessage])
      setIsTyping(false)

      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "发送消息失败，已切换到离线模式",
        variant: "destructive",
      })
    }
  }

  // 重新生成消息
  const handleRegenerate = async (messageId: string) => {
    // 查找最后一条用户消息
    const lastUserMessageIndex = [...messages].reverse().findIndex((msg) => msg.role === "user")
    if (lastUserMessageIndex === -1) return

    const lastUserMessage = messages[messages.length - 1 - lastUserMessageIndex]

    // 删除最后一条用户消息之后的所有助手消息
    const messagesToKeep = messages.slice(0, messages.length - lastUserMessageIndex)
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
              temperature: selectedAgent.temperature,
              maxTokens: selectedAgent.maxTokens,
              onStart: () => {
                console.log("重新生成流开始")
              },
              onIntermediateValue: (value, eventType) => {
                console.log(`重新生成收到中间值事件: ${eventType}`, value)

                // 捕获API响应的id字段 - 更全面的事件和id字段处理
                // 检查所有可能包含id的事件类型，不限于特定事件类型
                if (value && (value.id || value.chatCompletionId)) {
                  const responseId = value.id || value.chatCompletionId;
                  console.log(`重新生成捕获到响应ID: ${responseId} (事件类型: ${eventType})`, value);

                  // 更新消息的metadata，添加API响应的id字段
                  setMessages((prev) => {
                    // 查找是否已有响应消息
                    const lastMessage = prev[prev.length - 1]
                    if (lastMessage && lastMessage.role === "assistant" && lastMessage.id === "typing") {
                      // 更新现有消息的metadata
                      return prev.map((msg) =>
                        msg.id === "typing" ? {
                          ...msg,
                          metadata: {
                            ...msg.metadata,
                            responseId: responseId  // 添加API响应的id字段
                          }
                        } : msg,
                      )
                    }
                    return prev
                  })
                }
              },
              onChunk: (chunk) => {
                setMessages((prev) => {
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
                        },
                      },
                    ]
                  }
                })
              },
              onError: (error) => {
                console.error("重新生成流错误:", error)
                toast({
                  title: "错误",
                  description: error.message,
                  variant: "destructive",
                })
              },
              onFinish: () => {
                console.log("重新生成流完成")
                setIsTyping(false)
                // 将临时消息 ID 更新为永久 ID
                setMessages((prev) =>
                  prev.map((msg) => (msg.id === "typing" ? { ...msg, id: Date.now().toString() } : msg)),
                )
              },
            })
          } catch (streamError) {
            console.warn("重新生成流式请求失败，尝试使用非流式模式:", streamError);

            // 创建一个占位消息，等待非流式响应
            setMessages((prev) => [
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
                },
              },
            ]);

            // 切换到非流式模式
            const content = await fastGPTClient.chat(formattedMessages, {
              temperature: selectedAgent.temperature,
              maxTokens: selectedAgent.maxTokens,
              // 处理非流式响应数据，特别是提取ID
              onResponseData: (responseData: any) => {
                console.log("重新生成收到非流式响应数据:", responseData);

                // 提取响应ID并保存到消息元数据中
                if (responseData && (responseData.id || responseData.chatCompletionId || responseData.completionId)) {
                  const responseId = responseData.id || responseData.chatCompletionId || responseData.completionId;

                  console.log(`重新生成非流式模式捕获到响应ID: ${responseId}`, responseData);

                  // 更新typing消息的元数据
                  setMessages((prev) => {
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
            });

            // 更新消息内容
            setMessages((prev) => {
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
        } catch (error) {
          console.error("重新生成消息时出错:", error)

          // 添加错误消息
          setMessages((prev) => [
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
        setMessages((prev) => [
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
    } catch (error) {
      console.error("重新生成消息时出错:", error)

      // 添加错误消息
      setMessages((prev) => [
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
      // Prevent duplicate submissions by checking if we're already typing
      if (!isTyping) {
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
    console.log('[历史] 选中会话', selectedChatId, selectedMessages)
    setMessages(selectedMessages)
    setChatId(selectedChatId)
    if (selectedAgent) {
      selectedAgent.chatId = selectedChatId
    }
    setShowHistory(false)
  }

  // 尝试重新连接
  const handleRetryConnection = () => {
    setConnectionError(null)
    initChatSession()
  }

  // Add message deletion functionality
  const deleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId))

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
        setMessages((prev) => prev.filter((_, i) => i !== actualIndex))
      }
    }

    // Save updated messages to local storage
    if (chatId) {
      setTimeout(() => {
        const updatedMessages = messages.filter((msg) => msg.id !== messageId)
        useMessageStore.getState().saveMessages(chatId, updatedMessages)
        console.log(`Saved ${updatedMessages.length} messages after deletion for chat ID: ${chatId}`)
      }, 100)
    }
  }

  // Add message editing functionality
  const editMessage = (messageId: string, newContent: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, content: newContent } : msg)))

    // Save updated messages to local storage
    if (chatId) {
      setTimeout(() => {
        const updatedMessages = messages.map((msg) => (msg.id === messageId ? { ...msg, content: newContent } : msg))
        useMessageStore.getState().saveMessages(chatId, updatedMessages)
        console.log(`Saved ${updatedMessages.length} messages after editing for chat ID: ${chatId}`)
      }, 100)
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

  // 根据智能体类型渲染适当的组件
  const renderSpecialAgentComponent = () => {
    if (selectedAgent?.type === "image-editor") {
      return <ImageEditorContainer />
    } else if (selectedAgent?.type === "cad-analyzer") {
      return <CADAnalyzerContainer />
    }
    return null;
  }

  // 是否是特殊类型的智能体
  const isSpecialAgent = selectedAgent?.type === "image-editor" || selectedAgent?.type === "cad-analyzer";

  // 渲染前日志追踪，避免 Fragment linter 报错
  if (selectedAgent?.type === 'fastgpt' && welcomeMessage && messages.length === 0) {
    console.log('WelcomeMessage render', { selectedAgentType: selectedAgent?.type, welcomeMessage, messagesLength: messages.length })
  }

  // setMessages 后自动本地保存
  useEffect(() => {
    if (chatId) {
      console.log(`自动保存 ${messages.length} 条消息到本地存储，chatId: ${chatId}`);
      useMessageStore.getState().saveMessages(chatId, messages);

      // 验证保存是否成功
      setTimeout(() => {
        const savedMessages = useMessageStore.getState().loadMessages(chatId);
        console.log(`验证保存：从本地存储加载到 ${savedMessages.length} 条消息`);
      }, 100);
    }
  }, [messages, chatId])

  useEffect(() => {
    if (selectedAgent?.type === "fastgpt") {
      // 检查是否有保存的欢迎消息
      const savedWelcomeMessage = localStorage.getItem(`agent_${selectedAgent.id}_welcome_message`);

      if (savedWelcomeMessage) {
        // 优先使用保存的欢迎消息
        setWelcomeMessage(savedWelcomeMessage);
      } else {
        // 如果没有保存的欢迎消息，使用智能体配置的欢迎消息
        setWelcomeMessage(selectedAgent.welcomeText || "你好！我是智能助手，有什么可以帮您？");
      }
    } else {
      setWelcomeMessage("")
    }
  }, [selectedAgent])

  // 如果是特殊类型的智能体，渲染对应的组件
  if (isSpecialAgent) {
    return renderSpecialAgentComponent();
  }

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto px-2 sm:px-6">
      {/* 右上角历史按钮 - 与header中的图标对齐 */}
      <div className="absolute top-4 right-[2.5rem] z-30">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 sm:h-9 w-8 sm:w-9"
          onClick={() => setShowHistory(true)}
          data-testid="open-history-btn"
          aria-label="打开聊天历史"
        >
          <History className="h-4 sm:h-5 w-4 sm:w-5" />
        </Button>
      </div>
      {/* 语音输入弹窗 */}
      {showVoiceRecorder && (
        <div className="absolute z-50 left-0 right-0 bottom-16 flex justify-center">
          <VoiceRecorder
            onResult={(text) => {
              setShowVoiceRecorder(false)
              if (text) setInput(text)
            }}
          />
        </div>
      )}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" data-testid="chat-history-modal">
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

      <ScrollArea className="flex-1 px-2 sm:px-4 pt-20 pb-6 h-[calc(100vh-4rem)]">
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-32 mt-4">
          {/* 离线模式警告 */}
          {isOfflineMode && (
            <Alert
              variant="destructive"
              className="bg-[#fff3cd] dark:bg-amber-950/30 border-[#ffeeba] dark:border-amber-800/50 mb-4 rounded-lg"
            >
              <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertTitle>{t("offlineMode")}</AlertTitle>
              <AlertDescription>
                {connectionError ? (
                  <>
                    <p className="mb-2 text-sm">
                      {t("connectionError")}: {connectionError}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetryConnection}
                      className="mt-2 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                    >
                      {t("retryConnection")}
                    </Button>
                  </>
                ) : (
                  <p className="text-sm">{t("offlineModeDescription")}</p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* 欢迎消息 */}
          {selectedAgent?.type === 'fastgpt' && messages.length === 0 && (
            <WelcomeMessage
              message={welcomeMessage}
              interacts={interacts}
              onInteractClick={(text: string) => {
                setInput(text)
                if (textareaRef.current) {
                  (textareaRef.current as HTMLTextAreaElement).focus()
                }
              }}
            />
          )}

          {/* 流程节点/思维链展示区 */}
          <ProcessingFlowDisplay steps={processingSteps} isVisible={showProcessingFlow} />

          {/* 消息列表 */}
          {messages.map((msg, idx) => (
            <ChatMessage
              key={msg.id + idx}
              message={msg}
              onRegenerate={() => handleRegenerate(msg.id)}
              onCopy={handleCopy}
              onDelete={deleteMessage}
              onEdit={editMessage}
              chatId={chatId || undefined}
            />
          ))}

          {/* 显示处理流程 */}
          <ProcessingFlowDisplay steps={processingSteps} isVisible={showProcessingFlow && processingSteps.length > 0} />

          {/* 显示FastGPT流节点 */}
          <FastGPTFlowDisplay nodes={flowNodes} isVisible={showFlowNodes && flowNodes.length > 0} />

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {showOptions && <ChatOptions onClose={() => setShowOptions(false)} />}
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />

      {/* 工具栏 - 移动端优化 */}
      <div className="fixed bottom-0 left-0 right-0 p-2 sm:p-4 bg-gradient-to-t from-background via-background to-transparent pt-10 z-20">
        <div className="max-w-3xl mx-auto">
          {/* 文件上传组件 - 根据智能体配置显示或隐藏 */}
          {isUploading && selectedAgent?.supportsFileUpload !== false && (
            <FileUploader onClose={() => setIsUploading(false)} onFileUpload={handleFileUpload} />
          )}

          <div className="relative">
            {/* Mobile buttons inside the input area */}
            {isMobile && (
              <div className="absolute left-2 bottom-2 flex items-center gap-1.5 z-10">
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
                {/* 语音输入按钮 */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  onClick={toggleRecording}
                >
                  <Mic className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
                </Button>
              </div>
            )}

            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isOfflineMode ? t("offlineInputPlaceholder") : t("inputPlaceholder")}
              className={cn(
                "min-h-[60px] resize-none py-3 sm:py-4 text-sm sm:text-base shadow-none focus:shadow-none transition-colors duration-200",
                "border-[#e9ecef] dark:border-zinc-700 focus:border-primary focus:ring-1 focus:ring-primary/20",
                isMobile ? "rounded-lg pl-[120px] pr-[60px]" : "rounded-lg pl-4 pr-32",
              )}
              rows={1}
            />

            <div
              className={cn(
                "absolute right-2 bottom-2 flex items-center gap-1 sm:gap-1.5",
                textareaHeight > 100 ? "bottom-2" : "bottom-2",
              )}
            >
              {!isMobile && (
                <>
                  <TooltipProvider>
                    {/* 文件上传按钮 - 根据智能体配置显示或隐藏 */}
                    {selectedAgent?.supportsFileUpload !== false && (
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
                    {/* 语音输入按钮 */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                          onClick={toggleRecording}
                        >
                          <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-600 dark:text-zinc-300" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("recording")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}

              <Button
                onClick={handleSend}
                disabled={(!input.trim() && uploadedFiles.length === 0) || isTyping}
                className={cn(
                  "btn-primary h-8 sm:h-9 text-xs sm:text-sm font-medium",
                  "bg-primary hover:bg-primary/90",
                  "transition-colors duration-200 shadow-none",
                  isMobile ? "w-10 min-w-[40px] px-0" : "px-3 sm:px-5",
                  isTyping && "opacity-50 cursor-not-allowed",
                )}
              >
                {isTyping ? (
                  <Loader2 className="h-4 w-4 sm:h-4 sm:w-4 animate-spin" />
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
            <div className="mt-2 flex flex-wrap gap-2">
              {uploadedFiles.map((file) => (
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
            <div className="flex justify-center items-center mt-2 px-1">
              <div className="text-xs text-center text-muted-foreground opacity-70">{t("disclaimer")}</div>
            </div>
          )}

          {/* 免责声明 - 仅在非移动端显示 */}
          {!isMobile && (
            <div className="text-xs text-center text-muted-foreground mt-2.5 opacity-70">{t("disclaimer")}</div>
          )}
        </div>
      </div>
    </div>
  )
}
