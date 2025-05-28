"use client"

import type React from "react"
import type { UploadedFile } from "@/components/file-uploader"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAgent } from "@/context/agent-context"
import { Paperclip, Mic, StopCircle, WifiOff, SendHorizonal, Loader2, ImageIcon, FileIcon, X, History, AlertCircle } from "lucide-react"
import { type Message, MessageType, MessageRole } from "@/types/message"
import { ChatMessage } from "@/components/chat-message"
import { FileUploader } from "@/components/file-uploader"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils" // 移除 getDeviceId 导入，因为我们现在从 storage 导入它
import { useToast } from "@/components/ui/use-toast"
import { Bot } from "lucide-react"
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

import type { ProcessingStep } from "@/types/message"

import { useMessageStore } from "@/lib/store/messageStore"
import { QuestionSuggestions } from "@/components/question-suggestions"
import VoiceRecorder from "@/components/ui/voice-recorder"
import { useLanguage } from "@/context/language-context"
import type { ConversationAgentType } from "@/types/agent"
// InteractiveNode 组件已移除，现在使用气泡内的 InlineBubbleInteractive
import { GlobalVariablesForm } from "@/components/global-variables-form"

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
    setGlobalVariables
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
  const [isOfflineMode, setIsOfflineMode] = useState(false)
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
  const [showHistoryManager, setShowHistoryManager] = useState(false)

  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([])
  const [showProcessingFlow, setShowProcessingFlow] = useState<boolean>(false) // 设置为false，禁用处理流程显示

  const [suggestions, setSuggestions] = useState<string[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)

  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)

  // 新增流式请求abort控制
  const abortControllerRef = useRef<AbortController | null>(null)

  // 新增 currentNodeName 状态
  const [currentNodeName, setCurrentNodeName] = useState<string>("")

  // 交互节点状态已移除，现在使用消息内的 interactiveData 字段

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

      // 保存初始化信息到localStorage
      if (selectedAgent) {
        localStorage.setItem(`agent_${selectedAgent.id}_welcome_message`, welcomeMessage);
        localStorage.setItem(`agent_${selectedAgent.id}_system_prompt`, systemPromptText || '');
        localStorage.setItem(`agent_${selectedAgent.id}_interacts`, JSON.stringify(interactOptions));
      }
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

  // 在 initChatSession 只插入一次开场白到消息队列时，改为插入空内容并逐字动画
  const animateWelcomeMessage = (fullText: string) => {
    let index = 0;
    setMessages([{ id: Date.now().toString(), type: MessageType.Text, role: 'system', content: '', timestamp: new Date(), metadata: {} }]);
    const interval = setInterval(() => {
      index++;
      setMessages([{ id: Date.now().toString(), type: MessageType.Text, role: 'system', content: fullText.slice(0, index), timestamp: new Date(), metadata: {} }]);
      if (index >= fullText.length) {
        clearInterval(interval);
      }
    }, 24); // 打字速度可调
  };

  // 处理全局变量表单提交
  const handleGlobalVariablesSubmit = (variables: Record<string, any>) => {
    setGlobalVariables(variables)
    console.log('全局变量已设置:', variables)
  }



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

      // 如果处于离线模式，生成离线响应
      if (isOfflineMode) {
        console.log('[handleSend] 离线模式，生成离线响应');
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

          setMessages((prev: Message[]) => [...prev, assistantMessage])
          setIsTyping(false)

          // 保存消息到本地存储
          if (chatId) {
            const updatedMessages = [...messages, userMessage, assistantMessage]
            useMessageStore.getState().saveMessages(chatId as ConversationAgentType, updatedMessages)
            console.log(`Saved offline response to storage for chat ID: ${chatId}`)
          }
        }, 1000)

        return
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
              // 创建AbortController
              abortControllerRef.current = new AbortController()

              // 使用 FastGPT 客户端进行流式传输
              await fastGPTClient.streamChat(formattedMessages, {
                temperature: selectedAgent?.temperature,
                maxTokens: selectedAgent?.maxTokens,
                detail: true,
                variables: globalVariables, // 传递全局变量
                onStart: () => {
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
                  console.log('[onIntermediateValue1] 事件类型:', eventType, '内容:', value);

                  // 处理交互节点 - 将交互数据附加到typing消息，不立即创建新消息
                  if (eventType === "interactive") {
                    console.log('🎯 检测到交互节点:', value);
                    console.log('交互节点数据结构检查:', {
                      hasInteractive: !!value?.interactive,
                      type: value?.interactive?.type,
                      hasUserSelectOptions: Array.isArray(value?.interactive?.params?.userSelectOptions),
                      userSelectOptionsLength: value?.interactive?.params?.userSelectOptions?.length,
                      hasInputForm: Array.isArray(value?.interactive?.params?.inputForm),
                      inputFormLength: value?.interactive?.params?.inputForm?.length
                    });
                    // 检查是否为有效的交互节点格式
                    if (value?.interactive &&
                        ((value.interactive.type === "userSelect" && Array.isArray(value.interactive.params?.userSelectOptions) && value.interactive.params.userSelectOptions.length > 0) ||
                         (value.interactive.type === "userInput" && Array.isArray(value.interactive.params?.inputForm) && value.interactive.params.inputForm.length > 0))) {
                      console.log('✅ 交互节点验证通过，将交互数据附加到typing消息:', value.interactive);

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
                              thinkingStatus: "completed", // 交互节点出现时，思考已完成
                              interactionStatus: "ready",  // 交互准备就绪
                            },
                          };
                          prev = [...prev, typingMsg];
                        }

                        // 然后附加交互数据
                        const result = prev.map((msg) => {
                          if (msg.id === "typing" && msg.role === "assistant") {
                            const updatedMsg = {
                              ...msg,
                              metadata: {
                                ...msg.metadata,
                                interactiveData: {
                                  ...value.interactive,
                                  processed: false
                                },
                                thinkingStatus: "completed", // 思考完成
                                interactionStatus: "ready",  // 交互准备就绪
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
                      console.log('❌ 交互节点验证失败，数据结构:', {
                        hasInteractive: !!value?.interactive,
                        type: value?.interactive?.type,
                        hasUserSelectOptions: Array.isArray(value?.interactive?.params?.userSelectOptions),
                        userSelectOptionsLength: value?.interactive?.params?.userSelectOptions?.length,
                        hasInputForm: Array.isArray(value?.interactive?.params?.inputForm),
                        inputFormLength: value?.interactive?.params?.inputForm?.length
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

                  // 设置离线模式
                  setIsOfflineMode(true)

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

                  toast({
                    title: "网络连接错误",
                    description: "已切换到离线模式",
                    variant: "destructive",
                  })
                },
                onFinish: () => {
                  console.log('[streamChat] onFinish');
                  setIsTyping(false)

                  // 统一处理：将typing消息转换为永久消息（可能包含文字内容和/或交互数据）
                  setMessages((prev: Message[]) => {
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
                signal: abortControllerRef.current.signal
              })
            } catch (streamError) {
              console.warn('[handleSend] 流式请求失败，切换非流式:', streamError);

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
                  },
                },
              ]);

              // 切换到非流式模式
              const content = await fastGPTClient.chat(formattedMessages, {
                temperature: selectedAgent?.temperature,
                maxTokens: selectedAgent?.maxTokens,
                detail: true,
                variables: globalVariables, // 传递全局变量
                onResponseData: (responseData: any) => {
                  console.log("收到非流式响应数据:", responseData);

                  // 提取响应ID并保存到消息元数据中
                  if (responseData && (responseData.id || responseData.chatCompletionId || responseData.completionId)) {
                    const responseId = responseData.id || responseData.chatCompletionId || responseData.completionId;

                    console.log(`非流式模式捕获到响应ID: ${responseId}`, responseData);

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
          } catch (error) {
            console.error("聊天请求错误:", error);

            // 设置离线模式
            setIsOfflineMode(true)

            // 添加来自助手的错误消息
            const errorMessage: Message = {
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

            setMessages((prev: Message[]) => [...prev, errorMessage])
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
        const errorMessage: Message = {
          id: Date.now().toString(),
          type: MessageType.Text,
          role: "assistant" as MessageRole,
          content: "抱歉，处理您的请求时遇到错误。我将以离线模式为您服务。",
          timestamp: new Date(),
          metadata: {
            agentId: selectedAgent?.id, // 添加智能体ID
          },
        }

        setMessages((prev: Message[]) => [...prev, errorMessage])
        setIsTyping(false)

        toast({
          title: "错误",
          description: error instanceof Error ? error.message : "发送消息失败，已切换到离线模式",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("发送消息时出错:", error)

      // 设置离线模式
      setIsOfflineMode(true)

      // 添加来自助手的错误消息
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: MessageType.Text,
        role: "assistant" as MessageRole,
        content: "抱歉，处理您的请求时遇到错误。我将以离线模式为您服务。",
        timestamp: new Date(),
        metadata: {
          agentId: selectedAgent?.id, // 添加智能体ID
        },
      }

      setMessages((prev: Message[]) => [...prev, errorMessage])
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
          } catch (streamError) {
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
        } catch (error) {
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
    } catch (error) {
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
                // 检查是否为有效的交互节点格式
                if (value?.interactive &&
                    ((value.interactive.type === "userSelect" && Array.isArray(value.interactive.params?.userSelectOptions) && value.interactive.params.userSelectOptions.length > 0) ||
                     (value.interactive.type === "userInput" && Array.isArray(value.interactive.params?.inputForm) && value.interactive.params.inputForm.length > 0))) {
                  console.log('✅ [交互节点继续运行] 交互节点验证通过，将交互数据附加到typing消息:', value.interactive);

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
                          thinkingStatus: "completed", // 交互节点出现时，思考已完成
                          interactionStatus: "ready",  // 交互准备就绪
                        },
                      };
                      prev = [...prev, typingMsg];
                    }

                    // 然后附加交互数据
                    const result = prev.map((msg) => {
                      if (msg.id === "typing" && msg.role === "assistant") {
                        const updatedMsg = {
                          ...msg,
                          metadata: {
                            ...msg.metadata,
                            interactiveData: {
                              ...value.interactive,
                              processed: false
                            },
                            thinkingStatus: "completed", // 思考完成
                            interactionStatus: "ready",  // 交互准备就绪
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
                  console.log('❌ [交互节点继续运行] 交互节点验证失败，数据结构:', {
                    hasInteractive: !!value?.interactive,
                    type: value?.interactive?.type,
                    hasUserSelectOptions: Array.isArray(value?.interactive?.params?.userSelectOptions),
                    userSelectOptionsLength: value?.interactive?.params?.userSelectOptions?.length,
                    hasInputForm: Array.isArray(value?.interactive?.params?.inputForm),
                    inputFormLength: value?.interactive?.params?.inputForm?.length
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

              // 设置离线模式
              setIsOfflineMode(true)

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

              toast({
                title: "网络连接错误",
                description: "已切换到离线模式",
                variant: "destructive",
              })
            },
            onFinish: () => {
              console.log('[streamChat] 交互节点继续运行 onFinish');
              setIsTyping(false)

              // 统一处理：将typing消息转换为永久消息（可能包含文字内容和/或交互数据）
              setMessages((prev: Message[]) => {
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
      } catch (error) {
        console.error("交互节点选择后处理错误:", error);
        setIsTyping(false);
      }
    } catch (error) {
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

      {/* 消息滚动区 */}
      <ScrollArea className={cn(
        "flex-1 pb-6 h-[calc(100vh-4rem)]",
        isMobile ? "px-0" : "px-2 sm:px-4"
      )}>
        <div className={cn(
          "mx-auto space-y-4 sm:space-y-6 pb-32 mt-4",
          isMobile ? "w-full px-2" : "max-w-3xl"
        )}>
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
              onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e)}
              placeholder={isOfflineMode ? t("offlineInputPlaceholder") : t("inputPlaceholder")}
              className={cn(
                "min-h-[60px] resize-none py-4 text-sm sm:text-base shadow-none focus:shadow-none transition-colors duration-200",
                "border-[#e9ecef] dark:border-zinc-700 focus:border-primary focus:ring-1 focus:ring-primary/20",
                isMobile ? "rounded-lg pl-[130px] pr-[70px]" : "rounded-lg pl-4 pr-32",
              )}
              rows={1}
            />

            <div
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-1.5"
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
                onClick={() => {
                  if (isTyping) {
                    if (abortControllerRef.current) {
                      abortControllerRef.current.abort()
                      abortControllerRef.current = null
                    }
                    setIsTyping(false)
                  } else {
                    handleSend()
                  }
                }}
                disabled={(!input.trim() && uploadedFiles.length === 0) && !isTyping}
                className={cn(
                  "btn-primary h-8 sm:h-9 text-xs sm:text-sm font-medium",
                  "bg-primary hover:bg-primary/90",
                  "transition-colors duration-200 shadow-none",
                  isTyping && "opacity-50 cursor-not-allowed",
                )}
              >
                {isTyping ? (
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
