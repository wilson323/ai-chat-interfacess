/**
 * 统一聊天容器组件
 * 整合所有聊天相关功能，提供完整的聊天体验
 */

'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ThinkingProvider } from '../../context/thinking-context';
import { UnifiedMessageList } from './unified-message-list';
import { UnifiedInput } from './unified-input';
import { UnifiedFileUpload } from './unified-file-upload';
import { TypingIndicator, ProcessingFlow } from './unified-message-list';
import type {
  Message,
  ChatContainerProps,
  UploadedFile,
  ProcessingStep,
  ThinkingStatus,
  InteractionStatus,
} from '../../types/chat';

// 聊天容器状态
interface ChatContainerState {
  messages: Message[];
  uploadedFiles: UploadedFile[];
  processingSteps: ProcessingStep[];
  isTyping: boolean;
  isSending: boolean;
  thinkingStatus: ThinkingStatus;
  interactionStatus: InteractionStatus;
}

// 统一聊天容器属性
export interface UnifiedChatContainerProps
  extends Omit<ChatContainerProps, 'messages'> {
  initialMessages?: Message[];
  enableFileUpload?: boolean;
  enableVoice?: boolean;
  enableTTS?: boolean;
  enableVirtualization?: boolean;
  maxFileSize?: number;
  maxFiles?: number;
  className?: string;
}

export function UnifiedChatContainer({
  initialMessages = [],
  onSendMessage,
  enableFileUpload = true,
  enableVoice = true,
  enableTTS = true,
  enableVirtualization = false,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  className,
}: UnifiedChatContainerProps) {
  const [state, setState] = useState<ChatContainerState>({
    messages: initialMessages,
    uploadedFiles: [],
    processingSteps: [],
    isTyping: false,
    isSending: false,
    thinkingStatus: 'idle',
    interactionStatus: 'none',
  });

  const [inputValue, setInputValue] = useState('');
  const [showFileUpload] = useState(false);

  // 添加消息
  const addMessage = useCallback((message: Message) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }, [setState]);


  // 删除消息 (暂时未使用)
  // const deleteMessage = useCallback((id: string) => {
  //   setState(prev => ({
  //     ...prev,
  //     messages: prev.messages.filter(msg => msg.id !== id),
  //   }));
  //   onDeleteMessage?.(id);
  // }, [onDeleteMessage]);

  // 处理发送消息
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || state.isSending) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content: content.trim(),
        role: 'user',
        timestamp: new Date(),
      };

      // 添加用户消息
      addMessage(userMessage);
      setInputValue('');

      // 设置发送状态
      setState(prev => ({
        ...prev,
        isSending: true,
        isTyping: true,
        thinkingStatus: 'thinking',
      }));

      try {
        // 调用外部发送处理函数
        await onSendMessage?.(content.trim());
      } catch (error) {
        console.error('发送消息失败:', error);
      } finally {
        setState(prev => ({
          ...prev,
          isSending: false,
          isTyping: false,
          thinkingStatus: 'completed',
        }));
      }
    },
    [state.isSending, addMessage, onSendMessage, setState, setInputValue]
  );

  // 处理编辑消息 (暂时未使用)
  // const handleEditMessage = useCallback((id: string, content: string) => {
  //   updateMessage(id, { content });
  //   onEditMessage?.(id, content);
  // }, [updateMessage, onEditMessage]);

  // 处理重新生成消息 (暂时未使用)
  // const handleRegenerateMessage = useCallback((id: string) => {
  //   onRegenerateMessage?.(id);
  // }, [onRegenerateMessage]);

  // 处理复制消息 (暂时未使用)
  // const handleCopyMessage = useCallback((content: string) => {
  //   navigator.clipboard.writeText(content);
  //   onCopyMessage?.(content);
  // }, [onCopyMessage]);

  // 处理文件上传
  const handleFileUpload = useCallback((files: File[]) => {
    const uploadedFiles: UploadedFile[] = files.map(file => ({
      id: `file-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      status: 'complete',
      progress: 100,
    }));

    setState(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...uploadedFiles],
    }));
  }, [setState]);

  // 处理文件移除
  const handleFileRemove = useCallback((fileId: string) => {
    setState(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter(file => file.id !== fileId),
    }));
  }, [setState]);

  // 处理语音识别结果
  const handleVoiceTextRecognized = useCallback((text: string) => {
    setInputValue(prev => prev + (prev ? ' ' : '') + text);
  }, [setInputValue]);

  // 处理TTS请求
  const handleTTSRequest = useCallback((text: string) => {
    console.log('TTS请求:', text);
  }, []);

  // 处理交互选择
  const handleInteractiveSelect = useCallback((value: string, key: string) => {
    console.log('交互选择:', { value, key });
  }, []);

  // 更新思考状态 (暂时未使用)
  // const updateThinkingStatus = useCallback((status: ThinkingStatus) => {
  //   setState(prev => ({ ...prev, thinkingStatus: status }));
  // }, []);

  // 更新交互状态 (暂时未使用)
  // const updateInteractionStatus = useCallback((status: InteractionStatus) => {
  //   setState(prev => ({ ...prev, interactionStatus: status }));
  // }, []);

  // 更新处理步骤 (暂时未使用)
  // const updateProcessingSteps = useCallback((steps: ProcessingStep[]) => {
  //   setState(prev => ({ ...prev, processingSteps: steps }));
  // }, []);

  return (
    <ThinkingProvider
      initialThinkingStatus={state.thinkingStatus}
      initialInteractionStatus={state.interactionStatus}
      onInteractiveSelect={handleInteractiveSelect}
    >
      <div className={cn('flex flex-col h-full', className)}>
        {/* 消息列表区域 */}
        <div className='flex-1 overflow-hidden'>
          <UnifiedMessageList
            messages={state.messages}
            enableVirtualization={enableVirtualization}
            className='h-full'
            renderMessage={(message, _index) => (
              <div key={message.id} className='message-item'>
                {/* 这里可以添加自定义的消息渲染逻辑 */}
                <div>{message.content}</div>
              </div>
            )}
          />

          {/* 处理流程 */}
          {state.processingSteps.length > 0 && (
            <div className='p-4'>
              <ProcessingFlow steps={state.processingSteps} />
            </div>
          )}

          {/* 输入中状态 */}
          {state.isTyping && (
            <div className='p-4'>
              <TypingIndicator />
            </div>
          )}
        </div>

        {/* 文件上传区域 */}
        {showFileUpload && (
          <div className='p-4 border-t'>
            <UnifiedFileUpload
              onFileUpload={handleFileUpload}
              onFileRemove={handleFileRemove}
              uploadedFiles={state.uploadedFiles}
              config={{
                maxSize: maxFileSize,
                maxFiles: maxFiles,
                enableImagePreview: true,
                enableProgress: true,
                enableDragDrop: true,
              }}
            />
          </div>
        )}

        {/* 输入区域 */}
        <div className='p-4 border-t'>
          <UnifiedInput
            value={inputValue}
            onChange={setInputValue}
            onSend={() => handleSendMessage(inputValue)}
            onFileUpload={handleFileUpload}
            onVoiceTextRecognized={handleVoiceTextRecognized}
            onTTSRequest={handleTTSRequest}
            uploadedFiles={state.uploadedFiles}
            onRemoveFile={handleFileRemove}
            isSending={state.isSending}
            disabled={state.isSending}
            placeholder='输入消息...'
            enableVoice={enableVoice}
            enableTTS={enableTTS}
            enableFileUpload={enableFileUpload}
            enableImageUpload={true}
            autoResize={true}
          />
        </div>
      </div>
    </ThinkingProvider>
  );
}
