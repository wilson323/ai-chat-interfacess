/**
 * FastGPT 初始化模块
 * 使用统一的FastGPT API模块
 */

import type { Agent } from "@/types/agent"
// import { initializeChat } from "@/lib/api/fastgpt" // Removed duplicate declaration

// 定义初始化对话响应类型
export interface FastGPTInitResponse {
  system_prompt?: string
  welcome_message?: string
  model?: string
  agent_id?: string
  knowledge_id?: string
  agent_config?: {
    name?: string
    avatar?: string
    description?: string
    [key: string]: any
  }
  user?: string
  tools?: any[]
  interacts?: any[]
  [key: string]: any
}

/**
 * 初始化聊天会话
 * 这是一个兼容性包装器，保持与现有代码的兼容性
 */
export async function initializeChatWrapper(agent: Agent, chatId?: string) {
  return await import("@/lib/api/fastgpt").then((module) => module.initializeChat(agent, chatId))
}

// Improve the fallback response generator to ensure it's more robust
function generateFallbackResponse(agent: Agent, chatId: string): FastGPTInitResponse {
  console.log("Generating fallback response with chatId:", chatId)

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
        chatModels: [agent.model || "gpt-3.5-turbo"],
        name: agent.name || "AI Assistant",
        avatar: "",
        intro: agent.description || "",
        type: "chat",
        pluginInputs: [],
      },
      interacts: interacts,
    },
    welcome_message: finalWelcomeMessage,
    system_prompt: finalSystemPrompt,
    interacts: interacts,
  }
}

/**
 * 生成本地回退聊天ID
 * 当所有初始化方法都失败时使用
 */
export function generateFallbackChatId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
