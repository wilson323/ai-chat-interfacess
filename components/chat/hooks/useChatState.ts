/**
 * 聊天状态管理Hook
 * 集中管理所有聊天相关的状态和逻辑
 */

'use client';

import { useState, useCallback } from 'react';
import type { Message, ProcessingStep } from '@/types/message';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface ChatState {
  messages: Message[];
  input: string;
  isTyping: boolean;
  isSending: boolean;
  processingSteps: ProcessingStep[];
  showProcessingFlow: boolean;
  currentSessionId: string;
  uploadedFiles: UploadedFile[];
  isRecording: boolean;
  activeAgentInfo: {
    agentId: string;
    agentName: string;
    agentType: string;
  } | null;
}

export interface ChatActions {
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setInput: (input: string) => void;
  setIsTyping: (isTyping: boolean) => void;
  setIsSending: (isSending: boolean) => void;
  setProcessingSteps: (steps: ProcessingStep[] | ((prev: ProcessingStep[]) => ProcessingStep[])) => void;
  setShowProcessingFlow: (show: boolean) => void;
  setCurrentSessionId: (sessionId: string) => void;
  setUploadedFiles: (files: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[])) => void;
  setIsRecording: (isRecording: boolean) => void;
  setActiveAgentInfo: (info: ChatState['activeAgentInfo']) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
  resetState: () => void;
}

const initialState: ChatState = {
  messages: [],
  input: '',
  isTyping: false,
  isSending: false,
  processingSteps: [],
  showProcessingFlow: false,
  currentSessionId: '',
  uploadedFiles: [],
  isRecording: false,
  activeAgentInfo: null,
};

export function useChatState(): ChatState & ChatActions {
  const [state, setState] = useState<ChatState>(initialState);

  const setMessages = useCallback((messages: Message[] | ((prev: Message[]) => Message[])) => {
    setState(prev => ({
      ...prev,
      messages: typeof messages === 'function' ? messages(prev.messages) : messages,
    }));
  }, []);

  const setInput = useCallback((input: string) => {
    setState(prev => ({ ...prev, input }));
  }, []);

  const setIsTyping = useCallback((isTyping: boolean) => {
    setState(prev => ({ ...prev, isTyping }));
  }, []);

  const setIsSending = useCallback((isSending: boolean) => {
    setState(prev => ({ ...prev, isSending }));
  }, []);

  const setProcessingSteps = useCallback((steps: ProcessingStep[] | ((prev: ProcessingStep[]) => ProcessingStep[])) => {
    setState(prev => ({
      ...prev,
      processingSteps: typeof steps === 'function' ? steps(prev.processingSteps) : steps,
    }));
  }, []);

  const setShowProcessingFlow = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showProcessingFlow: show }));
  }, []);

  const setCurrentSessionId = useCallback((sessionId: string) => {
    setState(prev => ({ ...prev, currentSessionId: sessionId }));
  }, []);

  const setUploadedFiles = useCallback((files: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[])) => {
    setState(prev => ({
      ...prev,
      uploadedFiles: typeof files === 'function' ? files(prev.uploadedFiles) : files,
    }));
  }, []);

  const setIsRecording = useCallback((isRecording: boolean) => {
    setState(prev => ({ ...prev, isRecording }));
  }, []);

  const setActiveAgentInfo = useCallback((info: ChatState['activeAgentInfo']) => {
    setState(prev => ({ ...prev, activeAgentInfo: info }));
  }, []);

  const addMessage = useCallback((message: Message) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      ),
    }));
  }, []);

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [] }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    setMessages,
    setInput,
    setIsTyping,
    setIsSending,
    setProcessingSteps,
    setShowProcessingFlow,
    setCurrentSessionId,
    setUploadedFiles,
    setIsRecording,
    setActiveAgentInfo,
    addMessage,
    updateMessage,
    clearMessages,
    resetState,
  };
}
