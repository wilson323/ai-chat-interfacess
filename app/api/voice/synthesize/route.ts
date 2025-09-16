/**
 * 语音合成API路由
 * 处理文本转语音请求
 */

import { NextRequest, NextResponse } from 'next/server';
import { VoiceService } from '@/lib/voice/services/voice-service';
import { VoiceSynthesisRequest, TTSOptions } from '@/types/voice';

const voiceService = new VoiceService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, options, provider } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: '缺少文本内容' },
        { status: 400 }
      );
    }

    // 验证文本长度
    if (text.length > 5000) {
      return NextResponse.json(
        { success: false, error: '文本长度超过限制（5000字符）' },
        { status: 400 }
      );
    }

    // 创建合成选项
    const ttsOptions: TTSOptions = {
      voice: options?.voice || 'default',
      speed: options?.speed || 1.0,
      volume: options?.volume || 1.0,
      language: options?.language || 'zh-CN',
      provider: options?.provider || 'aliyun',
      pitch: options?.pitch || 1.0,
      rate: options?.rate || 1.0,
    };

    // 创建合成请求
    const synthesisRequest: VoiceSynthesisRequest = {
      text,
      options: ttsOptions,
      provider: provider || 'aliyun',
    };

    // 执行语音合成
    const result = await voiceService.synthesizeSpeech(synthesisRequest);

    if (result.success && result.audioBlob) {
      // 将Blob转换为Buffer
      const arrayBuffer = await result.audioBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 返回音频文件
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': buffer.length.toString(),
          'X-Provider': result.provider,
          'X-Processing-Time': result.processingTime.toString(),
        },
      });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('语音合成错误:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '语音合成失败',
        provider: 'unknown',
        processingTime: 0,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: '语音合成服务运行正常',
    supportedVoices: ['default', 'female', 'male', 'child'],
    supportedLanguages: ['zh-CN', 'en-US', 'ja-JP', 'ko-KR'],
    maxTextLength: 5000,
  });
}
