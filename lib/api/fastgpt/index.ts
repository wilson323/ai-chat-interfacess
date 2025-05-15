/**
 * FastGPT API 统一处理模块
 * 整合了之前分散在fastgpt.ts和fastgpt-client.ts的功能
 */

import type { Agent } from "../../../types/agent"
import type { Message } from "../../../types/message"
import { retry } from "../../utils/index"
import { API_CONSTANTS, ERROR_MESSAGES } from "../../storage/shared/constants"
import { DEFAULT_AGENT_SETTINGS } from "@/lib/storage/shared/constants"
import { logFastGPTEvent, logProcessingStep, logApiRequest, logApiResponse, logError } from "../../debug-utils"
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
  InitChatRequest,
  InitChatResponse,
  ChatSession,
  ChatMessage,
  MessageFeedbackRequest,
  MessageFeedbackResponse
} from '../../../types/api/fastgpt';

// ================ 类型定义 ================

export interface StreamOptions {
  temperature?: number
  maxTokens?: number
  detail?: boolean
  onStart?: () => void
  onChunk?: (chunk: string) => void
  onIntermediateValue?: (value: any, eventType: string) => void
  onProcessingStep?: (step: any) => void
  onError?: (error: Error) => void
  onFinish?: () => void
  signal?: AbortSignal
}

export interface FastGPTChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    message: {
      role: string
      content: string
      tool_calls?: any[]
    }
    finish_reason: string
  }[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  detail?: any
}

export interface FastGPTStreamChunk {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    delta: {
      content?: string
      role?: string
      tool_calls?: any[]
    }
    finish_reason: string | null
  }[]
}

export interface ChatHistoryRecord {
  _id: string
  dataId: string
  obj: "Human" | "AI"
  value: {
    type: string
    text?: {
      content: string
    }
    image?: {
      url: string
    }
  }[]
  customFeedbacks: any[]
  llmModuleAccount?: number
  totalQuoteList?: any[]
  totalRunningTime?: number
  historyPreviewLength?: number
}

export interface ChatHistoryResponse {
  code: number
  data: {
    list: ChatHistoryRecord[]
    total: number
  }
}

export interface ChatInitResponse {
  code: number
  data: {
    chatId: string
    appId: string
    variables: Record<string, any>
    app: {
      chatConfig: {
        questionGuide: boolean
        ttsConfig: {
          type: string
        }
        whisperConfig: {
          open: boolean
          autoSend: boolean
          autoTTSResponse: boolean
        }
        chatInputGuide: {
          open: boolean
          textList: string[]
          customUrl: string
        }
        instruction: string
        variables: any[]
        fileSelectConfig: {
          canSelectFile: boolean
          canSelectImg: boolean
          maxFiles: number
        }
        _id: string
        welcomeText: string
      }
      chatModels: string[]
      name: string
      avatar: string
      intro: string
      type: string
      pluginInputs: any[]
    }
    interacts?: any[] // 添加可选的interacts字段
  }
}

export interface QuestionGuideResponse {
  code: number
  data: string[]
}

// ================ 工具函数 ================

/**
 * 确定是否应该使用代理
 */
function shouldUseProxy(): boolean {
  // 在浏览器环境中始终使用代理
  if (typeof window !== "undefined") {
    return true
  }
  return false
}

/**
 * 生成本地回退聊天ID
 */
export function generateFallbackChatId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 生成回退聊天响应
 */
