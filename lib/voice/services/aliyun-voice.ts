/**
 * 阿里云语音服务实现
 * 作为主要方案，提供ASR和TTS功能
 */

import {
  VoiceRecognitionRequest,
  VoiceRecognitionResult,
  VoiceSynthesisRequest,
  VoiceError,
  VoiceErrorType,
} from '@/types/voice';

export class AliyunVoiceService {
  private accessKeyId: string;
  private accessKeySecret: string;
  private region: string;
  private asrEndpoint: string;
  private ttsEndpoint: string;

  constructor() {
    this.accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID || '';
    this.accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET || '';
    this.region = process.env.ALIYUN_REGION || 'cn-shanghai';
    this.asrEndpoint = `https://nls-meta.cn-${this.region}.aliyuncs.com`;
    this.ttsEndpoint = `https://nls-gateway.cn-${this.region}.aliyuncs.com`;
  }

  /**
   * 语音识别
   */
  async recognize(
    request: VoiceRecognitionRequest
  ): Promise<VoiceRecognitionResult> {
    try {
      const token = await this.getToken();
      const audioData = await this.audioBlobToArrayBuffer(request.audio);

      const response = await fetch(`${this.asrEndpoint}/stream/v1/asr`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/octet-stream',
          'X-NLS-Token': token,
        },
        body: audioData,
      });

      if (!response.ok) {
        throw new Error(
          `阿里云ASR请求失败: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      return {
        text: result.result || '',
        confidence: result.confidence || 0,
        language: request.language || 'zh-CN',
        duration: result.duration || 0,
        timestamp: new Date(),
      };
    } catch (error) {
      throw this.createVoiceError('TRANSCRIPTION_FAILED', error);
    }
  }

  /**
   * 语音合成
   */
  async synthesize(request: VoiceSynthesisRequest): Promise<Blob> {
    try {
      const token = await this.getToken();
      const text = request.text;
      const options = request.options;

      // 构建TTS请求参数
      const ttsParams = {
        text,
        voice: options.voice || 'xiaoyun',
        format: 'wav',
        sample_rate: 16000,
        volume: Math.round((options.volume || 1.0) * 100),
        speech_rate: Math.round((options.speed || 1.0) * 100),
        pitch_rate: Math.round((options.pitch || 1.0) * 100),
      };

      const response = await fetch(`${this.ttsEndpoint}/stream/v1/tts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-NLS-Token': token,
        },
        body: JSON.stringify(ttsParams),
      });

      if (!response.ok) {
        throw new Error(
          `阿里云TTS请求失败: ${response.status} ${response.statusText}`
        );
      }

      const audioBlob = await response.blob();
      return audioBlob;
    } catch (error) {
      throw this.createVoiceError('TRANSCRIPTION_FAILED', error);
    }
  }

  /**
   * 获取访问令牌
   */
  private async getToken(): Promise<string> {
    try {
      const response = await fetch('/api/voice/aliyun-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessKeyId: this.accessKeyId,
          accessKeySecret: this.accessKeySecret,
          region: this.region,
        }),
      });

      if (!response.ok) {
        throw new Error(`获取阿里云Token失败: ${response.status}`);
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      throw this.createVoiceError('NETWORK_ERROR', error);
    }
  }

  /**
   * 将Blob转换为ArrayBuffer
   */
  private async audioBlobToArrayBuffer(audioBlob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('音频文件读取失败'));
      reader.readAsArrayBuffer(audioBlob);
    });
  }

  /**
   * 检查配置是否完整
   */
  isConfigured(): boolean {
    return !!(this.accessKeyId && this.accessKeySecret);
  }

  /**
   * 创建语音错误
   */
  private createVoiceError(type: VoiceErrorType, error: unknown): VoiceError {
    const message = error instanceof Error ? error.message : String(error);
    return {
      type,
      message,
      timestamp: new Date(),
      details: error instanceof Error ? { stack: error.stack } : {},
    };
  }
}
