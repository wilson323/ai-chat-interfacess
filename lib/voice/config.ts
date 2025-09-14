/**
 * 语音功能配置管理
 * 基于 Next.js 15 最佳实践
 */

import { VoiceConfig, VOICE_CONSTANTS } from '@/types/voice';

// 检查 VOICE_CONSTANTS 是否已定义
if (VOICE_CONSTANTS === undefined) {
  console.error(
    'CRITICAL ERROR: VOICE_CONSTANTS is undefined in lib/voice/config.ts at the time of defining voiceConfigDefaults. ' +
      'This is likely due to a circular dependency or an import issue. ' +
      'Please check the import chain. Falling back to hardcoded defaults for now.'
  );
}

// 默认配置
const DEFAULT_CONFIG: VoiceConfig = {
  apiUrl:
    process.env.NEXT_PUBLIC_OPENAI_AUDIO_API_URL ||
    'http://112.48.22.44:38082/v1/audio/transcriptions',
  apiKey: process.env.NEXT_PUBLIC_OPENAI_AUDIO_API_KEY || 'sk-xx',
  maxDuration: VOICE_CONSTANTS?.DEFAULT_MAX_DURATION ?? 60000,
  sampleRate: VOICE_CONSTANTS?.DEFAULT_SAMPLE_RATE ?? 16000,
  language: VOICE_CONSTANTS?.DEFAULT_LANGUAGE || 'en-US',
  enabled: true,
  autoStart: false,
};

// 本地存储键名
const STORAGE_KEY = 'voice-config';

/**
 * 获取语音配置
 */
export function getVoiceConfig(userConfig?: Partial<VoiceConfig>): VoiceConfig {
  if (VOICE_CONSTANTS === undefined) {
    // 这里的日志可能重复，但为了确保覆盖所有使用场景
    console.warn(
      'WARNING: VOICE_CONSTANTS is undefined when calling getVoiceConfig. ' +
        'Using fallback defaults for maxDuration and sampleRate.'
    );
  }
  const defaults = {
    enabled: true,
    autoStart: false,
    maxDuration: VOICE_CONSTANTS?.DEFAULT_MAX_DURATION ?? 60000,
    sampleRate: VOICE_CONSTANTS?.DEFAULT_SAMPLE_RATE ?? 16000,
    // ... 其他默认值
  };
  return {
    ...defaults,
    ...userConfig,
  };
}

/**
 * 保存语音配置
 */
export function saveVoiceConfig(config: Partial<VoiceConfig>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const currentConfig = getVoiceConfig();
    const newConfig = { ...currentConfig, ...config };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  } catch (error) {
    console.warn('Failed to save voice config to localStorage:', error);
  }
}

/**
 * 重置语音配置
 */
export function resetVoiceConfig(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to reset voice config:', error);
  }
}

/**
 * 验证语音配置
 */
export function validateVoiceConfig(config: Partial<VoiceConfig>): string[] {
  const errors: string[] = [];

  if (config.apiUrl && !isValidUrl(config.apiUrl)) {
    errors.push('API URL 格式无效');
  }

  if (config.apiKey && config.apiKey.length < 3) {
    errors.push('API 密钥长度不足');
  }

  if (
    config.maxDuration &&
    (config.maxDuration < 1 || config.maxDuration > 300)
  ) {
    errors.push('录音时长必须在 1-300 秒之间');
  }

  if (
    config.sampleRate &&
    ![8000, 16000, 22050, 44100, 48000].includes(config.sampleRate)
  ) {
    errors.push('采样率必须是标准值之一');
  }

  if (config.language && !/^[a-z]{2}(-[A-Z]{2})?$/.test(config.language)) {
    errors.push('语言代码格式无效');
  }

  return errors;
}

/**
 * 检查配置是否完整
 */
export function isConfigComplete(config: VoiceConfig): boolean {
  return !!(
    config.apiUrl &&
    config.apiKey &&
    config.apiKey !== 'sk-xx' &&
    config.maxDuration > 0 &&
    config.sampleRate > 0 &&
    config.language
  );
}

/**
 * 获取配置状态
 */
export function getConfigStatus(config: VoiceConfig): {
  isComplete: boolean;
  isEnabled: boolean;
  errors: string[];
} {
  const errors = validateVoiceConfig(config);
  const isComplete = isConfigComplete(config);

  return {
    isComplete,
    isEnabled: config.enabled && isComplete,
    errors,
  };
}

/**
 * 检查 URL 是否有效
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取环境变量配置
 */
export function getEnvConfig(): Partial<VoiceConfig> {
  return {
    apiUrl: process.env.NEXT_PUBLIC_OPENAI_AUDIO_API_URL,
    apiKey: process.env.NEXT_PUBLIC_OPENAI_AUDIO_API_KEY,
  };
}

/**
 * 合并配置
 */
export function mergeConfigs(...configs: Partial<VoiceConfig>[]): VoiceConfig {
  return configs.reduce(
    (merged, config) => ({ ...merged, ...config }),
    DEFAULT_CONFIG
  );
}

/**
 * 检查浏览器支持
 */
export function checkBrowserSupport(): {
  isSupported: boolean;
  missingFeatures: string[];
} {
  const missingFeatures: string[] = [];

  if (typeof window === 'undefined') {
    return { isSupported: false, missingFeatures: ['Window object'] };
  }

  if (!navigator.mediaDevices) {
    missingFeatures.push('MediaDevices API');
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    missingFeatures.push('getUserMedia API');
  }

  if (!window.MediaRecorder) {
    missingFeatures.push('MediaRecorder API');
  }

  if (!window.AudioContext && !(window as any).webkitAudioContext) {
    missingFeatures.push('AudioContext API');
  }

  return {
    isSupported: missingFeatures.length === 0,
    missingFeatures,
  };
}

/**
 * 获取支持的音频格式
 */
export function getSupportedFormats(): string[] {
  if (typeof window === 'undefined' || !window.MediaRecorder) {
    return [];
  }

  const formats = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/wav',
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ];

  return formats.filter(format => MediaRecorder.isTypeSupported(format));
}

/**
 * 获取最佳音频格式
 */
export function getBestAudioFormat(): string {
  const supportedFormats = getSupportedFormats();

  // 优先级顺序：Opus > WebM > MP4 > WAV > OGG
  const preferredFormats = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/wav',
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ];

  for (const format of preferredFormats) {
    if (supportedFormats.includes(format)) {
      return format;
    }
  }

  return supportedFormats[0] || 'audio/wav';
}

/**
 * 获取录音选项
 */
export function getRecordingOptions(config: VoiceConfig): MediaRecorderOptions {
  const format = getBestAudioFormat();

  const options: MediaRecorderOptions = {
    mimeType: format,
  };

  // 如果支持比特率设置
  if (format.includes('opus') || format.includes('webm')) {
    options.audioBitsPerSecond = 128000; // 128kbps
  }

  return options;
}

/**
 * 导出配置为 JSON
 */
export function exportConfig(config: VoiceConfig): string {
  const exportData = {
    ...config,
    // 不导出敏感信息
    apiKey: config.apiKey ? '***' : '',
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * 从 JSON 导入配置
 */
export function importConfig(jsonString: string): VoiceConfig {
  try {
    const imported = JSON.parse(jsonString);
    const errors = validateVoiceConfig(imported);

    if (errors.length > 0) {
      throw new Error(`配置验证失败: ${errors.join(', ')}`);
    }

    return { ...DEFAULT_CONFIG, ...imported };
  } catch (error) {
    throw new Error(
      `配置导入失败: ${error instanceof Error ? error.message : '未知错误'}`
    );
  }
}
