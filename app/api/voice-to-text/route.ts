import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

async function logApiError(api: string, error: any) {
  const saveDir = path.join(process.cwd(), 'data')
  await fs.mkdir(saveDir, { recursive: true })
  const filePath = path.join(saveDir, 'api-error.log')
  const msg = `[${new Date().toISOString()}] [${api}] ${error instanceof Error ? error.stack : String(error)}\n`
  await fs.appendFile(filePath, msg)
}

// OpenAI 兼容的错误处理
interface VoiceError {
  code: string
  message: string
  suggestion?: string
}

const handleVoiceError = (error: any): VoiceError => {
  if (error.name === 'AbortError') {
    return {
      code: 'REQUEST_TIMEOUT',
      message: '请求超时，请重试',
      suggestion: '检查网络连接或稍后重试'
    }
  }

  if (error.status === 401) {
    return {
      code: 'AUTH_ERROR',
      message: '认证失败',
      suggestion: '请检查API密钥配置'
    }
  }

  if (error.status === 413) {
    return {
      code: 'FILE_TOO_LARGE',
      message: '音频文件过大',
      suggestion: '请录制较短的音频或降低音质'
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: '识别失败，请重试',
    suggestion: '如问题持续，请联系技术支持'
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({
        error: '未检测到音频文件',
        code: 'NO_FILE'
      }, { status: 400 })
    }

    // 文件大小检查 (25MB 限制)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({
        error: '音频文件过大，请录制较短的音频',
        code: 'FILE_TOO_LARGE'
      }, { status: 413 })
    }

    // 文件类型检查
    const allowedTypes = ['audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/webm', 'audio/ogg']
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(wav|mp3|mp4|webm|ogg|m4a)$/i)) {
      return NextResponse.json({
        error: '不支持的音频格式',
        code: 'UNSUPPORTED_FORMAT'
      }, { status: 400 })
    }

    return await openaiASR(file)
  } catch (error) {
    await logApiError('voice-to-text', error)
    const voiceError = handleVoiceError(error)
    return NextResponse.json({
      error: voiceError.message,
      code: voiceError.code,
      suggestion: voiceError.suggestion
    }, { status: 500 })
  }
}

// OpenAI 兼容的 ASR 实现
async function openaiASR(file: File) {
  const apiUrl = process.env.OPENAI_AUDIO_API_URL || 'http://112.48.22.44:38082/v1/audio/transcriptions'
  const apiKey = process.env.OPENAI_AUDIO_API_KEY || 'sk-xx'

  if (!apiKey || apiKey === 'sk-xx') {
    return NextResponse.json({
      error: 'OpenAI Audio API 配置缺失',
      code: 'CONFIG_MISSING'
    }, { status: 500 })
  }

  try {
    // 创建 FormData，遵循 OpenAI API 规范
    const formData = new FormData()
    formData.append('file', file)
    formData.append('model', 'whisper-1')
    formData.append('language', 'zh') // 中文识别
    formData.append('response_format', 'json')

    // 添加超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw {
        status: response.status,
        message: errorData.error?.message || `HTTP ${response.status}`,
        code: errorData.error?.code || 'API_ERROR'
      }
    }

    const data = await response.json()

    // 检查返回数据格式
    if (data.text) {
      return NextResponse.json({
        text: data.text.trim(),
        duration: data.duration || null,
        language: data.language || 'zh'
      })
    } else {
      throw {
        status: 500,
        message: '识别结果为空',
        code: 'EMPTY_RESULT'
      }
    }

  } catch (error: any) {
    // 处理网络错误
    if (error.name === 'AbortError') {
      return NextResponse.json({
        error: '请求超时，请重试',
        code: 'REQUEST_TIMEOUT'
      }, { status: 408 })
    }

    // 处理 API 错误
    if (error.status) {
      return NextResponse.json({
        error: error.message || '识别失败',
        code: error.code || 'API_ERROR'
      }, { status: error.status })
    }

    // 处理其他错误
    throw error
  }
}