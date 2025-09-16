/**
 * 统一消息内容组件
 * 处理消息内容的渲染和展示
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { MarkdownMessage } from '../../components/markdown-message';
import { LazyImage } from '../../components/lazy-image';
import type { MessageContentProps } from '../../types/chat';

export function MessageContent({
  content,
  role,
  metadata: _metadata, // 重命名避免未使用警告
  className,
}: MessageContentProps) {
  const isUser = role === 'user';
  const isAI = role === 'assistant';

  // 处理图片内容
  const renderImageContent = (content: string) => {
    // 简单的图片URL检测
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const images: string[] = [];
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      if (match[1]) {
        images.push(match[1]);
      }
    }

    if (images.length > 0) {
      return (
        <div className='space-y-2'>
          {images.map((imageUrl, index) => (
            <LazyImage
              key={index}
              src={imageUrl}
              alt={`图片 ${index + 1}`}
              className='max-w-full h-auto rounded-lg'
            />
          ))}
        </div>
      );
    }

    return null;
  };

  // 处理文件内容
  const renderFileContent = (content: string) => {
    const fileRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const files: Array<{ name: string; url: string }> = [];
    let match;

    while ((match = fileRegex.exec(content)) !== null) {
      if (match[1] && match[2]) {
        files.push({ name: match[1], url: match[2] });
      }
    }

    if (files.length > 0) {
      return (
        <div className='space-y-2'>
          {files.map((file, index) => (
            <a
              key={index}
              href={file.url}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 underline'
            >
              <span>{file.name}</span>
            </a>
          ))}
        </div>
      );
    }

    return null;
  };

  // 渲染消息内容
  const renderContent = () => {
    if (isUser) {
      // 用户消息：简单文本展示
      return <div className='whitespace-pre-wrap break-words'>{content}</div>;
    }

    if (isAI) {
      // AI消息：支持Markdown渲染
      return (
        <div className='space-y-3'>
          {/* 图片内容 */}
          {renderImageContent(content)}

          {/* 文件内容 */}
          {renderFileContent(content)}

          {/* Markdown内容 */}
          <MarkdownMessage content={content} />
        </div>
      );
    }

    return <div className='whitespace-pre-wrap break-words'>{content}</div>;
  };

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none',
        isUser && 'prose-gray',
        isAI && 'prose-slate',
        className
      )}
    >
      {renderContent()}
    </div>
  );
}
