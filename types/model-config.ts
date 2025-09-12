/**
 * 模型配置相关类型定义
 * 用于统一管理AI模型配置
 */

// 模型类型枚举
export type ModelType = 'openai' | 'fastgpt' | 'local' | 'custom' | 'azure' | 'anthropic'

// 模型状态枚举
export type ModelStatus = 'active' | 'inactive' | 'deprecated' | 'testing'

// 模型能力类型
export type CapabilityType = 'text' | 'image' | 'audio' | 'multimodal' | 'code' | 'function'

// 模型能力配置
export interface ModelCapability {
  type: CapabilityType
  supported: boolean
  maxTokens?: number
  maxImages?: number
  maxAudioDuration?: number
  maxFileSize?: number
  supportedFormats?: string[]
  description?: string
}

// 模型参数配置
export interface ModelParameters {
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  stopSequences: string[]
  customParameters: Record<string, any>
  timeout?: number
  retryCount?: number
}

// 模型元数据
export interface ModelMetadata {
  description: string
  tags: string[]
  category: string
  costPerToken: number
  latency: number
  accuracy: number
  lastUsed?: Date
  usageCount: number
  version: string
  releaseDate?: Date
  documentation?: string
  examples?: string[]
}

// 模型配置主接口
export interface ModelConfig {
  id: string
  name: string
  type: ModelType
  provider: string
  version: string
  status: ModelStatus
  capabilities: ModelCapability[]
  parameters: ModelParameters
  metadata: ModelMetadata
  apiKey?: string
  apiEndpoint?: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
}

// 模型使用统计
export interface ModelUsageStats {
  id: string
  modelId: string
  usageCount: number
  totalTokens: number
  totalCost: number
  avgLatency: number
  errorCount: number
  successRate: number
  date: Date
  createdAt: Date
}

// 模型测试结果
export interface ModelTestResult {
  id: string
  modelId: string
  testType: 'performance' | 'accuracy' | 'capability'
  result: 'pass' | 'fail' | 'warning'
  score: number
  details: string
  testData: any
  createdAt: Date
}

// 模型配置表单数据
export interface ModelConfigFormData {
  name: string
  type: ModelType
  provider: string
  version: string
  status: ModelStatus
  capabilities: ModelCapability[]
  parameters: ModelParameters
  metadata: Omit<ModelMetadata, 'lastUsed' | 'usageCount'>
  apiKey?: string
  apiEndpoint?: string
  isDefault: boolean
}

// 模型配置查询参数
export interface ModelConfigQuery {
  search?: string
  type?: ModelType
  status?: ModelStatus
  provider?: string
  category?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'usageCount'
  sortOrder?: 'asc' | 'desc'
}

// 模型配置响应
export interface ModelConfigResponse {
  models: ModelConfig[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 模型性能指标
export interface ModelPerformanceMetrics {
  modelId: string
  avgResponseTime: number
  successRate: number
  errorRate: number
  totalRequests: number
  totalTokens: number
  totalCost: number
  last24Hours: {
    requests: number
    tokens: number
    cost: number
    avgResponseTime: number
  }
  last7Days: {
    requests: number
    tokens: number
    cost: number
    avgResponseTime: number
  }
  last30Days: {
    requests: number
    tokens: number
    cost: number
    avgResponseTime: number
  }
}

// 模型配置操作结果
export interface ModelConfigOperationResult {
  success: boolean
  message: string
  data?: ModelConfig
  error?: string
}

// 模型配置验证错误
export interface ModelConfigValidationError {
  field: string
  message: string
  value?: any
}

// 模型配置导入/导出
export interface ModelConfigImportExport {
  version: string
  timestamp: Date
  models: ModelConfig[]
  metadata: {
    exportedBy: string
    totalModels: number
    description?: string
  }
}
