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

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

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
          data.error?.suggestion
        )
      }
    } catch (error: any) {
      console.error('Transcription failed:', error)
      // 错误会通过 state.error 显示
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
    await requestPermission()
  }, [requestPermission])

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

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success && data.result?.text) {
        onTranscript(data.result.text.trim())
      }
    } catch (error) {
      console.error('Transcription failed:', error)
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
    await requestPermission()
  }, [requestPermission])

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

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success && data.result?.text) {
        onTranscript(data.result.text.trim())
        setIsVisible(false) // 成功后隐藏
      }
    } catch (error) {
      console.error('Transcription failed:', error)
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
