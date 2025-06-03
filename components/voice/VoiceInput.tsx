/**
 * 主语音输入组件
 * 集成所有语音功能的核心组件
 */

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { type VoiceInputProps, VOICE_CONSTANTS } from '@/types/voice'
import { useVoicePermission } from './hooks/useVoicePermission'
import { useVoiceRecorder } from './hooks/useVoiceRecorder'
import { useVoiceConfig } from './hooks/useVoiceConfig'
import { useAudioLevel } from './hooks/useAudioVisualization'
import { VoiceButton } from './VoiceButton'
import { VoiceStatus } from './VoiceStatus'
import { VoicePermission } from './VoicePermission'
import { ProcessingStatus, SuccessStatus } from './VoiceStatus'
import { createVoiceError, VOICE_ERROR_CODES } from '@/lib/voice/errors'
import { VOICE_ERRORS, type VoiceError } from '@/types/errors'
import { isMobileDevice, isIOSDevice, supportsSpeechRecognition, supportsMediaRecorder } from '@/utils/deviceDetection'

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
  const [error, setError] = useState<VoiceError | null>(null)

  // Hooks
  const { permission, requestPermission } = useVoicePermission()
  const { config } = useVoiceConfig()
  const { state, startRecording, stopRecording, reset } = useVoiceRecorder(config)
  
  // 修复：正确获取音频流
  const mediaStream = state.isRecording ? state.stream : null
  const { audioLevel } = useAudioLevel(mediaStream)

  // 检查是否可以使用语音功能
  const isEnabled = !disabled && permission.isSupported && permission.state === 'granted' && config.enabled

  /**
   * 安全的错误处理函数
   */
  const handleVoiceError = useCallback((errorType: string, message: string, details?: any) => {
    const voiceError: VoiceError = {
      type: (VOICE_ERRORS as any)[errorType] || VOICE_ERRORS.API_ERROR,
      message,
      details
    }
    setError(voiceError)
    console.error('Voice Error:', voiceError)
  }, [])

  /**
   * 处理语音转录 - 调用后端代理接口
   */
  const transcribeAudio = useCallback(async (audioBlob: Blob): Promise<string | null> => {
    if (!audioBlob) {
      console.warn("没有音频数据进行转录");
      return null;
    }

    setIsTranscribing(true);
    setError(null); // 清除之前的错误

    const formData = new FormData();
    // 使用 .wav 后缀名，尽管实际内容取决于 MediaRecorder 的输出和浏览器的实现
    // 后端目前假设接收到的是 DashScope 'wav' 格式参数能处理的音频流
    formData.append('audio', audioBlob, 'recording.wav'); 

    try {
      // 调用后端代理接口
      const response = await fetch('/api/voice/dashscope-transcribe', {
        method: 'POST',
        body: formData,
        // 可选: 添加 AbortController 实现前端超时控制
        // const controller = new AbortController();
        // const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
        // signal: controller.signal,
      });
      // clearTimeout(timeoutId); // 如果使用了超时

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // 忽略JSON解析错误，使用状态文本
        }
        const errorMessage = errorData?.error || `语音识别服务请求失败: ${response.status} ${response.statusText}`;
        console.error('语音识别API错误:', errorMessage, errorData);
        handleVoiceError('TRANSCRIPTION_FAILED', errorMessage, errorData);
        return null;
      }

      const result = await response.json();

      if (result.success && typeof result.text === 'string') {
        // 转录成功
        setLastTranscript(result.text); // 可以选择保存最后一次成功的转录
        setShowSuccess(true); // 可以选择显示成功状态
        setTimeout(() => setShowSuccess(false), 3000); // 短暂显示成功后隐藏
        return result.text;
      } else {
        const errorMessage = result.error || '语音识别失败，未返回有效文本。';
        console.error('语音识别API逻辑错误:', errorMessage, result);
        handleVoiceError('TRANSCRIPTION_FAILED', errorMessage, result);
        return null;
      }
    } catch (error: any) {
      // if (error.name === 'AbortError') {
      //   console.error('语音转录请求超时');
      //   handleVoiceError('API_ERROR', '语音转录请求超时', error);
      // } else {
        console.error('调用语音识别API时发生网络或未知错误:', error);
        handleVoiceError('API_ERROR', `调用语音识别服务时出错: ${error.message}`, error);
      // }
      return null;
    } finally {
      setIsTranscribing(false);
    }
  }, [setError, setIsTranscribing, handleVoiceError, setLastTranscript, setShowSuccess /* 添加依赖 */]);

  /**
   * 处理录音切换
   */
  const handleToggle = useCallback(async () => {
    try {
      console.log('🔄 切换录音状态，当前状态:', state.isRecording)
      
      if (state.isRecording) {
        console.log('⏹️ 准备停止录音...')
        // 停止录音
        const audioBlob = await stopRecording()
        console.log('📦 获得录音数据:', audioBlob?.size, 'bytes')
        
        if (audioBlob) {
          console.log('🔄 开始转录 (DashScope)...')
          const transcribedText = await transcribeAudio(audioBlob)
          if (transcribedText && onTranscript) {
            console.log('✅ 转录成功:', transcribedText)
            onTranscript(transcribedText)
          }
        }
      } else {
        console.log('🎤 准备开始录音...')
        // 开始录音
        reset() // 清除之前的状态
        setShowSuccess(false)
        setError(null)
        await startRecording()
        console.log('✅ 录音已开始')
      }
    } catch (error) {
      console.error('❌ 切换录音状态失败:', error)
      handleVoiceError('RECORDING_FAILED', '录音操作失败', error instanceof Error ? error : String(error))
    }
  }, [state.isRecording, stopRecording, startRecording, reset, transcribeAudio, onTranscript, handleVoiceError])

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

  // 检查设备兼容性
  useEffect(() => {
    const checkCompatibility = () => {
      if (!supportsMediaRecorder()) {
        handleVoiceError('NOT_SUPPORTED', '当前浏览器不支持录音功能')
        return
      }
      
      if (isIOSDevice()) {
        // iOS特殊处理
        console.log('iOS device detected, applying iOS-specific optimizations')
      }
      
      if (isMobileDevice()) {
        // 移动端特殊处理
        console.log('Mobile device detected, applying mobile optimizations')
      }
    }
    
    checkCompatibility()
  }, [handleVoiceError])

  // 移动端优化的权限请求
  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          ...(isMobileDevice() && {
            sampleRate: 16000, // 移动端使用较低采样率
            channelCount: 1
          })
        } 
      })
      
      // 立即停止流，仅用于权限检查
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch (error) {
      console.error('Microphone permission denied:', error)
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          handleVoiceError('PERMISSION_DENIED', '需要麦克风权限才能使用语音功能，请在浏览器设置中允许访问麦克风')
        } else if (error.name === 'NotFoundError') {
          handleVoiceError('NOT_SUPPORTED', '未检测到麦克风设备')
        } else {
          handleVoiceError('API_ERROR', `无法访问麦克风: ${error.message}`)
        }
      }
      
      return false
    }
  }, [handleVoiceError])

  // 移动端优化的触摸事件处理
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    console.log('👆 触摸事件触发')
    e.preventDefault() // 防止iOS上的双击缩放
    handleToggle()
  }, [handleToggle])

  // 在组件中添加调试信息
  useEffect(() => {
    console.log('🔍 VoiceInput 状态更新:', {
      isRecording: state.isRecording,
      isTranscribing,
      isEnabled,
      hasError: !!error,
      permissionState: permission.state
    })
  }, [state.isRecording, isTranscribing, isEnabled, error, permission.state])

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
      {/* 调试信息 - 开发环境显示 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
          录音状态: {state.isRecording ? '录音中' : '未录音'} | 
          转录状态: {isTranscribing ? '转录中' : '空闲'} | 
          启用状态: {isEnabled ? '已启用' : '未启用'}
        </div>
      )}

      {/* 错误提示UI */}
      {error && (
        <div className="voice-error-message" style={{
          color: '#ef4444',
          fontSize: '12px',
          marginBottom: '8px',
          padding: '4px 8px',
          backgroundColor: '#fef2f2',
          borderRadius: '4px',
          border: '1px solid #fecaca'
        }}>
          {error.message}
          <button 
            onClick={() => setError(null)}
            style={{
              marginLeft: '8px',
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* 主按钮 */}
      <VoiceButton
        isRecording={state.isRecording}
        isProcessing={isTranscribing}
        isEnabled={isEnabled}
        onToggle={handleToggle}
        onTouchStart={isMobileDevice() ? handleTouchStart : undefined}
        size={size}
        variant={variant}
        className={cn(
          'voice-record-btn',
          state.isRecording && 'recording',
          error && 'opacity-50 cursor-not-allowed'
        )}
        disabled={!!error}
        aria-label={state.isRecording ? '停止录音' : '开始录音'}
      />

      {/* 音频可视化 */}
      {state.isRecording && (
        <div className="audio-visualization flex justify-center items-end h-8 gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={i}
              className="audio-level-bar bg-primary rounded-full transition-all duration-100"
              style={{ 
                width: '3px',
                height: `${Math.max((audioLevel * 100) * (0.5 + Math.random() * 0.5), 5)}%`,
                backgroundColor: audioLevel > 0.7 ? '#ef4444' : audioLevel > 0.4 ? '#f59e0b' : '#10b981'
              }}
            />
          ))}
        </div>
      )}

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
