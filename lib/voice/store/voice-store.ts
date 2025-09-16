/**
 * 语音状态管理
 * 使用Zustand管理语音交互状态
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  VoiceRecordingState,
  VoicePlaybackState,
  VoiceConfig,
  VoiceError,
  VoiceRecognitionRequest,
  VoiceSynthesisRequest,
  VoiceRecognitionResponse,
  VoiceSynthesisResponse,
  VOICE_CONSTANTS,
  VoiceRecognitionResult,
} from '@/types/voice';
import { VoiceService } from '../services/voice-service';
import { VoiceStorage } from '../storage/voice-storage';

interface VoiceStoreState {
  // 状态
  recordingState: VoiceRecordingState;
  playbackState: VoicePlaybackState;
  config: VoiceConfig | null;
  error: VoiceError | null;
  isInitialized: boolean;

  // 服务实例
  voiceService: VoiceService | null;
  voiceStorage: VoiceStorage | null;

  // 动作
  initialize: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  startPlayback: (audioBlob: Blob) => Promise<void>;
  pausePlayback: () => void;
  resumePlayback: () => void;
  stopPlayback: () => void;
  updateConfig: (config: Partial<VoiceConfig>) => Promise<void>;
  clearError: () => void;

  // 语音识别
  recognizeSpeech: (
    request: VoiceRecognitionRequest
  ) => Promise<VoiceRecognitionResponse>;
  startRealTimeRecognition: (options?: { language?: string }) => Promise<void>;
  stopRealTimeRecognition: () => Promise<VoiceRecognitionResult>;

  // 语音合成
  synthesizeSpeech: (
    request: VoiceSynthesisRequest
  ) => Promise<VoiceSynthesisResponse>;

  // 配置管理
  loadConfig: (userId: string) => Promise<void>;
  saveConfig: (userId: string) => Promise<void>;

  // 订阅
  subscribe: (listener: () => void) => () => void;
}

export const useVoiceStore = create<VoiceStoreState>()(
  subscribeWithSelector((set, get) => ({
    // 初始状态
    recordingState: {
      isRecording: false,
      isProcessing: false,
      error: null,
      stream: null,
      duration: 0,
      audioBlob: null,
    },
    playbackState: {
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      duration: 0,
      error: null,
    },
    config: null,
    error: null,
    isInitialized: false,
    voiceService: null,
    voiceStorage: null,

    // 初始化
    initialize: async () => {
      try {
        const voiceService = new VoiceService();
        const voiceStorage = new VoiceStorage();

        // 设置事件监听
        voiceService.addEventListener('recordingStart', () => {
          set(state => ({
            recordingState: {
              ...state.recordingState,
              isRecording: true,
              error: null,
            },
          }));
        });

        voiceService.addEventListener('recordingStop', () => {
          set(state => ({
            recordingState: { ...state.recordingState, isRecording: false },
          }));
        });

        voiceService.addEventListener('recordingError', event => {
          set(state => ({
            recordingState: {
              ...state.recordingState,
              error: (event as any).data?.error?.message || '录音失败',
            },
          }));
        });

        voiceService.addEventListener('playbackStart', () => {
          set(state => ({
            playbackState: {
              ...state.playbackState,
              isPlaying: true,
              isPaused: false,
              error: null,
            },
          }));
        });

        voiceService.addEventListener('playbackEnd', () => {
          set(state => ({
            playbackState: {
              ...state.playbackState,
              isPlaying: false,
              isPaused: false,
            },
          }));
        });

        voiceService.addEventListener('playbackError', event => {
          set(state => ({
            playbackState: {
              ...state.playbackState,
              error: (event as any).data?.error?.message || '播放失败',
            },
          }));
        });

        set({
          voiceService,
          voiceStorage,
          isInitialized: true,
          error: null,
        });
      } catch (error) {
        const voiceError: VoiceError = {
          type: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : '初始化失败',
          timestamp: new Date(),
        };
        set({ error: voiceError, isInitialized: false });
      }
    },

    // 开始录音
    startRecording: async () => {
      const { voiceService, recordingState } = get();
      if (!voiceService) {
        throw new Error('语音服务未初始化');
      }

      if (recordingState.isRecording) {
        return;
      }

      try {
        set(state => ({
          recordingState: {
            ...state.recordingState,
            isProcessing: true,
            error: null,
          },
        }));

        await voiceService.startRealTimeRecognition();
      } catch (error) {
        const voiceError: VoiceError = {
          type: 'RECORDING_FAILED',
          message: error instanceof Error ? error.message : '开始录音失败',
          timestamp: new Date(),
        };
        set({ error: voiceError });
      }
    },

    // 停止录音
    stopRecording: async () => {
      const { voiceService } = get();
      if (!voiceService) {
        throw new Error('语音服务未初始化');
      }

      try {
        set(state => ({
          recordingState: { ...state.recordingState, isProcessing: true },
        }));

        const result = await voiceService.stopRealTimeRecognition();

        set(state => ({
          recordingState: {
            ...state.recordingState,
            isProcessing: false,
            audioBlob: (result as any).audioBlob || null,
            duration: result.duration || 0,
          },
        }));
      } catch (error) {
        const voiceError: VoiceError = {
          type: 'RECORDING_FAILED',
          message: error instanceof Error ? error.message : '停止录音失败',
          timestamp: new Date(),
        };
        set({ error: voiceError });
      }
    },

    // 开始播放
    startPlayback: async (audioBlob: Blob) => {
      const { voiceService } = get();
      if (!voiceService) {
        throw new Error('语音服务未初始化');
      }

      try {
        await voiceService.playAudio(audioBlob);
      } catch (error) {
        const voiceError: VoiceError = {
          type: 'TRANSCRIPTION_FAILED',
          message: error instanceof Error ? error.message : '播放失败',
          timestamp: new Date(),
        };
        set({ error: voiceError });
      }
    },

    // 暂停播放
    pausePlayback: () => {
      const { voiceService } = get();
      if (!voiceService) {
        return;
      }

      voiceService.pauseAudio();
      set(state => ({
        playbackState: { ...state.playbackState, isPaused: true },
      }));
    },

    // 恢复播放
    resumePlayback: () => {
      const { voiceService } = get();
      if (!voiceService) {
        return;
      }

      voiceService.resumeAudio();
      set(state => ({
        playbackState: { ...state.playbackState, isPaused: false },
      }));
    },

    // 停止播放
    stopPlayback: () => {
      const { voiceService } = get();
      if (!voiceService) {
        return;
      }

      voiceService.stopAudio();
      set(state => ({
        playbackState: {
          ...state.playbackState,
          isPlaying: false,
          isPaused: false,
        },
      }));
    },

    // 更新配置
    updateConfig: async (newConfig: Partial<VoiceConfig>) => {
      const { config } = get();
      if (!config) {
        return;
      }

      const updatedConfig = { ...config, ...newConfig, updatedAt: new Date() };
      set({ config: updatedConfig });
    },

    // 清除错误
    clearError: () => {
      set({ error: null });
    },

    // 语音识别
    recognizeSpeech: async (request: VoiceRecognitionRequest) => {
      const { voiceService } = get();
      if (!voiceService) {
        throw new Error('语音服务未初始化');
      }

      try {
        set(state => ({
          recordingState: {
            ...state.recordingState,
            isProcessing: true,
            error: null,
          },
        }));

        const response = await voiceService.recognizeSpeech(request);

        set(state => ({
          recordingState: { ...state.recordingState, isProcessing: false },
        }));

        return response;
      } catch (error) {
        const voiceError: VoiceError = {
          type: 'TRANSCRIPTION_FAILED',
          message: error instanceof Error ? error.message : '语音识别失败',
          timestamp: new Date(),
        };
        set({ error: voiceError });
        throw error;
      }
    },

    // 开始实时语音识别
    startRealTimeRecognition: async (options?: { language?: string }) => {
      const { voiceService } = get();
      if (!voiceService) {
        throw new Error('语音服务未初始化');
      }

      await voiceService.startRealTimeRecognition(options);
    },

    // 停止实时语音识别
    stopRealTimeRecognition: async () => {
      const { voiceService } = get();
      if (!voiceService) {
        throw new Error('语音服务未初始化');
      }

      return await voiceService.stopRealTimeRecognition();
    },

    // 语音合成
    synthesizeSpeech: async (request: VoiceSynthesisRequest) => {
      const { voiceService } = get();
      if (!voiceService) {
        throw new Error('语音服务未初始化');
      }

      try {
        const response = await voiceService.synthesizeSpeech(request);
        return response;
      } catch (error) {
        const voiceError: VoiceError = {
          type: 'TRANSCRIPTION_FAILED',
          message: error instanceof Error ? error.message : '语音合成失败',
          timestamp: new Date(),
        };
        set({ error: voiceError });
        throw error;
      }
    },

    // 加载配置
    loadConfig: async (userId: string) => {
      const { voiceStorage } = get();
      if (!voiceStorage) {
        return;
      }

      try {
        const config = await voiceStorage.getConfig(userId);
        if (config) {
          set({ config });
        } else {
          // 创建默认配置
          const defaultConfig: VoiceConfig = {
            id: `config_${userId}`,
            userId,
            asrProvider: 'aliyun',
            ttsProvider: 'aliyun',
            voice: VOICE_CONSTANTS.DEFAULT_VOICE,
            speed: VOICE_CONSTANTS.DEFAULT_SPEED,
            volume: VOICE_CONSTANTS.DEFAULT_VOLUME,
            language: VOICE_CONSTANTS.DEFAULT_LANGUAGE,
            autoPlay: true,
            maxDuration: VOICE_CONSTANTS.DEFAULT_MAX_DURATION,
            sampleRate: VOICE_CONSTANTS.DEFAULT_SAMPLE_RATE,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          set({ config: defaultConfig });
        }
      } catch (error) {
        const voiceError: VoiceError = {
          type: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : '加载配置失败',
          timestamp: new Date(),
        };
        set({ error: voiceError });
      }
    },

    // 保存配置
    saveConfig: async (_userId: string) => {
      const { voiceStorage, config } = get();
      if (!voiceStorage || !config) {
        return;
      }

      try {
        await voiceStorage.saveConfig(config);
      } catch (error) {
        const voiceError: VoiceError = {
          type: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : '保存配置失败',
          timestamp: new Date(),
        };
        set({ error: voiceError });
      }
    },

    // 订阅
    subscribe: (listener: () => void) => {
      return get().subscribe(listener);
    },
  }))
);

// 导出类型
export type { VoiceStoreState };
