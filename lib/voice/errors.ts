/**
 * 语音功能错误处理工具
 * 统一的错误处理和用户友好的错误信息
 */

import { VoiceError, VoiceErrorCode, VOICE_ERROR_CODES } from '@/types/voice'

/**
 * 创建语音错误对象
 */
export function createVoiceError(
  code: VoiceErrorCode,
  message: string,
  suggestion?: string,
  details?: any
): VoiceError {
  return {
    code,
    message,
    suggestion,
    details,
  }
}

/**
 * 处理麦克风访问错误
 */
export function handleMediaError(error: any): VoiceError {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return createVoiceError(
          VOICE_ERROR_CODES.PERMISSION_DENIED,
          '麦克风访问被拒绝',
          isMobile 
            ? '请在浏览器设置中允许访问麦克风，或尝试使用Chrome/Safari最新版本'
            : '请在浏览器设置中允许访问麦克风'
        )

      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return createVoiceError(
          VOICE_ERROR_CODES.DEVICE_NOT_FOUND,
          '未检测到麦克风设备',
          '请确认麦克风已连接并在系统设置中启用'
        )

      case 'NotReadableError':
      case 'TrackStartError':
        return createVoiceError(
          VOICE_ERROR_CODES.DEVICE_NOT_READABLE,
          '麦克风被其他应用占用',
          '请关闭其他使用麦克风的应用后重试'
        )

      case 'AbortError':
        return createVoiceError(
          VOICE_ERROR_CODES.PERMISSION_UNAVAILABLE,
          '麦克风访问请求被中断',
          '请刷新页面后重试'
        )

      case 'SecurityError':
        return createVoiceError(
          VOICE_ERROR_CODES.BROWSER_NOT_SUPPORTED,
          '由于安全策略限制，无法访问麦克风',
          '请确保网站使用HTTPS协议'
        )

      case 'TypeError':
        return createVoiceError(
          VOICE_ERROR_CODES.BROWSER_NOT_SUPPORTED,
          isMobile 
            ? '您的移动浏览器可能不完全支持语音输入功能'
            : '浏览器出现兼容性问题',
          isMobile
            ? '请尝试使用Chrome或Safari最新版本'
            : '请尝试使用Chrome、Firefox或Edge最新版本'
        )

      default:
        return createVoiceError(
          VOICE_ERROR_CODES.UNKNOWN_ERROR,
          `麦克风访问失败: ${error.name}`,
          '请检查浏览器权限设置'
        )
    }
  }

  return createVoiceError(
    VOICE_ERROR_CODES.UNKNOWN_ERROR,
    '无法访问麦克风',
    '请检查浏览器权限设置'
  )
}

/**
 * 处理 MediaRecorder 错误
 */
export function handleRecorderError(error: any): VoiceError {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  if (error.name === 'NotSupportedError') {
    return createVoiceError(
      VOICE_ERROR_CODES.MEDIA_RECORDER_NOT_SUPPORTED,
      isMobile 
        ? '您的移动浏览器不完全支持录音功能'
        : '您的浏览器不完全支持录音功能',
      isMobile
        ? '请尝试使用Chrome或Safari最新版本'
        : '请使用最新版本的Chrome、Firefox或Edge浏览器'
    )
  }

  return createVoiceError(
    VOICE_ERROR_CODES.UNKNOWN_ERROR,
    '录音功能初始化失败',
    '请刷新页面后重试'
  )
}

/**
 * 处理网络请求错误
 */
export function handleNetworkError(error: any): VoiceError {
  if (error.name === 'AbortError') {
    return createVoiceError(
      VOICE_ERROR_CODES.REQUEST_TIMEOUT,
      '请求超时，请重试',
      '检查网络连接或稍后重试'
    )
  }

  if (error.status) {
    switch (error.status) {
      case 401:
        return createVoiceError(
          VOICE_ERROR_CODES.API_ERROR,
          '认证失败',
          '请检查API密钥配置'
        )

      case 413:
        return createVoiceError(
          VOICE_ERROR_CODES.FILE_TOO_LARGE,
          '音频文件过大',
          '请录制较短的音频或降低音质'
        )

      case 429:
        return createVoiceError(
          VOICE_ERROR_CODES.API_ERROR,
          '请求过于频繁',
          '请稍后重试'
        )

      case 500:
      case 502:
      case 503:
        return createVoiceError(
          VOICE_ERROR_CODES.API_ERROR,
          '服务器错误',
          '请稍后重试或联系技术支持'
        )

      default:
        return createVoiceError(
          VOICE_ERROR_CODES.API_ERROR,
          `请求失败 (${error.status})`,
          '请检查网络连接后重试'
        )
    }
  }

  return createVoiceError(
    VOICE_ERROR_CODES.NETWORK_ERROR,
    '网络连接失败',
    '请检查网络连接后重试'
  )
}

