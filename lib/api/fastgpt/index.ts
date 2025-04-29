/**
 * FastGPT API 统一处理模块
 * 整合了之前分散在fastgpt.ts和fastgpt-client.ts的功能
 */

import type { Agent } from "../../../types/agent"
import type { Message } from "../../../types/message"
import type { ProcessingStep } from "../../../components/processing-flow-display"
import { retry } from "../../utils/index"
import { API_CONSTANTS, ERROR_MESSAGES } from "../../storage/shared/constants"
import { DEFAULT_AGENT_SETTINGS } from "@/lib/storage/shared/constants"
import { logFastGPTEvent, logProcessingStep, logApiRequest, logApiResponse, logError } from "../../debug-utils"

// ================ 类型定义 ================

export interface StreamOptions {
  temperature?: number
  maxTokens?: number
  onStart?: () => void
  onChunk?: (chunk: string) => void
  onIntermediateValue?: (value: any, eventType: string) => void
  onProcessingStep?: (step: ProcessingStep) => void
  onError?: (error: Error) => void
  onFinish?: () => void
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
function generateFallbackResponse(agent: Agent, chatId: string): ChatInitResponse {
  console.log("Generating fallback response with chatId:", chatId)
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
          welcomeText: agent.systemPrompt || "今天我能帮您什么？",
        },
        chatModels: [agent.multimodalModel || "gpt-3.5-turbo"],
        name: agent.name || "AI Assistant",
        avatar: "",
        intro: agent.description || "",
        type: "chat",
        pluginInputs: [],
      },
      interacts: [], // 添加空的interacts数组
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
    return retry(
      async () => {
        await this._streamChatInternal(messages, options)
      },
      this.retryOptions.maxRetries,
      API_CONSTANTS.INITIAL_RETRY_DELAY,
      API_CONSTANTS.MAX_RETRY_DELAY,
      this.retryOptions.onRetry,
    )
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

    if (!apiEndpoint || !this.agent.apiKey || !this.agent.appId) {
      const error = new Error(ERROR_MESSAGES.INCOMPLETE_CONFIG)
      if (options.onError) {
        options.onError(error instanceof Error ? error : new Error(String(error)))
      }
      throw error
    }

    // 确保有有效的 chatId
    if (!this.agent.chatId) {
      this.agent.chatId = generateFallbackChatId()
    }

    // 准备请求体，符合 FastGPT API 格式
    const requestBody = {
      model: this.agent.appId, // 使用 appId 作为模型参数
      chatId: this.agent.chatId,
      stream: true,
      detail: true, // 设置为 true 以获取中间值
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

    // 添加超时处理
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONSTANTS.STREAM_TIMEOUT)

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
        signal: controller.signal,
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
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // 解码块并添加到缓冲区
        buffer += decoder.decode(value, { stream: true })

        // 处理缓冲区中的完整行
        const lines = buffer.split(/\r?\n/)
        buffer = lines.pop() || "" // 保留缓冲区中的最后一个不完整行

        for (const line of lines) {
          if (line.trim() === "") continue

          // 提取事件类型和数据
          let eventType = "unknown"
          let data = ""

          // 检查是否包含事件类型
          if (line.startsWith("event: ")) {
            const eventLine = line.trim()
            eventType = eventLine.substring(7) // 提取事件类型

            // 查找对应的数据行
            const dataLineIndex = lines.indexOf(line) + 1
            if (dataLineIndex < lines.length && lines[dataLineIndex].startsWith("data: ")) {
              data = lines[dataLineIndex].substring(6).trim()
            }
          } else if (line.startsWith("data: ")) {
            data = line.substring(6).trim()
          } else {
            continue // 跳过不符合格式的行
          }

          // 检查是否是结束标记
          if (data === "[DONE]") {
            console.log("收到 [DONE] 事件")
            continue
          }

          // 尝试解析数据为 JSON
          try {
            const parsed = data ? JSON.parse(data) : {}

            // 记录事件
            logFastGPTEvent(eventType, parsed)

            // 根据事件类型处理数据
            switch (eventType) {
              case "answer":
              case "fastAnswer":
                // 处理回答内容
                if (parsed.choices && parsed.choices.length > 0 && parsed.choices[0].delta) {
                  const textChunk = parsed.choices[0].delta.content || ""
                  if (textChunk && options.onChunk) {
                    options.onChunk(textChunk)
                  }
                }
                break

              case "flowNodeStatus":
              case "moduleStatus":
              case "moduleStart":
              case "moduleEnd":
                // 处理节点状态更新
                const nodeName = typeof parsed === 'object' && parsed !== null && 'name' in parsed ? (parsed as any).name : (typeof parsed === 'object' && parsed !== null && 'moduleName' in parsed ? (parsed as any).moduleName : eventType)
                const nodeStatus = typeof parsed === 'object' && parsed !== null && 'status' in parsed ? (parsed as any).status : "running"

                // 如果是处理步骤，记录步骤
                if (options.onProcessingStep) {
                  const step = {
                    id: `${eventType}-${Date.now()}`,
                    type: eventType,
                    name: nodeName,
                    status: nodeStatus,
                    content: typeof parsed === 'string' ? parsed : (typeof parsed === 'object' && parsed !== null && 'content' in parsed ? (parsed as any).content : (typeof parsed === 'object' && parsed !== null && 'text' in parsed ? (parsed as any).text : JSON.stringify(parsed))),
                    details: parsed,
                    timestamp: new Date(),
                  }

                  logProcessingStep(step)
                  options.onProcessingStep(step)
                }

                if (options.onIntermediateValue) {
                  options.onIntermediateValue(parsed, eventType)
                }
                break

              case "flowResponses":
                // 处理节点完整响应
                if (Array.isArray(parsed)) {
                  parsed.forEach((response, index) => {
                    const moduleName = response.moduleName || `模块${index + 1}`
                    const moduleType = response.moduleType || "unknown"

                    // 如果是处理步骤，记录步骤
                    if (options.onProcessingStep) {
                      const step = {
                        id: `${eventType}-${Date.now()}`,
                        type: eventType,
                        name: typeof response === 'object' && response !== null && 'name' in response ? (response as any).name : (typeof response === 'object' && response !== null && 'moduleName' in response ? (response as any).moduleName : eventType),
                        status: typeof response === 'object' && response !== null && 'status' in response ? (response as any).status : "running",
                        content: typeof response === 'string' ? response : (typeof response === 'object' && response !== null && 'content' in response ? (response as any).content : (typeof response === 'object' && response !== null && 'text' in response ? (response as any).text : JSON.stringify(response))),
                        details: response,
                        timestamp: new Date(),
                      }

                      logProcessingStep(step)
                      options.onProcessingStep(step)
                    }

                    if (options.onIntermediateValue) {
                      options.onIntermediateValue(response, `${eventType}-${moduleType}`)
                    }
                  })
                } else if (options.onIntermediateValue) {
                  options.onIntermediateValue(parsed, eventType)
                }
                break

              case "thinking":
              case "thinkingStart":
              case "thinkingEnd":
                // 处理思考过程
                if (options.onIntermediateValue) {
                  options.onIntermediateValue(
                    typeof parsed === 'string' ? parsed : (typeof parsed === 'object' && parsed !== null && 'content' in parsed ? (parsed as any).content : (typeof parsed === 'object' && parsed !== null && 'text' in parsed ? (parsed as any).text : JSON.stringify(parsed))),
                    eventType,
                  )
                }

                // 如果是处理步骤，记录步骤
                if (options.onProcessingStep) {
                  const step = {
                    id: `${eventType}-${Date.now()}`,
                    type: eventType,
                    name: typeof parsed === 'object' && parsed !== null && 'name' in parsed ? (parsed as any).name : (typeof parsed === 'object' && parsed !== null && 'moduleName' in parsed ? (parsed as any).moduleName : eventType),
                    status: typeof parsed === 'object' && parsed !== null && 'status' in parsed ? (parsed as any).status : "running",
                    content: typeof parsed === 'string' ? parsed : (typeof parsed === 'object' && parsed !== null && 'content' in parsed ? (parsed as any).content : (typeof parsed === 'object' && parsed !== null && 'text' in parsed ? (parsed as any).text : JSON.stringify(parsed))),
                    details: parsed,
                    timestamp: new Date(),
                  }

                  logProcessingStep(step)
                  options.onProcessingStep(step)
                }
                break

              case "toolCall":
              case "toolParams":
              case "toolResponse":
                // 处理工具调用相关事件
                // 如果是处理步骤，记录步骤
                if (options.onProcessingStep) {
                  const step = {
                    id: `${eventType}-${Date.now()}`,
                    type: eventType,
                    name: typeof parsed === 'object' && parsed !== null && 'name' in parsed ? (parsed as any).name : (typeof parsed === 'object' && parsed !== null && 'moduleName' in parsed ? (parsed as any).moduleName : eventType),
                    status: typeof parsed === 'object' && parsed !== null && 'status' in parsed ? (parsed as any).status : "running",
                    content: typeof parsed === 'string' ? parsed : (typeof parsed === 'object' && parsed !== null && 'content' in parsed ? (parsed as any).content : (typeof parsed === 'object' && parsed !== null && 'text' in parsed ? (parsed as any).text : JSON.stringify(parsed))),
                    details: parsed,
                    timestamp: new Date(),
                  }

                  logProcessingStep(step)
                  options.onProcessingStep(step)
                }

                if (options.onIntermediateValue) {
                  options.onIntermediateValue(parsed, eventType)
                }
                break

              case "updateVariables":
                // 处理变量更新事件
                // 如果是处理步骤，记录步骤
                if (options.onProcessingStep) {
                  const step = {
                    id: `${eventType}-${Date.now()}`,
                    type: eventType,
                    name: typeof parsed === 'object' && parsed !== null && 'name' in parsed ? (parsed as any).name : (typeof parsed === 'object' && parsed !== null && 'moduleName' in parsed ? (parsed as any).moduleName : eventType),
                    status: typeof parsed === 'object' && parsed !== null && 'status' in parsed ? (parsed as any).status : "running",
                    content: typeof parsed === 'string' ? parsed : (typeof parsed === 'object' && parsed !== null && 'content' in parsed ? (parsed as any).content : (typeof parsed === 'object' && parsed !== null && 'text' in parsed ? (parsed as any).text : JSON.stringify(parsed))),
                    details: parsed,
                    timestamp: new Date(),
                  }

                  logProcessingStep(step)
                  options.onProcessingStep(step)
                }

                if (options.onIntermediateValue) {
                  options.onIntermediateValue(parsed, eventType)
                }
                break

              case "error":
                // 处理错误事件
                const errorMessage = parsed.error || "未知错误"

                // 如果是处理步骤，记录步骤
                if (options.onProcessingStep) {
                  const step = {
                    id: `${eventType}-${Date.now()}`,
                    type: eventType,
                    name: typeof parsed === 'object' && parsed !== null && 'name' in parsed ? (parsed as any).name : (typeof parsed === 'object' && parsed !== null && 'moduleName' in parsed ? (parsed as any).moduleName : eventType),
                    status: typeof parsed === 'object' && parsed !== null && 'status' in parsed ? (parsed as any).status : "running",
                    content: typeof parsed === 'string' ? parsed : (typeof parsed === 'object' && parsed !== null && 'content' in parsed ? (parsed as any).content : (typeof parsed === 'object' && parsed !== null && 'text' in parsed ? (parsed as any).text : JSON.stringify(parsed))),
                    details: parsed,
                    timestamp: new Date(),
                  }

                  logProcessingStep(step)
                  options.onProcessingStep(step)
                }

                if (options.onError) {
                  options.onError(new Error(errorMessage))
                }
                break

              default:
                // 处理未知事件类型
                // 检查是否是标准 OpenAI 格式
                if (parsed.choices && parsed.choices.length > 0 && parsed.choices[0].delta) {
                  const textChunk = parsed.choices[0].delta.content || ""
                  if (textChunk && options.onChunk) {
                    options.onChunk(textChunk)
                  }
                } else if (options.onIntermediateValue) {
                  options.onIntermediateValue(parsed, eventType)
                }
                break
            }
          } catch (e) {
            console.error("解析 SSE 块时出错:", e, "原始数据:", data)
            // 如果不是有效的 JSON 但仍有内容，尝试提取文本
            if (data && typeof data === "string" && data !== "[DONE]" && options.onChunk) {
              options.onChunk(data)
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
  async chat(messages: any[], options: Omit<StreamOptions, "onChunk" | "onStart"> = {}): Promise<string> {
    return sendChatRequest(this.agent, messages, { ...options, stream: false }).then(
      (response) => response.choices[0].message.content,
    )
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

  if (!apiEndpoint || !agent.apiKey || !agent.appId) {
    console.error("API configuration is incomplete")
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

/**
 * 发送聊天请求
 */
export async function sendChatRequest(
  agent: Agent,
  messages: Message[],
  options: {
    stream?: boolean
    temperature?: number
    maxTokens?: number
    onChunk?: (chunk: string) => void
  } = {},
): Promise<FastGPTChatResponse> {
  // 1. 参数校验
  const apiEndpoint = agent.apiEndpoint || API_CONSTANTS.FASTGPT_API_ENDPOINT
  if (!apiEndpoint || !agent.apiKey || !agent.appId) {
    const errMsg = "API 配置不完整，请配置 API 端点、密钥和 AppId。"
    if (options.stream && options.onChunk) options.onChunk(errMsg)
    return generateFallbackChatResponse(errMsg, agent.multimodalModel || "unknown")
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
      }
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
      return await response.json()
    }
  } catch (error: any) {
    const errMsg = error?.message || "API请求异常"
    if (options.stream && options.onChunk) options.onChunk(errMsg)
    return generateFallbackChatResponse(errMsg, agent.multimodalModel || "unknown")
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
  if (!apiEndpoint || !agent.apiKey || !agent.appId) {
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
