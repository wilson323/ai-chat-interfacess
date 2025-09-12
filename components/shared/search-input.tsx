/**
 * 搜索输入组件
 * 基于shadcn/ui Input实现，减少自定义代码
 */

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SearchInputProps } from './types'

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value = '',
      onChange,
      onSearch,
      onClear,
      placeholder = '搜索...',
      loading = false,
      disabled = false,
      clearable = true,
      debounceMs = 300,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(value)
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

    // 同步外部值变化
    useEffect(() => {
      setInternalValue(value)
    }, [value])

    // 防抖处理
    const debouncedSearch = useCallback(
      (searchValue: string) => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }

        debounceTimerRef.current = setTimeout(() => {
          onSearch?.(searchValue)
        }, debounceMs)
      },
      [onSearch, debounceMs]
    )

    // 处理输入变化
    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value
        setInternalValue(newValue)
        onChange?.(newValue)
        debouncedSearch(newValue)
      },
      [onChange, debouncedSearch]
    )

    // 处理清除
    const handleClear = useCallback(() => {
      setInternalValue('')
      onChange?.('')
      onClear?.()
      onSearch?.('')
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }, [onChange, onClear, onSearch])

    // 处理键盘事件
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && onSearch) {
          event.preventDefault()
          onSearch(internalValue)
        } else if (event.key === 'Escape') {
          handleClear()
        }
      },
      [internalValue, onSearch, handleClear]
    )

    // 清理定时器
    useEffect(() => {
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }
      }
    }, [])

    const showClearButton = clearable && internalValue.length > 0 && !disabled

    return (
      <div className={cn('relative', className)} style={style}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          
          <Input
            ref={ref}
            type="text"
            value={internalValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="pl-10 pr-20"
            {...props}
          />
          
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            
            {showClearButton && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 w-6 p-0"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'

export default SearchInput