/**
 * 处理 API 响应错误
 */
export function handleApiError(response: any): VoiceError {
  if (response.error) {
    const { code, message, suggestion } = response.error
    return createVoiceError(
      code || VOICE_ERROR_CODES.API_ERROR,
      message || '识别失败',
      suggestion
    )
  }

  if (!response.text) {
    return createVoiceError(
      VOICE_ERROR_CODES.INVALID_RESPONSE,
      '识别结果为空',
      '请重新录音或检查音频质量'
    )
  }

  return createVoiceError(
    VOICE_ERROR_CODES.UNKNOWN_ERROR,
    '未知的API错误',
    '请重试或联系技术支持'
  )
}

/**
 * 处理文件相关错误
 */
export function handleFileError(file: File | null, maxSize: number): VoiceError | null {
  if (!file) {
    return createVoiceError(
      VOICE_ERROR_CODES.NO_AUDIO_DATA,
      '未检测到音频文件',
      '请重新录音'
    )
  }

  if (file.size === 0) {
    return createVoiceError(
      VOICE_ERROR_CODES.NO_AUDIO_DATA,
      '音频文件为空',
      '请重新录音'
    )
  }

  if (file.size > maxSize) {
    return createVoiceError(
      VOICE_ERROR_CODES.FILE_TOO_LARGE,
      '音频文件过大',
      `请录制较短的音频（建议${Math.floor(maxSize / 1024 / 1024)}MB以内）`
    )
  }

  return null
}

/**
 * 获取错误的用户友好描述
 */
export function getErrorDescription(error: VoiceError): {
  title: string
  description: string
  solutions: string[]
} {
  const solutions: string[] = []
  
  if (error.suggestion) {
    solutions.push(error.suggestion)
  }

  // 根据错误代码添加通用解决方案
  switch (error.code) {
    case VOICE_ERROR_CODES.PERMISSION_DENIED:
      solutions.push(
        '点击浏览器地址栏左侧的锁定图标',
        '找到麦克风权限并设置为"允许"',
        '刷新页面后重试'
      )
      break

    case VOICE_ERROR_CODES.DEVICE_NOT_FOUND:
      solutions.push(
        '检查麦克风是否正确连接',
        '在系统设置中确认麦克风是否启用',
        '尝试使用其他麦克风设备'
      )
      break

    case VOICE_ERROR_CODES.BROWSER_NOT_SUPPORTED:
      solutions.push(
        '更新浏览器到最新版本',
        '尝试使用Chrome、Firefox或Edge浏览器',
        '确保网站使用HTTPS协议'
      )
      break

    case VOICE_ERROR_CODES.NETWORK_ERROR:
      solutions.push(
        '检查网络连接',
        '稍后重试',
        '如问题持续，请联系技术支持'
      )
      break
  }

  return {
    title: error.message,
    description: error.suggestion || '请尝试以下解决方案',
    solutions: [...new Set(solutions)], // 去重
  }
}

/**
 * 检查是否为临时错误（可重试）
 */
export function isTemporaryError(error: VoiceError): boolean {
  const temporaryErrorCodes = [
    VOICE_ERROR_CODES.NETWORK_ERROR,
    VOICE_ERROR_CODES.REQUEST_TIMEOUT,
    VOICE_ERROR_CODES.DEVICE_IN_USE,
  ]

  return temporaryErrorCodes.includes(error.code as any)
}

/**
 * 检查是否为配置错误
 */
export function isConfigError(error: VoiceError): boolean {
  const configErrorCodes = [
    VOICE_ERROR_CODES.CONFIG_MISSING,
    VOICE_ERROR_CODES.API_ERROR,
  ]

  return configErrorCodes.includes(error.code as any)
}

/**
 * 记录错误日志
 */
export function logVoiceError(error: VoiceError, context?: string): void {
  const logData = {
    timestamp: new Date().toISOString(),
    context: context || 'voice',
    error: {
      code: error.code,
      message: error.message,
      suggestion: error.suggestion,
    },
    userAgent: navigator.userAgent,
    url: window.location.href,
  }

  // 开发环境下输出到控制台
  if (process.env.NODE_ENV === 'development') {
    console.warn('Voice Error:', logData)
  }

  // 生产环境下可以发送到错误监控服务
  // 例如：Sentry, LogRocket 等
}
