/**
 * 语音配置API路由
 * 处理语音配置的增删改查
 */

import { NextRequest, NextResponse } from 'next/server';
import { VoiceStorage } from '@/lib/voice/storage/voice-storage';
import { VoiceConfig, VOICE_CONSTANTS } from '@/types/voice';

// 避免在服务端导入期触发 indexedDB：请求内按需创建
function getVoiceStorage() {
  return new VoiceStorage();
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID' },
        { status: 400 }
      );
    }

    const storage = getVoiceStorage();
    const config = await storage.getConfig(userId);

    if (!config) {
      // 返回默认配置
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

      return NextResponse.json({
        success: true,
        config: defaultConfig,
        isDefault: true,
      });
    }

    return NextResponse.json({
      success: true,
      config,
      isDefault: false,
    });
  } catch (error) {
    console.error('获取语音配置错误:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取配置失败',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, config } = body;

    if (!userId || !config) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID或配置数据' },
        { status: 400 }
      );
    }

    // 验证配置数据
    const validatedConfig: VoiceConfig = {
      id: config.id || `config_${userId}`,
      userId,
      asrProvider: config.asrProvider || 'aliyun',
      ttsProvider: config.ttsProvider || 'aliyun',
      voice: config.voice || VOICE_CONSTANTS.DEFAULT_VOICE,
      speed: Math.max(
        0.5,
        Math.min(2.0, config.speed || VOICE_CONSTANTS.DEFAULT_SPEED)
      ),
      volume: Math.max(
        0,
        Math.min(1, config.volume || VOICE_CONSTANTS.DEFAULT_VOLUME)
      ),
      language: config.language || VOICE_CONSTANTS.DEFAULT_LANGUAGE,
      autoPlay: Boolean(config.autoPlay),
      maxDuration: Math.max(
        10000,
        Math.min(
          300000,
          config.maxDuration || VOICE_CONSTANTS.DEFAULT_MAX_DURATION
        )
      ),
      sampleRate: config.sampleRate || VOICE_CONSTANTS.DEFAULT_SAMPLE_RATE,
      createdAt: config.createdAt ? new Date(config.createdAt) : new Date(),
      updatedAt: new Date(),
    };

    const storage = getVoiceStorage();
    await storage.saveConfig(validatedConfig);

    return NextResponse.json({
      success: true,
      message: '配置保存成功',
      config: validatedConfig,
    });
  } catch (error) {
    console.error('保存语音配置错误:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '保存配置失败',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId || !updates) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID或更新数据' },
        { status: 400 }
      );
    }

    // 获取现有配置
    const storage = getVoiceStorage();
    const existingConfig = await storage.getConfig(userId);

    if (!existingConfig) {
      return NextResponse.json(
        { success: false, error: '配置不存在' },
        { status: 404 }
      );
    }

    // 合并更新
    const updatedConfig: VoiceConfig = {
      ...existingConfig,
      ...updates,
      updatedAt: new Date(),
    };

    await storage.saveConfig(updatedConfig);

    return NextResponse.json({
      success: true,
      message: '配置更新成功',
      config: updatedConfig,
    });
  } catch (error) {
    console.error('更新语音配置错误:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '更新配置失败',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID' },
        { status: 400 }
      );
    }

    const storage = getVoiceStorage();
    await storage.deleteConfig(userId);

    return NextResponse.json({
      success: true,
      message: '配置删除成功',
    });
  } catch (error) {
    console.error('删除语音配置错误:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '删除配置失败',
      },
      { status: 500 }
    );
  }
}
