/**
 * 语音录音核心 Hook
 * 处理录音逻辑、音频处理和状态管理
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { 
  VoiceConfig, 
  VoiceRecordingState, 
  UseVoiceRecorderReturn,
  VOICE_CONSTANTS 
} from '@/types/voice'
import { 
  getRecordingOptions, 
  getBestAudioFormat 
} from '@/lib/voice/config'
import { 
  handleMediaError, 
  handleRecorderError, 
  createVoiceError,
  VOICE_ERROR_CODES 
} from '@/lib/voice/errors'

/**
 * 语音录音 Hook
 */
export function useVoiceRecorder(config: VoiceConfig): UseVoiceRecorderReturn {
  // 状态管理
  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    isProcessing: false,
    duration: 0,
    audioLevel: 0,
    error: null,
    isReady: false,
    stream: null
  })

  // 引用管理
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * 清理资源
   */
  const cleanup = useCallback(() => {
    // 停止录音
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    // 停止媒体流
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    // 关闭音频上下文
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    // 清理定时器
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // 清理动画帧
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    // 清理引用
    mediaRecorderRef.current = null
    analyserRef.current = null
    chunksRef.current = []

    // 清理录音时长定时器
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
      durationIntervalRef.current = null
    }

    // 清理流
    mediaStreamRef.current = null
    state.stream = null
  }, [])

  /**
   * 更新音频级别
   */
  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    // 计算平均音量
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
    const normalizedLevel = Math.min(average / 128, 1) // 归一化到 0-1

    setState(prev => ({
      ...prev,
      audioLevel: normalizedLevel,
    }))

    if (state.isRecording) {
      animationRef.current = requestAnimationFrame(updateAudioLevel)
    }
  }, [state.isRecording])

  /**
   * 开始录音
   */
  const startRecording = useCallback(async (): Promise<void> => {
    try {
      console.log('🎤 开始录音...')
      
      setState(prev => ({
        ...prev,
        error: null,
        isReady: false,
      }))

      // 检查配置
      if (!config.enabled) {
        throw createVoiceError(
          VOICE_ERROR_CODES.CONFIG_MISSING,
          '语音功能未启用',
          '请在设置中启用语音功能'
        )
      }

      // 获取媒体流
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: config.sampleRate || 16000,
          channelCount: 1
        }
      })

      mediaStreamRef.current = stream
      chunksRef.current = []

      // 创建音频上下文用于可视化
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        audioContextRef.current = new AudioContext()
        
        const source = audioContextRef.current.createMediaStreamSource(stream)
        const analyser = audioContextRef.current.createAnalyser()
        
        analyser.fftSize = 256
        analyser.smoothingTimeConstant = 0.8
        
        source.connect(analyser)
        analyserRef.current = analyser
      } catch (error) {
        console.warn('Failed to create audio context for visualization:', error)
      }

      // 创建 MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current = mediaRecorder

      // 设置事件监听器
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
          console.log('📦 录音数据块:', event.data.size, 'bytes')
        }
      }

      mediaRecorder.onstop = () => {
        console.log('⏹️ 录音停止')
        // 清理定时器
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current)
          durationIntervalRef.current = null
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error('❌ 录音错误:', event)
        setState(prev => ({
          ...prev,
          error: '录音过程中发生错误',
          isRecording: false
        }))
      }

      // 开始录音
      mediaRecorder.start(100) // 每100ms收集一次数据
      startTimeRef.current = Date.now()

      // 开始计时
      durationIntervalRef.current = setInterval(() => {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setState(prev => ({ ...prev, duration }))

        // 检查最大录音时长
        if (duration >= (config.maxDuration || 60)) {
          console.log('⏰ 达到最大录音时长，自动停止')
          stopRecording()
        }
      }, 1000)

      setState(prev => ({
        ...prev,
        isRecording: true,
        error: null,
        stream: stream,
        duration: 0
      }))

      // 开始音频可视化
      if (analyserRef.current) {
        updateAudioLevel()
      }

      console.log('✅ 录音开始成功')
    } catch (error: any) {
      const voiceError = handleMediaError(error)
      setState(prev => ({
        ...prev,
        error: voiceError.message,
        isRecording: false,
        isReady: false,
      }))
      cleanup()
      throw voiceError
    }
  }, [config, updateAudioLevel, cleanup])

  /**
   * 停止录音
   */
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    try {
      console.log('🛑 停止录音...')

      if (!mediaRecorderRef.current || !mediaStreamRef.current) {
        console.warn('⚠️ 没有活动的录音会话')
        return null
      }

      return new Promise<Blob | null>((resolve) => {
        const mediaRecorder = mediaRecorderRef.current!

        // 设置停止事件监听器
        mediaRecorder.onstop = () => {
          console.log('📁 处理录音数据...')
          
          // 创建音频 Blob
          const audioBlob = new Blob(chunksRef.current, { 
            type: 'audio/webm;codecs=opus' 
          })
          
          console.log('✅ 录音数据处理完成:', audioBlob.size, 'bytes')

          // 清理资源
          cleanup()
          
          resolve(audioBlob)
        }

        // 停止录音
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop()
        }

        // 更新状态
        setState(prev => ({
          ...prev,
          isRecording: false,
          stream: null
        }))
      })
    } catch (error) {
      console.error('❌ 停止录音失败:', error)
      cleanup()
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '停止录音失败',
        isRecording: false
      }))
      return null
    }
  }, [cleanup])

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    console.log('🔄 重置录音状态...')
    cleanup()
    setState({
      isRecording: false,
      isProcessing: false,
      duration: 0,
      audioLevel: 0,
      error: null,
      isReady: false,
      stream: null
    })
  }, [cleanup])

  // 组件卸载时清理资源
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return {
    state,
    startRecording,
    stopRecording,
    reset,
    cleanup
  }
}

/**
 * 格式化录音时长
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * 获取录音状态描述
 */
export function getRecordingStateDescription(state: VoiceRecordingState): string {
  if (state.error) {
    return state.error
  }
  
  if (state.isProcessing) {
    return '正在处理录音...'
  }
  
  if (state.isRecording) {
    return `录音中 ${formatDuration(state.duration)}`
  }
  
  if (state.isReady) {
    return '准备就绪'
  }
  
  return '点击开始录音'
}
