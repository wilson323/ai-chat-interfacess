/**
 * 语音识别API路由
 * 处理语音文件上传和识别
 */

import { NextRequest, NextResponse } from 'next/server';
import { VoiceService } from '@/lib/voice/services/voice-service';
import { VoiceRecognitionRequest } from '@/types/voice';

const voiceService = new VoiceService();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string;
    const provider = formData.get('provider') as string;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: '缺少音频文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = [
      'audio/wav',
      'audio/mp3',
      'audio/webm',
      'audio/ogg',
      'audio/m4a',
    ];
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { success: false, error: '不支持的音频格式' },
        { status: 400 }
      );
    }

    // 验证文件大小（10MB限制）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { success: false, error: '文件大小超过限制（10MB）' },
        { status: 400 }
      );
    }

    // 创建识别请求
    const recognitionRequest: VoiceRecognitionRequest = {
      audio: audioFile,
      language: language || 'zh-CN',
      provider: provider || 'aliyun',
      options: {
        enableAutomaticPunctuation: true,
        enableSpeakerDiarization: false,
        maxAlternatives: 1,
      },
    };

    // 执行语音识别
    const result = await voiceService.recognizeSpeech(recognitionRequest);

    return NextResponse.json(result);
  } catch (error) {
    console.error('语音识别错误:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '语音识别失败',
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
    message: '语音识别服务运行正常',
    supportedFormats: [
      'audio/wav',
      'audio/mp3',
      'audio/webm',
      'audio/ogg',
      'audio/m4a',
    ],
    maxFileSize: '10MB',
    supportedLanguages: ['zh-CN', 'en-US', 'ja-JP', 'ko-KR'],
  });
}