function generateFallbackChatResponse(message: string, model: string): FastGPTChatResponse {
  return {
    id: `local-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: model,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: message,
        },
        finish_reason: "error",
      },
    ],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  }
}

/**
 * 生成回退初始化响应
 */
export function generateFallbackResponse(agent: Agent, chatId: string): ChatInitResponse {
  // 为不同类型的智能体生成不同的欢迎消息
  let welcomeMessage = "您好！我是智能助手，很高兴为您服务。请问有什么我可以帮助您的？"
  let interacts: string[] = []

  if (agent.type === "image-editor") {
    welcomeMessage = "欢迎使用图像编辑助手！您可以上传图片，我将帮助您进行编辑和处理。"
    interacts = [
      "如何裁剪图片？",
      "能帮我调整图片亮度吗？",
      "如何添加滤镜效果？",
      "能帮我去除图片背景吗？",
      "如何调整图片大小？",
    ]
  } else if (agent.type === "cad-analyzer") {
    welcomeMessage = "欢迎使用CAD分析助手！您可以上传CAD图纸，我将帮助您分析其中的安防设备布局。"
    interacts = [
      "如何分析CAD图纸中的安防设备？",
      "能识别图纸中的摄像头位置吗？",
      "如何计算布线长度？",
      "能帮我优化设备布局吗？",
      "如何导出分析报告？",
    ]
  } else {
    // 默认聊天智能体
    interacts = ["你能做什么？", "介绍一下你的功能", "如何使用你的服务？", "你有哪些限制？", "能给我一些使用示例吗？"]
  }

  // 优先使用agent中的welcomeText，如果没有则使用默认欢迎消息
  const finalWelcomeMessage = agent.welcomeText || welcomeMessage
  // 优先使用agent中的systemPrompt，如果没有则使用默认系统提示词
  const finalSystemPrompt = agent.systemPrompt || "你是一位专业的智能助手，请耐心解答用户问题。"

  return {
    code: 200,
    data: {
      chatId: chatId,
      appId: agent.appId || "fallback-app-id",
      variables: {},
      app: {
        chatConfig: {
          questionGuide: true,
          ttsConfig: { type: "normal" },
          whisperConfig: { open: false, autoSend: false, autoTTSResponse: false },
          chatInputGuide: { open: false, textList: [], customUrl: "" },
          instruction: "",
          variables: [],
          fileSelectConfig: { canSelectFile: false, canSelectImg: false, maxFiles: 5 },
          _id: "",
          welcomeText: finalWelcomeMessage,
        },
        chatModels: [agent.multimodalModel || "gpt-3.5-turbo"],
        name: agent.name || "AI Assistant",
        avatar: "",
        intro: agent.description || "",
        type: "chat",
        pluginInputs: [],
      },
      interacts: interacts,
    },
  }
}

/**
 * 获取默认问题建议
 */
function getDefaultSuggestions(): string[] {
  return ["这个产品有哪些功能？", "如何使用这个系统？", "有没有相关的使用案例？", "能提供一些示例吗？", "有哪些限制？"]
}

// ================ FastGPT客户端类 ================

/**
 * FastGPT客户端类
 * 提供面向对象的API访问方式
 */
export class FastGPTClient {
  private agent: Agent
  private retryOptions: {
    maxRetries: number
    onRetry?: (attempt: number, error: Error) => void
  }

  constructor(
    agent: Agent,
    retryOptions?: {
      maxRetries?: number
      onRetry?: (attempt: number, error: Error) => void
    },
  ) {
    // 确保agent使用正确的API端点
    this.agent = {
      ...agent,
      apiEndpoint: API_CONSTANTS.FASTGPT_API_ENDPOINT,
    }
    this.retryOptions = {
      maxRetries: retryOptions?.maxRetries || API_CONSTANTS.DEFAULT_MAX_RETRIES,
      onRetry: retryOptions?.onRetry,
    }
  }

  /**
   * 初始化聊天会话
   */
  async initializeChat(chatId?: string): Promise<ChatInitResponse> {
    return initializeChat(this.agent, chatId)
  }

  /**
   * 发送聊天请求到 FastGPT API
   * 支持流式响应和自动重试
   */
  async streamChat(messages: any[], options: StreamOptions): Promise<void> {
    let attempt = 0
    const maxRetries = 2
    let lastError: any = null
    while (attempt <= maxRetries) {
      try {
        await this._streamChatInternal(messages, options)
        return
      } catch (err) {
        lastError = err
        attempt++
        if (attempt > maxRetries) throw lastError
        // 断线重连提示，可加日志
      }
    }
  }

  /**
   * 内部实现的流式聊天请求
   */
  private async _streamChatInternal(
    messages: Array<{ role: string; content: string }>,
    options: StreamOptions = {},
  ): Promise<void> {
    // 使用常量API端点
    const apiEndpoint = API_CONSTANTS.FASTGPT_API_ENDPOINT

    // 检查API端点是否配置
    if (!apiEndpoint) {
      const error = new Error(ERROR_MESSAGES.INCOMPLETE_CONFIG)
      if (options.onError) {
        options.onError(error instanceof Error ? error : new Error(String(error)))
      }
      throw error
    }

    // 如果API密钥或AppID未配置，使用离线模式
    if (!this.agent.apiKey || !this.agent.appId) {
      console.warn("API key or AppID is not configured, using offline mode")

      // 通知开始流式传输
      if (options.onStart) {
        options.onStart()
      }

      // 生成离线响应
      const offlineResponse = "抱歉，我无法连接到服务器。请确保您已配置API密钥和AppID，或联系管理员获取帮助。"

      // 发送离线响应
      if (options.onChunk) {
        options.onChunk(offlineResponse)
      }

      // 完成流式传输
      if (options.onFinish) {
        options.onFinish()
      }

      return
    }

    // 确保有有效的 chatId
    if (!this.agent.chatId) {
      this.agent.chatId = generateFallbackChatId()
    }

    // 准备请求体，符合 FastGPT API 格式
    const requestBody = {
      model: this.agent.appId, // 使用 appId 作为模型参数
      chatId: this.agent.chatId,
      stream: true, // 强制流式
      detail: true, // 强制 detail
      messages: messages,
      temperature: options.temperature || this.agent.temperature || DEFAULT_AGENT_SETTINGS.temperature,
      max_tokens: options.maxTokens || this.agent.maxTokens || DEFAULT_AGENT_SETTINGS.maxTokens,
    }

    // 通知开始流式传输
    if (options.onStart) {
      options.onStart()
    }

    // 使用代理 API 进行流式传输
    const proxyData = {
      targetUrl: apiEndpoint,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.agent.apiKey}`,
        Accept: "text/event-stream",
      },
      body: requestBody,
    }

    // 添加超时处理和外部signal支持
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONSTANTS.STREAM_TIMEOUT)
    const signal = options.signal || controller.signal

    try {
      console.log("通过代理发送流式请求到:", apiEndpoint)
      console.log("请求体(部分):", JSON.stringify(requestBody).substring(0, 200) + "...")

      // 记录API请求
      logApiRequest("POST", apiEndpoint, requestBody)

      const response = await fetch("/api/chat-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proxyData),
        signal,
      })
      console.log('response-----------=',response)

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text().catch(() => "无法读取错误响应")
        console.error(`API 请求失败: ${response.status} ${response.statusText} - ${errorText}`)

        const error = new Error(`API 请求失败: ${response.status} ${response.statusText}`)
        if (options.onError) {
          options.onError(error instanceof Error ? error : new Error(String(error)))
        }
        throw error
      }

      // 记录API响应
      logApiResponse(apiEndpoint, response.status, "Stream response")

      // 检查响应是否为流
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("text/event-stream")) {
        console.error(`预期事件流但得到: ${contentType}`)
        const text = await response.text().catch(() => "无法读取响应体")
        console.error(`响应体(前 200 个字符): ${text.substring(0, 200)}`)

        const error = new Error(`预期事件流但得到: ${contentType || "未知内容类型"}`)
        if (options.onError) {
          options.onError(error instanceof Error ? error : new Error(String(error)))
        }
        throw error
      }

      const reader = response.body?.getReader()
      if (!reader) {
        const error = new Error("无法获取响应读取器")
        if (options.onError) {
          options.onError(error instanceof Error ? error : new Error(String(error)))
        }
        throw error
      }

      const decoder = new TextDecoder()
      let buffer = ""

      // 处理流
      let lastEventType: string | null = null;
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // 解码块并添加到缓冲区
        buffer += decoder.decode(value, { stream: true })

        // 处理缓冲区中的完整行
        const lines = buffer.split(/\r?\n/)
        buffer = lines.pop() || "" // 保留缓冲区中的最后一个不完整行

        for (const line of lines) {
          if (line.trim() === "") continue;
          if (line.startsWith("event:")) {
            lastEventType = line.substring(6).trim() || "unknown";
            continue;
          }
          if (line.startsWith("data:")) {
            const data = line.substring(5).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = data ? JSON.parse(data) : {};
              // 只有 eventType 存在时才处理
              if (lastEventType) {
                logFastGPTEvent(lastEventType, parsed);
                switch (lastEventType) {
                  case "answer":
                  case "fastAnswer":
                    if (parsed.choices && parsed.choices.length > 0 && parsed.choices[0].delta) {
                      const textChunk = parsed.choices[0].delta.content || ""
                      if (textChunk && options.onChunk) {
                        options.onChunk(textChunk)
                      }
                    }
                    break;
                  case "flowNodeStatus":
                  case "moduleStatus":
                  case "moduleStart":
                  case "moduleEnd":
                  case "thinking":
                  case "thinkingStart":
                  case "thinkingEnd":
                  case "toolCall":
                  case "toolParams":
                  case "toolResponse":
                  case "updateVariables":
                    if (options.onProcessingStep) {
                      const step = {
                        id: `${lastEventType}-${Date.now()}`,
                        type: lastEventType,
                        name: typeof parsed === 'object' && parsed !== null && 'name' in parsed ? parsed.name : (typeof parsed === 'object' && parsed !== null && 'moduleName' in parsed ? parsed.moduleName : lastEventType),
                        status: typeof parsed === 'object' && parsed !== null && 'status' in parsed ? parsed.status : "running",
                        content: typeof parsed === 'string' ? parsed : (typeof parsed === 'object' && parsed !== null && 'content' in parsed ? parsed.content : (typeof parsed === 'object' && parsed !== null && 'text' in parsed ? parsed.text : JSON.stringify(parsed))),
                        details: parsed,
                        timestamp: new Date(),
                      }
                      logProcessingStep(step)
                      options.onProcessingStep(step)
                    }
                    if (options.onIntermediateValue) {
                      options.onIntermediateValue(parsed, lastEventType)
                    }
                    break;
                  default:
                    if (options.onIntermediateValue) {
                      options.onIntermediateValue(parsed, lastEventType)
                    }
                    break;
                }
                lastEventType = null; // 只消费一次
              } else {
                // 没有 event:，可选择跳过或用默认类型
                // console.warn("收到 data 但没有 event，已跳过", data);
              }
            } catch (e) {
              console.error("解析 SSE data 行出错:", e)
            }
          }
        }
      }

      // 确保在正常退出循环时调用 onFinish
      if (options.onFinish) {
        options.onFinish()
      }
    } catch (error) {
      clearTimeout(timeoutId)
      console.error("流请求错误:", error)

      // 记录错误
      logError("FastGPT API", error instanceof Error ? error : new Error(String(error)), { apiEndpoint, requestBody })

      // 如果发生错误，生成一个简单的响应
      if (options.onChunk) {
        options.onChunk(ERROR_MESSAGES.NETWORK_ERROR)
      }

      if (options.onFinish) {
        options.onFinish()
      }

      // 不抛出错误，而是静默处理，以避免中断用户体验
      console.log("使用离线模式继续服务")
    }
  }

  /**
   * 发送非流式聊天请求
   */
  async chat(messages: any[], options: StreamOptions): Promise<string> {
    // 检查API端点是否配置
    const apiEndpoint = API_CONSTANTS.FASTGPT_API_ENDPOINT
    if (!apiEndpoint) {
      console.error("API endpoint is not configured")
      return "抱歉，API端点未配置。请联系管理员获取帮助。"
    }

    // 如果API密钥或AppID未配置，返回离线响应
    if (!this.agent.apiKey || !this.agent.appId) {
      console.warn("API key or AppID is not configured, using offline response")
      return "抱歉，我无法连接到服务器。请确保您已配置API密钥和AppID，或联系管理员获取帮助。"
    }

    const res = await fetchWithRetry(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.agent.apiKey}` },
      body: JSON.stringify({ messages, ...options }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(errorText)
    }

    const response = await res.json()
    return response.choices[0].message.content
  }

  /**
   * 获取问题建议
   */
  async getQuestionSuggestions(customConfig?: {
    open?: boolean
    model?: string
    customPrompt?: string
  }): Promise<string[]> {
    const response = await getQuestionSuggestions(
      this.agent,
      this.agent.chatId || generateFallbackChatId(),
      customConfig,
    )
    return response.data
  }
}

// ================ 函数式API ================

/**
 * 初始化聊天会话
 */
export async function initializeChat(agent: Agent, chatId?: string): Promise<ChatInitResponse> {
  // 确保使用正确的API端点
  const apiEndpoint = API_CONSTANTS.FASTGPT_API_ENDPOINT

  // 检查API端点是否配置，如果没有配置则使用回退响应
  if (!apiEndpoint) {
    console.error("API endpoint is not configured")
    return generateFallbackResponse(agent, chatId || generateFallbackChatId())
  }

  // 如果API密钥或AppID未配置，使用回退响应但不阻止初始化
  if (!agent.apiKey || !agent.appId) {
    console.warn("API key or AppID is not configured, using fallback response")
    return generateFallbackResponse(agent, chatId || generateFallbackChatId())
  }

  try {
    // Use a more reliable URL construction approach
    const apiUrl = API_CONSTANTS.FASTGPT_BASE_API

    // Construct the target URL
    const targetUrl = `${apiUrl}/core/chat/init?appId=${agent.appId}${chatId ? `&chatId=${chatId}` : ""}`

    console.log(`Initializing chat with URL: ${targetUrl}`)

    // Add a timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONSTANTS.INIT_TIMEOUT)

    try {
      let response

      if (shouldUseProxy()) {
        // Use the proxy API
        const proxyUrl = `/api/chat-proxy?targetUrl=${encodeURIComponent(targetUrl)}`

        response = await fetch(proxyUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${agent.apiKey}`,
          },
          signal: controller.signal,
          cache: "no-store",
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          console.error(`Proxy request failed with status: ${response.status}`)
          throw new Error(`Proxy request failed: ${response.status}`)
        }

        // Check content type before parsing as JSON
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.error(`Unexpected content type: ${contentType}`)
          // Try to get the response text for better error diagnosis
          const text = await response.text()
          console.error(`Response body (first 200 chars): ${text.substring(0, 200)}`)
          throw new Error(`API returned non-JSON response: ${contentType || "unknown content type"}`)
        }

        const proxyResponse = await response.json().catch((error) => {
          console.error("JSON parsing error:", error)
          throw new Error(`Failed to parse JSON response: ${error.message}`)
        })

        if (proxyResponse.status !== 200) {
          console.error(`API request failed with status: ${proxyResponse.status}`)
          throw new Error(`API request failed: ${proxyResponse.status}`)
        }

        return proxyResponse.data
      } else {
        // Direct API call (server-side only)
        response = await fetch(targetUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${agent.apiKey}`,
          },
          signal: controller.signal,
          cache: "no-store",
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          console.error(`API request failed with status: ${response.status}`)
          throw new Error(`API request failed: ${response.status}`)
        }

        // Check content type before parsing as JSON
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.error(`Unexpected content type: ${contentType}`)
          // Try to get the response text for better error diagnosis
          const text = await response.text()
          console.error(`Response body (first 200 chars): ${text.substring(0, 200)}`)
          throw new Error(`API returned non-JSON response: ${contentType || "unknown content type"}`)
        }

        return await response.json().catch((error) => {
          console.error("JSON parsing error:", error)
          throw new Error(`Failed to parse JSON response: ${error.message}`)
        })
      }
    } catch (fetchError) {
      // Check specifically for network errors
      if (fetchError instanceof TypeError && fetchError.message.includes("fetch")) {
        console.error("Network error during chat initialization - operating in offline mode:", fetchError)
      } else {
        console.error("Fetch error during chat initialization:", fetchError)
      }
      throw fetchError // Re-throw to be caught by the outer try-catch
    }
  } catch (error) {
    console.error("Chat initialization error:", error)

    // Always generate a fallback response with a chatId
    const fallbackChatId = chatId || generateFallbackChatId()
    console.log("Using fallback chatId:", fallbackChatId)

    // Return a valid fallback response that won't cause further errors
    return generateFallbackResponse(agent, fallbackChatId)
  }
}

// fallback 响应类型转换
function toChatCompletionResponse(obj: any): ChatCompletionResponse {
  return {
    id: obj.id,
    object: 'chat.completion',
    created: obj.created,
    model: obj.model,
    choices: obj.choices,
    usage: obj.usage,
  };
}

/**
 * 发送聊天请求
 */
export async function sendChatRequest(
  agent: Agent,
  messages: ChatCompletionRequest['messages'],
  options: {
    stream?: boolean
    temperature?: number
    maxTokens?: number
    detail?: boolean
    onChunk?: (chunk: string) => void
  } = {},
): Promise<ChatCompletionResponse> {
  // 1. 参数校验
  const apiEndpoint = agent.apiEndpoint || API_CONSTANTS.FASTGPT_API_ENDPOINT

  // 检查API端点是否配置
  if (!apiEndpoint) {
    const errMsg = "API 端点未配置，请联系管理员。"
    if (options.stream && options.onChunk) options.onChunk(errMsg)
    return toChatCompletionResponse(generateFallbackChatResponse(errMsg, agent.multimodalModel || "unknown"))
  }

  // 如果API密钥或AppID未配置，使用离线模式但不阻止请求
  if (!agent.apiKey || !agent.appId) {
    const errMsg = "API 密钥或 AppID 未配置，使用离线模式。"
    console.warn(errMsg)

    // 如果是流式请求，发送离线响应
    if (options.stream && options.onChunk) {
      options.onChunk("抱歉，我无法连接到服务器。请确保您已配置API密钥和AppID，或联系管理员获取帮助。")
      return toChatCompletionResponse(generateFallbackChatResponse(errMsg, agent.multimodalModel || "unknown"))
    }

    // 如果是非流式请求，返回离线响应
    return toChatCompletionResponse(generateFallbackChatResponse("抱歉，我无法连接到服务器。请确保您已配置API密钥和AppID，或联系管理员获取帮助。", agent.multimodalModel || "unknown"))
  }

  // 2. 自动生成 chatId
  if (!agent.chatId) {
    agent.chatId = generateFallbackChatId()
  }

  // 3. 拼接上下文历史，自动裁剪（如 6 轮）
  let formattedMessages = messages.map((msg) => ({
    role: msg.role,
    content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
  }))
  // 注入 systemPrompt
  if (agent.systemPrompt && !formattedMessages.some((msg) => msg.role === "system")) {
    formattedMessages.unshift({ role: "system", content: agent.systemPrompt })
  }
  // 裁剪历史，防止 token 超限（如只保留最后 12 条）
  if (formattedMessages.length > 12) {
    formattedMessages = [formattedMessages[0], ...formattedMessages.slice(-11)]
  }

  // 4. 构造请求体
  const requestBody = {
    model: agent.appId,
    messages: formattedMessages,
    stream: options.stream === true,
    detail: options.detail ?? true,
    temperature: options.temperature ?? agent.temperature ?? 0.8,
    max_tokens: options.maxTokens ?? agent.maxTokens ?? 2048,
    user: undefined, // 可扩展
    // 其它参数如 tools/response_mode/stop 可按需扩展
  }

  // 5. 请求头
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${agent.apiKey}`,
  }
  if (options.stream) headers["Accept"] = "text/event-stream"

  // 6. 流式/非流式请求
  try {
    if (options.stream && options.onChunk) {
      // 流式输出
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      })
      if (!response.ok) {
        const errorText = await response.text()
        options.onChunk(`API请求失败: ${response.status} ${errorText}`)
        throw new Error(errorText)
      }
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let content = ""
      let buffer = ""
      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""
        for (const line of lines) {
          if (line.trim() === "") continue
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim()
            if (data === "[DONE]") continue
            try {
              const parsed = JSON.parse(data)
              const chunk = parsed.choices?.[0]?.delta?.content || ""
              if (chunk) {
                content += chunk
                options.onChunk(chunk)
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
      return {
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: agent.appId,
        choices: [
          {
            index: 0,
            message: { role: "assistant", content },
            finish_reason: "stop",
          },
        ],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      } as ChatCompletionResponse;
    } else {
      // 非流式
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText)
      }
      return await response.json() as ChatCompletionResponse;
    }
  } catch (error: any) {
    const errMsg = error?.message || "API请求异常"
    if (options.stream && options.onChunk) options.onChunk(errMsg)
    return toChatCompletionResponse(generateFallbackChatResponse(errMsg, agent.multimodalModel || "unknown"))
  }
}

