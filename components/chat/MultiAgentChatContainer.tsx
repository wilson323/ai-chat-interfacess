/**
 * 多智能体聊天容器组件
 * 整合多智能体聊天服务，支持动态智能体选择和无缝切换
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ChatHistory } from '../chat-history';
import { HistoryManager } from '../history-manager';
import { useAgent } from '@/context/agent-context';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useLanguage } from '@/context/language-context';
import { getGlobalChatService } from '@/lib/services/multi-agent-chat-service';
import type { Agent, GlobalVariable } from '@/types/agent';
import type { Message } from '@/types/message';
import type { ProcessingStep } from '@/types/message';

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

export function MultiAgentChatContainer({ className }: MultiAgentChatContainerProps) {
  // 获取智能体上下文
  const {
    selectedAgent,
    agents,
    selectAgent,
    sidebarOpen,
    historySidebarOpen,
    closeSidebars,
    toggleSidebar,
    globalVariables,
    setGlobalVariables,
    showGlobalVariablesForm,
    setShowGlobalVariablesForm,
    abortCurrentRequest,
    setAbortController,
    isRequestActive
  } = useAgent();

  // 获取语言上下文
  const { t } = useLanguage();

  // 获取聊天历史功能
  const { sessions, saveSessionMessages, getSessionMessages } = useChatHistory();

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

  // 当前活跃的智能体信息
  const [activeAgentInfo, setActiveAgentInfo] = useState<{
    agentId: string;
    agentName: string;
    agentType: string;
  } | null>(null);

  // 监听智能体切换事件
  useEffect(() => {
    const handleAgentSwitching = (event: CustomEvent) => {
      const { toAgent, startNewConversation } = event.detail;
      console.log('🔄 Agent switching detected:', toAgent?.name);

      if (startNewConversation) {
        // 开始新对话
        handleNewChat();
      }
    };

    window.addEventListener('agent-switching', handleAgentSwitching as EventListener);
    return () => {
      window.removeEventListener('agent-switching', handleAgentSwitching as EventListener);
    };
  }, []);

  // 监听发送消息事件
  useEffect(() => {
    const handleSendMessageEvent = (event: CustomEvent) => {
      const { message } = event.detail;
      setInput(message);
      // Note: The actual send will be triggered by the ChatInput component
    };

    window.addEventListener('send-message', handleSendMessageEvent as EventListener);
    return () => {
      window.removeEventListener('send-message', handleSendMessageEvent as EventListener);
    };
  }, [selectedAgent]);

  // 初始化聊天会话
  useEffect(() => {
    if (selectedAgent) {
      initializeChatSession();
    }
  }, [selectedAgent]);

  // 初始化聊天会话
  const initializeChatSession = useCallback(async () => {
    if (!selectedAgent) return;

    try {
      setIsTyping(true);
      const chatService = chatServiceRef.current;
      const initResponse = await chatService.initializeChat(selectedAgent);

      console.log('🚀 Chat session initialized:', initResponse);

      // 设置当前会话ID
      setCurrentSessionId(initResponse.data.chatId);

      // 如果是新的对话，添加欢迎消息
      if (messages.length === 0 && initResponse.data.app.chatConfig.welcomeText) {
        const welcomeMessage: Message = {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: initResponse.data.app.chatConfig.welcomeText,
          timestamp: new Date(),
          agentId: selectedAgent.id,
          agentName: selectedAgent.name,
          agentType: selectedAgent.type,
        };

        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
    } finally {
      setIsTyping(false);
    }
  }, [selectedAgent, messages.length]);

  // 发送消息
  const handleSendMessage = useCallback(async () => {
    const messageText = input;
    if (!selectedAgent || !messageText.trim() || isSending) return;

    // 创建用户消息
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
      agentType: selectedAgent.type,
    };

    // 创建助手消息占位符
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
      agentType: selectedAgent.type,
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
      const { agentId: responseAgentId, response, agentName, agentType } = await chatService.sendMessage(
        messageHistory,
        selectedAgent,
        {
          stream: true,
          variables: globalVariables,
          onStart: () => {
            console.log('🚀 Chat stream started');
          },
          onChunk: (chunk: string) => {
            // 更新助手消息内容
            setMessages(prev => prev.map(msg =>
              msg.id === assistantMessage.id
                ? { ...msg, content: msg.content + chunk }
                : msg
            ));
          },
          onProcessingStep: (step) => {
            setProcessingSteps(prev => [...prev, step]);
            setShowProcessingFlow(true);
          },
          onIntermediateValue: (value, eventType) => {
            console.log('🔄 Intermediate value:', eventType, value);
          },
          onError: (error) => {
            console.error('Chat error:', error);
            setMessages(prev => prev.map(msg =>
              msg.id === assistantMessage.id
                ? { ...msg, content: msg.content + `\n\n❌ 错误: ${error.message}` }
                : msg
            ));
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
              agentType
            });

            // 保存聊天记录
            saveChatHistory();
          },
          signal: abortController.signal
        }
      );

      console.log('🎯 Response from agent:', agentName, `(${agentType})`);

    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessage.id
          ? { ...msg, content: msg.content + '\n\n❌ 发送失败，请重试' }
          : msg
      ));
      setIsTyping(false);
      setIsSending(false);
      setAbortController(null);
      abortControllerRef.current = null;
    }
  }, [selectedAgent, messages, globalVariables, isSending, setAbortController]);

  // 保存聊天历史
  const saveChatHistory = useCallback(async () => {
    if (!currentSessionId || messages.length === 0) return;

    try {
      await saveSessionMessages(currentSessionId, messages);
      console.log('💾 Chat history saved');
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }, [currentSessionId, messages, saveSessionMessages]);

  // 开始新对话
  const handleNewChat = useCallback(() => {
    setMessages([]);
    setCurrentSessionId('');
    setProcessingSteps([]);
    setShowProcessingFlow(false);
    setActiveAgentInfo(null);

    if (selectedAgent) {
      initializeChatSession();
    }
  }, [selectedAgent, initializeChatSession]);

  // 选择历史对话
  const handleSelectHistory = useCallback(async (historyMessages: Message[], chatId: string) => {
    setMessages(historyMessages);
    setCurrentSessionId(chatId);
    closeSidebars();
  }, [closeSidebars]);

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
  const handleAgentChange = useCallback((agent: Agent) => {
    selectAgent(agent);
  }, [selectAgent]);

  // 处理全局变量变更
  const handleGlobalVariablesChange = useCallback((variables: GlobalVariable[]) => {
    const variablesMap = variables.reduce((acc, variable) => {
      acc[variable.key] = variable.value;
      return acc;
    }, {} as Record<string, any>);

    setGlobalVariables(variablesMap);
  }, [setGlobalVariables]);

  // 处理设置点击
  const handleSettingsClick = useCallback(() => {
    setShowGlobalVariablesForm(true);
  }, []);

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
              onEditMessage={(message) => {
                // 实现消息编辑
                console.log('Edit message:', message);
              }}
              onDeleteMessage={(message) => {
                // 实现消息删除
                console.log('Delete message:', message);
              }}
              onCopyMessage={(message) => {
                // 实现消息复制
                navigator.clipboard.writeText(message.content);
              }}
              onLikeMessage={(message) => {
                // 实现消息点赞
                console.log('Like message:', message);
              }}
              onDislikeMessage={(message) => {
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