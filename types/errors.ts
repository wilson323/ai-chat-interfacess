// 定义语音相关的错误类型
export const VOICE_ERRORS = {
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
  TRANSCRIPTION_FAILED: 'TRANSCRIPTION_FAILED',
  RECORDING_FAILED: 'RECORDING_FAILED',
} as const;

export type VoiceErrorType = (typeof VOICE_ERRORS)[keyof typeof VOICE_ERRORS];

export interface VoiceError {
  type: VoiceErrorType;
  message: string;
  details?: any;
}
