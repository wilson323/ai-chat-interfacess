/**
 * 语音转文字 API 接口
 * 基于 OpenAI 兼容接口的现代化实现
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  VoiceTranscriptionResult, 
  VoiceError, 
  VOICE_CONSTANTS,
  VOICE_ERROR_CODES 
} from '@/types/voice'
import { 
  handleNetworkError, 
  handleApiError, 
  handleFileError,
  createVoiceError,
  logVoiceError 
} from '@/lib/voice/errors'

/**
 * POST /api/voice/transcribe
 * 语音转文字主接口
 */
export async function POST(request: NextRequest) {
  try {
    // 解析表单数据
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    // 文件验证
    const fileError = handleFileError(audioFile, VOICE_CONSTANTS.MAX_FILE_SIZE)
    if (fileError) {
      logVoiceError(fileError, 'file-validation')
      return NextResponse.json({
        success: false,
        error: fileError,
      }, { status: 400 })
    }

    // 文件格式验证
    if (!isValidAudioFormat(audioFile)) {
      const error = createVoiceError(
        VOICE_ERROR_CODES.UNSUPPORTED_FORMAT,
        '不支持的音频格式',
        `支持的格式: ${VOICE_CONSTANTS.SUPPORTED_FORMATS.join(', ')}`
      )
      logVoiceError(error, 'format-validation')
      return NextResponse.json({
        success: false,
        error,
      }, { status: 400 })
    }

    // 调用转录服务
    const transcription = await transcribeAudio(audioFile)

    return NextResponse.json({
      success: true,
      result: transcription,
    })

  } catch (error: any) {
    const voiceError = error.code ? error : handleNetworkError(error)
    logVoiceError(voiceError, 'transcribe-api')
    
    return NextResponse.json({
      success: false,
      error: voiceError,
    }, { status: 500 })
  }
}

/**
 * 转录音频文件
 */
async function transcribeAudio(file: File): Promise<VoiceTranscriptionResult> {
  const apiUrl = process.env.OPENAI_AUDIO_API_URL || 'http://112.48.22.44:38082/v1/audio/transcriptions'
  const apiKey = process.env.OPENAI_AUDIO_API_KEY || 'sk-xx'

  // 检查配置
  if (!apiKey || apiKey === 'sk-xx') {
    throw createVoiceError(
      VOICE_ERROR_CODES.CONFIG_MISSING,
      'OpenAI Audio API 配置缺失',
      '请配置 OPENAI_AUDIO_API_KEY 环境变量'
    )
  }

  if (!apiUrl) {
    throw createVoiceError(
      VOICE_ERROR_CODES.CONFIG_MISSING,
      'OpenAI Audio API URL 配置缺失',
      '请配置 OPENAI_AUDIO_API_URL 环境变量'
    )
  }

  try {
    // 准备请求数据
    const requestFormData = new FormData()
    requestFormData.append('file', file)
    requestFormData.append('model', 'whisper-1')
    requestFormData.append('language', 'zh')
    requestFormData.append('response_format', 'verbose_json')
    requestFormData.append('temperature', '0')

    // 添加超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), VOICE_CONSTANTS.REQUEST_TIMEOUT)

    // 发送请求
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: requestFormData,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // 检查响应状态
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw {
        status: response.status,
        message: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
        code: errorData.error?.code || VOICE_ERROR_CODES.API_ERROR,
        details: errorData,
      }
    }

    // 解析响应
    const data = await response.json()

    // 验证响应数据
    if (!data.text) {
      throw createVoiceError(
        VOICE_ERROR_CODES.INVALID_RESPONSE,
        '识别结果为空',
        '请重新录音或检查音频质量'
      )
    }

    // 构建结果
    const result: VoiceTranscriptionResult = {
      text: data.text.trim(),
      confidence: data.confidence || 0.9,
      duration: data.duration || 0,
      language: data.language || 'zh',
      timestamp: Date.now(),
    }

    return result

  } catch (error: any) {
    // 处理超时错误
    if (error.name === 'AbortError') {
      throw createVoiceError(
        VOICE_ERROR_CODES.REQUEST_TIMEOUT,
        '请求超时',
        '请检查网络连接或稍后重试'
      )
    }

    // 处理 API 错误
    if (error.status) {
      throw handleNetworkError(error)
    }

    // 处理其他错误
    throw createVoiceError(
      VOICE_ERROR_CODES.UNKNOWN_ERROR,
      '转录服务异常',
      '请稍后重试或联系技术支持'
    )
  }
}

/**
 * 验证音频格式
 */
function isValidAudioFormat(file: File): boolean {
  // 检查 MIME 类型
  if (VOICE_CONSTANTS.SUPPORTED_FORMATS.includes(file.type)) {
    return true
  }

  // 检查文件扩展名
  const extension = file.name.split('.').pop()?.toLowerCase()
  const validExtensions = ['wav', 'mp3', 'mp4', 'webm', 'ogg', 'm4a']
  
  return extension ? validExtensions.includes(extension) : false
}

/**
 * 获取音频文件信息
 */
function getAudioFileInfo(file: File) {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    sizeInMB: (file.size / (1024 * 1024)).toFixed(2),
  }
}

/**
 * 记录 API 使用情况
 */
async function logApiUsage(
  file: File, 
  result: VoiceTranscriptionResult | null, 
  error: VoiceError | null
) {
  const logData = {
    timestamp: new Date().toISOString(),
    file: getAudioFileInfo(file),
    result: result ? {
      textLength: result.text.length,
      confidence: result.confidence,
      duration: result.duration,
      language: result.language,
    } : null,
    error: error ? {
      code: error.code,
      message: error.message,
    } : null,
    success: !!result,
  }

  // 在开发环境下输出日志
  if (process.env.NODE_ENV === 'development') {
    console.log('Voice API Usage:', logData)
  }

  // 生产环境下可以发送到日志服务
  // 例如：发送到 Analytics、Logging 服务等
}

/**
 * 健康检查端点
 */
export async function GET() {
  try {
    const apiUrl = process.env.OPENAI_AUDIO_API_URL
    const apiKey = process.env.OPENAI_AUDIO_API_KEY

    const status = {
      service: 'voice-transcription',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      config: {
        hasApiUrl: !!apiUrl,
        hasApiKey: !!apiKey && apiKey !== 'sk-xx',
        maxFileSize: VOICE_CONSTANTS.MAX_FILE_SIZE,
        supportedFormats: VOICE_CONSTANTS.SUPPORTED_FORMATS,
        requestTimeout: VOICE_CONSTANTS.REQUEST_TIMEOUT,
      },
    }

    return NextResponse.json(status)
  } catch (error) {
    return NextResponse.json({
      service: 'voice-transcription',
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
