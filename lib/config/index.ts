/**
 * 统一配置管理中心
 * 基于环境变量的配置管理，确保全局一致性和安全性
 */

import type { AppConfig } from '@/types'

// 环境配置
const NODE_ENV = process.env.NODE_ENV || 'development'
const isDevelopment = NODE_ENV === 'development'
const isProduction = NODE_ENV === 'production'
const isTest = NODE_ENV === 'test'

// 配置获取工具函数
function getEnvVar<T = string>(
  key: string, 
  defaultValue?: T,
  transform?: (value: string) => T
): T {
  const value = process.env[key]
  
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue
    }
    throw new Error(`Environment variable ${key} is required`)
  }
  
  return transform ? transform(value) : (value as T)
}

function getBooleanEnvVar(key: string, defaultValue = false): boolean {
  return getEnvVar(key, defaultValue, (value) => 
    value.toLowerCase() === 'true'
  )
}

function getNumberEnvVar(key: string, defaultValue?: number): number {
  return getEnvVar(key, defaultValue, (value) => parseInt(value, 10))
}

function getArrayEnvVar(key: string, defaultValue: string[] = []): string[] {
  return getEnvVar(key, defaultValue, (value) => 
    value.split(',').map(item => item.trim())
  )
}

// 智能体配置（从配置文件加载，但支持环境变量覆盖）
let defaultAgents: any
try {
  defaultAgents = require('@/config/default-agents').DEFAULT_AGENTS
} catch (error) {
  console.warn('Failed to load default agents config:', error)
  defaultAgents = []
}

// CAD分析器配置（从配置文件加载，但支持环境变量覆盖）
let cadAnalyzerConfig: any
try {
  cadAnalyzerConfig = require('@/config/cad-analyzer-config.json')
} catch (error) {
  console.warn('Failed to load CAD analyzer config:', error)
  cadAnalyzerConfig = {
    supportedFormats: ['dwg', 'dxf', 'step', 'stp'],
    maxFileSize: 10485760,
    defaultModel: 'qwen-vl-max',
    apiEndpoints: {}
  }
}

// 图像编辑器配置（从配置文件加载，但支持环境变量覆盖）
let imageEditorConfig: any
try {
  imageEditorConfig = require('@/config/image-editor-config.json')
} catch (error) {
  console.warn('Failed to load image editor config:', error)
  imageEditorConfig = {
    supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maxFileSize: 10485760,
    defaultModel: 'qwen-vl-max',
    processingOptions: {}
  }
}

// 统一应用配置 - 完全基于环境变量
export const appConfig: AppConfig = {
  database: {
    host: getEnvVar('DB_HOST', 'localhost'),
    port: getNumberEnvVar('DB_PORT', 5432),
    database: getEnvVar('DB_NAME', 'ai_chat'),
    username: getEnvVar('DB_USER', 'postgres'),
    password: getEnvVar('DB_PASSWORD', ''),
    ssl: getBooleanEnvVar('DB_SSL', false),
    pool: {
      max: getNumberEnvVar('DB_POOL_MAX', 20),
      min: getNumberEnvVar('DB_POOL_MIN', 5),
      acquire: getNumberEnvVar('DB_POOL_ACQUIRE', 30000),
      idle: getNumberEnvVar('DB_POOL_IDLE', 10000)
    }
  },
  api: {
    baseUrl: getEnvVar('API_BASE_URL', 'http://localhost:3000'),
    timeout: getNumberEnvVar('API_TIMEOUT', 30000),
    retries: getNumberEnvVar('API_RETRIES', 3),
    rateLimit: {
      windowMs: getNumberEnvVar('RATE_LIMIT_WINDOW', 900000), // 15分钟
      max: getNumberEnvVar('RATE_LIMIT_MAX', 100) // 每15分钟100次请求
    }
  },
  features: {
    enableVoice: getBooleanEnvVar('ENABLE_VOICE', true),
    enableFileUpload: getBooleanEnvVar('ENABLE_FILE_UPLOAD', true),
    enableImageUpload: getBooleanEnvVar('ENABLE_IMAGE_UPLOAD', true),
    enableStreaming: getBooleanEnvVar('ENABLE_STREAMING', true),
    maxFileSize: getNumberEnvVar('MAX_FILE_SIZE', 10485760), // 10MB
    allowedFileTypes: getArrayEnvVar('ALLOWED_FILE_TYPES', [
      'jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'md',
      'dwg', 'dxf', 'step', 'stp', 'mp3', 'wav', 'mp4'
    ])
  },
  security: {
    jwtSecret: getEnvVar('JWT_SECRET', 'your-secret-key'),
    jwtExpiresIn: getEnvVar('JWT_EXPIRES_IN', '24h'),
    bcryptRounds: getNumberEnvVar('BCRYPT_ROUNDS', 12),
    corsOrigins: getArrayEnvVar('CORS_ORIGINS', ['http://localhost:3000']),
    rateLimitEnabled: getBooleanEnvVar('RATE_LIMIT_ENABLED', true)
  },
  redis: {
    host: getEnvVar('REDIS_HOST', 'localhost'),
    port: getNumberEnvVar('REDIS_PORT', 6379),
    password: getEnvVar('REDIS_PASSWORD', ''),
    db: getNumberEnvVar('REDIS_DB', 0)
  },
  storage: {
    uploadPath: getEnvVar('UPLOAD_PATH', './uploads'),
    tempPath: getEnvVar('TEMP_PATH', './temp'),
    provider: getEnvVar('CLOUD_STORAGE_PROVIDER', 'local'),
    aws: {
      accessKeyId: getEnvVar('AWS_ACCESS_KEY_ID', ''),
      secretAccessKey: getEnvVar('AWS_SECRET_ACCESS_KEY', ''),
      region: getEnvVar('AWS_REGION', 'us-east-1'),
      bucketName: getEnvVar('AWS_BUCKET_NAME', '')
    }
  },
  monitoring: {
    enabled: getBooleanEnvVar('ENABLE_MONITORING', true),
    endpoint: getEnvVar('MONITORING_ENDPOINT', 'http://localhost:9090'),
    logLevel: getEnvVar('LOG_LEVEL', 'info')
  }
}

