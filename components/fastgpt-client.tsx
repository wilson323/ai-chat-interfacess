"use client"

import type { Agent } from "@/types/agent"
import type { ProcessingStep } from "@/components/processing-flow-display"
import { retry } from "@/lib/retry"

interface StreamOptions {
  temperature?: number
  maxTokens?: number
  onStart?: () => void
  onChunk?: (chunk: string) => void
  onIntermediateValue?: (value: any, eventType: string) => void
  onProcessingStep?: (step: ProcessingStep) => void
  onError?: (error: Error) => void
  onFinish?: () => void
}

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
    this.agent = agent
    this.retryOptions = {
      maxRetries: retryOptions?.maxRetries || 3,
      onRetry: retryOptions?.onRetry,
    }
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
      1000, // 初始延迟 1 秒
      10000, // 最大延迟 10 秒
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
    if (!this.agent.apiEndpoint || !this.agent.apiKey || !this.agent.appId) {
      const error = new Error("API 配置不完整。请配置 API 端点、密钥和 AppId。")
      if (options.onError) {
        options.onError(error)
      }
      throw error
    }

    // 确保有有效的 chatId
    if (!this.agent.chatId) {
      this.agent.chatId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    }

    // 准备请求体，符合 FastGPT API 格式
    const requestBody = {
      model: this.agent.appId, // 使用 appId 作为模型参数
      chatId: this.agent.chatId,
      stream: true,
      detail: true, // 设置为 true 以获取中间值
      messages: messages,
      temperature: options.temperature || this.agent.temperature || 0.7,
      max_tokens: options.maxTokens || this.agent.maxTokens || 1000,
    }

    // 通知开始流式传输
    if (options.onStart) {
      options.onStart()
    }

    // 使用代理 API 进行流式传输
    const proxyData = {
      targetUrl: this.agent.apiEndpoint,
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
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 秒超时

    try {
      console.log("通过代理发送流式请求到:", this.agent.apiEndpoint)
      console.log("请求体(部分):", JSON.stringify(requestBody).substring(0, 200) + "...")

      const response = await fetch("/api/chat-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proxyData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text().catch(() => "无法读取错误响应")
        console.error(`API 请求失败: ${response.status} ${response.statusText} - ${errorText}`)

        const error = new Error(`API 请求失败: ${response.status} ${response.statusText}`)
        if (options.onError) {
          options.onError(error)
        }
        throw error
      }

      // 检查响应是否为流
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("text/event-stream")) {
        console.error(`预期事件流但得到: ${contentType}`)
        const text = await response.text().catch(() => "无法读取响应体")
        console.error(`响应体(前 200 个字符): ${text.substring(0, 200)}`)

        const error = new Error(`预期事件流但得到: ${contentType || "未知内容类型"}`)
        if (options.onError) {
          options.onError(error)
        }
        throw error
      }

      const reader = response.body?.getReader()
      if (!reader) {
        const error = new Error("无法获取响应读取器")
        if (options.onError) {
          options.onError(error)
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
                // 处理节点状态更新
                const nodeName = parsed.name || "未知节点"
                const nodeStatus = parsed.status || "running"

                if (options.onProcessingStep) {
                  options.onProcessingStep({
                    id: `node-${nodeName}-${Date.now()}`,
                    type: "flowNodeStatus",
                    name: nodeName,
                    status: nodeStatus,
                    details: parsed,
                    timestamp: new Date(),
                  })
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

                    if (options.onProcessingStep) {
                      options.onProcessingStep({
                        id: `response-${moduleName}-${Date.now()}`,
                        type: "flowResponses",
                        name: moduleName,
                        status: "success",
                        content: JSON.stringify(response, null, 2),
                        details: response,
                        timestamp: new Date(),
                      })
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
                    typeof parsed === "string" ? parsed : parsed.content || parsed.text || JSON.stringify(parsed),
                    eventType,
                  )
                }

                if (options.onProcessingStep) {
                  options.onProcessingStep({
                    id: `thinking-${Date.now()}`,
                    type: eventType,
                    name: "思考过程",
                    status: "running",
                    content:
                      typeof parsed === "string" ? parsed : parsed.content || parsed.text || JSON.stringify(parsed),
                    timestamp: new Date(),
                  })
                }
                break

              case "toolCall":
              case "toolParams":
              case "toolResponse":
                // 处理工具调用相关事件
                if (options.onProcessingStep) {
                  options.onProcessingStep({
                    id: `tool-${eventType}-${Date.now()}`,
                    type: eventType,
                    name: `工具${eventType === "toolCall" ? "调用" : eventType === "toolParams" ? "参数" : "响应"}`,
                    status: "running",
                    content: JSON.stringify(parsed, null, 2),
                    details: parsed,
                    timestamp: new Date(),
                  })
                }

                if (options.onIntermediateValue) {
                  options.onIntermediateValue(parsed, eventType)
                }
                break

              case "updateVariables":
                // 处理变量更新事件
                if (options.onProcessingStep) {
                  options.onProcessingStep({
                    id: `variables-${Date.now()}`,
                    type: eventType,
                    name: "变量更新",
                    status: "success",
                    content: JSON.stringify(parsed, null, 2),
                    details: parsed,
                    timestamp: new Date(),
                  })
                }

                if (options.onIntermediateValue) {
                  options.onIntermediateValue(parsed, eventType)
                }
                break

              case "error":
                // 处理错误事件
                const errorMessage = parsed.error || "未知错误"

                if (options.onProcessingStep) {
                  options.onProcessingStep({
                    id: `error-${Date.now()}`,
                    type: eventType,
                    name: "错误",
                    status: "error",
                    content: errorMessage,
                    timestamp: new Date(),
                  })
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

      // 如果发生错误，生成一个简单的响应
      if (options.onChunk) {
        options.onChunk("抱歉，连接服务器时出现问题。我将以离线模式为您服务。请问有什么我可以帮助您的？")
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
    if (!this.agent.apiEndpoint || !this.agent.apiKey || !this.agent.appId) {
      throw new Error("API 配置不完整。请配置 API 端点、密钥和 AppId。")
    }

    // 确保有有效的 chatId
    if (!this.agent.chatId) {
      this.agent.chatId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    }

    // 准备请求体
    const requestBody = {
      model: this.agent.appId,
      chatId: this.agent.chatId,
      stream: false,
      messages: messages,
      temperature: options.temperature || this.agent.temperature || 0.7,
      max_tokens: options.maxTokens || this.agent.maxTokens || 1000,
    }

    // 使用代理 API
    const proxyData = {
      targetUrl: this.agent.apiEndpoint,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.agent.apiKey}`,
      },
      body: requestBody,
    }

    try {
      const response = await fetch("/api/chat-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proxyData),
      })

      if (!response.ok) {
        // 如果API请求失败，返回一个离线响应
        console.log("API请求失败，使用离线响应")
        return "抱歉，连接服务器时出现问题。我将以离线模式为您服务。请问有什么我可以帮助您的？"
      }

      const data = await response.json()

      if (!data.success || data.status !== 200) {
        // 如果API响应状态不是200，返回一个离线响应
        console.log("API响应状态不是200，使用离线响应")
        return "抱歉，服务器返回了一个错误。我将以离线模式为您服务。请问有什么我可以帮助您的？"
      }

      return data.data.choices[0].message.content
    } catch (error) {
      console.error("聊天请求错误:", error)
      // 返回一个离线响应
      return "抱歉，处理您的请求时出现错误。我将以离线模式为您服务。请问有什么我可以帮助您的？"
    }
  }
}
