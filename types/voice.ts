export interface VoiceRecordingState {
  isRecording: boolean
  duration: number
  error: string | null
  stream: MediaStream | null
}

export interface VoiceConfig {
  enabled: boolean
  maxDuration: number
  sampleRate: number
  language: string
}

export const VOICE_CONSTANTS = {
  DEFAULT_MAX_DURATION: 60000, // 示例值 (60秒)
  DEFAULT_SAMPLE_RATE: 16000,
  // ... 其他常量
}; 