const CACHE_TTL = 5 * 60; // 5分钟缓存，单位：秒

/**
 * 获取问题建议
 */
export async function getQuestionSuggestions(
  agent: Agent,
  chatId: string,
  customConfig?: {
    open?: boolean
    model?: string
    customPrompt?: string
  },
): Promise<QuestionGuideResponse> {
  // 只做纯算法实现，不查/写 redis
  const apiEndpoint = API_CONSTANTS.FASTGPT_API_ENDPOINT;

  // 检查API端点是否配置
  if (!apiEndpoint) {
    console.error("API endpoint is not configured")
    return {
      code: 200,
      data: getDefaultSuggestions(),
    };
  }

  // 如果API密钥或AppID未配置，返回默认建议但不阻止功能
  if (!agent.apiKey || !agent.appId) {
    console.warn("API key or AppID is not configured, using default suggestions")
    return {
      code: 200,
      data: getDefaultSuggestions(),
    };
  }
  try {
    const baseUrl = API_CONSTANTS.FASTGPT_BASE_API;
    const targetUrl = `${baseUrl}/core/ai/agent/v2/createQuestionGuide`;
    const requestBody = {
      appId: agent.appId,
      chatId: chatId,
      questionGuide: {
        open: true,
        model: agent.multimodalModel || "GPT-4o-mini",
        customPrompt: customConfig?.customPrompt || "你是一个智能助手，请根据用户的问题生成猜你想问。",
      },
    };
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${agent.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      return {
        code: 200,
        data: getDefaultSuggestions(),
      };
    }
    const result = await response.json();
    return result;
  } catch (error) {
    return {
      code: 200,
      data: getDefaultSuggestions(),
    };
  }
}

// 1. fetchWithRetry 工具
export async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, backoff = 300): Promise<Response> {
  let lastError
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options)
      if (!res.ok) throw new Error(res.statusText)
      return res
    } catch (err) {
      lastError = err
      await new Promise(r => setTimeout(r, backoff * Math.pow(2, i)))
    }
  }
  throw lastError
}

// 2. streamChat 支持流式断线重连
// 在 streamChat 内部，若流断开且未超最大重连次数，自动重连并拼接内容
