/**
 * 自动调整大小的文本域组件
 * 基于shadcn/ui Textarea实现，减少自定义代码
 */

'use client';

import React, { forwardRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import type { AutoResizeTextareaProps } from './types';

const AutoResizeTextarea = forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(
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
    // 处理值变化和自动调整大小
    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = event.target.value;
        onChange?.(newValue);

        // 自动调整高度
        const textarea = event.target;
        textarea.style.height = 'auto';
        const lineHeight =
          parseInt(getComputedStyle(textarea).lineHeight, 10) || 20;
        const scrollHeight = textarea.scrollHeight;
        const calculatedRows = Math.ceil(scrollHeight / lineHeight);
        const clampedRows = Math.max(
          minRows,
          Math.min(maxRows, calculatedRows)
        );
        textarea.style.height = `${clampedRows * lineHeight}px`;
      },
      [onChange, minRows, maxRows]
    );

    return (
      <div className='relative'>
        <Textarea
          ref={ref}
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
            minHeight: `${minRows * 20}px`,
            maxHeight: `${maxRows * 20}px`,
          }}
          {...props}
        />

        {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
      </div>
    );
  }
);

AutoResizeTextarea.displayName = 'AutoResizeTextarea';

export default AutoResizeTextarea;
