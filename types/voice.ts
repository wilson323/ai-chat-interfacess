export interface VoiceRecordingState {
  isRecording: boolean;
  duration: number;
  error: string | null;
  stream: MediaStream | null;
}

export interface VoiceConfig {
  enabled: boolean;
  maxDuration: number;
  sampleRate: number;
  language: string;
}

export const VOICE_CONSTANTS = {
  DEFAULT_MAX_DURATION: 60000, // 示例值 (60秒)
  DEFAULT_SAMPLE_RATE: 16000,
  // ... 其他常量
};

export const VOICE_ERROR_CODES = {
  RECORDING_FAILED: 'RECORDING_FAILED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  DEVICE_NOT_FOUND: 'DEVICE_NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  INVALID_AUDIO: 'INVALID_AUDIO',
  TRANSCRIPTION_FAILED: 'TRANSCRIPTION_FAILED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;
