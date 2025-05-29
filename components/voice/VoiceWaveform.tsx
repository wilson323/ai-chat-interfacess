/**
 * 音频波形可视化组件
 * 实时显示音频波形和音量级别
 */

import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { VoiceWaveformProps } from '@/types/voice'

/**
 * 基础波形组件
 */
export function VoiceWaveform({
  audioLevel,
  bars = 5,
  animationDuration = 100,
  className,
}: VoiceWaveformProps) {
  // 生成波形条的高度
  const barHeights = useMemo(() => {
    const heights: number[] = []
    
    for (let i = 0; i < bars; i++) {
      // 创建波形效果：中间高，两边低
      const position = i / (bars - 1) // 0 到 1
      const centerDistance = Math.abs(position - 0.5) * 2 // 0 到 1，中心为0
      const baseHeight = 1 - centerDistance * 0.3 // 中心高度为1，边缘为0.7
      
      // 应用音频级别
      const height = Math.max(0.1, baseHeight * audioLevel * (0.8 + Math.random() * 0.4))
      heights.push(Math.min(height, 1))
    }
    
    return heights
  }, [audioLevel, bars])

  return (
    <div className={cn(
      'flex items-center justify-center gap-1',
      className
    )}>
      {barHeights.map((height, index) => (
        <div
          key={index}
          className="bg-current rounded-full transition-all ease-out"
          style={{
            width: '3px',
            height: `${Math.max(4, height * 20)}px`,
            transitionDuration: `${animationDuration}ms`,
          }}
        />
      ))}
    </div>
  )
}

/**
 * 圆形波形组件
 */
export function CircularWaveform({
  audioLevel,
  size = 60,
  strokeWidth = 3,
  className,
}: {
  audioLevel: number
  size?: number
  strokeWidth?: number
  className?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = audioLevel * circumference

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      {/* 背景圆环 */}
      <svg
        className="absolute inset-0 transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="opacity-20"
        />
        
        {/* 进度圆环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-100 ease-out"
          strokeLinecap="round"
        />
      </svg>
      
      {/* 中心点 */}
      <div className={cn(
        'absolute inset-0 flex items-center justify-center',
        audioLevel > 0.1 && 'animate-pulse'
      )}>
        <div
          className="bg-current rounded-full transition-all duration-100"
          style={{
            width: `${4 + audioLevel * 8}px`,
            height: `${4 + audioLevel * 8}px`,
          }}
        />
      </div>
    </div>
  )
}

/**
 * 频谱波形组件
 */
export function SpectrumWaveform({
  frequencyData,
  bars = 32,
  maxHeight = 40,
  className,
}: {
  frequencyData?: Uint8Array
  bars?: number
  maxHeight?: number
  className?: string
}) {
  const barHeights = useMemo(() => {
    if (!frequencyData) {
      return Array(bars).fill(0)
    }

    const heights: number[] = []
    const step = Math.floor(frequencyData.length / bars)
    
    for (let i = 0; i < bars; i++) {
      const index = i * step
      const value = frequencyData[index] || 0
      heights.push(value / 255) // 归一化到 0-1
    }
    
    return heights
  }, [frequencyData, bars])

  return (
    <div className={cn(
      'flex items-end justify-center gap-1',
      className
    )}>
      {barHeights.map((height, index) => (
        <div
          key={index}
          className="bg-current rounded-t transition-all duration-75 ease-out"
          style={{
            width: '2px',
            height: `${Math.max(2, height * maxHeight)}px`,
          }}
        />
      ))}
    </div>
  )
}

/**
 * 脉冲波形组件
 */
export function PulseWaveform({
  audioLevel,
  pulseCount = 3,
  className,
}: {
  audioLevel: number
  pulseCount?: number
  className?: string
}) {
  return (
    <div className={cn(
      'flex items-center justify-center',
      className
    )}>
      {Array.from({ length: pulseCount }).map((_, index) => (
        <div
          key={index}
          className="absolute rounded-full border-2 border-current animate-ping"
          style={{
            width: `${20 + index * 10 + audioLevel * 20}px`,
            height: `${20 + index * 10 + audioLevel * 20}px`,
            animationDelay: `${index * 200}ms`,
            animationDuration: '1s',
            opacity: Math.max(0.1, 0.8 - index * 0.2),
          }}
        />
      ))}
      
      {/* 中心点 */}
      <div
        className="bg-current rounded-full transition-all duration-100"
        style={{
          width: `${8 + audioLevel * 8}px`,
          height: `${8 + audioLevel * 8}px`,
        }}
      />
    </div>
  )
}

/**
 * 线性波形组件
 */
export function LinearWaveform({
  waveformData,
  width = 200,
  height = 40,
  strokeWidth = 2,
  className,
}: {
  waveformData: number[]
  width?: number
  height?: number
  strokeWidth?: number
  className?: string
}) {
  const pathData = useMemo(() => {
    if (waveformData.length === 0) {
      return `M 0 ${height / 2} L ${width} ${height / 2}`
    }

    const step = width / (waveformData.length - 1)
    let path = ''

    waveformData.forEach((value, index) => {
      const x = index * step
      const y = height / 2 + (value - 0.5) * height * 0.8
      
      if (index === 0) {
        path += `M ${x} ${y}`
      } else {
        path += ` L ${x} ${y}`
      }
    })

    return path
  }, [waveformData, width, height])

  return (
    <svg
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
    >
      <path
        d={pathData}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-100"
      />
    </svg>
  )
}

/**
 * 动态波形组件
 * 结合多种效果的综合波形显示
 */
export function DynamicWaveform({
  audioLevel,
  waveformData,
  isActive = false,
  variant = 'bars',
  className,
}: {
  audioLevel: number
  waveformData?: number[]
  isActive?: boolean
  variant?: 'bars' | 'circular' | 'spectrum' | 'pulse' | 'linear'
  className?: string
}) {
  const baseClassName = cn(
    'text-primary transition-colors duration-200',
    isActive ? 'text-primary' : 'text-muted-foreground',
    className
  )

  switch (variant) {
    case 'circular':
      return (
        <CircularWaveform
          audioLevel={audioLevel}
          className={baseClassName}
        />
      )
    
    case 'pulse':
      return (
        <PulseWaveform
          audioLevel={audioLevel}
          className={baseClassName}
        />
      )
    
    case 'linear':
      return waveformData ? (
        <LinearWaveform
          waveformData={waveformData}
          className={baseClassName}
        />
      ) : null
    
    case 'bars':
    default:
      return (
        <VoiceWaveform
          audioLevel={audioLevel}
          className={baseClassName}
        />
      )
  }
}

/**
 * 波形容器组件
 * 提供统一的布局和样式
 */
export function WaveformContainer({
  children,
  title,
  isActive = false,
  className,
}: {
  children: React.ReactNode
  title?: string
  isActive?: boolean
  className?: string
}) {
  return (
    <div className={cn(
      'flex flex-col items-center gap-2 p-3 rounded-lg border',
      isActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/30',
      className
    )}>
      {title && (
        <span className={cn(
          'text-xs font-medium',
          isActive ? 'text-primary' : 'text-muted-foreground'
        )}>
          {title}
        </span>
      )}
      {children}
    </div>
  )
}
