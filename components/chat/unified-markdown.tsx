/**
 * 统一Markdown渲染组件
 * 合并MarkdownMessage、CodeBlock、SimpleCodeBlock等功能
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { Button } from '../../components/ui/button';
import {
  Copy,
  Check,
  ExternalLink,
  /* Loader2, */ X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { ErrorBoundary } from '../../components/error-boundary';
import { LazyImage } from '../../components/lazy-image';

interface UnifiedMarkdownProps {
  content: string;
  className?: string;
  enableImageExpand?: boolean;
  enableCodeCopy?: boolean;
  enableSyntaxHighlight?: boolean;
  enableTable?: boolean;
  enableMath?: boolean;
  showLineNumbers?: boolean;
}

export function UnifiedMarkdown({
  content,
  className,
  enableImageExpand = true,
  enableCodeCopy = true,
  enableSyntaxHighlight = true,
  enableTable = true,
  // enableMath = false, // 未使用
  showLineNumbers = false,
}: UnifiedMarkdownProps) {
  const [state, setState] = useState({
    mounted: false,
    copiedCode: null as string | null,
    expandedImage: null as string | null,
    imageLoadingStates: {} as {
      [key: string]: { isLoading: boolean; error: boolean };
    },
    expandedCodeBlocks: new Set<string>(),
  });

  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // const isMobile = useMobile(); // 未使用

  // 防止水合不匹配
  useEffect(() => {
    setState(prev => ({ ...prev, mounted: true }));
  }, []);

  // 处理代码复制
  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    setState(prev => ({ ...prev, copiedCode: code }));
    setTimeout(() => setState(prev => ({ ...prev, copiedCode: null })), 2000);
  }, []);

  // 处理图片点击
  const handleImageClick = useCallback((src: string) => {
    if (enableImageExpand) {
      setState(prev => ({ ...prev, expandedImage: src }));
    }
  }, [enableImageExpand]);

  // 处理代码块展开/收起
  const handleCodeBlockToggle = useCallback((blockId: string) => {
    setState(prev => ({
      ...prev,
      expandedCodeBlocks: prev.expandedCodeBlocks.has(blockId)
        ? new Set([...prev.expandedCodeBlocks].filter(id => id !== blockId))
        : new Set([...prev.expandedCodeBlocks, blockId]),
    }));
  }, []);

  // 处理图片加载状态
  const handleImageLoad = useCallback((src: string) => {
    setState(prev => ({
      ...prev,
      imageLoadingStates: {
        ...prev.imageLoadingStates,
        [src]: { isLoading: false, error: false },
      },
    }));
  }, []);

  const handleImageError = useCallback((src: string) => {
    setState(prev => ({
      ...prev,
      imageLoadingStates: {
        ...prev.imageLoadingStates,
        [src]: { isLoading: false, error: true },
      },
    }));
  }, []);

  if (!content || typeof content !== 'string' || content.trim() === '') {
    return (
      <div
        className={cn(
          'whitespace-pre-wrap text-sm sm:text-base leading-relaxed',
          className
        )}
      />
    );
  }

  const safeContent = typeof content === 'string' ? content : '';
  const rehypePlugins = enableSyntaxHighlight ? [rehypeHighlight] : [];

  // 生成代码块ID
  const generateCodeBlockId = (code: string, index: number) => {
    return `code-block-${index}-${code.slice(0, 10).replace(/\s/g, '')}`;
  };

  // 渲染代码块
  const renderCodeBlock = (props: { children: React.ReactNode; className?: string; [key: string]: unknown }) => {
    const { children, className, ...rest } = props;
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const code = String(children).replace(/\n$/, '');
    const blockId = generateCodeBlockId(code, Math.random());
    const isExpanded = state.expandedCodeBlocks.has(blockId);
    const isLongCode = code.split('\n').length > 10;

    return (
      <div className='relative group my-4'>
        {/* 语言标签 */}
        {language && (
          <div className='absolute top-2 right-12 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded'>
            {language}
          </div>
        )}

        {/* 代码内容 */}
        <pre
          className={cn(
            'bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono border',
            isDark
              ? 'bg-[#181c23] text-[#e6e6e6] border-gray-700'
              : 'bg-gray-100 text-gray-800 border-gray-200',
            className
          )}
        >
          <code className={className} {...rest}>
            {showLineNumbers && language
              ? code.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    <span className='text-muted-foreground select-none mr-4'>
                      {String(i + 1).padStart(
                        String(code.split('\n').length).length,
                        ' '
                      )}
                    </span>
                    {line}
                    {'\n'}
                  </React.Fragment>
                ))
              : code}
          </code>
        </pre>

        {/* 操作按钮 */}
        <div className='absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity'>
          {enableCodeCopy && (
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 p-0'
              onClick={() => handleCopyCode(code)}
            >
              {state.copiedCode === code ? (
                <Check className='h-4 w-4' />
              ) : (
                <Copy className='h-4 w-4' />
              )}
            </Button>
          )}

          {isLongCode && (
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 p-0'
              onClick={() => handleCodeBlockToggle(blockId)}
            >
              {isExpanded ? (
                <Minimize2 className='h-4 w-4' />
              ) : (
                <Maximize2 className='h-4 w-4' />
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  // 渲染内联代码
  const renderInlineCode = (props: { children: React.ReactNode; className?: string }) => {
    const { children, className } = props;
    return (
      <code
        className={cn(
          'font-mono text-sm px-2 py-1 rounded border',
          isDark
            ? 'bg-gray-800 text-gray-200 border-gray-600'
            : 'bg-gray-100 text-gray-800 border-gray-200',
          className
        )}
      >
        {children}
      </code>
    );
  };

  // 渲染图片
  const renderImage = (props: { src?: string; alt?: string; title?: string; [key: string]: unknown }) => {
    const { src, alt, title, ...rest } = props;
    if (typeof src !== 'string' || !src.trim()) return null;

    const safeAlt = typeof alt === 'string' ? alt : '';
    const safeTitle = typeof title === 'string' ? title : '';
    const safeRest = Object.fromEntries(
      Object.entries(rest).filter(([_, v]) => typeof v === 'string')
    );

    return (
      <div className='my-4'>
        <LazyImage
          src={src}
          alt={safeAlt}
          title={safeTitle}
          className='max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity'
          onClick={() => handleImageClick(src)}
          onLoad={() => handleImageLoad(src)}
          onError={() => handleImageError(src)}
          {...safeRest}
        />
        {safeTitle && (
          <p className='text-sm text-muted-foreground mt-2 text-center'>
            {safeTitle}
          </p>
        )}
      </div>
    );
  };

  // 渲染链接
  const renderLink = (props: { href?: string; children: React.ReactNode }) => {
    const { href, children } = props;
    const isExternal = href?.startsWith('http');

    return (
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className='text-primary hover:text-primary/80 underline underline-offset-4 inline-flex items-center space-x-1'
      >
        <span>{children}</span>
        {isExternal && <ExternalLink className='h-3 w-3' />}
      </a>
    );
  };

  // 渲染表格
  const renderTable = (props: { children: React.ReactNode }) => {
    if (!enableTable) return <div>{props.children}</div>;

    return (
      <div className='overflow-x-auto my-4'>
        <table className='min-w-full border-collapse border border-border'>
          {props.children}
        </table>
      </div>
    );
  };

  const renderTableHead = (props: { children: React.ReactNode }) => (
    <thead className='bg-muted'>
      <tr>{props.children}</tr>
    </thead>
  );

  const renderTableBody = (props: { children: React.ReactNode }) => (
    <tbody className='divide-y divide-border'>{props.children}</tbody>
  );

  const renderTableRow = (props: { children: React.ReactNode }) => (
    <tr className='hover:bg-muted/50'>{props.children}</tr>
  );

  const renderTableCell = (props: { children: React.ReactNode }) => (
    <td className='px-4 py-2 border border-border text-sm'>{props.children}</td>
  );

  const renderTableHeaderCell = (props: { children: React.ReactNode }) => (
    <th className='px-4 py-2 border border-border text-sm font-medium text-left'>
      {props.children}
    </th>
  );

  if (!state.mounted) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className='h-4 bg-muted rounded mb-2' />
        <div className='h-4 bg-muted rounded mb-2' />
        <div className='h-4 bg-muted rounded w-3/4' />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={cn('prose prose-sm max-w-none', className)}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[...rehypePlugins, rehypeRaw]}
          components={{
            code: renderInlineCode as any,
            pre: renderCodeBlock as any,
            img: renderImage as any,
            a: renderLink as any,
            table: renderTable as any,
            thead: renderTableHead as any,
            tbody: renderTableBody as any,
            tr: renderTableRow as any,
            td: renderTableCell as any,
            th: renderTableHeaderCell as any,
            ul: ({ children }) => (
              <ul className='list-disc pl-5 space-y-1 my-4'>{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className='list-decimal pl-5 space-y-1 my-4'>{children}</ol>
            ),
            li: ({ children }) => (
              <li className='text-sm leading-relaxed'>{children}</li>
            ),
            blockquote: ({ children }) => (
              <blockquote className='border-l-4 border-primary pl-4 py-2 my-4 bg-muted/50 rounded-r'>
                {children}
              </blockquote>
            ),
            h1: ({ children }) => (
              <h1 className='text-2xl font-bold my-4 text-foreground'>
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className='text-xl font-semibold my-3 text-foreground'>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className='text-lg font-medium my-2 text-foreground'>
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className='text-sm leading-relaxed my-2 text-foreground'>
                {children}
              </p>
            ),
          }}
        >
          {safeContent}
        </ReactMarkdown>
      </div>

      {/* 图片放大模态框 */}
      {state.expandedImage && (
        <div
          className='fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4'
          onClick={() => setState(prev => ({ ...prev, expandedImage: null }))}
        >
          <div className='relative max-w-4xl max-h-full'>
            <Button
              variant='ghost'
              size='icon'
              className='absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70'
              onClick={() =>
                setState(prev => ({ ...prev, expandedImage: null }))
              }
            >
              <X className='h-4 w-4' />
            </Button>
            <Image
              src={state.expandedImage}
              alt='放大图片'
              width={800}
              height={600}
              className='max-w-full max-h-full object-contain rounded-lg'
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}
