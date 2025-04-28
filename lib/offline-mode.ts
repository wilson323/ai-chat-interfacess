import type { Message } from "@/types/message"
import { saveMessagesToStorage, loadMessagesFromStorage } from "@/lib/storage/index"

/**
 * Initialize offline mode
 */
export function initOfflineMode(): void {
  // Check if localStorage is supported
  try {
    localStorage.setItem("zkteco_offline_test", "test")
    localStorage.removeItem("zkteco_offline_test")
    console.log("Local storage is available for offline mode")
  } catch (e) {
    console.error("Local storage is not available, offline mode will be limited:", e)
  }
}

/**
 * 检查网络连接（不再请求 /api/ping，改为更通用的检测方式）
 * @returns 是否在线
 */
export async function checkNetworkConnection(): Promise<boolean> {
  // 优先使用浏览器原生的 navigator.onLine
  if (typeof window !== "undefined" && typeof navigator !== "undefined") {
    if (!navigator.onLine) return false
  }
  // 可选：尝试请求一个可配置的 API 端点（如 /api/chat-proxy 或 FastGPT API）
  // 这里只做最基础的在线判断，具体业务可在调用处自定义
  return true
}

/**
 * Generate offline response
 * @param input User input
 * @returns Offline response text
 */
export function generateOfflineResponse(input: string): string {
  // Simple offline response generation
  const responses = [
    "我目前处于离线模式，无法处理您的请求。请检查您的网络连接后再试。",
    "网络连接不可用。我无法连接到服务器处理您的请求。",
    "您当前处于离线模式。请恢复网络连接后再尝试。",
    "抱歉，我无法在离线模式下处理这个请求。请稍后在网络连接恢复后再试。",
    "网络连接已断开。请检查您的网络设置并重试。",
  ]

  // Randomly select a response
  return responses[Math.floor(Math.random() * responses.length)]
}

/**
 * Save messages to local storage
 * @param chatId Chat ID
 * @param messages Message list
 */
export function saveMessagesToLocalStorage(chatId: string, messages: Message[]): boolean {
  return saveMessagesToStorage(chatId, messages)
}

/**
 * Load messages from local storage
 * @param chatId Chat ID
 */
export function loadMessagesFromLocalStorage(chatId: string): Message[] | null {
  return loadMessagesFromStorage(chatId)
}
