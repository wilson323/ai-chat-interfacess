import type { Agent } from "@/types/agent"

// 默认智能体配置
export const DEFAULT_AGENTS: Omit<Agent, "icon">[] = [
  {
    id: "default-assistant",
    name: "NeuroGlass 助手",
    description: "全能型人工智能助手",
    apiEndpoint: "https://zktecoaihub.com/api/v1/chat/completions",
    apiKey: "",
    appId: "",
    type: "chat",
    isPublished: true,
    systemPrompt: "你是一位专业、友好的AI助手，能够回答用户的各种问题并提供帮助。",
    temperature: 0.7,
    maxTokens: 2000,
    supportsFileUpload: true,
    supportsImageUpload: true,
  },
  {
    id: "image-editor",
    name: "图像编辑器",
    description: "AI驱动的图像编辑和处理工具",
    apiEndpoint: "https://zktecoaihub.com/api/v1/chat/completions",
    apiKey: "",
    appId: "",
    type: "image-editor",
    isPublished: true,
    multimodalModel: "qwen-vl-max",
    systemPrompt: "你是一位专业的图像编辑助手，能够帮助用户处理和编辑图像。",
    temperature: 0.7,
    maxTokens: 2000,
    supportsFileUpload: true,
    supportsImageUpload: true,
  },
  {
    id: "cad-analyzer",
    name: "CAD解读智能体",
    description: "专业CAD图纸解析工具，识别安防设备布局",
    apiEndpoint: "https://zktecoaihub.com/api/v1/chat/completions",
    apiKey: "",
    appId: "",
    type: "cad-analyzer",
    isPublished: true,
    multimodalModel: "qwen-vl-max",
    systemPrompt: "你是一位专业的安防系统工程师和CAD图纸分析专家，能够分析CAD图纸并提供详细的安防设备分析报告。",
    temperature: 0.7,
    maxTokens: 4000,
    supportsFileUpload: true,
    supportsImageUpload: true,
  },
]

// 获取图标组件
export function getAgentIcon(type: string) {
  // 这个函数将在运行时动态导入图标组件
  // 这样可以避免在服务器端渲染时出现问题
  return type
}
