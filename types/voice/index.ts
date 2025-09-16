/**
 * 语音功能类型定义
 * 包含ASR、TTS、配置等相关类型
 */

// 语音录制状态
export interface VoiceRecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  stream: MediaStream | null;
  duration: number;
  audioBlob: Blob | null;
}

// 语音播放状态
export interface VoicePlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  error: string | null;
}

// 语音识别结果
export interface VoiceRecognitionResult {
  text: string;
  confidence: number;
  language: string;
  duration: number;
  timestamp: Date;
  // 兼容使用场景：某些逻辑会读取识别到的音频Blob
  audioBlob?: Blob;
}

// 语音合成选项
export interface TTSOptions {
  voice?: string;
  speed?: number;
  volume?: number;
  language?: string;
  provider?: 'web' | 'aliyun' | 'baidu' | 'xunfei';
  pitch?: number;
  rate?: number;
}

// 语音配置
export interface VoiceConfig {
  id: string;
  userId: string;
  asrProvider: 'web' | 'aliyun' | 'baidu' | 'xunfei' | 'tencent';
  ttsProvider: 'web' | 'aliyun' | 'baidu' | 'xunfei' | 'tencent';
  voice: string;
  speed: number;
  volume: number;
  language: string;
  autoPlay: boolean;
  maxDuration: number;
  sampleRate: number;
  createdAt: Date;
  updatedAt: Date;
}

// 语音服务提供商配置
export interface VoiceProviderConfig {
  name: string;
  type: 'asr' | 'tts' | 'both';
  apiKey: string;
  apiUrl: string;
  region?: string;
  supportedLanguages: string[];
  maxFileSize: number;
  maxDuration: number;
}

// 语音识别请求
export interface VoiceRecognitionRequest {
  audio: Blob;
  language?: string;
  provider?: string;
  options?: {
    enableAutomaticPunctuation?: boolean;
    enableSpeakerDiarization?: boolean;
    maxAlternatives?: number;
  };
}

// 语音合成请求
export interface VoiceSynthesisRequest {
  text: string;
  options: TTSOptions;
  provider?: string;
}

// 语音识别响应
export interface VoiceRecognitionResponse {
  success: boolean;
  result?: VoiceRecognitionResult;
  error?: string;
  provider: string;
  processingTime: number;
}

// 语音合成响应
export interface VoiceSynthesisResponse {
  success: boolean;
  audioUrl?: string;
  audioBlob?: Blob;
  error?: string;
  provider: string;
  processingTime: number;
}

// 语音错误类型（采用字符串字面量联合，便于与现有代码字符串常量对齐）
export type VoiceErrorType =
  | 'RECORDING_FAILED'
  | 'RECOGNITION_FAILED'
  | 'SYNTHESIS_FAILED'
  | 'PERMISSION_DENIED'
  | 'NOT_SUPPORTED'
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'CONFIG_ERROR'
  | 'STORAGE_ERROR'
  | 'TRANSCRIPTION_FAILED'
  | 'UNKNOWN_ERROR';

// 语音错误
export interface VoiceError {
  type: VoiceErrorType;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

// 语音常量
export const VOICE_CONSTANTS = {
  DEFAULT_MAX_DURATION: 60000, // 60秒
  DEFAULT_SAMPLE_RATE: 16000,
  DEFAULT_LANGUAGE: 'zh-CN',
  DEFAULT_VOICE: 'default',
  DEFAULT_SPEED: 1.0,
  DEFAULT_VOLUME: 1.0,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_AUDIO_FORMATS: [
    'audio/wav',
    'audio/mp3',
    'audio/webm',
    'audio/ogg',
  ],
  SUPPORTED_LANGUAGES: ['zh-CN', 'en-US', 'ja-JP', 'ko-KR'],
} as const;

// 语音错误代码
export const VOICE_ERROR_CODES = {
  RECORDING_FAILED: 'RECORDING_FAILED',
  RECOGNITION_FAILED: 'RECOGNITION_FAILED',
  SYNTHESIS_FAILED: 'SYNTHESIS_FAILED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  CONFIG_ERROR: 'CONFIG_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  TRANSCRIPTION_FAILED: 'TRANSCRIPTION_FAILED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// 语音状态类型
export type VoiceState =
  | 'idle'
  | 'recording'
  | 'processing'
  | 'playing'
  | 'paused'
  | 'error';

// 语音事件类型
export type VoiceEventType =
  // 当前实现使用的事件名
  | 'recordingStart'
  | 'recordingStop'
  | 'recordingError'
  | 'playbackStart'
  | 'playbackEnd'
  | 'playbackError'
  // 兼容旧事件名，避免外部引用报错
  | 'recordingStarted'
  | 'recordingStopped'
  | 'recognitionStarted'
  | 'recognitionCompleted'
  | 'recognitionError'
  | 'synthesisStarted'
  | 'synthesisCompleted'
  | 'synthesisError'
  | 'playbackStarted'
  | 'playbackPaused'
  | 'playbackResumed'
  | 'playbackStopped';

// 语音事件
export interface VoiceEvent {
  type: VoiceEventType;
  data?: Record<string, unknown>;
  timestamp: Date;
}

// 语音事件监听器
export type VoiceEventListener = (event: VoiceEvent) => void;

// 语音服务接口
export interface IVoiceService {
  // ASR方法
  recognizeSpeech(
    request: VoiceRecognitionRequest
  ): Promise<VoiceRecognitionResponse>;
  startRealTimeRecognition(options?: { language?: string }): Promise<void>;
  stopRealTimeRecognition(): Promise<VoiceRecognitionResult>;

  // TTS方法
  synthesizeSpeech(
    request: VoiceSynthesisRequest
  ): Promise<VoiceSynthesisResponse>;
  playAudio(audioBlob: Blob): Promise<void>;
  stopAudio(): void;
  pauseAudio(): void;
  resumeAudio(): void;

  // 配置方法
  getConfig(): Promise<VoiceConfig>;
  updateConfig(config: Partial<VoiceConfig>): Promise<void>;

  // 事件监听
  addEventListener(type: VoiceEventType, listener: VoiceEventListener): void;
  removeEventListener(type: VoiceEventType, listener: VoiceEventListener): void;

  // 状态查询
  getRecordingState(): VoiceRecordingState;
  getPlaybackState(): VoicePlaybackState;
  isSupported(): boolean;
}

// 语音存储接口
export interface IVoiceStorage {
  saveAudio(
    audioBlob: Blob,
    metadata: Record<string, unknown>
  ): Promise<string>;
  getAudio(id: string): Promise<Blob | null>;
  deleteAudio(id: string): Promise<void>;
  saveConfig(config: VoiceConfig): Promise<void>;
  getConfig(userId: string): Promise<VoiceConfig | null>;
  deleteConfig(userId: string): Promise<void>;
}

// 语音状态管理接口
export interface IVoiceStore {
  // 状态
  recordingState: VoiceRecordingState;
  playbackState: VoicePlaybackState;
  config: VoiceConfig | null;
  error: VoiceError | null;

  // 动作
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  startPlayback: (audioBlob: Blob) => Promise<void>;
  pausePlayback: () => void;
  resumePlayback: () => void;
  stopPlayback: () => void;
  updateConfig: (config: Partial<VoiceConfig>) => Promise<void>;
  clearError: () => void;

  // 订阅
  subscribe: (listener: () => void) => () => void;
}
