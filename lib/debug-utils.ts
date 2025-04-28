/**
 * 调试工具函数
 */

// 是否启用调试模式
const DEBUG_MODE = true

/**
 * 记录调试信息到控制台
 * @param category 日志类别
 * @param message 日志消息
 * @param data 相关数据
 */
export function debugLog(category: string, message: string, data?: any): void {
  if (!DEBUG_MODE) return

  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${category}]`

  if (data) {
    console.log(`${prefix} ${message}`, data)
  } else {
    console.log(`${prefix} ${message}`)
  }
}

/**
 * 记录FastGPT事件
 * @param eventType 事件类型
 * @param data 事件数据
 */
export function logFastGPTEvent(eventType: string, data: any): void {
  if (!DEBUG_MODE) return

  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] [FastGPT Event: ${eventType}]`, data)
}

/**
 * 记录处理步骤
 * @param step 处理步骤
 */
export function logProcessingStep(step: any): void {
  if (!DEBUG_MODE) return

  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] [Processing Step: ${step.type}] ${step.name} (${step.status})`, step)
}

/**
 * 记录API请求
 * @param method HTTP方法
 * @param url 请求URL
 * @param requestData 请求数据
 */
export function logApiRequest(method: string, url: string, requestData?: any): void {
  if (!DEBUG_MODE) return

  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] [API Request] ${method} ${url}`)
  if (requestData) {
    console.log(`Request Data:`, requestData)
  }
}

/**
 * 记录API响应
 * @param url 请求URL
 * @param status 响应状态码
 * @param responseData 响应数据
 */
export function logApiResponse(url: string, status: number, responseData?: any): void {
  if (!DEBUG_MODE) return

  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] [API Response] ${url} - Status: ${status}`)
  if (responseData) {
    console.log(`Response Data:`, responseData)
  }
}

/**
 * 记录错误
 * @param category 错误类别
 * @param error 错误对象
 * @param context 错误上下文
 */
export function logError(category: string, error: Error, context?: any): void {
  if (!DEBUG_MODE) return

  const timestamp = new Date().toISOString()
  console.error(`[${timestamp}] [ERROR: ${category}] ${error.message}`)
  console.error(`Stack Trace:`, error.stack)
  if (context) {
    console.error(`Error Context:`, context)
  }
}

/**
 * 安全地将对象转换为字符串
 * @param obj 要字符串化的对象
 * @param space 缩进空格数
 * @returns JSON字符串或错误消息
 */
export function safeStringify(obj: any, space?: string | number): string {
  try {
    return JSON.stringify(obj, null, space)
  } catch (error) {
    console.error("Failed to stringify object:", error)
    return `Error: Could not stringify object - ${error instanceof Error ? error.message : "Unknown error"}`
  }
}
