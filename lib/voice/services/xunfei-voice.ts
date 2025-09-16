/**
 * 科大讯飞语音服务实现
 * 作为主要方案之一，提供ASR和TTS功能
 */

import {
  VoiceRecognitionRequest,
  VoiceRecognitionResult,
  VoiceSynthesisRequest,
  VoiceError,
  VoiceErrorType,
} from '@/types/voice';

export class XunfeiVoiceService {
  private appId: string;
  private apiKey: string;
  private apiSecret: string;
  private asrEndpoint: string;
  private ttsEndpoint: string;

  constructor() {
    this.appId = process.env.XUNFEI_APP_ID || '';
    this.apiKey = process.env.XUNFEI_API_KEY || '';
    this.apiSecret = process.env.XUNFEI_API_SECRET || '';
    this.asrEndpoint = 'wss://iat-api.xfyun.cn/v2/iat';
    this.ttsEndpoint = 'https://tts-api.xfyun.cn/v2/tts';
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

      // 构建WebSocket连接进行实时识别
      const wsUrl = `${this.asrEndpoint}?authorization=${token}&date=${new Date().toUTCString()}&host=iat-api.xfyun.cn`;

      return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl);
        let finalResult = '';
        let confidence = 0;
        const startTime = Date.now();

        ws.onopen = () => {
          // 发送音频数据
          const audioBuffer = new Uint8Array(audioData);
          const chunkSize = 1280; // 每次发送1280字节

          for (let i = 0; i < audioBuffer.length; i += chunkSize) {
            const chunk = audioBuffer.slice(i, i + chunkSize);
            const isLast = i + chunkSize >= audioBuffer.length;

            ws.send(
              JSON.stringify({
                common: {
                  app_id: this.appId,
                },
                business: {
                  language: request.language || 'zh_cn',
                  domain: 'iat',
                  accent: 'mandarin',
                  vad_eos: 10000,
                },
                data: {
                  status: isLast ? 2 : 1, // 1: 第一帧, 2: 最后一帧
                  format: 'audio/L16;rate=16000',
                  encoding: 'raw',
                  audio: this.arrayBufferToBase64(
                    (chunk.buffer as ArrayBuffer).slice(
                      chunk.byteOffset,
                      chunk.byteOffset + chunk.byteLength
                    )
                  ),
                },
              })
            );
          }
        };

        ws.onmessage = (event: MessageEvent) => {
          try {
            const result = JSON.parse(event.data);

            if (result.code === 0) {
              const data = result.data;
              if (data.result) {
                const ws = data.result.ws;
                for (const w of ws) {
                  for (const cw of w.cw) {
                    finalResult += cw.w;
                    confidence = Math.max(confidence, cw.sc || 0);
                  }
                }
              }

              if (data.status === 2) {
                // 识别完成
                ws.close();
                const duration = Date.now() - startTime;
                resolve({
                  text: finalResult.trim(),
                  confidence: confidence / 100, // 转换为0-1范围
                  language: request.language || 'zh-CN',
                  duration,
                  timestamp: new Date(),
                });
              }
            } else {
              ws.close();
              reject(new Error(`讯飞ASR识别失败: ${result.message}`));
            }
          } catch (error) {
            ws.close();
            reject(error);
          }
        };

        ws.onerror = (error: Event) => {
          ws.close();
          reject(this.createVoiceError('TRANSCRIPTION_FAILED', error));
        };

        ws.onclose = () => {
          if (finalResult === '') {
            reject(new Error('识别结果为空'));
          }
        };
      });
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
        common: {
          app_id: this.appId,
        },
        business: {
          aue: 'raw', // 音频编码格式
          auf: 'audio/L16;rate=16000', // 音频采样率
          vcn: options.voice || 'xiaoyan', // 发音人
          speed: Math.round((options.speed || 1.0) * 50), // 语速 0-100
          volume: Math.round((options.volume || 1.0) * 100), // 音量 0-100
          pitch: Math.round((options.pitch || 1.0) * 100), // 音调 0-100
          bgs: 0, // 背景音
          ttp: 1, // 文本格式
        },
        data: {
          status: 2, // 固定值2
          text: Buffer.from(text).toString('base64'), // 文本base64编码
        },
      };

      const response = await fetch(this.ttsEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Param': Buffer.from(JSON.stringify(ttsParams.business)).toString(
            'base64'
          ),
        },
        body: JSON.stringify(ttsParams),
      });

      if (!response.ok) {
        throw new Error(
          `讯飞TTS请求失败: ${response.status} ${response.statusText}`
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
      const response = await fetch('/api/voice/xunfei-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId: this.appId,
          apiKey: this.apiKey,
          apiSecret: this.apiSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`获取讯飞Token失败: ${response.status}`);
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
   * 将ArrayBuffer转换为Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * 检查配置是否完整
   */
  isConfigured(): boolean {
    return !!(this.appId && this.apiKey && this.apiSecret);
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
