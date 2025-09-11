/**
 * 统一配置管理中心
 * 集中管理所有配置，避免配置分散
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import type { AppConfig } from '@/types'

// 环境配置
const NODE_ENV = process.env.NODE_ENV || 'development'
const isDevelopment = NODE_ENV === 'development'
const isProduction = NODE_ENV === 'production'
const isTest = NODE_ENV === 'test'

// 加载配置文件
function loadConfigFile<T>(filename: string): T {
  try {
    const configPath = join(process.cwd(), 'config', filename)
    const configData = readFileSync(configPath, 'utf-8')
    return JSON.parse(configData)
  } catch (error) {
    console.warn(`Failed to load config file: ${filename}`, error)
    return {} as T
  }
}

// 数据库配置
const databaseConfig = loadConfigFile<{
  development: any
  test: any
  production: any
}>('config.json')

// 智能体配置
const defaultAgents = require('@/config/default-agents').DEFAULT_AGENTS

// CAD分析器配置
const cadAnalyzerConfig = loadConfigFile<{
  supportedFormats: string[]
  maxFileSize: number
  defaultModel: string
  apiEndpoints: Record<string, string>
}>('cad-analyzer-config.json')

// 图像编辑器配置
const imageEditorConfig = loadConfigFile<{
  supportedFormats: string[]
  maxFileSize: number
  defaultModel: string
  processingOptions: Record<string, any>
}>('image-editor-config.json')

// 统一应用配置
export const appConfig: AppConfig = {
  database: {
    host: databaseConfig[NODE_ENV]?.host || process.env.DB_HOST || 'localhost',
    port: databaseConfig[NODE_ENV]?.port || parseInt(process.env.DB_PORT || '5432'),
    database: databaseConfig[NODE_ENV]?.database || process.env.DB_NAME || 'ai_chat',
    username: databaseConfig[NODE_ENV]?.username || process.env.DB_USER || 'postgres',
    password: databaseConfig[NODE_ENV]?.password || process.env.DB_PASSWORD || '',
    ssl: databaseConfig[NODE_ENV]?.ssl || process.env.DB_SSL === 'true'
  },
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    timeout: parseInt(process.env.API_TIMEOUT || '30000'),
    retries: parseInt(process.env.API_RETRIES || '3'),
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15分钟
      max: parseInt(process.env.RATE_LIMIT_MAX || '100') // 每15分钟100次请求
    }
  },
  features: {
    enableVoice: process.env.ENABLE_VOICE !== 'false',
    enableFileUpload: process.env.ENABLE_FILE_UPLOAD !== 'false',
    enableImageUpload: process.env.ENABLE_IMAGE_UPLOAD !== 'false',
    enableStreaming: process.env.ENABLE_STREAMING !== 'false',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf,doc,docx,txt,md,dwg,dxf,step,stp,mp3,wav,mp4').split(',')
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
    rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== 'false'
  }
}

// 智能体配置
export const agentConfig = {
  defaultAgents,
  cadAnalyzer: cadAnalyzerConfig,
  imageEditor: imageEditorConfig
}

// 模型配置
export const modelConfig = {
  // 国内多模态模型配置
  domesticModels: {
    'qwen-vl-max': {
      name: '通义千问VL-Max',
      provider: 'alibaba',
      apiEndpoint: process.env.QWEN_API_ENDPOINT || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
      apiKey: process.env.QWEN_API_KEY || '',
      maxTokens: 4000,
      supportsImage: true,
      supportsVideo: false,
      supportsAudio: false
    },
    'qwen-vl-plus': {
      name: '通义千问VL-Plus',
      provider: 'alibaba',
      apiEndpoint: process.env.QWEN_API_ENDPOINT || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
      apiKey: process.env.QWEN_API_KEY || '',
      maxTokens: 2000,
      supportsImage: true,
      supportsVideo: false,
      supportsAudio: false
    },
    'glm-4v': {
      name: 'GLM-4V',
      provider: 'zhipu',
      apiEndpoint: process.env.GLM_API_ENDPOINT || 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      apiKey: process.env.GLM_API_KEY || '',
      maxTokens: 4000,
      supportsImage: true,
      supportsVideo: false,
      supportsAudio: false
    }
  },
  // 国际模型配置
  internationalModels: {
    'gpt-4-vision': {
      name: 'GPT-4 Vision',
      provider: 'openai',
      apiEndpoint: process.env.OPENAI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions',
      apiKey: process.env.OPENAI_API_KEY || '',
      maxTokens: 4000,
      supportsImage: true,
      supportsVideo: false,
      supportsAudio: false
    },
    'claude-3-opus': {
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      apiEndpoint: process.env.ANTHROPIC_API_ENDPOINT || 'https://api.anthropic.com/v1/messages',
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      maxTokens: 4000,
      supportsImage: true,
      supportsVideo: false,
      supportsAudio: false
    }
  }
}

// 环境变量验证
export function validateConfig(): void {
  const requiredEnvVars = [
    'JWT_SECRET',
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }
}

// 配置获取工具函数
export function getConfig<T = any>(path: string, defaultValue?: T): T {
  const keys = path.split('.')
  let value: any = appConfig
  
  for (const key of keys) {
    value = value?.[key]
    if (value === undefined) {
      return defaultValue as T
    }
  }
  
  return value as T
}

// 环境检查
export const env = {
  isDevelopment,
  isProduction,
  isTest,
  NODE_ENV
}

// 导出所有配置
export {
  appConfig as config,
  agentConfig,
  modelConfig
}

export default appConfig
