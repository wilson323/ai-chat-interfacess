/**
 * 音频可视化 Hook
 * 处理音频分析和可视化数据生成
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  AudioVisualizationData,
  UseAudioVisualizationReturn
} from '@/types/voice'

interface UseAudioVisualizationProps {
  mediaStream?: MediaStream | null;
  isActive: boolean;
}

/**
 * 音频可视化 Hook
 */
export const useAudioVisualization = ({ mediaStream, isActive }: UseAudioVisualizationProps): UseAudioVisualizationReturn => {
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // 使用useCallback避免函数重新创建导致的无限循环
  const stopVisualization = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    setAudioLevel(0);
    setIsVisualizing(false);
  }, []); // 空依赖数组，函数不会重新创建

  const startVisualization = useCallback(() => {
    if (!mediaStream || isVisualizing) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(mediaStream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      
      setIsVisualizing(true);
      
      const updateAudioLevel = () => {
        if (!analyserRef.current || !isVisualizing) return;
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const normalizedLevel = Math.min(average / 128, 1);
        
        setAudioLevel(normalizedLevel);
        
        if (isVisualizing) {
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Audio visualization error:', error);
      stopVisualization();
    }
  }, [mediaStream, isVisualizing, stopVisualization]);

  // 修复useEffect，避免无限循环
  useEffect(() => {
    if (isActive && mediaStream && !isVisualizing) {
      startVisualization();
    } else if (!isActive && isVisualizing) {
      stopVisualization();
    }
    
    // 组件卸载时清理资源
    return () => {
      if (isVisualizing) {
        stopVisualization();
      }
    };
  }, [isActive, mediaStream]); // 移除isVisualizing从依赖数组，避免循环

  // 确保在组件卸载时清理资源
  useEffect(() => {
    return () => {
      stopVisualization();
    };
  }, [stopVisualization]);

  return {
    audioLevel,
    isVisualizing: isVisualizing && isActive,
    data: {
      audioLevel,
      waveformData: [],
      frequencyData: undefined,
    },
    isActive: isVisualizing && isActive
  };
};

/**
 * 简化的音频级别 Hook
 * 只返回音频级别，不包含复杂的频谱数据
 */
export function useAudioLevel(stream: MediaStream | null): {
  audioLevel: number
  isActive: boolean
} {
  // 修复：正确调用useAudioVisualization
  const { audioLevel, isActive } = useAudioVisualization({ 
    mediaStream: stream, 
    isActive: !!stream 
  });

  return {
    audioLevel,
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
