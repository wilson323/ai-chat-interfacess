/**
 * 语音功能相关类型定义
 * 基于 Next.js 15 + React 18 + TypeScript 5
 */

// 语音配置接口
export interface VoiceConfig {
  /** API 端点 URL */
  apiUrl: string
  /** API 密钥 */
  apiKey: string
  /** 最大录音时长（秒） */
  maxDuration: number
  /** 采样率 */
  sampleRate: number
  /** 语言代码 */
  language: string
  /** 是否启用语音功能 */
  enabled: boolean
}

// 语音录音状态
export interface VoiceRecordingState {
  /** 是否正在录音 */
  isRecording: boolean
  /** 是否正在处理（识别中） */
  isProcessing: boolean
  /** 录音时长（秒） */
  duration: number
  /** 音频音量级别 (0-1) */
  audioLevel: number
  /** 错误信息 */
  error: string | null
  /** 是否已准备就绪 */
  isReady: boolean
}

// 语音权限状态
export type VoicePermissionState = 'granted' | 'denied' | 'prompt' | 'unknown'

// 语音权限接口
export interface VoicePermission {
  /** 权限状态 */
  state: VoicePermissionState
  /** 浏览器是否支持语音功能 */
  isSupported: boolean
  /** 是否可以请求权限 */
  canRequest: boolean
}

// 语音识别结果
export interface VoiceTranscriptionResult {
  /** 识别的文本 */
  text: string
  /** 置信度 (0-1) */
  confidence: number
  /** 音频时长（秒） */
  duration: number
  /** 识别的语言 */
  language: string
  /** 时间戳 */
  timestamp: number
}

// 语音错误类型
export interface VoiceError {
  /** 错误代码 */
  code: string
  /** 错误消息 */
  message: string
  /** 解决建议 */
  suggestion?: string
  /** 错误详情 */
  details?: any
}

// 音频可视化数据
export interface AudioVisualizationData {
  /** 当前音量级别 (0-1) */
  audioLevel: number
  /** 波形数据数组 */
  waveformData: number[]
  /** 频谱数据 */
  frequencyData?: Uint8Array
}

// 语音组件属性
export interface VoiceInputProps {
  /** 识别结果回调 */
  onTranscript: (text: string) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义样式类名 */
  className?: string
  /** 占位符文本 */
  placeholder?: string
  /** 按钮大小 */
  size?: 'sm' | 'md' | 'lg'
  /** 按钮变体 */
  variant?: 'default' | 'minimal' | 'floating'
}

// 语音按钮属性
export interface VoiceButtonProps {
  /** 是否正在录音 */
  isRecording: boolean
  /** 是否正在处理 */
  isProcessing: boolean
  /** 是否启用 */
  isEnabled: boolean
  /** 点击回调 */
  onToggle: () => void
  /** 按钮大小 */
  size?: 'sm' | 'md' | 'lg'
  /** 按钮变体 */
  variant?: 'default' | 'minimal'
  /** 自定义样式类名 */
  className?: string
}

// 语音状态显示属性
export interface VoiceStatusProps {
  /** 是否正在录音 */
  isRecording: boolean
  /** 录音时长 */
  duration: number
  /** 音频级别 */
  audioLevel: number
  /** 错误信息 */
  error: string | null
  /** 最大录音时长 */
  maxDuration: number
}

// 音频波形属性
export interface VoiceWaveformProps {
  /** 音频级别 (0-1) */
  audioLevel: number
  /** 波形条数 */
  bars?: number
  /** 动画持续时间 */
  animationDuration?: number
  /** 自定义样式类名 */
  className?: string
}

// 语音权限组件属性
export interface VoicePermissionProps {
  /** 权限请求回调 */
  onRequest: () => void
  /** 权限状态 */
  permission: VoicePermission
  /** 自定义样式类名 */
  className?: string
}

// Hook 返回类型
export interface UseVoiceRecorderReturn {
  /** 录音状态 */
  state: VoiceRecordingState
  /** 开始录音 */
  startRecording: () => Promise<void>
  /** 停止录音 */
  stopRecording: () => Promise<Blob | null>
  /** 重置状态 */
  reset: () => void
}

export interface UseVoicePermissionReturn {
  /** 权限信息 */
  permission: VoicePermission
  /** 请求权限 */
  requestPermission: () => Promise<VoicePermissionState>
  /** 检查权限 */
  checkPermission: () => Promise<VoicePermissionState>
}

export interface UseAudioVisualizationReturn {
  /** 可视化数据 */
  data: AudioVisualizationData
  /** 是否活跃 */
  isActive: boolean
}

export interface UseVoiceConfigReturn {
  /** 配置信息 */
  config: VoiceConfig
  /** 更新配置 */
  updateConfig: (config: Partial<VoiceConfig>) => void
  /** 重置配置 */
  resetConfig: () => void
}

// API 响应类型
export interface VoiceTranscribeResponse {
  /** 识别成功 */
  success: boolean
  /** 识别结果 */
  result?: VoiceTranscriptionResult
  /** 错误信息 */
  error?: VoiceError
}

export interface VoiceConfigResponse {
  /** 配置信息 */
  config: VoiceConfig
  /** 支持的格式 */
  supportedFormats: string[]
  /** 服务状态 */
  status: 'online' | 'offline' | 'error'
}

// 常量定义
export const VOICE_CONSTANTS = {
  /** 默认最大录音时长（秒） */
  DEFAULT_MAX_DURATION: 60,
  /** 默认采样率 */
  DEFAULT_SAMPLE_RATE: 16000,
  /** 默认语言 */
  DEFAULT_LANGUAGE: 'zh',
  /** 支持的音频格式 */
  SUPPORTED_FORMATS: ['audio/wav', 'audio/webm', 'audio/mp4', 'audio/ogg'],
  /** 最大文件大小（字节） */
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB
  /** 请求超时时间（毫秒） */
  REQUEST_TIMEOUT: 30000, // 30秒
} as const

// 错误代码常量
export const VOICE_ERROR_CODES = {
  // 权限相关
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  PERMISSION_UNAVAILABLE: 'PERMISSION_UNAVAILABLE',
  
  // 设备相关
  DEVICE_NOT_FOUND: 'DEVICE_NOT_FOUND',
  DEVICE_NOT_READABLE: 'DEVICE_NOT_READABLE',
  DEVICE_IN_USE: 'DEVICE_IN_USE',
  
  // 浏览器支持
  BROWSER_NOT_SUPPORTED: 'BROWSER_NOT_SUPPORTED',
  MEDIA_RECORDER_NOT_SUPPORTED: 'MEDIA_RECORDER_NOT_SUPPORTED',
  
  // 网络相关
  NETWORK_ERROR: 'NETWORK_ERROR',
  REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
  
  // API 相关
  API_ERROR: 'API_ERROR',
  CONFIG_MISSING: 'CONFIG_MISSING',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  
  // 文件相关
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  NO_AUDIO_DATA: 'NO_AUDIO_DATA',
  
  // 其他
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

export type VoiceErrorCode = typeof VOICE_ERROR_CODES[keyof typeof VOICE_ERROR_CODES]
