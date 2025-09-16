/**
 * 聊天容器组件 - 重构版本
 * 分离关注点，提高可维护性和性能
 */

'use client';

import React, { useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatHeader } from './ChatHeader';
import { ChatMessagesList } from './optimized/ChatMessagesList';
import { ChatInput } from './ChatInput';
import { ChatHistory } from '../chat-history';
import { useAgent } from '@/context/agent-context';
import { useChatState } from './hooks/useChatState';
import { getGlobalChatService } from '@/lib/services/chat-service';
import { saveMessagesToStorage } from '@/lib/storage/index';
import { logger } from '@/lib/utils/logger';
import { errorHandler } from '@/lib/utils/error-handler';
import type { Message, ProcessingStep } from '@/types/message';
import { MessageType } from '@/types/message';

interface ChatContainerProps {
  className?: string;
}

export function ChatContainer({ className }: ChatContainerProps) {
  // 获取智能体上下文
  const {
    selectedAgent,
    agents,
    selectAgent,
    closeSidebars,
    globalVariables,
    abortCurrentRequest,
    setAbortController,
    isRequestActive,
    setShowGlobalVariablesForm,
  } = useAgent();

  // 使用统一的聊天状态管理
  const chatState = useChatState();

  // 聊天服务实例
  const chatServiceRef = useRef(getGlobalChatService());
  const abortControllerRef = useRef<AbortController | null>(null);
  // 防重复初始化：记录已初始化的智能体ID
  const initializedAgentIdRef = useRef<string | null>(null);
  // 使用 ref 持有易变引用，保证主初始化 effect 依赖长度恒定
  const selectedAgentRef = useRef(selectedAgent);
  const chatStateRef = useRef(chatState);

  useEffect(() => {
    selectedAgentRef.current = selectedAgent;
  }, [selectedAgent]);

  useEffect(() => {
    chatStateRef.current = chatState;
  }, [chatState]);

  // 初始化逻辑改为在 effect 中内联，确保依赖长度恒定

  // 智能体切换处理
  useEffect(() => {
    const agent = selectedAgentRef.current;
    const state = chatStateRef.current;
    if (!agent || !state) return;

    // 同一智能体仅初始化一次，避免严格模式或依赖变化导致的重复触发
    if (initializedAgentIdRef.current === agent.id) return;
    initializedAgentIdRef.current = agent.id;

    logger.chatInfo('Agent switching detected', { agentName: agent.name });

    (async () => {
      try {
        state.setIsTyping(true);
        const chatService = chatServiceRef.current;
        const initResponse = await chatService.initializeChat(agent);

        logger.chatInfo('Chat session initialized', initResponse);

        // 设置当前会话ID
        state.setCurrentSessionId(initResponse.data?.chatId || initResponse.chatId);

        // 如果当前无会话且有欢迎语，则注入一条欢迎消息（只在首次会话建立时）
        if (
          (!state.currentSessionId || state.currentSessionId.length === 0) &&
          initResponse.data?.app?.chatConfig?.welcomeText
        ) {
          const welcomeMessage: Message = {
            id: `welcome-${Date.now()}`,
            type: MessageType.Assistant,
            role: 'assistant',
            content: initResponse.data.app.chatConfig.welcomeText,
            timestamp: new Date(),
            agentId: agent.id,
            agentName: agent.name,
          };
          state.addMessage(welcomeMessage);
        }

        state.setIsTyping(false);
      } catch (error) {
        const errorInfo = errorHandler.handleChatError(error, 'initializeChatSession');
        logger.chatError('Failed to initialize chat session', errorInfo);
        state.setIsTyping(false);
      }
    })();
  }, [selectedAgent?.id]);

  // 保存聊天历史
  const saveChatHistory = useCallback(async () => {
    if (!chatState.currentSessionId || chatState.messages.length === 0) return;

    try {
      await saveMessagesToStorage(chatState.currentSessionId, chatState.messages);
      logger.chatInfo('Chat history saved');
    } catch (error) {
      const errorInfo = errorHandler.handleChatError(error, 'saveChatHistory');
      logger.chatError('Failed to save chat history', errorInfo);
    }
  }, [chatState.currentSessionId, chatState.messages]);

  // 发送消息
  const handleSendMessage = useCallback(async () => {
    const messageText = chatState.input.trim();
    if (!messageText || !selectedAgent || chatState.isSending) return;

    // 创建用户消息
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: MessageType.User,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
    };

    // 创建助手消息占位符
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      type: MessageType.Assistant,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
    };

    // 更新状态
    chatState.addMessage(userMessage);
    chatState.addMessage(assistantMessage);
    chatState.setInput('');
    chatState.setIsTyping(true);
    chatState.setIsSending(true);

    // 创建中止控制器
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setAbortController(abortController);

    try {
      const chatService = chatServiceRef.current;
      const messageHistory = [...chatState.messages, userMessage];

      // 发送消息到多智能体聊天服务
      const {
        agentId: responseAgentId,
        agentName,
        agentType,
      } = await chatService.sendMessage(messageHistory, selectedAgent, {
        stream: true,
        variables: globalVariables as unknown as Record<string, unknown>,
        onStart: () => {
          logger.chatInfo('Chat stream started');
        },
        onChunk: (chunk: string) => {
          chatState.setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessage.id
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        },
        onProcessingStep: (step: unknown) => {
          chatState.setProcessingSteps(prev => [...prev, step as ProcessingStep]);
          chatState.setShowProcessingFlow(true);
        },
        onIntermediateValue: (value, eventType) => {
          logger.chatDebug('Intermediate value', { eventType, value });
        },
        onError: error => {
          const errorInfo = errorHandler.handleChatError(error, 'sendMessage');
          chatState.setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessage.id
                ? { ...msg, content: msg.content + `\n\n❌ 错误: ${errorInfo.message}` }
                : msg
            )
          );
        },
        onFinish: () => {
          logger.chatInfo('Chat stream finished');
          chatState.setIsTyping(false);
          chatState.setIsSending(false);
          setAbortController(null);
          abortControllerRef.current = null;

          // 更新活跃智能体信息
          chatState.setActiveAgentInfo({
            agentId: responseAgentId,
            agentName,
            agentType,
          });

          // 保存聊天记录
          saveChatHistory();
        },
        signal: abortController.signal,
      });

      logger.chatInfo('Response from agent', { agentName, agentType });
    } catch (error) {
      const errorInfo = errorHandler.handleChatError(error, 'sendMessage');
      logger.chatError('Failed to send message', errorInfo);
      chatState.setIsTyping(false);
      chatState.setIsSending(false);
      setAbortController(null);
      abortControllerRef.current = null;
    }
  }, [chatState, selectedAgent, globalVariables, setAbortController, saveChatHistory]);

  // 处理文件上传
  const handleFileUpload = useCallback((files: File[]) => {
    logger.chatInfo('File upload', { fileCount: files.length });
    // 实现文件上传逻辑
  }, []);

  // 处理消息操作
  const handleMessageAction = useCallback((action: string, message: Message) => {
    switch (action) {
      case 'edit':
        logger.chatInfo('Edit message', { messageId: message.id });
        break;
      case 'delete':
        logger.chatInfo('Delete message', { messageId: message.id });
        break;
      default:
        logger.chatWarn('Unknown message action', { action, messageId: message.id });
    }
  }, []);

  return (
    <div className={`h-full flex flex-col ${className || ''}`}>
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-shrink-0">
          <ChatHeader
            selectedAgent={selectedAgent}
            agents={agents}
            onAgentSelect={selectAgent}
            onSettingsClick={() => setShowGlobalVariablesForm(true)}
            onCloseSidebars={closeSidebars}
            isRequestActive={isRequestActive}
            onAbortRequest={abortCurrentRequest}
          />
        </CardHeader>

        <CardContent className="flex-1 flex flex-col min-h-0">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">聊天</TabsTrigger>
              <TabsTrigger value="history">历史</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col min-h-0">
              <ChatMessagesList
                messages={chatState.messages}
                onMessageAction={handleMessageAction}
                className="flex-1 min-h-0"
              />
            </TabsContent>

            <TabsContent value="history" className="flex-1 flex flex-col min-h-0">
              <ChatHistory className="flex-1 min-h-0" />
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex-shrink-0">
          <ChatInput
            value={chatState.input}
            onChange={chatState.setInput}
            onSend={handleSendMessage}
            onFileUpload={handleFileUpload}
            isSending={chatState.isSending}
            isTyping={chatState.isTyping}
            uploadedFiles={chatState.uploadedFiles}
            onRemoveFile={(fileId) => {
              chatState.setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
            }}
            isRecording={chatState.isRecording}
            disabled={chatState.isSending}
          />
        </CardFooter>
      </Card>
    </div>
  );
}
