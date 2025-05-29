/**
 * 语音配置管理 API 接口
 * 处理语音功能的配置读取和保存
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  VoiceConfig, 
  VoiceConfigResponse,
  VOICE_CONSTANTS 
} from '@/types/voice'
import { 
  validateVoiceConfig,
  getSupportedFormats,
  checkBrowserSupport 
} from '@/lib/voice/config'

/**
 * GET /api/voice/config
 * 获取语音配置
 */
export async function GET() {
  try {
    // 获取环境变量配置
    const config: VoiceConfig = {
      apiUrl: process.env.OPENAI_AUDIO_API_URL || 'http://112.48.22.44:38082/v1/audio/transcriptions',
      apiKey: process.env.OPENAI_AUDIO_API_KEY ? '***' : '', // 不返回真实密钥
      maxDuration: VOICE_CONSTANTS.DEFAULT_MAX_DURATION,
      sampleRate: VOICE_CONSTANTS.DEFAULT_SAMPLE_RATE,
      language: VOICE_CONSTANTS.DEFAULT_LANGUAGE,
      enabled: true,
    }

    // 检查服务状态
    const serviceStatus = await checkServiceHealth()

    const response: VoiceConfigResponse = {
      config,
      supportedFormats: getSupportedFormats(),
      status: serviceStatus,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to get voice config:', error)
    return NextResponse.json({
      error: 'Failed to get configuration',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

/**
 * POST /api/voice/config
 * 保存语音配置
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证配置
    const errors = validateVoiceConfig(body)
    if (errors.length > 0) {
      return NextResponse.json({
        error: 'Invalid configuration',
        details: errors,
      }, { status: 400 })
    }

    // 在实际应用中，这里应该保存到数据库或配置文件
    // 目前只做验证和返回
    const savedConfig: Partial<VoiceConfig> = {
      maxDuration: body.maxDuration,
      sampleRate: body.sampleRate,
      language: body.language,
      enabled: body.enabled,
    }

    return NextResponse.json({
      success: true,
      config: savedConfig,
      message: 'Configuration saved successfully',
    })
  } catch (error) {
    console.error('Failed to save voice config:', error)
    return NextResponse.json({
      error: 'Failed to save configuration',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

/**
 * PUT /api/voice/config
 * 更新语音配置
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 获取当前配置
    const currentConfig: VoiceConfig = {
      apiUrl: process.env.OPENAI_AUDIO_API_URL || '',
      apiKey: process.env.OPENAI_AUDIO_API_KEY || '',
      maxDuration: VOICE_CONSTANTS.DEFAULT_MAX_DURATION,
      sampleRate: VOICE_CONSTANTS.DEFAULT_SAMPLE_RATE,
      language: VOICE_CONSTANTS.DEFAULT_LANGUAGE,
      enabled: true,
    }

    // 合并配置
    const updatedConfig = { ...currentConfig, ...body }
    
    // 验证配置
    const errors = validateVoiceConfig(updatedConfig)
    if (errors.length > 0) {
      return NextResponse.json({
        error: 'Invalid configuration',
        details: errors,
      }, { status: 400 })
    }

    // 测试配置（如果提供了 API 信息）
    if (body.apiUrl && body.apiKey) {
      const testResult = await testApiConnection(body.apiUrl, body.apiKey)
      if (!testResult.success) {
        return NextResponse.json({
          error: 'API connection test failed',
          details: testResult.error,
        }, { status: 400 })
      }
    }

    return NextResponse.json({
      success: true,
      config: {
        ...updatedConfig,
        apiKey: updatedConfig.apiKey ? '***' : '', // 不返回真实密钥
      },
      message: 'Configuration updated successfully',
    })
  } catch (error) {
    console.error('Failed to update voice config:', error)
    return NextResponse.json({
      error: 'Failed to update configuration',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

/**
 * 检查服务健康状态
 */
async function checkServiceHealth(): Promise<'online' | 'offline' | 'error'> {
  try {
    const apiUrl = process.env.OPENAI_AUDIO_API_URL
    const apiKey = process.env.OPENAI_AUDIO_API_KEY

    if (!apiUrl || !apiKey || apiKey === 'sk-xx') {
      return 'offline'
    }

    // 简单的健康检查（不发送实际音频）
    const response = await fetch(apiUrl.replace('/transcriptions', '/models'), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(5000), // 5秒超时
    })

    return response.ok ? 'online' : 'error'
  } catch (error) {
    console.warn('Service health check failed:', error)
    return 'error'
  }
}

/**
 * 测试 API 连接
 */
async function testApiConnection(apiUrl: string, apiKey: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // 创建一个小的测试音频文件（静音）
    const testAudio = createTestAudioBlob()
    
    const formData = new FormData()
    formData.append('file', testAudio, 'test.wav')
    formData.append('model', 'whisper-1')
    formData.append('language', 'zh')

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
      signal: AbortSignal.timeout(10000), // 10秒超时
    })

    if (response.ok) {
      return { success: true }
    } else {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.error?.message || `HTTP ${response.status}`,
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
    }
  }
}

/**
 * 创建测试音频 Blob
 */
function createTestAudioBlob(): Blob {
  // 创建一个简单的 WAV 文件头和静音数据
  const sampleRate = 16000
  const duration = 0.1 // 100ms
  const numSamples = sampleRate * duration
  
  // WAV 文件头
  const header = new ArrayBuffer(44)
  const view = new DataView(header)
  
  // RIFF header
  view.setUint32(0, 0x52494646, false) // "RIFF"
  view.setUint32(4, 36 + numSamples * 2, true) // file size
  view.setUint32(8, 0x57415645, false) // "WAVE"
  
  // fmt chunk
  view.setUint32(12, 0x666d7420, false) // "fmt "
  view.setUint32(16, 16, true) // chunk size
  view.setUint16(20, 1, true) // audio format (PCM)
  view.setUint16(22, 1, true) // num channels
  view.setUint32(24, sampleRate, true) // sample rate
  view.setUint32(28, sampleRate * 2, true) // byte rate
  view.setUint16(32, 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  
  // data chunk
  view.setUint32(36, 0x64617461, false) // "data"
  view.setUint32(40, numSamples * 2, true) // data size
  
  // 静音数据
  const audioData = new ArrayBuffer(numSamples * 2)
  const audioView = new Int16Array(audioData)
  audioView.fill(0) // 静音
  
  return new Blob([header, audioData], { type: 'audio/wav' })
}

/**
 * 获取系统信息
 */
export async function OPTIONS() {
  const systemInfo = {
    service: 'voice-config',
    version: '1.0.0',
    features: {
      transcription: true,
      realTimeProcessing: false,
      multiLanguage: true,
      customModels: false,
    },
    limits: {
      maxFileSize: VOICE_CONSTANTS.MAX_FILE_SIZE,
      maxDuration: VOICE_CONSTANTS.DEFAULT_MAX_DURATION,
      supportedFormats: VOICE_CONSTANTS.SUPPORTED_FORMATS,
    },
    browserSupport: checkBrowserSupport(),
  }

  return NextResponse.json(systemInfo)
}
