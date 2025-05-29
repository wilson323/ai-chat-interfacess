/**
 * 主语音输入组件
 * 集成所有语音功能的核心组件
 */

import React, { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { VoiceInputProps, VOICE_CONSTANTS } from '@/types/voice'
import { useVoicePermission } from './hooks/useVoicePermission'
import { useVoiceRecorder } from './hooks/useVoiceRecorder'
import { useVoiceConfig } from './hooks/useVoiceConfig'
import { useAudioLevel } from './hooks/useAudioVisualization'
import { VoiceButton } from './VoiceButton'
import { VoiceStatus } from './VoiceStatus'
import { VoicePermission } from './VoicePermission'
import { ProcessingStatus, SuccessStatus } from './VoiceStatus'
import { createVoiceError, VOICE_ERROR_CODES } from '@/lib/voice/errors'

/**
 * 主语音输入组件
 */
export function VoiceInput({
  onTranscript,
  disabled = false,
  className,
  placeholder = "点击开始语音输入",
  size = 'md',
  variant = 'default',
}: VoiceInputProps) {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [lastTranscript, setLastTranscript] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Hooks
  const { permission, requestPermission } = useVoicePermission()
  const { config } = useVoiceConfig()
  const { state, startRecording, stopRecording, reset } = useVoiceRecorder(config)
  const { audioLevel } = useAudioLevel(state.isRecording ? {} as MediaStream : null)

  // 检查是否可以使用语音功能
  const isEnabled = !disabled && permission.isSupported && permission.state === 'granted' && config.enabled

  /**
   * 处理语音转录
   */
  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    setIsTranscribing(true)

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')

      // 添加超时控制
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // 检查响应状态
      if (!response.ok) {
        throw createVoiceError(
          VOICE_ERROR_CODES.API_ERROR,
          `HTTP ${response.status}: ${response.statusText}`,
          '请检查网络连接或稍后重试'
        )
      }

      // 检查响应内容类型
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw createVoiceError(
          VOICE_ERROR_CODES.API_ERROR,
          '服务器返回了无效的响应格式',
          '请联系管理员检查API配置'
        )
      }

      // 安全解析JSON
      let data
      try {
        const responseText = await response.text()
        if (!responseText.trim()) {
          throw createVoiceError(
            VOICE_ERROR_CODES.API_ERROR,
            '服务器返回了空响应',
            '请稍后重试'
          )
        }
        data = JSON.parse(responseText)
      } catch (parseError) {
        throw createVoiceError(
          VOICE_ERROR_CODES.API_ERROR,
          'JSON解析失败',
          '服务器响应格式错误，请联系管理员'
        )
      }

      if (data.success && data.result?.text) {
        const transcript = data.result.text.trim()
        setLastTranscript(transcript)
        onTranscript(transcript)

        // 显示成功状态
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 2000)
      } else {
        throw createVoiceError(
          VOICE_ERROR_CODES.API_ERROR,
          data.error?.message || '识别失败',
          data.error?.suggestion || '请重新尝试录音'
        )
      }
    } catch (error: any) {
      console.error('Transcription failed:', error)

      // 处理不同类型的错误
      if (error.name === 'AbortError') {
        console.error('语音转录超时')
      } else if (error.code) {
        // 已经是VoiceError，直接记录
        console.error('Voice error:', error.message)
      } else {
        // 网络或其他错误
        console.error('Network or unknown error:', error)
      }
    } finally {
      setIsTranscribing(false)
    }
  }, [onTranscript])

  /**
   * 处理录音切换
   */
  const handleToggle = useCallback(async () => {
    if (state.isRecording) {
      // 停止录音
      const audioBlob = await stopRecording()
      if (audioBlob) {
        await transcribeAudio(audioBlob)
      }
    } else {
      // 开始录音
      reset() // 清除之前的状态
      setShowSuccess(false)
      await startRecording()
    }
  }, [state.isRecording, stopRecording, startRecording, reset, transcribeAudio])

  /**
   * 处理权限请求
   */
  const handlePermissionRequest = useCallback(async () => {
    const permissionState = await requestPermission()
    // 权限授予成功后自动开始录音
    if (permissionState === 'granted') {
      setTimeout(async () => {
        reset() // 清除之前的状态
        setShowSuccess(false)
        await startRecording()
      }, 100) // 短暂延迟确保状态更新完成
    }
  }, [requestPermission, reset, startRecording])

  // 如果权限未授予，显示权限组件
  if (permission.state !== 'granted') {
    return (
      <div className={cn('space-y-3', className)}>
        <VoiceButton
          isRecording={false}
          isProcessing={false}
          isEnabled={false}
          onToggle={() => {}}
          size={size}
          variant={variant}
        />
        <VoicePermission
          onRequest={handlePermissionRequest}
          permission={permission}
        />
      </div>
    )
  }

  return (
    <div className={cn('relative space-y-3', className)}>
      {/* 主按钮 */}
      <VoiceButton
        isRecording={state.isRecording}
        isProcessing={isTranscribing}
        isEnabled={isEnabled}
        onToggle={handleToggle}
        size={size}
        variant={variant}
      />

      {/* 状态显示 */}
      {showSuccess && lastTranscript ? (
        <SuccessStatus
          message="识别成功"
          duration={state.duration}
        />
      ) : isTranscribing ? (
        <ProcessingStatus message="正在识别语音..." />
      ) : (state.isRecording || state.error) ? (
        <VoiceStatus
          isRecording={state.isRecording}
          duration={state.duration}
          audioLevel={audioLevel}
          error={state.error}
          maxDuration={config.maxDuration}
        />
      ) : null}

      {/* 占位符文本 */}
      {!state.isRecording && !isTranscribing && !state.error && !showSuccess && (
        <p className="text-sm text-muted-foreground text-center">
          {placeholder}
        </p>
      )}
    </div>
  )
}

