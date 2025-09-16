import { useState, useCallback } from 'react';
import { useAgent } from '../context/agent-context';
import { useMessageStore } from '../lib/store/messageStore';
import type { Message } from '../types/message';
import { MessageType } from '../types/message';
import type { ConversationAgentType } from '../types/agent';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export function useChat() {
  const { selectedAgent } = useAgent();
  const {
    messages: storedMessages,
    saveMessages,
  } = useMessageStore();

  const [input, setInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // 获取当前聊天会话的消息
  const messages = selectedAgent ? storedMessages[selectedAgent.id] || [] : [];

  // 处理输入变化
  const onInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);

  // 发送消息
  const onSendMessage = useCallback(async () => {
    if (!input.trim() || !selectedAgent || isSending) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: MessageType.Text, // 添加缺失字段
      content: input,
      role: 'user',
      timestamp: new Date(),
      agentId: selectedAgent.id,
    };

    const updatedMessages = [...messages, newMessage];

    // 保存消息到存储
    saveMessages(selectedAgent.id as ConversationAgentType, updatedMessages);

    // 清空输入
    setInput('');
    setIsSending(true);
    setIsTyping(true);

    try {
      // 这里应该调用实际的聊天API
      // 暂时模拟一个简单的回复
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: MessageType.Text, // 添加缺失字段
          content: `收到您的消息: ${input}`,
          role: 'assistant',
          timestamp: new Date(),
          agentId: selectedAgent.id,
        };

        const finalMessages = [...updatedMessages, botMessage];
        saveMessages(selectedAgent.id as ConversationAgentType, finalMessages);
        setIsTyping(false);
        setIsSending(false);
      }, 1000);
    } catch (error) {
      console.error('发送消息失败:', error);
      setIsTyping(false);
      setIsSending(false);
    }
  }, [input, selectedAgent, isSending, messages, saveMessages]);

  // 文件上传
  const onFileUpload = useCallback((files: File[]) => {
    // 处理文件上传逻辑
    const newFiles = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  // 语音录制
  const onVoiceStart = useCallback(() => {
    setIsRecording(true);
  }, []);

  const onVoiceStop = useCallback(() => {
    setIsRecording(false);
  }, []);

  // 移除文件
  const onRemoveFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  // 消息操作
  const onEditMessage = useCallback(
    (message: Message) => {
      if (!selectedAgent) return;

      const updatedMessages = messages.map(msg =>
        msg.id === message.id ? message : msg
      );
      saveMessages(selectedAgent.id as ConversationAgentType, updatedMessages);
    },
    [messages, selectedAgent, saveMessages]
  );

  const onDeleteMessage = useCallback(
    (message: Message) => {
      if (!selectedAgent) return;

      const updatedMessages = messages.filter(msg => msg.id !== message.id);
      saveMessages(selectedAgent.id as ConversationAgentType, updatedMessages);
    },
    [messages, selectedAgent, saveMessages]
  );

  const onCopyMessage = useCallback((message: Message) => {
    navigator.clipboard.writeText(message.content);
  }, []);

  const onLikeMessage = useCallback((message: Message) => {
    // 处理点赞逻辑
    console.log('点赞消息:', message.id);
  }, []);

  const onDislikeMessage = useCallback((message: Message) => {
    // 处理点踩逻辑
    console.log('点踩消息:', message.id);
  }, []);

  // 历史记录操作
  const onSelectHistory = useCallback(
    (historyMessages: Message[]) => {
      if (selectedAgent) {
        saveMessages(
          selectedAgent.id as ConversationAgentType,
          historyMessages
        );
      }
    },
    [selectedAgent, saveMessages]
  );

  const onNewChat = useCallback(() => {
    if (selectedAgent) {
      saveMessages(selectedAgent.id as ConversationAgentType, []);
      setUploadedFiles([]);
      setInput('');
    }
  }, [selectedAgent, saveMessages]);

  const onManageHistory = useCallback(() => {
    // 打开历史记录管理
    console.log('管理历史记录');
  }, []);

  return {
    messages,
    input,
    onInputChange,
    onSendMessage,
    onFileUpload,
    onVoiceStart,
    onVoiceStop,
    uploadedFiles,
    onRemoveFile,
    isTyping,
    isRecording,
    isSending,
    onSelectHistory,
    onNewChat,
    onManageHistory,
    onEditMessage,
    onDeleteMessage,
    onCopyMessage,
    onLikeMessage,
    onDislikeMessage,
  };
}
