export interface CadAnalyzerModelConfig {
  name: string
  apiKey: string
  backupKeys?: string[]
}

export interface CadAnalyzerConfig {
  enabled: boolean
  models: CadAnalyzerModelConfig[]
  defaultModel: string
  maxFileSizeMB: number
  supportedFormats: string[]
  analysisParams: {
    precision: string
    timeoutSec: number
    maxPages: number
  }
  historyRetentionDays: number
  description?: string
} 