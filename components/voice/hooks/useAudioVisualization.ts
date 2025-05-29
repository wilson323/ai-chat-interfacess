/**
 * 音频可视化 Hook
 * 处理音频分析和可视化数据生成
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  AudioVisualizationData,
  UseAudioVisualizationReturn
} from '@/types/voice'

/**
 * 音频可视化 Hook
 */
export function useAudioVisualization(
  stream: MediaStream | null,
  options: {
    fftSize?: number
    smoothingTimeConstant?: number
    minDecibels?: number
    maxDecibels?: number
    updateInterval?: number
  } = {}
): UseAudioVisualizationReturn {
  const {
    fftSize = 256,
    smoothingTimeConstant = 0.8,
    minDecibels = -90,
    maxDecibels = -10,
    updateInterval = 16, // ~60fps
  } = options

  const [data, setData] = useState<AudioVisualizationData>({
    audioLevel: 0,
    waveformData: [],
    frequencyData: undefined,
  })

  const [isActive, setIsActive] = useState(false)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * 清理音频上下文和相关资源
   */
  const cleanup = useCallback(() => {
    // 停止动画
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    // 停止定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // 断开音频源
    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }

    // 关闭音频上下文
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserRef.current = null
    setIsActive(false)
  }, [])

  /**
   * 初始化音频分析器
   */
  const initializeAnalyzer = useCallback(async (mediaStream: MediaStream) => {
    try {
      // 创建音频上下文
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) {
        console.warn('AudioContext not supported')
        return false
      }

      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      // 创建分析器节点
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = fftSize
      analyser.smoothingTimeConstant = smoothingTimeConstant
      analyser.minDecibels = minDecibels
      analyser.maxDecibels = maxDecibels

      analyserRef.current = analyser

      // 创建媒体流源
      const source = audioContext.createMediaStreamSource(mediaStream)
      sourceRef.current = source

      // 连接节点
      source.connect(analyser)

      return true
    } catch (error) {
      console.warn('Failed to initialize audio analyzer:', error)
      cleanup()
      return false
    }
  }, [fftSize, smoothingTimeConstant, minDecibels, maxDecibels, cleanup])

  /**
   * 更新可视化数据
   */
  const updateVisualization = useCallback(() => {
    if (!analyserRef.current) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const timeDataArray = new Uint8Array(bufferLength)

    // 获取频域数据
    analyser.getByteFrequencyData(dataArray)
    // 获取时域数据
    analyser.getByteTimeDomainData(timeDataArray)

    // 计算音频级别（RMS）
    let sum = 0
    for (let i = 0; i < timeDataArray.length; i++) {
      const sample = (timeDataArray[i] - 128) / 128
      sum += sample * sample
    }
    const rms = Math.sqrt(sum / timeDataArray.length)
    const audioLevel = Math.min(rms * 3, 1) // 放大并限制在0-1范围

    // 生成波形数据（取样）
    const waveformSampleCount = 32
    const waveformData: number[] = []
    const step = Math.floor(bufferLength / waveformSampleCount)

    for (let i = 0; i < waveformSampleCount; i++) {
      const index = i * step
      if (index < dataArray.length) {
        waveformData.push(dataArray[index] / 255) // 归一化到0-1
      }
    }

    setData({
      audioLevel,
      waveformData,
      frequencyData: dataArray,
    })
  }, [])

  /**
   * 开始可视化
   */
  const startVisualization = useCallback(() => {
    if (!analyserRef.current) return

    setIsActive(true)

    // 使用定时器而不是 requestAnimationFrame 以获得更稳定的更新频率
    intervalRef.current = setInterval(updateVisualization, updateInterval)
  }, [updateVisualization, updateInterval])

  /**
   * 停止可视化
   */
  const stopVisualization = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setIsActive(false)
    setData({
      audioLevel: 0,
      waveformData: [],
      frequencyData: undefined,
    })
  }, [])

  /**
   * 处理媒体流变化
   */
  useEffect(() => {
    if (stream) {
      initializeAnalyzer(stream).then((success) => {
        if (success) {
          startVisualization()
        }
      })
    } else {
      stopVisualization()
      cleanup()
    }

    return () => {
      stopVisualization()
      cleanup()
    }
  }, [stream]) // 移除函数依赖，避免无限循环

  return {
    data,
    isActive,
  }
}

/**
 * 简化的音频级别 Hook
 * 只返回音频级别，不包含复杂的频谱数据
 */
export function useAudioLevel(stream: MediaStream | null): {
  audioLevel: number
  isActive: boolean
} {
  const { data, isActive } = useAudioVisualization(stream, {
    fftSize: 128, // 更小的 FFT 大小以提高性能
    updateInterval: 50, // 更低的更新频率
  })

  return {
    audioLevel: data.audioLevel,
    isActive,
  }
}

/**
 * 波形数据处理工具
 */
export class WaveformProcessor {
  /**
   * 平滑波形数据
   */
  static smooth(data: number[], factor: number = 0.3): number[] {
    if (data.length === 0) return data

    const smoothed = [data[0]]
    for (let i = 1; i < data.length; i++) {
      smoothed[i] = smoothed[i - 1] * factor + data[i] * (1 - factor)
    }
    return smoothed
  }

  /**
   * 归一化波形数据
   */
  static normalize(data: number[]): number[] {
    if (data.length === 0) return data

    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min

    if (range === 0) return data.map(() => 0)

    return data.map(value => (value - min) / range)
  }

  /**
   * 降采样波形数据
   */
  static downsample(data: number[], targetLength: number): number[] {
    if (data.length <= targetLength) return data

    const step = data.length / targetLength
    const result: number[] = []

    for (let i = 0; i < targetLength; i++) {
      const index = Math.floor(i * step)
      result.push(data[index])
    }

    return result
  }

  /**
   * 应用窗口函数（汉宁窗）
   */
  static applyHanningWindow(data: number[]): number[] {
    const length = data.length
    return data.map((value, i) => {
      const window = 0.5 * (1 - Math.cos(2 * Math.PI * i / (length - 1)))
      return value * window
    })
  }
}

/**
 * 音频可视化工具函数
 */
export const AudioVisualizationUtils = {
  /**
   * 将音频级别转换为分贝
   */
  levelToDecibels(level: number): number {
    if (level <= 0) return -Infinity
    return 20 * Math.log10(level)
  },

  /**
   * 将分贝转换为音频级别
   */
  decibelsToLevel(decibels: number): number {
    if (decibels === -Infinity) return 0
    return Math.pow(10, decibels / 20)
  },

  /**
   * 获取频率对应的索引
   */
  frequencyToIndex(frequency: number, sampleRate: number, fftSize: number): number {
    return Math.round(frequency * fftSize / sampleRate)
  },

  /**
   * 获取索引对应的频率
   */
  indexToFrequency(index: number, sampleRate: number, fftSize: number): number {
    return index * sampleRate / fftSize
  },

  /**
   * 计算频谱的峰值频率
   */
  getPeakFrequency(frequencyData: Uint8Array, sampleRate: number): number {
    let maxIndex = 0
    let maxValue = 0

    for (let i = 0; i < frequencyData.length; i++) {
      if (frequencyData[i] > maxValue) {
        maxValue = frequencyData[i]
        maxIndex = i
      }
    }

    return this.indexToFrequency(maxIndex, sampleRate, frequencyData.length * 2)
  },
}
