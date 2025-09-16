/**
 * 语音服务测试用例
 * 测试语音识别和合成功能
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { VoiceService } from '@/lib/voice/services/voice-service';
import { VoiceRecognitionRequest, VoiceSynthesisRequest } from '@/types/voice';
import '@testing-library/jest-dom';

// Mock Web Speech API
const mockRecognition = {
  continuous: false,
  interimResults: false,
  lang: 'zh-CN',
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  onstart: null as any,
  onend: null as any,
  onresult: null as any,
  onerror: null as any,
};

const mockSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn(() => [
    { name: 'Chinese Female', lang: 'zh-CN', voiceURI: 'chinese-female' },
    { name: 'English Male', lang: 'en-US', voiceURI: 'english-male' },
  ]),
  onvoiceschanged: null as any,
};

// Mock global objects
Object.defineProperty(window, 'SpeechRecognition', {
  value: jest.fn(() => mockRecognition),
  writable: true,
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: jest.fn(() => mockRecognition),
  writable: true,
});

Object.defineProperty(window, 'speechSynthesis', {
  value: mockSynthesis,
  writable: true,
});

// Mock Audio
const mockAudio = {
  play: jest.fn(async () => undefined),
  pause: jest.fn(),
  load: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  currentTime: 0,
  duration: 0,
  volume: 1,
  muted: false,
};

Object.defineProperty(window, 'Audio', {
  value: jest.fn(() => mockAudio as any),
  writable: true,
});

describe('VoiceService', () => {
  let voiceService: VoiceService;

  beforeEach(() => {
    voiceService = new VoiceService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('语音识别', () => {
    it('应该能够识别语音', async () => {
      // 创建模拟音频Blob
      const audioBlob = new Blob(['audio data'], { type: 'audio/wav' });
      const request: any = {
        audio: audioBlob,
        language: 'zh-CN',
        provider: 'web',
      } satisfies Partial<VoiceRecognitionRequest> as any;

      // 模拟Web Speech API识别结果
      (mockRecognition as any).onresult = jest.fn(() => {
        const result = {
          results: [
            {
              [0]: {
                transcript: '你好世界',
                confidence: 0.95,
              },
              isFinal: true,
            },
          ],
          resultIndex: 0,
        };
        return result;
      });

      const response: any = await voiceService.recognizeSpeech(request as VoiceRecognitionRequest);

      expect(response.success).toBe(true);
      expect(response.result?.text).toBe('你好世界');
      expect(response.provider).toBe('web');
    });

    it('应该处理识别错误', async () => {
      const audioBlob = new Blob(['audio data'], { type: 'audio/wav' });
      const request: any = {
        audio: audioBlob,
        language: 'zh-CN',
        provider: 'web',
      };

      // Mock识别错误
      (mockRecognition as any).onerror = jest.fn(() => {
        throw new Error('识别失败');
      });

      const response: any = await voiceService.recognizeSpeech(request as VoiceRecognitionRequest);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });

    it('应该支持实时语音识别', async () => {
      const options = { language: 'zh-CN' };

      await voiceService.startRealTimeRecognition(options);

      expect(mockRecognition.start).toHaveBeenCalled();
    });

    it('应该能够停止实时语音识别', async () => {
      // Mock停止识别结果
      (mockRecognition as any).onend = jest.fn(() => {
        return {
          text: '实时识别结果',
          confidence: 0.9,
        };
      });

      await voiceService.stopRealTimeRecognition();

      expect(mockRecognition.stop).toHaveBeenCalled();
    });
  });

  describe('语音合成', () => {
    it('应该能够合成语音', async () => {
      const request: any = {
        text: '你好世界',
        options: {
          voice: 'chinese-female',
          speed: 1.0,
          volume: 1.0,
          language: 'zh-CN',
          provider: 'web',
        },
      } as VoiceSynthesisRequest as any;

      const response: any = await voiceService.synthesizeSpeech(request as VoiceSynthesisRequest);

      expect(response.success).toBe(true);
      expect(response.provider).toBe('web');
    });

    it('应该处理合成错误', async () => {
      const request: any = {
        text: '测试文本',
        options: {
          voice: 'invalid-voice',
          speed: 1.0,
          volume: 1.0,
          language: 'zh-CN',
          provider: 'web',
        },
      } as VoiceSynthesisRequest as any;

      // Mock合成错误
      (mockSynthesis as any).speak = jest.fn(() => {
        throw new Error('合成失败');
      });

      const response: any = await voiceService.synthesizeSpeech(request as VoiceSynthesisRequest);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });

    it('应该能够播放音频', async () => {
      const audioBlob = new Blob(['audio data'], { type: 'audio/mpeg' });

      await voiceService.playAudio(audioBlob);

      expect(mockAudio.play).toHaveBeenCalled();
    });

    it('应该能够暂停音频', () => {
      voiceService.pauseAudio();

      expect(mockAudio.pause).toHaveBeenCalled();
    });

    it('应该能够停止音频', () => {
      voiceService.stopAudio();

      expect(mockAudio.pause).toHaveBeenCalled();
    });
  });

  describe('配置管理', () => {
    it('应该能够获取配置', async () => {
      const config = await voiceService.getConfig();

      expect(config).toBeDefined();
    });

    it('应该能够更新配置', async () => {
      const newConfig = {
        asrProvider: 'aliyun' as const,
        ttsProvider: 'aliyun' as const,
        voice: 'female',
        speed: 1.2,
        volume: 0.8,
        language: 'zh-CN',
        autoPlay: true,
        maxDuration: 60000,
        sampleRate: 16000,
      };

      await voiceService.updateConfig(newConfig);

      const config = await voiceService.getConfig();
      expect(config.speed).toBe(1.2);
      expect(config.volume).toBe(0.8);
    });
  });

  describe('事件监听', () => {
    it('应该能够添加事件监听器', () => {
      const listener = jest.fn();

      voiceService.addEventListener('recordingStart', listener);

      // 触发事件
      voiceService.startRealTimeRecognition();

      expect(listener).toHaveBeenCalled();
    });

    it('应该能够移除事件监听器', () => {
      const listener = jest.fn();

      voiceService.addEventListener('recordingStart', listener);
      voiceService.removeEventListener('recordingStart', listener);

      // 触发事件
      voiceService.startRealTimeRecognition();

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('状态查询', () => {
    it('应该能够获取录音状态', () => {
      const state = voiceService.getRecordingState();

      expect(state).toBeDefined();
      expect(state.isRecording).toBe(false);
      expect(state.isProcessing).toBe(false);
    });

    it('应该能够获取播放状态', () => {
      const state = voiceService.getPlaybackState();

      expect(state).toBeDefined();
      expect(state.isPlaying).toBe(false);
      expect(state.isPaused).toBe(false);
    });

    it('应该能够检查浏览器支持', () => {
      const isSupported = voiceService.isSupported();

      expect(typeof isSupported).toBe('boolean');
    });
  });
});
