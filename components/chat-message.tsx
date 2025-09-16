'use client';
import type { Message, ProcessingStep } from '../types/message';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '../lib/utils';
import {
  User,
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  ImageIcon,
  FileText,
  Trash2,
  Pencil,
  Check,
  Volume2,
  } from 'lucide-react';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { useLanguage } from '../context/language-context';
import { MarkdownMessage } from './markdown-message';
import { LazyImage } from './lazy-image';
import { Textarea } from './ui/textarea';
// import { useResponsive } from '../hooks/use-responsive'; // unused
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
// import { InlineBubbleInteractive } from './inline-bubble-interactive'; // 暂时注释掉，未使用
import { EnhancedThinkingBubble } from './enhanced-thinking-bubble';

// 使用shadcn/ui的Textarea组件，通过CSS实现自动调整大小

interface ChatMessageProps {
  message: Message;
  onRegenerate?: () => void;
  onCopy?: () => void;
  onDelete?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onInteractiveSelect?: (value: string, key: string) => void;
  chatId?: string;
  isTyping?: boolean;
}

export function ChatMessage({
  message,
  onRegenerate,
  onCopy,
  onDelete,
  onEdit,
  onInteractiveSelect,
  chatId,
  isTyping,
}: ChatMessageProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [_showActions, _setShowActions] = useState(false); // 暂时注释掉，未使用
  // const messageRef = useRef<HTMLDivElement>(null); // unused
  const [feedback, setFeedback] = useState<null | 'like' | 'dislike'>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // 检查是否为管理员界面和用户界面
  const [isUserInterface, setIsUserInterface] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('adminLoggedIn') === 'true');
    // 检查当前是否在user界面
    setIsUserInterface(
      typeof window !== 'undefined' &&
        window.location.pathname.includes('/user')
    );
  }, []);

  // 类型安全判断
  const isUser = message.role === 'user';
  // 兼容后端自定义扩展角色
  const roleRaw = message.metadata?.roleRaw || message.role;
  const isUserCompat = isUser || roleRaw === 'human';
  // const isAICompat = isAI || roleRaw === 'bot' || roleRaw === 'ai'; // unused
  const isOffline = message.metadata?.offline === true;
  const timestamp = message.timestamp
    ? new Date(message.timestamp)
    : new Date();

  // 节点名称和状态的中文映射
  // 节点名称和状态的中文映射 - 暂时注释掉，未使用
  /*
  const nodeNameMap: Record<string, string> = {
    updateVariables: '更新变量',
    flowResponses: '流程响应',
    chatCompletion: '对话生成',
    userChatInput: '用户输入',
    thinking: '思考中',
    thinkingStart: '开始思考',
    thinkingEnd: '思考结束',
    moduleStatus: '模块状态',
    moduleStart: '模块开始',
    moduleEnd: '模块结束',
    flowNodeStatus: '流程节点',
    toolCall: '工具调用',
    toolParams: '工具参数',
    toolResponse: '工具响应',
    // 新增更多节点类型映射
    userSelect: '用户选择',
    textOutput: '文本输出',
    httpRequest: 'HTTP请求',
    dataProcess: '数据处理',
    conditionalBranch: '条件分支',
    knowledgeBase: '知识库检索',
    codeExecution: '代码执行',
    imageGeneration: '图像生成',
    speechSynthesis: '语音合成',
    textAnalysis: '文本分析',
  };

  // 状态的中文映射
  const statusMap: Record<string, string> = {
    running: '处理中',
    success: '成功',
    failed: '失败',
    error: '错误',
    pending: '等待中',
  };
  */

  // Handle hover effects for desktop - 已移除，因为_showActions功能暂时未使用

  const handleCopy = () => {
    if (typeof message.content === 'string') {
      try {
        // 创建一个临时文本区域元素
        const textArea = document.createElement('textarea');
        textArea.value = message.content;

        // 确保元素不可见
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);

        // 选择文本并复制
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        if (!successful) {
          console.error('复制失败');
          // 尝试使用clipboard API作为备选
          if (navigator && navigator.clipboard) {
            navigator.clipboard.writeText(message.content).catch(err => {
              console.error('Clipboard API复制失败:', err);
            });
          }
        }

        // 移除临时元素
        document.body.removeChild(textArea);

        // 更新UI状态
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        if (onCopy) onCopy();
      } catch (err) {
        console.error('复制过程中出错:', err);
        alert('复制失败，请手动选择文本并复制');
      }
    }
  };

  // const handleLike = () => { // 暂时注释掉，未使用
  //   if (disliked) setDisliked(false);
  //   setLiked(!liked);
  // };

  // const handleDislike = () => { // 暂时注释掉，未使用
  //   if (liked) setLiked(false);
  //   setDisliked(!disliked);
  // };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.id);
    }
  };

  const handleEdit = () => {
    if (typeof message.content === 'string') {
      setEditedContent(message.content);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (onEdit && editedContent.trim()) {
      onEdit(message.id, editedContent);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent('');
  };

  // 检查消息是否包含文件
  const hasFiles =
    Array.isArray(message.metadata?.files) && message.metadata.files.length > 0;

  const handleFeedback = useCallback(
    async (type: 'like' | 'dislike', e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (feedbackLoading) return;

      // 如果当前已是该反馈，再点则取消
      if (feedback === type) {
        setFeedback(null);
        setLiked(false);
        setDisliked(false);
        // 可选：发送取消反馈的API
        return;
      }

      setFeedbackLoading(true);
      setFeedback(type);
      setLiked(type === 'like');
      setDisliked(type === 'dislike');

      try {
        // 保存到本地反馈记录
        await fetch('/api/message-feedback', {
          method: 'POST',
          body: JSON.stringify({ messageId: message.id, type }),
        });
        // 如果有chatId，则调用外部反馈API
        console.log('检查是否可以调用外部反馈API:', {
          chatId,
          appId: message.metadata?.['appId'],
        });
        if (chatId && message.metadata?.['appId']) {
          const userGoodFeedback = type === 'like' ? 'yes' : undefined;
          const apiKey = message.metadata?.['apiKey'];
          const dataId = message.metadata?.['responseId'] || message.id;
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
          await fetch(
            'https://zktecoaihub.com/api/core/chat/feedback/updateUserFeedback',
            {
              method: 'POST',
              headers,
              body: JSON.stringify({
                appId: message.metadata?.['appId'],
                chatId: chatId,
                dataId: dataId,
                userGoodFeedback,
              }),
            }
          );
        } else {
          console.log(
            '跳过外部反馈API调用，原因:',
            !chatId ? '缺少chatId' : '缺少appId'
          );
        }
      } catch (error) {
        console.error('保存反馈失败:', error);
      }

      setTimeout(() => setFeedbackLoading(false), 1500);
    },
    [feedbackLoading, feedback, message.id, message.metadata, chatId, setFeedback, setLiked, setDisliked]
  );

  // TTS语音播放
  const handleTTS = useCallback(() => {
    try {
      if (
        typeof window === 'undefined' ||
        isUser ||
        typeof message.content !== 'string'
      )
        return;
      if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
        alert('当前浏览器不支持语音播放');
        return;
      }
      window.speechSynthesis.cancel(); // 防止多次叠加
      const utter = new window.SpeechSynthesisUtterance(message.content);
      utter.lang = /[\u4e00-\u9fa5]/.test(message.content) ? 'zh-CN' : 'en-US';
      window.speechSynthesis.speak(utter);
    } catch (err) {
      alert('语音播放失败，可能当前浏览器不支持或未授权音频');
      console.error('TTS播放失败:', err);
    }
  }, [isUser, message.content]);

  // 渲染thinking详细内容 - 暂时注释掉，未使用
  /*
  const renderThinkingDetails = () => {
    const thinkingSteps =
      message.metadata?.processingSteps?.filter(
        (step: unknown) => {
          const stepObj = step as { type?: string; content?: string };
          return stepObj.type?.includes('thinking') && stepObj.content;
        }
      ) || [];

    if (thinkingSteps.length === 0) return null;

    return (
      <div className='space-y-2'>
        {thinkingSteps.map((step: unknown) => {
          const stepObj = step as { id?: string; timestamp?: string; content?: string };
          return (
            <div
              key={stepObj.id}
              className='bg-amber-50/50 dark:bg-amber-900/10 rounded-lg p-2 border border-amber-200 dark:border-amber-800/30'
            >
              <div className='flex items-center gap-2 mb-1'>
                <Brain className='h-3.5 w-3.5 text-amber-500' />
                <span className='text-xs font-medium text-amber-700 dark:text-amber-300'>
                  思考过程
                </span>
                <Badge
                  variant='outline'
                  className='text-[10px] h-4 px-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/30'
                >
                  {stepObj.timestamp
                    ? new Date(stepObj.timestamp).toLocaleTimeString()
                    : ''}
                </Badge>
              </div>
              <div className='text-xs text-amber-900 dark:text-amber-200 whitespace-pre-wrap'>
                {stepObj.content}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  */

  // 头像渲染
  const userAvatar = (
    <div className='w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg ring-2 ring-primary/30'>
      <User className='h-5 w-5 text-white' />
    </div>
  );
  const aiAvatar = (
    <div className='w-9 h-9 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center shadow-lg ring-2 ring-blue-400/30'>
      <Image
        src='/mascot.png'
        alt='AI'
        width={28}
        height={28}
        className='w-7 h-7 rounded-full object-cover'
      />
    </div>
  );

  return (
    <div
      className={cn(
        'flex w-full group py-1 px-0 sm:px-2 items-start',
        isUserCompat ? 'justify-end' : 'justify-start'
      )}
    >
      {/* AI头像（仅AI消息显示在左上） */}
      {!isUserCompat && (
        <div className='mr-2 flex-shrink-0 flex items-start'>{aiAvatar}</div>
      )}
      {/* 气泡 */}
      <div
        className={cn(
          'max-w-[90%] sm:max-w-[70%] min-w-[64px] relative rounded-2xl px-4 py-2 my-1 transition-colors duration-200 flex flex-col justify-between',
          isUserCompat ? 'message-bubble-user' : 'message-bubble-ai'
        )}
        style={{ wordBreak: 'break-word', fontSize: '1rem', minHeight: '64px' }}
      >
        {/* 内容区 */}
        <div className='flex-1 flex flex-col'>
          {/* Message header with timestamp */}
          <div
            className={cn(
              'flex items-center mb-1 text-xs',
              isUserCompat
                ? 'text-white dark:text-white'
                : 'text-muted-foreground'
            )}
          >
            <span className='font-medium'>
              {isUserCompat
                ? t('you')
                : (message.metadata?.['botName'] as string) || t('assistant')}
            </span>
            <span className='mx-1.5'>•</span>
            <span>
              {formatDistanceToNow(timestamp, {
                addSuffix: true,
                locale: zhCN,
              })}
            </span>
          </div>
          {/* 显示上传的文件 */}
          {hasFiles && (
            <div className='mb-3 flex flex-wrap gap-2 p-4 pb-0'>
              {message.metadata?.files?.map((file: unknown) => {
                const fileObj = file as { id?: string; type?: string; url?: string; name?: string };
                return (
                  <div key={fileObj.id} className='flex flex-col'>
                    {fileObj.type?.startsWith('image/') && fileObj.url ? (
                      <div className='relative rounded-lg overflow-hidden border border-white/20 dark:border-zinc-700/70 shadow-md hover:shadow-lg transition-all duration-200'>
                        <LazyImage
                          src={fileObj.url}
                          alt={fileObj.name || 'file'}
                          className='max-w-[200px] max-h-[200px] object-contain'
                        />
                        <div className='absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate backdrop-blur-sm'>
                          {fileObj.name}
                        </div>
                      </div>
                    ) : (
                      <div className='flex items-center gap-2 bg-white/10 dark:bg-zinc-800/80 p-2 rounded-lg border border-white/20 dark:border-zinc-700/70 backdrop-blur-sm hover:bg-white/15 dark:hover:bg-zinc-800/90 transition-all duration-200'>
                        {fileObj.type?.includes('pdf') ? (
                          <FileText className='h-4 w-4' />
                        ) : (
                          <ImageIcon className='h-4 w-4' />
                        )}
                        <span className='text-xs truncate max-w-[150px]'>
                          {fileObj.name}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {/* 消息内容 */}
          <div
            className={
              cn('w-full', isUserCompat ? 'prose-invert' : '') + ' mt-2'
            }
          >
            {isEditing ? (
              <div>
                <Textarea
                  className='w-full min-h-[60px] text-sm bg-white/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary/30 shadow-none resize-none'
                  style={{ height: 'auto', minHeight: '60px' }}
                  value={editedContent}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setEditedContent(e.target.value);
                    // 自动调整高度
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  onBlur={handleCancelEdit}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === 'Enter' && !e.shiftKey) handleSaveEdit();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <div className='flex gap-2 mt-2 justify-end'>
                  <Button size='sm' onClick={handleSaveEdit} className='px-3'>
                    保存
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onMouseDown={handleCancelEdit}
                    className='px-3'
                  >
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* 文字内容渲染 - 只要不是节点状态消息就显示 */}
                {!message.metadata?.['isNodeStatus'] && message.content && (
                  <MarkdownMessage
                    content={
                      typeof message.content === 'string' ? message.content : ''
                    }
                  />
                )}

                {/* 交互节点现在统一在增强思考流程组件中处理，这里不再单独渲染 */}
              </>
            )}
          </div>
        </div>
        {/* 气泡底部：增强的思考流程气泡（包含交互节点） */}
        <div className='flex flex-col gap-2 mt-3 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-700'>
          {/* 使用增强的思考流程组件，统一处理思考流程和交互节点 */}
          {!isUserCompat &&
            (() => {
              // 🔥 修复：扩展过滤条件，包含所有处理步骤类型
              const allProcessingSteps =
                message.metadata?.processingSteps || [];
              const thinkingSteps = allProcessingSteps.filter(
                (step): step is ProcessingStep & { type: string; content?: string; name?: string } => {
                  // 包含思考相关的事件类型
                  const isThinkingType = step.type?.includes('thinking');
                  // 包含流程处理相关的事件类型
                  const isProcessingType = [
                    'flowNodeStatus',
                    'moduleStatus',
                    'moduleStart',
                    'moduleEnd',
                    'toolCall',
                    'toolParams',
                    'toolResponse',
                  ].includes(step.type || '');
                  // 必须有内容才显示
                  const hasContent = !!(step.content || step.name);

                  return (isThinkingType || isProcessingType) && hasContent;
                }
              );

              const hasThinkingSteps = thinkingSteps.length > 0;
              const hasInteractiveData = !!message.metadata?.interactiveData;

              console.log('🎨 ChatMessage 渲染增强思考流程组件:', {
                messageId: message.id,
                hasThinkingSteps,
                hasInteractiveData,
                thinkingStepsCount: thinkingSteps.length,
                allProcessingStepsCount: allProcessingSteps.length,
                thinkingStatus: message.metadata?.thinkingStatus,
                interactionStatus: message.metadata?.interactionStatus,
                processingStepsTypes: allProcessingSteps.map(s => s.type),
                filteredStepsTypes: thinkingSteps.map(s => s.type),
              });

              // 只有当有思考流程或交互数据时才显示
              if (hasThinkingSteps || hasInteractiveData) {
                return (
                  <EnhancedThinkingBubble
                    thinkingSteps={message.metadata?.processingSteps || []}
                    interactiveData={message.metadata?.interactiveData}
                    onInteractiveSelect={onInteractiveSelect}
                    thinkingStatus={
                      message.metadata?.thinkingStatus || 'in-progress'
                    }
                    interactionStatus={
                      message.metadata?.interactionStatus || 'none'
                    }
                  />
                );
              }
              return null;
            })()}

          {/* 实时处理状态和操作按钮行 */}
          <div className='flex flex-row flex-wrap justify-between items-end gap-2'>
            {/* 实时处理状态区域 */}
            {message.metadata?.['isNodeStatus'] ? (
              <div className='flex items-center gap-2 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 px-3 py-2 rounded-lg text-xs font-medium animate-pulse border border-blue-200 dark:border-blue-700'>
                <span role='img' aria-label='AI'></span>
                <span>{message.content}</span>
                <span className='ml-1 animate-spin'>⏳</span>
              </div>
            ) : (
              <div className='min-w-[40px]'></div>
            )}
            {/* 操作按钮区 */}
            <div
              className={cn(
                'flex gap-1 flex-shrink-0',
                isUserCompat
                  ? 'justify-end flex-row-reverse self-end'
                  : 'justify-start self-start'
              )}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className={cn(
                        'h-7 w-7 rounded-full bg-transparent hover:bg-accent/50 p-0 hover:text-primary',
                        isUserCompat
                          ? 'text-white dark:text-white'
                          : 'text-muted-foreground'
                      )}
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className='h-3.5 w-3.5' />
                      ) : (
                        <Copy className='h-3.5 w-3.5' />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side='top'>
                    <p>{copied ? t('copied') : t('copyText')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {isUserCompat && isAdmin && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className={cn(
                          'h-7 w-7 rounded-full bg-transparent hover:bg-accent/50 p-0 hover:text-primary',
                          isUserCompat
                            ? 'text-white dark:text-white'
                            : 'text-muted-foreground'
                        )}
                        onClick={handleEdit}
                      >
                        <Pencil className='h-3.5 w-3.5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top'>
                      <p>编辑消息</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {/* 删除按钮 - 仅在非user界面显示 */}
              {!isUserInterface && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className={cn(
                          'h-7 w-7 rounded-full bg-transparent hover:bg-accent/50 p-0 hover:text-destructive',
                          isUserCompat
                            ? 'text-white dark:text-white'
                            : 'text-muted-foreground'
                        )}
                        onClick={handleDelete}
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top'>
                      <p>删除消息</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {isUserCompat && onRegenerate && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className={cn(
                          'h-7 w-7 rounded-full bg-transparent hover:bg-accent/50 p-0 hover:text-primary',
                          isUserCompat
                            ? 'text-white dark:text-white'
                            : 'text-muted-foreground'
                        )}
                        onClick={onRegenerate}
                        disabled={isTyping}
                      >
                        <RotateCcw className='h-3.5 w-3.5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top'>
                      <p>{String(t('regenerate'))}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {!isUserCompat && (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className={cn(
                            'h-7 w-7 rounded-full bg-transparent hover:bg-accent/50 p-0',
                            liked
                              ? 'text-green-500'
                              : isUserCompat
                                ? 'text-white dark:text-white hover:text-green-500'
                                : 'text-muted-foreground hover:text-green-500'
                          )}
                          onClick={e => handleFeedback('like', e)}
                          disabled={feedbackLoading}
                        >
                          <ThumbsUp className='h-3.5 w-3.5' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side='top'>
                        <p>{String(t('helpful'))}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className={cn(
                            'h-7 w-7 rounded-full bg-transparent hover:bg-accent/50 p-0',
                            disliked
                              ? 'text-red-500'
                              : isUserCompat
                                ? 'text-white dark:text-white hover:text-red-500'
                                : 'text-muted-foreground hover:text-red-500'
                          )}
                          onClick={e => handleFeedback('dislike', e)}
                          disabled={feedbackLoading}
                        >
                          <ThumbsDown className='h-3.5 w-3.5' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side='top'>
                        <p>{String(t('notHelpful'))}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
              {!isUserCompat && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className={cn(
                          'h-7 w-7 rounded-full bg-transparent hover:bg-accent/50 p-0 hover:text-primary',
                          isUserCompat
                            ? 'text-white dark:text-white'
                            : 'text-muted-foreground'
                        )}
                        onClick={handleTTS}
                      >
                        <Volume2 className='h-3.5 w-3.5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top'>
                      <p>语音播放</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
        {/* 离线模式指示器 */}
        {isOffline && !isUserCompat && (
          <div className='mt-0 mb-2 mx-4 text-xs text-muted-foreground flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full w-fit'>
            <span className='inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse'></span>
            离线模式响应
          </div>
        )}
      </div>
      {/* 用户头像（仅用户消息显示在右上） */}
      {isUserCompat && (
        <div className='ml-2 flex-shrink-0 flex items-start'>{userAvatar}</div>
      )}
    </div>
  );
}