// 智能体配置
export const agentConfig = {
  defaultAgents,
  cadAnalyzer: cadAnalyzerConfig,
  imageEditor: imageEditorConfig
}

// 模型配置 - 基于环境变量
export const modelConfig = {
  // 国内多模态模型配置
  domesticModels: {
    'qwen-vl-max': {
      name: '通义千问VL-Max',
      provider: 'alibaba',
      apiEndpoint: getEnvVar('QWEN_API_ENDPOINT', 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'),
      apiKey: getEnvVar('QWEN_API_KEY', ''),
      maxTokens: 4000,
      supportsImage: true,
      supportsVideo: false,
      supportsAudio: false
    },
    'qwen-vl-plus': {
      name: '通义千问VL-Plus',
      provider: 'alibaba',
      apiEndpoint: getEnvVar('QWEN_API_ENDPOINT', 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'),
      apiKey: getEnvVar('QWEN_API_KEY', ''),
      maxTokens: 2000,
      supportsImage: true,
      supportsVideo: false,
      supportsAudio: false
    },
    'glm-4v': {
      name: 'GLM-4V',
      provider: 'zhipu',
      apiEndpoint: getEnvVar('GLM_API_ENDPOINT', 'https://open.bigmodel.cn/api/paas/v4/chat/completions'),
      apiKey: getEnvVar('GLM_API_KEY', ''),
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
      apiEndpoint: getEnvVar('OPENAI_API_ENDPOINT', 'https://api.openai.com/v1/chat/completions'),
      apiKey: getEnvVar('OPENAI_API_KEY', ''),
      maxTokens: 4000,
      supportsImage: true,
      supportsVideo: false,
      supportsAudio: false
    },
    'claude-3-opus': {
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      apiEndpoint: getEnvVar('ANTHROPIC_API_ENDPOINT', 'https://api.anthropic.com/v1/messages'),
      apiKey: getEnvVar('ANTHROPIC_API_KEY', ''),
      maxTokens: 4000,
      supportsImage: true,
      supportsVideo: false,
      supportsAudio: false
    }
  },
  // 语音处理模型配置
  voiceModels: {
    'whisper-1': {
      name: 'Whisper-1',
      provider: 'openai',
      apiEndpoint: getEnvVar('WHISPER_API_ENDPOINT', 'https://api.openai.com/v1/audio/transcriptions'),
      apiKey: getEnvVar('WHISPER_API_KEY', ''),
      supportsTranscription: true,
      supportsTranslation: true,
      maxFileSize: 25 * 1024 * 1024 // 25MB
    },
    'tts-1': {
      name: 'TTS-1',
      provider: 'openai',
      apiEndpoint: getEnvVar('TTS_API_ENDPOINT', 'https://api.openai.com/v1/audio/speech'),
      apiKey: getEnvVar('TTS_API_KEY', ''),
      supportsSpeech: true,
      voices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
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
    console.error('❌ 缺少必需的环境变量:')
    missingVars.forEach(varName => {
      console.error(`  - ${varName}`)
    })
    console.error('\n请参考 docs/环境配置管理规范.md 配置环境变量')
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }

  // 验证配置完整性
  try {
    // 测试数据库配置
    if (!appConfig.database.host || !appConfig.database.database) {
      throw new Error('Database configuration is incomplete')
    }

    // 测试API配置
    if (!appConfig.api.baseUrl) {
      throw new Error('API configuration is incomplete')
    }

    console.log('✅ 配置验证通过')
  } catch (error) {
    console.error('❌ 配置验证失败:', error)
    throw error
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