/**
 * 紧凑语音输入组件
 */
export function CompactVoiceInput({
  onTranscript,
  disabled = false,
  className,
}: Omit<VoiceInputProps, 'size' | 'variant' | 'placeholder'>) {
  const [isTranscribing, setIsTranscribing] = useState(false)

  const { permission, requestPermission } = useVoicePermission()
  const { config } = useVoiceConfig()
  const { state, startRecording, stopRecording, reset } = useVoiceRecorder(config)

  const isEnabled = !disabled && permission.isSupported && permission.state === 'granted' && config.enabled

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    setIsTranscribing(true)

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')

      // 添加超时控制
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // 检查响应状态
      if (!response.ok) {
        console.error(`HTTP ${response.status}: ${response.statusText}`)
        return
      }

      // 检查响应内容类型
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('服务器返回了无效的响应格式')
        return
      }

      // 安全解析JSON
      let data
      try {
        const responseText = await response.text()
        if (!responseText.trim()) {
          console.error('服务器返回了空响应')
          return
        }
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('JSON解析失败:', parseError)
        return
      }

      if (data.success && data.result?.text) {
        onTranscript(data.result.text.trim())
      } else {
        console.error('语音识别失败:', data.error?.message || '未知错误')
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('语音转录超时')
      } else {
        console.error('Transcription failed:', error)
      }
    } finally {
      setIsTranscribing(false)
    }
  }, [onTranscript])

  const handleToggle = useCallback(async () => {
    if (state.isRecording) {
      const audioBlob = await stopRecording()
      if (audioBlob) {
        await transcribeAudio(audioBlob)
      }
    } else {
      reset()
      await startRecording()
    }
  }, [state.isRecording, stopRecording, startRecording, reset, transcribeAudio])

  const handlePermissionRequest = useCallback(async () => {
    const permissionState = await requestPermission()
    // 权限授予成功后自动开始录音
    if (permissionState === 'granted') {
      setTimeout(async () => {
        reset()
        await startRecording()
      }, 100) // 短暂延迟确保状态更新完成
    }
  }, [requestPermission, reset, startRecording])

  if (permission.state !== 'granted') {
    return (
      <VoiceButton
        isRecording={false}
        isProcessing={false}
        isEnabled={false}
        onToggle={handlePermissionRequest}
        size="sm"
        variant="minimal"
        className={className}
      />
    )
  }

  return (
    <VoiceButton
      isRecording={state.isRecording}
      isProcessing={isTranscribing}
      isEnabled={isEnabled}
      onToggle={handleToggle}
      size="sm"
      variant="minimal"
      className={className}
    />
  )
}

/**
 * 浮动语音输入组件
 */
export function FloatingVoiceInput({
  onTranscript,
  disabled = false,
  className,
}: Omit<VoiceInputProps, 'size' | 'variant' | 'placeholder'>) {
  const [isVisible, setIsVisible] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)

  const { permission, requestPermission } = useVoicePermission()
  const { config } = useVoiceConfig()
  const { state, startRecording, stopRecording, reset } = useVoiceRecorder(config)
  const { audioLevel } = useAudioLevel(state.isRecording ? {} as MediaStream : null)

  const isEnabled = !disabled && permission.isSupported && permission.state === 'granted' && config.enabled

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    setIsTranscribing(true)

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')

      // 添加超时控制
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // 检查响应状态
      if (!response.ok) {
        console.error(`HTTP ${response.status}: ${response.statusText}`)
        return
      }

      // 检查响应内容类型
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('服务器返回了无效的响应格式')
        return
      }

      // 安全解析JSON
      let data
      try {
        const responseText = await response.text()
        if (!responseText.trim()) {
          console.error('服务器返回了空响应')
          return
        }
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('JSON解析失败:', parseError)
        return
      }

      if (data.success && data.result?.text) {
        onTranscript(data.result.text.trim())
        setIsVisible(false) // 成功后隐藏
      } else {
        console.error('语音识别失败:', data.error?.message || '未知错误')
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('语音转录超时')
      } else {
        console.error('Transcription failed:', error)
      }
    } finally {
      setIsTranscribing(false)
    }
  }, [onTranscript])

  const handleToggle = useCallback(async () => {
    if (!isVisible) {
      setIsVisible(true)
      return
    }

    if (state.isRecording) {
      const audioBlob = await stopRecording()
      if (audioBlob) {
        await transcribeAudio(audioBlob)
      }
    } else {
      reset()
      await startRecording()
    }
  }, [isVisible, state.isRecording, stopRecording, startRecording, reset, transcribeAudio])

  return (
    <>
      {/* 浮动按钮 */}
      <div className={cn(
        'fixed bottom-6 right-6 z-50',
        className
      )}>
        <VoiceButton
          isRecording={state.isRecording}
          isProcessing={isTranscribing}
          isEnabled={isEnabled}
          onToggle={handleToggle}
          size="lg"
          variant="default"
          className="shadow-2xl hover:scale-110 transition-transform duration-200"
        />
      </div>

      {/* 状态面板 */}
      {isVisible && (
        <div className="fixed bottom-24 right-6 z-50 w-80">
          <div className="bg-background border rounded-lg shadow-2xl p-4 space-y-3">
            {permission.state !== 'granted' ? (
              <VoicePermission
                onRequest={requestPermission}
                permission={permission}
              />
            ) : (
              <VoiceStatus
                isRecording={state.isRecording}
                duration={state.duration}
                audioLevel={audioLevel}
                error={state.error}
                maxDuration={config.maxDuration}
              />
            )}

            <button
              onClick={() => setIsVisible(false)}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </>
  )
}
