/**
 * 自动调整大小的文本域组件
 * 根据内容自动调整高度，提供一致的用户体验
 */

'use client'

import React, { useRef, useEffect, forwardRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import type { AutoResizeTextareaProps } from './types'

const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  (
    {
      value = '',
      onChange,
      minRows = 1,
      maxRows = 10,
      disabled = false,
      placeholder,
      error,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [rows, setRows] = React.useState(minRows)

    // 合并refs
    const combinedRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
        textareaRef.current = node
      },
      [ref]
    )

    // 计算行数
    const calculateRows = useCallback(() => {
      const textarea = textareaRef.current
      if (!textarea) return minRows

      // 重置高度以获取正确的scrollHeight
      textarea.style.height = 'auto'
      
      // 计算行数
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10) || 20
      const scrollHeight = textarea.scrollHeight
      const calculatedRows = Math.ceil(scrollHeight / lineHeight)
      
      // 限制在minRows和maxRows之间
      const clampedRows = Math.max(minRows, Math.min(maxRows, calculatedRows))
      
      return clampedRows
    }, [minRows, maxRows])

    // 更新行数
    const updateRows = useCallback(() => {
      const newRows = calculateRows()
      if (newRows !== rows) {
        setRows(newRows)
      }
    }, [calculateRows, rows])

    // 处理值变化
    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = event.target.value
        onChange?.(newValue)
      },
      [onChange]
    )

    // 监听值变化，自动调整大小
    useEffect(() => {
      updateRows()
    }, [value, updateRows])

    // 监听窗口大小变化
    useEffect(() => {
      const handleResize = () => {
        updateRows()
      }

      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }, [updateRows])

    // 组件挂载后计算初始行数
    useEffect(() => {
      updateRows()
    }, [updateRows])

    return (
      <div className="relative">
        <Textarea
          ref={combinedRef}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            'resize-none overflow-hidden',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          style={{
            ...style,
            height: 'auto',
            minHeight: `${minRows * 20}px`, // 假设行高为20px
            maxHeight: `${maxRows * 20}px`,
          }}
          rows={rows}
          {...props}
        />
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

AutoResizeTextarea.displayName = 'AutoResizeTextarea'

export default AutoResizeTextarea

