/**
 * 百度语音服务实现
 * 作为备用方案
 */

import {
  VoiceRecognitionRequest,
  VoiceRecognitionResult,
  VoiceSynthesisRequest,
  VoiceError,
  VoiceErrorType,
} from '@/types/voice';

export class BaiduVoiceService {
  private apiKey: string;
  private secretKey: string;
  private asrEndpoint: string;
  private ttsEndpoint: string;

  constructor() {
    this.apiKey = process.env.BAIDU_API_KEY || '';
    this.secretKey = process.env.BAIDU_SECRET_KEY || '';
    this.asrEndpoint = 'https://vop.baidu.com/server_api';
    this.ttsEndpoint = 'https://tsn.baidu.com/text2audio';
  }

  /**
   * 语音识别
   */
  async recognize(
    request: VoiceRecognitionRequest
  ): Promise<VoiceRecognitionResult> {
    try {
      const token = await this.getAccessToken();
      const audioData = await this.audioBlobToBase64(request.audio);

      const response = await fetch(this.asrEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: 'wav',
          rate: 16000,
          channel: 1,
          cuid: 'ai-chat-interfaces',
          token,
          speech: audioData,
          len: audioData.length,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `百度ASR请求失败: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.err_no !== 0) {
        throw new Error(`百度ASR识别失败: ${result.err_msg}`);
      }

      return {
        text: result.result?.[0] || '',
        confidence: 0.8, // 百度API不返回置信度，使用默认值
        language: request.language || 'zh',
        duration: 0,
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
      const token = await this.getAccessToken();
      const text = request.text;
      const options = request.options;

      // 构建TTS请求参数
      const params = new URLSearchParams({
        tex: text,
        tok: token,
        cuid: 'ai-chat-interfaces',
        ctp: '1',
        lan: options.language || 'zh',
        spd: String(Math.round((options.speed || 1.0) * 5)), // 百度语速范围1-15
        pit: String(Math.round((options.pitch || 1.0) * 5)), // 百度音调范围1-15
        vol: String(Math.round((options.volume || 1.0) * 15)), // 百度音量范围1-15
        per: options.voice || '0', // 百度发音人
        aue: '3', // 输出格式：wav
      });

      const response = await fetch(`${this.ttsEndpoint}?${params}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(
          `百度TTS请求失败: ${response.status} ${response.statusText}`
        );
      }

      // 检查响应是否为错误信息
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorResult = await response.json();
        throw new Error(
          `百度TTS合成失败: ${errorResult.err_msg || '未知错误'}`
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
  private async getAccessToken(): Promise<string> {
    try {
      const response = await fetch('/api/voice/baidu-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: this.apiKey,
          secretKey: this.secretKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`获取百度Token失败: ${response.status}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      throw this.createVoiceError('NETWORK_ERROR', error);
    }
  }

  /**
   * 将Blob转换为Base64
   */
  private async audioBlobToBase64(audioBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // 移除data:audio/wav;base64,前缀
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('音频文件读取失败'));
      reader.readAsDataURL(audioBlob);
    });
  }

  /**
   * 检查配置是否完整
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.secretKey);
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
