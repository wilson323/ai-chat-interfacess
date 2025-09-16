/**
 * 多智能体聊天容器组件
 * 整合多智能体聊天服务，支持动态智能体选择和无缝切换
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ChatHistory } from '../chat-history';
import { HistoryManager } from '../history-manager';
import { useAgent } from '@/context/agent-context';
import { getGlobalChatService } from '@/lib/services/multi-agent-chat-service';
import { saveMessagesToStorage } from '@/lib/storage/index';
import type { Agent } from '@/types/agent';
import type { GlobalVariable } from '@/types';
import type { Message, ProcessingStep } from '@/types/message';
import { MessageType } from '@/types/message';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface MultiAgentChatContainerProps {
  className?: string;
}

export function MultiAgentChatContainer({
  className,
}: MultiAgentChatContainerProps) {
  // 获取智能体上下文
  const {
    selectedAgent,
    agents,
    selectAgent,
    closeSidebars,
    globalVariables,
    setGlobalVariables,
    abortCurrentRequest,
    setAbortController,
    isRequestActive,
    setShowGlobalVariablesForm,
  } = useAgent();

  // 聊天状态
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [showProcessingFlow, setShowProcessingFlow] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  // 聊天服务实例
  const chatServiceRef = useRef(getGlobalChatService());
  const abortControllerRef = useRef<AbortController | null>(null);
  // 防重复初始化：记录已初始化的智能体ID
  const initializedAgentIdRef = useRef<string | null>(null);
  // 使用 ref 保存易变依赖，保证 effect 依赖恒定
  const selectedAgentRef = useRef(selectedAgent);
  const messagesRef = useRef(messages);

  useEffect(() => {
    selectedAgentRef.current = selectedAgent;
  }, [selectedAgent]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // 当前活跃的智能体信息
  const [activeAgentInfo, setActiveAgentInfo] = useState<{
    agentId: string;
    agentName: string;
    agentType: string;
  } | null>(null);

  // 统一的初始化实现，避免依赖数组长度变化
  const runInitialize = async (agent: Agent) => {
    try {
      setIsTyping(true);
      const chatService = chatServiceRef.current;
      const initResponse = await chatService.initializeChat(agent);

      console.log('🚀 Chat session initialized:', initResponse);

      // 设置当前会话ID
      const newSessionId = initResponse.data?.chatId || initResponse.chatId;
      setCurrentSessionId(newSessionId);

      // 首次会话建立时注入欢迎消息
      if (
        (!currentSessionId || currentSessionId.length === 0) &&
        initResponse.data?.app?.chatConfig?.welcomeText
      ) {
        const welcomeMessage: Message = {
          id: `welcome-${Date.now()}`,
          type: MessageType.Text,
          role: 'assistant',
          content: initResponse.data.app.chatConfig.welcomeText,
          timestamp: new Date(),
          agentId: agent.id,
        };

        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
    } finally {
      setIsTyping(false);
    }
  };

  // 开始新对话
  const handleNewChat = useCallback(() => {
    setMessages([]);
    setCurrentSessionId('');
    setProcessingSteps([]);
    setShowProcessingFlow(false);
    setActiveAgentInfo(null);

    const agent = selectedAgentRef.current;
    if (agent) {
      runInitialize(agent);
    }
  }, [selectedAgent?.id, setMessages, setCurrentSessionId, setProcessingSteps, setShowProcessingFlow, setActiveAgentInfo]);

  // 监听智能体切换事件（依赖已在上方定义）
  useEffect(() => {
    const handleAgentSwitching = (event: CustomEvent) => {
      const { toAgent, startNewConversation } = event.detail;
      console.log('🔄 Agent switching detected:', toAgent?.name);

      if (startNewConversation) {
        handleNewChat();
      }
    };

    window.addEventListener(
      'agent-switching',
      handleAgentSwitching as EventListener
    );
    return () => {
      window.removeEventListener(
        'agent-switching',
        handleAgentSwitching as EventListener
      );
    };
  }, [handleNewChat]);

  // 监听发送消息事件
  useEffect(() => {
    const handleSendMessageEvent = (event: CustomEvent) => {
      const { message } = event.detail;
      setInput(message);
      // Note: The actual send will be triggered by the ChatInput component
    };

    window.addEventListener(
      'send-message',
      handleSendMessageEvent as EventListener
    );
    return () => {
      window.removeEventListener(
        'send-message',
        handleSendMessageEvent as EventListener
      );
    };
  }, [selectedAgent]);

  // 初始化聊天会话（固定依赖，仅依赖 agent id）
  useEffect(() => {
    const agent = selectedAgentRef.current;
    if (!agent) return;
    // 同一智能体仅初始化一次
    if (initializedAgentIdRef.current === agent.id) return;
    initializedAgentIdRef.current = agent.id;
    runInitialize(agent);
  }, [selectedAgent?.id]);

  // 保存聊天历史（前置使其可被依赖）
  const saveChatHistory = useCallback(async () => {
    if (!currentSessionId || messages.length === 0) return;

    try {
      saveMessagesToStorage(currentSessionId, messages);
      console.log('💾 Chat history saved');
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }, [currentSessionId, messages]);

  // 发送消息
  const handleSendMessage = useCallback(async () => {
    const messageText = input;
    if (!selectedAgent || !messageText.trim() || isSending) return;

    // 创建用户消息
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: MessageType.Text,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
      agentId: selectedAgent.id,
    };

    // 创建助手消息占位符
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      type: MessageType.Text,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      agentId: selectedAgent.id,
    };

    // 更新消息列表
    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsSending(true);
    setIsTyping(true);

    // 创建中断控制器
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setAbortController(abortController);

    try {
      const chatService = chatServiceRef.current;

      // 收集完整的消息历史
      const messageHistory = [...messages, userMessage];

      // 发送消息到多智能体聊天服务
      const {
        agentId: responseAgentId,
        agentName,
        agentType,
      } = await chatService.sendMessage(messageHistory, selectedAgent, {
        stream: true,
        variables: globalVariables as unknown as Record<string, unknown>,
        onStart: () => {
          console.log('🚀 Chat stream started');
        },
        onChunk: (chunk: string) => {
          // 更新助手消息内容
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessage.id
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        },
        onProcessingStep: (step: unknown) => {
          setProcessingSteps(prev => [...prev, step as ProcessingStep]);
          setShowProcessingFlow(true);
        },
        onIntermediateValue: (value, eventType) => {
          console.log('🔄 Intermediate value:', eventType, value);
        },
        onError: error => {
          console.error('Chat error:', error);
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessage.id
                ? {
                    ...msg,
                    content: msg.content + `\n\n❌ 错误: ${error.message}`,
                  }
                : msg
            )
          );
        },
        onFinish: () => {
          console.log('🎉 Chat stream finished');
          setIsTyping(false);
          setIsSending(false);
          setAbortController(null);
          abortControllerRef.current = null;

          // 更新活跃智能体信息
          setActiveAgentInfo({
            agentId: responseAgentId,
            agentName,
            agentType,
          });

          // 保存聊天记录
          saveChatHistory();
        },
        signal: abortController.signal,
      });

      console.log('🎯 Response from agent:', agentName, `(${agentType})`);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessage.id
            ? { ...msg, content: msg.content + '\n\n❌ 发送失败，请重试' }
            : msg
        )
      );
      setIsTyping(false);
      setIsSending(false);
      setAbortController(null);
      abortControllerRef.current = null;
    }
  }, [
    input,
    selectedAgent,
    messages,
    globalVariables,
    isSending,
    setAbortController,
    saveChatHistory,
    setMessages,
    setInput,
    setIsSending,
    setIsTyping,
    setProcessingSteps,
    setShowProcessingFlow,
    setActiveAgentInfo,
    abortControllerRef,
    chatServiceRef,
  ]);

  // 选择历史对话
  const handleSelectHistory = useCallback(
    async (historyMessages: Message[], chatId: string) => {
      setMessages(historyMessages);
      setCurrentSessionId(chatId);
      closeSidebars();
    },
    [closeSidebars]
  );

  // 处理文件上传
  const handleFileUpload = useCallback(async (files: File[]) => {
    // 实现文件上传逻辑
    console.log('File upload:', files);
  }, []);

  // 处理语音开始
  const handleVoiceStart = useCallback(() => {
    setIsRecording(true);
  }, []);

  // 处理语音结束
  const handleVoiceStop = useCallback(() => {
    setIsRecording(false);
  }, []);

  // 移除文件
  const handleRemoveFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  // 处理智能体变更
  const handleAgentChange = useCallback(
    (agent: Agent) => {
      selectAgent(agent);
    },
    [selectAgent]
  );

  // 处理全局变量变更
  const handleGlobalVariablesChange = useCallback(
    (variables: GlobalVariable[]) => {
      setGlobalVariables(variables);
    },
    [setGlobalVariables]
  );

  // 处理设置点击
  const handleSettingsClick = useCallback(() => {
    setShowGlobalVariablesForm(true);
  }, [setShowGlobalVariablesForm]);

  // 中断当前请求
  const handleAbortRequest = useCallback(() => {
    abortCurrentRequest();
  }, [abortCurrentRequest]);

  return (
    <div className={`flex h-full ${className}`}>
      {/* 主聊天区域 */}
      <div className='flex-1 flex flex-col'>
        <Card className='h-full flex flex-col'>
          {/* 聊天头部 */}
          <CardHeader className='pb-0'>
            <ChatHeader
              selectedAgent={selectedAgent}
              agents={agents}
              globalVariables={globalVariables}
              onAgentChange={handleAgentChange}
              onGlobalVariablesChange={handleGlobalVariablesChange}
              onSettingsClick={handleSettingsClick}
              activeAgentInfo={activeAgentInfo}
              onRequestAbort={handleAbortRequest}
              isRequestActive={isRequestActive}
            />
          </CardHeader>

          {/* 聊天消息区域 */}
          <CardContent className='flex-1 p-0'>
            <ChatMessages
              messages={messages}
              isTyping={isTyping}
              processingSteps={processingSteps}
              showProcessingFlow={showProcessingFlow}
              onEditMessage={message => {
                // 实现消息编辑
                console.log('Edit message:', message);
              }}
              onDeleteMessage={message => {
                // 实现消息删除
                console.log('Delete message:', message);
              }}
              onCopyMessage={message => {
                // 实现消息复制
                navigator.clipboard.writeText(message.content);
              }}
              onLikeMessage={message => {
                // 实现消息点赞
                console.log('Like message:', message);
              }}
              onDislikeMessage={message => {
                // 实现消息点踩
                console.log('Dislike message:', message);
              }}
            />
          </CardContent>

          {/* 聊天输入区域 */}
          <CardFooter className='pt-0'>
            <ChatInput
              value={input}
              onChange={setInput}
              onSend={handleSendMessage}
              onFileUpload={handleFileUpload}
              onVoiceStart={handleVoiceStart}
              onVoiceStop={handleVoiceStop}
              uploadedFiles={uploadedFiles}
              onRemoveFile={handleRemoveFile}
              isRecording={isRecording}
              isSending={isSending}
              disabled={!selectedAgent}
            />
          </CardFooter>
        </Card>
      </div>

      {/* 侧边栏 */}
      <div className='w-80 border-l bg-muted/30'>
        <Tabs defaultValue='history' className='h-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='history'>历史记录</TabsTrigger>
            <TabsTrigger value='manage'>管理</TabsTrigger>
          </TabsList>

          <TabsContent value='history' className='h-full m-0'>
            <ChatHistory
              onClose={() => {}}
              onSelect={handleSelectHistory}
              onNewChat={handleNewChat}
              onManageHistory={() => {}}
            />
          </TabsContent>

          <TabsContent value='manage' className='h-full m-0'>
            <HistoryManager
              open={true}
              onOpenChange={() => {}}
              onHistoryUpdated={() => {}}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
